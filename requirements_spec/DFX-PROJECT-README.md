# DFX-Agents Project Documentation

## Document Structure

This project uses **two separate JSON documents** to maintain clear separation between fixed competition requirements and our evolving solution design.

### 1. Competition Requirements (`dfx-competition-requirements.json`)

**Purpose**: Pure extraction from Innovate UK source documents. This is the **fixed target** we're building against.

**Contents**:
- Competition metadata (timeline, prizes, eligibility)
- All three Advanced Manufacturing challenges (for reference)
- Application questions (scored and unscored)
- Assessment criteria with scoring bands
- Interview requirements
- Applicant reference info

**Status**: Fixed - should not change unless competition brief is updated.

**Usage**:
```python
import json

with open('dfx-competition-requirements.json') as f:
    requirements = json.load(f)

# What does the challenge actually require?
challenge = requirements['advanced_manufacturing_challenges']['challenge_2']
print(challenge['can_do_one_or_more'])

# What do assessors look for in Q10?
q10_criteria = requirements['assessment_criteria']['question_10_criteria']
print(q10_criteria['scores_9_10'])

# When is the deadline?
print(requirements['timeline']['competition_closes'])
```

---

### 2. Solution Specification (`dfx-solution-specification.json`)

**Purpose**: Our proposed technical approach and design decisions. This is the **living document** that will evolve as we build.

**Contents**:
- Executive summary
- Project charter (vision, objectives, risks)
- Scope definition (in-scope/out-of-scope)
- Technical architecture (agent pipeline, tech stack)
- Demo scenario
- Development plan (4 phases, 12 weeks)
- Application strategy (key messages per question)
- Success metrics

**Status**: Draft - will be updated as development progresses.

**Usage**:
```python
import json

with open('dfx-solution-specification.json') as f:
    solution = json.load(f)

# What agents are we building?
for agent in solution['technical_architecture']['agent_pipeline']:
    print(f"{agent['order']}. {agent['name']}")

# What's the demo scenario?
print(solution['demo_scenario']['input_requirements'])

# What's the development timeline?
for phase in solution['development_plan']['phases']:
    print(f"Phase {phase['phase']}: {phase['name']} ({phase['dates']['start']} - {phase['dates']['end']})")
```

---

## Key Dates

| Milestone | Date |
|-----------|------|
| Competition Opens | 2025-12-08 |
| Phase 1 (Foundation) | 2025-12-09 to 2025-12-29 |
| Phase 2 (Agents) | 2025-12-30 to 2026-01-26 |
| Phase 3 (Frontend) | 2026-01-27 to 2026-02-16 |
| Phase 4 (Validation) | 2026-02-17 to 2026-02-23 |
| **Application Deadline** | **2026-02-23 11:00 UK** |
| Interviews | 2026-03-16 to 2026-03-18 |

---

## Quick Reference

**Challenge**: Advanced Manufacturing - Detailed Design for X Agents

**One-liner**: An agentic AI system that transforms natural language requirements into production-ready mechanical component designs with full engineering analysis.

**Demo Scenario**: Sensor mounting bracket for offshore wind turbine (35kg sensor, vibration/corrosion requirements, 3 design options, FEA analysis, £200 cost target)

**Target Runtime**: <5 minutes end-to-end

---

## File Sizes

| File | Size | Sections |
|------|------|----------|
| `dfx-competition-requirements.json` | ~34KB | 16 |
| `dfx-solution-specification.json` | ~34KB | 16 |

---

*Project Codename: DFX-AGENTS*  
*Organisation: Proaptus Ltd*  
*Competition: Agentic AI Pioneers Prize - Development Phase*
