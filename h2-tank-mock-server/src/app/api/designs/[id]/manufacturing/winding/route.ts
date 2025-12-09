import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface LayerInfo {
  layer: number;
  type: string;
  angle_deg: number;
  coverage: string;
  thickness_mm: number;
}

interface WindingStep {
  step: number;
  layer_number: number;
  layer_type: string;
  winding_angle_deg: number;
  coverage: string;
  target_thickness_mm: number;
  winding_speed_rpm: number;
  tension_n: number;
  resin_content_target_percent: number;
  passes_per_layer: number;
  estimated_time_min: number;
}

// GET /api/designs/[id]/manufacturing/winding - Get winding sequence with layers, angles, speeds
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

    // Read design file to get layup information
    const filePath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${designId.toLowerCase()}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const design = JSON.parse(fileContent);

    const layup = design.geometry?.layup || {};

    // Generate winding sequence from layup data
    const windingSequence: WindingStep[] = (layup.layers || []).map((layer: LayerInfo, index: number) => ({
      step: index + 1,
      layer_number: layer.layer,
      layer_type: layer.type,
      winding_angle_deg: layer.angle_deg,
      coverage: layer.coverage,
      target_thickness_mm: layer.thickness_mm,
      winding_speed_rpm: layer.type === 'hoop' ? 25 : 15,
      tension_n: layer.type === 'hoop' ? 180 : 220,
      resin_content_target_percent: 38,
      passes_per_layer: layer.type === 'hoop' ? 4 : 2,
      estimated_time_min: layer.type === 'hoop' ? 12 : 18
    }));

    const response = {
      design_id: designId,
      winding_sequence: windingSequence,
      process_parameters: {
        fiber_type: 'T700S Carbon Fiber',
        fiber_tow_size: '12K',
        resin_system: 'Epoxy 8552',
        resin_bath_temp_c: 25,
        mandrel_rotation_axis: 'horizontal',
        delivery_eye_count: 4,
        total_fiber_length_km: 45.3,
        total_resin_mass_kg: 12.8
      },
      quality_checks: [
        { step: 'every_layer', check: 'Visual inspection for gaps', tolerance: 'No gaps > 2mm' },
        { step: 'every_5_layers', check: 'Thickness measurement', tolerance: '±0.2mm' },
        { step: 'every_10_layers', check: 'Resin content check', tolerance: '38% ±3%' },
        { step: 'final', check: 'Final thickness verification', tolerance: 'Within design spec' },
        { step: 'final', check: 'Surface smoothness check', tolerance: 'No bridging or voids' }
      ],
      equipment_setup: {
        winding_machine: 'CNC Filament Winder Model FW-2000',
        mandrel_material: 'Aluminum 6061-T6',
        mandrel_surface_finish: 'Ra 0.8 μm',
        mandrel_coating: 'Release agent applied',
        tension_control: 'Electronic closed-loop',
        resin_bath_capacity_liters: 50
      },
      estimated_total_time: {
        winding_hours: windingSequence.reduce((sum: number, step: WindingStep) => sum + (step.estimated_time_min / 60), 0),
        setup_hours: 4,
        quality_checks_hours: 3,
        total_hours: Math.ceil(windingSequence.reduce((sum: number, step: WindingStep) => sum + (step.estimated_time_min / 60), 0) + 7)
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
