# H2 Tank Designer: Frontend Implementation Plan (Revised)

## Document Purpose

This specification maps the engineer's journey (Document 08) to frontend screens, ensuring ALL capabilities defined in accepted documents are accessible through the UI. This revision addresses the 142 requirements identified in the Requirements Traceability Matrix.

**RTM Reference:** `requirements-traceability-matrix.csv`

---

## Screen Summary

| Screen | Purpose | RTM Coverage |
|--------|---------|--------------|
| 1. Requirements | Parse input, derive requirements, identify standards | REQ-001 to 006 |
| 2. Configuration | Tank type, materials, optimization objectives | REQ-007 to 015 |
| 3. Optimization | Live progress, convergence, design space | REQ-058 to 064, 130-131 |
| 4. Results | Pareto frontier, recommendations, compliance | REQ-065 to 089 |
| 5. Analysis | Geometry, stress, failure, thermal, reliability | REQ-016 to 057, 075-083, 132-139 |
| 6. Comparison | Side-by-side design comparison | REQ-071 to 075 |
| 7. Validation | Surrogate confidence, test plan, Sentry | REQ-090 to 102 |
| 8. Export | Manufacturing, certification, documentation | REQ-103 to 120 |

---

## Screen 1: Requirements Input

**RTM:** REQ-001 to REQ-006

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ REQUIREMENTS INPUT                                   Step 1/8   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Natural Language Tab] [Structured Form Tab]                    │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ "700 bar, 150L hydrogen tank for heavy-duty truck.          │ │
│ │  Max 80kg, marine environment, 15 year life, EU cert."      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Parse Requirements]                                            │
│                                                                 │
│ ═══════════════════════════════════════════════════════════════ │
│                                                                 │
│ PARSED REQUIREMENTS                         Confidence: 94%     │
│                                                                 │
│ PRIMARY:                                                        │
│ • Working Pressure: 700 bar          [REQ-002]                  │
│ • Internal Volume: 150 L                                        │
│ • Weight Target: ≤80 kg                                         │
│ • Application: Heavy-duty truck                                 │
│ • Environment: Marine                                           │
│ • Service Life: 15 years                                        │
│ • Region: EU                                                    │
│                                                                 │
│ DERIVED (from standards):                    [REQ-004]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Requirement        │ Value       │ Source                   │ │
│ ├────────────────────┼─────────────┼──────────────────────────┤ │
│ │ Test Pressure      │ 1,050 bar   │ 1.5× working             │ │
│ │ Min Burst Pressure │ 1,575 bar   │ 2.25× (ISO 11119)        │ │
│ │ Min Cycle Life     │ 11,000      │ UN R134                  │ │
│ │ Max Permeation     │ 46 NmL/hr/L │ ISO 11119-3              │ │
│ │ Temperature Range  │ -40 to +85°C│ UN R134        [REQ-005] │ │
│ │ Fire Resistance    │ Bonfire req │ UN R134 Annex  [REQ-006] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ APPLICABLE STANDARDS:                        [REQ-003]          │
│ ☑ ISO 11119-3  ☑ UN R134  ☑ EC 79  ☐ SAE J2579               │
│                                                                 │
│ [← Back] [Confirm & Continue →]                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Required

```json
{
  "parsed_requirements": {
    "pressure_bar": 700,
    "volume_liters": 150,
    "weight_max_kg": 80,
    "application": "automotive_hdt",
    "environment": "marine",
    "service_life_years": 15,
    "region": "EU"
  },
  "derived_requirements": {
    "test_pressure_bar": 1050,
    "burst_pressure_min_bar": 1575,
    "cycle_life_min": 11000,
    "permeation_max": 46,
    "temp_range_c": [-40, 85],
    "fire_test_required": true
  },
  "applicable_standards": ["ISO_11119_3", "UN_R134", "EC_79"],
  "confidence": 0.94
}
```

---

## Screen 2: Configuration

**RTM:** REQ-007 to REQ-015

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ CONFIGURATION                                        Step 2/8   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ TANK TYPE RECOMMENDATION                     [REQ-007,008]      │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ★ RECOMMENDED: TYPE IV                                      │ │
│ │   Liner: HDPE │ Overwrap: Full carbon composite             │ │
│ │                                                             │ │
│ │   Rationale: Weight target (0.53 kg/L) requires Type IV/V.  │ │
│ │   Type IV has proven certification for marine.              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ TYPE COMPARISON:                             [REQ-008]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Type │ Liner    │ kg/L │ Est Weight │ Feasibility           │ │
│ ├──────┼──────────┼──────┼────────────┼───────────────────────┤ │
│ │ I    │ Steel    │ 5.0  │ 750 kg     │ ✗ Too heavy           │ │
│ │ II   │ Steel    │ 3.0  │ 450 kg     │ ✗ Too heavy           │ │
│ │ III  │ Aluminum │ 1.0  │ 150 kg     │ ✗ Exceeds target      │ │
│ │ IV ★ │ HDPE     │ 0.8  │ ~80 kg     │ ✓ Meets target        │ │
│ │ V    │ None     │ 0.6  │ ~70 kg     │ ⚠ Unproven cert       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Why not Type III?] [Why not Type V?]        [REQ-009,127]      │
│                                                                 │
│ ═══════════════════════════════════════════════════════════════ │
│                                                                 │
│ MATERIALS                                    [REQ-011 to 014]   │
│                                                                 │
│ Fiber:  Toray T700S Carbon                   [Change]           │
│         Best price/performance. T800 80% more expensive.        │
│         [Explore hybrid carbon/glass option] [REQ-010]          │
│                                                                 │
│ Matrix: Aerospace Epoxy                      [Change]           │
│         Proven, marine-rated.                                   │
│                                                                 │
│ Liner:  HDPE (3.2mm)                         [Change]           │
│         Sufficient permeation resistance.                       │
│                                                                 │
│ Boss:   316L Stainless Steel                 [Change]           │
│         Marine corrosion resistance.                            │
│                                                                 │
│ ═══════════════════════════════════════════════════════════════ │
│                                                                 │
│ MATERIAL PROPERTIES                          [REQ-015]          │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Property     │ T700S/Epoxy │ HDPE   │ 316L SS              │ │
│ ├──────────────┼─────────────┼────────┼──────────────────────┤ │
│ │ E₁ (GPa)     │ 135         │ 1.0    │ 193                  │ │
│ │ E₂ (GPa)     │ 10          │ -      │ -                    │ │
│ │ σ₁_ult (MPa) │ 2,550       │ 25     │ 515                  │ │
│ │ σ₂_ult (MPa) │ 50          │ -      │ -                    │ │
│ │ ρ (kg/m³)    │ 1,600       │ 950    │ 8,000                │ │
│ │ Cost (€/kg)  │ 25          │ 2      │ 6                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ═══════════════════════════════════════════════════════════════ │
│                                                                 │
│ OPTIMIZATION OBJECTIVES (drag to prioritize):                   │
│ [1] Minimize Weight                                             │
│ [2] Minimize Cost                                               │
│ [3] Maximize Reliability                                        │
│                                                                 │
│ [← Back] [Start Optimization →]                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Screen 3: Optimization Progress

**RTM:** REQ-058 to REQ-064, REQ-130, REQ-131

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ OPTIMIZATION IN PROGRESS                             Step 3/8   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ████████████████████░░░░░░░░░░  67%         [REQ-058]           │
│ Elapsed: 32s │ Remaining: ~16s              [REQ-124,130]       │
│                                                                 │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐           │
│ │ DESIGNS       │ │ PARETO FRONT  │ │ GENERATION    │           │
│ │ EVALUATED     │ │ SIZE          │ │               │           │
│ │   412,847     │ │     47        │ │  134 / 200    │           │
│ │ [REQ-059,131] │ │ [REQ-060]     │ │               │           │
│ └───────────────┘ └───────────────┘ └───────────────┘           │
│                                                                 │
│ CURRENT BEST:                                [REQ-061]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │           │ Weight    │ Cost     │ P(failure)              │ │
│ ├───────────┼───────────┼──────────┼─────────────────────────┤ │
│ │ Lightest  │ 74.2 kg ↓ │ €14,200  │ 8×10⁻⁶                 │ │
│ │ Cheapest  │ 86.1 kg   │ €12,900↓ │ 2×10⁻⁸                 │ │
│ │ Reliable  │ 82.4 kg   │ €13,200  │ 1×10⁻⁷ ↓              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ CONVERGENCE:                                 [REQ-060]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Pareto │  · · · · ····──────                                │ │
│ │ Size   │·                                                   │ │
│ │        └────────────────────                                │ │
│ │          0    50   100   150   Generation                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ DESIGN SPACE:                                [REQ-064]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Weight │ · · ·                                              │ │
│ │   (kg) │  ·●●●●·    ← Pareto frontier                       │ │
│ │        │ · · · ·                                            │ │
│ │        └──────────── Cost (€)                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ CONSTRAINT SATISFACTION:                     [REQ-063]          │
│ Burst: 298K pass │ Weight: 357K pass │ Permeation: 412K pass   │
│                                                                 │
│ [Pause] [Cancel]                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Screen 4: Results (Pareto Frontier)

**RTM:** REQ-065 to REQ-089

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ OPTIMIZATION RESULTS                                 Step 4/8   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 847,293 designs evaluated in 42 seconds      [REQ-124,125]      │
│                                                                 │
│ PARETO FRONTIER (Weight vs Cost)             [REQ-065]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Cost  │                                                     │ │
│ │ €15k  │ A·                                                  │ │
│ │       │   ·B                                                │ │
│ │ €14k  │     ·C★        [REQ-067: Click to select]           │ │
│ │       │       ·D                                            │ │
│ │ €13k  │         ·E                                          │ │
│ │       └───────────────────                                  │ │
│ │         74  77  79  82  86  Weight (kg)                     │ │
│ │                 │                                           │ │
│ │            Target: 80kg                                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [2D Weight/Cost] [2D Weight/Reliability] [3D View] [REQ-066]    │
│                                                                 │
│ PARETO DESIGNS:                              [REQ-067,068]      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │     │ Weight │ Burst  │ Cost  │ P(fail) │ Trade-off        │ │
│ ├─────┼────────┼────────┼───────┼─────────┼──────────────────┤ │
│ │ A   │ 74 kg  │ 1,590  │€14.2k │ 8×10⁻⁶ │ Lightest         │ │
│ │ B   │ 77 kg  │ 1,650  │€13.8k │ 2×10⁻⁶ │ Balanced         │ │
│ │ C ★ │ 79 kg  │ 1,720  │€13.5k │ 6×10⁻⁷ │ Recommended      │ │
│ │ D   │ 82 kg  │ 1,810  │€13.2k │ 1×10⁻⁷ │ Conservative     │ │
│ │ E   │ 86 kg  │ 1,900  │€12.9k │ 2×10⁻⁸ │ Max margin       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ★ RECOMMENDATION: Design C                   [REQ-069,070]      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ • Weight: 79.3 kg (1% under target)                    ✓   │ │
│ │ • Burst: 1,720 bar (9% above requirement)              ✓   │ │
│ │ • Cost: €13,500 (10% under typical)                    ✓   │ │
│ │ • Reliability: 6×10⁻⁷ (17× better than required)      ✓   │ │
│ │                                                             │ │
│ │ Design A is lighter but 13× less reliable.                  │ │
│ │ [Ask: Why not Design A?]                   [REQ-127]        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ COMPLIANCE:                                  [REQ-084 to 089]   │
│ ISO 11119-3: ✓ PASS │ UN R134: ✓ PASS │ EC 79: ✓ PASS         │
│ [View Full Compliance Matrix]                                   │
│                                                                 │
│ [← Back] [View Analysis →] [Compare Designs →]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Screen 5: Design Analysis (CRITICAL - Previously Missing)

**RTM:** REQ-016 to REQ-057, REQ-075 to REQ-083, REQ-132 to REQ-139

This screen has 6 tabs addressing the critical gaps identified in the gap analysis.

### Tab Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ DESIGN ANALYSIS: Design C                            Step 5/8   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Geometry] [Stress] [Failure] [Thermal] [Reliability] [Physics] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tab 1: Geometry

**RTM:** REQ-016 to 022, REQ-031 to 036

```
┌─────────────────────────────────────────────────────────────────┐
│ GEOMETRY                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────┐  DIMENSIONS                             │
│ │                     │  Inner diameter:  350 mm                │
│ │  [3D TANK MODEL]    │  Outer diameter:  408 mm                │
│ │                     │  Cylinder length: 1,200 mm              │
│ │  ← Drag to rotate   │  Total length:    1,560 mm              │
│ │  ← Scroll to zoom   │  Internal volume: 150.3 L               │
│ │                     │  Wall thickness:  28.1 mm               │
│ │  [REQ-031]          │                                         │
│ └─────────────────────┘  Dome: Isotensoid (α₀=14.2°) [REQ-022]  │
│                                                                 │
│ VIEW: [Exterior] [Section] [Layers] [Wireframe]                 │
│       [REQ-034]   [REQ-032]                                     │
│                                                                 │
│ ═══════════════════════════════════════════════════════════════ │
│                                                                 │
│ SECTION VIEW                                 [REQ-034,035,036]  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [CROSS-SECTION SHOWING:]                                    │ │
│ │ • 28.1mm composite wall                                     │ │
│ │ • 3.2mm HDPE liner                      [REQ-035]           │ │
│ │ • Boss interface detail                 [REQ-036]           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ DOME PROFILE                                 [REQ-017,018]      │
│ ┌─────────────────────┐  Isotensoid Parameters:                 │
│ │ z   ╭───╮           │  α₀ (boss angle): 14.2°                 │
│ │ ↑  ╱     ╲          │  r₀ (cylinder R): 175 mm                │
│ │   │       │         │  Dome depth: 180 mm                     │
│ │   └───────┘         │  Boss OD: 80 mm           [REQ-018]     │
│ │   └────────→ r      │                                         │
│ └─────────────────────┘  [View Equation]          [REQ-022]     │
│                                                                 │
│ THICKNESS DISTRIBUTION                       [REQ-021]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [3D MODEL WITH THICKNESS COLOR MAP]                         │ │
│ │                                                             │ │
│ │ Cylinder: 28.1mm │ Dome apex: 22.4mm │ Boss region: 38.5mm  │ │
│ │                                                             │ │
│ │ Color: █ 40mm  █ 30mm  █ 20mm                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ LAYUP DEFINITION                             [REQ-025 to 028]   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Layer │ Type    │ Angle  │ Thick │ Coverage                │ │
│ ├───────┼─────────┼────────┼───────┼─────────────────────────┤ │
│ │ 1     │ Helical │ ±14.2° │ 0.34  │ Full                    │ │
│ │ 2     │ Hoop    │ 88°    │ 0.55  │ Cylinder      [REQ-028] │ │
│ │ 3     │ Helical │ ±15.0° │ 0.34  │ Full                    │ │
│ │ ...   │ ...     │ ...    │ ...   │ ...                     │ │
│ │ 42    │ Hoop    │ 88°    │ 0.55  │ Cylinder                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ Total: 42 layers │ Helical: 18 │ Hoop: 24 │ FVF: 64%           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tab 2: Stress Analysis (CRITICAL)

**RTM:** REQ-041 to REQ-048

```
┌─────────────────────────────────────────────────────────────────┐
│ STRESS ANALYSIS                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ STRESS TYPE: [von Mises] [Hoop] [Axial] [Shear] [Tsai-Wu]      │
│              [REQ-041]   [REQ-042] [REQ-043]     [REQ-046]      │
│                                                                 │
│ LOAD CASE: [Test (1050 bar)] [Burst (1720 bar)]                │
│                                                                 │
│ STRESS CONTOUR                               [REQ-041,042,043]  │
│ ┌─────────────────────┐  ┌───────────────────┐                  │
│ │                     │  │ von Mises (MPa)   │                  │
│ │ [3D MODEL WITH      │  │ █ 2,800 ← Max     │                  │
│ │  STRESS CONTOUR]    │  │ █ 2,400           │                  │
│ │                     │  │ █ 2,000           │                  │
│ │ ← Max stress marked │  │ █ 1,600           │                  │
│ │   [REQ-044]         │  │ █ 1,200           │                  │
│ │                     │  │ █ 800             │                  │
│ │ ← Dome-cylinder     │  │ █ 400 ← Min       │                  │
│ │   transition        │  │                   │                  │
│ │   [REQ-045]         │  │                   │                  │
│ └─────────────────────┘  └───────────────────┘                  │
│                                                                 │
│ MAXIMUM STRESS:                              [REQ-044]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Location: Dome-cylinder transition, outer surface           │ │
│ │ Value: 2,127 MPa │ Allowable: 2,550 MPa │ Margin: 20%       │ │
│ │ [Zoom to Location] [Show Stress Path]                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ LAYER-BY-LAYER STRESS                        [REQ-047]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Layer │ Type    │ σ₁ (MPa) │ σ₂ (MPa) │ τ₁₂ │ Tsai-Wu     │ │
│ ├───────┼─────────┼──────────┼──────────┼─────┼─────────────┤ │
│ │ 1     │ Helical │ 2,127    │ 28       │ 12  │ 0.84        │ │
│ │ 2     │ Hoop    │ 1,890    │ 35       │ 8   │ 0.75        │ │
│ │ ...   │ ...     │ ...      │ ...      │ ... │ ...         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tab 3: Failure Analysis (CRITICAL)

**RTM:** REQ-046 to REQ-053

```
┌─────────────────────────────────────────────────────────────────┐
│ FAILURE ANALYSIS                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ PREDICTED FAILURE MODE                       [REQ-051,052]      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ★ FIBER BREAKAGE (Preferred)                        ✓ GOOD  │ │
│ │                                                             │ │
│ │ The design fails by fiber breakage in hoop layers.          │ │
│ │ This is PREFERRED because it is:                            │ │
│ │ • Predictable • Progressive • Not catastrophic              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ TSAI-WU FAILURE INDEX                        [REQ-046]          │
│ ┌─────────────────────┐  Max at test pressure: 0.84             │
│ │ [3D MODEL WITH      │  Max at burst: 1.02 (failure)           │
│ │  TSAI-WU CONTOUR]   │                                         │
│ │                     │  Index < 1.0 = NO FAILURE               │
│ │ █ 1.0+ FAIL         │  Index ≥ 1.0 = FAILURE INITIATED        │
│ │ █ 0.8               │                                         │
│ │ █ 0.6               │                                         │
│ │ █ 0.4               │                                         │
│ └─────────────────────┘                                         │
│                                                                 │
│ FIRST PLY FAILURE                            [REQ-048]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Layer: 3 (Helical ±15°)                                     │ │
│ │ Location: Dome-cylinder transition                          │ │
│ │ Pressure: 1,050 bar                                         │ │
│ │ Mode: Matrix microcracking                                  │ │
│ │ [Show FPF Location on 3D]                                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ PROGRESSIVE FAILURE SEQUENCE                 [REQ-049,053]      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Pressure │ Event                          │ Layers          │ │
│ ├──────────┼────────────────────────────────┼─────────────────┤ │
│ │ 1,050bar │ First matrix cracking          │ Layer 3         │ │
│ │ 1,280bar │ Matrix cracking propagates     │ Layers 1-5      │ │
│ │ 1,450bar │ Delamination initiation        │ Interface 3/4   │ │
│ │ 1,620bar │ Fiber breakage begins          │ Hoop layers     │ │
│ │ 1,720bar │ Ultimate failure               │ Layers 18-24    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ [▶ Play Failure Animation]                                      │
│                                                                 │
│ HASHIN DAMAGE CRITERIA                       [REQ-050]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Mode              │ At Test │ At Burst │ Limit             │ │
│ ├───────────────────┼─────────┼──────────┼───────────────────┤ │
│ │ Fiber tension     │ 0.72    │ 1.02     │ 1.0               │ │
│ │ Fiber compression │ 0.08    │ 0.12     │ 1.0               │ │
│ │ Matrix tension    │ 0.89    │ 1.31     │ 1.0               │ │
│ │ Matrix compression│ 0.15    │ 0.22     │ 1.0               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tab 4: Thermal Analysis

**RTM:** REQ-054 to REQ-057

```
┌─────────────────────────────────────────────────────────────────┐
│ THERMAL ANALYSIS                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ FAST-FILL ANALYSIS                           [REQ-054]          │
│ ┌─────────────────────┐  Peak gas temp: 95°C                    │
│ │ [3D MODEL WITH      │  Peak wall temp: 72°C                   │
│ │  TEMP CONTOUR]      │  Peak liner temp: 68°C                  │
│ │                     │  Liner limit: 85°C ✓                    │
│ │ █ 95°C              │                                         │
│ │ █ 70°C              │  Time to peak: 180 seconds              │
│ │ █ 45°C              │                                         │
│ └─────────────────────┘                                         │
│                                                                 │
│ THERMAL STRESS                               [REQ-055]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Hoop thermal: 45 MPa │ Axial: 28 MPa │ Radial: 12 MPa       │ │
│ │ Max thermal stress: 52 MPa (inner liner surface)            │ │
│ │ Combined with pressure: Peak total = 2,179 MPa              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ EXTREME TEMPERATURE PERFORMANCE              [REQ-056]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Condition   │ Temp   │ Max Stress │ Margin │ Status         │ │
│ ├─────────────┼────────┼────────────┼────────┼────────────────┤ │
│ │ Cold soak   │ -40°C  │ 2,310 MPa  │ +10%   │ ✓ PASS        │ │
│ │ Hot soak    │ +85°C  │ 2,095 MPa  │ +22%   │ ✓ PASS        │ │
│ │ Hot fill    │ +95°C  │ 2,179 MPa  │ +17%   │ ✓ PASS        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tab 5: Reliability Analysis

**RTM:** REQ-076 to REQ-083

```
┌─────────────────────────────────────────────────────────────────┐
│ RELIABILITY ANALYSIS                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ MONTE CARLO RESULTS                          [REQ-076]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ P(failure) = 6 × 10⁻⁷                                       │ │
│ │                                                             │ │
│ │ 1 in 1.7 million chance of burst below working pressure.    │ │
│ │ This is 17× better than 10⁻⁵ typical requirement.          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ BURST PRESSURE DISTRIBUTION                  [REQ-078]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Count │         ╭──╮                                        │ │
│ │       │       ╭─┤  ├─╮                                      │ │
│ │       │     ╭─┤  │  │ ├─╮                                   │ │
│ │       │   ╭─┤  │  │  │ │ ├─╮                                │ │
│ │       └──┴──┴──┴──┴──┴──┴──┴────                           │ │
│ │          1,575  1,650  1,720  1,800  Burst (bar)            │ │
│ │            │              │                                 │ │
│ │         Min req        Mean                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ Mean: 1,720 bar │ Std: 52 bar │ CoV: 3.0%                      │
│                                                                 │
│ UNCERTAINTY BREAKDOWN                        [REQ-079,080,081]  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Source               │ CoV  │ Variance Contribution        │ │
│ ├──────────────────────┼──────┼──────────────────────────────┤ │
│ │ Fiber strength       │ 8%   │ ████████████████ 52%        │ │
│ │ Thickness            │ 5%   │ █████████ 28%               │ │
│ │ Fiber volume         │ 3%   │ █████ 15%                   │ │
│ │ Angle                │ 2%   │ ██ 5%                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ KEY: Fiber strength dominates. Tighter fiber QC helps most.    │
│                                                                 │
│ SENSITIVITY ANALYSIS                         [REQ-082,083]      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Parameter          │ Effect (bar per 1% change)            │ │
│ ├────────────────────┼───────────────────────────────────────┤ │
│ │ Fiber strength     │ ████████████████████ +17.2           │ │
│ │ Hoop thickness     │ ██████████████ +12.1                 │ │
│ │ Helical thickness  │ █████████ +8.4                       │ │
│ │ Fiber volume       │ ██████ +5.2                          │ │
│ │ Helical angle      │ ███ -2.8                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ RELIABILITY VS SAFETY FACTOR                 [REQ-077]          │
│ Traditional SF: 2.25× │ Actual: 2.46×                          │
│ SF is a PROXY. Monte Carlo gives actual P(failure) = 6×10⁻⁷.  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tab 6: Physics & Cost

**RTM:** REQ-132 to REQ-139

```
┌─────────────────────────────────────────────────────────────────┐
│ PHYSICS & COST                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ COST BREAKDOWN                               [REQ-132,133]      │
│ ┌───────────────────┐  Unit cost: €13,500                       │
│ │                   │                                           │
│ │  [PIE CHART]      │  • Carbon fiber: €6,300 (47%) ← Dominates│
│ │                   │  • Resin: €540 (4%)                       │
│ │  Carbon fiber     │  • Liner: €360 (3%)                       │
│ │  dominates (47%)  │  • Boss: €450 (3%)                        │
│ │                   │  • Labor: €1,750 (13%)                    │
│ └───────────────────┘  • Overhead: €2,290 (17%)                 │
│                        • Margin: €1,480 (11%)                   │
│                                                                 │
│ WEIGHT-COST TRADE-OFF                        [REQ-134]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Cost │  ·A                                                  │ │
│ │  €   │    ·B                                                │ │
│ │ 14k  │      ·C ← Your design                                │ │
│ │      │        ·D                                            │ │
│ │ 13k  │          ·E                                          │ │
│ │      └──────────────────                                    │ │
│ │        74   77   79   82   86   Weight (kg)                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ Trade-off: Each kg saved costs ~€140 extra                     │
│                                                                 │
│ PHYSICS FUNDAMENTALS                         [REQ-136,137,139]  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Pressure Vessel:                           [REQ-136]        │ │
│ │   σ_hoop = PR/t = 70 × 175 / 28.1 = 436 MPa                │ │
│ │   σ_axial = PR/2t = 218 MPa                                │ │
│ │   Ratio: 2.0 (netting theory: 2.0) ✓                       │ │
│ │                                                             │ │
│ │ Stored Energy:                             [REQ-137]        │ │
│ │   E = 17.2 MJ (~4 kg TNT equivalent)                       │ │
│ │                                                             │ │
│ │ Permeation:                                [REQ-138]        │ │
│ │   J = 32 NmL/hr/L (req: ≤46) ✓                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ [Show All Equations]                         [REQ-139]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Screen 6: Design Comparison

**RTM:** REQ-071 to REQ-075

```
┌─────────────────────────────────────────────────────────────────┐
│ DESIGN COMPARISON                                    Step 6/8   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ SELECT: [✓] Design A  [✓] Design C  [ ] Design D  [ ] Design E │
│                                                                 │
│ RADAR CHART                                  [REQ-072]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                   Weight                                    │ │
│ │                     ▲                                       │ │
│ │      Fatigue ──────●┼●────── Burst                         │ │
│ │                   ╱ │ ╲                                     │ │
│ │                  ●──┼──●                                    │ │
│ │      Efficiency    │   Cost                                 │ │
│ │                Reliability                                  │ │
│ │      ── A (blue)  ── C (green)                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ COMPARISON TABLE                             [REQ-073]          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Metric           │ Design A    │ Design C ★  │ Better      │ │
│ ├──────────────────┼─────────────┼─────────────┼─────────────┤ │
│ │ Weight (kg)      │ 74.2 ★      │ 79.3        │ A           │ │
│ │ Burst (bar)      │ 1,590       │ 1,720 ★     │ C           │ │
│ │ Cost (€)         │ 14,200      │ 13,500 ★    │ C           │ │
│ │ P(failure)       │ 8×10⁻⁶     │ 6×10⁻⁷ ★   │ C           │ │
│ │ Fatigue Life     │ 45,000      │ 58,000 ★    │ C           │ │
│ │ Permeation       │ 38          │ 32 ★        │ C           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ STRESS COMPARISON                            [REQ-075]          │
│ ┌───────────────────────┐  ┌───────────────────────┐            │
│ │ DESIGN A              │  │ DESIGN C              │            │
│ │ [Stress Contour]      │  │ [Stress Contour]      │            │
│ │ Max: 2,280 MPa        │  │ Max: 2,127 MPa        │            │
│ │ Location: Dome apex   │  │ Location: Transition  │            │
│ │ Margin: 12%           │  │ Margin: 20%           │            │
│ └───────────────────────┘  └───────────────────────┘            │
│                                                                 │
│ INSIGHT: Design A has higher stress at dome apex due to        │
│ thinner walls. Design C distributes stress more evenly.        │
│                                                                 │
│ [← Back] [Select Design C →] [View Analysis →]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Screen 7: Validation Planning

**RTM:** REQ-090 to REQ-102

```
┌─────────────────────────────────────────────────────────────────┐
│ VALIDATION PLANNING                                  Step 7/8   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ SURROGATE CONFIDENCE                         [REQ-090,091]      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Metric         │ R²   │ Error  │ 95% CI for Design C       │ │
│ ├────────────────┼──────┼────────┼───────────────────────────┤ │
│ │ Burst pressure │ 0.97 │ ±3.2%  │ 1,665 - 1,775 bar         │ │
│ │ Weight         │ 0.99 │ ±1.5%  │ 78.1 - 80.5 kg            │ │
│ │ Max stress     │ 0.95 │ ±4.8%  │ 2,025 - 2,229 MPa         │ │
│ │ Failure loc    │ 94%  │ -      │ Dome transition           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ VALIDATION FEA                               [REQ-092,093]      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ RECOMMENDATION: Run full FEA before prototyping             │ │
│ │ Estimated time: 45 minutes                                  │ │
│ │ [Run Validation FEA] [Skip]                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ TEST PLAN                                    [REQ-094 to 098]   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Test             │ Articles │ Duration │ Parameters         │ │
│ ├──────────────────┼──────────┼──────────┼────────────────────┤ │
│ │ Hydrostatic burst│ 3        │ 1 week   │ ≥1,575 bar         │ │
│ │ Ambient cycling  │ 3        │ 6 weeks  │ 11,000 cycles      │ │
│ │ Extreme temp     │ 1        │ 2 weeks  │ -40°C to +85°C     │ │
│ │ Bonfire          │ 1        │ 1 day    │ PRD activation     │ │
│ │ Drop test        │ 2        │ 1 day    │ 1.8m concrete      │ │
│ │ Gunshot          │ 1        │ 1 day    │ .30 cal AP         │ │
│ │ Permeation       │ 1        │ 4 weeks  │ ≤46 NmL/hr/L       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ Articles: 8-10 │ Duration: 12-16 wks │ Cost: €75-95K           │
│ [REQ-095,096,097]                                               │
│                                                                 │
│ SENTRY MONITORING                            [REQ-099 to 102]   │
│ ┌─────────────────────┐  CRITICAL POINTS:    [REQ-100]          │
│ │                     │  1. Dome/boss interface                 │
│ │ [3D MODEL WITH      │     Reason: Highest stress              │
│ │  SENSOR MARKERS]    │     Interval: 6 months   [REQ-102]      │
│ │                     │                                         │
│ │ ● Sensor 1 (dome)   │  2. Cylinder hoop region                │
│ │ ● Sensor 2 (cyl)    │     Reason: Fatigue critical            │
│ │ ● Sensor 3 (boss)   │     Interval: 12 months                 │
│ │   [REQ-101]         │                                         │
│ └─────────────────────┘  [Generate Sentry Spec]                 │
│                                                                 │
│ [← Back] [Proceed to Export →]                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Screen 8: Export

**RTM:** REQ-103 to REQ-120

```
┌─────────────────────────────────────────────────────────────────┐
│ EXPORT DESIGN PACKAGE                                Step 8/8   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ DESIGN: C - 700bar/150L HDT Tank                                │
│ Status: ✓ All compliance checks passed                          │
│                                                                 │
│ GEOMETRY FILES                               [REQ-111 to 113]   │
│ ☑ STEP file (3D)  ☑ DXF drawings  ☑ Dome coordinates CSV       │
│                                                                 │
│ MANUFACTURING DATA                           [REQ-103 to 110]   │
│ ☑ Layup definition CSV           [REQ-114]                      │
│ ☑ Winding program NC             [REQ-115]                      │
│ ☑ Winding sequence spec          [REQ-103]                      │
│ ☑ Fiber tension settings         [REQ-104]                      │
│ ☑ Cure cycle specification       [REQ-105,106]                  │
│ ☑ Dimensional tolerances         [REQ-108]                      │
│ ☑ QC inspection plan             [REQ-107]                      │
│ ☑ NDE requirements               [REQ-109]                      │
│ ☑ Accept/reject criteria         [REQ-110]                      │
│                                                                 │
│ ANALYSIS REPORTS                             [REQ-116,117]      │
│ ☑ Design report PDF (~45 pages)                                 │
│ ☑ Stress analysis report         [REQ-117] ← NEW                │
│ ☑ Reliability analysis report                                   │
│ ☑ Thermal analysis report                                       │
│                                                                 │
│ COMPLIANCE DOCUMENTATION                     [REQ-085,118]      │
│ ☑ Standards compliance matrix                                   │
│ ☑ Per-clause breakdown           [REQ-085] ← NEW                │
│   - ISO 11119-3 clause-by-clause                                │
│   - UN R134 clause-by-clause                                    │
│                                                                 │
│ CERTIFICATION SUPPORT                        [REQ-118 to 120]   │
│ ☑ Test plan document                                            │
│ ☑ Material specifications        [REQ-119]                      │
│ ☑ Traceability matrix template   [REQ-120]                      │
│                                                                 │
│ SENTRY THROUGH-LIFE                                             │
│ ☑ Monitoring specification                                      │
│ ☑ Sensor placement guide                                        │
│ ☑ Inspection schedule                                           │
│                                                                 │
│ MANUFACTURING PREVIEW                        [REQ-103 to 106]   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Winding: 42 layers │ Helical: ±14-15° │ Hoop: 88°          │ │
│ │ Tension: 45-55 N │ Bandwidth: 6.35 mm                       │ │
│ │ Cure: 180°C × 3hr │ Post-cure: 200°C × 2hr                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Generate & Download Package]                                   │
│                                                                 │
│ ✓ Package generated: 14.5 MB                                   │
│ [Download ZIP] [Save to Cloud] [Email]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Global UI Elements

**RTM:** REQ-121 to REQ-129

### Workflow Progress [REQ-121,122,142]
```
①──②──③──④──⑤──⑥──⑦──⑧
Req Cfg Opt Res Ana Cmp Val Exp
● = Complete  ○ = Current  ○ = Future
```

### State & Navigation [REQ-122,123]
- Back/Forward on each screen
- Click completed steps to revisit
- All data persists

### Explainability [REQ-126,127,128,129]
- "Why?" buttons throughout
- Expandable rationale
- On-demand LLM explanations
- Show-your-work calculations

---

## Data Structures Summary

Each screen's primary data requirements are defined in the layouts above. Full JSON schemas will be in document 12-mock-data-specification.md.

---

## Build Phases

| Phase | Duration | Scope |
|-------|----------|-------|
| 1. Core Flow | Week 1-2 | All 8 screens basic, static mock data |
| 2. 3D Visualization | Week 3 | Three.js model, section views, contours |
| 3. Analysis Depth | Week 4 | All Screen 5 tabs, interactive charts |
| 4. Polish & Integration | Week 5 | WebSocket, API contracts, test fixtures |

---

## RTM Coverage Summary

| Status | Count | Percentage |
|--------|-------|------------|
| Addressed | 142 | 100% |
| Screen 1 | 6 | 4% |
| Screen 2 | 9 | 6% |
| Screen 3 | 9 | 6% |
| Screen 4 | 25 | 18% |
| Screen 5 | 59 | 42% |
| Screen 6 | 5 | 4% |
| Screen 7 | 13 | 9% |
| Screen 8 | 18 | 13% |

**All 142 requirements now have defined UI coverage.**

---

## Next Document

**12-mock-data-specification.md** - Full JSON schemas for each screen's mock data with realistic engineering values.
