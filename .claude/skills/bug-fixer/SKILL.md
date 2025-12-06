---
name: Bug Fixer - Batch Test Failure Resolution
description: Efficiently fix large batches (10-15+) of existing bugs by reading failing tests, fixing code in batches, and validating once per batch. Use when user has multiple failing tests, says "fix bugs/failing tests", or bug report shows many issues. NOT for test-first development (use TDD skill instead).
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Task
---

# Bug Fixer - Batch Test Failure Resolution

⚠️ **IMPORTANT: READ CLAUDE.md FIRST** - Before using this skill, read `/home/chine/projects/proagentic-clean/CLAUDE.md` completely.

> Efficiently fix large batches of existing bugs using batch-read-fix-validate workflow

## Core Principle

**This skill is NOT TDD** - it's for fixing EXISTING bugs in batches:
- ❌ Don't write new tests first
- ❌ Don't run tests individually
- ✅ Read existing failing tests
- ✅ Fix code in batches of 10-15
- ✅ Run full test suite ONCE per batch

## When to Use This Skill

✅ **Use Bug Fixer when:**
- User has 10+ failing tests/bugs
- User says "fix bugs", "fix failing tests", "make tests pass"
- Test suite shows multiple failures
- Bug report with many issues to fix
- Existing codebase needs repair

❌ **Don't use Bug Fixer for:**
- Building NEW features (use TDD skill)
- Writing tests first (use TDD skill)
- Single bug fixes (just fix directly)
- Exploratory coding

## The 4-Phase Batch Workflow

### Phase A: Batch Analysis (Run Tests ONCE)

**Goal**: Understand ALL failures before fixing

```bash
# 1. Run full test suite once
npm test --run > test-results.log 2>&1

# 2. Parse failures
grep -E "FAIL|✗|failing" test-results.log

# 3. Group by root cause
# - Same component failures
# - Same error type
# - Related functionality

# 4. Prioritize batches
# - CRITICAL: Security, crashes, data loss
# - HIGH: Core functionality broken
# - MEDIUM: Edge cases, UI issues
# - LOW: Cosmetic, minor bugs
```

**Output**: Batch plan (10-15 bugs per batch, prioritized)

### Phase B: Batch Fixing (NO Test Runs)

**Goal**: Fix 10-15 bugs WITHOUT running tests

```bash
# For each bug in batch (10-15):
#   1. Read failing test file
#   2. Identify expected behavior from assertions
#   3. Read implementation code
#   4. Make MINIMAL fix
#   5. Move to next bug

# DO NOT run tests during this phase!
```

**Key Rules**:
- Fix 10-15 bugs minimum before testing
- Make MINIMAL changes (no refactoring)
- Fix code, not tests
- No individual test runs

### Phase C: Batch Validation (Run Tests ONCE)

**Goal**: Validate entire batch together

```bash
# 1. Run full test suite once
npm test --run > test-results-after.log 2>&1

# 2. Compare before/after
diff test-results.log test-results-after.log

# 3. Count changes
# - Bugs fixed: X
# - Still failing: Y
# - New regressions: Z

# 4. Report results
```

**Success Metrics**:
- More tests passing than before
- No new regressions
- Clear progress toward zero failures

### Phase D: Iteration

**Goal**: Continue until ZERO failures

```
If new regressions:
  → Add to next batch

If failures remain:
  → Plan next batch (10-15 bugs)
  → Repeat Phase B-C

If all tests pass:
  → Done! Commit fixes
```

## Batch Size Guidelines

| Total Bugs | Batch Size | Batches Needed |
|------------|------------|----------------|
| 10-20 | 10-15 | 1-2 |
| 20-50 | 15-20 | 2-3 |
| 50-100 | 20-25 | 3-5 |
| 100-200 | 25-30 | 4-7 |

## Safety Rules (Strict)

### ❌ NEVER:
- Run individual test files during Phase B (fixing)
- Modify test files (only fix implementation)
- Use kill/pkill commands
- Batch fewer than 10 bugs (unless that's all remaining)
- Skip full test suite validation

### ✅ ALWAYS:
- Run full test suite at start (Phase A)
- Batch fixes (10-15 minimum)
- Run full test suite once per batch (Phase C)
- Compare before/after results
- Track regressions

## Efficiency Comparison

**Old Way (Inefficient)**:
```
Fix bug 1 → Run tests (2-5 min)
Fix bug 2 → Run tests (2-5 min)
Fix bug 3 → Run tests (2-5 min)
...
Total: 158 bugs × 3 min = 474 minutes (8 hours!)
```

**Bug Fixer Way (Efficient)**:
```
Batch 1: Fix 15 bugs → Run tests once (3 min)
Batch 2: Fix 15 bugs → Run tests once (3 min)
...
Total: 11 batches × 3 min = 33 minutes
```

**158x faster!**

## Subagents

This skill uses specialized subagents:

1. **bug-analyzer**: Parse test failures, group by root cause
2. **bug-batch-fixer**: Fix 10-15 bugs in parallel
3. **regression-detector**: Compare before/after test results

## Templates

- `templates/BATCH_PLAN.md` - Batch organization template
- `templates/BUG_FIX_CHECKLIST.md` - Per-bug checklist
- `templates/REGRESSION_REPORT.md` - Regression analysis

## Example Usage

See `USAGE_EXAMPLES.md` for detailed scenarios.

## Quick Reference

See `QUICK_REFERENCE.md` for one-page cheat sheet.

## Completion Checklist

See `CHECKLIST.md` for verification steps.

---

**For full documentation**, see `README.md`.
