import { NextRequest, NextResponse } from 'next/server';

// GET /api/designs/[id]/test-plan - Get test plan data
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

    const response = {
      design_id: designId,
      tests: [
        { test: 'Hydrostatic burst', articles: 3, duration: '1 week', parameters: '≥1,575 bar' },
        { test: 'Ambient cycling', articles: 3, duration: '6 weeks', parameters: '11,000 cycles, 2-700 bar' },
        { test: 'Extreme temperature', articles: 1, duration: '2 weeks', parameters: '-40°C to +85°C' },
        { test: 'Bonfire', articles: 1, duration: '1 day', parameters: 'PRD activation' },
        { test: 'Drop test', articles: 2, duration: '1 day', parameters: '1.8m onto concrete' },
        { test: 'Gunshot', articles: 1, duration: '1 day', parameters: '.30 cal AP' },
        { test: 'Permeation', articles: 1, duration: '4 weeks', parameters: '≤46 NmL/hr/L' }
      ],
      total_articles: '8-10',
      total_duration: '12-16 weeks',
      estimated_cost: '€75,000 - €95,000'
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
