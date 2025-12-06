# Dev Planning Skill - Quick Reference

> **One-page reference card for the Dev Planning skill**

## When to Use

✅ **Use For**: Complex features, bug fixes, refactors, unclear requirements, TDD preparation
❌ **Don't Use For**: Trivial changes, well-understood tasks, time-critical hotfixes, config changes

## Three Phases (Automatic)

```
Phase A: Intake & Grounding
  → Normalize request + Repo analysis + Context7 baseline

Phase B: Plan the Work
  → Sequential Thinking decomposition + Design tests FIRST + Action sequence

Phase C: Handover Preparation
  → Context packaging + Self-review (Reflexion) + Quality gates + Emit spec
```

## Workflow Summary

```bash
# 1. User requests planning
User: "Plan fix for [bug/feature/refactor]"

# 2. Skill runs automatically (3 phases)
# 3. Outputs TDD Handover Spec

Claude: ✅ TDD_HANDOVER_SPEC.{json,md} ready at: /path/to/spec

# 4. Review (optional)
User: [reviews spec]

# 5. Execute with TDD skill (or manually)
User: "Run TDD skill with spec"
```

## Quality Gates Checklist

Before handover, ALL must pass:

- [ ] **Completeness**: Every AC has test intent, every step has commands
- [ ] **Determinism**: No ambiguous terms, clear PASS/FAIL per step
- [ ] **Context Tightness**: Briefing ≤2k tokens, JSON validates
- [ ] **Testability**: All ACs verifiable by automated tests
- [ ] **Tool Awareness**: All commands are executable
- [ ] **Reflexion Pass**: Self-critique run and spec updated
- [ ] **Context7 Validation**: Library usage follows best practices

## Output Files

### TDD_HANDOVER_SPEC.json (Machine-Readable)
```json
{
  "meta": { "task_id": "...", "repo": "...", "commit": "..." },
  "goal": { "type": "bugfix|feature|refactor", "summary": "..." },
  "tdd_plan": {
    "acceptance_criteria": [{"id":"AC1", "gherkin":"Given...When...Then..."}],
    "unit_tests": [{"name":"test_...", "target":"module.func", "cases":[...]}]
  },
  "steps": [
    {"id":"S1", "intent":"...", "commands":["..."], "expected_final_result":"PASS"}
  ]
}
```

### TDD_HANDOVER_SPEC.md (Human-Readable)
- Problem statement
- Run This First (failing test command)
- Impact summary
- Primary risks
- Test plan
- Implementation steps
- Done criteria

## Common Commands (After Spec Generated)

```bash
# Validate JSON spec against schema
node scripts/validate-spec.js TDD_HANDOVER_SPEC.json

# Run reproduction test (should FAIL initially)
[command from "Run This First" section]

# Hand off to TDD skill
# User: "Run TDD skill with TDD_HANDOVER_SPEC.json"

# Manual implementation (if not using TDD skill)
# Follow steps in TDD_HANDOVER_SPEC.md sequentially
```

## MCP Tool Integration

| Phase | Tool | Purpose |
|-------|------|---------|
| Phase A | Sequential Thinking | Understand problem, decompose |
| Phase A | Context7 | Get library best practices |
| Phase A | Task | Parallel repo analysis |
| Phase B | Sequential Thinking | Plan approach, identify dependencies |
| Phase B | Task | Design tests, action sequence |
| Phase C | Task | Package context, self-review |
| Phase C | Context7 | Validate approach |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Plan too vague | Re-run with more specific decomposition, break into smaller steps |
| Tests not concrete | Add specific Given/When/Then examples, exact expected values |
| Quality gate fails | Review failures, update plan, re-run self-reviewer |
| Context7 missing docs | Refine topic queries, use library-specific keywords |
| Repo analysis incomplete | Use broader grep patterns, check indirect dependencies |

## Common Scenarios

### Bug Fix
1. Gather repro steps
2. Find affected code
3. Design Fail-to-Pass test
4. Plan minimal fix + regression tests

### Feature
1. Clarify user stories
2. Identify integration points
3. Design acceptance tests (Gherkin)
4. Plan implementation (data → logic → UI)

### Refactoring
1. Document current vs. target state
2. Map dependencies
3. Design behavior preservation tests
4. Plan refactor steps (stay green)

## Key Principles

1. **Test-First**: Design tests BEFORE implementation
2. **Structured Output**: JSON + Markdown for clarity
3. **Self-Validation**: Reflexion critique before handover
4. **Context Awareness**: Use Context7 for current best practices
5. **Quality Gates**: Block handover until all gates pass
6. **Parallelization**: Use Task tool for concurrent analysis
7. **Token Efficiency**: Briefing ≤2k tokens for optimal LLM performance

## Example Output

```
✅ TDD Handover Spec ready at: /home/user/project/TDD_HANDOVER_SPEC.md

Summary: Fix off-by-one error in pagination (api/pager.py)
Tests designed:
  - 1 reproduction test (FAIL→PASS)
  - 2 unit tests (edge cases)
  - 1 integration test (API→UI)

Implementation steps: 4
  S1: Create failing reproduction test
  S2: Apply minimal fix to slicing logic
  S3: Add unit tests for edge cases
  S4: Verify coverage ≥80%

Primary risks:
  - Breaking change if code depends on buggy behavior
  - Performance impact on large datasets

Ready to hand off to TDD agent or review manually.
```

## Files & Directories

```
.claude/skills/dev-planning/
├── SKILL.md                  # Skill definition
├── README.md                 # Full documentation
├── QUICK_REFERENCE.md        # This file
├── USAGE_EXAMPLES.md         # Detailed examples
├── CHECKLIST.md              # Quality gates checklist
├── templates/                # JSON + Markdown templates
└── examples/                 # Sample specifications
```

## Quick Links

- **Full Documentation**: `README.md`
- **Detailed Examples**: `USAGE_EXAMPLES.md`
- **Quality Checklist**: `CHECKLIST.md`
- **JSON Schema**: `templates/TDD_HANDOVER_SPEC.json`
- **Markdown Template**: `templates/TDD_HANDOVER_SPEC.md`
- **Gherkin Template**: `templates/ACCEPTANCE_CRITERIA.md`

## Research Foundation

- **Microsoft Research**: Repository-level planning
- **Anthropic**: Building effective agents
- **Routine Framework**: Structural planning
- **SWE-bench**: Test-driven validation
- **ChatDev**: Multi-agent collaboration

---

**Version**: 1.0.0 | **Last Updated**: 2025-01-25
