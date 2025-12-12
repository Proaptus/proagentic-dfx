import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { generateIsotensoidDome } from '@/lib/physics/dome-geometry';
import { getNettingTheoryAngle } from '@/lib/physics/pressure-vessel';

// Featured design IDs with JSON files
const FEATURED_DESIGNS = ['A', 'B', 'C', 'D', 'E'];

// Validate Pareto design ID format (P06-P99)
const isParetoDesignId = (id: string): boolean => {
  return /^P\d{2}$/i.test(id);
};

// GET /api/designs/[id]/geometry - Get 3D geometry data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const designId = id.toUpperCase();

    const isFeatured = FEATURED_DESIGNS.includes(designId);
    const isPareto = isParetoDesignId(designId);

    if (!isFeatured && !isPareto) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    let design;

    if (isFeatured) {
      const filePath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${designId.toLowerCase()}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      design = JSON.parse(fileContent);
    } else {
      // For Pareto designs, use Design C as template and scale based on Pareto data
      const templatePath = path.join(process.cwd(), 'data', 'static', 'designs', 'design-c.json');
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = JSON.parse(templateContent);

      // ISSUE-003: Load Pareto data from mock server's own data directory
      const paretoPath = path.join(process.cwd(), 'data', 'static', 'pareto', 'pareto-50.json');
      const paretoContent = await fs.readFile(paretoPath, 'utf-8');
      const paretoData = JSON.parse(paretoContent);

      const paretoDesign = paretoData.pareto_designs.find(
        (d: { id: string }) => d.id.toUpperCase() === designId
      );

      if (!paretoDesign) {
        return NextResponse.json({ error: 'Pareto design not found' }, { status: 404 });
      }

      // Scale geometry based on weight ratio (proxy for size)
      const weightRatio = paretoDesign.weight_kg / 79.3; // 79.3 is Design C weight
      const scaleFactor = Math.pow(weightRatio, 1/3); // Cube root for volume-to-linear scaling

      design = {
        ...template,
        id: paretoDesign.id,
        geometry: {
          ...template.geometry,
          dimensions: {
            ...template.geometry.dimensions,
            // Scale dimensions proportionally
            inner_radius_mm: Math.round(template.geometry.dimensions.inner_radius_mm * scaleFactor),
            cylinder_length_mm: Math.round(template.geometry.dimensions.cylinder_length_mm * scaleFactor),
            total_length_mm: Math.round(template.geometry.dimensions.total_length_mm * scaleFactor),
            wall_thickness_mm: template.geometry.dimensions.wall_thickness_mm * (weightRatio > 1 ? 1.05 : 0.95),
          },
        },
      };
    }

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
