'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { EquationDisplay } from './EquationDisplay';
import type { DesignThermal } from '@/lib/types';
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
import { Thermometer, AlertCircle, TrendingUp } from 'lucide-react';

interface ThermalAnalysisPanelProps {
  data: DesignThermal;
}

export function ThermalAnalysisPanel({ data }: ThermalAnalysisPanelProps) {
  // Use temperature profile data from API props (fallback to empty array)
  const temperatureProfile = data.temperature_profile || [];

  // Use extreme temperature performance data from API props (fallback to empty array)
  const extremeTemps = data.extreme_temperature_performance || [];

  // Use CTE mismatch data from API props (fallback to empty array)
  const cteComponents = data.cte_mismatch || [];

  const getTempStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-50 border-green-500 text-green-700';
      case 'warn': return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      case 'fail': return 'bg-red-50 border-red-500 text-red-700';
      default: return 'bg-gray-50 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Fast Fill Summary and Temperature Profile Chart */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer size={18} />
              Fast Fill Analysis
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{data.fast_fill.scenario}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <div className="text-xs text-gray-600 mb-1">Peak Gas Temp</div>
                <div className="text-2xl font-bold text-orange-700">{data.fast_fill.peak_gas_temp_c}°C</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="text-xs text-gray-600 mb-1">Peak Wall Temp</div>
                <div className="text-2xl font-bold text-blue-700">{data.fast_fill.peak_wall_temp_c}°C</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div className="text-xs text-gray-600 mb-1">Peak Liner Temp</div>
                <div className="text-2xl font-bold text-purple-700">{data.fast_fill.peak_liner_temp_c}°C</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                <div className="text-xs text-gray-600 mb-1">Time to Peak</div>
                <div className="text-2xl font-bold text-gray-700">{data.fast_fill.time_to_peak_seconds}s</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-l-4 ${getTempStatusColor(data.fast_fill.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Liner Temperature Limit</span>
                <span className="text-xl font-bold">{data.fast_fill.liner_limit_c}°C</span>
              </div>
              <div className="flex items-center gap-2">
                {data.fast_fill.status === 'pass' ? (
                  <TrendingUp size={16} className="text-green-600" />
                ) : (
                  <AlertCircle size={16} className="text-yellow-600" />
                )}
                <span className="text-sm font-semibold uppercase">
                  {data.fast_fill.status}
                </span>
                <span className="text-sm ml-auto">
                  Margin: {(data.fast_fill.liner_limit_c - data.fast_fill.peak_liner_temp_c).toFixed(1)}°C
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              Fast-fill scenario: 700 bar in {data.fast_fill.time_to_peak_seconds}s. Adiabatic compression causes significant temperature rise.
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temperature Profile (Fast Fill)</CardTitle>
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temperatureProfile}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="time"
                  label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 11 }}
                  domain={[0, 'dataMax + 10']}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="gas"
                  stroke="#F97316"
                  strokeWidth={2}
                  name="Gas Temperature"
                />
                <Line
                  type="monotone"
                  dataKey="wall"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Wall Temperature"
                />
                <Line
                  type="monotone"
                  dataKey="liner"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Liner Temperature"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Thermal Stress Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thermal Stress Components</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Maximum Thermal Stress</div>
              <div className="text-4xl font-bold text-gray-900">
                {data.thermal_stress.max_mpa}{' '}
                <span className="text-lg font-normal text-gray-500">MPa</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                at {data.thermal_stress.location.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hoop Component</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-3 bg-gray-200 rounded-full">
                    <div
                      className="h-3 bg-blue-500 rounded-full"
                      style={{
                        width: `${(data.thermal_stress.components.hoop_mpa / data.thermal_stress.max_mpa) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-sm w-16 text-right">
                    {data.thermal_stress.components.hoop_mpa} MPa
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Axial Component</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-3 bg-gray-200 rounded-full">
                    <div
                      className="h-3 bg-green-500 rounded-full"
                      style={{
                        width: `${(data.thermal_stress.components.axial_mpa / data.thermal_stress.max_mpa) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-sm w-16 text-right">
                    {data.thermal_stress.components.axial_mpa} MPa
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Radial Component</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-3 bg-gray-200 rounded-full">
                    <div
                      className="h-3 bg-orange-500 rounded-full"
                      style={{
                        width: `${(data.thermal_stress.components.radial_mpa / data.thermal_stress.max_mpa) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-sm w-16 text-right">
                    {data.thermal_stress.components.radial_mpa} MPa
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              Thermal stresses arise from temperature gradients and CTE mismatches. Combined with pressure stresses using superposition.
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CTE Mismatch Analysis</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-3">
              Coefficient of Thermal Expansion (CTE) differences between materials cause internal stresses during temperature changes.
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-2 font-medium">Component</th>
                    <th className="text-right p-2 font-medium">CTE</th>
                    <th className="text-right p-2 font-medium">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cteComponents.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-2 text-gray-700">{item.component}</td>
                      <td className="p-2 text-right font-mono text-xs">{item.cte}</td>
                      <td className="p-2 text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.stress_contribution === 'Significant'
                              ? 'bg-red-100 text-red-700'
                              : item.stress_contribution === 'Moderate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {item.stress_contribution}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500">
              <div className="text-sm font-medium text-orange-800 mb-1">Critical Mismatch</div>
              <div className="text-xs text-orange-700">
                HDPE liner expands ~240× more than carbon fiber. This creates significant interfacial stress during fast-fill heating.
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Extreme Temperature Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature-Dependent Properties</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Operating Condition</th>
                <th className="text-right p-3 font-medium">Strength Retention</th>
                <th className="text-center p-3 font-medium">Matrix Brittleness</th>
                <th className="text-center p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {extremeTemps.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-700">{row.condition}</td>
                  <td className="p-3 text-right">
                    <span className="font-mono">{row.hoop_strength_pct}%</span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.matrix_brittleness === 'High'
                          ? 'bg-red-100 text-red-700'
                          : row.matrix_brittleness === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {row.matrix_brittleness}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        row.status === 'nominal'
                          ? 'bg-green-100 text-green-700'
                          : row.status === 'acceptable'
                          ? 'bg-blue-100 text-blue-700'
                          : row.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Thermal Equations */}
      <EquationDisplay
        title="Adiabatic Compression Temperature Rise"
        equation="T_2 = T_1 × (P_2 / P_1)^((γ-1)/γ)"
        variables={[
          { symbol: 'T_2', description: 'Final gas temperature', value: `${data.fast_fill.peak_gas_temp_c}°C` },
          { symbol: 'T_1', description: 'Initial gas temperature', value: '20°C' },
          { symbol: 'P_2', description: 'Final pressure', value: '700 bar' },
          { symbol: 'P_1', description: 'Initial pressure', value: '1 bar' },
          { symbol: 'γ', description: 'Heat capacity ratio (H₂)', value: '1.41' },
        ]}
        explanation="During fast filling, compression is nearly adiabatic (no heat transfer). This causes significant temperature rise in the hydrogen gas."
      />

      <EquationDisplay
        title="Thermal Stress (CTE Mismatch)"
        equation="σ_thermal = E × Δα × ΔT"
        variables={[
          { symbol: 'σ_thermal', description: 'Thermal stress', value: `${data.thermal_stress.max_mpa} MPa` },
          { symbol: 'E', description: 'Elastic modulus', value: '135 GPa' },
          { symbol: 'Δα', description: 'CTE difference', value: '119.5 × 10⁻⁶/°C' },
          { symbol: 'ΔT', description: 'Temperature change', value: `${data.fast_fill.peak_wall_temp_c - 20}°C` },
        ]}
        explanation="When materials with different thermal expansion coefficients are bonded together, temperature changes create stress at the interface."
      />

      <EquationDisplay
        title="Temperature-Dependent Strength"
        equation="σ_allowable(T) = σ_ref × (1 - k × (T - T_ref))"
        variables={[
          { symbol: 'σ_allowable(T)', description: 'Temperature-adjusted strength' },
          { symbol: 'σ_ref', description: 'Reference strength at 20°C', value: '2700 MPa' },
          { symbol: 'k', description: 'Temperature degradation factor', value: '0.002/°C' },
          { symbol: 'T', description: 'Operating temperature' },
        ]}
        explanation="Composite material strength decreases with increasing temperature. The degradation is approximately linear for epoxy-based composites up to glass transition temperature (Tg ≈ 120°C)."
        defaultExpanded={false}
      />
    </div>
  );
}
