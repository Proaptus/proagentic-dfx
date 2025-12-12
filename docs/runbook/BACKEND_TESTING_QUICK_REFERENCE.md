---
id: BACK-TEST-QUICK-REF-2025-12-12
doc_type: runbook
title: 'Backend Testing Quick Reference Card'
version: 1.0.0
date: 2025-12-12
owner: '@h2-tank-team'
status: final
last_verified_at: 2025-12-12
keywords: ['testing', 'quick-reference', 'cheatsheet']
---

# BACKEND TESTING QUICK REFERENCE CARD

## Developer Cheatsheet

**Generated**: 2025-12-12
**Purpose**: Quick reference for daily testing workflows

---

## NPM SCRIPTS (All Testing Commands)

```bash
# Unit Tests
npm run test:unit                # Run all unit tests
npm run test:unit:watch          # Watch mode for development
npm run test:unit:changed        # Only test changed files (fast)
npm run test:unit:coverage       # With coverage report

# Integration Tests
npm run test:integration         # Run all integration tests
npm run test:integration:watch   # Watch mode
npm run test:integration:debug   # Debug mode with logs

# Specialized Tests
npm run test:geometry            # CAD round-trip tests
npm run test:llm                 # LLM output validation tests
npm run test:surrogate           # Surrogate model validation

# E2E Tests
npm run test:e2e                 # Run all E2E tests
npm run test:e2e:headed          # With visible browser
npm run test:e2e:debug           # Debug mode

# Performance Tests
npm run test:performance         # Performance benchmarks

# All Tests
npm run test:all                 # Run everything (takes ~10 min)

# Quality Checks
npm run lint                     # ESLint
npm run format                   # Prettier format
npm run format:check             # Check formatting only
npm run type-check               # TypeScript strict mode
npm run check:sizes              # File size limits
npm run check:secrets            # Secret scanning
```

---

## COVERAGE THRESHOLDS

| Metric     | Threshold | Enforcement     |
| ---------- | --------- | --------------- |
| Lines      | 80%       | Pre-commit hook |
| Functions  | 80%       | Pre-commit hook |
| Branches   | 70%       | Pre-commit hook |
| Statements | 80%       | Pre-commit hook |

**Check coverage**:

```bash
npm run test:unit:coverage
open coverage/index.html  # View HTML report
```

---

## WRITING TESTS

### Unit Test Template

```typescript
// src/services/your-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YourService } from './your-service';

describe('YourService', () => {
  let service: YourService;

  beforeEach(() => {
    service = new YourService();
    vi.clearAllMocks();
  });

  describe('methodName', () => {
    it('should handle happy path', () => {
      const result = service.methodName(validInput);
      expect(result).toBe(expectedOutput);
    });

    it('should throw error for invalid input', () => {
      expect(() => service.methodName(invalidInput)).toThrow('Error message');
    });

    it('should handle edge case', () => {
      const result = service.methodName(edgeCaseInput);
      expect(result).toMatchObject({ key: 'value' });
    });
  });
});
```

### Integration Test Template

```typescript
// __tests__/integration/your-endpoint.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { api } from './setup';

describe('POST /api/your-endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const auth = await api.post('/api/auth/login').send({ username: 'test', password: 'test123' });
    authToken = auth.body.token;
  });

  it('should return 200 for valid request', async () => {
    const response = await api
      .post('/api/your-endpoint')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ key: 'value' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  it('should return 400 for invalid request', async () => {
    await api
      .post('/api/your-endpoint')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ invalid: 'data' })
      .expect(400);
  });
});
```

### E2E Test Template

```typescript
// __tests__/e2e/workflows/your-workflow.test.ts
import { describe, it, expect } from 'vitest';
import { api } from '../setup';

describe('Your Workflow - E2E', () => {
  it('completes full workflow', async () => {
    // Step 1: Create resource
    const create = await api.post('/api/resource').send({ data: 'value' });
    expect(create.status).toBe(201);
    const resourceId = create.body.id;

    // Step 2: Process resource
    const process = await api.post(`/api/resource/${resourceId}/process`);
    expect(process.status).toBe(202);

    // Step 3: Wait for completion
    const result = await waitForJobCompletion(process.body.job_id);
    expect(result.status).toBe('completed');
  });
});
```

---

## MOCKING

### Mock Database

```typescript
import { mockDatabase } from '__tests__/mocks/database';

// Mock return value
mockDatabase.designs.findUnique.mockResolvedValue({ id: '1', name: 'Design A' });

// Mock error
mockDatabase.designs.create.mockRejectedValue(new Error('Database error'));

// Verify call
expect(mockDatabase.designs.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
```

### Mock LLM Client

```typescript
import { mockClaudeClient } from '__tests__/mocks/llm-client';

// Mock successful response
mockClaudeClient.chat.mockResolvedValue({
  pressure: 700,
  volume: 100,
  confidence: 0.95,
});

// Mock failure
mockClaudeClient.chat.mockRejectedValue(new Error('Service Unavailable'));

// Mock rate limit
mockClaudeClient.chat.mockRejectedValue({ status: 429, message: 'Rate limit' });
```

---

## ASSERTIONS

### Common Expect Matchers

```typescript
// Equality
expect(value).toBe(expected); // Strict equality (===)
expect(value).toEqual(expected); // Deep equality
expect(value).toStrictEqual(expected); // Strict deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();

// Numbers
expect(number).toBeGreaterThan(5);
expect(number).toBeGreaterThanOrEqual(5);
expect(number).toBeLessThan(10);
expect(number).toBeCloseTo(0.3, 2); // 2 decimal places

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty('key');
expect(object).toHaveProperty('key', 'value');
expect(object).toMatchObject({ key: 'value' });

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow('Error');

// Functions
expect(() => fn()).toThrow('Error message');
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(3);
```

---

## QUALITY GATES CHECKLIST

### Before `git commit`

```bash
☐ npm run lint              # Linter clean
☐ npm run format:check      # Formatting correct
☐ npm run type-check        # No type errors
☐ npm run test:unit:changed # Unit tests pass
☐ npm run check:sizes:staged # File sizes OK
☐ npm run check:secrets     # No secrets committed
```

**Automated by pre-commit hook** - will block commit if any fail

### Before Creating PR

```bash
☐ npm run test:unit         # All unit tests pass
☐ npm run test:integration  # All integration tests pass
☐ Coverage no regression    # Check coverage delta
☐ Update documentation      # If API/behavior changed
☐ Write PR description      # Include testing notes
```

### Before Merging PR

```bash
☐ All CI checks green       # GitHub Actions passed
☐ Code review approved      # At least 1 reviewer
☐ No TODO/FIXME comments    # Clean code only
☐ Changelog updated         # If user-facing change
```

---

## DEBUGGING TESTS

### Run Single Test File

```bash
npm run test:unit -- src/services/physics.test.ts
```

### Run Single Test Case

```bash
npm run test:unit -- -t "should calculate hoop stress"
```

### Debug with Breakpoints

```typescript
import { describe, it, expect } from 'vitest';

describe('Debug Example', () => {
  it('should debug this test', () => {
    const value = someFunction();
    debugger; // Breakpoint here
    expect(value).toBe(expected);
  });
});
```

Run with:

```bash
node --inspect-brk node_modules/.bin/vitest run
```

### View Test Output

```bash
npm run test:unit -- --reporter=verbose
```

---

## PERFORMANCE BENCHMARKS

| Test Type           | Max Time | Current |
| ------------------- | -------- | ------- |
| Unit tests          | 30s      | TBD     |
| Integration tests   | 2 min    | TBD     |
| E2E tests           | 5 min    | TBD     |
| Full CI/CD pipeline | 10 min   | TBD     |

**Measure test time**:

```bash
time npm run test:unit
```

---

## COMMON ISSUES & SOLUTIONS

### Issue: Tests fail with "Cannot find module"

**Solution**: Check import paths

```typescript
// Bad
import { Thing } from './thing';

// Good
import { Thing } from '@/services/thing';
```

### Issue: "Database is locked" error

**Solution**: Ensure proper cleanup

```typescript
afterEach(async () => {
  await cleanupDatabase();
});
```

### Issue: Tests timeout

**Solution**: Increase timeout

```typescript
it('should complete long operation', async () => {
  // ...
}, 10000); // 10 second timeout
```

### Issue: Flaky tests (pass/fail randomly)

**Solution**: Check for race conditions

```typescript
// Bad - race condition
const result = asyncFunction();
expect(result.value).toBe(5);

// Good - wait for completion
const result = await asyncFunction();
expect(result.value).toBe(5);
```

### Issue: Coverage not updating

**Solution**: Clear coverage cache

```bash
rm -rf coverage/
npm run test:unit:coverage
```

---

## USEFUL RESOURCES

| Resource                  | Location                                        |
| ------------------------- | ----------------------------------------------- |
| **Full Testing Spec**     | `docs/runbook/BACKEND_TESTING_QUALITY_GATES.md` |
| **Code Examples**         | `docs/runbook/BACKEND_TESTING_CODE_EXAMPLES.md` |
| **Architecture Diagrams** | `docs/runbook/BACKEND_TESTING_ARCHITECTURE.md`  |
| **Test Fixtures**         | `__tests__/fixtures/`                           |
| **Mock Infrastructure**   | `__tests__/mocks/`                              |

---

## CONTACT & SUPPORT

**Questions?** Ask in:

- #testing Slack channel
- Team standup
- Code review comments

**Found a bug in tests?** Create issue with:

- Test file path
- Error message
- Steps to reproduce

---

_Generated by ProSWARM Neural Orchestration - 2025-12-12_
_Keep this card handy for daily testing workflows!_
