import { NextRequest, NextResponse } from 'next/server';

interface ExportRequest {
  design_id: string;
  include: {
    geometry?: string[];
    manufacturing?: string[];
    analysis?: string[];
    compliance?: string[];
    sentry?: string[];
  };
  format: 'zip';
}

// POST /api/export - Start export package generation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ExportRequest;

    const exportId = `exp-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;

    const response = {
      export_id: exportId,
      status: 'generating',
      estimated_duration_seconds: 30,
      status_url: `/api/export/${exportId}`
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
