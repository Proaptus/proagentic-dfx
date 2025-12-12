---
id: BACK-TEST-EXAMPLES-2025-12-12
doc_type: runbook
title: 'Backend Testing Code Examples - Implementation Reference'
version: 1.0.0
date: 2025-12-12
owner: '@h2-tank-team'
status: draft
last_verified_at: 2025-12-12
keywords: ['testing', 'code-examples', 'reference']
---

# BACKEND TESTING CODE EXAMPLES

## Implementation Reference for BACK-071 to BACK-077

**Generated**: 2025-12-12
**Purpose**: Concrete code examples for implementing testing tasks

---

## BACK-071: Unit Test Infrastructure Setup

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['__tests__/setup.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: ['node_modules/**', '__tests__/**', '**/*.test.ts', '**/*.spec.ts', 'dist/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup File

```typescript
// __tests__/setup.ts
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { setupTestDatabase, teardownTestDatabase } from './mocks/database';

beforeAll(async () => {
  // Setup global test environment
  await setupTestDatabase();
});

afterAll(async () => {
  // Cleanup global test environment
  await teardownTestDatabase();
});

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  vi.restoreAllMocks();
});
```

### Database Mock

```typescript
// __tests__/mocks/database.ts
import { vi } from 'vitest';

export const mockDatabase = {
  designs: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  optimizationJobs: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  materials: {
    findMany: vi.fn(),
  },
};

export async function setupTestDatabase() {
  // Setup in-memory PostgreSQL or mock DB
  console.log('Test database setup complete');
}

export async function teardownTestDatabase() {
  // Cleanup test database
  console.log('Test database cleanup complete');
}
```

### LLM Client Mock

```typescript
// __tests__/mocks/llm-client.ts
import { vi } from 'vitest';

export const mockClaudeClient = {
  chat: vi.fn().mockResolvedValue({
    pressure: 700,
    volume: 100,
    fluid: 'hydrogen',
    confidence: 0.95,
  }),
};

export const mockGPT4Client = {
  chat: vi.fn().mockResolvedValue({
    pressure: 700,
    volume: 100,
    fluid: 'hydrogen',
    confidence: 0.9,
  }),
};

export function mockLLMError() {
  mockClaudeClient.chat.mockRejectedValue(new Error('Service Unavailable'));
}

export function mockLLMRateLimit() {
  mockClaudeClient.chat.mockRejectedValue({
    status: 429,
    message: 'Rate limit exceeded',
  });
}
```

### Test Fixtures

```typescript
// __tests__/fixtures/designs.ts
export const testDesigns = {
  type1Cylindrical: {
    id: 'TEST-T1-001',
    type: 1,
    pressure: 700,
    volume: 100,
    material: 'T700-Epoxy',
    geometry: {
      length: 1000,
      diameter: 400,
      thickness: 12,
    },
    expectedWeight: 45.2,
    expectedCost: 12500,
  },
  type2Spherical: {
    id: 'TEST-T2-001',
    type: 2,
    pressure: 350,
    volume: 50,
    material: 'T800-Epoxy',
    geometry: {
      diameter: 450,
      thickness: 8,
    },
    expectedWeight: 22.8,
    expectedCost: 8500,
  },
  extremeHighPressure: {
    id: 'TEST-EXTREME-001',
    type: 1,
    pressure: 1000,
    volume: 200,
    material: 'T1000-Epoxy',
    geometry: {
      length: 1500,
      diameter: 500,
      thickness: 20,
    },
    expectedWeight: 120.5,
    expectedCost: 45000,
  },
};
```

### Example Unit Test

```typescript
// src/services/physics.test.ts
import { describe, it, expect } from 'vitest';
import { calculateHoopStress, calculateBurstPressure } from './physics';
import { testDesigns } from '../__tests__/fixtures/designs';

describe('Physics Service - Pressure Vessel Calculations', () => {
  describe('calculateHoopStress', () => {
    it('calculates hoop stress correctly for cylindrical tank', () => {
      const { pressure, geometry } = testDesigns.type1Cylindrical;
      const radius = geometry.diameter / 2;
      const thickness = geometry.thickness;

      const stress = calculateHoopStress(pressure, radius, thickness);

      // σ_hoop = (P * R) / t
      const expectedStress = (pressure * radius) / thickness;
      expect(stress).toBeCloseTo(expectedStress, 2);
    });

    it('throws error for zero thickness', () => {
      expect(() => calculateHoopStress(700, 200, 0)).toThrow('Thickness must be greater than zero');
    });

    it('handles negative pressure', () => {
      expect(() => calculateHoopStress(-100, 200, 12)).toThrow('Pressure cannot be negative');
    });
  });

  describe('calculateBurstPressure', () => {
    it('calculates burst pressure using safety factor', () => {
      const { geometry, material } = testDesigns.type1Cylindrical;
      const safetyFactor = 2.25; // Per UN R134

      const burstPressure = calculateBurstPressure(geometry, material, safetyFactor);

      expect(burstPressure).toBeGreaterThan(700 * safetyFactor);
    });
  });
});
```

---

## BACK-072: API Integration Test Suite

### Supertest Setup

```typescript
// __tests__/integration/setup.ts
import request from 'supertest';
import { app } from '../../src/app';
import { setupTestDatabase, seedTestData } from '../mocks/database';

export const api = request(app);

export async function setupIntegrationTests() {
  await setupTestDatabase();
  await seedTestData();
}

export async function cleanupIntegrationTests() {
  // Cleanup test database
}
```

### Endpoint Integration Test

```typescript
// __tests__/integration/optimization.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, setupIntegrationTests, cleanupIntegrationTests } from './setup';
import { testDesigns } from '../fixtures/designs';

describe('Optimization API - Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    await setupIntegrationTests();
    // Get auth token
    const authResponse = await api.post('/api/auth/login').send({
      username: 'test',
      password: 'test123',
    });
    authToken = authResponse.body.token;
  });

  afterAll(async () => {
    await cleanupIntegrationTests();
  });

  describe('POST /api/optimization', () => {
    it('creates optimization job with valid inputs', async () => {
      const request = {
        requirements: {
          pressure: 700,
          volume: 100,
          fluid: 'hydrogen',
        },
        objectives: ['minimize_weight', 'minimize_cost'],
        constraints: {
          max_weight: 50,
          max_cost: 15000,
        },
      };

      const response = await api
        .post('/api/optimization')
        .set('Authorization', `Bearer ${authToken}`)
        .send(request)
        .expect(202);

      expect(response.body).toHaveProperty('job_id');
      expect(response.body.status).toBe('pending');
    });

    it('rejects invalid pressure range', async () => {
      const request = {
        requirements: {
          pressure: -100, // Invalid
          volume: 100,
        },
        objectives: ['minimize_weight'],
      };

      const response = await api
        .post('/api/optimization')
        .set('Authorization', `Bearer ${authToken}`)
        .send(request)
        .expect(400);

      expect(response.body.error).toContain('pressure');
    });

    it('enforces authentication', async () => {
      const request = {
        requirements: { pressure: 700, volume: 100 },
        objectives: ['minimize_weight'],
      };

      await api.post('/api/optimization').send(request).expect(401);
    });

    it('handles malformed JSON', async () => {
      const response = await api
        .post('/api/optimization')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.error).toContain('JSON');
    });
  });

  describe('GET /api/optimization/:id', () => {
    it('returns job status for valid ID', async () => {
      // Create job first
      const createResponse = await api
        .post('/api/optimization')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ requirements: { pressure: 700, volume: 100 }, objectives: ['minimize_weight'] });

      const jobId = createResponse.body.job_id;

      const response = await api
        .get(`/api/optimization/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.job_id).toBe(jobId);
      expect(['pending', 'running', 'completed']).toContain(response.body.status);
    });

    it('returns 404 for non-existent job', async () => {
      await api
        .get('/api/optimization/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

### Schema Validation Test

```typescript
// __tests__/integration/schema-validation.test.ts
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const OptimizationResponseSchema = z.object({
  job_id: z.string().cuid(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  progress: z.number().min(0).max(100).optional(),
  error: z.string().optional(),
});

describe('Schema Validation', () => {
  it('validates optimization response schema', () => {
    const validResponse = {
      job_id: 'clx123abc',
      status: 'pending',
      created_at: '2025-12-12T10:00:00Z',
      updated_at: '2025-12-12T10:00:00Z',
    };

    expect(() => OptimizationResponseSchema.parse(validResponse)).not.toThrow();
  });

  it('rejects invalid status enum', () => {
    const invalidResponse = {
      job_id: 'clx123abc',
      status: 'invalid-status',
      created_at: '2025-12-12T10:00:00Z',
      updated_at: '2025-12-12T10:00:00Z',
    };

    expect(() => OptimizationResponseSchema.parse(invalidResponse)).toThrow();
  });
});
```

---

## BACK-073: Surrogate Model Validation Framework

### Truth Data Generation

```typescript
// scripts/generate-truth-data.ts
import { runFEA } from './fea-runner';
import { generateDesignVariations } from './design-generator';
import fs from 'fs/promises';

async function generateTruthData() {
  const designs = generateDesignVariations({
    pressureRange: [100, 1000],
    volumeRange: [50, 200],
    materialTypes: ['T700-Epoxy', 'T800-Epoxy', 'T1000-Epoxy'],
    sampleCount: 1000,
  });

  const truthData = [];

  for (const design of designs) {
    console.log(`Running FEA for design ${design.id}...`);
    const feaResult = await runFEA(design);

    truthData.push({
      design_id: design.id,
      input: {
        pressure: design.pressure,
        volume: design.volume,
        material: design.material,
        thickness: design.geometry.thickness,
      },
      output: {
        max_stress: feaResult.stress.max,
        avg_stress: feaResult.stress.avg,
        failure_index: feaResult.failure.tsai_wu,
        weight: feaResult.weight,
      },
    });
  }

  await fs.writeFile(
    'truth-data/stress-validation-1000-samples.json',
    JSON.stringify(truthData, null, 2)
  );

  console.log(`Generated ${truthData.length} truth data samples`);
}

generateTruthData();
```

### Surrogate Model Validation Test

```typescript
// __tests__/validation/surrogate-models.test.ts
import { describe, it, expect } from 'vitest';
import { StressSurrogateModel } from '../../src/models/stress-surrogate';
import truthData from '../fixtures/truth-data/stress-validation-1000-samples.json';

describe('Stress Surrogate Model Validation', () => {
  const model = new StressSurrogateModel();

  it('achieves R² > 0.95 on validation set', () => {
    const predictions = [];
    const actuals = [];

    for (const sample of truthData) {
      const predicted = model.predict(sample.input);
      predictions.push(predicted.max_stress);
      actuals.push(sample.output.max_stress);
    }

    const r2 = calculateR2(predictions, actuals);
    expect(r2).toBeGreaterThan(0.95);
  });

  it('achieves RMSE < 5% of mean', () => {
    const predictions = [];
    const actuals = [];

    for (const sample of truthData) {
      const predicted = model.predict(sample.input);
      predictions.push(predicted.max_stress);
      actuals.push(sample.output.max_stress);
    }

    const rmse = calculateRMSE(predictions, actuals);
    const mean = actuals.reduce((a, b) => a + b, 0) / actuals.length;
    const relativeRMSE = rmse / mean;

    expect(relativeRMSE).toBeLessThan(0.05); // 5%
  });

  it('detects out-of-distribution inputs', () => {
    const extremeInput = {
      pressure: 2000, // Way beyond training range (max was 1000)
      volume: 100,
      material: 'T700-Epoxy',
      thickness: 12,
    };

    const result = model.predictWithConfidence(extremeInput);

    expect(result.is_ood).toBe(true);
    expect(result.confidence).toBeLessThan(0.5);
  });

  it('falls back to first-principles for OOD', async () => {
    const oodInput = {
      pressure: 2000,
      volume: 100,
      material: 'T700-Epoxy',
      thickness: 12,
    };

    const result = await model.predictOrFallback(oodInput);

    expect(result.method).toBe('first-principles');
    expect(result.accuracy).toBe('high-fidelity');
  });
});

// Utility functions
function calculateR2(predictions: number[], actuals: number[]): number {
  const mean = actuals.reduce((a, b) => a + b, 0) / actuals.length;
  const ssTotal = actuals.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0);
  const ssResidual = predictions.reduce((sum, pred, i) => sum + Math.pow(actuals[i] - pred, 2), 0);
  return 1 - ssResidual / ssTotal;
}

function calculateRMSE(predictions: number[], actuals: number[]): number {
  const mse =
    predictions.reduce((sum, pred, i) => sum + Math.pow(actuals[i] - pred, 2), 0) /
    predictions.length;
  return Math.sqrt(mse);
}
```

---

## BACK-074: CAD Geometry Round-Trip Testing

### Round-Trip Test

```typescript
// __tests__/geometry/round-trip/type1-cylindrical.test.ts
import { describe, it, expect } from 'vitest';
import { generateDesign } from '../../../src/services/cad-generation';
import { exportSTEP } from '../../../src/services/step-export';
import { importSTEP } from '../../../src/services/step-import';
import { calculateVolume, calculateSurfaceArea } from '../../../src/utils/geometry';

describe('Type 1 Cylindrical Tank - STEP Round-Trip', () => {
  it('preserves volume within 0.1%', async () => {
    // Generate original design
    const original = await generateDesign({
      type: 1,
      pressure: 700,
      volume: 100,
      material: 'T700-Epoxy',
    });

    const originalVolume = calculateVolume(original);
    expect(originalVolume).toBeCloseTo(100, 1); // Should be close to 100 L

    // Export to STEP
    const stepFile = await exportSTEP(original, {
      format: 'AP214',
      units: 'mm',
    });

    expect(stepFile).toBeDefined();

    // Import STEP back
    const imported = await importSTEP(stepFile);

    const importedVolume = calculateVolume(imported);
    const deviation = Math.abs(importedVolume - originalVolume) / originalVolume;

    expect(deviation).toBeLessThan(0.001); // 0.1%
  });

  it('maintains surface area within 0.5%', async () => {
    const original = await generateDesign({
      type: 1,
      pressure: 700,
      volume: 100,
    });

    const originalSurfaceArea = calculateSurfaceArea(original);

    const stepFile = await exportSTEP(original);
    const imported = await importSTEP(stepFile);

    const importedSurfaceArea = calculateSurfaceArea(imported);
    const deviation = Math.abs(importedSurfaceArea - originalSurfaceArea) / originalSurfaceArea;

    expect(deviation).toBeLessThan(0.005); // 0.5%
  });

  it('preserves isotensoid dome profile', async () => {
    const original = await generateDesign({
      type: 1,
      pressure: 700,
      volume: 100,
    });

    const originalProfile = extractDomeProfile(original);

    const stepFile = await exportSTEP(original);
    const imported = await importSTEP(stepFile);

    const importedProfile = extractDomeProfile(imported);

    const profileRMSE = calculateProfileRMSE(originalProfile, importedProfile);
    const domeRadius = original.geometry.diameter / 2;
    const relativeRMSE = profileRMSE / domeRadius;

    expect(relativeRMSE).toBeLessThan(0.001); // 0.1% of dome radius
  });
});

function extractDomeProfile(geometry: any): number[][] {
  // Extract dome profile points [x, y]
  return geometry.dome.profile;
}

function calculateProfileRMSE(profile1: number[][], profile2: number[][]): number {
  let sumSquaredError = 0;
  for (let i = 0; i < profile1.length; i++) {
    const dx = profile1[i][0] - profile2[i][0];
    const dy = profile1[i][1] - profile2[i][1];
    sumSquaredError += dx * dx + dy * dy;
  }
  return Math.sqrt(sumSquaredError / profile1.length);
}
```

### Visual Regression Test

```typescript
// __tests__/geometry/visual-regression/screenshots.test.ts
import { describe, it, expect } from 'vitest';
import { renderDesign } from '../../../src/services/three-renderer';
import { compareImages } from '../utils/image-comparison';
import fs from 'fs/promises';

describe('Visual Regression Tests', () => {
  it('matches reference screenshot for Design A', async () => {
    const design = await loadDesign('design-a');
    const screenshot = await renderDesign(design, {
      camera: { position: [0, 0, 500], target: [0, 0, 0] },
      resolution: [1920, 1080],
    });

    const referenceImage = await fs.readFile(
      '__tests__/geometry/visual-regression/snapshots/design-a-front.png'
    );

    const diff = await compareImages(screenshot, referenceImage);

    expect(diff.percentDifference).toBeLessThan(1); // Less than 1% difference
  });
});
```

---

## BACK-075: LLM Output Validation & Sanitization Testing

### Schema Compliance Test

```typescript
// __tests__/llm/schema-compliance/requirements-parsing.test.ts
import { describe, it, expect } from 'vitest';
import { parseRequirements } from '../../../src/services/llm-service';
import { RequirementsSchema } from '../../../src/schemas/requirements';

describe('LLM Requirements Parsing - Schema Compliance', () => {
  it('validates all required fields present', async () => {
    const input = 'I need a 700 bar tank for 100 liters of hydrogen';
    const response = await parseRequirements(input);

    expect(() => RequirementsSchema.parse(response)).not.toThrow();
    expect(response.pressure).toBeDefined();
    expect(response.volume).toBeDefined();
    expect(response.confidence).toBeGreaterThan(0.7);
  });

  it('rejects responses missing required fields', () => {
    const invalidResponse = {
      pressure: 700,
      // volume is missing
      confidence: 0.9,
    };

    expect(() => RequirementsSchema.parse(invalidResponse)).toThrow();
  });

  it('validates data types', () => {
    const invalidResponse = {
      pressure: '700', // Should be number
      volume: 100,
      confidence: 0.9,
    };

    expect(() => RequirementsSchema.parse(invalidResponse)).toThrow();
  });
});
```

### Hallucination Detection Test

```typescript
// __tests__/llm/hallucination-detection/impossible-values.test.ts
import { describe, it, expect } from 'vitest';
import { validateLLMOutput } from '../../../src/services/llm-validator';

describe('LLM Hallucination Detection', () => {
  it('rejects impossible pressure values', () => {
    const hallucinatedResponse = {
      pressure: 9999, // Physically impossible
      volume: 100,
      material: 'Carbon Fiber',
      confidence: 0.95,
    };

    const validation = validateLLMOutput(hallucinatedResponse);

    expect(validation.is_valid).toBe(false);
    expect(validation.errors).toContain('pressure exceeds physical limits');
  });

  it('rejects non-existent materials', () => {
    const hallucinatedResponse = {
      pressure: 700,
      volume: 100,
      material: 'Unobtanium', // Not in database
      confidence: 0.95,
    };

    const validation = validateLLMOutput(hallucinatedResponse);

    expect(validation.is_valid).toBe(false);
    expect(validation.errors).toContain('material not found in database');
  });

  it('accepts valid responses', () => {
    const validResponse = {
      pressure: 700,
      volume: 100,
      material: 'T700-Epoxy',
      confidence: 0.95,
    };

    const validation = validateLLMOutput(validResponse);

    expect(validation.is_valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});
```

### Fallback Chain Test

```typescript
// __tests__/llm/fallback-chain/claude-failure.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { parseRequirements } from '../../../src/services/llm-service';
import { mockClaudeClient, mockGPT4Client, mockLLMError } from '../../mocks/llm-client';

describe('LLM Fallback Chain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('falls back to GPT-4 on Claude failure', async () => {
    // Mock Claude failure
    mockClaudeClient.chat.mockRejectedValue(new Error('Service Unavailable'));

    // Mock GPT-4 success
    mockGPT4Client.chat.mockResolvedValue({
      pressure: 700,
      volume: 100,
      confidence: 0.9,
    });

    const response = await parseRequirements('I need a 700 bar tank for 100 liters');

    expect(response.pressure).toBe(700);
    expect(response.model_used).toBe('gpt-4');
    expect(response.fallback_triggered).toBe(true);
  });

  it('uses rule-based extraction on all LLM failures', async () => {
    mockClaudeClient.chat.mockRejectedValue(new Error('Failed'));
    mockGPT4Client.chat.mockRejectedValue(new Error('Failed'));

    const response = await parseRequirements('700 bar, 100 L hydrogen tank');

    expect(response.method).toBe('rule-based');
    expect(response.pressure).toBe(700);
    expect(response.volume).toBe(100);
    expect(response.fluid).toBe('hydrogen');
  });
});
```

---

## BACK-076: End-to-End Workflow Testing

### Full Pipeline E2E Test

```typescript
// __tests__/e2e/workflows/full-pipeline.test.ts
import { describe, it, expect } from 'vitest';
import { api } from '../setup';

describe('Full Pipeline - Requirements to Export', () => {
  it('completes happy path in under 60 seconds', async () => {
    const startTime = Date.now();

    // Step 1: Parse requirements
    const requirements = await api.post('/api/requirements/parse').send({
      input: 'I need a 700 bar, 100 liter hydrogen tank for automotive use',
    });
    expect(requirements.status).toBe(200);
    expect(requirements.body.pressure).toBe(700);
    expect(requirements.body.volume).toBe(100);

    // Step 2: Start optimization
    const optimization = await api.post('/api/optimization').send({
      requirements: requirements.body,
      objectives: ['minimize_weight', 'minimize_cost'],
    });
    expect(optimization.status).toBe(202);

    // Step 3: Wait for Pareto results
    const results = await waitForJobCompletion(optimization.body.job_id, {
      maxWaitTime: 30000, // 30 seconds
      pollInterval: 1000, // 1 second
    });
    expect(results.designs.length).toBe(50);

    // Step 4: Analyze top design
    const topDesign = results.designs[0];
    const analysis = await api.get(`/api/designs/${topDesign.id}/stress`);
    expect(analysis.status).toBe(200);
    expect(analysis.body.max_stress).toBeDefined();

    // Step 5: Generate export package
    const exportJob = await api.post('/api/export').send({
      design_id: topDesign.id,
      include: {
        step_file: true,
        pdf_report: true,
        csv_data: true,
      },
    });
    const exportResult = await waitForJobCompletion(exportJob.body.job_id);
    expect(exportResult.files.length).toBe(3);

    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(60000); // 60 seconds
  });
});

async function waitForJobCompletion(
  jobId: string,
  options = { maxWaitTime: 30000, pollInterval: 1000 }
) {
  const startTime = Date.now();

  while (Date.now() - startTime < options.maxWaitTime) {
    const status = await api.get(`/api/optimization/${jobId}`);

    if (status.body.status === 'completed') {
      const results = await api.get(`/api/optimization/${jobId}/results`);
      return results.body;
    }

    if (status.body.status === 'failed') {
      throw new Error(`Job failed: ${status.body.error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, options.pollInterval));
  }

  throw new Error('Job timeout');
}
```

---

## BACK-077: Quality Gate Enforcement & CI/CD Integration

### Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

echo "🔍 Running pre-commit quality gates..."

# Lint
echo "Linting..."
npm run lint || {
  echo "❌ Lint failed. Fix errors and try again."
  exit 1
}

# Format check
echo "Checking format..."
npm run format:check || {
  echo "❌ Format check failed. Run 'npm run format' and try again."
  exit 1
}

# Type check
echo "Type checking..."
npm run type-check || {
  echo "❌ Type check failed. Fix type errors and try again."
  exit 1
}

# Unit tests (changed files only)
echo "Running unit tests..."
npm run test:unit:changed || {
  echo "❌ Unit tests failed. Fix tests and try again."
  exit 1
}

# File size check
echo "Checking file sizes..."
npm run check:sizes:staged || {
  echo "❌ File size limits exceeded. Split large files and try again."
  exit 1
}

# Secret scan
echo "Scanning for secrets..."
npm run check:secrets || {
  echo "❌ Secrets detected. Remove API keys/passwords and try again."
  exit 1
}

echo "✅ All pre-commit quality gates passed!"
```

### GitHub Actions Workflow

```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  pre-commit:
    name: Pre-commit Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Format Check
        run: npm run format:check

      - name: Type Check
        run: npm run type-check

      - name: Unit Tests
        run: npm run test:unit

      - name: File Size Check
        run: npm run check:sizes

      - name: Secret Scan
        run: npm run check:secrets

  integration:
    name: Integration Tests
    needs: pre-commit
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run Integration Tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    name: E2E Tests
    needs: integration
    if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run E2E Tests
        run: npm run test:e2e

      - name: Performance Benchmarks
        run: npm run test:performance

  release-gate:
    name: Release Gate
    needs: [pre-commit, integration, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Security Audit
        run: npm audit --audit-level=moderate

      - name: Check Documentation
        run: npm run check:docs

      - name: Verify Changelog
        run: test -f CHANGELOG.md

      - name: Deploy to Production
        run: npm run deploy:production
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

_Generated by ProSWARM Neural Orchestration - 2025-12-12_
