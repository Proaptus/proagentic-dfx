#!/usr/bin/env node
/**
 * Production Build Validation Script
 *
 * Runs before deployment to catch dev/prod misalignment issues:
 * 1. Builds production bundle
 * 2. Starts production server
 * 3. Hits health endpoint to verify APIs work
 * 4. Exits with error if any check fails
 *
 * Usage: npm run validate:prod
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';

const execAsync = promisify(exec);

const FRONTEND_DIR = 'proagentic-dfx';
const PORT = 3099; // Use unusual port to avoid conflicts
const HEALTH_ENDPOINT = `http://localhost:${PORT}/api/health`;
const MAX_STARTUP_WAIT_MS = 60000;
const HEALTH_CHECK_INTERVAL_MS = 2000;

async function log(message) {
  console.log(`[validate-prod] ${message}`);
}

async function error(message) {
  console.error(`[validate-prod] ❌ ${message}`);
}

async function success(message) {
  console.log(`[validate-prod] ✅ ${message}`);
}

async function buildProduction() {
  log('Building production bundle...');
  try {
    const { stdout, stderr } = await execAsync(`cd ${FRONTEND_DIR} && npm run build`, {
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }
    });
    if (stderr && !stderr.includes('warning')) {
      error(`Build warnings: ${stderr}`);
    }
    success('Production build complete');
    return true;
  } catch (err) {
    error(`Build failed: ${err.message}`);
    return false;
  }
}

function startProductionServer() {
  log(`Starting production server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', PORT.toString()], {
    cwd: FRONTEND_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'production' }
  });

  server.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Ready') || output.includes('started')) {
      log('Server ready');
    }
  });

  server.stderr.on('data', (data) => {
    const output = data.toString();
    if (!output.includes('ExperimentalWarning')) {
      log(`Server: ${output.trim()}`);
    }
  });

  return server;
}

async function waitForServer(maxWaitMs) {
  const startTime = Date.now();
  log(`Waiting for server to be ready (max ${maxWaitMs / 1000}s)...`);

  while (Date.now() - startTime < maxWaitMs) {
    try {
      await checkHealth();
      return true;
    } catch {
      await new Promise(r => setTimeout(r, HEALTH_CHECK_INTERVAL_MS));
    }
  }
  return false;
}

async function checkHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get(HEALTH_ENDPOINT, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          if (health.status === 'healthy') {
            resolve(health);
          } else {
            reject(new Error(`Health check failed: ${JSON.stringify(health)}`));
          }
        } catch (e) {
          reject(new Error(`Invalid health response: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });
  });
}

async function testCriticalEndpoints() {
  log('Testing critical API endpoints...');
  const endpoints = [
    '/api/health',
    '/api/designs/A',
    '/api/designs/A/stress',
    '/api/standards',
  ];

  const results = [];
  for (const endpoint of endpoints) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${PORT}${endpoint}`, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.setTimeout(10000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      results.push({ endpoint, status: 'ok' });
      success(`${endpoint} - OK`);
    } catch (err) {
      results.push({ endpoint, status: 'error', error: err.message });
      error(`${endpoint} - FAILED: ${err.message}`);
    }
  }

  const failures = results.filter(r => r.status === 'error');
  return failures.length === 0;
}

async function main() {
  log('='.repeat(60));
  log('Production Build Validation');
  log('='.repeat(60));

  // Step 1: Build
  const buildSuccess = await buildProduction();
  if (!buildSuccess) {
    process.exit(1);
  }

  // Step 2: Start server
  const server = startProductionServer();

  try {
    // Step 3: Wait for server
    const serverReady = await waitForServer(MAX_STARTUP_WAIT_MS);
    if (!serverReady) {
      error('Server failed to start within timeout');
      process.exit(1);
    }

    // Step 4: Test endpoints
    const endpointsOk = await testCriticalEndpoints();
    if (!endpointsOk) {
      error('Some endpoints failed validation');
      process.exit(1);
    }

    success('='.repeat(60));
    success('All production validation checks passed!');
    success('='.repeat(60));

  } finally {
    // Clean up
    log('Stopping server...');
    server.kill('SIGTERM');
    await new Promise(r => setTimeout(r, 1000));
  }
}

main().catch(err => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
