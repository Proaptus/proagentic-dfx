'use client';

/**
 * StressControlPanel Component
 * Controls for stress visualization including colormap selection and range adjustment
 *
 * Features:
 * - Colormap selector dropdown (jet, viridis, plasma, thermal, coolwarm)
 * - Min/Max stress range sliders with numeric inputs
 * - Auto/Manual range toggle
 * - Reset to defaults button
 * - Loading state support
 * - WCAG 2.1 AA accessibility compliant
 */

import { useState, useCallback, useEffect, useId } from 'react';
import { Activity, RotateCcw, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/** Available colormap options for stress visualization */
export type ColormapName = 'jet' | 'viridis' | 'plasma' | 'thermal' | 'coolwarm';

/** Colormap display information */
interface ColormapOption {
  id: ColormapName;
  label: string;
  description: string;
  gradient: string;
}

/** Props for StressControlPanel component */
export interface StressControlPanelProps {
  /** Currently selected colormap */
  colormap: ColormapName;
  /** Callback when colormap changes */
  onColormapChange: (colormap: ColormapName) => void;
  /** Current minimum stress value for display range */
  minValue: number;
  /** Current maximum stress value for display range */
  maxValue: number;
  /** Callback when stress range changes */
  onRangeChange: (min: number, max: number) => void;
  /** Whether auto-range is enabled (uses data bounds) */
  autoRange: boolean;
  /** Callback when auto-range toggle changes */
  onAutoRangeChange: (auto: boolean) => void;
  /** Minimum stress value from FEA data */
  dataMin: number;
  /** Maximum stress value from FEA data */
  dataMax: number;
  /** Whether stress data is currently loading */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/** Colormap options with visual gradients */
const COLORMAP_OPTIONS: ColormapOption[] = [
  {
    id: 'jet',
    label: 'Jet',
    description: 'Classic rainbow colormap (blue to red)',
    gradient: 'linear-gradient(to right, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF0000)',
  },
  {
    id: 'viridis',
    label: 'Viridis',
    description: 'Perceptually uniform (purple to yellow)',
    gradient: 'linear-gradient(to right, #440154, #31688E, #35B779, #FDE725)',
  },
  {
    id: 'plasma',
    label: 'Plasma',
    description: 'Perceptually uniform (purple to yellow)',
    gradient: 'linear-gradient(to right, #0D0887, #7E03A8, #CC4778, #F89540, #F0F921)',
  },
  {
    id: 'thermal',
    label: 'Thermal',
    description: 'Heat-map style (black to white)',
    gradient: 'linear-gradient(to right, #000000, #550000, #FF0000, #FFFF00, #FFFFFF)',
  },
  {
    id: 'coolwarm',
    label: 'Cool-Warm',
    description: 'Diverging colormap (blue to red)',
    gradient: 'linear-gradient(to right, #3B4CC0, #7B9FF9, #F7F7F7, #F4A582, #B40426)',
  },
];

/** Default stress range values */
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 1000;

export function StressControlPanel({
  colormap,
  onColormapChange,
  minValue,
  maxValue,
  onRangeChange,
  autoRange,
  onAutoRangeChange,
  dataMin,
  dataMax,
  isLoading = false,
  className,
}: StressControlPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localMin, setLocalMin] = useState(minValue);
  const [localMax, setLocalMax] = useState(maxValue);

  // Unique IDs for accessibility
  const baseId = useId();
  const minSliderId = `${baseId}-min-slider`;
  const maxSliderId = `${baseId}-max-slider`;
  const minInputId = `${baseId}-min-input`;
  const maxInputId = `${baseId}-max-input`;
  const colormapId = `${baseId}-colormap`;

  // Sync local state with props
  useEffect(() => {
    setLocalMin(minValue);
    setLocalMax(maxValue);
  }, [minValue, maxValue]);

  // Update range when auto-range is enabled
  useEffect(() => {
    if (autoRange && !isLoading) {
      onRangeChange(dataMin, dataMax);
    }
  }, [autoRange, dataMin, dataMax, isLoading, onRangeChange]);

  const selectedColormap = COLORMAP_OPTIONS.find((c) => c.id === colormap) || COLORMAP_OPTIONS[0];

  // Calculate slider bounds (extend beyond data range for manual adjustment)
  const sliderMin = Math.min(0, dataMin);
  const sliderMax = Math.max(dataMax * 1.5, DEFAULT_MAX);

  /** Handle colormap selection */
  const handleColormapSelect = useCallback(
    (id: ColormapName) => {
      onColormapChange(id);
      setDropdownOpen(false);
    },
    [onColormapChange]
  );

  /** Handle min slider change */
  const handleMinSliderChange = useCallback(
    (value: number) => {
      const clampedValue = Math.min(value, localMax - 1);
      setLocalMin(clampedValue);
      onRangeChange(clampedValue, localMax);
    },
    [localMax, onRangeChange]
  );

  /** Handle max slider change */
  const handleMaxSliderChange = useCallback(
    (value: number) => {
      const clampedValue = Math.max(value, localMin + 1);
      setLocalMax(clampedValue);
      onRangeChange(localMin, clampedValue);
    },
    [localMin, onRangeChange]
  );

  /** Handle min input change */
  const handleMinInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value) && value < localMax) {
        setLocalMin(value);
        onRangeChange(value, localMax);
      }
    },
    [localMax, onRangeChange]
  );

  /** Handle max input change */
  const handleMaxInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value) && value > localMin) {
        setLocalMax(value);
        onRangeChange(localMin, value);
      }
    },
    [localMin, onRangeChange]
  );

  /** Reset all values to defaults */
  const handleReset = useCallback(() => {
    onAutoRangeChange(true);
    onColormapChange('jet');
    if (dataMin !== undefined && dataMax !== undefined) {
      onRangeChange(dataMin, dataMax);
    } else {
      onRangeChange(DEFAULT_MIN, DEFAULT_MAX);
    }
  }, [onAutoRangeChange, onColormapChange, onRangeChange, dataMin, dataMax]);

  /** Format stress value for display */
  const formatStressValue = (value: number): string => {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)} GPa`;
    }
    return `${value.toFixed(1)} MPa`;
  };

  return (
    <Card className={cn('space-y-3', className)}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-700"
        aria-expanded={expanded}
        aria-label="Toggle stress visualization controls"
      >
        <span className="flex items-center gap-2">
          <Activity size={16} aria-hidden="true" />
          Stress Visualization Controls
          {isLoading && (
            <Loader2 size={14} className="animate-spin text-blue-500" aria-label="Loading stress data" />
          )}
        </span>
        {expanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>

      {expanded && (
        <>
          {/* Colormap Selector */}
          <div className="space-y-2">
            <label
              htmlFor={colormapId}
              className="text-xs font-medium text-gray-600 block"
            >
              Colormap
            </label>
            <div className="relative">
              <button
                id={colormapId}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={isLoading}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all',
                  'bg-white text-sm text-gray-700',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  isLoading
                    ? 'opacity-50 cursor-not-allowed border-gray-200'
                    : 'border-gray-300 hover:border-gray-400'
                )}
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
                aria-label={`Select colormap. Currently selected: ${selectedColormap.label}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-20 h-4 rounded"
                    style={{ background: selectedColormap.gradient }}
                    aria-hidden="true"
                  />
                  <span>{selectedColormap.label}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={cn('transition-transform', dropdownOpen && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                  role="listbox"
                  aria-label="Colormap options"
                >
                  {COLORMAP_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleColormapSelect(option.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                        option.id === colormap
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                      role="option"
                      aria-selected={option.id === colormap}
                    >
                      <div
                        className="w-20 h-4 rounded"
                        style={{ background: option.gradient }}
                        aria-hidden="true"
                      />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Range Mode Toggle */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600">Range Mode</div>
            <div className="flex gap-2" role="radiogroup" aria-label="Stress range mode">
              <button
                onClick={() => onAutoRangeChange(true)}
                disabled={isLoading}
                className={cn(
                  'flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                  autoRange
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
                role="radio"
                aria-checked={autoRange}
                aria-label="Auto range - uses data minimum and maximum"
              >
                Auto
              </button>
              <button
                onClick={() => onAutoRangeChange(false)}
                disabled={isLoading}
                className={cn(
                  'flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                  !autoRange
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
                role="radio"
                aria-checked={!autoRange}
                aria-label="Manual range - set custom minimum and maximum"
              >
                Manual
              </button>
            </div>
          </div>

          {/* Min/Max Range Controls */}
          <div className="space-y-3 bg-gray-50 rounded-lg p-3">
            {/* Min Stress */}
            <div className="space-y-1.5">
              <label
                htmlFor={minSliderId}
                className="text-xs font-medium text-gray-600 flex justify-between"
              >
                <span>Min Stress</span>
                <span className="font-mono text-gray-700">{formatStressValue(localMin)}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={minSliderId}
                  type="range"
                  min={sliderMin}
                  max={sliderMax}
                  step={(sliderMax - sliderMin) / 100}
                  value={localMin}
                  onChange={(e) => handleMinSliderChange(parseFloat(e.target.value))}
                  disabled={autoRange || isLoading}
                  className={cn(
                    'flex-1 h-2 rounded-lg appearance-none cursor-pointer',
                    'bg-gradient-to-r from-blue-200 to-blue-400',
                    '[&::-webkit-slider-thumb]:appearance-none',
                    '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
                    '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600',
                    '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer',
                    (autoRange || isLoading) && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-label="Minimum stress value slider"
                  aria-valuemin={sliderMin}
                  aria-valuemax={sliderMax}
                  aria-valuenow={localMin}
                  aria-valuetext={formatStressValue(localMin)}
                />
                <input
                  id={minInputId}
                  type="number"
                  value={localMin.toFixed(1)}
                  onChange={handleMinInputChange}
                  disabled={autoRange || isLoading}
                  className={cn(
                    'w-20 px-2 py-1 text-xs font-mono rounded border border-gray-300',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    (autoRange || isLoading) && 'opacity-50 cursor-not-allowed bg-gray-100'
                  )}
                  aria-label="Minimum stress value input"
                  step="0.1"
                />
              </div>
            </div>

            {/* Max Stress */}
            <div className="space-y-1.5">
              <label
                htmlFor={maxSliderId}
                className="text-xs font-medium text-gray-600 flex justify-between"
              >
                <span>Max Stress</span>
                <span className="font-mono text-gray-700">{formatStressValue(localMax)}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={maxSliderId}
                  type="range"
                  min={sliderMin}
                  max={sliderMax}
                  step={(sliderMax - sliderMin) / 100}
                  value={localMax}
                  onChange={(e) => handleMaxSliderChange(parseFloat(e.target.value))}
                  disabled={autoRange || isLoading}
                  className={cn(
                    'flex-1 h-2 rounded-lg appearance-none cursor-pointer',
                    'bg-gradient-to-r from-red-200 to-red-400',
                    '[&::-webkit-slider-thumb]:appearance-none',
                    '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
                    '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600',
                    '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer',
                    (autoRange || isLoading) && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-label="Maximum stress value slider"
                  aria-valuemin={sliderMin}
                  aria-valuemax={sliderMax}
                  aria-valuenow={localMax}
                  aria-valuetext={formatStressValue(localMax)}
                />
                <input
                  id={maxInputId}
                  type="number"
                  value={localMax.toFixed(1)}
                  onChange={handleMaxInputChange}
                  disabled={autoRange || isLoading}
                  className={cn(
                    'w-20 px-2 py-1 text-xs font-mono rounded border border-gray-300',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    (autoRange || isLoading) && 'opacity-50 cursor-not-allowed bg-gray-100'
                  )}
                  aria-label="Maximum stress value input"
                  step="0.1"
                />
              </div>
            </div>

            {/* Data Range Info */}
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span>Data Range:</span>
                <span className="font-mono">
                  {formatStressValue(dataMin)} - {formatStressValue(dataMax)}
                </span>
              </div>
            </div>
          </div>

          {/* Color Scale Preview */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-600">Color Scale Preview</div>
            <div
              className="h-6 rounded-lg"
              style={{ background: selectedColormap.gradient }}
              aria-label={`Color scale from ${formatStressValue(localMin)} to ${formatStressValue(localMax)}`}
            />
            <div className="flex justify-between text-xs text-gray-500 font-mono">
              <span>{formatStressValue(localMin)}</span>
              <span>{formatStressValue((localMin + localMax) / 2)}</span>
              <span>{formatStressValue(localMax)}</span>
            </div>
          </div>

          {/* Reset Button */}
          <Button
            onClick={handleReset}
            variant="secondary"
            size="sm"
            className="w-full"
            disabled={isLoading}
            aria-label="Reset stress visualization to default settings"
          >
            <RotateCcw size={14} className="mr-2" aria-hidden="true" />
            Reset to Defaults
          </Button>
        </>
      )}
    </Card>
  );
}

export default StressControlPanel;
