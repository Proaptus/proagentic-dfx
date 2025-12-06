# [Title: Brief description of fix/feature]

## Summary

[One paragraph explaining what this PR does and why]

## Changes

**Files Modified**:
- `src/path/to/file1.ts` - [Brief description of changes]
- `src/path/to/file2.ts` - [Brief description of changes]

**Lines Changed**: +X -Y

## Tests

### Fail-to-Pass Tests (New Tests That Now Pass)

#### Test 1: [Test Name]

- **File**: `tests/path/to/test.test.ts`
- **Test Name**: `should [expected behavior] when [condition]`
- **Before**: ❌ Failed with error: `[Error message]`
- **After**: ✅ Passes successfully
- **Repro Command**:
  ```bash
  npm test -- tests/path/to/test.test.ts -t "test name"
  ```
- **What This Tests**: [Brief explanation of what this test validates]

#### Test 2: [Test Name]

- **File**: `tests/path/to/another-test.test.ts`
- **Test Name**: `should [expected behavior]`
- **Before**: ❌ Failed with error: `[Error message]`
- **After**: ✅ Passes successfully
- **Repro Command**:
  ```bash
  npm test -- tests/path/to/another-test.test.ts -t "test name"
  ```
- **What This Tests**: [Brief explanation]

### Pass-to-Pass Tests (Regression Check)

✅ **All 127 existing tests still pass**

Verified no regressions introduced:
- Unit tests: 87/87 passing
- Integration tests: 35/35 passing
- E2E tests: 5/5 passing

**Full Test Run**:
```bash
npm test
# All 127 tests passed in 12.5s
```

## Coverage

### Coverage on Changed Lines

```
File                        | Line  | Branch | Coverage
----------------------------|-------|--------|----------
src/auth/TokenService.ts    | 95%   | 100%   | 95%
src/auth/tokenHelpers.ts    | 100%  | 100%   | 100%
----------------------------|-------|--------|----------
Total (changed lines)       | 97%   | 100%   | 97%
```

**Coverage Report**:
```bash
npm test -- --coverage
```

### Overall Coverage Delta

- **Before**: 85.2%
- **After**: 86.1%
- **Change**: +0.9% ⬆️

## Quality Gates

### ✅ Coverage Threshold

```bash
./scripts/quality/coverage-gate.sh

✅ PASS: Coverage 86.1% exceeds threshold of 80%
```

### ✅ Mutation Testing

```bash
./scripts/quality/mutation-test.sh

Mutation Score: 92% (11/12 mutations killed)
✅ PASS: 1 surviving mutation in non-critical path (logging)
```

**Surviving Mutations**:
- `src/auth/TokenService.ts:67` - Console.log statement (acceptable)

### ✅ Flakiness Detection

```bash
./scripts/quality/flakiness-check.sh

Run 1: ✅ All tests passed
Run 2: ✅ All tests passed
Run 3: ✅ All tests passed

✅ PASS: No flaky tests detected
```

### ✅ PASS_TO_PASS Validation

All pre-existing tests remain passing:
- ✅ 127/127 tests passing
- ✅ No regressions introduced

## Implementation Details

### Root Cause (For Bug Fixes)

[Explain what was causing the bug]

**Example**:
> Token expiration check was using `> 0` instead of `>= 0`, which excluded valid tokens with 0 seconds until expiration. This caused premature 401 errors when tokens were at the boundary of expiration.

### Solution Approach

[Explain how the fix works]

**Example**:
> Changed the comparison operator from `>` to `>=` to include tokens at the exact moment of expiration. Added buffer logic to refresh tokens 60 seconds before actual expiration to prevent boundary issues.

### Design Decisions

[If applicable, explain any significant design choices]

**Example**:
> - Chose 60-second buffer based on typical network latency
> - Used fake timers in tests for deterministic time-based testing
> - Mocked token provider to avoid real API calls in tests

## Self-Debug Loop Summary

**Iterations Used**: 1 / 3

**Iteration 1**:
- **Error**: `mockFunction` not called
- **Hypothesis**: Conditional check too strict
- **Fix**: Changed `> 0` to `>= 0`
- **Result**: ✅ Test passed

[Include if multiple iterations were needed]

## Screenshots / Evidence

### Test Output (Before)

```
FAIL tests/auth/tokenRefresh.test.ts
  ✕ should refresh token before expiration (45ms)

Error: Expected mockRefreshToken to be called 1 time but it was not called
```

### Test Output (After)

```
PASS tests/auth/tokenRefresh.test.ts
  ✓ should refresh token before expiration (23ms)
  ✓ should handle edge case with 0 seconds expiration (18ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

### Coverage Report Screenshot

[If applicable, attach screenshot of coverage report showing high coverage on changed lines]

## Risks & Limitations

### Known Limitations

- [List any known limitations of this implementation]

**Example**:
> - Token refresh buffer is hardcoded to 60 seconds (could be made configurable)
> - Does not handle token refresh failures (will be addressed in follow-up PR)

### Potential Risks

- [List any potential risks or side effects]

**Example**:
> - Slightly more aggressive token refreshing may increase API calls by ~2%
> - Mitigation: Acceptable trade-off for preventing 401 errors

### Breaking Changes

❌ No breaking changes

OR

⚠️ **Breaking Change**: [Describe breaking change and migration path]

## Follow-Up Tasks

- [ ] [Task 1 - if applicable]
- [ ] [Task 2 - if applicable]

**Example**:
- [ ] Add configuration for token refresh buffer (#456)
- [ ] Implement token refresh retry logic (#457)
- [ ] Add metrics for token refresh frequency (#458)

## Checklist

- [x] ✅ Tests written FIRST (fail-to-pass pattern)
- [x] ✅ All tests passing (127/127)
- [x] ✅ Coverage ≥ 80% on changed lines (97%)
- [x] ✅ No flaky tests (3/3 runs passed)
- [x] ✅ PASS_TO_PASS tests intact (127/127)
- [x] ✅ Mutation score ≥ 80% (92%)
- [x] ✅ Linting passed
- [x] ✅ Type checking passed
- [x] ✅ Each test linked to specific change
- [x] ✅ Repro commands provided
- [x] ✅ Coverage report included

## TDD Workflow Completed

✅ **Step 1**: Generated failing test FIRST (RED state confirmed)
✅ **Step 2**: Implemented fix using self-debug loop (GREEN achieved)
✅ **Step 3**: Skipped (multi-sampling not needed - fixed in 1 iteration)
✅ **Step 4**: Refactored for clarity (tests stayed GREEN)
✅ **Step 5**: Ran quality gates (all passed)
✅ **Step 6**: Created this PR with test linkage

---

**Generated with**: TDD Skill for Claude Code ([docs](/.claude/skills/tdd/README.md))

**Research Foundation**: CodeT, Self-Debugging (ICLR 2024), TICoder, SWE-bench Verified

**Questions?** Review [TDD Quick Reference](/.claude/skills/tdd/QUICK_REFERENCE.md)
