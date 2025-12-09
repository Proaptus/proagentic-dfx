# Q13 Appendix: Risks, Assurance and Explainability

**Status**: OPTIONAL (but recommended for 9-10 score)
**Format**: PDF
**Max Size**: 10MB
**Max Pages**: 2 A4 pages

---

## Purpose

> Materials that summarise key risks, assurance activities or how you present explainability to users

---

## Suggested Content

### Page 1: Risk Register and Assurance

- [ ] **Risk Register**
  | ID | Risk | Category | L | I | Score | Mitigation | Status |
  |----|------|----------|---|---|-------|------------|--------|
  | R1 | FEA accuracy issues | Technical | M | H | 6 | Benchmark validation | Mitigated |
  | R2 | Geometry generation failures | Technical | M | H | 6 | Constrained patterns | Mitigated |
  | R3 | Demo reliability | Delivery | L | C | 8 | Offline-capable | Mitigated |
  | R4 | Scope creep | Delivery | H | M | 6 | Strict scope control | Active |
  | R5 | Data quality (materials) | Data | L | M | 3 | Validated database | Mitigated |
  | R6 | Misuse (unsafe designs) | Safety | L | H | 4 | Human-in-loop | Mitigated |

  *L = Likelihood (L/M/H), I = Impact (L/M/H/C), Score = L×I*

- [ ] **Assurance Activities Matrix**
  | Activity | Description | Evidence |
  |----------|-------------|----------|
  | Benchmark testing | FEA results vs manual analysis | <10% error achieved |
  | Edge case testing | 20 boundary conditions tested | 95% pass rate |
  | User testing | 5 engineers tested UI | Positive feedback |
  | Standards review | Compliance against ISO, DNV | Checklist complete |
  | Code review | Security and quality review | No critical issues |

### Page 2: Explainability and Compliance

- [ ] **Explainability Screenshot**
  - Decision rationale panel from UI
  - Shows: "Selected welded plate design because..."
  - Standards citations visible
  - Trade-off reasoning displayed

- [ ] **Decision Audit Trail Example**
  ```
  Decision: Select Welded Plate Design
  Timestamp: 2026-02-15 14:32:00
  Agent: OPT-AGENT

  Reasoning:
  - Meets frequency requirement (68 Hz > 50 Hz threshold)
  - Within cost target (£145 < £200 limit)
  - Safety factor adequate (2.1 > 1.5 minimum)

  Standards Applied:
  - EN 1993-1-1: Steel structure design
  - ISO 12944-2: Corrosivity class C5-M
  - DNV-ST-0126: Offshore structural design

  Human Review Required: Yes
  Approved By: [Engineer name]
  ```

- [ ] **Standards Compliance Checklist**
  | Standard | Scope | Status | Notes |
  |----------|-------|--------|-------|
  | ISO 9001 | Quality management | Partial | Process documented |
  | EN 1993-1-1 | Steel structures | Applied | Built into FEA |
  | ISO 12944 | Corrosion protection | Applied | Material selection |
  | DNV-ST-0126 | Offshore structures | Applied | Load factors |
  | ISO 1101 | GD&T | Planned | Tolerancing module |

- [ ] **Data Security Summary**
  - No personal data processed
  - Material data from validated sources
  - Audit logging enabled
  - Access control implemented
  - UK-hosted (or planned)

---

## Design Guidelines

- Risk register should use standard format (likelihood × impact)
- Colour-code risks by severity (red/amber/green)
- Explainability screenshot should be actual UI output
- Standards compliance should be honest about gaps
- Show how human stays in control

---

## Source Files

Place source files in this folder:
- [ ] `risk_register.xlsx`
- [ ] `explainability_screenshot.png`
- [ ] `standards_checklist.xlsx`
- [ ] `Q13_APPENDIX.pdf` (final output)

---

## Checklist Before Submission

- [ ] Risk register with clear mitigations
- [ ] Assurance activities documented
- [ ] Explainability screenshot/example
- [ ] Decision audit trail shown
- [ ] Standards compliance status
- [ ] Data/security considerations
- [ ] PDF is under 10MB
- [ ] Maximum 2 A4 pages
- [ ] Professional formatting
