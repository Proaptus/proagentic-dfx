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

    // Generate temperature profile data for fast fill simulation
    const peakGasTemp = design.thermal?.fast_fill?.peak_gas_temp_c || 95;
    const peakWallTemp = design.thermal?.fast_fill?.peak_wall_temp_c || 72;
    const peakLinerTemp = design.thermal?.peak_liner_temp_c || 68;
    const timeToPeak = design.thermal?.fast_fill?.time_to_peak_seconds || 180;

    // Generate time series data for temperature profile chart
    const temperatureProfile = [];
    for (let t = 0; t <= timeToPeak + 60; t += 10) {
      // Gas temp rises quickly due to adiabatic compression, then stabilizes
      const gasProgress = Math.min(t / timeToPeak, 1);
      const gasTemp = 20 + (peakGasTemp - 20) * (1 - Math.exp(-3 * gasProgress));

      // Wall temp lags behind gas temp
      const wallProgress = Math.min(t / (timeToPeak * 1.2), 1);
      const wallTemp = 20 + (peakWallTemp - 20) * (1 - Math.exp(-2.5 * wallProgress));

      // Liner temp lags even more
      const linerProgress = Math.min(t / (timeToPeak * 1.4), 1);
      const linerTemp = 20 + (peakLinerTemp - 20) * (1 - Math.exp(-2 * linerProgress));

      temperatureProfile.push({
        time: t,
        gas: Math.round(gasTemp * 10) / 10,
        wall: Math.round(wallTemp * 10) / 10,
        liner: Math.round(linerTemp * 10) / 10
      });
    }

    // CTE mismatch data for composite materials
    const cteMismatch = [
      { component: 'Carbon Fiber (Longitudinal)', cte: '−0.5 × 10⁻⁶/°C', stress_contribution: 'Low' },
      { component: 'Carbon Fiber (Transverse)', cte: '10 × 10⁻⁶/°C', stress_contribution: 'Moderate' },
      { component: 'Epoxy Matrix', cte: '55 × 10⁻⁶/°C', stress_contribution: 'Moderate' },
      { component: 'HDPE Liner', cte: '120 × 10⁻⁶/°C', stress_contribution: 'Significant' },
      { component: 'Aluminum Boss', cte: '23 × 10⁻⁶/°C', stress_contribution: 'Moderate' }
    ];

    // Extreme temperature performance data
    const extremeTempPerformance = [
      { condition: 'Cold Soak (−40°C)', hoop_strength_pct: 105, matrix_brittleness: 'High', status: 'acceptable' },
      { condition: 'Ambient (20°C)', hoop_strength_pct: 100, matrix_brittleness: 'Low', status: 'nominal' },
      { condition: 'Hot Soak (85°C)', hoop_strength_pct: 92, matrix_brittleness: 'Low', status: 'acceptable' },
      { condition: 'Fast Fill Peak (95°C)', hoop_strength_pct: 88, matrix_brittleness: 'Low', status: 'warning' }
    ];

    const response = {
      design_id: design.id,
      fast_fill: design.thermal?.fast_fill || {
        scenario: 'Fill from 20 bar to 700 bar in 3 minutes',
        peak_gas_temp_c: peakGasTemp,
        peak_wall_temp_c: peakWallTemp,
        peak_liner_temp_c: peakLinerTemp,
        time_to_peak_seconds: timeToPeak,
        liner_limit_c: 85,
        status: design.thermal?.status || 'pass'
      },
      thermal_stress: design.thermal?.thermal_stress || {
        max_mpa: 52,
        location: 'inner_liner_surface',
        components: { hoop_mpa: 45, axial_mpa: 28, radial_mpa: 12 },
        combined_with_pressure_max_mpa: 2179
      },
      temperature_profile: temperatureProfile,
      cte_mismatch: cteMismatch,
      extreme_temperature_performance: extremeTempPerformance
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
