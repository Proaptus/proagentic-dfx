# TDD Skill Architecture Plan

## Skill Structure

```
.claude/skills/tdd/
├── SKILL.md                              # Core skill definition with YAML frontmatter
├── README.md                             # Comprehensive documentation
├── QUICK_REFERENCE.md                    # One-page reference card
├── USAGE_EXAMPLES.md                     # 6 detailed usage scenarios
├── CHECKLIST.md                          # TDD completion checklist
├── ARCHITECTURE_PLAN.md                  # This file (architecture plan)
├── templates/
│   ├── pytest-test-template.py          # Python/pytest test template
│   ├── vitest-test-template.ts          # TypeScript/Vitest test template
│   ├── jest-test-template.tsx           # React component test template
│   ├── playwright-test-template.ts      # E2E test template
│   ├── self-debug-analysis.md           # Self-debugging analysis template
│   └── pr-test-summary.md               # PR template linking tests to changes
├── scripts/
│   ├── safety/
│   │   ├── validate-test-quality.py     # Detect vacuous tests
│   │   └── check-deterministic.sh       # Check for non-deterministic patterns
│   ├── quality/
│   │   ├── coverage-gate.sh             # Coverage threshold check
│   │   ├── mutation-test.sh             # Quick mutation testing
│   │   └── flakiness-check.sh           # Run tests 3x to detect flaky tests
│   └── helpers/
│       ├── run-single-test.sh           # Fast single test execution
│       └── sandbox-setup.sh             # Configure safe test sandbox
└── examples/
    ├── bug-fix-example.md               # Complete bug fix with TDD
    ├── feature-example.md               # New feature with acceptance tests
    └── refactor-example.md              # Refactor while staying green

Subagents:
.claude/agents/
├── tdd-test-generator.md                # Generate failing tests from specs/issues
├── tdd-self-debugger.md                 # Analyze failures and propose fixes
├── tdd-quality-gatekeeper.md            # Run coverage/mutation/flakiness checks
└── tdd-multi-sampler.md                 # Generate multiple fix candidates
```

## File Purposes

### Core Skill Files

**SKILL.md**: Main skill definition with:
- YAML frontmatter (name, description, allowed-tools)
- 8-step TDD process (Test-First → Implement → Multi-Sample → Refactor → Quality Gates → Commit → CI → Learning)
- Safety rules
- Research foundations
- When to use this skill

**README.md**: Full documentation including:
- Skill overview and benefits
- Complete workflow explanation
- Tool requirements
- Subagent descriptions
- Troubleshooting guide
- Customization options
- Research citations

**QUICK_REFERENCE.md**: Single-page cheat sheet with:
- TDD loop diagram
- Agent checklist
- Common commands
- Key prompts

**USAGE_EXAMPLES.md**: 6 detailed scenarios:
1. Bug fix with fail-to-pass test
2. New feature with acceptance tests
3. Multi-sample selection for hard problems
4. Refactoring while staying green
5. Property-based testing
6. CI headless agent loop

**CHECKLIST.md**: Task completion verification:
- Test-first checklist
- Implementation checklist
- Quality gate checklist
- PR checklist

### Templates

**pytest-test-template.py**: Python backend tests
- Fail-to-pass test structure
- Fixture patterns
- Mock external dependencies
- Property-based test example

**vitest-test-template.ts**: TypeScript unit tests
- Vitest best practices
- Mock modules
- Async testing patterns

**jest-test-template.tsx**: React component tests
- React Testing Library patterns
- User interaction testing
- Accessibility checks

**playwright-test-template.ts**: E2E tests
- Page object pattern
- Deterministic waits
- Screenshot capture

**self-debug-analysis.md**: Self-debugging template
- Error analysis structure
- Hypothesis generation
- Minimal patch strategy

**pr-test-summary.md**: PR description template
- Test → Change linkage
- Repro commands
- Coverage report

### Scripts

**Safety Scripts**:
- `validate-test-quality.py`: Detect tests without assertions, trivial assertions, always-true conditions
- `check-deterministic.sh`: Flag non-deterministic patterns (sleep, random, network, time)

**Quality Scripts**:
- `coverage-gate.sh`: Enforce coverage threshold (default 80%)
- `mutation-test.sh`: Quick mutation testing on changed lines
- `flakiness-check.sh`: Run tests 3x to detect non-deterministic failures

**Helper Scripts**:
- `run-single-test.sh`: Fast single test execution (Claude Code pattern)
- `sandbox-setup.sh`: Configure safe test execution environment

### Subagents

**tdd-test-generator**:
- Generate failing tests from bug reports
- Create acceptance tests from feature specs
- Ensure tests fail before implementation
- Validate test quality (no vacuous tests)

**tdd-self-debugger**:
- Parse test failures and tracebacks
- Generate 2-3 hypotheses for failure cause
- Propose minimal patches
- Iterate up to 3x on single test

**tdd-quality-gatekeeper**:
- Run coverage checks
- Execute mutation tests
- Detect flaky tests
- Verify PASS_TO_PASS tests still pass

**tdd-multi-sampler**:
- Generate N fix candidates with different strategies
- Run test suite on each candidate
- Rank by pass rate
- Select best candidate

## Workflow Integration

### Step 0: Safe Harness (One-time setup)
Script: `scripts/helpers/sandbox-setup.sh`
- Configure hermetic sandbox
- Set up unified test entry point
- Configure test framework

### Step 1: Test-First
Subagent: `tdd-test-generator`
Safety: `scripts/safety/validate-test-quality.py`
- Generate failing tests
- Validate test quality
- Confirm "Red" state

### Step 2: Implement to Green
Subagent: `tdd-self-debugger`
Helper: `scripts/helpers/run-single-test.sh`
- Fix one test at a time
- Self-debug loop (run → analyze → fix → repeat)
- Verify green state

### Step 3: Multi-Sample (for hard problems)
Subagent: `tdd-multi-sampler`
- Generate multiple candidates
- Test-based selection
- Choose best solution

### Step 4: Refactor While Green
Safety: Continuous test execution
- Refactor for clarity/performance
- Keep PASS_TO_PASS tests passing
- Run linting/type checks

### Step 5: Quality Gates
Subagent: `tdd-quality-gatekeeper`
Scripts: `scripts/quality/*.sh`
- Coverage threshold check
- Mutation testing
- Flakiness detection

### Step 6: Commit & PR
Template: `templates/pr-test-summary.md`
- Link tests to changes
- Include repro commands
- Document coverage

### Step 7: CI Headless Loop
- Auto-triage issues into tests
- Attempt bounded fix loop
- Open PR if tests pass

### Step 8: Post-Merge Learning
- Store (issue → test → patch) exemplars
- Build retrieval library

## Tool Restrictions

**allowed-tools**: `Read, Grep, Glob, Edit, Write, Bash, Task`

**Restricted**: No network tools, no file deletion without confirmation

## Safety Mechanisms

1. **Test Quality Validation**: Reject vacuous tests before implementation
2. **Deterministic Check**: Flag non-deterministic patterns
3. **Sandbox Execution**: Run tests in isolated environment
4. **Single Test Focus**: Fix one test at a time (Claude Code pattern)
5. **PASS_TO_PASS Protection**: Never break existing tests

## Research Foundations

Each component maps to research findings:

- **Test-First (Step 1)**: TICoder (~46-point improvement)
- **Self-Debug Loop (Step 2)**: Chen et al. (12% gain)
- **Multi-Sample (Step 3)**: CodeT (18.8% gain)
- **Quality Gates (Step 5)**: SWE-bench Verified patterns
- **Issue-to-Test (Step 7)**: SWT-Bench/Otter (doubles precision)

## Success Metrics

A successful TDD skill execution:
1. ✅ Generates failing test before implementation
2. ✅ Fixes one test at a time in tight loop
3. ✅ All tests pass before merge
4. ✅ Coverage meets threshold (80%+)
5. ✅ No flaky tests detected
6. ✅ PASS_TO_PASS tests remain green
7. ✅ PR links each test to each change

## Next Steps

Proceed to Phase 3: Implementation of all files according to this architecture.
