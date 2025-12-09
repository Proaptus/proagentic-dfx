'use client';

import { useMemo, useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export interface ProfileDataPoint {
  position: number;
  value: number;
  secondaryValue?: number;
  region?: string;
}

interface RegionAnnotation {
  start: number;
  end: number;
  label: string;
  color: string;
}

interface LineProfileChartProps {
  data: ProfileDataPoint[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  secondaryYLabel?: string;
  unit?: string;
  secondaryUnit?: string;
  regions?: RegionAnnotation[];
  showRegionBands?: boolean;
  dualAxis?: boolean;
  onExport?: (format: 'png' | 'svg') => void;
}

export function LineProfileChart({
  data,
  title = 'Engineering Profile',
  xLabel = 'Position',
  yLabel = 'Value',
  secondaryYLabel = 'Secondary Value',
  unit = 'mm',
  secondaryUnit = 'MPa',
  regions,
  showRegionBands = true,
  dualAxis = false,
  onExport,
}: LineProfileChartProps) {
  const [showSecondary, setShowSecondary] = useState(true);
  const [highlightedRegion, setHighlightedRegion] = useState<string | null>(null);

  // Calculate statistics
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const values = data.map(d => d.value);
    const secondaryValues = data.map(d => d.secondaryValue).filter(v => v !== undefined) as number[];

    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

    const secondaryMax = secondaryValues.length > 0 ? Math.max(...secondaryValues) : 0;
    const secondaryMin = secondaryValues.length > 0 ? Math.min(...secondaryValues) : 0;
    const secondaryAvg = secondaryValues.length > 0
      ? secondaryValues.reduce((sum, v) => sum + v, 0) / secondaryValues.length
      : 0;

    return {
      primary: { max, min, avg, range: max - min },
      secondary: { max: secondaryMax, min: secondaryMin, avg: secondaryAvg, range: secondaryMax - secondaryMin },
    };
  }, [data]);

  // Calculate y-axis domains
  const { yDomain, secondaryYDomain } = useMemo(() => {
    if (!stats) return { yDomain: [0, 100], secondaryYDomain: [0, 100] };

    const padding = stats.primary.range * 0.1;
    const secondaryPadding = stats.secondary.range * 0.1;

    return {
      yDomain: [
        Math.max(0, stats.primary.min - padding),
        stats.primary.max + padding,
      ],
      secondaryYDomain: [
        Math.max(0, stats.secondary.min - secondaryPadding),
        stats.secondary.max + secondaryPadding,
      ],
    };
  }, [stats]);

  // Create region band data
  const regionBands = useMemo(() => {
    if (!regions || !showRegionBands) return [];

    return regions.map(region => {
      const regionData = data.filter(
        d => d.position >= region.start && d.position <= region.end
      );

      if (regionData.length === 0) return null;

      const maxValue = Math.max(...regionData.map(d => d.value));

      return {
        ...region,
        maxValue,
      };
    }).filter((r): r is RegionAnnotation & { maxValue: number } => r !== null);
  }, [regions, data, showRegionBands]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        <div className="flex items-center gap-4">
          {dualAxis && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showSecondary}
                onChange={(e) => setShowSecondary(e.target.checked)}
                className="rounded"
              />
              Show {secondaryYLabel}
            </label>
          )}

          {regions && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showRegionBands}
                onChange={(_e) => setHighlightedRegion(null)}
                className="rounded"
              />
              Show Region Bands
            </label>
          )}

          {onExport && (
            <div className="flex gap-1">
              <button
                onClick={() => onExport('png')}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              >
                PNG
              </button>
              <button
                onClick={() => onExport('svg')}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              >
                SVG
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Panel */}
      {stats && (
        <div className="grid grid-cols-6 gap-3 mb-4 px-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-xs text-blue-600 font-medium">Max {yLabel}</div>
            <div className="text-base font-bold text-blue-900">
              {stats.primary.max.toFixed(2)} {unit}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="text-xs text-green-600 font-medium">Min {yLabel}</div>
            <div className="text-base font-bold text-green-900">
              {stats.primary.min.toFixed(2)} {unit}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="text-xs text-purple-600 font-medium">Avg {yLabel}</div>
            <div className="text-base font-bold text-purple-900">
              {stats.primary.avg.toFixed(2)} {unit}
            </div>
          </div>
          {dualAxis && showSecondary && (
            <>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <div className="text-xs text-orange-600 font-medium">Max {secondaryYLabel}</div>
                <div className="text-base font-bold text-orange-900">
                  {stats.secondary.max.toFixed(2)} {secondaryUnit}
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="text-xs text-red-600 font-medium">Min {secondaryYLabel}</div>
                <div className="text-base font-bold text-red-900">
                  {stats.secondary.min.toFixed(2)} {secondaryUnit}
                </div>
              </div>
              <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                <div className="text-xs text-pink-600 font-medium">Avg {secondaryYLabel}</div>
                <div className="text-base font-bold text-pink-900">
                  {stats.secondary.avg.toFixed(2)} {secondaryUnit}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: dualAxis ? 80 : 30, bottom: 60, left: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

          <XAxis
            dataKey="position"
            type="number"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(0)}
            label={{ value: `${xLabel} (mm)`, position: 'bottom', offset: 40, style: { fontWeight: 600 } }}
          />

          <YAxis
            yAxisId="left"
            domain={yDomain}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(1)}
            label={{ value: `${yLabel} (${unit})`, angle: -90, position: 'left', offset: 50, style: { fontWeight: 600 } }}
          />

          {dualAxis && showSecondary && (
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={secondaryYDomain}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toFixed(0)}
              label={{ value: `${secondaryYLabel} (${secondaryUnit})`, angle: 90, position: 'right', offset: 60, style: { fontWeight: 600 } }}
            />
          )}

          {/* Region bands */}
          {showRegionBands && regionBands.map((region: RegionAnnotation & { maxValue: number }, idx: number) => (
            <Area
              key={idx}
              type="monotone"
              dataKey={() => region.maxValue}
              yAxisId="left"
              fill={region.color}
              fillOpacity={highlightedRegion === region.label ? 0.3 : 0.1}
              stroke="none"
              name={region.label}
            />
          ))}

          {/* Average reference lines */}
          {stats && (
            <>
              <ReferenceLine
                yAxisId="left"
                y={stats.primary.avg}
                stroke="#3B82F6"
                strokeWidth={1}
                strokeDasharray="5 5"
                label={{ value: 'Avg', position: 'right', fill: '#3B82F6', fontSize: 10 }}
              />
              {dualAxis && showSecondary && stats.secondary.avg > 0 && (
                <ReferenceLine
                  yAxisId="right"
                  y={stats.secondary.avg}
                  stroke="#F59E0B"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  label={{ value: 'Avg', position: 'left', fill: '#F59E0B', fontSize: 10 }}
                />
              )}
            </>
          )}

          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null;
              const d = payload[0].payload as ProfileDataPoint;

              return (
                <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
                  <div className="font-bold mb-2">Position: {d.position.toFixed(1)} mm</div>
                  <div className="space-y-1 text-gray-600">
                    <div className="flex justify-between gap-4">
                      <span>{yLabel}:</span>
                      <span className="font-bold text-blue-600">
                        {d.value.toFixed(2)} {unit}
                      </span>
                    </div>
                    {d.secondaryValue !== undefined && showSecondary && (
                      <div className="flex justify-between gap-4">
                        <span>{secondaryYLabel}:</span>
                        <span className="font-bold text-orange-600">
                          {d.secondaryValue.toFixed(2)} {secondaryUnit}
                        </span>
                      </div>
                    )}
                    {d.region && (
                      <div className="flex justify-between gap-4 pt-1 border-t">
                        <span>Region:</span>
                        <span className="font-medium text-gray-900 capitalize">{d.region}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }}
          />

          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="line"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={(_e: any) => {
              if (_e.value && regions?.find(r => r.label === _e.value)) {
                setHighlightedRegion(highlightedRegion === _e.value ? null : String(_e.value));
              }
            }}
          />

          {/* Primary profile line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={false}
            name={yLabel}
          />

          {/* Secondary profile line */}
          {dualAxis && showSecondary && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="secondaryValue"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              name={secondaryYLabel}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Region Labels */}
      {regions && showRegionBands && (
        <div className="flex items-center justify-center gap-4 mt-3 px-4 text-xs flex-wrap">
          <span className="font-medium text-gray-700">Regions:</span>
          {regions.map((region) => (
            <button
              key={region.label}
              onClick={() => setHighlightedRegion(
                highlightedRegion === region.label ? null : region.label
              )}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${
                highlightedRegion === region.label
                  ? 'bg-gray-100 font-medium'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: region.color }}
              />
              <span className="text-gray-600">{region.label}</span>
              <span className="text-gray-400 text-xs">
                ({region.start}-{region.end} mm)
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
