# Q12 Appendix: MVP and Deployment Diagrams

**Status**: REQUIRED
**Format**: PDF
**Max Size**: 10MB
**Max Pages**: 2 A4 pages

---

## Purpose

> Diagrams, summaries or tables that help show what MVP does and how it can be deployed or integrated

---

## Required Content

### Page 1: MVP Capabilities

- [ ] **MVP Feature Matrix**
  | Feature | Status | Evidence |
  |---------|--------|----------|
  | Natural language input | Working | Screenshot |
  | Requirements parsing | Working | JSON output |
  | Concept generation | Working | 3 options generated |
  | CAD generation (CadQuery) | Working | STEP files |
  | FEA analysis (CalculiX) | Working | Stress results |
  | DfM assessment | Working | DfM report |
  | Cost estimation | Working | Cost breakdown |
  | Optimisation/comparison | Working | Trade-off table |
  | Documentation output | Working | PDF reports |
  | 3D viewer (Three.js) | Working | Screenshot |

- [ ] **UI Screenshot**
  - Main interface with 3D viewer
  - Requirements input panel
  - Results display
  - Export options

- [ ] **Sample Outputs**
  - Mini screenshot of STEP file in viewer
  - Mini screenshot of analysis report
  - Trade-off comparison table

### Page 2: Deployment and V&V

- [ ] **Deployment Architecture**
  ```
  User Browser → React Frontend → Express API → Agent Pipeline
                                              ↓
                     ┌──────────────────────────────────────┐
                     │  CadQuery │ Gmsh │ CalculiX │ Reports │
                     └──────────────────────────────────────┘
  ```
  - Web-based SaaS model
  - Cloud deployment (AWS/Azure UK region)
  - API interfaces shown

- [ ] **Verification & Validation Results**
  | Test Type | Cases | Pass | Fail | Notes |
  |-----------|-------|------|------|-------|
  | CAD generation | 20 | 19 | 1 | Edge case documented |
  | FEA accuracy | 10 | 10 | 0 | Within 10% of manual |
  | End-to-end flow | 15 | 15 | 0 | All scenarios pass |
  | UI/UX testing | 5 | 5 | 0 | User feedback positive |

- [ ] **Known Limitations**
  | Limitation | Impact | Mitigation Plan |
  |------------|--------|-----------------|
  | Limited to P1 components | Scope constraint | Extend in Year 1 |
  | Single user mode | Demo only | Multi-tenant in production |
  | Manual material selection | User input needed | Auto-suggestion planned |

- [ ] **Gap Closure Plan**
  | Gap | Timeline | Resources |
  |-----|----------|-----------|
  | Production hardening | 3 months | Dev team |
  | Multi-tenant | 6 months | Cloud architect |
  | Enterprise PLM integration | 12 months | Partnership |

---

## Design Guidelines

- Screenshots should be high quality and legible
- Tables should fit on page without scrolling
- Deployment diagram should be clear and simple
- V&V results should look credible and quantified
- Show progression from MVP to production clearly

---

## Source Files

Place source files in this folder:
- [ ] `ui_screenshot.png`
- [ ] `deployment_diagram.drawio`
- [ ] `vv_results.xlsx`
- [ ] `sample_outputs/` (folder with examples)
- [ ] `Q12_APPENDIX.pdf` (final output)

---

## Checklist Before Submission

- [ ] MVP features clearly shown
- [ ] UI screenshot included
- [ ] Deployment architecture diagram
- [ ] V&V results table with quantified results
- [ ] Known limitations acknowledged
- [ ] Gap closure plan included
- [ ] PDF is under 10MB
- [ ] Exactly 2 A4 pages
- [ ] Professional formatting
- [ ] All screenshots legible
