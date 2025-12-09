'use client';

import { useMemo, useState, useCallback } from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend, ReferenceLine, Area, Line } from 'recharts';
import { ChartControls, ColorScaleLegend } from './ChartControls';
import type { ColorMode } from '@/lib/charts/chart-utils';
import { interpolateColor, SEQUENTIAL_SCALES, DIVERGING_SCALES } from '@/lib/charts/chart-utils';

interface HistogramData {
  bin_center: number;
  count: number;
  probability?: number;
}

interface HistogramChartProps {
  data: HistogramData[];
  mean: number;
  std: number;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  unit?: string;
  showNormalOverlay?: boolean;
  confidenceInterval?: { lower: number; upper: number };
  binCount?: number;
  onExport?: (format: 'png' | 'svg') => void;
}

type HistogramChartType = 'bar' | 'area' | 'line';
type HistogramColorMode = 'default' | 'gradient' | 'probability' | 'deviation';

const HISTOGRAM_COLOR_MODE_LABELS: Record<HistogramColorMode, string> = {
  default: 'Default',
  gradient: 'Gradient',
  probability: 'Probability',
  deviation: 'Deviation',
};

export function HistogramChart({
  data, mean, std, title = 'Distribution', xLabel = 'Value', yLabel = 'Frequency', unit = '',
  showNormalOverlay = true, confidenceInterval, binCount: _binCount = 20, onExport
}: HistogramChartProps) {
  const [chartType, setChartType] = useState<HistogramChartType>('bar');
  const [colorMode, setColorMode] = useState<HistogramColorMode>('default');
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showNormal, setShowNormal] = useState(showNormalOverlay);

  const stats = useMemo(() => {
    const totalCount = data.reduce((sum, d) => sum + d.count, 0);
    const values = data.flatMap(d => Array(d.count).fill(d.bin_center));
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];
    const mode = data.reduce((max, d) => d.count > max.count ? d : max).bin_center;
    const cov = (std / mean) * 100;
    return { totalCount, median, mode, cov, min: Math.min(...values), max: Math.max(...values) };
  }, [data, mean, std]);

  const normalData = useMemo(() => {
    if (!showNormal || data.length === 0) return [];
    const binWidth = data.length > 1 ? Math.abs(data[1].bin_center - data[0].bin_center) : 1;
    return data.map(d => {
      const exponent = -Math.pow(d.bin_center - mean, 2) / (2 * Math.pow(std, 2));
      const normalProbability = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
      return { bin_center: d.bin_center, normalCount: normalProbability * binWidth * stats.totalCount };
    });
  }, [data, mean, std, showNormal, stats.totalCount]);

  const chartData = useMemo(() => {
    return data.map((d, idx) => {
      const deviationsFromMean = Math.abs(d.bin_center - mean) / std;
      let color = '#3B82F6';
      if (colorMode === 'gradient') {
        const normalized = (d.count / Math.max(...data.map(x => x.count)));
        color = interpolateColor(SEQUENTIAL_SCALES.blue, normalized);
      } else if (colorMode === 'probability') {
        const normalized = (d.count / stats.totalCount);
        color = interpolateColor(SEQUENTIAL_SCALES.purple, normalized * 10);
      } else if (colorMode === 'deviation') {
        const normalized = Math.min(deviationsFromMean / 3, 1);
        color = interpolateColor(DIVERGING_SCALES.coolWarm, normalized);
      }
      return {
        bin_center: d.bin_center,
        count: d.count,
        probability: d.probability || (d.count / stats.totalCount),
        normalCount: normalData[idx]?.normalCount || 0,
        color,
        deviationsFromMean,
      };
    });
  }, [data, normalData, stats.totalCount, colorMode, mean, std]);

  const yDomain = useMemo(() => {
    const maxCount = Math.max(...chartData.map(d => Math.max(d.count, d.normalCount)));
    return [0, maxCount * 1.15];
  }, [chartData]);

  const renderChart = () => {
    const commonElements = (
      <>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
        <XAxis dataKey="bin_center" type="number" tick={{ fontSize: 12 }} tickFormatter={(value) => value.toFixed(0)}
          label={{ value: `${xLabel} (${unit})`, position: 'bottom', offset: 40, style: { fontWeight: 600 } }} />
        <YAxis tick={{ fontSize: 12 }} domain={yDomain} label={{ value: yLabel, angle: -90, position: 'left', offset: 50, style: { fontWeight: 600 } }} />
        <ReferenceLine x={mean} stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'Mean', position: 'top', fill: '#3B82F6', fontSize: 12 }} />
        {confidenceInterval && (
          <>
            <ReferenceLine x={confidenceInterval.lower} stroke="#10B981" strokeWidth={1} strokeDasharray="3 3" label={{ value: '95% CI', position: 'top', fill: '#10B981', fontSize: 10 }} />
            <ReferenceLine x={confidenceInterval.upper} stroke="#10B981" strokeWidth={1} strokeDasharray="3 3" />
          </>
        )}
        <ReferenceLine x={mean - std} stroke="#6366F1" strokeWidth={1} strokeDasharray="2 2" label={{ value: '-1σ', position: 'top', fill: '#6366F1', fontSize: 10 }} />
        <ReferenceLine x={mean + std} stroke="#6366F1" strokeWidth={1} strokeDasharray="2 2" label={{ value: '+1σ', position: 'top', fill: '#6366F1', fontSize: 10 }} />
        <Tooltip content={({ payload }) => {
          if (!payload?.[0]) return null;
          const d = payload[0].payload;
          return (
            <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
              <div className="font-bold mb-2">{d.bin_center.toFixed(1)} {unit}</div>
              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between gap-4"><span>Frequency:</span><span className="font-bold text-blue-600">{d.count}</span></div>
                <div className="flex justify-between gap-4"><span>Probability:</span><span className="font-medium text-gray-900">{(d.probability * 100).toFixed(2)}%</span></div>
                <div className="flex justify-between gap-4"><span>σ from mean:</span><span className="font-medium text-purple-600">{d.deviationsFromMean.toFixed(2)}σ</span></div>
                {showNormal && <div className="flex justify-between gap-4"><span>Expected:</span><span className="font-medium text-green-600">{d.normalCount.toFixed(1)}</span></div>}
              </div>
            </div>
          );
        }} />
        {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />}
      </>
    );

    if (chartType === 'area') {
      return (
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, bottom: 60, left: 70 }}>
          {commonElements}
          <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} strokeWidth={2} name="Observed Frequency" />
          {showNormal && <Line type="monotone" dataKey="normalCount" stroke="#10B981" strokeWidth={2} dot={false} name="Normal Distribution" />}
        </ComposedChart>
      );
    }

    if (chartType === 'line') {
      return (
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, bottom: 60, left: 70 }}>
          {commonElements}
          <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="Observed Frequency" />
          {showNormal && <Line type="monotone" dataKey="normalCount" stroke="#10B981" strokeWidth={2} dot={false} name="Normal Distribution" />}
        </ComposedChart>
      );
    }

    return (
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, bottom: 60, left: 70 }}>
        {commonElements}
        <Bar dataKey="count" fill="#3B82F6" fillOpacity={0.7} name="Observed Frequency" />
        {showNormal && <Area type="monotone" dataKey="normalCount" stroke="#10B981" strokeWidth={2} fill="#10B981" fillOpacity={0.1} name="Normal Distribution" />}
      </ComposedChart>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={showNormal} onChange={(e) => setShowNormal(e.target.checked)} className="rounded" />
            Normal Overlay
          </label>
        </div>
        {onExport && (
          <div className="flex gap-1">
            <button onClick={() => onExport('png')} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">PNG</button>
            <button onClick={() => onExport('svg')} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">SVG</button>
          </div>
        )}
      </div>

      {showStats && (
        <div className="grid grid-cols-4 gap-4 mb-4 px-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-xs text-blue-600 font-medium">Mean</div>
            <div className="text-lg font-bold text-blue-900">{mean.toFixed(2)} {unit}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="text-xs text-green-600 font-medium">Std Dev</div>
            <div className="text-lg font-bold text-green-900">{std.toFixed(2)} {unit}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="text-xs text-purple-600 font-medium">Median</div>
            <div className="text-lg font-bold text-purple-900">{stats.median.toFixed(2)} {unit}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="text-xs text-orange-600 font-medium">CoV</div>
            <div className="text-lg font-bold text-orange-900">{stats.cov.toFixed(1)}%</div>
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        <ChartControls<HistogramColorMode>
          chartType={chartType}
          availableChartTypes={['bar', 'area', 'line']}
          onChartTypeChange={(type) => setChartType(type as HistogramChartType)}
          colorMode={colorMode}
          availableColorModes={['default', 'gradient', 'probability', 'deviation']}
          onColorModeChange={setColorMode}
          colorModeLabels={HISTOGRAM_COLOR_MODE_LABELS}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          showLegend={showLegend}
          onToggleLegend={() => setShowLegend(!showLegend)}
          position="top-right"
        />

        {colorMode !== 'default' && <ColorScaleLegend colorMode={colorMode === 'deviation' ? 'reliability' : 'performance'} position="bottom-left" />}

        <ResponsiveContainer width="100%" height="100%">{renderChart()}</ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-3 px-4 text-xs text-gray-600">
        <span>Min: <span className="font-bold">{stats.min.toFixed(2)} {unit}</span></span>
        <span>Max: <span className="font-bold">{stats.max.toFixed(2)} {unit}</span></span>
        <span>Range: <span className="font-bold">{(stats.max - stats.min).toFixed(2)} {unit}</span></span>
        <span>Samples: <span className="font-bold">{stats.totalCount.toLocaleString()}</span></span>
      </div>
    </div>
  );
}
