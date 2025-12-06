import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/designs/[id]/thermal - Get thermal analysis data
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

    const response = {
      design_id: design.id,
      fast_fill: design.thermal?.fast_fill || {
        scenario: 'Fill from 20 bar to 700 bar in 3 minutes',
        peak_gas_temp_c: 95,
        peak_wall_temp_c: 72,
        peak_liner_temp_c: design.thermal?.peak_liner_temp_c || 68,
        time_to_peak_seconds: 180,
        liner_limit_c: 85,
        status: design.thermal?.status || 'pass'
      },
      thermal_stress: design.thermal?.thermal_stress || {
        max_mpa: 52,
        location: 'inner_liner_surface',
        components: { hoop_mpa: 45, axial_mpa: 28, radial_mpa: 12 },
        combined_with_pressure_max_mpa: 2179
      },
      extreme_temperature_performance: design.thermal?.extreme_temperature || [
        { condition: 'cold_soak', temp_c: -40, max_stress_mpa: 2310, margin_percent: 10, status: 'pass' },
        { condition: 'hot_soak', temp_c: 85, max_stress_mpa: 2095, margin_percent: 22, status: 'pass' },
        { condition: 'hot_fill', temp_c: 95, max_stress_mpa: 2179, margin_percent: 17, status: 'pass' }
      ]
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
