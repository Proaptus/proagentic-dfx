# ProAgentic DfX - Design for Excellence Platform

## Competition Context

This project is being developed for the **Agentic AI Pioneers Prize - Development Phase** (Competition ID: 2355).

| Field | Details |
|-------|---------|
| **Competition** | Agentic AI Pioneers Prize - Development Phase |
| **Organiser** | Innovate UK (UKRI) + DSIT |
| **Sector** | Advanced Manufacturing |
| **Challenge** | Detailed Design for X Agents |
| **Prize** | £250,000 (sector) + £250,000 (overall winner bonus) |
| **Application Deadline** | 23 February 2026 at 11:00 UK |
| **Interview Dates** | 16-18 March 2026 (London) |

### Competition Documentation
See `agentic-pioneers-prize/` folder for:
- `COMPETITION_OVERVIEW.md` - Full competition details
- `SCORING_CRITERIA.md` - Assessor scoring guidance
- `TIMELINE.md` - Key dates and milestones
- `OUR_APPROACH.md` - Strategy and technical approach
- `application/` - Scored question templates (Q10-Q15)
- `appendices/` - Visual appendix templates
- `interview/` - Demo preparation materials

---

## Project Overview

**ProAgentic DfX** is a multi-agent AI ecosystem for Design for Excellence (DfX). The platform supports multiple designer modules, with the **H2 Tank Designer** being the first implementation.

### Platform Architecture

```
ProAgentic DfX (Platform)
├── H2 Tank Designer Module (Current)
├── [Future] Bracket Designer Module
├── [Future] Fixture Designer Module
└── [Future] Assembly Designer Module
```

### H2 Tank Designer Features

- **Requirements Input**: Natural language to structured requirements
- **Material Selection**: Carbon fibers, glass fibers, liner materials, boss materials
- **Tank Geometry**: Type I-IV pressure vessels with parametric design
- **Analysis Pipeline**: Stress, thermal, failure, reliability analysis
- **Optimisation**: Multi-objective with Pareto frontier visualisation
- **Compliance**: ISO 11119, UN GTR 13, EC 79 standards
- **Export**: STEP, PDF reports, CAD packages

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| 3D Viewer | Three.js (@react-three/fiber) |
| Backend | Node.js + Express |
| Analysis | CadQuery, Gmsh, CalculiX |
| AI/LLM | Claude API, GPT-4 (fallback) |
| Testing | Vitest + React Testing Library + Playwright |
| Deployment | Docker + Docker Compose |

---

## Project Structure

```
proagentic-dfx/
├── proagentic-dfx/          # Frontend application (Next.js/React)
│   └── src/
│       ├── components/      # React components
│       ├── lib/             # Utilities and stores
│       └── app/             # Next.js app router
├── h2-tank-mock-server/     # Mock API server (Next.js)
├── requirements_spec/       # Competition requirements and specs
│   ├── dfx-competition-requirements.json
│   └── dfx-solution-specification.json
├── agentic-pioneers-prize/  # Competition application materials
│   ├── application/         # Scored question answers (Q10-Q15)
│   ├── appendices/          # PDF appendix templates
│   ├── interview/           # Demo preparation
│   └── evidence/            # Supporting materials
├── docs/                    # Project documentation
└── .claude/                 # Claude Code configuration
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd proagentic-dfx

# Install dependencies
npm install

# Start the mock server (terminal 1)
cd h2-tank-mock-server
npm run dev

# Start the frontend (terminal 2)
cd proagentic-dfx
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Mock Server: http://localhost:3001

---

## Agent Pipeline

The DfX system uses 8 specialised agents:

| Order | Agent | Purpose |
|-------|-------|---------|
| 1 | REQ-AGENT | Parse natural language requirements |
| 2 | CONCEPT-AGENT | Generate candidate concepts |
| 3 | GEOM-AGENT | Create parametric CAD geometry |
| 4 | FEA-AGENT | Run structural analysis (FEA) |
| 5 | DFM-AGENT | Assess manufacturability |
| 6 | COST-AGENT | Estimate costs |
| 7 | OPT-AGENT | Optimise and rank options |
| 8 | DOC-AGENT | Generate reports and documentation |

---

## Development

### Skills Available
```bash
Skill({ skill: "proswarm" })      # Master orchestration
Skill({ skill: "tdd" })           # Test-Driven Development
Skill({ skill: "novae" })         # NOVAE workflow
Skill({ skill: "bug-fixer" })     # Batch bug fixing
```

### Testing
```bash
npm test              # Run unit tests
npm run test:e2e      # Run Playwright E2E tests
npm run lint          # Run ESLint
```

---

## Key Contacts

| Role | Name | Email |
|------|------|-------|
| Founder/CEO | Chinedu Achara | chinedu@proaptus.co.uk |
| Organisation | Proaptus Ltd | - |

---

## License

Proprietary - All rights reserved. Built on IP-owned codebase as per competition requirements.

---

*Last Updated: December 2024*
*Competition Deadline: 23 February 2026*
