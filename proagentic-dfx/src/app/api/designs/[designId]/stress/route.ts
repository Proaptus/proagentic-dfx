import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET /api/designs/:designId/stress - Fetch stress data for a design
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ designId: string }> }
) {
  try {
    const { designId } = await params;
    const dataPath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${designId.toLowerCase()}.json`);

    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(
        { error: `Design ${designId} not found` },
        { status: 404 }
      );
    }

    const designData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Return stress-specific data
    const response = {
      id: designData.id,
      stress: designData.stress || {
        max_von_mises_mpa: 0,
        max_location: 'unknown',
        allowable_mpa: 0,
        margin_percent: 0,
      },
      // Include related failure data
      failure: designData.failure || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching stress data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
