---
id: ANALYSIS-RTM-ACTION-001
doc_type: explanation
title: "Duplicate Requirements - Action Plan"
status: accepted
last_verified_at: 2025-12-08
owner: "@h2-tank-team"
related_docs:
  - "docs/analysis/rtm/DUPLICATE_REQUIREMENTS_REPORT.md"
  - "docs/analysis/rtm/DUPLICATES_SUMMARY.txt"
keywords: ["rtm", "duplicates", "requirements", "action plan"]
---

# Duplicate Requirements - Action Plan

## Overview
- **Total Requirements:** 430
- **Duplicates/Overlaps Found:** ~78 (18%)
- **Reduction Potential:** 30-40 requirements
- **Estimated Final Count:** 390-400 distinct requirements

---

## Priority 0: Immediate Merges (Sprint 1)

### 1. Monte Carlo Mega-Duplicate
**Impact:** Eliminate 6 requirements
```
MERGE: REQ-076, 160, 239, 261, 356, 379, 388 -> REQ-MC-UNIFIED

New Requirement Structure:
- UI Display: Histogram, P(failure), confidence intervals (REQ-076)
- Backend Execution: 1M samples, parallel processing with rayon (REQ-356, 379)
- Physics Formula: P(failure) = (1/N)*Sum I(design fails) (REQ-239)
- Generic Interface: Domain-agnostic Monte Carlo (REQ-261)
- Mock Server: Simulated results (REQ-160)
- Export: JSON output (REQ-388)
```

**Savings:** 6 requirements -> 1 composite requirement

### 2. STEP Export Triple-Duplicate
**Impact:** Eliminate 2 requirements
```
MERGE: REQ-111, 214, 314 -> REQ-STEP-EXPORT-UNIFIED

New Requirement Structure:
- User Feature: Download button, file export (REQ-111)
- Frontend CAD: OpenCascade.js STEP writer with metadata (REQ-214)
- Backend CAD: Truck STEP serialization (ISO 10303-21) (REQ-314)
- Formats: AP203/AP214 with proper units
```

### 3. STEP Import Duplicate
**Impact:** Eliminate 1 requirement
```
MERGE: REQ-213, 313 -> REQ-STEP-IMPORT-UNIFIED
```

### 4. Backend Schema Compliance
**Impact:** Eliminate 1 requirement
```
MERGE: REQ-186, 187 -> REQ-BACKEND-OPENAPI-COMPLIANCE
```

### 5. Performance Timing Target
**Impact:** Eliminate 1 requirement
```
MERGE: REQ-130, 359 -> Single requirement
```

**Sprint 1 Total Savings:** 11 requirements eliminated

---

## Priority 1: Review & Clarify (Sprint 2)

### CAD Frontend/Backend Duplicates
**Action:** Clarify layer separation OR merge if truly identical

| Pair | REQ IDs | Decision Needed |
|------|---------|-----------------|
| Parametric Geometry | REQ-216, 323 | OpenCascade.js vs Truck - same feature? |
| Multi-Body Assembly | REQ-220, 320 | Frontend viz vs Backend assembly - merge? |
| B-rep Modeling | REQ-212, 311 | OpenCascade vs Truck kernel choice |

**Potential Savings:** 0-3 requirements

---

## Total Estimated Impact

| Phase | Savings | Confidence |
|-------|---------|------------|
| Sprint 1 (Immediate Merges) | 11 requirements | HIGH |
| Sprint 2 (Review & Clarify) | 0-7 requirements | MEDIUM |
| Sprint 3 (Document Dependencies) | 0 requirements | N/A |
| Sprint 4 (API Endpoint Review) | 5-15 requirements | LOW |
| **TOTAL** | **16-33 requirements** | |

**Final RTM Size:** 397-414 requirements (down from 430)

---

## Process Improvements

### Adopt Layered Requirement Pattern
```
REQ-STEP-EXPORT: STEP File Export (ISO 10303-21)
|- UI Layer:       Download button, format selection
|- Frontend Layer: OpenCascade.js STEP writer
|- Backend Layer:  Truck STEP serialization
|- Data Layer:     Binary STEP file format
|- Mock Layer:     Static STEP file samples
```

### Add Dependency Field to RTM
New columns:
- `Depends_On`: List of prerequisite REQ IDs
- `Depended_By`: List of dependent REQ IDs
- `Layer`: UI | Backend | Data | Mock | Physics | Export

---

## Implementation Timeline

**Week 1:** Sprint 1 - Immediate merges (11 requirements eliminated)
**Week 2:** Sprint 2 - CAD duplicates review (0-7 requirements)
**Week 3:** Sprint 3 - Add dependency notation to RTM
**Week 4:** Sprint 4 - API endpoint scope review (5-15 requirements)

**Total Duration:** 4 weeks
**Expected Outcome:** 397-414 clean, distinct requirements with clear dependencies
