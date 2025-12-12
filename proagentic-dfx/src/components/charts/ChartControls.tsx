'use client';

import { useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Download,
  Settings,
  Layers,
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  Palette,
  Circle,
  Grid3X3,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { ChartType, ColorMode } from '@/lib/charts/chart-utils';
import { DIVERGING_SCALES, SEQUENTIAL_SCALES } from '@/lib/charts/chart-utils';

// ============================================================================
// Types
// ============================================================================

export interface ChartControlsProps<T extends string = ColorMode> {
  // Chart type
  chartType?: ChartType;
  availableChartTypes?: ChartType[];
  onChartTypeChange?: (type: ChartType) => void;

  // Color mode - generic to support chart-specific color modes
  colorMode?: T;
  availableColorModes?: T[];
  onColorModeChange?: (mode: T) => void;
  colorModeLabels?: Record<T, string>;

  // Size metric (for bubble charts)
  sizeMetric?: string;
  availableSizeMetrics?: { value: string; label: string }[];
  onSizeMetricChange?: (metric: string) => void;

  // Zoom
  zoomEnabled?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;

  // Grid/legend toggles
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showLegend?: boolean;
  onToggleLegend?: () => void;

  // Export
  onExport?: () => void;

  // Fullscreen
  onFullscreen?: () => void;

  // Layout
  layout?: 'horizontal' | 'compact' | 'minimal';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

// ============================================================================
// Chart Type Icons
// ============================================================================

const CHART_TYPE_ICONS: Record<ChartType, React.ReactNode> = {
  line: <LineChart size={14} />,
  area: <Layers size={14} />,
  bar: <BarChart3 size={14} />,
  scatter: <ScatterChart size={14} />,
  bubble: <Circle size={14} />,
  radar: <Grid3X3 size={14} />,
  pie: <PieChart size={14} />,
};

const CHART_TYPE_LABELS: Record<ChartType, string> = {
  line: 'Line',
  area: 'Area',
  bar: 'Bar',
  scatter: 'Scatter',
  bubble: 'Bubble',
  radar: 'Radar',
  pie: 'Pie',
};

// ============================================================================
// Color Mode Labels
// ============================================================================

const COLOR_MODE_LABELS: Record<ColorMode, string> = {
  default: 'Default',
  category: 'Category',
  gradient: 'Gradient',
  reliability: 'Reliability',
  cost: 'Cost',
  performance: 'Performance',
};

// ============================================================================
// Component
// ============================================================================

export function ChartControls<T extends string = ColorMode>({
  chartType,
  availableChartTypes = ['line', 'area', 'bar', 'scatter'],
  onChartTypeChange,
  colorMode = 'default' as T,
  availableColorModes = ['default', 'category', 'gradient'] as T[],
  onColorModeChange,
  colorModeLabels,
  sizeMetric,
  availableSizeMetrics,
  onSizeMetricChange,
  zoomEnabled = true,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  showGrid = true,
  onToggleGrid,
  showLegend = true,
  onToggleLegend,
  onExport,
  onFullscreen,
  layout = 'horizontal',
  position = 'top-right',
  className = '',
}: ChartControlsProps<T>) {
  const [_showSettings, _setShowSettings] = useState(false);

  // Position classes
  const positionClasses: Record<string, string> = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2',
  };

  // Layout classes
  const layoutClasses: Record<string, string> = {
    horizontal: 'flex-row gap-2',
    compact: 'flex-row gap-1',
    minimal: 'flex-col gap-1',
  };

  const buttonBase = 'p-1.5 rounded transition-colors duration-150';
  const buttonActive = 'bg-blue-100 text-blue-600';
  const buttonInactive = 'hover:bg-gray-100 text-gray-500';

  return (
    <div
      className={`absolute ${positionClasses[position]} z-10 flex ${layoutClasses[layout]} bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-1.5 ${className}`}
    >
      {/* Chart Type Selector */}
      {chartType && availableChartTypes.length > 1 && onChartTypeChange && (
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline">Type</span>
          {availableChartTypes.map((type) => (
            <button
              key={type}
              onClick={() => onChartTypeChange(type)}
              className={`${buttonBase} ${chartType === type ? buttonActive : buttonInactive}`}
              title={CHART_TYPE_LABELS[type]}
            >
              {CHART_TYPE_ICONS[type]}
            </button>
          ))}
        </div>
      )}

      {/* Color Mode Selector */}
      {availableColorModes.length > 1 && onColorModeChange && (
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
          <Palette size={12} className="text-gray-400 hidden sm:inline" />
          <select
            value={colorMode}
            onChange={(e) => onColorModeChange(e.target.value as T)}
            className="text-xs border-0 bg-transparent text-gray-600 focus:outline-none focus:ring-0 cursor-pointer pr-4"
          >
            {availableColorModes.map((mode) => (
              <option key={mode} value={mode}>
                {colorModeLabels?.[mode] ?? COLOR_MODE_LABELS[mode as ColorMode] ?? mode}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Size Metric Selector (for bubble charts) */}
      {availableSizeMetrics && availableSizeMetrics.length > 0 && onSizeMetricChange && (
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
          <Circle size={12} className="text-gray-400 hidden sm:inline" />
          <select
            value={sizeMetric || 'none'}
            onChange={(e) => onSizeMetricChange(e.target.value)}
            className="text-xs border-0 bg-transparent text-gray-600 focus:outline-none focus:ring-0 cursor-pointer pr-4"
          >
            <option value="none">Fixed Size</option>
            {availableSizeMetrics.map((metric) => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Zoom Controls */}
      {zoomEnabled && (onZoomIn || onZoomOut || onZoomReset) && (
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200">
          {onZoomIn && (
            <button
              onClick={onZoomIn}
              className={`${buttonBase} ${buttonInactive}`}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          )}
          {onZoomOut && (
            <button
              onClick={onZoomOut}
              className={`${buttonBase} ${buttonInactive}`}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
          )}
          {onZoomReset && (
            <button
              onClick={onZoomReset}
              className={`${buttonBase} ${buttonInactive}`}
              title="Reset Zoom"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      )}

      {/* Toggle Controls */}
      {(onToggleGrid || onToggleLegend) && (
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200">
          {onToggleGrid && (
            <button
              onClick={onToggleGrid}
              className={`${buttonBase} ${showGrid ? buttonActive : buttonInactive}`}
              title={showGrid ? 'Hide Grid' : 'Show Grid'}
            >
              <Grid3X3 size={14} />
            </button>
          )}
          {onToggleLegend && (
            <button
              onClick={onToggleLegend}
              className={`${buttonBase} ${showLegend ? buttonActive : buttonInactive}`}
              title={showLegend ? 'Hide Legend' : 'Show Legend'}
            >
              {showLegend ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-0.5">
        {onExport && (
          <button
            onClick={onExport}
            className={`${buttonBase} ${buttonInactive}`}
            title="Export Chart"
          >
            <Download size={14} />
          </button>
        )}
        {onFullscreen && (
          <button
            onClick={onFullscreen}
            className={`${buttonBase} ${buttonInactive}`}
            title="Fullscreen"
          >
            <Maximize2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Color Scale Legend Component
// ============================================================================

export interface ColorScaleLegendProps {
  colorMode: ColorMode;
  min?: number;
  max?: number;
  unit?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export function ColorScaleLegend({
  colorMode,
  min,
  max,
  unit,
  position = 'bottom-right',
  className = '',
}: ColorScaleLegendProps) {
  if (colorMode === 'default' || colorMode === 'category') {
    return null;
  }

  const positionClasses: Record<string, string> = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2',
  };

  const getGradient = () => {
    switch (colorMode) {
      case 'reliability':
        return `linear-gradient(to right, ${DIVERGING_SCALES.redGreen.join(', ')})`;
      case 'cost':
        return `linear-gradient(to right, ${DIVERGING_SCALES.redGreen.slice().reverse().join(', ')})`;
      case 'performance':
        return `linear-gradient(to right, ${SEQUENTIAL_SCALES.purple.join(', ')})`;
      case 'gradient':
        return `linear-gradient(to right, ${SEQUENTIAL_SCALES.blue.join(', ')})`;
      default:
        return `linear-gradient(to right, ${SEQUENTIAL_SCALES.blue.join(', ')})`;
    }
  };

  const getLabels = () => {
    switch (colorMode) {
      case 'reliability':
        return { left: 'Low', right: 'High' };
      case 'cost':
        return { left: 'High', right: 'Low' };
      case 'performance':
        return { left: 'Low', right: 'High' };
      default:
        return { left: 'Min', right: 'Max' };
    }
  };

  const labels = getLabels();

  return (
    <div
      className={`absolute ${positionClasses[position]} z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-2 ${className}`}
    >
      <div className="text-[10px] text-gray-500 mb-1 text-center uppercase tracking-wider">
        {colorMode === 'reliability' ? 'Reliability' : colorMode === 'cost' ? 'Cost' : colorMode}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-400 w-6 text-right">{min !== undefined ? min.toExponential(0) : labels.left}</span>
        <div
          className="w-20 h-2.5 rounded"
          style={{ background: getGradient() }}
        />
        <span className="text-[10px] text-gray-400 w-6">{max !== undefined ? max.toExponential(0) : labels.right}</span>
      </div>
      {unit && <div className="text-[9px] text-gray-400 text-center mt-0.5">{unit}</div>}
    </div>
  );
}

// ============================================================================
// Export utilities
// ============================================================================

export { CHART_TYPE_ICONS, CHART_TYPE_LABELS, COLOR_MODE_LABELS };
