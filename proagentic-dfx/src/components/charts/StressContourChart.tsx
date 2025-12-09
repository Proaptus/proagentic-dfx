'use client';

import { useMemo, useState, useCallback, useRef } from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { ParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { LinearGradient } from '@visx/gradient';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import type { DesignStress, MeshElement, MeshNode } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

interface StressContourChartProps {
  stressData: DesignStress;
  onExport?: (format: 'png' | 'svg') => void;
}

interface TooltipData {
  element: MeshElement;
  stress: number;
  region: string;
  x: number;
  y: number;
}

type ColorScale = 'jet' | 'viridis' | 'plasma' | 'turbo' | 'cool';

// ============================================================================
// Color Scales - Professional Engineering Colormaps
// ============================================================================

const COLORMAPS: Record<ColorScale, string[]> = {
  jet: ['#000080', '#0000FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF8000', '#FF0000', '#800000'],
  viridis: ['#440154', '#482878', '#3E4A89', '#31688E', '#26828E', '#1F9E89', '#35B779', '#6DCD59', '#B4DE2C', '#FDE725'],
  plasma: ['#0D0887', '#46039F', '#7201A8', '#9C179E', '#BD3786', '#D8576B', '#ED7953', '#FB9F3A', '#FDC328', '#F0F921'],
  turbo: ['#30123B', '#4662D7', '#35AAD1', '#3DDB6E', '#A6D820', '#FAC127', '#F57D15', '#D23105', '#7A0403'],
  cool: ['#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF'],
};

// ============================================================================
// Utility Functions
// ============================================================================

function interpolateColor(scale: string[], t: number): string {
  const clampedT = Math.max(0, Math.min(1, t));
  const idx = clampedT * (scale.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  const frac = idx - lower;

  if (lower === upper) return scale[lower];

  const c1 = scale[lower];
  const c2 = scale[upper];

  // Parse hex colors
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);

  // Interpolate
  const r = Math.round(r1 + (r2 - r1) * frac);
  const g = Math.round(g1 + (g2 - g1) * frac);
  const b = Math.round(b1 + (b2 - b1) * frac);

  return `rgb(${r},${g},${b})`;
}

function formatStress(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toFixed(0);
}

// ============================================================================
// Mesh Element Component - Renders a single triangular element
// ============================================================================

interface MeshTriangleProps {
  element: MeshElement;
  nodeMap: Map<number, MeshNode>;
  xScale: (r: number) => number;
  yScale: (z: number) => number;
  colorScale: (stress: number) => string;
  minStress: number;
  maxStress: number;
  onHover?: (data: TooltipData | null) => void;
  isHovered?: boolean;
}

function MeshTriangle({
  element,
  nodeMap,
  xScale,
  yScale,
  colorScale,
  onHover,
  isHovered,
}: MeshTriangleProps) {
  const [n1Id, n2Id, n3Id] = element.nodes;
  const n1 = nodeMap.get(n1Id);
  const n2 = nodeMap.get(n2Id);
  const n3 = nodeMap.get(n3Id);

  if (!n1 || !n2 || !n3) return null;

  const x1 = xScale(n1.r);
  const y1 = yScale(n1.z);
  const x2 = xScale(n2.r);
  const y2 = yScale(n2.z);
  const x3 = xScale(n3.r);
  const y3 = yScale(n3.z);

  const fillColor = colorScale(element.centroid_stress);
  const centroidX = (x1 + x2 + x3) / 3;
  const centroidY = (y1 + y2 + y3) / 3;

  const handleMouseEnter = () => {
    if (onHover) {
      onHover({
        element,
        stress: element.centroid_stress,
        region: element.region,
        x: centroidX,
        y: centroidY,
      });
    }
  };

  const handleMouseLeave = () => {
    if (onHover) {
      onHover(null);
    }
  };

  return (
    <polygon
      points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
      fill={fillColor}
      stroke={isHovered ? '#fff' : fillColor}
      strokeWidth={isHovered ? 2 : 0.5}
      strokeLinejoin="round"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        cursor: 'crosshair',
        transition: 'fill 0.4s ease-out, stroke 0.4s ease-out, stroke-width 0.1s ease',
      }}
    />
  );
}

// ============================================================================
// Tank Contour Inner Component (receives dimensions from ParentSize)
// ============================================================================

interface ContourInnerProps {
  width: number;
  height: number;
  stressData: DesignStress;
  colorScaleName: ColorScale;
  showGrid: boolean;
  showAxes: boolean;
  showLegend: boolean;
  mirrorView: boolean;
}

function ContourInner({
  width,
  height,
  stressData,
  colorScaleName,
  showGrid,
  showAxes,
  showLegend,
  mirrorView,
}: ContourInnerProps) {
  const {
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    showTooltip,
    hideTooltip,
  } = useTooltip<TooltipData>();

  const [hoveredElement, setHoveredElement] = useState<number | null>(null);

  // Margins for axes
  const margin = { top: 20, right: showLegend ? 100 : 20, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Get mesh data
  const mesh = stressData.contour_data?.mesh;

  // Process mesh data
  const { nodeMap, minStress, maxStress, bounds } = useMemo(() => {
    if (!mesh || !mesh.nodes || mesh.nodes.length === 0) {
      return {
        nodeMap: new Map<number, MeshNode>(),
        minStress: 0,
        maxStress: 100,
        bounds: { r_min: 0, r_max: 100, z_min: 0, z_max: 200 },
      };
    }

    const map = new Map<number, MeshNode>();
    mesh.nodes.forEach((node) => map.set(node.id, node));

    const stresses = mesh.elements.map((e) => e.centroid_stress);
    const minS = Math.min(...stresses);
    const maxS = Math.max(...stresses);

    return {
      nodeMap: map,
      minStress: minS,
      maxStress: maxS,
      bounds: mesh.bounds || { r_min: 0, r_max: 150, z_min: 0, z_max: 400 },
    };
  }, [mesh]);

  // Scales
  const xScale = useMemo(() => {
    const domain = mirrorView
      ? [-bounds.r_max, bounds.r_max]
      : [bounds.r_min, bounds.r_max];
    return scaleLinear({
      domain,
      range: [0, innerWidth],
      nice: true,
    });
  }, [bounds, innerWidth, mirrorView]);

  const yScale = useMemo(() => {
    return scaleLinear({
      domain: [bounds.z_min, bounds.z_max],
      range: [innerHeight, 0], // Flip for SVG coordinates
      nice: true,
    });
  }, [bounds, innerHeight]);

  const colorScale = useCallback(
    (stress: number) => {
      const t = maxStress > minStress
        ? (stress - minStress) / (maxStress - minStress)
        : 0.5;
      return interpolateColor(COLORMAPS[colorScaleName], t);
    },
    [minStress, maxStress, colorScaleName]
  );

  // Create color scale for legend
  const legendScale = useMemo(() => {
    return scaleLinear({
      domain: [minStress, maxStress],
      range: [0, 1],
    });
  }, [minStress, maxStress]);

  const handleElementHover = useCallback(
    (data: TooltipData | null) => {
      if (data) {
        setHoveredElement(data.element.id);
        showTooltip({
          tooltipData: data,
          tooltipLeft: data.x + margin.left,
          tooltipTop: data.y + margin.top,
        });
      } else {
        setHoveredElement(null);
        hideTooltip();
      }
    },
    [showTooltip, hideTooltip, margin]
  );

  // Render elements (either single side or mirrored)
  const renderElements = useCallback(
    (flip: boolean = false) => {
      if (!mesh?.elements) return null;

      return mesh.elements.map((element) => {
        // For mirrored view, we need to flip the r coordinates
        const adjustedNodeMap = flip
          ? new Map(
              Array.from(nodeMap.entries()).map(([id, node]) => [
                id,
                { ...node, r: -node.r },
              ])
            )
          : nodeMap;

        return (
          <MeshTriangle
            key={`${flip ? 'mirror-' : ''}${element.id}`}
            element={element}
            nodeMap={adjustedNodeMap}
            xScale={xScale}
            yScale={yScale}
            colorScale={colorScale}
            minStress={minStress}
            maxStress={maxStress}
            onHover={handleElementHover}
            isHovered={hoveredElement === element.id}
          />
        );
      });
    },
    [mesh, nodeMap, xScale, yScale, colorScale, minStress, maxStress, handleElementHover, hoveredElement]
  );

  if (!mesh || !mesh.elements || mesh.elements.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No Mesh Data Available</div>
          <div className="text-sm">FEA mesh data required for contour visualization</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        width={width}
        height={height}
      >
        {/* Gradient definitions for legend */}
        <defs>
          <linearGradient id="stress-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            {COLORMAPS[colorScaleName].map((color, i) => (
              <stop
                key={i}
                offset={`${(i / (COLORMAPS[colorScaleName].length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </linearGradient>
        </defs>

        {/* Background */}
        <rect
          x={margin.left}
          y={margin.top}
          width={innerWidth}
          height={innerHeight}
          fill="#f8fafc"
          rx={4}
        />

        <Group left={margin.left} top={margin.top}>
          {/* Grid */}
          {showGrid && (
            <>
              <GridRows
                scale={yScale}
                width={innerWidth}
                stroke="#e2e8f0"
                strokeDasharray="2,2"
                numTicks={8}
              />
              <GridColumns
                scale={xScale}
                height={innerHeight}
                stroke="#e2e8f0"
                strokeDasharray="2,2"
                numTicks={mirrorView ? 10 : 5}
              />
            </>
          )}

          {/* Centerline for mirrored view */}
          {mirrorView && (
            <line
              x1={xScale(0)}
              y1={0}
              x2={xScale(0)}
              y2={innerHeight}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          )}

          {/* Mesh elements - render right side */}
          <g className="mesh-elements">
            {renderElements(false)}
          </g>

          {/* Mesh elements - render mirrored left side */}
          {mirrorView && (
            <g className="mesh-elements-mirrored">
              {renderElements(true)}
            </g>
          )}

          {/* Axes */}
          {showAxes && (
            <>
              <AxisLeft
                scale={yScale}
                numTicks={8}
                stroke="#64748b"
                tickStroke="#64748b"
                tickLabelProps={{
                  fill: '#64748b',
                  fontSize: 10,
                  textAnchor: 'end',
                  dx: -4,
                  dy: 3,
                }}
                label="Axial Position (mm)"
                labelOffset={40}
                labelProps={{
                  fill: '#475569',
                  fontSize: 11,
                  fontWeight: 500,
                  textAnchor: 'middle',
                }}
              />
              <AxisBottom
                scale={xScale}
                top={innerHeight}
                numTicks={mirrorView ? 10 : 5}
                stroke="#64748b"
                tickStroke="#64748b"
                tickLabelProps={{
                  fill: '#64748b',
                  fontSize: 10,
                  textAnchor: 'middle',
                  dy: 4,
                }}
                label="Radial Position (mm)"
                labelOffset={30}
                labelProps={{
                  fill: '#475569',
                  fontSize: 11,
                  fontWeight: 500,
                  textAnchor: 'middle',
                }}
              />
            </>
          )}
        </Group>

        {/* Color Scale Legend */}
        {showLegend && (
          <Group left={width - margin.right + 20} top={margin.top + 20}>
            <rect
              x={-5}
              y={-5}
              width={70}
              height={innerHeight - 30}
              fill="white"
              stroke="#e2e8f0"
              rx={4}
            />
            <text
              x={25}
              y={10}
              fontSize={10}
              fontWeight={600}
              fill="#475569"
              textAnchor="middle"
            >
              Stress
            </text>
            <text
              x={25}
              y={22}
              fontSize={9}
              fill="#64748b"
              textAnchor="middle"
            >
              (MPa)
            </text>
            <rect
              x={10}
              y={30}
              width={20}
              height={innerHeight - 90}
              fill="url(#stress-gradient)"
              stroke="#64748b"
              strokeWidth={0.5}
            />
            <text x={35} y={35} fontSize={9} fill="#64748b">
              {formatStress(maxStress)}
            </text>
            <text x={35} y={innerHeight - 65} fontSize={9} fill="#64748b">
              {formatStress(minStress)}
            </text>
          </Group>
        )}
      </svg>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          left={tooltipLeft}
          top={tooltipTop}
          style={{
            ...defaultStyles,
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            fontSize: '12px',
            lineHeight: 1.5,
          }}
        >
          <div className="font-semibold text-gray-900 mb-1 capitalize">
            {tooltipData.region} Region
          </div>
          <div className="space-y-0.5 text-gray-600">
            <div className="flex justify-between gap-4">
              <span>Stress:</span>
              <span className="font-bold text-gray-900">
                {tooltipData.stress.toFixed(1)} MPa
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Utilization:</span>
              <span
                className="font-bold"
                style={{
                  color:
                    (tooltipData.stress / stressData.max_stress.allowable_mpa) > 0.9
                      ? '#ef4444'
                      : (tooltipData.stress / stressData.max_stress.allowable_mpa) > 0.7
                      ? '#f59e0b'
                      : '#10b981',
                }}
              >
                {((tooltipData.stress / stressData.max_stress.allowable_mpa) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between gap-4 text-xs text-gray-400">
              <span>Element:</span>
              <span>#{tooltipData.element.id}</span>
            </div>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
}

// ============================================================================
// Main Component with Controls
// ============================================================================

export function StressContourChart({
  stressData,
  onExport,
}: StressContourChartProps) {
  const [colorScaleName, setColorScaleName] = useState<ColorScale>('jet');
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [mirrorView, setMirrorView] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            FEA Stress Contour — {stressData.stress_type}
          </h3>
          <p className="text-sm text-gray-500">
            {stressData.load_case} @ {stressData.load_pressure_bar} bar
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Color Scale */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">Colormap:</label>
            <select
              value={colorScaleName}
              onChange={(e) => setColorScaleName(e.target.value as ColorScale)}
              className="text-xs px-2 py-1 border border-gray-300 rounded bg-white"
            >
              <option value="jet">Jet</option>
              <option value="viridis">Viridis</option>
              <option value="plasma">Plasma</option>
              <option value="turbo">Turbo</option>
              <option value="cool">Cool</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setMirrorView(!mirrorView)}
              className={`px-2 py-1 text-xs rounded ${
                mirrorView ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
              title="Toggle mirror view"
            >
              Mirror
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-1 text-xs rounded ${
                showGrid ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
              title="Toggle grid"
            >
              Grid
            </button>
            <button
              onClick={() => setShowAxes(!showAxes)}
              className={`px-2 py-1 text-xs rounded ${
                showAxes ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
              title="Toggle axes"
            >
              Axes
            </button>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className={`px-2 py-1 text-xs rounded ${
                showLegend ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
              title="Toggle legend"
            >
              Legend
            </button>
          </div>

          {/* Export */}
          {onExport && (
            <div className="flex gap-1 ml-2">
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

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="bg-white rounded-lg p-2 border border-gray-200">
          <div className="text-xs text-gray-500">Max Stress</div>
          <div className="text-lg font-bold text-gray-900">
            {stressData.max_stress.value_mpa.toFixed(0)}{' '}
            <span className="text-sm font-normal text-gray-500">MPa</span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 border border-gray-200">
          <div className="text-xs text-gray-500">Allowable</div>
          <div className="text-lg font-bold text-gray-900">
            {stressData.max_stress.allowable_mpa.toFixed(0)}{' '}
            <span className="text-sm font-normal text-gray-500">MPa</span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 border border-gray-200">
          <div className="text-xs text-gray-500">Safety Margin</div>
          <div
            className={`text-lg font-bold ${
              stressData.max_stress.margin_percent >= 20
                ? 'text-green-600'
                : stressData.max_stress.margin_percent >= 10
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            +{stressData.max_stress.margin_percent.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 border border-gray-200">
          <div className="text-xs text-gray-500">Critical Region</div>
          <div className="text-lg font-bold text-gray-900 capitalize truncate">
            {stressData.max_stress.region.replace(/_/g, ' ')}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-4 min-h-[400px]">
        <ParentSize debounceTime={50}>
          {({ width, height }) => (
            <ContourInner
              width={width}
              height={height}
              stressData={stressData}
              colorScaleName={colorScaleName}
              showGrid={showGrid}
              showAxes={showAxes}
              showLegend={showLegend}
              mirrorView={mirrorView}
            />
          )}
        </ParentSize>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>
            Design: <span className="font-medium text-gray-700">{stressData.design_id}</span>
          </span>
          <span>
            Elements: <span className="font-medium text-gray-700">
              {stressData.contour_data?.mesh?.elements?.length || 0}
            </span>
          </span>
          <span>
            Nodes: <span className="font-medium text-gray-700">
              {stressData.contour_data?.mesh?.nodes?.length || 0}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Max Location:</span>
          <span className="font-mono">
            r={stressData.max_stress.location.r.toFixed(1)}, z={stressData.max_stress.location.z.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
