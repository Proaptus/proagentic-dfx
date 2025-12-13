import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/designs/[id]/cost - Get cost breakdown data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ designId: string }> }
) {
  try {
    const { designId: id } = await params;
    const designId = id.toUpperCase();

    const validDesigns = ['A', 'B', 'C', 'D', 'E'];
    if (!validDesigns.includes(designId)) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${designId.toLowerCase()}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const design = JSON.parse(fileContent);

    const baseCost = design.summary.cost_eur;

    // Get breakdown from design or use defaults
    interface BreakdownItem {
      component: string;
      cost_eur: number;
      percentage: number;
    }

    let breakdown: BreakdownItem[] = design.cost?.breakdown || [
      { component: 'Carbon Fiber', cost_eur: Math.round(baseCost * 0.47), percentage: 47 },
      { component: 'Resin', cost_eur: Math.round(baseCost * 0.04), percentage: 4 },
      { component: 'Liner', cost_eur: Math.round(baseCost * 0.03), percentage: 3 },
      { component: 'Boss', cost_eur: Math.round(baseCost * 0.03), percentage: 3 },
      { component: 'Labor', cost_eur: Math.round(baseCost * 0.18), percentage: 18 },
      { component: 'Overhead', cost_eur: Math.round(baseCost * 0.14), percentage: 14 },
      { component: 'Margin', cost_eur: Math.round(baseCost * 0.11), percentage: 11 }
    ];

    // Add "Materials" rollup if not present (sum of Carbon fiber/Fiber, Resin, Liner, Boss)
    const hasMaterials = breakdown.some((b: BreakdownItem) => b.component === 'Materials');
    if (!hasMaterials) {
      const materialComponents = ['Carbon fiber', 'Carbon Fiber', 'Resin', 'Liner', 'Boss'];
      const materialsCost = breakdown
        .filter((b: BreakdownItem) => materialComponents.includes(b.component))
        .reduce((sum: number, b: BreakdownItem) => sum + b.cost_eur, 0);
      const materialsPercent = breakdown
        .filter((b: BreakdownItem) => materialComponents.includes(b.component))
        .reduce((sum: number, b: BreakdownItem) => sum + b.percentage, 0);

      // Insert Materials at the beginning
      breakdown = [
        { component: 'Materials', cost_eur: materialsCost, percentage: materialsPercent },
        ...breakdown
      ];
    }

    const response = {
      design_id: design.id,
      unit_cost_eur: baseCost,
      breakdown,
      // Weight-cost tradeoff with correct field names for scatter chart
      weight_cost_tradeoff: [
        { label: 'Design A (Lightweight)', weight: 74.2, cost: 14200 },
        { label: 'Design B (Balanced)', weight: 77.1, cost: 13800 },
        { label: 'Design C (Optimal)', weight: 79.3, cost: baseCost },
        { label: 'Design D (Cost-Effective)', weight: 82.4, cost: 13200 },
        { label: 'Design E (Budget)', weight: 86.1, cost: 12900 }
      ],
      // Volume sensitivity for line chart
      volume_sensitivity: [
        { label: '500', volume: 500, unit_cost: Math.round(baseCost * 1.45) },
        { label: '1,000', volume: 1000, unit_cost: Math.round(baseCost * 1.20) },
        { label: '2,500', volume: 2500, unit_cost: Math.round(baseCost * 1.08) },
        { label: '5,000', volume: 5000, unit_cost: baseCost },
        { label: '10,000', volume: 10000, unit_cost: Math.round(baseCost * 0.88) },
        { label: '25,000', volume: 25000, unit_cost: Math.round(baseCost * 0.75) },
        { label: '50,000', volume: 50000, unit_cost: Math.round(baseCost * 0.68) }
      ],
      // Material cost comparison for table
      material_comparison: [
        { material: 'T700 Carbon Fiber (Current)', cost_per_kg: 45, relative: 1.0 },
        { material: 'T800S Carbon Fiber', cost_per_kg: 75, relative: 1.67 },
        { material: 'T1000G Carbon Fiber', cost_per_kg: 145, relative: 3.22 },
        { material: 'E-Glass Fiber', cost_per_kg: 8, relative: 0.18 },
        { material: 'S-Glass Fiber', cost_per_kg: 18, relative: 0.40 },
        { material: 'Basalt Fiber', cost_per_kg: 12, relative: 0.27 }
      ],
      // Learning curve data for manufacturing
      learning_curve: [
        { batch: 1, cost_multiplier: 2.5 },
        { batch: 2, cost_multiplier: 2.13 },
        { batch: 5, cost_multiplier: 1.70 },
        { batch: 10, cost_multiplier: 1.45 },
        { batch: 20, cost_multiplier: 1.23 },
        { batch: 50, cost_multiplier: 1.0 },
        { batch: 100, cost_multiplier: 0.85 }
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
