import { NextRequest, NextResponse } from 'next/server';
import paretoData from '../../../../../../data/static/pareto/pareto-50.json';

// GET /api/optimization/[id]/results - Get optimization results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Return the static Pareto results with the job ID
  const response = {
    ...paretoData,
    job_id: id
  };

  return NextResponse.json(response, {
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
