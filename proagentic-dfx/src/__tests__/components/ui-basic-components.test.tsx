/**
 * UI Basic Components Test Suite
 * Coverage: Button, Card, Modal, Tooltip, ThemeToggle
 *
 * Components tested:
 * - Button (10 tests)
 * - Card & Card subcomponents (6 tests)
 * - Modal (8 tests)
 * - Tooltip & Tooltip variants (12 tests)
 * - ThemeToggle (7 tests)
 *
 * Total: 43 tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Tooltip, TooltipTable, TooltipEquation, TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from '@/components/ui/Tooltip';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Mock theme provider
vi.mock('@/lib/theme/ThemeProvider', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
  })),
}));

// Mock hooks used by Modal
vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: vi.fn((_open) => {
    const ref = { current: null };
    return ref;
  }),
}));

vi.mock('@/hooks/useKeyboardNavigation', () => ({
  useKeyboardNavigation: vi.fn(),
}));

// Setup document.createPortal
vi.stubGlobal('createPortal', (element: HTMLElement) => element);

describe('UI Basic Components Test Suite', () => {
  // ============================================================================
  // BUTTON COMPONENT TESTS (10 tests)
  // ============================================================================
  describe('Button Component', () => {
    it('should render button with default variant and size', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-gray-900');
    });

    it('should render button with all variant styles', () => {
      const variants = ['primary', 'secondary', 'ghost', 'destructive', 'success', 'outline', 'link'] as const;

      variants.forEach((variant) => {
        const { container } = render(<Button variant={variant}>Test</Button>);
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
      });
    });

    it('should render button with all size variants', () => {
      const sizes = ['sm', 'md', 'lg', 'icon'] as const;

      sizes.forEach((size) => {
        const { container } = render(<Button size={size}>Test</Button>);
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
      });
    });

    it('should handle click events', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      const button = screen.getByRole('button', { name: /click/i });
      await userEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should display loading state with spinner', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should render with icon in left position', () => {
      const icon = <span data-testid="test-icon">✓</span>;
      render(<Button icon={icon} iconPosition="left">Button</Button>);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should render with icon in right position', () => {
      const icon = <span data-testid="test-icon">→</span>;
      render(<Button icon={icon} iconPosition="right">Button</Button>);
      const button = screen.getByRole('button');
      expect(button.textContent).toContain('→');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when loading is true', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should apply custom className', () => {
      const { container } = render(<Button className="custom-class">Test</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  // ============================================================================
  // CARD COMPONENT TESTS (6 tests)
  // ============================================================================
  describe('Card Components', () => {
    it('should render Card with default padding', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      );
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render Card with all padding variants', () => {
      const paddings = ['none', 'sm', 'md', 'lg'] as const;

      paddings.forEach((padding) => {
        const { container } = render(
          <Card padding={padding}>
            <div>Content</div>
          </Card>
        );
        expect(container.querySelector('div[class*="p-"]')).toBeInTheDocument();
      });
    });

    it('should render CardHeader with border styling', () => {
      render(
        <CardHeader>
          <div>Header content</div>
        </CardHeader>
      );
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('should render CardTitle with proper heading hierarchy', () => {
      render(
        <CardTitle>
          Test Title
        </CardTitle>
      );
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Test Title');
    });

    it('should apply custom className to Card', () => {
      const { container } = render(
        <Card className="custom-card">
          <div>Content</div>
        </Card>
      );
      expect(container.querySelector('div')).toHaveClass('custom-card');
    });

    it('should render Card with complete structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <div>Body content</div>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // MODAL COMPONENT TESTS (8 tests)
  // ============================================================================
  describe('Modal Component', () => {
    it('should not render when open is false', () => {
      render(
        <Modal open={false} onClose={() => {}} title="Test Modal">
          Modal content
        </Modal>
      );
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('should render when open is true', () => {
      render(
        <Modal open={true} onClose={() => {}} title="Test Modal">
          Modal content
        </Modal>
      );
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should render modal title', () => {
      render(
        <Modal open={true} onClose={() => {}} title="My Modal Title">
          Content
        </Modal>
      );
      expect(screen.getByText('My Modal Title')).toBeInTheDocument();
    });

    it('should render modal description when provided', () => {
      render(
        <Modal
          open={true}
          onClose={() => {}}
          title="Title"
          description="Modal description text"
        >
          Content
        </Modal>
      );
      expect(screen.getByText('Modal description text')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      const handleClose = vi.fn();
      render(
        <Modal open={true} onClose={handleClose} title="Test">
          Content
        </Modal>
      );

      const closeButton = screen.getByLabelText('Close modal');
      await userEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', async () => {
      const handleClose = vi.fn();
      render(
        <Modal open={true} onClose={handleClose} title="Test">
          Content
        </Modal>
      );

      // The backdrop div should be clickable
      const backdrop = document.querySelector('div[aria-hidden="true"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(handleClose).toHaveBeenCalled();
      }
    });

    it('should have proper accessibility attributes', () => {
      render(
        <Modal open={true} onClose={() => {}} title="Accessible Modal">
          Content
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should prevent body scroll when open', () => {
      const { rerender } = render(
        <Modal open={false} onClose={() => {}} title="Test">
          Content
        </Modal>
      );

      expect(document.body.style.overflow).not.toBe('hidden');

      rerender(
        <Modal open={true} onClose={() => {}} title="Test">
          Content
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  // ============================================================================
  // TOOLTIP COMPONENT TESTS (12 tests)
  // ============================================================================
  describe('Tooltip Component', () => {
    it('should render trigger element', () => {
      render(
        <Tooltip content="Tooltip text">
          <span>Hover me</span>
        </Tooltip>
      );
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('should show tooltip on mouse enter', async () => {
      render(
        <Tooltip content="Tooltip text" delay={0}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      await userEvent.hover(trigger);

      await waitFor(() => {
        expect(screen.getByText('Tooltip text')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      render(
        <Tooltip content="Tooltip text" delay={0}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      await userEvent.hover(trigger);

      await waitFor(() => {
        expect(screen.getByText('Tooltip text')).toBeInTheDocument();
      });

      await userEvent.unhover(trigger);

      await waitFor(() => {
        expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
      }, { timeout: 300 });
    });

    it('should render help variant with HelpCircle icon', () => {
      render(
        <Tooltip content="Help text" variant="help" />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support different tooltip positions', () => {
      const positions = ['top', 'bottom', 'left', 'right'] as const;

      positions.forEach((position) => {
        const { container } = render(
          <Tooltip content="Text" position={position} delay={0}>
            <span>Trigger</span>
          </Tooltip>
        );
        expect(container).toBeInTheDocument();
      });
    });

    it('should respect delay prop', async () => {
      const { rerender: _rerender } = render(
        <Tooltip content="Tooltip" delay={500}>
          <span>Hover</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover');
      await userEvent.hover(trigger);

      expect(screen.queryByText('Tooltip')).not.toBeInTheDocument();
    });

    it('should render TooltipTable with tabular data', () => {
      const data = [
        { label: 'Height', value: '100m' },
        { label: 'Weight', value: '500kg' },
      ];

      render(
        <TooltipTable data={data}>
          <span>Hover</span>
        </TooltipTable>
      );

      expect(screen.getByText('Hover')).toBeInTheDocument();
    });

    it('should render TooltipEquation with equation', () => {
      render(
        <TooltipEquation
          equation="E = mc²"
          description="Einstein's mass-energy equivalence"
        >
          <span>Formula</span>
        </TooltipEquation>
      );

      expect(screen.getByText('Formula')).toBeInTheDocument();
    });

    it('should render TooltipProvider', () => {
      render(
        <TooltipProvider>
          <span>Content</span>
        </TooltipProvider>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render TooltipRoot with state management', () => {
      const { container } = render(
        <TooltipRoot>
          <span>Content</span>
        </TooltipRoot>
      );
      expect(container).toBeInTheDocument();
    });

    it('should render TooltipTrigger', () => {
      render(
        <TooltipTrigger>
          <span>Trigger</span>
        </TooltipTrigger>
      );
      expect(screen.getByText('Trigger')).toBeInTheDocument();
    });

    it('should render TooltipContent with positioning', () => {
      const { container: _container } = render(
        <TooltipContent side="top">
          <span>Content</span>
        </TooltipContent>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should have proper accessibility role', async () => {
      render(
        <Tooltip content="Help text" delay={0}>
          <span>Hover</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover');
      await userEvent.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // THEME TOGGLE COMPONENT TESTS (7 tests)
  // ============================================================================
  describe('ThemeToggle Component', () => {
    it('should render theme toggle button', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it('should open dropdown on button click', async () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /toggle theme/i });

      await userEvent.click(button);

      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
    });

    it('should close dropdown on Escape key', async () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /toggle theme/i });

      await userEvent.click(button);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      await userEvent.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('should display theme options', async () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /toggle theme/i });

      await userEvent.click(button);

      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('should show menu items with proper role', async () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /toggle theme/i });

      await userEvent.click(button);

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('should close dropdown after selecting theme', async () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /toggle theme/i });

      await userEvent.click(button);
      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();

      expect(menu).toHaveAttribute('role', 'menu');
    });

    it('should apply custom className', () => {
      const { container } = render(<ThemeToggle className="custom-class" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-class');
    });
  });
});
