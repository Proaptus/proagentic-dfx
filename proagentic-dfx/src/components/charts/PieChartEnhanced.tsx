'use client';

import { useMemo, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector, PieLabelRenderProps } from 'recharts';
import { ChartControls, ColorScaleLegend } from './ChartControls';
import type { ColorMode } from '@/lib/charts/chart-utils';
import { interpolateColor, SEQUENTIAL_SCALES, PRIMARY_COLORS } from '@/lib/charts/chart-utils';

export interface PieDataItem {
  name: string;
  value: number;
  color?: string;
  category?: string;
}

interface PieChartEnhancedProps {
  data: PieDataItem[];
  title?: string;
  unit?: string;
  showPercentages?: boolean;
  showValues?: boolean;
  innerRadius?: number;
  compactMode?: boolean;
  onExport?: (format: 'png' | 'svg') => void;
}

type PieColorMode = 'default' | 'gradient' | 'sequential' | 'warm' | 'cool';
type PieDisplayMode = 'pie' | 'donut' | 'semi';

const PIE_COLOR_MODE_LABELS: Record<PieColorMode, string> = {
  default: 'Default',
  gradient: 'Gradient',
  sequential: 'Sequential',
  warm: 'Warm',
  cool: 'Cool',
};

interface ActiveShapeProps {
  cx: number; cy: number; innerRadius: number; outerRadius: number;
  startAngle: number; endAngle: number; fill: string;
  payload: PieDataItem; percent: number; value: number; unit: string;
}

const renderActiveShape = (props: ActiveShapeProps): React.ReactElement => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value, unit } = props;
  const safeValue = value ?? 0;
  const safePercent = percent ?? 0;
  const safeName = payload?.name ?? '';
  return (
    <g>
      <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">{safeName}</text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#374151" className="text-base">{safeValue.toLocaleString()} {unit}</text>
      <text x={cx} y={cy + 30} dy={8} textAnchor="middle" fill="#6B7280" className="text-sm">({(safePercent * 100).toFixed(1)}%)</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

export function PieChartEnhanced({
  data, title = 'Distribution', unit = '', showPercentages = true, showValues: _showValues = true, innerRadius = 0, compactMode = false, onExport
}: PieChartEnhancedProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [colorMode, setColorMode] = useState<PieColorMode>('default');
  const [displayMode, setDisplayMode] = useState<PieDisplayMode>(innerRadius > 0 ? 'donut' : 'pie');
  const [showLegend, setShowLegend] = useState(!compactMode);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'none'>('desc');

  const getInnerRadius = useCallback(() => {
    if (displayMode === 'donut') return '50%';
    if (displayMode === 'semi') return '60%';
    return 0;
  }, [displayMode]);

  const getStartAngle = useCallback(() => displayMode === 'semi' ? 180 : 0, [displayMode]);
  const getEndAngle = useCallback(() => displayMode === 'semi' ? 0 : 360, [displayMode]);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const validData = data.filter(item => item && typeof item.value === 'number');
    if (validData.length === 0) return [];
    const total = validData.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return [];
    const maxValue = Math.max(...validData.map(d => d.value));

    const sorted = validData.map((item, index) => {
      let color = item.color || PRIMARY_COLORS[index % PRIMARY_COLORS.length];
      const normalized = maxValue > 0 ? item.value / maxValue : 0;

      if (colorMode === 'gradient') color = interpolateColor(SEQUENTIAL_SCALES.blue, normalized);
      else if (colorMode === 'sequential') color = interpolateColor(SEQUENTIAL_SCALES.purple, normalized);
      else if (colorMode === 'warm') color = interpolateColor(SEQUENTIAL_SCALES.orange, normalized);
      else if (colorMode === 'cool') color = interpolateColor(SEQUENTIAL_SCALES.green, normalized);

      return { ...item, color, percentage: (item.value / total) * 100, normalized };
    });

    if (sortOrder === 'desc') sorted.sort((a, b) => b.value - a.value);
    else if (sortOrder === 'asc') sorted.sort((a, b) => a.value - b.value);

    return sorted;
  }, [data, colorMode, sortOrder]);

  const total = useMemo(() => processedData.reduce((sum, item) => sum + item.value, 0), [processedData]);

  const renderLabel = (props: PieLabelRenderProps) => {
    if (!showPercentages) return '';
    const percentage = props.percent ? (props.percent * 100).toFixed(1) : '0';
    return `${percentage}%`;
  };

  const onPieEnter = (_: unknown, index: number) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);

  // Guard against empty data after processing
  if (processedData.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500">
        <div className="text-lg font-medium">{title}</div>
        <div className="text-sm">No data available</div>
      </div>
    );
  }

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

      {/* Display Mode Controls - hidden in compact mode */}
      {!compactMode && (
        <div className="flex items-center gap-4 mb-4 px-4">
          <span className="text-sm font-medium text-gray-700">Display:</span>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {(['pie', 'donut', 'semi'] as PieDisplayMode[]).map(mode => (
              <button key={mode} onClick={() => setDisplayMode(mode)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${displayMode === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700 ml-4">Sort:</span>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            className="text-xs border border-gray-300 rounded px-2 py-1">
            <option value="desc">Largest First</option>
            <option value="asc">Smallest First</option>
            <option value="none">Original Order</option>
          </select>
        </div>
      )}

      <div className="flex gap-6 flex-1">
        <div className="flex-1 relative">
          {!compactMode && (
            <ChartControls<PieColorMode>
              colorMode={colorMode}
              availableColorModes={['default', 'gradient', 'sequential', 'warm', 'cool']}
              onColorModeChange={setColorMode}
              colorModeLabels={PIE_COLOR_MODE_LABELS}
              showLegend={showLegend}
              onToggleLegend={() => setShowLegend(!showLegend)}
              position="top-right"
              layout="compact"
            />
          )}

          {!compactMode && colorMode !== 'default' && <ColorScaleLegend colorMode="performance" position="bottom-left" />}

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={processedData} cx="50%" cy={displayMode === 'semi' ? '80%' : '50%'} labelLine={showPercentages} label={renderLabel}
                outerRadius="80%" innerRadius={getInnerRadius()} startAngle={getStartAngle()} endAngle={getEndAngle()}
                fill="#8884d8" dataKey="value" onMouseEnter={onPieEnter} onMouseLeave={onPieLeave}
                {...(activeIndex !== null && { activeIndex, activeShape: (props: unknown) => renderActiveShape({ ...(props as ActiveShapeProps), unit }) })}>
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={({ payload }) => {
                if (!payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
                    <div className="font-bold mb-2" style={{ color: d.color }}>{d.name}</div>
                    <div className="space-y-1 text-gray-600">
                      <div className="flex justify-between gap-4"><span>Value:</span><span className="font-bold text-gray-900">{d.value.toLocaleString()} {unit}</span></div>
                      <div className="flex justify-between gap-4"><span>Percentage:</span><span className="font-bold" style={{ color: d.color }}>{d.percentage.toFixed(2)}%</span></div>
                      {d.category && <div className="flex justify-between gap-4 pt-1 border-t"><span>Category:</span><span className="font-medium text-gray-900">{d.category}</span></div>}
                    </div>
                  </div>
                );
              }} />
            </PieChart>
          </ResponsiveContainer>

          {(displayMode === 'donut' || displayMode === 'semi') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: displayMode === 'semi' ? '40%' : 0 }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{total.toLocaleString()}</div>
                <div className="text-sm text-gray-600 font-medium">Total {unit}</div>
              </div>
            </div>
          )}

          {/* Compact inline legend */}
          {compactMode && (
            <div className="absolute bottom-0 left-0 right-0 px-2 py-2 bg-white/90 border-t">
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs">
                {processedData.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-500">({item.percentage.toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showLegend && !compactMode && (
          <div className="w-80 bg-gray-50 rounded-lg border border-gray-200 p-4 overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Breakdown Details</h4>
            <div className="mb-4 p-3 bg-white rounded-lg border border-gray-300">
              <div className="text-xs text-gray-600 font-medium">Total</div>
              <div className="text-2xl font-bold text-gray-900">{total.toLocaleString()} {unit}</div>
            </div>
            <div className="space-y-2">
              {processedData.map((item, index) => (
                <div key={index}
                  className={`p-3 bg-white rounded-lg border transition-all cursor-pointer ${activeIndex === index ? 'border-gray-400 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-gray-600">Value:</span><span className="font-bold text-gray-900">{item.value.toLocaleString()} {unit}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Percentage:</span><span className="font-bold" style={{ color: item.color }}>{item.percentage.toFixed(2)}%</span></div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-300">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Statistics</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between"><span>Largest:</span><span className="font-medium text-gray-900">{processedData[0]?.name} ({processedData[0]?.percentage.toFixed(1)}%)</span></div>
                <div className="flex justify-between"><span>Smallest:</span><span className="font-medium text-gray-900">{processedData[processedData.length - 1]?.name} ({processedData[processedData.length - 1]?.percentage.toFixed(1)}%)</span></div>
                <div className="flex justify-between"><span>Items:</span><span className="font-medium text-gray-900">{processedData.length}</span></div>
                <div className="flex justify-between"><span>Average:</span><span className="font-medium text-gray-900">{(total / processedData.length).toLocaleString(undefined, { maximumFractionDigits: 0 })} {unit}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
