/**
 * CAD Colormap Module
 *
 * Re-exports colormap functions from @/lib/charts/colormap for CAD/3D visualization use.
 * Provides type definitions and utilities specific to CAD vertex coloring.
 *
 * @module cad/colormaps
 */

// Re-export everything from the main colormap module
export {
  type ColormapType,
  type RGB,
  type ColorStop,
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
} from '@/lib/charts/colormap';

// ============================================================================
// CAD-SPECIFIC TYPES
// ============================================================================

/** Alias for better semantics in CAD context */
export type ColormapName = import('@/lib/charts/colormap').ColormapType;

/** Options for applying colormaps to CAD geometry */
export interface ColormapOptions {
  colormap: ColormapName;
  minValue: number;
  maxValue: number;
  reverse?: boolean;
}

/** Default colormap options for stress visualization */
export const DEFAULT_STRESS_COLORMAP_OPTIONS: ColormapOptions = {
  colormap: 'jet',
  minValue: 0,
  maxValue: 1000, // Default max stress in MPa
  reverse: false
};

/** Default colormap options for thermal visualization */
export const DEFAULT_THERMAL_COLORMAP_OPTIONS: ColormapOptions = {
  colormap: 'thermal',
  minValue: 20,  // Room temperature in Celsius
  maxValue: 200, // Typical max temperature
  reverse: false
};

// ============================================================================
// CAD-SPECIFIC UTILITIES
// ============================================================================

import { getThreeColor as getColor, batchGetThreeColors as batchGetColors } from '@/lib/charts/colormap';

/**
 * Get vertex color for a single value using colormap options
 * Handles reverse option and returns [r, g, b] in [0, 1] range
 *
 * @param value - The value to map to a color
 * @param options - Colormap options
 * @returns [r, g, b] array with values in [0, 1]
 */
export function getVertexColor(
  value: number,
  options: ColormapOptions
): [number, number, number] {
  const { colormap, minValue, maxValue, reverse } = options;

  // If reverse, flip the value within the range
  const mappedValue = reverse
    ? maxValue - (value - minValue)
    : value;

  return getColor(mappedValue, minValue, maxValue, colormap);
}

/**
 * Batch process vertex colors for an array of values
 * Optimized for large mesh data like FEA results
 *
 * @param values - Array of values to convert
 * @param options - Colormap options
 * @returns Flat array of RGB values [r1, g1, b1, r2, g2, b2, ...]
 */
export function batchGetVertexColors(
  values: number[],
  options: ColormapOptions
): number[] {
  const { colormap, minValue, maxValue, reverse } = options;

  // If reverse, transform all values
  const mappedValues = reverse
    ? values.map(v => maxValue - (v - minValue))
    : values;

  return batchGetColors(mappedValues, minValue, maxValue, colormap);
}

/**
 * Create a Float32Array of vertex colors for Three.js BufferGeometry
 *
 * @param values - Array of values to convert
 * @param options - Colormap options
 * @returns Float32Array suitable for BufferGeometry color attribute
 */
export function createVertexColorBuffer(
  values: number[],
  options: ColormapOptions
): Float32Array {
  const colors = batchGetVertexColors(values, options);
  return new Float32Array(colors);
}

/**
 * Simple jet colormap function for backward compatibility
 * Returns { r, g, b } with values in [0, 1] range
 *
 * @param t - Normalized value [0, 1]
 * @returns { r, g, b } object with values in [0, 1]
 * @deprecated Use getThreeColor() or getVertexColor() instead
 */
export function jetColormap(t: number): { r: number; g: number; b: number } {
  const [r, g, b] = getColor(t, 0, 1, 'jet');
  return { r, g, b };
}
