import { NextRequest, NextResponse } from 'next/server';
import paretoData from '../../../../../data/static/pareto/pareto-50.json';

// GET /api/optimization/[id] - Get optimization job status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // For demo, always return completed status
  const response = {
    job_id: id,
    status: 'completed',
    execution_time_seconds: 42,
    results_url: `/api/optimization/${id}/results`
  };

  return NextResponse.json(response, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// DELETE /api/optimization/[id] - Cancel optimization job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    job_id: id,
    status: 'cancelled',
    message: 'Optimization job cancelled'
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
