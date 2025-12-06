# Bug Fixer Skill - Complete Documentation

## Overview

The Bug Fixer skill provides an efficient batch workflow for fixing large numbers of existing bugs. Unlike TDD (test-first development), this skill is designed for repairing existing broken code by reading failing tests, fixing code in batches, and validating once per batch.

## Key Innovation: Batch Processing

Traditional approach: Fix → Test → Fix → Test (slow)
Bug Fixer approach: Fix 15 bugs → Test once (158x faster)

## Complete Workflow

### Phase A: Batch Analysis

1. **Run full test suite**:
   ```bash
   npm test --run 2>&1 | tee test-failures-before.log
   ```

2. **Parse failures**:
   ```bash
   grep -E "FAIL|✗" test-failures-before.log | wc -l
   # Example output: 158 failures
   ```

3. **Group failures by component**:
   ```bash
   grep "FAIL" test-failures-before.log | awk '{print $2}' | sort | uniq -c
   # Example output:
   # 68 tests/hooks/useProject.test.ts
   # 62 tests/hooks/useAuth.test.ts
   # 28 tests/dashboards/Budget.test.tsx
   ```

4. **Create batch plan**:
   - Batch 1 (HIGH): 15 critical bugs
   - Batch 2 (HIGH): 15 more critical bugs
   - Batch 3 (MEDIUM): 20 medium bugs
   - Batch 4 (LOW): 30 low bugs

### Phase B: Batch Fixing

For each bug in batch (example: 15 bugs):

1. **Read test file**:
   ```bash
   cat tests/hooks/useProject.test.ts | head -100
   ```

2. **Identify expected behavior**:
   ```javascript
   // Test says:
   expect(result.current.projects).toHaveLength(2)
   // So code should return array of 2 projects
   ```

3. **Read implementation**:
   ```bash
   cat src/hooks/useProject.ts
   ```

4. **Make minimal fix**:
   ```javascript
   // Before:
   return { projects: null }

   // After:
   return { projects: [] }  // Minimal fix
   ```

5. **Move to next bug** (DO NOT run tests yet)

6. **Repeat for all 15 bugs in batch**

### Phase C: Batch Validation

1. **Run full test suite again**:
   ```bash
   npm test --run 2>&1 | tee test-failures-after.log
   ```

2. **Compare results**:
   ```bash
   # Before: 158 failures
   # After: 143 failures
   # Fixed: 15 bugs ✅
   # Regressions: 0 ✅
   ```

3. **Analyze remaining failures**:
   ```bash
   grep "FAIL" test-failures-after.log
   ```

### Phase D: Iteration

If failures remain, plan next batch and repeat Phase B-C.

## Subagent Usage

### 1. bug-analyzer

Automatically parses test failures and groups by root cause:

```bash
Task({
  subagent_type: "bug-analyzer",
  prompt: "Analyze test-failures.log and group failures by root cause. Create batches of 10-15 related bugs."
})
```

### 2. bug-batch-fixer

Fixes 10-15 bugs in parallel:

```bash
Task({
  subagent_type: "bug-batch-fixer",
  prompt: "Fix these 15 bugs: [list]. Read test files, identify expected behavior, fix code. DO NOT run tests."
})
```

### 3. regression-detector

Compares before/after test results:

```bash
Task({
  subagent_type: "regression-detector",
  prompt: "Compare test-failures-before.log and test-failures-after.log. Report: bugs fixed, still failing, new regressions."
})
```

## Troubleshooting

### Issue: Too Many Failures to Fix

**Solution**: Break into smaller batches
- Start with 10-bug batches
- Increase to 15-20 as you get momentum

### Issue: New Regressions Appearing

**Solution**: More careful analysis
- Read tests more carefully
- Check for shared dependencies
- Fix regressions in next batch

### Issue: Tests Still Failing After Fix

**Solution**: Root cause misidentified
- Re-read test more carefully
- Check if test expects different behavior
- Look for related code paths

### Issue: Test Suite Takes Too Long

**Solution**: Optimize test running
- Use `--run` flag (no watch mode)
- Run in parallel if possible
- Consider subset first, full suite at end

## Best Practices

1. **Always batch 10-15 minimum**
   - Smaller batches waste time on test runs
   - Larger batches risk complexity

2. **Fix code, not tests**
   - Tests define correct behavior
   - Only fix implementation

3. **Minimal changes only**
   - No refactoring during bug fixing
   - Save refactoring for after all tests pass

4. **Track progress**
   - Keep before/after logs
   - Document bugs fixed per batch
   - Celebrate progress!

5. **One full suite run per batch**
   - Never run individual test files
   - Always validate full suite

## Integration with Other Skills

- **TDD Skill**: Use for NEW features (test-first)
- **Bug Fixer Skill**: Use for EXISTING bugs (test-guided)
- **Doc Manager**: Clean up docs after bugs fixed
- **Deployment**: Deploy after all tests pass

## Performance Metrics

Real example from ProAgentic project:

- **Total bugs**: 158
- **Traditional approach**: ~8 hours (test per bug)
- **Bug Fixer approach**: ~33 minutes (11 batches)
- **Time saved**: 7.5 hours (96% faster)

## Success Criteria

✅ All tests passing (zero failures)
✅ No new regressions introduced
✅ Minimal code changes made
✅ Full test suite run at end confirms
✅ Changes committed and deployed

## See Also

- `QUICK_REFERENCE.md` - One-page cheat sheet
- `USAGE_EXAMPLES.md` - Detailed scenarios
- `CHECKLIST.md` - Completion verification
- `templates/` - Batch planning templates
