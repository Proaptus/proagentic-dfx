# Self-Debug Analysis Template

Use this template for the TDD self-debugging loop (Step 2: Implement to Green).

---

## Test Information

**Test File**: `tests/path/to/test-file.test.ts`

**Test Name**: `should [expected behavior] when [condition]`

**Test Command**:
```bash
npm test -- path/to/test-file.test.ts -t "test name"
```

---

## Iteration 1

### Test Output

```
FAIL tests/path/to/test-file.test.ts
  ✕ should [expected behavior] when [condition] (45ms)

● Test Suite › should [expected behavior] when [condition]

  Error: Expected function to be called but it was not called

    at Object.<anonymous> (tests/path/to/test-file.test.ts:25:7)

Expected: 1 call
Received: 0 calls
```

### Error Analysis (One Sentence)

**Error**: `mockFunction` was not called, indicating the code path that should invoke it is not being executed.

### Hypotheses (2-3 Root Causes)

1. **Hypothesis 1**: The conditional check before calling `mockFunction` is evaluating to `false`, so the function is never invoked.

2. **Hypothesis 2**: There's a logic error in the control flow that bypasses the `mockFunction` call entirely.

3. **Hypothesis 3**: The `mockFunction` is being called on a different instance or not properly injected into the module under test.

### Proposed Minimal Patch

**Most Likely Hypothesis**: #1 (conditional check failing)

**Minimal Fix**:
```typescript
// In src/path/to/module.ts, line 42

// BEFORE:
if (data && data.value > 0) {
  mockFunction();
}

// AFTER:
if (data && data.value >= 0) {  // Changed > to >=
  mockFunction();
}
```

**Rationale**: Test passes `data.value = 0`, which fails the `> 0` check. Changing to `>= 0` includes zero values.

### Applied Patch

✅ Applied fix to `src/path/to/module.ts:42`

### Re-run Test Result

```bash
./scripts/helpers/run-single-test.sh test-file.test.ts::test-name
```

**Result**: ✅ **PASS** (Green achieved in 1 iteration)

---

## Iteration 2 (If Needed)

### Test Output

```
[Test still fails with different error]
```

### Updated Error Analysis

[Analyze new error]

### Updated Hypotheses

1. [New hypothesis based on updated error]
2. [Alternative hypothesis]

### New Minimal Patch

[Different approach]

### Applied Patch

[What was changed]

### Re-run Test Result

[Pass/Fail]

---

## Iteration 3 (If Needed)

[Same structure as Iteration 2]

---

## Final Status

- **Iterations Used**: 1 / 3
- **Status**: ✅ **GREEN** - Test passing
- **Files Modified**:
  - `src/path/to/module.ts` (line 42)

### Full Test Suite Check

```bash
npm test
```

**Result**: ✅ All 127 tests passing

### Static Checks

```bash
npm run lint
npm run type-check
```

**Result**: ✅ No errors

---

## Summary

**Root Cause**: Conditional check was too strict (`> 0` instead of `>= 0`), excluding valid zero values.

**Fix Applied**: Changed comparison operator from `>` to `>=` in line 42.

**Impact**: Minimal change (1 character), no side effects on other tests.

**Ready for**: Step 3 (Multi-sample if needed) or Step 4 (Refactor)

---

## Notes for PR

**Test → Change Linkage**:
- Test: `tests/auth/tokenRefresh.test.ts::should refresh token before expiration`
- Change: `src/auth/TokenService.ts:42` - Fixed comparison operator
- Repro: `npm test -- tokenRefresh.test.ts -t "should refresh token"`

**Before/After**:
- **Before**: Test failed with "Expected function to be called but it was not called"
- **After**: Test passes, token refresh triggered correctly for zero and positive expiration times
