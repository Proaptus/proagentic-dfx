# Our Approach - ProAgentic DfX

## Executive Summary

**Project Codename**: DFX-AGENTS
**Project Code**: PROAPTUS-DFX-2025
**Full Name**: DFX-Agents: Agentic Design for X System

### One-Liner
> An agentic AI system that transforms natural language requirements into production-ready mechanical component designs with full engineering analysis and documentation.

### Problem Statement
Engineers spend hours to days designing 'standard boring but critical' mechanical parts. The knowledge exists in textbooks, standards, and heuristics, but applying it is tedious and repetitive.

### Our Solution
Multi-agent pipeline that automates requirements parsing, concept generation, parametric CAD, FEA analysis, manufacturing assessment, cost estimation, and documentation.

### Key Differentiators
1. **Real FEA Integration** - Not just geometry generation, actual structural analysis with CalculiX solver
2. **Engineering Domain Expertise** - Founder has CAD training, mechanical engineering degree, manufacturing patents, satellite/subsea/laser machining experience
3. **SPR Module for Standards** - Existing capability to inject ISO, AS9100, DNV standards into agent context
4. **ProAgentic Build Velocity** - 3x faster development validated across Innovate UK studies

### Target Outcome
Input requirements in natural language, receive production-ready STEP files, analysis reports, and design rationale in minutes instead of hours.

---

## Challenge Alignment

We are addressing: **Advanced Manufacturing Challenge: Detailed Design for X Agents**

### Challenge Requirements Met

| Requirement | Our Capability | Evidence |
|-------------|---------------|----------|
| Run domain-specific design and analysis steps | Multi-agent pipeline linking CAD, FEA, DFM, cost | Working H2 Tank Designer module |
| Create CAD models using constraints, materials, tolerances | CadQuery parametric generation | STEP file output |
| Explain design choices and trade-offs | Documentation agent with decision audit trail | Design rationale PDF output |
| Support automatic design loops | Optimisation agent with iterative refinement | Pareto frontier visualisation |

### Example Use Case Match
> **Hydrogen storage tank design**: Exploring materials, liners, bosses and geometric features across different tank types, for both gaseous and liquid Hydrogen and considering through-life monitoring

This is EXACTLY what our H2 Tank Designer module does.

---

## Technical Architecture

### Agent Pipeline (8 Specialised Agents)

```
Requirements → Concept → Geometry → Analysis → Manufacturing → Cost → Optimisation → Documentation
     REQ        CONCEPT     GEOM       FEA          DFM         COST      OPT           DOC
```

| Order | Agent | Input | Output | Status |
|-------|-------|-------|--------|--------|
| 1 | **REQ-AGENT** | Natural language requirements | Structured requirements JSON | P1 |
| 2 | **CONCEPT-AGENT** | Structured requirements | 2-5 candidate concepts | P1 |
| 3 | **GEOM-AGENT** | Concepts, constraints, materials | STEP files, glTF, parametric models | P1 |
| 4 | **FEA-AGENT** | CAD, loads, materials, BCs | Stress, displacement, pass/fail | P1 |
| 5 | **DFM-AGENT** | CAD, target process | DfM report, manufacturability score | P1 |
| 6 | **COST-AGENT** | CAD, material, process, qty | Cost breakdown | P2 |
| 7 | **OPT-AGENT** | All candidate designs | Ranked options, Pareto frontier | P2 |
| 8 | **DOC-AGENT** | All design data | PDF reports, compliance checklist | P1 |

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Orchestration | MAS Hub (existing ProAgentic) | Agent discovery, routing |
| LLM Integration | Claude API (primary), GPT-4 (fallback) | NL parsing, generation |
| Standards | SPR Module (existing) | Standards injection |
| Parametric CAD | CadQuery 2.4+ | Programmatic geometry |
| Meshing | Gmsh (Python API) | FEA mesh generation |
| FEA Solver | CalculiX (CCX) | Structural analysis |
| Post-processing | PyVista / VTK | Visualisation |
| Optimisation | SciPy / Optuna | Parameter optimisation |
| Reports | ReportLab / WeasyPrint | PDF generation |
| Frontend | React + TypeScript | User interface |
| CAD Viewer | Three.js (@react-three/fiber) | 3D visualisation |

---

## Demo Scenario

### Primary Demo: Sensor Mounting Bracket for Offshore Wind Turbine

**Input Requirements (Natural Language)**:
> Design a sensor mounting bracket for offshore wind turbine nacelle. Sensor mass: 35kg. Vibration environment: 0-50Hz, 1g RMS. Salt spray environment (C5-M corrosivity). Must bolt to existing M12 hole pattern (4x, 150mm PCD). Avoid resonance in operating range. Design life: 25 years. Minimise weight without exceeding £200 unit cost at qty 100.

**Expected Demo Flow**:
1. Requirements parsed → Structured JSON shown
2. Standards identified → EN 1993, ISO 12944, DNV-ST-0126
3. Concepts generated → 3 options (welded plate, machined billet, sheet metal)
4. CAD generated → 3D models visible in viewer
5. FEA completed → Stress contours, natural frequencies
6. Comparison shown → Trade-off table with recommendation

**Expected Outputs**:
| Design | Weight (kg) | Cost (£) | 1st Mode (Hz) | Max Stress (MPa) | Margin | Status |
|--------|------------|----------|---------------|------------------|--------|--------|
| Welded plate | 2.8 | 145 | 68 | 89 | 2.1 | RECOMMENDED |
| Machined billet | 3.4 | 210 | 72 | 76 | 2.5 | Exceeds cost |
| Sheet metal | 2.1 | 95 | 52 | 112 | 1.7 | Fails frequency |

**Target Runtime**: < 3 minutes

---

## Scope Definition

### In Scope (Phase 2 MVP)

**Component Types**:
- P1: Brackets and mounts, plates and stiffeners, fixtures and jigs
- P2: Enclosures, flanges, pipe supports, guards, adapters
- P3: Frames and skids

**Manufacturing Processes**:
- P1: CNC machining, sheet metal
- P2: Welded fabrication
- P3: Additive manufacturing

**Materials**:
- P1: Carbon steel (S275, S355), stainless (304, 316L), aluminium (6061-T6, 5083, 7075)
- P3: Titanium (Ti-6Al-4V)

**Analysis Types**:
- P1: Static stress (von Mises), deflection/stiffness
- P2: Basic fatigue (S-N curve), modal analysis
- P3: Linear buckling

**Standards**:
- ISO 9001, DNV rules, EN 1993, ISO 1101 (GD&T)
- AS9100, ISO 12944 (extended)

### Out of Scope
- Gears/transmissions, pressure vessels (PE certification), mechanisms, rotating machinery
- Composite structures, complex castings
- Non-linear FEA, contact analysis, CFD, thermal-structural coupling

---

## Key Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| FEA integration complexity | Medium | High | Start early, fallback to hand-calc validation |
| Geometry generation failures | Medium | High | Constrain to well-defined parametric patterns |
| Demo reliability on interview day | Low | Critical | Offline-capable, pre-loaded test cases, redundant hardware |
| Scope creep beyond 3 months | High | Medium | Strict scope boundaries, MVP-first approach |

---

## Success Metrics

### Competition Success
- **Primary Goal**: Win Advanced Manufacturing category (£250k)
- **Stretch Goal**: Win overall prize (+£250k)
- **Minimum Acceptable**: Reach interview stage, demonstrate working system

### Technical Metrics
| Metric | Target |
|--------|--------|
| CAD generation success rate | >95% |
| FEA accuracy vs manual analysis | Within 10% |
| End-to-end time (typical bracket) | <5 minutes |
| Demo reliability (10 consecutive runs) | 100% |

### Application Scoring Targets
| Question | Target Score |
|----------|--------------|
| Q10: Technical Approach | 8-10 |
| Q11: User and Workflow | 8-10 |
| Q12: MVP Readiness | 8-10 |
| Q13: Risks and Assurance | 7-9 |
| Q14: Commercial Impact | 8-10 |
| Q15: Scalability | 8-10 |

---

## Existing Assets to Leverage

### From ProAgentic Platform
| Asset | Use in DFX-Agents |
|-------|-------------------|
| MAS Hub | Core orchestration for agent pipeline |
| BMAS framework | Rapid development of new agents |
| SPR Module | Standards injection - extend for engineering standards |
| Memory Bank | Reuse design patterns across component types |
| DocIntel patterns | Report generation approach |

### From Founder Experience
| Asset | Use in DFX-Agents |
|-------|-------------------|
| CAD training | Parametric modelling patterns |
| FEA programming (25 years ago) | Understanding of analysis workflow |
| Manufacturing patents | DfM knowledge, credibility |
| Satellite/subsea experience | Complex engineering domain expertise |

---

## Application Strategy Summary

### Q10: Technical Approach
**Key Messages**:
- Real FEA integration (CalculiX) - not just geometry
- Multi-agent architecture with clear roles
- Validated against engineering benchmarks
- Novel: automated design-analysis loop with optimisation

### Q11: User and Workflow
**Key Messages**:
- Target: design engineers at manufacturing SMEs
- Fits after concept phase, before detailed drawings
- Human-in-loop: engineer approves before manufacturing
- Reduces design time from hours to minutes

### Q12: MVP Readiness
**Key Messages**:
- Working end-to-end system
- Supports brackets, mounts, fixtures
- CAD generation + FEA analysis + documentation
- Web-based interface with 3D viewer

### Q13: Risks and Assurance
**Key Messages**:
- Engineering validation: FEA vs hand-calc benchmarks
- Human-in-loop for all safety-critical decisions
- Decision audit trail with standards citations
- SPR module ensures regulatory compliance

### Q14: Commercial Impact
**Key Messages**:
- Target: UK manufacturing SMEs (thousands of users)
- Value prop: compress design time 10x, reduce costs
- Route: SaaS subscription model
- UK benefit: productivity improvement in key sector

### Q15: Scalability
**Key Messages**:
- Roadmap: brackets → assemblies → complex structures
- Cross-sector: marine, aerospace, energy
- Integration path to enterprise CAD/PLM
- UK IP ownership, exploit from UK

---
*Reference: requirements_spec/dfx-solution-specification.json*
