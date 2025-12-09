'use client';

/**
 * Search Trigger Button
 * Displays a clickable search button with keyboard hint
 * Opens the Global Search modal when clicked
 */

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchTriggerProps {
  onClick: () => void;
  className?: string;
}

export function SearchTrigger({ onClick, className }: SearchTriggerProps) {
  // Detect OS for displaying correct keyboard shortcut
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg',
        'bg-slate-50 hover:bg-slate-100 border border-slate-200',
        'text-slate-500 hover:text-slate-900',
        'transition-all duration-200 ease-out',
        'group',
        className
      )}
      aria-label="Open search"
      title={`Search (${shortcutKey}+K)`}
    >
      <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
      <span className="text-sm text-slate-500 group-hover:text-slate-700">Search...</span>
      <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 ml-auto text-xs font-mono bg-white border border-slate-200 rounded text-slate-500">
        <span className="text-[10px]">{shortcutKey}</span>
        <span className="text-[10px]">K</span>
      </kbd>
    </button>
  );
}
