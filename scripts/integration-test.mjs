#!/usr/bin/env node
/**
 * Integration Test Script for ProAgentic DfX
 * Tests all critical mock server API endpoints
 *
 * Usage: node scripts/integration-test.mjs [--base-url=http://localhost:3001]
 */

const MOCK_SERVER_URL = process.argv.find(arg => arg.startsWith('--base-url='))?.split('=')[1]
  || 'http://localhost:3001';

const API_BASE = `${MOCK_SERVER_URL}/api`;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  fail: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  dim: (msg) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
};

// Test definitions
const tests = [
  // Core APIs
  {
    name: 'Materials API',
    endpoint: '/materials',
    method: 'GET',
    expectedFields: ['carbon_fibers', 'glass_fibers', 'matrix_resins'],
  },
  {
    name: 'Standards API',
    endpoint: '/standards',
    method: 'GET',
    expectedFields: ['standards'],
  },

  // Optimization APIs
  {
    name: 'Optimization Results (Pareto Data)',
    endpoint: '/optimization/demo/results',
    method: 'GET',
    expectedFields: ['pareto_front', 'status'],
    critical: true,
  },

  // Design APIs (using design ID "A")
  {
    name: 'Design Details',
    endpoint: '/designs/A',
    method: 'GET',
    expectedFields: ['id', 'geometry'],
  },
  {
    name: 'Design Geometry',
    endpoint: '/designs/A/geometry',
    method: 'GET',
    expectedFields: ['inner_radius_mm', 'cylinder_length_mm'],
    critical: true,
  },
  {
    name: 'Design Stress Analysis',
    endpoint: '/designs/A/stress',
    method: 'GET',
    expectedFields: ['max_stress_mpa', 'safety_factor'],
  },
  {
    name: 'Design Thermal Analysis',
    endpoint: '/designs/A/thermal',
    method: 'GET',
    expectedFields: ['max_temperature_c', 'fill_time_s'],
  },
  {
    name: 'Design Failure Analysis',
    endpoint: '/designs/A/failure',
    method: 'GET',
    expectedFields: ['tsai_wu_index', 'hashin_criteria'],
  },
  {
    name: 'Design Reliability',
    endpoint: '/designs/A/reliability',
    method: 'GET',
    expectedFields: ['reliability', 'monte_carlo'],
  },
  {
    name: 'Design Cost Analysis',
    endpoint: '/designs/A/cost',
    method: 'GET',
    expectedFields: ['total_cost_eur', 'material_cost_eur'],
  },
  {
    name: 'Design Compliance',
    endpoint: '/designs/A/compliance',
    method: 'GET',
    expectedFields: ['overall_compliance', 'standards'],
    critical: true,
  },
  {
    name: 'Design Sentry Analysis',
    endpoint: '/designs/A/sentry',
    method: 'GET',
    expectedFields: ['confidence_score', 'recommendations'],
  },

  // Compare API
  {
    name: 'Compare Designs',
    endpoint: '/compare',
    method: 'POST',
    body: { design_ids: ['A', 'B'] },
    expectedFields: ['designs', 'comparison'],
  },

  // Export API
  {
    name: 'Export Categories',
    endpoint: '/export/categories',
    method: 'GET',
    expectedFields: ['categories'],
  },
];

async function runTest(test) {
  const url = `${API_BASE}${test.endpoint}`;
  const startTime = Date.now();

  try {
    const options = {
      method: test.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (test.body) {
      options.body = JSON.stringify(test.body);
    }

    const response = await fetch(url, options);
    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      return {
        name: test.name,
        passed: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        elapsed,
        critical: test.critical,
      };
    }

    const data = await response.json();

    // Check expected fields
    if (test.expectedFields) {
      const missingFields = test.expectedFields.filter(field => {
        const keys = Object.keys(data);
        return !keys.includes(field);
      });

      if (missingFields.length > 0) {
        return {
          name: test.name,
          passed: false,
          error: `Missing fields: ${missingFields.join(', ')}`,
          elapsed,
          critical: test.critical,
        };
      }
    }

    return {
      name: test.name,
      passed: true,
      elapsed,
      critical: test.critical,
    };

  } catch (error) {
    return {
      name: test.name,
      passed: false,
      error: error.message,
      elapsed: Date.now() - startTime,
      critical: test.critical,
    };
  }
}

async function main() {
  console.log('');
  log.info('═══════════════════════════════════════════════════════════════');
  log.info('  ProAgentic DfX - Integration Test Suite');
  log.info('═══════════════════════════════════════════════════════════════');
  console.log('');
  log.dim(`Testing against: ${MOCK_SERVER_URL}`);
  console.log('');

  // Check if server is reachable
  try {
    await fetch(`${MOCK_SERVER_URL}/api/materials`, { method: 'HEAD' });
  } catch (error) {
    log.fail(`Cannot connect to mock server at ${MOCK_SERVER_URL}`);
    log.dim('Make sure the mock server is running: npm run dev:mock');
    process.exit(1);
  }

  const results = [];
  let passed = 0;
  let failed = 0;
  let criticalFailed = 0;

  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);

    if (result.passed) {
      log.success(`${result.name} (${result.elapsed}ms)`);
      passed++;
    } else {
      log.fail(`${result.name}`);
      log.dim(`Error: ${result.error}`);
      failed++;
      if (result.critical) {
        criticalFailed++;
      }
    }
  }

  // Summary
  console.log('');
  log.info('═══════════════════════════════════════════════════════════════');
  log.info('  Test Results Summary');
  log.info('═══════════════════════════════════════════════════════════════');
  console.log('');

  console.log(`  Total Tests:  ${tests.length}`);
  console.log(`  ${colors.green}Passed:       ${passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed:       ${failed}${colors.reset}`);

  if (criticalFailed > 0) {
    console.log(`  ${colors.red}Critical:     ${criticalFailed} FAILED${colors.reset}`);
  }

  console.log('');

  if (failed === 0) {
    log.success('All integration tests passed!');
    console.log('');
    process.exit(0);
  } else if (criticalFailed > 0) {
    log.fail('Critical tests failed! The application may not function correctly.');
    console.log('');
    process.exit(1);
  } else {
    log.warn('Some tests failed, but no critical failures.');
    console.log('');
    process.exit(0);
  }
}

main().catch(error => {
  log.fail(`Unexpected error: ${error.message}`);
  process.exit(1);
});
