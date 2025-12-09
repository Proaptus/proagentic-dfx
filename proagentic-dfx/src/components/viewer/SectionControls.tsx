'use client';

import { useState } from 'react';
import { Scissors, Move, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export type SectionDirection = 'x' | 'y' | 'z';

export interface SectionControlsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  position: number;
  onPositionChange: (position: number) => void;
  direction: SectionDirection;
  onDirectionChange: (direction: SectionDirection) => void;
  showInterior: boolean;
  onShowInteriorToggle: (show: boolean) => void;
}

export function SectionControls({
  enabled,
  onToggle,
  position,
  onPositionChange,
  direction,
  onDirectionChange,
  showInterior,
  onShowInteriorToggle,
}: SectionControlsProps) {
  const [_expanded, _setExpanded] = useState(false);

  const directions: { id: SectionDirection; label: string; description: string }[] = [
    { id: 'x', label: 'X-Axis', description: 'Cut perpendicular to X-axis' },
    { id: 'y', label: 'Y-Axis', description: 'Cut perpendicular to Y-axis' },
    { id: 'z', label: 'Z-Axis', description: 'Cut perpendicular to Z-axis (longitudinal)' },
  ];

  return (
    <Card className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Scissors size={16} />
          Section View
        </h3>
        <button
          onClick={() => onToggle(!enabled)}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
            enabled
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {enabled ? (
            <>
              <Eye size={12} className="inline mr-1" />
              ON
            </>
          ) : (
            <>
              <EyeOff size={12} className="inline mr-1" />
              OFF
            </>
          )}
        </button>
      </div>

      {/* Controls (only shown when enabled) */}
      {enabled && (
        <>
          {/* Section Direction */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 block">
              Section Plane Direction
            </label>
            <div className="grid grid-cols-3 gap-2">
              {directions.map((dir) => (
                <button
                  key={dir.id}
                  onClick={() => onDirectionChange(dir.id)}
                  className={`px-2 py-1.5 text-xs font-medium rounded transition-all ${
                    direction === dir.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={dir.description}
                >
                  {dir.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section Position Slider */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 flex items-center gap-2">
              <Move size={12} />
              Section Plane Position
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={position}
                onChange={(e) => onPositionChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-12 text-right font-mono">
                {position.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>Start</span>
              <span>Center</span>
              <span>End</span>
            </div>
          </div>

          {/* Interior View Options */}
          <div className="pt-3 border-t border-gray-200 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-gray-700">
                Show Interior Details
              </span>
              <input
                type="checkbox"
                checked={showInterior}
                onChange={(e) => onShowInteriorToggle(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            {/* Visual indicator */}
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <div className="text-xs font-medium text-blue-700">Active Section Cut</div>
              <div className="text-xs text-blue-600 space-y-1">
                <div className="flex justify-between">
                  <span>Direction:</span>
                  <span className="font-mono uppercase">{direction}</span>
                </div>
                <div className="flex justify-between">
                  <span>Position:</span>
                  <span className="font-mono">{position.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Interior:</span>
                  <span className="font-mono">{showInterior ? 'Visible' : 'Hidden'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-500">
            <p>Use the slider to move the cutting plane through the tank geometry.</p>
          </div>
        </>
      )}

      {/* Disabled State Message */}
      {!enabled && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 text-center">
          Enable section view to reveal internal structure
        </div>
      )}
    </Card>
  );
}
