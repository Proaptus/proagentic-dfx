'use client';

/**
 * ThemeToggle Component - Dark Mode Switcher
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 *
 * Features:
 * - Dropdown menu with Light/Dark/System options
 * - Visual icons for each theme option
 * - Keyboard navigation support
 * - Accessible with proper ARIA labels
 * - Smooth transitions and animations
 */

import { useTheme } from '@/lib/theme/ThemeProvider';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

// Icon components for theme options
function SunIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const options = [
    { value: 'light' as const, label: 'Light', icon: <SunIcon /> },
    { value: 'dark' as const, label: 'Dark', icon: <MoonIcon /> },
    { value: 'system' as const, label: 'System', icon: <MonitorIcon /> },
  ];

  const currentIcon = theme === 'light' ? <SunIcon /> :
                      theme === 'dark' ? <MoonIcon /> :
                      <MonitorIcon />;

  return (
    <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn("relative", className)}
      >
        {currentIcon}
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="theme-menu"
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setTheme(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-2.5 text-left text-sm flex items-center gap-3
                transition-colors duration-150
                ${theme === option.value
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }
              `}
              role="menuitem"
              aria-current={theme === option.value ? 'true' : undefined}
            >
              <span className={theme === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
                {option.icon}
              </span>
              <span className="font-medium">{option.label}</span>
              {theme === option.value && (
                <svg
                  className="ml-auto h-4 w-4 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
