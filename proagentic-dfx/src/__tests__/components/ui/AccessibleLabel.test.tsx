/**
 * AccessibleLabel Component Tests
 * Coverage Target: 80%
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccessibleLabel } from '@/components/ui/AccessibleLabel';

describe('AccessibleLabel', () => {
  describe('Basic Rendering', () => {
    it('should render label text', () => {
      render(
        <AccessibleLabel htmlFor="test-input" label="Email Address">
          <input id="test-input" type="text" />
        </AccessibleLabel>
      );

      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('should render children', () => {
      render(
        <AccessibleLabel htmlFor="test-input" label="Email">
          <input id="test-input" type="text" data-testid="input" />
        </AccessibleLabel>
      );

      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('should associate label with input via htmlFor', () => {
      render(
        <AccessibleLabel htmlFor="my-input" label="Username">
          <input id="my-input" type="text" />
        </AccessibleLabel>
      );

      const label = screen.getByText('Username');
      expect(label).toHaveAttribute('for', 'my-input');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <AccessibleLabel htmlFor="test" label="Test" className="custom-class">
          <input id="test" />
        </AccessibleLabel>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Required Field', () => {
    it('should show required indicator when required=true', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Name" required>
          <input id="test" />
        </AccessibleLabel>
      );

      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('should not show required indicator when required=false', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Name" required={false}>
          <input id="test" />
        </AccessibleLabel>
      );

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('should not show required indicator by default', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Name">
          <input id="test" />
        </AccessibleLabel>
      );

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('Hint Text', () => {
    it('should display hint when provided', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Password" hint="Must be at least 8 characters">
          <input id="test" type="password" />
        </AccessibleLabel>
      );

      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });

    it('should create hint with correct id', () => {
      render(
        <AccessibleLabel htmlFor="my-field" label="Field" hint="Some hint">
          <input id="my-field" />
        </AccessibleLabel>
      );

      expect(screen.getByText('Some hint')).toHaveAttribute('id', 'my-field-hint');
    });

    it('should not display hint element when not provided', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Field">
          <input id="test" />
        </AccessibleLabel>
      );

      expect(screen.queryByText('-hint')).not.toBeInTheDocument();
    });
  });

  describe('Error Messages', () => {
    it('should display error when provided', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Email" error="Invalid email format">
          <input id="test" type="email" />
        </AccessibleLabel>
      );

      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    it('should create error with correct id', () => {
      render(
        <AccessibleLabel htmlFor="my-field" label="Field" error="Error message">
          <input id="my-field" />
        </AccessibleLabel>
      );

      expect(screen.getByText('Error message')).toHaveAttribute('id', 'my-field-error');
    });

    it('should have role=alert for error messages', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Field" error="Required field">
          <input id="test" />
        </AccessibleLabel>
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Required field');
    });

    it('should not display error element when not provided', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Field">
          <input id="test" />
        </AccessibleLabel>
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('ARIA Attributes', () => {
    it('should set aria-describedby when hint is provided', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Field" hint="Help text">
          <input id="test" />
        </AccessibleLabel>
      );

      const wrapper = screen.getByText('Help text').closest('div')?.parentElement?.querySelector('[aria-describedby]');
      expect(wrapper).toHaveAttribute('aria-describedby', 'test-hint');
    });

    it('should set aria-describedby when error is provided', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Field" error="Error text">
          <input id="test" />
        </AccessibleLabel>
      );

      const wrapper = screen.getByRole('alert').closest('div')?.parentElement?.querySelector('[aria-describedby]');
      expect(wrapper).toHaveAttribute('aria-describedby', 'test-error');
    });

    it('should set aria-describedby with both hint and error', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Field" hint="Help" error="Error">
          <input id="test" />
        </AccessibleLabel>
      );

      const wrapperDiv = screen.getByText('Help').closest('div')?.parentElement?.querySelector('[aria-describedby]');
      expect(wrapperDiv?.getAttribute('aria-describedby')).toContain('test-hint');
      expect(wrapperDiv?.getAttribute('aria-describedby')).toContain('test-error');
    });

    it('should not set aria-describedby when neither hint nor error', () => {
      const { container } = render(
        <AccessibleLabel htmlFor="test" label="Field">
          <input id="test" />
        </AccessibleLabel>
      );

      const divs = container.querySelectorAll('[aria-describedby]');
      // Should have no aria-describedby or empty value
      divs.forEach(div => {
        const value = div.getAttribute('aria-describedby');
        expect(value === null || value === '').toBe(true);
      });
    });
  });

  describe('Styling', () => {
    it('should have proper label styling', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Styled Label">
          <input id="test" />
        </AccessibleLabel>
      );

      const label = screen.getByText('Styled Label');
      expect(label).toHaveClass('text-sm', 'font-medium');
    });

    it('should have proper hint styling', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Label" hint="Hint text">
          <input id="test" />
        </AccessibleLabel>
      );

      const hint = screen.getByText('Hint text');
      expect(hint).toHaveClass('text-sm', 'text-gray-500');
    });

    it('should have proper error styling', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Label" error="Error text">
          <input id="test" />
        </AccessibleLabel>
      );

      const error = screen.getByText('Error text');
      expect(error).toHaveClass('text-sm', 'text-red-600');
    });

    it('should have proper required indicator styling', () => {
      render(
        <AccessibleLabel htmlFor="test" label="Label" required>
          <input id="test" />
        </AccessibleLabel>
      );

      const asterisk = screen.getByText('*');
      expect(asterisk).toHaveClass('text-red-500');
    });
  });
});
