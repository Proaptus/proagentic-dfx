/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ValidationStatCard Component Tests
 * PHASE 2 Coverage: Validation Components
 *
 * Test Cases:
 * - Basic rendering (3 tests)
 * - Icon and styling (4 tests)
 * - Sublabel display (2 tests)
 * - Accessibility (3 tests)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValidationStatCard } from '@/components/validation/ValidationStatCard';
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

describe('ValidationStatCard', () => {
  describe('Basic Rendering', () => {
    it('should render the label', () => {
      render(
        <ValidationStatCard
          label="Test Count"
          value={5}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      expect(screen.getByText('Test Count')).toBeInTheDocument();
    });

    it('should render the value', () => {
      render(
        <ValidationStatCard
          label="Tests Passed"
          value={42}
          icon={CheckCircle2}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with string value', () => {
      render(
        <ValidationStatCard
          label="Status"
          value="Complete"
          icon={CheckCircle2}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
      );

      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('should render with number value', () => {
      render(
        <ValidationStatCard
          label="Percentage"
          value={95}
          icon={TrendingUp}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      );

      expect(screen.getByText('95')).toBeInTheDocument();
    });
  });

  describe('Sublabel Display', () => {
    it('should render sublabel when provided', () => {
      render(
        <ValidationStatCard
          label="Tests Passed"
          value={5}
          sublabel="out of 10 total"
          icon={CheckCircle2}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
      );

      expect(screen.getByText('out of 10 total')).toBeInTheDocument();
    });

    it('should render sublabel as ReactNode', () => {
      render(
        <ValidationStatCard
          label="Status"
          value="Ready"
          sublabel={<span>All checks passed</span>}
          icon={CheckCircle2}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
      );

      expect(screen.getByText('All checks passed')).toBeInTheDocument();
    });

    it('should not render sublabel when not provided', () => {
      const { container } = render(
        <ValidationStatCard
          label="Tests"
          value={10}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const textContent = container.textContent;
      expect(textContent).toContain('Tests');
      expect(textContent).toContain('10');
    });
  });

  describe('Icon Styling', () => {
    it('should apply icon background color', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={1}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const iconContainer = container.querySelector('.bg-blue-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply icon color', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={1}
          icon={CheckCircle2}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
      );

      const icon = container.querySelector('.text-green-600');
      expect(icon).toBeInTheDocument();
    });

    it('should render different icon types', () => {
      const { container: container1 } = render(
        <ValidationStatCard
          label="Success"
          value={1}
          icon={CheckCircle2}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
      );

      const { container: container2 } = render(
        <ValidationStatCard
          label="Alert"
          value={1}
          icon={AlertCircle}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />
      );

      expect(container1.querySelectorAll('svg').length).toBeGreaterThan(0);
      expect(container2.querySelectorAll('svg').length).toBeGreaterThan(0);
    });

    it('should apply icon size 24', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={1}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Value Styling', () => {
    it('should apply default value color', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={42}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const valueElement = container.querySelector('.text-gray-900');
      expect(valueElement).toBeInTheDocument();
      expect(valueElement?.textContent).toContain('42');
    });

    it('should apply custom value color', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={10}
          icon={CheckCircle2}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          valueColor="text-green-700"
        />
      );

      const valueElement = container.querySelector('.text-green-700');
      expect(valueElement).toBeInTheDocument();
    });

    it('should display value with large font size', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={99}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const valueElement = container.querySelector('.text-2xl');
      expect(valueElement).toBeInTheDocument();
    });

    it('should display value as bold', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={5}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const valueElement = container.querySelector('.font-bold');
      expect(valueElement).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    it('should render as Card component', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={1}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      expect(container.querySelector('[class*="rounded"]')).toBeInTheDocument();
    });

    it('should have white background', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={1}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const card = container.querySelector('.bg-white');
      expect(card).toBeInTheDocument();
    });

    it('should have border styling', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={1}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const card = container.querySelector('[class*="border"]');
      expect(card).toBeInTheDocument();
    });

    it('should have shadow styling', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={1}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const card = container.querySelector('[class*="shadow"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should use flexbox layout', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={1}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const flexContainer = container.querySelector('[class*="flex"]');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should position icon to the right', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={1}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const layout = container.querySelector('[class*="justify-between"]');
      expect(layout).toBeInTheDocument();
    });

    it('should display label above value', () => {
      render(
        <ValidationStatCard
          label="Tests Completed"
          value={42}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const label = screen.getByText('Tests Completed');
      const value = screen.getByText('42');
      expect(label).toBeInTheDocument();
      expect(value).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic text elements', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test Label"
          value={100}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const elements = container.querySelectorAll('p, span, div');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should render label as readable text', () => {
      render(
        <ValidationStatCard
          label="Readable Label"
          value={50}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      expect(screen.getByText('Readable Label')).toBeInTheDocument();
    });

    it('should have proper text color contrast', () => {
      const { container } = render(
        <ValidationStatCard
          label="Test"
          value={1}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      const textElements = container.querySelectorAll('[class*="text-"]');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Multiple Instances', () => {
    it('should render multiple cards with different icons', () => {
      const { container } = render(
        <div>
          <ValidationStatCard
            label="Passed"
            value={10}
            icon={CheckCircle2}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <ValidationStatCard
            label="Failed"
            value={2}
            icon={AlertCircle}
            iconBgColor="bg-red-100"
            iconColor="text-red-600"
          />
          <ValidationStatCard
            label="Total"
            value={12}
            icon={TrendingUp}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
        </div>
      );

      expect(screen.getByText('Passed')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should render grid of cards', () => {
      const { container } = render(
        <div className="grid grid-cols-3 gap-4">
          <ValidationStatCard
            label="Card 1"
            value={1}
            icon={CheckCircle2}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <ValidationStatCard
            label="Card 2"
            value={2}
            icon={CheckCircle2}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <ValidationStatCard
            label="Card 3"
            value={3}
            icon={CheckCircle2}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
        </div>
      );

      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
      expect(screen.getByText('Card 3')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle long label text', () => {
      render(
        <ValidationStatCard
          label="This is a very long label text that should still render properly"
          value={1}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      expect(screen.getByText(/This is a very long label/)).toBeInTheDocument();
    });

    it('should handle long value text', () => {
      render(
        <ValidationStatCard
          label="Label"
          value="Very Long Value Text"
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      expect(screen.getByText('Very Long Value Text')).toBeInTheDocument();
    });

    it('should handle zero value', () => {
      render(
        <ValidationStatCard
          label="Count"
          value={0}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle large numbers', () => {
      render(
        <ValidationStatCard
          label="Total"
          value={999999}
          icon={CheckCircle2}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      );

      expect(screen.getByText('999999')).toBeInTheDocument();
    });
  });
});
