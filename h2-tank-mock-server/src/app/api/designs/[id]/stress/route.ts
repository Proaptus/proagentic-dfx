import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simulated stress field generator
function generateStressContour(maxStress: number, type: string) {
  const nodes: Array<{ x: number; y: number; z: number; value: number }> = [];

  // Generate nodes along the tank surface
  for (let z = 0; z <= 1560; z += 50) {
    for (let theta = 0; theta < 360; theta += 30) {
      const rad = (theta * Math.PI) / 180;
      const r = 175; // inner radius

      // Stress concentration at dome-cylinder transition (z around 1200-1400)
      let stressFactor = 0.7;
      if (z > 1150 && z < 1450) {
        stressFactor = 0.85 + 0.15 * Math.sin((z - 1150) * Math.PI / 300);
      }

      nodes.push({
        x: r * Math.cos(rad),
        y: r * Math.sin(rad),
        z,
        value: Math.round(maxStress * stressFactor * (0.95 + Math.random() * 0.1))
      });
    }
  }

  return nodes;
}

// GET /api/designs/[id]/stress - Get stress analysis data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const designId = id.toUpperCase();
    const { searchParams } = new URL(request.url);
    const stressType = searchParams.get('type') || 'vonMises';
    const loadCase = searchParams.get('load_case') || 'test';

    const validDesigns = ['A', 'B', 'C', 'D', 'E'];
    if (!validDesigns.includes(designId)) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${designId.toLowerCase()}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const design = JSON.parse(fileContent);

    const loadPressure = loadCase === 'burst' ?
      design.summary.burst_pressure_bar :
      Math.round(design.summary.burst_pressure_bar / 2.25 * 1.5);

    const maxStress = loadCase === 'burst' ?
      design.stress.max_von_mises_mpa * 1.2 :
      design.stress.max_von_mises_mpa;

    const response = {
      design_id: design.id,
      load_case: loadCase,
      load_pressure_bar: loadPressure,
      stress_type: stressType,
      max_stress: {
        value_mpa: maxStress,
        location: { r: 175, z: 1300, theta: 0 },
        region: design.stress.max_location,
        allowable_mpa: design.stress.allowable_mpa,
        margin_percent: design.stress.margin_percent
      },
      contour_data: {
        type: 'nodal',
        colormap: 'jet',
        min_value: Math.round(maxStress * 0.3),
        max_value: maxStress,
        nodes: generateStressContour(maxStress, stressType)
      },
      per_layer_stress: design.stress.per_layer || [
        { layer: 1, type: 'helical', sigma1_mpa: maxStress, sigma2_mpa: 28, tau12_mpa: 12, tsai_wu: 0.84 },
        { layer: 2, type: 'hoop', sigma1_mpa: maxStress * 0.9, sigma2_mpa: 35, tau12_mpa: 8, tsai_wu: 0.75 },
        { layer: 3, type: 'helical', sigma1_mpa: maxStress * 0.95, sigma2_mpa: 30, tau12_mpa: 10, tsai_wu: 0.81 }
      ],
      stress_ratios: {
        hoop_to_axial: 2.0,
        netting_theory_ratio: 2.0,
        deviation_percent: 0
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
