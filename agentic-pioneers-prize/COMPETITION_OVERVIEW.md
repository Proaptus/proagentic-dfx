# Agentic AI Pioneers Prize - Development Phase (Phase 2)

## Competition Summary

| Field | Details |
|-------|---------|
| **Competition Name** | The Agentic AI Pioneers Prize - Development Phase |
| **Competition ID** | 2355 |
| **Phase** | Phase 2 (Development) |
| **Organiser** | Innovate UK (UKRI) in partnership with DSIT |
| **Total Prize Fund** | £1,000,000 |
| **Our Sector** | Advanced Manufacturing |
| **Our Challenge** | Detailed Design for X Agents |
| **Prize (Sector Winner)** | £250,000 |
| **Overall Winner Bonus** | £250,000 |
| **Project Duration** | 3 months |

## Our Application

| Field | Details |
|-------|---------|
| **Lead Organisation** | Proaptus Ltd |
| **Address** | 1 Derwent Business Centre, Clarke Street, Derby, England, DE1 2BU |
| **Founder/CEO** | Chinedu Achara |
| **Email** | chinedu@proaptus.co.uk |
| **Phase 1 Application Name** | ProAgentic: Multi-Agent AI Ecosystem |
| **EOI Application Number** | *TO BE ADDED* |

## Challenge Statement: Detailed Design for X Agents

### Official Description
> The solution must be an agentic AI system that supports multi-domain design and optimisation across performance, manufacturability and other design priorities.

### Required Capabilities (Must Do One or More)

1. **Run or mimic domain-specific design and analysis steps**, and link these smoothly across design, analysis and testing tools

2. **Create schematics, CAD models or simulations** using defined constraints, materials, manufacturing limits, tolerances, standards and written design rules

3. **Explain design choices**, show key trade-offs and describe the optimisation path, including uncertainty, so users can understand and challenge the results

4. **Support automatic design loops** that suggest and apply design improvements, using results from simulations and feedback from users

### Optional Focus Areas

- Build optimisation workflows or chains of agents that take high-level system requirements and turn them into clear, detailed design studies

- Include agents that handle a wider range of Design for X goals (sustainability, circular materials, ease of assembly, in-service inspection, automatic compliance/quality checks)

### Relevant Example Use Case
> **Hydrogen storage tank design**: Exploring materials, liners, bosses and geometric features across different tank types, for both gaseous and liquid Hydrogen and considering through-life monitoring

## Our Solution: ProAgentic DfX

ProAgentic DfX is a multi-agent AI ecosystem for Design for Excellence (DfX), starting with the H2 Tank Designer module for hydrogen storage tank design optimisation.

### Architecture Overview

- **8 Specialised Agents**: REQ, CONCEPT, GEOM, FEA, DFM, COST, OPT, DOC
- **Agent Pipeline**: Requirements → Concept → Geometry → Analysis → Manufacturing → Cost → Optimisation → Documentation
- **Human-in-Loop**: Design review checkpoints, validation gates, explainable AI outputs

### Key Differentiators

1. **Multi-Domain Integration**: Seamless flow between requirements, CAD, FEA, DFM, and cost analysis
2. **Explainable Optimisation**: Clear trade-off visualisation and decision rationale
3. **Standards Compliance**: Built-in checks against ISO 11119, UN GTR 13, and industry standards
4. **Modular Architecture**: H2 Tank Designer is first module; platform supports future domain modules

## Eligibility Requirements (Confirmed)

- [x] Successful in Phase 1 EOI (invited to apply)
- [x] Developed agentic AI solution addressing published challenge statement
- [x] Built on proprietary, IP-owned codebase
- [x] Commit to all activities within UK
- [x] Intend to exploit results in/from UK

## Key Documents

| Document | Location |
|----------|----------|
| Competition Brief | `requirements_spec/dfx-competition-requirements.json` |
| Solution Specification | `requirements_spec/dfx-solution-specification.json` |
| Phase 1 Application | `project_source_pdf/phase1_application.pdf` |
| Assessor Guidance | `project_source_pdf/agentic_aI_assessor_guideance_for_applicants.pdf` |
| Phase 2 Application Form | `project_source_pdf/Print application - Innovation Funding Service.pdf` |

## Application Structure

### Unscored Questions (Q1-Q9)
Administrative and eligibility questions (location, permits, consortium, etc.)

### Scored Questions (Q10-Q15)
Six 400-word questions scored 1-10 by 3 assessors:

| Q# | Title | Appendix |
|----|-------|----------|
| Q10 | High level technical approach | **REQUIRED** (2 A4 pages) |
| Q11 | User and workflow fit | Optional (2 A4 pages) |
| Q12 | MVP and integration readiness | **REQUIRED** (2 A4 pages) |
| Q13 | Risks, assurance and explainability | Optional (2 A4 pages) |
| Q14 | Potential commercial impact and UK benefit | None |
| Q15 | Future potential and scalability | None |

### Interview (If Selected)
- **Format**: 30-minute presentation with **LIVE DEMO** + 20-minute Q&A
- **Location**: Central London
- **Dates**: 16-18 March 2026
- **Max Attendees**: 3 people
- **Critical**: Must bring everything needed (laptop, pre-loaded data, test cases)

## Success Criteria

To win the competition, our application must:

1. **Written Application**: Score highly across all 6 scored questions (targeting 8-10 range)
2. **Live Demo**: Demonstrate working MVP with realistic hydrogen tank design scenario
3. **Technical Credibility**: Show novel architecture, validated performance metrics, clear alignment with challenge
4. **Commercial Viability**: Evidence of market demand, route to adoption, UK benefits
5. **Risk Management**: Comprehensive risk identification, assurance activities, explainability

## Folder Structure

```
agentic-pioneers-prize/
├── application/           # Scored question answers (Q10-Q15)
│   ├── Q10_TECHNICAL_APPROACH.md
│   ├── Q11_USER_WORKFLOW.md
│   ├── Q12_MVP_READINESS.md
│   ├── Q13_RISKS_ASSURANCE.md
│   ├── Q14_COMMERCIAL_IMPACT.md
│   └── Q15_FUTURE_POTENTIAL.md
├── appendices/            # PDF appendices (max 2 A4 pages each)
│   ├── Q10_APPENDIX/      # Technical diagrams (REQUIRED)
│   ├── Q11_APPENDIX/      # Workflow visuals (optional)
│   ├── Q12_APPENDIX/      # MVP deployment diagrams (REQUIRED)
│   └── Q13_APPENDIX/      # Risk/assurance materials (optional)
├── interview/             # Demo preparation materials
├── evidence/              # Supporting evidence and metrics
├── COMPETITION_OVERVIEW.md    # This file
├── SCORING_CRITERIA.md        # Full assessor scoring guidance
├── TIMELINE.md                # Key dates and milestones
└── OUR_APPROACH.md            # Strategy and positioning
```

---
*Last Updated: December 2024*
*Competition Opens: 8 December 2025*
*Application Deadline: 23 February 2026 at 11:00 UK time*
