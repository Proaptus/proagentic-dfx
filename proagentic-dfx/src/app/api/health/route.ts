import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '0.1.0',
    capabilities: {
      wasm: true,
      onnx: false, // Will be true when ONNX is added
      truck: false, // Will be true when Truck WASM is added
    },
  });
}
