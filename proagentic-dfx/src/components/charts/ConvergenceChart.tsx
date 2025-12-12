'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Brush,
  Area,
  ComposedChart,
  Bar,
} from 'recharts';
import { ChartControls, ColorScaleLegend } from './ChartControls';
import type { ChartType as _ChartType, ColorMode as _ColorMode } from '@/lib/charts/chart-utils';
import {
  interpolateColor,
  SEQUENTIAL_SCALES,
  DIVERGING_SCALES,
  formatValue,
} from '@/lib/charts/chart-utils';

export interface ConvergenceData {
  generation: number;
  best_fitness: number;
  average_fitness: number;
  worst_fitness: number;
  std_dev?: number;
  timestamp?: number;
}

interface ConvergenceChartProps {
  data: ConvergenceData[];
  title?: string;
  yLabel?: string;
  goalValue?: number;
  enableZoom?: boolean;
  realTimeUpdate?: boolean;
  onExport?: (format: 'png' | 'svg') => void;
}

type ConvergenceChartType = 'line' | 'area' | 'bar';
type ConvergenceColorMode = 'default' | 'gradient' | 'performance' | 'reliability';

export function ConvergenceChart({
  data,
  title = 'Optimization Convergence',
  yLabel = 'Fitness',
  goalValue,
  enableZoom = true,
  realTimeUpdate = false,
  onExport,
}: ConvergenceChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'best' | 'average' | 'worst'>('all');
  const [chartType, setChartType] = useState<ConvergenceChartType>('line');
  const [colorMode, setColorMode] = useState<ConvergenceColorMode>('default');
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [_zoomLevel, setZoomLevel] = useState(1);

  // Calculate convergence statistics
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const firstGen = data[0];
    const lastGen = data[data.length - 1];
    const bestImprovement = ((lastGen.best_fitness - firstGen.best_fitness) / firstGen.best_fitness) * 100;
    const avgImprovement = ((lastGen.average_fitness - firstGen.average_fitness) / firstGen.average_fitness) * 100;
    const convergenceRate = bestImprovement / data.length;

    const last10Percent = Math.max(1, Math.floor(data.length * 0.1));
    const recentData = data.slice(-last10Percent);
    const recentImprovement = recentData.length > 1
      ? Math.abs(((recentData[recentData.length - 1].best_fitness - recentData[0].best_fitness) /
          recentData[0].best_fitness) * 100)
      : 0;
    const hasConverged = recentImprovement < 1.0;
    const avgStdDev = data.reduce((sum, d) => sum + (d.std_dev || 0), 0) / data.length;

    return {
      totalGenerations: data.length,
      bestImprovement,
      avgImprovement,
      convergenceRate,
      hasConverged,
      currentBest: lastGen.best_fitness,
      currentAverage: lastGen.average_fitness,
      avgStdDev,
    };
  }, [data]);

  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 100];
    const allValues = data.flatMap(d => [
      d.best_fitness, d.average_fitness, d.worst_fitness,
      ...(goalValue !== undefined ? [goalValue] : []),
    ]);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.1;
    return [Math.max(0, min - padding), max + padding];
  }, [data, goalValue]);

  const visibleLines = useMemo(() => {
    if (selectedMetric === 'all') return { best: true, average: true, worst: true };
    return {
      best: selectedMetric === 'best',
      average: selectedMetric === 'average',
      worst: selectedMetric === 'worst',
    };
  }, [selectedMetric]);

  const processedData = useMemo(() => {
    if (data.length === 0) return [];
    const minFitness = Math.min(...data.map(d => d.best_fitness));
    const maxFitness = Math.max(...data.map(d => d.best_fitness));
    const range = maxFitness - minFitness || 1;

    return data.map((d, index) => {
      const normalized = (d.best_fitness - minFitness) / range;
      let color = '#10B981';
      if (colorMode === 'gradient') color = interpolateColor(SEQUENTIAL_SCALES.blue, normalized);
      else if (colorMode === 'performance') color = interpolateColor(SEQUENTIAL_SCALES.purple, normalized);
      else if (colorMode === 'reliability') color = interpolateColor(DIVERGING_SCALES.redGreen, normalized);
      return { ...d, color, normalized, index };
    });
  }, [data, colorMode]);

  const handleZoomIn = useCallback(() => setZoomLevel(prev => Math.min(prev * 1.5, 4)), []);
  const handleZoomOut = useCallback(() => setZoomLevel(prev => Math.max(prev / 1.5, 1)), []);
  const handleZoomReset = useCallback(() => setZoomLevel(1), []);

  const getLineColors = useCallback(() => {
    const colorSets: Record<ConvergenceColorMode, { best: string; average: string; worst: string }> = {
      default: { best: '#10B981', average: '#3B82F6', worst: '#EF4444' },
      gradient: { best: '#2563EB', average: '#60A5FA', worst: '#BFDBFE' },
      performance: { best: '#9333EA', average: '#C084FC', worst: '#E9D5FF' },
      reliability: { best: '#22C55E', average: '#FBBF24', worst: '#EF4444' },
    };
    return colorSets[colorMode];
  }, [colorMode]);

  const lineColors = getLineColors();

  const renderChart = () => {
    const commonProps = { data: processedData, margin: { top: 20, right: 30, bottom: enableZoom ? 80 : 50, left: 70 } };

    const renderCommonElements = () => (
      <>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
        <XAxis dataKey="generation" type="number" tick={{ fontSize: 12 }}
          label={{ value: 'Generation', position: 'bottom', offset: enableZoom ? 60 : 30, style: { fontWeight: 600 } }} />
        <YAxis domain={yDomain} tick={{ fontSize: 12 }}
          tickFormatter={(value) => formatValue(value, { precision: 2, compact: true })}
          label={{ value: yLabel, angle: -90, position: 'left', offset: 50, style: { fontWeight: 600 } }} />
        {goalValue !== undefined && (
          <ReferenceLine y={goalValue} stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5"
            label={{ value: 'Goal', position: 'right', fill: '#F59E0B', fontSize: 12 }} />
        )}
        <Tooltip content={({ payload }) => {
          if (!payload?.[0]) return null;
          const d = payload[0].payload as ConvergenceData;
          return (
            <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
              <div className="font-bold mb-2">Generation {d.generation}</div>
              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between gap-4"><span>Best:</span>
                  <span className="font-bold" style={{ color: lineColors.best }}>{d.best_fitness.toFixed(4)}</span></div>
                <div className="flex justify-between gap-4"><span>Average:</span>
                  <span className="font-medium" style={{ color: lineColors.average }}>{d.average_fitness.toFixed(4)}</span></div>
                <div className="flex justify-between gap-4"><span>Worst:</span>
                  <span className="font-medium" style={{ color: lineColors.worst }}>{d.worst_fitness.toFixed(4)}</span></div>
                {d.std_dev !== undefined && (
                  <div className="flex justify-between gap-4"><span>Std Dev:</span>
                    <span className="font-medium text-gray-900">{d.std_dev.toFixed(4)}</span></div>
                )}
              </div>
            </div>
          );
        }} />
        {showLegend && <Legend wrapperStyle={{ paddingTop: '10px' }} iconType={chartType === 'bar' ? 'square' : 'line'} />}
        {enableZoom && data.length > 10 && <Brush dataKey="generation" height={30} stroke="#3B82F6" fill="#EFF6FF" />}
      </>
    );

    if (chartType === 'area') {
      return (
        <ComposedChart {...commonProps}>
          {renderCommonElements()}
          {visibleLines.worst && <Area type="monotone" dataKey="worst_fitness" stroke={lineColors.worst} fill={lineColors.worst}
            fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="3 3" name="Worst Fitness" animationDuration={realTimeUpdate ? 300 : 1000} />}
          {visibleLines.average && <Area type="monotone" dataKey="average_fitness" stroke={lineColors.average} fill={lineColors.average}
            fillOpacity={0.2} strokeWidth={2} name="Average Fitness" animationDuration={realTimeUpdate ? 300 : 1000} />}
          {visibleLines.best && <Area type="monotone" dataKey="best_fitness" stroke={lineColors.best} fill={lineColors.best}
            fillOpacity={0.3} strokeWidth={3} name="Best Fitness" animationDuration={realTimeUpdate ? 300 : 1000} />}
        </ComposedChart>
      );
    }

    if (chartType === 'bar') {
      return (
        <ComposedChart {...commonProps}>
          {renderCommonElements()}
          {visibleLines.worst && <Bar dataKey="worst_fitness" fill={lineColors.worst} fillOpacity={0.5} name="Worst Fitness" />}
          {visibleLines.average && <Bar dataKey="average_fitness" fill={lineColors.average} fillOpacity={0.7} name="Average Fitness" />}
          {visibleLines.best && <Bar dataKey="best_fitness" fill={lineColors.best} name="Best Fitness" />}
        </ComposedChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        {renderCommonElements()}
        {visibleLines.best && <Line type="monotone" dataKey="best_fitness" stroke={lineColors.best} strokeWidth={3} dot={false} name="Best Fitness" />}
        {visibleLines.average && <Line type="monotone" dataKey="average_fitness" stroke={lineColors.average} strokeWidth={2} dot={false} name="Average Fitness" />}
        {visibleLines.worst && <Line type="monotone" dataKey="worst_fitness" stroke={lineColors.worst} strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Worst Fitness" />}
      </LineChart>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {realTimeUpdate && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 font-medium">Live</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value as typeof selectedMetric)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm">
            <option value="all">All Metrics</option>
            <option value="best">Best Only</option>
            <option value="average">Average Only</option>
            <option value="worst">Worst Only</option>
          </select>
          {onExport && (
            <div className="flex gap-1">
              <button onClick={() => onExport('png')} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">PNG</button>
              <button onClick={() => onExport('svg')} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">SVG</button>
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-5 gap-3 mb-4 px-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-xs text-blue-600 font-medium">Generations</div>
            <div className="text-lg font-bold text-blue-900">{stats.totalGenerations}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="text-xs text-green-600 font-medium">Best Fitness</div>
            <div className="text-lg font-bold text-green-900">{stats.currentBest.toFixed(3)}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="text-xs text-purple-600 font-medium">Improvement</div>
            <div className="text-lg font-bold text-purple-900">{stats.bestImprovement > 0 ? '+' : ''}{stats.bestImprovement.toFixed(1)}%</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="text-xs text-orange-600 font-medium">Rate</div>
            <div className="text-lg font-bold text-orange-900">{stats.convergenceRate.toFixed(2)}%/gen</div>
          </div>
          <div className={`rounded-lg p-3 border ${stats.hasConverged ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className={`text-xs font-medium ${stats.hasConverged ? 'text-green-600' : 'text-yellow-600'}`}>Status</div>
            <div className={`text-lg font-bold ${stats.hasConverged ? 'text-green-900' : 'text-yellow-900'}`}>
              {stats.hasConverged ? 'Converged' : 'Optimizing'}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        <ChartControls
          chartType={chartType} availableChartTypes={['line', 'area', 'bar']}
          onChartTypeChange={(type) => setChartType(type as ConvergenceChartType)}
          colorMode={colorMode} availableColorModes={['default', 'gradient', 'performance', 'reliability']}
          onColorModeChange={(mode) => setColorMode(mode as ConvergenceColorMode)}
          zoomEnabled={enableZoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onZoomReset={handleZoomReset}
          showGrid={showGrid} onToggleGrid={() => setShowGrid(!showGrid)}
          showLegend={showLegend} onToggleLegend={() => setShowLegend(!showLegend)} position="top-right"
        />
        {colorMode !== 'default' && <ColorScaleLegend colorMode={colorMode} position="bottom-left" />}
        <ResponsiveContainer width="100%" height="100%">{renderChart()}</ResponsiveContainer>
      </div>
    </div>
  );
}
