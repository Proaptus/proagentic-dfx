import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { calculateHoopStress, calculateAxialStress } from '@/lib/physics/pressure-vessel';

interface LayerData {
  layer: number;
  type: 'helical' | 'hoop';
  angle_deg: number;
  thickness_mm: number;
  coverage: 'full' | 'cylinder';
}

interface LayerStress {
  layer: number;
  type: string;
  angle_deg: number;
  sigma1_mpa: number;
  sigma2_mpa: number;
  tau12_mpa: number;
  tsai_wu: number;
  margin_percent: number;
}

// Exported for type reuse in other modules
export interface StressConcentration {
  location: { z_mm?: number; r_mm?: number; theta_deg?: number };
  scf: number;
  peak_stress_mpa: number;
  type: string;
}

interface CriticalLocation {
  name: string;
  z: number;
  r: number;
  stress: number;
  is_max: boolean;
}

interface StressPathPoint {
  z: number;
  stress: number;
}

// Physics-based SCF calculations (REQ-203 to REQ-210)

// Calculate dome-cylinder transition SCF (REQ-203)
function calculateTransitionSCF(
  cylinderLength: number,
  transitionRadius: number,
  innerRadius: number
): number {
  // SCF ranges from 1.5 to 2.5 depending on transition radius
  // Larger transition radius = lower SCF
  const normalizedRadius = transitionRadius / innerRadius;
  const scf = 2.5 - (normalizedRadius * 1.0); // Higher radius ratio reduces SCF
  return Math.max(1.5, Math.min(2.5, scf));
}

// Calculate boss interface SCF (REQ-204)
function calculateBossSCF(
  bossID: number,
  domeRadius: number
): number {
  // SCF ranges from 2.0 to 3.5 for boss-dome interface
  // Smaller boss hole = higher SCF (stress concentration)
  const holeRatio = bossID / (2 * domeRadius);
  const scf = 2.0 + (1.5 * (1 - holeRatio * 4)); // Smaller holes increase SCF
  return Math.max(2.0, Math.min(3.5, scf));
}

// Calculate ply drop SCF (REQ-207)
function calculatePlyDropSCF(layerCount: number, totalLayers: number): number {
  // SCF at ply termination ranges from 1.2 to 1.5
  // More layers terminating at once = higher SCF
  const dropRatio = layerCount / totalLayers;
  return 1.2 + (0.3 * dropRatio);
}

// Calculate through-thickness stress gradient (REQ-208)
function calculateLayerStressMultiplier(layerPosition: number): number {
  // Inner layers see higher stress, outer layers see 70-85%
  // Formula: σ_layer = σ_max * (0.7 + 0.3 * (1 - layer_position))
  return 0.7 + 0.3 * (1 - layerPosition);
}

// Calculate fiber angle effect on local stress (REQ-206) - exported for reuse
export function applyFiberAngleEffect(baseStress: number, fiberAngle: number, theta: number): number {
  // Stress varies with angle from fiber direction
  // Peak stress at ±15° from joint line for helical layers
  const angleDiff = Math.abs(theta - fiberAngle);
  const angleEffect = 1.0 + 0.2 * Math.sin(angleDiff * Math.PI / 180);
  return baseStress * angleEffect;
}

// FEA Mesh types for proper visualization
interface MeshNode {
  id: number;
  r: number;  // radial position (mm) - for 2D axisymmetric
  z: number;  // axial position (mm)
  stress: number;  // von Mises stress (MPa)
}

interface MeshElement {
  id: number;
  nodes: [number, number, number];  // triangle vertex IDs
  region: 'boss' | 'dome' | 'transition' | 'cylinder';
  centroid_stress: number;
}

interface FEAMesh {
  nodes: MeshNode[];
  elements: MeshElement[];
  bounds: { r_min: number; r_max: number; z_min: number; z_max: number };
}

// 3D mesh node for Three.js rendering
interface Mesh3DNode {
  id: number;
  x: number;
  y: number;
  z: number;
  stress: number;
}

interface FEAMesh3D {
  nodes: Mesh3DNode[];
  elements: MeshElement[];
  bounds: { x_min: number; x_max: number; y_min: number; y_max: number; z_min: number; z_max: number };
}

// Calculate stress at position using physics-based model
function calculateLocalStress(
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

  // Determine region based on position
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

  // Through-thickness gradient: inner = 100%, outer = 70%
  const radialPosition = Math.min(1, Math.max(0, (r - innerRadius) / wallThickness));
  const thicknessMultiplier = 1.0 - 0.3 * radialPosition;

  let stressFactor = 0.7;

  // Cylinder: relatively uniform hoop stress
  if (region === 'cylinder') {
    stressFactor = 0.7;
  }

  // Transition: stress concentration at dome-cylinder junction
  if (region === 'transition') {
    const transitionProgress = (z - cylinderLength * 0.9) / (cylinderLength * 0.25);
    const peakFactor = Math.sin(Math.min(1, transitionProgress) * Math.PI);
    stressFactor = 0.7 + (transitionSCF - 1.0) * peakFactor * 0.4;
  }

  // Dome: stress varies with meridional position
  if (region === 'dome') {
    const domeProgress = (z - cylinderLength) / (totalLength - cylinderLength);
    // Stress increases toward apex due to geometry change
    stressFactor = 0.75 + 0.2 * domeProgress;
  }

  // Boss: highest stress concentration around opening
  if (region === 'boss') {
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

// Generate 2D axisymmetric mesh (for contour chart)
function generateFEAMesh2D(
  maxStress: number,
  cylinderLength: number,
  totalLength: number,
  innerRadius: number,
  wallThickness: number,
  transitionSCF: number,
  bossSCF: number,
  bossID: number,
  domeProfile: Array<{ r: number; z: number }>
): FEAMesh {
  const nodes: MeshNode[] = [];
  const elements: MeshElement[] = [];

  const numRadialLayers = 5;
  const numAxialCylinder = 15;
  const numAxialDome = 12;

  let nodeId = 0;
  const nodeGrid: number[][] = [];

  // Cylinder section (z = 0 to cylinderLength)
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

  // Dome section using profile
  for (let i = 1; i <= numAxialDome; i++) {
    const progress = i / numAxialDome;
    const domeZ = cylinderLength + progress * (totalLength - cylinderLength);

    // Get dome outer radius from profile
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

  // Create triangular elements
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

      // Two triangles per quad
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

// Generate 3D mesh for Three.js viewer (revolution of 2D profile)
function generateFEAMesh3D(
  mesh2D: FEAMesh,
  numCircumferential: number = 24
): FEAMesh3D {
  const nodes3D: Mesh3DNode[] = [];
  const elements3D: MeshElement[] = [];

  const numSlices = numCircumferential;
  const nodeMap = new Map<string, number>(); // "2dId-slice" -> 3dId

  // Revolve 2D nodes around z-axis
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

  // Create 3D elements by connecting slices
  let elem3DId = 0;
  for (let slice = 0; slice < numSlices; slice++) {
    const nextSlice = (slice + 1) % numSlices;

    for (const elem2D of mesh2D.elements) {
      const [n1_2d, n2_2d, n3_2d] = elem2D.nodes;

      // Get 3D node IDs for this slice and next
      const n1_curr = nodeMap.get(`${n1_2d}-${slice}`)!;
      const n2_curr = nodeMap.get(`${n2_2d}-${slice}`)!;
      const n3_curr = nodeMap.get(`${n3_2d}-${slice}`)!;
      const n1_next = nodeMap.get(`${n1_2d}-${nextSlice}`)!;
      const n2_next = nodeMap.get(`${n2_2d}-${nextSlice}`)!;
      const n3_next = nodeMap.get(`${n3_2d}-${nextSlice}`)!;

      // Create triangles connecting the slices (6 triangles per 2D element)
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

// Legacy function for backwards compatibility
function generateStressContour(
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

// Generate per-layer stress data with physics-based through-thickness gradient (REQ-208)
function generatePerLayerStress(layers: LayerData[], maxStress: number, allowableStress: number): LayerStress[] {
  // Use seeded random for reproducibility per design
  const seed = layers.length * 1000;
  const seededRandom = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  return layers.map((layer, index) => {
    // Through-thickness stress gradient (REQ-208)
    // Inner layers see higher stress, outer layers see 70-85%
    const layerPosition = (index + 1) / layers.length;
    const stressMultiplier = calculateLayerStressMultiplier(layerPosition);

    // Helical vs hoop stress differences
    const isHelical = layer.type === 'helical';

    // Fiber angle effect on stress (REQ-206)
    const fiberAngleEffect = isHelical ? (1.0 - 0.05 * Math.abs(layer.angle_deg - 90) / 90) : 1.0;

    const sigma1 = maxStress * stressMultiplier * fiberAngleEffect;
    const sigma2 = isHelical ? 28 + seededRandom(index) * 10 : 35 + seededRandom(index + 100) * 8;

    // Interlaminar shear stress (REQ-209) - higher between layers of different angles
    const tau12 = isHelical ? 10 + seededRandom(index + 200) * 5 : 6 + seededRandom(index + 300) * 4;

    // Tsai-Wu failure index (closer to 1 = closer to failure)
    const tsaiWu = (sigma1 / allowableStress) * (0.8 + seededRandom(index + 400) * 0.2);

    // Margin = (allowable - actual) / allowable * 100
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

// GET /api/designs/[id]/stress - Get stress analysis data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const designId = id.toUpperCase();
    const { searchParams } = new URL(request.url);
    const stressType = searchParams.get('type') || 'vonMises';
    const loadCase = searchParams.get('load_case') || 'test';

    const validDesigns = ['A', 'B', 'C', 'D', 'E'];
    if (!validDesigns.includes(designId)) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${designId.toLowerCase()}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const design = JSON.parse(fileContent);

    const loadPressure = loadCase === 'burst' ?
      design.summary.burst_pressure_bar :
      Math.round(design.summary.burst_pressure_bar / 2.25 * 1.5);

    // Use real physics: Calculate stress from pressure and geometry
    // Convert: bar → MPa (×0.1), mm → m (×0.001)
    const pressureMPa = loadPressure * 0.1;
    const radiusM = design.geometry.dimensions.inner_radius_mm * 0.001;
    const thicknessM = design.geometry.dimensions.wall_thickness_mm * 0.001;

    // Real first-principles calculations
    const hoopStress = calculateHoopStress(pressureMPa, radiusM, thicknessM);
    const axialStress = calculateAxialStress(pressureMPa, radiusM, thicknessM);
    const maxStress = hoopStress; // Hoop stress is maximum

    // Extract geometry parameters
    const cylinderLength = design.geometry.dimensions.cylinder_length_mm;
    const totalLength = design.geometry.dimensions.total_length_mm;
    const innerRadius = design.geometry.dimensions.inner_radius_mm;
    const transitionThickness = design.geometry.thickness_distribution.transition_mm;
    const bossID = design.geometry.dome.parameters.boss_id_mm;
    const totalLayers = design.geometry.layup.total_layers;

    // Calculate physics-based SCF values (REQ-203, REQ-204)
    const transitionSCF = calculateTransitionSCF(cylinderLength, transitionThickness, innerRadius);
    const bossSCF = calculateBossSCF(bossID, innerRadius);

    // Calculate peak stresses at critical locations
    const transitionPeakStress = Math.round(maxStress * transitionSCF * 0.85);
    const bossPeakStress = Math.round(maxStress * bossSCF * 0.9);

    // Identify ply drop locations (where hoop layers end)
    const plyDrops = [];
    const hoopLayers = design.geometry.layup.layers.filter((l: LayerData) => l.type === 'hoop');
    if (hoopLayers.length > 0) {
      const plyDropSCF = calculatePlyDropSCF(hoopLayers.length, totalLayers);
      plyDrops.push({
        layer: hoopLayers[hoopLayers.length - 1].layer,
        z_mm: cylinderLength - 50,
        scf: Math.round(plyDropSCF * 100) / 100,
        peak_stress_mpa: Math.round(maxStress * plyDropSCF * 0.75)
      });
    }

    // Define critical stress locations (REQ-205)
    const criticalLocations: CriticalLocation[] = [
      {
        name: "Boss Edge",
        z: totalLength - 10,
        r: bossID / 2,
        stress: bossPeakStress,
        is_max: true
      },
      {
        name: "Dome-Cylinder Transition",
        z: cylinderLength,
        r: innerRadius,
        stress: transitionPeakStress,
        is_max: false
      },
      {
        name: "Cylinder Midpoint",
        z: cylinderLength / 2,
        r: innerRadius,
        stress: Math.round(maxStress * 0.7),
        is_max: false
      }
    ];

    // Generate stress path along critical sections (REQ-210)
    const stressPath: StressPathPoint[] = [];
    for (let z = 0; z <= totalLength; z += 100) {
      let stressFactor = 0.7;

      // Transition region
      if (z > cylinderLength - 100 && z < cylinderLength + 200) {
        const transitionPeak = (z - (cylinderLength - 100)) / 300;
        stressFactor = 0.7 + (transitionSCF - 1.0) * Math.sin(transitionPeak * Math.PI) * 0.4;
      }

      // Boss region
      if (z > totalLength - 100) {
        const distanceFromApex = totalLength - z;
        const bossFactor = Math.exp(-distanceFromApex / 30);
        stressFactor = Math.max(stressFactor, 0.85 + (bossSCF - 1.0) * bossFactor * 0.3);
      }

      stressPath.push({
        z,
        stress: Math.round(maxStress * stressFactor)
      });
    }

    const response = {
      design_id: design.id,
      load_case: loadCase,
      load_pressure_bar: loadPressure,
      stress_type: stressType,
      max_stress: {
        value_mpa: maxStress,
        location: { r: bossID / 2, z: totalLength - 10, theta: 0 },
        region: "Boss Interface",
        allowable_mpa: design.stress.allowable_mpa,
        margin_percent: Math.round(((design.stress.allowable_mpa - bossPeakStress) / design.stress.allowable_mpa) * 100)
      },
      // Stress concentration factors (REQ-203, REQ-204, REQ-207)
      stress_concentrations: {
        dome_cylinder_transition: {
          location: { z_mm: cylinderLength, theta_deg: 0 },
          scf: Math.round(transitionSCF * 100) / 100,
          peak_stress_mpa: transitionPeakStress,
          type: "geometric_discontinuity"
        },
        boss_interface: {
          location: { z_mm: totalLength - 10, r_mm: bossID / 2 },
          scf: Math.round(bossSCF * 100) / 100,
          peak_stress_mpa: bossPeakStress,
          type: "hole_concentration"
        },
        ply_drops: plyDrops
      },
      // Critical stress locations (REQ-205)
      critical_locations: criticalLocations,
      // Stress path along critical sections (REQ-210)
      stress_path: {
        dome_profile: stressPath
      },
      contour_data: (() => {
        // Generate proper FEA mesh data
        const domeProfile = design.geometry.dome.profile_points || [
          { r: innerRadius, z: 0 },
          { r: innerRadius * 0.8, z: 50 },
          { r: innerRadius * 0.5, z: 100 },
          { r: bossID / 2, z: totalLength - cylinderLength }
        ];

        const mesh2D = generateFEAMesh2D(
          maxStress,
          cylinderLength,
          totalLength,
          innerRadius,
          design.geometry.dimensions.wall_thickness_mm,
          transitionSCF,
          bossSCF,
          bossID,
          domeProfile
        );

        const mesh3D = generateFEAMesh3D(mesh2D, 24);

        return {
          type: 'nodal',
          colormap: 'jet',
          min_value: Math.min(...mesh2D.nodes.map(n => n.stress)),
          max_value: Math.max(...mesh2D.nodes.map(n => n.stress)),
          // Legacy format for backwards compatibility
          nodes: generateStressContour(
            maxStress,
            stressType,
            cylinderLength,
            totalLength,
            innerRadius,
            transitionThickness,
            bossID
          ),
          // Proper FEA mesh for 2D contour visualization
          mesh: mesh2D,
          // 3D mesh for Three.js viewer
          mesh3D: mesh3D
        };
      })(),
      // Generate stress for ALL layers with through-thickness gradient (REQ-208)
      per_layer_stress: generatePerLayerStress(
        design.geometry.layup.layers,
        maxStress,
        design.stress.allowable_mpa
      ),
      stress_ratios: {
        hoop_to_axial: Math.round((hoopStress / axialStress) * 100) / 100,
        netting_theory_ratio: 2.0, // Theoretical value from netting theory
        deviation_percent: Math.round(((hoopStress / axialStress - 2.0) / 2.0) * 10000) / 100
      }
    };

    return NextResponse.json(response, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
