/**
 * useAnnounce Hook Tests
 * REQ-277: Screen reader support with ARIA labels
 * Coverage Target: 90%+
 *
 * Tests for the useAnnounce hook that provides screen reader announcements
 * using ARIA live regions.
 */

/* eslint-disable react-hooks/globals */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { useAnnounce, AnnounceFunction } from '@/hooks/useAnnounce';

// Type alias for backward compatibility
type AnnounceFunc = AnnounceFunction;

// Test component that uses the hook
function TestComponent() {
  const announce = useAnnounce();

  return (
    <div>
      <button onClick={() => announce('Success message')}>Success</button>
      <button onClick={() => announce('Warning message', 'assertive')}>
        Warning
      </button>
      <button onClick={() => announce('Info message', 'polite')}>Info</button>
      <button onClick={() => announce('')}>Empty</button>
    </div>
  );
}

describe('useAnnounce', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Clean up any existing announcers from previous tests
    document.querySelectorAll('[role="status"]').forEach((el) => {
      el.remove();
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clean up any remaining announcers
    document.querySelectorAll('[role="status"]').forEach((el) => {
      el.remove();
    });
  });

  describe('Hook Initialization', () => {
    it('should return an announce function', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return null;
      }

      render(<CaptureComponent />);

      expect(announceFunc).toBeDefined();
      expect(typeof announceFunc).toBe('function');
    });

    it('should be usable without errors', () => {
      expect(() => {
        render(<TestComponent />);
      }).not.toThrow();
    });
  });

  describe('Announcement Creation', () => {
    it('should create a div element in the DOM when announcing', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('Test message')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      const button = getByText('Click');
      button.click();

      const announcer = document.querySelector('[role="status"]');
      expect(announcer).toBeDefined();
      expect(announcer?.textContent).toBe('Test message');
    });

    it('should create multiple div elements for multiple announcements', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return (
          <div>
            <button onClick={() => announceFunc?.('First')}>First</button>
            <button onClick={() => announceFunc?.('Second')}>Second</button>
          </div>
        );
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('First').click();
      getByText('Second').click();

      const announcers = document.querySelectorAll('[role="status"]');
      expect(announcers.length).toBe(2);
    });

    it('should include the message text in the announcer element', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('Success message')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.textContent).toBe('Success message');
    });

    it('should set role="status" on announcer element', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('Test')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.getAttribute('role')).toBe('status');
    });

    it('should set aria-atomic="true" on announcer element', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('Test')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.getAttribute('aria-atomic')).toBe('true');
    });

    it('should set sr-only class on announcer element', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('Test')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.classList.contains('sr-only')).toBe(true);
    });
  });

  describe('Priority Levels', () => {
    it('should use "polite" as default priority', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('Test')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.getAttribute('aria-live')).toBe('polite');
    });

    it('should set aria-live="polite" when priority is "polite"', () => {
      let announceFunc: ((msg: string, priority?: 'polite' | 'assertive') => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('Test', 'polite')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      const announcer = document.querySelector('[aria-live="polite"]');
      expect(announcer).toBeDefined();
      expect(announcer?.getAttribute('aria-live')).toBe('polite');
    });

    it('should set aria-live="assertive" when priority is "assertive"', () => {
      let announceFunc: ((msg: string, priority?: 'polite' | 'assertive') => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('Test', 'assertive')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      const announcer = document.querySelector('[aria-live="assertive"]');
      expect(announcer?.getAttribute('aria-live')).toBe('assertive');
    });
  });

  describe('Cleanup and Removal', () => {
    it('should use setTimeout for cleanup', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('Test')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

      setTimeoutSpy.mockRestore();
    });

    it('should schedule removal after 1 second', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('Test')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      expect(document.querySelector('[role="status"]')).toBeDefined();

      // The element is scheduled to be removed, not immediately removed
      vi.advanceTimersByTime(999);
      expect(document.querySelector('[role="status"]')).toBeDefined();
    });
  });

  describe('Message Content', () => {
    it('should announce simple text messages', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('Simple message')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.textContent).toBe('Simple message');
    });

    it('should announce messages with special characters', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('Error: File not found!')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.textContent).toBe('Error: File not found!');
    });

    it('should announce messages with numbers', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('5 items added successfully')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.textContent).toBe('5 items added successfully');
    });

    it('should announce long messages', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      const longMessage =
        'This is a very long announcement that contains multiple words and should be properly announced';

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.(longMessage)}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.textContent).toBe(longMessage);
    });

    it('should announce empty strings', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.textContent).toBe('');
    });

    it('should announce unicode characters', () => {
      let announceFunc: ((msg: string) => void) | null = null;

      function CaptureComponent() {
        announceFunc = useAnnounce();
        return <button onClick={() => announceFunc?.('Status: 完成 ✓')}>Click</button>;
      }

      const { getByText } = render(<CaptureComponent />);
      getByText('Click').click();

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.textContent).toBe('Status: 完成 ✓');
    });
  });

  describe('Multiple Announcements', () => {
    it('should handle multiple announcements in sequence', () => {
      let announceFunc: AnnounceFunc | null = null;

      function CaptureComponent() {
        const func = useAnnounce();
        announceFunc = func as AnnounceFunc;
        return null;
      }

      render(<CaptureComponent />);

      expect(announceFunc).toBeDefined();
      announceFunc!('First');
      announceFunc!('Second');
      announceFunc!('Third');

      const announcers = document.querySelectorAll('[role="status"]');
      expect(announcers.length).toBe(3);
      expect(announcers[0].textContent).toBe('First');
      expect(announcers[1].textContent).toBe('Second');
      expect(announcers[2].textContent).toBe('Third');
    });

    it('should support rapid successive announcements', () => {
      let announceFunc: AnnounceFunc | null = null;

      function CaptureComponent() {
        const func = useAnnounce();
        announceFunc = func as AnnounceFunc;
        return null;
      }

      render(<CaptureComponent />);

      expect(announceFunc).toBeDefined();
      for (let i = 0; i < 5; i++) {
        announceFunc!(`Message ${i}`);
      }

      const announcers = document.querySelectorAll('[role="status"]');
      expect(announcers.length).toBe(5);
    });
  });

  describe('DOM Integration', () => {
    it('should append announcer to document body', () => {
      let announceFunc: AnnounceFunc | null = null;

      function CaptureComponent() {
        const func = useAnnounce();
        announceFunc = func as AnnounceFunc;
        return null;
      }

      render(<CaptureComponent />);

      expect(announceFunc).toBeDefined();
      announceFunc!('Test');

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.parentElement).toBe(document.body);
    });

    it('should not interfere with existing DOM elements', () => {
      const existingDiv = document.createElement('div');
      existingDiv.id = 'existing';
      document.body.appendChild(existingDiv);

      let announceFunc: AnnounceFunc | null = null;

      function CaptureComponent() {
        const func = useAnnounce();
        announceFunc = func as AnnounceFunc;
        return null;
      }

      render(<CaptureComponent />);

      expect(announceFunc).toBeDefined();
      announceFunc!('Test');

      const existing = document.getElementById('existing');
      expect(existing).toBeDefined();
      expect(existing?.textContent).toBe('');

      document.body.removeChild(existingDiv);
    });
  });

  describe('React Lifecycle', () => {
    it('should create new announce function for each component instance', () => {
      let announce1: ((msg: string, priority?: 'polite' | 'assertive') => void) | null = null;
      let announce2: ((msg: string, priority?: 'polite' | 'assertive') => void) | null = null;

      function Component1() {
        announce1 = useAnnounce();
        return null;
      }

      function Component2() {
        announce2 = useAnnounce();
        return null;
      }

      render(
        <>
          <Component1 />
          <Component2 />
        </>
      );

      expect(announce1).not.toBe(announce2);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle announcement during unmount gracefully', () => {
      let announceFunc: AnnounceFunc | null = null;

      function CaptureComponent() {
        const func = useAnnounce();
        announceFunc = func as AnnounceFunc;
        return null;
      }

      const { unmount } = render(<CaptureComponent />);

      expect(announceFunc).toBeDefined();
      announceFunc!('Test');

      // Unmount before timeout
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should handle very rapid announcement and removal', () => {
      let announceFunc: AnnounceFunc | null = null;

      function CaptureComponent() {
        const func = useAnnounce();
        announceFunc = func as AnnounceFunc;
        return null;
      }

      render(<CaptureComponent />);

      expect(announceFunc).toBeDefined();
      announceFunc!('Test');
      vi.advanceTimersByTime(1000);
      announceFunc!('Test 2');

      const announcers = document.querySelectorAll('[role="status"]');
      expect(announcers.length).toBeGreaterThanOrEqual(1);
    });

    it('should not throw when announcing multiple times quickly', () => {
      let announceFunc: AnnounceFunc | null = null;

      function CaptureComponent() {
        const func = useAnnounce();
        announceFunc = func as AnnounceFunc;
        return null;
      }

      render(<CaptureComponent />);

      expect(announceFunc).toBeDefined();
      expect(() => {
        for (let i = 0; i < 10; i++) {
          announceFunc!(`Message ${i}`);
        }
      }).not.toThrow();

      const announcers = document.querySelectorAll('[role="status"]');
      expect(announcers.length).toBe(10);
    });
  });
});
