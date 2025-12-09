# Q13: Risks, Assurance and Explainability

**Word Limit**: 400 words
**Appendix**: Optional (PDF, max 10MB, 2 A4 pages)
**Scored**: Yes (1-10 by 3 assessors)

---

## Official Prompt

> **What could go wrong and how will you control it responsibly?**

---

## Must Explain

1. **The principal technical, data, safety, security and delivery risks** encountered, and mitigations applied
2. **Assurance activities completed**, such as tests, red-teaming, evaluation protocols and audit trails
3. **How the system explains its outputs or actions** to users, and any evidence that this is usable
4. **Compliance status** against any relevant regulations or standards, and remaining actions

---

## Scoring Criteria Summary

### For 9-10 Score (Target)
- Key risks are clearly identified, relevant and thoughtfully analysed
- Mitigations are well justified, proportionate and linked to identified risks
- Assurance activities (testing, evaluation, audit trails, red-teaming) are substantial and credible
- Data privacy, security, access control and logging are addressed clearly
- Potential misuse, unintended behaviours or harmful outputs are recognised with credible mitigation
- Explainability approach is suitable for intended users with evidence of practicality
- Compliance with relevant regulations or standards is clearly described

### Avoid (3-4 Score Indicators)
- Risks weakly understood or incomplete
- Mitigations vague, unrealistic or absent
- Little meaningful assurance activity described
- Data privacy and security largely overlooked
- Misuse or harmful output risks not recognised
- Explainability approach inappropriate or confusing

---

## Appendix Requirements (Optional)

**File**: `Q13_APPENDIX.pdf`
**Content**: Materials that summarise key risks, assurance activities or explainability approach

**Suggested Content for Appendix**:
- [ ] Risk register with likelihood/impact/mitigation
- [ ] Assurance activities matrix
- [ ] Example of explainability output (decision rationale screenshot)
- [ ] Standards compliance checklist
- [ ] Data flow and security diagram

---

## Key Messages (from OUR_APPROACH.md)

1. **Engineering validation**: FEA vs hand-calc benchmarks (within 10%)
2. **Human-in-loop** for all safety-critical decisions
3. **Decision audit trail** with standards citations
4. **SPR module** ensures regulatory compliance

---

## Key Risks Identified

| Risk ID | Risk | Likelihood | Impact | Mitigation |
|---------|------|------------|--------|------------|
| RISK-1 | FEA integration complexity | Medium | High | Start early, fallback to hand-calc validation |
| RISK-2 | Geometry generation failures | Medium | High | Constrain to well-defined parametric patterns |
| RISK-3 | Demo reliability on interview day | Low | Critical | Offline-capable, pre-loaded test cases, redundant hardware |
| RISK-4 | Scope creep beyond 3 months | High | Medium | Strict scope boundaries, MVP-first approach |

---

## Evidence to Include

- [ ] Risk register with mitigations
- [ ] Example of explainability output
- [ ] Standards compliance matrix
- [ ] Testing/validation evidence
- [ ] Audit trail example

---

## Answer Template

```
[DRAFT - 400 WORDS MAX]

### Principal Risks
[Technical risks - FEA accuracy, geometry failures...]
[Data risks - material properties, test data quality...]
[Delivery risks - scope creep, timeline...]

### Mitigations Applied
[For each risk, what mitigation is in place...]

### Assurance Activities
[Testing done - benchmark validation, edge case testing...]
[Evaluation protocols - comparison to manual analysis...]
[Audit trails - decision logging, standards citations...]

### Explainability
[How system explains decisions to users...]
[Evidence of usability - user testing feedback...]

### Compliance Status
[Standards addressed - ISO, DNV, EN 1993...]
[Remaining actions needed...]
```

---

## Writing Checklist

- [ ] Identifies principal risks across categories
- [ ] Provides proportionate mitigations
- [ ] Describes assurance activities completed
- [ ] Addresses data privacy and security
- [ ] Recognises potential misuse/harmful outputs
- [ ] Explains how system provides explainability
- [ ] Shows evidence of usability
- [ ] Describes compliance status
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
