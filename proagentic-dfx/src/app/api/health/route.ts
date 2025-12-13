import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * GET /api/health - System health check endpoint
 *
 * Purpose: Verify deployment is working end-to-end
 * - Checks API routes are accessible
 * - Validates data files are bundled (outputFileTracingIncludes)
 * - Reports environment configuration
 *
 * Use: Post-deployment smoke test to catch production issues
 */
export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; details?: string }> = {};
  const startTime = Date.now();

  // Check 1: API route is accessible (if we got here, it works)
  checks.api_routing = { status: 'ok' };

  // Check 2: Data files are bundled (critical for Vercel serverless)
  try {
    const dataDir = path.join(process.cwd(), 'data', 'static', 'designs');
    const files = await fs.readdir(dataDir);
    if (files.length > 0) {
      checks.data_files = { status: 'ok', details: `${files.length} design files found` };
    } else {
      checks.data_files = { status: 'error', details: 'No design files found' };
    }
  } catch (error) {
    checks.data_files = {
      status: 'error',
      details: `Failed to read data directory: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }

  // Check 3: Environment configuration
  const hasApiUrl = !!process.env.NEXT_PUBLIC_API_URL;
  const hasMockServer = !!process.env.MOCK_SERVER_URL;
  checks.environment = {
    status: 'ok',
    details: `API_URL=${hasApiUrl ? 'set' : 'default'}, MOCK_SERVER=${hasMockServer ? 'enabled' : 'disabled'}`
  };

  // Check 4: Verify a sample design file can be read
  try {
    const sampleFile = path.join(process.cwd(), 'data', 'static', 'designs', 'design-a.json');
    const content = await fs.readFile(sampleFile, 'utf-8');
    const parsed = JSON.parse(content);
    if (parsed.id) {
      checks.design_data = { status: 'ok', details: `Design ${parsed.id} readable` };
    } else {
      checks.design_data = { status: 'error', details: 'Design file missing id field' };
    }
  } catch (error) {
    checks.design_data = {
      status: 'error',
      details: `Cannot read design file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }

  // Determine overall status
  const hasErrors = Object.values(checks).some(c => c.status === 'error');
  const responseTime = Date.now() - startTime;

  const response = {
    status: hasErrors ? 'unhealthy' : 'healthy',
    timestamp: new Date().toISOString(),
    response_time_ms: responseTime,
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    environment: process.env.NODE_ENV,
    checks
  };

  return NextResponse.json(response, {
    status: hasErrors ? 503 : 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
