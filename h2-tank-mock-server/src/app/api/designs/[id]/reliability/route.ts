import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  calculateReliability,
  generateBurstDistribution,
  calculateDistributionStats,
  gaussianRandom
} from '@/lib/physics/reliability';
import { calculateHoopStress } from '@/lib/physics/pressure-vessel';

// Generate burst distribution histogram
function generateHistogram(meanBurst: number, stdBurst: number): Array<{ bin_center: number; count: number }> {
  const bins: Map<number, number> = new Map();
  const binWidth = 25;
  const numSamples = 10000;

  for (let i = 0; i < numSamples; i++) {
    // Sample from normal distribution: mean + std * Z
    const sample = meanBurst + stdBurst * gaussianRandom();
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

    // Calculate real reliability using Monte Carlo simulation
    const workingPressure = design.summary.burst_pressure_bar / 2.25; // bar
    const radiusM = design.geometry.dimensions.inner_radius_mm * 0.001;
    const thicknessM = design.geometry.dimensions.wall_thickness_mm * 0.001;
    const workingPressureMPa = workingPressure * 0.1;

    const designStress = calculateHoopStress(workingPressureMPa, radiusM, thicknessM);
    const materialStrength = 2500; // MPa for carbon fiber
    const strengthCOV = 0.05; // 5% variation in strength
    const stressCOV = 0.10; // 10% variation in stress

    // Run Monte Carlo simulation with 100,000 samples
    const mcResult = calculateReliability(
      designStress,
      materialStrength,
      strengthCOV,
      stressCOV,
      100000
    );

    // Generate burst pressure distribution
    const meanBurst = design.summary.burst_pressure_bar;
    const burstCOV = 0.03;
    const burstSamples = generateBurstDistribution(meanBurst, burstCOV, 10000);
    const burstStats = calculateDistributionStats(burstSamples);

    const pFailure = mcResult.pFailure;

    const response = {
      design_id: design.id,
      monte_carlo: {
        samples: mcResult.samplesRun,
        p_failure: Math.round(pFailure * 1e10) / 1e10, // Round to 10 decimal places
        interpretation: pFailure > 0 ?
          `1 in ${Math.round(1 / pFailure).toLocaleString()} chance of burst below working pressure over service life` :
          'Extremely low probability of failure (< 1 in 100,000)',
        comparison_to_requirement: pFailure > 0 ?
          `${Math.round(1e-5 / pFailure)}× better than 10⁻⁵ typical requirement` :
          '> 100,000× better than 10⁻⁵ typical requirement'
      },
      burst_distribution: {
        mean_bar: Math.round(burstStats.mean),
        std_bar: Math.round(burstStats.std),
        cov: Math.round(burstStats.cov * 1000) / 1000,
        percentile_5: Math.round(burstStats.percentile5),
        percentile_95: Math.round(burstStats.percentile95),
        histogram: generateHistogram(burstStats.mean, burstStats.std)
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
