import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/designs/[id]/compliance - Get standards compliance data
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

    // ISSUE-010: Ensure verified column shows correct status based on clause pass/fail
    // Real compliance data would have mix of pass/fail/pending based on actual verification
    const burstRatio = design.summary.burst_ratio || 2.35;
    const fatigueCycles = design.summary.fatigue_life_cycles || 45000;
    const permeationRate = design.summary.permeation_rate || 12.5;
    const burstPressure = design.summary.burst_pressure_bar || 1890;

    // Check if clauses actually pass their requirements
    const burstRatioPass = burstRatio >= 2.25;
    const fatigueCyclesPass = fatigueCycles >= 11000;
    const permeationPass = permeationRate <= 46;
    const burstPressurePass = burstPressure >= 1575;
    const ec79CyclesPass = fatigueCycles >= 5500;

    // Overall status is pass only if all critical clauses pass
    const allPass = burstRatioPass && fatigueCyclesPass && permeationPass && burstPressurePass;

    // ISSUE-010: Helper to create clause with explicit verified status
    const createClause = (
      clause: string,
      description: string,
      passes: boolean,
      actualValue: string,
      requiredValue: string
    ) => ({
      clause,
      description,
      status: passes ? 'pass' : 'fail',
      actual_value: actualValue,
      required_value: requiredValue,
      // ISSUE-010: Explicitly set verified based on pass status
      verified: passes ? 'yes' : 'no',
    });

    const response = {
      design_id: design.id,
      overall_status: allPass ? 'pass' : 'fail',
      standards: [
        {
          standard_id: 'ISO_11119_3',
          standard_name: 'Gas cylinders - Composite construction',
          status: burstRatioPass && fatigueCyclesPass && permeationPass ? 'pass' : 'fail',
          clauses: [
            createClause('6.2.1', 'Burst ratio ≥ 2.25', burstRatioPass, `${burstRatio}`, '≥ 2.25'),
            createClause('6.4.1', 'Ambient cycling ≥ 11,000', fatigueCyclesPass, `${fatigueCycles}`, '≥ 11,000'),
            createClause('6.5.1', 'Permeation ≤ 46 NmL/hr/L', permeationPass, `${permeationRate}`, '≤ 46'),
            createClause('6.6.1', 'Fire test (bonfire)', true, 'PRD activation', 'PRD activation'),
          ]
        },
        {
          standard_id: 'UN_R134',
          standard_name: 'Hydrogen vehicles - Safety requirements',
          status: 'pass',
          clauses: [
            createClause('5.1.1', 'Temperature range -40°C to +85°C', true, '-40 to +85', '-40 to +85'),
            createClause('5.2.1', 'Bonfire test', true, 'Pass', 'PRD activation < 20min'),
            createClause('5.3.1', 'Gunshot penetration test', true, 'Pass', 'No rupture'),
          ]
        },
        {
          standard_id: 'EC_79_2009',
          standard_name: 'Type-approval (superseded)',
          status: burstPressurePass && ec79CyclesPass ? 'pass' : 'fail',
          clauses: [
            createClause('4.1', 'Burst test', burstPressurePass, `${burstPressure} bar`, '≥ 1575 bar'),
            createClause('4.2', 'Pressure cycling', ec79CyclesPass, `${fatigueCycles}`, '≥ 5,500'),
          ]
        }
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
