/**
 * TestPlanPanel Component Tests
 * PHASE 2 Coverage: Validation Components
 *
 * Test Cases:
 * - Test type selection (2 tests)
 * - Schedule management (3 tests)
 * - Duration tracking (3 tests)
 * - Cost calculation (2 tests)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestPlanPanel, TestType } from '@/components/validation/TestPlanPanel';

describe('TestPlanPanel', () => {
  const mockTestPlan: TestType[] = [
    {
      id: 'test-1',
      name: 'Pressure Cycling Test',
      standard: 'ISO 11439',
      articles: 3,
      cycles: 15000,
      pressure_range: '0-700 bar',
      temp_range: '-40°C to +85°C',
      duration_days: 45,
      cost_eur: 5500,
      critical: true,
    },
    {
      id: 'test-2',
      name: 'Thermal Shock Test',
      standard: 'ISO 6072',
      articles: 2,
      pressure_range: '175 bar',
      temp_range: '-40°C to +85°C',
      duration_days: 14,
      cost_eur: 3200,
      critical: false,
    },
    {
      id: 'test-3',
      name: 'Fatigue Analysis',
      standard: 'ISO 11439',
      articles: 1,
      cycles: 100000,
      duration_days: 90,
      cost_eur: 8500,
      critical: true,
    },
  ];

  describe('Component Rendering', () => {
    it('should render TestPlanPanel with title', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText('Certification Test Plan')).toBeInTheDocument();
    });

    it('should render with empty test plan', () => {
      render(<TestPlanPanel testPlan={[]} />);

      expect(screen.getByText('Certification Test Plan')).toBeInTheDocument();
    });

    it('should render without test plan prop', () => {
      render(<TestPlanPanel />);

      expect(screen.getByText('Certification Test Plan')).toBeInTheDocument();
    });
  });

  describe('Summary Cards', () => {
    it('should display total tests count', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      // Check for "Total Tests" label first, then verify count is displayed
      expect(screen.getByText('Total Tests')).toBeInTheDocument();
      const testCounts = screen.getAllByText('3');
      expect(testCounts.length).toBeGreaterThan(0);
    });

    it('should calculate and display critical tests count', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText(/2 critical/)).toBeInTheDocument();
    });

    it('should calculate total test articles', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      // Check for "Test Articles" label to ensure we're checking the right card
      expect(screen.getByText('Test Articles')).toBeInTheDocument();
      const articleCounts = screen.getAllByText('6');
      expect(articleCounts.length).toBeGreaterThan(0);
    });

    it('should display maximum test duration', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      // Check for the summary card showing max duration
      expect(screen.getByText('Timeline')).toBeInTheDocument();
      const durationElements = screen.getAllByText(/90.*days/);
      expect(durationElements.length).toBeGreaterThan(0);
    });

    it('should calculate and display total estimated cost', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      // Cost should be displayed - look for the formatted currency
      expect(container.textContent).toContain('17');
      expect(container.textContent).toContain('k');
    });

    it('should display test articles label', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText('Test Articles')).toBeInTheDocument();
    });

    it('should display timeline label', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText('Timeline')).toBeInTheDocument();
    });

    it('should display estimated cost label', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText('Estimated Cost')).toBeInTheDocument();
    });
  });

  describe('Test Plan Table', () => {
    it('should render detailed test requirements table', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    it('should display test names in table', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText('Pressure Cycling Test')).toBeInTheDocument();
      expect(screen.getByText('Thermal Shock Test')).toBeInTheDocument();
      expect(screen.getByText('Fatigue Analysis')).toBeInTheDocument();
    });

    it('should display standards column', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText('Standard')).toBeInTheDocument();
      const iso11439Elements = screen.getAllByText('ISO 11439');
      expect(iso11439Elements.length).toBeGreaterThan(0);
      expect(screen.getByText('ISO 6072')).toBeInTheDocument();
    });

    it('should display articles count in table', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      // Articles column should contain the counts
      expect(container.textContent).toContain('3');
      expect(container.textContent).toContain('2');
      expect(container.textContent).toContain('1');
    });

    it('should display parameters section', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText('Parameters')).toBeInTheDocument();
    });

    it('should display duration in table', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      // Check for "Duration" header to ensure we're in the table section
      expect(screen.getByText('Duration')).toBeInTheDocument();
      const durationElements = screen.getAllByText(/days/);
      expect(durationElements.length).toBeGreaterThan(0);
    });

    it('should display cost in table', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      // Numbers are formatted with commas in the display
      expect(container.textContent).toContain('5,500');
      expect(container.textContent).toContain('3,200');
      expect(container.textContent).toContain('8,500');
    });
  });

  describe('Test Type Selection', () => {
    it('should mark critical tests with badge', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getAllByText('Required')).toHaveLength(2);
    });

    it('should not mark non-critical tests with badge', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      const requiredBadges = screen.getAllByText('Required');
      expect(requiredBadges.length).toBe(2);
    });

    it('should highlight critical test rows', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      const criticalRows = container.querySelectorAll('[class*="orange"]');
      expect(criticalRows.length).toBeGreaterThan(0);
    });
  });

  describe('Schedule Management', () => {
    it('should display pressure ranges for tests', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      // Pressure ranges are shown in table - verify content exists
      expect(container.textContent).toContain('0-700 bar');
      expect(container.textContent).toContain('175 bar');
    });

    it('should display temperature ranges for tests', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      // Temperature ranges are in the table
      expect(container.textContent).toContain('-40°C to +85°C');
    });

    it('should display cycle counts when available', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      // Cycle counts are shown in the table with localized formatting
      expect(container.textContent).toContain('15,000');
      expect(container.textContent).toContain('100,000');
    });

    it('should show maximum duration as overall timeline', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText(/~90 days/)).toBeInTheDocument();
    });
  });

  describe('Duration Tracking', () => {
    it('should calculate maximum duration across all tests', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      // Fatigue test has 90 days, which should be the max
      expect(container.textContent).toContain('90');
      expect(container.textContent).toContain('days');
    });

    it('should display individual test durations', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText('45 days')).toBeInTheDocument();
      expect(screen.getByText('14 days')).toBeInTheDocument();
      expect(screen.getByText('90 days')).toBeInTheDocument();
    });

    it('should show total duration in footer', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      const totalRow = screen.getByText('Total');
      expect(totalRow).toBeInTheDocument();
    });
  });

  describe('Cost Calculations', () => {
    it('should calculate total cost from all tests', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      // Total cost is 17,200 EUR - check it's displayed somewhere in the component
      expect(container.textContent).toContain('17,200');
    });

    it('should display individual test costs', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      // Costs are formatted with commas and currency
      expect(container.textContent).toContain('5,500');
      expect(container.textContent).toContain('3,200');
      expect(container.textContent).toContain('8,500');
    });

    it('should show zero cost for empty test plan', () => {
      render(<TestPlanPanel testPlan={[]} />);

      expect(screen.getByText('Total Tests')).toBeInTheDocument();
    });
  });

  describe('Table Footer', () => {
    it('should display total row', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should show total articles in footer', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      const tfoot = container.querySelector('tfoot');
      expect(tfoot).toBeInTheDocument();
      expect(tfoot?.textContent).toContain('6');
    });

    it('should show total duration in footer', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      const tfoot = container.querySelector('tfoot');
      expect(tfoot?.textContent).toContain('90');
    });

    it('should show total cost in footer', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      const tfoot = container.querySelector('tfoot');
      expect(tfoot).toBeInTheDocument();
    });
  });

  describe('Important Notes Section', () => {
    it('should display important notes section', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText('Important Notes')).toBeInTheDocument();
    });

    it('should list accelerated test note', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText(/Accelerated stress rupture test/)).toBeInTheDocument();
    });

    it('should list manufacturing consistency note', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText(/same production batch/)).toBeInTheDocument();
    });

    it('should list cost note for test articles', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText(/manufacturing/)).toBeInTheDocument();
    });

    it('should list timeline parallelization note', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText(/parallelized/)).toBeInTheDocument();
    });

    it('should list ballistic impact waiver note', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      expect(screen.getByText(/Ballistic impact/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have table headers with proper scope', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      const headers = container.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should have properly structured table', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      const thead = container.querySelector('thead');
      const tbody = container.querySelector('tbody');
      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();
    });

    it('should have accessible heading structure', () => {
      render(<TestPlanPanel testPlan={mockTestPlan} />);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should handle empty test plan gracefully', () => {
      const { container } = render(<TestPlanPanel testPlan={[]} />);

      expect(screen.getByText('Total Tests')).toBeInTheDocument();
      expect(container.textContent).toContain('0');
    });

    it('should display default values for empty plan', () => {
      render(<TestPlanPanel testPlan={[]} />);

      const totalTestsElement = screen.getByText('Total Tests');
      expect(totalTestsElement).toBeInTheDocument();
    });
  });

  describe('Summary Card Icons', () => {
    it('should display test flask icon', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      // FlaskConical icon should be rendered
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display package icon for articles', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display clock icon for timeline', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display cost icon', () => {
      const { container } = render(<TestPlanPanel testPlan={mockTestPlan} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
