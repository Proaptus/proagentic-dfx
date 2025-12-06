import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/designs/[id]/cost - Get cost breakdown data
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
      unit_cost_eur: design.summary.cost_eur,
      breakdown: design.cost?.breakdown || [
        { component: 'Carbon fiber', cost_eur: Math.round(design.summary.cost_eur * 0.47), percentage: 47 },
        { component: 'Resin', cost_eur: Math.round(design.summary.cost_eur * 0.04), percentage: 4 },
        { component: 'Liner', cost_eur: Math.round(design.summary.cost_eur * 0.03), percentage: 3 },
        { component: 'Boss', cost_eur: Math.round(design.summary.cost_eur * 0.03), percentage: 3 },
        { component: 'Labor', cost_eur: Math.round(design.summary.cost_eur * 0.13), percentage: 13 },
        { component: 'Overhead', cost_eur: Math.round(design.summary.cost_eur * 0.17), percentage: 17 },
        { component: 'Margin', cost_eur: Math.round(design.summary.cost_eur * 0.11), percentage: 11 }
      ],
      weight_cost_tradeoff: [
        { design_id: 'A', weight_kg: 74.2, cost_eur: 14200 },
        { design_id: 'B', weight_kg: 77.1, cost_eur: 13800 },
        { design_id: 'C', weight_kg: 79.3, cost_eur: 13500 },
        { design_id: 'D', weight_kg: 82.4, cost_eur: 13200 },
        { design_id: 'E', weight_kg: 86.1, cost_eur: 12900 }
      ],
      physics: design.cost?.physics || {
        hoop_stress_mpa: 436,
        axial_stress_mpa: 218,
        hoop_to_axial_ratio: 2.0,
        stored_energy_mj: 17.2,
        permeation_rate: design.summary.permeation_rate,
        permeation_limit: 46
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
