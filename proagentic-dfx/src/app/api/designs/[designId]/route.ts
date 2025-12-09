import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET /api/designs/:designId - Fetch a single design by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ designId: string }> }
) {
  try {
    const { designId } = await params;
    const dataPath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${designId.toLowerCase()}.json`);

    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(
        { error: `Design ${designId} not found` },
        { status: 404 }
      );
    }

    const designData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Flatten the design data for API response
    const response = {
      id: designData.id,
      trade_off_category: designData.trade_off_category,
      weight_kg: designData.summary?.weight_kg,
      cost_eur: designData.summary?.cost_eur,
      burst_pressure_bar: designData.summary?.burst_pressure_bar,
      burst_ratio: designData.summary?.burst_ratio,
      p_failure: designData.reliability?.p_failure ?? designData.summary?.p_failure,
      fatigue_life_cycles: designData.summary?.fatigue_life_cycles,
      permeation_rate: designData.summary?.permeation_rate,
      volumetric_efficiency: designData.summary?.volumetric_efficiency,
      max_stress_mpa: designData.stress?.max_von_mises_mpa,
      stress_margin_percent: designData.stress?.margin_percent,
      geometry: designData.geometry,
      stress: designData.stress,
      failure: designData.failure,
      thermal: designData.thermal,
      reliability: designData.reliability,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching design:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
