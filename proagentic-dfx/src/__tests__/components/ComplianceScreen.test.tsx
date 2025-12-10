/**
 * ComplianceScreen Component Tests
 * Tests for the enhanced compliance verification component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComplianceScreenEnhanced } from '@/components/screens/ComplianceScreen.enhanced.v2';
import * as apiClient from '@/lib/api/client';
import * as appStore from '@/lib/stores/app-store';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  getDesignCompliance: vi.fn(),
  getDesignTestPlan: vi.fn(),
}));

// Mock the app store
vi.mock('@/lib/stores/app-store', () => ({
  useAppStore: vi.fn(),
}));

// Mock child components
vi.mock('@/components/compliance/ClauseBreakdown', () => ({
  ClauseBreakdown: ({ standards }: { standards: unknown[] }) => (
    <div data-testid="clause-breakdown">
      Clause Breakdown (${standards.length} standards)
    </div>
  ),
}));

vi.mock('@/components/compliance/ComplianceMatrix', () => ({
  ComplianceMatrix: ({ requirements }: { requirements: unknown[] }) => (
    <div data-testid="compliance-matrix">
      Compliance Matrix ({requirements.length} requirements)
    </div>
  ),
}));

const mockComplianceData = {
  design_id: 'C',
  overall_status: 'pass' as const,
  standards: [
    {
      standard_id: 'ISO-11119-3',
      standard_name: 'Gas cylinders - Composite materials',
      status: 'pass' as const,
      clauses: [
        {
          clause: '5.3.1',
          description: 'Burst Pressure Safety Factor',
          status: 'pass' as const,
          actual_value: '2.5',
          required_value: '≥2.25',
        },
        {
          clause: '5.3.2',
          description: 'Hydrostatic Test Pressure',
          status: 'pass' as const,
          actual_value: '525 bar',
          required_value: '525 bar',
        },
      ],
    },
    {
      standard_id: 'UN-ECE-R134',
      standard_name: 'Hydrogen fuel system components',
      status: 'fail' as const,
      clauses: [
        {
          clause: '6.2',
          description: 'Permeation Rate Limit',
          status: 'fail' as const,
          actual_value: '12 NmL/h/L',
          required_value: '<6 NmL/h/L',
        },
      ],
    },
  ],
};

const mockTestPlanData = {
  design_id: 'C',
  tests: [
    {
      test: 'Hydrostatic Burst Test',
      articles: 3,
      duration: '2 days',
      parameters: 'Pressurize to failure',
    },
    {
      test: 'Ambient Temperature Cycling',
      articles: 2,
      duration: '15 days',
      parameters: '15,000 cycles @ 35-350 bar',
    },
  ],
  total_articles: '12',
  total_duration: '8-10 weeks',
  estimated_cost: '€250,000',
  recommended_labs: [
    {
      name: 'BAM Federal Institute',
      location: 'Berlin, Germany',
      accreditation: 'ISO 17025',
      specialization: 'Composite pressure vessel qualification',
      leadTime: '6-8 weeks',
    },
  ],
};

describe('ComplianceScreenEnhanced', () => {
  const mockSetCurrentDesign = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(appStore.useAppStore).mockReturnValue({
      currentDesign: 'C',
      setCurrentDesign: mockSetCurrentDesign,
    } as never);

    vi.mocked(apiClient.getDesignCompliance).mockResolvedValue(mockComplianceData);
    vi.mocked(apiClient.getDesignTestPlan).mockResolvedValue(mockTestPlanData);
  });

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      render(<ComplianceScreenEnhanced />);
      expect(screen.getByText('Loading compliance data...')).toBeInTheDocument();
    });

    it('should render compliance dashboard after loading', async () => {
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument();
      });

      expect(screen.getByText(/Design C - Hydrogen Pressure Vessel/i)).toBeInTheDocument();
    });

    it('should display overall compliance status badge', async () => {
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Overall: PASS')).toBeInTheDocument();
      });
    });

    it('should set default design to C if none selected', () => {
      vi.mocked(appStore.useAppStore).mockReturnValue({
        currentDesign: null,
        setCurrentDesign: mockSetCurrentDesign,
      } as never);

      render(<ComplianceScreenEnhanced />);

      expect(mockSetCurrentDesign).toHaveBeenCalledWith('C');
    });
  });

  describe('Compliance Statistics', () => {
    it('should display correct compliance percentage', async () => {
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        // 67% appears in both the stat card value and the progress percentage
        expect(screen.getAllByText('67%').length).toBeGreaterThan(0); // 2/3 clauses pass
      });
    });

    it('should display correct number of passed requirements', async () => {
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        // ComplianceStatCard uses label "Overall Compliance", not "Requirements Passed"
        expect(screen.getByText('Overall Compliance')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('of 3 total')).toBeInTheDocument();
      });
    });

    it('should display correct number of failed requirements', async () => {
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Outstanding Issues')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('critical items')).toBeInTheDocument();
      });
    });

    it('should display standards compliance count', async () => {
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Standards Met')).toBeInTheDocument();
        expect(screen.getByText('1/2')).toBeInTheDocument();
      });
    });
  });

  describe('Compliance Status Badges', () => {
    it('should display pass badge for compliant design', async () => {
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        const badge = screen.getByRole('status', { name: /Overall compliance status: pass/i });
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('bg-green-100');
      });
    });

    it('should display fail badge for non-compliant design', async () => {
      vi.mocked(apiClient.getDesignCompliance).mockResolvedValue({
        ...mockComplianceData,
        overall_status: 'fail',
      });

      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        const badge = screen.getByRole('status', { name: /Overall compliance status: fail/i });
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('bg-red-100');
      });
    });
  });

  describe('Progress Bars', () => {
    it('should render progress bar with correct ARIA attributes', async () => {
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar', {
          name: /Overall Compliance progress/i,
        });
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', '67');
        expect(progressBar).toHaveAttribute('aria-valuemin', '0');
        expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      });
    });

    it('should display progress bar for high compliance', async () => {
      vi.mocked(apiClient.getDesignCompliance).mockResolvedValue({
        design_id: 'C',
        overall_status: 'pass',
        standards: [
          {
            standard_id: 'ISO-11119-3',
            standard_name: 'Test Standard',
            status: 'pass',
            clauses: Array(10).fill({
              clause: '1.1',
              description: 'Test',
              status: 'pass',
              actual_value: '1',
              required_value: '1',
            }),
          },
        ],
      });

      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar', {
          name: /Overall Compliance progress/i,
        });
        const progressFill = progressBar.querySelector('div');
        // ComplianceStatCard uses neutral gray styling, not green gradients
        expect(progressFill).toHaveClass('bg-gray-500');
      });
    });
  });

  describe('Alert Display', () => {
    it('should display failure alert when there are failed requirements', async () => {
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Compliance Issues Detected')).toBeInTheDocument();
        expect(
          screen.getByText(/1 critical compliance issue/i)
        ).toBeInTheDocument();
      });
    });

    it('should display success alert for full compliance', async () => {
      vi.mocked(apiClient.getDesignCompliance).mockResolvedValue({
        design_id: 'C',
        overall_status: 'pass',
        standards: [
          {
            standard_id: 'ISO-11119-3',
            standard_name: 'Test',
            status: 'pass',
            clauses: [
              {
                clause: '1.1',
                description: 'Test',
                status: 'pass',
                actual_value: '1',
                required_value: '1',
              },
            ],
          },
        ],
      });

      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Full Compliance Achieved')).toBeInTheDocument();
        expect(
          screen.getByText(/ready for qualification testing/i)
        ).toBeInTheDocument();
      });
    });

    it('should not display any alert for zero issues', async () => {
      vi.mocked(apiClient.getDesignCompliance).mockResolvedValue({
        design_id: 'C',
        overall_status: 'pass',
        standards: [
          {
            standard_id: 'ISO-11119-3',
            standard_name: 'Test',
            status: 'pass',
            clauses: [
              {
                clause: '1.1',
                description: 'Test',
                status: 'pass',
                actual_value: '1',
                required_value: '1',
              },
            ],
          },
        ],
      });

      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.queryByText('Compliance Issues Detected')).not.toBeInTheDocument();
      });
    });
  });

  describe('View Mode Navigation', () => {
    it('should render all view mode tabs', async () => {
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Overview/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Clause Breakdown/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Compliance Matrix/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Test Requirements/i })).toBeInTheDocument();
      });
    });

    it('should switch to clause breakdown view', async () => {
      const user = userEvent.setup();
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument();
      });

      const breakdownTab = screen.getByRole('tab', { name: /Clause Breakdown/i });
      await user.click(breakdownTab);

      expect(screen.getByTestId('clause-breakdown')).toBeInTheDocument();
    });

    it('should switch to compliance matrix view', async () => {
      const user = userEvent.setup();
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument();
      });

      const matrixTab = screen.getByRole('tab', { name: /Compliance Matrix/i });
      await user.click(matrixTab);

      expect(screen.getByTestId('compliance-matrix')).toBeInTheDocument();
    });

    it('should switch to test requirements view', async () => {
      const user = userEvent.setup();
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument();
      });

      const testsTab = screen.getByRole('tab', { name: /Test Requirements/i });
      await user.click(testsTab);

      expect(screen.getByText('Qualification Test Plan')).toBeInTheDocument();
    });
  });

  describe('Test Plan Rendering', () => {
    it('should render test requirements table', async () => {
      const user = userEvent.setup();
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument();
      });

      const testsTab = screen.getByRole('tab', { name: /Test Requirements/i });
      await user.click(testsTab);

      expect(screen.getByText('Hydrostatic Burst Test')).toBeInTheDocument();
      expect(screen.getByText('Ambient Temperature Cycling')).toBeInTheDocument();
    });

    it('should display test plan summary statistics', async () => {
      const user = userEvent.setup();
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument();
      });

      const testsTab = screen.getByRole('tab', { name: /Test Requirements/i });
      await user.click(testsTab);

      expect(screen.getByText('12')).toBeInTheDocument(); // total articles
      expect(screen.getByText('8-10 weeks')).toBeInTheDocument(); // duration
      expect(screen.getByText('€250,000')).toBeInTheDocument(); // cost
    });

    it('should render recommended laboratories', async () => {
      const user = userEvent.setup();
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument();
      });

      const testsTab = screen.getByRole('tab', { name: /Test Requirements/i });
      await user.click(testsTab);

      expect(screen.getByText('BAM Federal Institute')).toBeInTheDocument();
      expect(screen.getByText('Berlin, Germany')).toBeInTheDocument();
      expect(screen.getByText('ISO 17025')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      vi.mocked(apiClient.getDesignCompliance).mockRejectedValue(
        new Error('Network error')
      );

      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Error loading compliance data')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should display error for invalid data format', async () => {
      vi.mocked(apiClient.getDesignCompliance).mockResolvedValue({
        invalid: 'data',
      } as never);

      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Invalid compliance data format')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on status badge', async () => {
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        const badge = screen.getByRole('status');
        expect(badge).toHaveAttribute('aria-label', 'Overall compliance status: pass');
      });
    });

    it('should have proper tab accessibility attributes', async () => {
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        const overviewTab = screen.getByRole('tab', { name: /Overview/i });
        expect(overviewTab).toHaveAttribute('aria-selected', 'true');

        const breakdownTab = screen.getByRole('tab', { name: /Clause Breakdown/i });
        expect(breakdownTab).toHaveAttribute('aria-selected', 'false');
      });
    });

    it('should have accessible button labels', async () => {
      const user = userEvent.setup();
      render(<ComplianceScreenEnhanced />);

      await waitFor(() => {
        expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument();
      });

      const testsTab = screen.getByRole('tab', { name: /Test Requirements/i });
      await user.click(testsTab);

      const exportButton = screen.getByRole('button', { name: /Export test plan/i });
      expect(exportButton).toBeInTheDocument();
    });
  });
});
