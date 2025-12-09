/**
 * Contour Generator Module
 *
 * Wraps d3-contour for FEA visualization, generating smooth contour bands
 * and isolines from grid data for stress/thermal field visualization.
 *
 * @module contour-generator
 */

import { contours, type ContourMultiPolygon } from 'd3-contour';
import { geoPath } from 'd3-geo';
import type { GridData } from './mesh-to-grid';

/**
 * A filled contour band representing values within a threshold range.
 */
export interface ContourBand {
  /** Lower threshold value for this band */
  value: number;
  /** GeoJSON MultiPolygon coordinates [polygon][ring][point][x/y] */
  coordinates: number[][][][];
  /** SVG path string for rendering */
  path: string;
}

/**
 * Label point for an isoline.
 */
export interface LabelPoint {
  /** x coordinate in grid space */
  x: number;
  /** y coordinate in grid space */
  y: number;
  /** Angle in degrees for optimal label rotation */
  angle: number;
}

/**
 * An isoline (line of constant value) for contour visualization.
 */
export interface Isoline {
  /** Threshold value for this isoline */
  threshold: number;
  /** SVG path string (d attribute) */
  path: string;
  /** Recommended label positions along the isoline */
  labelPoints: LabelPoint[];
}

/**
 * Complete contour data including bands, isolines, and metadata.
 */
export interface ContourData {
  /** Filled contour bands for continuous visualization */
  bands: ContourBand[];
  /** Stroke isolines for precise value indication */
  isolines: Isoline[];
  /** Threshold values used for generation */
  thresholds: number[];
  /** Minimum value in the data */
  min: number;
  /** Maximum value in the data */
  max: number;
  /** Grid dimensions */
  grid: {
    width: number;
    height: number;
  };
}

/**
 * Transform function type for converting grid coordinates to physical space.
 */
export type CoordinateTransform = (x: number, y: number) => { x: number; y: number };

/**
 * Identity transform (no transformation).
 */
const identityTransform: CoordinateTransform = (x, y) => ({ x, y });

/**
 * Generate complete contour data from grid values.
 *
 * @param grid - Grid data with values in row-major order
 * @param numLevels - Number of contour levels to generate (default: 10)
 * @param transform - Optional coordinate transformation function
 * @returns Complete contour data with bands and isolines
 *
 * @example
 * ```typescript
 * const grid: GridData = {
 *   width: 100,
 *   height: 80,
 *   values: new Array(8000).fill(0).map((_, i) =>
 *     Math.sin(i / 100) * Math.cos(i / 80) * 100
 *   )
 * };
 * const contourData = generateContours(grid, 15);
 * ```
 */
export function generateContours(
  grid: GridData,
  numLevels: number = 10,
  transform: CoordinateTransform = identityTransform
): ContourData {
  const { width, height, values, mask } = grid;

  // Filter out NaN/invalid values for range computation
  const validValues = Array.from(values).filter((v, i) =>
    mask && mask[i] && !isNaN(v)
  );

  // Compute data range from valid values only
  const min = validValues.length > 0 ? Math.min(...validValues) : 0;
  const max = validValues.length > 0 ? Math.max(...validValues) : 1;

  // Generate nice threshold values
  const thresholds = computeNiceThresholds(min, max, numLevels);

  // Create d3-contour generator
  const contourGenerator = contours()
    .size([width, height])
    .thresholds(thresholds);

  // Convert Float32Array to regular array for d3-contour
  const valuesArray = Array.from(values);
  const contourPolygons = contourGenerator(valuesArray);

  // Convert to contour bands (filled regions)
  const bands: ContourBand[] = contourPolygons.map((polygon) => ({
    value: polygon.value,
    coordinates: polygon.coordinates,
    path: contourToSVGPath(polygon, transform),
  }));

  // Generate isolines (contour lines) at the same thresholds
  const isolines: Isoline[] = thresholds.map((threshold) => {
    const contourGen = contours()
      .size([width, height])
      .thresholds([threshold]);

    const [polygon] = contourGen(valuesArray);

    if (!polygon) {
      return {
        threshold,
        path: '',
        labelPoints: [],
      };
    }

    const path = contourToSVGPath(polygon, transform);
    const labelPoints = computeLabelPoints(polygon, transform);

    return {
      threshold,
      path,
      labelPoints,
    };
  });

  return {
    bands,
    isolines,
    thresholds,
    min,
    max,
    grid: { width, height },
  };
}

/**
 * Compute "nice" rounded threshold values for contour levels.
 * Uses a heuristic to generate human-readable threshold values.
 *
 * @param min - Minimum value in the dataset
 * @param max - Maximum value in the dataset
 * @param count - Desired number of levels
 * @returns Array of threshold values
 *
 * @example
 * ```typescript
 * const thresholds = computeNiceThresholds(23.7, 487.3, 10);
 * // Returns: [50, 100, 150, 200, 250, 300, 350, 400, 450]
 * ```
 */
export function computeNiceThresholds(min: number, max: number, count: number): number[] {
  if (count <= 0) return [];
  if (min >= max) return [min];

  const range = max - min;
  const rawStep = range / count;

  // Compute nice step size (round to 1, 2, 5, 10, 20, 50, etc.)
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalizedStep = rawStep / magnitude;

  let niceStep: number;
  if (normalizedStep <= 1) {
    niceStep = 1 * magnitude;
  } else if (normalizedStep <= 2) {
    niceStep = 2 * magnitude;
  } else if (normalizedStep <= 5) {
    niceStep = 5 * magnitude;
  } else {
    niceStep = 10 * magnitude;
  }

  // Find nice starting point
  const niceMin = Math.ceil(min / niceStep) * niceStep;

  // Generate threshold array
  const thresholds: number[] = [];
  let value = niceMin;
  while (value < max && thresholds.length < count) {
    thresholds.push(value);
    value += niceStep;
  }

  // Ensure we have at least one threshold
  if (thresholds.length === 0) {
    thresholds.push((min + max) / 2);
  }

  return thresholds;
}

/**
 * Convert d3-contour MultiPolygon to SVG path string.
 *
 * @param contour - d3-contour generated MultiPolygon
 * @param transform - Coordinate transformation function
 * @returns SVG path string (d attribute)
 *
 * @example
 * ```typescript
 * const transform = (x: number, y: number) => ({
 *   x: x * 10 + 50,
 *   y: 500 - y * 10
 * });
 * const path = contourToSVGPath(contourPolygon, transform);
 * // Returns: "M 100,200 L 110,195 L 120,198 Z M 150,300 ..."
 * ```
 */
export function contourToSVGPath(
  contour: ContourMultiPolygon,
  transform: CoordinateTransform = identityTransform
): string {
  const pathSegments: string[] = [];

  // Process each polygon in the MultiPolygon
  for (const polygon of contour.coordinates) {
    // Process each ring in the polygon (first is exterior, rest are holes)
    for (const ring of polygon) {
      if (ring.length === 0) continue;

      // Transform first point and start path
      const first = transform(ring[0][0], ring[0][1]);
      const pathParts = [`M ${first.x},${first.y}`];

      // Add remaining points
      for (let i = 1; i < ring.length; i++) {
        const point = transform(ring[i][0], ring[i][1]);
        pathParts.push(`L ${point.x},${point.y}`);
      }

      // Close the path
      pathParts.push('Z');

      pathSegments.push(pathParts.join(' '));
    }
  }

  return pathSegments.join(' ');
}

/**
 * Compute optimal label points along an isoline.
 *
 * @param contour - d3-contour generated MultiPolygon
 * @param transform - Coordinate transformation function
 * @returns Array of label points with positions and angles
 */
function computeLabelPoints(
  contour: ContourMultiPolygon,
  transform: CoordinateTransform
): LabelPoint[] {
  const labelPoints: LabelPoint[] = [];

  // Process first polygon only (typically the largest/most important)
  if (contour.coordinates.length === 0) return labelPoints;

  const polygon = contour.coordinates[0];
  if (polygon.length === 0) return labelPoints;

  const ring = polygon[0]; // Exterior ring
  if (ring.length < 2) return labelPoints;

  // Compute total path length to determine label spacing
  let totalLength = 0;
  const segments: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; length: number }> = [];

  for (let i = 0; i < ring.length - 1; i++) {
    const start = transform(ring[i][0], ring[i][1]);
    const end = transform(ring[i + 1][0], ring[i + 1][1]);
    const length = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );

    segments.push({ start, end, length });
    totalLength += length;
  }

  if (totalLength === 0) return labelPoints;

  // Place 2-4 labels depending on path length
  const numLabels = Math.min(4, Math.max(1, Math.floor(totalLength / 150)));
  const labelSpacing = totalLength / (numLabels + 1);

  let accumulatedLength = 0;
  let nextLabelDistance = labelSpacing;
  let labelCount = 0;

  for (const segment of segments) {
    const segmentStart = accumulatedLength;
    const segmentEnd = accumulatedLength + segment.length;

    while (nextLabelDistance <= segmentEnd && labelCount < numLabels) {
      // Interpolate position along this segment
      const t = (nextLabelDistance - segmentStart) / segment.length;
      const x = segment.start.x + t * (segment.end.x - segment.start.x);
      const y = segment.start.y + t * (segment.end.y - segment.start.y);

      // Compute tangent angle
      const dx = segment.end.x - segment.start.x;
      const dy = segment.end.y - segment.start.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      // Normalize angle to [-90, 90] for readable text
      let normalizedAngle = angle;
      if (normalizedAngle > 90) normalizedAngle -= 180;
      if (normalizedAngle < -90) normalizedAngle += 180;

      labelPoints.push({ x, y, angle: normalizedAngle });

      labelCount++;
      nextLabelDistance += labelSpacing;
    }

    accumulatedLength = segmentEnd;
  }

  return labelPoints;
}

/**
 * Create a coordinate transform for mapping grid space to physical space.
 *
 * @param grid - Grid data with optional physical bounds
 * @param viewBox - Target SVG viewBox dimensions
 * @returns Transform function
 *
 * @example
 * ```typescript
 * const transform = createPhysicalTransform(
 *   { width: 100, height: 80, values: [], r_min: 0, r_max: 500, z_min: 0, z_max: 1000 },
 *   { width: 800, height: 600, padding: 50 }
 * );
 * const physical = transform(50, 40); // Grid coords -> physical coords
 * ```
 */
export function createPhysicalTransform(
  grid: GridData,
  viewBox: { width: number; height: number; padding?: number }
): CoordinateTransform {
  const padding = viewBox.padding ?? 0;
  const displayWidth = viewBox.width - 2 * padding;
  const displayHeight = viewBox.height - 2 * padding;

  // Extract bounds from GridData
  const { r_min, r_max, z_min, z_max } = grid.bounds;

  const rRange = r_max - r_min || 1;
  const zRange = z_max - z_min || 1;

  const scaleR = displayWidth / grid.width;
  const scaleZ = displayHeight / grid.height;

  return (gridX: number, gridY: number) => {
    // Map grid coordinates to physical space, then to display space
    // Note: gridY increases downward, but physical z typically increases upward
    const r = r_min + (gridX / grid.width) * rRange;
    const z = z_max - (gridY / grid.height) * zRange; // Flip Y axis

    // Map to display coordinates
    const x = ((r - r_min) / rRange) * displayWidth + padding;
    const y = ((z_max - z) / zRange) * displayHeight + padding;

    return { x, y };
  };
}

/**
 * Utility function to create a gradient colormap for contour visualization.
 *
 * @param bands - Contour bands
 * @param colormap - Color interpolation function (value in [0,1] -> RGB)
 * @returns Array of band colors
 *
 * @example
 * ```typescript
 * const jetColormap = (t: number) => {
 *   // Jet colormap implementation
 *   return `rgb(${r},${g},${b})`;
 * };
 * const colors = createContourColormap(contourData.bands, jetColormap);
 * ```
 */
export function createContourColormap(
  bands: ContourBand[],
  colormap: (t: number) => string,
  min: number,
  max: number
): string[] {
  const range = max - min || 1;

  return bands.map((band) => {
    const normalizedValue = (band.value - min) / range;
    return colormap(Math.max(0, Math.min(1, normalizedValue)));
  });
}
