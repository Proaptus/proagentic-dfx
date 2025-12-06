# Bug Fixer - Completion Checklist

## Pre-Flight Checklist

Before starting bug fixing session:

- [ ] Full test suite run completed
- [ ] Total failure count known
- [ ] Failures parsed and grouped by component
- [ ] Batch plan created (10-15 bugs per batch)
- [ ] Priorities assigned (CRITICAL/HIGH/MEDIUM/LOW)
- [ ] Test logs saved (`test-failures-before.log`)

## Per-Batch Checklist

For each batch of 10-15 bugs:

### Phase B: Fixing
- [ ] Read all 10-15 test files in batch
- [ ] Identify expected behavior from assertions
- [ ] Read all implementation files
- [ ] Make minimal fixes to code (not tests)
- [ ] NO test runs during this phase
- [ ] All 10-15 bugs addressed

### Phase C: Validation
- [ ] Run full test suite once
- [ ] Save results (`test-failures-after-batch-N.log`)
- [ ] Compare before/after failure counts
- [ ] Count bugs fixed
- [ ] Count new regressions (should be 0)
- [ ] Document results

### Phase D: Iteration Decision
- [ ] If regressions: add to next batch
- [ ] If failures remain: plan next batch
- [ ] If all pass: proceed to final checks

## Final Completion Checklist

After all batches complete:

- [ ] Full test suite shows ZERO failures
- [ ] No new regressions introduced
- [ ] All changed files reviewed
- [ ] Changes are minimal (no refactoring)
- [ ] Git diff reviewed
- [ ] Commit message prepared
- [ ] Tests run one final time before commit

## Quality Gates

- [ ] **Test Coverage**: No decrease in coverage
- [ ] **Test Count**: Same or more tests passing
- [ ] **Regression Count**: Zero new regressions
- [ ] **Code Changes**: Minimal, focused fixes only
- [ ] **Time Efficiency**: <5 minutes per batch

## Success Criteria

✅ **Complete Success**:
- All tests passing (0 failures)
- No regressions
- Minimal code changes
- Full suite validated
- Ready to commit

⚠️ **Partial Success**:
- Most tests passing
- A few edge cases remain
- No regressions
- Progress documented

❌ **Needs Retry**:
- New regressions introduced
- Failure count increased
- Need to undo changes

## Time Tracking

Track efficiency:

- Batch 1: ___ bugs in ___ minutes
- Batch 2: ___ bugs in ___ minutes
- ...
- Total: ___ bugs in ___ minutes
- Average: ___ bugs/minute

Target: >0.5 bugs/minute (faster than 2 min per bug)

## Documentation

- [ ] Batch plan documented
- [ ] Per-batch results logged
- [ ] Final summary created
- [ ] Lessons learned captured
- [ ] Templates updated if needed

## Commit Preparation

- [ ] All tests passing
- [ ] `git status` reviewed
- [ ] `git diff` reviewed
- [ ] Commit message drafted:

```
fix: resolve [N] bugs via batch fixing

- Fixed [N] bugs across [X] components
- Batch approach: [Y] batches, [Z] minutes total
- All tests now passing (was [BEFORE] failures, now 0)
- No regressions introduced

Test results:
- Before: [X] failures
- After: 0 failures
- Fixed: [X] bugs

Components affected:
- [Component 1]: [N] bugs fixed
- [Component 2]: [M] bugs fixed
...
```

- [ ] Ready to commit: `git commit -am "..."`
