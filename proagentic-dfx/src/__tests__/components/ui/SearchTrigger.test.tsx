/**
 * SearchTrigger Component Tests
 * Coverage Target: 80%
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchTrigger } from '@/components/ui/SearchTrigger';

describe('SearchTrigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the button', () => {
      const onClick = vi.fn();
      render(<SearchTrigger onClick={onClick} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render Search text', () => {
      const onClick = vi.fn();
      render(<SearchTrigger onClick={onClick} />);

      expect(screen.getByText('Search...')).toBeInTheDocument();
    });

    it('should have aria-label for accessibility', () => {
      const onClick = vi.fn();
      render(<SearchTrigger onClick={onClick} />);

      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Open search');
    });
  });

  describe('Click Handler', () => {
    it('should call onClick when clicked', () => {
      const onClick = vi.fn();
      render(<SearchTrigger onClick={onClick} />);

      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick multiple times', () => {
      const onClick = vi.fn();
      render(<SearchTrigger onClick={onClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Keyboard Shortcut Display', () => {
    it('should show keyboard shortcut hint', () => {
      const onClick = vi.fn();
      render(<SearchTrigger onClick={onClick} />);

      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('should show Ctrl key for non-Mac', () => {
      // Mock non-Mac platform
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        configurable: true,
      });

      const onClick = vi.fn();
      render(<SearchTrigger onClick={onClick} />);

      expect(screen.getByText('Ctrl')).toBeInTheDocument();
    });

    it('should show command key for Mac', () => {
      // Mock Mac platform
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      const onClick = vi.fn();
      render(<SearchTrigger onClick={onClick} />);

      expect(screen.getByText('⌘')).toBeInTheDocument();
    });

    it('should have title with shortcut info', () => {
      const onClick = vi.fn();
      render(<SearchTrigger onClick={onClick} />);

      const button = screen.getByRole('button');
      expect(button.getAttribute('title')).toMatch(/Search \((⌘|Ctrl)\+K\)/);
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const onClick = vi.fn();
      render(<SearchTrigger onClick={onClick} className="custom-class" />);

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should have base styling classes', () => {
      const onClick = vi.fn();
      render(<SearchTrigger onClick={onClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('flex', 'items-center', 'gap-2', 'rounded-lg');
    });
  });
});
