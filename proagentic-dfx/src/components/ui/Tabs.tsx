'use client';

/**
 * Tabs Component - Professional tab navigation
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

import { cn } from '@/lib/utils';
import { useState, type HTMLAttributes, type ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'horizontal' | 'vertical';
}

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  variant = 'horizontal',
  className,
  ...props
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.disabled) return;

    setActiveTab(tabId);
    onChange?.(tabId);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, _currentIndex: number) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentEnabledIndex = enabledTabs.findIndex((t) => t.id === activeTab);

    let nextIndex = currentEnabledIndex;

    if (variant === 'horizontal') {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = currentEnabledIndex > 0 ? currentEnabledIndex - 1 : enabledTabs.length - 1;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = currentEnabledIndex < enabledTabs.length - 1 ? currentEnabledIndex + 1 : 0;
      }
    } else {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = currentEnabledIndex > 0 ? currentEnabledIndex - 1 : enabledTabs.length - 1;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = currentEnabledIndex < enabledTabs.length - 1 ? currentEnabledIndex + 1 : 0;
      }
    }

    if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = enabledTabs.length - 1;
    }

    if (nextIndex !== currentEnabledIndex) {
      handleTabChange(enabledTabs[nextIndex].id);
    }
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  if (variant === 'vertical') {
    return (
      <div
        className={cn('flex gap-6', className)}
        {...props}
      >
        {/* Vertical Tab List */}
        <div
          className="flex flex-col min-w-[200px] border-r border-gray-200"
          role="tablist"
          aria-orientation="vertical"
        >
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                aria-disabled={tab.disabled}
                tabIndex={isActive ? 0 : -1}
                disabled={tab.disabled}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors border-r-2',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                  tab.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-600'
                )}
              >
                {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                <span className="flex-1">{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Panel */}
        <div
          className="flex-1"
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={activeTab}
        >
          {activeTabContent}
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={cn('w-full', className)} {...props}>
      {/* Horizontal Tab List */}
      <div className="border-b border-gray-200">
        <nav
          className="-mb-px flex space-x-8"
          aria-label="Tabs"
          role="tablist"
        >
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                aria-disabled={tab.disabled}
                tabIndex={isActive ? 0 : -1}
                disabled={tab.disabled}
                className={cn(
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300',
                  tab.disabled && 'opacity-50 cursor-not-allowed hover:border-transparent hover:text-gray-600'
                )}
              >
                {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panel */}
      <div
        className="py-4"
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={activeTab}
      >
        {activeTabContent}
      </div>
    </div>
  );
}
