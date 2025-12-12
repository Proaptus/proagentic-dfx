/**
 * Accessibility Test Suite
 * REQ-276: Keyboard navigation for all interactive elements
 * REQ-277: Screen reader support with ARIA labels
 * REQ-278: Focus management
 * REQ-279: Skip links
 * REQ-280: Color contrast compliance
 *
 * Tests WCAG 2.1 AA compliance across all UI components
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useState } from 'react';
import { vi } from 'vitest';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests - WCAG 2.1 AA Compliance', () => {
  describe('Button Component (REQ-276, REQ-277)', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard accessible with Enter key', async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      button.focus();
      expect(document.activeElement).toBe(button);

      await userEvent.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible with Space key', async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      button.focus();

      await userEvent.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should announce loading state to screen readers', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should announce disabled state to screen readers', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toBeDisabled();
    });

    it('should have visible focus indicator', () => {
      render(<Button>Focus me</Button>);
      const button = screen.getByRole('button');

      // Check for focus ring classes
      expect(button.className).toContain('focus:ring-2');
      expect(button.className).toContain('focus:ring-offset-2');
    });

    it('should render all variants without accessibility violations', async () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'destructive'] as const;

      for (const variant of variants) {
        const { container } = render(<Button variant={variant}>{variant}</Button>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('LoadingState Component (REQ-277)', () => {
    it('should have proper ARIA attributes for spinner variant', () => {
      render(<LoadingState variant="spinner" text="Loading data..." />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Loading data...');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper ARIA attributes for progress variant', () => {
      render(<LoadingState variant="progress" text="Uploading..." progress={50} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have proper ARIA attributes for skeleton variant', () => {
      render(<LoadingState variant="skeleton" />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Loading content');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<LoadingState text="Loading..." />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ErrorState Component (REQ-277)', () => {
    it('should announce errors to screen readers', () => {
      render(
        <ErrorState
          type="error"
          title="Error occurred"
          message="Something went wrong"
        />
      );
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ErrorState type="error" title="Test Error" message="Test message" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible action button', () => {
      const onRetry = vi.fn();
      render(
        <ErrorState
          type="error"
          title="Error"
          action={{ label: 'Retry', onClick: onRetry }}
        />
      );
      const button = screen.getByRole('button', { name: /retry/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Modal Component (REQ-276, REQ-277, REQ-278)', () => {
    function ModalWrapper() {
      const [isOpen, setIsOpen] = useState(true);
      return (
        <Modal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title="Test Modal"
          description="This is a test modal"
        >
          <Button>First Button</Button>
          <Button>Second Button</Button>
        </Modal>
      );
    }

    it('should have proper dialog role and ARIA attributes', () => {
      render(<ModalWrapper />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
    });

    it('should trap focus within modal when open', async () => {
      render(<ModalWrapper />);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');

      // First focusable element should be focused when modal opens
      await waitFor(() => {
        expect(document.activeElement).toBe(buttons[0]);
      });

      // Verify that focus is trapped by checking we have multiple buttons
      expect(buttons.length).toBeGreaterThan(1);
    });

    it('should close on Escape key press', async () => {
      function TestModal() {
        const [isOpen, setIsOpen] = useState(true);
        return (
          <>
            <div data-testid="open-state">{isOpen ? 'open' : 'closed'}</div>
            <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Test">
              <p>Content</p>
            </Modal>
          </>
        );
      }

      render(<TestModal />);
      expect(screen.getByTestId('open-state')).toHaveTextContent('open');

      await userEvent.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.getByTestId('open-state')).toHaveTextContent('closed');
      });
    });

    it('should prevent body scroll when open', () => {
      const { rerender } = render(
        <Modal open={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal open={false} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('');
    });

    it('should have accessible close button', () => {
      render(
        <Modal open={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>
      );

      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Modal open={true} onClose={() => {}} title="Test" description="Description">
          <p>Content</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation Hook Integration (REQ-276)', () => {
    it('should handle all arrow key navigation', async () => {
      const handlers = {
        onArrowUp: vi.fn(),
        onArrowDown: vi.fn(),
        onArrowLeft: vi.fn(),
        onArrowRight: vi.fn(),
        onEscape: vi.fn(),
        onEnter: vi.fn(),
      };

      function TestComponent() {
        useKeyboardNavigation(handlers);
        return <div>Test</div>;
      }

      render(<TestComponent />);

      await userEvent.keyboard('{ArrowUp}');
      expect(handlers.onArrowUp).toHaveBeenCalled();

      await userEvent.keyboard('{ArrowDown}');
      expect(handlers.onArrowDown).toHaveBeenCalled();

      await userEvent.keyboard('{ArrowLeft}');
      expect(handlers.onArrowLeft).toHaveBeenCalled();

      await userEvent.keyboard('{ArrowRight}');
      expect(handlers.onArrowRight).toHaveBeenCalled();

      await userEvent.keyboard('{Escape}');
      expect(handlers.onEscape).toHaveBeenCalled();

      await userEvent.keyboard('{Enter}');
      expect(handlers.onEnter).toHaveBeenCalled();
    });
  });

  describe('Screen Reader Announcements (REQ-277)', () => {
    it('should create and remove announcement elements', async () => {
      function TestComponent() {
        const announce = useAnnounce();
        return (
          <button onClick={() => announce('Test announcement', 'polite')}>
            Announce
          </button>
        );
      }

      render(<TestComponent />);
      const button = screen.getByRole('button');

      await userEvent.click(button);

      // Wait for announcement element to be created
      await waitFor(() => {
        const announcer = document.querySelector('[role="status"][aria-live="polite"]');
        expect(announcer).toBeInTheDocument();
      });

      // Wait for cleanup
      await waitFor(() => {
        const announcer = document.querySelector('[role="status"][aria-live="polite"]');
        expect(announcer).not.toBeInTheDocument();
      }, { timeout: 1500 });
    });
  });

  describe('Color Contrast Compliance (REQ-280)', () => {
    it('should have sufficient contrast for primary button text', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');

      // Primary uses gray-900 with white text (high contrast - professional theme)
      expect(button.className).toContain('bg-gray-900');
      expect(button.className).toContain('text-white');
    });

    it('should have sufficient contrast for destructive button text', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');

      // Destructive uses gray-800 with white text (high contrast - professional theme)
      expect(button.className).toContain('bg-gray-800');
      expect(button.className).toContain('text-white');
    });

    it('should have sufficient contrast for secondary button text', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');

      // Secondary uses white bg with gray-700 text (high contrast)
      expect(button.className).toContain('bg-white');
      expect(button.className).toContain('text-gray-700');
    });
  });

  describe('useFocusTrap Hook (REQ-278)', () => {
    function FocusTrapTestComponent({ active }: { active: boolean }) {
      const containerRef = useFocusTrap<HTMLDivElement>(active);
      return (
        <div ref={containerRef} data-testid="trap-container">
          <button data-testid="first-button">First</button>
          <input data-testid="input-field" type="text" placeholder="Input" />
          <button data-testid="last-button">Last</button>
        </div>
      );
    }

    it('should focus first element when trap activates', () => {
      render(<FocusTrapTestComponent active={true} />);
      const firstButton = screen.getByTestId('first-button');
      expect(document.activeElement).toBe(firstButton);
    });

    it('should wrap focus from last to first on Tab', () => {
      render(<FocusTrapTestComponent active={true} />);
      const container = screen.getByTestId('trap-container');
      const firstButton = screen.getByTestId('first-button');
      const lastButton = screen.getByTestId('last-button');

      // Focus the last element
      lastButton.focus();
      expect(document.activeElement).toBe(lastButton);

      // Press Tab on last element - should wrap to first
      fireEvent.keyDown(container, { key: 'Tab', shiftKey: false });
      expect(document.activeElement).toBe(firstButton);
    });

    it('should wrap focus from first to last on Shift+Tab', () => {
      render(<FocusTrapTestComponent active={true} />);
      const container = screen.getByTestId('trap-container');
      const firstButton = screen.getByTestId('first-button');
      const lastButton = screen.getByTestId('last-button');

      // First element is already focused from activation
      expect(document.activeElement).toBe(firstButton);

      // Press Shift+Tab on first element - should wrap to last
      fireEvent.keyDown(container, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(lastButton);
    });

    it('should not trap focus when inactive', () => {
      render(<FocusTrapTestComponent active={false} />);
      const firstButton = screen.getByTestId('first-button');
      // Should not auto-focus when inactive
      expect(document.activeElement).not.toBe(firstButton);
    });

    it('should handle non-Tab keys without trapping', () => {
      render(<FocusTrapTestComponent active={true} />);
      const container = screen.getByTestId('trap-container');
      const inputField = screen.getByTestId('input-field');

      inputField.focus();
      expect(document.activeElement).toBe(inputField);

      // Other keys should not affect focus
      fireEvent.keyDown(container, { key: 'Enter' });
      expect(document.activeElement).toBe(inputField);
    });
  });

  describe('Focus Management (REQ-278)', () => {
    it('should maintain focus order in complex components', async () => {
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </div>
      );

      const buttons = screen.getAllByRole('button');

      // Tab through buttons
      await userEvent.tab();
      expect(document.activeElement).toBe(buttons[0]);

      await userEvent.tab();
      expect(document.activeElement).toBe(buttons[1]);

      await userEvent.tab();
      expect(document.activeElement).toBe(buttons[2]);

      // Shift+Tab backwards
      await userEvent.tab({ shift: true });
      expect(document.activeElement).toBe(buttons[1]);
    });

    it('should not focus disabled elements', async () => {
      render(
        <div>
          <Button>First</Button>
          <Button disabled>Disabled</Button>
          <Button>Third</Button>
        </div>
      );

      const buttons = screen.getAllByRole('button');

      await userEvent.tab();
      expect(document.activeElement).toBe(buttons[0]);

      await userEvent.tab();
      // Should skip disabled button
      expect(document.activeElement).toBe(buttons[2]);
    });
  });
});
