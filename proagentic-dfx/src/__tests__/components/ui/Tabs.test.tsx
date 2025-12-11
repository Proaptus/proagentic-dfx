/**
 * Tabs Component Tests
 * Coverage Target: 80%
 *
 * Test Coverage:
 * - Basic rendering (4 tests)
 * - Tab switching (4 tests)
 * - Keyboard navigation (6 tests)
 * - Disabled tabs (3 tests)
 * - Vertical variant (3 tests)
 * - Accessibility (5 tests)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, type Tab } from '@/components/ui/Tabs';

const mockTabs: Tab[] = [
  { id: 'tab1', label: 'First Tab', content: <div>First Content</div> },
  { id: 'tab2', label: 'Second Tab', content: <div>Second Content</div> },
  { id: 'tab3', label: 'Third Tab', content: <div>Third Content</div> },
];

const tabsWithIcons: Tab[] = [
  { id: 'tab1', label: 'Settings', content: <div>Settings Content</div>, icon: <span data-testid="icon-1">⚙️</span> },
  { id: 'tab2', label: 'Profile', content: <div>Profile Content</div>, icon: <span data-testid="icon-2">👤</span> },
];

const tabsWithBadges: Tab[] = [
  { id: 'tab1', label: 'Messages', content: <div>Messages</div>, badge: 5 },
  { id: 'tab2', label: 'Notifications', content: <div>Notifications</div>, badge: '99+' },
];

const tabsWithDisabled: Tab[] = [
  { id: 'tab1', label: 'Active', content: <div>Active Content</div> },
  { id: 'tab2', label: 'Disabled', content: <div>Disabled Content</div>, disabled: true },
  { id: 'tab3', label: 'Also Active', content: <div>Also Active Content</div> },
];

describe('Tabs', () => {
  describe('Basic Rendering', () => {
    it('should render all tabs', () => {
      render(<Tabs tabs={mockTabs} />);

      expect(screen.getByText('First Tab')).toBeInTheDocument();
      expect(screen.getByText('Second Tab')).toBeInTheDocument();
      expect(screen.getByText('Third Tab')).toBeInTheDocument();
    });

    it('should render first tab content by default', () => {
      render(<Tabs tabs={mockTabs} />);

      expect(screen.getByText('First Content')).toBeInTheDocument();
    });

    it('should render tab with icons', () => {
      render(<Tabs tabs={tabsWithIcons} />);

      expect(screen.getByTestId('icon-1')).toBeInTheDocument();
      expect(screen.getByTestId('icon-2')).toBeInTheDocument();
    });

    it('should render tab with badges', () => {
      render(<Tabs tabs={tabsWithBadges} />);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(<Tabs tabs={mockTabs} className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Tab Selection', () => {
    it('should render default tab content when specified', () => {
      render(<Tabs tabs={mockTabs} defaultTab="tab2" />);

      expect(screen.getByText('Second Content')).toBeInTheDocument();
    });

    it('should switch tab on click', () => {
      render(<Tabs tabs={mockTabs} />);

      fireEvent.click(screen.getByText('Second Tab'));

      expect(screen.getByText('Second Content')).toBeInTheDocument();
      expect(screen.queryByText('First Content')).not.toBeInTheDocument();
    });

    it('should call onChange when tab changes', () => {
      const onChange = vi.fn();
      render(<Tabs tabs={mockTabs} onChange={onChange} />);

      fireEvent.click(screen.getByText('Second Tab'));

      expect(onChange).toHaveBeenCalledWith('tab2');
    });

    it('should highlight active tab', () => {
      render(<Tabs tabs={mockTabs} />);

      const activeTab = screen.getByRole('tab', { name: /first tab/i });
      expect(activeTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Keyboard Navigation - Horizontal', () => {
    it('should navigate right with ArrowRight', () => {
      render(<Tabs tabs={mockTabs} />);

      const firstTab = screen.getByRole('tab', { name: /first tab/i });
      fireEvent.keyDown(firstTab, { key: 'ArrowRight' });

      expect(screen.getByText('Second Content')).toBeInTheDocument();
    });

    it('should navigate left with ArrowLeft', () => {
      render(<Tabs tabs={mockTabs} defaultTab="tab2" />);

      const secondTab = screen.getByRole('tab', { name: /second tab/i });
      fireEvent.keyDown(secondTab, { key: 'ArrowLeft' });

      expect(screen.getByText('First Content')).toBeInTheDocument();
    });

    it('should wrap around from last to first', () => {
      render(<Tabs tabs={mockTabs} defaultTab="tab3" />);

      const thirdTab = screen.getByRole('tab', { name: /third tab/i });
      fireEvent.keyDown(thirdTab, { key: 'ArrowRight' });

      expect(screen.getByText('First Content')).toBeInTheDocument();
    });

    it('should wrap around from first to last', () => {
      render(<Tabs tabs={mockTabs} defaultTab="tab1" />);

      const firstTab = screen.getByRole('tab', { name: /first tab/i });
      fireEvent.keyDown(firstTab, { key: 'ArrowLeft' });

      expect(screen.getByText('Third Content')).toBeInTheDocument();
    });

    it('should navigate to first tab with Home key', () => {
      render(<Tabs tabs={mockTabs} defaultTab="tab3" />);

      const thirdTab = screen.getByRole('tab', { name: /third tab/i });
      fireEvent.keyDown(thirdTab, { key: 'Home' });

      expect(screen.getByText('First Content')).toBeInTheDocument();
    });

    it('should navigate to last tab with End key', () => {
      render(<Tabs tabs={mockTabs} defaultTab="tab1" />);

      const firstTab = screen.getByRole('tab', { name: /first tab/i });
      fireEvent.keyDown(firstTab, { key: 'End' });

      expect(screen.getByText('Third Content')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation - Vertical', () => {
    it('should navigate down with ArrowDown', () => {
      render(<Tabs tabs={mockTabs} variant="vertical" />);

      const firstTab = screen.getByRole('tab', { name: /first tab/i });
      fireEvent.keyDown(firstTab, { key: 'ArrowDown' });

      expect(screen.getByText('Second Content')).toBeInTheDocument();
    });

    it('should navigate up with ArrowUp', () => {
      render(<Tabs tabs={mockTabs} variant="vertical" defaultTab="tab2" />);

      const secondTab = screen.getByRole('tab', { name: /second tab/i });
      fireEvent.keyDown(secondTab, { key: 'ArrowUp' });

      expect(screen.getByText('First Content')).toBeInTheDocument();
    });
  });

  describe('Disabled Tabs', () => {
    it('should render disabled tabs with proper styling', () => {
      render(<Tabs tabs={tabsWithDisabled} />);

      const disabledTab = screen.getByRole('tab', { name: /disabled/i });
      expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
      expect(disabledTab).toBeDisabled();
    });

    it('should not switch to disabled tab on click', () => {
      render(<Tabs tabs={tabsWithDisabled} />);

      fireEvent.click(screen.getByText('Disabled'));

      // Content should still be from first tab
      expect(screen.getByText('Active Content')).toBeInTheDocument();
    });

    it('should skip disabled tabs during keyboard navigation', () => {
      render(<Tabs tabs={tabsWithDisabled} defaultTab="tab1" />);

      const firstTab = screen.getByRole('tab', { name: /^active$/i });
      fireEvent.keyDown(firstTab, { key: 'ArrowRight' });

      // Should skip to 'Also Active' tab (tab3), not 'Disabled' tab
      // The component navigates through enabled tabs only
      expect(screen.getByText('Also Active Content')).toBeInTheDocument();
    });
  });

  describe('Vertical Variant', () => {
    it('should render in vertical layout', () => {
      const { container } = render(<Tabs tabs={mockTabs} variant="vertical" />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
      expect(container.firstChild).toHaveClass('flex');
    });

    it('should have vertical tab list styling', () => {
      render(<Tabs tabs={mockTabs} variant="vertical" />);

      const tablist = screen.getByRole('tablist');
      expect(tablist.className).toContain('flex-col');
    });

    it('should render vertical tab panel', () => {
      render(<Tabs tabs={mockTabs} variant="vertical" />);

      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have tablist role', () => {
      render(<Tabs tabs={mockTabs} />);

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('should have tab role on each tab', () => {
      render(<Tabs tabs={mockTabs} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(mockTabs.length);
    });

    it('should have tabpanel role', () => {
      render(<Tabs tabs={mockTabs} />);

      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('should have aria-selected on active tab', () => {
      render(<Tabs tabs={mockTabs} defaultTab="tab2" />);

      const secondTab = screen.getByRole('tab', { name: /second tab/i });
      expect(secondTab).toHaveAttribute('aria-selected', 'true');

      const firstTab = screen.getByRole('tab', { name: /first tab/i });
      expect(firstTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should have aria-controls linking tab to panel', () => {
      render(<Tabs tabs={mockTabs} />);

      const firstTab = screen.getByRole('tab', { name: /first tab/i });
      expect(firstTab).toHaveAttribute('aria-controls', 'panel-tab1');
    });

    it('should have proper tabindex', () => {
      render(<Tabs tabs={mockTabs} />);

      const activeTab = screen.getByRole('tab', { name: /first tab/i });
      const inactiveTab = screen.getByRole('tab', { name: /second tab/i });

      expect(activeTab).toHaveAttribute('tabIndex', '0');
      expect(inactiveTab).toHaveAttribute('tabIndex', '-1');
    });

    it('should have aria-label on tablist', () => {
      render(<Tabs tabs={mockTabs} />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Tabs');
    });
  });

  describe('Tab Panel', () => {
    it('should have correct id on tabpanel', () => {
      render(<Tabs tabs={mockTabs} />);

      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toHaveAttribute('id', 'panel-tab1');
    });

    it('should update tabpanel content when switching tabs', () => {
      render(<Tabs tabs={mockTabs} />);

      expect(screen.getByText('First Content')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Third Tab'));

      expect(screen.getByText('Third Content')).toBeInTheDocument();
      expect(screen.queryByText('First Content')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single tab', () => {
      const singleTab: Tab[] = [
        { id: 'only', label: 'Only Tab', content: <div>Only Content</div> },
      ];

      render(<Tabs tabs={singleTab} />);

      expect(screen.getByText('Only Tab')).toBeInTheDocument();
      expect(screen.getByText('Only Content')).toBeInTheDocument();
    });

    it('should handle empty content', () => {
      const emptyContentTabs: Tab[] = [
        { id: 'empty', label: 'Empty', content: null },
      ];

      render(<Tabs tabs={emptyContentTabs} />);

      expect(screen.getByText('Empty')).toBeInTheDocument();
    });
  });
});
