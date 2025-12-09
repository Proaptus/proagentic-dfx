'use client';

import { useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Eye, EyeOff } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export interface RadarMetric {
  key: string;
  label: string;
  // Normalize function: convert raw value to 0-100 scale
  normalize: (value: number, allValues: number[]) => number;
}

export interface RadarDesignData {
  id: string;
  label: string;
  metrics: Record<string, number>;
  color?: string;
}

export interface RadarComparisonProps {
  designs: RadarDesignData[];
  metrics: RadarMetric[];
  title?: string;
}

// Custom tooltip component
interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  payload: Record<string, string | number>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  designs: RadarDesignData[];
}

const CustomTooltip = ({ active, payload, designs }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <div className="font-semibold text-gray-900 mb-2">{payload[0].payload.metric}</div>
      {payload.map((entry, index) => {
        const design = designs.find((d) => d.id === entry.name);
        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">{design?.label || entry.name}:</span>
            <span className="font-semibold text-gray-900">{entry.value.toFixed(1)}</span>
          </div>
        );
      })}
    </div>
  );
};

export function RadarComparison({ designs, metrics, title = 'Performance Radar' }: RadarComparisonProps) {
  const [visibleDesigns, setVisibleDesigns] = useState<Set<string>>(
    new Set(designs.map((d) => d.id))
  );
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
    new Set(metrics.map((m) => m.key))
  );

  const toggleDesign = (designId: string) => {
    const newVisible = new Set(visibleDesigns);
    if (newVisible.has(designId)) {
      newVisible.delete(designId);
    } else {
      newVisible.add(designId);
    }
    setVisibleDesigns(newVisible);
  };

  const toggleMetric = (metricKey: string) => {
    const newMetrics = new Set(selectedMetrics);
    if (newMetrics.has(metricKey)) {
      // Keep at least one metric
      if (newMetrics.size > 1) {
        newMetrics.delete(metricKey);
      }
    } else {
      newMetrics.add(metricKey);
    }
    setSelectedMetrics(newMetrics);
  };

  // Prepare radar chart data
  const radarData = metrics
    .filter((m) => selectedMetrics.has(m.key))
    .map((metric) => {
      const dataPoint: Record<string, string | number> = {
        metric: metric.label,
        fullMark: 100,
      };

      // Get all values for this metric for normalization
      const allValues = designs.map((d) => d.metrics[metric.key]);

      designs.forEach((design) => {
        const rawValue = design.metrics[metric.key];
        const normalizedValue = metric.normalize(rawValue, allValues);
        dataPoint[design.id] = normalizedValue;
      });

      return dataPoint;
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <div className="space-y-4">
        {/* Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
            />
            {designs.map((design, index) => {
              if (!visibleDesigns.has(design.id)) return null;

              const color = design.color || COLORS[index % COLORS.length];

              return (
                <Radar
                  key={design.id}
                  name={design.id}
                  dataKey={design.id}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              );
            })}
            <Tooltip content={<CustomTooltip designs={designs} />} />
          </RadarChart>
        </ResponsiveContainer>

        {/* Interactive Legend - Designs */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-700">Designs</div>
          <div className="flex flex-wrap gap-2">
            {designs.map((design, index) => {
              const color = design.color || COLORS[index % COLORS.length];
              const isVisible = visibleDesigns.has(design.id);

              return (
                <button
                  key={design.id}
                  onClick={() => toggleDesign(design.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    isVisible
                      ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: isVisible ? color : '#D1D5DB' }}
                  />
                  <span className="font-medium">{design.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Metric Selection */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-700">Metrics</div>
          <div className="flex flex-wrap gap-2">
            {metrics.map((metric) => {
              const isSelected = selectedMetrics.has(metric.key);

              return (
                <button
                  key={metric.key}
                  onClick={() => toggleMetric(metric.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {metric.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Normalized Scale Info */}
        <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
          <div className="font-semibold mb-1">Normalized Scale (0-100)</div>
          <p className="text-blue-600">
            All metrics are normalized to a 0-100 scale for comparison. Higher values are
            better for all displayed metrics.
          </p>
        </div>
      </div>
    </Card>
  );
}
