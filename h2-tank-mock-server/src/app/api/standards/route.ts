import { NextResponse } from 'next/server';
import standardsData from '../../../../data/static/standards/h2-standards.json';

// GET /api/standards - Get all hydrogen tank standards
export async function GET() {
  try {
    return NextResponse.json(standardsData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching standards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standards', message: String(error) },
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
