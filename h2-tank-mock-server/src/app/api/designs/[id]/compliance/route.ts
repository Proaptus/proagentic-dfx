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

    const response = {
      design_id: design.id,
      overall_status: allPass ? 'pass' : 'fail',
      standards: [
        {
          standard_id: 'ISO_11119_3',
          standard_name: 'Gas cylinders - Composite construction',
          status: burstRatioPass && fatigueCyclesPass && permeationPass ? 'pass' : 'fail',
          clauses: [
            { clause: '6.2.1', description: 'Burst ratio ≥ 2.25', status: burstRatioPass ? 'pass' : 'fail', actual_value: `${burstRatio}`, required_value: '≥ 2.25' },
            { clause: '6.4.1', description: 'Ambient cycling ≥ 11,000', status: fatigueCyclesPass ? 'pass' : 'fail', actual_value: `${fatigueCycles}`, required_value: '≥ 11,000' },
            { clause: '6.5.1', description: 'Permeation ≤ 46 NmL/hr/L', status: permeationPass ? 'pass' : 'fail', actual_value: `${permeationRate}`, required_value: '≤ 46' },
            { clause: '6.6.1', description: 'Fire test (bonfire)', status: 'pass', actual_value: 'PRD activation', required_value: 'PRD activation' }
          ]
        },
        {
          standard_id: 'UN_R134',
          standard_name: 'Hydrogen vehicles - Safety requirements',
          status: 'pass',
          clauses: [
            { clause: '5.1.1', description: 'Temperature range -40°C to +85°C', status: 'pass', actual_value: '-40 to +85', required_value: '-40 to +85' },
            { clause: '5.2.1', description: 'Bonfire test', status: 'pass', actual_value: 'Pass', required_value: 'PRD activation < 20min' },
            { clause: '5.3.1', description: 'Gunshot penetration test', status: 'pass', actual_value: 'Pass', required_value: 'No rupture' }
          ]
        },
        {
          standard_id: 'EC_79_2009',
          standard_name: 'Type-approval (superseded)',
          status: burstPressurePass && ec79CyclesPass ? 'pass' : 'fail',
          clauses: [
            { clause: '4.1', description: 'Burst test', status: burstPressurePass ? 'pass' : 'fail', actual_value: `${burstPressure} bar`, required_value: '≥ 1575 bar' },
            { clause: '4.2', description: 'Pressure cycling', status: ec79CyclesPass ? 'pass' : 'fail', actual_value: `${fatigueCycles}`, required_value: '≥ 5,500' }
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
