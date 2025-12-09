---
doc_type: explanation
title: "Mock Server Architecture Review"
version: 1.0.0
date: 2025-12-09
owner: "@h2-tank-team"
status: accepted
last_verified_at: 2025-12-09
---
# Mock Server Architecture Review
## Staged Backend Handover Assessment

**Review Date:** December 2024
**Reviewer:** ProSWARM Analysis

---

## Executive Summary

The mock server architecture is **partially correct** but has critical implementation gaps that prevent smooth staged handover to the real backend.

### What's Right

| Component | Status | Evidence |
|-----------|--------|----------|
| Separate mock server project | YES | `h2-tank-mock-server/` exists |
| First-principles physics library | YES | `lib/physics/*.ts` with real equations |
| Static reference data | YES | `data/static/` with materials, standards |
| API routes using physics | YES | Routes call `calculateHoopStress()` etc. |
| Data mode support | YES | `lib/utils/data-mode.ts` |
| Test coverage for physics | YES | `lib/physics/__tests__/` |

### What's Wrong

| Issue | Severity | Impact |
|-------|----------|--------|
| Frontend has duplicate API routes | CRITICAL | Defeats entire architecture |
| Frontend bypasses API with hardcoded data | CRITICAL | 100+ violations documented |
| Missing endpoints for new components | HIGH | Frontend can't use mock server |
| No staged handover plan | MEDIUM | Unclear replacement path |
| Frontend not configured to call mock server | CRITICAL | Uses internal routes instead |

---

## Architecture: Spec vs Reality

### Specification (from mock-server-specification.md)

```
Frontend (3000) â”€â”€HTTPâ”€â”€â–º Mock Server (3001) â”€â”€â–º Static Data + Physics
         â”‚                                           â”‚
         â””â”€â”€ NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Reality

```
Frontend (3000) â”€â”€â–º Internal /api routes â”€â”€â–º Hardcoded Data in Components
                          â”‚
                          â””â”€â”€ DUPLICATE of mock server routes

Mock Server (3001) â”€â”€â–º Properly implemented but UNUSED
```

---

## Detailed Findings

### 1. Mock Server Has Proper Physics

The `h2-tank-mock-server/src/lib/physics/` directory contains real engineering:

**pressure-vessel.ts:**
```typescript
// Ïƒ_hoop = PR/t (thin-wall pressure vessel)
export function calculateHoopStress(pressure, radius, thickness) {
  return (pressure * radius) / thickness;
}

// Ïƒ_axial = PR/(2t)
export function calculateAxialStress(pressure, radius, thickness) {
  return (pressure * radius) / (2 * thickness);
}
```

**reliability.ts:**
```typescript
// Monte Carlo simulation with proper statistics
export function calculateReliability(designStress, materialStrength, strengthCOV, stressCOV, numSamples) {
  // Box-Muller transform for Gaussian sampling
  // Failure count when stress > strength
  // Reliability index Î² = -Î¦â»Â¹(P_f)
}
```

**Also implemented:**
- `composite-analysis.ts` - Laminate theory
- `dome-geometry.ts` - Isotensoid calculations
- `fatigue.ts` - Cycle life prediction
- `permeation.ts` - Hydrogen diffusion

### 2. Mock Server Has Correct Static Data

**Reference data (acceptable to be hardcoded in mock server):**
- `data/static/materials/material-database.json` - 10+ materials with engineering properties
- `data/static/standards/h2-standards.json` - Standards with requirements
- `data/static/designs/design-[a-e].json` - Pre-computed designs
- `data/static/pareto/pareto-50.json` - Optimization results

### 3. Frontend Has DUPLICATE API Routes

**PROBLEM:** `proagentic-dfx/src/app/api/` contains routes that duplicate mock server:

| Mock Server Route | Frontend Duplicate |
|-------------------|-------------------|
| `h2-tank-mock-server/src/app/api/designs/[id]/stress/route.ts` | `proagentic-dfx/src/app/api/designs/[id]/stress/route.ts` |
| `h2-tank-mock-server/src/app/api/materials/route.ts` | `proagentic-dfx/src/app/api/materials/route.ts` |
| (24+ routes total) | (24+ routes total) |

**The code is IDENTICAL** - they were copy-pasted.

### 4. Frontend Components Bypass API

As documented in `HARDCODED_MOCK_DATA_VIOLATIONS.md`, 100+ data points are hardcoded in components instead of fetching from API.

### 5. Missing Mock Server Endpoints

Components need these endpoints that don't exist in mock server:

| Endpoint Needed | Used By |
|-----------------|---------|
| `/api/designs/{id}/validation` | ValidationScreen.tsx |
| `/api/designs/{id}/verification` | VerificationChecklist.tsx |
| `/api/designs/{id}/manufacturing/winding` | ManufacturingPreview.tsx |
| `/api/designs/{id}/manufacturing/cure` | CureCycleChart.tsx |
| `/api/standards/{id}/details` | StandardsPanel.tsx |
| `/api/export/categories` | ExportScreen.tsx |
| `/api/requirements/examples` | RequirementsScreen.tsx |
| `/api/testing/labs` | ComplianceScreen.tsx |

---

## Remediation Plan

### Phase 1: Fix Frontend to Use Mock Server (4 hours)

1. **Delete frontend API routes** - Remove `proagentic-dfx/src/app/api/` entirely
2. **Configure frontend env** - Set `NEXT_PUBLIC_API_URL=http://localhost:3001`
3. **Update API client** - Ensure all fetches go to mock server URL

### Phase 2: Fix Hardcoded Data in Components (8 hours)

Remove all 100+ hardcoded data arrays from components, replace with API calls.
(See `HARDCODED_MOCK_DATA_VIOLATIONS.md` for full list)

### Phase 3: Add Missing Endpoints to Mock Server (8 hours)

Create these routes in `h2-tank-mock-server/src/app/api/`:

```
â”œâ”€â”€ designs/
â”‚   â””â”€â”€ [id]/
â”‚       â”œâ”€â”€ validation/route.ts      # NEW
â”‚       â”œâ”€â”€ verification/route.ts    # NEW
â”‚       â””â”€â”€ manufacturing/
â”‚           â”œâ”€â”€ winding/route.ts     # NEW
â”‚           â””â”€â”€ cure/route.ts        # NEW
â”œâ”€â”€ standards/
â”‚   â””â”€â”€ [id]/
â”‚       â””â”€â”€ details/route.ts         # NEW
â”œâ”€â”€ export/
â”‚   â””â”€â”€ categories/route.ts          # NEW
â”œâ”€â”€ requirements/
â”‚   â””â”€â”€ examples/route.ts            # NEW
â””â”€â”€ testing/
    â””â”€â”€ labs/route.ts                # NEW
```

### Phase 4: Staged Backend Handover Structure (4 hours)

Create endpoint categorization for staged replacement:

```typescript
// In mock server: lib/config/backend-routing.ts

export const ENDPOINT_CATEGORIES = {
  // Stage 1: Reference Data (can be replaced with database)
  REFERENCE_DATA: [
    '/api/materials',
    '/api/standards',
    '/api/testing/labs'
  ],

  // Stage 2: Design Calculations (replace with physics engine)
  PHYSICS_CALCULATIONS: [
    '/api/designs/*/stress',
    '/api/designs/*/failure',
    '/api/designs/*/thermal',
    '/api/designs/*/reliability'
  ],

  // Stage 3: Optimization (replace with ML/optimization backend)
  OPTIMIZATION: [
    '/api/optimization',
    '/api/optimization/*/stream',
    '/api/optimization/*/results'
  ],

  // Stage 4: AI Features (replace with LLM integration)
  AI_FEATURES: [
    '/api/requirements/parse',
    '/api/requirements/chat',
    '/api/tank-type/recommend'
  ]
};
```

---

## Staged Handover Path

### Stage 1: Database Backend (Week 1-2)
Replace static JSON files with PostgreSQL/Supabase:
- Materials database
- Standards database
- User designs storage

**Mock server contract unchanged** - just swap data source.

### Stage 2: Physics Engine (Week 3-4)
Replace JavaScript physics with Rust/Python backend:
- Stress calculations
- Failure analysis
- Thermal analysis
- Reliability (Monte Carlo)

**API contract unchanged** - same request/response shapes.

### Stage 3: Optimization Engine (Week 5-6)
Replace simulated optimization with real NSGA-II/MOEA:
- Genetic algorithm backend
- Real Pareto frontier generation
- Actual 500K+ evaluations

**API contract unchanged** - same SSE events, same result format.

### Stage 4: AI Integration (Week 7-8)
Replace mock NLP with actual Claude integration:
- Real requirements parsing
- Actual multi-turn dialogue
- Smart recommendations

**API contract unchanged** - same chat interface.

---

## Environment Configuration

### Development (Frontend + Mock Server)
```bash
# Terminal 1: Mock server
cd h2-tank-mock-server
DATA_MODE=hybrid npm run dev
# Running on http://localhost:3001

# Terminal 2: Frontend
cd proagentic-dfx
NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev
# Running on http://localhost:3000
```

### Production (Frontend + Real Backend)
```bash
# Frontend deployment
NEXT_PUBLIC_API_URL=https://api.h2tank.proaptus.com npm run build
```

**ZERO CODE CHANGES** - just environment variable.

---

## Verification Checklist

After remediation:

- [ ] Frontend has NO `/api` routes (all deleted)
- [ ] All frontend API calls go to `NEXT_PUBLIC_API_URL`
- [ ] No hardcoded data arrays in any `.tsx` component file
- [ ] Mock server serves ALL data needed by frontend
- [ ] `DATA_MODE=static` serves pre-computed data
- [ ] `DATA_MODE=simulated` calculates using physics
- [ ] Each endpoint has OpenAPI documentation
- [ ] Each endpoint has example response in `data/static/`
- [ ] Switching `NEXT_PUBLIC_API_URL` to real backend works with zero code changes

---

## Files to Modify

### DELETE (Frontend API Routes)
```
proagentic-dfx/src/app/api/          # DELETE ENTIRE DIRECTORY
```

### MODIFY (Frontend Configuration)
```
proagentic-dfx/.env.local            # Add NEXT_PUBLIC_API_URL
proagentic-dfx/src/lib/api/client.ts # Use env var for base URL
```

### ADD (Mock Server Endpoints)
```
h2-tank-mock-server/src/app/api/designs/[id]/validation/route.ts
h2-tank-mock-server/src/app/api/designs/[id]/verification/route.ts
h2-tank-mock-server/src/app/api/designs/[id]/manufacturing/winding/route.ts
h2-tank-mock-server/src/app/api/designs/[id]/manufacturing/cure/route.ts
h2-tank-mock-server/src/app/api/standards/[id]/details/route.ts
h2-tank-mock-server/src/app/api/export/categories/route.ts
h2-tank-mock-server/src/app/api/requirements/examples/route.ts
h2-tank-mock-server/src/app/api/testing/labs/route.ts
```

### ADD (Static Data Files)
```
h2-tank-mock-server/data/static/validation/sensor-locations.json
h2-tank-mock-server/data/static/validation/inspection-schedule.json
h2-tank-mock-server/data/static/manufacturing/winding-sequence.json
h2-tank-mock-server/data/static/manufacturing/cure-cycles.json
h2-tank-mock-server/data/static/standards/standard-details.json
h2-tank-mock-server/data/static/export/categories.json
h2-tank-mock-server/data/static/requirements/examples.json
h2-tank-mock-server/data/static/testing/labs.json
```

---

## Summary

The mock server **architecture is correct** but the **implementation is broken**:

1. Frontend doesn't use mock server - it has its own copy of routes
2. Frontend components bypass API with hardcoded data
3. Some needed endpoints don't exist in mock server

**Fix these issues and the staged handover will work perfectly.**

---

*Report generated by architecture review of H2 Tank Designer mock server*

