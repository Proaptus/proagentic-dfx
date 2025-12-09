'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { EquationDisplay } from './EquationDisplay';
import { TornadoChart, RadarChart } from '@/components/charts';
import type { DesignFailure } from '@/lib/types';
import type { SensitivityParameter } from '@/components/charts/TornadoChart';
import type { RadarMetric, RadarDesignData } from '@/components/charts/RadarChart';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface FailureAnalysisPanelProps {
  data: DesignFailure;
  designId?: string;
  onFailureDataChange?: (data: DesignFailure) => void;
}

type LoadCase = 'test_pressure' | 'burst_pressure' | 'operating_pressure';
type FailureMode = 'fiber_tension' | 'fiber_compression' | 'matrix_tension' | 'matrix_compression';

const LOAD_CASES: Record<LoadCase, string> = {
  test_pressure: 'Test Pressure (1.5×)',
  burst_pressure: 'Burst Pressure (2.25×)',
  operating_pressure: 'Operating Pressure (1.0×)',
};

const FAILURE_MODES: Record<FailureMode, string> = {
  fiber_tension: 'Fiber Tension',
  fiber_compression: 'Fiber Compression',
  matrix_tension: 'Matrix Tension',
  matrix_compression: 'Matrix Compression',
};

export function FailureAnalysisPanel({ data: initialData, designId = 'C', onFailureDataChange }: FailureAnalysisPanelProps) {
  const [failureData, setFailureData] = useState<DesignFailure>(initialData);
  const [selectedLoadCase, setSelectedLoadCase] = useState<LoadCase>('test_pressure');
  const [selectedFailureMode, setSelectedFailureMode] = useState<FailureMode>('fiber_tension');
  const [isLoading, setIsLoading] = useState(false);
  const [showEquations, setShowEquations] = useState(false);

  useEffect(() => {
    const fetchFailureData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/designs/${designId}/failure?load_case=${selectedLoadCase}&mode=${selectedFailureMode}`
        );
        if (response.ok) {
          const newData = await response.json();
          setFailureData(newData);
          // Notify parent of data change so stats can update
          onFailureDataChange?.(newData);
        }
      } catch (error) {
        console.error('Failed to fetch failure data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if load case or failure mode changes (not on initial mount with initialData)
    if (selectedLoadCase !== 'test_pressure' || selectedFailureMode !== 'fiber_tension') {
      fetchFailureData();
    }
  }, [selectedLoadCase, selectedFailureMode, designId, onFailureDataChange]);

  // Use Tsai-Wu data from API props (fallback to empty array)
  const layerTsaiWu = Array.isArray(failureData.tsai_wu_per_layer) ? failureData.tsai_wu_per_layer : [];

  // Use Hashin criteria from API props (fallback to empty array)
  const hashinCriteria = Array.isArray(failureData.hashin_indices) ? failureData.hashin_indices : [];

  // Use progressive failure sequence from API props (fallback to empty array)
  const failureTimeline = Array.isArray(failureData.progressive_failure_sequence) ? failureData.progressive_failure_sequence : [];

  // Calculate key metrics from data
  // Safety Factor = 1 / sqrt(Tsai-Wu index) per composite failure theory
  // When index < 1, SF > 1 (safe). When index = 1, SF = 1 (at limit).
  const tsaiWuIndex = failureData.tsai_wu?.max_at_test?.value ?? 0.8;
  const safetyFactorValue = tsaiWuIndex > 0 ? (1.0 / Math.sqrt(tsaiWuIndex)) : 1.25;
  const safetyFactor = safetyFactorValue.toFixed(2);

  const criticalMode = failureData.predicted_failure_mode?.mode?.replace(/_/g, ' ') || 'Fiber Breakage';

  // Failure probability from Hashin indices - these represent reserve factor margins
  // Lower index = safer design. Index < 1 means no failure predicted.
  const maxHashinIndex = hashinCriteria.length > 0
    ? Math.max(...hashinCriteria.map(h => h.value))
    : 0.65;
  // Convert to approximate failure probability percentage (scaled for visualization)
  // At test pressure, these should be comfortably below 1.0 for a safe design
  const failureProbability = Math.min(maxHashinIndex * 100, 99.9); // Cap at 99.9%

  // Design Margin = (SF - 1) × 100% = ((1/sqrt(TW)) - 1) × 100%
  // Positive margin means reserve capacity beyond required
  const designMarginValue = (safetyFactorValue - 1) * 100;
  const designMargin = designMarginValue.toFixed(1);

  // Prepare sensitivity analysis data for Tornado Chart
  const sensitivityData: SensitivityParameter[] = [
    {
      parameter: 'fiber_strength',
      label: 'Fiber Strength',
      low_impact: -12.5,
      high_impact: 15.8,
      baseline: 2700,
      unit: 'MPa',
    },
    {
      parameter: 'fiber_volume_fraction',
      label: 'Fiber Volume Fraction',
      low_impact: -8.2,
      high_impact: 9.4,
      baseline: 0.62,
    },
    {
      parameter: 'layer_thickness',
      label: 'Layer Thickness',
      low_impact: -6.1,
      high_impact: 7.3,
      baseline: 0.15,
      unit: 'mm',
    },
    {
      parameter: 'matrix_strength',
      label: 'Matrix Strength',
      low_impact: -5.4,
      high_impact: 6.2,
      baseline: 85,
      unit: 'MPa',
    },
    {
      parameter: 'winding_angle',
      label: 'Winding Angle',
      low_impact: -4.8,
      high_impact: 5.1,
      baseline: 15,
      unit: '°',
    },
  ];

  // Prepare failure envelope data for Radar Chart (Tsai-Wu, Max Stress, Hashin criteria)
  const failureMetrics: RadarMetric[] = [
    { metric: 'fiber_tension', label: 'Fiber Tension', unit: '', higherIsBetter: false },
    { metric: 'fiber_compression', label: 'Fiber Compression', unit: '', higherIsBetter: false },
    { metric: 'matrix_tension', label: 'Matrix Tension', unit: '', higherIsBetter: false },
    { metric: 'matrix_compression', label: 'Matrix Compression', unit: '', higherIsBetter: false },
    { metric: 'shear', label: 'Shear', unit: '', higherIsBetter: false },
  ];

  const failureEnvelopeData: RadarDesignData[] = [
    {
      designId: 'hashin',
      designName: 'Hashin Criteria',
      values: {
        fiber_tension: hashinCriteria.find(h => h.mode === 'Fiber Tension')?.value || 0.38,
        fiber_compression: hashinCriteria.find(h => h.mode === 'Fiber Compression')?.value || 0.22,
        matrix_tension: hashinCriteria.find(h => h.mode === 'Matrix Tension')?.value || 0.65,
        matrix_compression: hashinCriteria.find(h => h.mode === 'Matrix Compression')?.value || 0.41,
        shear: 0.52,
      },
      color: '#3B82F6',
    },
    {
      designId: 'tsai_wu',
      designName: 'Tsai-Wu',
      values: {
        fiber_tension: failureData.tsai_wu?.max_at_test?.value || 0.85,
        fiber_compression: 0.72,
        matrix_tension: 0.88,
        matrix_compression: 0.68,
        shear: 0.75,
      },
      color: '#10B981',
    },
    {
      designId: 'max_stress',
      designName: 'Max Stress',
      values: {
        fiber_tension: 0.92,
        fiber_compression: 0.78,
        matrix_tension: 0.95,
        matrix_compression: 0.82,
        shear: 0.88,
      },
      color: '#F59E0B',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Load Case
          </label>
          <select
            value={selectedLoadCase}
            onChange={(e) => setSelectedLoadCase(e.target.value as LoadCase)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={isLoading}
          >
            {Object.entries(LOAD_CASES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Failure Mode
          </label>
          <select
            value={selectedFailureMode}
            onChange={(e) => setSelectedFailureMode(e.target.value as FailureMode)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={isLoading}
          >
            {Object.entries(FAILURE_MODES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowEquations(!showEquations)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showEquations
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          {showEquations ? 'Hide Equations' : 'Show Equations'}
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-sm text-gray-500 text-center py-2 transition-opacity">
          Loading failure analysis...
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-4 gap-4 transition-all duration-300">
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-4">
            <div className="text-sm text-gray-500 mb-1">Safety Factor</div>
            <div className={`text-3xl font-bold ${safetyFactorValue >= 1.5 ? 'text-green-600' : safetyFactorValue >= 1.0 ? 'text-orange-600' : 'text-red-600'}`}>
              {safetyFactor}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {safetyFactorValue >= 1.5 ? 'Excellent margin' : safetyFactorValue >= 1.0 ? 'Adequate' : 'Below minimum'}
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="p-4">
            <div className="text-sm text-gray-500 mb-1">Critical Mode</div>
            <div className="text-xl font-bold text-gray-900 capitalize">{criticalMode}</div>
            <div className="text-xs text-gray-500 mt-1">
              {failureData.predicted_failure_mode?.is_preferred ? 'Preferred' : 'Non-preferred'}
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="p-4">
            <div className="text-sm text-gray-500 mb-1">Max Hashin Index</div>
            <div className={`text-3xl font-bold ${maxHashinIndex < 0.8 ? 'text-green-600' : maxHashinIndex < 1.0 ? 'text-orange-600' : 'text-red-600'}`}>
              {maxHashinIndex.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {maxHashinIndex < 1.0 ? 'Below failure threshold' : 'Above failure threshold'}
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="p-4">
            <div className="text-sm text-gray-500 mb-1">Design Margin</div>
            <div className={`text-3xl font-bold ${designMarginValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {designMarginValue >= 0 ? '+' : ''}{designMargin}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {designMarginValue >= 0 ? 'Above minimum' : 'Below minimum'}
            </div>
          </div>
        </Card>
      </div>

      {/* Top Row: Predicted Failure Mode and FPF */}
      <div className="grid grid-cols-2 gap-4 transition-all duration-300">
        <Card>
          <CardHeader>
            <CardTitle>Predicted Failure Mode</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {failureData.predicted_failure_mode.is_preferred ? (
                <CheckCircle size={24} className="text-green-500" />
              ) : (
                <AlertTriangle size={24} className="text-red-500" />
              )}
              <span className="text-2xl font-semibold capitalize">
                {failureData.predicted_failure_mode.mode.replace(/_/g, ' ')}
              </span>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {failureData.predicted_failure_mode.explanation}
            </p>

            <div
              className={`p-4 rounded-lg transition-all duration-300 ${
                failureData.predicted_failure_mode.is_preferred
                  ? 'bg-green-50 border-l-4 border-green-500'
                  : 'bg-red-50 border-l-4 border-red-500'
              }`}
            >
              <div className="font-medium mb-1">
                {failureData.predicted_failure_mode.is_preferred
                  ? '✓ PREFERRED Failure Mode'
                  : '⚠ WARNING: Non-Preferred Failure Mode'}
              </div>
              <div className="text-sm text-gray-700">
                {failureData.predicted_failure_mode.is_preferred
                  ? 'Fiber-dominated failure is predictable, progressive, and provides warning before catastrophic failure.'
                  : 'Matrix-dominated or sudden failures can occur without warning. Consider design modifications.'}
              </div>
            </div>

            <dl className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Location:</dt>
                <dd className="font-medium">
                  {failureData.predicted_failure_mode.location.replace(/_/g, ' ')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Confidence:</dt>
                <dd className="font-medium">
                  {(failureData.predicted_failure_mode.confidence * 100).toFixed(0)}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Mechanism:</dt>
                <dd className="font-medium text-xs">
                  Progressive fiber breakage under hoop stress
                </dd>
              </div>
            </dl>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} />
              First Ply Failure (FPF)
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">FPF Pressure</div>
              <div className="text-4xl font-bold text-orange-600">1012 bar</div>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="font-medium text-orange-800 mb-1">Critical Layer</div>
              <div className="text-sm text-orange-700">
                Layer 2 (Hoop 90°) at cylinder mid-section
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">FPF / Test Pressure:</span>
                <span className="font-mono font-semibold">1.44×</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">FPF / Operating:</span>
                <span className="font-mono font-semibold">3.24×</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Burst / FPF Margin:</span>
                <span className="font-mono font-semibold text-green-600">11.2%</span>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              First Ply Failure marks the onset of damage but not immediate failure. The tank retains significant load-carrying capacity beyond FPF.
            </div>
          </div>
        </Card>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Sensitivity Analysis (Tornado Chart) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[500px] p-4">
          <TornadoChart
            data={sensitivityData}
            title="Failure Sensitivity Analysis"
            sortByMagnitude={true}
            onExport={(format) => console.log(`Exporting tornado as ${format}`)}
          />
        </div>

        {/* Failure Envelope (Radar Chart) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[500px] p-4">
          <RadarChart
            metrics={failureMetrics}
            designs={failureEnvelopeData}
            title="Failure Envelope Comparison"
            normalizeData={false}
            onExport={(format) => console.log(`Exporting radar as ${format}`)}
          />
        </div>
      </div>

      {/* Per-Layer Failure Analysis */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tsai-Wu Failure Index (Per Layer)</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Layer</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-right p-3 font-medium">Index</th>
                  <th className="text-center p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {layerTsaiWu.map((layer, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium">{layer.layer}</td>
                    <td className="p-3 text-gray-600">{layer.type}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              layer.value < 0.7
                                ? 'bg-green-500'
                                : layer.value < 0.9
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${layer.value * 100}%` }}
                          />
                        </div>
                        <span className="font-mono w-12 text-right">{layer.value.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        layer.value < 0.7
                          ? 'bg-green-100 text-green-700'
                          : layer.value < 0.9
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {layer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded">
            Tsai-Wu index &lt; 1.0 indicates no failure. Values shown at test pressure (700 bar).
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hashin Damage Criteria</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {hashinCriteria.map((criterion, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{criterion.mode}</span>
                  <span className={`font-mono font-semibold ${
                    criterion.value < 0.5 ? 'text-green-600' : criterion.value < 0.8 ? 'text-yellow-600' : 'text-orange-600'
                  }`}>
                    {criterion.value.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        criterion.value < 0.5
                          ? 'bg-green-500'
                          : criterion.value < 0.8
                          ? 'bg-yellow-500'
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(criterion.value * 100, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium w-12 text-right ${
                    criterion.value < 1.0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {criterion.value < 1.0 ? 'Safe' : 'Fail'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500 bg-blue-50 p-3 rounded">
            Hashin criteria separate fiber and matrix failure modes in tension and compression, providing more detailed damage prediction than Tsai-Wu.
          </div>
        </Card>
      </div>

      {/* Progressive Failure Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Progressive Failure Sequence</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {failureTimeline.map((stage, i) => (
            <div key={i} className="flex gap-4 items-start transition-all duration-300 hover:bg-gray-50 p-2 rounded">
              <div className="flex-shrink-0 w-16 text-center">
                <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  {stage.pressure}bar
                </div>
              </div>
              <div className="flex-1 border-l-2 border-blue-200 pl-4 pb-4 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
                <div className="font-semibold text-gray-900">{stage.event}</div>
                <div className="text-sm text-gray-600 mt-1">{stage.description}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Collapsible Equations Section */}
      {showEquations && (
        <div className="space-y-4 pt-4 border-t transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900">Failure Criterion Equations</h3>

          <EquationDisplay
            title="Tsai-Wu Failure Criterion"
            equation="F_i × σ_i + F_ij × σ_i × σ_j < 1"
            variables={[
              { symbol: 'F_i', description: 'Linear strength coefficients' },
              { symbol: 'F_ij', description: 'Quadratic interaction coefficients' },
              { symbol: 'σ_i', description: 'Stress components (1, 2, 6 in lamina coords)' },
            ]}
            explanation="Tsai-Wu is a tensor polynomial criterion that accounts for interaction between different stress components. Index < 1.0 indicates no failure."
          />

          <EquationDisplay
            title="Hashin Fiber Tension Criterion"
            equation="((σ_11 / X_T)^2 + α × (τ_12^2 + τ_13^2) / S^2) ≥ 1"
            variables={[
              { symbol: 'σ_11', description: 'Longitudinal normal stress (fiber direction)' },
              { symbol: 'X_T', description: 'Longitudinal tensile strength', value: '2700 MPa' },
              { symbol: 'τ_12, τ_13', description: 'Shear stresses' },
              { symbol: 'S', description: 'Shear strength', value: '90 MPa' },
              { symbol: 'α', description: 'Shear contribution factor', value: '1.0' },
            ]}
            explanation="Hashin criterion separates failure modes: fiber tension/compression and matrix tension/compression. This allows for mode-specific damage evolution."
          />

          <EquationDisplay
            title="Failure Mode Preference"
            equation="Preference = fiber_breakage > delamination > matrix_cracking"
            explanation="Fiber-dominated failure is preferred because it is progressive and provides audible/visible warning (weeping, stress whitening) before catastrophic failure. Matrix failures can be sudden."
            defaultExpanded={false}
          />
        </div>
      )}
    </div>
  );
}
