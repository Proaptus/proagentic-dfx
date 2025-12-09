'use client';

/**
 * Global Search Component - Command Palette
 * Keyboard shortcut: Cmd+K (Mac) / Ctrl+K (Windows)
 *
 * Features:
 * - Search across requirements, materials, designs, and screens
 * - Keyboard navigation (arrow keys, enter to select, escape to close)
 * - Recent searches tracking
 * - Categorized results with icons
 * - Accessible with ARIA attributes
 * - Dark mode support
 * - Highlight matching text
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/stores/app-store';
import type { Screen } from '@/lib/types';
import {
  indexRequirements,
  indexDesigns,
  indexScreens,
  indexMaterials,
  searchIndex,
  groupByCategory,
  type SearchResult,
} from '@/lib/search/searchIndex';
import { cn } from '@/lib/utils';
import {
  Search,
  FileText,
  Box,
  Sparkles,
  Navigation,
  ArrowRight,
  Clock,
  X,
} from 'lucide-react';

const RECENT_SEARCHES_KEY = 'h2-tank-recent-searches';
const MAX_RECENT = 5;

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const {
    requirements,
    paretoFront,
    setScreen,
    setCurrentDesign,
  } = useAppStore();

  // Check if user can navigate to a screen
  const canNavigate = useCallback(
    (screen: Screen): boolean => {
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
          return (paretoFront?.length ?? 0) > 0;
        default:
          return false;
      }
    },
    [requirements, paretoFront]
  );

  // Build search index
  const searchIndexData = useMemo(() => {
    const requirementsIndex = indexRequirements(requirements, () =>
      setScreen('requirements')
    );
    const designsIndex = indexDesigns(paretoFront, setCurrentDesign, () =>
      setScreen('viewer')
    );
    const screensIndex = indexScreens(setScreen, canNavigate);
    const materialsIndex = indexMaterials(() => setScreen('requirements'));

    return [...requirementsIndex, ...designsIndex, ...screensIndex, ...materialsIndex];
  }, [requirements, paretoFront, setScreen, setCurrentDesign, canNavigate]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const recent = JSON.parse(stored);
        setRecentSearches(recent);
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchIndex(query, searchIndexData).slice(0, 20); // Limit to 20 results
  }, [query, searchIndexData]);

  // Group results by category
  const groupedResults = useMemo(() => {
    return groupByCategory(results);
  }, [results]);

  // All categories in display order
  const categories = useMemo(() => {
    return ['Navigation', 'Requirements', 'Designs', 'Materials'];
  }, []);

  // Flatten results for keyboard navigation
  const flatResults = useMemo(() => {
    if (query.trim() === '') {
      return recentSearches;
    }
    return categories.flatMap((cat) => groupedResults[cat] || []);
  }, [query, categories, groupedResults, recentSearches]);

  // Handle result selection (defined before keyboard handler that uses it)
  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      // Execute action
      result.action();

      // Add to recent searches
      const updated = [
        result,
        ...recentSearches.filter((r) => r.id !== result.id),
      ].slice(0, MAX_RECENT);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));

      // Close modal
      onClose();
    },
    [recentSearches, onClose]
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatResults[selectedIndex]) {
            handleSelectResult(flatResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, flatResults, onClose, handleSelectResult]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && isOpen) {
      const selectedElement = resultsRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Category icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Navigation':
        return <Navigation className="w-4 h-4" />;
      case 'Requirements':
        return <FileText className="w-4 h-4" />;
      case 'Designs':
        return <Box className="w-4 h-4" />;
      case 'Materials':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  // Highlight matching text
  const highlightText = (text: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-blue-200 text-blue-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-title"
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search requirements, materials, designs, or navigate..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 text-base bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
            aria-label="Search"
            id="search-title"
          />
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close search"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          className="max-h-[60vh] overflow-y-auto overscroll-contain"
        >
          {query.trim() === '' && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                Recent Searches
              </div>
              {recentSearches.map((result, index) => (
                <button
                  key={result.id}
                  data-index={index}
                  onClick={() => handleSelectResult(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    selectedIndex === index
                      ? 'bg-blue-50 border-l-2 border-blue-500'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <span className="text-lg">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {result.title}
                    </div>
                    {result.description && (
                      <div className="text-sm text-gray-500 truncate">
                        {result.description}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {query.trim() !== '' && results.length === 0 && (
            <div className="py-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No results found for &quot;{query}&quot;</p>
              <p className="text-gray-400 text-xs mt-1">
                Try different keywords or check your spelling
              </p>
            </div>
          )}

          {query.trim() !== '' &&
            categories.map((category) => {
              const categoryResults = groupedResults[category] || [];
              if (categoryResults.length === 0) return null;

              const startIndex = categories
                .slice(0, categories.indexOf(category))
                .reduce((sum, cat) => sum + (groupedResults[cat]?.length || 0), 0);

              return (
                <div key={category} className="py-2">
                  <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {getCategoryIcon(category)}
                    {category}
                  </div>
                  {categoryResults.map((result, index) => {
                    const globalIndex = startIndex + index;
                    return (
                      <button
                        key={result.id}
                        data-index={globalIndex}
                        onClick={() => handleSelectResult(result)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                          selectedIndex === globalIndex
                            ? 'bg-blue-50 border-l-2 border-blue-500'
                            : 'hover:bg-gray-50'
                        )}
                      >
                        <span className="text-lg">{result.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {highlightText(result.title)}
                          </div>
                          {result.description && (
                            <div className="text-sm text-gray-500 truncate">
                              {highlightText(result.description)}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              );
            })}
        </div>

        {/* Footer with keyboard hints */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-mono shadow-sm">
                  ↑↓
                </kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-mono shadow-sm">
                  Enter
                </kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-mono shadow-sm">
                  Esc
                </kbd>
                <span>Close</span>
              </div>
            </div>
            <div className="text-gray-400">
              {results.length > 0 && `${results.length} result${results.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
