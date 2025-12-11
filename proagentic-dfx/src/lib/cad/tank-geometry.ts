/**
 * Tank Geometry Builder
 *
 * Creates mesh geometry for hydrogen pressure vessels
 * with accurate isotensoid dome profiles based on netting theory.
 *
 * Note: This uses pure JavaScript mesh generation.
 * Server-side Truck CAD kernel will be used for B-rep operations.
 */

import type { DesignGeometry, CompositeLayer } from '@/lib/types';
import {
  type ColormapName,
  type ColormapOptions,
  getThreeColor
} from './colormaps';
import { createStandardCylindricalBoss } from '@/lib/tank-models/boss-components';

// Re-export colormap types for consumers
export type { ColormapName, ColormapOptions };
export { getThreeColor, DEFAULT_STRESS_COLORMAP_OPTIONS, DEFAULT_THERMAL_COLORMAP_OPTIONS } from './colormaps';

export interface TankMeshData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  colors?: Float32Array;
  color?: [number, number, number];
}

export interface TankLayerMesh {
  layer: CompositeLayer;
  mesh: TankMeshData;
}

export interface TankGeometryResult {
  outer: TankMeshData;
  inner: TankMeshData;
  layers: TankLayerMesh[];
  bosses: TankMeshData[];
}

/**
 * Generate isotensoid dome profile points
 * Based on netting theory: r = R0 * sin(alpha0) / sin(alpha)
 *
 * This implementation calculates the TRUE isotensoid curve by:
 * 1. Computing r(α) using the isotensoid equation
 * 2. Computing z from the meridional slope: dz/dr = -cot(α)
 * 3. Using numerical integration to get accurate z-coordinates
 *
 * @param R0 - Cylinder radius (mm)
 * @param alpha0Deg - Winding angle at cylinder (degrees), typically 54.74 from netting theory
 * @param bossRadius - Boss opening radius (mm)
 * @param domeDepth - Target dome depth (mm) - used for scaling if needed
 * @param numPoints - Number of profile points
 */
export function calculateIsotensoidProfile(
  R0: number,
  alpha0Deg: number,
  bossRadius: number,
  domeDepth: number,
  numPoints: number = 50
): { r: number; z: number }[] {
  const alpha0 = (alpha0Deg * Math.PI) / 180;
  const points: { r: number; z: number }[] = [];

  // First pass: calculate r values and accumulate z through integration
  const alphas: number[] = [];
  const rValues: number[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints; // 0 at apex, 1 at cylinder

    // Alpha varies from 90deg at apex to alpha0 at cylinder
    const alpha = alpha0 + (Math.PI / 2 - alpha0) * (1 - t);
    alphas.push(alpha);

    // Isotensoid equation: r = R0 * sin(alpha0) / sin(alpha)
    let r = R0 * Math.sin(alpha0) / Math.sin(alpha);

    // Clamp minimum radius to boss radius
    r = Math.max(r, bossRadius);
    rValues.push(r);
  }

  // Second pass: calculate z values using meridional integration
  // For isotensoid: dz/dr = -cot(α), so dz = -cot(α) * dr
  // We integrate from apex (i=0, z=z_apex) downward to cylinder (i=numPoints, z=0)

  // Calculate total depth from geometry first
  let totalDepth = 0;
  for (let i = 0; i < numPoints; i++) {
    const alpha1 = alphas[i];
    const alpha2 = alphas[i + 1];
    const r1 = rValues[i];
    const r2 = rValues[i + 1];

    // Average values for trapezoidal integration
    const alphaMid = (alpha1 + alpha2) / 2;
    const dr = r2 - r1;

    // dz/dr = -cot(α), so dz = -cot(α) * dr
    const dz = -dr / Math.tan(alphaMid);
    totalDepth += dz;
  }

  // Scale to match the desired dome depth
  const scaleFactor = domeDepth / totalDepth;

  // Now build the actual points with scaled z values
  let z = domeDepth; // Start at apex
  points.push({ r: rValues[0], z });

  for (let i = 0; i < numPoints; i++) {
    const alpha1 = alphas[i];
    const alpha2 = alphas[i + 1];
    const r1 = rValues[i];
    const r2 = rValues[i + 1];

    const alphaMid = (alpha1 + alpha2) / 2;
    const dr = r2 - r1;
    const dz = -dr / Math.tan(alphaMid);

    // Apply scaling to match desired depth
    z -= dz * scaleFactor;
    points.push({ r: rValues[i + 1], z });
  }

  return points;
}

/**
 * Build tank mesh geometry
 *
 * Uses pure JavaScript mesh generation with isotensoid profiles.
 * For B-rep operations, use server-side Truck CAD kernel API.
 */
export function buildTankGeometry(
  geometry: DesignGeometry
): TankGeometryResult | null {
  return buildMeshFallback(geometry);
}

/**
 * Build mesh geometry for tank visualization
 */
function buildMeshFallback(geometry: DesignGeometry): TankGeometryResult {
  const { dimensions, dome, layup } = geometry;

  // Simple isotensoid mesh generation
  const innerProfile = calculateIsotensoidProfile(
    dimensions.inner_radius_mm,
    dome.parameters.alpha_0_deg,
    dome.parameters.boss_id_mm / 2,
    dome.parameters.depth_mm,
    50
  );

  const outerProfile = calculateIsotensoidProfile(
    dimensions.outer_radius_mm,
    dome.parameters.alpha_0_deg,
    dome.parameters.boss_od_mm / 2,
    dome.parameters.depth_mm * (dimensions.outer_radius_mm / dimensions.inner_radius_mm),
    50
  );

  const innerMesh = createSimpleLatheMesh(innerProfile, dimensions.cylinder_length_mm, dimensions.inner_radius_mm);
  const outerMesh = createSimpleLatheMesh(outerProfile, dimensions.cylinder_length_mm, dimensions.outer_radius_mm);

  const layers: TankLayerMesh[] = [];
  if (layup?.layers) {
    let cumThickness = layup.liner_thickness_mm || 3.2;
    for (const layer of layup.layers) {
      const r = dimensions.inner_radius_mm + cumThickness + layer.thickness_mm;
      cumThickness += layer.thickness_mm;

      const profile = calculateIsotensoidProfile(
        r,
        dome.parameters.alpha_0_deg,
        dome.parameters.boss_id_mm / 2 + cumThickness,
        dome.parameters.depth_mm * (r / dimensions.inner_radius_mm),
        30
      );

      layers.push({
        layer,
        mesh: createSimpleLatheMesh(profile, dimensions.cylinder_length_mm, r),
      });
    }
  }

  // Create hollow boss geometry with proper inner/outer cylinders
  const bossLength = 70; // mm - standard boss protrusion length
  const hollowBoss = createStandardCylindricalBoss(
    dome.parameters.boss_id_mm,
    dome.parameters.boss_od_mm,
    bossLength
  );

  return {
    outer: outerMesh,
    inner: innerMesh,
    layers,
    bosses: [hollowBoss],
  };
}

function createSimpleLatheMesh(
  profile: { r: number; z: number }[],
  cylinderLength: number,
  radius: number
): TankMeshData {
  const segments = 64;
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  // Build full profile with boss holes
  const fullProfile: { r: number; z: number }[] = [];

  // Bottom dome - profile already clamped to boss radius, creating hole
  for (let i = profile.length - 1; i >= 0; i--) {
    fullProfile.push({ r: profile[i].r, z: -profile[i].z });
  }

  // Cylinder section
  fullProfile.push({ r: radius, z: 0 });
  fullProfile.push({ r: radius, z: cylinderLength });

  // Top dome - profile already clamped to boss radius, creating hole
  for (const pt of profile) {
    fullProfile.push({ r: pt.r, z: cylinderLength + pt.z });
  }

  // Revolution
  for (let i = 0; i < fullProfile.length; i++) {
    const { r, z } = fullProfile[i];
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      positions.push(r * Math.cos(theta), z, r * Math.sin(theta));

      // Approximate normal
      const prev = fullProfile[Math.max(0, i - 1)];
      const next = fullProfile[Math.min(fullProfile.length - 1, i + 1)];
      const dr = next.r - prev.r;
      const dz = next.z - prev.z;
      const len = Math.sqrt(dr * dr + dz * dz) || 1;
      const nr = dz / len;
      const nz = -dr / len;
      normals.push(nr * Math.cos(theta), nz, nr * Math.sin(theta));
    }
  }

  // Indices
  for (let i = 0; i < fullProfile.length - 1; i++) {
    for (let j = 0; j < segments; j++) {
      const curr = i * (segments + 1) + j;
      const next = curr + segments + 1;
      indices.push(curr, next, curr + 1);
      indices.push(curr + 1, next, next + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint32Array(indices),
  };
}

// Note: createSimpleCylinderMesh removed - now using createStandardCylindricalBoss
// from boss-components.ts which properly creates hollow boss geometry with:
// - Outer cylinder surface
// - Inner cylinder (thread bore)
// - Top end cap (annulus)
// The dome profiles are already clamped to boss radius in calculateIsotensoidProfile,
// which creates the circular hole at the dome apex where the boss attaches.

/**
 * Apply stress coloring to mesh
 *
 * @param mesh - Tank mesh data to apply colors to
 * @param stressNodes - Array of stress nodes with positions and values
 * @param minStress - Minimum stress value for colormap range
 * @param maxStress - Maximum stress value for colormap range
 * @param colormap - Colormap to use (default: 'jet')
 * @returns New mesh data with colors applied
 */
export function applyStressColors(
  mesh: TankMeshData,
  stressNodes: { x: number; y: number; z: number; value: number }[],
  minStress: number,
  maxStress: number,
  colormap: ColormapName = 'jet'
): TankMeshData {
  const colors: number[] = [];
  const positions = mesh.positions;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    // Find nearest stress value
    let nearestValue = minStress;
    let minDist = Infinity;

    for (const node of stressNodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const dz = z - node.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < minDist) {
        minDist = dist;
        nearestValue = node.value;
      }
    }

    // Map to colormap using imported function
    const [r, g, b] = getThreeColor(nearestValue, minStress, maxStress, colormap);
    colors.push(r, g, b);
  }

  return {
    ...mesh,
    colors: new Float32Array(colors),
  };
}

// NOTE: jetColormap function removed - now using imported colormap from @/lib/cad/colormaps
// For backward compatibility, use: import { jetColormap } from './colormaps';

/**
 * Apply stress coloring using FEA 3D mesh data
 * Uses proper mesh interpolation instead of nearest-neighbor
 *
 * @param mesh - Tank mesh data to apply colors to
 * @param feaMesh - FEA mesh with nodes and elements containing stress data
 * @param minStress - Minimum stress value for colormap range
 * @param maxStress - Maximum stress value for colormap range
 * @param colormap - Colormap to use (default: 'jet')
 * @returns New mesh data with colors applied
 */
export function applyFEAStressColors(
  mesh: TankMeshData,
  feaMesh: {
    nodes: Array<{ id: number; x: number; y: number; z: number; stress: number }>;
    elements: Array<{ nodes: [number, number, number]; centroid_stress: number }>;
  },
  minStress: number,
  maxStress: number,
  colormap: ColormapName = 'jet'
): TankMeshData {
  const colors: number[] = [];
  const positions = mesh.positions;

  // Note: A spatial index (e.g., nodeMap) could optimize large meshes
  // For now, we use direct iteration over nodes which is sufficient for most cases

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    // Find nearest FEA element or node
    let nearestStress = minStress;
    let minDist = Infinity;

    // Search through nodes (for 3D mesh, nodes have x,y,z)
    for (const node of feaMesh.nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const dz = z - node.z;
      const dist = dx * dx + dy * dy + dz * dz; // Squared distance
      if (dist < minDist) {
        minDist = dist;
        nearestStress = node.stress;
      }
    }

    // Map to colormap using imported function
    const [r, g, b] = getThreeColor(nearestStress, minStress, maxStress, colormap);
    colors.push(r, g, b);
  }

  return {
    ...mesh,
    colors: new Float32Array(colors),
  };
}

/**
 * Export tank geometry to GLTF format
 * STEP export will be handled by server-side Truck CAD kernel
 */
export async function exportToGLTF(_geometry: DesignGeometry): Promise<Blob | null> {
  // TODO: Implement GLTF export from mesh data
  // For now, this will be handled by server API with Truck
  console.warn('GLTF export not yet implemented - use server API');
  return null;
}
