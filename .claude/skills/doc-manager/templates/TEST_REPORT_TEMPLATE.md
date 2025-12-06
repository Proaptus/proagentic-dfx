---
id: TEST-YYYY-MM-DD-test-run-name
doc_type: test_report
title: "Test Report: [Feature/Module Name]"
status: accepted
last_verified_at: YYYY-MM-DD
owner: "@team-qa"
test_date: YYYY-MM-DD
test_type: unit|integration|e2e|performance|security
environment: development|staging|production
---

# Test Report: [Feature/Module Name]

> **Test Execution Summary**: YYYY-MM-DD

**Test Type**: Unit / Integration / E2E / Performance / Security

**Environment**: Development / Staging / Production

**Status**: ✅ Passed / ❌ Failed / ⚠️ Partial

## Executive Summary

**Overall Result**: Pass / Fail / Partial

**Pass Rate**: XX% (YY passed / ZZ total)

**Critical Failures**: N (list count of critical failures)

**Execution Time**: X minutes Y seconds

**Key Findings**:
- Finding 1: Brief description
- Finding 2: Brief description
- Finding 3: Brief description

## Test Coverage

| Category | Tests | Passed | Failed | Skipped | Pass Rate |
|----------|-------|--------|--------|---------|-----------|
| Unit Tests | 150 | 148 | 2 | 0 | 98.7% |
| Integration Tests | 45 | 43 | 1 | 1 | 95.6% |
| E2E Tests | 20 | 19 | 1 | 0 | 95.0% |
| **Total** | **215** | **210** | **4** | **1** | **97.7%** |

### Code Coverage

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Line Coverage | 87.5% | >80% | ✅ Pass |
| Branch Coverage | 82.3% | >75% | ✅ Pass |
| Function Coverage | 91.2% | >85% | ✅ Pass |
| Statement Coverage | 88.1% | >80% | ✅ Pass |

**Coverage Report**: [Link to detailed coverage](./coverage/index.html)

## Test Results Breakdown

### Unit Tests

**Total**: 150 tests
**Passed**: 148 (98.7%)
**Failed**: 2 (1.3%)
**Skipped**: 0

#### Failures

##### Test 1: `test_user_validation_edge_case`

**File**: `tests/user/validation.test.ts::test_user_validation_edge_case`

**Error**:
```
AssertionError: Expected validation to reject empty string, but it passed
  at validateUser (src/user/validator.ts:45)
  Expected: ValidationError
  Received: { valid: true }
```

**Severity**: Medium
**Impact**: Edge case handling
**Action**: Fix validation logic to reject empty strings

**Related Code**: `src/user/validator.ts#L45`

---

##### Test 2: `test_api_timeout_handling`

**File**: `tests/api/client.test.ts::test_api_timeout_handling`

**Error**:
```
TimeoutError: API call did not timeout as expected after 5000ms
  at mockApiCall (tests/api/client.test.ts:120)
```

**Severity**: Low
**Impact**: Timeout behavior inconsistent
**Action**: Review timeout configuration

**Related Code**: `src/api/client.ts#L200`

---

### Integration Tests

**Total**: 45 tests
**Passed**: 43 (95.6%)
**Failed**: 1 (2.2%)
**Skipped**: 1 (2.2%)

#### Failures

##### Test 3: `test_database_transaction_rollback`

**File**: `tests/integration/database.test.ts::test_database_transaction_rollback`

**Error**:
```
DatabaseError: Transaction did not rollback correctly
  Changes persisted after error: { users: 1 row }
```

**Severity**: High
**Impact**: Data integrity risk
**Action**: Critical - Fix transaction handling

**Related Code**: `src/database/transaction.ts#L78`

---

#### Skipped Tests

##### Test 4: `test_external_api_integration`

**File**: `tests/integration/external-api.test.ts::test_external_api_integration`

**Reason**: External API unavailable in test environment

**Action**: Mock external API for testing

---

### E2E Tests

**Total**: 20 tests
**Passed**: 19 (95.0%)
**Failed**: 1 (5.0%)
**Skipped**: 0

#### Failures

##### Test 5: `test_complete_user_workflow`

**File**: `tests/e2e/user-workflow.spec.ts::test_complete_user_workflow`

**Error**:
```
PlaywrightError: Timeout waiting for element #submit-button
  at Page.click (tests/e2e/user-workflow.spec.ts:45)
```

**Severity**: Medium
**Impact**: User workflow broken
**Action**: Investigate button rendering timing

**Screenshots**:
- Before error: [screenshot-1.png](./screenshots/before-error.png)
- At error: [screenshot-2.png](./screenshots/at-error.png)

**Related Code**: `src/components/UserForm.tsx#L120`

---

## Performance Metrics

### Response Times

| Endpoint | Avg (ms) | P50 (ms) | P95 (ms) | P99 (ms) | Target | Status |
|----------|----------|----------|----------|----------|--------|--------|
| GET /api/users | 45 | 42 | 78 | 120 | <100ms | ✅ Pass |
| POST /api/users | 120 | 110 | 180 | 250 | <200ms | ✅ Pass |
| GET /api/dashboard | 85 | 78 | 145 | 200 | <150ms | ✅ Pass |

### Resource Usage

| Metric | Value | Limit | Status |
|--------|-------|-------|--------|
| Peak Memory | 256 MB | 512 MB | ✅ Pass |
| Avg CPU | 35% | 70% | ✅ Pass |
| Database Connections | 12 | 50 | ✅ Pass |

## CI/CD Integration

**Build**: [#12345678](https://github.com/org/repo/actions/runs/12345678)

**Pipeline Status**: ✅ Passed

**Artifacts**:
- [Test Results (JUnit XML)](./junit-results.xml)
- [Coverage Report (HTML)](./coverage/index.html)
- [Screenshots](./screenshots/)
- [Logs](./logs/)

**Pipeline Execution Time**: 12 minutes 34 seconds

## Environment Details

**Date**: 2025-10-25 14:30:00 UTC

**Git Commit**: `abc123def456` ([View Commit](https://github.com/org/repo/commit/abc123def456))

**Branch**: `feature/new-functionality`

**Test Runner**: Jest 29.5.0 / Vitest 1.0.0 / Playwright 1.40.0

**Node Version**: 18.18.0

**OS**: Ubuntu 22.04 LTS

**Database**: PostgreSQL 15.3

**Dependencies**:
- React: 18.2.0
- Express: 4.18.0
- TypeScript: 5.2.0

## Issues Found

### Critical Issues

None

### High Priority Issues

1. **Database Transaction Rollback**: Test failure indicates potential data integrity issue
   - **Test**: `test_database_transaction_rollback`
   - **Impact**: Data corruption risk
   - **Action**: Immediate fix required
   - **Assignee**: @db-team

### Medium Priority Issues

1. **User Validation Edge Case**: Empty string not rejected
   - **Test**: `test_user_validation_edge_case`
   - **Impact**: Invalid data might be accepted
   - **Action**: Fix before next release

2. **User Workflow Timeout**: Submit button not rendering in time
   - **Test**: `test_complete_user_workflow`
   - **Impact**: User experience degraded
   - **Action**: Investigate and fix

### Low Priority Issues

1. **API Timeout Handling**: Inconsistent timeout behavior
   - **Test**: `test_api_timeout_handling`
   - **Impact**: Minor edge case
   - **Action**: Can be addressed in future sprint

## Recommendations

### Immediate Actions

1. **Fix database transaction rollback** (HIGH priority)
   - Assign to: @db-team
   - Due: Within 24 hours

2. **Investigate E2E workflow timeout** (MEDIUM priority)
   - Assign to: @frontend-team
   - Due: Within 3 days

### Short-Term Improvements

1. Add more edge case tests for user validation
2. Mock external APIs for integration tests
3. Improve test execution time (currently 12+ minutes)

### Long-Term Improvements

1. Increase unit test coverage to >95%
2. Add visual regression testing
3. Implement mutation testing for critical paths

## Comparison to Previous Run

| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Pass Rate | 96.5% | 97.7% | +1.2% ✅ |
| Total Tests | 200 | 215 | +15 ✅ |
| Execution Time | 15m 20s | 12m 34s | -2m 46s ✅ |
| Coverage | 85.2% | 87.5% | +2.3% ✅ |

**Trend**: ✅ Improving

## Test Artifacts

All test artifacts available at: `/test-results/2025-10-25-14-30/`

- **JUnit XML**: `junit-results.xml`
- **Coverage HTML**: `coverage/index.html`
- **Screenshots**: `screenshots/*.png`
- **Logs**: `logs/*.log`
- **Performance Reports**: `performance/*.json`

## Sign-Off

**Tested By**: @qa-engineer

**Reviewed By**: @tech-lead

**Date**: 2025-10-25

**Approved for**: Staging Deployment / Production Deployment / Blocked

**Blocking Issues**: List any blocking issues or "None"

---

## Related Documentation

- [Feature Card: Tested Feature](../feature/FEAT-YYYY-MM-slug.md)
- [Test Plan: Feature Testing](./test-plan-feature.md)
- [Bug Reports: GitHub Issues](https://github.com/org/repo/issues)

---

**Last Updated**: YYYY-MM-DD
**Report Generated**: YYYY-MM-DD HH:MM:SS UTC
**Next Test Run**: YYYY-MM-DD
