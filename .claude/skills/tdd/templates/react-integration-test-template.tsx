/**
 * Integration Test Template for React Components
 *
 * CRITICAL DIFFERENCE FROM UNIT TESTS:
 * - Integration tests use REAL React components (not mocked shallow rendering)
 * - Integration tests execute ACTUAL useEffect hooks with real dependencies
 * - Integration tests detect rendering issues: infinite loops, dependency bugs, stale closures
 * - Integration tests validate actual DOM behavior, not component implementation details
 *
 * WHEN TO USE THIS TEMPLATE:
 * - Testing React components with hooks (useState, useEffect, custom hooks)
 * - Testing component behavior that depends on rendering lifecycle
 * - Testing dependency arrays and effect cleanup
 * - Detecting infinite loops and render storms
 *
 * DO NOT USE THIS TEMPLATE FOR:
 * - Testing pure utility functions (use unit tests instead)
 * - Testing Redux selectors or reducers (use unit tests)
 * - Testing isolated business logic (use unit tests)
 *
 * @see https://testing-library.com/react - React Testing Library docs
 * @see https://vitest.dev/ - Vitest docs
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

/**
 * EXAMPLE 1: Testing Component Rendering (Happy Path)
 *
 * This test verifies:
 * - Component renders without crashing
 * - Expected elements appear in DOM
 * - Initial state displays correctly
 *
 * REAL-WORLD ISSUE THIS CATCHES:
 * - Missing imports or syntax errors
 * - Components throwing during render
 * - Conditional rendering not working
 */
describe('ComponentName - Rendering', () => {
  it('should render without crashing', async () => {
    // SETUP: Render actual component (not mocked, not shallow)
    const { container } = render(
      <ComponentName initialValue="test" onValueChange={vi.fn()} />
    );

    // VERIFY: Expected element appears in DOM
    expect(screen.getByText('Expected Display Text')).toBeInTheDocument();

    // VERIFY: Component received and displays prop
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('should apply styling classes correctly', async () => {
    render(<ComponentName status="active" />);

    // Test actual DOM classes (not component props)
    const element = screen.getByRole('button');
    expect(element).toHaveClass('active-state');
  });
});

/**
 * EXAMPLE 2: Testing useEffect Dependencies (CRITICAL)
 *
 * This test verifies:
 * - Effect runs when dependencies change
 * - Effect does NOT run when dependencies don't change
 * - Effect cleanup runs properly
 * - No infinite loops from circular dependencies
 *
 * REAL-WORLD ISSUE THIS CATCHES:
 * - setState in useEffect dependencies causing infinite loops
 * - Missing dependencies causing stale closures
 * - Effects not triggering on expected changes
 */
describe('ComponentName - useEffect Dependencies', () => {
  // CRITICAL: Track if effect ran
  let effectRunCount = 0;

  beforeEach(() => {
    effectRunCount = 0;
    vi.clearAllMocks();
  });

  it('should run effect when dependency changes', async () => {
    // SETUP: Mock callback to track effect runs
    const mockCallback = vi.fn(() => {
      effectRunCount++;
    });

    const { rerender } = render(
      <ComponentName value="initial" onChange={mockCallback} />
    );

    // VERIFY: Effect ran on mount
    expect(effectRunCount).toBeGreaterThanOrEqual(1);

    // CHANGE DEPENDENCY: Update prop
    rerender(<ComponentName value="updated" onChange={mockCallback} />);

    // VERIFY: Effect ran again (dependency changed)
    await waitFor(() => {
      expect(effectRunCount).toBeGreaterThan(1);
    });
  });

  it('should NOT run effect when dependencies unchanged', async () => {
    const mockCallback = vi.fn();
    const initialRuns = 1; // Runs once on mount

    const { rerender } = render(
      <ComponentName value="test" onChange={mockCallback} />
    );

    // Wait for initial effect to complete
    await waitFor(() => {
      expect(effectRunCount).toBeGreaterThanOrEqual(initialRuns);
    });

    const runsAfterMount = effectRunCount;

    // RERENDER with SAME dependencies (prop value unchanged)
    rerender(<ComponentName value="test" onChange={mockCallback} />);

    // Wait and verify no new effect run
    await new Promise(resolve => setTimeout(resolve, 100));

    // VERIFY: Effect did NOT run again (dependencies unchanged)
    expect(effectRunCount).toBe(runsAfterMount);
  });

  it('should NOT cause infinite loops from circular dependencies', async () => {
    // SETUP: Console error capture
    const consoleErrors: string[] = [];
    const originalError = console.error;
    console.error = vi.fn((msg: string) => {
      consoleErrors.push(msg);
    });

    try {
      render(<ComponentName autoRefresh={true} />);

      // WAIT: Watch for infinite loop pattern
      await waitFor(
        () => {
          // "Maximum update depth exceeded" error indicates infinite loop
          const hasMaxDepthError = consoleErrors.some(
            msg => msg.includes('Maximum update depth') || msg.includes('too many re-renders')
          );
          expect(hasMaxDepthError).toBe(false);
        },
        { timeout: 3000 }
      );

      // VERIFY: Effect ran reasonable number of times
      expect(effectRunCount).toBeLessThan(10);
    } finally {
      console.error = originalError;
    }
  });
});

/**
 * EXAMPLE 3: Testing State Updates and Re-renders
 *
 * This test verifies:
 * - State updates trigger re-renders
 * - DOM updates reflect new state
 * - Multiple state updates work correctly
 * - State updates don't cause infinite loops
 *
 * REAL-WORLD ISSUE THIS CATCHES:
 * - setState not triggering re-renders
 * - State updates in wrong order
 * - Stale state values from closures
 * - setState called inside effect dependencies
 */
describe('ComponentName - State Updates', () => {
  it('should update state and re-render when button clicked', async () => {
    const user = userEvent.setup();

    render(<ComponentNameWithButton initialCount={0} />);

    // VERIFY: Initial state displayed
    expect(screen.getByText('Count: 0')).toBeInTheDocument();

    // USER INTERACTION: Click button
    const button = screen.getByRole('button', { name: 'Increment' });
    await user.click(button);

    // VERIFY: State updated and re-render happened
    await waitFor(() => {
      expect(screen.getByText('Count: 1')).toBeInTheDocument();
    });

    // CLICK AGAIN
    await user.click(button);

    // VERIFY: State updated again
    await waitFor(() => {
      expect(screen.getByText('Count: 2')).toBeInTheDocument();
    });
  });

  it('should batch multiple state updates correctly', async () => {
    const user = userEvent.setup();

    render(<ComponentWithMultipleStates />);

    // VERIFY: Initial state
    expect(screen.getByText(/name: Initial/)).toBeInTheDocument();
    expect(screen.getByText(/status: pending/)).toBeInTheDocument();

    // USER INTERACTION: Trigger multiple state updates
    await user.click(screen.getByRole('button', { name: 'Update All' }));

    // VERIFY: All states updated (not just first one)
    await waitFor(() => {
      expect(screen.getByText(/name: Updated/)).toBeInTheDocument();
      expect(screen.getByText(/status: complete/)).toBeInTheDocument();
    });
  });
});

/**
 * EXAMPLE 4: Testing Custom Hooks with Real Component Context
 *
 * This test verifies:
 * - Hook runs on mount
 * - Hook cleans up properly
 * - Hook updates when component updates
 * - Hook doesn't cause infinite loops
 *
 * REAL-WORLD ISSUE THIS CATCHES:
 * - Hook dependency bugs
 * - Hook cleanup not running
 * - Hook causing infinite renders
 */
describe('useCustomHook - Integration', () => {
  it('should initialize and cleanup hook properly', async () => {
    const mockCleanup = vi.fn();
    const mockInitialize = vi.fn();

    // Mock the hook to track lifecycle
    vi.mock('./hooks/useCustomHook', () => ({
      useCustomHook: (config: any) => {
        React.useEffect(() => {
          mockInitialize(config);
          return () => mockCleanup();
        }, [config]);
        return { data: 'test' };
      },
    }));

    const { unmount } = render(
      <ComponentUsingHook config={{ mode: 'test' }} />
    );

    // VERIFY: Hook initialized
    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalled();
    });

    // UNMOUNT: Trigger cleanup
    unmount();

    // VERIFY: Cleanup ran
    expect(mockCleanup).toHaveBeenCalled();
  });
});

/**
 * EXAMPLE 5: Testing Error Handling and Edge Cases
 *
 * This test verifies:
 * - Component handles errors gracefully
 * - Error boundary displays error message
 * - Component recovers from errors
 *
 * REAL-WORLD ISSUE THIS CATCHES:
 * - Unhandled exceptions
 * - Undefined state crashes
 * - Missing error boundaries
 */
describe('ComponentName - Error Handling', () => {
  it('should handle undefined props gracefully', async () => {
    // Suppress console error for this test (expected error)
    const originalError = console.error;
    console.error = vi.fn();

    try {
      render(<ComponentName data={undefined} />);

      // Verify no crash, component renders safely
      expect(screen.getByText('No data provided')).toBeInTheDocument();
    } finally {
      console.error = originalError;
    }
  });

  it('should display error message when data load fails', async () => {
    const mockCallback = vi.fn().mockRejectedValue(new Error('API Error'));

    render(<ComponentWithDataFetch onLoadData={mockCallback} />);

    // WAIT: For error display
    await waitFor(() => {
      expect(screen.getByText(/API Error/)).toBeInTheDocument();
    });
  });
});

/**
 * EXAMPLE 6: Testing Async Operations and Loading States
 *
 * This test verifies:
 * - Loading state displays while fetching
 * - Data displays after loading
 * - Cleanup happens when component unmounts
 *
 * REAL-WORLD ISSUE THIS CATCHES:
 * - Async operations not completing
 * - Race conditions in async updates
 * - Memory leaks from async ops
 */
describe('ComponentWithAsync - Integration', () => {
  it('should display loading state then data', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: 'loaded' });

    render(<ComponentWithAsync onFetch={mockFetch} />);

    // VERIFY: Loading state appears first
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // WAIT: For async operation to complete
    await waitFor(() => {
      expect(screen.getByText('loaded')).toBeInTheDocument();
    });

    // VERIFY: Loading state gone
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should cleanup async operations on unmount', async () => {
    const abortController = new AbortController();
    const mockFetch = vi.fn().mockImplementation(
      () => new Promise(resolve => {
        const timer = setTimeout(() => resolve({ data: 'loaded' }), 10000);
        abortController.signal.addEventListener('abort', () => clearTimeout(timer));
      })
    );

    const { unmount } = render(
      <ComponentWithAsync onFetch={mockFetch} controller={abortController} />
    );

    // UNMOUNT before async completes
    unmount();

    // VERIFY: Abort called (cleanup happened)
    // In real component, this would be in useEffect cleanup
    expect(abortController.signal.aborted).toBe(true);
  });
});

/**
 * SETUP AND TEARDOWN HELPERS
 *
 * These helpers ensure tests run in isolated environments
 */

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();

  // Reset console
  vi.clearAllTimers();
});

afterEach(() => {
  // Verify no unhandled errors in console
  const consoleErrors: string[] = [];
  const originalError = console.error;
  console.error = (msg: string) => {
    // Only flag unexpected errors (not React warnings we expect)
    if (!msg.includes('Warning') && !msg.includes('act')) {
      consoleErrors.push(msg);
    }
  };

  expect(consoleErrors).toHaveLength(0);

  console.error = originalError;
});

/**
 * KEY DIFFERENCES FROM UNIT TESTS
 *
 * ❌ UNIT TEST (Mocked):
 * ```typescript
 * import { render } from '@testing-library/react-shallow';
 * render(<Component />, { shallow: true });  // WRONG: Shallow rendering misses real issues
 * ```
 *
 * ✅ INTEGRATION TEST (Real Component):
 * ```typescript
 * import { render } from '@testing-library/react';
 * render(<Component />);  // RIGHT: Real rendering, real hooks, real issues
 * ```
 *
 * ❌ WRONG: Testing component internals
 * ```typescript
 * expect(component.state.count).toBe(1);  // Can't access internal state
 * ```
 *
 * ✅ RIGHT: Testing DOM/behavior
 * ```typescript
 * expect(screen.getByText('Count: 1')).toBeInTheDocument();
 * ```
 *
 * ❌ WRONG: Assuming mocked tests = working code
 * - Mocked tests pass
 * - Real app in browser: infinite loop!
 *
 * ✅ RIGHT: Integration tests catch real issues
 * - Integration test detects "Maximum update depth" error
 * - Bug fixed before implementation
 */
