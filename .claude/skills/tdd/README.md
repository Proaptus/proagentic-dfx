# Test-Driven Development (TDD) Skill

## Overview

The TDD skill implements a research-backed, **agent-optimized Test-Driven Development workflow** proven to improve AI coding agent correctness by **12-46% absolute** on standard benchmarks.

### What This Skill Does

✅ Generates **failing tests first** before implementation (fail-to-pass pattern)
✅ Implements fixes using **tight self-debug loops** (run → analyze → fix → repeat)
✅ Uses **multi-sampling + test-based selection** for hard problems
✅ Enforces **quality gates** (coverage, mutation testing, flakiness detection)
✅ Protects **regression tests** (PASS_TO_PASS validation)
✅ Generates **test-linked PRs** with reproducible commands

### Research Foundations

This skill synthesizes patterns from 7 peer-reviewed papers and production systems:

| Source | Pattern | Impact |
|--------|---------|--------|
| **Codex (OpenAI)** | Unit tests as correctness check in sandbox | Established HumanEval benchmark |
| **CodeT** | Multi-sample + test-based selection | **+18.8% pass@1** |
| **Self-Debugging (ICLR 2024)** | Run → Analyze → Fix loop | **+12% accuracy** |
| **TICoder** | Test-first clarification | **~46-point improvement** |
| **SWE-bench Verified (OpenAI)** | FAIL_TO_PASS + PASS_TO_PASS validation | Industry standard for agents |
| **SWT-Bench/Otter** | Issue-generated fail-to-pass tests | **2x precision** |
| **Claude Code Best Practices (Anthropic)** | Single-test focus, autonomous loops | Production agent patterns |

## When to Use This Skill

### ✅ Use TDD Skill For:

- **Bug fixes**: Generate reproducible fail-to-pass test first
- **New features**: Create acceptance tests before implementation
- **Critical code**: High-stakes logic that needs test validation
- **Complex algorithms**: Incremental validation through test steps
- **Refactoring**: Ensure no regressions during code improvements
- **High coverage requirements**: Projects with strict coverage thresholds

### ❌ Don't Use TDD Skill For:

- Simple documentation updates
- Configuration file changes
- Trivial refactoring (no logic changes)
- Exploratory prototyping (unless explicitly requested)
- Quick fixes in non-critical code (unless user requests TDD)

## The 8-Step TDD Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  Step 0: Safe Harness & Environment (One-Time Setup)        │
│  → Hermetic sandbox, unified test entry, single-test CLI    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Turn Task Into Tests (Test-First)                  │
│  → For bugs: Generate fail-to-pass test                     │
│  → For features: Create acceptance tests                    │
│  → Validate test quality, confirm RED state                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Implement to Green (Tight Self-Debug Loop)         │
│  → Fix ONE test at a time                                   │
│  → Run → Analyze → Hypothesize → Fix → Repeat              │
│  → Max 3 iterations per test                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Multi-Sample & Select (For Hard Problems)          │
│  → Generate 3-5 fix candidates                              │
│  → Run test suite on each                                   │
│  → Select by pass rate (CodeT method)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Refactor While Staying Green                       │
│  → Improve code quality                                     │
│  → Keep all tests GREEN                                     │
│  → PASS_TO_PASS tests must never break                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Quality Gates & Regressions                        │
│  → Coverage threshold check (≥80%)                          │
│  → Mutation testing on changed lines                        │
│  → Flakiness detection (run 3x)                             │
│  → PASS_TO_PASS validation                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Commit, Summarize, and Open PR                     │
│  → Link each test to each change                            │
│  → Include repro commands                                   │
│  → Show coverage diff                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 7: CI - Headless Agent Loops                          │
│  → Auto-triage issues into tests                            │
│  → Bounded fix loop (max 5 iterations)                      │
│  → Auto-create PR on success                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 8: Post-Merge Learning                                │
│  → Store (issue → test → patch) examples                    │
│  → Build retrieval library                                  │
│  → Analyze patterns for improvement                         │
└─────────────────────────────────────────────────────────────┘
```

## Installation & Setup

### Prerequisites

- Node.js 18+ with npm (for TypeScript/React tests)
- Python 3.8+ with pytest (if testing Python backend)
- Git with clean working directory
- Test framework installed (Vitest, Jest, or pytest)

### One-Time Setup

```bash
# 1. Run sandbox setup
./.claude/skills/tdd/scripts/helpers/sandbox-setup.sh

# 2. Verify test infrastructure
npm test -- --version  # Should show Vitest/Jest version

# 3. Test single-test execution
npm test -- path/to/test.ts -t "specific test name"

# 4. Verify scripts are executable
ls -la ./.claude/skills/tdd/scripts/**/*

# 5. Install mutation testing (optional but recommended)
npm install --save-dev stryker-cli @stryker-mutator/core
```

### Configuration

Edit `scripts/quality/coverage-gate.sh` to set project-specific coverage threshold:

```bash
# Default: 80% coverage required
COVERAGE_THRESHOLD=80

# Adjust for your project:
COVERAGE_THRESHOLD=85  # Stricter
COVERAGE_THRESHOLD=70  # More lenient
```

## Tool Requirements

This skill uses the following Claude Code tools:

- **`Read`**: Read test files and source code
- **`Grep`**: Search for existing tests and patterns
- **`Glob`**: Find test files matching patterns
- **`Edit`**: Modify tests and source code
- **`Write`**: Create new test files
- **`Bash`**: Run test commands and scripts
- **`Task`**: Parallel test generation and analysis

## Subagents

The TDD skill includes 4 specialized subagents:

### 1. tdd-test-generator

**Purpose**: Generate failing tests from bug reports or feature specs

**When invoked**: Step 1 (Test-First)

**Capabilities**:
- Parse issue descriptions into reproducible test cases
- Generate fail-to-pass tests for bugs
- Create acceptance tests for features
- Validate test quality (reject vacuous tests)
- Ensure tests fail before implementation

**Example invocation**:
```javascript
Task({
  description: "Generate fail-to-pass test for auth bug",
  prompt: "Generate a failing test for: Token expires prematurely causing 401 errors. Use Vitest, mock token service, ensure deterministic.",
  subagent_type: "tdd-test-generator"
})
```

### 2. tdd-self-debugger

**Purpose**: Analyze test failures and propose minimal fixes

**When invoked**: Step 2 (Implement to Green)

**Capabilities**:
- Parse test failures and tracebacks
- Generate 2-3 hypotheses for failure cause
- Propose minimal patches
- Iterate up to 3 times per test
- Escalate to human if stuck

**Example invocation**:
```javascript
Task({
  description: "Debug failing auth test",
  prompt: "Fix test: tests/auth.test.ts::should handle expired tokens. Analyze error, hypothesize causes, apply minimal fix. Max 3 iterations.",
  subagent_type: "tdd-self-debugger"
})
```

### 3. tdd-quality-gatekeeper

**Purpose**: Run coverage, mutation, and flakiness checks

**When invoked**: Step 5 (Quality Gates)

**Capabilities**:
- Check coverage meets threshold
- Run mutation tests on changed lines
- Detect flaky tests (3x rerun)
- Verify PASS_TO_PASS tests still pass
- Generate quality report

**Example invocation**:
```javascript
Task({
  description: "Run quality gates",
  prompt: "Execute quality gates: coverage ≥80%, mutation tests on changed lines, flakiness check (3 runs), PASS_TO_PASS validation. Report results.",
  subagent_type: "tdd-quality-gatekeeper"
})
```

### 4. tdd-multi-sampler

**Purpose**: Generate multiple fix candidates and select best via tests

**When invoked**: Step 3 (Multi-Sample, for hard problems)

**Capabilities**:
- Generate 3-5 diverse fix candidates
- Run test suite on each candidate
- Rank by pass rate
- Select best candidate (tie-breaker: simplest)
- Document why winner was chosen

**Example invocation**:
```javascript
Task({
  description: "Multi-sample fix for complex bug",
  prompt: "Generate 5 fix candidates for: tests/complex.test.ts::edge-case-handling. Use different strategies. Run tests on each. Select by pass rate.",
  subagent_type: "tdd-multi-sampler"
})
```

## Integration with CLAUDE.md Workflow

The TDD skill **extends** the NOVAE workflow defined in `/home/chine/projects/proagentic-clean/CLAUDE.md`:

### Before TDD Loop

```javascript
// 1. Sequential Thinking: Analyze task
mcp__sequential-thinking__sequentialthinking({
  thought: "Bug requires fail-to-pass test. Plan: generate test, verify failure, implement using self-debug loop, validate quality.",
  thoughtNumber: 1,
  totalThoughts: 4,
  nextThoughtNeeded: true
})

// 2. Context7: Get testing best practices
mcp__context7__resolve-library-id({ libraryName: "vitest" })
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/vitest-dev/vitest",
  topic: "mocking and async testing"
})
```

### During TDD Loop

```javascript
// 3. Task Tool: Generate test (TDD Step 1)
Task({
  description: "Generate fail-to-pass test",
  prompt: "...",
  subagent_type: "tdd-test-generator"
})

// 4. Sequential Thinking: Analyze test failure
mcp__sequential-thinking__sequentialthinking({
  thought: "Test fails as expected. Error shows token not refreshed. Hypotheses: 1) refresh logic missing, 2) timing issue, 3) mock incomplete.",
  thoughtNumber: 2,
  totalThoughts: 4,
  nextThoughtNeeded: true
})

// 5. Task Tool: Self-debug fix (TDD Step 2)
Task({
  description: "Fix failing test with self-debug",
  prompt: "...",
  subagent_type: "tdd-self-debugger"
})

// 6. Context7: Validate fix against best practices
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/facebook/react",
  topic: "token refresh patterns"
})
```

### After TDD Loop

```javascript
// 7. Task Tool: Run quality gates (TDD Step 5)
Task({
  description: "Validate quality gates",
  prompt: "...",
  subagent_type: "tdd-quality-gatekeeper"
})

// 8. Sequential Thinking: Final verification
mcp__sequential-thinking__sequentialthinking({
  thought: "All tests pass, coverage 85%, no flakiness, PASS_TO_PASS intact. Implementation follows Context7 patterns. Ready for PR.",
  thoughtNumber: 4,
  totalThoughts: 4,
  nextThoughtNeeded: false
})
```

## Templates

### Test Templates

Located in `templates/`:

- **`vitest-test-template.ts`**: TypeScript/Vitest unit tests
- **`jest-test-template.tsx`**: React component tests (React Testing Library)
- **`playwright-test-template.ts`**: E2E tests with Playwright
- **`pytest-test-template.py`**: Python/pytest tests (if needed)

### Documentation Templates

- **`self-debug-analysis.md`**: Structure for self-debugging analysis
- **`pr-test-summary.md`**: PR description linking tests to changes

## Scripts

### Safety Scripts

**`scripts/safety/validate-test-quality.py`**
- Detects vacuous tests (no assertions, always-true conditions)
- Validates assertion strength
- Rejects trivial tests

**`scripts/safety/check-deterministic.sh`**
- Flags non-deterministic patterns: `sleep`, `setTimeout`, `Math.random()`, `Date.now()`, network calls
- Ensures reproducible tests

### Quality Scripts

**`scripts/quality/coverage-gate.sh`**
- Runs coverage check
- Fails if below threshold (default 80%)
- Reports coverage diff

**`scripts/quality/mutation-test.sh`**
- Runs mutation testing on changed lines
- Detects weak assertions
- Reports mutation score

**`scripts/quality/flakiness-check.sh`**
- Runs tests 3 consecutive times
- Detects non-deterministic failures
- Reports flaky tests

### Helper Scripts

**`scripts/helpers/run-single-test.sh`**
- Fast single-test execution (Claude Code pattern)
- Usage: `./run-single-test.sh path/to/test.ts::test-name`

**`scripts/helpers/sandbox-setup.sh`**
- One-time sandbox configuration
- Sets up hermetic test environment

## Usage Examples

See `USAGE_EXAMPLES.md` for 6 detailed scenarios:

1. **Bug fix with fail-to-pass test** (most common)
2. **New feature with acceptance tests**
3. **Multi-sample selection for hard problems**
4. **Refactoring while staying green**
5. **Property-based testing for edge cases**
6. **CI headless agent loop**

## Troubleshooting

### Issue: Test generation creates vacuous tests

**Symptom**: Tests have no assertions or trivial assertions like `expect(true).toBe(true)`

**Solution**:
```bash
# Run safety validator
./.claude/skills/tdd/scripts/safety/validate-test-quality.py tests/path/to/test.ts

# If fails, regenerate tests with stricter prompt:
# "Generate test with STRONG assertions. Must verify specific behavior, not just 'function runs'."
```

### Issue: Tests are flaky (non-deterministic)

**Symptom**: Tests pass sometimes, fail other times

**Solution**:
```bash
# Detect flakiness
./.claude/skills/tdd/scripts/quality/flakiness-check.sh tests/path/to/test.ts

# Find non-deterministic patterns
./.claude/skills/tdd/scripts/safety/check-deterministic.sh tests/path/to/test.ts

# Common fixes:
# - Replace Math.random() with seeded random
# - Replace Date.now() with mocked time
# - Replace setTimeout with fake timers
# - Mock network calls
```

### Issue: Self-debug loop stuck after 3 iterations

**Symptom**: tdd-self-debugger can't fix test after 3 tries

**Solution**:
- **Escalate to human review** (may need architecture change)
- Check if test is too ambitious (break into smaller tests)
- Verify test expectations are correct
- Consider multi-sampling (Step 3)

### Issue: Coverage below threshold

**Symptom**: `coverage-gate.sh` fails due to low coverage

**Solution**:
```bash
# Generate coverage report
npm test -- --coverage

# Identify uncovered lines
# Generate additional tests for uncovered branches

# Use tdd-test-generator:
Task({
  description: "Generate tests for uncovered code",
  prompt: "Generate tests for uncovered branches in src/auth.ts lines 45-52. Focus on error paths.",
  subagent_type: "tdd-test-generator"
})
```

### Issue: Mutation tests show weak assertions

**Symptom**: Mutations survive (tests don't catch bugs)

**Solution**:
- **Strengthen assertions**: Verify specific values, not just "function runs"
- **Add property-based tests**: Test invariants and properties
- **Test edge cases**: Boundary values, error conditions
- **Use snapshot testing** (for complex outputs)

### Issue: PASS_TO_PASS tests break during refactoring

**Symptom**: Refactoring breaks existing tests

**Solution**:
- **Stop immediately**: Revert refactoring
- **Run tests after EVERY small change** (not just at the end)
- **Refactor incrementally**: Single responsibility changes only
- **Review Context7 patterns** before refactoring

## Customization

### Adjust Coverage Threshold

Edit `scripts/quality/coverage-gate.sh`:

```bash
# Line 5: Change threshold
COVERAGE_THRESHOLD=85  # Stricter (from 80%)
```

### Adjust Iteration Limits

Edit `.claude/agents/tdd-self-debugger.md`:

```yaml
# Change max_iterations from 3 to 5
max_iterations: 5
```

### Add Framework-Specific Templates

Create new template in `templates/`:

```bash
# Example: Add Go test template
cp templates/vitest-test-template.ts templates/go-test-template.go
# Edit for Go testing patterns
```

### Customize Mutation Testing

Edit `scripts/quality/mutation-test.sh`:

```bash
# Change mutators (line 10)
MUTATORS="Arithmetic,Conditional,Logical"  # Add/remove mutators
```

## Best Practices

### 1. Always Test-First

❌ **Don't**: Write implementation then tests
✅ **Do**: Write failing tests before any implementation

### 2. Fix One Test at a Time

❌ **Don't**: Try to fix all failing tests simultaneously
✅ **Do**: Focus on single failing test, get it GREEN, then move to next

### 3. Use Self-Debug Loop

❌ **Don't**: Guess at fixes without analysis
✅ **Do**: Run → Analyze → Hypothesize → Fix → Repeat

### 4. Validate Test Quality

❌ **Don't**: Accept tests with weak/no assertions
✅ **Do**: Run `validate-test-quality.py` before implementing

### 5. Keep Tests Deterministic

❌ **Don't**: Use real time, real network, real randomness
✅ **Do**: Mock time/network, seed random, use fakes

### 6. Protect PASS_TO_PASS Tests

❌ **Don't**: Break existing tests during refactoring
✅ **Do**: Run tests after EVERY refactor step

### 7. Enforce Quality Gates

❌ **Don't**: Merge without coverage/mutation/flakiness checks
✅ **Do**: Run all quality gates before opening PR

### 8. Link Tests to Changes

❌ **Don't**: Generic PR: "Fixed bug"
✅ **Do**: Detailed PR linking each test to each change with repro commands

## Performance Tips

### Speed Up Test Execution

```bash
# Use single-test mode for iteration
npm test -- path/to/test.ts -t "specific test"

# Parallelize test runs
npm test -- --maxWorkers=4

# Use watch mode during development
npm test -- --watch
```

### Optimize Multi-Sampling

```bash
# Start with 3 candidates (faster)
# Increase to 5 only for very hard problems

# Use early stopping:
# If candidate gets 100% pass rate, stop sampling
```

### Cache Test Results

```bash
# Use test caching (Vitest)
npm test -- --cache

# Rerun only changed tests (Jest)
npm test -- --onlyChanged
```

## Security Considerations

### Sandbox Execution

- ✅ Run tests in isolated container/VM
- ✅ Disable external network access
- ✅ Set CPU/memory limits
- ✅ Use unprivileged user account

### Prevent Malicious Tests

- ✅ Validate test code before execution
- ✅ Scan for suspicious patterns (eval, exec, network)
- ✅ Review auto-generated tests before merging

### Protect Secrets

- ✅ Never include real secrets in tests
- ✅ Use test-specific credentials
- ✅ Mock authentication services
- ✅ Scrub sensitive data from test output

## Research Citations

1. **Chen et al.**, "Teaching Large Language Models to Self-Debug", *ICLR 2024*
   [Paper](https://proceedings.iclr.cc/paper_files/paper/2024/file/2460396f2d0d421885997dd1612ac56b-Paper-Conference.pdf)

2. **OpenAI**, "Evaluating Large Language Models Trained on Code", *arXiv:2107.03374*
   [Paper](https://arxiv.org/pdf/2107.03374)

3. **CodeT**, "Code Generation with Generated Tests", *arXiv:2208.11640*
   [Paper](https://arxiv.org/abs/2208.11640)

4. **TICoder**, "Test-Driven Development for Code Generation", *arXiv:2402.13521*
   [Paper](https://arxiv.org/abs/2402.13521)

5. **OpenAI**, "Introducing SWE-bench Verified", *OpenAI Blog, 2025*
   [Blog](https://openai.com/index/introducing-swe-bench-verified/)

6. **Anthropic**, "Claude Code Best Practices", *Anthropic Engineering, 2025*
   [Blog](https://www.anthropic.com/engineering/claude-code-best-practices)

7. **Amazon Science**, "Training LLMs to Better Self-Debug and Explain Code", *2024*
   [Paper](https://assets.amazon.science/46/bf/3743cf75474290526f1147d9373f/training-llms-to-better-self-debug-and-explain-code.pdf)

## Support

For issues or questions:

1. Check `TROUBLESHOOTING.md` (if exists)
2. Review `USAGE_EXAMPLES.md` for similar scenarios
3. Consult `QUICK_REFERENCE.md` for common patterns
4. Open issue in project repository

## License

This skill is part of the ProAgentic project and follows the same license.

---

**Quick Start**: See `QUICK_REFERENCE.md`
**Examples**: See `USAGE_EXAMPLES.md`
**Checklist**: See `CHECKLIST.md`
