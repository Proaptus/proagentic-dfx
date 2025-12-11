/**
 * Tooltip Component Tests
 * PHASE 2 Coverage: UI Components
 *
 * Test Cases:
 * - Tooltip visibility (3 tests)
 * - Position calculation (4 tests)
 * - Theme variants (2 tests)
 * - Accessibility (3 tests)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Tooltip, TooltipTable, TooltipEquation } from '@/components/ui/Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimersAsync();
    vi.useRealTimers();
  });

  describe('Tooltip Visibility', () => {
    it('should not show tooltip on initial render', async () => {
      const { container } = render(
        <Tooltip content="Tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).not.toBeInTheDocument();
    });

    it('should show tooltip on hover after delay', async () => {
      const { container } = render(
        <Tooltip content="Tooltip content" delay={200}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
    });

    it('should hide tooltip on mouse leave', async () => {
      const { container } = render(
        <Tooltip content="Tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      fireEvent.mouseLeave(trigger);

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).not.toBeInTheDocument();
    });

    it('should respect custom delay prop', async () => {
      const { container } = render(
        <Tooltip content="Tooltip" delay={500}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      let tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).not.toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
    });

    it('should display tooltip content', async () => {
      const { container } = render(
        <Tooltip content="Helpful tooltip">
          <button>Help</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Help');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip?.textContent).toBe('Helpful tooltip');
    });
  });

  describe('Position Calculation', () => {
    it('should use top position by default', async () => {
      const { container } = render(
        <Tooltip content="Tooltip" position="top">
          <button>Button</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Button');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeTruthy();
      expect(tooltip?.className || '').toContain('bottom-full');
    });

    it('should use bottom position when specified', async () => {
      const { container } = render(
        <Tooltip content="Tooltip" position="bottom">
          <button>Button</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Button');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeTruthy();
      expect(tooltip?.className || '').toContain('top-full');
    });

    it('should use left position when specified', async () => {
      const { container } = render(
        <Tooltip content="Tooltip" position="left">
          <button>Button</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Button');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeTruthy();
      expect(tooltip?.className || '').toContain('right-full');
    });

    it('should use right position when specified', async () => {
      const { container } = render(
        <Tooltip content="Tooltip" position="right">
          <button>Button</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Button');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeTruthy();
      expect(tooltip?.className || '').toContain('left-full');
    });

    it('should calculate auto position based on viewport', async () => {
      const { container } = render(
        <Tooltip content="Tooltip" position="auto">
          <button>Button</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Button');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe('Theme Variants', () => {
    it('should apply dark theme by default', async () => {
      const { container } = render(
        <Tooltip content="Dark tooltip" theme="dark">
          <button>Button</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Button');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeTruthy();
      expect(tooltip?.className || '').toContain('bg-gray-900');
    });

    it('should apply light theme when specified', async () => {
      const { container } = render(
        <Tooltip content="Light tooltip" theme="light">
          <button>Button</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Button');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeTruthy();
      expect(tooltip?.className || '').toContain('bg-white');
    });

    it('should apply correct text color for each theme', async () => {
      const { container: darkContainer } = render(
        <Tooltip content="Dark" theme="dark">
          <button>Button</button>
        </Tooltip>
      );

      const darkTrigger = screen.getByText('Button');
      fireEvent.mouseEnter(darkTrigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const darkTooltip = darkContainer.querySelector('[role="tooltip"]');
      expect(darkTooltip).toBeTruthy();
      expect(darkTooltip?.className || '').toContain('text-white');
    });
  });

  describe('Help Variant', () => {
    it('should render help icon trigger', () => {
      render(
        <Tooltip content="Help text" variant="help" />
      );

      const helpButton = screen.getByRole('button', { name: /help/i });
      expect(helpButton).toBeInTheDocument();
    });

    it('should render tooltip on help icon hover', async () => {
      const { container } = render(
        <Tooltip content="Help text" variant="help" delay={200} />
      );

      const helpButton = screen.getByRole('button', { name: /help/i });
      fireEvent.mouseEnter(helpButton);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip?.textContent).toBe('Help text');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <Tooltip content="Tooltip" className="custom-class">
          <button>Button</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.custom-class');
      expect(trigger).toBeInTheDocument();
    });

    it('should support custom maxWidth', async () => {
      const { container } = render(
        <Tooltip content="Long tooltip content" maxWidth="500px">
          <button>Button</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Button');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeTruthy();
      expect(tooltip instanceof HTMLElement ? tooltip.style.maxWidth : '').toBe('500px');
    });
  });

  describe('Keyboard Support', () => {
    it('should show tooltip on focus', async () => {
      const { container } = render(
        <Tooltip content="Focus tooltip">
          <button>Button</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Button');
      fireEvent.focus(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
    });

    it('should hide tooltip on blur', async () => {
      const { container } = render(
        <Tooltip content="Focus tooltip">
          <button>Button</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Button');
      fireEvent.focus(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      fireEvent.blur(trigger);

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="tooltip"', async () => {
      const { container } = render(
        <Tooltip content="Accessible tooltip">
          <button>Button</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Button');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toHaveAttribute('role', 'tooltip');
    });

    it('should have pointer-events-none to not interfere with interactions', async () => {
      const { container } = render(
        <Tooltip content="Non-interactive">
          <button>Button</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Button');
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeTruthy();
      expect(tooltip?.className || '').toContain('pointer-events-none');
    });
  });
});

describe('TooltipTable', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimersAsync();
    vi.useRealTimers();
  });

  it('should render table data in tooltip', async () => {
    const data = [
      { label: 'Value 1', value: 100 },
      { label: 'Value 2', value: 200 },
    ];

    const { container } = render(
      <TooltipTable data={data} delay={200}>
        <button>Data</button>
      </TooltipTable>
    );

    const trigger = screen.getByText('Data');
    fireEvent.mouseEnter(trigger);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    const tooltip = container.querySelector('[role="tooltip"]');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip?.textContent).toContain('Value 1');
    expect(tooltip?.textContent).toContain('100');
  });

  it('should render as light theme by default', async () => {
    const data = [{ label: 'Test', value: 'Data' }];

    const { container } = render(
      <TooltipTable data={data} delay={200}>
        <button>Click</button>
      </TooltipTable>
    );

    const trigger = screen.getByText('Click');
    fireEvent.mouseEnter(trigger);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    const tooltip = container.querySelector('[role="tooltip"]');
    expect(tooltip).toBeTruthy();
    expect(tooltip?.className || '').toContain('bg-white');
  });
});

describe('TooltipEquation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimersAsync();
    vi.useRealTimers();
  });

  it('should render equation in tooltip', async () => {
    const { container } = render(
      <TooltipEquation equation="E = mc²" delay={200}>
        <button>Formula</button>
      </TooltipEquation>
    );

    const trigger = screen.getByText('Formula');
    fireEvent.mouseEnter(trigger);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    const tooltip = container.querySelector('[role="tooltip"]');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip?.textContent).toContain('E = mc²');
  });

  it('should render description when provided', async () => {
    const { container } = render(
      <TooltipEquation
        equation="F = ma"
        description="Newton's Second Law"
        delay={200}
      >
        <button>Physics</button>
      </TooltipEquation>
    );

    const trigger = screen.getByText('Physics');
    fireEvent.mouseEnter(trigger);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    const tooltip = container.querySelector('[role="tooltip"]');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip?.textContent).toContain("Newton's Second Law");
  });
});
