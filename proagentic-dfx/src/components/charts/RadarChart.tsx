'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartControls, ColorScaleLegend } from './ChartControls';
import type { ColorMode } from '@/lib/charts/chart-utils';
import { interpolateColor, SEQUENTIAL_SCALES, PRIMARY_COLORS } from '@/lib/charts/chart-utils';

export interface RadarMetric {
  metric: string;
  label: string;
  unit?: string;
  higherIsBetter?: boolean;
}

export interface RadarDesignData {
  designId: string;
  designName: string;
  values: Record<string, number>;
  color: string;
}

interface RadarChartProps {
  metrics: RadarMetric[];
  designs: RadarDesignData[];
  title?: string;
  normalizeData?: boolean;
  onExport?: (format: 'png' | 'svg') => void;
}

type RadarColorMode = 'default' | 'gradient' | 'performance' | 'category';
type RadarDisplayMode = 'filled' | 'outline' | 'dots';

export function RadarChart({ metrics, designs, title = 'Multi-Criteria Comparison', normalizeData = true, onExport }: RadarChartProps) {
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>(designs.map(d => d.designId));
  const [colorMode, setColorMode] = useState<RadarColorMode>('default');
  const [displayMode, setDisplayMode] = useState<RadarDisplayMode>('filled');
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [fillOpacity, setFillOpacity] = useState(0.2);

  const normalizedData = useMemo(() => {
    if (!normalizeData) {
      return metrics.map(metric => {
        const dataPoint: Record<string, string | number> = { metric: metric.label };
        designs.forEach(design => {
          if (selectedDesigns.includes(design.designId)) dataPoint[design.designName] = design.values[metric.metric];
        });
        return dataPoint;
      });
    }
    const ranges = metrics.map(metric => {
      const values = designs.map(d => d.values[metric.metric]).filter(v => v !== undefined);
      return { metric: metric.metric, min: Math.min(...values), max: Math.max(...values), range: Math.max(...values) - Math.min(...values) };
    });
    return metrics.map(metric => {
      const range = ranges.find(r => r.metric === metric.metric)!;
      const dataPoint: Record<string, string | number> = { metric: metric.label };
      designs.forEach(design => {
        if (selectedDesigns.includes(design.designId)) {
          const value = design.values[metric.metric];
          if (value !== undefined && range.range > 0) {
            let normalized = ((value - range.min) / range.range) * 100;
            if (metric.higherIsBetter === false) normalized = 100 - normalized;
            dataPoint[design.designName] = normalized;
          } else dataPoint[design.designName] = 0;
        }
      });
      return dataPoint;
    });
  }, [metrics, designs, selectedDesigns, normalizeData]);

  const overallScores = useMemo(() => {
    return designs.map(design => {
      const scores = normalizedData.map(d => d[design.designName] || 0);
      const average = scores.reduce((sum: number, s) => sum + (Number(s) || 0), 0) / scores.length;
      return { designId: design.designId, designName: design.designName, score: average };
    }).sort((a, b) => b.score - a.score);
  }, [normalizedData, designs]);

  const toggleDesign = (designId: string) => {
    setSelectedDesigns(prev => prev.includes(designId) ? prev.filter(id => id !== designId) : [...prev, designId]);
  };

  const visibleDesigns = designs.filter(d => selectedDesigns.includes(d.designId));

  const getDesignColor = useCallback((design: RadarDesignData, index: number) => {
    if (colorMode === 'default' || colorMode === 'category') return design.color || PRIMARY_COLORS[index % PRIMARY_COLORS.length];
    const score = overallScores.find(s => s.designId === design.designId)?.score || 0;
    if (colorMode === 'gradient') return interpolateColor(SEQUENTIAL_SCALES.blue, score / 100);
    if (colorMode === 'performance') return interpolateColor(SEQUENTIAL_SCALES.purple, score / 100);
    return design.color;
  }, [colorMode, overallScores]);

  const getFillOpacity = useCallback(() => displayMode === 'outline' || displayMode === 'dots' ? 0 : fillOpacity, [displayMode, fillOpacity]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {onExport && (
          <div className="flex gap-1">
            <button onClick={() => onExport('png')} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">PNG</button>
            <button onClick={() => onExport('svg')} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">SVG</button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4 px-4 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Designs:</span>
        {designs.map((design, idx) => (
          <button key={design.designId} onClick={() => toggleDesign(design.designId)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedDesigns.includes(design.designId) ? 'shadow-md' : 'opacity-40 grayscale'}`}
            style={{ backgroundColor: selectedDesigns.includes(design.designId) ? getDesignColor(design, idx) : '#E5E7EB', color: selectedDesigns.includes(design.designId) ? 'white' : '#6B7280' }}>
            {design.designName}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-4 px-4">
        <span className="text-sm font-medium text-gray-700">Display:</span>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(['filled', 'outline', 'dots'] as RadarDisplayMode[]).map(mode => (
            <button key={mode} onClick={() => setDisplayMode(mode)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${displayMode === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        {displayMode === 'filled' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Opacity:</span>
            <input type="range" min="0.1" max="0.5" step="0.05" value={fillOpacity} onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
              className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            <span className="text-xs text-gray-500 w-8">{Math.round(fillOpacity * 100)}%</span>
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-1">
        <div className="flex-1 relative">
          <ChartControls colorMode={colorMode} availableColorModes={['default', 'gradient', 'performance', 'category']}
            onColorModeChange={(mode) => setColorMode(mode as RadarColorMode)} showGrid={showGrid} onToggleGrid={() => setShowGrid(!showGrid)}
            showLegend={showLegend} onToggleLegend={() => setShowLegend(!showLegend)} position="top-right" layout="compact" />

          {colorMode !== 'default' && colorMode !== 'category' && <ColorScaleLegend colorMode={colorMode} min={0} max={100} unit="score" position="bottom-left" />}

          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadarChart data={normalizedData}>
              {showGrid && <PolarGrid stroke="#E5E7EB" />}
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#374151' }} />
              <PolarRadiusAxis angle={90} domain={normalizeData ? [0, 100] : undefined} tick={{ fontSize: 10 }}
                tickFormatter={(value) => normalizeData ? `${value}` : value.toFixed(1)} />
              <Tooltip content={({ payload }) => {
                if (!payload?.[0]) return null;
                const metricLabel = payload[0].payload.metric;
                const metric = metrics.find(m => m.label === metricLabel);
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
                    <div className="font-bold mb-2">{metricLabel}</div>
                    <div className="space-y-1">
                      {payload.map((entry: { name: string; value: number; color: string }, idx: number) => {
                        const design = designs.find(d => d.designName === entry.name);
                        const rawValue = design?.values[metric?.metric || ''];
                        return (
                          <div key={idx} className="flex justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                              <span className="text-gray-700">{entry.name}:</span>
                            </div>
                            <div className="text-right">
                              {normalizeData && <span className="font-bold text-gray-900">{entry.value?.toFixed(1)}</span>}
                              {rawValue !== undefined && <span className="text-xs text-gray-500 ml-2">({rawValue.toFixed(2)} {metric?.unit || ''})</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }} />
              {showLegend && <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />}
              {visibleDesigns.map((design, idx) => (
                <Radar key={design.designId} name={design.designName} dataKey={design.designName} stroke={getDesignColor(design, idx)}
                  fill={getDesignColor(design, idx)} fillOpacity={getFillOpacity()} strokeWidth={displayMode === 'dots' ? 0 : 2}
                  dot={displayMode === 'dots' ? { r: 4, fill: getDesignColor(design, idx) } : false} />
              ))}
            </RechartsRadarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-64 bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Overall Scores</h4>
          <div className="space-y-3">
            {overallScores.map((score, idx) => {
              const design = designs.find(d => d.designId === score.designId);
              if (!design) return null;
              const designIdx = designs.indexOf(design);
              return (
                <div key={score.designId} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: getDesignColor(design, designIdx) }} />
                      <span className="text-sm font-medium text-gray-900">{score.designName}</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: getDesignColor(design, designIdx) }}>{score.score.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${score.score}%`, backgroundColor: getDesignColor(design, designIdx) }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Metrics</h4>
            <div className="space-y-1 text-xs text-gray-600">
              {metrics.map(metric => (
                <div key={metric.metric} className="flex items-center justify-between">
                  <span>{metric.label}</span>
                  {metric.higherIsBetter === false && <span className="text-orange-600">↓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
