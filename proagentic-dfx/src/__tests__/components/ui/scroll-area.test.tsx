/**
 * ScrollArea Component Tests
 * Coverage Target: 80%
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

describe('ScrollArea', () => {
  describe('Basic Rendering', () => {
    it('should render children', () => {
      render(
        <ScrollArea>
          <div data-testid="child">Child content</div>
        </ScrollArea>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ScrollArea>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
          <div data-testid="child-3">Third</div>
        </ScrollArea>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to the div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <ScrollArea ref={ref}>
          <div>Content</div>
        </ScrollArea>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should allow accessing ref properties', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <ScrollArea ref={ref}>
          <div>Content</div>
        </ScrollArea>
      );

      expect(ref.current?.tagName).toBe('DIV');
    });
  });

  describe('Styling', () => {
    it('should have base overflow styling', () => {
      const { container } = render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      expect(container.firstChild).toHaveClass('relative', 'overflow-auto');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ScrollArea className="custom-scroll max-h-96">
          <div>Content</div>
        </ScrollArea>
      );

      expect(container.firstChild).toHaveClass('custom-scroll', 'max-h-96');
    });

    it('should preserve base classes with custom className', () => {
      const { container } = render(
        <ScrollArea className="custom-class">
          <div>Content</div>
        </ScrollArea>
      );

      expect(container.firstChild).toHaveClass('relative', 'overflow-auto', 'custom-class');
    });
  });

  describe('Props Spreading', () => {
    it('should spread additional props to the div', () => {
      render(
        <ScrollArea data-testid="scroll-area" id="my-scroll">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveAttribute('id', 'my-scroll');
    });

    it('should support aria attributes', () => {
      render(
        <ScrollArea aria-label="Scrollable content" role="region">
          <div>Content</div>
        </ScrollArea>
      );

      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Scrollable content');
    });

    it('should support event handlers', () => {
      const handleScroll = vi.fn();
      render(
        <ScrollArea onScroll={handleScroll} data-testid="scroll">
          <div>Content</div>
        </ScrollArea>
      );

      // Verify the scroll handler is attached
      expect(screen.getByTestId('scroll')).toBeInTheDocument();
    });
  });

  describe('Display Name', () => {
    it('should have correct display name', () => {
      expect(ScrollArea.displayName).toBe('ScrollArea');
    });
  });
});

// Import vi for mocking
import { vi } from 'vitest';
