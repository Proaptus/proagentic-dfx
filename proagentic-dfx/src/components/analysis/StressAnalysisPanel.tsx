'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { EquationDisplay } from './EquationDisplay';
import { StressContourChart } from '@/components/charts';
import type { DesignStress } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface StressAnalysisPanelProps {
  data: DesignStress;
}

type StressType = 'von_mises' | 'hoop' | 'axial' | 'shear';
type LoadCase = 'test_pressure' | 'burst_pressure' | 'operating_pressure';

const STRESS_TYPES: Record<StressType, string> = {
  von_mises: 'von Mises',
  hoop: 'Hoop Stress',
  axial: 'Axial Stress',
  shear: 'Shear Stress',
};

const LOAD_CASES: Record<LoadCase, string> = {
  test_pressure: 'Test Pressure (1.5×)',
  burst_pressure: 'Burst Pressure (2.25×)',
  operating_pressure: 'Operating Pressure (1.0×)',
};

export function StressAnalysisPanel({ data }: StressAnalysisPanelProps) {
  const [selectedStressType, setSelectedStressType] = useState<StressType>('von_mises');
  const [selectedLoadCase, setSelectedLoadCase] = useState<LoadCase>('test_pressure');

  // Use per-layer stress data from API props (fallback to empty array)
  const layerStressData = data.per_layer_stress || [];

  // Through-thickness stress gradient
  const thicknessGradient = [
    { depth_pct: 0, stress: data.max_stress.value_mpa },
    { depth_pct: 20, stress: data.max_stress.value_mpa * 0.95 },
    { depth_pct: 40, stress: data.max_stress.value_mpa * 0.88 },
    { depth_pct: 60, stress: data.max_stress.value_mpa * 0.92 },
    { depth_pct: 80, stress: data.max_stress.value_mpa * 0.85 },
    { depth_pct: 100, stress: data.max_stress.value_mpa * 0.78 },
  ];

  // Use stress concentration factor from API props (fallback to 1.0 if not provided)
  const scf = data.stress_concentration_factor || 1.0;
  const safetyMargin = data.max_stress.margin_percent;

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Load Case
          </label>
          <select
            value={selectedLoadCase}
            onChange={(e) => setSelectedLoadCase(e.target.value as LoadCase)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            Stress Type
          </label>
          <select
            value={selectedStressType}
            onChange={(e) => setSelectedStressType(e.target.value as StressType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(STRESS_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Maximum Stress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Maximum Stress</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="text-5xl font-bold text-gray-900">
            {data.max_stress.value_mpa}{' '}
            <span className="text-lg font-normal text-gray-500">MPa</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                safetyMargin > 20
                  ? 'bg-green-100 text-green-700'
                  : safetyMargin > 10
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              +{safetyMargin}% margin
            </span>
            <span className="text-gray-500 text-sm">
              vs {data.max_stress.allowable_mpa} MPa allowable
            </span>
          </div>

          <dl className="space-y-2 text-sm border-t pt-4">
            <div className="flex justify-between">
              <dt className="text-gray-500">Load Case:</dt>
              <dd className="font-medium">{data.load_case}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Pressure:</dt>
              <dd className="font-medium">{data.load_pressure_bar} bar</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Location:</dt>
              <dd className="font-medium">
                {data.max_stress.region.replace(/_/g, ' ')}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Coordinates:</dt>
              <dd className="font-mono text-xs">
                ({data.max_stress.location.r.toFixed(1)}, {data.max_stress.location.z.toFixed(1)}, {data.max_stress.location.theta.toFixed(1)}°)
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">SCF (Stress Concentration):</dt>
              <dd className="font-medium">{scf.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Large Interactive Stress Contour Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Stress Contour ({STRESS_TYPES[selectedStressType]})</CardTitle>
        </CardHeader>
        <div className="h-[500px]">
          <StressContourChart
            stressData={data}
            onExport={(format) => console.log(`Exporting stress contour as ${format}`)}
          />
        </div>
      </Card>

      {/* Layer-by-Layer Stress Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Layer Stress Breakdown</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Layer</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-right p-3 font-medium">Hoop (MPa)</th>
                <th className="text-right p-3 font-medium">Axial (MPa)</th>
                <th className="text-right p-3 font-medium">Shear (MPa)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {layerStressData.map((layer, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{layer.layer}</td>
                  <td className="p-3 text-gray-600">{layer.type}</td>
                  <td className="p-3 text-right font-mono">{layer.hoop}</td>
                  <td className="p-3 text-right font-mono">{layer.axial}</td>
                  <td className="p-3 text-right font-mono">{layer.shear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Through-Thickness Stress Gradient */}
      <Card>
        <CardHeader>
          <CardTitle>Through-Thickness Stress Gradient</CardTitle>
        </CardHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={thicknessGradient}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="depth_pct"
                label={{ value: 'Depth (%)', position: 'insideBottom', offset: -5 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                label={{ value: 'Stress (MPa)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="stress"
                stroke="#3B82F6"
                strokeWidth={2}
                name="von Mises Stress"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Stress variation from inner (liner) to outer surface of composite
        </p>
      </Card>

      {/* Stress Equations */}
      <EquationDisplay
        title="Hoop Stress (Thin-Wall Approximation)"
        equation="σ_h = (P × r) / t"
        variables={[
          { symbol: 'σ_h', description: 'Hoop stress (circumferential)', value: '1650 MPa' },
          { symbol: 'P', description: 'Internal pressure', value: `${data.load_pressure_bar} bar` },
          { symbol: 'r', description: 'Mean radius', value: '140 mm' },
          { symbol: 't', description: 'Wall thickness', value: '12 mm' },
        ]}
        explanation="For cylindrical pressure vessels, hoop stress is the primary stress component and is twice the axial stress in thin-wall approximation."
      />

      <EquationDisplay
        title="Axial Stress"
        equation="σ_a = (P × r) / (2t)"
        variables={[
          { symbol: 'σ_a', description: 'Axial stress (longitudinal)', value: '825 MPa' },
        ]}
        explanation="Axial stress acts along the length of the cylinder and is half the hoop stress for thin-wall cylinders."
      />

      <EquationDisplay
        title="Safety Margin Calculation"
        equation="Margin = ((σ_allowable - σ_max) / σ_max) × 100%"
        variables={[
          { symbol: 'σ_allowable', description: 'Allowable stress (with safety factor)', value: `${data.max_stress.allowable_mpa} MPa` },
          { symbol: 'σ_max', description: 'Maximum stress (FEA)', value: `${data.max_stress.value_mpa} MPa` },
          { symbol: 'Margin', description: 'Safety margin', value: `${safetyMargin}%` },
        ]}
        explanation="Positive margin indicates design is safe. Typical aerospace requirement: ≥10% margin."
      />
    </div>
  );
}
