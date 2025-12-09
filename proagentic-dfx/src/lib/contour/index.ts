/**
 * Contour Generation Library
 *
 * Exports utilities for generating smooth contour visualizations from grid data,
 * particularly for FEA stress/thermal field visualization.
 *
 * @module contour
 */

// Mesh-to-grid interpolation
export {
  meshToGrid,
  getGridValue,
  gridToPhysical,
  physicalToGrid,
  computeGridStats,
} from './mesh-to-grid';

export type { GridData } from './mesh-to-grid';

// Contour generation
export {
  generateContours,
  computeNiceThresholds,
  contourToSVGPath,
  createPhysicalTransform,
  createContourColormap,
} from './contour-generator';

export type {
  ContourBand,
  Isoline,
  LabelPoint,
  ContourData,
  CoordinateTransform,
} from './contour-generator';
