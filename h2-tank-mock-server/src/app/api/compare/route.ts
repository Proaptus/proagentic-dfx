import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface CompareRequest {
  design_ids: string[];
}

// POST /api/compare - Compare multiple designs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CompareRequest;
    const designIds = body.design_ids.map(id => id.toUpperCase());

    const validDesigns = ['A', 'B', 'C', 'D', 'E'];
    const invalidIds = designIds.filter(id => !validDesigns.includes(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: 'Invalid design IDs', invalid: invalidIds },
        { status: 400 }
      );
    }

    // Load all requested designs
    const designs = await Promise.all(
      designIds.map(async (id) => {
        const filePath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${id.toLowerCase()}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      })
    );

    // Build comparison response
    const comparedDesigns = designs.map(d => ({
      id: d.id,
      weight_kg: d.summary.weight_kg,
      burst_pressure_bar: d.summary.burst_pressure_bar,
      cost_eur: d.summary.cost_eur,
      p_failure: d.summary.p_failure,
      fatigue_life_cycles: d.summary.fatigue_life_cycles,
      permeation_rate: d.summary.permeation_rate,
      max_stress_mpa: d.stress?.max_von_mises_mpa || 2127,
      stress_margin_percent: d.stress?.margin_percent || 20
    }));

    // Radar chart data (normalized to 0-100)
    const metrics = ['weight', 'burst', 'cost', 'reliability', 'fatigue', 'efficiency'];
    const radarData = metrics.map(metric => {
      const dataPoint: Record<string, number | string> = { metric };
      designs.forEach(d => {
        let value = 0;
        switch (metric) {
          case 'weight': value = 100 - ((d.summary.weight_kg - 70) / 20) * 100; break;
          case 'burst': value = ((d.summary.burst_pressure_bar - 1500) / 500) * 100; break;
          case 'cost': value = 100 - ((d.summary.cost_eur - 12000) / 3000) * 100; break;
          case 'reliability': value = Math.min(100, -Math.log10(d.summary.p_failure) * 12); break;
          case 'fatigue': value = Math.min(100, (d.summary.fatigue_life_cycles / 80000) * 100); break;
          case 'efficiency': value = d.summary.volumetric_efficiency * 100; break;
        }
        dataPoint[d.id] = Math.round(Math.max(0, Math.min(100, value)));
      });
      return dataPoint;
    });

    // Comparison metrics with "better" indicator
    const comparisonMetrics = [
      { metric: 'Weight (kg)', values: Object.fromEntries(designs.map(d => [d.id, d.summary.weight_kg])), better: designs.reduce((a, b) => a.summary.weight_kg < b.summary.weight_kg ? a : b).id },
      { metric: 'Burst (bar)', values: Object.fromEntries(designs.map(d => [d.id, d.summary.burst_pressure_bar])), better: designs.reduce((a, b) => a.summary.burst_pressure_bar > b.summary.burst_pressure_bar ? a : b).id },
      { metric: 'Cost (€)', values: Object.fromEntries(designs.map(d => [d.id, d.summary.cost_eur])), better: designs.reduce((a, b) => a.summary.cost_eur < b.summary.cost_eur ? a : b).id },
      { metric: 'P(failure)', values: Object.fromEntries(designs.map(d => [d.id, d.summary.p_failure.toExponential(0)])), better: designs.reduce((a, b) => a.summary.p_failure < b.summary.p_failure ? a : b).id },
      { metric: 'Fatigue Life', values: Object.fromEntries(designs.map(d => [d.id, d.summary.fatigue_life_cycles])), better: designs.reduce((a, b) => a.summary.fatigue_life_cycles > b.summary.fatigue_life_cycles ? a : b).id },
      { metric: 'Permeation', values: Object.fromEntries(designs.map(d => [d.id, d.summary.permeation_rate])), better: designs.reduce((a, b) => a.summary.permeation_rate < b.summary.permeation_rate ? a : b).id }
    ];

    const response = {
      designs: comparedDesigns,
      radar_data: radarData,
      metrics: comparisonMetrics
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
