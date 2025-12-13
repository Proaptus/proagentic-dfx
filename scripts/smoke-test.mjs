#!/usr/bin/env node
/**
 * Post-Deployment Smoke Test
 *
 * Verifies a deployed instance is working correctly.
 * Run after Vercel deployment to catch production issues.
 *
 * Usage:
 *   npm run smoke-test -- --url=https://your-deployment.vercel.app
 *   npm run smoke-test -- --url=$VERCEL_URL
 */

import https from 'https';
import http from 'http';

const args = process.argv.slice(2);
const urlArg = args.find(a => a.startsWith('--url='));
const BASE_URL = urlArg ? urlArg.split('=')[1] : process.env.SMOKE_TEST_URL;

if (!BASE_URL) {
  console.error('❌ No URL provided. Use --url=<deployment-url> or set SMOKE_TEST_URL env var');
  process.exit(1);
}

console.log(`\n🔍 Running smoke tests against: ${BASE_URL}\n`);

const CRITICAL_ENDPOINTS = [
  { path: '/api/health', expectStatus: 200, name: 'Health Check' },
  { path: '/api/designs/A', expectStatus: 200, name: 'Design A Data' },
  { path: '/api/designs/A/stress', expectStatus: 200, name: 'Stress Analysis' },
  { path: '/api/designs/A/failure', expectStatus: 200, name: 'Failure Analysis' },
  { path: '/api/standards', expectStatus: 200, name: 'Standards List' },
  { path: '/api/materials', expectStatus: 200, name: 'Materials List' },
  { path: '/', expectStatus: 200, name: 'Homepage' },
];

async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  const client = url.startsWith('https') ? https : http;

  return new Promise((resolve) => {
    const startTime = Date.now();

    const req = client.get(url, { timeout: 15000 }, (res) => {
      const responseTime = Date.now() - startTime;
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const success = res.statusCode === endpoint.expectStatus;
        resolve({
          name: endpoint.name,
          path: endpoint.path,
          status: res.statusCode,
          expected: endpoint.expectStatus,
          success,
          responseTime,
          error: success ? null : `Expected ${endpoint.expectStatus}, got ${res.statusCode}`
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        name: endpoint.name,
        path: endpoint.path,
        status: null,
        expected: endpoint.expectStatus,
        success: false,
        responseTime: Date.now() - startTime,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        path: endpoint.path,
        status: null,
        expected: endpoint.expectStatus,
        success: false,
        responseTime: 15000,
        error: 'Request timeout (15s)'
      });
    });
  });
}

async function runTests() {
  const results = [];

  for (const endpoint of CRITICAL_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);

    const icon = result.success ? '✅' : '❌';
    const time = `${result.responseTime}ms`;
    console.log(`${icon} ${result.name.padEnd(20)} ${result.path.padEnd(30)} ${time.padStart(8)}`);
    if (result.error) {
      console.log(`   └─ Error: ${result.error}`);
    }
  }

  console.log('\n' + '='.repeat(70));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgTime = Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length);

  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`Average response time: ${avgTime}ms`);
  console.log('='.repeat(70) + '\n');

  if (failed > 0) {
    console.error('❌ SMOKE TEST FAILED - Deployment has issues!\n');
    console.error('Failed endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.error(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }

  console.log('✅ SMOKE TEST PASSED - Deployment is healthy!\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error(`❌ Unexpected error: ${err.message}`);
  process.exit(1);
});
