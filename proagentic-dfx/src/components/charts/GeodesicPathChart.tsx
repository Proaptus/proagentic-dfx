'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';
import { calculateIsotensoidProfile } from '@/lib/cad/tank-geometry';

interface GeodesicParameters {
  cylinderRadius: number;
  windingAngle: number;
  bossRadius: number;
  domeDepth: number;
  numPaths: number;
  startAngleOffset: number;
}

interface GeodesicPathChartProps {
  parameters: GeodesicParameters;
  title?: string;
  viewMode?: '2d-polar' | '2d-unwrapped' | '3d-projected';
  showCoverage?: boolean;
  highlightTurnaround?: boolean;
}

interface PathPoint {
  theta: number;
  phi: number;
  r: number;
  z: number;
  x?: number;
  y?: number;
  pathIndex: number;
  isTurnaround?: boolean;
}

/**
 * Calculate geodesic path on isotensoid dome surface
 * Geodesics follow the fiber path based on Clairaut's relation: r × sin(α) = constant
 */
function calculateGeodesicPath(
  profile: { r: number; z: number }[],
  windingAngle: number,
  startTheta: number,
  _numSteps: number = 200
): { theta: number; z: number; r: number; phi: number }[] {
  const alpha0 = (windingAngle * Math.PI) / 180;
  const R0 = profile[profile.length - 1].r; // Cylinder radius
  const clairautConstant = R0 * Math.sin(alpha0);

  const path: { theta: number; z: number; r: number; phi: number }[] = [];
  let theta = startTheta;

  // Forward pass (from cylinder to boss)
  for (let i = profile.length - 1; i >= 0; i--) {
    const { r, z } = profile[i];

    // Clairaut's relation: sin(alpha) = C / r
    const sinAlpha = Math.min(1, clairautConstant / r);
    const alpha = Math.asin(sinAlpha);

    // Calculate theta increment based on geodesic equation
    if (i < profile.length - 1) {
      const dr = profile[i + 1].r - r;
      const dz = z - profile[i + 1].z;
      const ds = Math.sqrt(dr * dr + dz * dz);
      const dTheta = (ds * Math.tan(alpha)) / r;
      theta += dTheta;
    }

    path.push({
      theta: theta * (180 / Math.PI),
      z,
      r,
      phi: (90 - alpha * (180 / Math.PI)),
    });
  }

  // Return pass (from boss back to cylinder with opposite winding)
  for (let i = 1; i < profile.length; i++) {
    const { r, z } = profile[i];

    const sinAlpha = Math.min(1, clairautConstant / r);
    const alpha = Math.asin(sinAlpha);

    const dr = r - profile[i - 1].r;
    const dz = profile[i - 1].z - z;
    const ds = Math.sqrt(dr * dr + dz * dz);
    const dTheta = (ds * Math.tan(alpha)) / r;
    theta -= dTheta;

    path.push({
      theta: theta * (180 / Math.PI),
      z,
      r,
      phi: (90 - alpha * (180 / Math.PI)),
    });
  }

  return path;
}

export function GeodesicPathChart({
  parameters,
  title = 'Geodesic Fiber Paths on Dome',
  viewMode = '2d-unwrapped',
  showCoverage = true,
  highlightTurnaround = true,
}: GeodesicPathChartProps) {
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [showAllPaths, setShowAllPaths] = useState(true);

  // Calculate dome profile
  const profile = useMemo(() => {
    const { cylinderRadius, windingAngle, bossRadius, domeDepth } = parameters;
    return calculateIsotensoidProfile(
      cylinderRadius,
      windingAngle,
      bossRadius,
      domeDepth,
      50
    );
  }, [parameters]);

  // Generate geodesic paths
  const geodesicPaths = useMemo(() => {
    const paths: PathPoint[][] = [];
    const angleStep = 360 / parameters.numPaths;

    for (let i = 0; i < parameters.numPaths; i++) {
      const startAngle = (parameters.startAngleOffset + i * angleStep) * (Math.PI / 180);
      const rawPath = calculateGeodesicPath(profile, parameters.windingAngle, startAngle);

      paths.push(
        rawPath.map((pt, idx) => ({
          ...pt,
          pathIndex: i,
          x: pt.r * Math.cos(pt.theta * (Math.PI / 180)),
          y: pt.r * Math.sin(pt.theta * (Math.PI / 180)),
          isTurnaround: idx === Math.floor(rawPath.length / 2),
        }))
      );
    }

    return paths;
  }, [profile, parameters]);

  // Flatten paths for scatter chart
  const flattenedPaths = useMemo(() => {
    if (!showAllPaths && selectedPath !== null) {
      return geodesicPaths[selectedPath] || [];
    }
    return geodesicPaths.flat();
  }, [geodesicPaths, showAllPaths, selectedPath]);

  // Calculate coverage statistics
  const coverageStats = useMemo(() => {
    if (!showCoverage) return null;

    const allThetas = flattenedPaths.map(p => p.theta);
    const minTheta = Math.min(...allThetas);
    const maxTheta = Math.max(...allThetas);
    const thetaSpan = maxTheta - minTheta;
    const theoreticalCoverage = (thetaSpan / 360) * 100;

    // Calculate average fiber spacing at boss
    const bossPoints = flattenedPaths.filter(p => p.z < parameters.domeDepth * 0.1);
    const avgBossSpacing = bossPoints.length > 1
      ? (Math.max(...bossPoints.map(p => p.theta)) - Math.min(...bossPoints.map(p => p.theta))) / parameters.numPaths
      : 0;

    return {
      thetaSpan: thetaSpan.toFixed(1),
      coverage: Math.min(100, theoreticalCoverage).toFixed(1),
      numPaths: parameters.numPaths,
      avgBossSpacing: avgBossSpacing.toFixed(2),
    };
  }, [flattenedPaths, showCoverage, parameters]);

  // Color palette for paths
  const pathColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];

  const handlePathClick = useCallback((pathIndex: number) => {
    setSelectedPath(selectedPath === pathIndex ? null : pathIndex);
  }, [selectedPath]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Clairaut&apos;s relation: r × sin(α) = constant
          </p>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showAllPaths}
              onChange={(e) => {
                setShowAllPaths(e.target.checked);
                if (e.target.checked) setSelectedPath(null);
              }}
              className="rounded border-gray-300 dark:border-slate-600"
            />
            Show All Paths
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={highlightTurnaround}
              onChange={() => {}}
              className="rounded border-gray-300 dark:border-slate-600"
            />
            Turnaround Points
          </label>
        </div>
      </div>

      {/* Statistics Panel */}
      {coverageStats && (
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Number of Paths</div>
            <div className="text-base font-bold text-blue-900 dark:text-blue-100">
              {coverageStats.numPaths}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">Angular Span</div>
            <div className="text-base font-bold text-green-900 dark:text-green-100">
              {coverageStats.thetaSpan}°
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Coverage</div>
            <div className="text-base font-bold text-purple-900 dark:text-purple-100">
              {coverageStats.coverage}%
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Boss Spacing</div>
            <div className="text-base font-bold text-orange-900 dark:text-orange-100">
              {coverageStats.avgBossSpacing}°
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 p-4">
        {viewMode === '2d-unwrapped' ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={flattenedPaths}
              margin={{ top: 20, right: 30, bottom: 60, left: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-slate-700" />

              <XAxis
                dataKey="theta"
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value.toFixed(0)}°`}
                label={{
                  value: 'Circumferential Angle θ (degrees)',
                  position: 'bottom',
                  offset: 40,
                  style: { fontWeight: 600 }
                }}
              />

              <YAxis
                dataKey="z"
                type="number"
                domain={[0, 'dataMax']}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toFixed(0)}
                label={{
                  value: 'Axial Position z (mm)',
                  angle: -90,
                  position: 'left',
                  offset: 50,
                  style: { fontWeight: 600 }
                }}
              />

              {/* Render each path as a separate line */}
              {geodesicPaths.map((pathData, pathIdx) => (
                <Line
                  key={pathIdx}
                  data={pathData}
                  type="monotone"
                  dataKey="z"
                  stroke={pathColors[pathIdx % pathColors.length]}
                  strokeWidth={selectedPath === pathIdx ? 3 : 1.5}
                  strokeOpacity={selectedPath !== null && selectedPath !== pathIdx ? 0.3 : 1}
                  dot={false}
                  name={`Path ${pathIdx + 1}`}
                  onClick={() => handlePathClick(pathIdx)}
                  style={{ cursor: 'pointer' }}
                />
              ))}

              {/* Turnaround points */}
              {highlightTurnaround && (
                <Scatter
                  data={flattenedPaths.filter(p => p.isTurnaround)}
                  fill="#EF4444"
                  shape="diamond"
                  name="Turnaround"
                />
              )}

              <Tooltip
                content={({ payload }) => {
                  if (!payload?.[0]) return null;
                  const d = payload[0].payload as PathPoint;

                  return (
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 text-sm">
                      <div className="font-bold mb-2 text-gray-900 dark:text-white">
                        Path {d.pathIndex + 1} {d.isTurnaround ? '(Turnaround)' : ''}
                      </div>
                      <div className="space-y-1 text-gray-600 dark:text-slate-300">
                        <div className="flex justify-between gap-4">
                          <span>Angle θ:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {d.theta.toFixed(1)}°
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Axial z:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {d.z.toFixed(2)} mm
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Radius r:</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {d.r.toFixed(2)} mm
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 pt-1 border-t border-gray-200 dark:border-slate-600">
                          <span>Fiber angle φ:</span>
                          <span className="font-medium text-orange-600 dark:text-orange-400">
                            {d.phi.toFixed(1)}°
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              <Legend wrapperStyle={{ paddingTop: '10px' }} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : viewMode === '2d-polar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-slate-700" />

              <XAxis
                dataKey="x"
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 12 }}
                label={{
                  value: 'X (mm)',
                  position: 'bottom',
                  offset: 40,
                  style: { fontWeight: 600 }
                }}
              />

              <YAxis
                dataKey="y"
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 12 }}
                label={{
                  value: 'Y (mm)',
                  angle: -90,
                  position: 'left',
                  offset: 50,
                  style: { fontWeight: 600 }
                }}
              />

              {geodesicPaths.map((pathData, pathIdx) => (
                <Scatter
                  key={pathIdx}
                  data={pathData}
                  fill={pathColors[pathIdx % pathColors.length]}
                  name={`Path ${pathIdx + 1}`}
                  line
                  lineType="joint"
                />
              ))}

              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-slate-400">
            3D projected view coming soon...
          </div>
        )}
      </div>

      {/* Path Selection */}
      <div className="px-4 pb-4 border-t border-gray-200 dark:border-slate-700 pt-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Select Path:</span>
          {geodesicPaths.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handlePathClick(idx)}
              className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                selectedPath === idx
                  ? 'ring-2 ring-offset-2 ring-blue-500'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: pathColors[idx % pathColors.length], color: 'white' }}
              title={`Path ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
          {selectedPath !== null && (
            <button
              onClick={() => setSelectedPath(null)}
              className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 ml-2"
            >
              Clear selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
