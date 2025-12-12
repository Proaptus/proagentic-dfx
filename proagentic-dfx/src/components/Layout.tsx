'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { useDomainStore } from '@/lib/stores/domain-store';
import { listDomains } from '@/lib/domains';
import type { Screen } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SkipLink } from './ui/SkipLink';
import { AppHeader } from './AppHeader';
import { GlobalSearch } from './ui/GlobalSearch';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import {
  FileText,
  BarChart3,
  Box,
  GitCompare,
  Activity,
  Shield,
  CheckCircle,
  Download,
  Eye,
  ChevronDown,
} from 'lucide-react';

// Organized navigation with section groupings
const navSections = [
  {
    title: 'Design',
    items: [
      { id: 'requirements' as Screen, label: 'Requirements', icon: <FileText size={20} /> },
      { id: 'pareto' as Screen, label: 'Pareto Explorer', icon: <BarChart3 size={20} /> },
      { id: 'viewer' as Screen, label: '3D Viewer', icon: <Box size={20} /> },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { id: 'compare' as Screen, label: 'Compare', icon: <GitCompare size={20} /> },
      { id: 'analysis' as Screen, label: 'Analysis', icon: <Activity size={20} /> },
    ],
  },
  {
    title: 'Validation',
    items: [
      { id: 'compliance' as Screen, label: 'Compliance', icon: <Shield size={20} /> },
      { id: 'validation' as Screen, label: 'Validation', icon: <CheckCircle size={20} /> },
    ],
  },
  {
    title: 'Output',
    items: [
      { id: 'export' as Screen, label: 'Export', icon: <Download size={20} /> },
      { id: 'sentry' as Screen, label: 'Sentry Mode', icon: <Eye size={20} /> },
    ],
  },
];

// Module configuration with availability status
const MODULE_CONFIG: Record<string, { available: boolean; icon: string }> = {
  'h2-tank': { available: true, icon: 'H2' },
  'pressure-vessel': { available: false, icon: 'PV' },
};

function ModuleSelector() {
  const { currentDomain, setDomain } = useDomainStore();
  const domains = listDomains();
  const [open, setOpen] = useState(false);

  const getModuleConfig = (id: string) => MODULE_CONFIG[id] || { available: false, icon: '?' };

  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
        Active Module
      </label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-600"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white text-xs font-bold">
            {getModuleConfig(currentDomain.id).icon}
          </div>
          <span className="font-medium text-slate-100 text-sm">{currentDomain.name}</span>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-slate-300 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="mt-2 rounded-lg overflow-hidden border border-slate-600">
          {domains.map((domain) => {
            const config = getModuleConfig(domain.id);
            const isSelected = domain.id === currentDomain.id;
            return (
              <button
                key={domain.id}
                onClick={() => {
                  if (config.available) {
                    setDomain(domain.id);
                    setOpen(false);
                  }
                }}
                disabled={!config.available}
                className={cn(
                  'w-full px-3 py-2 text-left flex items-center gap-2',
                  isSelected ? 'bg-slate-700' : 'bg-slate-800',
                  config.available ? 'hover:bg-slate-700' : 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded flex items-center justify-center text-xs font-bold',
                  config.available ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-slate-400'
                )}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm', config.available ? 'text-slate-100' : 'text-slate-400')}>
                      {domain.name}
                    </span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {!config.available && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">Soon</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentScreen, setScreen, requirements, paretoFront, currentDesign } =
    useAppStore();
  const { currentDomain: _currentDomain } = useDomainStore();
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Track dev mode after hydration to prevent server/client mismatch
  const [isDevMode, setIsDevMode] = useState(false);

  // Initialize dev mode detection after hydration
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && window.location.search.includes('dev=true')) {
      setIsDevMode(true);
    }
  }, []);

  const canNavigate = useCallback((screen: Screen): boolean => {
    // Dev mode bypass: allow all navigation in development (after hydration)
    if (isDevMode) {
      return true;
    }

    switch (screen) {
      case 'requirements':
        return true;
      case 'pareto':
        return !!requirements;
      case 'viewer':
      case 'compare':
      case 'analysis':
      case 'compliance':
      case 'validation':
      case 'export':
      case 'sentry':
        return (paretoFront?.length ?? 0) > 0 || !!currentDesign;
      default:
        return false;
    }
  }, [isDevMode, requirements, paretoFront, currentDesign]);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard shortcuts
  const handleToggleHelp = useCallback(() => {
    setHelpOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setHelpOpen(false);
  }, []);

  const handleNavigate = useCallback((screen: Screen) => {
    if (canNavigate(screen)) {
      setScreen(screen);
    }
  }, [canNavigate, setScreen]);

  useKeyboardShortcuts({
    onToggleHelp: handleToggleHelp,
    onClose: handleClose,
    onNavigate: handleNavigate,
  });

  return (
    <>
      <SkipLink />
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
        {/* Application Header */}
        <AppHeader onHelpClick={handleToggleHelp} onSearchClick={() => setSearchOpen(true)} />

        {/* Help Panel Overlay */}
        {helpOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose}>
            <div
              className="fixed right-0 top-14 bottom-0 w-96 bg-white shadow-xl z-50 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Keyboard Shortcuts</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span>Toggle Help</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">?</kbd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Close Panel</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Requirements</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">1</kbd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Pareto Explorer</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">2</kbd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>3D Viewer</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">3</kbd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Compare</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">4</kbd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Analysis</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">5</kbd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Compliance</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">6</kbd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Validation</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">7</kbd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Export</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">8</kbd>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Sentry Mode</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">9</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex min-h-0">
          {/* Enterprise Sidebar */}
          <aside
            className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto"
            aria-label="Main navigation"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-slate-800">
              <h1 className="text-xl font-bold text-slate-100">ProAgentic DfX</h1>
              <p className="text-sm text-slate-300 mt-1">Agentic Manufacturing Design Platform</p>
            </div>

            {/* Module Selector */}
            <div className="px-4 py-3">
              <ModuleSelector />
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 px-3 py-2">
              {navSections.map((section, sectionIndex) => (
                <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
                  {/* Section Header */}
                  <div className="px-3 mb-2">
                    <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      {section.title}
                    </h2>
                  </div>

                  {/* Section Items */}
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const enabled = canNavigate(item.id);
                      const isActive = currentScreen === item.id;

                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => enabled && setScreen(item.id)}
                            disabled={!enabled}
                            aria-current={isActive ? 'page' : undefined}
                            suppressHydrationWarning
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-150 relative group',
                              {
                                // Active state with left border indicator
                                'bg-slate-800 text-slate-100 font-medium': isActive,
                                // Hover state for enabled items
                                'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100':
                                  !isActive && enabled,
                                // Disabled state
                                'text-slate-600 cursor-not-allowed': !enabled,
                              }
                            )}
                          >
                            {/* Active indicator - left border */}
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
                            )}

                            {/* Icon with opacity transition */}
                            <span
                              suppressHydrationWarning
                              className={cn(
                                'transition-opacity',
                                isActive ? 'opacity-100' : enabled ? 'opacity-70 group-hover:opacity-100' : 'opacity-40'
                              )}
                            >
                              {item.icon}
                            </span>

                            {/* Label */}
                            <span className="text-sm">{item.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Section divider (except for last section) */}
                  {sectionIndex < navSections.length - 1 && (
                    <div className="mt-3 mx-3 h-px bg-slate-800" />
                  )}
                </div>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <div className="text-xs text-slate-400">
                <p className="font-medium text-slate-300">Innovate UK AI Pioneers</p>
                <p className="mt-1">Demo Version</p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main id="main-content" className="flex-1 flex flex-col min-h-0 overflow-hidden" role="main">
            <div className="flex-1 overflow-y-auto p-8 flex flex-col">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
