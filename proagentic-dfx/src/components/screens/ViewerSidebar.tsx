'use client';

/**
 * Viewer Sidebar Components
 * Summary panels for geometry, performance, and stress data
 */

import { Activity } from 'lucide-react';
import type { DesignGeometry, DesignStress, DesignSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/currency';

interface GeometrySummaryProps {
  geometry: DesignGeometry;
}

export function GeometrySummary({ geometry }: GeometrySummaryProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Geometry Specifications
        </h3>
      </div>
      <dl className="p-4 space-y-3 text-sm">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <dt className="text-gray-600">Inner Radius:</dt>
          <dd className="font-semibold text-gray-900">{geometry.dimensions.inner_radius_mm} mm</dd>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <dt className="text-gray-600">Total Length:</dt>
          <dd className="font-semibold text-gray-900">{geometry.dimensions.total_length_mm} mm</dd>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <dt className="text-gray-600">Wall Thickness:</dt>
          <dd className="font-semibold text-gray-900">{geometry.dimensions.wall_thickness_mm} mm</dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-gray-600">Internal Volume:</dt>
          <dd className="font-semibold text-gray-900">{geometry.dimensions.internal_volume_liters} L</dd>
        </div>
      </dl>
    </div>
  );
}

interface PerformanceSummaryProps {
  summary: DesignSummary;
}

export function PerformanceSummary({ summary }: PerformanceSummaryProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Performance Metrics
        </h3>
      </div>
      <dl className="p-4 space-y-3 text-sm">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <dt className="text-gray-600">Weight:</dt>
          <dd className="font-semibold text-gray-900">{summary.summary.weight_kg} kg</dd>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <dt className="text-gray-600">Estimated Cost:</dt>
          <dd className="font-semibold text-gray-900">{formatCurrency(summary.summary.cost_eur)}</dd>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <dt className="text-gray-600">Burst Pressure:</dt>
          <dd className="font-semibold text-gray-900">{summary.summary.burst_pressure_bar} bar</dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-gray-600">Failure Probability:</dt>
          <dd className="font-semibold text-gray-900">{summary.summary.p_failure.toExponential(0)}</dd>
        </div>
      </dl>
    </div>
  );
}

interface StressSummaryProps {
  stress: DesignStress;
  selectedStressType: string;
  isLoadingStress: boolean;
}

export function StressSummary({ stress, selectedStressType, isLoadingStress }: StressSummaryProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <Activity size={16} />
          Stress Analysis
          {isLoadingStress && (
            <span className="ml-auto text-xs text-blue-600 animate-pulse">Loading...</span>
          )}
        </h3>
      </div>
      <dl className="p-4 space-y-3 text-sm">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <dt className="text-gray-600">Stress Type:</dt>
          <dd className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
            {stress.stress_type || selectedStressType}
          </dd>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <dt className="text-gray-600">Load Case:</dt>
          <dd className="font-semibold text-gray-900 text-xs">
            {stress.load_case} @ {stress.load_pressure_bar} bar
          </dd>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <dt className="text-gray-600">Maximum Stress:</dt>
          <dd className="font-semibold text-gray-900">{stress.max_stress.value_mpa} MPa</dd>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <dt className="text-gray-600">Allowable Stress:</dt>
          <dd className="font-semibold text-gray-900">{stress.max_stress.allowable_mpa} MPa</dd>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <dt className="text-gray-600">Safety Margin:</dt>
          <dd className={`font-semibold px-2 py-1 rounded ${
            stress.max_stress.margin_percent >= 0
              ? 'text-green-600 bg-green-50'
              : 'text-red-600 bg-red-50'
          }`}>
            {stress.max_stress.margin_percent >= 0 ? '+' : ''}{stress.max_stress.margin_percent}%
          </dd>
        </div>
        <div className="flex justify-between items-start">
          <dt className="text-gray-600">Critical Location:</dt>
          <dd className="font-medium text-gray-900 text-xs text-right max-w-[150px]">
            {stress.max_stress.region}
          </dd>
        </div>
      </dl>
    </div>
  );
}

interface DesignSelectorProps {
  designs: string[];
  currentDesign: string | null;
  onSelectDesign: (id: string) => void;
}

export function DesignSelector({ designs, currentDesign, onSelectDesign }: DesignSelectorProps) {
  return (
    <nav
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      aria-label="Design selection"
    >
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Design Selection
        </h2>
      </div>
      <div className="p-4 space-y-2" role="group" aria-label="Available designs">
        {designs.map((id) => (
          <button
            key={id}
            onClick={() => onSelectDesign(id)}
            className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all duration-200 ${
              currentDesign === id
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
            aria-pressed={currentDesign === id}
            aria-label={`Select Design ${id}${currentDesign === id ? ' (currently active)' : ''}`}
          >
            Design {id}
            {currentDesign === id && (
              <span className="ml-2 text-xs opacity-75" aria-hidden="true">• Active</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
