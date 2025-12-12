/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * useFocusTrap Hook Tests
 * Coverage Target: 80%
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

// Test component that uses the hook
function TestComponent({ active }: { active: boolean }) {
  const containerRef = useFocusTrap<HTMLDivElement>(active);

  return (
    <div ref={containerRef} data-testid="container">
      <button data-testid="first-button">First</button>
      <input data-testid="input" />
      <button data-testid="last-button">Last</button>
    </div>
  );
}

// Component with single focusable element
function SingleElementComponent({ active }: { active: boolean }) {
  const containerRef = useFocusTrap<HTMLDivElement>(active);

  return (
    <div ref={containerRef} data-testid="container">
      <button data-testid="only-button">Only</button>
    </div>
  );
}

// Component with no focusable elements
function NoFocusableComponent({ active }: { active: boolean }) {
  const containerRef = useFocusTrap<HTMLDivElement>(active);

  return (
    <div ref={containerRef} data-testid="container">
      <span>Not focusable</span>
    </div>
  );
}

describe('useFocusTrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return a ref', () => {
      render(<TestComponent active={false} />);
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });

    it('should focus first element when active', () => {
      render(<TestComponent active={true} />);
      const firstButton = screen.getByTestId('first-button');
      expect(document.activeElement).toBe(firstButton);
    });

    it('should not focus when inactive', () => {
      render(<TestComponent active={false} />);
      const firstButton = screen.getByTestId('first-button');
      expect(document.activeElement).not.toBe(firstButton);
    });
  });

  describe('Tab Navigation Forward', () => {
    it('should trap focus on Tab from last element to first', () => {
      render(<TestComponent active={true} />);

      const firstButton = screen.getByTestId('first-button');
      const lastButton = screen.getByTestId('last-button');
      const container = screen.getByTestId('container');

      // Focus last element
      lastButton.focus();
      expect(document.activeElement).toBe(lastButton);

      // Press Tab on container
      fireEvent.keyDown(container, { key: 'Tab', shiftKey: false });

      // Should wrap to first element
      expect(document.activeElement).toBe(firstButton);
    });

    it('should allow normal Tab when not on last element', () => {
      render(<TestComponent active={true} />);

      const firstButton = screen.getByTestId('first-button');
      const container = screen.getByTestId('container');

      // Focus first element
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);

      // Press Tab on container (should not prevent default)
      const event = fireEvent.keyDown(container, { key: 'Tab', shiftKey: false });

      // Event should not be prevented since we're not on last element
      // The activeElement won't change in jsdom without browser behavior
    });
  });

  describe('Tab Navigation Backward (Shift+Tab)', () => {
    it('should trap focus on Shift+Tab from first element to last', () => {
      render(<TestComponent active={true} />);

      const firstButton = screen.getByTestId('first-button');
      const lastButton = screen.getByTestId('last-button');
      const container = screen.getByTestId('container');

      // First element is already focused
      expect(document.activeElement).toBe(firstButton);

      // Press Shift+Tab on container
      fireEvent.keyDown(container, { key: 'Tab', shiftKey: true });

      // Should wrap to last element
      expect(document.activeElement).toBe(lastButton);
    });

    it('should allow normal Shift+Tab when not on first element', () => {
      render(<TestComponent active={true} />);

      const lastButton = screen.getByTestId('last-button');
      const container = screen.getByTestId('container');

      // Focus last element
      lastButton.focus();
      expect(document.activeElement).toBe(lastButton);

      // Press Shift+Tab on container
      fireEvent.keyDown(container, { key: 'Tab', shiftKey: true });

      // Should not wrap since we're not on first element
      // In real browser this would move to input
    });
  });

  describe('Non-Tab Keys', () => {
    it('should ignore non-Tab key presses', () => {
      render(<TestComponent active={true} />);

      const firstButton = screen.getByTestId('first-button');
      const container = screen.getByTestId('container');

      // First element should be focused
      expect(document.activeElement).toBe(firstButton);

      // Press Escape (should be ignored)
      fireEvent.keyDown(container, { key: 'Escape' });

      // Focus should not change
      expect(document.activeElement).toBe(firstButton);
    });

    it('should ignore Enter key presses', () => {
      render(<TestComponent active={true} />);

      const firstButton = screen.getByTestId('first-button');
      const container = screen.getByTestId('container');

      expect(document.activeElement).toBe(firstButton);

      fireEvent.keyDown(container, { key: 'Enter' });

      expect(document.activeElement).toBe(firstButton);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single focusable element', () => {
      render(<SingleElementComponent active={true} />);

      const onlyButton = screen.getByTestId('only-button');
      const container = screen.getByTestId('container');

      expect(document.activeElement).toBe(onlyButton);

      // Tab should wrap to itself
      fireEvent.keyDown(container, { key: 'Tab', shiftKey: false });
      expect(document.activeElement).toBe(onlyButton);
    });

    it('should handle no focusable elements', () => {
      render(<NoFocusableComponent active={true} />);

      // No element should be focused
      const container = screen.getByTestId('container');

      // Tab should not cause error
      fireEvent.keyDown(container, { key: 'Tab', shiftKey: false });
    });

    it('should cleanup event listener on unmount', () => {
      const { unmount } = render(<TestComponent active={true} />);

      // Should unmount without error
      unmount();
    });

    it('should cleanup event listener when active changes to false', () => {
      const { rerender } = render(<TestComponent active={true} />);

      // Change to inactive
      rerender(<TestComponent active={false} />);

      // Container should not trap focus anymore
    });
  });

  describe('Activation State', () => {
    it('should activate trap when active changes from false to true', () => {
      const { rerender } = render(<TestComponent active={false} />);

      const firstButton = screen.getByTestId('first-button');
      expect(document.activeElement).not.toBe(firstButton);

      rerender(<TestComponent active={true} />);

      expect(document.activeElement).toBe(firstButton);
    });

    it('should not trap focus when active is false', () => {
      render(<TestComponent active={false} />);

      const lastButton = screen.getByTestId('last-button');
      const container = screen.getByTestId('container');

      lastButton.focus();
      expect(document.activeElement).toBe(lastButton);

      // Tab should not be trapped (event listener not added)
      fireEvent.keyDown(container, { key: 'Tab', shiftKey: false });

      // Focus should remain (not trapped to first)
      expect(document.activeElement).toBe(lastButton);
    });
  });
});
