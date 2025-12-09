import { NextRequest, NextResponse } from 'next/server';

// GET /api/designs/[id]/manufacturing/cure - Get cure cycle profile (time, temperature, pressure)
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

    // Standard cure cycle for epoxy 8552 resin system
    const cureCycleProfile = [
      {
        step: 1,
        name: 'Ramp to dwell 1',
        start_time_min: 0,
        end_time_min: 60,
        start_temp_c: 25,
        end_temp_c: 120,
        ramp_rate_c_per_min: 1.58,
        pressure_bar: 0,
        vacuum_bar: -0.85,
        action: 'Heat up with vacuum'
      },
      {
        step: 2,
        name: 'Dwell 1 - Resin flow',
        start_time_min: 60,
        end_time_min: 120,
        start_temp_c: 120,
        end_temp_c: 120,
        ramp_rate_c_per_min: 0,
        pressure_bar: 0,
        vacuum_bar: -0.85,
        action: 'Hold temperature to allow resin flow'
      },
      {
        step: 3,
        name: 'Apply pressure',
        start_time_min: 120,
        end_time_min: 125,
        start_temp_c: 120,
        end_temp_c: 120,
        ramp_rate_c_per_min: 0,
        pressure_bar: 6,
        vacuum_bar: 0,
        action: 'Release vacuum and apply autoclave pressure'
      },
      {
        step: 4,
        name: 'Ramp to dwell 2',
        start_time_min: 125,
        end_time_min: 185,
        start_temp_c: 120,
        end_temp_c: 180,
        ramp_rate_c_per_min: 1.0,
        pressure_bar: 6,
        vacuum_bar: 0,
        action: 'Heat up to final cure temperature'
      },
      {
        step: 5,
        name: 'Dwell 2 - Final cure',
        start_time_min: 185,
        end_time_min: 305,
        start_temp_c: 180,
        end_temp_c: 180,
        ramp_rate_c_per_min: 0,
        pressure_bar: 6,
        vacuum_bar: 0,
        action: 'Hold at cure temperature for complete polymerization'
      },
      {
        step: 6,
        name: 'Cool down',
        start_time_min: 305,
        end_time_min: 425,
        start_temp_c: 180,
        end_temp_c: 60,
        ramp_rate_c_per_min: -1.0,
        pressure_bar: 6,
        vacuum_bar: 0,
        action: 'Controlled cooling under pressure'
      },
      {
        step: 7,
        name: 'Depressurize',
        start_time_min: 425,
        end_time_min: 435,
        start_temp_c: 60,
        end_temp_c: 60,
        ramp_rate_c_per_min: 0,
        pressure_bar: 0,
        vacuum_bar: 0,
        action: 'Release pressure gradually'
      },
      {
        step: 8,
        name: 'Final cool to ambient',
        start_time_min: 435,
        end_time_min: 495,
        start_temp_c: 60,
        end_temp_c: 25,
        ramp_rate_c_per_min: -0.58,
        pressure_bar: 0,
        vacuum_bar: 0,
        action: 'Cool to room temperature'
      }
    ];

    const response = {
      design_id: designId,
      cure_cycle_profile: cureCycleProfile,
      resin_system: {
        name: 'Epoxy 8552',
        manufacturer: 'Hexcel',
        type: 'Toughened epoxy',
        pot_life_hours: 4,
        gel_time_min_at_120c: 45,
        glass_transition_temp_c: 190
      },
      autoclave_requirements: {
        min_size_mm: { length: 2000, diameter: 800 },
        max_pressure_bar: 10,
        max_temp_c: 200,
        heating_zones: 3,
        temperature_uniformity_c: '±3',
        pressure_uniformity_percent: '±2'
      },
      monitoring: {
        thermocouples: [
          { location: 'Part surface - dome', target_tolerance_c: '±5' },
          { location: 'Part surface - cylinder', target_tolerance_c: '±5' },
          { location: 'Autoclave ambient', target_tolerance_c: '±3' }
        ],
        pressure_sensors: [
          { location: 'Autoclave main', target_tolerance_bar: '±0.2' }
        ],
        vacuum_sensors: [
          { location: 'Bag vacuum line', target_tolerance_bar: '±0.1' }
        ],
        data_logging_interval_sec: 10
      },
      quality_checks: [
        {
          timing: 'Pre-cure',
          checks: [
            'Verify vacuum bag integrity (hold -0.85 bar for 10 min)',
            'Check thermocouple placement',
            'Verify autoclave calibration current'
          ]
        },
        {
          timing: 'During cure',
          checks: [
            'Monitor temperature uniformity across part',
            'Verify pressure ramp rates',
            'Check for vacuum leaks (steps 1-2)',
            'Monitor resin flow (visual inspection through autoclave window)'
          ]
        },
        {
          timing: 'Post-cure',
          checks: [
            'Verify complete cure (DSC test sample)',
            'Check for surface defects',
            'Measure final part dimensions',
            'Ultrasonic inspection for voids (<2% void content)'
          ]
        }
      ],
      total_cycle_time: {
        hours: 8.25,
        minutes: 495
      },
      estimated_energy_consumption: {
        heating_kwh: 145,
        pressurization_kwh: 12,
        total_kwh: 157
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
