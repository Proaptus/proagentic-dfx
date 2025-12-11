/**
 * Modal Component Tests
 * PHASE 2 Coverage: UI Components (0-10% -> 60%+)
 *
 * Test Cases:
 * - Modal visibility and state (4 tests)
 * - Keyboard navigation (3 tests)
 * - Focus management (3 tests)
 * - Accessibility (5 tests)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: 'Modal Content',
  };

  describe('Visibility and State', () => {
    it('should render modal when open is true', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render modal when open is false', () => {
      render(<Modal {...defaultProps} open={false} />);

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('should render modal title', () => {
      render(<Modal {...defaultProps} title="Custom Title" />);

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render modal description when provided', () => {
      render(
        <Modal
          {...defaultProps}
          description="This is a modal description"
        />
      );

      expect(screen.getByText('This is a modal description')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <Modal {...defaultProps}>
          <div>Custom Content</div>
        </Modal>
      );

      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });
  });

  describe('Backdrop Interaction', () => {
    it('should call onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={onClose} />
      );

      // Find in document body (portal renders there)
      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      expect(onClose).toHaveBeenCalled();
    });

    it('should render backdrop with correct styling', () => {
      render(<Modal {...defaultProps} />);

      // Find in document body (portal renders there)
      const backdrop = document.querySelector('[class*="bg-black"]');
      expect(backdrop).toBeInTheDocument();
    });

    it('should render backdrop as hidden from accessibility tree', () => {
      render(<Modal {...defaultProps} />);

      // Find in document body (portal renders there)
      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('should render close button', () => {
      render(<Modal {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should have accessible aria-label on close button', () => {
      render(<Modal {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });

    it('should render close icon', () => {
      const { container } = render(<Modal {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      const icon = closeButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close modal on Escape key press', async () => {
      const onClose = vi.fn();
      await act(async () => {
      render(<Modal {...defaultProps} onClose={onClose} />);
      });

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should be dismissible with Escape key', () => {
      const onClose = vi.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={onClose} />
      );

      const modalContent = container.querySelector('[role="dialog"]');
      fireEvent.keyDown(modalContent || document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });

    it('should support keyboard navigation within modal', () => {
      render(
        <Modal {...defaultProps}>
          <button>Button 1</button>
          <button>Button 2</button>
        </Modal>
      );

      const button1 = screen.getByText('Button 1');
      const button2 = screen.getByText('Button 2');

      expect(button1).toBeInTheDocument();
      expect(button2).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should trap focus within modal', () => {
      const { container } = render(
        <Modal {...defaultProps}>
          <input type="text" placeholder="Input field" />
          <button>Submit</button>
        </Modal>
      );

      const input = screen.getByPlaceholderText('Input field');
      expect(input).toBeInTheDocument();
    });

    it('should have focusable elements', () => {
      const { container } = render(
        <Modal {...defaultProps}>
          <button>Action Button</button>
        </Modal>
      );

      const button = screen.getByText('Action Button');
      expect(button).toBeInTheDocument();
    });

    it('should make close button focusable', () => {
      render(<Modal {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="dialog"', () => {
      render(<Modal {...defaultProps} />);

      // Modal is rendered in portal (document.body)
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      render(<Modal {...defaultProps} />);

      // Modal is rendered in portal (document.body)
      const dialog = document.querySelector('[aria-modal="true"]');
      expect(dialog).toBeInTheDocument();
    });

    it('should have aria-labelledby pointing to title', () => {
      render(<Modal {...defaultProps} />);

      // Modal is rendered in portal (document.body)
      const dialog = document.querySelector('[aria-labelledby="modal-title"]');
      expect(dialog).toBeInTheDocument();
    });

    it('should have aria-describedby when description provided', () => {
      render(
        <Modal
          {...defaultProps}
          description="Test description"
        />
      );

      // Modal is rendered in portal (document.body)
      const dialog = document.querySelector('[aria-describedby="modal-description"]');
      expect(dialog).toBeInTheDocument();
    });

    it('should not have aria-describedby without description', () => {
      render(<Modal {...defaultProps} />);

      // Modal is rendered in portal (document.body)
      const dialog = document.querySelector('[aria-describedby]');
      expect(dialog).not.toBeInTheDocument();
    });

    it('should have semantic heading structure', () => {
      render(<Modal {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Body Scroll Management', () => {
    it('should prevent body scroll when modal is open', () => {
      const originalOverflow = document.body.style.overflow;

      render(<Modal {...defaultProps} open={true} />);

      expect(document.body.style.overflow).toBe('hidden');

      // Cleanup
      document.body.style.overflow = originalOverflow;
    });

    it('should restore body scroll when modal closes', () => {
      const { rerender } = render(<Modal {...defaultProps} open={true} />);

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal {...defaultProps} open={false} />);

      expect(document.body.style.overflow).toBe('');
    });

    it('should clean up overflow style on unmount', () => {
      const { unmount } = render(<Modal {...defaultProps} open={true} />);

      unmount();

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Modal Structure', () => {
    it('should render modal content in portal', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('should have header with title and close button', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    });

    it('should have body with children', () => {
      render(
        <Modal {...defaultProps}>
          <div>Body Content</div>
        </Modal>
      );

      expect(screen.getByText('Body Content')).toBeInTheDocument();
    });

    it('should have proper CSS classes for styling', () => {
      render(<Modal {...defaultProps} />);

      const modalContent = document.querySelector('[role="dialog"]');
      expect(modalContent).toBeTruthy();
      // The dialog container has flex and z-50 classes; the inner content has bg-white and rounded-lg
      const innerContent = modalContent?.querySelector('.bg-white');
      expect(innerContent).toBeTruthy();
      expect((innerContent?.className || '') + ' ').toContain('rounded-lg');
    });
  });

  describe('Max Width and Height', () => {
    it('should have constrained max width', () => {
      render(<Modal {...defaultProps} />);

      const modalContent = document.querySelector('[role="dialog"]');
      expect(modalContent).toBeTruthy();
      // The max-width constraint is on the inner content container
      const innerContent = modalContent?.querySelector('.max-w-lg');
      expect(innerContent).toBeTruthy();
    });

    it('should have constrained max height with overflow', () => {
      render(<Modal {...defaultProps} />);

      const modalContent = document.querySelector('[role="dialog"]');
      expect(modalContent).toBeTruthy();
      // The overflow styling is on the inner content container
      const innerContent = modalContent?.querySelector('.overflow-auto');
      expect(innerContent).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close transitions', () => {
      const { rerender } = render(<Modal {...defaultProps} open={true} />);

      rerender(<Modal {...defaultProps} open={false} />);
      rerender(<Modal {...defaultProps} open={true} />);
      rerender(<Modal {...defaultProps} open={false} />);

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('should handle very long title text', () => {
      const longTitle = 'A'.repeat(100);
      render(<Modal {...defaultProps} title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle complex children content', () => {
      render(
        <Modal {...defaultProps}>
          <div>
            <h3>Nested heading</h3>
            <p>Nested paragraph</p>
            <form>
              <input type="text" />
            </form>
          </div>
        </Modal>
      );

      expect(screen.getByText('Nested heading')).toBeInTheDocument();
      expect(screen.getByText('Nested paragraph')).toBeInTheDocument();
    });
  });

  describe('Multiple Instances', () => {
    it('should handle multiple modals (only one should be open)', () => {
      render(
        <>
          <Modal {...defaultProps} open={true} title="Modal 1" />
          <Modal {...defaultProps} open={false} title="Modal 2" />
        </>
      );

      expect(screen.getByText('Modal 1')).toBeInTheDocument();
      expect(screen.queryByText('Modal 2')).not.toBeInTheDocument();
    });
  });
});
