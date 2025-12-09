# Q10: High Level Technical Approach

**Word Limit**: 400 words
**Appendix**: REQUIRED (PDF, max 10MB, 2 A4 pages)
**Scored**: Yes (1-10 by 3 assessors)

---

## Official Prompt

> **How does the system work and why is it credible?**

---

## Must Explain

1. **The final system architecture**, agent roles, key components and data flows
2. **What is novel** compared with the state of the art and what was hard in practice
3. **The key performance metrics**, datasets and test conditions used to validate the system, including how these relate to the challenge objectives
4. **The tools, compute and environments** used during development and validation

---

## Scoring Criteria Summary

### For 9-10 Score (Target)
- Technical approach is clear, coherent, and well justified
- Architecture, components and data flows are well explained and easy to understand
- Approach is clearly and convincingly aligned with the challenge statement
- Multi-agent roles and interactions are clearly described and evidenced
- Novelty is credible and well demonstrated
- Performance metrics are validated with convincing evidence
- Appendix significantly enhances clarity

### Avoid (3-4 Score Indicators)
- Technical description is unclear or incomplete
- Alignment with challenge statement is poor
- Minimal or no meaningful novelty demonstrated
- Little credible evidence for stated objectives
- Performance evidence weak or absent

---

## Appendix Requirements

**File**: `Q10_APPENDIX.pdf`
**Content**: Diagrams, tables or other visuals that explain technical approach and system performance

**Suggested Content for Appendix**:
- [ ] System architecture diagram (agent pipeline)
- [ ] Data flow diagram
- [ ] Agent roles and interactions table
- [ ] Performance metrics table (FEA accuracy, generation time)
- [ ] Benchmark comparison (our system vs manual analysis)

---

## Key Messages (from OUR_APPROACH.md)

1. **Real FEA integration** (CalculiX) - not just geometry generation
2. **Multi-agent architecture** with 8 clear agent roles
3. **Validated against engineering benchmarks** (within 10% of manual analysis)
4. **Novel: automated design-analysis loop** with optimisation

---

## Evidence to Include

- [ ] Architecture diagram showing agent pipeline (REQ → CONCEPT → GEOM → FEA → DFM → COST → OPT → DOC)
- [ ] FEA validation results vs hand calculations
- [ ] Performance metrics (time to generate, accuracy)
- [ ] Technology stack summary

---

## Answer Template

```
[DRAFT - 400 WORDS MAX]

### System Architecture
[Describe the 8-agent pipeline and how they interact...]

### Agent Roles and Data Flows
[Describe what each agent does and what data passes between them...]

### Novelty and Technical Challenges
[Explain what's new vs state of art, what was hard to build...]

### Performance Validation
[Present key metrics with evidence - FEA accuracy, generation time, test conditions...]

### Development Environment
[Tools, compute, environments used...]
```

---

## Writing Checklist

- [ ] Clearly states the multi-agent architecture
- [ ] Explains each agent's role
- [ ] Shows data flow between agents
- [ ] Identifies what is novel
- [ ] Presents quantitative performance metrics
- [ ] Links metrics to challenge objectives
- [ ] References appendix for diagrams
- [ ] Under 400 words

---

## Status

| Field | Value |
|-------|-------|
| Draft Started | No |
| Draft Complete | No |
| Internal Review | No |
| Final Version | No |
| Word Count | 0/400 |

---
*See SCORING_CRITERIA.md for full assessor guidance*
