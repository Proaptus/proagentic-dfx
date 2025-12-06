# ProSWARM Engineering Extension: Architecture

## The Core Insight

ProSWARM already does this for software:
```
Task → Neural Route → Workflow → Result
```

Engineering design is **more deterministic** than software. Once requirements are fixed:
- Physics doesn't change
- Standards don't change
- Workflow is fixed
- Only parameters vary

**We don't build something new. We extend what exists.**

---

## ProSWARM Today (Software)

```
┌─────────────────────────────────────────────────────────────┐
│  External LLM (Claude) calls ProSWARM MCP                   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Neural Routing (ONNX, <1ms)                        │   │
│  │  task_router, decomposer, bug_router, etc.          │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Workflow Execution                                  │   │
│  │  Orchestrates subtasks, calls tools, manages state   │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  Result                                                     │
└─────────────────────────────────────────────────────────────┘
```

**Key capability:** 70+ neural models route and decompose tasks in microseconds.

---

## ProSWARM Extended (Engineering)

```
┌─────────────────────────────────────────────────────────────┐
│  External LLM (Claude) calls ProSWARM MCP                   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Internal LLM (lightweight)                          │   │
│  │  - Parse NL requirements → structured constraints    │   │
│  │  - Clarify ambiguity (if needed)                    │   │
│  │  - Explain results (if asked)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Neural Routing (ONNX, <1ms)                        │   │
│  │                                                      │   │
│  │  EXISTING:        NEW:                              │   │
│  │  task_router      tank_type_router                  │   │
│  │  decomposer       workflow_selector                 │   │
│  │  bug_router       fidelity_router                   │   │
│  │  ...              material_router                   │   │
│  │                   standards_router                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Fixed Engineering Workflow (deterministic)          │   │
│  │                                                      │   │
│  │  All computation, no LLM:                           │   │
│  │  1. Generate geometry (equations)                   │   │
│  │  2. Optimize layup (NSGA-II + surrogates)          │   │
│  │  3. Evaluate designs (neural surrogates)           │   │
│  │  4. Check constraints (rule engine)                │   │
│  │  5. Return Pareto frontier (structured data)       │   │
│  │                                                      │   │
│  │  Neural surrogates inside workflow:                 │   │
│  │  - burst_surrogate.onnx                            │   │
│  │  - weight_surrogate.onnx                           │   │
│  │  - stress_surrogate.onnx                           │   │
│  │  - failure_mode_surrogate.onnx                     │   │
│  │  - fatigue_life_surrogate.onnx                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  Structured Result (JSON + files)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Why Engineering Is Easier Than Software

| Aspect | Software Tasks | Engineering Design |
|--------|---------------|-------------------|
| Variability | Every task is different | Requirements vary, physics doesn't |
| Workflow | Must be discovered | Known once routed |
| Decisions during execution | Many | None (deterministic) |
| LLM involvement | Throughout | Only at edges |
| Neural models | Route and decompose | Route AND execute |

**Engineering workflows are closed-form once constraints are fixed.**

---

## Where LLM Is Needed vs Not

| Step | LLM Required? | Why |
|------|---------------|-----|
| Parse "700 bar tank for truck" | **Yes** (once) | Natural language understanding |
| Clarify ambiguity | **Yes** (if needed) | Dialog with user |
| Route to workflow | **No** | Neural model |
| Generate dome geometry | **No** | Isotensoid equations |
| Optimize layup | **No** | NSGA-II + neural surrogates |
| Predict burst pressure | **No** | Neural surrogate |
| Run Monte Carlo | **No** | Sampling + surrogates |
| Check standards | **No** | Rule engine |
| Format output | **No** | Template |
| Explain results | **Yes** (if asked) | Natural language generation |

**LLM is the interface, not the engine.**

---

## The Workflows Are Fixed

Once requirements are parsed and routed, execution is deterministic:

```python
ENGINEERING_WORKFLOWS = {
    
    "h2_tank_type_iv_automotive": {
        "description": "Type IV COPV for 350-700 bar automotive",
        "steps": [
            ("validate_inputs", validate_h2_tank_requirements),
            ("generate_dome", isotensoid_dome_generator),
            ("initial_layup", netting_theory_sizing),
            ("optimize", nsga2_with_surrogates),
            ("reliability", monte_carlo_analysis),
            ("compliance", check_iso11119_unr134),
            ("output", format_pareto_results)
        ],
        "surrogates": [
            "h2_burst_surrogate.onnx",
            "h2_weight_surrogate.onnx", 
            "h2_stress_surrogate.onnx"
        ]
    },
    
    "h2_tank_type_iii_stationary": {
        "description": "Type III for stationary storage",
        "steps": [...],
        "surrogates": [...]
    },
    
    "pressure_vessel_asme": {
        "description": "ASME Section VIII pressure vessel",
        "steps": [...],
        "surrogates": [...]
    }
}
```

**No decisions during execution. Just computation.**

---

## Neural Model Inventory

### Routing Models (New)

| Model | Input | Output | Size |
|-------|-------|--------|------|
| `tank_type_router` | constraints | {I, II, III, IV, V} | ~15KB |
| `workflow_selector` | tank_type + application | workflow_id | ~12KB |
| `material_router` | constraints + priorities | fiber + matrix + liner | ~20KB |
| `fidelity_router` | requirements | analysis_level | ~10KB |
| `standards_router` | application + region | applicable_standards[] | ~15KB |

### Surrogate Models (New)

| Model | Input | Output | Size |
|-------|-------|--------|------|
| `burst_surrogate` | 20 design params | burst_pressure (MPa) | ~50KB |
| `weight_surrogate` | 20 design params | mass (kg) | ~30KB |
| `stress_surrogate` | 20 design params | max_stress + location | ~80KB |
| `failure_mode_surrogate` | 20 design params | mode (fiber/matrix/interface) | ~25KB |
| `fatigue_surrogate` | 20 design params | cycles_to_failure | ~50KB |

### Training Data Sources

| Model Type | Training Data | Samples Needed |
|------------|---------------|----------------|
| Routing | Historical designs + outcomes | 500-1000 |
| Surrogates | FEA simulation results | 100-200 |

**Surrogate training:** 100 FEA runs × 15 min = 25 hours compute (one-time, parallelizable)

---

## Execution Example

### Input
```
User: "Design a 700 bar 150L hydrogen tank for a heavy-duty truck.
       Maximum 80kg, must survive marine environment, 15 year life."
```

### Step 1: Parse (Internal LLM)
```json
{
  "pressure_bar": 700,
  "volume_liters": 150,
  "weight_max_kg": 80,
  "application": "automotive_hdt",
  "environment": "marine",
  "service_life_years": 15,
  "region": "EU"
}
```

### Step 2: Route (Neural, <1ms)
```
tank_type_router(constraints) → "type_iv"
workflow_selector("type_iv", "automotive_hdt") → "h2_tank_type_iv_automotive"
standards_router("automotive_hdt", "EU") → ["ISO_11119_3", "UN_R134", "EC_79"]
material_router(constraints, priorities) → {
  fiber: "T700",
  matrix: "epoxy", 
  liner: "HDPE"
}
```

### Step 3: Execute Workflow (Deterministic, no LLM)

```
generate_dome():
  → Solve isotensoid equations
  → Output: dome_coordinates.csv
  → Time: 50ms

initial_layup():
  → Netting theory calculation
  → Output: initial_layup = [±15°/90°/±15°/90°...]
  → Time: 10ms

optimize():
  → NSGA-II with 500,000 evaluations
  → Neural surrogates for fitness (burst, weight, stress)
  → Output: pareto_frontier (50 designs)
  → Time: 30 seconds

reliability():
  → Monte Carlo, 1M samples per Pareto design
  → Neural surrogates for each sample
  → Output: P(failure) for each design
  → Time: 10 seconds

compliance():
  → Check each Pareto design against standards
  → Rule engine (deterministic)
  → Output: compliance_status
  → Time: 100ms
```

### Step 4: Output (Structured)
```json
{
  "pareto_designs": [
    {
      "id": "A",
      "weight_kg": 74.2,
      "burst_bar": 1590,
      "cost_eur": 14200,
      "p_failure": 8e-6,
      "compliance": {"ISO_11119_3": "pass", "UN_R134": "pass"}
    },
    {
      "id": "B", 
      "weight_kg": 77.1,
      "burst_bar": 1650,
      "cost_eur": 13800,
      "p_failure": 2e-6,
      "compliance": {"ISO_11119_3": "pass", "UN_R134": "pass"}
    },
    {
      "id": "C",
      "weight_kg": 79.3,
      "burst_bar": 1720,
      "cost_eur": 13500,
      "p_failure": 6e-7,
      "compliance": {"ISO_11119_3": "pass", "UN_R134": "pass"},
      "recommended": true,
      "recommendation_reason": "Best weight/cost/reliability balance"
    }
  ],
  "files": {
    "geometry": "design_c_geometry.step",
    "layup": "design_c_layup.csv",
    "analysis": "design_c_report.pdf"
  },
  "execution_time_seconds": 42
}
```

### Step 5: Explain (Internal LLM, if asked)

```
User: "Why is design C recommended?"

LLM generates from structured data:
"Design C is recommended because it offers the best balance:
 - Weight: 79.3 kg (1% under your 80kg target)
 - Burst margin: 1,720 bar (9% above the 1,575 bar requirement)  
 - Cost: €13,500 (10% under typical)
 - Reliability: P(failure) = 6×10⁻⁷ (5× better than required)

 Design A is 5kg lighter but reliability is 13× worse.
 Design D is more reliable but 3kg heavier with no practical benefit."
```

---

## What We Build vs What Exists

| Component | Status | Work |
|-----------|--------|------|
| MCP interface | **Exists** | None |
| Internal LLM | **Exists** | None |
| Neural routing infra | **Exists** | None |
| ONNX inference (Rust) | **Exists** | None |
| Workflow engine | **Exists** | None |
| Optimization algorithms | **Exists** | Integrate pymoo/scipy |
| Engineering routing models | **New** | Train on design cases |
| Engineering surrogates | **New** | Train on FEA data |
| Geometry generators | **New** | Implement equations |
| Standards rule engine | **New** | Encode ISO/UN rules |
| Report templates | **New** | Document templates |

**Estimated split: 70% exists, 30% new (domain-specific)**

---

## Training Requirements

### Routing Models

```
Data needed:
  - 500+ historical tank designs with outcomes
  - Or: synthetic data from engineering rules

Training:
  - Standard classification
  - Existing ProSWARM pipeline
  - Hours, not days
```

### Surrogate Models

```
Data needed:
  - 100-200 FEA simulations
  - Latin Hypercube sampling of design space
  - ~25-50 hours of FEA compute (parallelizable)

Training:
  - Regression (continuous outputs)
  - Standard ProSWARM pipeline
  - Target: R² > 0.95, error < 5%

Validation:
  - Hold out 20% of FEA runs
  - Confirm surrogate accuracy
  - Spot-check with new FEA runs
```

---

## Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| Requirements → Pareto frontier | < 60 seconds | Neural surrogates |
| Designs evaluated | > 500,000 | Surrogate speed |
| Reliability quantification | Included | Monte Carlo |
| Standards compliance | Automatic | Rule engine |
| Explanation generation | On demand | LLM from structured data |

Compare to manual process: **12-18 months** for same output quality.

---

## Architecture Principles

1. **LLM at edges only** - Parse input, explain output. Not in the loop.

2. **Neural models for speed** - Routing and surrogates, microsecond inference.

3. **Deterministic workflows** - Once routed, no decisions, just computation.

4. **Structured data throughout** - JSON between components, LLM generates prose only when asked.

5. **Existing infrastructure** - ProSWARM MCP, ONNX runtime, workflow engine. Don't rebuild.

6. **Domain knowledge encoded** - Standards, materials, physics in code and rules, not prompts.

---

## Summary

ProSWARM is already an LLM-controlled MCP with neural routing.

Engineering design is more deterministic than software development.

**Extension strategy:**
1. Add engineering routing models (same training pipeline)
2. Add engineering surrogates (same ONNX inference)
3. Add engineering workflows (same workflow engine)
4. Add domain knowledge (new: equations, standards, materials)

**The architecture doesn't change. We add a new domain.**

```
ProSWARM for Software:   LLM → Neural Route → Workflow → LLM assists → Result
ProSWARM for Engineering: LLM → Neural Route → Workflow → Done → Result
                                                    ↑
                              No LLM needed - physics is deterministic
```

**This is the competitive advantage:** Same proven architecture, new high-value domain, minimal development risk.
