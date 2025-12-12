---
id: BACK-DEV-BACKLOG-2025-12-12
doc_type: runbook
title: 'Backend Development Backlog - H2 Tank Designer Production System'
version: 1.0.1
date: 2025-12-12
owner: '@h2-tank-team'
status: draft
last_verified_at: 2025-12-12
supersedes: []
keywords: ['backend', 'backlog', 'rust', 'optimization', 'physics', 'production', 'llm']
sources_of_truth: ['RTM_AUDIT_2025-12-11', 'BACKEND_SPECIFICATION']
---

# BACKEND DEVELOPMENT BACKLOG

## H2 Tank Designer Production System

**Generated**: 2025-12-12
**Target**: Replace mock server with production-ready Rust/Node.js backend
**Source**: RTM Requirements, BACKEND_SPECIFICATION.md, Walkthrough UAT

---

## EXECUTIVE SUMMARY

This backlog sequences all backend development work to transform the mock server into a production-ready engineering platform. Work is organized into **10 Phases** aligned with system architecture and dependencies.

**Scope**: Core backend capabilities to generate real data. Functional MVP with high code quality. NOT enterprise features.

### Backlog Metrics

| Phase                     | Tasks  | P1 Critical | P2 Enhancement | Complexity |
| ------------------------- | ------ | ----------- | -------------- | ---------- |
| 1. Infrastructure         | 8      | 6           | 2              | L          |
| 2. Requirements Parsing   | 5      | 5           | 0              | M          |
| 3. Configuration          | 6      | 4           | 2              | M          |
| 4. Optimization Engine    | 8      | 8           | 0              | XL         |
| 5. Pareto Results         | 5      | 4           | 1              | M          |
| 6. Design Analysis        | 14     | 10          | 4              | XL         |
| 7. Design Comparison      | 4      | 3           | 1              | S          |
| 8. Validation & Testing   | 5      | 4           | 1              | M          |
| 9. Export & Documentation | 10     | 6           | 4              | L          |
| 10. LLM & Automation      | 5      | 2           | 3              | L          |
| **TOTAL**                 | **70** | **52**      | **18**         |            |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                         │
│                    Port 3000 - App Router                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/SSE
┌───────────────────────────▼─────────────────────────────────────┐
│                 API Gateway / Orchestration Layer                │
│              (Node.js + Vercel AI SDK) - Port 3001              │
├─────────────────┬───────────────────┬───────────────────────────┤
│ LLM Gateway     │ Physics Engine    │ Optimization Service      │
│ (Claude API)    │ (TypeScript/Rust) │ (Rust NSGA-II)           │
├─────────────────┼───────────────────┼───────────────────────────┤
│ CAD Service     │ Data Service      │ Export Service            │
│ (OpenCASCADE)   │ (PostgreSQL)      │ (PDF/STEP/CSV)           │
└─────────────────┴───────────────────┴───────────────────────────┘
```

### Dependency Graph

```
Phase 1 (Infrastructure) ──┬──> Phase 2 (Requirements) ──> Phase 3 (Config)
                           │                                     │
                           ▼                                     ▼
                     Phase 4 (Optimization) ◄────────────────────┘
                           │
                           ▼
                     Phase 5 (Pareto Results)
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
Phase 6 (Analysis)   Phase 7 (Compare)   Phase 8 (Validation)
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                     Phase 9 (Export)
                           │
                           ▼
                     Phase 10 (LLM Automation)
```

---

## PHASE 1: INFRASTRUCTURE & FOUNDATION

> **Objective**: Establish production backend architecture, database, authentication
> **Complexity**: Large | **Duration**: Foundation layer

### BACK-001: Database Schema & Migrations

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: Infrastructure
**Dependencies**: None

**Description**:
Design and implement PostgreSQL database schema for storing designs, optimization jobs, analysis results, and user sessions.

**Deliverables**:

- [ ] Database schema design document
- [ ] Migration scripts for all tables
- [ ] Seed data for materials, standards
- [ ] Connection pooling configuration

**Tables Required**:

- `designs` - Tank design configurations
- `optimization_jobs` - Job tracking and status
- `pareto_results` - Optimization results
- `analysis_results` - Cached analysis outputs
- `materials` - Material property database
- `standards` - Regulatory standards data
- `users` / `sessions` - Authentication

---

### BACK-002: Authentication Service

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: Infrastructure, Security
**Dependencies**: BACK-001

**Description**:
Implement basic authentication with session management. Single-user mode acceptable for MVP, but architecture should support multi-user.

**Deliverables**:

- [ ] `POST /api/auth/login` - Credential validation
- [ ] `POST /api/auth/logout` - Session termination
- [ ] `GET /api/auth/session` - Session validation
- [ ] JWT token generation and validation
- [ ] Middleware for protected routes

**Acceptance Criteria**:

- Environment-based credentials (no hardcoded secrets)
- Session timeout after 24 hours
- All API endpoints require valid session (except login)

---

### BACK-003: API Gateway Setup

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: Infrastructure
**Dependencies**: BACK-002

**Description**:
Configure API gateway with CORS, rate limiting, request validation, and error handling.

**Deliverables**:

- [ ] CORS configuration for frontend origin
- [ ] Request validation middleware (Zod schemas)
- [ ] Global error handling with structured responses
- [ ] Request/response logging
- [ ] Rate limiting (1000 req/min default)

---

### BACK-004: File Storage Service

**Priority**: P1 Critical
**Complexity**: S
**Requirements**: REQ-111 to REQ-120
**Dependencies**: None

**Description**:
Implement local file storage with abstraction layer for future cloud migration.

**Deliverables**:

- [ ] File storage abstraction interface
- [ ] Local filesystem implementation
- [ ] Temp file cleanup job (24h retention)
- [ ] File path security (prevent traversal)
- [ ] GCS/S3 adapter interface (stub for future)

---

### BACK-005: Background Job Queue

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-058 to REQ-064
**Dependencies**: BACK-001

**Description**:
Implement job queue for long-running operations (optimization, export generation).

**Deliverables**:

- [ ] Job queue service (BullMQ or similar)
- [ ] Job status tracking
- [ ] Job cancellation support
- [ ] SSE event emitter for progress
- [ ] Job cleanup (completed jobs after 7 days)

---

### BACK-006: Rust Service Integration

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: Performance (REQ-130, REQ-131)
**Dependencies**: BACK-003

**Description**:
Set up Rust service for performance-critical calculations (optimization, Monte Carlo).

**Deliverables**:

- [ ] Rust service project structure
- [ ] HTTP server (actix-web or axum)
- [ ] JSON serialization (serde)
- [ ] Integration with Node.js API gateway
- [ ] Docker container for Rust service

---

### BACK-007: Materials Database Population

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-011 to REQ-015
**Dependencies**: BACK-001

**Description**:
Populate materials database with comprehensive fiber, resin, liner, and boss material properties.

**Deliverables**:

- [ ] 30+ materials from mock server data
- [ ] Complete CLT properties for composites
- [ ] Permeation coefficients for liners
- [ ] Cost data for all materials
- [ ] Material compatibility rules

---

### BACK-008: Standards Database Population

**Priority**: P2 Enhancement
**Complexity**: S
**Requirements**: REQ-003
**Dependencies**: BACK-001

**Description**:
Populate standards database with hydrogen tank regulations and their requirements.

**Deliverables**:

- [ ] ISO 11119-3 requirements
- [ ] UN R134 requirements
- [ ] EC 79/2009 requirements
- [ ] SAE J2579 requirements
- [ ] Clause-level requirement mapping

---

## PHASE 2: REQUIREMENTS INPUT & PARSING

> **Objective**: Natural language processing to structured requirements
> **Complexity**: Medium | **Requirements**: REQ-001 to REQ-006

### BACK-009: NL Requirements Parser (REQ-001)

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: REQ-001
**Dependencies**: BACK-003, LLM API Access

**Description**:
Implement `POST /api/requirements/parse` endpoint to convert free-text briefs into structured requirements using Claude API.

**Deliverables**:

- [ ] Claude API integration
- [ ] Prompt template for requirements extraction
- [ ] Confidence scoring for each extracted field
- [ ] Structured JSON output schema
- [ ] Fallback to regex extraction if LLM unavailable

**Input Example**:

```json
{
  "brief": "Design a 700 bar hydrogen tank for automotive use, 150L capacity, max 120kg"
}
```

**Output Schema**:

```json
{
  "working_pressure_bar": 700,
  "burst_pressure_bar": 1575,
  "volume_liters": 150,
  "max_weight_kg": 120,
  "application": "automotive",
  "confidence_scores": { "pressure": 0.95, "volume": 0.92 }
}
```

---

### BACK-010: Pressure Specification Decoder (REQ-002)

**Priority**: P1 Critical
**Complexity**: S
**Requirements**: REQ-002
**Dependencies**: BACK-009

**Description**:
Implement logic to distinguish and derive pressure specifications (working, test, burst).

**Deliverables**:

- [ ] Working pressure to burst pressure conversion (2.25x)
- [ ] Working pressure to test pressure conversion (1.5x)
- [ ] Detection of which pressure type was specified
- [ ] Warning if pressure seems unrealistic (<100 bar or >1000 bar working)

**Acceptance Criteria**:

- Input "700 bar" correctly derives 1050 bar test, 1575 bar burst
- Explicit burst pressure overrides calculation
- Validation against standard limits

---

### BACK-011: Derived Requirements Calculator (REQ-004, REQ-005, REQ-006)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-004, REQ-005, REQ-006
**Dependencies**: BACK-010

**Description**:
Calculate all derived requirements from primary inputs using physics and standards lookup.

**Deliverables**:

- [ ] Cycle life estimation (based on application)
- [ ] Temperature range determination
- [ ] Fire test requirement identification
- [ ] Permeation limit calculation
- [ ] Safety factor validation

**Lookup Tables**:
| Application | Min Temp | Max Temp | Cycles | Fire Test |
|-------------|----------|----------|--------|-----------|
| Automotive | -40°C | +85°C | 11,000 | Required |
| Aviation | -54°C | +70°C | 15,000 | Required |
| Stationary | -20°C | +50°C | 5,000 | Optional |
| Marine | -20°C | +65°C | 7,500 | Required |

---

### BACK-012: Standards Cross-Reference (REQ-003)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-003
**Dependencies**: BACK-008, BACK-009

**Description**:
Implement standards selection based on region and application.

**Deliverables**:

- [ ] `GET /api/standards` - List all standards
- [ ] `GET /api/standards/{id}` - Standard details
- [ ] Automatic standard selection based on region
- [ ] Standard requirement extraction for compliance checking

**Selection Logic**:

- Europe → EC 79/2009, UN R134
- USA → SAE J2579, DOT requirements
- Global → ISO 11119-3

---

### BACK-013: Requirements Chat Endpoint (REQ-190-196)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-190 to REQ-196
**Dependencies**: BACK-009

**Description**:
Multi-turn conversational requirements extraction with context preservation.

**Deliverables**:

- [ ] `POST /api/requirements/chat` - Conversational endpoint
- [ ] Conversation history management
- [ ] Progressive field population
- [ ] Proactive follow-up question generation
- [ ] Suggestion chips for common values

**Conversation Flow**:

1. User provides initial brief
2. System extracts what it can, asks clarifying questions
3. User provides additional details
4. System confirms understanding, presents structured summary

---

## PHASE 3: CONFIGURATION (TANK TYPE & MATERIALS)

> **Objective**: Tank type recommendation and material selection
> **Complexity**: Medium | **Requirements**: REQ-007 to REQ-015

### BACK-014: Tank Type Recommender (REQ-007, REQ-008)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-007, REQ-008
**Dependencies**: BACK-011

**Description**:
Implement `POST /api/tank-type/recommend` to suggest optimal tank type based on requirements.

**Deliverables**:

- [ ] Type I-V feasibility analysis
- [ ] Weight/cost/performance scoring
- [ ] Recommendation rationale generation
- [ ] Comparison table data

**Decision Matrix**:
| Requirement | Type I | Type II | Type III | Type IV | Type V |
|-------------|--------|---------|----------|---------|--------|
| Weight < 0.6 kg/L | ❌ | ❌ | ⚠️ | ✅ | ✅ |
| Pressure > 500 bar | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Cost < $500/kg H2 | ✅ | ✅ | ⚠️ | ❌ | ❌ |
| Permeation < 10 NmL/hr/L | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |

---

### BACK-015: Type V Trade-Off Analysis (REQ-009)

**Priority**: P1 Critical
**Complexity**: S
**Requirements**: REQ-009
**Dependencies**: BACK-014

**Description**:
Provide detailed trade-off analysis for Type V (all-composite) tanks.

**Deliverables**:

- [ ] Type V feasibility assessment
- [ ] Certification challenge documentation
- [ ] Permeation concern analysis
- [ ] "Why not Type V?" explanation endpoint

**Caveats to Include**:

- Limited regulatory pathway
- Higher permeation rates
- More complex manufacturing
- Higher material costs
- Fewer qualified suppliers

---

### BACK-016: Hybrid Layup Support (REQ-010)

**Priority**: P2 Enhancement
**Complexity**: M
**Requirements**: REQ-010
**Dependencies**: BACK-014

**Description**:
Support hybrid fiber layup exploration (carbon + glass combinations).

**Deliverables**:

- [ ] Hybrid layup configuration options
- [ ] Cost/weight optimization for hybrids
- [ ] CLT calculations for mixed materials
- [ ] Manufacturing feasibility notes

---

### BACK-017: Materials API (REQ-011-015)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-011 to REQ-015
**Dependencies**: BACK-007

**Description**:
Complete materials API with selection and validation.

**Deliverables**:

- [ ] `GET /api/materials` - List all materials by category
- [ ] `GET /api/materials/{id}` - Material details with full properties
- [ ] `POST /api/materials/select` - Validate material combination
- [ ] Material compatibility checking
- [ ] Permeation limit validation for liners

**Response Schema**:

```json
{
  "fibers": [{ "id": "T700S", "name": "Toray T700S", "tensile_strength_mpa": 4900, ... }],
  "resins": [...],
  "liners": [...],
  "bosses": [...]
}
```

---

### BACK-018: Material Combination Validator

**Priority**: P1 Critical
**Complexity**: S
**Requirements**: REQ-015
**Dependencies**: BACK-017

**Description**:
Validate material combinations for compatibility and performance.

**Deliverables**:

- [ ] Fiber-resin compatibility matrix
- [ ] Liner-boss compatibility check
- [ ] Permeation limit verification
- [ ] Warning generation for suboptimal combinations

**Validation Rules**:

- HDPE liner requires HDPE-compatible boss material
- Carbon fiber requires compatible resin Tg
- Permeation rate must meet 46 NmL/hr/L limit at 85°C

---

### BACK-019: Configuration Summary Generator

**Priority**: P2 Enhancement
**Complexity**: S
**Requirements**: UI Support
**Dependencies**: BACK-014, BACK-017

**Description**:
Generate configuration summary for review screen.

**Deliverables**:

- [ ] `GET /api/configuration/summary` - Complete config summary
- [ ] Bill of materials preview
- [ ] Estimated weight range
- [ ] Estimated cost range

---

## PHASE 4: OPTIMIZATION ENGINE

> **Objective**: Multi-objective NSGA-II optimization with real-time progress
> **Complexity**: Extra Large | **Requirements**: REQ-058 to REQ-064

### BACK-020: Optimization Job Manager

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: REQ-058
**Dependencies**: BACK-005, BACK-006

**Description**:
Implement `POST /api/optimization` to start optimization jobs.

**Deliverables**:

- [ ] Job creation with unique ID (opt-\*)
- [ ] Parameter validation
- [ ] Job queue submission
- [ ] Initial status response

**Request Schema**:

```json
{
  "requirements": {
    /* from Phase 2 */
  },
  "materials": {
    /* from Phase 3 */
  },
  "objectives": ["minimize_weight", "minimize_cost", "maximize_reliability"],
  "constraints": {
    "max_weight_kg": 120,
    "min_burst_pressure_bar": 1575
  },
  "settings": {
    "population_size": 100,
    "generations": 200,
    "convergence_threshold": 0.001
  }
}
```

---

### BACK-021: NSGA-II Core Implementation (Rust)

**Priority**: P1 Critical
**Complexity**: XL
**Requirements**: REQ-130, REQ-131
**Dependencies**: BACK-006

**Description**:
Implement NSGA-II multi-objective optimization algorithm in Rust.

**Deliverables**:

- [ ] NSGA-II algorithm implementation
- [ ] Non-dominated sorting
- [ ] Crowding distance calculation
- [ ] Tournament selection
- [ ] SBX crossover and polynomial mutation
- [ ] Constraint handling

**Performance Target**:

- 100,000+ design evaluations in 60 seconds
- Population size: 100-200
- Generations: 100-500

---

### BACK-022: Design Evaluation Function

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: REQ-131
**Dependencies**: BACK-021

**Description**:
Fast design evaluation using surrogate models or analytical equations.

**Deliverables**:

- [ ] Weight calculation from geometry and materials
- [ ] Burst pressure estimation (analytical or surrogate)
- [ ] Cost calculation from material quantities
- [ ] Reliability estimation (simplified)
- [ ] Constraint violation calculation

**Design Variables**:

- Inner diameter (mm)
- Cylinder length (mm)
- Layer thicknesses (mm per layer)
- Fiber angles (degrees)
- Number of layers
- Dome profile parameter (α₀)

---

### BACK-023: Surrogate Model Integration

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: REQ-090 to REQ-093
**Dependencies**: BACK-022

**Description**:
Integrate trained surrogate models (ONNX) for fast evaluation.

**Deliverables**:

- [ ] ONNX runtime integration in Rust
- [ ] Surrogate model loading and caching
- [ ] Model accuracy tracking
- [ ] Fallback to analytical if model unavailable

**Models Required**:

- Burst pressure predictor
- Weight predictor
- Stress distribution predictor
- Failure mode classifier

---

### BACK-024: SSE Progress Streaming (REQ-058-061)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-058 to REQ-061
**Dependencies**: BACK-020

**Description**:
Implement `GET /api/optimization/{id}/stream` for real-time progress.

**Deliverables**:

- [ ] SSE endpoint with proper headers
- [ ] Progress percentage calculation
- [ ] Generation counter
- [ ] Designs evaluated counter
- [ ] Current Pareto front size
- [ ] Heartbeat events (keep-alive)

**Event Types**:

```
event: progress
data: {"generation": 50, "designs_evaluated": 5000, "pareto_size": 35, "progress_percent": 25}

event: best_design
data: {"weight_kg": 45.2, "cost_eur": 12500, "burst_bar": 1620}

event: complete
data: {"total_designs": 20000, "pareto_size": 50, "duration_seconds": 45}
```

---

### BACK-025: Best Designs Updates (REQ-062-064)

**Priority**: P1 Critical
**Complexity**: S
**Requirements**: REQ-062 to REQ-064
**Dependencies**: BACK-024

**Description**:
Include current best designs in progress stream.

**Deliverables**:

- [ ] Top 5 designs by each objective
- [ ] Pareto front snapshot (every 10 generations)
- [ ] Convergence metrics for plotting

---

### BACK-026: Job Status Endpoint

**Priority**: P1 Critical
**Complexity**: S
**Requirements**: REQ-058
**Dependencies**: BACK-020

**Description**:
Implement `GET /api/optimization/{id}` for job status polling.

**Deliverables**:

- [ ] Job status (queued, running, completed, failed, cancelled)
- [ ] Progress percentage
- [ ] Start time and duration
- [ ] Error message if failed

---

### BACK-027: Job Cancellation

**Priority**: P1 Critical
**Complexity**: S
**Requirements**: Job Control
**Dependencies**: BACK-020

**Description**:
Implement `DELETE /api/optimization/{id}` to cancel running jobs.

**Deliverables**:

- [ ] Cancellation signal handling
- [ ] Graceful shutdown (save partial results)
- [ ] Resource cleanup
- [ ] Status update to cancelled

---

## PHASE 5: PARETO RESULTS & DESIGN SELECTION

> **Objective**: Return and present optimization results
> **Complexity**: Medium | **Requirements**: REQ-065 to REQ-075

### BACK-028: Optimization Results Endpoint (REQ-065-069)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-065 to REQ-069
**Dependencies**: Phase 4 Complete

**Description**:
Implement `GET /api/optimization/{id}/results` to return Pareto-optimal designs.

**Deliverables**:

- [ ] All Pareto-optimal designs
- [ ] Design ID assignment (P1, P2, ... Pn)
- [ ] Metrics for each design (weight, cost, burst, reliability)
- [ ] Trade-off category tags
- [ ] Normalized values for radar chart

**Response Schema**:

```json
{
  "job_id": "opt-abc123",
  "total_designs": 50,
  "recommended_design_id": "P12",
  "designs": [
    {
      "id": "P1",
      "metrics": {
        "weight_kg": 42.5,
        "cost_eur": 15000,
        "burst_pressure_bar": 1650,
        "failure_probability": 0.001
      },
      "trade_off_category": "lightweight",
      "normalized_values": { "weight": 0.95, "cost": 0.6, "safety": 0.85 }
    }
  ]
}
```

---

### BACK-029: Design Recommendation (REQ-070)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-070
**Dependencies**: BACK-028

**Description**:
Identify and explain the recommended design from Pareto set.

**Deliverables**:

- [ ] Recommendation algorithm (balanced point)
- [ ] Priority weighting support
- [ ] Rationale text generation
- [ ] "Why this design?" explanation

**Recommendation Logic**:

1. Calculate ideal point (best value per objective)
2. Find design closest to ideal (Euclidean distance in normalized space)
3. Apply user priority weights if specified
4. Generate natural language rationale

---

### BACK-030: Design Details Endpoint

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: Design Access
**Dependencies**: BACK-028

**Description**:
Implement `GET /api/designs/{id}` to retrieve full design details.

**Deliverables**:

- [ ] Complete geometry parameters
- [ ] Layup schedule
- [ ] Material assignments
- [ ] All calculated metrics
- [ ] Design metadata

---

### BACK-031: Design Persistence

**Priority**: P1 Critical
**Complexity**: S
**Requirements**: Data Persistence
**Dependencies**: BACK-001, BACK-028

**Description**:
Persist Pareto designs to database for downstream access.

**Deliverables**:

- [ ] Design table storage
- [ ] Optimization job relationship
- [ ] Design versioning
- [ ] Soft delete support

---

### BACK-032: Pareto Visualization Data (REQ-071)

**Priority**: P2 Enhancement
**Complexity**: S
**Requirements**: REQ-071
**Dependencies**: BACK-028

**Description**:
Prepare data optimized for Pareto frontier visualization.

**Deliverables**:

- [ ] 2D projection data (weight vs cost)
- [ ] 3D scatter data (weight vs cost vs reliability)
- [ ] Axis ranges and scaling
- [ ] Interactive hover data

---

## PHASE 6: DETAILED DESIGN ANALYSIS

> **Objective**: Comprehensive engineering analysis of selected designs
> **Complexity**: Extra Large | **Requirements**: REQ-016 to REQ-057, REQ-076 to REQ-089

### BACK-033: Geometry Generation (REQ-016, REQ-017)

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: REQ-016, REQ-017
**Dependencies**: BACK-030

**Description**:
Implement `GET /api/designs/{id}/geometry` with isotensoid dome profile.

**Deliverables**:

- [ ] Isotensoid ODE solver (existing from mock)
- [ ] Dome meridian coordinate generation
- [ ] α₀ (geodesic angle) calculation
- [ ] Boss radius integration
- [ ] 2D profile data for plotting

**Isotensoid Equation**:

```
d²y/dx² = f(y, dy/dx, P, σ_fiber)
```

---

### BACK-034: Boss & Dimension Calculation (REQ-018)

**Priority**: P1 Critical
**Complexity**: S
**Requirements**: REQ-018
**Dependencies**: BACK-033

**Description**:
Include complete dimensional data in geometry response.

**Deliverables**:

- [ ] Boss inner/outer diameter
- [ ] Boss length
- [ ] Cylinder inner/outer diameter
- [ ] Cylinder length
- [ ] Total tank length
- [ ] Wall thickness distribution

---

### BACK-035: Thickness Distribution (REQ-021)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-021
**Dependencies**: BACK-033

**Description**:
Compute and return thickness variation along tank profile.

**Deliverables**:

- [ ] Thickness vs position array
- [ ] Min/max thickness
- [ ] Thickness at key regions (cylinder, dome apex, transition)
- [ ] Color map data for visualization

---

### BACK-036: Layup Definition (REQ-025-028)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-025 to REQ-028
**Dependencies**: BACK-033

**Description**:
Return complete layup schedule in geometry response.

**Deliverables**:

- [ ] Layer-by-layer definition
- [ ] Layer type (helical/hoop)
- [ ] Fiber angle per layer
- [ ] Thickness per layer
- [ ] Coverage region (full/cylinder)
- [ ] Winding sequence

**Layup Schema**:

```json
{
  "layers": [
    { "number": 1, "type": "helical", "angle_deg": 12, "thickness_mm": 0.25, "coverage": "full" },
    { "number": 2, "type": "hoop", "angle_deg": 88, "thickness_mm": 0.2, "coverage": "cylinder" }
  ],
  "total_thickness_mm": 12.5,
  "total_layers": 48
}
```

---

### BACK-037: 3D Mesh Generation (REQ-031-033)

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: REQ-031 to REQ-033
**Dependencies**: BACK-033

**Description**:
Generate 3D mesh data for Three.js visualization.

**Deliverables**:

- [ ] Triangulated surface mesh
- [ ] Per-layer mesh separation
- [ ] Vertex normals for lighting
- [ ] UV coordinates for texturing
- [ ] Layer index attribute for coloring

---

### BACK-038: Section View Support (REQ-034-036)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-034 to REQ-036
**Dependencies**: BACK-037

**Description**:
Enable section/cutaway view with liner visibility.

**Deliverables**:

- [ ] Liner geometry as separate object
- [ ] Boss geometry as separate object
- [ ] Clip plane intersection data
- [ ] Internal surface generation

---

### BACK-039: Stress Analysis (REQ-041-046, REQ-048)

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: REQ-041 to REQ-046, REQ-048
**Dependencies**: BACK-033

**Description**:
Implement `GET /api/designs/{id}/stress` with comprehensive stress output.

**Deliverables**:

- [ ] `load_case` parameter (test/burst)
- [ ] `type` parameter (hoop/axial/shear/von_mises)
- [ ] Max stress value and location
- [ ] Safety margin calculation
- [ ] Nodal stress array for contour plot
- [ ] Per-layer stress breakdown (σ1, σ2, τ12)
- [ ] Tsai-Wu index per layer

**Response Schema**:

```json
{
  "load_case": "burst",
  "stress_type": "von_mises",
  "max_stress_mpa": 2850,
  "max_stress_location": { "z_mm": 125, "theta_deg": 0 },
  "allowable_stress_mpa": 3200,
  "safety_margin_percent": 12.3,
  "contour_data": [...],
  "per_layer_stress": [
    { "layer": 1, "sigma1_mpa": 2100, "sigma2_mpa": 45, "tau12_mpa": 35, "tsai_wu": 0.68 }
  ]
}
```

---

### BACK-040: Tsai-Wu Contour (REQ-047)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-047
**Dependencies**: BACK-039

**Description**:
Provide Tsai-Wu failure index distribution for visualization.

**Deliverables**:

- [ ] Tsai-Wu index at all evaluation points
- [ ] Critical layer identification
- [ ] Index > 1.0 warning locations
- [ ] Contour data format for plotting

---

### BACK-041: Failure Mode Prediction (REQ-049-053)

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: REQ-049 to REQ-053
**Dependencies**: BACK-039

**Description**:
Implement `GET /api/designs/{id}/failure` with failure mode analysis.

**Deliverables**:

- [ ] Predicted failure mode
- [ ] is_preferred flag (fiber breakage preferred)
- [ ] First-ply failure layer and pressure
- [ ] Progressive failure sequence
- [ ] Hashin failure indices (4 modes)

**Failure Modes**:

- Fiber tension failure (preferred)
- Fiber compression failure
- Matrix tension cracking
- Matrix compression failure
- Delamination
- Liner failure
- Boss failure

---

### BACK-042: Thermal Analysis (REQ-054-057)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-054 to REQ-057
**Dependencies**: BACK-033

**Description**:
Implement `GET /api/designs/{id}/thermal` for thermal performance.

**Deliverables**:

- [ ] Fast-fill temperature rise calculation
- [ ] Peak gas temperature
- [ ] Peak wall/liner temperature
- [ ] Time to peak temperatures
- [ ] Material limit comparison
- [ ] Thermal stress calculation
- [ ] Extreme temperature performance table (-40°C, +85°C)

---

### BACK-043: Reliability Analysis (REQ-076-080)

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: REQ-076 to REQ-080
**Dependencies**: BACK-006 (Rust for parallelism)

**Description**:
Implement `GET /api/designs/{id}/reliability` with Monte Carlo simulation.

**Deliverables**:

- [ ] Monte Carlo simulation (10,000+ samples)
- [ ] Sample count in response
- [ ] Probability of failure calculation
- [ ] Interpretation text
- [ ] Burst pressure statistics (mean, std, percentiles)
- [ ] Histogram data for plotting
- [ ] Uncertainty source breakdown
- [ ] Sensitivity analysis (tornado chart data)

**Monte Carlo Variables**:

- Material strength (±5% CoV)
- Layer thickness (±3% tolerance)
- Fiber angle (±1° placement accuracy)
- Void content (0-2%)

---

### BACK-044: Reliability Insight (REQ-081)

**Priority**: P2 Enhancement
**Complexity**: S
**Requirements**: REQ-081
**Dependencies**: BACK-043

**Description**:
Generate human-readable reliability insight using LLM.

**Deliverables**:

- [ ] Short insight text (1-2 sentences)
- [ ] Context-aware interpretation
- [ ] Comparison to target reliability

---

### BACK-045: Cost Breakdown (REQ-132-134)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-132 to REQ-134
**Dependencies**: BACK-033

**Description**:
Implement `GET /api/designs/{id}/cost` with detailed breakdown.

**Deliverables**:

- [ ] Total cost calculation
- [ ] Component breakdown array
- [ ] Dominant cost highlighting
- [ ] Cost per kg H2 stored
- [ ] Manufacturing labor estimate

**Cost Components**:

- Carbon fiber: $25-50/kg
- Glass fiber: $3-5/kg
- Epoxy resin: $15-25/kg
- HDPE liner: $8-15/kg
- Aluminum boss: $20-40/part
- Winding labor: $100-200/hr
- Quality control: 10-15% overhead

---

### BACK-046: Compliance Check (REQ-084-089)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-084 to REQ-089
**Dependencies**: BACK-012, BACK-039

**Description**:
Implement `GET /api/designs/{id}/compliance` for standards assessment.

**Deliverables**:

- [ ] Per-standard overall status
- [ ] Clause-by-clause breakdown
- [ ] Pass/fail per requirement
- [ ] Design value vs required value
- [ ] Non-compliance explanations

**Compliance Schema**:

```json
{
  "standards": [
    {
      "id": "UN-R134",
      "name": "UN Regulation No. 134",
      "overall_status": "pass",
      "clauses": [
        {
          "id": "5.2.1",
          "name": "Burst pressure",
          "required_value": "2.25x working",
          "design_value": "2.32x working",
          "status": "pass"
        }
      ]
    }
  ]
}
```

---

## PHASE 7: DESIGN COMPARISON

> **Objective**: Multi-design comparison capabilities
> **Complexity**: Small | **Requirements**: REQ-071 to REQ-075

### BACK-047: Compare Endpoint (REQ-071-073)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-071 to REQ-073
**Dependencies**: BACK-030

**Description**:
Implement `POST /api/compare` for multi-design comparison.

**Deliverables**:

- [ ] Accept array of design IDs
- [ ] Metric-by-metric comparison
- [ ] Best design per metric identification
- [ ] Normalized values for radar chart

**Request**:

```json
{ "design_ids": ["P12", "P23", "P35"] }
```

**Response**:

```json
{
  "metrics": [
    {
      "name": "weight_kg",
      "values": { "P12": 42.5, "P23": 45.1, "P35": 40.8 },
      "best": "P35",
      "lower_is_better": true
    }
  ],
  "normalized": {
    "P12": { "weight": 0.85, "cost": 0.7, "safety": 0.95 },
    "P23": { "weight": 0.75, "cost": 0.85, "safety": 0.9 },
    "P35": { "weight": 0.95, "cost": 0.6, "safety": 0.88 }
  }
}
```

---

### BACK-048: Better/Worse Indicators (REQ-074, REQ-075)

**Priority**: P1 Critical
**Complexity**: S
**Requirements**: REQ-074, REQ-075
**Dependencies**: BACK-047

**Description**:
Include directional indicators in comparison results.

**Deliverables**:

- [ ] Arrow direction per design per metric
- [ ] Percentage difference calculation
- [ ] Tie handling
- [ ] Significance threshold (ignore <1% differences)

---

### BACK-049: Comparison History

**Priority**: P2 Enhancement
**Complexity**: S
**Requirements**: UX Enhancement
**Dependencies**: BACK-047

**Description**:
Store recent comparisons for quick access.

**Deliverables**:

- [ ] Last 10 comparisons cached
- [ ] Comparison naming/bookmarking
- [ ] Comparison sharing (URL with design IDs)

---

### BACK-050: Side-by-Side Stress (REQ-074)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-074
**Dependencies**: BACK-039, BACK-047

**Description**:
Enable stress comparison between designs.

**Deliverables**:

- [ ] Max stress comparison
- [ ] Safety margin comparison
- [ ] Critical location comparison

---

## PHASE 8: MODEL VALIDATION & TEST PLANNING

> **Objective**: Surrogate model confidence and test planning
> **Complexity**: Medium | **Requirements**: REQ-090 to REQ-102

### BACK-051: Surrogate Confidence (REQ-090-093)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-090 to REQ-093
**Dependencies**: BACK-023

**Description**:
Implement `GET /api/designs/{id}/surrogate-confidence` for model accuracy reporting.

**Deliverables**:

- [ ] R² value per output
- [ ] Mean error percentage
- [ ] Confidence interval
- [ ] Validation recommendation flag

**Response Schema**:

```json
{
  "metrics": [
    {
      "name": "burst_pressure",
      "r_squared": 0.985,
      "mean_error_percent": 2.3,
      "confidence_interval": [1550, 1680],
      "status": "high_confidence"
    }
  ],
  "recommendation": null
}
```

---

### BACK-052: Validation Recommendation (REQ-092)

**Priority**: P1 Critical
**Complexity**: S
**Requirements**: REQ-092
**Dependencies**: BACK-051

**Description**:
Generate FEA/test recommendation based on confidence levels.

**Deliverables**:

- [ ] Threshold-based recommendation logic
- [ ] "FEA suggested" flag
- [ ] Specific areas of uncertainty identification

**Logic**:

- R² < 0.9 → "Detailed FEA recommended"
- Error > 5% → "Physical test validation suggested"
- Novel design region → "Extrapolation warning"

---

### BACK-053: Test Plan Generation (REQ-094-098)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-094 to REQ-098
**Dependencies**: BACK-046

**Description**:
Implement `GET /api/designs/{id}/test-plan` for certification test planning.

**Deliverables**:

- [ ] Required tests from applicable standards
- [ ] Sample quantity per test
- [ ] Test parameters and conditions
- [ ] Duration estimates
- [ ] Total test articles required
- [ ] Campaign duration estimate

**Test Plan Schema**:

```json
{
  "tests": [
    {
      "name": "Burst Test",
      "standard_reference": "UN R134 5.2.1",
      "samples_required": 3,
      "parameters": "Pressurize to burst, record max pressure",
      "pass_criteria": "Burst > 1575 bar",
      "duration_days": 2
    }
  ],
  "total_samples": 25,
  "total_duration_weeks": 12
}
```

---

### BACK-054: Sentry Monitoring Plan (REQ-099-102)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-099 to REQ-102
**Dependencies**: BACK-039

**Description**:
Implement `GET /api/designs/{id}/sentry` for through-life monitoring specification.

**Deliverables**:

- [ ] Critical monitoring points
- [ ] Sensor type recommendations
- [ ] Inspection intervals
- [ ] Built-in sensor specifications
- [ ] Coordinate data for 3D overlay

**Monitoring Points**:

- Dome apex (highest strain)
- Boss junction (stress concentration)
- Cylinder midpoint (reference)
- Valve interface (fatigue critical)

---

### BACK-055: Inspection Schedule (REQ-102)

**Priority**: P2 Enhancement
**Complexity**: S
**Requirements**: REQ-102
**Dependencies**: BACK-054

**Description**:
Generate detailed inspection schedule.

**Deliverables**:

- [ ] Service interval recommendations
- [ ] Inspection checklist per interval
- [ ] Replacement criteria
- [ ] End-of-life indicators

---

## PHASE 9: EXPORT & DOCUMENTATION

> **Objective**: Generate exportable documentation and CAD files
> **Complexity**: Large | **Requirements**: REQ-103 to REQ-120

### BACK-056: Export Job Manager

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-116
**Dependencies**: BACK-005

**Description**:
Implement export job creation and management.

**Deliverables**:

- [ ] `POST /api/export` - Create export job
- [ ] `GET /api/export/{id}` - Job status
- [ ] Export option handling (select what to include)
- [ ] Background processing queue

**Request Schema**:

```json
{
  "design_id": "P12",
  "include": {
    "step_file": true,
    "dxf_file": false,
    "csv_data": true,
    "pdf_report": true,
    "certification_package": true,
    "winding_program": false
  }
}
```

---

### BACK-057: Manufacturing Specification (REQ-103-110)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-103 to REQ-110
**Dependencies**: BACK-036

**Description**:
Generate manufacturing specification data.

**Deliverables**:

- [ ] Winding sequence document
- [ ] Fiber tension parameters
- [ ] Cure cycle specification
- [ ] Post-cure requirements
- [ ] QC plan with tolerances
- [ ] NDE requirements

---

### BACK-058: STEP File Generation (REQ-111)

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: REQ-111
**Dependencies**: BACK-037

**Description**:
Generate STEP CAD file using OpenCASCADE.

**Deliverables**:

- [ ] OpenCASCADE integration
- [ ] B-rep solid generation
- [ ] Multi-body assembly (liner, composite, boss)
- [ ] STEP AP214 export
- [ ] File size optimization

---

### BACK-059: DXF Drawing Generation (REQ-112)

**Priority**: P2 Enhancement
**Complexity**: M
**Requirements**: REQ-112
**Dependencies**: BACK-033

**Description**:
Generate 2D DXF drawing with cross-section.

**Deliverables**:

- [ ] Cross-section view
- [ ] Dimension annotations
- [ ] Layer legend
- [ ] Title block

---

### BACK-060: CSV Data Export (REQ-113, REQ-114)

**Priority**: P1 Critical
**Complexity**: S
**Requirements**: REQ-113, REQ-114
**Dependencies**: BACK-033, BACK-036

**Description**:
Generate CSV files for dome coordinates and layup.

**Deliverables**:

- [ ] `dome_coordinates.csv` - (r, z) points
- [ ] `layup_definition.csv` - Layer schedule
- [ ] `stress_results.csv` - Analysis data
- [ ] `compliance_matrix.csv` - Standard compliance

---

### BACK-061: NC Winding Program (REQ-115)

**Priority**: P2 Enhancement
**Complexity**: L
**Requirements**: REQ-115
**Dependencies**: BACK-036

**Description**:
Generate NC code for filament winding machine.

**Deliverables**:

- [ ] G-code or machine-specific format
- [ ] Layer-by-layer instructions
- [ ] Angle and tension commands
- [ ] Template for common machines

---

### BACK-062: PDF Design Report (REQ-116)

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: REQ-116
**Dependencies**: All Analysis Endpoints

**Description**:
Generate comprehensive PDF design report.

**Deliverables**:

- [ ] Executive summary
- [ ] Requirements recap
- [ ] Configuration summary
- [ ] Geometry visualization
- [ ] Analysis results (stress, failure, thermal)
- [ ] Compliance status
- [ ] Recommendations

---

### BACK-063: PDF Stress Report (REQ-117)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-117
**Dependencies**: BACK-039

**Description**:
Generate detailed stress analysis report.

**Deliverables**:

- [ ] Stress contour plots
- [ ] Layer stress tables
- [ ] Tsai-Wu index plots
- [ ] Safety margin summary
- [ ] Failure mode analysis

---

### BACK-064: Certification Package (REQ-118)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-118
**Dependencies**: BACK-046, BACK-053

**Description**:
Generate certification documentation package.

**Deliverables**:

- [ ] Compliance summary
- [ ] Test plan appendix
- [ ] Material certificates template
- [ ] RTM template
- [ ] Standards checklist

---

### BACK-065: Download Endpoint

**Priority**: P1 Critical
**Complexity**: S
**Requirements**: REQ-116
**Dependencies**: BACK-056

**Description**:
Implement `GET /api/export/{id}/download` for file retrieval.

**Deliverables**:

- [ ] ZIP package generation
- [ ] Individual file download support
- [ ] Streaming for large files
- [ ] Temp file cleanup

---

## PHASE 10: LLM INTEGRATION & AUTOMATION

> **Objective**: AI-powered explanations and automated workflow
> **Complexity**: Large | **Requirements**: REQ-081, REQ-126, REQ-127

### BACK-066: Explanation Service (REQ-126, REQ-127)

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-126, REQ-127
**Dependencies**: LLM Gateway

**Description**:
Centralized LLM service for generating explanations.

**Deliverables**:

- [ ] Explanation prompt templates
- [ ] Design recommendation rationale
- [ ] "Why not [alternative]?" responses
- [ ] Analysis insight generation
- [ ] Error message humanization

---

### BACK-067: Decision Rationale Generator

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-070
**Dependencies**: BACK-066

**Description**:
Generate natural language explanations for system decisions.

**Deliverables**:

- [ ] Tank type recommendation explanation
- [ ] Material selection rationale
- [ ] Design recommendation reasoning
- [ ] Compliance status explanations

---

### BACK-068: Automated Workflow Agent

**Priority**: P2 Enhancement
**Complexity**: XL
**Requirements**: Automation
**Dependencies**: All Endpoints

**Description**:
Create autonomous agent for end-to-end design workflow.

**Deliverables**:

- [ ] Workflow orchestration logic
- [ ] Step-by-step API sequencing
- [ ] Decision-making at each juncture
- [ ] Progress reporting
- [ ] Error recovery

**Workflow Steps**:

1. Parse requirements
2. Select tank type
3. Select materials
4. Start optimization
5. Wait for completion
6. Select recommended design
7. Run all analyses
8. Generate export package

---

### BACK-069: Agent Execution Interface

**Priority**: P2 Enhancement
**Complexity**: M
**Requirements**: UI Support
**Dependencies**: BACK-068

**Description**:
UI/API interface for triggering automated workflow.

**Deliverables**:

- [ ] `POST /api/agent/start` - Start automated workflow
- [ ] `GET /api/agent/{id}/status` - Agent progress
- [ ] WebSocket for real-time updates
- [ ] Step visualization in UI

---

### BACK-070: Quality & Deployment

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: Infrastructure
**Dependencies**: All Phases

**Description**:
Final quality assurance and deployment preparation.

**Deliverables**:

- [ ] Unit tests for all endpoints (80% coverage)
- [ ] Integration tests for workflows
- [ ] E2E tests for critical paths
- [ ] Performance benchmarks
- [ ] Docker compose for local dev
- [ ] Production Dockerfile
- [ ] Deployment documentation
- [ ] Environment configuration guide

---

## APPENDIX A: REQUIREMENT MAPPING

| Requirement | Backlog Task | Phase |
| ----------- | ------------ | ----- |
| REQ-001     | BACK-009     | 2     |
| REQ-002     | BACK-010     | 2     |
| REQ-003     | BACK-012     | 2     |
| REQ-004     | BACK-011     | 2     |
| REQ-005     | BACK-011     | 2     |
| REQ-006     | BACK-011     | 2     |
| REQ-007     | BACK-014     | 3     |
| REQ-008     | BACK-014     | 3     |
| REQ-009     | BACK-015     | 3     |
| REQ-010     | BACK-016     | 3     |
| REQ-011-015 | BACK-017     | 3     |
| REQ-016     | BACK-033     | 6     |
| REQ-017     | BACK-033     | 6     |
| REQ-018     | BACK-034     | 6     |
| REQ-021     | BACK-035     | 6     |
| REQ-025-028 | BACK-036     | 6     |
| REQ-031-033 | BACK-037     | 6     |
| REQ-034-036 | BACK-038     | 6     |
| REQ-041-046 | BACK-039     | 6     |
| REQ-047     | BACK-040     | 6     |
| REQ-048     | BACK-039     | 6     |
| REQ-049-053 | BACK-041     | 6     |
| REQ-054-057 | BACK-042     | 6     |
| REQ-058-061 | BACK-024     | 4     |
| REQ-062-064 | BACK-025     | 4     |
| REQ-065-069 | BACK-028     | 5     |
| REQ-070     | BACK-029     | 5     |
| REQ-071-073 | BACK-047     | 7     |
| REQ-074-075 | BACK-048     | 7     |
| REQ-076-080 | BACK-043     | 6     |
| REQ-081     | BACK-044     | 6     |
| REQ-084-089 | BACK-046     | 6     |
| REQ-090-093 | BACK-051     | 8     |
| REQ-094-098 | BACK-053     | 8     |
| REQ-099-102 | BACK-054     | 8     |
| REQ-103-110 | BACK-057     | 9     |
| REQ-111     | BACK-058     | 9     |
| REQ-112     | BACK-059     | 9     |
| REQ-113-114 | BACK-060     | 9     |
| REQ-115     | BACK-061     | 9     |
| REQ-116     | BACK-062     | 9     |
| REQ-117     | BACK-063     | 9     |
| REQ-118     | BACK-064     | 9     |
| REQ-126-127 | BACK-066     | 10    |
| REQ-130-131 | BACK-021     | 4     |
| REQ-132-134 | BACK-045     | 6     |
| REQ-190-196 | BACK-013     | 2     |

---

## APPENDIX B: TECHNOLOGY DECISIONS

### Confirmed Stack

| Component       | Technology                      | Rationale                               |
| --------------- | ------------------------------- | --------------------------------------- |
| API Gateway     | Node.js + Next.js 14            | Same runtime as frontend, Vercel deploy |
| LLM Integration | Vercel AI SDK + Claude          | Simpler integration, streaming support  |
| Physics Engine  | TypeScript (existing)           | Production-ready, lift from mock server |
| Optimization    | Rust + NSGA-II                  | Performance critical, parallelism       |
| Monte Carlo     | Rust (rayon)                    | 10,000+ samples in <1s                  |
| CAD Export      | OpenCASCADE.js or Rust bindings | STEP file generation                    |
| Database        | PostgreSQL                      | Relational data, JSON support           |
| File Storage    | Local FS → GCS (future)         | Simple MVP, scalable later              |
| PDF Generation  | Puppeteer or WeasyPrint         | HTML-to-PDF rendering                   |

### Pending Decisions

| Decision                 | Options                 | Deadline       |
| ------------------------ | ----------------------- | -------------- |
| Surrogate model training | TensorFlow vs PyTorch   | Before Phase 4 |
| Rust HTTP framework      | Actix-web vs Axum       | Before Phase 1 |
| PDF library              | Puppeteer vs WeasyPrint | Before Phase 9 |

---

## APPENDIX C: RISK REGISTER

| Risk                              | Impact | Mitigation                                       |
| --------------------------------- | ------ | ------------------------------------------------ |
| NSGA-II performance target missed | High   | Pre-compute surrogate models, reduce generations |
| OpenCASCADE integration complex   | Medium | Use Three.js mesh export as fallback             |
| LLM latency in chat               | Medium | Streaming responses, caching common queries      |
| Monte Carlo accuracy              | Medium | Validate against published data                  |
| Standards database incomplete     | Low    | Prioritize UN R134, add others incrementally     |

---

## REVISION HISTORY

| Version | Date       | Author        | Changes                                                                                                                                                                                                                  |
| ------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0.0   | 2025-12-12 | @h2-tank-team | Initial backlog creation (70 tasks, 10 phases)                                                                                                                                                                           |
| 1.0.1   | 2025-12-12 | @h2-tank-team | Scope correction - Reverted to 70 tasks, 10 phases. Removed out-of-scope items: UI components, enterprise DevOps, complex agent orchestration. Focus: Core Rust backend for real data generation to replace mock server. |
