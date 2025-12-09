'use client';

import { useState } from 'react';
import { Layers, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { CompositeLayer } from '@/lib/types';

export interface LayerControlsProps {
  layers: CompositeLayer[];
  visibleLayers: Set<number>;
  onLayerToggle: (layerIndex: number) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  layerOpacity: number;
  onOpacityChange: (opacity: number) => void;
  linerThickness?: number;
  fiberVolumeFraction?: number;
}

// Layer type colors
const LAYER_COLORS: Record<string, string> = {
  helical: '#F97316',
  hoop: '#0EA5E9',
  liner: '#9CA3AF',
};

export function LayerControls({
  layers,
  visibleLayers,
  onLayerToggle,
  onShowAll,
  onHideAll,
  layerOpacity,
  onOpacityChange,
  linerThickness,
  fiberVolumeFraction,
}: LayerControlsProps) {
  const [expanded, setExpanded] = useState(true);
  const [_individualOpacity, _setIndividualOpacity] = useState<Record<number, number>>({});

  const helicalCount = layers.filter(l => l.type === 'helical').length;
  const hoopCount = layers.filter(l => l.type === 'hoop').length;

  const allVisible = visibleLayers.size === layers.length;
  const noneVisible = visibleLayers.size === 0;

  return (
    <Card className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-700"
      >
        <span className="flex items-center gap-2">
          <Layers size={16} />
          Layer Controls ({layers.length} layers)
        </span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <>
          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={onShowAll}
              disabled={allVisible}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                allVisible
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <Eye size={12} className="inline mr-1" />
              Show All
            </button>
            <button
              onClick={onHideAll}
              disabled={noneVisible}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                noneVisible
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <EyeOff size={12} className="inline mr-1" />
              Hide All
            </button>
          </div>

          {/* Color Legend */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="text-xs font-medium text-gray-600 mb-2">Layer Types</div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: LAYER_COLORS.helical }}
                />
                <span className="text-gray-700">Helical</span>
              </div>
              <span className="text-gray-500">{helicalCount} layers</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: LAYER_COLORS.hoop }}
                />
                <span className="text-gray-700">Hoop</span>
              </div>
              <span className="text-gray-500">{hoopCount} layers</span>
            </div>
          </div>

          {/* Global Opacity Slider */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 block">
              Global Opacity
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={layerOpacity}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-10 text-right">
                {Math.round(layerOpacity * 100)}%
              </span>
            </div>
          </div>

          {/* Individual Layer Toggles */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <div className="text-xs font-medium text-gray-600 mb-2">Individual Layers</div>
            {layers.map((layer, index) => {
              const isVisible = visibleLayers.has(index);
              const layerColor = LAYER_COLORS[layer.type] || LAYER_COLORS.helical;

              return (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => onLayerToggle(index)}
                    className="rounded border-gray-300"
                  />
                  <div
                    className="w-3 h-3 rounded flex-shrink-0"
                    style={{ backgroundColor: layerColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-700 truncate">
                      Layer {index + 1} ({layer.type})
                    </div>
                    <div className="text-xs text-gray-500">
                      {layer.angle_deg}° | {layer.thickness_mm}mm
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Layer Summary */}
          {(linerThickness !== undefined || fiberVolumeFraction !== undefined) && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg space-y-1">
              {fiberVolumeFraction !== undefined && (
                <div className="flex justify-between">
                  <span>Fiber volume:</span>
                  <span className="font-medium">{(fiberVolumeFraction * 100).toFixed(0)}%</span>
                </div>
              )}
              {linerThickness !== undefined && (
                <div className="flex justify-between">
                  <span>Liner thickness:</span>
                  <span className="font-medium">{linerThickness} mm</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Visible/Total:</span>
                <span className="font-medium">{visibleLayers.size}/{layers.length}</span>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
