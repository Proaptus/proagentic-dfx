# Bug Fixer - Usage Examples

## Example 1: Fixing 158 Bugs in ProAgentic

**Scenario**: Test suite has 158 failures across hooks, components, utils

### Phase A: Analysis

```bash
$ npm test --run 2>&1 | tee test-results-initial.log
Test Files: 171 total
Tests: 2219 total, 158 failed, 2061 passed

$ grep "FAIL" test-results-initial.log | awk '{print $2}' | sort | uniq -c
  68 tests/hooks/useProject.test.ts
  62 tests/hooks/useAuth.test.ts
  15 tests/hooks/useSyncLoading.test.ts
  13 tests/dashboards/Budget.test.tsx
```

**Batch Plan**:
- Batch 1: useProject hook (68 tests) - split into 5 batches of 13-14
- Batch 2: useAuth hook (62 tests) - split into 4 batches of 15-16
- Batch 3: Remaining (28 tests) - 2 batches of 14

### Phase B-C: First Batch (15 bugs from useProject)

```javascript
// Read tests
Read({ file_path: "tests/hooks/useProject.test.ts", limit: 200 })

// Identify failures:
// 1. "Cannot read properties of null (reading 'loadProjects')"
// 2. "projects should be array, got null"
// ... (13 more)

// Fix implementation
Edit({
  file_path: "src/hooks/useProject.ts",
  old_string: "const [projects, setProjects] = useState(null)",
  new_string: "const [projects, setProjects] = useState([])"
})

// ... fix 14 more bugs

// Validate batch
$ npm test --run 2>&1 | tee test-results-batch1.log
Tests: 2219 total, 143 failed, 2076 passed
✅ Fixed 15 bugs, 0 regressions
```

### Result

- Total time: 45 minutes (11 batches)
- Traditional approach: ~8 hours
- Saved: 7 hours 15 minutes

## Example 2: React Component Failures

**Scenario**: 50 dashboard component tests failing

### Analysis

```bash
$ grep "Element type is invalid" test-results.log
Error: Element type is invalid... Check render method of ScopeDashboard
Error: Element type is invalid... Check render method of BudgetDashboard
# ... 48 more similar errors
```

**Root Cause**: Missing component exports

### Batch Fix (all 50 at once - same root cause)

```javascript
// Read exports
Read({ file_path: "src/components/dashboards/index.ts" })

// Add missing exports
Edit({
  file_path: "src/components/dashboards/index.ts",
  old_string: "export { RequirementsDashboard } from './RequirementsDashboard';",
  new_string: `export { RequirementsDashboard } from './RequirementsDashboard';
export { ScopeDashboard } from './ScopeDashboard';
export { BudgetDashboard } from './BudgetDashboard';
export { RiskDashboard } from './RiskDashboard';
export { ResourcesDashboard } from './ResourcesDashboard';`
})
```

### Validation

```bash
$ npm test --run
Tests: 2219 total, 0 failed, 2219 passed ✅
```

**Time**: 5 minutes (one batch, one test run)

## Example 3: Hook Dependencies Missing

**Scenario**: 30 tests failing with "useCallback dependencies missing"

### Analysis

```bash
$ grep "React Hook useCallback has missing dependencies" test-results.log | wc -l
30
```

### Batch Fix

```javascript
// Fix each hook's dependencies in batch
Edit({ file_path: "src/hooks/useAuth.ts", ... })
Edit({ file_path: "src/hooks/useProject.ts", ... })
Edit({ file_path: "src/hooks/useWorkflow.ts", ... })
// ... 27 more hooks

// Run tests once
$ npm test --run
Tests: 30 fixed ✅
```

## Example 4: Type Errors Across Codebase

**Scenario**: 80 TypeScript type errors

### Analysis

```typescript
// Common error: Property 'id' does not exist on type '{}'
// Appears in 80 places
```

### Batch Fix Strategy

1. **Batch 1 (20 files)**: Add type annotations to function parameters
2. **Batch 2 (20 files)**: Add interface definitions
3. **Batch 3 (20 files)**: Fix type imports
4. **Batch 4 (20 files)**: Add generic type parameters

Each batch: Fix → Run `npm test` once

## Example 5: Integration Test Failures

**Scenario**: 40 integration tests failing due to mock setup

### Root Cause Analysis

```javascript
// All tests failing with: "Cannot read property 'mock' of undefined"
// Cause: vi.mock() called after imports
```

### Batch Fix

```javascript
// Move all vi.mock() calls to top of 40 test files
// Can be automated with:
for file in tests/integration/*.test.ts; do
  # Reorder imports and mocks
  # Fix in batch
done

// Run once
$ npm test -- tests/integration/
40 tests passing ✅
```

## Example 6: Async Test Failures

**Scenario**: 25 tests failing with "act() warnings"

### Batch Fix Pattern

```javascript
// Before (25 files):
const result = await someAsyncFunction();
expect(result).toBe(expected);

// After (25 files):
await act(async () => {
  result = await someAsyncFunction();
});
expect(result).toBe(expected);
```

### Validation

One test run after all 25 fixed: 25 passing ✅

## Key Takeaways

1. **Group by root cause** - fixes apply to multiple bugs
2. **Fix in batches** - never fix one at a time
3. **One test run per batch** - massive time savings
4. **Track progress** - celebrate each batch completed
5. **Zero regressions** - validate thoroughly before next batch
