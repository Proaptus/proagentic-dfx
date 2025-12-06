# H2 Storage Tank Design: The Engineer's Journey

## What This Document Is

This is the actual manual process an engineer follows today to design a hydrogen storage tank. Before we can build an agent to help, we must understand their world.

---

## The Project Arrives

**Week 0: The Brief**

Sarah, a senior design engineer at a composites company, receives an email:

> "We need a 700-bar, 150L hydrogen tank for a heavy-duty truck application. Target weight 80kg, budget €15,000/unit at 5,000 units/year. Marine environment, 15-year service life. Need certified design in 18 months."

Sarah opens a fresh notebook. This will consume the next year of her life.

---

## Phase 1: Requirements Analysis (Weeks 1-2)

**What Sarah Does:**

1. **Decodes the brief** - What does "700 bar" mean? Working pressure or burst? (It's working pressure. Burst must be 2.25× = 1,575 bar minimum)

2. **Hunts down standards** - For a truck in Europe:
   - EC 79/2009 (hydrogen vehicles - now repealed, but still referenced)
   - UN Regulation 134 (hydrogen storage systems)
   - ISO 11119-3 (composite gas cylinders)
   - EN 12245 (transportable cylinders)
   - SAE J2579 (for reference)
   
3. **Cross-references requirements** - Each standard has slightly different test requirements. She builds a spreadsheet tracking what's required.

4. **Calculates derived requirements:**
   - Test pressure: 1.5 × 700 = 1,050 bar
   - Burst pressure: 2.25 × 700 = 1,575 bar (minimum)
   - Cycle life: 11,000 cycles (UN R134 requirement)
   - Temperature range: -40°C to +85°C
   - Fire resistance: bonfire test required

**Tools Used:** Standards PDFs, Excel, company knowledge base, asking colleagues

**Pain Points:**
- Standards are expensive and dense
- Multiple overlapping requirements
- Changes frequently (EC 79 was repealed in 2022)
- "Did I miss anything?"

**Output:** Requirements specification document (20-30 pages)

**Time spent:** 2 weeks
**Actual engineering decisions:** 2-3 hours
**Everything else:** Admin, reading, searching

---

## Phase 2: Concept Selection (Weeks 3-4)

**What Sarah Does:**

1. **Tank type selection:**

   | Type | Liner | Overwrap | Weight | Cost | Notes |
   |------|-------|----------|--------|------|-------|
   | I | All steel | None | 5kg/L | € | Heavy, simple |
   | II | Steel | Hoop wrap | 3kg/L | €€ | Lighter |
   | III | Aluminum | Full wrap | 1kg/L | €€€ | Good balance |
   | IV | Plastic (HDPE) | Full wrap | 0.8kg/L | €€€€ | Lightest |
   | V | None | All composite | 0.6kg/L | €€€€€ | Cutting edge |

   For 80kg target at 150L = 0.53 kg/L → Type IV or V needed

2. **Material selection:**

   Sarah consults material databases, supplier datasheets, previous projects:
   
   - **Liner:** HDPE (PA6 has better permeation resistance but harder to process)
   - **Fiber:** Toray T700S carbon (best price/performance)
   - **Matrix:** Epoxy (proven, good adhesion to fiber)
   - **Boss:** 316L stainless steel (marine environment)

3. **Rough sizing:**
   
   For 150L cylindrical tank:
   - Internal diameter: ~350mm (fits truck chassis)
   - Length: ~1,600mm (volume check: π × 0.175² × 1.6 = 154L ✓)
   - Estimated composite thickness: 25-35mm

**Tools Used:** Excel, material databases, supplier calls, experience

**Pain Points:**
- "Is Type IV really the right choice? Or should I push for Type V?"
- "T700 vs T800? T800 is stronger but more expensive. Is it worth it?"
- Limited ability to explore trade-offs systematically
- Decisions based on experience, not optimization

**Output:** Concept selection memo (10 pages)

**Time spent:** 2 weeks
**Actual engineering decisions:** 1 day
**Everything else:** Research, meetings, documentation

---

## Phase 3: Dome Geometry Design (Weeks 5-8)

**The Hard Part Nobody Tells You About**

The tank isn't just a cylinder. The ends (domes) are critical and mathematically complex.

**What Sarah Does:**

1. **Understands the problem:**
   
   The dome must be shaped so that:
   - Fibers follow geodesic paths (shortest path on surface)
   - All fibers carry equal load (isotensoid condition)
   - The winding is physically possible (no slippage)
   - The boss can be attached properly

2. **Solves the isotensoid equations:**

   The dome meridian profile is defined by an integral equation:
   
   ```
   z(r) = ∫[r_boss to r] f(ρ, α, ...) dρ
   ```
   
   Where f involves Clairaut's equation and stress equilibrium.
   
   This isn't standard engineering math. Sarah either:
   - Uses CADWIND software (€30,000+ license)
   - Uses Cadfil (similar cost)
   - Struggles with Python/Matlab scripts from literature
   - Copies a previous design and modifies

3. **Boss geometry:**
   
   The boss (metal end fitting) must:
   - Accept the valve/PRD
   - Transfer load to composite
   - Allow fiber winding to start/end
   - Not create stress concentrations
   
   Sarah iterates on boss profile, trading off weight vs stress.

4. **Checks manufacturability:**
   
   Can the filament winder actually make this shape?
   - Minimum turning radius?
   - Fiber slippage on dome?
   - Required winding angles?

**Tools Used:** CADWIND or Cadfil (expensive), MATLAB/Python, CAD (SolidWorks/CATIA)

**Pain Points:**
- Specialist software is expensive
- Math is non-intuitive
- Many iterations to get manufacturable dome
- Easy to get wrong → expensive failures later
- "I don't fully understand why this dome shape works"

**Output:** Dome geometry (CAD model, coordinate files)

**Time spent:** 4 weeks
**Actual engineering insight:** A few key decisions
**Everything else:** Fighting with math and software

---

## Phase 4: Preliminary Sizing - Netting Analysis (Weeks 9-10)

**What Sarah Does:**

1. **Applies netting theory to cylindrical region:**

   Netting theory assumes only fibers carry load (no matrix contribution):
   
   ```
   Hoop stress:   σ_θ = PD/2t
   Axial stress:  σ_z = PD/4t
   
   For geodesic winding at angle α:
   tan²α = σ_θ / 2σ_z = 2  →  α ≈ 54.7°
   
   Required thickness:
   t_hoop = PD / (2σ_fiber × fiber_volume_fraction)
   t_helical = from similar calculation at angle α
   ```

2. **Calculates layer thicknesses:**
   
   For P = 1,575 bar (burst), D = 350mm:
   - Hoop layers: ~15-18mm
   - Helical layers: ~10-12mm
   - Total: ~25-30mm
   
3. **Defines initial layup:**
   
   [±15°/90°/±15°/90°/±15°/90°...] or similar
   
   The sequence matters for stress distribution and manufacturing.

**Tools Used:** Excel, hand calculations, company templates

**Pain Points:**
- Netting theory is known to be inaccurate (ignores matrix, dome effects)
- "I know this will change when I do FEA"
- Feels like wasted effort
- Different engineers get different answers

**Output:** Initial layup definition (thickness, angles, sequence)

**Time spent:** 2 weeks
**Value added:** Low (will be redone)

---

## Phase 5: Winding Simulation (Weeks 11-14)

**What Sarah Does:**

1. **Imports dome geometry into CADWIND/Cadfil**

2. **Simulates winding paths:**
   
   The software shows how fiber will be laid on mandrel:
   - Helical layers at ±15° (or calculated angle)
   - Hoop layers at ~88-90°
   - Transition zones on domes
   
3. **Checks for issues:**
   - Fiber slippage (friction coefficient)
   - Coverage gaps
   - Excessive buildup
   - Winding turnaround points

4. **Generates outputs:**
   - NC code for filament winder
   - Thickness distribution (varies on dome)
   - Angle distribution
   - Fiber consumption estimate

5. **Iterates with dome geometry:**
   
   Often, winding simulation reveals dome design problems → back to Phase 3

**Tools Used:** CADWIND, Cadfil, or similar (€30,000+ license)

**Pain Points:**
- Software learning curve is steep
- Multiple iterations between dome and winding
- "Did I set up the simulation correctly?"
- Expensive to validate (need to actually wind)

**Output:** Winding program, thickness/angle maps

**Time spent:** 4 weeks
**Iterations between Phase 3-5:** 3-10 cycles

---

## Phase 6: FEA Model Setup (Weeks 15-18)

**The Technical Core**

**What Sarah Does:**

1. **Chooses FEA approach:**
   - ABAQUS with Wound Composite Modeler (WCM) - industry standard
   - ANSYS ACP - alternative
   - Specialized tools: ComposicaD, ESI VPS
   
   Each has different capabilities and workflows. Sarah uses ABAQUS WCM.

2. **Builds the geometry:**
   - Import from CAD/winding simulation
   - Clean up geometry issues
   - Define liner, boss, composite regions

3. **Defines composite layup:**
   
   WCM allows definition of:
   - Each layer's thickness (varies with position)
   - Each layer's angle (varies on dome)
   - Material properties per layer
   - Stacking sequence
   
   This is tedious and error-prone. The dome region has thickness/angle gradients that must be correctly specified.

4. **Material properties:**

   | Property | Liner (HDPE) | Composite (T700/Epoxy) |
   |----------|--------------|------------------------|
   | E₁ | 1.0 GPa | 135 GPa |
   | E₂ | - | 10 GPa |
   | G₁₂ | - | 5 GPa |
   | ν₁₂ | 0.4 | 0.3 |
   | σ₁_ult | 25 MPa | 2,550 MPa |
   | σ₂_ult | - | 50 MPa |
   | τ₁₂_ult | - | 75 MPa |

5. **Mesh generation:**
   - Shell elements for liner and composite (S4R, S8R)
   - Fine mesh at dome-cylinder transition
   - Mesh sensitivity study needed

6. **Boundary conditions:**
   - Symmetric BC at quarter model
   - Boss fixed (or spring to ground)
   - Internal pressure applied

7. **Load steps:**
   - Linear ramp to burst pressure
   - Or progressive loading for failure analysis

**Tools Used:** ABAQUS with WCM (€25,000+ license), 3-5 days just for setup

**Pain Points:**
- WCM is complex, many ways to get wrong
- Material data has uncertainty
- Mesh dependency
- "Have I modeled the dome region correctly?"
- Setup takes days, errors only found when running

**Output:** FEA model ready to run

**Time spent:** 4 weeks
**Actual analysis:** 0 (just setup!)

---

## Phase 7: The Iteration Hell (Weeks 19-30)

**This Is Where Projects Die**

**What Sarah Does:**

1. **Runs first FEA (Day 1):**
   
   Submit job → Wait 2-8 hours → Check results
   
   Results show:
   - Max von Mises stress: 2,800 MPa at dome-cylinder transition
   - Burst pressure predicted: 1,420 bar (need 1,575 bar!)
   - Tsai-Wu failure index > 1.0 in helical layers at dome

2. **Analyzes failure:**
   
   "The dome-cylinder junction is overstressed. The helical layers are failing in transverse tension."
   
   Potential fixes:
   - Add local reinforcement ("doilies") at transition
   - Increase helical thickness
   - Change helical angle
   - Modify dome geometry

3. **Makes changes (Day 2):**
   
   Sarah decides to add 2mm to helical layers and add doily reinforcement.
   - Modify layup definition in WCM (30 min - 2 hours)
   - Re-mesh if geometry changed
   - Submit new run

4. **Waits (Day 2-3):**
   
   Another 4-8 hour run.

5. **Checks results (Day 3):**
   
   - Burst now 1,510 bar (better!)
   - But now hoop layers failing first
   - Weight increased to 85kg (over target)

6. **Iterates again (Days 4-50):**
   
   This cycle repeats:
   - Run FEA
   - Analyze failure
   - Hypothesize fix
   - Implement change
   - Wait
   - Check
   - Repeat
   
   Each cycle: 1-2 days
   Number of iterations: 15-40 typical
   Total time: 8-16 weeks

**The Frustration:**

Sarah's internal monologue during this phase:

> "Run 12 passes burst but is 4kg overweight."
> "Run 15 is on weight but dome transition fails."
> "Run 18 - I tried reducing the helical angle, now it's worse."
> "Run 22 - Finally! 1,580 bar burst, 79kg. But is this optimal?"
> "I've only tried maybe 30 designs. There could be something much better."
> "My boss is asking why this is taking so long."
> "I don't know if this is optimal. It's just... not failing."

**Tools Used:** ABAQUS, Excel to track iterations, physical notebook

**Pain Points (The Big Ones):**
- Each iteration is 1-2 days
- No systematic exploration
- No way to know if optimal
- Intuition-driven, not data-driven
- Pressure to finish vs pressure to optimize
- "Good enough" replaces "optimal"
- Knowledge stays in Sarah's head, not documented

**Output:** "Optimized" design (really: first design that doesn't obviously fail)

**Time spent:** 12 weeks
**Designs explored:** 20-40
**Designs possible:** Millions
**Confidence in optimality:** Low

---

## Phase 8: Progressive Failure Analysis (Weeks 31-34)

**Predicting Burst**

**What Sarah Does:**

1. **Sets up progressive damage model:**
   
   - Hashin damage initiation criteria
   - Damage evolution laws
   - Non-linear geometry effects
   
2. **Runs analysis:**
   
   This is computationally expensive:
   - Incrementally increase pressure
   - At each increment, check for damage initiation
   - Degrade stiffness where damage occurs
   - Continue until global failure
   
   Run time: 12-48 hours

3. **Extracts results:**
   
   - Predicted burst pressure: 1,620 bar
   - First ply failure: Helical at dome, 1,050 bar
   - Progressive failure sequence
   - Final failure mode: Fiber breakage in hoop layers

4. **Compares to requirements:**
   
   1,620 bar > 1,575 bar required ✓
   
   But Sarah knows this prediction has ±10-15% uncertainty.

**Tools Used:** ABAQUS with damage models

**Pain Points:**
- Long run times
- Uncertain accuracy
- "Will this match the actual test?"
- If prediction is wrong, may need to redesign

**Output:** Burst pressure prediction, failure mode

**Time spent:** 4 weeks
**Confidence:** Moderate

---

## Phase 9: Thermal Analysis (If Required) (Weeks 35-38)

**The Overlooked Factor**

**What Sarah Does:**

1. **Fast-fill analysis:**
   
   When tank fills from empty to 700 bar in 3-5 minutes:
   - Gas temperature rises (compression heating)
   - Tank wall heats up
   - Thermal stresses develop
   
2. **Transient thermal-structural simulation:**
   
   - Coupled analysis
   - Temperature-dependent properties
   - Check stress at maximum temperature

3. **Cycling analysis:**
   
   - 11,000 pressure cycles
   - Temperature cycles from -40°C to +85°C
   - Fatigue check

4. **Potential redesign:**
   
   If thermal stresses are too high → back to Phase 7
   
   (This is why it should be done earlier, but rarely is)

**Tools Used:** ABAQUS thermal, custom scripts

**Pain Points:**
- Often done too late
- Requires design changes late in project
- Different team may do thermal vs structural

**Output:** Thermal analysis report

**Time spent:** 4 weeks (if no redesign needed)

---

## Phase 10: Manufacturing Planning (Weeks 39-42)

**Making It Real**

**What Sarah Does:**

1. **Details winding sequence:**
   
   - How many helical layers first?
   - When to add hoop layers?
   - Fiber tension settings
   - Compaction after each layer?

2. **Cure cycle design:**
   
   - Ramp rate to cure temperature
   - Hold time at cure
   - Cool-down rate
   - Post-cure if needed

3. **Quality control plan:**
   
   - Dimensional checks
   - Ultrasonic inspection
   - Acoustic emission during test
   - Accept/reject criteria

4. **Tooling design:**
   
   - Mandrel specifications
   - Handling fixtures
   - Cure tooling

**Tools Used:** Company procedures, supplier guidance

**Output:** Manufacturing specification

**Time spent:** 4 weeks

---

## Phase 11: Prototype Build (Weeks 43-50)

**Moment of Truth Approaches**

**What Happens:**

1. **Build test articles:**
   
   - 1-2 for burst test
   - 2-3 for cycle testing
   - 1-2 for environmental tests
   - 1 for destructive examination
   
   Total: 6-10 prototypes

2. **Document everything:**
   
   - Actual fiber weight used
   - Actual thickness achieved
   - Any manufacturing deviations
   - Photos, measurements, traceability

**Typical Issues:**
- Thickness variation from design
- Voids in laminate
- Boss fitment issues
- First tank is always a learning experience

**Time spent:** 8 weeks

---

## Phase 12: Testing (Weeks 51-66)

**The Verdict**

**Test Program (UN R134 / ISO 11119):**

| Test | Purpose | Articles | Duration |
|------|---------|----------|----------|
| Hydrostatic burst | Verify strength | 3 | 1 week |
| Ambient cycles | Fatigue at RT | 3 | 4-6 weeks (11,000 cycles) |
| Extreme temp cycles | Hot/cold cycling | 1 | 2 weeks |
| Drop test | Impact resistance | 1 | 1 day |
| Fire/bonfire | Fire survival | 1 | 1 day |
| Gunshot | Penetration | 1 | 1 day |
| Chemical exposure | Fluid resistance | 1 | 2 weeks |
| Permeation | H₂ leakage | 1 | 4 weeks |

**What Sarah Experiences:**

The burst test is the big one.

> Day of burst test: Sarah watches the pressure gauge.
> 
> 1,000 bar... 1,200 bar... 1,400 bar...
> 
> "Come on... 1,575 minimum..."
> 
> 1,500 bar... 1,550 bar... 1,600 bar...
> 
> BANG!
> 
> "1,634 bar! We passed!"
> 
> Relief. But also: FEA predicted 1,620 bar. Pretty close, but she got lucky.

If burst had been 1,500 bar (below 1,575 required):
- Redesign required
- 3-6 months additional delay
- €50,000+ additional cost

**Time spent:** 16 weeks

---

## Phase 13: Certification (Weeks 67-74)

**Paperwork Mountain**

**What Sarah Does:**

1. **Compiles documentation:**
   
   - Design specification
   - Analysis reports
   - Manufacturing specification
   - Test reports
   - Traceability matrix

2. **Submits to certification body:**
   
   - TÜV, DNV, or similar
   - €20,000-50,000 in fees

3. **Responds to queries:**
   
   Certification engineer asks questions:
   - "Justify the safety factor used"
   - "Explain the dome geometry selection"
   - "Provide material test certificates"
   - "Clarify the FEA boundary conditions"

4. **Site audit:**
   
   Auditor visits manufacturing facility

5. **Receives type approval:**
   
   Certificate valid for specific design, manufacturing site, materials

**Time spent:** 8 weeks

---

## Project Summary

**Timeline:**
- Start to type approval: 18 months (target was 18 months ✓)
- Actually typical: 20-24 months with delays

**Costs:**
- Engineering time: 3,000+ hours × €75/hr = €225,000
- Software licenses: €60,000/year
- Prototypes: €150,000
- Testing: €80,000
- Certification: €40,000
- **Total development: ~€500,000**

**What Sarah Knows:**
- The design works (it passed testing)
- The design is probably not optimal
- She explored ~40 designs out of millions possible
- FEA was close to test (±2%) - lucky
- Next project will be similar effort

**What Sarah Doesn't Know:**
- Is this the lightest design possible?
- What's the actual reliability (probability of failure)?
- How sensitive is the design to manufacturing variation?
- What would happen if requirements changed slightly?
- Could she have found a better answer faster?

---

## The Agent Opportunity

**Where AI Changes Everything:**

| Phase | Current | With Agent | Savings |
|-------|---------|------------|---------|
| Requirements | 2 weeks manual | Hours | 90% |
| Concept | 2 weeks experience | Minutes with trade-offs | 95% |
| Dome geometry | 4 weeks struggle | Hours with validation | 95% |
| Sizing | 2 weeks | Included in optimization | 100% |
| Winding sim | 4 weeks | Hours | 90% |
| FEA setup | 4 weeks | Hours (automated) | 95% |
| **Iteration hell** | **12 weeks** | **Days (surrogates + optimization)** | **95%** |
| Burst prediction | 4 weeks | Minutes (with validation FEA) | 90% |
| Thermal | 4 weeks | Included from start | 50% |
| Documentation | Throughout | Auto-generated | 80% |

**The Key Insight:**

The iteration loop (Phase 7) is where engineers spend most of their time and where optimization doesn't happen because it's too slow.

With surrogate models:
- 1 FEA run → train surrogate
- 1,000,000 surrogate evaluations per second
- Multi-objective optimization
- Pareto frontier of weight/cost/reliability trade-offs
- Engineer CHOOSES from optimal options

**Not "here's a design."**
**"Here are the optimal trade-offs. Which do you want?"**

---

## What The Agent Delivers

**To Sarah, the design engineer:**

Instead of 12 weeks of iteration hell, she sees:

```
Requirements processed: 700 bar, 150L, 80kg target, marine, 15yr

Tank type recommendation: Type IV (HDPE liner, carbon/epoxy)
Rationale: Weight target requires Type IV. Type V possible but 
unproven for marine certification.

Optimization complete: 847,000 designs evaluated

Pareto frontier:

| Design | Weight | Burst | Cost | P(fail) | Trade-off |
|--------|--------|-------|------|---------|-----------|
| A | 74 kg | 1,590 bar | €14,200 | 8×10⁻⁶ | Lightest |
| B | 77 kg | 1,650 bar | €13,800 | 2×10⁻⁶ | Balanced |
| C | 79 kg | 1,720 bar | €13,500 | 6×10⁻⁷ | Recommended |
| D | 82 kg | 1,810 bar | €13,200 | 1×10⁻⁷ | Conservative |
| E | 86 kg | 1,900 bar | €12,900 | 2×10⁻⁸ | Maximum margin |

Recommendation: Design C
- 1% under weight target
- 9% burst margin
- 10% under cost target
- Reliability 5× better than requirement

Would you like to:
1. See detailed design C specifications
2. Compare any two designs
3. Explore different trade-offs
4. Proceed to validation FEA
```

Then validation FEA confirms the surrogate prediction (±5%).

Then documentation is auto-generated.

Then through-life monitoring plan is created.

**This is the product.**
