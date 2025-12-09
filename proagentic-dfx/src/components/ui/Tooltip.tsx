'use client';

/**
 * Tooltip Component - Engineering tooltips with rich content
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import { type ReactNode, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: ReactNode;
  children?: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  theme?: 'light' | 'dark';
  variant?: 'default' | 'help';
  maxWidth?: string;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'auto',
  delay = 200,
  theme = 'dark',
  variant = 'default',
  maxWidth = '320px',
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState<
    'top' | 'bottom' | 'left' | 'right'
  >(() => (position === 'auto' ? 'top' : position));
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate best position when position is 'auto'
  useEffect(() => {
    if (position === 'auto' && isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate available space in each direction
      const spaceTop = triggerRect.top;
      const spaceBottom = viewportHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;

      // Determine best position
      if (spaceTop >= tooltipRect.height) {
        setActualPosition('top');
      } else if (spaceBottom >= tooltipRect.height) {
        setActualPosition('bottom');
      } else if (spaceRight >= tooltipRect.width) {
        setActualPosition('right');
      } else if (spaceLeft >= tooltipRect.width) {
        setActualPosition('left');
      } else {
        setActualPosition('top'); // Default to top if no space
      }
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2',
    left: 'right-[-4px] top-1/2 -translate-y-1/2',
    right: 'left-[-4px] top-1/2 -translate-y-1/2',
  };

  const themeStyles = {
    dark: 'bg-gray-900 text-white border-gray-900',
    light: 'bg-white text-gray-900 border-gray-200 shadow-lg',
  };

  const arrowThemeStyles = {
    dark: 'bg-gray-900',
    light: 'bg-white border-gray-200',
  };

  const trigger =
    variant === 'help' ? (
      <button
        className="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    ) : (
      children
    );

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {trigger}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-2 text-sm rounded-lg border pointer-events-none',
            positionStyles[actualPosition],
            themeStyles[theme]
          )}
          style={{ maxWidth }}
        >
          {content}
          <div
            className={cn(
              'absolute w-2 h-2 transform rotate-45',
              arrowStyles[actualPosition],
              arrowThemeStyles[theme],
              theme === 'light' && actualPosition === 'top' && 'border-r border-b',
              theme === 'light' && actualPosition === 'bottom' && 'border-l border-t',
              theme === 'light' && actualPosition === 'left' && 'border-t border-r',
              theme === 'light' && actualPosition === 'right' && 'border-b border-l'
            )}
          />
        </div>
      )}
    </div>
  );
}

/**
 * TooltipTable - Specialized tooltip for displaying tabular data
 */
interface TooltipTableProps {
  data: Array<{ label: string; value: string | number }>;
  children?: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
}

export function TooltipTable({
  data,
  children,
  position = 'auto',
  delay = 200,
}: TooltipTableProps) {
  return (
    <Tooltip
      position={position}
      delay={delay}
      theme="light"
      maxWidth="400px"
      content={
        <table className="min-w-full text-xs">
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  index !== data.length - 1 && 'border-b border-gray-200'
                )}
              >
                <td className="py-1 pr-4 font-medium text-gray-700">
                  {row.label}
                </td>
                <td className="py-1 text-right text-gray-900 font-mono">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      {children}
    </Tooltip>
  );
}

/**
 * TooltipEquation - Specialized tooltip for displaying equations
 */
interface TooltipEquationProps {
  equation: string;
  description?: string;
  children?: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
}

export function TooltipEquation({
  equation,
  description,
  children,
  position = 'auto',
  delay = 200,
}: TooltipEquationProps) {
  return (
    <Tooltip
      position={position}
      delay={delay}
      theme="light"
      maxWidth="400px"
      content={
        <div className="space-y-2">
          {description && (
            <p className="text-xs text-gray-600">{description}</p>
          )}
          <div className="font-mono text-sm bg-gray-50 px-3 py-2 rounded border border-gray-200">
            {equation}
          </div>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
}

/**
 * Simple tooltip components for help system compatibility
 */
interface TooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
}

export function TooltipProvider({ children, delayDuration: _delayDuration = 200 }: TooltipProviderProps) {
  // Simple provider wrapper - could store delay in context
  return <>{children}</>;
}

interface TooltipRootProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TooltipRoot({ children, open, onOpenChange }: TooltipRootProps) {
  const [_isOpen, setIsOpen] = useState(open ?? false);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => handleOpenChange(true)}
      onMouseLeave={() => handleOpenChange(false)}
    >
      {children}
    </div>
  );
}

interface TooltipTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export function TooltipTrigger({ children, asChild: _asChild }: TooltipTriggerProps) {
  return <>{children}</>;
}

interface TooltipContentProps {
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function TooltipContent({ children, side = 'top', className = '' }: TooltipContentProps) {
  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      role="tooltip"
      className={cn(
        'absolute z-50 px-3 py-2 text-sm rounded-lg border pointer-events-none',
        'bg-gray-900 text-white border-gray-900',
        positionStyles[side],
        className
      )}
    >
      {children}
    </div>
  );
}
