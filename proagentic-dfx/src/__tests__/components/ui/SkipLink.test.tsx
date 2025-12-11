/**
 * SkipLink Component Tests
 * Coverage Target: 80%
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipLink } from '@/components/ui/SkipLink';

describe('SkipLink', () => {
  describe('Basic Rendering', () => {
    it('should render the skip link', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link).toBeInTheDocument();
    });

    it('should be an anchor element', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link.tagName).toBe('A');
    });

    it('should link to #main-content', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Accessibility', () => {
    it('should be screen-reader only by default', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link).toHaveClass('sr-only');
    });

    it('should become visible on focus', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link).toHaveClass('focus:not-sr-only');
    });

    it('should have focus styling', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link).toHaveClass('focus:absolute');
      expect(link).toHaveClass('focus:top-4');
      expect(link).toHaveClass('focus:left-4');
      expect(link).toHaveClass('focus:z-50');
    });

    it('should have visible focus ring', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link).toHaveClass('focus:ring-2');
      expect(link).toHaveClass('focus:outline-none');
    });
  });

  describe('Styling', () => {
    it('should have background color when focused', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link).toHaveClass('focus:bg-primary-500');
    });

    it('should have white text when focused', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link).toHaveClass('focus:text-white');
    });

    it('should have padding when focused', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link).toHaveClass('focus:px-4');
      expect(link).toHaveClass('focus:py-2');
    });

    it('should have rounded corners when focused', () => {
      render(<SkipLink />);

      const link = screen.getByText('Skip to main content');
      expect(link).toHaveClass('focus:rounded-md');
    });
  });
});
