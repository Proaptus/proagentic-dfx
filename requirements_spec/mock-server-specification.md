# H2 Tank Designer: Mock Data Server Specification

## Document Purpose

This specification defines a **standalone Mock Data Server** that:
1. Provides the complete API contract for the H2 Tank Designer
2. Serves hardcoded and simulated data for frontend development
3. Is plug-and-play replaceable with the real backend
4. Enables demos, testing, and development without AI costs

**Key Principle:** The mock server IS the API specification. When the real backend is built, it must match this server's behavior exactly.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT SETUP                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐               │
│  │                     │         │                     │               │
│  │   H2 Tank Frontend  │ ──────► │   Mock Data Server  │               │
│  │   (Next.js App)     │  HTTP   │   (Next.js API)     │               │
│  │   Port: 3000        │         │   Port: 3001        │               │
│  │                     │         │                     │               │
│  └─────────────────────┘         └─────────────────────┘               │
│           │                               │                             │
│           │                               ▼                             │
│           │                      ┌─────────────────┐                   │
│           │                      │ Static Data     │                   │
│           │                      │ /data/*.json    │                   │
│           │                      └─────────────────┘                   │
│           │                               │                             │
│           │                               ▼                             │
│           │                      ┌─────────────────┐                   │
│           │                      │ Simulators      │                   │
│           │                      │ /lib/sim/*.ts   │                   │
│           │                      └─────────────────┘                   │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    ENVIRONMENT VARIABLE                          │   │
│  │   NEXT_PUBLIC_API_URL=http://localhost:3001                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                         PRODUCTION SETUP                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐               │
│  │                     │         │                     │               │
│  │   H2 Tank Frontend  │ ──────► │   Real Backend      │               │
│  │   (Deployed)        │  HTTPS  │   (ProSWARM API)    │               │
│  │                     │         │                     │               │
│  └─────────────────────┘         └─────────────────────┘               │
│           │                               │                             │
│           ▼                               ▼                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │   NEXT_PUBLIC_API_URL=https://api.h2tank.proaptus.com           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Zero Code Changes:** Switch between mock and real by changing ONE environment variable.

---

## Project Structure

```
h2-tank-mock-server/
├── package.json
├── next.config.js
├── tsconfig.json
├── .env.local                    # DATA_MODE=static|simulated|hybrid
│
├── app/
│   └── api/
│       ├── requirements/
│       │   ├── parse/route.ts    # POST - Parse NL requirements
│       │   └── route.ts          # GET - Get stored requirements
│       │
│       ├── standards/
│       │   └── route.ts          # GET - List applicable standards
│       │
│       ├── tank-type/
│       │   └── recommend/route.ts # POST - Get type recommendation
│       │
│       ├── materials/
│       │   ├── route.ts          # GET - Material database
│       │   └── select/route.ts   # POST - Validate selection
│       │
│       ├── optimization/
│       │   ├── route.ts          # POST - Start optimization
│       │   └── [id]/
│       │       ├── route.ts      # GET - Status, DELETE - Cancel
│       │       ├── results/route.ts  # GET - Pareto results
│       │       └── stream/route.ts   # GET - SSE progress stream
│       │
│       ├── designs/
│       │   └── [id]/
│       │       ├── route.ts          # GET - Design summary
│       │       ├── geometry/route.ts # GET - 3D geometry
│       │       ├── stress/route.ts   # GET - Stress analysis
│       │       ├── failure/route.ts  # GET - Failure analysis
│       │       ├── thermal/route.ts  # GET - Thermal analysis
│       │       ├── reliability/route.ts # GET - Monte Carlo
│       │       ├── cost/route.ts     # GET - Cost breakdown
│       │       ├── compliance/route.ts # GET - Standards compliance
│       │       ├── test-plan/route.ts  # GET - Test plan
│       │       └── sentry/route.ts     # GET - Monitoring spec
│       │
│       ├── compare/
│       │   └── route.ts          # POST - Compare designs
│       │
│       └── export/
│           ├── route.ts          # POST - Start export job
│           └── [id]/
│               ├── route.ts      # GET - Export status
│               └── download/route.ts # GET - Download files
│
├── data/
│   ├── static/
│   │   ├── requirements/
│   │   │   └── parsed-example.json
│   │   ├── standards/
│   │   │   └── h2-standards.json
│   │   ├── materials/
│   │   │   └── material-database.json
│   │   ├── designs/
│   │   │   ├── design-a.json
│   │   │   ├── design-b.json
│   │   │   ├── design-c.json     # Recommended design
│   │   │   ├── design-d.json
│   │   │   └── design-e.json
│   │   ├── pareto/
│   │   │   └── pareto-50.json    # Full Pareto set
│   │   └── optimization/
│   │       └── progress-history.json
│   │
│   └── schemas/
│       ├── requirements.schema.json
│       ├── design.schema.json
│       ├── stress.schema.json
│       ├── failure.schema.json
│       ├── thermal.schema.json
│       └── reliability.schema.json
│
├── lib/
│   ├── types/
│   │   ├── requirements.ts
│   │   ├── design.ts
│   │   ├── analysis.ts
│   │   └── export.ts
│   │
│   ├── simulators/
│   │   ├── optimization-simulator.ts
│   │   ├── stress-simulator.ts
│   │   ├── failure-simulator.ts
│   │   ├── thermal-simulator.ts
│   │   ├── reliability-simulator.ts
│   │   └── geometry-generator.ts
│   │
│   ├── utils/
│   │   ├── data-mode.ts          # Get current data mode
│   │   ├── delay.ts              # Add realistic delays
│   │   └── noise.ts              # Add realistic variation
│   │
│   └── store/
│       └── session.ts            # In-memory session storage
│
├── openapi/
│   └── h2-tank-api.yaml          # OpenAPI 3.0 specification
│
└── scripts/
    ├── generate-types.ts         # Generate TS from OpenAPI
    └── validate-schemas.ts       # Validate static data
```

---

## Data Modes

The mock server supports three data modes controlled by `DATA_MODE` environment variable:

### 1. Static Mode (`DATA_MODE=static`)

Returns pre-defined JSON files. Best for:
- Demos with predictable output
- Screenshot capture
- Initial frontend development

```typescript
// lib/utils/data-mode.ts
export function getDataMode(): 'static' | 'simulated' | 'hybrid' {
  return (process.env.DATA_MODE || 'static') as any;
}

// Usage in route handler
if (getDataMode() === 'static') {
  return Response.json(staticData);
}
```

### 2. Simulated Mode (`DATA_MODE=simulated`)

Generates data dynamically using simulation engines. Best for:
- Testing edge cases
- Realistic development experience
- Stress testing frontend

```typescript
// lib/simulators/stress-simulator.ts
export function simulateStressField(design: Design, options: SimOptions): StressField {
  const baseStress = calculateNettingTheory(design);
  const noise = options.noiseLevel || 0.05;
  
  return {
    vonMises: generateContour(baseStress, noise),
    maxValue: baseStress.max * (1 + Math.random() * noise),
    maxLocation: findMaxLocation(design.geometry)
  };
}
```

### 3. Hybrid Mode (`DATA_MODE=hybrid`)

Static data for most endpoints, simulated for specific ones. Best for:
- Development with realistic optimization progress
- Demo with dynamic elements

```typescript
// Configuration
const SIMULATED_ENDPOINTS = [
  '/api/optimization/*/stream',  // Always simulate progress
  '/api/designs/*/reliability'   // Always simulate Monte Carlo
];
```

---

## API Endpoints Specification

### Screen 1: Requirements

#### POST /api/requirements/parse

Parse natural language requirements into structured format.

**Request:**
```json
{
  "input_mode": "natural_language",
  "raw_text": "700 bar, 150L hydrogen tank for heavy-duty truck. Max 80kg, marine environment, 15 year life, EU certification."
}
```

**Response:**
```json
{
  "success": true,
  "parsed_requirements": {
    "pressure_bar": 700,
    "pressure_type": "working",
    "volume_liters": 150,
    "weight_max_kg": 80,
    "cost_target_eur": null,
    "application": "automotive_hdt",
    "environment": "marine",
    "service_life_years": 15,
    "region": "EU"
  },
  "derived_requirements": {
    "test_pressure_bar": 1050,
    "burst_pressure_min_bar": 1575,
    "burst_ratio_min": 2.25,
    "cycle_life_min": 11000,
    "permeation_max_nml_hr_l": 46,
    "temp_range_c": [-40, 85],
    "fire_test_required": true,
    "fire_test_type": "bonfire"
  },
  "applicable_standards": [
    {"id": "ISO_11119_3", "name": "Gas cylinders - Composite construction", "selected": true},
    {"id": "UN_R134", "name": "Hydrogen vehicles - Safety requirements", "selected": true},
    {"id": "EC_79_2009", "name": "Type-approval (superseded)", "selected": true},
    {"id": "SAE_J2579", "name": "US standard", "selected": false}
  ],
  "confidence": 0.94,
  "warnings": ["Cost target not specified - will optimize for weight/reliability"],
  "clarification_needed": []
}
```

**Simulation Logic:**
```typescript
// In simulated mode, add variation to confidence
if (getDataMode() === 'simulated') {
  response.confidence = 0.85 + Math.random() * 0.14;  // 0.85-0.99
}
```

---

#### GET /api/standards

Get available standards database.

**Response:**
```json
{
  "standards": [
    {
      "id": "ISO_11119_3",
      "name": "Gas cylinders - Composite construction",
      "version": "2020",
      "region": "international",
      "requirements": {
        "burst_ratio_min": 2.25,
        "cycle_life_min": 11000,
        "permeation_test": true,
        "fire_test": true
      }
    },
    {
      "id": "UN_R134",
      "name": "Hydrogen vehicles - Safety requirements",
      "version": "2015",
      "region": "EU",
      "requirements": {
        "temp_range_c": [-40, 85],
        "bonfire_test": true,
        "gunshot_test": true
      }
    }
  ]
}
```

---

### Screen 2: Configuration

#### POST /api/tank-type/recommend

Get tank type recommendation based on requirements.

**Request:**
```json
{
  "requirements": {
    "pressure_bar": 700,
    "volume_liters": 150,
    "weight_max_kg": 80,
    "environment": "marine"
  }
}
```

**Response:**
```json
{
  "recommendation": {
    "type": "IV",
    "confidence": 0.92,
    "rationale": "Weight target (0.53 kg/L) requires Type IV or V. Type IV has proven certification path for marine environment. Type V is emerging but unproven for UN R134."
  },
  "alternatives": [
    {
      "type": "III",
      "feasible": false,
      "estimated_weight_kg": 150,
      "reason": "Would be ~150kg - exceeds 80kg target"
    },
    {
      "type": "V",
      "feasible": true,
      "estimated_weight_kg": 70,
      "reason": "Achievable but unproven certification for marine",
      "risk": "high"
    }
  ],
  "type_comparison": [
    {"type": "I", "liner": "Steel", "kg_per_l": 5.0, "est_weight": 750, "feasible": false},
    {"type": "II", "liner": "Steel", "kg_per_l": 3.0, "est_weight": 450, "feasible": false},
    {"type": "III", "liner": "Aluminum", "kg_per_l": 1.0, "est_weight": 150, "feasible": false},
    {"type": "IV", "liner": "HDPE", "kg_per_l": 0.8, "est_weight": 80, "feasible": true},
    {"type": "V", "liner": "None", "kg_per_l": 0.6, "est_weight": 70, "feasible": true}
  ]
}
```

---

#### GET /api/materials

Get material database with full properties.

**Response:**
```json
{
  "fibers": [
    {
      "id": "T700S",
      "name": "Toray T700S Carbon",
      "properties": {
        "E1_gpa": 135,
        "E2_gpa": 10,
        "G12_gpa": 5,
        "nu12": 0.3,
        "sigma1_ult_mpa": 2550,
        "sigma2_ult_mpa": 50,
        "tau12_ult_mpa": 75,
        "density_kg_m3": 1600,
        "cost_eur_kg": 25
      },
      "recommendation": "Best price/performance ratio"
    },
    {
      "id": "T800S",
      "name": "Toray T800S Carbon",
      "properties": {
        "E1_gpa": 155,
        "E2_gpa": 10,
        "G12_gpa": 5,
        "nu12": 0.3,
        "sigma1_ult_mpa": 2860,
        "sigma2_ult_mpa": 55,
        "tau12_ult_mpa": 80,
        "density_kg_m3": 1600,
        "cost_eur_kg": 45
      },
      "recommendation": "12% stronger but 80% more expensive"
    }
  ],
  "matrices": [
    {
      "id": "epoxy_aerospace",
      "name": "Aerospace Epoxy",
      "properties": {
        "E_gpa": 3.5,
        "sigma_ult_mpa": 80,
        "Tg_c": 180,
        "cost_eur_kg": 15
      }
    }
  ],
  "liners": [
    {
      "id": "HDPE",
      "name": "High-Density Polyethylene",
      "properties": {
        "E_gpa": 1.0,
        "permeability_mol_m_s_pa": 1.2e-12,
        "cost_eur_kg": 2
      }
    }
  ],
  "bosses": [
    {
      "id": "316L_SS",
      "name": "316L Stainless Steel",
      "properties": {
        "E_gpa": 193,
        "sigma_yield_mpa": 290,
        "cost_eur_kg": 6
      },
      "suitable_for": ["marine", "corrosive"]
    }
  ]
}
```

---

### Screen 3: Optimization

#### POST /api/optimization

Start optimization job.

**Request:**
```json
{
  "requirements": { /* ... */ },
  "materials": { /* ... */ },
  "objectives": ["minimize_weight", "minimize_cost", "maximize_reliability"],
  "priority": [1, 2, 3]
}
```

**Response:**
```json
{
  "job_id": "opt-a1b2c3d4",
  "status": "started",
  "estimated_duration_seconds": 45,
  "stream_url": "/api/optimization/opt-a1b2c3d4/stream"
}
```

---

#### GET /api/optimization/{id}/stream

Server-Sent Events stream for optimization progress.

**SSE Events:**
```
event: progress
data: {"progress_percent": 15, "generation": 30, "designs_evaluated": 125847, "pareto_size": 12}

event: progress
data: {"progress_percent": 45, "generation": 90, "designs_evaluated": 378291, "pareto_size": 35}

event: best_update
data: {"lightest": {"weight_kg": 75.2, "cost_eur": 14100}, "cheapest": {"weight_kg": 87.1, "cost_eur": 12850}}

event: progress
data: {"progress_percent": 100, "generation": 200, "designs_evaluated": 847293, "pareto_size": 50}

event: complete
data: {"job_id": "opt-a1b2c3d4", "status": "completed", "results_url": "/api/optimization/opt-a1b2c3d4/results"}
```

**Simulation Logic:**
```typescript
// lib/simulators/optimization-simulator.ts
export async function* simulateOptimizationProgress(): AsyncGenerator<ProgressEvent> {
  const totalGenerations = 200;
  const designsPerGen = 500;
  
  for (let gen = 0; gen <= totalGenerations; gen++) {
    const progress = (gen / totalGenerations) * 100;
    const designs = gen * designsPerGen;
    
    // Pareto front grows logarithmically then stabilizes
    const paretoSize = Math.min(50, Math.floor(10 + 40 * Math.log10(gen + 1) / Math.log10(200)));
    
    yield {
      type: 'progress',
      data: {
        progress_percent: progress,
        generation: gen,
        designs_evaluated: designs,
        pareto_size: paretoSize,
        current_best: simulateCurrentBest(gen)
      }
    };
    
    // Simulate real-time: ~200ms between updates
    await delay(150 + Math.random() * 100);
  }
  
  yield { type: 'complete', data: { job_id, status: 'completed' } };
}
```

---

#### GET /api/optimization/{id}/results

Get optimization results (Pareto frontier).

**Response:**
```json
{
  "job_id": "opt-a1b2c3d4",
  "status": "completed",
  "execution_time_seconds": 42,
  "total_evaluations": 847293,
  "pareto_front_size": 50,
  "recommended_design_id": "C",
  "pareto_designs": [
    {
      "id": "A",
      "weight_kg": 74.2,
      "burst_pressure_bar": 1590,
      "burst_ratio": 2.27,
      "cost_eur": 14200,
      "p_failure": 8e-6,
      "fatigue_life_cycles": 45000,
      "permeation_rate": 38,
      "volumetric_efficiency": 0.89,
      "trade_off_category": "lightest"
    },
    {
      "id": "B",
      "weight_kg": 77.1,
      "burst_pressure_bar": 1650,
      "burst_ratio": 2.36,
      "cost_eur": 13800,
      "p_failure": 2e-6,
      "fatigue_life_cycles": 52000,
      "permeation_rate": 35,
      "volumetric_efficiency": 0.90,
      "trade_off_category": "balanced"
    },
    {
      "id": "C",
      "weight_kg": 79.3,
      "burst_pressure_bar": 1720,
      "burst_ratio": 2.46,
      "cost_eur": 13500,
      "p_failure": 6e-7,
      "fatigue_life_cycles": 58000,
      "permeation_rate": 32,
      "volumetric_efficiency": 0.91,
      "trade_off_category": "recommended",
      "recommendation_reason": "Best balance of weight, cost, and reliability within targets"
    }
    // ... 47 more designs
  ]
}
```

---

### Screen 5: Design Analysis

#### GET /api/designs/{id}/geometry

Get 3D geometry data for visualization.

**Response:**
```json
{
  "design_id": "C",
  "dimensions": {
    "inner_radius_mm": 175,
    "outer_radius_mm": 204,
    "cylinder_length_mm": 1200,
    "total_length_mm": 1560,
    "wall_thickness_mm": 28.1,
    "internal_volume_liters": 150.3
  },
  "dome": {
    "type": "isotensoid",
    "parameters": {
      "alpha_0_deg": 14.2,
      "r_0_mm": 175,
      "depth_mm": 180,
      "boss_id_mm": 25,
      "boss_od_mm": 80
    },
    "profile_points": [
      {"r": 40, "z": 180},
      {"r": 60, "z": 175},
      {"r": 80, "z": 165},
      {"r": 100, "z": 145},
      {"r": 120, "z": 115},
      {"r": 140, "z": 75},
      {"r": 160, "z": 35},
      {"r": 175, "z": 0}
    ]
  },
  "thickness_distribution": {
    "cylinder_mm": 28.1,
    "dome_apex_mm": 22.4,
    "boss_region_mm": 38.5,
    "transition_mm": 31.2,
    "contour_data": [
      {"r": 0, "z": 180, "t": 22.4},
      {"r": 100, "z": 145, "t": 25.8},
      {"r": 175, "z": 0, "t": 28.1}
    ]
  },
  "layup": {
    "total_layers": 42,
    "helical_count": 18,
    "hoop_count": 24,
    "fiber_volume_fraction": 0.64,
    "liner_thickness_mm": 3.2,
    "layers": [
      {"layer": 1, "type": "helical", "angle_deg": 14.2, "thickness_mm": 0.34, "coverage": "full"},
      {"layer": 2, "type": "hoop", "angle_deg": 88, "thickness_mm": 0.55, "coverage": "cylinder"},
      {"layer": 3, "type": "helical", "angle_deg": 15.0, "thickness_mm": 0.34, "coverage": "full"}
      // ... more layers
    ]
  },
  "mesh_for_3d": {
    "format": "indexed_triangles",
    "vertices": [ /* [x, y, z] array */ ],
    "indices": [ /* triangle indices */ ],
    "normals": [ /* vertex normals */ ]
  }
}
```

---

#### GET /api/designs/{id}/stress

Get stress analysis results.

**Query Parameters:**
- `type`: `vonMises` | `hoop` | `axial` | `shear` | `tsaiWu`
- `load_case`: `test` | `burst`

**Response:**
```json
{
  "design_id": "C",
  "load_case": "test",
  "load_pressure_bar": 1050,
  "stress_type": "vonMises",
  "max_stress": {
    "value_mpa": 2127,
    "location": {"r": 175, "z": 180, "theta": 0},
    "region": "dome_cylinder_transition",
    "allowable_mpa": 2550,
    "margin_percent": 20
  },
  "contour_data": {
    "type": "nodal",
    "colormap": "jet",
    "min_value": 400,
    "max_value": 2127,
    "nodes": [
      {"x": 0, "y": 0, "z": 180, "value": 850},
      {"x": 100, "y": 0, "z": 145, "value": 1420}
      // ... more nodes
    ]
  },
  "per_layer_stress": [
    {"layer": 1, "type": "helical", "sigma1_mpa": 2127, "sigma2_mpa": 28, "tau12_mpa": 12, "tsai_wu": 0.84},
    {"layer": 2, "type": "hoop", "sigma1_mpa": 1890, "sigma2_mpa": 35, "tau12_mpa": 8, "tsai_wu": 0.75}
    // ... more layers
  ],
  "stress_ratios": {
    "hoop_to_axial": 2.0,
    "netting_theory_ratio": 2.0,
    "deviation_percent": 0
  }
}
```

---

#### GET /api/designs/{id}/failure

Get failure analysis results.

**Response:**
```json
{
  "design_id": "C",
  "predicted_failure_mode": {
    "mode": "fiber_breakage",
    "is_preferred": true,
    "location": "dome_cylinder_transition",
    "confidence": 0.92,
    "explanation": "Design fails by fiber breakage in hoop layers. This is PREFERRED because it is predictable, progressive, and not catastrophic."
  },
  "tsai_wu": {
    "max_at_test": {
      "value": 0.84,
      "layer": 1,
      "location": "dome_transition"
    },
    "max_at_burst": {
      "value": 1.02,
      "layer": 1,
      "location": "dome_transition"
    },
    "contour_data": [ /* nodal values */ ]
  },
  "first_ply_failure": {
    "layer": 3,
    "layer_type": "helical",
    "angle_deg": 15.0,
    "location": "dome_cylinder_transition",
    "pressure_bar": 1050,
    "mode": "matrix_microcracking",
    "note": "FPF does not mean structural failure. Matrix microcracking is acceptable."
  },
  "progressive_failure_sequence": [
    {"pressure_bar": 1050, "event": "First matrix cracking", "layers_affected": [3]},
    {"pressure_bar": 1280, "event": "Matrix cracking propagates", "layers_affected": [1,2,3,4,5]},
    {"pressure_bar": 1450, "event": "Delamination initiation", "interface": "3/4"},
    {"pressure_bar": 1620, "event": "Fiber breakage begins", "region": "hoop_layers"},
    {"pressure_bar": 1720, "event": "Ultimate failure (fiber rupture)", "layers_affected": [18,19,20,21,22,23,24]}
  ],
  "hashin_indices": {
    "at_test": {
      "fiber_tension": 0.72,
      "fiber_compression": 0.08,
      "matrix_tension": 0.89,
      "matrix_compression": 0.15
    },
    "at_burst": {
      "fiber_tension": 1.02,
      "fiber_compression": 0.12,
      "matrix_tension": 1.31,
      "matrix_compression": 0.22
    }
  }
}
```

---

#### GET /api/designs/{id}/thermal

Get thermal analysis results.

**Response:**
```json
{
  "design_id": "C",
  "fast_fill": {
    "scenario": "Fill from 20 bar to 700 bar in 3 minutes",
    "peak_gas_temp_c": 95,
    "peak_wall_temp_c": 72,
    "peak_liner_temp_c": 68,
    "time_to_peak_seconds": 180,
    "liner_limit_c": 85,
    "status": "pass",
    "temperature_contour": [ /* nodal temp values */ ]
  },
  "thermal_stress": {
    "max_mpa": 52,
    "location": "inner_liner_surface",
    "components": {
      "hoop_mpa": 45,
      "axial_mpa": 28,
      "radial_mpa": 12
    },
    "combined_with_pressure_max_mpa": 2179
  },
  "extreme_temperature_performance": [
    {"condition": "cold_soak", "temp_c": -40, "max_stress_mpa": 2310, "margin_percent": 10, "status": "pass"},
    {"condition": "hot_soak", "temp_c": 85, "max_stress_mpa": 2095, "margin_percent": 22, "status": "pass"},
    {"condition": "hot_fill", "temp_c": 95, "max_stress_mpa": 2179, "margin_percent": 17, "status": "pass"}
  ]
}
```

---

#### GET /api/designs/{id}/reliability

Get Monte Carlo reliability analysis.

**Response:**
```json
{
  "design_id": "C",
  "monte_carlo": {
    "samples": 1000000,
    "p_failure": 6e-7,
    "interpretation": "1 in 1.7 million chance of burst below working pressure over service life",
    "comparison_to_requirement": "17× better than 10⁻⁵ typical requirement"
  },
  "burst_distribution": {
    "mean_bar": 1720,
    "std_bar": 52,
    "cov": 0.030,
    "percentile_5": 1635,
    "percentile_95": 1805,
    "histogram": [
      {"bin_center": 1575, "count": 124},
      {"bin_center": 1600, "count": 2847},
      {"bin_center": 1625, "count": 18943}
      // ... more bins
    ]
  },
  "uncertainty_breakdown": [
    {"source": "Fiber strength variability", "cov": 0.08, "variance_contribution": 0.52},
    {"source": "Thickness variability", "cov": 0.05, "variance_contribution": 0.28},
    {"source": "Fiber volume fraction", "cov": 0.03, "variance_contribution": 0.15},
    {"source": "Angle variability", "cov": 0.02, "variance_contribution": 0.05}
  ],
  "key_insight": "Fiber strength dominates uncertainty. Tighter QC on incoming fiber would improve reliability most effectively.",
  "sensitivity": [
    {"parameter": "Fiber strength", "effect_bar_per_percent": 17.2},
    {"parameter": "Hoop layer thickness", "effect_bar_per_percent": 12.1},
    {"parameter": "Helical layer thickness", "effect_bar_per_percent": 8.4},
    {"parameter": "Fiber volume fraction", "effect_bar_per_percent": 5.2},
    {"parameter": "Helical angle", "effect_bar_per_percent": -2.8},
    {"parameter": "Liner thickness", "effect_bar_per_percent": 0.3}
  ]
}
```

**Simulation Logic:**
```typescript
// lib/simulators/reliability-simulator.ts
export function simulateMonteCarloResults(design: Design, seed?: number): ReliabilityResults {
  const rng = seed ? seedRandom(seed) : Math.random;
  
  // Generate histogram with realistic distribution
  const meanBurst = design.burst_pressure_bar;
  const stdBurst = meanBurst * 0.03;  // 3% CoV
  
  const histogram = [];
  for (let i = 0; i < 1000000; i++) {
    const sample = gaussianRandom(meanBurst, stdBurst, rng);
    // ... bin counting
  }
  
  // Calculate P(failure) = P(burst < working_pressure)
  const failureCount = histogram.filter(s => s < 700).length;
  const pFailure = failureCount / 1000000;
  
  return { p_failure: pFailure, histogram, /* ... */ };
}
```

---

### Screen 7: Validation

#### GET /api/designs/{id}/sentry

Get Sentry monitoring specification.

**Response:**
```json
{
  "design_id": "C",
  "critical_monitoring_points": [
    {
      "id": 1,
      "location": {"r": 175, "z": 180, "theta": 0},
      "region": "dome_boss_interface",
      "reason": "Highest stress concentration",
      "recommended_sensor": "acoustic_emission",
      "inspection_interval_months": 6
    },
    {
      "id": 2,
      "location": {"r": 175, "z": 600, "theta": 0},
      "region": "cylinder_hoop",
      "reason": "Fatigue critical zone",
      "recommended_sensor": "strain_gauge",
      "inspection_interval_months": 12
    },
    {
      "id": 3,
      "location": {"r": 175, "z": 0, "theta": 0},
      "region": "liner_composite_interface",
      "reason": "Delamination monitoring",
      "recommended_sensor": "acoustic_emission",
      "inspection_interval_months": 24
    }
  ],
  "recommended_sensors": [
    {"type": "acoustic_emission", "count": 2, "purpose": "Crack/delamination detection"},
    {"type": "strain_gauge", "count": 1, "purpose": "Fatigue monitoring"},
    {"type": "temperature", "count": 1, "purpose": "Thermal monitoring"}
  ],
  "inspection_schedule": {
    "visual": "every 6 months",
    "acoustic_monitoring": "continuous",
    "full_inspection": "every 5 years",
    "replacement_trigger": "Acoustic events > threshold OR 15 years"
  }
}
```

---

### Screen 8: Export

#### POST /api/export

Start export package generation.

**Request:**
```json
{
  "design_id": "C",
  "include": {
    "geometry": ["step", "dxf", "dome_csv"],
    "manufacturing": ["layup_csv", "winding_nc", "cure_spec", "qc_plan"],
    "analysis": ["design_report", "stress_report", "reliability_report"],
    "compliance": ["standards_matrix", "clause_breakdown"],
    "sentry": ["monitoring_spec", "sensor_guide"]
  },
  "format": "zip"
}
```

**Response:**
```json
{
  "export_id": "exp-x1y2z3",
  "status": "generating",
  "estimated_duration_seconds": 30,
  "status_url": "/api/export/exp-x1y2z3"
}
```

---

#### GET /api/export/{id}

Get export job status.

**Response:**
```json
{
  "export_id": "exp-x1y2z3",
  "status": "completed",
  "files": [
    {"name": "design_c_geometry.step", "size_bytes": 2457600},
    {"name": "design_c_drawings.dxf", "size_bytes": 819200},
    {"name": "dome_coordinates.csv", "size_bytes": 46080},
    {"name": "layup_definition.csv", "size_bytes": 12288},
    {"name": "winding_program.nc", "size_bytes": 159744},
    {"name": "manufacturing_spec.pdf", "size_bytes": 1228800},
    {"name": "design_report.pdf", "size_bytes": 3276800},
    {"name": "stress_analysis_report.pdf", "size_bytes": 2867200},
    {"name": "compliance_matrix.xlsx", "size_bytes": 91136},
    {"name": "iso11119_compliance.pdf", "size_bytes": 921600},
    {"name": "unr134_compliance.pdf", "size_bytes": 1126400},
    {"name": "test_plan.pdf", "size_bytes": 614400},
    {"name": "sentry_monitoring_spec.pdf", "size_bytes": 409600}
  ],
  "total_size_bytes": 15196160,
  "download_url": "/api/export/exp-x1y2z3/download"
}
```

---

## Simulation Engines

### Optimization Simulator

```typescript
// lib/simulators/optimization-simulator.ts

interface OptimizationConfig {
  totalGenerations: number;
  populationSize: number;
  targetParetoSize: number;
  progressInterval: number;  // ms between updates
}

export class OptimizationSimulator {
  private config: OptimizationConfig;
  private currentGeneration: number = 0;
  private paretoFront: Design[] = [];
  
  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      totalGenerations: 200,
      populationSize: 500,
      targetParetoSize: 50,
      progressInterval: 200,
      ...config
    };
  }
  
  async *stream(): AsyncGenerator<ProgressEvent> {
    while (this.currentGeneration <= this.config.totalGenerations) {
      // Simulate evaluation
      const newDesigns = this.generateDesigns(this.config.populationSize);
      this.updateParetoFront(newDesigns);
      
      yield {
        type: 'progress',
        data: {
          progress_percent: (this.currentGeneration / this.config.totalGenerations) * 100,
          generation: this.currentGeneration,
          designs_evaluated: this.currentGeneration * this.config.populationSize,
          pareto_size: this.paretoFront.length,
          current_best: this.getCurrentBest()
        }
      };
      
      this.currentGeneration++;
      await delay(this.config.progressInterval);
    }
    
    yield { type: 'complete', data: { status: 'completed' } };
  }
  
  private generateDesigns(count: number): Design[] {
    // Generate designs using realistic distributions
    return Array(count).fill(null).map(() => ({
      weight_kg: 70 + Math.random() * 20,  // 70-90 kg range
      cost_eur: 12000 + Math.random() * 3000,  // €12-15k range
      burst_pressure_bar: 1500 + Math.random() * 300,  // 1500-1800 bar
      p_failure: Math.pow(10, -5 - Math.random() * 3)  // 10^-5 to 10^-8
    }));
  }
  
  private updateParetoFront(newDesigns: Design[]): void {
    // NSGA-II style non-dominated sorting
    const combined = [...this.paretoFront, ...newDesigns];
    this.paretoFront = findNonDominated(combined).slice(0, this.config.targetParetoSize);
  }
}
```

---

### Stress Field Simulator

```typescript
// lib/simulators/stress-simulator.ts

interface StressConfig {
  noiseLevel: number;  // 0-1, default 0.05
  resolution: number;  // nodes per mm
}

export class StressSimulator {
  constructor(private design: Design, private config: StressConfig = { noiseLevel: 0.05, resolution: 1 }) {}
  
  generateVonMisesField(): StressField {
    const nodes: StressNode[] = [];
    
    // Cylinder region - uniform stress with slight variation
    const cylinderStress = this.calculateCylinderStress();
    for (let z = 0; z <= this.design.cylinder_length; z += this.config.resolution) {
      for (let theta = 0; theta < 360; theta += 15) {
        nodes.push({
          r: this.design.inner_radius,
          z,
          theta,
          value: cylinderStress * (1 + this.noise())
        });
      }
    }
    
    // Dome region - stress concentration at transition
    for (const point of this.design.dome.profile_points) {
      const stressMultiplier = this.domeStressMultiplier(point);
      nodes.push({
        r: point.r,
        z: this.design.cylinder_length + point.z,
        theta: 0,
        value: cylinderStress * stressMultiplier * (1 + this.noise())
      });
    }
    
    const maxNode = nodes.reduce((a, b) => a.value > b.value ? a : b);
    
    return {
      type: 'vonMises',
      nodes,
      max_value: maxNode.value,
      max_location: { r: maxNode.r, z: maxNode.z, theta: maxNode.theta }
    };
  }
  
  private calculateCylinderStress(): number {
    // Thin-wall pressure vessel: σ = PR/t
    const P = 1050;  // test pressure bar = 105 MPa
    const R = this.design.inner_radius;
    const t = this.design.wall_thickness;
    return (P * 0.1 * R) / t;  // Convert bar to MPa
  }
  
  private domeStressMultiplier(point: DomePoint): number {
    // Stress concentration factor peaks at dome-cylinder transition
    const transitionZ = 0;
    const distanceFromTransition = Math.abs(point.z - transitionZ);
    const maxMultiplier = 1.35;  // SCF at transition
    return 1 + (maxMultiplier - 1) * Math.exp(-distanceFromTransition / 50);
  }
  
  private noise(): number {
    return (Math.random() - 0.5) * 2 * this.config.noiseLevel;
  }
}
```

---

## WebSocket / SSE Implementation

### Server-Sent Events for Optimization Progress

```typescript
// app/api/optimization/[id]/stream/route.ts

import { NextRequest } from 'next/server';
import { OptimizationSimulator } from '@/lib/simulators/optimization-simulator';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const encoder = new TextEncoder();
  const simulator = new OptimizationSimulator();
  
  const stream = new ReadableStream({
    async start(controller) {
      for await (const event of simulator.stream()) {
        const data = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

### Frontend Connection

```typescript
// Frontend: hooks/useOptimizationStream.ts

export function useOptimizationStream(jobId: string) {
  const [progress, setProgress] = useState<OptimizationProgress | null>(null);
  const [status, setStatus] = useState<'connecting' | 'streaming' | 'complete' | 'error'>('connecting');
  
  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/optimization/${jobId}/stream`
    );
    
    eventSource.addEventListener('progress', (e) => {
      setStatus('streaming');
      setProgress(JSON.parse(e.data));
    });
    
    eventSource.addEventListener('complete', (e) => {
      setStatus('complete');
      eventSource.close();
    });
    
    eventSource.onerror = () => {
      setStatus('error');
      eventSource.close();
    };
    
    return () => eventSource.close();
  }, [jobId]);
  
  return { progress, status };
}
```

---

## Frontend Integration Guide

### Environment Configuration

```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:3001

# .env.production (production)
NEXT_PUBLIC_API_URL=https://api.h2tank.proaptus.com
```

### API Client Setup

```typescript
// lib/api-client.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }
  
  return response.json();
}

// Usage
const results = await apiClient<OptimizationResults>('/api/optimization/opt-123/results');
```

### React Query Integration

```typescript
// hooks/useDesignStress.ts

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useDesignStress(designId: string, stressType: string) {
  return useQuery({
    queryKey: ['design-stress', designId, stressType],
    queryFn: () => apiClient<StressData>(`/api/designs/${designId}/stress?type=${stressType}`)
  });
}
```

---

## Development Workflow

### Starting the Mock Server

```bash
# Terminal 1: Start mock server
cd h2-tank-mock-server
npm run dev
# Server running at http://localhost:3001

# Terminal 2: Start frontend
cd h2-tank-frontend
npm run dev
# Frontend running at http://localhost:3000
```

### Testing with Different Data Modes

```bash
# Static mode (demos)
DATA_MODE=static npm run dev

# Simulated mode (testing)
DATA_MODE=simulated npm run dev

# Hybrid mode (dev)
DATA_MODE=hybrid npm run dev
```

### Switching to Real Backend

```bash
# Just change the environment variable
NEXT_PUBLIC_API_URL=https://api.h2tank.proaptus.com npm run build
```

**Zero code changes required.**

---

## OpenAPI Specification

The complete OpenAPI 3.0 specification is in `openapi/h2-tank-api.yaml`. This is the **source of truth** for the API contract.

```yaml
# openapi/h2-tank-api.yaml (excerpt)

openapi: 3.0.3
info:
  title: H2 Tank Designer API
  description: API for hydrogen pressure vessel design optimization
  version: 1.0.0
  
servers:
  - url: http://localhost:3001
    description: Mock server (development)
  - url: https://api.h2tank.proaptus.com
    description: Production server
    
paths:
  /api/requirements/parse:
    post:
      summary: Parse natural language requirements
      operationId: parseRequirements
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RequirementsInput'
      responses:
        '200':
          description: Parsed requirements
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ParsedRequirements'
                
  /api/optimization:
    post:
      summary: Start optimization job
      operationId: startOptimization
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OptimizationRequest'
      responses:
        '200':
          description: Optimization job started
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OptimizationJob'
                
  /api/optimization/{id}/stream:
    get:
      summary: Stream optimization progress (SSE)
      operationId: streamOptimizationProgress
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: SSE stream of progress events
          content:
            text/event-stream:
              schema:
                type: string

# ... more endpoints

components:
  schemas:
    RequirementsInput:
      type: object
      properties:
        input_mode:
          type: string
          enum: [natural_language, structured]
        raw_text:
          type: string
      required:
        - input_mode
        
    ParsedRequirements:
      type: object
      properties:
        success:
          type: boolean
        parsed_requirements:
          $ref: '#/components/schemas/Requirements'
        derived_requirements:
          $ref: '#/components/schemas/DerivedRequirements'
        applicable_standards:
          type: array
          items:
            $ref: '#/components/schemas/Standard'
        confidence:
          type: number
          minimum: 0
          maximum: 1
          
# ... more schemas
```

---

## Real Backend Contract

When the real backend is built, it **MUST**:

1. **Match all endpoint paths exactly**
2. **Accept the same request schemas**
3. **Return the same response schemas**
4. **Support SSE for streaming endpoints**
5. **Return same error formats**

The mock server is the specification. The real backend is an implementation.

---

## Summary

| Aspect | Mock Server Approach |
|--------|---------------------|
| **Separation** | Completely standalone Next.js project |
| **Data Modes** | Static, Simulated, Hybrid |
| **API Contract** | OpenAPI 3.0 specification |
| **Streaming** | Server-Sent Events for real-time |
| **Integration** | One env var change to switch |
| **Simulation** | Realistic physics-based generators |
| **Testing** | Deterministic with seed support |
| **Demos** | Works offline with static data |

This approach ensures:
- ✅ Frontend can develop independently
- ✅ API contract is enforced and documented
- ✅ Integration is trivial (one env var)
- ✅ Demos work without backend costs
- ✅ Testing is fast and reproducible
- ✅ Real backend has a clear specification to match
