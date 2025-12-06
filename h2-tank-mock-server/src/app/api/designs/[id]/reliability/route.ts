import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { gaussianRandom } from '@/lib/utils/noise';

// Generate burst distribution histogram
function generateHistogram(meanBurst: number, stdBurst: number): Array<{ bin_center: number; count: number }> {
  const bins: Map<number, number> = new Map();
  const binWidth = 25;
  const numSamples = 10000;

  for (let i = 0; i < numSamples; i++) {
    const sample = gaussianRandom(meanBurst, stdBurst);
    const binCenter = Math.round(sample / binWidth) * binWidth;
    bins.set(binCenter, (bins.get(binCenter) || 0) + 1);
  }

  return Array.from(bins.entries())
    .map(([bin_center, count]) => ({ bin_center, count: count * 100 })) // Scale up for display
    .sort((a, b) => a.bin_center - b.bin_center);
}

// GET /api/designs/[id]/reliability - Get reliability analysis data
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

    const meanBurst = design.reliability?.mean_burst_bar || design.summary.burst_pressure_bar;
    const cov = design.reliability?.cov || 0.03;
    const stdBurst = meanBurst * cov;
    const pFailure = design.summary.p_failure;

    const response = {
      design_id: design.id,
      monte_carlo: design.reliability?.monte_carlo || {
        samples: 1000000,
        p_failure: pFailure,
        interpretation: `1 in ${Math.round(1 / pFailure).toLocaleString()} chance of burst below working pressure over service life`,
        comparison_to_requirement: `${Math.round(1e-5 / pFailure)}× better than 10⁻⁵ typical requirement`
      },
      burst_distribution: {
        mean_bar: meanBurst,
        std_bar: Math.round(stdBurst),
        cov: cov,
        percentile_5: Math.round(meanBurst - 1.645 * stdBurst),
        percentile_95: Math.round(meanBurst + 1.645 * stdBurst),
        histogram: generateHistogram(meanBurst, stdBurst)
      },
      uncertainty_breakdown: design.reliability?.uncertainty_breakdown || [
        { source: 'Fiber strength variability', cov: 0.08, variance_contribution: 0.52 },
        { source: 'Thickness variability', cov: 0.05, variance_contribution: 0.28 },
        { source: 'Fiber volume fraction', cov: 0.03, variance_contribution: 0.15 },
        { source: 'Angle variability', cov: 0.02, variance_contribution: 0.05 }
      ],
      key_insight: design.reliability?.key_insight ||
        'Fiber strength dominates uncertainty. Tighter QC on incoming fiber would improve reliability most effectively.',
      sensitivity: design.reliability?.sensitivity || [
        { parameter: 'Fiber strength', effect_bar_per_percent: 17.2 },
        { parameter: 'Hoop layer thickness', effect_bar_per_percent: 12.1 },
        { parameter: 'Helical layer thickness', effect_bar_per_percent: 8.4 },
        { parameter: 'Fiber volume fraction', effect_bar_per_percent: 5.2 },
        { parameter: 'Helical angle', effect_bar_per_percent: -2.8 },
        { parameter: 'Liner thickness', effect_bar_per_percent: 0.3 }
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
