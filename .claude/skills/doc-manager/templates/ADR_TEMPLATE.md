---
id: ADR-XXXX
doc_type: adr
title: "Decision Title in Title Case"
status: proposed
date: YYYY-MM-DD
supersedes: []
superseded_by: []
owner: "@arch-team"
deciders: ["@person1", "@person2", "@person3"]
consulted: ["@team-name"]
informed: ["@stakeholder1"]
---

# ADR-XXXX: Decision Title

## Status

**Status**: Proposed / Accepted / Deprecated / Superseded

**Date**: YYYY-MM-DD

**Supersedes**: [ADR-YYYY](./ADR-YYYY-old-decision.md) (if applicable)

**Superseded By**: [ADR-ZZZZ](./ADR-ZZZZ-new-decision.md) (if applicable)

## Context

### Problem Statement

Describe the problem or opportunity that requires a decision. What forces are at play? What are we trying to accomplish?

- **Force 1**: Constraint or requirement pushing in one direction
- **Force 2**: Constraint or requirement pushing in another direction
- **Force 3**: Conflicting concern

### Current Situation

What is the current state? What's working, what's not?

### Desired Outcome

What do we want to achieve? What does success look like?

### Constraints

What constraints must we operate within?

- **Technical**: Technology limitations, platform constraints
- **Business**: Budget, timeline, resources
- **Regulatory**: Compliance, legal requirements
- **Organizational**: Team skills, existing systems

## Decision Drivers

What factors are most important in making this decision? (Prioritized)

1. **Driver 1**: Why this matters most
2. **Driver 2**: Why this is important
3. **Driver 3**: Secondary consideration
4. **Driver 4**: Nice-to-have

## Considered Options

### Option 1: [Name of Option 1]

**Description**: Detailed description of this option

**Pros**:
- ✅ Pro 1: Specific advantage
- ✅ Pro 2: Specific advantage
- ✅ Pro 3: Specific advantage

**Cons**:
- ❌ Con 1: Specific disadvantage
- ❌ Con 2: Specific disadvantage
- ❌ Con 3: Specific disadvantage

**Cost**: Rough cost estimate (time, money, complexity)

**Risk**: Risk level (Low / Medium / High) - explain why

**Example**:
```typescript
// Code example illustrating this option
```

---

### Option 2: [Name of Option 2]

**Description**: Detailed description of this option

**Pros**:
- ✅ Pro 1: Specific advantage
- ✅ Pro 2: Specific advantage
- ✅ Pro 3: Specific advantage

**Cons**:
- ❌ Con 1: Specific disadvantage
- ❌ Con 2: Specific disadvantage
- ❌ Con 3: Specific disadvantage

**Cost**: Rough cost estimate

**Risk**: Risk level (Low / Medium / High) - explain why

**Example**:
```typescript
// Code example illustrating this option
```

---

### Option 3: [Name of Option 3]

**Description**: Detailed description of this option

**Pros**:
- ✅ Pro 1: Specific advantage
- ✅ Pro 2: Specific advantage

**Cons**:
- ❌ Con 1: Specific disadvantage
- ❌ Con 2: Specific disadvantage

**Cost**: Rough cost estimate

**Risk**: Risk level (Low / Medium / High) - explain why

**Example**:
```typescript
// Code example illustrating this option
```

---

## Decision

**We will**: [Clearly state the decision in one sentence]

**Chosen Option**: Option X - [Name of Chosen Option]

### Rationale

Why this option was chosen over the others:

1. **Reason 1**: How it addresses decision drivers
2. **Reason 2**: How it fits constraints
3. **Reason 3**: Why it's better than alternatives

### Implementation Notes

How this decision will be implemented:

- **Step 1**: First action to take
- **Step 2**: Next action
- **Step 3**: Follow-up action

**Timeline**: Expected implementation timeframe

**Responsible**: @team-name or @person-name

## Consequences

### Positive Consequences

What benefits will result from this decision?

- ✅ **Benefit 1**: Specific positive outcome
- ✅ **Benefit 2**: Specific positive outcome
- ✅ **Benefit 3**: Specific positive outcome

### Negative Consequences

What drawbacks or challenges will result from this decision?

- ❌ **Drawback 1**: Specific negative outcome and mitigation strategy
- ❌ **Drawback 2**: Specific negative outcome and mitigation strategy
- ❌ **Drawback 3**: Specific negative outcome and mitigation strategy

### Risks

What risks does this decision introduce?

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Risk 1 | Low/Med/High | Low/Med/High | How we'll address it |
| Risk 2 | Low/Med/High | Low/Med/High | How we'll address it |

### Technical Debt

What technical debt does this decision create (if any)?

- **Debt Item 1**: Description and payback strategy
- **Debt Item 2**: Description and payback strategy

### Dependencies

What other systems, teams, or decisions does this depend on?

- **Dependency 1**: What we need from whom
- **Dependency 2**: What we need from whom

### Affected Components

What parts of the system will change as a result?

- **Component 1**: How it's affected
- **Component 2**: How it's affected
- **Component 3**: How it's affected

## Validation

How will we know if this decision was correct?

### Success Criteria

- [ ] **Criterion 1**: Measurable success indicator
- [ ] **Criterion 2**: Measurable success indicator
- [ ] **Criterion 3**: Measurable success indicator

### Metrics

What metrics will we track?

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Performance | < 100ms | Response time in prod |
| Reliability | 99.9% uptime | Error rate monitoring |
| Adoption | 80% of teams | Usage analytics |

### Review Date

**Scheduled Review**: YYYY-MM-DD (when we'll reassess this decision)

**Review Criteria**: What will trigger a re-evaluation?

## Links

### Related ADRs

- [ADR-YYYY: Related Decision](./ADR-YYYY-title.md)
- [ADR-ZZZZ: Another Related Decision](./ADR-ZZZZ-title.md)

### Related Documentation

- [Feature Card: Feature Name](../feature/FEAT-YYYY-MM-slug.md)
- [Technical Design: Design Name](../explanation/technical-design.md)

### External References

- [Article/Blog Post Title](https://example.com/article)
- [Library Documentation](https://example.com/docs)
- [Research Paper](https://example.com/paper.pdf)

### Discussion

- [GitHub Issue #123](https://github.com/org/repo/issues/123)
- [RFC Document](https://example.com/rfc)
- [Slack Thread](https://workspace.slack.com/archives/C123/p456)

## Revision History

| Date | Author | Change |
|------|--------|--------|
| YYYY-MM-DD | @person1 | Initial proposal |
| YYYY-MM-DD | @person2 | Updated based on feedback |
| YYYY-MM-DD | @person3 | Accepted |

---

## Metadata

**Deciders**: @person1, @person2, @person3 (who made this decision)

**Consulted**: @team-name (who provided input)

**Informed**: @stakeholder1, @stakeholder2 (who was notified)

**Date Created**: YYYY-MM-DD

**Date Accepted**: YYYY-MM-DD (if status is accepted)

**Date Deprecated**: YYYY-MM-DD (if status is deprecated)

**Deprecation Reason**: Why this decision is no longer valid (if deprecated)

---

**Template Version**: 1.0 (MADR 3.0.0)
**Last Updated**: YYYY-MM-DD
