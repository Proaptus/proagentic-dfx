/**
 * Canvas Renderer Module for Smooth Contour Gradient Visualization
 *
 * This module renders filled contour bands to HTML5 Canvas for smooth gradients.
 * Used for stress, thermal, and other FEA result visualization with continuous
 * color gradients across the tank geometry.
 *
 * @module canvas-renderer
 */

import { interpolateColorHex, type ColormapType } from '@/lib/charts/colormap';

// ============================================================================
// TYPES
// ============================================================================

/**
 * 2D point in world coordinates (r, z) or canvas coordinates (x, y)
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Polygon ring - closed path of points
 * First point is implicitly connected to last point
 */
export type PolygonRing = Point2D[];

/**
 * Multipolygon - array of polygon rings
 * First ring is exterior, subsequent rings are holes (if any)
 */
export type Multipolygon = PolygonRing[];

/**
 * Contour band - filled region between two contour levels
 */
export interface ContourBand {
  value: number;           // Representative value for this band (usually midpoint)
  min_value: number;       // Lower bound of the band
  max_value: number;       // Upper bound of the band
  multipolygons: Multipolygon[];  // Multiple disjoint regions at this level
}

/**
 * Tank profile in world coordinates (r, z)
 * Defines the inner and outer boundaries of the tank wall
 */
export interface TankProfile {
  r: number;  // radial coordinate (mm)
  z: number;  // axial coordinate (mm)
}

/**
 * Bounding box in world coordinates
 */
export interface Bounds {
  r_min: number;
  r_max: number;
  z_min: number;
  z_max: number;
}

/**
 * Coordinate transformation between world space (r, z) and canvas space (x, y)
 */
export interface CoordinateTransform {
  /**
   * Transform world coordinates (r, z) to canvas coordinates (x, y)
   * @param r - Radial coordinate in world space (mm)
   * @param z - Axial coordinate in world space (mm)
   * @returns Canvas coordinates (x, y) in pixels
   */
  toCanvas(r: number, z: number): Point2D;

  /**
   * Transform canvas coordinates (x, y) to world coordinates (r, z)
   * @param x - Canvas x coordinate (pixels)
   * @param y - Canvas y coordinate (pixels)
   * @returns World coordinates (r, z) in mm
   */
  toWorld(x: number, y: number): Point2D;
}

// ============================================================================
// COORDINATE TRANSFORMATION
// ============================================================================

/**
 * Create a coordinate transformation between world space and canvas space
 *
 * World space: (r, z) coordinates in mm, origin at tank centerline/base
 * Canvas space: (x, y) coordinates in pixels, origin at top-left
 *
 * The transformation applies uniform scaling to preserve aspect ratio,
 * with optional padding around the viewport edges.
 *
 * @param bounds - World space bounding box to fit into canvas
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @param padding - Padding in pixels around all edges (default: 40)
 * @returns CoordinateTransform with toCanvas and toWorld methods
 *
 * @example
 * ```typescript
 * const bounds = { r_min: 0, r_max: 500, z_min: 0, z_max: 1500 };
 * const transform = createCoordinateTransform(bounds, 800, 600, 40);
 * const canvasPoint = transform.toCanvas(250, 750); // center of tank
 * ```
 */
export function createCoordinateTransform(
  bounds: Bounds,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 40
): CoordinateTransform {
  // Calculate world space dimensions
  const worldWidth = bounds.r_max - bounds.r_min;
  const worldHeight = bounds.z_max - bounds.z_min;

  // Calculate available canvas space after padding
  const availableWidth = canvasWidth - 2 * padding;
  const availableHeight = canvasHeight - 2 * padding;

  // Use uniform scale to preserve aspect ratio
  const scaleR = availableWidth / worldWidth;
  const scaleZ = availableHeight / worldHeight;
  const scale = Math.min(scaleR, scaleZ); // Use smaller scale to fit both dimensions

  // Calculate offset to center the content
  const scaledWorldWidth = worldWidth * scale;
  const scaledWorldHeight = worldHeight * scale;
  const offsetX = padding + (availableWidth - scaledWorldWidth) / 2;
  const offsetY = padding + (availableHeight - scaledWorldHeight) / 2;

  return {
    toCanvas(r: number, z: number): Point2D {
      // Transform: world (r, z) → canvas (x, y)
      // r increases to the right → x increases to the right
      // z increases upward → y increases downward (canvas convention)
      const x = offsetX + (r - bounds.r_min) * scale;
      const y = canvasHeight - (offsetY + (z - bounds.z_min) * scale); // Flip y-axis
      return { x, y };
    },

    toWorld(x: number, y: number): Point2D {
      // Inverse transform: canvas (x, y) → world (r, z)
      const r = bounds.r_min + (x - offsetX) / scale;
      const z = bounds.z_min + (canvasHeight - y - offsetY) / scale; // Flip y-axis
      return { x: r, y: z };
    }
  };
}

// ============================================================================
// CANVAS RENDERING FUNCTIONS
// ============================================================================

/**
 * Clear the canvas with transparent background
 *
 * @param ctx - Canvas 2D rendering context
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}

/**
 * Render contour bands with smooth color gradients
 *
 * Loops through contour bands from low to high value, drawing each multipolygon
 * with the appropriate color from the colormap. Uses evenodd fill rule to
 * correctly handle polygon holes.
 *
 * @param ctx - Canvas 2D rendering context
 * @param bands - Array of contour bands to render (sorted low to high)
 * @param transform - Coordinate transformation from world to canvas space
 * @param colormap - Colormap to use for color interpolation
 * @param valueRange - [min, max] value range for colormap normalization
 *
 * @example
 * ```typescript
 * const bands = generateContourBands(stressData, 10);
 * const transform = createCoordinateTransform(bounds, 800, 600);
 * renderContourBands(ctx, bands, transform, 'jet', [0, 1000]);
 * ```
 */
export function renderContourBands(
  ctx: CanvasRenderingContext2D,
  bands: ContourBand[],
  transform: CoordinateTransform,
  colormap: ColormapType,
  valueRange: [number, number]
): void {
  const [minValue, maxValue] = valueRange;

  // Render bands from low to high value
  for (const band of bands) {
    // Get color for this band value
    const color = interpolateColorHex(band.value, minValue, maxValue, colormap);
    ctx.fillStyle = color;

    // Draw all multipolygons for this band
    for (const multipolygon of band.multipolygons) {
      ctx.beginPath();

      // Draw each ring in the multipolygon
      for (const ring of multipolygon) {
        if (ring.length === 0) continue;

        // Transform first point and move to it
        const firstPoint = transform.toCanvas(ring[0].x, ring[0].y);
        ctx.moveTo(firstPoint.x, firstPoint.y);

        // Draw lines to remaining points
        for (let i = 1; i < ring.length; i++) {
          const point = transform.toCanvas(ring[i].x, ring[i].y);
          ctx.lineTo(point.x, point.y);
        }

        // Close the path
        ctx.closePath();
      }

      // Fill using evenodd rule (handles holes correctly)
      // First ring = exterior, subsequent rings = holes
      ctx.fill('evenodd');
    }
  }
}

/**
 * Render the tank wall boundary as a clipping mask
 *
 * Draws the profile between inner and outer walls and uses it to clip
 * the contour rendering. This ensures contours only appear within the
 * actual tank wall region.
 *
 * @param ctx - Canvas 2D rendering context
 * @param innerProfile - Inner wall profile points (r, z)
 * @param outerProfile - Outer wall profile points (r, z)
 * @param transform - Coordinate transformation from world to canvas space
 *
 * @example
 * ```typescript
 * // First render contours
 * renderContourBands(ctx, bands, transform, 'jet', [0, 1000]);
 * // Then clip to tank boundary
 * renderMeshBoundary(ctx, innerProfile, outerProfile, transform);
 * ```
 */
export function renderMeshBoundary(
  ctx: CanvasRenderingContext2D,
  innerProfile: TankProfile[],
  outerProfile: TankProfile[],
  transform: CoordinateTransform
): void {
  if (innerProfile.length === 0 || outerProfile.length === 0) return;

  // Save current composite operation
  const previousOperation = ctx.globalCompositeOperation;

  // Create a clipping path from the tank wall region
  ctx.beginPath();

  // Draw outer profile
  const firstOuter = transform.toCanvas(outerProfile[0].r, outerProfile[0].z);
  ctx.moveTo(firstOuter.x, firstOuter.y);
  for (let i = 1; i < outerProfile.length; i++) {
    const point = transform.toCanvas(outerProfile[i].r, outerProfile[i].z);
    ctx.lineTo(point.x, point.y);
  }

  // Draw inner profile in reverse (to create a ring/hole)
  for (let i = innerProfile.length - 1; i >= 0; i--) {
    const point = transform.toCanvas(innerProfile[i].r, innerProfile[i].z);
    ctx.lineTo(point.x, point.y);
  }

  ctx.closePath();

  // Use destination-in to keep only pixels inside the boundary
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = '#000'; // Color doesn't matter with destination-in
  ctx.fill('evenodd');

  // Restore previous composite operation
  ctx.globalCompositeOperation = previousOperation;
}

/**
 * Render the tank interior cavity with a subtle background color
 *
 * Fills the region inside the inner profile with a background color
 * to distinguish it from the wall region. Typically called before
 * rendering contours.
 *
 * @param ctx - Canvas 2D rendering context
 * @param innerProfile - Inner wall profile points (r, z)
 * @param transform - Coordinate transformation from world to canvas space
 * @param fillColor - Fill color (CSS color string, default: light gray)
 *
 * @example
 * ```typescript
 * // Render interior first
 * renderTankInterior(ctx, innerProfile, transform, 'rgba(240, 240, 240, 0.5)');
 * // Then render contours on top
 * renderContourBands(ctx, bands, transform, 'jet', [0, 1000]);
 * ```
 */
export function renderTankInterior(
  ctx: CanvasRenderingContext2D,
  innerProfile: TankProfile[],
  transform: CoordinateTransform,
  fillColor: string = 'rgba(240, 240, 240, 0.5)'
): void {
  if (innerProfile.length === 0) return;

  ctx.beginPath();

  // Draw inner profile
  const firstPoint = transform.toCanvas(innerProfile[0].r, innerProfile[0].z);
  ctx.moveTo(firstPoint.x, firstPoint.y);

  for (let i = 1; i < innerProfile.length; i++) {
    const point = transform.toCanvas(innerProfile[i].r, innerProfile[i].z);
    ctx.lineTo(point.x, point.y);
  }

  // Close path to centerline
  // Connect last point to (r=0, z=z_last)
  const lastPoint = innerProfile[innerProfile.length - 1];
  const lastCenterline = transform.toCanvas(0, lastPoint.z);
  ctx.lineTo(lastCenterline.x, lastCenterline.y);

  // Connect to (r=0, z=z_first)
  const firstCenterline = transform.toCanvas(0, innerProfile[0].z);
  ctx.lineTo(firstCenterline.x, firstCenterline.y);

  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
}

/**
 * Draw a simple outline of the tank boundary
 *
 * Draws the inner and outer profiles as stroked paths.
 * Useful for debugging or adding boundary lines on top of contours.
 *
 * @param ctx - Canvas 2D rendering context
 * @param innerProfile - Inner wall profile points (r, z)
 * @param outerProfile - Outer wall profile points (r, z)
 * @param transform - Coordinate transformation from world to canvas space
 * @param strokeColor - Stroke color (CSS color string, default: black)
 * @param lineWidth - Line width in pixels (default: 1)
 *
 * @example
 * ```typescript
 * // After rendering contours, add boundary outlines
 * drawBoundaryOutline(ctx, innerProfile, outerProfile, transform, '#000', 2);
 * ```
 */
export function drawBoundaryOutline(
  ctx: CanvasRenderingContext2D,
  innerProfile: TankProfile[],
  outerProfile: TankProfile[],
  transform: CoordinateTransform,
  strokeColor: string = '#000',
  lineWidth: number = 1
): void {
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;

  // Draw outer profile
  if (outerProfile.length > 0) {
    ctx.beginPath();
    const firstOuter = transform.toCanvas(outerProfile[0].r, outerProfile[0].z);
    ctx.moveTo(firstOuter.x, firstOuter.y);
    for (let i = 1; i < outerProfile.length; i++) {
      const point = transform.toCanvas(outerProfile[i].r, outerProfile[i].z);
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }

  // Draw inner profile
  if (innerProfile.length > 0) {
    ctx.beginPath();
    const firstInner = transform.toCanvas(innerProfile[0].r, innerProfile[0].z);
    ctx.moveTo(firstInner.x, firstInner.y);
    for (let i = 1; i < innerProfile.length; i++) {
      const point = transform.toCanvas(innerProfile[i].r, innerProfile[i].z);
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }
}

/**
 * Render a colorbar legend for the contour visualization
 *
 * Draws a vertical colorbar with tick marks and labels showing the
 * value-to-color mapping.
 *
 * @param ctx - Canvas 2D rendering context
 * @param colormap - Colormap to display
 * @param valueRange - [min, max] value range
 * @param position - Position of colorbar { x, y, width, height } in canvas pixels
 * @param options - Display options (font, decimals, etc.)
 *
 * @example
 * ```typescript
 * renderColorbar(ctx, 'jet', [0, 1000], { x: 720, y: 50, width: 40, height: 400 });
 * ```
 */
export function renderColorbar(
  ctx: CanvasRenderingContext2D,
  colormap: ColormapType,
  valueRange: [number, number],
  position: { x: number; y: number; width: number; height: number },
  options: {
    font?: string;
    decimals?: number;
    numTicks?: number;
    unit?: string;
  } = {}
): void {
  const {
    font = '12px sans-serif',
    decimals = 0,
    numTicks = 5,
    unit = ''
  } = options;

  const { x, y, width, height } = position;
  const [minValue, maxValue] = valueRange;

  // Draw gradient bar
  const numSteps = 100;
  const stepHeight = height / numSteps;

  for (let i = 0; i < numSteps; i++) {
    // Value goes from max at top to min at bottom
    const value = maxValue - (i / numSteps) * (maxValue - minValue);
    const color = interpolateColorHex(value, minValue, maxValue, colormap);
    ctx.fillStyle = color;
    ctx.fillRect(x, y + i * stepHeight, width, stepHeight + 1); // +1 to avoid gaps
  }

  // Draw border
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  // Draw tick marks and labels
  ctx.fillStyle = '#000';
  ctx.font = font;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < numTicks; i++) {
    const t = i / (numTicks - 1);
    const value = maxValue - t * (maxValue - minValue); // Top to bottom
    const tickY = y + t * height;

    // Draw tick mark
    ctx.beginPath();
    ctx.moveTo(x + width, tickY);
    ctx.lineTo(x + width + 5, tickY);
    ctx.stroke();

    // Draw label
    const label = value.toFixed(decimals) + (unit ? ' ' + unit : '');
    ctx.fillText(label, x + width + 8, tickY);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate bounds from an array of tank profiles
 *
 * @param profiles - Array of profile points
 * @returns Bounding box containing all points
 */
export function calculateBounds(...profiles: TankProfile[][]): Bounds {
  let r_min = Infinity;
  let r_max = -Infinity;
  let z_min = Infinity;
  let z_max = -Infinity;

  for (const profile of profiles) {
    for (const point of profile) {
      r_min = Math.min(r_min, point.r);
      r_max = Math.max(r_max, point.r);
      z_min = Math.min(z_min, point.z);
      z_max = Math.max(z_max, point.z);
    }
  }

  return { r_min, r_max, z_min, z_max };
}

/**
 * Create a canvas element with the specified dimensions
 * Useful for offscreen rendering or testing
 *
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @returns Canvas element and 2D context
 */
export function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas');
  }
  return { canvas, ctx };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  createCoordinateTransform,
  clearCanvas,
  renderContourBands,
  renderMeshBoundary,
  renderTankInterior,
  drawBoundaryOutline,
  renderColorbar,
  calculateBounds,
  createCanvas
};
