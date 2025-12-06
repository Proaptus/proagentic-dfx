# TDD Skill Completion Checklist

Use this checklist to verify each step of the TDD workflow is complete and correct.

---

## 📋 Step 0: Safe Harness & Environment (One-Time Setup)

### Environment Setup
- [ ] Sandbox configured (container/VM with network disabled)
- [ ] CPU and memory limits set
- [ ] Unified test entry point available (`npm test`, `pytest`, `go test`)
- [ ] Single-test execution capability verified
- [ ] Test framework installed and working
- [ ] Ran `./scripts/helpers/sandbox-setup.sh` successfully

### Verification
```bash
# Check test command works
npm test -- --version  # Should show Vitest/Jest version

# Check single-test execution
./scripts/helpers/run-single-test.sh --help  # Should show usage

# Verify scripts are executable
ls -la .claude/skills/tdd/scripts/**/*
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 📋 Step 1: Turn Task Into Tests (Test-First)

### For Bug Fixes

- [ ] **Generated fail-to-pass test** from bug report
- [ ] Test reproduces the bug with minimal code
- [ ] Test uses repo's test framework (Vitest/Jest/pytest)
- [ ] External dependencies mocked (no real network, no real DB)
- [ ] No sleeps, no `setTimeout`, deterministic seeds only
- [ ] Clear assertions with meaningful error messages
- [ ] **Ran test: FAIL ❌** (RED state confirmed)
- [ ] Validated test quality: `./scripts/safety/validate-test-quality.py <test-file>`
- [ ] Checked determinism: `./scripts/safety/check-deterministic.sh <test-file>`

### For New Features

- [ ] **Generated acceptance tests** from feature spec
- [ ] Happy path test included
- [ ] Boundary cases tested (2-3 tests)
- [ ] Negative/error cases tested (2-3 tests)
- [ ] Property-based test included (if applicable)
- [ ] All tests use mocks for external dependencies
- [ ] All tests deterministic (no time/network/random)
- [ ] **Ran tests: all FAIL ❌** (RED state confirmed)
- [ ] Validated test quality: `./scripts/safety/validate-test-quality.py <test-file>`
- [ ] Checked determinism: `./scripts/safety/check-deterministic.sh <test-file>`

### Test Quality Validation

- [ ] No vacuous tests (tests without assertions)
- [ ] No trivial assertions (e.g., `expect(true).toBe(true)`)
- [ ] No always-true conditions
- [ ] Each test has clear, specific assertions
- [ ] Error messages are descriptive

### Verification Commands

```bash
# Run failing tests
npm test -- path/to/test-file.ts

# Should see: FAIL ❌ (RED state)

# Validate test quality
./scripts/safety/validate-test-quality.py tests/path/to/test.ts

# Check for non-deterministic patterns
./scripts/safety/check-deterministic.sh tests/path/to/test.ts
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 📋 Step 2: Implement to Green (Tight Self-Debug Loop)

### Single-Test Focus

- [ ] Identified ONE failing test to fix first
- [ ] Ran single test only: `./scripts/helpers/run-single-test.sh <suite::case>`
- [ ] Test execution is fast (< 5 seconds)

### Self-Debug Loop (Per Test)

**Iteration 1**:
- [ ] **Ran single test** → captured error/traceback
- [ ] **Analyzed error** in one sentence
- [ ] **Generated 2-3 hypotheses** for root cause
- [ ] **Proposed minimal patch** (smallest possible change)
- [ ] **Applied patch** to source code
- [ ] **Re-ran single test** → Check result

**If still failing**:

**Iteration 2**:
- [ ] Analyzed new error
- [ ] Updated hypothesis
- [ ] Applied different minimal patch
- [ ] Re-ran single test

**Iteration 3** (if needed):
- [ ] Analyzed persistent error
- [ ] Applied third approach
- [ ] Re-ran single test

**If still failing after 3 iterations**:
- [ ] Escalated to human review OR
- [ ] Used multi-sampling (Step 3)

### Test Status

- [ ] **Single test: PASS ✅** (GREEN achieved)
- [ ] Moved to next failing test (if any)
- [ ] Repeated self-debug loop for each failing test
- [ ] **All tests: PASS ✅** (full suite GREEN)

### Code Quality

- [ ] Applied minimal changes only (no gold-plating)
- [ ] No commented-out code
- [ ] No debug console.log statements
- [ ] Ran linter: `npm run lint`
- [ ] Ran type checker: `npm run type-check` or `tsc --noEmit`

### Verification Commands

```bash
# Run single test (fast iteration)
./scripts/helpers/run-single-test.sh tests/auth.test.ts::should-refresh-token

# Should see: PASS ✅

# Run full test suite
npm test

# Should see: All tests pass ✅

# Run static checks
npm run lint
npm run type-check
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 📋 Step 3: Multi-Sample & Select (For Hard Problems ONLY)

### When to Use

- [ ] Self-debug loop failed after 3 iterations OR
- [ ] Problem is complex with multiple possible solutions OR
- [ ] User explicitly requested multiple approaches

### Multi-Sampling Process

- [ ] **Generated 3-5 fix candidates** with different strategies
- [ ] Documented approach for each candidate
- [ ] Each candidate uses minimal changes
- [ ] Each candidate is syntactically valid

### Test-Based Selection

- [ ] **Ran test suite on Candidate 1** → Recorded pass rate
- [ ] **Ran test suite on Candidate 2** → Recorded pass rate
- [ ] **Ran test suite on Candidate 3** → Recorded pass rate
- [ ] **Ran test suite on Candidate 4** → Recorded pass rate (if applicable)
- [ ] **Ran test suite on Candidate 5** → Recorded pass rate (if applicable)

### Selection Criteria

- [ ] **Ranked candidates by pass rate**
- [ ] Selected candidate with highest pass rate
- [ ] If tie: Selected simplest implementation
- [ ] Documented why winner was chosen

### Verification Commands

```bash
# For each candidate:
# 1. Apply candidate
# 2. Run full test suite
npm test

# 3. Record results
# Candidate 1: 95% (123/130 tests pass)
# Candidate 2: 98% (127/130 tests pass)
# Candidate 3: 100% (130/130 tests pass) ✅ WINNER
```

**Status**: ⬜ Not Started | ⬜ Skipped (Not Needed) | ⏳ In Progress | ✅ Complete

---

## 📋 Step 4: Refactor While Staying Green

### Prerequisites

- [ ] **All tests GREEN** before starting refactoring
- [ ] Reviewed Context7 best practices for refactoring patterns

### Refactoring Rules

- [ ] Tests stay GREEN after EVERY change
- [ ] PASS_TO_PASS tests must never break
- [ ] Run tests after each small refactor
- [ ] Make incremental changes (single responsibility)
- [ ] No big rewrites (only small improvements)

### Refactoring Checklist

**Refactor 1**:
- [ ] Identified code smell or improvement
- [ ] Made small refactor (e.g., extract function, rename variable)
- [ ] Ran affected tests → **PASS ✅**
- [ ] Ran full test suite → **All PASS ✅**

**Refactor 2** (if applicable):
- [ ] Identified next improvement
- [ ] Made small refactor
- [ ] Ran tests → **All PASS ✅**

**Continue as needed...**

### Code Quality After Refactoring

- [ ] Code is clearer and more readable
- [ ] Follows Context7 best practices
- [ ] No duplicate code (DRY principle)
- [ ] Single Responsibility Principle followed
- [ ] Ran linter and type checker → **No errors**

### Verification Commands

```bash
# After EACH refactor step:
npm test

# Should see: All tests pass ✅ (stayed GREEN)

# Run static checks
npm run lint
npm run type-check

# Get Context7 validation
# Use Context7 MCP to verify refactored code follows best practices
```

**Status**: ⬜ Not Started | ⬜ Skipped (No Refactoring Needed) | ⏳ In Progress | ✅ Complete

---

## 📋 Step 5: Quality Gates & Regressions

### Coverage Check

- [ ] **Ran coverage report**: `npm test -- --coverage`
- [ ] Coverage on changed lines: **≥80%** (or project baseline)
- [ ] No critical uncovered branches
- [ ] Ran coverage gate: `./scripts/quality/coverage-gate.sh` → **PASS ✅**

### Mutation Testing

- [ ] **Ran mutation tests on changed lines**: `./scripts/quality/mutation-test.sh`
- [ ] Mutation score: **≥80%** (most mutations caught)
- [ ] No surviving mutations on critical logic
- [ ] Strengthened weak assertions if needed

### Flakiness Detection

- [ ] **Ran tests 3 consecutive times**: `./scripts/quality/flakiness-check.sh`
- [ ] Run 1: **PASS ✅**
- [ ] Run 2: **PASS ✅**
- [ ] Run 3: **PASS ✅**
- [ ] No flaky tests detected
- [ ] If flaky: Fixed non-deterministic patterns

### PASS_TO_PASS Validation

- [ ] **All pre-existing tests still pass**
- [ ] No regressions introduced
- [ ] Full test suite: **100% pass rate**

### Security & Safety

- [ ] Ran security scan on diff (if applicable)
- [ ] No hardcoded secrets or credentials in tests
- [ ] Tests don't assume network access
- [ ] Tests don't assume system state
- [ ] Tests run successfully in sandbox

### Verification Commands

```bash
# Coverage check
./scripts/quality/coverage-gate.sh
# Expected: ✅ Coverage meets threshold

# Mutation testing
./scripts/quality/mutation-test.sh
# Expected: ✅ Most mutations killed

# Flakiness check
./scripts/quality/flakiness-check.sh
# Expected: ✅ 3/3 runs passed

# Full test suite (PASS_TO_PASS)
npm test
# Expected: ✅ All tests pass
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 📋 Step 6: Commit, Summarize, and Open PR

### PR Description

- [ ] **Title**: Clear, descriptive title (e.g., "Fix token expiration bug")
- [ ] **Changes section**: Summarized what changed and why
- [ ] **Tests section**: Listed all fail-to-pass and pass-to-pass tests

### Fail-to-Pass Tests Documentation

For each test:
- [ ] Test name and file path
- [ ] **Before state**: How test failed
- [ ] **After state**: How test passes now
- [ ] **Repro command**: Exact command to re-run test
  ```bash
  npm test -- path/to/test.ts -t "test name"
  ```

### Pass-to-Pass Tests Documentation

- [ ] Listed count of existing tests that still pass
- [ ] Confirmed no regressions

### Coverage Report

- [ ] **Changed lines coverage**: X% (with line count)
- [ ] **Overall coverage**: Before% → After% (diff)
- [ ] Coverage diff shows improvements

### Quality Gate Results

- [ ] ✅ Coverage threshold met
- [ ] ✅ Mutation score reported
- [ ] ✅ Flakiness check passed (3/3 runs)
- [ ] ✅ PASS_TO_PASS tests 100% passing

### Additional Documentation

- [ ] Risks and limitations noted (if any)
- [ ] Follow-up tasks documented (if any)
- [ ] Used PR template: `templates/pr-test-summary.md`

### Verification

```bash
# Generate PR description using template
cat .claude/skills/tdd/templates/pr-test-summary.md

# Ensure all links and commands are correct
# Test repro commands locally before including in PR
```

**PR Checklist Summary**:
- [ ] Title is descriptive
- [ ] Each test linked to specific change
- [ ] Repro commands for all tests
- [ ] Coverage diff included
- [ ] Quality gate results documented
- [ ] Risks/follow-ups noted

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 📋 Step 7: CI - Headless Agent Loops (Optional)

### CI Configuration

- [ ] CI workflow file created (`.github/workflows/headless-tdd.yml`)
- [ ] Trigger configured (e.g., on issue creation)
- [ ] Issue label filtering set up (e.g., `bug` label)

### Headless Workflow Steps

- [ ] **Step 1**: Issue parsed and analyzed
- [ ] **Step 2**: Fail-to-pass test generated
- [ ] **Step 3**: Test verified to fail on main branch
- [ ] **Step 4**: Bounded fix loop (max 5 iterations)
- [ ] **Step 5**: Quality gates executed
- [ ] **Step 6a**: PR auto-created (if successful)
- [ ] **Step 6b**: Issue commented (if failed)

### Safety Limits

- [ ] Maximum iteration limit set (recommended: 5)
- [ ] Timeout configured (recommended: 15 minutes)
- [ ] Human escalation on failure
- [ ] Audit trail of agent decisions logged

### Verification

```bash
# Test CI workflow locally (if possible)
act -j auto-fix

# Or test workflow file syntax
yamllint .github/workflows/headless-tdd.yml
```

**Status**: ⬜ Not Started | ⬜ Skipped (Not Applicable) | ⏳ In Progress | ✅ Complete

---

## 📋 Step 8: Post-Merge Learning (Optional)

### Learning Repository

- [ ] Created storage for (issue → test → patch) tuples
- [ ] Stored issue description
- [ ] Stored failing test path and name
- [ ] Stored final patch file and lines
- [ ] Stored outcome (PASS/FAIL)
- [ ] Stored iteration count
- [ ] Tagged by issue type and domain

### Future Use Cases

- [ ] Retrieval index built for similar issues
- [ ] Few-shot examples prepared for future tasks
- [ ] Patterns analyzed for improvement opportunities
- [ ] Fine-tuning dataset prepared (if applicable)

**Status**: ⬜ Not Started | ⬜ Skipped (Not Applicable) | ⏳ In Progress | ✅ Complete

---

## 🎯 Final Verification

### Overall TDD Workflow

- [ ] ✅ Step 0: Safe harness configured
- [ ] ✅ Step 1: Tests generated FIRST (RED state confirmed)
- [ ] ✅ Step 2: Implementation GREEN (self-debug loop used)
- [ ] ✅ Step 3: Multi-sampling (if needed)
- [ ] ✅ Step 4: Refactoring (if needed, tests stayed GREEN)
- [ ] ✅ Step 5: Quality gates passed
- [ ] ✅ Step 6: PR created with test linkage
- [ ] ⬜ Step 7: CI configured (optional)
- [ ] ⬜ Step 8: Learning stored (optional)

### Quality Metrics

- [ ] **All tests**: 100% passing ✅
- [ ] **Coverage**: ≥80% on changed lines
- [ ] **Mutation score**: ≥80%
- [ ] **Flakiness**: 0 flaky tests
- [ ] **PASS_TO_PASS**: 100% passing
- [ ] **Static checks**: No lint/type errors

### Documentation

- [ ] PR description complete
- [ ] Repro commands tested and working
- [ ] Coverage diff accurate
- [ ] Risks/follow-ups documented

### Integration with CLAUDE.md

- [ ] Used Sequential Thinking at key checkpoints
- [ ] Used Context7 for best practices validation
- [ ] Used Task Tool for parallel execution (where applicable)
- [ ] Followed NOVAE continuous execution control pattern

---

## 🚀 Ready to Merge

**All checklists complete?**

- [ ] **YES**: Proceed with merge ✅
- [ ] **NO**: Complete missing items before merging ⚠️

---

**Remember**: Test-First → Self-Debug → Quality Gates → Test-Linked PR

**Core Principle**: Never merge without GREEN tests and quality validation.
