import { NextRequest, NextResponse } from 'next/server';

// In-memory store for optimization jobs
const optimizationJobs = new Map<string, {
  status: 'started' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: number;
}>();

// POST /api/optimization - Start optimization job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate unique job ID
    const jobId = `opt-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;

    // Store job
    optimizationJobs.set(jobId, {
      status: 'started',
      startTime: Date.now()
    });

    const response = {
      job_id: jobId,
      status: 'started',
      estimated_duration_seconds: 45,
      stream_url: `/api/optimization/${jobId}/stream`
    };

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error starting optimization:', error);
    return NextResponse.json(
      { error: 'Failed to start optimization', message: String(error) },
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
