import { NextRequest, NextResponse } from 'next/server';
import paretoData from '../../../../../../data/static/pareto/pareto-50.json';

// GET /api/optimization/[id]/results - Get optimization results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Find the recommended design from pareto_designs
  const designs = (paretoData as { pareto_designs: Array<{ id: string; [key: string]: unknown }> }).pareto_designs;
  const recommendedId = (paretoData as { recommended_design_id: string }).recommended_design_id;
  const recommendedDesign = designs.find(d => d.id === recommendedId) || designs[0];

  // Return format expected by frontend: pareto_front and recommended (as object)
  const response = {
    job_id: id,
    status: 'completed',
    pareto_front: designs,
    recommended: recommendedDesign
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
