/**
 * Boss/Port Component Geometries
 *
 * Bosses are the reinforced openings at tank ends for valves, fittings, and fill ports.
 * Critical for structural integrity and manufacturing (winding termination points).
 */

export enum BossType {
  STANDARD_CYLINDRICAL = 'STANDARD_CYLINDRICAL',
  INTEGRATED = 'INTEGRATED',
  FLANGED = 'FLANGED',
  MULTI_PORT = 'MULTI_PORT',
}

export interface BossGeometry {
  type: BossType;
  innerDiameter: number; // mm
  outerDiameter: number; // mm
  length: number; // mm (protrusion from dome)
  threadType?: string; // e.g., "NPT 1/2", "M16x1.5"
  flangeThickness?: number; // mm (for flanged type)
  flangeDiameter?: number; // mm
  numberOfPorts?: number; // For multi-port
  portPositions?: Array<{ angle: number; offset: number }>; // deg, mm
}

export interface BossMeshData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  color: [number, number, number];
}

/**
 * Standard Cylindrical Boss
 *
 * Most common type - simple cylinder protruding from dome apex
 * Used for single valve connection points
 */
export function createStandardCylindricalBoss(
  innerDiameter: number,
  outerDiameter: number,
  length: number,
  segments: number = 32
): BossMeshData {
  const innerRadius = innerDiameter / 2;
  const outerRadius = outerDiameter / 2;

  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  // Outer cylinder surface
  for (let i = 0; i <= 1; i++) {
    const y = i * length;
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      const x = outerRadius * Math.cos(theta);
      const z = outerRadius * Math.sin(theta);
      positions.push(x, y, z);
      normals.push(Math.cos(theta), 0, Math.sin(theta));
    }
  }

  // Outer cylinder indices
  for (let j = 0; j < segments; j++) {
    const curr = j;
    const next = curr + segments + 1;
    indices.push(curr, next, curr + 1);
    indices.push(curr + 1, next, next + 1);
  }

  const outerVertCount = (segments + 1) * 2;

  // Inner cylinder surface
  for (let i = 0; i <= 1; i++) {
    const y = i * length;
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      const x = innerRadius * Math.cos(theta);
      const z = innerRadius * Math.sin(theta);
      positions.push(x, y, z);
      normals.push(-Math.cos(theta), 0, -Math.sin(theta));
    }
  }

  // Inner cylinder indices
  const innerStart = outerVertCount;
  for (let j = 0; j < segments; j++) {
    const curr = innerStart + j;
    const next = curr + segments + 1;
    indices.push(curr, curr + 1, next);
    indices.push(curr + 1, next + 1, next);
  }

  // Top end cap (annulus)
  const topCapStart = positions.length / 3;
  for (let j = 0; j <= segments; j++) {
    const theta = (j / segments) * Math.PI * 2;
    // Outer ring
    positions.push(outerRadius * Math.cos(theta), length, outerRadius * Math.sin(theta));
    normals.push(0, 1, 0);
    // Inner ring
    positions.push(innerRadius * Math.cos(theta), length, innerRadius * Math.sin(theta));
    normals.push(0, 1, 0);
  }

  // Top cap indices
  for (let j = 0; j < segments; j++) {
    const outer1 = topCapStart + j * 2;
    const inner1 = outer1 + 1;
    const outer2 = outer1 + 2;
    const inner2 = inner1 + 2;
    indices.push(outer1, outer2, inner1);
    indices.push(inner1, outer2, inner2);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint32Array(indices),
    color: [0.122, 0.161, 0.216], // Dark metallic
  };
}

/**
 * Integrated Boss
 *
 * Boss is integral part of liner/dome - no separate component
 * Common in Type IV tanks with rotomolded liners
 */
export function createIntegratedBoss(
  innerDiameter: number,
  outerDiameter: number,
  length: number,
  taperAngle: number = 15, // degrees
  segments: number = 32
): BossMeshData {
  const innerRadius = innerDiameter / 2;
  const outerRadius = outerDiameter / 2;
  const taperRad = (taperAngle * Math.PI) / 180;

  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  // Tapered outer surface
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const y = t * length;
    const currentRadius = outerRadius - (outerRadius * 0.3 * t * Math.tan(taperRad));

    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      const x = currentRadius * Math.cos(theta);
      const z = currentRadius * Math.sin(theta);
      positions.push(x, y, z);

      // Compute normal for tapered surface
      const nx = Math.cos(theta);
      const ny = Math.tan(taperRad);
      const nz = Math.sin(theta);
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      normals.push(nx / len, ny / len, nz / len);
    }
  }

  // Build indices for tapered surface
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < segments; j++) {
      const curr = i * (segments + 1) + j;
      const next = curr + segments + 1;
      indices.push(curr, next, curr + 1);
      indices.push(curr + 1, next, next + 1);
    }
  }

  // Inner bore (simple cylinder)
  const innerStart = positions.length / 3;
  for (let i = 0; i <= 1; i++) {
    const y = i * length;
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      positions.push(innerRadius * Math.cos(theta), y, innerRadius * Math.sin(theta));
      normals.push(-Math.cos(theta), 0, -Math.sin(theta));
    }
  }

  for (let j = 0; j < segments; j++) {
    const curr = innerStart + j;
    const next = curr + segments + 1;
    indices.push(curr, curr + 1, next);
    indices.push(curr + 1, next + 1, next);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint32Array(indices),
    color: [0.4, 0.42, 0.45], // Lighter gray for integrated
  };
}

/**
 * Flanged Boss
 *
 * Boss with mounting flange for bolted connections
 * Common for service/inspection ports
 */
export function createFlangedBoss(
  innerDiameter: number,
  outerDiameter: number,
  length: number,
  flangeDiameter: number,
  flangeThickness: number,
  boltCircleDiameter?: number,
  numberOfBolts?: number,
  segments: number = 32
): BossMeshData {
  // Start with standard cylindrical boss
  const baseBoss = createStandardCylindricalBoss(innerDiameter, outerDiameter, length, segments);

  const positions = Array.from(baseBoss.positions);
  const normals = Array.from(baseBoss.normals);
  const indices = Array.from(baseBoss.indices);

  const flangeRadius = flangeDiameter / 2;
  const boltRadius = boltCircleDiameter ? boltCircleDiameter / 2 : flangeRadius * 0.8;
  const bolts = numberOfBolts || 6;

  // Add flange disk at top
  const flangeStart = positions.length / 3;
  const flangeY = length;

  // Flange outer edge
  for (let j = 0; j <= segments; j++) {
    const theta = (j / segments) * Math.PI * 2;
    // Top surface
    positions.push(flangeRadius * Math.cos(theta), flangeY, flangeRadius * Math.sin(theta));
    normals.push(0, 1, 0);
  }

  // Flange inner edge (connects to boss outer diameter)
  const bossOuterRadius = outerDiameter / 2;
  for (let j = 0; j <= segments; j++) {
    const theta = (j / segments) * Math.PI * 2;
    positions.push(bossOuterRadius * Math.cos(theta), flangeY, bossOuterRadius * Math.sin(theta));
    normals.push(0, 1, 0);
  }

  // Flange top surface indices (annulus)
  for (let j = 0; j < segments; j++) {
    const outer = flangeStart + j;
    const inner = flangeStart + segments + 1 + j;
    indices.push(outer, inner, outer + 1);
    indices.push(outer + 1, inner, inner + 1);
  }

  // Flange outer edge (vertical surface)
  const flangeEdgeStart = positions.length / 3;
  for (let i = 0; i <= 1; i++) {
    const y = flangeY - i * flangeThickness;
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      positions.push(flangeRadius * Math.cos(theta), y, flangeRadius * Math.sin(theta));
      normals.push(Math.cos(theta), 0, Math.sin(theta));
    }
  }

  for (let j = 0; j < segments; j++) {
    const curr = flangeEdgeStart + j;
    const next = curr + segments + 1;
    indices.push(curr, next, curr + 1);
    indices.push(curr + 1, next, next + 1);
  }

  // Add bolt holes (simplified as small cylinders)
  if (numberOfBolts) {
    const boltHoleRadius = 4; // mm
    for (let i = 0; i < bolts; i++) {
      const boltAngle = (i / bolts) * Math.PI * 2;
      const boltX = boltRadius * Math.cos(boltAngle);
      const boltZ = boltRadius * Math.sin(boltAngle);

      // Simple representation - 4 points per hole
      const holeStart = positions.length / 3;
      const holeSegs = 8;
      for (let h = 0; h <= holeSegs; h++) {
        const hTheta = (h / holeSegs) * Math.PI * 2;
        const hx = boltX + boltHoleRadius * Math.cos(hTheta);
        const hz = boltZ + boltHoleRadius * Math.sin(hTheta);
        positions.push(hx, flangeY, hz);
        normals.push(0, 1, 0);
      }

      // Connect hole points (triangle fan)
      for (let h = 0; h < holeSegs; h++) {
        indices.push(holeStart, holeStart + h + 1, holeStart + h + 2);
      }
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint32Array(indices),
    color: [0.122, 0.161, 0.216],
  };
}

/**
 * Multi-Port Boss
 *
 * Boss with multiple offset ports for manifolded connections
 * Used in advanced tank designs for separate fill, vent, pressure relief
 */
export function createMultiPortBoss(
  mainPort: { id: number; od: number; length: number },
  auxiliaryPorts: Array<{ id: number; od: number; length: number; angle: number; radialOffset: number }>,
  segments: number = 24
): BossMeshData {
  // Start with main boss
  const mainBoss = createStandardCylindricalBoss(mainPort.id, mainPort.od, mainPort.length, segments);

  const positions = Array.from(mainBoss.positions);
  const normals = Array.from(mainBoss.normals);
  const indices = Array.from(mainBoss.indices);

  // Add auxiliary ports
  for (const auxPort of auxiliaryPorts) {
    const auxBoss = createStandardCylindricalBoss(auxPort.id, auxPort.od, auxPort.length, segments / 2);

    // Transform auxiliary boss to angled position
    const angleRad = (auxPort.angle * Math.PI) / 180;
    const offsetX = auxPort.radialOffset * Math.cos(angleRad);
    const offsetZ = auxPort.radialOffset * Math.sin(angleRad);
    const offsetY = mainPort.length * 0.5; // Mount halfway up main boss

    const baseIndex = positions.length / 3;

    for (let i = 0; i < auxBoss.positions.length; i += 3) {
      positions.push(
        auxBoss.positions[i] + offsetX,
        auxBoss.positions[i + 1] + offsetY,
        auxBoss.positions[i + 2] + offsetZ
      );
      normals.push(auxBoss.normals[i], auxBoss.normals[i + 1], auxBoss.normals[i + 2]);
    }

    for (let i = 0; i < auxBoss.indices.length; i++) {
      indices.push(auxBoss.indices[i] + baseIndex);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint32Array(indices),
    color: [0.122, 0.161, 0.216],
  };
}

/**
 * Get boss geometry specification
 */
export function getBossGeometry(type: BossType, params: Record<string, number>): BossMeshData {
  switch (type) {
    case BossType.STANDARD_CYLINDRICAL:
      return createStandardCylindricalBoss(
        params.innerDiameter || 20,
        params.outerDiameter || 40,
        params.length || 60
      );
    case BossType.INTEGRATED:
      return createIntegratedBoss(
        params.innerDiameter || 20,
        params.outerDiameter || 40,
        params.length || 60,
        params.taperAngle || 15
      );
    case BossType.FLANGED:
      return createFlangedBoss(
        params.innerDiameter || 20,
        params.outerDiameter || 40,
        params.length || 60,
        params.flangeDiameter || 80,
        params.flangeThickness || 10,
        params.boltCircleDiameter,
        params.numberOfBolts ? Math.round(params.numberOfBolts) : undefined
      );
    case BossType.MULTI_PORT:
      // Simplified - would need more complex params
      return createStandardCylindricalBoss(
        params.innerDiameter || 20,
        params.outerDiameter || 40,
        params.length || 60
      );
    default:
      return createStandardCylindricalBoss(20, 40, 60);
  }
}
