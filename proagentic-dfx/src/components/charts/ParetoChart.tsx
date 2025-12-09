'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  ComposedChart,
  Scatter,
  Line,
  Area,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  Brush,
} from 'recharts';
import type { ParetoDesign } from '@/lib/types';
import { ChartControls, ColorScaleLegend } from './ChartControls';
import {
  type ChartType,
  type ColorMode,
  formatAxisTick,
  interpolateColor,
  CATEGORY_COLORS as SHARED_CATEGORY_COLORS,
  DIVERGING_SCALES,
  SEQUENTIAL_SCALES,
} from '@/lib/charts/chart-utils';

// ============================================================================
// Types
// ============================================================================

export type SizeMetric = 'none' | 'burst_ratio' | 'fatigue_life_cycles' | 'volumetric_efficiency' | 'p_failure';

interface ParetoChartProps {
  designs: ParetoDesign[];
  xAxis: 'weight_kg' | 'cost_eur' | 'p_failure' | 'fatigue_life_cycles' | 'permeation_rate';
  yAxis: 'weight_kg' | 'cost_eur' | 'p_failure' | 'burst_pressure_bar' | 'burst_ratio' | 'volumetric_efficiency';
  selectedIds: string[];
  onSelect: (id: string) => void;
  recommendedId?: string;
  // Enhanced features
  initialChartType?: ChartType;
  initialColorMode?: ColorMode;
  initialSizeMetric?: SizeMetric;
  showControls?: boolean;
  showBrush?: boolean;
  showReferenceAreas?: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

const AXIS_CONFIG: Record<string, { label: string; key: string; isScientific?: boolean; unit?: string }> = {
  weight_kg: { label: 'Weight (kg)', key: 'weight_kg', unit: 'kg' },
  cost_eur: { label: 'Cost (€)', key: 'cost_eur', unit: '€' },
  p_failure: { label: 'P(failure)', key: 'p_failure', isScientific: true },
  burst_pressure_bar: { label: 'Burst Pressure (bar)', key: 'burst_pressure_bar', unit: 'bar' },
  burst_ratio: { label: 'Burst Ratio', key: 'burst_ratio' },
  fatigue_life_cycles: { label: 'Fatigue Life (cycles)', key: 'fatigue_life_cycles', unit: 'cycles' },
  permeation_rate: { label: 'Permeation (ml/L/hr)', key: 'permeation_rate', unit: 'ml/L/hr' },
  volumetric_efficiency: { label: 'Vol. Efficiency', key: 'volumetric_efficiency' },
};

const CATEGORY_COLORS: Record<string, string> = {
  ...SHARED_CATEGORY_COLORS,
  lightest: '#10B981',
  balanced: '#06B6D4',
  recommended: '#8B5CF6',
  conservative: '#64748B',
  max_margin: '#A855F7',
};

const SELECTED_COLOR = '#3B82F6';
const DEFAULT_COLOR = '#9CA3AF';

const SIZE_METRIC_OPTIONS = [
  { value: 'none', label: 'Fixed Size' },
  { value: 'burst_ratio', label: 'Burst Ratio' },
  { value: 'fatigue_life_cycles', label: 'Fatigue Life' },
  { value: 'volumetric_efficiency', label: 'Vol. Efficiency' },
  { value: 'p_failure', label: 'Reliability' },
];

// ============================================================================
// Component
// ============================================================================

export function ParetoChart({
  designs,
  xAxis,
  yAxis,
  selectedIds,
  onSelect,
  recommendedId,
  initialChartType = 'scatter',
  initialColorMode = 'category',
  initialSizeMetric = 'none',
  showControls = true,
  showBrush = false,
  showReferenceAreas = true,
}: ParetoChartProps) {
  // State for chart configuration
  const [chartType, setChartType] = useState<ChartType>(initialChartType);
  const [colorMode, setColorMode] = useState<ColorMode>(initialColorMode);
  const [sizeMetric, setSizeMetric] = useState<SizeMetric>(initialSizeMetric);
  const [showGrid, setShowGrid] = useState(true);
  const [zoomDomain, setZoomDomain] = useState<{ x: [number, number]; y: [number, number] } | null>(null);

  const xConfig = AXIS_CONFIG[xAxis];
  const yConfig = AXIS_CONFIG[yAxis];

  // Calculate min/max for gradient normalization
  const { minPFailure, maxPFailure, minCost, maxCost, minSize, maxSize } = useMemo(() => {
    const pFailures = designs.map(d => d.p_failure || 0).filter(v => v > 0);
    const costs = designs.map(d => d.cost_eur || 0);

    let sizes: number[] = [100];
    if (sizeMetric !== 'none') {
      sizes = designs.map(d => {
        const val = d[sizeMetric as keyof ParetoDesign] as number;
        return val || 0;
      }).filter(v => v > 0);
    }

    return {
      minPFailure: pFailures.length ? Math.min(...pFailures) : 1e-10,
      maxPFailure: pFailures.length ? Math.max(...pFailures) : 1e-5,
      minCost: costs.length ? Math.min(...costs) : 0,
      maxCost: costs.length ? Math.max(...costs) : 1,
      minSize: sizes.length ? Math.min(...sizes) : 0,
      maxSize: sizes.length ? Math.max(...sizes) : 1,
    };
  }, [designs, sizeMetric]);

  // Get color based on mode
  const getColor = useCallback((id: string, design: ParetoDesign) => {
    if (selectedIds.includes(id)) return SELECTED_COLOR;

    switch (colorMode) {
      case 'gradient': {
        const xVal = design[xConfig.key as keyof ParetoDesign] as number;
        const xValues = designs.map(d => d[xConfig.key as keyof ParetoDesign] as number);
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const t = (xVal - xMin) / (xMax - xMin || 1);
        return interpolateColor(SEQUENTIAL_SCALES.purple, t);
      }
      case 'reliability': {
        const pf = design.p_failure || maxPFailure;
        const logMin = Math.log10(minPFailure);
        const logMax = Math.log10(maxPFailure);
        const logVal = Math.log10(pf);
        const tRel = 1 - (logVal - logMin) / (logMax - logMin || 1);
        return interpolateColor(DIVERGING_SCALES.redGreen, Math.max(0, Math.min(1, tRel)));
      }
      case 'cost': {
        const cost = design.cost_eur || maxCost;
        const tCost = 1 - (cost - minCost) / (maxCost - minCost || 1);
        return interpolateColor(DIVERGING_SCALES.redGreen, Math.max(0, Math.min(1, tCost)));
      }
      case 'performance': {
        const burst = design.burst_ratio || 2.0;
        const burstMin = Math.min(...designs.map(d => d.burst_ratio || 0));
        const burstMax = Math.max(...designs.map(d => d.burst_ratio || 0));
        const t = (burst - burstMin) / (burstMax - burstMin || 1);
        return interpolateColor(SEQUENTIAL_SCALES.blue, t);
      }
      case 'category':
      default:
        if (design.trade_off_category && CATEGORY_COLORS[design.trade_off_category]) {
          return CATEGORY_COLORS[design.trade_off_category];
        }
        return DEFAULT_COLOR;
    }
  }, [colorMode, selectedIds, designs, xConfig.key, minPFailure, maxPFailure, minCost, maxCost]);

  // Get point size based on metric
  const getPointSize = useCallback((id: string, design: ParetoDesign) => {
    const baseSize = selectedIds.includes(id) ? 220 : (id === recommendedId ? 190 : 130);

    if (sizeMetric === 'none') return baseSize;

    const val = design[sizeMetric as keyof ParetoDesign] as number;
    if (!val) return baseSize;

    let normalized: number;
    if (sizeMetric === 'p_failure') {
      const logMin = Math.log10(minPFailure || 1e-10);
      const logMax = Math.log10(maxPFailure || 1e-5);
      const logVal = Math.log10(val);
      normalized = 1.5 - ((logVal - logMin) / (logMax - logMin || 1));
    } else {
      normalized = 0.5 + ((val - minSize) / (maxSize - minSize || 1));
    }

    return baseSize * Math.max(0.5, Math.min(1.5, normalized));
  }, [sizeMetric, selectedIds, recommendedId, minPFailure, maxPFailure, minSize, maxSize]);

  // Process data
  const scatterData = useMemo(() => {
    return designs.map(d => ({
      id: d.id,
      x: d[xConfig.key as keyof ParetoDesign] as number,
      y: d[yConfig.key as keyof ParetoDesign] as number,
      z: getPointSize(d.id, d),
      tradeOff: d.trade_off_category,
      weight_kg: d.weight_kg,
      cost_eur: d.cost_eur,
      burst_pressure_bar: d.burst_pressure_bar,
      burst_ratio: d.burst_ratio,
      p_failure: d.p_failure,
      fatigue_life_cycles: d.fatigue_life_cycles,
      permeation_rate: d.permeation_rate,
      volumetric_efficiency: d.volumetric_efficiency,
      trade_off_category: d.trade_off_category,
      color: getColor(d.id, d),
    }));
  }, [designs, xConfig.key, yConfig.key, getPointSize, getColor]);

  const paretoFrontLine = useMemo(() => {
    return [...scatterData].sort((a, b) => a.x - b.x);
  }, [scatterData]);

  // Calculate domain
  const { xDomain, yDomain } = useMemo(() => {
    const xValues = scatterData.map(d => d.x);
    const yValues = scatterData.map(d => d.y);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const xPadding = (xMax - xMin) * 0.1;
    const yPadding = (yMax - yMin) * 0.1;

    return {
      xDomain: zoomDomain?.x || [Math.max(0, xMin - xPadding), xMax + xPadding] as [number, number],
      yDomain: zoomDomain?.y || [Math.max(0, yMin - yPadding), yMax + yPadding] as [number, number],
    };
  }, [scatterData, zoomDomain]);

  // Reference areas
  const referenceAreas = useMemo(() => {
    if (!showReferenceAreas) return null;
    const recommended = scatterData.find(d => d.id === recommendedId);
    if (!recommended) return null;

    return {
      optimal: {
        x1: xDomain[0],
        x2: recommended.x,
        y1: yDomain[0],
        y2: recommended.y,
      },
    };
  }, [showReferenceAreas, scatterData, recommendedId, xDomain, yDomain]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    const xRange = xDomain[1] - xDomain[0];
    const yRange = yDomain[1] - yDomain[0];
    const xCenter = (xDomain[0] + xDomain[1]) / 2;
    const yCenter = (yDomain[0] + yDomain[1]) / 2;
    setZoomDomain({
      x: [xCenter - xRange * 0.35, xCenter + xRange * 0.35],
      y: [yCenter - yRange * 0.35, yCenter + yRange * 0.35],
    });
  }, [xDomain, yDomain]);

  const handleZoomOut = useCallback(() => {
    const xRange = xDomain[1] - xDomain[0];
    const yRange = yDomain[1] - yDomain[0];
    const xCenter = (xDomain[0] + xDomain[1]) / 2;
    const yCenter = (yDomain[0] + yDomain[1]) / 2;
    setZoomDomain({
      x: [Math.max(0, xCenter - xRange * 0.75), xCenter + xRange * 0.75],
      y: [Math.max(0, yCenter - yRange * 0.75), yCenter + yRange * 0.75],
    });
  }, [xDomain, yDomain]);

  const handleZoomReset = useCallback(() => setZoomDomain(null), []);

  return (
    <div className="relative w-full h-full">
      {/* Controls */}
      {showControls && (
        <ChartControls
          chartType={chartType}
          availableChartTypes={['scatter', 'line', 'area']}
          onChartTypeChange={(type) => setChartType(type)}
          colorMode={colorMode}
          availableColorModes={['category', 'gradient', 'reliability', 'cost', 'performance']}
          onColorModeChange={(mode) => setColorMode(mode)}
          sizeMetric={sizeMetric}
          availableSizeMetrics={SIZE_METRIC_OPTIONS.filter(o => o.value !== 'none')}
          onSizeMetricChange={(metric) => setSizeMetric(metric as SizeMetric)}
          zoomEnabled={true}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          position="top-right"
        />
      )}

      {/* Color scale legend */}
      {colorMode !== 'category' && colorMode !== 'default' && (
        <ColorScaleLegend
          colorMode={colorMode}
          position="bottom-right"
        />
      )}

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          margin={{ top: 50, right: 30, bottom: 60, left: 70 }}
          data={paretoFrontLine}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}

          {/* Optimal region */}
          {referenceAreas && (
            <ReferenceArea
              x1={referenceAreas.optimal.x1}
              x2={referenceAreas.optimal.x2}
              y1={referenceAreas.optimal.y1}
              y2={referenceAreas.optimal.y2}
              fill="#22C55E"
              fillOpacity={0.05}
              stroke="#22C55E"
              strokeOpacity={0.2}
              strokeDasharray="3 3"
            />
          )}

          <XAxis
            dataKey="x"
            name={xConfig.label}
            type="number"
            domain={xDomain}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatAxisTick(value, xConfig.isScientific)}
            label={{ value: xConfig.label, position: 'bottom', offset: 40, style: { fontWeight: 600 } }}
          />
          <YAxis
            dataKey="y"
            name={yConfig.label}
            type="number"
            domain={yDomain}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatAxisTick(value, yConfig.isScientific)}
            label={{ value: yConfig.label, angle: -90, position: 'left', offset: 50, style: { fontWeight: 600 } }}
          />
          <ZAxis dataKey="z" range={[60, 350]} />

          {/* Area fill */}
          {chartType === 'area' && (
            <Area
              type="monotone"
              dataKey="y"
              stroke="#94A3B8"
              fill="#94A3B8"
              fillOpacity={0.1}
              strokeWidth={0}
            />
          )}

          {/* Pareto front line */}
          {(chartType === 'line' || chartType === 'area') && (
            <Line
              type="monotone"
              dataKey="y"
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray={chartType === 'area' ? '0' : '5 5'}
              dot={false}
              legendType="none"
            />
          )}

          {/* Reference lines for recommended */}
          {recommendedId && scatterData.find(d => d.id === recommendedId) && (
            <>
              <ReferenceLine
                x={scatterData.find(d => d.id === recommendedId)!.x}
                stroke="#8B5CF6"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <ReferenceLine
                y={scatterData.find(d => d.id === recommendedId)!.y}
                stroke="#8B5CF6"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            </>
          )}

          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null;
              const d = payload[0].payload;
              const isRecommended = d.id === recommendedId;
              const isSelected = selectedIds.includes(d.id);

              return (
                <div className="bg-white p-4 rounded-xl shadow-xl border text-sm min-w-[260px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-xl">Design {d.id}</span>
                    <div className="flex gap-1">
                      {isRecommended && (
                        <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
                          Recommended
                        </span>
                      )}
                      {isSelected && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-600 mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Weight:</span>
                      <span className="font-semibold text-gray-900">{d.weight_kg?.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cost:</span>
                      <span className="font-semibold text-gray-900">€{d.cost_eur?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Burst:</span>
                      <span className="font-semibold text-gray-900">{d.burst_pressure_bar?.toFixed(0)} bar</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ratio:</span>
                      <span className="font-semibold text-gray-900">{d.burst_ratio?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-lg p-2 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">P(failure):</span>
                      <span className="font-mono font-bold text-green-600">{d.p_failure?.toExponential(1)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-500 text-xs">Fatigue Life:</span>
                      <span className="font-semibold text-gray-900">{d.fatigue_life_cycles?.toLocaleString()} cyc</span>
                    </div>
                  </div>

                  {d.trade_off_category && (
                    <div
                      className="mt-2 pt-2 border-t text-center font-semibold capitalize text-sm"
                      style={{ color: CATEGORY_COLORS[d.trade_off_category] || DEFAULT_COLOR }}
                    >
                      {d.trade_off_category.replace(/_/g, ' ')} Design
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t text-center text-xs text-gray-400">
                    Click to {isSelected ? 'deselect' : 'select'} for comparison
                  </div>
                </div>
              );
            }}
          />

          <Scatter
            name="Pareto Designs"
            data={scatterData}
            onClick={(e: { id: string }) => onSelect(e.id)}
            style={{ cursor: 'pointer' }}
          >
            {scatterData.map((entry) => (
              <Cell
                key={entry.id}
                fill={entry.color}
                stroke={selectedIds.includes(entry.id) ? '#1E40AF' : (entry.id === recommendedId ? '#6D28D9' : 'white')}
                strokeWidth={selectedIds.includes(entry.id) ? 3 : (entry.id === recommendedId ? 2 : 1)}
                r={Math.sqrt(entry.z / Math.PI)}
              />
            ))}
          </Scatter>

          {showBrush && (
            <Brush
              dataKey="x"
              height={30}
              stroke="#8884d8"
              tickFormatter={(value) => formatAxisTick(value, xConfig.isScientific)}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
