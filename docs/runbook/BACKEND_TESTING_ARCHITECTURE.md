---
id: BACK-TEST-ARCH-2025-12-12
doc_type: runbook
title: 'Backend Testing Architecture - Visual Overview'
version: 1.0.0
date: 2025-12-12
owner: '@h2-tank-team'
status: draft
last_verified_at: 2025-12-12
keywords: ['testing', 'architecture', 'diagrams']
---

# BACKEND TESTING ARCHITECTURE

## Visual Overview & Test Layer Interactions

**Generated**: 2025-12-12
**Purpose**: Visual reference for testing strategy and layer interactions

---

## TESTING PYRAMID

```
                        ╔═══════════════════════════╗
                        ║   E2E Tests (BACK-076)    ║
                        ║   ~20 critical workflows  ║
                        ║   Full pipeline coverage  ║
                        ╚═══════════════════════════╝
                                    ▲
                                    │
                ╔═══════════════════════════════════════════╗
                ║   Integration Tests (BACK-072)            ║
                ║   25+ API endpoints                       ║
                ║   Auth flows, error handling, schemas     ║
                ╚═══════════════════════════════════════════╝
                                    ▲
                                    │
        ╔═══════════════════════════════════════════════════════════╗
        ║   Unit Tests (BACK-071)                                   ║
        ║   80% line coverage, 70% branch coverage                  ║
        ║   All services, routes, utilities tested                  ║
        ╚═══════════════════════════════════════════════════════════╝
                                    ▲
                                    │
╔═══════════════════════════════════════════════════════════════════════╗
║   Specialized Tests (BACK-073, BACK-074, BACK-075)                    ║
║   Surrogate Model Validation | CAD Round-Trip | LLM Output            ║
║   R² > 0.95 | Volume ±0.1% | Schema 100%                             ║
╚═══════════════════════════════════════════════════════════════════════╝
```

**Principle**: More unit tests (fast, focused), fewer E2E tests (slow, comprehensive)

---

## QUALITY GATE FLOW

```
┌──────────────────────────────────────────────────────────────────────┐
│                         DEVELOPER WORKFLOW                            │
└──────────────────────────────────────────────────────────────────────┘

    Developer writes code
            │
            ▼
    ┌───────────────┐
    │ git add .     │
    │ git commit    │
    └───────┬───────┘
            │
            ▼
    ╔═══════════════════════════════════════════════════════════╗
    ║           PRE-COMMIT GATE (BACK-077)                      ║
    ║  ✓ Lint (ESLint)          ✓ Format (Prettier)            ║
    ║  ✓ Type-check (TSC)       ✓ Unit tests (changed files)   ║
    ║  ✓ File size limits       ✓ Secret scanning              ║
    ╚═══════════════════════════════════════════════════════════╝
            │
            ├─ FAIL ──> ❌ Commit blocked, fix issues
            │
            ▼ PASS
    ┌───────────────┐
    │ git push      │
    └───────┬───────┘
            │
            ▼
    ╔═══════════════════════════════════════════════════════════╗
    ║              PR GATE (GitHub Actions)                     ║
    ║  ✓ All unit tests         ✓ All integration tests        ║
    ║  ✓ Coverage no regression ✓ Type-check clean             ║
    ║  ✓ Linter clean           ✓ No TODO/FIXME                ║
    ╚═══════════════════════════════════════════════════════════╝
            │
            ├─ FAIL ──> ❌ PR blocked, cannot merge
            │
            ▼ PASS
    ┌───────────────┐
    │ Merge to main │
    └───────┬───────┘
            │
            ▼
    ╔═══════════════════════════════════════════════════════════╗
    ║            RELEASE GATE (CI/CD Pipeline)                  ║
    ║  ✓ All E2E tests          ✓ Performance benchmarks        ║
    ║  ✓ Security audit         ✓ Documentation complete        ║
    ║  ✓ Changelog entry        ✓ Version bump                  ║
    ╚═══════════════════════════════════════════════════════════╝
            │
            ├─ FAIL ──> ❌ Deployment blocked
            │
            ▼ PASS
    ┌──────────────────┐
    │ Deploy to Canary │
    └───────┬──────────┘
            │
            ▼
    ╔═══════════════════════════════════════════════════════════╗
    ║            SMOKE TESTS (Canary Environment)               ║
    ║  ✓ Critical endpoints     ✓ Authentication working        ║
    ║  ✓ Database connectivity  ✓ LLM integration               ║
    ╚═══════════════════════════════════════════════════════════╝
            │
            ├─ FAIL ──> 🔄 Automatic rollback
            │
            ▼ PASS
    ┌─────────────────────┐
    │ Deploy to Production│
    └─────────┬───────────┘
              │
              ▼
    ╔═══════════════════════════════════════════════════════════╗
    ║          PRODUCTION MONITORING (24/7)                     ║
    ║  Error rate < 1%      Performance degradation < 20%      ║
    ║  Security vulnerabilities detected?                       ║
    ╚═══════════════════════════════════════════════════════════╝
              │
              ├─ TRIGGER ──> 🔄 Automatic rollback + Slack alert
              │
              ▼ OK
    ┌─────────────────────┐
    │   Production Live   │
    │   ✅ All gates passed│
    └─────────────────────┘
```

---

## TEST LAYER INTERACTIONS

```
┌──────────────────────────────────────────────────────────────────────┐
│                         TESTING LAYERS                                │
└──────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────┐
    │  UNIT TESTS (BACK-071)                                      │
    │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐│
    │  │ Services   │ │ Routes     │ │ Utilities  │ │ Models   ││
    │  ├────────────┤ ├────────────┤ ├────────────┤ ├──────────┤│
    │  │ Physics    │ │ /api/optim │ │ Validators │ │ Design   ││
    │  │ LLM Client │ │ /api/req   │ │ Converters │ │ Material ││
    │  │ CAD Gen    │ │ /api/export│ │ Calculators│ │ Standard ││
    │  └────────────┘ └────────────┘ └────────────┘ └──────────┘│
    │                                                             │
    │  Mocks: Database, LLM API, Filesystem, External Services   │
    │  Coverage: 80% line, 70% branch                            │
    │  Speed: < 30 seconds                                       │
    └─────────────────────────────────────────────────────────────┘
                                │
                                ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  INTEGRATION TESTS (BACK-072)                               │
    │  ┌─────────────────────────────────────────────────────┐   │
    │  │  API Endpoints (Supertest)                          │   │
    │  ├─────────────────────────────────────────────────────┤   │
    │  │  POST /api/optimization       → 202 Accepted        │   │
    │  │  GET  /api/optimization/{id}  → Job status          │   │
    │  │  GET  /api/designs/{id}/stress → Analysis results   │   │
    │  │  POST /api/export             → Export job created  │   │
    │  └─────────────────────────────────────────────────────┘   │
    │                                                             │
    │  Real: PostgreSQL (test DB), Filesystem (temp)             │
    │  Mocked: LLM API, External FEA                             │
    │  Coverage: All 25+ endpoints, all error paths              │
    │  Speed: < 2 minutes                                        │
    └─────────────────────────────────────────────────────────────┘
                                │
                                ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  SPECIALIZED TESTS (BACK-073, 074, 075)                     │
    │  ┌───────────────┐ ┌──────────────┐ ┌──────────────────┐  │
    │  │ Surrogate     │ │ CAD Round-   │ │ LLM Output       │  │
    │  │ Model Valid.  │ │ Trip Testing │ │ Validation       │  │
    │  ├───────────────┤ ├──────────────┤ ├──────────────────┤  │
    │  │ FEA Truth     │ │ STEP Export  │ │ Schema Check     │  │
    │  │ R² > 0.95     │ │ STEP Import  │ │ Hallucination    │  │
    │  │ RMSE < 5%     │ │ Volume ±0.1% │ │ Confidence Cal.  │  │
    │  │ OOD Detection │ │ Multi-CAD    │ │ Fallback Chain   │  │
    │  └───────────────┘ └──────────────┘ └──────────────────┘  │
    │                                                             │
    │  Purpose: Domain-specific validation beyond API testing    │
    └─────────────────────────────────────────────────────────────┘
                                │
                                ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  E2E TESTS (BACK-076)                                       │
    │  ┌─────────────────────────────────────────────────────┐   │
    │  │  Full Workflows (Playwright)                        │   │
    │  ├─────────────────────────────────────────────────────┤   │
    │  │  Requirements → Optimization → Analysis → Export    │   │
    │  │  ↓ Parse NL      ↓ Generate 50  ↓ Stress    ↓ STEP │   │
    │  │  ↓ Confidence    ↓ Pareto front ↓ Failure   ↓ PDF  │   │
    │  │  ↓ Validation    ↓ Job status   ↓ Thermal   ↓ CSV  │   │
    │  └─────────────────────────────────────────────────────┘   │
    │                                                             │
    │  Real: Everything (full stack)                             │
    │  Coverage: Critical user journeys, error recovery          │
    │  Speed: < 60 seconds per workflow                          │
    └─────────────────────────────────────────────────────────────┘
                                │
                                ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  QUALITY GATES (BACK-077)                                   │
    │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
    │  │ Pre-commit  │ │ PR Gate     │ │ Release Gate        │  │
    │  ├─────────────┤ ├─────────────┤ ├─────────────────────┤  │
    │  │ Lint        │ │ All tests   │ │ E2E pass            │  │
    │  │ Format      │ │ Coverage ✓  │ │ Perf benchmarks     │  │
    │  │ Type-check  │ │ Type-check  │ │ Security audit      │  │
    │  │ Unit tests  │ │ Linter      │ │ Docs complete       │  │
    │  │ File size   │ │ No TODOs    │ │ Changelog entry     │  │
    │  │ Secrets     │ │ PR desc     │ │ Smoke tests canary  │  │
    │  └─────────────┘ └─────────────┘ └─────────────────────┘  │
    │                                                             │
    │  Enforcement: Husky hooks, GitHub Actions, CI/CD pipeline  │
    └─────────────────────────────────────────────────────────────┘
```

---

## SURROGATE MODEL VALIDATION PIPELINE (BACK-073)

```
┌──────────────────────────────────────────────────────────────────────┐
│              SURROGATE MODEL VALIDATION WORKFLOW                      │
└──────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────┐
    │ Step 1: Generate Ground Truth (FEA)            │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ CalculiX/ANSYS runs for 1000+ designs      │ │
    │ │ Parameter sweep: Pressure, Volume, Material│ │
    │ │ Output: Stress, Strain, Failure, Thermal   │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Step 2: Train Surrogate Model                  │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ Neural network or Gaussian Process          │ │
    │ │ Input: Design parameters                    │ │
    │ │ Output: Physics predictions (fast)          │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Step 3: Validate Against Truth Data            │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ Calculate R² (> 0.95 required)              │ │
    │ │ Calculate RMSE (< 5% required)              │ │
    │ │ Calculate MAE (< 3% required)               │ │
    │ │ Identify outliers (max error < 10%)         │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Step 4: Out-of-Distribution Detection          │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ Mahalanobis distance threshold              │ │
    │ │ If OOD detected → Fallback to FEA           │ │
    │ │ Confidence interval estimation              │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Step 5: Regression Testing (CI)                │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ Weekly truth data update                    │ │
    │ │ Detect accuracy drift                       │ │
    │ │ A/B test new model versions                 │ │
    │ │ Alert if metrics degrade                    │ │
    │ └─────────────────────────────────────────────┘ │
    └─────────────────────────────────────────────────┘
```

---

## CAD ROUND-TRIP TESTING FLOW (BACK-074)

```
┌──────────────────────────────────────────────────────────────────────┐
│                 CAD GEOMETRY ROUND-TRIP TESTING                       │
└──────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────┐
    │ Original Design (Parametric)                    │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ Type: 1 (Cylindrical)                       │ │
    │ │ Pressure: 700 bar                           │ │
    │ │ Volume: 100 L                               │ │
    │ │ Material: T700-Epoxy                        │ │
    │ │ Expected Volume: 100.000 L (truth)          │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Generate B-rep Solid (OpenCASCADE)             │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ Isotensoid dome profile (ODE solver)        │ │
    │ │ Cylindrical section                         │ │
    │ │ Boss geometry                               │ │
    │ │ Multi-body assembly (liner, composite)      │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Export STEP File (AP214)                        │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ design-test-001.step                        │ │
    │ │ File size: ~2 MB                            │ │
    │ │ Bodies: 3 (liner, composite, boss)          │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Import STEP File (OpenCASCADE/Gmsh)            │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ Parse STEP AP214 format                     │ │
    │ │ Reconstruct B-rep solid                     │ │
    │ │ Extract geometric properties                │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Validate Geometric Properties                   │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ Imported Volume: 100.05 L                   │ │
    │ │ Deviation: 0.05% ✅ (< 0.1% required)       │ │
    │ │                                             │ │
    │ │ Imported Surface Area: 15002 cm²            │ │
    │ │ Original Surface Area: 15000 cm²            │ │
    │ │ Deviation: 0.013% ✅ (< 0.5% required)      │ │
    │ │                                             │ │
    │ │ Dome Profile RMSE: 0.08% ✅ (< 0.1%)        │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Multi-Platform Compatibility (Manual)           │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ SolidWorks: Import ✅ (3 bodies recognized) │ │
    │ │ CATIA V5:   Import ✅ (geometry intact)     │ │
    │ │ Fusion 360: Import ✅ (parametric preserved)│ │
    │ │ FreeCAD:    Import ✅ (open-source compat.) │ │
    │ └─────────────────────────────────────────────┘ │
    └─────────────────────────────────────────────────┘
```

---

## LLM OUTPUT VALIDATION FLOW (BACK-075)

```
┌──────────────────────────────────────────────────────────────────────┐
│                    LLM OUTPUT VALIDATION WORKFLOW                     │
└──────────────────────────────────────────────────────────────────────┘

    User Input: "I need a 700 bar tank for 100 liters"
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ LLM Processing (Claude API)                     │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ Prompt engineering                          │ │
    │ │ Context injection (standards, materials)    │ │
    │ │ Response generation                         │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Raw LLM Output                                  │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ {                                           │ │
    │ │   "pressure": 700,                          │ │
    │ │   "volume": 100,                            │ │
    │ │   "fluid": "hydrogen",                      │ │
    │ │   "application": "automotive",              │ │
    │ │   "confidence": 0.95                        │ │
    │ │ }                                           │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Validation Layer 1: Schema Compliance           │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ ✅ All required fields present              │ │
    │ │ ✅ Data types correct (number, string)      │ │
    │ │ ✅ Value ranges valid (pressure 1-1000)     │ │
    │ │ ✅ Unit consistency (bar, liters)           │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Validation Layer 2: Hallucination Detection     │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ ✅ Pressure 700 bar (realistic for H2)      │ │
    │ │ ✅ Volume 100 L (typical automotive)        │ │
    │ │ ✅ Fluid "hydrogen" (in material DB)        │ │
    │ │ ✅ Application "automotive" (valid use)     │ │
    │ │ ❌ If pressure = 9999 → REJECT              │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Validation Layer 3: Confidence Calibration      │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ Confidence: 0.95 (high)                     │ │
    │ │ Calibration check: ECE < 0.1 ✅             │ │
    │ │ If confidence < 0.7 → Request clarification │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Fallback Chain (If Validation Fails)            │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ Claude fails → Try GPT-4                    │ │
    │ │ GPT-4 fails → Rule-based extraction         │ │
    │ │ Rule-based fails → User clarification       │ │
    │ └─────────────────────────────────────────────┘ │
    └───────────────────────┬─────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────┐
    │ Validated Output (Sent to Frontend)             │
    │ ┌─────────────────────────────────────────────┐ │
    │ │ {                                           │ │
    │ │   "pressure": 700,                          │ │
    │ │   "volume": 100,                            │ │
    │ │   "fluid": "hydrogen",                      │ │
    │ │   "confidence": 0.95,                       │ │
    │ │   "validation_status": "passed",            │ │
    │ │   "model_used": "claude-3.5-sonnet"         │ │
    │ │ }                                           │ │
    │ └─────────────────────────────────────────────┘ │
    └─────────────────────────────────────────────────┘
```

---

## TEST EXECUTION ORDER IN CI/CD

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CI/CD TEST EXECUTION                           │
└──────────────────────────────────────────────────────────────────────┘

    git push
       │
       ▼
    ╔═══════════════════════════════════════════════════════════╗
    ║  Stage 1: Fast Checks (< 2 minutes)                       ║
    ║  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐║
    ║  │ Lint        │ │ Format      │ │ Type-check          │║
    ║  │ (ESLint)    │ │ (Prettier)  │ │ (TSC strict)        │║
    ║  │ < 10s       │ │ < 5s        │ │ < 30s               │║
    ║  └─────────────┘ └─────────────┘ └─────────────────────┘║
    ╚═══════════════════════════════════════════════════════════╝
       │
       ▼
    ╔═══════════════════════════════════════════════════════════╗
    ║  Stage 2: Unit Tests (< 1 minute)                         ║
    ║  ┌─────────────────────────────────────────────────────┐ ║
    ║  │ npm run test:unit                                   │ ║
    ║  │ Coverage: 80% line, 70% branch                      │ ║
    ║  │ Execution time: < 30s                               │ ║
    ║  └─────────────────────────────────────────────────────┘ ║
    ╚═══════════════════════════════════════════════════════════╝
       │
       ▼
    ╔═══════════════════════════════════════════════════════════╗
    ║  Stage 3: Integration Tests (< 3 minutes)                 ║
    ║  ┌─────────────────────────────────────────────────────┐ ║
    ║  │ npm run test:integration                            │ ║
    ║  │ Test DB seeding + 25+ endpoint tests                │ ║
    ║  │ Execution time: < 2 minutes                         │ ║
    ║  └─────────────────────────────────────────────────────┘ ║
    ╚═══════════════════════════════════════════════════════════╝
       │
       ▼
    ╔═══════════════════════════════════════════════════════════╗
    ║  Stage 4: Specialized Tests (< 5 minutes)                 ║
    ║  ┌───────────────┐ ┌──────────────┐ ┌──────────────────┐║
    ║  │ Surrogate     │ │ CAD Round-   │ │ LLM Output       │║
    ║  │ Model Valid.  │ │ Trip Testing │ │ Validation       │║
    ║  │ (BACK-073)    │ │ (BACK-074)   │ │ (BACK-075)       │║
    ║  │ < 2 min       │ │ < 1 min      │ │ < 1 min          │║
    ║  └───────────────┘ └──────────────┘ └──────────────────┘║
    ╚═══════════════════════════════════════════════════════════╝
       │
       ▼
    ╔═══════════════════════════════════════════════════════════╗
    ║  Stage 5: E2E Tests (PR or main only) (< 5 minutes)       ║
    ║  ┌─────────────────────────────────────────────────────┐ ║
    ║  │ npm run test:e2e                                    │ ║
    ║  │ Full workflows: Requirements → Export               │ ║
    ║  │ Execution time: ~3-4 minutes                        │ ║
    ║  └─────────────────────────────────────────────────────┘ ║
    ╚═══════════════════════════════════════════════════════════╝
       │
       ▼
    ╔═══════════════════════════════════════════════════════════╗
    ║  Stage 6: Security & Performance (main only) (< 3 min)    ║
    ║  ┌─────────────────────────────────────────────────────┐ ║
    ║  │ npm audit --audit-level=moderate                    │ ║
    ║  │ npm run test:performance                            │ ║
    ║  │ Snyk scan (optional)                                │ ║
    ║  └─────────────────────────────────────────────────────┘ ║
    ╚═══════════════════════════════════════════════════════════╝
       │
       ▼
    ╔═══════════════════════════════════════════════════════════╗
    ║  Stage 7: Deploy (main only)                              ║
    ║  ┌─────────────────────────────────────────────────────┐ ║
    ║  │ 1. Deploy to Canary                                 │ ║
    ║  │ 2. Run smoke tests                                  │ ║
    ║  │ 3. If pass → Deploy to Production                   │ ║
    ║  │ 4. If fail → Automatic rollback                     │ ║
    ║  └─────────────────────────────────────────────────────┘ ║
    ╚═══════════════════════════════════════════════════════════╝
       │
       ▼
    ✅ All tests passed, deployment successful
```

**Total Pipeline Time**:

- **PR**: ~10 minutes (Stages 1-5)
- **Main Branch**: ~15 minutes (Stages 1-7)

---

_Generated by ProSWARM Neural Orchestration - 2025-12-12_
