'use client';

import { useState } from 'react';
import { Ruler, Circle, Triangle as AngleIcon, Trash2, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';

// Calculate distance between two 3D points
export function calculateDistance(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Calculate angle between three points (vertex at p2)
export function calculateAngle(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number },
  p3: { x: number; y: number; z: number }
): number {
  // Vector from p2 to p1
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
  // Vector from p2 to p3
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };

  // Dot product
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;

  // Magnitudes
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  // Angle in degrees
  const cosAngle = dot / (mag1 * mag2);
  return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
}

// Calculate radius from center point and edge point
export function calculateRadius(
  center: { x: number; y: number; z: number },
  edge: { x: number; y: number; z: number }
): number {
  return calculateDistance(center, edge);
}

export type MeasurementMode = 'distance' | 'angle' | 'radius' | null;

export interface Measurement {
  id: string;
  type: 'distance' | 'angle' | 'radius';
  value: number;
  unit: string;
  points: Array<{ x: number; y: number; z: number }>;
  timestamp: number;
}

export interface MeasurementToolsProps {
  mode: MeasurementMode;
  onModeChange: (mode: MeasurementMode) => void;
  measurements: Measurement[];
  onClearMeasurement: (id: string) => void;
  onClearAll: () => void;
  pendingPoints?: Array<{ x: number; y: number; z: number }>;
  onAddMeasurement?: (measurement: Omit<Measurement, 'id' | 'timestamp'>) => void;
}

export function MeasurementTools({
  mode,
  onModeChange,
  measurements,
  onClearMeasurement,
  onClearAll,
  pendingPoints = [],
  onAddMeasurement: _onAddMeasurement,
}: MeasurementToolsProps) {
  const [_expanded, _setExpanded] = useState(false);

  // Auto-create measurement logic moved to parent (ViewerScreen)
  // const createMeasurementFromPoints = () => { ... }

  const tools: { id: MeasurementMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      id: 'distance',
      label: 'Distance',
      icon: <Ruler size={14} />,
      description: 'Measure distance between two points',
    },
    {
      id: 'angle',
      label: 'Angle',
      icon: <AngleIcon size={14} />,
      description: 'Measure angle between three points',
    },
    {
      id: 'radius',
      label: 'Radius',
      icon: <Circle size={14} />,
      description: 'Measure radius/diameter',
    },
  ];

  const formatMeasurementValue = (measurement: Measurement): string => {
    const { value, unit, type } = measurement;
    if (type === 'angle') {
      return `${value.toFixed(1)}${unit}`;
    }
    return `${value.toFixed(2)} ${unit}`;
  };

  const formatPoints = (points: Array<{ x: number; y: number; z: number }>): string => {
    if (points.length === 0) return 'No points';
    if (points.length === 1) return `(${points[0].x.toFixed(1)}, ${points[0].y.toFixed(1)}, ${points[0].z.toFixed(1)})`;
    return `${points.length} points`;
  };

  return (
    <Card className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Ruler size={16} />
          Measurement Tools
        </h3>
        {mode && (
          <button
            onClick={() => onModeChange(null)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
            title="Exit measurement mode"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Tool Selection */}
      <div className="grid grid-cols-3 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onModeChange(mode === tool.id ? null : tool.id)}
            className={`flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium rounded-lg transition-all ${
              mode === tool.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={tool.description}
          >
            {tool.icon}
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Active Mode Indicator */}
      {mode && (
        <div className="bg-blue-50 rounded-lg p-2 text-xs text-blue-700">
          <strong>Active Mode:</strong>{' '}
          {tools.find((t) => t.id === mode)?.description || 'Unknown'}
          <div className="mt-1 text-blue-600">Click on the model to place measurement points</div>
          {pendingPoints.length > 0 && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <div className="font-medium">Points collected: {pendingPoints.length}</div>
              {mode === 'distance' && <div className="text-blue-600">Need 2 points (1 more)</div>}
              {mode === 'angle' && pendingPoints.length < 3 && (
                <div className="text-blue-600">Need 3 points ({3 - pendingPoints.length} more)</div>
              )}
              {mode === 'radius' && pendingPoints.length < 2 && (
                <div className="text-blue-600">Need 2 points (center + edge)</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Measurements History */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">
            Measurements ({measurements.length})
          </span>
          {measurements.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 size={12} />
              Clear All
            </button>
          )}
        </div>

        {measurements.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 text-center">
            No measurements yet. Select a tool above to start measuring.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {measurements.map((measurement) => {
              const tool = tools.find((t) => t.id === measurement.type);
              return (
                <div
                  key={measurement.id}
                  className="bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-600">{tool?.icon}</span>
                        <span className="text-xs font-medium text-gray-700 capitalize">
                          {measurement.type}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatMeasurementValue(measurement)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatPoints(measurement.points)}
                      </div>
                    </div>
                    <button
                      onClick={() => onClearMeasurement(measurement.id)}
                      className="p-1 rounded hover:bg-red-100 text-red-600"
                      title="Delete measurement"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Instructions */}
      {!mode && measurements.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-2">
          <div className="font-medium">How to use:</div>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>Select a measurement tool above</li>
            <li>Click points on the 3D model</li>
            <li>Measurements appear in the history</li>
            <li>Click tool again to deselect</li>
          </ul>
        </div>
      )}
    </Card>
  );
}
