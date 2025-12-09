'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { EquationDisplay } from './EquationDisplay';
import type { DesignFailure } from '@/lib/types';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface FailureAnalysisPanelProps {
  data: DesignFailure;
}

export function FailureAnalysisPanel({ data }: FailureAnalysisPanelProps) {
  // Use Tsai-Wu data from API props (fallback to empty array)
  const layerTsaiWu = Array.isArray(data.tsai_wu_per_layer) ? data.tsai_wu_per_layer : [];

  // Use Hashin criteria from API props (fallback to empty array)
  const hashinCriteria = Array.isArray(data.hashin_indices) ? data.hashin_indices : [];

  // Use progressive failure sequence from API props (fallback to empty array)
  const failureTimeline = Array.isArray(data.progressive_failure_sequence) ? data.progressive_failure_sequence : [];

  return (
    <div className="space-y-6">
      {/* Top Row: Predicted Failure Mode and FPF */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Predicted Failure Mode</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {data.predicted_failure_mode.is_preferred ? (
                <CheckCircle size={24} className="text-green-500" />
              ) : (
                <AlertTriangle size={24} className="text-red-500" />
              )}
              <span className="text-2xl font-semibold capitalize">
                {data.predicted_failure_mode.mode.replace(/_/g, ' ')}
              </span>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {data.predicted_failure_mode.explanation}
            </p>

            <div
              className={`p-4 rounded-lg ${
                data.predicted_failure_mode.is_preferred
                  ? 'bg-green-50 border-l-4 border-green-500'
                  : 'bg-red-50 border-l-4 border-red-500'
              }`}
            >
              <div className="font-medium mb-1">
                {data.predicted_failure_mode.is_preferred
                  ? '✓ PREFERRED Failure Mode'
                  : '⚠ WARNING: Non-Preferred Failure Mode'}
              </div>
              <div className="text-sm text-gray-700">
                {data.predicted_failure_mode.is_preferred
                  ? 'Fiber-dominated failure is predictable, progressive, and provides warning before catastrophic failure.'
                  : 'Matrix-dominated or sudden failures can occur without warning. Consider design modifications.'}
              </div>
            </div>

            <dl className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Location:</dt>
                <dd className="font-medium">
                  {data.predicted_failure_mode.location.replace(/_/g, ' ')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Confidence:</dt>
                <dd className="font-medium">
                  {(data.predicted_failure_mode.confidence * 100).toFixed(0)}%
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

      {/* Progressive Failure Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Progressive Failure Sequence</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {failureTimeline.map((stage, i) => (
            <div key={i} className="flex gap-4 items-start">
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

      {/* Tsai-Wu Failure Criterion */}
      <div className="grid grid-cols-2 gap-6">
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
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{layer.layer}</td>
                    <td className="p-3 text-gray-600">{layer.type}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${
                              layer.value < 0.5
                                ? 'bg-green-500'
                                : layer.value < 0.8
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
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
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
                  <span className="font-mono text-gray-900">{criterion.value.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full">
                    <div
                      className={`h-3 rounded-full ${
                        criterion.value < 0.4
                          ? 'bg-green-500'
                          : criterion.value < 0.7
                          ? 'bg-yellow-500'
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${criterion.value * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16">/ {criterion.threshold}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500 bg-blue-50 p-3 rounded">
            Hashin criteria separate fiber and matrix failure modes in tension and compression, providing more detailed damage prediction than Tsai-Wu.
          </div>
        </Card>
      </div>

      {/* Failure Criterion Equations */}
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
  );
}
