import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/designs/[id]/sentry - Get Sentry monitoring specification
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

    // Generate sensor locations in the format expected by frontend
    const sensorLocations = [
      {
        id: 'sensor-1',
        position: 'Boss Interface (Forward)',
        x: 0,
        y: 175,
        z: 0,
        type: 'strain' as const,
        critical: true,
        inspection_interval_hours: 4380, // 6 months
        rationale: 'Highest stress concentration zone - critical for early fatigue detection'
      },
      {
        id: 'sensor-2',
        position: 'Cylinder Hoop Section',
        x: 600,
        y: 175,
        z: 0,
        type: 'strain' as const,
        critical: true,
        inspection_interval_hours: 8760, // 12 months
        rationale: 'Fatigue critical zone under cyclic pressure loading'
      },
      {
        id: 'sensor-3',
        position: 'Liner-Composite Interface',
        x: 300,
        y: 170,
        z: 90,
        type: 'acoustic' as const,
        critical: true,
        inspection_interval_hours: 720, // Continuous (monthly check)
        rationale: 'Delamination monitoring between liner and composite overwrap'
      },
      {
        id: 'sensor-4',
        position: 'Boss Interface (Aft)',
        x: 1200,
        y: 175,
        z: 0,
        type: 'acoustic' as const,
        critical: true,
        inspection_interval_hours: 4380, // 6 months
        rationale: 'Secondary stress concentration at rear boss connection'
      },
      {
        id: 'sensor-5',
        position: 'Mid-Cylinder (Top)',
        x: 600,
        y: 180,
        z: 0,
        type: 'temperature' as const,
        critical: false,
        inspection_interval_hours: 8760, // 12 months
        rationale: 'Thermal monitoring for fast-fill heat detection'
      },
      {
        id: 'sensor-6',
        position: 'Mid-Cylinder (Bottom)',
        x: 600,
        y: 170,
        z: 180,
        type: 'temperature' as const,
        critical: false,
        inspection_interval_hours: 8760, // 12 months
        rationale: 'Thermal gradient monitoring during operation'
      }
    ];

    // Generate inspection schedule in the format expected by frontend
    const inspectionSchedule = [
      { interval: 'Daily', checks: 'Visual exterior check, pressure gauge reading', duration_min: 5 },
      { interval: 'Monthly', checks: 'Acoustic emission data review, connector inspection', duration_min: 30 },
      { interval: '6 Months', checks: 'Full visual inspection, strain gauge calibration check', duration_min: 120 },
      { interval: 'Annual', checks: 'Comprehensive NDT, permeation test, boss torque check', duration_min: 480 },
      { interval: '5 Years', checks: 'Full recertification, hydraulic proof test, complete sensor replacement', duration_min: 1440 }
    ];

    const response = {
      design_id: design.id,
      // New format for frontend compatibility
      sensor_locations: sensorLocations,
      inspection_schedule: inspectionSchedule,
      // Legacy format for backwards compatibility
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
        { type: 'strain_gauge', count: 2, purpose: 'Fatigue monitoring' },
        { type: 'temperature', count: 2, purpose: 'Thermal monitoring' }
      ],
      inspection_summary: {
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
