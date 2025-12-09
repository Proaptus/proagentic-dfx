'use client';

import { useMemo, useState, useRef } from 'react';
import type { DesignStress, CompositeLayer, MeshNode, MeshElement } from '@/lib/types';

interface StressContourChartProps {
  stressData: DesignStress;
  layers?: CompositeLayer[];
  onExport?: (format: 'png' | 'svg') => void;
}

type StressColorMode = 'jet' | 'thermal' | 'safety';

const COLORMAPS: Record<StressColorMode, Array<{ pos: number; rgb: [number, number, number] }>> = {
  jet: [
    { pos: 0.0, rgb: [0, 0, 131] },
    { pos: 0.125, rgb: [0, 60, 170] },
    { pos: 0.25, rgb: [5, 255, 255] },
    { pos: 0.375, rgb: [0, 255, 0] },
    { pos: 0.5, rgb: [255, 255, 0] },
    { pos: 0.625, rgb: [255, 170, 0] },
    { pos: 0.75, rgb: [255, 0, 0] },
    { pos: 0.875, rgb: [200, 0, 0] },
    { pos: 1.0, rgb: [128, 0, 0] },
  ],
  thermal: [
    { pos: 0.0, rgb: [30, 58, 138] },
    { pos: 0.25, rgb: [59, 130, 246] },
    { pos: 0.5, rgb: [34, 197, 94] },
    { pos: 0.75, rgb: [251, 191, 36] },
    { pos: 1.0, rgb: [220, 38, 38] },
  ],
  safety: [
    { pos: 0.0, rgb: [34, 197, 94] },
    { pos: 0.5, rgb: [251, 191, 36] },
    { pos: 0.75, rgb: [249, 115, 22] },
    { pos: 1.0, rgb: [220, 38, 38] },
  ],
};

const REGION_COLORS: Record<string, string> = {
  boss: '#EF4444',
  dome: '#8B5CF6',
  transition: '#F59E0B',
  cylinder: '#06B6D4',
};

function interpolateColor(colormap: Array<{ pos: number; rgb: [number, number, number] }>, value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  for (let i = 0; i < colormap.length - 1; i++) {
    const c1 = colormap[i];
    const c2 = colormap[i + 1];
    if (clamped >= c1.pos && clamped <= c2.pos) {
      const t = (clamped - c1.pos) / (c2.pos - c1.pos);
      const r = Math.round(c1.rgb[0] + (c2.rgb[0] - c1.rgb[0]) * t);
      const g = Math.round(c1.rgb[1] + (c2.rgb[1] - c1.rgb[1]) * t);
      const b = Math.round(c1.rgb[2] + (c2.rgb[2] - c1.rgb[2]) * t);
      return `rgb(${r},${g},${b})`;
    }
  }
  const last = colormap[colormap.length - 1].rgb;
  return `rgb(${last[0]},${last[1]},${last[2]})`;
}

export function StressContourChart({ stressData, layers, onExport }: StressContourChartProps) {
  const [selectedLayer, setSelectedLayer] = useState<number | 'all'>('all');
  const [showRegionOutlines, setShowRegionOutlines] = useState(false);
  const [colorMode, setColorMode] = useState<StressColorMode>('jet');
  const [hoveredElement, setHoveredElement] = useState<MeshElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const mesh = stressData.contour_data?.mesh;
  const minStress = stressData.contour_data?.min_value ?? 0;
  const maxStress = stressData.contour_data?.max_value ?? 1;
  const stressRange = maxStress - minStress || 1;

  const nodeMap = useMemo(() => {
    if (!mesh) return new Map<number, MeshNode>();
    return new Map(mesh.nodes.map(n => [n.id, n]));
  }, [mesh]);

  const viewConfig = useMemo(() => {
    if (!mesh) return { width: 800, height: 500, scaleR: 1, scaleZ: 1, offsetR: 0, offsetZ: 0, r_min: 0, z_max: 0, rRange: 1, zRange: 1, z_min: 0, r_max: 0 };
    const { r_min, r_max, z_min, z_max } = mesh.bounds;
    // Extend r range to include centerline (r=0) for full tank cross-section context
    const fullR_min = 0; // Start from centerline
    const fullR_max = r_max * 1.1; // Add 10% padding
    const rRange = fullR_max - fullR_min || 1;
    const zRange = z_max - z_min || 1;
    const paddingLeft = 60;
    const paddingRight = 30;
    const paddingTop = 50;
    const paddingBottom = 45;
    // Use landscape aspect ratio (800x500) for better display in typical containers
    const width = 800;
    const height = 500;
    // Use independent scales for r and z to fill the viewport properly
    // This is standard for 2D axisymmetric FEA visualization
    const scaleR = (width - paddingLeft - paddingRight) / rRange;
    const scaleZ = (height - paddingTop - paddingBottom) / zRange;
    return { width, height, scaleR, scaleZ, offsetR: paddingLeft, offsetZ: paddingTop, r_min: fullR_min, r_max: fullR_max, z_min, z_max, rRange, zRange, mesh_r_min: r_min, mesh_r_max: r_max };
  }, [mesh]);

  const transformPoint = (r: number, z: number) => {
    const { scaleR, scaleZ, offsetR, offsetZ, z_max, r_min } = viewConfig;
    return { x: (r - r_min) * scaleR + offsetR, y: (z_max - z) * scaleZ + offsetZ };
  };

  const handleExport = (format: 'png' | 'svg') => {
    if (!svgRef.current) return;
    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stress-contour-${stressData.design_id}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
    onExport?.(format);
  };

  if (!mesh || mesh.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center p-8">
          <p className="text-lg font-medium text-gray-700">No FEA Mesh Data</p>
          <p className="text-sm text-gray-500 mt-2">Stress contour requires mesh data from analysis server.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-4 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Layer:</label>
            <select value={selectedLayer} onChange={(e) => setSelectedLayer(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="px-2 py-1 border border-gray-300 rounded text-sm">
              <option value="all">All Layers</option>
              {layers?.map((layer) => (<option key={layer.layer} value={layer.layer}>Layer {layer.layer} ({layer.type})</option>))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Colormap:</label>
            <select value={colorMode} onChange={(e) => setColorMode(e.target.value as StressColorMode)} className="px-2 py-1 border border-gray-300 rounded text-sm">
              <option value="jet">Jet</option>
              <option value="thermal">Thermal</option>
              <option value="safety">Safety</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={showRegionOutlines} onChange={(e) => setShowRegionOutlines(e.target.checked)} className="rounded" />
            Region Outlines
          </label>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600"><span className="font-medium">{stressData.load_pressure_bar}</span> bar ({stressData.load_case})</span>
          {onExport && (<div className="flex gap-1"><button onClick={() => handleExport('png')} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">PNG</button><button onClick={() => handleExport('svg')} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">SVG</button></div>)}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3 px-4">
        <span className="text-sm font-medium text-gray-700">von Mises (MPa):</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600 w-12 text-right">{minStress.toFixed(0)}</span>
          <div className="flex h-4 w-56 rounded overflow-hidden border border-gray-300">
            {Array.from({ length: 100 }).map((_, i) => (<div key={i} style={{ backgroundColor: interpolateColor(COLORMAPS[colorMode], i / 99), flex: 1 }} />))}
          </div>
          <span className="text-xs text-gray-600 w-12">{maxStress.toFixed(0)}</span>
        </div>
        <div className="text-xs text-gray-600 ml-2">
          Peak: <span className="font-bold text-red-600">{stressData.max_stress.value_mpa.toFixed(0)} MPa</span> @ <span className="capitalize">{stressData.max_stress.region.replace(/_/g, ' ')}</span> | Margin: <span className={stressData.max_stress.margin_percent >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{stressData.max_stress.margin_percent >= 0 ? '+' : ''}{stressData.max_stress.margin_percent.toFixed(1)}%</span>
        </div>
      </div>

      <div className="flex-1 relative bg-white rounded-lg border border-gray-200 overflow-hidden">
        <svg ref={svgRef} viewBox={`0 0 ${viewConfig.width} ${viewConfig.height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }} onMouseMove={(e) => { const rect = svgRef.current?.getBoundingClientRect(); if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top }); }} onMouseLeave={() => { setHoveredElement(null); setMousePos(null); }}>
          <text x={viewConfig.width / 2} y="25" textAnchor="middle" fill="#374151" style={{ fontSize: '14px', fontWeight: 600 }}>2D Axisymmetric Stress Contour — Design {stressData.design_id}</text>
          <text x={viewConfig.width / 2} y="42" textAnchor="middle" fill="#6B7280" style={{ fontSize: '11px' }}>{stressData.stress_type} under {stressData.load_case} loading</text>

          {/* Tank interior fill (to show cavity clearly) - drawn first as background */}
          {(() => {
            const innerNodes = mesh.nodes.filter((n, i, arr) => {
              const nodesAtZ = arr.filter(node => Math.abs(node.z - n.z) < 1);
              const minR = Math.min(...nodesAtZ.map(node => node.r));
              return Math.abs(n.r - minR) < 1;
            });
            const sorted = [...new Map(innerNodes.map(n => [Math.round(n.z), n])).values()].sort((a, b) => a.z - b.z);
            if (sorted.length < 2) return null;
            const pts = sorted.map(n => transformPoint(n.r, n.z));
            const centerTop = transformPoint(0, sorted[sorted.length - 1].z);
            const centerBottom = transformPoint(0, sorted[0].z);
            const pathD = `M ${centerBottom.x} ${centerBottom.y} ` +
              pts.map(pt => `L ${pt.x} ${pt.y}`).join(' ') +
              ` L ${centerTop.x} ${centerTop.y} Z`;
            return <path d={pathD} fill="rgba(226, 232, 240, 0.6)" stroke="none" />;
          })()}

          {/* Centerline (axis of symmetry) */}
          <line x1={transformPoint(0, viewConfig.z_min).x} y1={transformPoint(0, viewConfig.z_min).y} x2={transformPoint(0, viewConfig.z_max).x} y2={transformPoint(0, viewConfig.z_max).y} stroke="#64748B" strokeWidth="1.5" strokeDasharray="8,4" />
          <text x={transformPoint(0, viewConfig.z_max).x} y={transformPoint(0, viewConfig.z_max).y - 5} textAnchor="middle" fill="#475569" style={{ fontSize: '9px', fontWeight: 500 }}>Axis</text>

          {/* FEA mesh elements with stress coloring */}
          <g>
            {mesh.elements.map((elem) => {
              const [n1Id, n2Id, n3Id] = elem.nodes;
              const n1 = nodeMap.get(n1Id);
              const n2 = nodeMap.get(n2Id);
              const n3 = nodeMap.get(n3Id);
              if (!n1 || !n2 || !n3) return null;
              const p1 = transformPoint(n1.r, n1.z);
              const p2 = transformPoint(n2.r, n2.z);
              const p3 = transformPoint(n3.r, n3.z);
              const normalized = (elem.centroid_stress - minStress) / stressRange;
              const fillColor = interpolateColor(COLORMAPS[colorMode], normalized);
              const isHovered = hoveredElement?.id === elem.id;
              return (<polygon key={elem.id} points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} fill={fillColor} stroke={showRegionOutlines ? REGION_COLORS[elem.region] : 'rgba(255,255,255,0.3)'} strokeWidth={showRegionOutlines ? 1.5 : 0.5} opacity={isHovered ? 1 : 0.95} onMouseEnter={() => setHoveredElement(elem)} onMouseLeave={() => setHoveredElement(null)} style={{ cursor: 'crosshair' }} />);
            })}
          </g>

          {/* Inner wall profile outline (drawn on top of mesh) */}
          {(() => {
            const innerNodes = mesh.nodes.filter((n, i, arr) => {
              const nodesAtZ = arr.filter(node => Math.abs(node.z - n.z) < 1);
              const minR = Math.min(...nodesAtZ.map(node => node.r));
              return Math.abs(n.r - minR) < 1;
            });
            const sorted = [...new Map(innerNodes.map(n => [Math.round(n.z), n])).values()].sort((a, b) => a.z - b.z);
            if (sorted.length < 2) return null;
            const pathD = sorted.map((n, i) => {
              const pt = transformPoint(n.r, n.z);
              return i === 0 ? `M ${pt.x} ${pt.y}` : `L ${pt.x} ${pt.y}`;
            }).join(' ');
            return <path d={pathD} fill="none" stroke="#1E293B" strokeWidth="1.5" />;
          })()}

          {/* Outer wall profile outline */}
          {(() => {
            const outerNodes = mesh.nodes.filter((n, i, arr) => {
              const nodesAtZ = arr.filter(node => Math.abs(node.z - n.z) < 1);
              const maxR = Math.max(...nodesAtZ.map(node => node.r));
              return Math.abs(n.r - maxR) < 1;
            });
            const sorted = [...new Map(outerNodes.map(n => [Math.round(n.z), n])).values()].sort((a, b) => a.z - b.z);
            if (sorted.length < 2) return null;
            const pathD = sorted.map((n, i) => {
              const pt = transformPoint(n.r, n.z);
              return i === 0 ? `M ${pt.x} ${pt.y}` : `L ${pt.x} ${pt.y}`;
            }).join(' ');
            return <path d={pathD} fill="none" stroke="#1E293B" strokeWidth="1.5" />;
          })()}

          <text x={viewConfig.width / 2} y={viewConfig.height - 15} textAnchor="middle" fill="#6B7280" style={{ fontSize: '11px' }}>Radial Position r (mm)</text>
          <text x="18" y={viewConfig.height / 2} textAnchor="middle" transform={`rotate(-90, 18, ${viewConfig.height / 2})`} fill="#6B7280" style={{ fontSize: '11px' }}>Axial Position z (mm)</text>

          <g fill="#9CA3AF" style={{ fontSize: '10px' }}>
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => { const r = viewConfig.r_min + frac * viewConfig.rRange; const pt = transformPoint(r, viewConfig.z_min); return (<g key={`r-${frac}`}><line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.y + 5} stroke="#9CA3AF" /><text x={pt.x} y={pt.y + 18} textAnchor="middle">{r.toFixed(0)}</text></g>); })}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => { const z = viewConfig.z_min + frac * viewConfig.zRange; const pt = transformPoint(viewConfig.r_min, z); return (<g key={`z-${frac}`}><line x1={pt.x - 5} y1={pt.y} x2={pt.x} y2={pt.y} stroke="#9CA3AF" /><text x={pt.x - 8} y={pt.y + 4} textAnchor="end">{z.toFixed(0)}</text></g>); })}
          </g>

          {(() => { const maxNode = mesh.nodes.reduce((max, n) => n.stress > max.stress ? n : max, mesh.nodes[0]); const pt = transformPoint(maxNode.r, maxNode.z); return (<g><circle cx={pt.x} cy={pt.y} r="8" fill="none" stroke="#DC2626" strokeWidth="2" strokeDasharray="3,2" /><circle cx={pt.x} cy={pt.y} r="3" fill="#DC2626" /><text x={pt.x + 12} y={pt.y - 5} fill="#DC2626" style={{ fontSize: '11px', fontWeight: 500 }}>MAX</text></g>); })()}
        </svg>

        {hoveredElement && mousePos && (
          <div className="absolute bg-white/95 backdrop-blur p-3 rounded-lg shadow-xl border text-sm pointer-events-none z-10" style={{ left: Math.min(mousePos.x + 15, viewConfig.width - 180), top: mousePos.y + 15 }}>
            <div className="font-semibold mb-2 capitalize flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ backgroundColor: REGION_COLORS[hoveredElement.region] }} />{hoveredElement.region} Region</div>
            <div className="space-y-1 text-gray-600">
              <div className="flex justify-between gap-4"><span>Stress:</span><span className="font-bold" style={{ color: interpolateColor(COLORMAPS[colorMode], (hoveredElement.centroid_stress - minStress) / stressRange) }}>{hoveredElement.centroid_stress.toFixed(1)} MPa</span></div>
              <div className="flex justify-between gap-4"><span>Element:</span><span className="font-mono text-xs">#{hoveredElement.id}</span></div>
              <div className="flex justify-between gap-4"><span>Utilization:</span><span className="font-medium">{((hoveredElement.centroid_stress / stressData.max_stress.allowable_mpa) * 100).toFixed(1)}%</span></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 px-4 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          {showRegionOutlines && (<><span className="font-medium text-gray-600">Regions:</span>{Object.entries(REGION_COLORS).map(([region, color]) => (<div key={region} className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} /><span className="capitalize">{region}</span></div>))}</>)}
        </div>
        <div className="flex items-center gap-3">
          <span>Nodes: <span className="font-medium text-gray-700">{mesh.nodes.length}</span></span>
          <span>Elements: <span className="font-medium text-gray-700">{mesh.elements.length}</span></span>
          <span>Type: <span className="font-medium text-gray-700">Tri3</span></span>
        </div>
      </div>
    </div>
  );
}
