# TDD Handover Spec: [TASK_TITLE]

> **Spec Version**: 1.0
> **Task ID**: [TASK_ID]

---

## Problem

[One clear sentence describing the issue, feature, or refactor goal]

---

## Run This First

```bash
[EXACT_COMMAND_TO_RUN_FAILING_TEST_OR_START_TDD_CYCLE]
```

**Expected**: `FAIL` (proves bug exists / establishes test-first baseline)

---

## Impact Summary

- **Type**: [bugfix | feature | refactor]
- **Impacted Files**:
  - Primary: `[file1.py]`, `[file2.tsx]`
  - Secondary: `[file3.ts]`
  - Tests: `[test_file1.py]`, `[test_file2.test.tsx]`
- **Modules Affected**: `[module.A]`, `[module.B]`

---

## Primary Risks

1. **[RISK_1]**
   - **Impact**: [What could go wrong]
   - **Mitigation**: [How to prevent/handle it]

2. **[RISK_2]**
   - **Impact**: [What could go wrong]
   - **Mitigation**: [How to prevent/handle it]

3. **[RISK_3]**
   - **Impact**: [What could go wrong]
   - **Mitigation**: [How to prevent/handle it]

---

## Approach

[1-2 paragraphs describing the high-level strategy]

**Strategy**:
- [Step 1 high-level: e.g., "Design tests first"]
- [Step 2 high-level: e.g., "Implement minimal fix"]
- [Step 3 high-level: e.g., "Verify with integration tests"]

**Why This Approach**:
[Brief rationale: why this approach over alternatives]

---

## Test Plan

### Acceptance Criteria
- **[AC1_ID]**: [One-line summary] (see JSON for full Gherkin)
- **[AC2_ID]**: [One-line summary] (see JSON for full Gherkin)

### Unit Tests
- **Count**: [N] unit tests
- **Coverage**:
  - `[module1]`: [N] tests covering [key functions]
  - `[module2]`: [N] tests covering [key functions]
- **Fixtures**: [List any special test fixtures needed]
- **Mocks**: [List any mocks/stubs needed]

### Integration Tests
- **Count**: [N] integration tests
- **Scope**: [What layers/components are integrated]
- **Environment**: [Docker, test DB, mock services, etc.]

### Coverage Targets
- **Line Coverage**: ≥[X]% on changed files
- **Branch Coverage**: ≥[Y]% on changed files
- **Must Cover 100%**: `[critical_module]`, `[critical_function]`

---

## Implementation Tasks

### Task S1: [INTENT_1]
- **Command**: `[EXACT_COMMAND]`
- **Files**: [CREATE/EDIT] `[file_path]`
- **Expected Initial**: [FAIL/DOES_NOT_EXIST/etc]
- **Expected Final**: [PASS/EXISTS/etc]
- **Notes**: [Any special considerations]

### Task S2: [INTENT_2]
- **Command**: `[EXACT_COMMAND]`
- **Files**: [CREATE/EDIT] `[file_path]`
- **Expected Initial**: [STATE_BEFORE]
- **Expected Final**: [STATE_AFTER]
- **Notes**: [Any special considerations]

### Task S3: [INTENT_3]
- **Command**: `[EXACT_COMMAND]`
- **Files**: [CREATE/EDIT] `[file_path]`
- **Expected Initial**: [STATE_BEFORE]
- **Expected Final**: [STATE_AFTER]
- **Notes**: [Any special considerations]

[Continue for all tasks...]

---

## Done Criteria

Complete when ALL of the following are true:

- [ ] All acceptance criteria pass (AC1, AC2, ...)
- [ ] All unit tests pass ([N] tests)
- [ ] All integration tests pass ([N] tests)
- [ ] Coverage targets met (≥[X]% line, ≥[Y]% branch)
- [ ] Linting clean (`[LINT_COMMAND]`)
- [ ] Formatting applied (`[FORMAT_COMMAND]`)
- [ ] Build succeeds (`[BUILD_COMMAND]`)
- [ ] CI pipeline green
- [ ] [Any project-specific criteria]

---

## Quick Reference

### Test Commands
```bash
# Run reproduction test (should FAIL initially)
[REPRO_TEST_COMMAND]

# Run all unit tests
[UNIT_TEST_COMMAND]

# Run integration tests
[INTEGRATION_TEST_COMMAND]

# Run with coverage
[COVERAGE_COMMAND]
```

### Linting & Formatting
```bash
# Lint
[LINT_COMMAND]

# Format
[FORMAT_COMMAND]
```

### Build
```bash
# Build project
[BUILD_COMMAND]
```

---

## Context

### Entry Points
1. `[file_path:line_number]` - [Description of what's here]
2. `[file_path:line_number]` - [Description of what's here]

### Key Invariants
- [INVARIANT_1]: [Description]
- [INVARIANT_2]: [Description]
- [INVARIANT_3]: [Description]

### Dependencies
- **Internal**: `[module_A]` → `[module_B]` → `[module_C]`
- **External**: `[library_1]@[version]` ([usage]), `[library_2]@[version]` ([usage])

### Related Issues/Docs
- [GitHub issue #123](link)
- [Internal doc: pagination.md](link)
- [RFC-456](link)

---

## Rollback Plan

If changes cause issues:

```bash
# Option 1: Git revert
git revert [COMMIT_HASH]

# Option 2: Restore from branch
git checkout main -- [FILE_PATHS]

# Option 3: [Project-specific rollback command]
[ROLLBACK_COMMAND]
```

**Recovery Steps**:
1. [Step 1]
2. [Step 2]
3. [Verify system state]

---

## Full Specification

For complete details, see:
- **JSON Spec**: `TDD_HANDOVER_SPEC.json`
  - Complete Gherkin scenarios
  - Detailed test specifications (with code snippets)
  - Full context and dependency chains
  - Extended notes and rationale

---

## Notes

### Assumptions
- [ASSUMPTION_1]
- [ASSUMPTION_2]

### Out of Scope (Explicitly)
- [NON_GOAL_1]
- [NON_GOAL_2]

### Future Work
- [FUTURE_WORK_1]
- [FUTURE_WORK_2]

---

**This specification was generated using the Dev Planning skill following research-backed methodologies:**
- Plan-then-Act paradigm (Microsoft Research, 2024)
- Test-First design (SWE-bench, TDD best practices)
- Reflexion self-critique (validated by dev-planning-self-reviewer)
- Context packaging optimization (≤2k token briefing for optimal LLM performance)

**Ready for handoff to**: TDD skill or manual implementation
