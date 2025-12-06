# React Component Testing Checklist

**Purpose**: Ensure React components are tested properly with integration tests FIRST, unit tests SECOND.

**Status**: Use this checklist for every React component you test in the TDD workflow.

---

## ⚠️ CRITICAL: Identify Component Type First

### Is this a React Component?

**YES - if the component:**
- [ ] Uses `useState`, `useReducer`, or other React hooks
- [ ] Has `useEffect` for side effects
- [ ] Uses custom hooks
- [ ] Has conditional rendering based on state
- [ ] Renders JSX/UI elements

**NO - if this is:**
- [ ] Pure utility function (math, data transform)
- [ ] API client / data service
- [ ] Redux reducer or selector
- [ ] Node.js backend code
- [ ] Configuration or type definitions

**➡️ If YES → Use This Checklist**
**➡️ If NO → Use standard unit test checklist**

---

## PHASE 1: Planning (Before Writing ANY Tests)

### Identify Testing Needs

- [ ] **Understand component responsibility**
  - What is the component's main purpose?
  - What does it render?
  - What state does it manage?
  - What effects does it have?

- [ ] **Identify hooks used**
  - [ ] `useState` for state
  - [ ] `useEffect` for side effects
  - [ ] Custom hooks
  - [ ] Context consumers
  - [ ] `useCallback`, `useMemo`, etc.

- [ ] **Identify rendering triggers**
  - What causes re-renders?
  - What are the dependencies?
  - Are there any dependency array issues?

- [ ] **Identify potential bugs**
  - Could there be infinite loops?
  - Are dependencies missing?
  - Could there be stale closures?
  - Are effects cleaning up properly?

---

## PHASE 2: Integration Tests (FIRST)

### ✅ STEP 1: Write Integration Test Skeleton

- [ ] Create test file in `/tests/integration/ComponentName.test.tsx`
- [ ] Use `import { render, screen, waitFor } from '@testing-library/react'`
- [ ] **DO NOT import from `@testing-library/react-shallow`** (wrong library)
- [ ] **DO NOT use `.shallow()`** (mocked rendering)

### ✅ STEP 2: Test Rendering Without Infinite Loops

**Test Name**: `should render without infinite loops`

Requirements:
- [ ] Render actual component with real props
- [ ] Capture console errors
- [ ] Wait for component to stabilize
- [ ] Assert NO "Maximum update depth exceeded" error
- [ ] Assert NO "too many re-renders" error
- [ ] Test must FAIL with current broken code (RED state)

**Example**:
```typescript
it('should render without infinite loops', async () => {
  const consoleErrors: string[] = [];
  const originalError = console.error;
  console.error = (msg: string) => consoleErrors.push(msg);

  try {
    render(<YourComponent prop="value" />);

    await waitFor(() => {
      expect(screen.getByText('Expected')).toBeInTheDocument();
    }, { timeout: 2000 });

    const hasLoopError = consoleErrors.some(e =>
      e.includes('Maximum update depth') || e.includes('too many re-renders')
    );
    expect(hasLoopError).toBe(false);
  } finally {
    console.error = originalError;
  }
});
```

### ✅ STEP 3: Test useEffect Dependencies

**Test Name**: `should not cause infinite loops from circular dependencies`

Requirements:
- [ ] Test that effect runs on dependency change
- [ ] Test that effect does NOT run when dependencies unchanged
- [ ] Test effect cleanup runs properly
- [ ] Verify reasonable effect execution count (< 5 runs in 2 seconds)
- [ ] Test must FAIL if dependencies are broken (RED state)

**Example**:
```typescript
it('should run effect when dependency changes', async () => {
  let effectRuns = 0;
  const mockEffect = vi.fn(() => { effectRuns++; });

  const { rerender } = render(
    <YourComponent value="initial" onChange={mockEffect} />
  );

  const initialRuns = effectRuns;

  // Change dependency
  rerender(<YourComponent value="updated" onChange={mockEffect} />);

  await waitFor(() => {
    expect(effectRuns).toBeGreaterThan(initialRuns);
  });
});
```

### ✅ STEP 4: Test State Updates and Re-renders

**Test Name**: `should update state and re-render when [trigger] happens`

Requirements:
- [ ] Trigger state update (click, prop change, etc)
- [ ] Verify DOM reflects new state
- [ ] Use `screen.getByText()` to verify actual DOM (not internal state)
- [ ] Use `waitFor()` for async state updates
- [ ] Test must FAIL before state update code is implemented

**Example**:
```typescript
it('should update state when button clicked', async () => {
  const user = userEvent.setup();
  render(<YourComponent count={0} />);

  expect(screen.getByText('Count: 0')).toBeInTheDocument();

  const button = screen.getByRole('button', { name: 'Increment' });
  await user.click(button);

  await waitFor(() => {
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

### ✅ STEP 5: Test Edge Cases and Error Handling

**Test Name**: `should handle [edge case] gracefully`

Requirements:
- [ ] Test with `undefined` props
- [ ] Test with empty data
- [ ] Test with invalid data
- [ ] Verify component doesn't crash
- [ ] Verify error message displays (if applicable)

**Example**:
```typescript
it('should handle missing data gracefully', async () => {
  render(<YourComponent data={undefined} />);

  expect(screen.getByText('No data')).toBeInTheDocument();
});
```

### ✅ STEP 6: Verify Integration Tests FAIL (RED State)

**CRITICAL: Tests must fail before implementation**

```bash
# Run only integration tests
npm test -- tests/integration/YourComponent.test.tsx --run

# Expected output: ❌ FAILED: X tests, all should fail in RED state
```

- [ ] All integration tests FAIL
- [ ] Failures match expected bugs (e.g., "Maximum update depth exceeded")
- [ ] Tests are not vacuous (assertions actually test something)

---

## PHASE 3: Implement to Make Integration Tests Pass

### ✅ STEP 7: Fix Integration Tests ONE AT A TIME

- [ ] Fix first integration test
- [ ] Run ONLY that one test: `npm test -- YourComponent.test.tsx -t "should render without infinite loops"`
- [ ] Fix code to make test pass
- [ ] Verify test GREEN
- [ ] Move to next integration test
- [ ] Repeat until ALL integration tests PASS

**Common Fixes for React Tests**:
- Remove `setState` from `useEffect` dependencies
- Add missing dependencies to dependency arrays
- Fix stale closures by using `useCallback`
- Implement proper cleanup in useEffect

### ✅ STEP 8: Run Full Integration Test Suite

```bash
npm test -- tests/integration/YourComponent.test.tsx --run
```

- [ ] ALL integration tests PASS (GREEN state)
- [ ] No console errors
- [ ] No "Maximum update depth" warnings

---

## PHASE 4: Unit Tests (SECOND - After Integration Tests Pass)

### ✅ STEP 9: Write Unit Tests for Isolated Logic

**ONLY AFTER integration tests pass** ← IMPORTANT

- [ ] Create test file in `/tests/unit/YourComponent.test.tsx`
- [ ] Mock child components: `vi.mock('./ChildComponent')`
- [ ] Mock external dependencies: `vi.mock('./api')`
- [ ] Test ONLY isolated logic (calculations, transformations, etc)
- [ ] Use shallow rendering or mocks for child components

**DO NOT**: Re-test what integration tests already verified

### ✅ STEP 10: Verify Unit Tests FAIL (RED State)

```bash
npm test -- tests/unit/YourComponent.test.tsx --run
```

- [ ] Unit tests FAIL in RED state
- [ ] Failures are for unimplemented logic (not rendering)

### ✅ STEP 11: Fix Unit Tests ONE AT A TIME

- [ ] Use self-debug loop: run → analyze → fix → repeat
- [ ] Max 3 iterations per test
- [ ] Fix code to make logic pass tests
- [ ] Verify test GREEN

### ✅ STEP 12: Run Full Unit Test Suite

```bash
npm test -- tests/unit/YourComponent.test.tsx --run
```

- [ ] ALL unit tests PASS (GREEN)

---

## PHASE 5: Run Full Test Suite

### ✅ STEP 13: Run All Tests (Integration + Unit)

```bash
npm test tests/integration/ tests/unit/ --run
```

- [ ] ✅ ALL integration tests PASS
- [ ] ✅ ALL unit tests PASS
- [ ] ✅ No console errors
- [ ] ✅ No warnings

---

## PHASE 6: Quality Gates

### ✅ STEP 14: Run Quality Checks

```bash
# Coverage report
npm run test:coverage

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

- [ ] Coverage ≥ 80% on changed files
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## PHASE 7: Commit and PR

### ✅ STEP 15: Create PR with Test Evidence

- [ ] Link integration tests to implementation changes
- [ ] Show failing test output (RED state before fix)
- [ ] Show passing test output (GREEN state after fix)
- [ ] Document why fix was needed

**Example PR Description**:
```markdown
## Integration Tests
- ✅ `should render without infinite loops`
  - **Before**: Fails with "Maximum update depth exceeded"
  - **After**: Passes, no errors
  - **Fix**: Removed setState from useEffect dependencies

## Unit Tests
- ✅ `should calculate correctly`
  - **Before**: Fails
  - **After**: Passes
```

---

## ❌ Common Mistakes to Avoid

### Mistake 1: Using Shallow/Mocked Rendering

```typescript
// ❌ WRONG: Shallow rendering (mocked)
import { shallow } from 'enzyme';
const wrapper = shallow(<YourComponent />);

// ✅ RIGHT: Real rendering
import { render } from '@testing-library/react';
const { container } = render(<YourComponent />);
```

### Mistake 2: Testing Component Internals Instead of DOM

```typescript
// ❌ WRONG: Accessing internal state
expect(component.state.count).toBe(1);
expect(component.instance.value).toEqual('test');

// ✅ RIGHT: Testing DOM
expect(screen.getByText('Count: 1')).toBeInTheDocument();
expect(screen.getByDisplayValue('test')).toBeInTheDocument();
```

### Mistake 3: Skipping Integration Tests

```typescript
// ❌ WRONG: Only unit tests
describe('YourComponent', () => {
  it('calculates correctly', () => {
    // This mocked unit test passes
    expect(calculate(1, 2)).toBe(3);
  });
});
// Result: App is broken but tests pass!

// ✅ RIGHT: Integration tests FIRST
describe('YourComponent Integration', () => {
  it('should render without infinite loops', async () => {
    render(<YourComponent />);
    // This catches the infinite loop!
  });
});
```

### Mistake 4: Not Testing useEffect Dependencies

```typescript
// ❌ WRONG: No dependency array testing
it('should work', () => {
  render(<YourComponent />);
  expect(screen.getByText('Done')).toBeInTheDocument();
});

// ✅ RIGHT: Test dependencies explicitly
it('should NOT cause infinite loops', async () => {
  let runCount = 0;
  // Track effect execution
  // Verify < 5 runs in 2 seconds
});
```

### Mistake 5: Assuming Tests Pass = Code Works

```typescript
// ❌ WRONG MINDSET
- Wrote 14 unit tests
- All tests pass ✅
- Assume code is correct ❌ WRONG!
- Deploy to production ❌ BROKEN!

// ✅ RIGHT MINDSET
- Write integration tests (real rendering) → 5 FAIL ❌
- Write unit tests (isolated logic) → help with implementation
- Fix integration tests FIRST → 5 PASS ✅
- Fix unit tests SECOND → all PASS ✅
- Deploy to production ✅ WORKS!
```

---

## ✅ Success Criteria

### Your React Component Testing is CORRECT When:

- [ ] ✅ Integration tests written FIRST (with real rendering)
- [ ] ✅ Integration tests caught rendering issues before implementation
- [ ] ✅ All integration tests PASS (GREEN state)
- [ ] ✅ Unit tests written SECOND (for isolated logic)
- [ ] ✅ All unit tests PASS (GREEN state)
- [ ] ✅ No "Maximum update depth" errors in console
- [ ] ✅ useEffect dependencies verified
- [ ] ✅ Component works in real browser (not just tests)
- [ ] ✅ Coverage ≥ 80%
- [ ] ✅ No unhandled promise rejections

### Your React Component Testing is WRONG When:

- [ ] ❌ Only mocked unit tests (shallow rendering)
- [ ] ❌ Tests pass but app is broken in browser
- [ ] ❌ Infinite loops not caught by tests
- [ ] ❌ useEffect dependency bugs not detected
- [ ] ❌ Component internals tested instead of DOM behavior
- [ ] ❌ Tests assume implementation details

---

## Quick Reference

| Level | Framework | Purpose | Catches |
|-------|-----------|---------|---------|
| **Integration** | React Testing Library | Real component rendering | Infinite loops, dependency bugs, rendering issues |
| **Unit** | Vitest + Mocks | Isolated logic | Logic errors, edge cases |
| **E2E** | Playwright | Full user flows | Cross-component issues, navigation |

**ORDER**: Integration FIRST → Unit SECOND → E2E THIRD

---

## Questions?

- **"Should I test this component?"** → If it has hooks, YES (integration test)
- **"Why integration tests first?"** → They catch real rendering issues
- **"What about snapshot tests?"** → Avoid; test behavior, not snapshots
- **"Can I just use unit tests?"** → NO; mocked tests miss real issues
- **"How do I test async?"** → Use `waitFor()` and `act()`
- **"How do I test hooks?"** → With real component rendering (not shallow)

---

**Remember**: ✅ Integration tests catch bugs that mocked unit tests miss.
**Result**: ✅ Code that actually works in production.
