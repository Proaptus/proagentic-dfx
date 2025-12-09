/**
 * Mesh-to-Grid Interpolation for FEA Stress Contour Visualization
 *
 * This module converts irregular FEA triangular meshes to regular grids
 * for d3-contour processing. Uses barycentric interpolation to compute
 * stress values at grid points from triangular mesh elements.
 *
 * Algorithm:
 * 1. Create regular grid covering mesh bounds
 * 2. For each grid point, find containing triangle
 * 3. Use barycentric coordinates to interpolate stress
 * 4. Mark grid points outside mesh in mask array
 */

import type { FEAMesh, MeshNode, MeshElement } from '../types';

/**
 * Regular grid data structure for d3-contour
 */
export interface GridData {
  /** Stress values in row-major order (Float32Array for performance) */
  values: Float32Array;
  /** Grid width (number of columns) */
  width: number;
  /** Grid height (number of rows) */
  height: number;
  /** Physical bounds of the grid */
  bounds: {
    r_min: number;
    r_max: number;
    z_min: number;
    z_max: number;
  };
  /** Boolean mask indicating valid grid points (true = inside mesh) */
  mask: boolean[];
}

/**
 * Barycentric coordinates for a point in a triangle
 */
interface BarycentricCoords {
  /** Weight for vertex 1 */
  lambda1: number;
  /** Weight for vertex 2 */
  lambda2: number;
  /** Weight for vertex 3 */
  lambda3: number;
}

/**
 * Triangle defined by three nodes
 */
interface Triangle {
  /** Node IDs */
  nodeIds: [number, number, number];
  /** Node coordinates and stress values */
  nodes: [MeshNode, MeshNode, MeshNode];
  /** Region for debugging */
  region: string;
}

/**
 * Convert irregular FEA triangular mesh to regular grid for contour visualization
 *
 * @param mesh - FEA mesh with nodes, elements, and bounds
 * @param gridWidth - Number of grid columns (default: auto-scaled to mesh aspect ratio)
 * @param gridHeight - Number of grid rows (default: auto-scaled to mesh aspect ratio)
 * @returns GridData suitable for d3-contour processing
 */
export function meshToGrid(
  mesh: FEAMesh,
  gridWidth?: number,
  gridHeight?: number
): GridData {
  const { bounds, nodes, elements } = mesh;

  // Calculate grid dimensions based on mesh bounds and desired resolution
  const aspectRatio = (bounds.r_max - bounds.r_min) / (bounds.z_max - bounds.z_min);

  // Default to 200x200 grid, but adjust for aspect ratio
  const baseResolution = 200;
  let width = gridWidth;
  let height = gridHeight;

  if (!width && !height) {
    if (aspectRatio > 1) {
      width = baseResolution;
      height = Math.ceil(baseResolution / aspectRatio);
    } else {
      height = baseResolution;
      width = Math.ceil(baseResolution * aspectRatio);
    }
  } else if (!width) {
    width = Math.ceil(height! * aspectRatio);
  } else if (!height) {
    height = Math.ceil(width / aspectRatio);
  }

  // Create node lookup map for efficient access
  const nodeMap = new Map<number, MeshNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  // Build triangle list for spatial search
  const triangles: Triangle[] = elements.map((element) => {
    const [id1, id2, id3] = element.nodes;
    const node1 = nodeMap.get(id1);
    const node2 = nodeMap.get(id2);
    const node3 = nodeMap.get(id3);

    if (!node1 || !node2 || !node3) {
      throw new Error(`Element ${element.id} references non-existent nodes`);
    }

    return {
      nodeIds: element.nodes,
      nodes: [node1, node2, node3],
      region: element.region,
    };
  });

  // Calculate grid spacing
  const dr = (bounds.r_max - bounds.r_min) / (width - 1);
  const dz = (bounds.z_max - bounds.z_min) / (height - 1);

  // Allocate grid arrays
  const values = new Float32Array(width * height);
  const mask = new Array(width * height).fill(false);

  // Interpolate stress at each grid point
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = row * width + col;

      // Calculate grid point coordinates
      const r = bounds.r_min + col * dr;
      const z = bounds.z_min + row * dz;

      // Find containing triangle and interpolate stress
      const stress = interpolateStress(r, z, triangles);

      if (stress !== null) {
        values[idx] = stress;
        mask[idx] = true;
      } else {
        // Point outside mesh - use NaN or 0
        values[idx] = NaN;
        mask[idx] = false;
      }
    }
  }

  return {
    values,
    width,
    height,
    bounds,
    mask,
  };
}

/**
 * Interpolate stress at a point using barycentric interpolation
 *
 * Searches for the triangle containing the point and interpolates
 * stress from the triangle's vertices using barycentric coordinates.
 *
 * @param r - Radial coordinate (mm)
 * @param z - Axial coordinate (mm)
 * @param triangles - List of triangles to search
 * @returns Interpolated stress value (MPa) or null if point is outside mesh
 */
function interpolateStress(
  r: number,
  z: number,
  triangles: Triangle[]
): number | null {
  // Search for containing triangle (brute force - could optimize with spatial index)
  for (const triangle of triangles) {
    const [node1, node2, node3] = triangle.nodes;

    // Compute barycentric coordinates
    const bary = computeBarycentricCoords(r, z, node1, node2, node3);

    // Check if point is inside triangle (all barycentric coords >= 0)
    if (isPointInTriangle(bary)) {
      // Interpolate stress using barycentric weights
      const stress =
        bary.lambda1 * node1.stress +
        bary.lambda2 * node2.stress +
        bary.lambda3 * node3.stress;

      return stress;
    }
  }

  // Point not found in any triangle - outside mesh
  return null;
}

/**
 * Compute barycentric coordinates for a point in a triangle
 *
 * Given triangle with vertices (r1,z1), (r2,z2), (r3,z3) and point (r,z),
 * computes weights λ1, λ2, λ3 such that:
 *   (r,z) = λ1*(r1,z1) + λ2*(r2,z2) + λ3*(r3,z3)
 *   λ1 + λ2 + λ3 = 1
 *
 * @param r - Point radial coordinate
 * @param z - Point axial coordinate
 * @param node1 - Triangle vertex 1
 * @param node2 - Triangle vertex 2
 * @param node3 - Triangle vertex 3
 * @returns Barycentric coordinates
 */
function computeBarycentricCoords(
  r: number,
  z: number,
  node1: MeshNode,
  node2: MeshNode,
  node3: MeshNode
): BarycentricCoords {
  const { r: r1, z: z1 } = node1;
  const { r: r2, z: z2 } = node2;
  const { r: r3, z: z3 } = node3;

  // Compute twice the signed area of the triangle
  const denom = (z2 - z3) * (r1 - r3) + (r3 - r2) * (z1 - z3);

  // Avoid division by zero (degenerate triangle)
  if (Math.abs(denom) < 1e-10) {
    return { lambda1: 0, lambda2: 0, lambda3: 0 };
  }

  // Compute barycentric coordinates using the standard formula
  const lambda1 = ((z2 - z3) * (r - r3) + (r3 - r2) * (z - z3)) / denom;
  const lambda2 = ((z3 - z1) * (r - r3) + (r1 - r3) * (z - z3)) / denom;
  const lambda3 = 1.0 - lambda1 - lambda2;

  return { lambda1, lambda2, lambda3 };
}

/**
 * Test if a point is inside a triangle using barycentric coordinates
 *
 * A point is inside the triangle if all barycentric coordinates are
 * non-negative (with small epsilon for numerical tolerance).
 *
 * @param bary - Barycentric coordinates
 * @returns True if point is inside triangle
 */
function isPointInTriangle(bary: BarycentricCoords): boolean {
  const epsilon = -1e-6; // Small negative tolerance for numerical robustness
  return (
    bary.lambda1 >= epsilon &&
    bary.lambda2 >= epsilon &&
    bary.lambda3 >= epsilon
  );
}

/**
 * Get stress value at a specific grid point
 *
 * Helper function to access grid values with bounds checking.
 *
 * @param grid - Grid data
 * @param col - Column index (0 to width-1)
 * @param row - Row index (0 to height-1)
 * @returns Stress value or null if out of bounds
 */
export function getGridValue(
  grid: GridData,
  col: number,
  row: number
): number | null {
  if (col < 0 || col >= grid.width || row < 0 || row >= grid.height) {
    return null;
  }

  const idx = row * grid.width + col;
  if (!grid.mask[idx]) {
    return null;
  }

  return grid.values[idx];
}

/**
 * Convert grid coordinates to physical coordinates
 *
 * @param grid - Grid data
 * @param col - Column index
 * @param row - Row index
 * @returns Physical coordinates [r, z] or null if out of bounds
 */
export function gridToPhysical(
  grid: GridData,
  col: number,
  row: number
): [number, number] | null {
  if (col < 0 || col >= grid.width || row < 0 || row >= grid.height) {
    return null;
  }

  const { bounds, width, height } = grid;
  const dr = (bounds.r_max - bounds.r_min) / (width - 1);
  const dz = (bounds.z_max - bounds.z_min) / (height - 1);

  const r = bounds.r_min + col * dr;
  const z = bounds.z_min + row * dz;

  return [r, z];
}

/**
 * Convert physical coordinates to grid coordinates
 *
 * @param grid - Grid data
 * @param r - Radial coordinate (mm)
 * @param z - Axial coordinate (mm)
 * @returns Grid coordinates [col, row] or null if out of bounds
 */
export function physicalToGrid(
  grid: GridData,
  r: number,
  z: number
): [number, number] | null {
  const { bounds, width, height } = grid;

  if (
    r < bounds.r_min ||
    r > bounds.r_max ||
    z < bounds.z_min ||
    z > bounds.z_max
  ) {
    return null;
  }

  const dr = (bounds.r_max - bounds.r_min) / (width - 1);
  const dz = (bounds.z_max - bounds.z_min) / (height - 1);

  const col = Math.round((r - bounds.r_min) / dr);
  const row = Math.round((z - bounds.z_min) / dz);

  // Clamp to grid bounds
  return [
    Math.max(0, Math.min(width - 1, col)),
    Math.max(0, Math.min(height - 1, row)),
  ];
}

/**
 * Compute statistics for grid data
 *
 * @param grid - Grid data
 * @returns Statistics object with min, max, mean, and count
 */
export function computeGridStats(grid: GridData): {
  min: number;
  max: number;
  mean: number;
  count: number;
} {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let count = 0;

  for (let i = 0; i < grid.values.length; i++) {
    if (grid.mask[i] && !isNaN(grid.values[i])) {
      const val = grid.values[i];
      min = Math.min(min, val);
      max = Math.max(max, val);
      sum += val;
      count++;
    }
  }

  return {
    min: count > 0 ? min : 0,
    max: count > 0 ? max : 0,
    mean: count > 0 ? sum / count : 0,
    count,
  };
}
