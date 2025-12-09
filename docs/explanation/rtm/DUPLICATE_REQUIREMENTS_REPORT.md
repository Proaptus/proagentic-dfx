---
doc_type: explanation
title: "Duplicate Requirements Analysis Report"
version: 1.0.0
date: 2025-12-09
owner: "@h2-tank-team"
status: accepted
last_verified_at: 2025-12-09
---
# Duplicate Requirements Analysis Report
## H2 Tank Designer Requirements Traceability Matrix

**Date:** 2025-12-08
**Total Requirements Analyzed:** 430
**Analysis Method:** Automated similarity detection + manual verification

---

## Executive Summary

This analysis identified **27 duplicate groups** containing **78+ requirements** that are either:
- Exact or near-exact duplicates (85%+ similarity)
- Functional duplicates across architectural layers
- Overlapping scope on same functionality

### Key Findings:
1. **Frontend/Backend Split Pattern**: 15+ requirements duplicated across UI and backend implementation
2. **Monte Carlo Mega-Duplicate**: 7 requirements describing the same Monte Carlo reliability analysis
3. **STEP Export Triple-Duplicate**: 3 requirements for the same STEP file export feature
4. **Stress Calculation Duplicates**: Multiple requirements for hoop/axial stress calculations
5. **API Endpoint Over-specification**: Some endpoints have 20+ requirements (potential scope overlap)

---

## CRITICAL DUPLICATES (High Priority - Merge Recommended)

### 1. Monte Carlo Reliability Analysis - 7 DUPLICATES âš ï¸
**RECOMMENDATION: MERGE into single requirement with implementation notes**

| Req ID | Category | Description | Layer |
|--------|----------|-------------|-------|
| REQ-076 | Reliability | Monte Carlo results display | UI Display |
| REQ-160 | Simulator | Monte Carlo sampling simulation | Mock Server |
| REQ-239 | Physics-Core | Monte Carlo reliability: P(failure) = (1/N)Ã—Î£ I(design fails) | Physics Calc |
| REQ-261 | Multi-Domain | Domain-agnostic reliability/Monte Carlo interface | Generic Interface |
| REQ-356 | Workflow | Monte Carlo reliability analysis (1M samples) | Workflow Step |
| REQ-379 | Physics-Rust | rayon for parallel iteration in Monte Carlo | Backend Implementation |
| REQ-388 | Export-Package | Reliability analysis JSON with Monte Carlo results | Export Output |

**Issue:** Same Monte Carlo analysis described 7 times across different architectural concerns.

**Proposed Solution:**
```
NEW REQ-MC-001: Monte Carlo Reliability Analysis System
- UI: Display results (histogram, P(failure), confidence intervals)
- Backend: Execute 1M samples with parallel processing (rayon)
- Physics: P(failure) = (1/N)Ã—Î£ I(design fails)
- Export: JSON output with distribution data
- Mock: Simulated results for testing
```

---

### 2. STEP File Export - 3 DUPLICATES âš ï¸
**RECOMMENDATION: MERGE into single requirement**

| Req ID | Category | Description | Context |
|--------|----------|-------------|---------|
| REQ-111 | Export | STEP file export | User-facing export feature |
| REQ-214 | CAD-Export | STEP file export with proper units and metadata | Frontend CAD implementation |
| REQ-314 | CAD-Truck | STEP file export with proper schema and units | Backend Truck implementation |

**Issue:** Same STEP export feature specified 3 times.

**Proposed Solution:**
```
NEW REQ-CAD-STEP-EXPORT: STEP File Export (ISO 10303-21 AP203/AP214)
- Frontend: User download button (REQ-111)
- Frontend CAD: OpenCascade.js export with metadata (REQ-214)
- Backend: Truck CAD kernel STEP serialization (REQ-314)
- Output: Proper units, schema selection, validation
```

---

### 3. STEP File Import - 2 DUPLICATES
**RECOMMENDATION: MERGE into single requirement**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-213 | CAD-Import | STEP file import with geometry validation |
| REQ-313 | CAD-Truck | STEP file import (ISO 10303-21 AP203/AP214) |

**Proposed Solution:**
```
NEW REQ-CAD-STEP-IMPORT: STEP File Import System
- Frontend: File upload UI with validation progress (REQ-213)
- Backend: Truck STEP parser (ISO 10303-21) (REQ-313)
- Validation: Geometry integrity checks
```

---

### 4. Parametric Geometry Updates - 2 DUPLICATES
**RECOMMENDATION: MERGE or clarify layer separation**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-216 | CAD-Parametric | Parametric geometry updates with constraint solver |
| REQ-323 | CAD-Truck | Parametric geometry updates with constraint solving |

**Issue:** Identical functionality, same description, different categories.

---

### 5. Multi-Body Assembly - 2 DUPLICATES
**RECOMMENDATION: MERGE or clarify layer separation**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-220 | CAD-Assembly | Multi-body assembly visualization (liner + composite + bosses) |
| REQ-320 | CAD-Truck | Multi-body assembly (liner + composite + boss) |

**Issue:** Same assembly feature specified twice.

---

### 6. B-rep Solid Modeling - 2 DUPLICATES
**RECOMMENDATION: MERGE or clarify frontend vs backend**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-212 | CAD-Core | B-rep (Boundary Representation) solid geometry modeling |
| REQ-311 | CAD-Truck | Truck CAD kernel integration for B-rep solid modeling |

**Issue:** Same B-rep modeling requirement for different CAD kernels (OpenCascade vs Truck).

---

### 7. Netting Theory Initial Sizing - 2 DUPLICATES
**RECOMMENDATION: CLARIFY - One is display, one is calculation**

| Req ID | Category | Description | Purpose |
|--------|----------|-------------|---------|
| REQ-023 | Sizing | Netting theory initial sizing display | UI Display (P2, Deferred) |
| REQ-353 | Workflow | Netting theory initial sizing step | Backend Calculation (P1, Gap) |

**Issue:** May be intentionally separate (display vs compute), but descriptions are 92% similar.

**Recommendation:** If REQ-023 is just UI for REQ-353 output, merge or note dependency.

---

### 8. Requirements to Pareto Timing Target - 2 DUPLICATES
**RECOMMENDATION: MERGE**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-130 | Performance | Requirements to Pareto under 60 seconds |
| REQ-359 | Workflow | Requirements to Pareto under 60 seconds total |

**Issue:** Identical performance target stated twice.

---

### 9. Hoop Stress Calculation - 2 DUPLICATES
**RECOMMENDATION: CLARIFY - Display vs Physics Engine**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-042 | FEA-Results | Hoop stress distribution |
| REQ-231 | Physics-Core | Hoop stress calculation from first principles: Ïƒ_hoop = PR/t |

**Analysis:** REQ-042 is display, REQ-231 is calculation. Keep separate but note dependency.

---

### 10. Axial Stress Calculation - 2 DUPLICATES
**RECOMMENDATION: CLARIFY - Display vs Physics Engine**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-043 | FEA-Results | Axial stress distribution |
| REQ-232 | Physics-Core | Axial stress calculation from first principles: Ïƒ_axial = PR/2t |

**Analysis:** REQ-043 is display, REQ-232 is calculation. Keep separate but note dependency.

---

### 11. Von Mises Stress - 2 DUPLICATES
**RECOMMENDATION: CLARIFY - Display vs Simulator**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-041 | FEA-Results | Stress contour plot (von Mises) |
| REQ-157 | Simulator | Von Mises stress field generation |

**Analysis:** REQ-041 is visualization, REQ-157 is mock server simulation. Keep separate.

---

### 12. Surrogate Model Confidence - 2 DUPLICATES
**RECOMMENDATION: MERGE**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-090 | Validation | Surrogate model confidence display |
| REQ-176 | Data-Schema | SurrogateConfidence schema |

**Issue:** One is UI display, one is data schema for same feature. Should reference each other.

---

### 13. Test Plan Generation - 2 DUPLICATES
**RECOMMENDATION: MERGE**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-094 | Testing | Test plan generation |
| REQ-177 | Data-Schema | TestPlan schema |

**Issue:** One is feature, one is data schema for same feature.

---

### 14. Backend Schema Matching - 2 NEAR-DUPLICATES (87% similar)
**RECOMMENDATION: MERGE**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-186 | Backend-Contract | Real backend must match request schemas |
| REQ-187 | Backend-Contract | Real backend must match response schemas |

**Issue:** Both about backend schema compliance. Could be single requirement: "Real backend must match OpenAPI schemas (request & response)".

---

### 15. Tsai-Wu Failure Index - 2 DUPLICATES
**RECOMMENDATION: CLARIFY - Display vs Calculation**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-047 | FEA-Results | Tsai-Wu failure index display |
| REQ-235 | Physics-Core | Tsai-Wu failure index per layer: Fâ‚Ïƒâ‚+Fâ‚‚Ïƒâ‚‚+Fâ‚â‚Ïƒâ‚Â²+Fâ‚‚â‚‚Ïƒâ‚‚Â²+Fâ‚†â‚†Ï„â‚â‚‚Â²+2Fâ‚â‚‚Ïƒâ‚Ïƒâ‚‚<1 |

**Analysis:** REQ-047 is display, REQ-235 is calculation formula. Keep separate but note dependency.

---

## MODERATE DUPLICATES (Review Recommended)

### 16. Compliance Checking - 4 RELATED REQUIREMENTS
**RECOMMENDATION: REVIEW for scope overlap**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-084 | Compliance | Standards compliance status |
| REQ-262 | Multi-Domain | Generic compliance checker with swappable standards databases |
| REQ-357 | Workflow | Standards compliance rule engine |
| REQ-392 | Export-Package | Standards compliance checklist PDF |

**Issue:** May represent different aspects (display, engine, export) or may be duplicates.

---

### 17. Optimization Progress - 2 RELATED
**RECOMMENDATION: REVIEW**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-058 | Optimization | Live optimization progress display |
| REQ-150 | API-Contract | Server-Sent Events for optimization progress |

**Analysis:** REQ-058 is UI feature, REQ-150 is API protocol. Keep separate.

---

### 18. Mesh/Tessellation - 4 RELATED
**RECOMMENDATION: REVIEW**

| Req ID | Category | Description |
|--------|----------|-------------|
| REQ-037 | FEA-Setup | Mesh visualization (P2, Deferred) |
| REQ-038 | FEA-Setup | Mesh density at dome-cylinder transition (P3, Deferred) |
| REQ-316 | CAD-Truck | Tessellation to triangle mesh for visualization |
| REQ-397 | Export-Package | High-resolution mesh STL for 3D printing/tooling |

**Analysis:** Different aspects of meshing. Verify no overlap.

---

## API ENDPOINT OVER-SPECIFICATION (Potential Scope Overlap)

Multiple requirements share the same API endpoint, which may indicate:
- Proper decomposition of a complex feature, OR
- Duplicate specifications of the same functionality

### High-Risk Endpoints (20+ requirements each):

1. **GET /api/designs/{id}/geometry** - 26 requirements
   - REVIEW: Are these 26 distinct features or overlapping specifications?

2. **GET /api/designs/{id}/stress** - 21 requirements
   - REVIEW: Verify each represents unique functionality

3. **GET /api/designs/{id}/reliability** - 16 requirements
   - HIGH RISK: Includes the Monte Carlo mega-duplicate (see above)

4. **All endpoints** - 11 requirements
   - General API infrastructure requirements (likely OK)

### Recommendation:
For each endpoint with 15+ requirements, conduct scope review to ensure:
- No duplicate specifications
- Clear distinction between UI, data schema, backend implementation, and testing requirements

---

## PATTERN: Frontend/Backend Layer Confusion

**Issue:** Many requirements duplicate functionality across architectural layers without clear separation.

### Examples:
- CAD operations specified separately for:
  - Frontend (OpenCascade.js)
  - Backend (Truck CAD kernel)
  - Export output
  - Mock server simulation

### Recommendation:
Adopt consistent pattern:
```
REQ-XXX-SYSTEM: [Feature Name]
  - UI: [Frontend behavior]
  - Backend: [Server implementation]
  - Data: [Schema/API]
  - Mock: [Test data mode]
```

This reduces 4 requirements to 1 composite requirement.

---

## DATA MODE INCONSISTENCIES

No major data mode inconsistencies found. Same API endpoints generally have consistent data modes.

---

## SUMMARY STATISTICS

| Finding | Count |
|---------|-------|
| Exact duplicates (100% match) | 0 |
| Near duplicates (85%+ match) | 6 groups |
| Functional duplicates (same feature, different layer) | 15+ pairs |
| Monte Carlo mega-duplicate | 7 requirements |
| STEP export duplicates | 3 requirements |
| Frontend/Backend splits | 15+ requirements |
| API endpoints with 15+ requirements | 4 endpoints |

**Total requirements affected:** ~78 (18% of total)

---

## RECOMMENDATIONS

### Immediate Actions (High Priority):

1. **MERGE REQ-076, 160, 239, 261, 356, 379, 388** â†’ Single Monte Carlo requirement
2. **MERGE REQ-111, 214, 314** â†’ Single STEP export requirement
3. **MERGE REQ-213, 313** â†’ Single STEP import requirement
4. **MERGE REQ-186, 187** â†’ Single backend schema compliance requirement
5. **MERGE REQ-130, 359** â†’ Single performance target requirement

### Process Improvements:

1. **Adopt Layered Requirement Pattern:**
   - Use composite requirements that specify UI, Backend, Data, Mock in one place
   - Reduces duplication across architectural layers

2. **API Endpoint Review:**
   - For endpoints with 15+ requirements, verify distinct scope
   - Consider grouping related UI elements

3. **Dependency Notation:**
   - Where separation is valid (e.g., display vs calculation), note dependencies explicitly
   - Example: REQ-042 "depends on REQ-231 for calculation"

4. **Category Consistency:**
   - Physics-Core vs FEA-Results: Clarify when to use each
   - Simulator vs actual implementation: Mark simulation requirements clearly

---

## FILES GENERATED

1. `analyze_duplicates.py` - Similarity detection script
2. `detailed_duplicates.py` - Functional duplicate analyzer
3. `DUPLICATE_REQUIREMENTS_REPORT.md` - This report

---

**End of Report**

