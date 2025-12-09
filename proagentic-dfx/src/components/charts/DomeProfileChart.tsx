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
import { calculateIsotensoidProfile } from '@/lib/cad/tank-geometry';

interface DomeParameters {
  cylinderRadius: number;
  windingAngle: number;
  bossRadius: number;
  domeDepth: number;
}

interface DomeProfileChartProps {
  parameters: DomeParameters;
  title?: string;
  showAnnotations?: boolean;
  showComparison?: boolean;
  comparisonAngle?: number;
  onParameterChange?: (param: keyof DomeParameters, value: number) => void;
}

interface ProfilePoint {
  r: number;
  z: number;
  alpha?: number;
  comparison_r?: number;
}

export function DomeProfileChart({
  parameters,
  title = 'Isotensoid Dome Profile',
  showAnnotations = true,
  showComparison = false,
  comparisonAngle = 45,
}: DomeProfileChartProps) {
  const [showTheoreticalLine, setShowTheoreticalLine] = useState(true);
  const [showStressRegions, setShowStressRegions] = useState(false);

  // Calculate primary profile
  const primaryProfile = useMemo(() => {
    const { cylinderRadius, windingAngle, bossRadius, domeDepth } = parameters;
    return calculateIsotensoidProfile(
      cylinderRadius,
      windingAngle,
      bossRadius,
      domeDepth,
      100
    );
  }, [parameters]);

  // Calculate comparison profile if enabled
  const comparisonProfile = useMemo(() => {
    if (!showComparison) return null;
    const { cylinderRadius, bossRadius, domeDepth } = parameters;
    return calculateIsotensoidProfile(
      cylinderRadius,
      comparisonAngle,
      bossRadius,
      domeDepth,
      100
    );
  }, [parameters, showComparison, comparisonAngle]);

  // Merge profiles for chart data
  const chartData: ProfilePoint[] = useMemo(() => {
    return primaryProfile.map((pt, i) => ({
      ...pt,
      alpha: parameters.windingAngle + (90 - parameters.windingAngle) * (1 - i / primaryProfile.length),
      comparison_r: comparisonProfile?.[i]?.r,
    }));
  }, [primaryProfile, comparisonProfile, parameters.windingAngle]);

  // Calculate statistics
  const stats = useMemo(() => {
    const radii = primaryProfile.map(p => p.r);
    const maxRadius = Math.max(...radii);
    const minRadius = Math.min(...radii);
    const aspectRatio = parameters.domeDepth / parameters.cylinderRadius;
    const volumeApprox = primaryProfile.reduce((sum, p, i) => {
      if (i === 0) return 0;
      const dz = primaryProfile[i - 1].z - p.z;
      const avgR = (primaryProfile[i - 1].r + p.r) / 2;
      return sum + Math.PI * avgR * avgR * dz;
    }, 0);

    return {
      maxRadius,
      minRadius,
      aspectRatio,
      volumeApprox: volumeApprox / 1e6, // Convert to liters
      bossRatio: parameters.bossRadius / parameters.cylinderRadius,
    };
  }, [primaryProfile, parameters]);

  // Stress region bands (simplified)
  const stressRegions = useMemo(() => {
    if (!showStressRegions) return [];
    return [
      { zStart: 0, zEnd: parameters.domeDepth * 0.3, label: 'High Stress Zone', color: '#EF4444' },
      { zStart: parameters.domeDepth * 0.3, zEnd: parameters.domeDepth * 0.7, label: 'Transition Zone', color: '#F59E0B' },
      { zStart: parameters.domeDepth * 0.7, zEnd: parameters.domeDepth, label: 'Boss Region', color: '#10B981' },
    ];
  }, [showStressRegions, parameters.domeDepth]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Based on netting theory: r = R₀ × sin(α₀) / sin(α)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showTheoreticalLine}
              onChange={(e) => setShowTheoreticalLine(e.target.checked)}
              className="rounded border-gray-300 dark:border-slate-600"
            />
            Theoretical Reference
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showStressRegions}
              onChange={(e) => setShowStressRegions(e.target.checked)}
              className="rounded border-gray-300 dark:border-slate-600"
            />
            Stress Regions
          </label>
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="grid grid-cols-5 gap-3 p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Cylinder Radius</div>
          <div className="text-base font-bold text-blue-900 dark:text-blue-100">
            {parameters.cylinderRadius.toFixed(1)} mm
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <div className="text-xs text-green-600 dark:text-green-400 font-medium">Dome Depth</div>
          <div className="text-base font-bold text-green-900 dark:text-green-100">
            {parameters.domeDepth.toFixed(1)} mm
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Winding Angle</div>
          <div className="text-base font-bold text-purple-900 dark:text-purple-100">
            {parameters.windingAngle.toFixed(1)}°
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Aspect Ratio</div>
          <div className="text-base font-bold text-orange-900 dark:text-orange-100">
            {stats.aspectRatio.toFixed(3)}
          </div>
        </div>
        <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3 border border-pink-200 dark:border-pink-800">
          <div className="text-xs text-pink-600 dark:text-pink-400 font-medium">Dome Volume</div>
          <div className="text-base font-bold text-pink-900 dark:text-pink-100">
            {stats.volumeApprox.toFixed(2)} L
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, bottom: 60, left: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-slate-700" />

            <XAxis
              dataKey="z"
              type="number"
              domain={[0, 'dataMax']}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toFixed(0)}
              label={{
                value: 'Axial Position (mm)',
                position: 'bottom',
                offset: 40,
                style: { fontWeight: 600 }
              }}
            />

            <YAxis
              dataKey="r"
              type="number"
              domain={[0, 'dataMax']}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toFixed(0)}
              label={{
                value: 'Radius (mm)',
                angle: -90,
                position: 'left',
                offset: 50,
                style: { fontWeight: 600 }
              }}
            />

            {/* Stress region bands */}
            {stressRegions.map((region, idx) => (
              <Area
                key={idx}
                type="monotone"
                dataKey={(d: ProfilePoint) =>
                  d.z >= region.zStart && d.z <= region.zEnd ? d.r : null
                }
                fill={region.color}
                fillOpacity={0.15}
                stroke="none"
                name={region.label}
                connectNulls={false}
              />
            ))}

            {/* Reference lines */}
            {showAnnotations && (
              <>
                <ReferenceLine
                  y={parameters.cylinderRadius}
                  stroke="#6366F1"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  label={{ value: 'R₀', position: 'right', fill: '#6366F1', fontSize: 10 }}
                />
                <ReferenceLine
                  y={parameters.bossRadius}
                  stroke="#10B981"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  label={{ value: 'Boss', position: 'right', fill: '#10B981', fontSize: 10 }}
                />
              </>
            )}

            {/* Theoretical hemispherical reference */}
            {showTheoreticalLine && (
              <Line
                type="monotone"
                dataKey={(d: ProfilePoint) => {
                  // Hemispherical profile for comparison
                  const t = d.z / parameters.domeDepth;
                  return parameters.cylinderRadius * Math.sqrt(1 - t * t);
                }}
                stroke="#94A3B8"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Hemispherical"
              />
            )}

            {/* Comparison profile */}
            {showComparison && comparisonProfile && (
              <Line
                type="monotone"
                dataKey="comparison_r"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name={`α₀=${comparisonAngle}°`}
              />
            )}

            {/* Primary isotensoid profile */}
            <Line
              type="monotone"
              dataKey="r"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
              name={`Isotensoid (α₀=${parameters.windingAngle}°)`}
              activeDot={{
                r: 6,
                fill: '#3B82F6',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />

            <Tooltip
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const d = payload[0].payload as ProfilePoint;

                return (
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 text-sm">
                    <div className="font-bold mb-2 text-gray-900 dark:text-white">
                      Profile Point
                    </div>
                    <div className="space-y-1 text-gray-600 dark:text-slate-300">
                      <div className="flex justify-between gap-4">
                        <span>Axial (z):</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {d.z.toFixed(2)} mm
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Radius (r):</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {d.r.toFixed(2)} mm
                        </span>
                      </div>
                      {d.alpha && (
                        <div className="flex justify-between gap-4 pt-1 border-t border-gray-200 dark:border-slate-600">
                          <span>Angle (α):</span>
                          <span className="font-medium text-purple-600 dark:text-purple-400">
                            {d.alpha.toFixed(1)}°
                          </span>
                        </div>
                      )}
                      {d.comparison_r && (
                        <div className="flex justify-between gap-4">
                          <span>Compare r:</span>
                          <span className="font-medium text-orange-600 dark:text-orange-400">
                            {d.comparison_r.toFixed(2)} mm
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="line" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Formula Reference */}
      {showAnnotations && (
        <div className="px-4 pb-4 text-xs text-gray-500 dark:text-slate-500 border-t border-gray-200 dark:border-slate-700 pt-3">
          <span className="font-medium">Isotensoid Equation:</span>{' '}
          <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded">
            r = R₀ × sin(α₀) / sin(α)
          </code>
          {' '}where α varies from 90° at apex to α₀ at cylinder junction
        </div>
      )}
    </div>
  );
}
