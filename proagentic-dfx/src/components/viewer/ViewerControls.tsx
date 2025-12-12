'use client';

import { useState } from 'react';
import { Camera, Home, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export type ViewPreset = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'isometric';

export interface CameraState {
  position: [number, number, number];
  rotation: [number, number];
  zoom: number;
}

export interface ViewerControlsProps {
  onViewPreset: (preset: ViewPreset) => void;
  onResetView: () => void;
  onZoomChange: (zoom: number) => void;
  onAutoRotateToggle: (enabled: boolean) => void;
  onScreenshot: () => void;
  cameraState: CameraState;
  autoRotate: boolean;
  zoom: number;
}

export function ViewerControls({
  onViewPreset,
  onResetView,
  onZoomChange,
  onAutoRotateToggle,
  onScreenshot,
  cameraState,
  autoRotate,
  zoom,
}: ViewerControlsProps) {
  const [activePreset, setActivePreset] = useState<ViewPreset | null>(null);

  const handlePresetClick = (preset: ViewPreset) => {
    setActivePreset(preset);
    onViewPreset(preset);
  };

  const presets: { id: ViewPreset; label: string; description: string }[] = [
    { id: 'front', label: 'Front', description: 'Front view' },
    { id: 'back', label: 'Back', description: 'Back view' },
    { id: 'left', label: 'Left', description: 'Left side view' },
    { id: 'right', label: 'Right', description: 'Right side view' },
    { id: 'top', label: 'Top', description: 'Top view' },
    { id: 'bottom', label: 'Bottom', description: 'Bottom view' },
    { id: 'isometric', label: 'Iso', description: 'Isometric view' },
  ];

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Camera size={16} />
          View Controls
        </h3>

        {/* View Presets */}
        <div className="space-y-2 mb-4">
          <div className="grid grid-cols-3 gap-2">
            {presets.slice(0, 6).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset.id)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  activePreset === preset.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presets.slice(6).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset.id)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  activePreset === preset.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={onResetView}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-1"
              title="Reset to default view"
            >
              <Home size={14} />
              Reset
            </button>
          </div>
        </div>

        {/* Camera Position Display */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Position:</span>
            <span className="font-mono text-gray-700">
              ({cameraState.position[0].toFixed(2)}, {cameraState.position[1].toFixed(2)}, {cameraState.position[2].toFixed(2)})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Rotation:</span>
            <span className="font-mono text-gray-700">
              ({(cameraState.rotation[0] * 180 / Math.PI).toFixed(0)}°, {(cameraState.rotation[1] * 180 / Math.PI).toFixed(0)}°)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Zoom:</span>
            <span className="font-mono text-gray-700">{(zoom * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-medium text-gray-600 block">Zoom Level</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onZoomChange(zoom * 0.8)}
              className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="flex-1"
            />
            <button
              onClick={() => onZoomChange(zoom * 1.25)}
              className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
            <span className="text-xs text-gray-500 w-10 text-right">{(zoom * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Auto-Rotate Toggle */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-medium text-gray-700 flex items-center gap-2">
              <RotateCw size={14} />
              Auto-Rotate
            </span>
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => onAutoRotateToggle(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>

        {/* Screenshot Button */}
        <Button
          onClick={onScreenshot}
          variant="outline"
          size="sm"
          className="w-full mt-4"
        >
          <Download size={14} className="mr-2" />
          Capture Screenshot
        </Button>
      </div>
    </Card>
  );
}
