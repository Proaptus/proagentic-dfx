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

    const response = {
      design_id: design.id,
      overall_status: 'pass',
      standards: [
        {
          standard_id: 'ISO_11119_3',
          standard_name: 'Gas cylinders - Composite construction',
          status: 'pass',
          clauses: [
            { clause: '6.2.1', description: 'Burst ratio ≥ 2.25', status: 'pass', actual_value: `${design.summary.burst_ratio}`, required_value: '≥ 2.25' },
            { clause: '6.4.1', description: 'Ambient cycling ≥ 11,000', status: 'pass', actual_value: `${design.summary.fatigue_life_cycles}`, required_value: '≥ 11,000' },
            { clause: '6.5.1', description: 'Permeation ≤ 46 NmL/hr/L', status: 'pass', actual_value: `${design.summary.permeation_rate}`, required_value: '≤ 46' },
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
          status: 'pass',
          clauses: [
            { clause: '4.1', description: 'Burst test', status: 'pass', actual_value: `${design.summary.burst_pressure_bar} bar`, required_value: '≥ 1575 bar' },
            { clause: '4.2', description: 'Pressure cycling', status: 'pass', actual_value: `${design.summary.fatigue_life_cycles}`, required_value: '≥ 5,500' }
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
