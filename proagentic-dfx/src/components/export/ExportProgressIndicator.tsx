'use client';

/**
 * ExportProgressIndicator Component
 * Displays export generation progress with file-level status
 *
 * Features:
 * - Animated progress bar
 * - Per-file status tracking
 * - Accessible progress announcements
 * - Time remaining estimation
 */

import { CheckCircle } from 'lucide-react';
import { memo, useMemo } from 'react';

interface ExportProgressIndicatorProps {
  progressPercent: number;
  selections: Record<string, string[]>;
  status?: string; // Optional: for future enhancements
}

interface FileProgressItem {
  id: string;
  label: string;
  isComplete: boolean;
  isGenerating: boolean;
}

export const ExportProgressIndicator = memo(function ExportProgressIndicator({
  progressPercent,
  selections,
}: ExportProgressIndicatorProps) {
  const fileProgressItems = useMemo(() => {
    const allItems = Object.values(selections).flat();

    return allItems.map((item, index): FileProgressItem => {
      const totalItems = allItems.length;
      const itemProgress = (index / totalItems) * 100;
      const itemProgressEnd = ((index + 1) / totalItems) * 100;

      return {
        id: item,
        label: item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        isComplete: progressPercent >= itemProgressEnd,
        isGenerating: progressPercent >= itemProgress && progressPercent < itemProgressEnd,
      };
    });
  }, [selections, progressPercent]);

  const estimatedTimeRemaining = useMemo(() => {
    return Math.ceil((100 - progressPercent) / 10);
  }, [progressPercent]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-gray-900">Generating Export Package...</span>
        <span className="text-blue-600 font-bold">{progressPercent}%</span>
      </div>

      {/* Progress bar with accessibility */}
      <div
        className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Export progress: ${progressPercent}% complete`}
      >
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" aria-hidden="true"></div>
        </div>
      </div>

      {/* File list being generated */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 max-h-48 overflow-y-auto border border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" aria-hidden="true"></div>
          Files being generated:
        </div>
        <div className="space-y-2" role="list" aria-label="Files being exported">
          {fileProgressItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 text-xs bg-white rounded px-3 py-2 border border-gray-200"
              role="listitem"
            >
              {item.isComplete ? (
                <CheckCircle size={14} className="text-green-500 flex-shrink-0" aria-label="Complete" />
              ) : item.isGenerating ? (
                <div
                  className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"
                  aria-label="Generating"
                />
              ) : (
                <div
                  className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full flex-shrink-0"
                  aria-label="Pending"
                />
              )}
              <span
                className={`font-medium ${
                  item.isComplete
                    ? 'text-green-700'
                    : item.isGenerating
                    ? 'text-blue-700'
                    : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated time */}
      <div
        className="text-xs text-gray-500 text-center bg-gray-50 rounded-lg py-2 font-medium"
        role="status"
        aria-live="polite"
      >
        Estimated time remaining: {estimatedTimeRemaining}s
      </div>
    </div>
  );
});
