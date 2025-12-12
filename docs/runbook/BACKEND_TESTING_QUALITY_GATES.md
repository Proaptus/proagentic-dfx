---
id: BACK-TEST-QG-2025-12-12
doc_type: runbook
title: 'Backend Testing & Quality Gates - H2 Tank Designer Production System'
version: 1.0.0
date: 2025-12-12
owner: '@h2-tank-team'
status: draft
last_verified_at: 2025-12-12
supersedes: ['BACK-070']
keywords: ['testing', 'quality-gates', 'validation', 'TDD', 'coverage', 'CI/CD']
sources_of_truth: ['RTM_AUDIT_2025-12-11', 'BACKEND_SPECIFICATION']
---

# BACKEND TESTING & QUALITY GATES

## H2 Tank Designer Production System

**Generated**: 2025-12-12
**Target**: Ensure production-ready quality for all backend modules
**Source**: RTM Requirements, BACKEND_SPECIFICATION.md, TDD Best Practices

---

## EXECUTIVE SUMMARY

This document expands BACK-070 into a comprehensive testing strategy covering unit tests, integration tests, surrogate model validation, CAD geometry verification, LLM output testing, E2E workflows, and quality gate enforcement.

### Testing Coverage Targets

| Layer             | Target        | Minimum            | Enforcement           |
| ----------------- | ------------- | ------------------ | --------------------- |
| Unit Tests        | 80% line      | 70% branch         | Pre-commit hook       |
| Integration Tests | All endpoints | Critical paths     | PR gate               |
| E2E Tests         | Happy paths   | Error recovery     | Release gate          |
| Surrogate Model   | R² > 0.95     | RMSE < 5%          | Model deployment gate |
| CAD Round-Trip    | Volume ±0.1%  | Surface ±0.5%      | Export gate           |
| LLM Output        | Schema 100%   | Hallucination < 2% | API gate              |

### Quality Gate Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│         RELEASE GATE (Production Deployment)             │
│  ✓ All E2E tests pass   ✓ Performance benchmarks met    │
│  ✓ Security audit pass  ✓ Documentation complete        │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              PR MERGE GATE (Main Branch)                │
│  ✓ Integration tests pass  ✓ No coverage regression    │
│  ✓ Linter clean           ✓ Type-check pass            │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│            PRE-COMMIT GATE (Local Dev)                  │
│  ✓ Unit tests pass    ✓ Format check    ✓ Lint pass   │
│  ✓ File size limits   ✓ No secrets      ✓ Type-check  │
└─────────────────────────────────────────────────────────┘
```

---

## PHASE 11: TESTING & QUALITY GATES

> **Objective**: Comprehensive test coverage and quality enforcement
> **Complexity**: Extra Large | **Duration**: Parallel with all phases

### BACK-071: Unit Test Infrastructure Setup

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: Infrastructure, REQ-087
**Dependencies**: BACK-001 (Database), BACK-003 (API Gateway)

**Description**:
Establish comprehensive unit testing infrastructure with mocks, fixtures, and coverage tooling. This is the foundation for all backend testing.

**Deliverables**:

- [ ] Vitest/Jest configuration for backend
- [ ] Mock infrastructure layer
  - [ ] Database mock (in-memory PostgreSQL or mock library)
  - [ ] LLM API mock (Claude/GPT-4 responses)
  - [ ] Filesystem mock (for export generation)
  - [ ] External service mocks (FEA, monitoring)
- [ ] Test data fixtures
  - [ ] Sample designs (Type 1-4)
  - [ ] Material properties database
  - [ ] Standard requirements library
  - [ ] Optimization job states
- [ ] Coverage reporting configuration
  - [ ] Istanbul/c8 integration
  - [ ] HTML and JSON reports
  - [ ] Threshold enforcement (80% line, 70% branch)
- [ ] CI integration
  - [ ] GitHub Actions workflow
  - [ ] Coverage upload to Codecov/Coveralls
  - [ ] PR comment with coverage delta

**Test Structure**:

```
h2-tank-backend/
├── src/
│   ├── services/
│   │   ├── physics.ts
│   │   └── physics.test.ts          # Co-located tests
│   ├── routes/
│   │   ├── optimization.ts
│   │   └── optimization.test.ts
├── __tests__/
│   ├── fixtures/
│   │   ├── designs.json
│   │   ├── materials.json
│   │   └── optimization-results.json
│   ├── mocks/
│   │   ├── database.ts
│   │   ├── llm-client.ts
│   │   └── filesystem.ts
│   └── setup.ts
├── vitest.config.ts
└── coverage/
```

**Acceptance Criteria**:

- [ ] `npm run test:unit` executes all unit tests
- [ ] Coverage report generated with each run
- [ ] Pre-commit hook blocks commits below 80% line coverage
- [ ] All mocks isolated (no network calls during unit tests)
- [ ] Test execution time < 30 seconds (unit tests only)

---

### BACK-072: API Integration Test Suite

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: REQ-001 to REQ-120 (All API endpoints)
**Dependencies**: BACK-071, All API implementation tasks

**Description**:
Comprehensive integration testing for all 25+ API endpoints, covering request/response schemas, authentication flows, error handling, and rate limiting.

**Deliverables**:

- [ ] Integration test framework (Supertest or similar)
- [ ] Test database seeding/teardown
- [ ] All endpoint tests:
  - [ ] Requirements parsing endpoints (8)
  - [ ] Optimization endpoints (5)
  - [ ] Geometry/stress endpoints (2)
  - [ ] Analysis endpoints (5)
  - [ ] Comparison endpoints (2)
  - [ ] Export endpoints (3)
  - [ ] Validation endpoints (1)
  - [ ] Supporting endpoints (materials, standards, etc.)
- [ ] Schema validation tests (Zod/AJV)
- [ ] Authentication flow tests
  - [ ] Valid credentials → 200
  - [ ] Invalid credentials → 401
  - [ ] Expired session → 401
  - [ ] Missing auth header → 401
- [ ] Error handling path tests
  - [ ] Malformed JSON → 400
  - [ ] Missing required fields → 400
  - [ ] Invalid data types → 400
  - [ ] Server errors → 500 with safe messages
- [ ] Rate limiting verification
  - [ ] Normal usage → 200
  - [ ] Burst traffic → 429 Too Many Requests
  - [ ] Rate limit headers present

**Test Structure by Endpoint**:

```typescript
// __tests__/integration/optimization.test.ts
describe('POST /api/optimization', () => {
  it('creates job with valid inputs', async () => {
    const response = await request(app)
      .post('/api/optimization')
      .set('Authorization', validToken)
      .send(validOptimizationRequest)
      .expect(202);

    expect(response.body).toMatchSchema(JobResponseSchema);
    expect(response.body.job_id).toBeDefined();
  });

  it('rejects invalid pressure range', async () => {
    const response = await request(app)
      .post('/api/optimization')
      .send({ ...validRequest, max_pressure: -100 })
      .expect(400);

    expect(response.body.error).toContain('pressure');
  });

  it('enforces authentication', async () => {
    await request(app).post('/api/optimization').send(validRequest).expect(401);
  });
});
```

**Acceptance Criteria**:

- [ ] All 25+ endpoints have integration tests
- [ ] All happy path scenarios tested
- [ ] All error paths tested (400, 401, 404, 500)
- [ ] Schema validation enforced on all responses
- [ ] `npm run test:integration` runs isolated from unit tests
- [ ] Integration tests complete in < 2 minutes
- [ ] No test pollution (isolated database per test)

---

### BACK-073: Surrogate Model Validation Framework

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: REQ-065 to REQ-079 (Analysis accuracy)
**Dependencies**: BACK-036 (Physics Engine), BACK-023 (Surrogate Models)

**Description**:
Validate surrogate models (stress, failure, thermal, reliability) against ground truth FEA results. Ensure accuracy metrics meet engineering standards and detect out-of-distribution inputs.

**Deliverables**:

- [ ] Truth data generation pipeline
  - [ ] FEA baseline results (CalculiX/ANSYS)
  - [ ] 1000+ design variations covering parameter space
  - [ ] Multi-physics coupling validation
- [ ] Accuracy metrics implementation
  - [ ] R² (coefficient of determination) > 0.95
  - [ ] RMSE (root mean square error) < 5% of mean
  - [ ] MAE (mean absolute error) < 3% of mean
  - [ ] Maximum error < 10% (outlier detection)
- [ ] Out-of-distribution (OOD) detection
  - [ ] Mahalanobis distance threshold
  - [ ] Confidence interval estimation
  - [ ] Fallback to first-principles when OOD
- [ ] Regression testing for model updates
  - [ ] Version tracking for surrogate models
  - [ ] Accuracy drift detection
  - [ ] A/B testing framework
- [ ] Performance benchmarks
  - [ ] Surrogate inference time < 10ms
  - [ ] FEA fallback time budget (60s)
  - [ ] Batch processing throughput

**Truth Data Structure**:

```
truth-data/
├── stress/
│   ├── fea-results-1000-samples.csv
│   ├── validation-metadata.json
│   └── outlier-cases.csv
├── failure/
│   ├── tsai-wu-validation.csv
│   ├── hashin-validation.csv
│   └── comparison-ansys.csv
├── thermal/
│   ├── steady-state-validation.csv
│   └── transient-validation.csv
└── reliability/
    ├── monte-carlo-reference.csv
    └── confidence-intervals.json
```

**Validation Test Suite**:

```typescript
// __tests__/validation/surrogate-models.test.ts
describe('Stress Surrogate Model', () => {
  it('achieves R² > 0.95 on validation set', () => {
    const predictions = stressSurrogate.predict(validationSet);
    const truthValues = loadTruthData('stress-validation.csv');

    const r2 = calculateR2(predictions, truthValues);
    expect(r2).toBeGreaterThan(0.95);
  });

  it('detects out-of-distribution inputs', () => {
    const extremeInput = { pressure: 2000, thickness: 0.1 }; // Beyond training
    const result = stressSurrogate.predictWithConfidence(extremeInput);

    expect(result.is_ood).toBe(true);
    expect(result.confidence).toBeLessThan(0.5);
  });

  it('falls back to first-principles for OOD', async () => {
    const oodInput = generateOODCase();
    const result = await analysisService.getStress(oodInput);

    expect(result.method).toBe('first-principles');
    expect(result.accuracy).toBe('high-fidelity');
  });
});
```

**Acceptance Criteria**:

- [ ] All surrogate models validated against FEA truth data
- [ ] R² > 0.95 for all physics models (stress, failure, thermal)
- [ ] RMSE < 5% of mean for all predictions
- [ ] OOD detection working (100% catch rate for extreme cases)
- [ ] Regression tests prevent accuracy degradation
- [ ] Performance benchmarks met (inference < 10ms)
- [ ] Continuous validation in CI (weekly truth data update)

---

### BACK-074: CAD Geometry Round-Trip Testing

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-111 (STEP export)
**Dependencies**: BACK-037 (CAD Service), BACK-058 (STEP Generation)

**Description**:
Validate CAD geometry generation and export by testing round-trip accuracy (generate → export STEP → import → validate). Ensure geometric integrity and multi-platform compatibility.

**Deliverables**:

- [ ] Round-trip test framework
  - [ ] STEP export from parametric design
  - [ ] STEP import using OpenCASCADE/Gmsh
  - [ ] Geometric property extraction
  - [ ] Comparison with original design
- [ ] Geometric integrity tests
  - [ ] Volume accuracy (±0.1%)
  - [ ] Surface area accuracy (±0.5%)
  - [ ] Critical dimension accuracy (±0.01mm)
  - [ ] Isotensoid dome profile accuracy (±0.1%)
- [ ] Tolerance verification
  - [ ] Cylindrical section circularity
  - [ ] Dome-cylinder tangency (G1 continuity)
  - [ ] Boss placement accuracy
  - [ ] Winding surface smoothness
- [ ] Multi-platform compatibility
  - [ ] SolidWorks import validation
  - [ ] CATIA V5 import validation
  - [ ] Fusion 360 import validation
  - [ ] Open-source (FreeCAD/OpenSCAD) validation
- [ ] Visual regression testing
  - [ ] Screenshot comparison (Three.js render)
  - [ ] Mesh deviation analysis
  - [ ] Wireframe diff detection

**Test Structure**:

```
__tests__/geometry/
├── round-trip/
│   ├── type1-cylindrical.test.ts
│   ├── type2-spherical.test.ts
│   ├── type3-conformable.test.ts
│   └── type4-ovoid.test.ts
├── fixtures/
│   ├── reference-designs/
│   │   ├── design-a.step
│   │   ├── design-b.step
│   │   └── pareto-p12.step
│   └── platform-validation/
│       ├── solidworks-import-results.json
│       └── catia-import-results.json
├── visual-regression/
│   ├── snapshots/
│   │   ├── design-a-front.png
│   │   └── design-a-iso.png
│   └── tolerances.json
└── utils/
    ├── geometry-comparison.ts
    └── step-parser.ts
```

**Round-Trip Test Example**:

```typescript
// __tests__/geometry/round-trip/type1-cylindrical.test.ts
describe('Type 1 Cylindrical Tank - STEP Round-Trip', () => {
  it('preserves volume within 0.1%', async () => {
    const original = await generateDesign({ type: 1, volume: 100 });
    const stepFile = await exportSTEP(original);
    const imported = await importSTEP(stepFile);

    const originalVolume = calculateVolume(original);
    const importedVolume = calculateVolume(imported);
    const deviation = Math.abs(importedVolume - originalVolume) / originalVolume;

    expect(deviation).toBeLessThan(0.001); // 0.1%
  });

  it('maintains isotensoid dome profile', async () => {
    const original = await generateDesign({ type: 1, pressure: 700 });
    const stepFile = await exportSTEP(original);
    const imported = await importSTEP(stepFile);

    const originalProfile = extractDomeProfile(original);
    const importedProfile = extractDomeProfile(imported);

    const profileDeviation = calculateRMSE(originalProfile, importedProfile);
    expect(profileDeviation).toBeLessThan(0.1); // 0.1% of dome radius
  });

  it('imports successfully in SolidWorks', async () => {
    // This test requires SolidWorks API or manual validation
    const stepFile = await exportSTEP(testDesign);
    const validation = await platformValidator.validateSTEP(stepFile, 'solidworks');

    expect(validation.import_success).toBe(true);
    expect(validation.body_count).toBe(3); // Liner, composite, boss
    expect(validation.errors).toHaveLength(0);
  });
});
```

**Acceptance Criteria**:

- [ ] Round-trip volume accuracy ±0.1% for all tank types
- [ ] Surface area accuracy ±0.5% for all tank types
- [ ] Critical dimensions (length, diameter, thickness) ±0.01mm
- [ ] Isotensoid dome profile RMSE < 0.1% of radius
- [ ] STEP files import successfully in SolidWorks (manual validation)
- [ ] STEP files import successfully in CATIA V5 (manual validation)
- [ ] Visual regression tests detect geometry changes
- [ ] `npm run test:geometry` runs all round-trip tests

---

### BACK-075: LLM Output Validation & Sanitization Testing

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-001 to REQ-008 (Requirements parsing), REQ-116 (Report generation)
**Dependencies**: BACK-009 to BACK-013 (LLM Gateway), BACK-063 (Report Service)

**Description**:
Comprehensive testing of LLM outputs for schema compliance, hallucination detection, confidence score calibration, fallback chain functionality, and rate limit handling.

**Deliverables**:

- [ ] Schema compliance verification
  - [ ] JSON schema validation (Zod/AJV)
  - [ ] Required field presence check
  - [ ] Data type enforcement
  - [ ] Value range validation
  - [ ] Unit consistency checking
- [ ] Hallucination detection tests
  - [ ] Fact verification against knowledge base
  - [ ] Cross-reference with standards database
  - [ ] Impossible value detection (e.g., 9999 bar pressure)
  - [ ] Self-consistency checks
  - [ ] Confidence threshold enforcement
- [ ] Confidence score calibration
  - [ ] Calibration dataset (1000+ labeled examples)
  - [ ] Expected calibration error (ECE) < 0.1
  - [ ] Brier score < 0.2
  - [ ] Reliability diagram analysis
- [ ] Fallback chain testing
  - [ ] Claude API failure → GPT-4 fallback
  - [ ] GPT-4 failure → Rule-based extraction
  - [ ] Rule-based failure → User clarification
  - [ ] Fallback latency budgets
- [ ] Rate limit handling
  - [ ] Exponential backoff on 429 errors
  - [ ] Queue management for burst requests
  - [ ] User notification on quota exceeded
  - [ ] Graceful degradation to cached results

**Test Structure**:

```
__tests__/llm/
├── schema-compliance/
│   ├── requirements-parsing.test.ts
│   ├── chat-responses.test.ts
│   └── report-generation.test.ts
├── hallucination-detection/
│   ├── fact-verification.test.ts
│   ├── impossible-values.test.ts
│   └── self-consistency.test.ts
├── confidence-calibration/
│   ├── calibration-data.json          # 1000+ labeled examples
│   ├── ece-calculation.test.ts
│   └── reliability-diagram.test.ts
├── fallback-chain/
│   ├── claude-failure.test.ts
│   ├── gpt4-fallback.test.ts
│   └── rule-based-extraction.test.ts
├── rate-limits/
│   ├── backoff-strategy.test.ts
│   ├── queue-management.test.ts
│   └── quota-exceeded.test.ts
└── fixtures/
    ├── llm-responses/
    │   ├── valid-responses.json
    │   ├── hallucinated-responses.json
    │   └── malformed-responses.json
    └── calibration-set.json
```

**LLM Output Test Examples**:

```typescript
// __tests__/llm/schema-compliance/requirements-parsing.test.ts
describe('LLM Requirements Parsing - Schema Compliance', () => {
  it('validates all required fields present', async () => {
    const input = 'I need a 700 bar tank for 100 liters';
    const response = await llmService.parseRequirements(input);

    expect(response).toMatchSchema(RequirementsSchema);
    expect(response.pressure).toBeDefined();
    expect(response.volume).toBeDefined();
    expect(response.confidence).toBeGreaterThan(0.7);
  });

  it('rejects impossible values', async () => {
    const hallucinatedResponse = {
      pressure: 9999, // Impossible
      volume: 100,
      material: 'Carbon Fiber',
    };

    const validation = await validateLLMOutput(hallucinatedResponse);
    expect(validation.is_valid).toBe(false);
    expect(validation.errors).toContain('pressure exceeds physical limits');
  });
});

// __tests__/llm/fallback-chain/claude-failure.test.ts
describe('LLM Fallback Chain', () => {
  it('falls back to GPT-4 on Claude failure', async () => {
    const mockClaudeError = new Error('Service Unavailable');
    claudeClient.mockRejectedValue(mockClaudeError);

    const response = await llmService.parseRequirements(testInput);

    expect(response.model_used).toBe('gpt-4');
    expect(response.fallback_triggered).toBe(true);
  });

  it('uses rule-based extraction on all LLM failures', async () => {
    claudeClient.mockRejectedValue(new Error('Failed'));
    gpt4Client.mockRejectedValue(new Error('Failed'));

    const response = await llmService.parseRequirements('700 bar, 100 L');

    expect(response.method).toBe('rule-based');
    expect(response.pressure).toBe(700);
    expect(response.volume).toBe(100);
  });
});
```

**Acceptance Criteria**:

- [ ] 100% schema compliance for all LLM outputs
- [ ] Hallucination detection catches 98%+ of impossible values
- [ ] Confidence calibration ECE < 0.1
- [ ] Fallback chain tested with all failure modes
- [ ] Rate limit handling prevents 429 errors from crashing
- [ ] `npm run test:llm` runs all LLM validation tests
- [ ] Mock LLM responses for fast testing (no API calls)

---

### BACK-076: End-to-End Workflow Testing

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: All REQ (full pipeline)
**Dependencies**: All Phases 1-10

**Description**:
Comprehensive E2E testing covering full user workflows from requirements entry through export, including happy paths, error recovery, and performance benchmarks.

**Deliverables**:

- [ ] E2E test framework (Playwright for API testing)
- [ ] Happy path scenarios
  - [ ] Full workflow: Requirements → Pareto → Analysis → Export
  - [ ] Comparison workflow: Select designs → Compare → Export
  - [ ] Validation workflow: Design → FEA Request → Compliance Check
- [ ] Error recovery scenarios
  - [ ] Optimization job failure → Retry
  - [ ] Export generation timeout → Resume
  - [ ] API network failure → Queue retry
  - [ ] Database connection loss → Reconnect
- [ ] Performance benchmarks
  - [ ] Requirements parsing < 2s
  - [ ] Optimization job start < 500ms
  - [ ] Pareto results (50 designs) < 5s
  - [ ] Analysis endpoint < 1s
  - [ ] Export generation < 30s (STEP + PDF + CSV)
- [ ] Concurrency testing
  - [ ] Multiple optimization jobs in parallel
  - [ ] Concurrent design analysis requests
  - [ ] Export queue handling under load
- [ ] Data integrity tests
  - [ ] Design persistence across sessions
  - [ ] Optimization results reproducibility
  - [ ] Export file integrity

**Test Structure**:

```
__tests__/e2e/
├── workflows/
│   ├── full-pipeline.test.ts         # Requirements → Export
│   ├── comparison-workflow.test.ts   # Multi-design comparison
│   ├── validation-workflow.test.ts   # FEA + Compliance
│   └── pareto-exploration.test.ts    # Optimization → Analysis
├── error-recovery/
│   ├── job-failure-retry.test.ts
│   ├── network-failure.test.ts
│   ├── database-reconnect.test.ts
│   └── timeout-handling.test.ts
├── performance/
│   ├── response-times.test.ts
│   ├── throughput.test.ts
│   └── concurrency.test.ts
├── data-integrity/
│   ├── persistence.test.ts
│   ├── reproducibility.test.ts
│   └── export-integrity.test.ts
└── fixtures/
    ├── test-scenarios.json
    └── performance-baselines.json
```

**E2E Workflow Test Example**:

```typescript
// __tests__/e2e/workflows/full-pipeline.test.ts
describe('Full Pipeline - Requirements to Export', () => {
  it('completes happy path in under 60 seconds', async () => {
    const startTime = Date.now();

    // Step 1: Parse requirements
    const requirements = await api.post('/api/requirements/parse', {
      input: 'I need a 700 bar, 100 liter hydrogen tank for automotive use',
    });
    expect(requirements.status).toBe(200);

    // Step 2: Start optimization
    const optimization = await api.post('/api/optimization', {
      requirements: requirements.data,
      objectives: ['minimize_weight', 'minimize_cost'],
    });
    expect(optimization.status).toBe(202);

    // Step 3: Wait for Pareto results
    const results = await waitForJobCompletion(optimization.data.job_id);
    expect(results.designs.length).toBe(50);

    // Step 4: Analyze top design
    const topDesign = results.designs[0];
    const analysis = await api.get(`/api/designs/${topDesign.id}/stress`);
    expect(analysis.status).toBe(200);

    // Step 5: Generate export package
    const exportJob = await api.post('/api/export', {
      design_id: topDesign.id,
      include: { step_file: true, pdf_report: true, csv_data: true },
    });
    const exportResult = await waitForJobCompletion(exportJob.data.job_id);
    expect(exportResult.files.length).toBe(3);

    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(60000); // 60 seconds
  });

  it('recovers from optimization job failure', async () => {
    // Simulate job failure
    const optimization = await api.post('/api/optimization', validRequest);
    await api.post(`/api/optimization/${optimization.data.job_id}/fail`); // Test helper

    // Verify retry mechanism
    const retry = await api.post(`/api/optimization/${optimization.data.job_id}/retry`);
    expect(retry.status).toBe(202);

    const results = await waitForJobCompletion(retry.data.job_id);
    expect(results.status).toBe('completed');
  });
});
```

**Performance Benchmark Test**:

```typescript
// __tests__/e2e/performance/response-times.test.ts
describe('API Performance Benchmarks', () => {
  it('requirements parsing completes in under 2s', async () => {
    const samples = 100;
    const times = [];

    for (let i = 0; i < samples; i++) {
      const start = Date.now();
      await api.post('/api/requirements/parse', testInput);
      times.push(Date.now() - start);
    }

    const p95 = calculatePercentile(times, 95);
    expect(p95).toBeLessThan(2000); // 2 seconds at p95
  });

  it('handles 10 concurrent optimization jobs', async () => {
    const jobs = Array(10)
      .fill(null)
      .map(() => api.post('/api/optimization', validRequest));

    const results = await Promise.all(jobs);
    expect(results.every((r) => r.status === 202)).toBe(true);
  });
});
```

**Acceptance Criteria**:

- [ ] Full pipeline (Requirements → Export) completes in < 60s
- [ ] All happy path workflows tested and passing
- [ ] Error recovery scenarios tested (job failure, network issues)
- [ ] Performance benchmarks met for all critical endpoints
- [ ] Concurrency handling tested (10+ parallel jobs)
- [ ] Data integrity verified across workflows
- [ ] `npm run test:e2e` runs all E2E tests
- [ ] E2E tests run in CI on every PR

---

### BACK-077: Quality Gate Enforcement & CI/CD Integration

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: Infrastructure
**Dependencies**: BACK-071 to BACK-076

**Description**:
Implement and enforce quality gates at pre-commit, PR merge, and release stages. Integrate all testing layers into CI/CD pipeline with automated rollback triggers.

**Deliverables**:

- [ ] Pre-commit hooks
  - [ ] Lint check (ESLint/Biome)
  - [ ] Format check (Prettier)
  - [ ] Type check (TypeScript strict mode)
  - [ ] Unit tests (changed files only)
  - [ ] File size limits (per CLAUDE.md)
  - [ ] Secret scanning (no API keys, passwords)
- [ ] PR quality gates
  - [ ] All unit tests pass
  - [ ] All integration tests pass
  - [ ] Coverage no regression (delta ≥ 0%)
  - [ ] Type-check clean
  - [ ] Linter clean (zero warnings)
  - [ ] No TODO/FIXME comments
  - [ ] PR description contains testing notes
- [ ] Release quality gates
  - [ ] All E2E tests pass
  - [ ] Performance benchmarks met
  - [ ] Security audit clean (npm audit, Snyk)
  - [ ] Documentation updated
  - [ ] Changelog entry present
  - [ ] Version bump committed
- [ ] Automated rollback triggers
  - [ ] E2E test failure in production → Rollback
  - [ ] Performance degradation > 20% → Alert + Manual review
  - [ ] Error rate > 1% → Rollback
  - [ ] Security vulnerability detected → Immediate rollback

**CI/CD Pipeline Structure**:

```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates

on: [push, pull_request]

jobs:
  pre-commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
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
    needs: pre-commit
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
    steps:
      - name: Integration Tests
        run: npm run test:integration
      - name: Upload Coverage
        uses: codecov/codecov-action@v3

  e2e:
    needs: integration
    if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: E2E Tests
        run: npm run test:e2e
      - name: Performance Benchmarks
        run: npm run test:performance

  release-gate:
    needs: [pre-commit, integration, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Security Audit
        run: npm audit --audit-level=moderate
      - name: Check Documentation
        run: npm run check:docs
      - name: Verify Changelog
        run: test -f CHANGELOG.md
      - name: Deploy Canary
        run: npm run deploy:canary
      - name: Smoke Tests
        run: npm run test:smoke:canary
      - name: Deploy Production
        run: npm run deploy:production
```

**Pre-commit Hook Configuration**:

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit quality gates..."

# Lint
npm run lint || {
  echo "❌ Lint failed. Fix errors and try again."
  exit 1
}

# Format check
npm run format:check || {
  echo "❌ Format check failed. Run 'npm run format' and try again."
  exit 1
}

# Type check
npm run type-check || {
  echo "❌ Type check failed. Fix type errors and try again."
  exit 1
}

# Unit tests (changed files only for speed)
npm run test:unit:changed || {
  echo "❌ Unit tests failed. Fix tests and try again."
  exit 1
}

# File size check
npm run check:sizes:staged || {
  echo "❌ File size limits exceeded. Split large files and try again."
  exit 1
}

# Secret scan
npm run check:secrets || {
  echo "❌ Secrets detected. Remove API keys/passwords and try again."
  exit 1
}

echo "✅ All pre-commit quality gates passed!"
```

**Rollback Automation**:

```typescript
// scripts/rollback-monitor.ts
import { MonitoringService } from './monitoring';
import { DeploymentService } from './deployment';

const monitor = new MonitoringService();
const deploy = new DeploymentService();

monitor.on('error-rate-exceeded', async (metrics) => {
  if (metrics.error_rate > 0.01) {
    // 1% error rate
    console.error('🚨 Error rate exceeded 1%, triggering rollback...');
    await deploy.rollback();
    await notify.slack('Production rolled back due to high error rate');
  }
});

monitor.on('performance-degraded', async (metrics) => {
  if (metrics.p95_latency > metrics.baseline * 1.2) {
    // 20% slower
    console.warn('⚠️ Performance degraded by 20%, alerting team...');
    await notify.slack('Performance degradation detected, manual review required');
  }
});

monitor.on('security-vulnerability', async (vuln) => {
  if (vuln.severity === 'critical' || vuln.severity === 'high') {
    console.error('🔒 Security vulnerability detected, rolling back...');
    await deploy.rollback();
    await notify.slack(`Security vulnerability: ${vuln.cve}`);
  }
});
```

**Acceptance Criteria**:

- [ ] Pre-commit hooks block commits that fail quality checks
- [ ] PR merges blocked if any quality gate fails
- [ ] Release deployment blocked if E2E tests fail
- [ ] Coverage delta reported on every PR
- [ ] Automated rollback triggers tested (manual simulation)
- [ ] CI/CD pipeline completes in < 10 minutes
- [ ] Quality gate status visible in PR (GitHub Checks)
- [ ] Slack notifications on quality gate failures

---

## TESTING METRICS & MONITORING

### Coverage Tracking

```typescript
// Package.json scripts
{
  "test:unit": "vitest run --coverage",
  "test:integration": "vitest run --config vitest.integration.config.ts",
  "test:e2e": "playwright test",
  "test:geometry": "vitest run --config vitest.geometry.config.ts",
  "test:llm": "vitest run --config vitest.llm.config.ts",
  "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
  "test:watch": "vitest watch",
  "test:performance": "vitest run --config vitest.performance.config.ts"
}
```

### Quality Dashboards

| Metric                    | Target             | Current | Trend |
| ------------------------- | ------------------ | ------- | ----- |
| Unit Test Coverage        | 80%                | TBD     | -     |
| Integration Test Coverage | 100% endpoints     | TBD     | -     |
| E2E Test Coverage         | All critical paths | TBD     | -     |
| Surrogate Model R²        | > 0.95             | TBD     | -     |
| CAD Round-Trip Accuracy   | ± 0.1% volume      | TBD     | -     |
| LLM Hallucination Rate    | < 2%               | TBD     | -     |
| Performance Benchmarks    | All met            | TBD     | -     |

---

## APPENDIX A: TEST DATA FIXTURES

### Sample Designs for Testing

```json
// __tests__/fixtures/designs.json
{
  "type1_cylindrical": {
    "id": "TEST-T1-001",
    "type": 1,
    "pressure": 700,
    "volume": 100,
    "material": "T700-Epoxy",
    "expected_weight": 45.2,
    "expected_cost": 12500
  },
  "type2_spherical": {
    "id": "TEST-T2-001",
    "type": 2,
    "pressure": 350,
    "volume": 50,
    "material": "T800-Epoxy",
    "expected_weight": 22.8,
    "expected_cost": 8500
  },
  "extreme_high_pressure": {
    "id": "TEST-EXTREME-001",
    "type": 1,
    "pressure": 1000,
    "volume": 200,
    "material": "T1000-Epoxy",
    "expected_weight": 120.5,
    "expected_cost": 45000
  }
}
```

### LLM Response Fixtures

```json
// __tests__/fixtures/llm-responses/valid-responses.json
{
  "requirements_parsing_high_confidence": {
    "input": "I need a 700 bar tank for 100 liters of hydrogen",
    "output": {
      "pressure": 700,
      "volume": 100,
      "fluid": "hydrogen",
      "tank_type": null,
      "confidence": 0.95
    }
  },
  "requirements_parsing_low_confidence": {
    "input": "A tank for car",
    "output": {
      "pressure": null,
      "volume": null,
      "application": "automotive",
      "confidence": 0.4
    }
  }
}
```

---

## APPENDIX B: PERFORMANCE BASELINES

| Endpoint                             | p50   | p95    | p99     | Max Acceptable |
| ------------------------------------ | ----- | ------ | ------- | -------------- |
| `POST /api/requirements/parse`       | 800ms | 1500ms | 2000ms  | 3000ms         |
| `POST /api/optimization`             | 100ms | 300ms  | 500ms   | 1000ms         |
| `GET /api/optimization/{id}/results` | 200ms | 1000ms | 3000ms  | 5000ms         |
| `GET /api/designs/{id}/stress`       | 50ms  | 200ms  | 500ms   | 1000ms         |
| `POST /api/export`                   | 100ms | 300ms  | 500ms   | 1000ms         |
| `GET /api/export/{id}/download`      | 500ms | 5000ms | 20000ms | 30000ms        |

---

## APPENDIX C: SECURITY TEST CASES

### Authentication Tests

- [ ] Invalid credentials rejected
- [ ] Expired tokens rejected
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] CSRF tokens validated
- [ ] Rate limiting enforced

### Data Validation Tests

- [ ] Input sanitization (LLM prompts)
- [ ] File upload restrictions (size, type)
- [ ] Path traversal prevention
- [ ] Buffer overflow protection
- [ ] Integer overflow handling

---

_Generated by ProSWARM Neural Orchestration - 2025-12-12_
