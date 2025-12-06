# TDD Skill Quick Reference

## 🚨 CRITICAL: COMPLETE ALL 8 STEPS - DO NOT SKIP STEPS 4-6

**TESTS PASSING IS NOT COMPLETION.** You must:
1. ✅ Write failing tests (Step 1)
2. ✅ Implement code to pass tests (Step 2)
3. ✅ (If needed) Multi-sample selection (Step 3)
4. ✅ **Refactor while keeping tests green (Step 4) - DO NOT SKIP**
5. ✅ **Run quality gates (Step 5) - DO NOT SKIP**
6. ✅ **Commit and create PR (Step 6) - DO NOT SKIP**

**NEVER deliver incomplete features.** If user asks for features A, B, C, deliver all three—not just A.

---

## The Agent-Optimized TDD Loop

```
RED → GREEN → REFACTOR → QUALITY GATES → MERGE
 ↑                                          |
 └──────────────────────────────────────────┘
```

## 8-Step Process (At a Glance)

| Step | Action | Key Tool | Output |
|------|--------|----------|--------|
| **0** | Setup sandbox | `sandbox-setup.sh` | Safe test environment |
| **1** | Generate failing tests | `tdd-test-generator` | RED state confirmed |
| **2** | Fix one test at a time | `tdd-self-debugger` | GREEN state |
| **3** | Multi-sample (if hard) | `tdd-multi-sampler` | Best fix selected |
| **4** | Refactor while green | Context7 + tests | Improved code |
| **5** | Run quality gates | `tdd-quality-gatekeeper` | Quality validated |
| **6** | Create PR | `pr-test-summary.md` | Test-linked PR |
| **7** | CI headless loop | Automated TDD | Auto-PRs |
| **8** | Store examples | Learning repo | Future retrieval |

## Agent Checklists

### ✅ Test-First Checklist

- [ ] For bugs: generate **fail-to-pass** test (must fail now)
- [ ] For features: write acceptance tests (happy, boundary, negative, property)
- [ ] No network, no sleeps, deterministic seeds
- [ ] Validate with `validate-test-quality.py`
- [ ] Confirm RED state before implementing

### ✅ Implement Checklist

- [ ] Fix **ONE test at a time** (single-test focus)
- [ ] Run single test: `run-single-test.sh <suite::case>`
- [ ] Self-debug loop: run → analyze → hypothesize → fix (max 3 iterations)
- [ ] Test GREEN before moving to next
- [ ] Run full suite when all tests fixed
- [ ] Run static checks (lint, type check)

### ✅ Quality Checklist

- [ ] Coverage on changed code ≥ threshold (80%): `coverage-gate.sh`
- [ ] Mutation tests on changed lines: `mutation-test.sh`
- [ ] No flakiness (3× rerun): `flakiness-check.sh`
- [ ] PASS_TO_PASS tests unaffected
- [ ] Security scan on diff
- [ ] Tests don't assume network/system state

### ✅ PR Checklist

- [ ] Link each change to a test
- [ ] Include "repro" commands for each test
- [ ] Show coverage diff
- [ ] Document risks and follow-ups
- [ ] Use `pr-test-summary.md` template

## Common Commands

### Run Tests

```bash
# Full test suite
npm test

# Single test (FAST - use during Step 2)
npm test -- path/to/test.ts -t "test name"
./scripts/helpers/run-single-test.sh path/to/test.ts::test-name

# Watch mode (development)
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Safety Validation

```bash
# Detect vacuous tests (no/weak assertions)
./scripts/safety/validate-test-quality.py tests/path/to/test.ts

# Check for non-deterministic patterns
./scripts/safety/check-deterministic.sh tests/path/to/test.ts
```

### Quality Gates

```bash
# Coverage threshold check
./scripts/quality/coverage-gate.sh

# Mutation testing (changed lines only)
./scripts/quality/mutation-test.sh

# Flakiness detection (run 3x)
./scripts/quality/flakiness-check.sh
```

### Setup

```bash
# One-time sandbox setup
./scripts/helpers/sandbox-setup.sh
```

## Agent Prompts

### Generate Fail-to-Pass Test (Step 1)

```
Generate ONLY a failing test (no implementation) that reproduces this bug:
[Bug description]

Requirements:
- Test must FAIL on current code
- Include minimal reproduction case
- Use repo's test framework (Vitest/Jest)
- Mock external dependencies (no real network)
- No sleeps, deterministic seeds
- Clear assertions with meaningful error messages

Output: File path + test name
```

### Generate Acceptance Tests (Step 1)

```
Generate acceptance tests (no implementation) for this feature:
[Feature specification]

Include:
- Happy path test
- Boundary cases (2-3 tests)
- Negative/error cases (2-3 tests)
- 1 property-based test (if applicable)

All tests must FAIL now. Use mocks for external dependencies.

Output: Test file path with all test names
```

### Self-Debug Fix (Step 2)

```
Fix exactly the failing test: <suite::case>

1. Explain the error in one sentence
2. Propose 2-3 hypotheses for root cause
3. Apply the SMALLEST patch to fix
4. Run single test to verify

If still failing after 3 iterations, escalate for human review.

Output: Applied patch + test result
```

### Multi-Sample Selection (Step 3)

```
Generate 3-5 fix candidates for: <failing-test>

For each candidate:
1. Use different strategy/approach
2. Keep changes minimal
3. Document approach in comment

Then:
1. Run test suite on each candidate
2. Rank by pass rate
3. Select candidate with highest pass rate
4. If tie: Select simplest implementation

Output: Winner candidate + rationale
```

### Refactor While Green (Step 4)

```
Refactor [code area] for [goal: clarity/performance/etc]

Rules:
1. Tests must stay GREEN after EVERY change
2. PASS_TO_PASS tests must never break
3. Make small incremental changes
4. Run tests after each change
5. Follow Context7 best practices

Output: Refactored code + test results
```

## Subagent Quick Reference

| Subagent | Purpose | When to Use |
|----------|---------|-------------|
| **tdd-test-generator** | Generate failing tests | Step 1 (Test-First) |
| **tdd-self-debugger** | Analyze failures, propose fixes | Step 2 (Implement to Green) |
| **tdd-multi-sampler** | Generate & select best fix | Step 3 (Hard problems) |
| **tdd-quality-gatekeeper** | Run quality checks | Step 5 (Quality Gates) |

## Integration with CLAUDE.md Patterns

### Continuous Execution Control Flow

```javascript
// BEFORE TDD
Sequential Thinking → Analyze task, plan test strategy
Context7 → Get testing best practices

// DURING TDD (Steps 1-4)
Task Tool → Parallel test generation
Sequential Thinking → Self-debug analysis
Context7 → Validate patterns

// AFTER TDD (Steps 5-6)
Task Tool → Quality gates
Sequential Thinking → Verify completeness
Context7 → Final validation
```

## Research-Backed Gains

| Pattern | Source | Impact |
|---------|--------|--------|
| Multi-sampling + test selection | CodeT | **+18.8% pass@1** |
| Self-debug loop | Chen et al. (ICLR 2024) | **+12% accuracy** |
| Test-first clarification | TICoder | **~46-point gain** |
| Issue-generated tests | SWT-Bench/Otter | **2x precision** |

## Safety Rules

### 🔴 NEVER

- ❌ Implement before writing tests
- ❌ Accept vacuous tests (no assertions)
- ❌ Allow network calls in tests
- ❌ Use sleeps or non-deterministic waits
- ❌ Break PASS_TO_PASS tests
- ❌ Merge without quality gates

### ✅ ALWAYS

- ✅ Generate failing tests FIRST
- ✅ Validate test quality before implementing
- ✅ Fix ONE test at a time
- ✅ Use deterministic mocks
- ✅ Run full suite before declaring done
- ✅ Check coverage and mutation tests
- ✅ Link tests to changes in PR

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Vacuous tests | Run `validate-test-quality.py` → regenerate |
| Flaky tests | Run `check-deterministic.sh` → fix patterns |
| Stuck self-debug (3 iterations) | Use multi-sampling (Step 3) or escalate |
| Low coverage | Generate tests for uncovered branches |
| Weak assertions (mutations survive) | Add property-based tests, strengthen assertions |
| PASS_TO_PASS breaks | Stop, revert, refactor incrementally |

## Template Locations

- **Vitest**: `templates/vitest-test-template.ts`
- **React**: `templates/jest-test-template.tsx`
- **Playwright**: `templates/playwright-test-template.ts`
- **pytest**: `templates/pytest-test-template.py`
- **Self-debug**: `templates/self-debug-analysis.md`
- **PR**: `templates/pr-test-summary.md`

## Script Locations

- **Safety**: `scripts/safety/validate-test-quality.py`, `check-deterministic.sh`
- **Quality**: `scripts/quality/coverage-gate.sh`, `mutation-test.sh`, `flakiness-check.sh`
- **Helpers**: `scripts/helpers/run-single-test.sh`, `sandbox-setup.sh`

## Key Performance Metrics

✅ **Success Metrics**:
- All tests pass before merge
- Coverage ≥ 80% (or project baseline)
- Zero flaky tests (3× rerun)
- 100% PASS_TO_PASS tests passing
- All mutations caught by tests

## Resources

- **Full docs**: `README.md`
- **Examples**: `USAGE_EXAMPLES.md`
- **Checklist**: `CHECKLIST.md`
- **Architecture**: `ARCHITECTURE_PLAN.md`

---

**Remember**: Test-First → Self-Debug Loop → Quality Gates → Test-Linked PR

**Core Pattern**: RED (failing test) → GREEN (minimal fix) → REFACTOR (improve) → VALIDATE (quality gates)
