/**
 * Colormap Utility Module for H2 Tank Designer
 *
 * Provides shared colormap utilities for both 2D charts (StressContourChart)
 * and 3D CAD viewer (CADTankViewer). Supports multiple scientific colormaps
 * commonly used in FEA, thermal analysis, and general data visualization.
 *
 * @module colormap
 */

// ============================================================================
// TYPES
// ============================================================================

export type ColormapType = 'jet' | 'thermal' | 'viridis' | 'plasma' | 'coolwarm';

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface ColorStop {
  offset: number; // 0.0-1.0
  color: string;  // CSS color (hex or rgb)
}

// ============================================================================
// COLORMAP DEFINITIONS
// ============================================================================

/**
 * Colormap control points defined as RGB values (0-255)
 * Each colormap has evenly spaced control points for interpolation
 */
const COLORMAP_CONTROL_POINTS: Record<ColormapType, RGB[]> = {
  /**
   * JET: Classic FEA colormap (blue -> cyan -> green -> yellow -> red)
   * Popular in engineering analysis despite perceptual non-uniformity
   */
  jet: [
    { r: 0, g: 0, b: 143 },      // Dark blue
    { r: 0, g: 0, b: 255 },      // Blue
    { r: 0, g: 127, b: 255 },    // Cyan-blue
    { r: 0, g: 255, b: 255 },    // Cyan
    { r: 0, g: 255, b: 127 },    // Cyan-green
    { r: 0, g: 255, b: 0 },      // Green
    { r: 127, g: 255, b: 0 },    // Yellow-green
    { r: 255, g: 255, b: 0 },    // Yellow
    { r: 255, g: 127, b: 0 },    // Orange
    { r: 255, g: 0, b: 0 },      // Red
    { r: 127, g: 0, b: 0 }       // Dark red
  ],

  /**
   * THERMAL: Temperature visualization (dark blue -> blue -> green -> yellow -> red)
   * Similar to jet but with better low-value visibility
   */
  thermal: [
    { r: 0, g: 0, b: 64 },       // Very dark blue
    { r: 0, g: 0, b: 128 },      // Dark blue
    { r: 0, g: 64, b: 255 },     // Blue
    { r: 0, g: 128, b: 255 },    // Light blue
    { r: 0, g: 200, b: 200 },    // Cyan
    { r: 0, g: 255, b: 128 },    // Cyan-green
    { r: 128, g: 255, b: 0 },    // Green-yellow
    { r: 200, g: 255, b: 0 },    // Yellow-green
    { r: 255, g: 220, b: 0 },    // Yellow
    { r: 255, g: 128, b: 0 },    // Orange
    { r: 255, g: 0, b: 0 },      // Red
    { r: 200, g: 0, b: 0 }       // Dark red
  ],

  /**
   * VIRIDIS: Perceptually uniform (purple -> blue -> teal -> green -> yellow)
   * Recommended for scientific visualization, colorblind-safe
   */
  viridis: [
    { r: 68, g: 1, b: 84 },      // Dark purple
    { r: 72, g: 35, b: 116 },    // Purple
    { r: 64, g: 67, b: 135 },    // Blue-purple
    { r: 52, g: 94, b: 141 },    // Blue
    { r: 41, g: 120, b: 142 },   // Blue-teal
    { r: 32, g: 144, b: 140 },   // Teal
    { r: 34, g: 167, b: 132 },   // Teal-green
    { r: 68, g: 190, b: 112 },   // Green
    { r: 122, g: 209, b: 81 },   // Light green
    { r: 189, g: 223, b: 38 },   // Yellow-green
    { r: 253, g: 231, b: 37 }    // Yellow
  ],

  /**
   * PLASMA: High contrast (purple -> magenta -> orange -> yellow)
   * Perceptually uniform, excellent for highlighting features
   */
  plasma: [
    { r: 13, g: 8, b: 135 },     // Dark purple
    { r: 75, g: 3, b: 161 },     // Purple
    { r: 125, g: 3, b: 168 },    // Purple-magenta
    { r: 168, g: 34, b: 150 },   // Magenta
    { r: 203, g: 70, b: 121 },   // Pink-magenta
    { r: 229, g: 107, b: 93 },   // Pink-orange
    { r: 248, g: 148, b: 65 },   // Orange
    { r: 253, g: 195, b: 40 },   // Orange-yellow
    { r: 248, g: 243, b: 27 },   // Yellow
    { r: 240, g: 249, b: 33 }    // Bright yellow
  ],

  /**
   * COOLWARM: Diverging colormap (blue -> white -> red)
   * Ideal for showing deviations from a neutral value (e.g., stress differences)
   */
  coolwarm: [
    { r: 59, g: 76, b: 192 },    // Dark blue
    { r: 98, g: 130, b: 234 },   // Blue
    { r: 141, g: 176, b: 254 },  // Light blue
    { r: 184, g: 208, b: 249 },  // Very light blue
    { r: 221, g: 221, b: 221 },  // White (neutral)
    { r: 249, g: 201, b: 180 },  // Very light red
    { r: 247, g: 157, b: 120 },  // Light red
    { r: 231, g: 99, b: 60 },    // Red-orange
    { r: 180, g: 4, b: 38 }      // Dark red
  ]
};

// ============================================================================
// INTERPOLATION FUNCTIONS
// ============================================================================

/**
 * Linear interpolation between two numbers
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two RGB colors
 */
function lerpColor(color1: RGB, color2: RGB, t: number): RGB {
  return {
    r: Math.round(lerp(color1.r, color2.r, t)),
    g: Math.round(lerp(color1.g, color2.g, t)),
    b: Math.round(lerp(color1.b, color2.b, t))
  };
}

/**
 * Convert RGB to CSS hex color string
 */
function rgbToHex(rgb: RGB): string {
  const r = clamp(rgb.r, 0, 255).toString(16).padStart(2, '0');
  const g = clamp(rgb.g, 0, 255).toString(16).padStart(2, '0');
  const b = clamp(rgb.b, 0, 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Convert RGB to CSS rgb() color string
 */
function rgbToString(rgb: RGB): string {
  return `rgb(${clamp(rgb.r, 0, 255)}, ${clamp(rgb.g, 0, 255)}, ${clamp(rgb.b, 0, 255)})`;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Interpolate a color from a colormap based on a normalized value
 *
 * @param value - The value to map to a color
 * @param min - Minimum value of the range
 * @param max - Maximum value of the range
 * @param colormap - The colormap to use
 * @returns RGB color object
 *
 * @example
 * ```typescript
 * // Map stress value 500 MPa in range [0, 1000] to jet colormap
 * const color = interpolateColor(500, 0, 1000, 'jet');
 * // Returns RGB color in the middle of the jet colormap (green-ish)
 * ```
 */
export function interpolateColor(
  value: number,
  min: number,
  max: number,
  colormap: ColormapType = 'jet'
): RGB {
  // Normalize value to [0, 1]
  const normalizedValue = clamp((value - min) / (max - min), 0, 1);

  // Get control points for the specified colormap
  const controlPoints = COLORMAP_CONTROL_POINTS[colormap];
  const numSegments = controlPoints.length - 1;

  // Find which segment this value falls into
  const segmentIndex = Math.min(
    Math.floor(normalizedValue * numSegments),
    numSegments - 1
  );

  // Calculate position within the segment [0, 1]
  const segmentPosition = (normalizedValue * numSegments) - segmentIndex;

  // Interpolate between the two control points
  return lerpColor(
    controlPoints[segmentIndex],
    controlPoints[segmentIndex + 1],
    segmentPosition
  );
}

/**
 * Get a CSS hex color string from a colormap
 *
 * @param value - The value to map to a color
 * @param min - Minimum value of the range
 * @param max - Maximum value of the range
 * @param colormap - The colormap to use
 * @returns CSS hex color string (e.g., "#ff0000")
 *
 * @example
 * ```typescript
 * const hexColor = interpolateColorHex(750, 0, 1000, 'thermal');
 * // Returns something like "#ff8000" (orange)
 * ```
 */
export function interpolateColorHex(
  value: number,
  min: number,
  max: number,
  colormap: ColormapType = 'jet'
): string {
  const rgb = interpolateColor(value, min, max, colormap);
  return rgbToHex(rgb);
}

/**
 * Get a CSS rgb() color string from a colormap
 *
 * @param value - The value to map to a color
 * @param min - Minimum value of the range
 * @param max - Maximum value of the range
 * @param colormap - The colormap to use
 * @returns CSS rgb() color string (e.g., "rgb(255, 0, 0)")
 */
export function interpolateColorRGB(
  value: number,
  min: number,
  max: number,
  colormap: ColormapType = 'jet'
): string {
  const rgb = interpolateColor(value, min, max, colormap);
  return rgbToString(rgb);
}

/**
 * Get color stops for CSS/SVG gradients
 *
 * @param colormap - The colormap to use
 * @param numStops - Number of color stops to generate (default: 11)
 * @returns Array of color stops with offset [0-1] and hex color
 *
 * @example
 * ```typescript
 * // For CSS linear gradient
 * const stops = getColorStops('viridis');
 * const gradient = `linear-gradient(to right, ${stops.map(s => s.color).join(', ')})`;
 *
 * // For SVG linearGradient
 * const stops = getColorStops('plasma', 20);
 * // <linearGradient>
 * //   {stops.map(s => <stop offset={s.offset} stopColor={s.color} />)}
 * // </linearGradient>
 * ```
 */
export function getColorStops(
  colormap: ColormapType = 'jet',
  numStops?: number
): ColorStop[] {
  const controlPoints = COLORMAP_CONTROL_POINTS[colormap];
  const actualNumStops = numStops ?? controlPoints.length;
  const stops: ColorStop[] = [];

  for (let i = 0; i < actualNumStops; i++) {
    const offset = i / (actualNumStops - 1);
    const rgb = interpolateColor(offset, 0, 1, colormap);
    stops.push({
      offset,
      color: rgbToHex(rgb)
    });
  }

  return stops;
}

/**
 * Get an array of hex colors sampled evenly across a colormap
 * Useful for discrete color scales or legend generation
 *
 * @param colormap - The colormap to use
 * @param numColors - Number of colors to sample
 * @returns Array of hex color strings
 *
 * @example
 * ```typescript
 * // Get 5 discrete colors from jet colormap
 * const colors = getDiscreteColors('jet', 5);
 * // Returns: ["#00008f", "#00ffff", "#00ff00", "#ffff00", "#ff0000"]
 * ```
 */
export function getDiscreteColors(
  colormap: ColormapType = 'jet',
  numColors: number = 10
): string[] {
  const colors: string[] = [];

  for (let i = 0; i < numColors; i++) {
    const value = i / (numColors - 1);
    const rgb = interpolateColor(value, 0, 1, colormap);
    colors.push(rgbToHex(rgb));
  }

  return colors;
}

/**
 * Get all available colormap types
 *
 * @returns Array of available colormap names
 */
export function getAvailableColormaps(): ColormapType[] {
  return Object.keys(COLORMAP_CONTROL_POINTS) as ColormapType[];
}

/**
 * Get a human-readable description of a colormap
 *
 * @param colormap - The colormap type
 * @returns Description string
 */
export function getColormapDescription(colormap: ColormapType): string {
  const descriptions: Record<ColormapType, string> = {
    jet: 'Classic FEA colormap (blue → cyan → green → yellow → red)',
    thermal: 'Temperature visualization (dark blue → blue → green → yellow → red)',
    viridis: 'Perceptually uniform, colorblind-safe (purple → blue → teal → green → yellow)',
    plasma: 'High contrast (purple → magenta → orange → yellow)',
    coolwarm: 'Diverging colormap for deviations (blue → white → red)'
  };

  return descriptions[colormap];
}

/**
 * Create a CSS linear-gradient string from a colormap
 *
 * @param colormap - The colormap to use
 * @param direction - CSS gradient direction (default: 'to right')
 * @param numStops - Number of color stops (default: 11)
 * @returns CSS linear-gradient string
 *
 * @example
 * ```typescript
 * const gradient = createCSSGradient('viridis', 'to bottom', 20);
 * // Apply to element: element.style.background = gradient;
 * ```
 */
export function createCSSGradient(
  colormap: ColormapType = 'jet',
  direction: string = 'to right',
  numStops: number = 11
): string {
  const stops = getColorStops(colormap, numStops);
  const stopStrings = stops.map(stop =>
    `${stop.color} ${(stop.offset * 100).toFixed(1)}%`
  );

  return `linear-gradient(${direction}, ${stopStrings.join(', ')})`;
}

/**
 * Get Three.js compatible color array [r, g, b] with values in [0, 1]
 * Useful for 3D CAD viewer vertex colors
 *
 * @param value - The value to map to a color
 * @param min - Minimum value of the range
 * @param max - Maximum value of the range
 * @param colormap - The colormap to use
 * @returns Array of [r, g, b] values in range [0, 1]
 *
 * @example
 * ```typescript
 * // For Three.js BufferGeometry vertex colors
 * const stressValue = 850; // MPa
 * const color = getThreeColor(stressValue, 0, 1000, 'jet');
 * geometry.setAttribute('color', new Float32BufferAttribute(color, 3));
 * ```
 */
export function getThreeColor(
  value: number,
  min: number,
  max: number,
  colormap: ColormapType = 'jet'
): [number, number, number] {
  const rgb = interpolateColor(value, min, max, colormap);
  return [rgb.r / 255, rgb.g / 255, rgb.b / 255];
}

/**
 * Batch process an array of values to Three.js colors
 * Optimized for large datasets like FEA results
 *
 * @param values - Array of values to convert
 * @param min - Minimum value of the range
 * @param max - Maximum value of the range
 * @param colormap - The colormap to use
 * @returns Flat array of RGB values [r1, g1, b1, r2, g2, b2, ...]
 *
 * @example
 * ```typescript
 * const stressValues = [100, 250, 500, 750, 900]; // MPa
 * const colors = batchGetThreeColors(stressValues, 0, 1000, 'thermal');
 * // Returns: [r1, g1, b1, r2, g2, b2, r3, g3, b3, r4, g4, b4, r5, g5, b5]
 * geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
 * ```
 */
export function batchGetThreeColors(
  values: number[],
  min: number,
  max: number,
  colormap: ColormapType = 'jet'
): number[] {
  const colors: number[] = [];

  for (const value of values) {
    const [r, g, b] = getThreeColor(value, min, max, colormap);
    colors.push(r, g, b);
  }

  return colors;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  interpolateColor,
  interpolateColorHex,
  interpolateColorRGB,
  getColorStops,
  getDiscreteColors,
  getAvailableColormaps,
  getColormapDescription,
  createCSSGradient,
  getThreeColor,
  batchGetThreeColors
};
