# Q10 Appendix: Technical Approach Diagrams

**Status**: REQUIRED
**Format**: PDF
**Max Size**: 10MB
**Max Pages**: 2 A4 pages

---

## Purpose

> Diagrams, tables or other visuals that help explain technical approach and system performance

---

## Required Content

### Page 1: System Architecture

- [ ] **Agent Pipeline Diagram**
  - Show all 8 agents: REQ → CONCEPT → GEOM → FEA → DFM → COST → OPT → DOC
  - Data flows between agents
  - Key inputs and outputs at each stage
  - Technology stack labels (CadQuery, CalculiX, etc.)

- [ ] **Agent Roles Table**
  | Agent | Input | Output | Technology |
  |-------|-------|--------|------------|
  | REQ-AGENT | NL requirements | Structured JSON | LLM, SPR |
  | CONCEPT-AGENT | Requirements | 2-5 concepts | LLM, Material DB |
  | GEOM-AGENT | Concepts | STEP, glTF | CadQuery |
  | FEA-AGENT | STEP, loads | Stress, displacement | Gmsh, CalculiX |
  | DFM-AGENT | STEP, process | DfM report | LLM, Rule Engine |
  | COST-AGENT | STEP, material | Cost breakdown | Cost Model |
  | OPT-AGENT | All designs | Ranked options | SciPy, Optuna |
  | DOC-AGENT | All data | PDF reports | ReportLab |

### Page 2: Performance Validation

- [ ] **Benchmark Comparison Table**
  | Test Case | Manual FEA (MPa) | Our System (MPa) | Difference |
  |-----------|------------------|------------------|------------|
  | Simple bracket | X | Y | Z% |
  | L-bracket | X | Y | Z% |
  | Mounting plate | X | Y | Z% |

- [ ] **Performance Metrics**
  | Metric | Target | Achieved |
  |--------|--------|----------|
  | CAD generation success | >95% | X% |
  | FEA accuracy | <10% error | X% |
  | End-to-end time | <5 min | X min |

- [ ] **Technology Stack Summary**
  - Development environment
  - Compute resources
  - Key libraries and versions

---

## Design Guidelines

- Use clear, professional diagrams (not hand-drawn)
- Consistent colour scheme (suggest ProAgentic brand colours)
- Legible font sizes (minimum 10pt)
- Include figure captions
- No excessive white space
- Maximum visual clarity with minimum clutter

---

## Source Files

Place source files (e.g., draw.io, Figma, SVG) in this folder:
- [ ] `architecture_diagram.drawio`
- [ ] `performance_table.xlsx`
- [ ] `Q10_APPENDIX.pdf` (final output)

---

## Checklist Before Submission

- [ ] Architecture diagram is clear and complete
- [ ] All 8 agents shown with data flows
- [ ] Performance metrics table included
- [ ] Benchmark results validated
- [ ] PDF is under 10MB
- [ ] Exactly 2 A4 pages
- [ ] Professional formatting
- [ ] All text is legible
