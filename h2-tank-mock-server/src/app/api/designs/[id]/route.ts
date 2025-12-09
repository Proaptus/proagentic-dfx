import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/designs/[id] - Get design summary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const designId = id.toUpperCase();

    // Map design ID to file (A-E are the main designs)
    const validDesigns = ['A', 'B', 'C', 'D', 'E'];

    if (!validDesigns.includes(designId)) {
      return NextResponse.json(
        { error: 'Design not found', message: `Design ${id} does not exist` },
        { status: 404 }
      );
    }

    // Read design file
    const filePath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${designId.toLowerCase()}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const design = JSON.parse(fileContent);

    // Return summary with flat fields for easy access (CompareScreen expects this)
    return NextResponse.json({
      id: design.id,
      trade_off_category: design.trade_off_category,
      recommendation_reason: design.recommendation_reason,
      summary: design.summary,
      // Flat fields for direct access
      weight_kg: design.summary.weight_kg,
      burst_pressure_bar: design.summary.burst_pressure_bar,
      cost_eur: design.summary.cost_eur,
      p_failure: design.summary.p_failure,
      fatigue_life_cycles: design.summary.fatigue_life_cycles,
      permeation_rate: design.summary.permeation_rate,
      volumetric_efficiency: design.summary.volumetric_efficiency,
      max_stress_mpa: design.stress?.max_von_mises_mpa || 2127,
      stress_margin_percent: design.stress?.margin_percent || 20
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching design:', error);
    return NextResponse.json(
      { error: 'Failed to fetch design', message: String(error) },
      { status: 500 }
    );
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
