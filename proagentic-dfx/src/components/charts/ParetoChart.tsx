'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import type { ParetoDesign } from '@/lib/types';

interface ParetoChartProps {
  designs: ParetoDesign[];
  xAxis: 'weight_kg' | 'cost_eur' | 'p_failure' | 'fatigue_life_cycles' | 'permeation_rate';
  yAxis: 'weight_kg' | 'cost_eur' | 'p_failure' | 'burst_pressure_bar' | 'burst_ratio' | 'volumetric_efficiency';
  selectedIds: string[];
  onSelect: (id: string) => void;
  recommendedId?: string;
}

const AXIS_CONFIG: Record<string, { label: string; key: string }> = {
  weight_kg: { label: 'Weight (kg)', key: 'weight_kg' },
  cost_eur: { label: 'Cost (€)', key: 'cost_eur' },
  p_failure: { label: 'P(failure)', key: 'p_failure' },
  burst_pressure_bar: { label: 'Burst Pressure (bar)', key: 'burst_pressure_bar' },
  burst_ratio: { label: 'Burst Ratio', key: 'burst_ratio' },
  fatigue_life_cycles: { label: 'Fatigue Life (cycles)', key: 'fatigue_life_cycles' },
  permeation_rate: { label: 'Permeation (ml/L/hr)', key: 'permeation_rate' },
  volumetric_efficiency: { label: 'Vol. Efficiency', key: 'volumetric_efficiency' },
};

// Correct color mapping for actual data categories
const CATEGORY_COLORS: Record<string, string> = {
  lightest: '#10B981',      // green-500
  balanced: '#06B6D4',      // cyan-500
  recommended: '#8B5CF6',   // violet-500
  conservative: '#64748B',  // slate-500
  max_margin: '#A855F7',    // purple-500
};

const SELECTED_COLOR = '#3B82F6';  // blue-500
const DEFAULT_COLOR = '#9CA3AF';   // gray-400

export function ParetoChart({ designs, xAxis, yAxis, selectedIds, onSelect, recommendedId }: ParetoChartProps) {
  const xConfig = AXIS_CONFIG[xAxis];
  const yConfig = AXIS_CONFIG[yAxis];

  // Process data for scatter plot
  const scatterData = useMemo(() => {
    return designs.map(d => {
      const { id, trade_off_category, weight_kg, cost_eur, burst_pressure_bar, burst_ratio, p_failure, fatigue_life_cycles, permeation_rate, volumetric_efficiency } = d;
      return {
        id,
        x: d[xConfig.key as keyof ParetoDesign] as number,
        y: d[yConfig.key as keyof ParetoDesign] as number,
        z: selectedIds.includes(id) ? 250 : (id === recommendedId ? 200 : 120),
        tradeOff: trade_off_category,
        weight_kg,
        cost_eur,
        burst_pressure_bar,
        burst_ratio,
        p_failure,
        fatigue_life_cycles,
        permeation_rate,
        volumetric_efficiency,
        trade_off_category,
      };
    });
  }, [designs, xConfig.key, yConfig.key, selectedIds, recommendedId]);

  // Create Pareto front line data - sort by x value to connect the frontier
  const paretoFrontLine = useMemo(() => {
    const sorted = [...scatterData].sort((a, b) => a.x - b.x);
    return sorted;
  }, [scatterData]);

  // Calculate domain with padding for better visualization
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
      xDomain: [Math.max(0, xMin - xPadding), xMax + xPadding],
      yDomain: [Math.max(0, yMin - yPadding), yMax + yPadding],
    };
  }, [scatterData]);

  const getColor = (id: string, tradeOff?: string) => {
    // Selected designs get blue
    if (selectedIds.includes(id)) return SELECTED_COLOR;

    // Use category color if available
    if (tradeOff && CATEGORY_COLORS[tradeOff]) {
      return CATEGORY_COLORS[tradeOff];
    }

    return DEFAULT_COLOR;
  };

  // Get point size based on status
  const getPointSize = (id: string) => {
    if (selectedIds.includes(id)) return 180;
    if (id === recommendedId) return 160;
    return 100;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        margin={{ top: 20, right: 30, bottom: 60, left: 70 }}
        data={paretoFrontLine}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="x"
          name={xConfig.label}
          type="number"
          domain={xDomain}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value.toFixed(0)}
          label={{ value: xConfig.label, position: 'bottom', offset: 40, style: { fontWeight: 600 } }}
        />
        <YAxis
          dataKey="y"
          name={yConfig.label}
          type="number"
          domain={yDomain}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value.toFixed(0)}
          label={{ value: yConfig.label, angle: -90, position: 'left', offset: 50, style: { fontWeight: 600 } }}
        />
        <ZAxis dataKey="z" range={[60, 250]} />

        {/* Pareto Front Line - connects all points showing the frontier */}
        <Line
          type="monotone"
          dataKey="y"
          stroke="#94A3B8"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          legendType="none"
          name="Pareto Front"
        />

        {/* Reference line for recommended design */}
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
            const d = payload[0].payload as ParetoDesign & { x: number; y: number };
            const isRecommended = d.id === recommendedId;
            const isSelected = selectedIds.includes(d.id);

            return (
              <div className="bg-white p-3 rounded-lg shadow-lg border text-sm min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">Design {d.id}</span>
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
                <div className="space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span className="font-medium text-gray-900">{d.weight_kg?.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="font-medium text-gray-900">€{d.cost_eur?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Burst:</span>
                    <span className="font-medium text-gray-900">{d.burst_pressure_bar?.toFixed(0)} bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Burst Ratio:</span>
                    <span className="font-medium text-gray-900">{d.burst_ratio?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>P(failure):</span>
                    <span className="font-medium text-gray-900">{d.p_failure?.toExponential(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fatigue:</span>
                    <span className="font-medium text-gray-900">{d.fatigue_life_cycles?.toLocaleString()} cyc</span>
                  </div>
                </div>
                {d.trade_off_category && (
                  <div
                    className="mt-2 pt-2 border-t text-center font-medium capitalize"
                    style={{ color: CATEGORY_COLORS[d.trade_off_category] || DEFAULT_COLOR }}
                  >
                    {d.trade_off_category.replace(/_/g, ' ')}
                  </div>
                )}
              </div>
            );
          }}
        />

        {/* Scatter points - rendered on top of line */}
        <Scatter
          name="Pareto Designs"
          data={scatterData}
          onClick={(e: { id: string }) => onSelect(e.id)}
          style={{ cursor: 'pointer' }}
        >
          {scatterData.map((entry) => (
            <Cell
              key={entry.id}
              fill={getColor(entry.id, entry.tradeOff)}
              stroke={selectedIds.includes(entry.id) ? '#1E40AF' : (entry.id === recommendedId ? '#6D28D9' : 'white')}
              strokeWidth={selectedIds.includes(entry.id) ? 3 : (entry.id === recommendedId ? 2 : 1)}
              r={Math.sqrt(getPointSize(entry.id) / Math.PI)}
            />
          ))}
        </Scatter>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
