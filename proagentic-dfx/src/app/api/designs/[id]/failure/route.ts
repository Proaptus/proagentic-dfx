import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  calculateTsaiWuIndex,
  calculateHashinIndices,
  CARBON_EPOXY_STRENGTHS,
  transformStresses
} from '@/lib/physics/composite-analysis';
import { calculateHoopStress, calculateAxialStress } from '@/lib/physics/pressure-vessel';

// GET /api/designs/[id]/failure - Get failure analysis data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const designId = id.toUpperCase();

    const validDesigns = ['A', 'B', 'C', 'D', 'E'];
    if (!validDesigns.includes(designId)) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${designId.toLowerCase()}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const design = JSON.parse(fileContent);

    // Calculate real stresses at test and burst pressures
    const testPressure = design.summary.burst_pressure_bar / 2.25 * 1.5;
    const burstPressure = design.summary.burst_pressure_bar;

    // Convert to SI units
    const radiusM = design.geometry.dimensions.inner_radius_mm * 0.001;
    const thicknessM = design.geometry.dimensions.wall_thickness_mm * 0.001;

    // Test pressure stresses
    const testPressureMPa = testPressure * 0.1;
    const hoopStressTest = calculateHoopStress(testPressureMPa, radiusM, thicknessM);
    const axialStressTest = calculateAxialStress(testPressureMPa, radiusM, thicknessM);

    // Burst pressure stresses
    const burstPressureMPa = burstPressure * 0.1;
    const hoopStressBurst = calculateHoopStress(burstPressureMPa, radiusM, thicknessM);
    const axialStressBurst = calculateAxialStress(burstPressureMPa, radiusM, thicknessM);

    // Calculate Tsai-Wu for hoop layer (90° fiber angle)
    const hoopLayerTest = transformStresses(hoopStressTest, axialStressTest, 90);
    const tsaiWuTest = calculateTsaiWuIndex(
      hoopLayerTest.sigma1,
      hoopLayerTest.sigma2,
      hoopLayerTest.tau12,
      CARBON_EPOXY_STRENGTHS
    );

    const hoopLayerBurst = transformStresses(hoopStressBurst, axialStressBurst, 90);
    const tsaiWuBurst = calculateTsaiWuIndex(
      hoopLayerBurst.sigma1,
      hoopLayerBurst.sigma2,
      hoopLayerBurst.tau12,
      CARBON_EPOXY_STRENGTHS
    );

    // Calculate Hashin indices at test and burst
    const hashinTest = calculateHashinIndices(
      hoopLayerTest.sigma1,
      hoopLayerTest.sigma2,
      hoopLayerTest.tau12,
      CARBON_EPOXY_STRENGTHS
    );

    const hashinBurst = calculateHashinIndices(
      hoopLayerBurst.sigma1,
      hoopLayerBurst.sigma2,
      hoopLayerBurst.tau12,
      CARBON_EPOXY_STRENGTHS
    );

    // Use real physics data with template fallbacks
    const response = {
      design_id: design.id,
      predicted_failure_mode: {
        mode: design.failure?.predicted_mode || 'fiber_breakage',
        is_preferred: design.failure?.is_preferred ?? true,
        location: 'dome_cylinder_transition',
        confidence: design.failure?.confidence || 0.92,
        explanation: design.failure?.explanation ||
          'Design fails by fiber breakage in hoop layers. This is PREFERRED because it is predictable, progressive, and not catastrophic.'
      },
      tsai_wu: {
        max_at_test: {
          value: Math.round(tsaiWuTest * 100) / 100,
          layer: 1,
          location: 'dome_transition'
        },
        max_at_burst: {
          value: Math.round(tsaiWuBurst * 100) / 100,
          layer: 1,
          location: 'dome_transition'
        },
        contour_data: []
      },
      first_ply_failure: design.failure?.first_ply_failure || {
        layer: 3,
        layer_type: 'helical',
        angle_deg: 15.0,
        location: 'dome_cylinder_transition',
        pressure_bar: design.failure?.first_ply_failure_bar || 1050,
        mode: 'matrix_microcracking',
        note: 'FPF does not mean structural failure. Matrix microcracking is acceptable.'
      },
      progressive_failure_sequence: design.failure?.progressive_sequence || [
        { pressure_bar: 1050, event: 'First matrix cracking', layers_affected: [3] },
        { pressure_bar: 1280, event: 'Matrix cracking propagates', layers_affected: [1, 2, 3, 4, 5] },
        { pressure_bar: 1450, event: 'Delamination initiation', interface: '3/4' },
        { pressure_bar: 1620, event: 'Fiber breakage begins', region: 'hoop_layers' },
        { pressure_bar: design.summary.burst_pressure_bar, event: 'Ultimate failure (fiber rupture)', layers_affected: [18, 19, 20, 21, 22, 23, 24] }
      ],
      hashin_indices: {
        at_test: {
          fiber_tension: Math.round(hashinTest.fiberTension * 100) / 100,
          fiber_compression: Math.round(hashinTest.fiberCompression * 100) / 100,
          matrix_tension: Math.round(hashinTest.matrixTension * 100) / 100,
          matrix_compression: Math.round(hashinTest.matrixCompression * 100) / 100
        },
        at_burst: {
          fiber_tension: Math.round(hashinBurst.fiberTension * 100) / 100,
          fiber_compression: Math.round(hashinBurst.fiberCompression * 100) / 100,
          matrix_tension: Math.round(hashinBurst.matrixTension * 100) / 100,
          matrix_compression: Math.round(hashinBurst.matrixCompression * 100) / 100
        }
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
