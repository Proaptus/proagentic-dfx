'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { DesignGeometry, CompositeLayer } from '@/lib/types';

export interface GeometryDetailsProps {
  geometry: DesignGeometry;
}

export function GeometryDetails({ geometry }: GeometryDetailsProps) {
  const [expanded, setExpanded] = useState(false);

  const domeParams = geometry.dome?.parameters;
  const layup = geometry.layup;

  return (
    <Card className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-700"
      >
        <span className="flex items-center gap-2">
          <Info size={16} />
          Geometry Details
        </span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="space-y-4">
          {/* Dome Profile Parameters */}
          {domeParams && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700 border-b border-gray-200 pb-1">
                Dome Profile
              </div>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Opening radius (r₀):</span>
                  <span className="font-mono text-gray-900">{domeParams.r_0_mm?.toFixed(2) || '-'} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Opening angle (α₀):</span>
                  <span className="font-mono text-gray-900">{domeParams.alpha_0_deg?.toFixed(2) || '-'}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dome depth:</span>
                  <span className="font-mono text-gray-900">{domeParams.depth_mm?.toFixed(2) || '-'} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profile type:</span>
                  <span className="font-mono text-gray-900 capitalize">{geometry.dome.type || 'isotensoid'}</span>
                </div>
              </div>

              {/* Isotensoid Equation Display */}
              <div className="bg-blue-50 rounded-lg p-3 text-xs">
                <div className="font-semibold text-blue-900 mb-2">Isotensoid Equation</div>
                <div className="font-mono text-blue-800 text-center py-2 bg-white rounded">
                  r(φ) = r₀ · cos²(φ) / cos(α₀ - φ)
                </div>
                <div className="text-blue-700 mt-2">
                  Optimized for constant fiber stress under internal pressure
                </div>
              </div>
            </div>
          )}

          {/* Layup Definition Table */}
          {layup && layup.layers && layup.layers.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700 border-b border-gray-200 pb-1">
                Layup Definition ({layup.total_layers} layers)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-1 pr-2 text-gray-600 font-medium">#</th>
                      <th className="text-left py-1 px-2 text-gray-600 font-medium">Type</th>
                      <th className="text-right py-1 px-2 text-gray-600 font-medium">Angle</th>
                      <th className="text-right py-1 pl-2 text-gray-600 font-medium">Thickness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {layup.layers.map((layer: CompositeLayer, index: number) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-1 pr-2 text-gray-500">{index + 1}</td>
                        <td className="py-1 px-2">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                              layer.type === 'helical'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {layer.type}
                          </span>
                        </td>
                        <td className="py-1 px-2 text-right font-mono text-gray-900">
                          {layer.angle_deg}°
                        </td>
                        <td className="py-1 pl-2 text-right font-mono text-gray-900">
                          {layer.thickness_mm} mm
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Layup Summary */}
              <div className="bg-gray-50 rounded-lg p-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Helical layers:</span>
                  <span className="font-medium text-gray-900">{layup.helical_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hoop layers:</span>
                  <span className="font-medium text-gray-900">{layup.hoop_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total thickness:</span>
                  <span className="font-medium text-gray-900">
                    {layup.layers.reduce((sum, l) => sum + (l.thickness_mm || 0), 0).toFixed(2)} mm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fiber volume fraction:</span>
                  <span className="font-medium text-gray-900">
                    {layup.fiber_volume_fraction ? (layup.fiber_volume_fraction * 100).toFixed(1) : '-'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Liner thickness:</span>
                  <span className="font-medium text-gray-900">{layup.liner_thickness_mm || '-'} mm</span>
                </div>
              </div>
            </div>
          )}

          {/* Thickness Distribution Info */}
          {geometry.dimensions && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700 border-b border-gray-200 pb-1">
                Thickness Distribution
              </div>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Wall thickness:</span>
                  <span className="font-mono text-gray-900">{geometry.dimensions.wall_thickness_mm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inner radius:</span>
                  <span className="font-mono text-gray-900">{geometry.dimensions.inner_radius_mm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Outer radius:</span>
                  <span className="font-mono text-gray-900">{geometry.dimensions.outer_radius_mm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thickness ratio:</span>
                  <span className="font-mono text-gray-900">
                    {(geometry.dimensions.wall_thickness_mm / geometry.dimensions.inner_radius_mm * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Visual thickness indicator */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-600 mb-2">Relative Thickness</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-8 bg-gray-200 rounded relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded"
                      style={{
                        width: `${Math.min(
                          (geometry.dimensions.wall_thickness_mm / geometry.dimensions.inner_radius_mm) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {((geometry.dimensions.wall_thickness_mm / geometry.dimensions.inner_radius_mm) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
            <div className="font-medium mb-1">Design Notes</div>
            <ul className="space-y-1 text-blue-600">
              <li>• Dome follows isotensoid profile for optimal stress distribution</li>
              <li>• Layup optimized for manufacturing constraints</li>
              <li>• Thickness varies along meridional direction for weight efficiency</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
