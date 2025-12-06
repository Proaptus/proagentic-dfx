---
name: Test-Driven Development (TDD)
description: Agent-optimized Test-Driven Development workflow based on research from Codex, CodeT, Self-Debugging, TICoder, and SWE-bench Verified. Use when fixing bugs (generate fail-to-pass test first), implementing new features (acceptance tests first), or when user requests "TDD", "test-first", or "test-driven" approach. Provides high-confidence code changes with comprehensive test coverage.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Task
---

# Test-Driven Development (TDD) Skill

## 🚨 CRITICAL: READ THIS FIRST

### **THE TDD SKILL IS FOR BUILDING WORKING FEATURES, NOT JUST WRITING TESTS**

This Skill's PURPOSE is to **deliver complete, working features and bug fixes** with high confidence through test-driven validation.

**TESTS ARE A TOOL, NOT THE DELIVERABLE.**

- ❌ **FAILURE**: "I wrote tests that pass, my job is done"
- ✅ **SUCCESS**: "I wrote tests that validate the feature, implemented the feature to pass those tests, refactored for quality, validated quality gates, and delivered the complete working feature"

### ⚠️ CRITICAL LESSON: Tests Must Validate Real Code Behavior

**Mocked unit tests alone are INSUFFICIENT for React components:**
- ✅ Mocked tests can pass while real code is broken
- ✅ Mocked tests don't catch: infinite loops, useEffect dependency bugs, rendering issues
- ✅ Real-world example: 14/14 unit tests passing but app has infinite render loop in production

**Solution: Integration Tests Are MANDATORY For React Components**
- Always write integration tests with REAL React components (not mocked)
- Integration tests detect rendering issues mocked tests miss
- Integration tests run FIRST, unit tests run SECOND

### What TDD Actually Means (With Integration Testing)
1. **Tests define what needs to be built** (acceptance criteria)
   - For React: Integration tests with REAL component rendering (not mocked)
   - For logic: Unit tests for isolated functions
2. **Implementation satisfies those tests** (make tests pass)
   - Fix integration tests FIRST
   - Fix unit tests SECOND
3. **Refactor for code quality** (while keeping tests green)
4. **Validate quality gates** (coverage, mutation, flakiness)
5. **DELIVER THE COMPLETE FEATURE** (tests + code + documentation)

### You Must Complete ALL 8 Steps

This Skill has 8 steps. **You do NOT stop at step 2 (tests passing).** You must:
- ✅ Step 1: Write failing tests
- ✅ Step 2: Implement to make tests pass
- ✅ Step 3: (If needed) Multi-sample selection for hard problems
- ✅ Step 4: Refactor while keeping tests green
- ✅ Step 5: Run quality gates (coverage, mutation, flakiness)
- ✅ Step 6: Commit with test-linked summary
- ✅ Step 7: (Optional) CI/headless loops
- ✅ Step 8: (Optional) Post-merge learning

**NEVER deliver a feature with tests passing but step 4-6 incomplete.**

### Scope Governance Rule

When a user gives you explicit scope (e.g., "implement features A, B, and C"), you must:
1. Extract ALL deliverables from their request
2. Create a checklist of EVERY item
3. Implement EVERY item (not just some)
4. Verify checklist is 100% complete before finishing
5. Ask user BEFORE skipping any scope item

**You do NOT arbitrarily reduce scope.** If a user asks for features A, B, and C, you deliver A, B, and C—not just A because "B and C aren't part of the TDD workflow."

---

> **CRITICAL**: Read `/home/chine/projects/proagentic-clean/CLAUDE.md` completely before using this skill, especially:
> - Lines 105-225: MCP Tool Coordination (Sequential Thinking, Context7, Task Tool)
> - Lines 800-880: Continuous Execution Control patterns
> - This TDD skill integrates with and extends these patterns

## Overview

This skill implements an **agent-optimized Test-Driven Development process** based on peer-reviewed research demonstrating **12-46% absolute improvements** in code correctness when using test-first approaches with LLM coding agents.

### Research Foundations

- **Codex (OpenAI)**: Functional correctness via unit tests in sandbox ([arXiv:2107.03374](https://arxiv.org/pdf/2107.03374))
- **CodeT**: Multi-sample + test-based selection → **18.8% gain** in pass@1 ([arXiv:2208.11640](https://arxiv.org/abs/2208.11640))
- **Self-Debugging**: Run → Analyze → Fix loop → **12% improvement** ([ICLR 2024](https://proceedings.iclr.cc/paper_files/paper/2024/file/2460396f2d0d421885997dd1612ac56b-Paper-Conference.pdf))
- **TICoder**: Test-first clarification → **~46-point improvement** ([arXiv:2402.13521](https://arxiv.org/abs/2402.13521))
- **SWE-bench Verified (OpenAI)**: FAIL_TO_PASS and PASS_TO_PASS validation ([OpenAI Blog](https://openai.com/index/introducing-swe-bench-verified/))
- **SWT-Bench/Otter**: Issue-generated tests **double precision** ([Research](https://assets.amazon.science/46/bf/3743cf75474290526f1147d9373f/training-llms-to-better-self-debug-and-explain-code.pdf))

## When to Use This Skill

✅ **Activate TDD when**:
- User reports a bug (generate fail-to-pass test first)
- User requests new feature (acceptance tests before implementation)
- User explicitly asks for "TDD", "test-driven", or "test-first" approach
- User wants high-confidence changes with test coverage
- Fixing critical bugs that need reproducible validation
- Implementing complex logic that benefits from incremental validation

❌ **Don't use TDD for**:
- Simple documentation updates
- Configuration file changes
- Trivial refactoring without logic changes
- Exploratory coding/prototyping (unless user requests)

## The 8-Step Agent-Optimized TDD Process

### Step 0: Safe Harness & Environment (One-Time Setup)

**Before first TDD session**, set up safe test execution:

```bash
# Run sandbox setup script
./.claude/skills/tdd/scripts/helpers/sandbox-setup.sh

# Verify test infrastructure
npm test -- --version  # or pytest --version
```

**Requirements**:
- ✅ Hermetic sandbox (container/VM, no external network, CPU/memory limits)
- ✅ Unified test entry point (`npm test`, `pytest`, `go test`)
- ✅ Single-test execution capability (fast iteration)
- ✅ Deterministic environment (seeded randomness, mocked time/IO)

### Step 1: Turn Task Into Tests → 🔴 RED VALIDATION GATE (MANDATORY)

**🚨 CRITICAL: YOU MUST COMPLETE THIS ENTIRE STEP BEFORE STEP 2. NO EXCEPTIONS.**

**🚨 YOU CANNOT DO STEP 1 AND STEP 2 TOGETHER. THEY MUST BE SEQUENTIAL.**

#### Step 1A: Write Tests ONLY (No Implementation Code)

**Always generate tests BEFORE implementation.**

**RULES FOR STEP 1A**:
1. ✅ Write ONLY the test file
2. ❌ Do NOT write any implementation code
3. ❌ Do NOT edit the component/function being tested
4. ❌ Do NOT run implementation commands

**What you create in Step 1A**:
- ONE test file (e.g., `tests/integration/ComponentName.test.tsx`)
- Test cases that describe expected behavior
- Assertions for what should happen

**What you DO NOT create in Step 1A**:
- Implementation code
- Component changes
- Function changes
- Any fixes to make tests pass

---

#### Step 1B: 🔴 RED VALIDATION GATE - AUTOMATIC CHECKPOINT

**🤖 GATE EXECUTION: AUTOMATIC (NOT MANUAL)**
- You perform this validation automatically
- You do NOT stop and wait for user approval
- You show evidence to user, then proceed automatically to Step 2
- EXCEPTION: If user explicitly requests "manual gate reviews", then stop and wait

**🛑 YOU MUST RUN TESTS AND PROVE RED STATE BEFORE PROCEEDING TO STEP 2**

**MANDATORY ACTIONS** (cannot be skipped):

1. **RUN the test file you just created**:
   ```bash
   npm test -- tests/integration/YourTest.test.tsx --run
   ```

2. **CAPTURE the failure output** - Tests MUST FAIL:
   ```
   Expected output:
   ❌ FAIL tests/integration/YourTest.test.tsx
     ✗ your test name
       Expected: [something]
       Received: [current broken state]

   Test Files  1 failed (1)
   Tests  X failed (X)
   ```

3. **SHOW the evidence to the user**:
   - Display the actual command you ran
   - Display the actual failure output
   - Point out which tests failed
   - Explain why they failed (bug doesn't exist yet / feature not implemented)

4. **VERIFY RED state and PROCEED**:
   - ✅ Tests have been executed
   - ✅ Tests FAILED (RED confirmed)
   - ✅ Evidence shown to user
   - ✅ AUTOMATICALLY proceed to Step 2A (do NOT wait for user)

**⚠️ IF TESTS PASS AT THIS POINT**: You wrote the tests incorrectly. Tests should FAIL because the bug/feature doesn't exist yet. Fix the tests to actually validate the requirement.

**❌ FORBIDDEN ACTIONS**:
- Do NOT proceed to Step 2 without proving RED
- Do NOT claim "tests would fail" without running them
- Do NOT write implementation code yet
- Do NOT assume RED state without evidence

---

**🛑 AUTOMATIC CHECKPOINT: After proving RED state above with actual command output, AUTOMATICALLY proceed to Step 2**

---

⚠️ **FOR REACT COMPONENTS: Integration tests must be Step 1A, unit tests Step 1B**

#### For React Component Bug Fixes:

**Step 1A: Integration Test (FIRST - Real Component)**
1. Use `tdd-test-generator` subagent to create **integration test** with REAL React component
   - Use React Testing Library (not enzyme/shallow rendering)
   - Mount actual component with real props
   - Test actual DOM rendering
   - Test useEffect execution and dependencies
   - Verify test reproduces the bug (RED state)

**Agent Prompt**:
```
Generate a FAILING integration test for this React component bug:
[Bug description - e.g., "infinite render loop", "setState in useEffect dependencies"]

Requirements:
- Use React Testing Library (real component rendering, not mocked)
- Mount the actual component (not shallow/enzyme)
- Test actual DOM, not component internals
- Include assertions for: expected renders, no errors, proper state updates
- Test useEffect dependencies if hooks involved
- Test must FAIL on current code (RED state)
- No network calls, no sleeps

Example: For infinite loop bugs, test should:
1. Render component
2. Wait for stabilization
3. Assert NO "Maximum update depth exceeded" errors
4. This test FAILS with current broken code

Output: File path + test name
```

**Step 1B: Unit Test (SECOND - Isolated Logic)**
1. After integration test written, create unit test for isolated logic
2. Use mocks for child components and external dependencies
3. Test specific function/hook logic
4. Verify test fails (RED state)

**Agent Prompt**:
```
Generate a FAILING unit test for the isolated logic:
[Logic description - e.g., "calculateSomething function", "useCustomHook"]

Requirements:
- Test ONLY the logic being fixed
- Mock external dependencies
- Mock child components
- No actual rendering
- Test must FAIL on current code (RED state)

Output: File path + test name
```

#### For Non-React Bug Fixes:
1. Use `tdd-test-generator` subagent to create a **failing test** that reproduces the bug
2. Verify test fails on current code (RED state)
3. Validate test quality with safety script

**Agent Prompt**:
```
Generate ONLY a failing test (no implementation) that reproduces this bug:
[Bug description]

Requirements:
- Test must FAIL on current code
- Include minimal reproduction case
- Use repo's test framework
- Mock external dependencies
- No network, no sleeps, deterministic
- Clear assertions

Output: File path + test name
```

#### For New React Features:
**Step 1A: Integration Tests (FIRST - Real Component)**
1. Derive acceptance tests from specification using REAL component rendering
2. Include: happy path, boundary cases, negative cases
3. Test useEffect, hooks, state management with real component
4. Verify tests fail (RED state)

**Step 1B: Unit Tests (SECOND - Isolated Logic)**
1. Add unit tests for utility functions, hooks logic, data transformations
2. Include edge cases and error paths
3. Verify tests fail (RED state)

#### For New Non-React Features:
1. Derive acceptance tests from specification
2. Include: happy path, boundary cases, negative cases
3. Add property-based test if applicable
4. Verify tests fail (RED state)

#### Safety Check:
```bash
# Validate test quality (detect vacuous tests)
./.claude/skills/tdd/scripts/safety/validate-test-quality.py <test-file>

# Check for non-deterministic patterns
./.claude/skills/tdd/scripts/safety/check-deterministic.sh <test-file>

# For React components: Verify integration test doesn't mock rendering
grep -n "shallow\|mount.*shallow\|enzyme" <test-file> && echo "❌ FOUND MOCKED RENDERING" || echo "✅ Real rendering confirmed"
```

**Requirements for Step 1**:
- [ ] **For React components: Integration tests written FIRST** (with real component rendering)
- [ ] Integration tests FAIL on current code (RED confirmed)
- [ ] Unit tests written SECOND (after integration tests defined)
- [ ] Tests FAIL on current code (RED confirmed)
- [ ] No vacuous tests (validated by safety script)
- [ ] No network calls, sleeps, or non-deterministic behavior
- [ ] Clear assertions with meaningful error messages
- [ ] Mocked external dependencies (but NOT React component rendering for integration tests)
- [ ] For React: No shallow/enzyme mocking - use real React Testing Library

### Step 2: Implement to Green → 🟢 GREEN VALIDATION GATE (MANDATORY)

**🚨 CRITICAL: YOU MUST HAVE COMPLETED STEP 1 RED GATE BEFORE STARTING THIS STEP**

**🚨 VERIFY BEFORE PROCEEDING**: Did you prove RED state in Step 1? If not, go back to Step 1B.

#### Step 2A: Implement Minimal Fix (Only After RED Confirmed)

**Fix ONE failing test at a time** using the self-debugging loop.

**RULES FOR STEP 2A**:
1. ✅ Now (and only now) edit the implementation file
2. ✅ Make the SMALLEST change to fix the failing test
3. ❌ Do NOT refactor yet (that's Step 4)
4. ❌ Do NOT add extra features

**What you change in Step 2A**:
- The component/function being tested
- ONLY what's needed to make test pass
- Minimal code changes

---

#### Step 2B: 🟢 GREEN VALIDATION GATE - AUTOMATIC CHECKPOINT

**🤖 GATE EXECUTION: AUTOMATIC (NOT MANUAL)**
- You perform this validation automatically
- You do NOT stop and wait for user approval
- You show evidence to user, then proceed automatically to Step 4
- EXCEPTION: If user explicitly requests "manual gate reviews", then stop and wait

**🛑 YOU MUST RUN TESTS AND PROVE GREEN STATE**

**MANDATORY ACTIONS** (cannot be skipped):

1. **RUN the SAME test file again**:
   ```bash
   npm test -- tests/integration/YourTest.test.tsx --run
   ```

2. **CAPTURE the success output** - Tests MUST PASS:
   ```
   Expected output:
   ✓ PASS tests/integration/YourTest.test.tsx
     ✓ your test name (XXXms)

   Test Files  1 passed (1)
   Tests  X passed (X)
   ```

3. **SHOW the evidence to the user**:
   - Display the actual command you ran
   - Display the actual success output
   - Show that tests now PASS
   - Explain the RED→GREEN transition

4. **VERIFY GREEN state and PROCEED**:
   - ✅ Tests have been executed
   - ✅ Tests PASSED (GREEN confirmed)
   - ✅ Evidence shown to user
   - ✅ AUTOMATICALLY proceed to Step 4 (do NOT wait for user)

**⚠️ IF TESTS STILL FAIL**: Use self-debug loop (max 3 iterations), then show results. Do not proceed until GREEN.

**❌ FORBIDDEN ACTIONS**:
- Do NOT proceed to Step 4 without proving GREEN
- Do NOT claim "tests pass" without running them
- Do NOT skip showing evidence
- Do NOT assume GREEN state without proof

---

**🛑 AUTOMATIC CHECKPOINT: After proving GREEN state above with actual command output, AUTOMATICALLY proceed to Step 4**

---

⚠️ **FOR REACT COMPONENTS: Fix integration tests BEFORE unit tests**

#### For React Components: Fix Integration Tests First

**Progression for React**:
```
Fix integration test 1 → GREEN
↓
Fix integration test 2 → GREEN  (if multiple)
↓
Now fix unit tests 1 → GREEN
↓
Fix unit tests 2 → GREEN  (if multiple)
↓
Run full test suite (integration + unit)
↓
All green: Proceed to Step 3 or 4
```

**Why this order?**
- Integration tests catch real rendering issues
- Once rendering is fixed, unit tests usually pass quickly
- This prevents "mocked tests pass, real code broken" syndrome

#### Single-Test Focus (Claude Code Pattern):
```bash
# Run ONLY the failing test (fast iteration)
./.claude/skills/tdd/scripts/helpers/run-single-test.sh <test-suite::test-case>

# For React integration tests (real rendering, slower)
npm test -- tests/integration/ComponentName.test.tsx --run

# For unit tests (mocked, faster)
npm test -- tests/unit/ComponentName.test.tsx --run
```

#### Self-Debug Loop (Chen et al. Pattern):
1. **Run** the single failing test (integration first)
2. **Analyze** the error/traceback (actual React error, not mocked)
3. **Hypothesize** 2-3 root causes
4. **Propose** minimal patch
5. **Apply** patch and re-run
6. **Iterate** up to 3 times if still failing

**Use `tdd-self-debugger` subagent**:
```
Fix exactly the failing test: <suite::case>

For React integration test failures:
1. Explain the error in one sentence (look for "Maximum update depth", rendering errors, etc)
2. Propose 2-3 hypotheses for root cause (likely: dependency array, stale closure, circular state update)
3. Apply the SMALLEST patch to fix (change 1 thing: remove from dependencies, fix closure, etc)
4. Run integration test to verify it passes

For unit test failures (after integration tests pass):
1. Explain the error in one sentence
2. Propose 2-3 hypotheses
3. Apply the SMALLEST patch
4. Run unit test to verify

If still failing after 3 iterations, escalate for human review.
```

#### Progression:
```
Fix integration test 1 → GREEN
↓
Integration test still failing? Use 3-iteration self-debug loop
↓
Run full integration test suite
↓
Fix unit tests (same loop)
↓
If new failures: Fix next failing test
If all green: Proceed to Step 3 or 4
```

**Requirements for Step 2**:
- [ ] **For React: Integration tests fixed FIRST** (real rendering issues)
- [ ] Integration tests all GREEN before moving to unit tests
- [ ] Fix ONE test at a time (no batch fixes)
- [ ] Use self-debug loop: run → analyze → fix → repeat
- [ ] Apply minimal changes (no gold-plating)
- [ ] Single test GREEN before moving to next
- [ ] **Unit tests fixed SECOND** (isolated logic)
- [ ] Full test suite GREEN before proceeding
- [ ] Run static checks (lint, type check)

### Step 3: Multi-Sample & Select (For Hard Problems)

**When single-shot fails or problem is complex**, use multi-sampling.

#### Use `tdd-multi-sampler` subagent:
```
Generate 3-5 fix candidates for: <failing-test>

For each candidate:
1. Use different strategy/approach
2. Keep changes minimal
3. Document approach

Then:
1. Run test suite on each candidate
2. Rank by pass rate
3. Select candidate with highest pass rate
4. If tie: Select simplest implementation
```

#### Selection Criteria (CodeT Pattern):
```python
for candidate in candidates:
    pass_rate = run_tests(candidate)
    rank_candidates_by_pass_rate()

best_candidate = max(candidates, key=lambda c: c.pass_rate)
```

**Requirements for Step 3**:
- [ ] Generate 3-5 diverse candidates
- [ ] Each uses different strategy/approach
- [ ] Run full test suite on each
- [ ] Select by pass rate (CodeT method)
- [ ] Tie-breaker: simplest implementation
- [ ] Document why winner was chosen

### Step 4: Refactor While Staying Green → 🟢 GREEN MAINTENANCE GATE (MANDATORY)

**🚨 CRITICAL: YOU MUST HAVE COMPLETED STEP 2 GREEN GATE BEFORE REFACTORING**

**🚨 VERIFY BEFORE PROCEEDING**: Did you prove GREEN state in Step 2? If not, go back to Step 2B.

#### Step 4A: Make ONE Refactor at a Time

**With tests passing**, improve code quality without breaking tests.

**RULES FOR STEP 4A**:
1. ✅ Identify ONE code smell or improvement
2. ✅ Make ONE small refactor (do not batch changes)
3. ✅ Do NOT change behavior
4. ❌ Do NOT make multiple refactors before testing

---

#### Step 4B: 🟢 GREEN MAINTENANCE GATE - AUTOMATIC CHECKPOINT

**🤖 GATE EXECUTION: AUTOMATIC (NOT MANUAL)**
- You perform this validation automatically after EACH refactor
- You do NOT stop and wait for user approval
- You show evidence to user, then proceed automatically to next refactor or Step 5
- EXCEPTION: If user explicitly requests "manual gate reviews", then stop and wait

**🛑 AFTER EACH REFACTOR, YOU MUST RUN TESTS AND PROVE STILL GREEN**

**MANDATORY ACTIONS** (cannot be skipped, MUST repeat after EACH refactor):

1. **RUN tests after this ONE refactor**:
   ```bash
   npm test -- tests/integration/YourTest.test.tsx --run
   ```

2. **CAPTURE the output** - Tests MUST STILL PASS:
   ```
   Expected output:
   ✓ PASS tests/integration/YourTest.test.tsx
     ✓ your test name (XXXms)

   Test Files  1 passed (1)
   Tests  X passed (X)
   ```

3. **VERIFY no regressions**:
   - Tests still pass after refactor
   - No new failures introduced
   - Behavior unchanged

4. **IF TESTS FAIL**: Revert the refactor immediately, it broke something

5. **REPEAT this gate** for next refactor (one refactor → one test run → repeat)

**❌ FORBIDDEN ACTIONS**:
- Do NOT make multiple refactors before testing
- Do NOT batch refactors together
- Do NOT skip testing after each refactor
- Do NOT assume tests still pass without running them

---

**🛑 AUTOMATIC CHECKPOINT: After EACH refactor, prove tests still GREEN, then AUTOMATICALLY proceed to next refactor or Step 5.**

---

#### Refactoring Rules:
- ✅ Tests must stay GREEN throughout
- ✅ PASS_TO_PASS tests must never break (SWE-bench pattern)
- ✅ Run tests after EVERY refactor step
- ✅ Run lint/type checks continuously

**Use Context7 for refactoring patterns**:
```javascript
// Before refactoring
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/facebook/react",
  topic: "modern refactoring patterns and hooks"
})
```

#### Refactoring Loop:
```
1. Identify code smell or improvement
2. Make small refactor (single responsibility)
3. Run affected tests → must stay GREEN
4. Run full test suite → all GREEN
5. Repeat for next improvement
```

**Requirements for Step 4**:
- [ ] All tests GREEN before refactoring
- [ ] Tests stay GREEN after each refactor step
- [ ] PASS_TO_PASS tests never break
- [ ] Run lint/type checks after refactoring
- [ ] Use Context7 to verify modern patterns
- [ ] Small incremental changes (not big rewrites)

### Step 5: Quality Gates & Regressions → 📊 QUALITY VALIDATION GATE (MANDATORY)

**🚨 CRITICAL: YOU MUST HAVE COMPLETED STEP 4 BEFORE RUNNING QUALITY GATES**

**🚨 VERIFY BEFORE PROCEEDING**: Did all your refactors maintain GREEN state? If not, go back to Step 4B.

#### Step 5A: Run Full Test Suite

**Before merging**, validate code quality with automated gates.

**MANDATORY: Run ENTIRE test suite (not just your new tests)**

```bash
npm test --run
```

---

#### Step 5B: 📊 QUALITY VALIDATION GATE - AUTOMATIC CHECKPOINT

**🤖 GATE EXECUTION: AUTOMATIC (NOT MANUAL)**
- You perform this validation automatically
- You do NOT stop and wait for user approval
- You show evidence to user, then proceed automatically to create summary/PR
- EXCEPTION: If user explicitly requests "manual gate reviews", then stop and wait

**🛑 YOU MUST RUN FULL TEST SUITE AND PROVE PASS_TO_PASS**

**MANDATORY ACTIONS** (cannot be skipped):

1. **RUN full test suite**:
   ```bash
   npm test --run
   ```

2. **CAPTURE the full suite output**:
   ```
   Expected output:
   Test Files  XX passed (XX)
   Tests  XXX passed (XXX)
   Duration  XXXXms

   All tests passing
   ```

3. **VERIFY PASS_TO_PASS validation**:
   - All existing tests still pass
   - No regressions introduced
   - New tests pass
   - Full suite GREEN

4. **SHOW evidence to user**:
   - Display full test summary
   - Confirm all tests pass
   - Show no regressions

5. **VERIFY quality gates and PROCEED**:
   - ✅ Full test suite executed
   - ✅ All tests pass (PASS_TO_PASS confirmed)
   - ✅ Evidence shown to user
   - ✅ AUTOMATICALLY proceed to Step 6 (create summary/PR)

**❌ FORBIDDEN ACTIONS**:
- Do NOT create PR without running full suite
- Do NOT skip PASS_TO_PASS validation
- Do NOT assume existing tests still pass
- Do NOT proceed if any tests fail

---

**🛑 AUTOMATIC CHECKPOINT: After proving quality gates above with full test suite output, AUTOMATICALLY proceed to Step 6**

---

#### Use `tdd-quality-gatekeeper` subagent:
```
Run quality gates on changes:

1. Coverage threshold (≥80% or project baseline)
2. Mutation testing (quick mode on changed lines)
3. Flakiness detection (run tests 3x)
4. PASS_TO_PASS validation (no broken existing tests)
5. Security static analysis (on diff)
```

#### Quality Gate Scripts:
```bash
# Coverage gate (fails if below threshold)
./.claude/skills/tdd/scripts/quality/coverage-gate.sh

# Mutation testing on changed lines
./.claude/skills/tdd/scripts/quality/mutation-test.sh

# Flakiness check (run 3x)
./.claude/skills/tdd/scripts/quality/flakiness-check.sh
```

#### Coverage Requirements:
```bash
# Minimum coverage on changed code
COVERAGE_THRESHOLD=80  # or project-specific baseline

# Report must show:
# - Line coverage ≥ threshold
# - Branch coverage ≥ threshold
# - No untested critical paths
```

#### Mutation Testing (Fast Mode):
```bash
# Mutate changed lines and verify tests catch mutations
# If mutation survives → tests are weak → add better assertions
```

**Requirements for Step 5**:
- [ ] Coverage meets threshold (80%+ or baseline)
- [ ] Mutation tests catch injected bugs
- [ ] Tests pass 3 consecutive runs (no flakiness)
- [ ] PASS_TO_PASS tests all passing
- [ ] No security issues in diff
- [ ] Tests don't assume network/system state

### Step 6: Commit, Summarize, and Open PR

**Compose PR that links tests to changes.**

#### Use PR Template:
```bash
# Generate PR using template
cat ./.claude/skills/tdd/templates/pr-test-summary.md
```

#### PR Requirements:
- **Link each test to each change**: "Test `X` failed before patch `Y`; now passes because..."
- **Repro commands**: "To re-run failing test: `npm test -- path/to/test::case -t 'test name'`"
- **Coverage report**: Include coverage diff
- **Test evidence**: Show before/after test results

**Example PR Description**:
```markdown
## Changes
- Fixed bug in `userAuth.ts` where tokens expired prematurely

## Tests
### Fail-to-Pass Tests
- ✅ `userAuth.test.ts::should handle expired tokens`
  - **Before**: Failed with "Cannot read property 'user' of null"
  - **After**: Passes with proper token refresh
  - **Repro**: `npm test -- userAuth.test.ts -t 'expired tokens'`

### Pass-to-Pass Tests (Regression Check)
- ✅ All 47 existing auth tests still pass

## Coverage
- Changed lines: 95% coverage (12/13 lines)
- Overall: 83% → 84% (+1%)

## Quality Gates
- ✅ Coverage threshold: 80% (met)
- ✅ Mutation tests: 8/8 caught
- ✅ Flakiness: 0 (3/3 runs passed)
- ✅ PASS_TO_PASS: 100% (47/47 passing)
```

**Requirements for Step 6**:
- [ ] Each test linked to specific change
- [ ] Repro commands for all new tests
- [ ] Coverage diff included
- [ ] Test results (before/after) shown
- [ ] Quality gate results documented
- [ ] Risks and follow-ups noted

### Step 7: CI - Headless Agent Loops

**In CI pipeline**, run autonomous TDD loops for issues.

#### Headless TDD Workflow:
```yaml
# CI configuration for headless TDD
name: Headless TDD Agent
on: [issues]

jobs:
  tdd-agent:
    steps:
      1. Parse issue and generate fail-to-pass test
      2. Verify test fails on main branch
      3. Run bounded fix loop (max 5 iterations)
      4. If tests pass: Open PR with changes
      5. If tests fail: Comment on issue with progress
```

#### Headless Agent Behavior:
- **Auto-triage**: Convert issues into failing tests
- **Bounded loop**: Max 5 fix iterations (prevent runaway)
- **PR on success**: Auto-create PR if tests pass
- **Human escalation**: Comment if stuck after 5 iterations

**Requirements for Step 7**:
- [ ] CI configured for headless mode
- [ ] Issues auto-converted to tests
- [ ] Bounded iteration (prevent infinite loops)
- [ ] PRs auto-created on success
- [ ] Human escalation on failure
- [ ] Audit trail of agent decisions

### Step 8: Post-Merge Learning

**After merge**, capture examples for future improvement.

#### Learning Repository:
```
Store tuples: (issue → failing test → final patch)

Example:
{
  "issue": "Tokens expire prematurely #123",
  "test": "tests/auth/userAuth.test.ts::should handle expired tokens",
  "patch": "src/auth/userAuth.ts:45-52",
  "outcome": "PASS",
  "iterations": 2
}
```

#### Use Cases:
- **Retrieval**: Few-shot examples for similar issues
- **Fine-tuning**: Build dataset of test-first trajectories
- **Analysis**: Identify patterns in successful fixes

**Requirements for Step 8**:
- [ ] Store (issue → test → patch) tuples
- [ ] Tag by issue type and domain
- [ ] Build retrieval index
- [ ] Periodically analyze patterns
- [ ] Consider fine-tuning on successful trajectories

---

## Safety Rules

### 🔴 NEVER (Critical for React Components):
- ❌ **NEVER rely on mocked unit tests ALONE for React components**
- ❌ **NEVER skip integration tests for components with hooks (useState, useEffect)**
- ❌ **NEVER use shallow rendering or enzyme for critical component tests**
- ❌ Assume unit tests passing means component works correctly
- ❌ Skip testing useEffect dependencies
- ❌ Test only "logic" without testing actual rendering

### 🔴 NEVER (All Code):
- ❌ Implement before writing tests
- ❌ Skip test quality validation
- ❌ Allow tests with network calls
- ❌ Use sleeps or time-dependent waits
- ❌ Accept vacuous tests (no assertions, always-true)
- ❌ Break PASS_TO_PASS tests during refactoring
- ❌ Merge without quality gates passing

### ✅ ALWAYS (For React Components):
- ✅ **Write integration tests FIRST for React components** (with real rendering)
- ✅ **Test actual DOM, not component internals**
- ✅ **Use React Testing Library (not enzyme shallow)**
- ✅ **Test useEffect hooks and their dependencies explicitly**
- ✅ **Detect infinite loops and render storms** (assert no "Maximum update depth" errors)
- ✅ **Verify actual state changes in real rendering**, not mocked versions

### ✅ ALWAYS (All Code):
- ✅ Generate failing tests FIRST
- ✅ Validate test quality before implementing
- ✅ Fix ONE test at a time
- ✅ Run tests in hermetic sandbox
- ✅ Use deterministic mocks for external deps (but NOT for React rendering)
- ✅ Run full suite before declaring done
- ✅ Check coverage and mutation tests
- ✅ Link tests to changes in PR

---

## Integration with CLAUDE.md Patterns

This TDD skill **extends** the NOVAE workflow defined in CLAUDE.md:

**🚨 CRITICAL CHANGE: PURELY SEQUENTIAL EXECUTION WITH MANDATORY GATES**

### Before TDD Loop:
1. **Sequential Thinking**: Analyze task, plan test strategy
2. **Context7**: Verify testing best practices for frameworks

### During TDD Loop:
3. **Sequential Execution ONLY**: NO parallel task execution - one step at a time
4. **Mandatory Gates**: STOP at each validation gate and prove state before proceeding
5. **Sequential Thinking**: Self-debug loop (analyze → fix → verify)
6. **Context7**: Validate implementations against library patterns

### After TDD Loop:
6. **Sequential Thinking**: Verify completeness, assess quality
7. **Context7**: Final check against best practices
8. **Playwright**: E2E validation for UI changes

**Example Integration**:
```javascript
// Step 1: Analyze task
mcp__sequential-thinking__sequentialthinking({
  thought: "Bug fix requires fail-to-pass test. Will generate test first, verify it fails, then implement minimal fix using self-debug loop.",
  thoughtNumber: 1,
  totalThoughts: 3,
  nextThoughtNeeded: true
})

// Step 2: Get testing best practices
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/facebook/jest",
  topic: "testing async functions and error handling"
})

// Step 3: Generate test (TDD Step 1)
// Use tdd-test-generator subagent...

// Step 4: Self-debug fix loop (TDD Step 2)
// Use tdd-self-debugger subagent...

// Step 5: Validate quality
mcp__sequential-thinking__sequentialthinking({
  thought: "Tests pass, coverage meets threshold, no flakiness. Implementation follows Context7 patterns. Ready for PR.",
  thoughtNumber: 3,
  totalThoughts: 3,
  nextThoughtNeeded: false
})
```

---

## Subagents

This skill uses 4 specialized subagents:

1. **`tdd-test-generator`**: Generate failing tests from specs/issues
2. **`tdd-self-debugger`**: Analyze failures and propose minimal fixes
3. **`tdd-quality-gatekeeper`**: Run coverage/mutation/flakiness checks
4. **`tdd-multi-sampler`**: Generate and select best fix candidate

See `.claude/agents/tdd-*.md` for subagent details.

---

## Templates

- `templates/vitest-test-template.ts` - TypeScript/Vitest unit tests
- `templates/jest-test-template.tsx` - React component tests
- `templates/pytest-test-template.py` - Python/pytest tests (if needed)
- `templates/playwright-test-template.ts` - E2E tests
- `templates/self-debug-analysis.md` - Self-debugging analysis
- `templates/pr-test-summary.md` - PR template

---

## Quality Scripts

Run these scripts as part of TDD workflow:

```bash
# Safety validation
./scripts/safety/validate-test-quality.py <test-file>
./scripts/safety/check-deterministic.sh <test-file>

# Quality gates
./scripts/quality/coverage-gate.sh
./scripts/quality/mutation-test.sh
./scripts/quality/flakiness-check.sh

# Helpers
./scripts/helpers/run-single-test.sh <suite::case>
./scripts/helpers/sandbox-setup.sh
```

---

## Quick Reference

See `QUICK_REFERENCE.md` for one-page cheat sheet.

## Usage Examples

See `USAGE_EXAMPLES.md` for 6 detailed scenarios.

## Completion Checklist

See `CHECKLIST.md` for step-by-step verification.

---

## Troubleshooting

**Q: Test generation creates vacuous tests (no assertions)**
A: Run `./scripts/safety/validate-test-quality.py` to detect and reject

**Q: Tests are flaky (non-deterministic)**
A: Run `./scripts/safety/check-deterministic.sh` to find patterns like sleep, random, time

**Q: Self-debug loop stuck after 3 iterations**
A: Escalate to human review, may need architecture change

**Q: Mutation tests show weak assertions**
A: Add property-based tests or strengthen assertions

**Q: Coverage below threshold**
A: Generate additional test cases for uncovered branches

---

## Research Citations

1. Chen et al., "Teaching Large Language Models to Self-Debug" (ICLR 2024)
2. OpenAI, "Evaluating Large Language Models Trained on Code" (arXiv:2107.03374)
3. CodeT: "Code Generation with Generated Tests" (arXiv:2208.11640)
4. TICoder: "Test-Driven Development for Code Generation" (arXiv:2402.13521)
5. OpenAI, "Introducing SWE-bench Verified" (2025)
6. Anthropic, "Claude Code Best Practices" (2025)
7. Amazon Science, "Training LLMs to Better Self-Debug and Explain Code" (2024)

---

**For full documentation**, see `README.md`.

**For quick reference**, see `QUICK_REFERENCE.md`.

**For examples**, see `USAGE_EXAMPLES.md`.
