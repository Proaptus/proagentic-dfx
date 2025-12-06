# TDD Skill Usage Examples

This document provides 6 detailed scenarios demonstrating the TDD skill in action.

---

## Example 1: Bug Fix with Fail-to-Pass Test

**Scenario**: User reports "Token expires prematurely causing 401 errors in production"

### Step-by-Step Execution

#### Step 1: Generate Fail-to-Pass Test

**User request**: "Fix the token expiration bug"

**Agent (using tdd-test-generator)**:
```typescript
// Generated test file: tests/auth/tokenRefresh.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenService } from '../../src/auth/TokenService';
import { mockTokenProvider } from '../mocks/tokenProvider';

describe('TokenService - Token Expiration Bug', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });

  it('should refresh token before expiration when request is made', async () => {
    // ARRANGE: Token expires in 5 minutes
    const mockToken = {
      value: 'original-token',
      expiresAt: new Date('2025-01-01T00:05:00Z')
    };
    mockTokenProvider.getToken.mockResolvedValue(mockToken);

    const service = new TokenService(mockTokenProvider);

    // ACT: Advance time to 4.5 minutes (30 seconds before expiration)
    vi.advanceTimersByTime(4.5 * 60 * 1000);
    const result = await service.makeAuthenticatedRequest('/api/user');

    // ASSERT: Token should have been refreshed
    expect(mockTokenProvider.refreshToken).toHaveBeenCalledTimes(1);
    expect(result.usedToken).not.toBe('original-token');
    expect(result.error).toBeUndefined();
  });
});
```

**Run test**:
```bash
npm test -- tokenRefresh.test.ts -t "should refresh token"

# Output: FAIL ❌
# Error: mockTokenProvider.refreshToken is not defined
# Expected: called 1 times
# Received: undefined
```

**Status**: ✅ RED state confirmed (test fails as expected)

#### Step 2: Self-Debug Fix Loop

**Agent (using tdd-self-debugger)**:

**Iteration 1**:
```
Analysis: Test fails because TokenService doesn't check token expiration before requests.

Hypotheses:
1. TokenService.makeAuthenticatedRequest() doesn't check token.expiresAt
2. No refresh logic exists in the request flow
3. Time comparison logic is missing

Minimal patch: Add token expiration check before request
```

**Applied fix** (`src/auth/TokenService.ts`):
```typescript
async makeAuthenticatedRequest(endpoint: string): Promise<Response> {
  const token = await this.tokenProvider.getToken();

  // NEW: Check if token expires within 60 seconds
  const now = Date.now();
  const expiresIn = token.expiresAt.getTime() - now;

  if (expiresIn < 60 * 1000) {
    // Refresh token if expiring soon
    await this.tokenProvider.refreshToken();
    const newToken = await this.tokenProvider.getToken();
    return this.performRequest(endpoint, newToken);
  }

  return this.performRequest(endpoint, token);
}
```

**Run single test**:
```bash
./scripts/helpers/run-single-test.sh tokenRefresh.test.ts::should-refresh-token

# Output: PASS ✅
# Test passed in 45ms
```

**Status**: ✅ GREEN state achieved (1 iteration)

#### Step 3: Run Full Test Suite

```bash
npm test

# Output: All 127 tests passed ✅
```

#### Step 4: Quality Gates

```bash
# Coverage check
./scripts/quality/coverage-gate.sh
# ✅ Coverage: 87% (threshold: 80%)

# Mutation testing
./scripts/quality/mutation-test.sh
# ✅ Mutation score: 92% (8/9 mutations killed)

# Flakiness check
./scripts/quality/flakiness-check.sh
# ✅ 3/3 runs passed
```

#### Step 5: Create PR

```markdown
## Fix Token Expiration Bug

### Changes
- Added token expiration check in `TokenService.makeAuthenticatedRequest()`
- Refresh token if expiring within 60 seconds

### Tests

#### Fail-to-Pass Test
✅ `tests/auth/tokenRefresh.test.ts::should refresh token before expiration`
- **Before**: Failed with "mockTokenProvider.refreshToken is not defined"
- **After**: Passes with proper token refresh
- **Repro**: `npm test -- tokenRefresh.test.ts -t "should refresh token"`

#### Pass-to-Pass Tests (Regression Check)
✅ All 127 existing tests still pass

### Coverage
- Changed lines: 100% coverage (6/6 lines)
- Overall: 85% → 87% (+2%)

### Quality Gates
- ✅ Coverage: 87% (threshold: 80%)
- ✅ Mutation score: 92%
- ✅ Flakiness: 0 (3/3 runs passed)
- ✅ PASS_TO_PASS: 100% (127/127 passing)
```

**Result**: Bug fixed with test-first approach, 100% coverage on changed code, all quality gates passed.

---

## Example 2: New Feature with Acceptance Tests

**Scenario**: User requests "Add password reset functionality"

### Step 1: Generate Acceptance Tests

**Agent (using tdd-test-generator)**:

```typescript
// Generated test file: tests/auth/passwordReset.test.ts

import { describe, it, expect } from 'vitest';
import { PasswordResetService } from '../../src/auth/PasswordResetService';
import { mockEmailService, mockUserRepository } from '../mocks';

describe('Password Reset Feature', () => {
  // Happy path
  it('should send reset email when user requests password reset', async () => {
    const service = new PasswordResetService(mockEmailService, mockUserRepository);
    const result = await service.requestPasswordReset('user@example.com');

    expect(result.success).toBe(true);
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Password Reset Request',
      body: expect.stringContaining('reset token')
    });
  });

  // Boundary case: Email not found
  it('should fail gracefully when email does not exist', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    const service = new PasswordResetService(mockEmailService, mockUserRepository);

    const result = await service.requestPasswordReset('nonexistent@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('USER_NOT_FOUND');
    expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
  });

  // Boundary case: Invalid email format
  it('should reject invalid email format', async () => {
    const service = new PasswordResetService(mockEmailService, mockUserRepository);
    const result = await service.requestPasswordReset('invalid-email');

    expect(result.success).toBe(false);
    expect(result.error).toBe('INVALID_EMAIL_FORMAT');
  });

  // Negative case: Rate limiting
  it('should reject request if user requested reset recently', async () => {
    mockUserRepository.getLastResetRequest.mockResolvedValue(
      new Date(Date.now() - 30 * 1000) // 30 seconds ago
    );
    const service = new PasswordResetService(mockEmailService, mockUserRepository);

    const result = await service.requestPasswordReset('user@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('RATE_LIMITED');
  });

  // Property-based test
  it('should generate unique tokens for different requests', async () => {
    const service = new PasswordResetService(mockEmailService, mockUserRepository);
    const tokens = new Set<string>();

    for (let i = 0; i < 100; i++) {
      const result = await service.requestPasswordReset(`user${i}@example.com`);
      tokens.add(result.token);
    }

    expect(tokens.size).toBe(100); // All tokens unique
  });
});
```

**Run tests**:
```bash
npm test -- passwordReset.test.ts

# Output: 5 tests FAIL ❌
# All tests fail because PasswordResetService doesn't exist yet
```

**Status**: ✅ RED state confirmed

### Steps 2-5: Implement, Quality Gates, PR

(Implementation follows same pattern as Example 1)

**Result**: New feature fully tested with acceptance tests before implementation.

---

## Example 3: Multi-Sample Selection for Hard Problem

**Scenario**: Complex algorithm with multiple possible solutions

### Step 1-2: Test Generated, Initial Fix Attempt Failed

```bash
# After 3 self-debug iterations, test still fails
./scripts/helpers/run-single-test.sh complex.test.ts::edge-case

# Output: FAIL (after 3 attempts)
```

### Step 3: Multi-Sample Selection

**Agent (using tdd-multi-sampler)**:

**Generated 5 candidates**:

```typescript
// Candidate 1: Recursive approach
function solve(input) {
  if (input.length === 0) return [];
  return [process(input[0])].concat(solve(input.slice(1)));
}

// Candidate 2: Iterative with accumulator
function solve(input) {
  return input.reduce((acc, item) => {
    acc.push(process(item));
    return acc;
  }, []);
}

// Candidate 3: Map-based functional
function solve(input) {
  return input.map(process);
}

// Candidate 4: For-loop imperative
function solve(input) {
  const result = [];
  for (let i = 0; i < input.length; i++) {
    result.push(process(input[i]));
  }
  return result;
}

// Candidate 5: Stream-based (complex)
function solve(input) {
  return Stream.of(input)
    .map(process)
    .collect(Collectors.toList());
}
```

**Test each candidate**:

```bash
# Run test suite on each candidate
for candidate in 1 2 3 4 5; do
  apply_candidate $candidate
  npm test
done

# Results:
# Candidate 1: 95% pass (123/130 tests)
# Candidate 2: 98% pass (127/130 tests)
# Candidate 3: 100% pass (130/130 tests) ✅
# Candidate 4: 98% pass (127/130 tests)
# Candidate 5: 85% pass (110/130 tests)
```

**Selection**: Candidate 3 (100% pass rate, simplest implementation)

**Result**: Multi-sampling found optimal solution when single-shot failed.

---

## Example 4: Refactoring While Staying Green

**Scenario**: Refactor legacy code to modern patterns

### Step 1: All Tests Green

```bash
npm test
# Output: 200 tests pass ✅
```

### Step 2: Refactor Incrementally

**Refactor 1**: Extract function
```typescript
// Before
function processUser(user) {
  if (!user) throw new Error('User is null');
  if (!user.email) throw new Error('Email is null');
  if (!validateEmail(user.email)) throw new Error('Invalid email');
  return { ...user, validated: true };
}

// After (extract validation)
function validateUserInput(user) {
  if (!user) throw new Error('User is null');
  if (!user.email) throw new Error('Email is null');
  if (!validateEmail(user.email)) throw new Error('Invalid email');
}

function processUser(user) {
  validateUserInput(user);
  return { ...user, validated: true };
}
```

**Run tests immediately**:
```bash
npm test
# Output: 200 tests pass ✅ (stayed GREEN)
```

**Refactor 2**: Replace error strings with constants
```typescript
const ERRORS = {
  NULL_USER: 'User is null',
  NULL_EMAIL: 'Email is null',
  INVALID_EMAIL: 'Invalid email'
};

function validateUserInput(user) {
  if (!user) throw new Error(ERRORS.NULL_USER);
  if (!user.email) throw new Error(ERRORS.NULL_EMAIL);
  if (!validateEmail(user.email)) throw new Error(ERRORS.INVALID_EMAIL);
}
```

**Run tests again**:
```bash
npm test
# Output: 200 tests pass ✅ (stayed GREEN)
```

**Result**: Successful refactoring with tests GREEN at every step.

---

## Example 5: Property-Based Testing for Edge Cases

**Scenario**: Validate sorting algorithm for all possible inputs

### Step 1: Generate Property-Based Tests

```typescript
import { describe, it, expect } from 'vitest';
import { fc } from 'fast-check';
import { customSort } from '../../src/utils/sort';

describe('Sorting Algorithm - Property-Based Tests', () => {
  it('should maintain array length (property: length invariant)', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted = customSort(arr);
        expect(sorted.length).toBe(arr.length);
      })
    );
  });

  it('should produce sorted output (property: ordering)', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted = customSort(arr);
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(sorted[i]).toBeLessThanOrEqual(sorted[i + 1]);
        }
      })
    );
  });

  it('should contain same elements (property: permutation)', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted = customSort(arr);
        const original = [...arr].sort((a, b) => a - b);
        expect(sorted).toEqual(original);
      })
    );
  });

  it('should be idempotent (property: stability)', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted1 = customSort(arr);
        const sorted2 = customSort(sorted1);
        expect(sorted2).toEqual(sorted1);
      })
    );
  });
});
```

**Run property-based tests**:
```bash
npm test -- sort.property.test.ts

# Output: Running 1000 random test cases per property...
# ✅ All 4 properties hold for 4000 test cases
```

**Result**: Algorithm validated against mathematical properties, not just examples.

---

## Example 6: CI Headless Agent Loop

**Scenario**: Automated issue triage and fix in CI

### CI Configuration

```yaml
# .github/workflows/headless-tdd.yml
name: Headless TDD Agent

on:
  issues:
    types: [opened, labeled]

jobs:
  auto-fix:
    if: contains(github.event.issue.labels.*.name, 'bug')
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Generate Fail-to-Pass Test
        run: |
          # Use tdd-test-generator to create test from issue
          claude-code --skill tdd --step 1 \
            --issue "${{ github.event.issue.number }}" \
            --output tests/generated/

      - name: Verify Test Fails
        run: |
          npm test -- tests/generated/
          if [ $? -eq 0 ]; then
            echo "Test passed unexpectedly - issue may be invalid"
            exit 1
          fi

      - name: Bounded Fix Loop
        run: |
          # Attempt fix with max 5 iterations
          for i in {1..5}; do
            claude-code --skill tdd --step 2 \
              --test tests/generated/ \
              --max-iterations 1

            npm test -- tests/generated/
            if [ $? -eq 0 ]; then
              echo "Fixed in $i iterations"
              break
            fi
          done

      - name: Run Quality Gates
        if: success()
        run: |
          ./scripts/quality/coverage-gate.sh
          ./scripts/quality/mutation-test.sh
          ./scripts/quality/flakiness-check.sh

      - name: Create PR
        if: success()
        uses: peter-evans/create-pull-request@v5
        with:
          title: "Auto-fix: Issue #${{ github.event.issue.number }}"
          body-path: .claude/skills/tdd/templates/pr-test-summary.md
          branch: auto-fix/issue-${{ github.event.issue.number }}
          labels: auto-generated, needs-review

      - name: Comment on Issue
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: 'Headless TDD agent attempted fix but could not resolve after 5 iterations. Human review needed.'
            })
```

### Execution Flow

**Issue created**: "User login fails with expired token #456"

1. **CI triggers** headless agent
2. **Test generated**: `tests/generated/issue-456-login-expired-token.test.ts`
3. **Test fails** on main branch (confirmed RED)
4. **Fix loop** (3 iterations) → Test passes (GREEN)
5. **Quality gates** pass
6. **PR auto-created**: "Auto-fix: Issue #456"
7. **Human reviews** PR before merge

**Result**: Automated issue → test → fix → PR workflow.

---

## Summary of Examples

| Example | Pattern | Key Takeaway |
|---------|---------|--------------|
| **1. Bug Fix** | Fail-to-pass test | Always test bug reproduction before fixing |
| **2. New Feature** | Acceptance tests first | Define requirements as tests before coding |
| **3. Multi-Sample** | Test-based selection | Use multiple candidates for hard problems |
| **4. Refactoring** | Stay green while refactoring | Test after EVERY small change |
| **5. Property-Based** | Mathematical properties | Go beyond examples to invariants |
| **6. CI Headless** | Autonomous TDD loop | Automate issue → test → fix → PR flow |

---

## Common Patterns Across Examples

1. **Always test-first** (RED before implementation)
2. **Single-test focus** (fix one at a time)
3. **Self-debug loop** (run → analyze → fix → repeat)
4. **Quality gates** (coverage, mutation, flakiness)
5. **Test-linked PRs** (repro commands + coverage diff)

---

For more details, see:
- **Full documentation**: `README.md`
- **Quick reference**: `QUICK_REFERENCE.md`
- **Completion checklist**: `CHECKLIST.md`
