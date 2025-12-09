import { NextRequest, NextResponse } from 'next/server';

// GET /api/designs/[id]/validation - Get validation data (sensor locations and inspection schedule)
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

    // Sensor locations vary by design complexity
    const baseSensors = [
      { id: 'S1', name: 'Dome Apex', position: { x: 0, y: 0, z: 250 }, type: 'strain_gauge' },
      { id: 'S2', name: 'Cylinder Mid', position: { x: 150, y: 0, z: 0 }, type: 'strain_gauge' },
      { id: 'S3', name: 'Boss Region', position: { x: 40, y: 0, z: 240 }, type: 'strain_gauge' },
      { id: 'S4', name: 'Dome Transition', position: { x: 175, y: 0, z: 50 }, type: 'strain_gauge' },
      { id: 'T1', name: 'Liner Inner Surface', position: { x: 0, y: 175, z: 0 }, type: 'thermocouple' },
      { id: 'T2', name: 'Composite Mid-Wall', position: { x: 0, y: 187, z: 0 }, type: 'thermocouple' },
      { id: 'T3', name: 'Outer Surface', position: { x: 0, y: 200, z: 0 }, type: 'thermocouple' },
      { id: 'P1', name: 'Internal Pressure', position: { x: 0, y: 0, z: -100 }, type: 'pressure_transducer' },
      { id: 'AE1', name: 'Cylinder AE', position: { x: 100, y: 0, z: 0 }, type: 'acoustic_emission' },
      { id: 'AE2', name: 'Dome AE', position: { x: 80, y: 0, z: 200 }, type: 'acoustic_emission' }
    ];

    const inspectionSchedule = [
      { cycles: 0, type: 'Visual', description: 'Initial pre-test visual inspection', duration_min: 30 },
      { cycles: 100, type: 'Visual', description: 'Surface inspection for matrix cracking', duration_min: 15 },
      { cycles: 500, type: 'NDT', description: 'Ultrasonic scanning for delamination', duration_min: 120 },
      { cycles: 1000, type: 'Visual + NDT', description: 'Combined visual and UT inspection', duration_min: 150 },
      { cycles: 2000, type: 'NDT', description: 'Full ultrasonic mapping', duration_min: 180 },
      { cycles: 5000, type: 'Visual + NDT + AE', description: 'Comprehensive inspection with acoustic emission', duration_min: 240 },
      { cycles: 10000, type: 'Full', description: 'Complete inspection including CT scan if available', duration_min: 360 },
      { cycles: 15000, type: 'Visual + NDT', description: 'Mid-life inspection', duration_min: 150 },
      { cycles: 20000, type: 'Full', description: 'End-of-life assessment', duration_min: 420 }
    ];

    const response = {
      design_id: designId,
      sensor_locations: baseSensors,
      inspection_schedule: inspectionSchedule,
      validation_plan: {
        total_test_duration_days: 90,
        ambient_cycles: 5500,
        extreme_temp_cycles: 5500,
        fast_fill_tests: 50,
        leak_tests: 10,
        final_burst_test: true
      },
      acceptance_criteria: {
        no_visible_damage: true,
        no_leakage_detected: true,
        strain_within_limits: true,
        acoustic_emission_acceptable: true,
        min_burst_pressure_bar: 1575
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
