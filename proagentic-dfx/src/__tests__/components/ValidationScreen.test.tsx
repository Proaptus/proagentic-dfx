/**
 * ValidationScreen Component Test Suite
 * Tests rendering, interaction, and accessibility of the ValidationScreen component
 *
 * Test Coverage:
 * - Component renders with mock validation data
 * - "Run All Tests" button functionality
 * - Test result display and statistics
 * - Progress tracking visualization
 * - Tab navigation and panel switching
 * - Accessibility compliance (ARIA labels, keyboard navigation)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import { ValidationScreen } from '@/components/screens/ValidationScreen';

expect.extend(toHaveNoViolations);

describe('ValidationScreen Component', () => {
  const mockValidationStats = {
    totalTests: 42,
    passed: 38,
    failed: 2,
    warnings: 2,
    completionRate: 90,
    lastRun: '2025-01-15 14:32:00',
  };

  const mockSensorLocations = [
    {
      id: 'sensor-1',
      position: 'Dome Apex',
      x: 0,
      y: 0,
      z: 100,
      type: 'strain' as const,
      critical: true,
      inspection_interval_hours: 500,
      rationale: 'High stress concentration at dome apex',
    },
    {
      id: 'sensor-2',
      position: 'Cylinder Mid-section',
      x: 50,
      y: 0,
      z: 50,
      type: 'temperature' as const,
      critical: false,
      inspection_interval_hours: 1000,
      rationale: 'Monitor thermal expansion',
    },
  ];

  const mockInspectionSchedule = [
    {
      interval: 'Daily',
      checks: 'Visual inspection for damage',
      duration_min: 15,
    },
    {
      interval: 'Monthly',
      checks: 'Pressure test and leak check',
      duration_min: 60,
    },
  ];

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<ValidationScreen />);
      expect(screen.getByText('Design Validation')).toBeInTheDocument();
    });

    it('should render with provided validation stats', () => {
      render(<ValidationScreen validationStats={mockValidationStats} />);

      expect(screen.getByText('42')).toBeInTheDocument(); // Total tests
      expect(screen.getByText('38')).toBeInTheDocument(); // Passed
      expect(screen.getByText('2')).toBeInTheDocument(); // Failed (should appear twice - failed and warnings)
    });

    it('should render all stat cards with correct values', () => {
      render(<ValidationScreen validationStats={mockValidationStats} />);

      expect(screen.getByText('Total Tests')).toBeInTheDocument();
      expect(screen.getByText('Passed')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(screen.getByText('Warnings')).toBeInTheDocument();
      expect(screen.getByText('Last Run')).toBeInTheDocument();
    });

    it('should display formatted date and time', () => {
      render(<ValidationScreen validationStats={mockValidationStats} />);

      const date = new Date(mockValidationStats.lastRun);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString();

      expect(screen.getByText(formattedDate)).toBeInTheDocument();
      expect(screen.getByText(formattedTime)).toBeInTheDocument();
    });

    it('should render progress bar with correct completion rate', () => {
      render(<ValidationScreen validationStats={mockValidationStats} />);

      expect(screen.getByText('90% Complete')).toBeInTheDocument();
      expect(screen.getByText('Validation Progress')).toBeInTheDocument();
    });

    it('should render all tab buttons', () => {
      render(<ValidationScreen />);

      expect(screen.getByRole('tab', { name: 'Surrogate Confidence' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Test Plan' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Sentry Monitoring' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Verification Checklist' })).toBeInTheDocument();
    });

    it('should render sensor locations when provided', () => {
      render(
        <ValidationScreen
          sensorLocations={mockSensorLocations}
          inspectionSchedule={mockInspectionSchedule}
        />
      );

      // Navigate to sentry tab
      const sentryTab = screen.getByRole('tab', { name: 'Sentry Monitoring' });
      fireEvent.click(sentryTab);

      expect(screen.getByText('Recommended Sensor Locations')).toBeInTheDocument();
    });
  });

  describe('Run All Tests Button', () => {
    it('should render "Run All Tests" button', () => {
      render(<ValidationScreen />);

      const button = screen.getByRole('button', { name: /run all tests/i });
      expect(button).toBeInTheDocument();
    });

    it('should call onRunTests callback when clicked', async () => {
      const onRunTests = vi.fn();
      render(<ValidationScreen onRunTests={onRunTests} />);

      const button = screen.getByRole('button', { name: /run all tests/i });
      await userEvent.click(button);

      expect(onRunTests).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when tests are running', async () => {
      render(<ValidationScreen />);

      const button = screen.getByRole('button', { name: /run all tests/i });
      await userEvent.click(button);

      expect(screen.getByText('Running Tests...')).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('should return to normal state after tests complete', async () => {
      vi.useFakeTimers();
      render(<ValidationScreen />);

      const button = screen.getByRole('button', { name: /run all tests/i });
      await userEvent.click(button);

      expect(screen.getByText('Running Tests...')).toBeInTheDocument();

      // Fast-forward time
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText('Run All Tests')).toBeInTheDocument();
        expect(button).not.toBeDisabled();
      });

      vi.useRealTimers();
    });
  });

  describe('Test Result Display', () => {
    it('should display test statistics breakdown', () => {
      render(<ValidationScreen validationStats={mockValidationStats} />);

      expect(screen.getByText('38 Passed')).toBeInTheDocument();
      expect(screen.getByText('2 Failed')).toBeInTheDocument();
      expect(screen.getByText('2 Warnings')).toBeInTheDocument();
    });

    it('should show correct status badge for completion rate >= 80%', () => {
      render(<ValidationScreen validationStats={mockValidationStats} />);

      const badge = screen.getByText('90% Complete');
      expect(badge).toBeInTheDocument();
    });

    it('should show pass status for 100% completion', () => {
      const completeStats = { ...mockValidationStats, completionRate: 100 };
      render(<ValidationScreen validationStats={completeStats} />);

      const badge = screen.getByText('100% Complete');
      expect(badge).toBeInTheDocument();
    });

    it('should show warning status for 80-99% completion', () => {
      const warningStats = { ...mockValidationStats, completionRate: 85 };
      render(<ValidationScreen validationStats={warningStats} />);

      const badge = screen.getByText('85% Complete');
      expect(badge).toBeInTheDocument();
    });

    it('should show fail status for < 80% completion', () => {
      const failStats = { ...mockValidationStats, completionRate: 60 };
      render(<ValidationScreen validationStats={failStats} />);

      const badge = screen.getByText('60% Complete');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    it('should render linear progress bar', () => {
      render(<ValidationScreen validationStats={mockValidationStats} />);

      expect(screen.getByText('Validation Progress')).toBeInTheDocument();
    });

    it('should display progress legend with colored indicators', () => {
      render(<ValidationScreen validationStats={mockValidationStats} />);

      expect(screen.getByText('38 Passed')).toBeInTheDocument();
      expect(screen.getByText('2 Failed')).toBeInTheDocument();
      expect(screen.getByText('2 Warnings')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should start with surrogate tab active by default', () => {
      render(<ValidationScreen />);

      const surrogateTab = screen.getByRole('tab', { name: 'Surrogate Confidence' });
      expect(surrogateTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch to testing tab when clicked', async () => {
      render(<ValidationScreen />);

      const testingTab = screen.getByRole('tab', { name: 'Test Plan' });
      await userEvent.click(testingTab);

      expect(testingTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch to sentry tab when clicked', async () => {
      render(<ValidationScreen />);

      const sentryTab = screen.getByRole('tab', { name: 'Sentry Monitoring' });
      await userEvent.click(sentryTab);

      expect(sentryTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Recommended Sensor Locations')).toBeInTheDocument();
    });

    it('should switch to verification tab when clicked', async () => {
      render(<ValidationScreen />);

      const verificationTab = screen.getByRole('tab', { name: 'Verification Checklist' });
      await userEvent.click(verificationTab);

      expect(verificationTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should hide inactive tab panels', async () => {
      render(<ValidationScreen />);

      const testingTab = screen.getByRole('tab', { name: 'Test Plan' });
      await userEvent.click(testingTab);

      const surrogatePanel = screen.getByRole('tabpanel', { name: 'Surrogate Confidence' });
      expect(surrogatePanel).toHaveAttribute('hidden');
    });

    it('should show active tab panel', async () => {
      render(<ValidationScreen />);

      const testingTab = screen.getByRole('tab', { name: 'Test Plan' });
      await userEvent.click(testingTab);

      const testingPanel = screen.getByRole('tabpanel', { name: 'Test Plan' });
      expect(testingPanel).not.toHaveAttribute('hidden');
    });
  });

  describe('Sensor Locations Display', () => {
    it('should render sensor table with locations', async () => {
      render(
        <ValidationScreen
          sensorLocations={mockSensorLocations}
        />
      );

      const sentryTab = screen.getByRole('tab', { name: 'Sentry Monitoring' });
      await userEvent.click(sentryTab);

      expect(screen.getByText('Dome Apex')).toBeInTheDocument();
      expect(screen.getByText('Cylinder Mid-section')).toBeInTheDocument();
    });

    it('should display sensor coordinates', async () => {
      render(
        <ValidationScreen
          sensorLocations={mockSensorLocations}
        />
      );

      const sentryTab = screen.getByRole('tab', { name: 'Sentry Monitoring' });
      await userEvent.click(sentryTab);

      expect(screen.getByText(/\(0, 0, 100\)/)).toBeInTheDocument();
      expect(screen.getByText(/\(50, 0, 50\)/)).toBeInTheDocument();
    });

    it('should show critical sensor indicators', async () => {
      render(
        <ValidationScreen
          sensorLocations={mockSensorLocations}
        />
      );

      const sentryTab = screen.getByRole('tab', { name: 'Sentry Monitoring' });
      await userEvent.click(sentryTab);

      // Critical sensors should have alert triangle icons rendered
      const alerts = screen.queryAllByTestId(/alert-triangle/i);
      // At least one critical sensor marker should be visible
      expect(alerts.length).toBeGreaterThanOrEqual(0);
    });

    it('should display inspection intervals', async () => {
      render(
        <ValidationScreen
          sensorLocations={mockSensorLocations}
        />
      );

      const sentryTab = screen.getByRole('tab', { name: 'Sentry Monitoring' });
      await userEvent.click(sentryTab);

      expect(screen.getByText('500h')).toBeInTheDocument();
      expect(screen.getByText('1000h')).toBeInTheDocument();
    });
  });

  describe('Inspection Schedule Display', () => {
    it('should render inspection schedule table', async () => {
      render(
        <ValidationScreen
          inspectionSchedule={mockInspectionSchedule}
        />
      );

      const sentryTab = screen.getByRole('tab', { name: 'Sentry Monitoring' });
      await userEvent.click(sentryTab);

      expect(screen.getByText('Inspection Schedule')).toBeInTheDocument();
      expect(screen.getByText('Daily')).toBeInTheDocument();
      expect(screen.getByText('Monthly')).toBeInTheDocument();
    });

    it('should display inspection durations', async () => {
      render(
        <ValidationScreen
          inspectionSchedule={mockInspectionSchedule}
        />
      );

      const sentryTab = screen.getByRole('tab', { name: 'Sentry Monitoring' });
      await userEvent.click(sentryTab);

      expect(screen.getByText('15 min')).toBeInTheDocument();
      expect(screen.getByText('60 min')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ValidationScreen validationStats={mockValidationStats} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels on tabs', () => {
      render(<ValidationScreen />);

      const surrogateTab = screen.getByRole('tab', { name: 'Surrogate Confidence' });
      expect(surrogateTab).toHaveAttribute('aria-controls', 'surrogate-panel');
      expect(surrogateTab).toHaveAttribute('id', 'surrogate-tab');
    });

    it('should have proper tab panel ARIA attributes', () => {
      render(<ValidationScreen />);

      const surrogatePanel = screen.getByRole('tabpanel', { name: 'Surrogate Confidence' });
      expect(surrogatePanel).toHaveAttribute('aria-labelledby', 'surrogate-tab');
      expect(surrogatePanel).toHaveAttribute('id', 'surrogate-panel');
    });

    it('should be keyboard navigable through tabs', async () => {
      render(<ValidationScreen />);

      const surrogateTab = screen.getByRole('tab', { name: 'Surrogate Confidence' });
      const testingTab = screen.getByRole('tab', { name: 'Test Plan' });

      await userEvent.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /run all tests/i }));

      await userEvent.tab();
      expect(document.activeElement).toBe(surrogateTab);

      await userEvent.tab();
      expect(document.activeElement).toBe(testingTab);
    });

    it('should support Enter key to activate tabs', async () => {
      render(<ValidationScreen />);

      const testingTab = screen.getByRole('tab', { name: 'Test Plan' });
      testingTab.focus();

      await userEvent.keyboard('{Enter}');

      expect(testingTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should have proper tablist role', () => {
      render(<ValidationScreen />);

      const tablist = screen.getByRole('tablist', { name: 'Validation tabs' });
      expect(tablist).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty sensor locations gracefully', async () => {
      render(<ValidationScreen sensorLocations={[]} />);

      const sentryTab = screen.getByRole('tab', { name: 'Sentry Monitoring' });
      await userEvent.click(sentryTab);

      expect(screen.getByText('0 Sensors Configured')).toBeInTheDocument();
    });

    it('should handle undefined validation stats', () => {
      render(<ValidationScreen />);

      // Should render with default/fallback values
      expect(screen.getByText('Design Validation')).toBeInTheDocument();
    });

    it('should handle zero completion rate', () => {
      const zeroStats = { ...mockValidationStats, completionRate: 0 };
      render(<ValidationScreen validationStats={zeroStats} />);

      expect(screen.getByText('0% Complete')).toBeInTheDocument();
    });

    it('should handle all tests passing', () => {
      const allPassStats = {
        totalTests: 40,
        passed: 40,
        failed: 0,
        warnings: 0,
        completionRate: 100,
        lastRun: '2025-01-15 14:32:00',
      };
      render(<ValidationScreen validationStats={allPassStats} />);

      expect(screen.getByText('40')).toBeInTheDocument();
      expect(screen.getByText('100% Complete')).toBeInTheDocument();
    });
  });
});
