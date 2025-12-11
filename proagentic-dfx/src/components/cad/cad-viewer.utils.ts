/**
 * Utility functions and constants for CAD Tank Viewer
 */

import type { DesignGeometry, StressNode, FEAMesh3D } from '@/lib/types';

// ============================================================================
// Layer Colors
// ============================================================================

export const HELICAL_COLOR: [number, number, number] = [0.976, 0.451, 0.086]; // #F97316
export const HOOP_COLOR: [number, number, number] = [0.055, 0.647, 0.914]; // #0EA5E9
export const LINER_COLOR: [number, number, number] = [0.612, 0.639, 0.686]; // #9CA3AF
export const BOSS_COLOR: [number, number, number] = [0.122, 0.161, 0.216]; // #1F2937

// ============================================================================
// Types
// ============================================================================

export interface CADTankViewerProps {
  geometry: DesignGeometry;
  stressNodes?: StressNode[];
  feaMesh3D?: FEAMesh3D;
  stressRange?: { min: number; max: number };
  showStress: boolean;
  showWireframe: boolean;
  showCrossSection: boolean;
  sectionDirection?: 'x' | 'y' | 'z';
  sectionPosition?: number;
  autoRotate: boolean;
  visibleLayers?: Set<number>;
  showLiner?: boolean;
  layerOpacity?: number;
  onPointClick?: (point: { x: number; y: number; z: number }) => void;
}

export type CameraViewPreset = {
  label: string;
  rotation: [number, number];
};

// ============================================================================
// Camera View Presets
// ============================================================================

export const CAMERA_VIEW_PRESETS: CameraViewPreset[] = [
  { label: 'Front', rotation: [0, 0] },
  { label: 'Back', rotation: [0, Math.PI] },
  { label: 'Left', rotation: [0, -Math.PI / 2] },
  { label: 'Right', rotation: [0, Math.PI / 2] },
  { label: 'Top', rotation: [-Math.PI / 2, 0] },
  { label: 'Bottom', rotation: [Math.PI / 2, 0] },
  { label: 'Iso', rotation: [0.5, 0.8] },
];

export const KEYBOARD_VIEW_PRESETS: Record<string, [number, number]> = {
  '1': [0, 0],              // Front
  'f': [0, 0],
  '2': [0, Math.PI],        // Back
  'b': [0, Math.PI],
  '3': [0, -Math.PI / 2],   // Left
  'l': [0, -Math.PI / 2],
  '4': [0, Math.PI / 2],    // Right
  'r': [0, Math.PI / 2],
  '5': [-Math.PI / 2, 0],   // Top
  't': [-Math.PI / 2, 0],
  '6': [Math.PI / 2, 0],    // Bottom
  'u': [Math.PI / 2, 0],
  '7': [0.5, 0.8],          // Isometric
  'i': [0.5, 0.8],
};

// ============================================================================
// Geometry Utility Functions
// ============================================================================

/**
 * Calculate clipping plane based on direction and position
 * @param direction - 'x', 'y', or 'z' axis
 * @param position - Position along axis (-1 to 1)
 * @returns Clipping plane as [nx, ny, nz, d] where n is normal and d is offset
 */
export function calculateClippingPlane(
  direction: 'x' | 'y' | 'z',
  position: number
): [number, number, number, number] {
  switch (direction) {
    case 'x':
      return [1, 0, 0, -position];
    case 'y':
      return [0, 1, 0, -position];
    case 'z':
    default:
      return [0, 0, 1, -position];
  }
}

/**
 * Scale all vertex positions by a uniform factor
 */
export function scalePositions(positions: Float32Array, scale: number): Float32Array {
  const scaled = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i++) {
    scaled[i] = positions[i] * scale;
  }
  return scaled;
}

/**
 * Offset mesh positions along the Z axis (actually Y in our coordinate system)
 */
export function offsetMeshZ(positions: Float32Array, zOffset: number): Float32Array {
  const offset = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    offset[i] = positions[i];
    offset[i + 1] = positions[i + 1] + zOffset;
    offset[i + 2] = positions[i + 2];
  }
  return offset;
}

/**
 * Calculate the scale factor to fit tank in view
 */
export function calculateFitScale(geometry: DesignGeometry): number {
  const totalLength = geometry.dimensions.total_length_mm;
  const maxRadius = geometry.dimensions.outer_radius_mm;
  return 1.5 / Math.max(totalLength, maxRadius * 2);
}
