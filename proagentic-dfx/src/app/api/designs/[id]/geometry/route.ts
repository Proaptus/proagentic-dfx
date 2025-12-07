import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { generateIsotensoidDome } from '@/lib/physics/dome-geometry';
import { getNettingTheoryAngle } from '@/lib/physics/pressure-vessel';

// GET /api/designs/[id]/geometry - Get 3D geometry data
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

    // Generate real isotensoid dome profile using first-principles physics
    const nettingAngle = getNettingTheoryAngle(); // 54.74°
    const cylinderRadius = design.geometry.dimensions.inner_radius_mm;
    const bossRadius = design.geometry.dome.parameters.boss_id_mm / 2;

    // Generate isotensoid profile
    const isotensoidProfile = generateIsotensoidDome(
      cylinderRadius,
      nettingAngle,
      bossRadius,
      50 // 50 points
    );

    // Update dome geometry with real physics-based profile
    const geometryData = {
      ...design.geometry,
      dome: {
        ...design.geometry.dome,
        type: 'isotensoid' as const,
        parameters: {
          ...design.geometry.dome.parameters,
          alpha_0_deg: Math.round(nettingAngle * 100) / 100,
        },
        profile_points: isotensoidProfile,
      },
    };

    // Return geometry data with real isotensoid dome
    return NextResponse.json({
      design_id: design.id,
      ...geometryData
    }, {
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
