/**
 * Type definitions for Stress Contour Chart components
 */

import type { DesignStress, MeshElement, MeshNode } from '@/lib/types';

// ============================================================================
// Color Scale Types
// ============================================================================

export type ColorScale = 'jet' | 'viridis' | 'plasma' | 'turbo' | 'cool';

// ============================================================================
// Component Props Types
// ============================================================================

export interface StressContourChartProps {
  stressData: DesignStress;
  onExport?: (format: 'png' | 'svg') => void;
}

export interface TooltipData {
  element: MeshElement;
  stress: number;
  region: string;
  x: number;
  y: number;
}

export interface MeshTriangleProps {
  element: MeshElement;
  nodeMap: Map<number, MeshNode>;
  xScale: (r: number) => number;
  yScale: (z: number) => number;
  colorScale: (stress: number) => string;
  minStress: number;
  maxStress: number;
  onHover?: (data: TooltipData | null) => void;
  isHovered?: boolean;
}

export interface ContourInnerProps {
  width: number;
  height: number;
  stressData: DesignStress;
  colorScaleName: ColorScale;
  showGrid: boolean;
  showAxes: boolean;
  showLegend: boolean;
  mirrorView: boolean;
}

// ============================================================================
// Color Maps
// ============================================================================

export const COLORMAPS: Record<ColorScale, string[]> = {
  jet: ['#000080', '#0000FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF8000', '#FF0000', '#800000'],
  viridis: ['#440154', '#482878', '#3E4A89', '#31688E', '#26828E', '#1F9E89', '#35B779', '#6DCD59', '#B4DE2C', '#FDE725'],
  plasma: ['#0D0887', '#46039F', '#7201A8', '#9C179E', '#BD3786', '#D8576B', '#ED7953', '#FB9F3A', '#FDC328', '#F0F921'],
  turbo: ['#30123B', '#4662D7', '#35AAD1', '#3DDB6E', '#A6D820', '#FAC127', '#F57D15', '#D23105', '#7A0403'],
  cool: ['#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF'],
};

// ============================================================================
// Utility Functions
// ============================================================================

export function interpolateColor(scale: string[], t: number): string {
  const clampedT = Math.max(0, Math.min(1, t));
  const idx = clampedT * (scale.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  const frac = idx - lower;

  if (lower === upper) return scale[lower];

  const c1 = scale[lower];
  const c2 = scale[upper];

  // Parse hex colors
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);

  // Interpolate
  const r = Math.round(r1 + (r2 - r1) * frac);
  const g = Math.round(g1 + (g2 - g1) * frac);
  const b = Math.round(b1 + (b2 - b1) * frac);

  return `rgb(${r},${g},${b})`;
}

export function formatStress(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toFixed(0);
}
