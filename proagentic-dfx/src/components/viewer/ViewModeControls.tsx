'use client';

import { Activity, Layers, Eye, RotateCw } from 'lucide-react';

export interface ViewModeControlsProps {
  showStress: boolean;
  showWireframe: boolean;
  showCrossSection: boolean;
  autoRotate: boolean;
  showLiner: boolean;
  onToggleStress: () => void;
  onToggleWireframe: () => void;
  onToggleCrossSection: () => void;
  onToggleAutoRotate: () => void;
  onToggleLiner: () => void;
}

export function ViewModeControls({
  showStress,
  showWireframe,
  showCrossSection,
  autoRotate,
  showLiner,
  onToggleStress,
  onToggleWireframe,
  onToggleCrossSection,
  onToggleAutoRotate,
  onToggleLiner,
}: ViewModeControlsProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-2 flex flex-wrap gap-2">
      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide self-center px-2">
        View Mode:
      </span>
      <button
        onClick={onToggleStress}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          showStress
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
        }`}
        aria-pressed={showStress}
        aria-label={showStress ? 'Disable stress analysis view' : 'Enable stress analysis view'}
      >
        <Activity size={16} aria-hidden="true" />
        Stress Analysis
      </button>
      <button
        onClick={onToggleWireframe}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          showWireframe
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
        }`}
        aria-pressed={showWireframe}
        aria-label={showWireframe ? 'Disable wireframe view' : 'Enable wireframe view'}
      >
        <Layers size={16} aria-hidden="true" />
        Wireframe
      </button>
      <button
        onClick={onToggleCrossSection}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          showCrossSection
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
        }`}
        aria-pressed={showCrossSection}
        aria-label={showCrossSection ? 'Disable cross-section view' : 'Enable cross-section view'}
      >
        <Eye size={16} aria-hidden="true" />
        Cross-Section
      </button>
      <button
        onClick={onToggleAutoRotate}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          autoRotate
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
        }`}
        aria-pressed={autoRotate}
        aria-label={autoRotate ? 'Disable auto-rotate' : 'Enable auto-rotate'}
      >
        <RotateCw size={16} aria-hidden="true" />
        Auto-Rotate
      </button>
      <button
        onClick={onToggleLiner}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          showLiner
            ? 'bg-white text-gray-700 border border-gray-200'
            : 'bg-gray-200 text-gray-400 border border-gray-300'
        }`}
        aria-pressed={showLiner}
        aria-label={showLiner ? 'Hide liner' : 'Show liner'}
      >
        Liner
      </button>
    </div>
  );
}
