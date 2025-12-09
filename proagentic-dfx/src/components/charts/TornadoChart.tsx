'use client';

import { useMemo, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, ComposedChart, Line } from 'recharts';
import { ChartControls, ColorScaleLegend } from './ChartControls';
import type { ColorMode } from '@/lib/charts/chart-utils';
import { interpolateColor, DIVERGING_SCALES, SEQUENTIAL_SCALES } from '@/lib/charts/chart-utils';

export interface SensitivityParameter {
  parameter: string;
  label: string;
  low_impact: number;
  high_impact: number;
  baseline: number;
  unit?: string;
}

interface TornadoChartProps {
  data: SensitivityParameter[];
  title?: string;
  sortByMagnitude?: boolean;
  threshold?: number;
  onExport?: (format: 'png' | 'svg') => void;
}

type TornadoChartType = 'bar' | 'line';
type TornadoColorMode = 'default' | 'gradient' | 'magnitude' | 'diverging';

const TORNADO_COLOR_MODE_LABELS: Record<TornadoColorMode, string> = {
  default: 'Default',
  gradient: 'Gradient',
  magnitude: 'Magnitude',
  diverging: 'Diverging',
};

export function TornadoChart({ data, title = 'Sensitivity Analysis', sortByMagnitude = true, threshold, onExport }: TornadoChartProps) {
  const [chartType, setChartType] = useState<TornadoChartType>('bar');
  const [colorMode, setColorMode] = useState<TornadoColorMode>('default');
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [highlightTop, setHighlightTop] = useState(3);

  const processedData = useMemo(() => {
    const processed = data.map(item => {
      // low_impact and high_impact are already percentage impacts, not absolute values
      // Don't subtract baseline - baseline is for display context only
      const magnitude = Math.abs(item.high_impact - item.low_impact);
      return {
        parameter: item.label,
        low: item.low_impact,  // Already a percentage (e.g., -12.5)
        high: item.high_impact, // Already a percentage (e.g., +15.8)
        magnitude,
        baseline: item.baseline,
        unit: item.unit || '',
        rawData: item,
      };
    });
    if (sortByMagnitude) processed.sort((a, b) => b.magnitude - a.magnitude);
    return processed;
  }, [data, sortByMagnitude]);

  const xDomain = useMemo(() => {
    const allValues = processedData.flatMap(d => [d.low, d.high]);
    const maxAbs = Math.max(...allValues.map(Math.abs));
    const padding = maxAbs * 0.15;
    return [-maxAbs - padding, maxAbs + padding];
  }, [processedData]);

  const maxMagnitude = useMemo(() => Math.max(...processedData.map(d => d.magnitude)), [processedData]);

  const getBarColor = useCallback((value: number, magnitude: number, index: number) => {
    if (colorMode === 'default') {
      return value < 0 ? '#EF4444' : '#10B981';
    }
    if (colorMode === 'diverging') {
      const normalized = (value + Math.abs(xDomain[0])) / (xDomain[1] - xDomain[0]);
      return interpolateColor(DIVERGING_SCALES.blueRed, normalized);
    }
    if (colorMode === 'magnitude') {
      const intensity = magnitude / maxMagnitude;
      return interpolateColor(SEQUENTIAL_SCALES.purple, intensity);
    }
    if (colorMode === 'gradient') {
      const intensity = magnitude / maxMagnitude;
      if (value < 0) return interpolateColor(SEQUENTIAL_SCALES.red, intensity);
      return interpolateColor(SEQUENTIAL_SCALES.green, intensity);
    }
    return value < 0 ? '#EF4444' : '#10B981';
  }, [colorMode, maxMagnitude, xDomain]);

  const renderChart = () => {
    const commonElements = (
      <>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
        <XAxis type="number" domain={xDomain} tick={{ fontSize: 12 }}
          label={{ value: 'Impact on Output (%)', position: 'bottom', offset: 0, style: { fontWeight: 600 } }}
          tickFormatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`} />
        <YAxis type="category" dataKey="parameter" tick={{ fontSize: 11 }} width={140} />
        <ReferenceLine x={0} stroke="#475569" strokeWidth={2} label={{ value: 'Baseline', position: 'top', fill: '#475569', fontSize: 12 }} />
        {threshold && (
          <>
            <ReferenceLine x={threshold} stroke="#F59E0B" strokeWidth={1} strokeDasharray="5 5" label={{ value: 'Threshold', position: 'top', fill: '#F59E0B', fontSize: 10 }} />
            <ReferenceLine x={-threshold} stroke="#F59E0B" strokeWidth={1} strokeDasharray="5 5" />
          </>
        )}
        <Tooltip content={({ payload }) => {
          if (!payload?.[0]) return null;
          const d = payload[0].payload;
          const activeBar = payload[0].dataKey === 'low' ? 'low' : 'high';
          const impact = activeBar === 'low' ? d.low : d.high;
          return (
            <div className="bg-white p-3 rounded-lg shadow-lg border text-sm min-w-[250px]">
              <div className="font-bold mb-2 text-gray-900">{d.parameter}</div>
              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between gap-4"><span>Direction:</span><span className="font-medium text-gray-900">{impact < 0 ? 'Decrease' : 'Increase'}</span></div>
                <div className="flex justify-between gap-4"><span>Impact:</span><span className="font-bold" style={{ color: impact < 0 ? '#DC2626' : '#059669' }}>{impact > 0 ? '+' : ''}{impact.toFixed(2)}%</span></div>
                <div className="flex justify-between gap-4"><span>Total Swing:</span><span className="font-bold text-gray-900">{d.magnitude.toFixed(2)}%</span></div>
                <div className="flex justify-between gap-4"><span>Baseline:</span><span className="font-medium text-gray-900">{d.baseline.toFixed(2)} {d.unit}</span></div>
              </div>
            </div>
          );
        }} />
      </>
    );

    if (chartType === 'line') {
      return (
        <ComposedChart layout="vertical" data={processedData} margin={{ top: 20, right: 30, bottom: 20, left: 150 }}>
          {commonElements}
          <Line type="monotone" dataKey="low" stroke="#EF4444" strokeWidth={2} dot={{ r: 4, fill: '#EF4444' }} name="Low Impact" />
          <Line type="monotone" dataKey="high" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: '#10B981' }} name="High Impact" />
        </ComposedChart>
      );
    }

    return (
      <BarChart layout="vertical" data={processedData} margin={{ top: 20, right: 30, bottom: 20, left: 150 }}>
        {commonElements}
        <Bar dataKey="low" stackId="stack" name="Low Impact">
          {processedData.map((entry, index) => (
            <Cell key={`low-${index}`} fill={getBarColor(entry.low, entry.magnitude, index)} opacity={index < highlightTop ? 1 : 0.6} />
          ))}
        </Bar>
        <Bar dataKey="high" stackId="stack" name="High Impact">
          {processedData.map((entry, index) => (
            <Cell key={`high-${index}`} fill={getBarColor(entry.high, entry.magnitude, index)} opacity={index < highlightTop ? 1 : 0.6} />
          ))}
        </Bar>
      </BarChart>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">Sorted by: <span className="font-medium">{sortByMagnitude ? 'Impact Magnitude' : 'Parameter Order'}</span></div>
          {onExport && (
            <div className="flex gap-1">
              <button onClick={() => onExport('png')} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">PNG</button>
              <button onClick={() => onExport('svg')} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">SVG</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 mb-3 px-4 text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded" /><span className="text-gray-700">Negative Impact</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded" /><span className="text-gray-700">Positive Impact</span></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Highlight top:</span>
          <select value={highlightTop} onChange={(e) => setHighlightTop(Number(e.target.value))} className="text-xs border border-gray-300 rounded px-2 py-1">
            {[1, 2, 3, 5, 10].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 relative">
        <ChartControls<TornadoColorMode>
          chartType={chartType}
          availableChartTypes={['bar', 'line']}
          onChartTypeChange={(type) => setChartType(type as TornadoChartType)}
          colorMode={colorMode}
          availableColorModes={['default', 'gradient', 'magnitude', 'diverging']}
          onColorModeChange={setColorMode}
          colorModeLabels={TORNADO_COLOR_MODE_LABELS}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          showLegend={showLegend}
          onToggleLegend={() => setShowLegend(!showLegend)}
          position="top-right"
        />

        {(colorMode === 'magnitude' || colorMode === 'gradient') && <ColorScaleLegend colorMode="performance" min={0} max={maxMagnitude} unit="%" position="bottom-left" />}

        <ResponsiveContainer width="100%" height="100%">{renderChart()}</ResponsiveContainer>
      </div>

      <div className="mt-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm font-semibold text-gray-700 mb-2">Top {Math.min(highlightTop, processedData.length)} Most Influential Parameters:</div>
        <div className="grid grid-cols-3 gap-4">
          {processedData.slice(0, highlightTop).map((param, idx) => (
            <div key={idx} className="text-xs">
              <div className="font-medium text-gray-900">{idx + 1}. {param.parameter}</div>
              <div className="text-gray-600">Swing: <span className="font-bold text-blue-600">{param.magnitude.toFixed(2)}%</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
