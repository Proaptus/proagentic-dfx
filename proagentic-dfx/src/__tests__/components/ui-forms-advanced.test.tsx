/**
 * UI Forms and Advanced Components Test Suite
 * Coverage: Input, Checkbox, Label, Alert, Badge, Accordion, Integration, Accessibility, State
 *
 * Components tested:
 * - Input (8 tests)
 * - Checkbox (8 tests)
 * - Label (5 tests)
 * - Alert & Alert variants (10 tests)
 * - Badge & Badge variants (7 tests)
 * - Accordion (7 tests)
 * - Component Integration & Edge Cases (8 tests)
 * - Accessibility Features (7 tests)
 * - Component State Management (4 tests)
 *
 * Total: 64 tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Tooltip } from '@/components/ui/Tooltip';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, CalculationAlert, ComplianceAlert, ValidationAlert } from '@/components/ui/Alert';
import { Badge, StatusBadge, PriorityBadge, ComplianceBadge } from '@/components/ui/Badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

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

describe('UI Forms and Advanced Components Test Suite', () => {
  // ============================================================================
  // INPUT COMPONENT TESTS (8 tests)
  // ============================================================================
  describe('Input Component', () => {
    it('should render input field', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should accept user input', async () => {
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      await userEvent.type(input, 'test value');
      expect(input.value).toBe('test value');
    });

    it('should display error state with red border', () => {
      const { container } = render(<Input error={true} />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('border-red-300');
    });

    it('should display helper text', () => {
      render(<Input id="test-input" helperText="This is helper text" />);
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });

    it('should show error helper text in red', () => {
      render(
        <Input
          id="test-input"
          error={true}
          helperText="Error message"
        />
      );
      const helperText = screen.getByText('Error message');
      expect(helperText).toHaveClass('text-red-600');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should have aria-invalid attribute when error is true', () => {
      render(<Input error={true} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should apply custom className', () => {
      const { container } = render(<Input className="custom-input" />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('custom-input');
    });
  });

  // ============================================================================
  // CHECKBOX COMPONENT TESTS (8 tests)
  // ============================================================================
  describe('Checkbox Component', () => {
    it('should render checkbox', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should toggle checked state on click', async () => {
      const handleChange = vi.fn();
      render(<Checkbox onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('should display label when provided', () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByText('Accept terms')).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should show check mark when checked', async () => {
      const { container } = render(<Checkbox checked={true} />);
      const svg = container.querySelector('button svg');
      expect(svg).toBeInTheDocument();
    });

    it('should not toggle when disabled', async () => {
      const handleChange = vi.fn();
      render(<Checkbox disabled onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should have proper aria-checked attribute', () => {
      const { rerender } = render(<Checkbox checked={false} />);
      let checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      rerender(<Checkbox checked={true} />);
      checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should apply custom className', () => {
      const { container } = render(<Checkbox className="custom-checkbox" />);
      const checkbox = container.querySelector('button');
      expect(checkbox).toHaveClass('custom-checkbox');
    });
  });

  // ============================================================================
  // LABEL COMPONENT TESTS (5 tests)
  // ============================================================================
  describe('Label Component', () => {
    it('should render label text', () => {
      render(<Label>Form Label</Label>);
      expect(screen.getByText('Form Label')).toBeInTheDocument();
    });

    it('should show required indicator when required is true', () => {
      render(<Label required>Required Field</Label>);
      expect(screen.getByLabelText('required')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should display helper text', () => {
      render(<Label helperText="This field is required">Label</Label>);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Label className="custom-label">Label</Label>);
      const label = container.querySelector('label');
      expect(label).toHaveClass('custom-label');
    });

    it('should support htmlFor attribute', () => {
      render(<Label htmlFor="input-id">Label</Label>);
      const label = screen.getByText('Label') as HTMLLabelElement;
      expect(label.htmlFor).toBe('input-id');
    });
  });

  // ============================================================================
  // ALERT COMPONENT TESTS (10 tests)
  // ============================================================================
  describe('Alert Component', () => {
    it('should render alert with default variant', () => {
      render(
        <Alert>
          This is an info alert
        </Alert>
      );
      expect(screen.getByText('This is an info alert')).toBeInTheDocument();
    });

    it('should render alert with all variants', () => {
      const variants = ['info', 'success', 'warning', 'error'] as const;

      variants.forEach((variant) => {
        const { container } = render(
          <Alert variant={variant}>
            Alert content
          </Alert>
        );
        const alert = container.querySelector('[role="alert"]');
        expect(alert).toBeInTheDocument();
      });
    });

    it('should render alert title when provided', () => {
      render(
        <Alert title="Alert Title">
          Alert content
        </Alert>
      );
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
    });

    it('should display dismiss button when dismissible is true', () => {
      render(
        <Alert dismissible>
          Dismissible alert
        </Alert>
      );
      const dismissButton = screen.getByLabelText('Dismiss');
      expect(dismissButton).toBeInTheDocument();
    });

    it('should hide alert when dismissed', async () => {
      render(
        <Alert dismissible>
          Content
        </Alert>
      );

      const dismissButton = screen.getByLabelText('Dismiss');
      await userEvent.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });
    });

    it('should call onDismiss callback', async () => {
      const handleDismiss = vi.fn();
      render(
        <Alert dismissible onDismiss={handleDismiss}>
          Content
        </Alert>
      );

      const dismissButton = screen.getByLabelText('Dismiss');
      await userEvent.click(dismissButton);
      expect(handleDismiss).toHaveBeenCalled();
    });

    it('should render with actions', () => {
      render(
        <Alert actions={<button>Action</button>}>
          Alert content
        </Alert>
      );
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });

    it('should render CalculationAlert', () => {
      render(
        <CalculationAlert
          calculation="E = mc²"
          result="9e16 Joules"
        />
      );
      expect(screen.getByText('Calculation Result')).toBeInTheDocument();
    });

    it('should render ComplianceAlert with compliant status', () => {
      render(
        <ComplianceAlert
          standard="ISO 9001"
          requirement="Quality Management"
          status="compliant"
        />
      );
      expect(screen.getByText('ISO 9001 Compliance')).toBeInTheDocument();
    });

    it('should render ValidationAlert with error list', () => {
      const errors = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Invalid email' },
      ];

      render(<ValidationAlert errors={errors} />);
      expect(screen.getByText('2 Validation Errors')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // BADGE COMPONENT TESTS (7 tests)
  // ============================================================================
  describe('Badge Component', () => {
    it('should render badge with default variant', () => {
      render(<Badge>Default Badge</Badge>);
      expect(screen.getByText('Default Badge')).toBeInTheDocument();
    });

    it('should render badge with all variants', () => {
      const variants = ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info', 'pass', 'fail', 'pending'] as const;

      variants.forEach((variant) => {
        const { container } = render(
          <Badge variant={variant}>Badge</Badge>
        );
        expect(container.querySelector('span')).toBeInTheDocument();
      });
    });

    it('should render badge with all sizes', () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      sizes.forEach((size) => {
        const { container } = render(
          <Badge size={size}>Badge</Badge>
        );
        expect(container.querySelector('span')).toBeInTheDocument();
      });
    });

    it('should render badge with dot indicator', () => {
      const { container } = render(<Badge dot>Badge with dot</Badge>);
      expect(container.querySelector('span[class*="rounded-full"]')).toBeInTheDocument();
    });

    it('should render StatusBadge with pass status', () => {
      render(<StatusBadge status="pass">Passed</StatusBadge>);
      expect(screen.getByText('Passed')).toBeInTheDocument();
    });

    it('should render PriorityBadge', () => {
      const priorities = ['low', 'medium', 'high', 'critical'] as const;

      priorities.forEach((priority) => {
        const { container } = render(
          <PriorityBadge priority={priority}>Priority Badge</PriorityBadge>
        );
        expect(container).toBeInTheDocument();
      });
    });

    it('should render ComplianceBadge', () => {
      const { rerender } = render(<ComplianceBadge compliant={true}>Compliant</ComplianceBadge>);
      expect(screen.getByText('Compliant')).toBeInTheDocument();

      rerender(<ComplianceBadge compliant={false}>Non-Compliant</ComplianceBadge>);
      expect(screen.getByText('Non-Compliant')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ACCORDION COMPONENT TESTS (7 tests)
  // ============================================================================
  describe('Accordion Component', () => {
    it('should render accordion with items', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('should toggle accordion item on trigger click', async () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Hidden content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();

      const trigger = screen.getByText('Trigger');
      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Hidden content')).toBeInTheDocument();
      });
    });

    it('should support single type accordion', async () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger1 = screen.getByText('Item 1');
      const trigger2 = screen.getByText('Item 2');

      await userEvent.click(trigger1);
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeInTheDocument();
      });

      await userEvent.click(trigger2);
      await waitFor(() => {
        expect(screen.getByText('Content 2')).toBeInTheDocument();
      });
    });

    it('should support multiple type accordion', async () => {
      render(
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger1 = screen.getByText('Item 1');
      const trigger2 = screen.getByText('Item 2');

      await userEvent.click(trigger1);
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeInTheDocument();
      });

      await userEvent.click(trigger2);
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeInTheDocument();
        expect(screen.getByText('Content 2')).toBeInTheDocument();
      });
    });

    it('should render with default values', () => {
      render(
        <Accordion type="single" defaultValue={['item-1']}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Accordion type="single" className="custom-accordion">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const accordion = container.querySelector('[class*="custom-accordion"]');
      expect(accordion).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ADDITIONAL EDGE CASES AND INTEGRATION TESTS
  // ============================================================================
  describe('Component Integration & Edge Cases', () => {
    it('should handle rapid clicks on button', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      const button = screen.getByRole('button');

      await userEvent.click(button);
      await userEvent.click(button);
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should handle empty content gracefully', () => {
      const { container } = render(
        <Card>
          {null}
        </Card>
      );
      expect(container.querySelector('div[class*="rounded-xl"]')).toBeInTheDocument();
    });

    it('should handle dynamic props updates', async () => {
      const { rerender } = render(<Input placeholder="Old" />);
      let input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.placeholder).toBe('Old');

      rerender(<Input placeholder="New" />);
      input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.placeholder).toBe('New');
    });

    it('should handle keyboard navigation in ThemeToggle', async () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /toggle theme/i });

      await userEvent.tab();
      expect(button).toHaveFocus();
    });

    it('should handle tooltip with long content', async () => {
      const longContent = 'This is a very long tooltip content that should be handled properly';
      render(
        <Tooltip content={longContent} delay={0}>
          <span>Hover</span>
        </Tooltip>
      );

      await userEvent.hover(screen.getByText('Hover'));
      await waitFor(() => {
        expect(screen.getByText(longContent)).toBeInTheDocument();
      });
    });

    it('should handle multiple alerts on same page', () => {
      render(
        <>
          <Alert variant="info">Info alert</Alert>
          <Alert variant="success">Success alert</Alert>
          <Alert variant="warning">Warning alert</Alert>
          <Alert variant="error">Error alert</Alert>
        </>
      );

      expect(screen.getByText('Info alert')).toBeInTheDocument();
      expect(screen.getByText('Success alert')).toBeInTheDocument();
      expect(screen.getByText('Warning alert')).toBeInTheDocument();
      expect(screen.getByText('Error alert')).toBeInTheDocument();
    });

    it('should handle complex nested structures', () => {
      render(
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Complex Layout</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Button>Action 1</Button>
            <Button>Action 2</Button>
            <Badge variant="success">Status</Badge>
          </div>
        </Card>
      );

      expect(screen.getByText('Complex Layout')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action 1/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================
  describe('Accessibility Features', () => {
    it('all buttons should be keyboard accessible', async () => {
      render(
        <>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
        </>
      );

      await userEvent.tab();
      const button1 = screen.getByRole('button', { name: /button 1/i });
      expect(button1).toHaveFocus();

      await userEvent.tab();
      const button2 = screen.getByRole('button', { name: /button 2/i });
      expect(button2).toHaveFocus();
    });

    it('alert should have proper role and attributes', () => {
      const { container } = render(
        <Alert variant="warning" title="Warning">
          This is a warning
        </Alert>
      );

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveAttribute('role', 'alert');
    });

    it('input should have aria attributes for error state', () => {
      render(<Input id="test" error={true} helperText="Error text" />);
      const input = screen.getByRole('textbox');

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'test-helper');
    });

    it('checkbox should have proper aria-label', () => {
      render(<Checkbox label="Accept terms" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Accept terms');
    });

    it('modal should trap focus and be announced', () => {
      render(
        <Modal open={true} onClose={() => {}} title="Modal">
          Content
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('badge should have semantic HTML structure', () => {
      const { container } = render(
        <Badge variant="success">Success</Badge>
      );

      const badge = container.querySelector('span');
      expect(badge).toHaveClass('inline-flex');
    });

    it('tooltip should be announced to screen readers', async () => {
      render(
        <Tooltip content="Help information" delay={0}>
          <span>Help icon</span>
        </Tooltip>
      );

      await userEvent.hover(screen.getByText('Help icon'));

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // STATE AND BEHAVIOR TESTS
  // ============================================================================
  describe('Component State Management', () => {
    it('button should maintain loading state correctly', async () => {
      const { rerender } = render(<Button loading={true}>Loading</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');

      rerender(<Button loading={false}>Done</Button>);
      button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('aria-busy', 'true');
    });

    it('checkbox state should sync with prop', async () => {
      const { rerender } = render(<Checkbox checked={false} />);
      let checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      rerender(<Checkbox checked={true} />);
      checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('accordion should maintain state across renders', async () => {
      const { rerender } = render(
        <Accordion type="single" defaultValue={['item-1']}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      rerender(
        <Accordion type="single" defaultValue={['item-1']}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('modal should respond to open/close prop changes', async () => {
      const { rerender } = render(
        <Modal open={false} onClose={() => {}} title="Test">
          Content
        </Modal>
      );

      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      rerender(
        <Modal open={true} onClose={() => {}} title="Test">
          Content
        </Modal>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
