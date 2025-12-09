'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { EquationDisplay } from './EquationDisplay';
import type { DesignThermal } from '@/lib/types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  Area,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import { Thermometer, AlertCircle, TrendingUp, Flame, Snowflake } from 'lucide-react';

interface ThermalAnalysisPanelProps {
  data: DesignThermal;
  designId?: string;
  onThermalDataChange?: (data: DesignThermal) => void;
}

type ThermalScenario = 'fast_fill' | 'ambient_soak' | 'fire_exposure';

const THERMAL_SCENARIOS: Record<ThermalScenario, string> = {
  fast_fill: 'Fast Fill (700 bar in 3 min)',
  ambient_soak: 'Ambient Soak (85°C)',
  fire_exposure: 'Fire Exposure (TPRD Activation)',
};

export function ThermalAnalysisPanel({
  data: initialData,
  designId = 'C',
  onThermalDataChange
}: ThermalAnalysisPanelProps) {
  const [thermalData, setThermalData] = useState<DesignThermal>(initialData);
  const [selectedScenario, setSelectedScenario] = useState<ThermalScenario>('fast_fill');
  const [isLoading, setIsLoading] = useState(false);
  const [showEquations, setShowEquations] = useState(false);

  useEffect(() => {
    const fetchThermalData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/designs/${designId}/thermal?scenario=${selectedScenario}`
        );
        if (response.ok) {
          const newData = await response.json();
          setThermalData(newData);
          // Notify parent of data change so stats can update
          onThermalDataChange?.(newData);
        }
      } catch (error) {
        console.error('Failed to fetch thermal data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if scenario changes (not on initial mount)
    if (selectedScenario !== 'fast_fill' || thermalData.design_id !== designId) {
      fetchThermalData();
    }
  }, [selectedScenario, designId, onThermalDataChange, thermalData.design_id]);

  // Use temperature profile data from API props
  const temperatureProfile = thermalData.temperature_profile || [];

  // Use extreme temperature performance data from API props
  const extremeTemps = thermalData.extreme_temperature_performance || [];

  // Use CTE mismatch data from API props
  const cteComponents = thermalData.cte_mismatch || [];

  const getTempStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-50 border-green-500 text-green-700';
      case 'warn': return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      case 'fail': return 'bg-red-50 border-red-500 text-red-700';
      default: return 'bg-gray-50 border-gray-500 text-gray-700';
    }
  };

  // Generate through-wall temperature profile data
  const throughWallProfile = [
    { position: 'Inner Liner', distance: 0, temperature: thermalData.fast_fill.peak_liner_temp_c },
    { position: 'Composite Inner', distance: 2, temperature: thermalData.fast_fill.peak_liner_temp_c - 8 },
    { position: 'Composite Mid', distance: 6, temperature: thermalData.fast_fill.peak_liner_temp_c - 18 },
    { position: 'Composite Outer', distance: 10, temperature: thermalData.fast_fill.peak_wall_temp_c - 12 },
    { position: 'Outer Surface', distance: 12, temperature: thermalData.fast_fill.peak_wall_temp_c },
  ];

  // Material thermal limits data
  const materialLimits = [
    {
      material: 'HDPE Liner',
      operating: thermalData.fast_fill.peak_liner_temp_c,
      limit: thermalData.fast_fill.liner_limit_c,
      margin: thermalData.fast_fill.liner_limit_c - thermalData.fast_fill.peak_liner_temp_c,
    },
    {
      material: 'Epoxy Matrix',
      operating: thermalData.fast_fill.peak_wall_temp_c,
      limit: 120,
      margin: 120 - thermalData.fast_fill.peak_wall_temp_c,
    },
    {
      material: 'Carbon Fiber',
      operating: thermalData.fast_fill.peak_wall_temp_c,
      limit: 350,
      margin: 350 - thermalData.fast_fill.peak_wall_temp_c,
    },
  ];

  // Temperature distribution contour data (simplified radial zones)
  const temperatureDistribution = [
    { zone: 'Boss Region', temperature: thermalData.fast_fill.peak_liner_temp_c - 5 },
    { zone: 'Dome Apex', temperature: thermalData.fast_fill.peak_liner_temp_c - 8 },
    { zone: 'Dome Equator', temperature: thermalData.fast_fill.peak_liner_temp_c - 3 },
    { zone: 'Cylinder Wall', temperature: thermalData.fast_fill.peak_liner_temp_c },
    { zone: 'Outer Surface', temperature: thermalData.fast_fill.peak_wall_temp_c },
  ];

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thermal Scenario
          </label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value as ThermalScenario)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
            disabled={isLoading}
          >
            {Object.entries(THERMAL_SCENARIOS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowEquations(!showEquations)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            showEquations
              ? 'bg-orange-100 text-orange-700 border border-orange-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          {showEquations ? 'Hide Equations' : 'Show Equations'}
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-sm text-gray-500 text-center py-2 transition-opacity">
          Loading {THERMAL_SCENARIOS[selectedScenario]} analysis...
        </div>
      )}

      {/* Key Metrics Cards */}
      <div
        className="grid grid-cols-4 gap-4 transition-opacity duration-300"
        style={{ opacity: isLoading ? 0.5 : 1 }}
      >
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-orange-500" />
              <div className="text-xs text-gray-600">Peak Temperature</div>
            </div>
            <div className="text-3xl font-bold text-orange-700">
              {thermalData.fast_fill.peak_liner_temp_c}°C
            </div>
            <div className="text-xs text-gray-500 mt-1">Inner Liner</div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-blue-500" />
              <div className="text-xs text-gray-600">Time to Peak</div>
            </div>
            <div className="text-3xl font-bold text-blue-700">
              {thermalData.fast_fill.time_to_peak_seconds}s
            </div>
            <div className="text-xs text-gray-500 mt-1">Fast Fill Rate</div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer size={16} className="text-purple-500" />
              <div className="text-xs text-gray-600">Heat Flux</div>
            </div>
            <div className="text-3xl font-bold text-purple-700">
              {(thermalData.thermal_stress.max_mpa * 0.8).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">kW/m²</div>
          </div>
        </Card>

        <Card>
          <div className={`p-4 ${getTempStatusColor(thermalData.fast_fill.status)}`}>
            <div className="flex items-center gap-2 mb-2">
              {thermalData.fast_fill.status === 'pass' ? (
                <TrendingUp size={16} />
              ) : thermalData.fast_fill.status === 'warn' ? (
                <AlertCircle size={16} />
              ) : (
                <Flame size={16} />
              )}
              <div className="text-xs font-medium">Status</div>
            </div>
            <div className="text-3xl font-bold uppercase">
              {thermalData.fast_fill.status}
            </div>
            <div className="text-xs mt-1">
              Margin: {(thermalData.fast_fill.liner_limit_c - thermalData.fast_fill.peak_liner_temp_c).toFixed(1)}°C
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Temperature vs Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer size={18} />
              Temperature History
            </CardTitle>
          </CardHeader>
          <div
            className="h-80 transition-opacity duration-300"
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="gas"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  name="Gas Temperature"
                  dot={false}
                  animationDuration={600}
                />
                <Line
                  type="monotone"
                  dataKey="wall"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  name="Wall Temperature"
                  dot={false}
                  animationDuration={600}
                />
                <Line
                  type="monotone"
                  dataKey="liner"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  name="Liner Temperature"
                  dot={false}
                  animationDuration={600}
                />
                <ReferenceLine
                  y={thermalData.fast_fill.liner_limit_c}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  label={{ value: 'Liner Limit', position: 'right', fill: '#EF4444', fontSize: 11 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Through-Wall Temperature Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Snowflake size={18} />
              Through-Wall Temperature Profile
            </CardTitle>
          </CardHeader>
          <div
            className="h-80 transition-opacity duration-300"
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={throughWallProfile}
                layout="vertical"
                margin={{ left: 20, right: 40, top: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  type="number"
                  label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="position"
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="temperature"
                  fill="#8B5CF6"
                  animationDuration={600}
                >
                  {throughWallProfile.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#EF4444' : index < 3 ? '#F97316' : '#3B82F6'}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Material Thermal Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Material Thermal Limits</CardTitle>
        </CardHeader>
        <div
          className="h-64 transition-opacity duration-300"
          style={{ opacity: isLoading ? 0.5 : 1 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={materialLimits}
              margin={{ left: 20, right: 40, top: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="material"
                angle={-15}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'Operating') return [`${value}°C`, 'Operating Temp'];
                  if (name === 'Limit') return [`${value}°C`, 'Material Limit'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar
                dataKey="operating"
                fill="#F97316"
                name="Operating"
                animationDuration={600}
              />
              <Bar
                dataKey="limit"
                fill="#10B981"
                name="Limit"
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Thermal Stress and CTE Mismatch */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Thermal Stress Components</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Maximum Thermal Stress</div>
              <div className="text-4xl font-bold text-gray-900">
                {thermalData.thermal_stress.max_mpa}{' '}
                <span className="text-lg font-normal text-gray-500">MPa</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                at {thermalData.thermal_stress.location.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hoop Component</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-blue-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(thermalData.thermal_stress.components.hoop_mpa / thermalData.thermal_stress.max_mpa) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-sm w-16 text-right">
                    {thermalData.thermal_stress.components.hoop_mpa} MPa
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Axial Component</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-green-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(thermalData.thermal_stress.components.axial_mpa / thermalData.thermal_stress.max_mpa) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-sm w-16 text-right">
                    {thermalData.thermal_stress.components.axial_mpa} MPa
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Radial Component</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-orange-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(thermalData.thermal_stress.components.radial_mpa / thermalData.thermal_stress.max_mpa) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-sm w-16 text-right">
                    {thermalData.thermal_stress.components.radial_mpa} MPa
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
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-2 text-gray-700">{item.component}</td>
                      <td className="p-2 text-right font-mono text-xs">{item.cte}</td>
                      <td className="p-2 text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
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

      {/* Temperature Distribution by Zone */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature Distribution by Region</CardTitle>
        </CardHeader>
        <div
          className="h-64 transition-opacity duration-300"
          style={{ opacity: isLoading ? 0.5 : 1 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={temperatureDistribution}
              margin={{ left: 20, right: 40, top: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="zone"
                angle={-15}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 11 }}
                domain={[0, 'dataMax + 10']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="temperature"
                animationDuration={600}
              >
                {temperatureDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.temperature > 65 ? '#EF4444' :
                      entry.temperature > 55 ? '#F97316' :
                      entry.temperature > 45 ? '#FBBF24' :
                      '#3B82F6'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

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
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-gray-700">{row.condition}</td>
                  <td className="p-3 text-right">
                    <span className="font-mono">{row.hoop_strength_pct}%</span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
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
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all ${
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

      {/* Collapsible Equations Section */}
      {showEquations && (
        <div className="space-y-4 pt-4 border-t transition-all">
          <h3 className="text-lg font-semibold text-gray-900">Engineering Equations</h3>

          <EquationDisplay
            title="Adiabatic Compression Temperature Rise"
            equation="T_2 = T_1 × (P_2 / P_1)^((γ-1)/γ)"
            variables={[
              { symbol: 'T_2', description: 'Final gas temperature', value: `${thermalData.fast_fill.peak_gas_temp_c}°C` },
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
              { symbol: 'σ_thermal', description: 'Thermal stress', value: `${thermalData.thermal_stress.max_mpa} MPa` },
              { symbol: 'E', description: 'Elastic modulus', value: '135 GPa' },
              { symbol: 'Δα', description: 'CTE difference', value: '119.5 × 10⁻⁶/°C' },
              { symbol: 'ΔT', description: 'Temperature change', value: `${thermalData.fast_fill.peak_wall_temp_c - 20}°C` },
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
      )}
    </div>
  );
}
