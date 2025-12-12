import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Featured design IDs with JSON files
const FEATURED_DESIGNS = ['A', 'B', 'C', 'D', 'E'];

// Validate Pareto design ID format (P06-P99)
const isParetoDesignId = (id: string): boolean => {
  return /^P\d{2}$/i.test(id);
};

// GET /api/designs/[id] - Get design summary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const designId = id.toUpperCase();

    // Check if it's a featured design (A-E) or Pareto design (P06-P50)
    const isFeatured = FEATURED_DESIGNS.includes(designId);
    const isPareto = isParetoDesignId(designId);

    if (!isFeatured && !isPareto) {
      return NextResponse.json(
        { error: 'Design not found', message: `Design ${id} does not exist` },
        { status: 404 }
      );
    }

    let design;

    if (isFeatured) {
      // Read design file for featured designs A-E
      const filePath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${designId.toLowerCase()}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      design = JSON.parse(fileContent);
    } else {
      // For Pareto designs, generate mock data based on pareto-50.json
      const paretoPath = path.join(process.cwd(), '..', 'proagentic-dfx', 'data', 'static', 'pareto', 'pareto-50.json');
      const paretoContent = await fs.readFile(paretoPath, 'utf-8');
      const paretoData = JSON.parse(paretoContent);

      // Find the design in pareto_designs array
      const paretoDesign = paretoData.pareto_designs.find(
        (d: { id: string }) => d.id.toUpperCase() === designId
      );

      if (!paretoDesign) {
        return NextResponse.json(
          { error: 'Pareto design not found', message: `Design ${id} not in Pareto front` },
          { status: 404 }
        );
      }

      // Generate full design object from Pareto data (simulated based on Design C as template)
      design = {
        id: paretoDesign.id,
        trade_off_category: paretoDesign.trade_off_category,
        recommendation_reason: paretoDesign.recommendation_reason || `Pareto-optimal design with ${paretoDesign.trade_off_category} characteristics`,
        summary: {
          weight_kg: paretoDesign.weight_kg,
          burst_pressure_bar: paretoDesign.burst_pressure_bar,
          cost_eur: paretoDesign.cost_eur,
          p_failure: paretoDesign.p_failure,
          fatigue_life_cycles: paretoDesign.fatigue_life_cycles,
          permeation_rate: paretoDesign.permeation_rate,
          volumetric_efficiency: paretoDesign.volumetric_efficiency,
        },
        stress: {
          max_von_mises_mpa: Math.round(2000 + (paretoDesign.weight_kg - 74) * 15),
          margin_percent: Math.round((paretoDesign.burst_pressure_bar / 700 - 1) * 100),
        },
      };
    }

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
