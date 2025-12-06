# Regression Analysis Report

**Batch**: [N]
**Date**: YYYY-MM-DD
**Comparison**: Before vs After Batch [N]

## Summary

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total Tests | [X] | [X] | 0 |
| Passing | [Y1] | [Y2] | +[N] ✅ |
| Failing | [Z1] | [Z2] | -[N] ✅ |
| **New Regressions** | N/A | [K] | [K] ⚠️ |

## Bugs Fixed

Tests that were failing before and now pass:

1. `[test-file-1]` → `[test-name-1]` ✅
2. `[test-file-2]` → `[test-name-2]` ✅
...
[N]. `[test-file-N]` → `[test-name-N]` ✅

**Total Fixed**: [N] bugs

## New Regressions

Tests that were passing before and now fail:

### Regression 1: [Test Name]

**File**: `[test-file]`
**Error**:
```
[error message]
```

**Root Cause**: [Analysis]
**Fix Plan**: [How to fix in next batch]

---

### Regression 2: [Test Name]

[Same format]

---

**Total Regressions**: [K] (target: 0)

## Still Failing

Tests that failed before and still fail:

1. `[test-file]` → `[test-name]`
   - **Reason**: [Why still failing]
   - **Plan**: [Include in next batch]

**Total Still Failing**: [M]

## Analysis

### Success Rate

- Attempted to fix: [N] bugs
- Successfully fixed: [N - K] bugs
- Success rate: [(N-K)/N * 100]%

### Root Causes of Regressions

1. [Root cause 1]: [X] regressions
2. [Root cause 2]: [Y] regressions
...

### Recommendations

1. **For Next Batch**:
   - [ ] Fix [K] regressions first
   - [ ] Then continue with [M] remaining bugs

2. **Process Improvements**:
   - [ ] [Suggestion 1]
   - [ ] [Suggestion 2]

## Conclusion

✅ **Good Progress**: [N-K] bugs fixed, [K] regressions (acceptable if K is small)
⚠️ **Needs Attention**: [K] regressions need immediate fix
❌ **Rollback**: Too many regressions, undo batch

**Decision**: [Proceed to next batch / Fix regressions first / Rollback]
