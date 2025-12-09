'use client';

import { useAppStore } from '@/lib/stores/app-store';
import { HelpCircle, Settings, ChevronRight, Undo2, Redo2, Save, Cloud } from 'lucide-react';
import type { Screen } from '@/lib/types';
import { SearchTrigger } from './ui/SearchTrigger';
import { ThemeToggle } from './ui/ThemeToggle';
import { useEffect, useState } from 'react';

const SCREEN_LABELS: Record<Screen, string> = {
  requirements: 'Requirements',
  pareto: 'Pareto Explorer',
  viewer: '3D Viewer',
  compare: 'Compare',
  analysis: 'Analysis',
  compliance: 'Compliance',
  validation: 'Validation',
  export: 'Export',
  sentry: 'Sentry Mode'
};

interface AppHeaderProps {
  onHelpClick?: () => void;
  onSettingsClick?: () => void;
  onSearchClick?: () => void;
}

export function AppHeader({ onHelpClick, onSettingsClick, onSearchClick }: AppHeaderProps) {
  const { currentScreen, undo, redo, canUndo, canRedo, _historyIndex, _history } = useAppStore();

  const undoAvailable = canUndo();
  const redoAvailable = canRedo();

  // Auto-save indicator state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Listen for store changes and show save indicator
  useEffect(() => {
    const unsubscribe = useAppStore.subscribe(() => {
      setSaveStatus('saving');
      const timer = setTimeout(() => setSaveStatus('saved'), 500);
      return () => clearTimeout(timer);
    });
    return unsubscribe;
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          if (redoAvailable) redo();
        } else {
          e.preventDefault();
          if (undoAvailable) undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        if (redoAvailable) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoAvailable, redoAvailable, undo, redo]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm shrink-0 z-10 relative">
      {/* Left: Logo/Brand Area */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Professional Logo Badge */}
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md ring-1 ring-blue-400/20">
            <span className="text-white font-bold text-base tracking-tight">H₂</span>
          </div>

          {/* App Title */}
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              ProAgentic DfX
            </h1>
            <span className="text-xs text-slate-500 font-medium">
              H2 Tank Designer Module
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-slate-200" />
      </div>

      {/* Center: Search + Workflow Breadcrumb */}
      <div className="flex items-center gap-4">
        {/* Global Search Trigger */}
        <SearchTrigger onClick={() => onSearchClick?.()} />

        {/* Workflow Breadcrumb */}
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Workflow
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm font-semibold text-blue-400">
            {SCREEN_LABELS[currentScreen]}
          </span>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-1.5">
        {/* Auto-Save Status Indicator */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
          title={saveStatus === 'saved' ? 'All changes saved' : 'Saving...'}
          aria-live="polite"
        >
          {saveStatus === 'saved' ? (
            <>
              <Cloud className="w-4 h-4 text-green-500" />
              <span className="text-slate-500 hidden sm:inline">Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-slate-500 hidden sm:inline">Saving...</span>
            </>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Undo Button */}
        <button
          onClick={() => undoAvailable && undo()}
          disabled={!undoAvailable}
          className={`group p-2 rounded-lg transition-all duration-200 ease-out ${
            undoAvailable
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-300 cursor-not-allowed'
          }`}
          title={`Undo (Ctrl+Z)${undoAvailable ? ` - ${_historyIndex} step${_historyIndex > 1 ? 's' : ''}` : ''}`}
          aria-label="Undo last action"
          aria-disabled={!undoAvailable}
        >
          <Undo2 className="w-4.5 h-4.5" />
        </button>

        {/* Redo Button */}
        <button
          onClick={() => redoAvailable && redo()}
          disabled={!redoAvailable}
          className={`group p-2 rounded-lg transition-all duration-200 ease-out ${
            redoAvailable
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-300 cursor-not-allowed'
          }`}
          title={`Redo (Ctrl+Shift+Z)${redoAvailable ? ` - ${_history.length - _historyIndex - 1} step${_history.length - _historyIndex - 1 > 1 ? 's' : ''}` : ''}`}
          aria-label="Redo last action"
          aria-disabled={!redoAvailable}
        >
          <Redo2 className="w-4.5 h-4.5" />
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Theme Toggle */}
        <ThemeToggle className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 ease-out" />

        {/* Help Button */}
        <button
          onClick={onHelpClick}
          className="group p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 ease-out"
          title="Help (Press '?')"
          aria-label="Open help"
        >
          <HelpCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>

        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          className="group p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 ease-out"
          title="Settings"
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
        </button>
      </div>
    </header>
  );
}
