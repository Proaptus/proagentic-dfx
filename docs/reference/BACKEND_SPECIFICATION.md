---
doc_type: reference
title: 'Backend Production Specification'
version: 1.0.0
date: 2025-12-12
owner: '@proaptus'
status: draft
last_verified_at: 2025-12-12
---

# Backend Production Specification

## Executive Summary

This document maps all frontend data requirements to production backend modules, identifying what produces each piece of data and flagging architectural decisions needed.

**Key Findings:**

- 25 API endpoints required by frontend
- 7 backend modules identified
- 1 module production-ready (Physics Engine)
- 4 critical architectural decisions pending
- 6 infrastructure gaps to address
- Estimated MVP effort: 9 weeks

---

## API Endpoint Inventory

### By Screen

| Screen             | Endpoints | Primary Functions                           |
| ------------------ | --------- | ------------------------------------------- |
| RequirementsScreen | 8         | parse, chat, recommend, optimize            |
| ParetoScreen       | 1         | getOptimizationResults                      |
| ViewerScreen       | 2         | getGeometry, getStress                      |
| AnalysisScreen     | 5         | stress, failure, thermal, reliability, cost |
| CompareScreen      | 2         | getDesign, compareDesigns                   |
| ExportScreen       | 3         | startExport, getStatus, download            |
| ValidationScreen   | 1         | getSentry                                   |
| **Total**          | **25**    |                                             |

### By Data Production Type

| Category             | Endpoints | Production Module      |
| -------------------- | --------- | ---------------------- |
| LLM-Required         | 4         | LLM Gateway            |
| Physics Calculation  | 8         | Physics Engine (READY) |
| Optimization         | 5         | Optimization Service   |
| CAD Generation       | 3         | CAD Service            |
| Static Data          | 6         | Data Service           |
| Composition          | 4         | Orchestration Layer    |
| External Integration | 3         | Future Phase           |

---

## Production Backend Modules

### Module 1: LLM Gateway Service

**Purpose:** Natural language processing and AI-powered features

**Endpoints:**

- `POST /api/requirements/parse` - NL to structured JSON
- `POST /api/requirements/chat` - Conversational extraction
- `POST /api/tank-type/recommend` - AI recommendation
- `POST /api/export/generate-report` - Document generation

**Tech Options:**
| Option | Pros | Cons |
|--------|------|------|
| Node.js + Vercel AI SDK | Same runtime, simple deploy | Less mature RAG |
| Python + LangChain | Mature RAG, better prompts | Separate service |

**Recommendation:** Node.js + Vercel AI SDK for MVP

**Required Capabilities:**

- Claude API integration
- Prompt template management
- Conversation history handling
- RAG for standards (ISO 11119-3, UN R134)
- Confidence score generation

**Current State:** Mock regex extraction - needs LLM replacement

---

### Module 2: Physics Engine (PRODUCTION READY)

**Purpose:** Engineering calculations with first-principles physics

**Endpoints:**

- `GET /api/designs/{id}/stress` - Pressure vessel analysis
- `GET /api/designs/{id}/failure` - Composite failure criteria
- `GET /api/designs/{id}/thermal` - Thermal performance
- `GET /api/designs/{id}/reliability` - Monte Carlo simulation
- `GET /api/geometry/dome-profile` - Isotensoid ODE solver
- `GET /api/designs/{id}/cost` - Cost model
- `POST /api/analysis/fatigue` - S-N curves
- `POST /api/analysis/permeation` - Fick's law

**Already Implemented (TypeScript):**

```typescript
// pressure-vessel.ts
sigma_hoop = P * R / t

// composite-analysis.ts
Tsai-Wu failure criterion
Hashin damage initiation

// dome-geometry.ts
Isotensoid ODE: d^2y/dx^2 = f(y, dy/dx, P, sigma)

// reliability.ts
Monte Carlo simulation (10,000 samples)

// fatigue.ts
S-N curves with Miner's rule

// permeation.ts
Fick's law with Arrhenius temperature correction
```

**Action:** LIFT AND SHIFT from mock server to production API routes

**Future Enhancement:** Rust port for Monte Carlo parallelization (rayon)

---

### Module 3: Optimization Service

**Purpose:** Multi-objective design optimization

**Endpoints:**

- `POST /api/optimization` - Start optimization job
- `GET /api/optimization/{id}` - Job status
- `GET /api/optimization/{id}/results` - Pareto front
- `DELETE /api/optimization/{id}` - Cancel job
- `GET /api/optimization/{id}/stream` - SSE progress

**Tech Options:**
| Option | Pros | Cons |
|--------|------|------|
| Python (pymoo) | NSGA-II, constraints | Separate service |
| Rust | Native parallelism | More effort |
| External (AWS) | Managed service | Vendor lock-in |

**Recommendation:** Python with pymoo for MVP

**Required Capabilities:**

- NSGA-II multi-objective optimization
- Constraint handling (pressure, weight, cost)
- Pareto frontier generation
- Real-time progress streaming (SSE)
- Job queue management

**Current State:** Mock simulator only - needs full implementation

---

### Module 4: CAD/Geometry Service

**Purpose:** 3D model generation and CAD file export

**Endpoints:**

- `POST /api/export/step` - STEP file export
- `POST /api/export/stl` - STL mesh export
- `POST /api/export/gltf` - glTF for web
- `GET /api/designs/{id}/geometry` - Geometry data

**Tech Options:**
| Option | Pros | Cons |
|--------|------|------|
| Client WASM | No server cost | 66MB download |
| Server WASM | Smaller client | Server scaling |
| Rust opencascade-rs | Best performance | Complex deploy |

**Recommendation:** Client-side OpenCascade.js WASM (per OPENCASCADE_INTEGRATION_PLAN.md)

**Implementation:**

1. Lazy-load WASM on ViewerScreen mount
2. B-rep solid generation in browser
3. Mesh extraction for Three.js rendering
4. STEP export via Emscripten virtual FS

---

### Module 5: Data Service

**Purpose:** Persistent storage for designs, materials, standards

**Endpoints:**

- `GET /api/designs` - List all designs
- `GET /api/designs/{id}` - Single design
- `POST /api/designs` - Save new design
- `GET /api/materials` - Material database
- `GET /api/standards` - Standards list
- `GET /api/standards/library` - Full standards library
- `GET /api/labs` - Testing laboratories
- `GET /api/tank-types` - Tank type definitions

**Tech:** PostgreSQL + Prisma ORM

**Schema Design:**

```prisma
model Design {
  id        String   @id @default(cuid())
  name      String
  geometry  Json     // JSONB for flexibility
  analysis  Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String?
}

model Material {
  id         String @id
  name       String
  properties Json
  category   String
}

model Standard {
  id       String @id
  code     String
  name     String
  version  String
  clauses  Json
}
```

**Current State:** Static JSON files - needs database migration

---

### Module 6: Composition/Orchestration Layer

**Purpose:** Aggregate data from multiple services

**Endpoints:**

- `POST /api/compare` - Multi-design comparison
- `GET /api/designs/{id}/compliance` - Standards + analysis
- `GET /api/designs/{id}/test-plan` - Test requirements
- `POST /api/export` - Export package generation

**Implementation:** Next.js API routes as orchestration layer

```typescript
// /api/compare/route.ts
export async function POST(req: Request) {
  const { design_ids } = await req.json();

  // Call multiple services in parallel
  const designs = await Promise.all(design_ids.map((id) => getDesign(id)));

  // Aggregate and normalize for comparison
  return Response.json({
    designs,
    radar_data: normalizeForRadar(designs),
    metrics: calculateMetrics(designs),
  });
}
```

---

### Module 7: External Integration (FUTURE PHASE)

**Purpose:** External FEA validation and live monitoring

**Endpoints:**

- `POST /api/validation/request-fea` - External FEA request
- `GET /api/validation/fea-status/{id}` - FEA job status
- `WebSocket /api/sentry/stream` - Live sensor data

**Tech:** Queue system (BullMQ/Redis) + CalculiX bridge

**Status:** NOT MVP CRITICAL - defer to v2

---

## Critical Architectural Decisions

### Decision 1: LLM Integration [HIGH PRIORITY]

**Question:** Where does LLM inference run?

| Option                         | Recommendation |
| ------------------------------ | -------------- |
| **A) Node.js + Vercel AI SDK** | **MVP**        |
| B) Python + LangChain          | Future RAG     |
| C) Rust + llm-chain            | Not mature     |

**Rationale:** Same runtime simplifies deployment, Vercel AI SDK supports Claude

---

### Decision 2: Optimization Engine [HIGH PRIORITY]

**Question:** What technology for multi-objective optimization?

| Option                   | Recommendation     |
| ------------------------ | ------------------ |
| **A) Python + pymoo**    | **MVP**            |
| B) Rust + custom NSGA-II | Future performance |
| C) External service      | Not recommended    |

**Rationale:** pymoo is mature, has NSGA-II, good documentation

---

### Decision 3: CAD Deployment [HIGH PRIORITY]

**Question:** Where does OpenCascade run?

| Option             | Recommendation |
| ------------------ | -------------- |
| **A) Client WASM** | **MVP**        |
| B) Server WASM     | Fallback       |
| C) Rust backend    | Future         |

**Rationale:** Client-side reduces server costs, already planned

---

### Decision 4: Database Design [MEDIUM PRIORITY]

**Question:** Normalized tables or JSONB columns?

| Option               | Recommendation |
| -------------------- | -------------- |
| **A) JSONB columns** | **MVP**        |
| B) Normalized schema | Future scale   |

**Rationale:** JSONB provides flexibility during rapid iteration

---

## Infrastructure Gaps

| Gap            | Required For           | Tech Options        | Priority |
| -------------- | ---------------------- | ------------------- | -------- |
| WebSocket/SSE  | Optimization streaming | Redis pub/sub       | HIGH     |
| Authentication | Multi-tenancy          | Clerk, NextAuth     | MEDIUM   |
| File Storage   | CAD exports            | S3, R2, Vercel Blob | MEDIUM   |
| Job Queue      | Async processing       | BullMQ, SQS         | HIGH     |
| Rate Limiting  | API protection         | Upstash, custom     | LOW      |
| Caching        | Performance            | Redis, Vercel KV    | LOW      |

---

## Code Gaps

### Frontend (Unused/Missing)

- `cancelOptimization()` - API exists, no UI button
- `undo/redo` - State history exists, no UI controls
- `per-layer stress viz` - Data available, not displayed
- `getStandards()` / `getMaterials()` - Dead code

### Backend (Needs Implementation)

- Optimization simulator replacement with real NSGA-II
- Requirements chat LLM integration
- Export file generation
- Database migration from JSON files

---

## Recommended MVP Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│        (React + Three.js + OpenCascade.js WASM)             │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST/SSE
┌───────────────────────┴─────────────────────────────────────┐
│                   Next.js API Routes                         │
│           (Composition Layer + Physics Engine)              │
└─────┬───────────┬───────────────────────┬──────────────────┘
      │           │                       │
┌─────┴─────┐ ┌───┴─────────────┐ ┌──────┴────────────────┐
│ LLM       │ │ Optimization    │ │ PostgreSQL            │
│ Gateway   │ │ Service         │ │ (Prisma ORM)          │
│(Vercel AI)│ │ (Python/pymoo)  │ │                       │
└───────────┘ └─────────────────┘ └───────────────────────┘
```

---

## Implementation Roadmap

| Phase     | Module                | Effort       | Dependencies |
| --------- | --------------------- | ------------ | ------------ |
| 1         | Data Service (DB)     | 1 week       | None         |
| 2         | Physics Engine (lift) | 0.5 weeks    | Phase 1      |
| 3         | LLM Gateway           | 2 weeks      | Phase 1      |
| 4         | Optimization Service  | 3 weeks      | Phase 2      |
| 5         | CAD Service           | 2 weeks      | None         |
| 6         | Composition Layer     | 1 week       | All above    |
| **Total** | **MVP**               | **~9 weeks** |              |

---

## Summary

**Production-Ready:** Physics Engine (TypeScript) - lift and shift

**Needs Implementation:**

1. LLM Gateway (Node.js + Vercel AI SDK)
2. Optimization Service (Python + pymoo)
3. Data Service (PostgreSQL + Prisma)
4. Composition Layer (Next.js API routes)

**Deferred:** External FEA integration (Module 7)

**Critical Path:** Database → Physics lift → LLM → Optimization

---

_Generated by ProSWARM Neural Orchestration - 2025-12-12_
