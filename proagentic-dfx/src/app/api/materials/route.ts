import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import carbonFibers from '../../../../data/static/materials/carbon-fibers.json';
import glassFibers from '../../../../data/static/materials/glass-fibers.json';
import matrixResins from '../../../../data/static/materials/matrix-resins.json';
import linerMaterials from '../../../../data/static/materials/liner-materials.json';
import bossMaterials from '../../../../data/static/materials/boss-materials.json';

// Type definitions for material categories
type MaterialType = 'carbon_fiber' | 'glass_fiber' | 'matrix' | 'liner' | 'boss' | 'fiber';

// GET /api/materials - Get materials with optional type filtering
// Query params:
//   - type: filter by material type (carbon_fiber, glass_fiber, matrix, liner, boss, fiber)
//   - id: get specific material by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const typeParam = searchParams.get('type') as MaterialType | null;
    const idParam = searchParams.get('id');

    // Combine all materials
    const allMaterials = [
      ...carbonFibers,
      ...glassFibers,
      ...matrixResins,
      ...linerMaterials,
      ...bossMaterials,
    ];

    // Filter by ID if specified
    if (idParam) {
      const material = allMaterials.find((m) => m.id === idParam);
      if (!material) {
        return NextResponse.json(
          { error: 'Material not found', id: idParam },
          { status: 404 }
        );
      }
      return NextResponse.json(material, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Filter by type if specified
    let filteredMaterials = allMaterials;

    if (typeParam) {
      switch (typeParam) {
        case 'carbon_fiber':
          filteredMaterials = carbonFibers;
          break;
        case 'glass_fiber':
          filteredMaterials = glassFibers;
          break;
        case 'fiber':
          // Return all fiber types (carbon + glass)
          filteredMaterials = [...carbonFibers, ...glassFibers];
          break;
        case 'matrix':
          filteredMaterials = matrixResins;
          break;
        case 'liner':
          filteredMaterials = linerMaterials;
          break;
        case 'boss':
          filteredMaterials = bossMaterials;
          break;
        default:
          return NextResponse.json(
            {
              error: 'Invalid material type',
              type: typeParam,
              validTypes: ['carbon_fiber', 'glass_fiber', 'fiber', 'matrix', 'liner', 'boss']
            },
            { status: 400 }
          );
      }
    }

    return NextResponse.json(filteredMaterials, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch materials', message: String(error) },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
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
