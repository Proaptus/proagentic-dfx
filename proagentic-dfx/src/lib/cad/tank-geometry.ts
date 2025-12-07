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

export interface TankMeshData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  colors?: Float32Array;
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
 * @param R0 - Cylinder radius (mm)
 * @param alpha0Deg - Winding angle at cylinder (degrees), typically 54.74 from netting theory
 * @param bossRadius - Boss opening radius (mm)
 * @param domeDepth - Target dome depth (mm)
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

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints; // 0 at apex, 1 at cylinder

    // Alpha varies from 90deg at apex to alpha0 at cylinder
    const alpha = alpha0 + (Math.PI / 2 - alpha0) * (1 - t);

    // Isotensoid equation: r = R0 * sin(alpha0) / sin(alpha)
    let r = R0 * Math.sin(alpha0) / Math.sin(alpha);

    // Clamp minimum radius to boss radius
    r = Math.max(r, bossRadius);

    // Z position (dome depth scales with t)
    const z = domeDepth * (1 - t);

    points.push({ r, z });
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

  return {
    outer: outerMesh,
    inner: innerMesh,
    layers,
    bosses: [createSimpleCylinderMesh(dome.parameters.boss_id_mm / 2, dome.parameters.boss_od_mm / 2, 70)],
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

  // Build full profile
  const fullProfile: { r: number; z: number }[] = [];

  // Bottom dome
  for (let i = profile.length - 1; i >= 0; i--) {
    fullProfile.push({ r: profile[i].r, z: -profile[i].z });
  }

  // Cylinder
  fullProfile.push({ r: radius, z: 0 });
  fullProfile.push({ r: radius, z: cylinderLength });

  // Top dome
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

function createSimpleCylinderMesh(innerRadius: number, outerRadius: number, length: number): TankMeshData {
  const segments = 32;
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= 1; i++) {
    const y = i * length;
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      positions.push(outerRadius * Math.cos(theta), y, outerRadius * Math.sin(theta));
      normals.push(Math.cos(theta), 0, Math.sin(theta));
    }
  }

  for (let j = 0; j < segments; j++) {
    const curr = j;
    const next = curr + segments + 1;
    indices.push(curr, next, curr + 1);
    indices.push(curr + 1, next, next + 1);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint32Array(indices),
  };
}

/**
 * Apply stress coloring to mesh
 */
export function applyStressColors(
  mesh: TankMeshData,
  stressNodes: { x: number; y: number; z: number; value: number }[],
  minStress: number,
  maxStress: number
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

    // Map to jet colormap
    const t = (nearestValue - minStress) / (maxStress - minStress || 1);
    const color = jetColormap(t);
    colors.push(color.r, color.g, color.b);
  }

  return {
    ...mesh,
    colors: new Float32Array(colors),
  };
}

/**
 * Jet colormap (blue -> cyan -> green -> yellow -> red)
 */
function jetColormap(t: number): { r: number; g: number; b: number } {
  let r = 0, g = 0, b = 0;

  if (t < 0.25) {
    r = 0;
    g = 4 * t;
    b = 1;
  } else if (t < 0.5) {
    r = 0;
    g = 1;
    b = 1 - 4 * (t - 0.25);
  } else if (t < 0.75) {
    r = 4 * (t - 0.5);
    g = 1;
    b = 0;
  } else {
    r = 1;
    g = 1 - 4 * (t - 0.75);
    b = 0;
  }

  return { r, g, b };
}

/**
 * Export tank geometry to GLTF format
 * STEP export will be handled by server-side Truck CAD kernel
 */
export async function exportToGLTF(geometry: DesignGeometry): Promise<Blob | null> {
  // TODO: Implement GLTF export from mesh data
  // For now, this will be handled by server API with Truck
  console.warn('GLTF export not yet implemented - use server API');
  return null;
}
