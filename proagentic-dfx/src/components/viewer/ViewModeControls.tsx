'use client';

import { Activity, Layers, Eye, RotateCw, ChevronDown, Loader2 } from 'lucide-react';
import type { StressType, LoadCase } from '@/lib/api/client';

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
  // Stress type selection
  selectedStressType?: StressType;
  selectedLoadCase?: LoadCase;
  onStressTypeChange?: (type: StressType) => void;
  onLoadCaseChange?: (loadCase: LoadCase) => void;
  isLoadingStress?: boolean;
}

// Human-readable labels for stress types
const STRESS_TYPE_LABELS: Record<StressType, string> = {
  vonMises: 'von Mises',
  hoop: 'Hoop',
  axial: 'Axial',
  shear: 'Shear',
  tsaiWu: 'Tsai-Wu',
};

const LOAD_CASE_LABELS: Record<LoadCase, string> = {
  test: 'Test Pressure',
  burst: 'Burst Pressure',
};

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
  selectedStressType = 'vonMises',
  selectedLoadCase = 'test',
  onStressTypeChange,
  onLoadCaseChange,
  isLoadingStress = false,
}: ViewModeControlsProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-2 flex flex-wrap gap-2 items-center">
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
        {isLoadingStress ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <Activity size={16} aria-hidden="true" />
        )}
        Stress Analysis
      </button>

      {/* Stress Type Selector - visible when stress is enabled */}
      {showStress && (
        <>
          <div className="relative">
            <select
              value={selectedStressType}
              onChange={(e) => onStressTypeChange?.(e.target.value as StressType)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              aria-label="Select stress type"
              disabled={isLoadingStress}
            >
              {(Object.keys(STRESS_TYPE_LABELS) as StressType[]).map((type) => (
                <option key={type} value={type}>
                  {STRESS_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          <div className="relative">
            <select
              value={selectedLoadCase}
              onChange={(e) => onLoadCaseChange?.(e.target.value as LoadCase)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              aria-label="Select load case"
              disabled={isLoadingStress}
            >
              {(Object.keys(LOAD_CASE_LABELS) as LoadCase[]).map((loadCase) => (
                <option key={loadCase} value={loadCase}>
                  {LOAD_CASE_LABELS[loadCase]}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </>
      )}
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
