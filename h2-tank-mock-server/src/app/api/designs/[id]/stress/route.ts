import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { calculateHoopStress, calculateAxialStress } from '@/lib/physics/pressure-vessel';
import type { LayerData, CriticalLocation, StressPathPoint } from './types';
import {
  calculateVonMisesStress,
  calculateShearStress,
  getMaxStressForType,
  calculateTransitionSCF,
  calculateBossSCF,
  calculatePlyDropSCF,
  generateFEAMesh2D,
  generateFEAMesh3D,
  generateStressContour,
  generatePerLayerStress,
} from './stress-utils';

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

    // Calculate load pressure based on load case
    // Operating = 1.0x working pressure, Test = 1.5x, Burst = 2.25x
    const workingPressure = Math.round(design.summary.burst_pressure_bar / 2.25);
    let loadPressure: number;
    let loadCaseLabel: string;

    switch (loadCase) {
      case 'burst':
        loadPressure = design.summary.burst_pressure_bar;
        loadCaseLabel = 'Burst Pressure (2.25×)';
        break;
      case 'operating':
        loadPressure = workingPressure;
        loadCaseLabel = 'Operating Pressure (1.0×)';
        break;
      case 'test':
      default:
        loadPressure = Math.round(workingPressure * 1.5);
        loadCaseLabel = 'Test Pressure (1.5×)';
        break;
    }

    const pressureMPa = loadPressure * 0.1;
    const radiusM = design.geometry.dimensions.inner_radius_mm * 0.001;
    const thicknessM = design.geometry.dimensions.wall_thickness_mm * 0.001;

    const hoopStress = calculateHoopStress(pressureMPa, radiusM, thicknessM);
    const axialStress = calculateAxialStress(pressureMPa, radiusM, thicknessM);

    // Get selected stress type
    const { maxValue: selectedStressValue } = getMaxStressForType(stressType, hoopStress, axialStress);

    const cylinderLength = design.geometry.dimensions.cylinder_length_mm;
    const totalLength = design.geometry.dimensions.total_length_mm;
    const innerRadius = design.geometry.dimensions.inner_radius_mm;
    const transitionThickness = design.geometry.thickness_distribution.transition_mm;
    const bossID = design.geometry.dome.parameters.boss_id_mm;
    const totalLayers = design.geometry.layup.total_layers;

    const transitionSCF = calculateTransitionSCF(cylinderLength, transitionThickness, innerRadius);
    const bossSCF = calculateBossSCF(bossID, innerRadius);

    const transitionPeakStress = Math.round(selectedStressValue * transitionSCF * 0.85);
    const bossPeakStress = Math.round(selectedStressValue * bossSCF * 0.9);

    const plyDrops = [];
    const hoopLayers = design.geometry.layup.layers.filter((l: LayerData) => l.type === 'hoop');
    if (hoopLayers.length > 0) {
      const plyDropSCF = calculatePlyDropSCF(hoopLayers.length, totalLayers);
      plyDrops.push({
        layer: hoopLayers[hoopLayers.length - 1].layer,
        z_mm: cylinderLength - 50,
        scf: Math.round(plyDropSCF * 100) / 100,
        peak_stress_mpa: Math.round(selectedStressValue * plyDropSCF * 0.75)
      });
    }

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
        stress: Math.round(selectedStressValue * 0.7),
        is_max: false
      }
    ];

    const stressPath: StressPathPoint[] = [];
    for (let z = 0; z <= totalLength; z += 100) {
      let stressFactor = 0.7;

      if (z > cylinderLength - 100 && z < cylinderLength + 200) {
        const transitionPeak = (z - (cylinderLength - 100)) / 300;
        stressFactor = 0.7 + (transitionSCF - 1.0) * Math.sin(transitionPeak * Math.PI) * 0.4;
      }

      if (z > totalLength - 100) {
        const distanceFromApex = totalLength - z;
        const bossFactor = Math.exp(-distanceFromApex / 30);
        stressFactor = Math.max(stressFactor, 0.85 + (bossSCF - 1.0) * bossFactor * 0.3);
      }

      stressPath.push({
        z,
        stress: Math.round(selectedStressValue * stressFactor)
      });
    }

    const response = {
      design_id: design.id,
      load_case: loadCase,
      load_case_label: loadCaseLabel,
      load_pressure_bar: loadPressure,
      stress_type: stressType,
      max_stress: {
        value_mpa: Math.round(selectedStressValue),
        location: { r: bossID / 2, z: totalLength - 10, theta: 0 },
        region: "Boss Interface",
        allowable_mpa: design.stress.allowable_mpa,
        margin_percent: Math.round(((design.stress.allowable_mpa - bossPeakStress) / design.stress.allowable_mpa) * 100)
      },
      // Include all stress types for reference
      all_stress_types: {
        von_mises: Math.round(calculateVonMisesStress(hoopStress, axialStress)),
        hoop: Math.round(hoopStress),
        axial: Math.round(axialStress),
        shear: Math.round(calculateShearStress(hoopStress))
      },
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
      critical_locations: criticalLocations,
      stress_path: {
        dome_profile: stressPath
      },
      contour_data: (() => {
        const domeProfile = design.geometry.dome.profile_points || [
          { r: innerRadius, z: 0 },
          { r: innerRadius * 0.8, z: 50 },
          { r: innerRadius * 0.5, z: 100 },
          { r: bossID / 2, z: totalLength - cylinderLength }
        ];

        const mesh2D = generateFEAMesh2D(
          selectedStressValue,
          cylinderLength,
          totalLength,
          innerRadius,
          design.geometry.dimensions.wall_thickness_mm,
          transitionSCF,
          bossSCF,
          bossID,
          domeProfile,
          stressType
        );

        const mesh3D = generateFEAMesh3D(mesh2D, 24);

        return {
          type: 'nodal',
          colormap: 'jet',
          min_value: Math.min(...mesh2D.nodes.map(n => n.stress)),
          max_value: Math.max(...mesh2D.nodes.map(n => n.stress)),
          nodes: generateStressContour(
            selectedStressValue,
            stressType,
            cylinderLength,
            totalLength,
            innerRadius,
            transitionThickness,
            bossID
          ),
          mesh: mesh2D,
          mesh3D: mesh3D
        };
      })(),
      per_layer_stress: generatePerLayerStress(
        design.geometry.layup.layers,
        selectedStressValue,
        design.stress.allowable_mpa
      ),
      stress_ratios: {
        hoop_to_axial: Math.round((hoopStress / axialStress) * 100) / 100,
        netting_theory_ratio: 2.0,
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
