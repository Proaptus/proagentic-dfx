import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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

    // Use design C's detailed failure data as template
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
        max_at_test: { value: 0.84, layer: 1, location: 'dome_transition' },
        max_at_burst: { value: 1.02, layer: 1, location: 'dome_transition' },
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
      hashin_indices: design.failure?.hashin || {
        at_test: { fiber_tension: 0.72, fiber_compression: 0.08, matrix_tension: 0.89, matrix_compression: 0.15 },
        at_burst: { fiber_tension: 1.02, fiber_compression: 0.12, matrix_tension: 1.31, matrix_compression: 0.22 }
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
