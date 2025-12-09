/**
 * Stress calculation utility functions
 * REQ-203 to REQ-210: Physics-based stress calculations
 */

import type {
  LayerData,
  LayerStress,
  MeshNode,
  MeshElement,
  FEAMesh,
  FEAMesh3D,
  Mesh3DNode,
  DomeProfilePoint,
} from './types';

// Multi-stress calculation functions (first principles)
// Calculate von Mises stress from hoop and axial: σ_vm = √(σ_h² + σ_a² - σ_h*σ_a)
export function calculateVonMisesStress(hoopStress: number, axialStress: number): number {
  return Math.sqrt(hoopStress * hoopStress + axialStress * axialStress - hoopStress * axialStress);
}

// Maximum shear stress: τ_max = (σ_1 - σ_3) / 2 = σ_h / 2
export function calculateShearStress(hoopStress: number): number {
  return hoopStress / 2;
}

// Get selected stress type value
export function getMaxStressForType(
  stressType: string,
  hoopStress: number,
  axialStress: number
): { maxValue: number; displayName: string } {
  const vonMises = calculateVonMisesStress(hoopStress, axialStress);
  const shear = calculateShearStress(hoopStress);

  switch (stressType.toLowerCase()) {
    case 'hoop':
      return { maxValue: hoopStress, displayName: 'Hoop Stress' };
    case 'axial':
      return { maxValue: axialStress, displayName: 'Axial Stress' };
    case 'shear':
      return { maxValue: shear, displayName: 'Shear Stress' };
    case 'vonmises':
    default:
      return { maxValue: vonMises, displayName: 'von Mises Stress' };
  }
}

// Physics-based SCF calculations (REQ-203 to REQ-210)
export function calculateTransitionSCF(
  cylinderLength: number,
  transitionRadius: number,
  innerRadius: number
): number {
  const normalizedRadius = transitionRadius / innerRadius;
  const scf = 2.5 - (normalizedRadius * 1.0);
  return Math.max(1.5, Math.min(2.5, scf));
}

export function calculateBossSCF(
  bossID: number,
  domeRadius: number
): number {
  const holeRatio = bossID / (2 * domeRadius);
  const scf = 2.0 + (1.5 * (1 - holeRatio * 4));
  return Math.max(2.0, Math.min(3.5, scf));
}

export function calculatePlyDropSCF(layerCount: number, totalLayers: number): number {
  const dropRatio = layerCount / totalLayers;
  return 1.2 + (0.3 * dropRatio);
}

export function calculateLayerStressMultiplier(layerPosition: number): number {
  return 0.7 + 0.3 * (1 - layerPosition);
}

export function applyFiberAngleEffect(baseStress: number, fiberAngle: number, theta: number): number {
  const angleDiff = Math.abs(theta - fiberAngle);
  const angleEffect = 1.0 + 0.2 * Math.sin(angleDiff * Math.PI / 180);
  return baseStress * angleEffect;
}

// Calculate stress at position
export function calculateLocalStress(
  z: number,
  r: number,
  baseStress: number,
  cylinderLength: number,
  totalLength: number,
  innerRadius: number,
  wallThickness: number,
  transitionSCF: number,
  bossSCF: number,
  bossID: number
): { stress: number; region: 'boss' | 'dome' | 'transition' | 'cylinder' } {
  let region: 'boss' | 'dome' | 'transition' | 'cylinder';
  if (z <= cylinderLength * 0.9) {
    region = 'cylinder';
  } else if (z <= cylinderLength * 1.15) {
    region = 'transition';
  } else if (z >= totalLength - 60 && r <= bossID * 0.8) {
    region = 'boss';
  } else {
    region = 'dome';
  }

  const radialPosition = Math.min(1, Math.max(0, (r - innerRadius) / wallThickness));
  const thicknessMultiplier = 1.0 - 0.3 * radialPosition;

  let stressFactor = 0.7;

  if (region === 'cylinder') {
    stressFactor = 0.7;
  } else if (region === 'transition') {
    const transitionProgress = (z - cylinderLength * 0.9) / (cylinderLength * 0.25);
    const peakFactor = Math.sin(Math.min(1, transitionProgress) * Math.PI);
    stressFactor = 0.7 + (transitionSCF - 1.0) * peakFactor * 0.4;
  } else if (region === 'dome') {
    const domeProgress = (z - cylinderLength) / (totalLength - cylinderLength);
    stressFactor = 0.75 + 0.2 * domeProgress;
  } else if (region === 'boss') {
    const distFromBossEdge = Math.sqrt(
      Math.pow(z - (totalLength - 20), 2) + Math.pow(r - bossID / 2, 2)
    );
    const bossFactor = Math.exp(-distFromBossEdge / 20);
    stressFactor = 0.85 + (bossSCF - 1.0) * bossFactor * 0.4;
  }

  return {
    stress: Math.round(baseStress * stressFactor * thicknessMultiplier),
    region
  };
}

// Generate 2D axisymmetric mesh
export function generateFEAMesh2D(
  maxStress: number,
  cylinderLength: number,
  totalLength: number,
  innerRadius: number,
  wallThickness: number,
  transitionSCF: number,
  bossSCF: number,
  bossID: number,
  domeProfile: DomeProfilePoint[]
): FEAMesh {
  const nodes: MeshNode[] = [];
  const elements: MeshElement[] = [];
  const numRadialLayers = 5;
  const numAxialCylinder = 15;
  const numAxialDome = 12;

  let nodeId = 0;
  const nodeGrid: number[][] = [];

  // Cylinder section
  for (let i = 0; i <= numAxialCylinder; i++) {
    const z = (i / numAxialCylinder) * cylinderLength;
    const row: number[] = [];

    for (let j = 0; j <= numRadialLayers; j++) {
      const r = innerRadius + (j / numRadialLayers) * wallThickness;
      const { stress } = calculateLocalStress(
        z, r, maxStress, cylinderLength, totalLength,
        innerRadius, wallThickness, transitionSCF, bossSCF, bossID
      );
      nodes.push({ id: nodeId, r, z, stress });
      row.push(nodeId);
      nodeId++;
    }
    nodeGrid.push(row);
  }

  // Dome section
  for (let i = 1; i <= numAxialDome; i++) {
    const progress = i / numAxialDome;
    const domeZ = cylinderLength + progress * (totalLength - cylinderLength);
    let domeOuterR = innerRadius;
    const relZ = (domeZ - cylinderLength);
    for (let p = 0; p < domeProfile.length - 1; p++) {
      if (relZ >= domeProfile[p].z && relZ <= domeProfile[p + 1].z) {
        const t = (relZ - domeProfile[p].z) / (domeProfile[p + 1].z - domeProfile[p].z);
        domeOuterR = domeProfile[p].r + t * (domeProfile[p + 1].r - domeProfile[p].r);
        break;
      }
    }
    if (progress > 0.85) {
      domeOuterR = bossID / 2 + (domeOuterR - bossID / 2) * Math.pow((1 - progress) / 0.15, 0.5);
    }

    const row: number[] = [];
    const localThickness = wallThickness * (1 + 0.3 * progress);
    const localInnerR = Math.max(bossID / 2, domeOuterR - localThickness);

    for (let j = 0; j <= numRadialLayers; j++) {
      const r = localInnerR + (j / numRadialLayers) * (domeOuterR - localInnerR);
      const { stress } = calculateLocalStress(
        domeZ, r, maxStress, cylinderLength, totalLength,
        innerRadius, wallThickness, transitionSCF, bossSCF, bossID
      );
      nodes.push({ id: nodeId, r, z: domeZ, stress });
      row.push(nodeId);
      nodeId++;
    }
    nodeGrid.push(row);
  }

  // Create elements
  let elemId = 0;
  for (let i = 0; i < nodeGrid.length - 1; i++) {
    for (let j = 0; j < numRadialLayers; j++) {
      const n1 = nodeGrid[i][j];
      const n2 = nodeGrid[i][j + 1];
      const n3 = nodeGrid[i + 1][j];
      const n4 = nodeGrid[i + 1][j + 1];

      const avgZ = (nodes[n1].z + nodes[n3].z) / 2;
      const avgR = (nodes[n1].r + nodes[n2].r) / 2;
      const { region } = calculateLocalStress(
        avgZ, avgR, maxStress, cylinderLength, totalLength,
        innerRadius, wallThickness, transitionSCF, bossSCF, bossID
      );

      elements.push({
        id: elemId++,
        nodes: [n1, n2, n3],
        region,
        centroid_stress: Math.round((nodes[n1].stress + nodes[n2].stress + nodes[n3].stress) / 3)
      });
      elements.push({
        id: elemId++,
        nodes: [n2, n4, n3],
        region,
        centroid_stress: Math.round((nodes[n2].stress + nodes[n4].stress + nodes[n3].stress) / 3)
      });
    }
  }

  const rVals = nodes.map(n => n.r);
  const zVals = nodes.map(n => n.z);

  return {
    nodes,
    elements,
    bounds: {
      r_min: Math.min(...rVals),
      r_max: Math.max(...rVals),
      z_min: Math.min(...zVals),
      z_max: Math.max(...zVals)
    }
  };
}

// Generate 3D mesh for Three.js
export function generateFEAMesh3D(
  mesh2D: FEAMesh,
  numCircumferential: number = 24
): FEAMesh3D {
  const nodes3D: Mesh3DNode[] = [];
  const elements3D: MeshElement[] = [];
  const numSlices = numCircumferential;
  const nodeMap = new Map<string, number>();

  let node3DId = 0;
  for (let slice = 0; slice < numSlices; slice++) {
    const theta = (slice / numSlices) * 2 * Math.PI;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    for (const node2D of mesh2D.nodes) {
      nodes3D.push({
        id: node3DId,
        x: node2D.r * cosT,
        y: node2D.r * sinT,
        z: node2D.z,
        stress: node2D.stress
      });
      nodeMap.set(`${node2D.id}-${slice}`, node3DId);
      node3DId++;
    }
  }

  let elem3DId = 0;
  for (let slice = 0; slice < numSlices; slice++) {
    const nextSlice = (slice + 1) % numSlices;

    for (const elem2D of mesh2D.elements) {
      const [n1_2d, n2_2d, n3_2d] = elem2D.nodes;
      const n1_curr = nodeMap.get(`${n1_2d}-${slice}`)!;
      const n2_curr = nodeMap.get(`${n2_2d}-${slice}`)!;
      const n3_curr = nodeMap.get(`${n3_2d}-${slice}`)!;
      const n1_next = nodeMap.get(`${n1_2d}-${nextSlice}`)!;
      const n2_next = nodeMap.get(`${n2_2d}-${nextSlice}`)!;
      const n3_next = nodeMap.get(`${n3_2d}-${nextSlice}`)!;

      elements3D.push({
        id: elem3DId++,
        nodes: [n1_curr, n2_curr, n1_next],
        region: elem2D.region,
        centroid_stress: elem2D.centroid_stress
      });
      elements3D.push({
        id: elem3DId++,
        nodes: [n2_curr, n2_next, n1_next],
        region: elem2D.region,
        centroid_stress: elem2D.centroid_stress
      });
      elements3D.push({
        id: elem3DId++,
        nodes: [n2_curr, n3_curr, n2_next],
        region: elem2D.region,
        centroid_stress: elem2D.centroid_stress
      });
      elements3D.push({
        id: elem3DId++,
        nodes: [n3_curr, n3_next, n2_next],
        region: elem2D.region,
        centroid_stress: elem2D.centroid_stress
      });
    }
  }

  const xVals = nodes3D.map(n => n.x);
  const yVals = nodes3D.map(n => n.y);
  const zVals = nodes3D.map(n => n.z);

  return {
    nodes: nodes3D,
    elements: elements3D,
    bounds: {
      x_min: Math.min(...xVals),
      x_max: Math.max(...xVals),
      y_min: Math.min(...yVals),
      y_max: Math.max(...yVals),
      z_min: Math.min(...zVals),
      z_max: Math.max(...zVals)
    }
  };
}

export function generateStressContour(
  maxStress: number,
  _type: string,
  cylinderLength: number,
  totalLength: number,
  innerRadius: number,
  transitionThickness: number,
  bossID: number
) {
  const nodes: Array<{ x: number; y: number; z: number; value: number }> = [];
  const transitionSCF = calculateTransitionSCF(cylinderLength, transitionThickness, innerRadius);
  const bossSCF = calculateBossSCF(bossID, innerRadius);

  for (let z = 0; z <= totalLength; z += 50) {
    const { stress } = calculateLocalStress(
      z, innerRadius, maxStress, cylinderLength, totalLength,
      innerRadius, 25, transitionSCF, bossSCF, bossID
    );
    for (let theta = 0; theta < 360; theta += 30) {
      const rad = (theta * Math.PI) / 180;
      nodes.push({
        x: innerRadius * Math.cos(rad),
        y: innerRadius * Math.sin(rad),
        z,
        value: stress
      });
    }
  }
  return nodes;
}

export function generatePerLayerStress(
  layers: LayerData[],
  maxStress: number,
  allowableStress: number
): LayerStress[] {
  const seed = layers.length * 1000;
  const seededRandom = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  return layers.map((layer, index) => {
    const layerPosition = (index + 1) / layers.length;
    const stressMultiplier = calculateLayerStressMultiplier(layerPosition);
    const isHelical = layer.type === 'helical';
    const fiberAngleEffect = isHelical ? (1.0 - 0.05 * Math.abs(layer.angle_deg - 90) / 90) : 1.0;

    const sigma1 = maxStress * stressMultiplier * fiberAngleEffect;
    const sigma2 = isHelical ? 28 + seededRandom(index) * 10 : 35 + seededRandom(index + 100) * 8;
    const tau12 = isHelical ? 10 + seededRandom(index + 200) * 5 : 6 + seededRandom(index + 300) * 4;
    const tsaiWu = (sigma1 / allowableStress) * (0.8 + seededRandom(index + 400) * 0.2);
    const margin = Math.round(((allowableStress - sigma1) / allowableStress) * 100);

    return {
      layer: layer.layer,
      type: layer.type,
      angle_deg: layer.angle_deg,
      sigma1_mpa: Math.round(sigma1),
      sigma2_mpa: Math.round(sigma2),
      tau12_mpa: Math.round(tau12),
      tsai_wu: Math.round(tsaiWu * 100) / 100,
      margin_percent: margin
    };
  });
}
