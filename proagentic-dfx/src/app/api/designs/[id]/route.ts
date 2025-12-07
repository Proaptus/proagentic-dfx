import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/designs/[id] - Get design summary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const designId = id.toUpperCase();

    // Map design ID to file (A-E are the main designs)
    const validDesigns = ['A', 'B', 'C', 'D', 'E'];

    if (!validDesigns.includes(designId)) {
      return NextResponse.json(
        { error: 'Design not found', message: `Design ${id} does not exist` },
        { status: 404 }
      );
    }

    // Read design file
    const filePath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${designId.toLowerCase()}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const design = JSON.parse(fileContent);

    // Return summary
    return NextResponse.json({
      id: design.id,
      trade_off_category: design.trade_off_category,
      recommendation_reason: design.recommendation_reason,
      summary: design.summary
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching design:', error);
    return NextResponse.json(
      { error: 'Failed to fetch design', message: String(error) },
      { status: 500 }
    );
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
