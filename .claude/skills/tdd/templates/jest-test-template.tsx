/**
 * Jest + React Testing Library Template for TDD Skill
 *
 * This template follows Context7 best practices for React component testing:
 * - Use React Testing Library (user-centric testing)
 * - Test behavior, not implementation details
 * - Mock external dependencies and API calls
 * - Deterministic tests (no real time/network)
 * - Accessibility checks
 * - User interaction patterns
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
// Or for Jest:
// import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Import component under test
import { MyComponent } from '../../src/components/MyComponent';
// Import mocks
import { mockApiService } from '../mocks/apiService';

// Mock external dependencies
vi.mock('../../src/services/apiService', () => ({
  apiService: mockApiService
}));

describe('MyComponent - Feature/Bug Description', () => {
  // Setup user event for interactions
  const user = userEvent.setup();

  beforeEach(() => {
    // Use fake timers for deterministic testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    // Reset mocks
    vi.clearAllMocks();

    // Reset DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ============================================
  // FAIL-TO-PASS TEST (For Bug Fixes)
  // ============================================
  describe('Bug Fix: [Bug Description]', () => {
    it('should [expected behavior] when user [action]', async () => {
      // ARRANGE: Set up component with conditions that reproduce bug
      mockApiService.fetchData.mockResolvedValue({
        data: { id: '123', status: 'active' }
      });

      render(<MyComponent userId="123" />);

      // ACT: Simulate user interaction that triggers bug
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);

      // Wait for async operations
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // ASSERT: Verify bug is fixed
      // Before fix: This should FAIL
      // After fix: This should PASS
      expect(screen.getByText(/success/i)).toBeInTheDocument();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle edge case: [edge case description]', async () => {
      // Test boundary condition
      mockApiService.fetchData.mockResolvedValue({ data: null });

      render(<MyComponent userId="123" />);

      // Component should not crash with null data
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // ACCEPTANCE TESTS (For New Features)
  // ============================================
  describe('Feature: [Feature Name]', () => {
    // Happy path test
    it('should render component with correct initial state', () => {
      // ARRANGE & ACT
      render(<MyComponent userId="123" />);

      // ASSERT: Check initial render
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText(/user name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled();
    });

    it('should handle successful user interaction', async () => {
      mockApiService.submitData.mockResolvedValue({ success: true });

      render(<MyComponent userId="123" />);

      // User fills form
      const input = screen.getByLabelText(/user name/i);
      await user.type(input, 'John Doe');

      // User submits
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/successfully submitted/i)).toBeInTheDocument();
      });

      // Verify API was called correctly
      expect(mockApiService.submitData).toHaveBeenCalledWith({
        userId: '123',
        name: 'John Doe'
      });
    });

    // Boundary case: Empty input
    it('should validate required fields', async () => {
      render(<MyComponent userId="123" />);

      // Try to submit without filling required field
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });

      // Should not call API
      expect(mockApiService.submitData).not.toHaveBeenCalled();
    });

    // Boundary case: Maximum input
    it('should handle maximum input length', async () => {
      render(<MyComponent userId="123" />);

      const input = screen.getByLabelText(/user name/i);
      const maxInput = 'a'.repeat(255); // Assume 255 char limit

      await user.type(input, maxInput);

      expect(input).toHaveValue(maxInput);
      expect(screen.queryByText(/too long/i)).not.toBeInTheDocument();
    });

    // Negative case: API error
    it('should display error message when API call fails', async () => {
      mockApiService.submitData.mockRejectedValue(
        new Error('Network error')
      );

      render(<MyComponent userId="123" />);

      // Fill and submit
      await user.type(screen.getByLabelText(/user name/i), 'John Doe');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/error.*try again/i)).toBeInTheDocument();
      });

      // Should not show success message
      expect(screen.queryByText(/success/i)).not.toBeInTheDocument();
    });

    // Negative case: Invalid input format
    it('should validate input format', async () => {
      render(<MyComponent userId="123" />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email'); // No @ symbol

      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // USER INTERACTION PATTERNS (Context7)
  // ============================================
  describe('User Interactions', () => {
    it('should handle keyboard navigation', async () => {
      render(<MyComponent userId="123" />);

      const input = screen.getByLabelText(/user name/i);

      // Focus input
      input.focus();
      expect(input).toHaveFocus();

      // Tab to next element
      await user.tab();
      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toHaveFocus();

      // Submit with Enter key
      await user.keyboard('{Enter}');
      // Verify submission triggered
      expect(mockApiService.submitData).toHaveBeenCalled();
    });

    it('should handle mouse hover states', async () => {
      render(<MyComponent userId="123" />);

      const button = screen.getByRole('button', { name: /submit/i });

      // Hover over button
      await user.hover(button);

      // Check hover styles applied (via data attribute or aria)
      expect(button).toHaveAttribute('data-hovered', 'true');
    });

    it('should debounce rapid user input', async () => {
      vi.useFakeTimers();

      render(<MyComponent userId="123" />);

      const input = screen.getByLabelText(/search/i);

      // Rapid typing
      await user.type(input, 'test');

      // API should not be called immediately
      expect(mockApiService.search).not.toHaveBeenCalled();

      // Fast-forward debounce time (e.g., 300ms)
      vi.advanceTimersByTime(300);

      // Now API should be called once
      await waitFor(() => {
        expect(mockApiService.search).toHaveBeenCalledTimes(1);
        expect(mockApiService.search).toHaveBeenCalledWith('test');
      });
    });
  });

  // ============================================
  // ACCESSIBILITY (Context7 Best Practice)
  // ============================================
  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MyComponent userId="123" />);

      // Check form has accessible name
      const form = screen.getByRole('form');
      expect(form).toHaveAccessibleName();

      // Check inputs have labels
      const input = screen.getByLabelText(/user name/i);
      expect(input).toBeInTheDocument();

      // Check buttons have accessible names
      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toHaveAccessibleName();
    });

    it('should announce loading state to screen readers', async () => {
      mockApiService.fetchData.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<MyComponent userId="123" />);

      // Loading state should be announced
      const loadingIndicator = screen.getByRole('status');
      expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
      expect(loadingIndicator).toHaveTextContent(/loading/i);
    });

    it('should manage focus after modal close', async () => {
      render(<MyComponent userId="123" />);

      // Open modal
      const openButton = screen.getByRole('button', { name: /open modal/i });
      await user.click(openButton);

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Focus should return to open button
      await waitFor(() => {
        expect(openButton).toHaveFocus();
      });
    });
  });

  // ============================================
  // LOADING & ERROR STATES (Context7)
  // ============================================
  describe('Loading and Error States', () => {
    it('should show loading state during async operation', async () => {
      mockApiService.fetchData.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<MyComponent userId="123" />);

      // Should show loading immediately
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Button should be disabled during loading
      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });

    it('should hide loading state after operation completes', async () => {
      mockApiService.fetchData.mockResolvedValue({ data: 'test' });

      render(<MyComponent userId="123" />);

      // Wait for loading to disappear
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Content should be displayed
      expect(screen.getByText(/test/i)).toBeInTheDocument();
    });

    it('should show error state on failure', async () => {
      mockApiService.fetchData.mockRejectedValue(new Error('Failed'));

      render(<MyComponent userId="123" />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/error.*failed/i)).toBeInTheDocument();
      });

      // Should show retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeEnabled();
    });
  });

  // ============================================
  // COMPONENT INTEGRATION (Context7)
  // ============================================
  describe('Component Integration', () => {
    it('should integrate with parent component correctly', () => {
      const handleComplete = vi.fn();

      render(<MyComponent userId="123" onComplete={handleComplete} />);

      // Trigger completion
      const button = screen.getByRole('button', { name: /complete/i });
      user.click(button);

      // Callback should be called
      waitFor(() => {
        expect(handleComplete).toHaveBeenCalledWith({
          userId: '123',
          status: 'completed'
        });
      });
    });

    it('should handle prop updates correctly', async () => {
      const { rerender } = render(<MyComponent userId="123" />);

      expect(screen.getByText(/user 123/i)).toBeInTheDocument();

      // Update props
      rerender(<MyComponent userId="456" />);

      // Component should update
      await waitFor(() => {
        expect(screen.getByText(/user 456/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // SNAPSHOT TESTING (Use Sparingly)
  // ============================================
  describe('Snapshots', () => {
    it('should match snapshot for consistent UI', () => {
      const { container } = render(<MyComponent userId="123" />);

      // Only snapshot static, stable UI elements
      // Avoid snapshots for dynamic content
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});

// ============================================
// SAFETY CHECKS (TDD Skill Requirements)
// ============================================

// ✅ No network calls (all APIs mocked)
// ✅ No real time dependencies (vi.useFakeTimers)
// ✅ Deterministic (no random behavior, seeded timers)
// ✅ User-centric queries (getByRole, getByLabelText, not getByTestId)
// ✅ Accessibility checks (ARIA, keyboard navigation)
// ✅ Async properly handled (waitFor, not fixed timeouts)
// ✅ Isolated tests (cleanup between tests)

// ============================================
// NEXT STEPS FOR TDD WORKFLOW
// ============================================

// 1. Run this test FIRST (before implementation) → Should FAIL (RED)
// 2. Implement component to make test pass (GREEN)
// 3. Refactor while keeping tests GREEN
// 4. Run quality gates (coverage, mutation, flakiness)
// 5. Create PR linking this test to your changes
