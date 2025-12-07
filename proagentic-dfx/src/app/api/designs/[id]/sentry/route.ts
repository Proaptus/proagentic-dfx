import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/designs/[id]/sentry - Get Sentry monitoring specification
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
      critical_monitoring_points: design.sentry?.critical_points?.map((p: { id: number; region: string; reason: string; interval_months: number }, i: number) => ({
        id: p.id || i + 1,
        location: { r: 175, z: i * 400, theta: 0 },
        region: p.region,
        reason: p.reason,
        recommended_sensor: i === 0 ? 'acoustic_emission' : i === 1 ? 'strain_gauge' : 'acoustic_emission',
        inspection_interval_months: p.interval_months
      })) || [
        { id: 1, location: { r: 175, z: 180, theta: 0 }, region: 'dome_boss_interface', reason: 'Highest stress concentration', recommended_sensor: 'acoustic_emission', inspection_interval_months: 6 },
        { id: 2, location: { r: 175, z: 600, theta: 0 }, region: 'cylinder_hoop', reason: 'Fatigue critical zone', recommended_sensor: 'strain_gauge', inspection_interval_months: 12 },
        { id: 3, location: { r: 175, z: 0, theta: 0 }, region: 'liner_composite_interface', reason: 'Delamination monitoring', recommended_sensor: 'acoustic_emission', inspection_interval_months: 24 }
      ],
      recommended_sensors: design.sentry?.sensors || [
        { type: 'acoustic_emission', count: 2, purpose: 'Crack/delamination detection' },
        { type: 'strain_gauge', count: 1, purpose: 'Fatigue monitoring' },
        { type: 'temperature', count: 1, purpose: 'Thermal monitoring' }
      ],
      inspection_schedule: {
        visual: 'every 6 months',
        acoustic_monitoring: 'continuous',
        full_inspection: 'every 5 years',
        replacement_trigger: 'Acoustic events > threshold OR 15 years'
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
