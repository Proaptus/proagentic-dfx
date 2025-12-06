# DfX Agents Moonshot Analysis
## Capability Transferability Study

### The Question
If we build an agent for ONE domain, how many OTHER domains can it solve with minimal additional training?

---

## Capability Clusters Identified

I've decomposed all 6 options into ~30 distinct engineering capabilities, grouped into 6 clusters:

| Cluster | Capabilities | Example Tools |
|---------|-------------|---------------|
| **A: Pressure/Structural** | Thick/thin wall analysis, buckling, nozzle reinforcement, supports, fatigue | FEA, ASME calcs, WRC |
| **B: Thermal/Multi-Physics** | Heat transfer, fluid flow, coupled thermal-structural | CFD correlations, conjugate heat |
| **C: Composite** | Layup design, ply optimisation, drape analysis, damage tolerance | CLT, FEA laminate |
| **D: Manufacturing** | Weld design, NDE planning, sequence planning, sheet metal | DfM rules, WPS generation |
| **E: Compliance** | Code checking, documentation, certification packages | Standards lookup, report gen |
| **F: Specialised** | Through-life monitoring, aeroelastics, electrical isolation | Domain-specific |

---

## Option Scoring by Cluster Coverage

| Option | A | B | C | D | E | F | Clusters | Transfer Breadth |
|--------|---|---|---|---|---|---|----------|------------------|
| **H2 Tank** | ✓ | - | ✓ | ✓ | ✓ | ✓ (monitoring) | **5/6** | **Very High** |
| Heat Exchanger | ½ | ✓ | - | ✓ | - | - | 2.5/6 | High (thermal) |
| Composite Airframe | - | - | ✓ | ✓ | ✓ | ✓ (aero) | 3/6 | Medium |
| Pressure Vessel | ✓ | - | - | ✓ | ✓ | - | 3/6 | High (industrial) |
| Battery Module | ½ | ✓ | - | ✓ | - | ✓ (elec) | 3/6 | Medium (EV focus) |
| Marine Components | ✓ | - | - | ✓ | ✓ | - | 3/6 | Medium-Low |

---

## The Winner: Hydrogen Storage Tank

### Why H2 Tank Maximises Capability Reuse

**It's the ONLY option that requires:**
- Metal pressure vessel design (Type I/II) → transfers to all pressure equipment
- Composite overwrap design (Type III/IV) → transfers to all composite structures  
- Multi-material interfaces (liner/boss/composite) → complex assembly skills
- Extreme environment materials (cryogenic to high pressure) → premium capability
- Full regulatory compliance (ISO 11119, EN 12245, ASME) → framework for any code
- Through-life monitoring planning → **YOUR UNIQUE DIFFERENTIATOR (Sentry)**

### Domains Unlocked from H2 Tank Agent

| Domain | What Transfers Directly | Additional Effort |
|--------|------------------------|-------------------|
| **Any Pressure Vessel** | Analysis engine, compliance framework | Swap code reference |
| **CNG/LNG Tanks** | 95% identical workflow | Fluid property table |
| **Composite Wind Blades** | Layup + ply optimisation engine | Aero load inputs |
| **Aerospace Fuel Tanks** | Multi-material, compliance | AS standards |
| **Cryogenic Dewars** | Thermal + materials engine | Minimal |
| **Process Columns/Reactors** | Pressure + nozzles + compliance | Add internals |
| **Nuclear Vessels** | Full pressure + compliance | Nuclear codes |
| **Subsea Equipment** | Pressure + external + compliance | API/DNV |
| **Medical Gas Storage** | Pressure + compliance | FDA/MDR |
| **Industrial Gas Cylinders** | Core workflow identical | ISO 9809 |

### Industries Addressable

1. **Hydrogen/Energy Transition** - Primary market
2. **Oil & Gas** - Separators, vessels, tanks
3. **Chemical/Process** - Reactors, columns, storage
4. **Aerospace** - Fuel systems, pressurised structures
5. **Nuclear** - Primary/secondary systems
6. **Marine/Subsea** - Pressure housings, tanks
7. **Renewables** - Wind blade structures
8. **Automotive** - Fuel systems, pressure vessels
9. **Medical** - Gas storage, sterilisation
10. **Industrial Gases** - Storage and transport

---

## The Sentry Integration Advantage

**No other DfX system considers through-life**

When our agent designs a tank, it also:
- Identifies critical inspection points
- Recommends sensor locations for condition monitoring
- Defines inspection intervals based on damage tolerance
- Generates through-life monitoring specification

This is **unique** and directly leverages your Sentry acoustic monitoring work.

---

## Fallback Positions

If H2 Tank proves too ambitious for the timeline:

### Fallback 1: General Pressure Vessel
- Drop composite capability (Type I/II only)
- Still builds Clusters A, D, E
- Still unlocks process, O&G, chemical, nuclear
- Reduced scope, proven physics

### Fallback 2: Heat Exchanger  
- Different physics (thermal focus)
- Builds Clusters B, D
- Strong optimisation loop demo
- Growing data centre cooling market

### Fallback 3: Simple Bracket (Current Tier 1)
- Proves the framework works
- Minimal market differentiation
- Not competitive for the prize

---

## Capability Stack Visualisation

```
                    ┌─────────────────────────────────────┐
                    │        H2 TANK (MOONSHOT)           │
                    │  Composite + Metal + Cryo + Monitor │
                    └─────────────────────────────────────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            │                        │                        │
            ▼                        ▼                        ▼
    ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
    │   COMPOSITE   │       │   PRESSURE    │       │  COMPLIANCE   │
    │   STRUCTURES  │       │   EQUIPMENT   │       │   FRAMEWORK   │
    │               │       │               │       │               │
    │ Wind Blades   │       │ Vessels       │       │ ANY regulated │
    │ Aerospace     │       │ Reactors      │       │ industry      │
    │ Marine        │       │ Pipework      │       │               │
    │ Automotive    │       │ Tanks         │       │               │
    └───────────────┘       └───────────────┘       └───────────────┘
            │                        │                        │
            └────────────────────────┼────────────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │    THROUGH-LIFE MONITORING      │
                    │    (Sentry Integration)         │
                    │    Unique Differentiator        │
                    └─────────────────────────────────┘
```

---

## Recommendation

**Go for H2 Tank as the moonshot.**

Even if we only achieve 70% of the vision, we land with:
- Working pressure vessel agent (huge market)
- Compliance automation framework (transfers everywhere)
- Manufacturing planning capability (universal value)
- Through-life monitoring USP (no competition)

The framework we build IS the product. H2 Tank is the forcing function to build the most complete, transferable version.

---

## Next Steps

1. Define H2 Tank workflow in detail (what the agent actually does step by step)
2. Identify minimum viable tool set for demo
3. Map to challenge evaluation criteria
4. Build demo scenario (specific tank design problem)

Ready to proceed?
