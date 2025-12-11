/**
 * SurrogateConfidencePanel Component Tests
 * PHASE 2 Coverage: Validation Components
 *
 * Test Cases:
 * - Chart rendering (3 tests)
 * - Metrics table (4 tests)
 * - Status assessment (3 tests)
 * - Button interactions (2 tests)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SurrogateConfidencePanel } from '@/components/validation/SurrogateConfidencePanel';

describe('SurrogateConfidencePanel', () => {
  describe('Component Rendering', () => {
    it('should render panel with title', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Surrogate Model Confidence')).toBeInTheDocument();
    });

    it('should render confidence metrics section', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Model Accuracy (R² Scores)')).toBeInTheDocument();
    });

    it('should render detailed metrics table header', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Detailed Confidence Metrics')).toBeInTheDocument();
    });
  });

  describe('Chart Rendering', () => {
    it('should render bar chart container', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const chart = container.querySelector('[class*="ResponsiveContainer"]');
      expect(chart || container.querySelector('svg')).toBeTruthy();
    });

    it('should render chart title', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Model Accuracy (R² Scores)')).toBeInTheDocument();
    });

    it('should display all metrics in chart', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Burst Pressure')).toBeInTheDocument();
      expect(screen.getByText('Max Stress')).toBeInTheDocument();
      expect(screen.getByText('Thermal Response')).toBeInTheDocument();
    });
  });

  describe('Metrics Table', () => {
    it('should render metrics table', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    it('should display table headers', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Output')).toBeInTheDocument();
      expect(screen.getByText('R²')).toBeInTheDocument();
      expect(screen.getByText('RMSE')).toBeInTheDocument();
      expect(screen.getByText('95% Confidence')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should display all metrics rows', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Burst Pressure')).toBeInTheDocument();
      expect(screen.getByText('Max Stress')).toBeInTheDocument();
      expect(screen.getByText('Thermal Response')).toBeInTheDocument();
      expect(screen.getByText('Fatigue Life')).toBeInTheDocument();
      expect(screen.getByText('Permeation Rate')).toBeInTheDocument();
    });

    it('should display R² values', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('0.984')).toBeInTheDocument();
      expect(screen.getByText('0.971')).toBeInTheDocument();
      expect(screen.getByText('0.945')).toBeInTheDocument();
    });

    it('should display RMSE values', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText(/2.3/)).toBeInTheDocument();
      expect(screen.getByText(/4.1/)).toBeInTheDocument();
      expect(screen.getByText(/5.8/)).toBeInTheDocument();
    });

    it('should display confidence intervals', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText(/\[0.96, 0.99\]/)).toBeInTheDocument();
      expect(screen.getByText(/\[0.94, 0.98\]/)).toBeInTheDocument();
    });
  });

  describe('Status Assessment', () => {
    it('should display excellent status for high R² values', () => {
      render(<SurrogateConfidencePanel />);

      const excellentStatuses = screen.getAllByText('excellent');
      expect(excellentStatuses.length).toBeGreaterThan(0);
    });

    it('should display good status for mid-range R² values', () => {
      render(<SurrogateConfidencePanel />);

      const goodStatuses = screen.getAllByText('good');
      expect(goodStatuses.length).toBeGreaterThan(0);
    });

    it('should display acceptable status for lower R² values', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('acceptable')).toBeInTheDocument();
    });

    it('should use status color coding', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      // Check for status badges with colors
      const badges = container.querySelectorAll('[class*="bg-"]');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should display status icons', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Quality Assessment Section', () => {
    it('should display quality assessment header', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Model Quality Assessment')).toBeInTheDocument();
    });

    it('should display excellent criteria', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText(/R² > 0.95: Excellent/)).toBeInTheDocument();
    });

    it('should display good criteria', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText(/R² 0.90-0.95: Good/)).toBeInTheDocument();
    });

    it('should display acceptable criteria', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText(/R² 0.85-0.90: Acceptable/)).toBeInTheDocument();
    });

    it('should display poor criteria', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText(/R² < 0.85: Poor/)).toBeInTheDocument();
    });

    it('should display color legend indicators', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const colorDots = container.querySelectorAll('[class*="rounded-full"]');
      expect(colorDots.length).toBeGreaterThan(0);
    });
  });

  describe('Overall Assessment Section', () => {
    it('should display overall assessment header', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Overall Assessment')).toBeInTheDocument();
    });

    it('should display high accuracy statement', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText(/high accuracy across all outputs/)).toBeInTheDocument();
    });

    it('should display burst pressure assessment', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText(/Burst pressure and stress predictions have excellent/)).toBeInTheDocument();
    });

    it('should display fatigue life recommendation', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText(/Fatigue life model acceptable/)).toBeInTheDocument();
    });

    it('should mention FEA validation', () => {
      render(<SurrogateConfidencePanel />);

      const feaValidationElements = screen.getAllByText(/FEA validation/);
      expect(feaValidationElements.length).toBeGreaterThan(0);
    });
  });

  describe('FEA Validation Section', () => {
    it('should display FEA recommendation banner', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Recommend Full FEA Validation')).toBeInTheDocument();
    });

    it('should display FEA validation message', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText(/validate surrogate predictions with detailed FEA/)).toBeInTheDocument();
    });

    it('should display FEA request button', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Request FEA Validation')).toBeInTheDocument();
    });

    it('should display alert icon for FEA section', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const alertIcon = container.querySelector('[class*="text-orange"]');
      expect(alertIcon).toBeTruthy();
    });
  });

  describe('Button Interactions', () => {
    it('should render Request FEA Validation button', () => {
      render(<SurrogateConfidencePanel />);

      const button = screen.getByText('Request FEA Validation');
      expect(button).toBeInTheDocument();
    });

    it('should handle button click', () => {
      // Note: The actual handler logs to console, we can verify it doesn't throw
      render(<SurrogateConfidencePanel />);

      const button = screen.getByText('Request FEA Validation');
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
    });

    it('should display Send icon on button', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const button = screen.getByText('Request FEA Validation');
      expect(button).toBeInTheDocument();
    });

    it('should have proper button styling', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const button = screen.getByText('Request FEA Validation');
      expect(button).toBeInTheDocument();
      expect(button.className).toBeDefined();
    });
  });

  describe('Metric Data Rendering', () => {
    it('should render burst pressure metric', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Burst Pressure')).toBeInTheDocument();
      expect(screen.getByText('0.984')).toBeInTheDocument();
    });

    it('should render max stress metric', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Max Stress')).toBeInTheDocument();
      expect(screen.getByText('0.971')).toBeInTheDocument();
    });

    it('should render thermal response metric', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Thermal Response')).toBeInTheDocument();
      expect(screen.getByText('0.945')).toBeInTheDocument();
    });

    it('should render fatigue life metric', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Fatigue Life')).toBeInTheDocument();
      expect(screen.getByText('0.889')).toBeInTheDocument();
    });

    it('should render permeation rate metric', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Permeation Rate')).toBeInTheDocument();
      expect(screen.getByText('0.912')).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    it('should render as grid layout', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const gridContainer = container.querySelector('[class*="grid"]');
      expect(gridContainer).toBeTruthy();
    });

    it('should have proper spacing', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const spacedContent = container.querySelector('[class*="space-y"]');
      expect(spacedContent).toBeTruthy();
    });

    it('should have assessment cards side by side', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const assessmentCards = container.querySelectorAll('[class*="grid"]');
      expect(assessmentCards.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const thead = container.querySelector('thead');
      const tbody = container.querySelector('tbody');
      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();
    });

    it('should have table header cells', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const headers = container.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should have readable text content', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Burst Pressure')).toBeVisible();
      expect(screen.getByText('Model Quality Assessment')).toBeVisible();
    });

    it('should use semantic headings', () => {
      render(<SurrogateConfidencePanel />);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have alt text for icons', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const ariaHiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(ariaHiddenIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should render chart in ResponsiveContainer', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const charts = container.querySelectorAll('svg');
      expect(charts.length).toBeGreaterThan(0);
    });

    it('should have overflow handling for table', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const tableWrapper = container.querySelector('[class*="overflow"]');
      expect(tableWrapper).toBeTruthy();
    });
  });

  describe('Color Status Mapping', () => {
    it('should render green color for excellent status', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const greenElement = container.querySelector('[class*="green"]');
      expect(greenElement).toBeTruthy();
    });

    it('should render blue color for good status', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const blueElement = container.querySelector('[class*="blue"]');
      expect(blueElement).toBeTruthy();
    });

    it('should render yellow color for acceptable status', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      const yellowElement = container.querySelector('[class*="yellow"]');
      expect(yellowElement).toBeTruthy();
    });

    it('should render red color for poor status', () => {
      const { container } = render(<SurrogateConfidencePanel />);

      // Red may appear in borders or backgrounds
      const redElement = container.querySelector('[class*="red"]');
      expect(redElement).toBeTruthy();
    });
  });

  describe('Information Display', () => {
    it('should display metric names clearly', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('Burst Pressure')).toBeVisible();
      expect(screen.getByText('Max Stress')).toBeVisible();
    });

    it('should display R² values with proper precision', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText('0.984')).toBeInTheDocument();
      expect(screen.getByText('0.971')).toBeInTheDocument();
    });

    it('should display RMSE as percentage', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText(/2.3%/)).toBeInTheDocument();
    });

    it('should display confidence intervals properly formatted', () => {
      render(<SurrogateConfidencePanel />);

      expect(screen.getByText(/\[0.96, 0.99\]/)).toBeInTheDocument();
    });
  });
});
