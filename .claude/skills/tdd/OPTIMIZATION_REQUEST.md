# TDD Skill Optimization Request

**Date**: 2025-10-28
**Priority**: CRITICAL
**Reason**: Current TDD workflow relies too heavily on mocked unit tests, which fail to catch real React rendering issues

## Problem Statement

### User Evidence (Real-World Testing)
- Mocked unit tests: **14/14 PASSING** ✅
- Real app on localhost: **BROKEN** ❌
- Issue: Infinite render loop with "Maximum update depth exceeded" error

### Root Cause Analysis
The current TDD skill workflow has a fundamental flaw:
- **Step 1-5**: Focused on mocked unit tests
- **Integration tests**: Mentioned only as E2E validation (optional, secondary)
- **Result**: Tests pass but real code is broken
- **Why**: Mocked tests don't execute actual React rendering, useEffect hooks, or dependency resolution

### Testing Pyramid Misalignment
```
Current (Wrong):
▲ E2E (Playwright) - Optional
│ Integration (Real components) - Mentioned in Step 4-5 only
└ Unit (Fully Mocked) - PRIMARY FOCUS

Correct:
▲ E2E (Playwright) - Validate user flows
│ Integration (Real React) - PRIMARY FOCUS (detect rendering issues)
└ Unit (Mocked) - Secondary (isolated logic only)
```

## Required Changes

### 1. REMOVE: False Confidence from Mocked Unit Tests Alone

**Current problematic language** (SKILL.md line 13-18):
```markdown
### What TDD Actually Means
1. **Tests define what needs to be built** (acceptance criteria)
2. **Implementation satisfies those tests** (make tests pass)
3. **Refactor for code quality** (while keeping tests green)
4. **Validate quality gates** (coverage, mutation, flakiness)
5. **DELIVER THE COMPLETE FEATURE** (tests + code + documentation)
```

**Problem**: Doesn't distinguish between mocked tests (insufficient) and integration tests (necessary)

**Fix**: Add explicit guidance that mocked unit tests alone are NOT sufficient for React components

### 2. ADD: Integration Tests as MANDATORY First Step

**Current Step 1** (line 108-169):
- Focuses on "generate tests" (unclear if unit or integration)
- Doesn't require integration tests

**Required Change**:
- **Step 1A**: Write failing INTEGRATION tests using real React components
- **Step 1B**: Write failing UNIT tests for isolated logic
- Both must fail (RED state) before implementing

### 3. RESTRUCTURE: Testing Hierarchy

**Add explicit guidance**:

```markdown
## Testing Hierarchy (Implementation Order)

### Step 1A: Integration Tests FIRST (Real React Components)
For React components:
- Test actual rendering
- Test useEffect hooks and dependency resolution
- Test state updates and re-renders
- Detect infinite loops, render storms
- Use actual component props, not mocks

Example:
- useAgentGeneration: Would have caught setState in useEffect dependencies
- Workflow component: Would have caught infinite render loop

### Step 1B: Unit Tests SECOND (Isolated Logic Only)
After integration tests pass:
- Test pure functions
- Test utility functions
- Test data transformations
- Mock external dependencies (API, filesystem)
- These are fast and focused

### Step 1C: E2E Tests LAST (User Flows)
After implementation complete:
- Test end-to-end workflows
- Test user interactions
- Test cross-component integration
```

### 4. ADD: Safety Rule Against Mocked Tests Alone

**Add to Safety Rules section** (line 459-479):

```markdown
### 🔴 NEVER for React Components:
- ❌ Write ONLY mocked unit tests for React components
- ❌ Skip integration tests with real React rendering
- ❌ Assume mocked tests validate component behavior
- ❌ Test only the "logic" without testing rendering
- ❌ Use enzyme/shallow rendering instead of real DOM

### ✅ ALWAYS for React Components:
- ✅ Write integration tests with real React components first
- ✅ Test actual rendering, not mocked versions
- ✅ Test useEffect hooks, dependencies, and cleanup
- ✅ Detect infinite loops and render storms
- ✅ Use React Testing Library (not enzyme shallow renders)
```

### 5. UPDATE: Step 1 Test Generation Subagent

**Current** (line 112-151):
```markdown
#### For Bug Fixes:
1. Use `tdd-test-generator` subagent to create a **failing test**
2. Verify test fails on current code (RED state)
3. Validate test quality with safety script
```

**Required Update**:
```markdown
#### For Bug Fixes (React Components):
1. **FIRST**: Generate **failing integration test** with real React component
   - Reproduce bug in real component rendering
   - Verify the bug manifests (RED state)
   - Example: Test that produces "Maximum update depth exceeded"

2. **THEN**: Generate **failing unit test** for isolated logic
   - Test the specific logic that needs fixing
   - Verify it fails (RED state)

3. **VALIDATE**: Run both test sets to ensure RED state
```

### 6. UPDATE: Step 2 Implementation (Self-Debug Loop)

**Current** (line 170-217):
- Focuses on making unit tests pass
- Integration tests are secondary

**Required Update**:
```markdown
### Step 2: Implement to Green (Integration Tests FIRST)

#### Integration Test Fixes:
1. Run the integration test (should fail with real rendering issue)
2. Analyze the actual React error (not mocked)
3. Fix the root cause in the component code
4. Integration test must pass

#### Unit Test Fixes:
5. After integration tests pass, fix unit tests if still failing
6. Unit tests should now pass quickly
```

### 7. ADD: Integration Test Templates

**Create new file**: `.claude/skills/tdd/templates/react-integration-test-template.tsx`

```typescript
/**
 * Integration Test Template for React Components
 *
 * Key difference from unit tests:
 * - Real React components (no shallow rendering)
 * - Real useEffect execution and dependency resolution
 * - Detects rendering issues (infinite loops, dependency bugs)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName - Integration Tests', () => {
  beforeEach(() => {
    // Setup: Real component mounting
  });

  afterEach(() => {
    // Cleanup: Verify no console errors
  });

  it('should render without infinite loops', async () => {
    // Real rendering, actual DOM
    const { container } = render(<YourComponent />);

    // Wait for stabilization
    await waitFor(() => {
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verify no console errors (infinite loops appear as errors)
    const errors = screen.queryByText(/Maximum update depth/);
    expect(errors).not.toBeInTheDocument();
  });

  it('should handle useEffect dependencies correctly', async () => {
    // Test actual effect execution with real dependencies
    render(<YourComponent someProp={value} />);

    // Change prop
    const { rerender } = render(<YourComponent someProp={newValue} />);

    // Wait for effect to run
    await waitFor(() => {
      expect(someState).toEqual(expectedValue);
    });

    // Verify effect ran correct number of times (not infinite)
    expect(effectRunCount).toBeLessThan(5);
  });
});
```

### 8. ADD: React Component Test Safety Checklist

**Create new file**: `.claude/skills/tdd/checklists/REACT_COMPONENT_TESTING.md`

```markdown
# React Component Testing Checklist

## Before Writing Tests
- [ ] Component identified as React component (hooks, state, effects)
- [ ] Two test suites planned: Integration (real) + Unit (mocked)

## Integration Tests (FIRST)
- [ ] Uses react-testing-library (not enzyme)
- [ ] Real component mounting with render()
- [ ] Tests actual DOM, not component internals
- [ ] Tests useEffect execution and dependencies
- [ ] Detects infinite loops, render storms
- [ ] Checks console for errors
- [ ] Passes before any implementation

## Unit Tests (SECOND)
- [ ] Tests isolated logic only
- [ ] Mocks child components
- [ ] Mocks external dependencies
- [ ] Tests edge cases and error paths
- [ ] Passes after integration tests pass

## Quality Gates
- [ ] No "Maximum update depth" errors in console
- [ ] No excessive render counts (< 5 renders per test)
- [ ] No unhandled promise rejections
- [ ] useEffect dependencies validated
```

## Success Criteria

After optimization, the TDD skill should:

1. ✅ **Prioritize Integration Tests**: Real React component tests are Step 1, not Step 4
2. ✅ **Prevent False Confidence**: Safety rules explicitly forbid mocked-tests-only approach
3. ✅ **Catch Real Bugs**: Integration tests would have caught the infinite loop before PR
4. ✅ **Clear Guidance**: React developers know to write integration tests first
5. ✅ **Templates Available**: Integration test templates for React components provided

## Impact

**Before**: Mocked unit tests pass → Infinite loop in production
**After**: Integration tests fail → Bug caught before implementation

---

## Optimization Tasks for Skills-Optimizer

1. **Analyze SKILL.md** (line 459-479): Safety rules don't mention React component pitfalls
2. **Restructure Step 1** (line 108-169): Add Step 1A (integration) + Step 1B (unit)
3. **Update Step 2** (line 170-217): Make integration tests primary, unit tests secondary
4. **Add Templates**: Create react-integration-test-template.tsx
5. **Add Checklists**: Create REACT_COMPONENT_TESTING.md
6. **Add Safety Rules**: Document that mocked tests alone are insufficient for React
7. **Create Examples**: Show how integration tests catch the infinite loop bug

---

**Prepared by**: User testing, real-world validation
**Status**: Ready for optimization
