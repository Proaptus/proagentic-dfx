'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import {
  getDesignStress,
  getDesignFailure,
  getDesignThermal,
  getDesignReliability,
  getDesignCost,
} from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type {
  DesignStress,
  DesignFailure,
  DesignThermal,
  DesignReliability,
  DesignCost,
} from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Activity, AlertTriangle, Thermometer, BarChart3, DollarSign } from 'lucide-react';

type Tab = 'stress' | 'failure' | 'thermal' | 'reliability' | 'cost';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

export function AnalysisScreen() {
  const { currentDesign, setCurrentDesign, analysisTab, setAnalysisTab, paretoFront } = useAppStore();

  const [stress, setStress] = useState<DesignStress | null>(null);
  const [failure, setFailure] = useState<DesignFailure | null>(null);
  const [thermal, setThermal] = useState<DesignThermal | null>(null);
  const [reliability, setReliability] = useState<DesignReliability | null>(null);
  const [cost, setCost] = useState<DesignCost | null>(null);
  const [loading, setLoading] = useState(false);

  // Default to recommended design from Pareto front, or first available
  useEffect(() => {
    if (!currentDesign && paretoFront.length > 0) {
      const recommended = paretoFront.find(d => d.trade_off_category === 'recommended');
      const defaultId = recommended?.id || paretoFront[0]?.id;
      if (defaultId) setCurrentDesign(defaultId);
    } else if (!currentDesign) {
      // Fallback if Pareto not loaded yet
      setCurrentDesign('C');
    }
  }, [currentDesign, setCurrentDesign, paretoFront]);

  // Load data based on active tab
  useEffect(() => {
    if (!currentDesign) return;
    setLoading(true);

    const loadData = async () => {
      try {
        switch (analysisTab) {
          case 'stress':
            setStress(await getDesignStress(currentDesign) as DesignStress);
            break;
          case 'failure':
            setFailure(await getDesignFailure(currentDesign) as DesignFailure);
            break;
          case 'thermal':
            setThermal(await getDesignThermal(currentDesign) as DesignThermal);
            break;
          case 'reliability':
            setReliability(await getDesignReliability(currentDesign) as DesignReliability);
            break;
          case 'cost':
            setCost(await getDesignCost(currentDesign) as DesignCost);
            break;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentDesign, analysisTab]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'stress', label: 'Stress', icon: <Activity size={18} /> },
    { id: 'failure', label: 'Failure', icon: <AlertTriangle size={18} /> },
    { id: 'thermal', label: 'Thermal', icon: <Thermometer size={18} /> },
    { id: 'reliability', label: 'Reliability', icon: <BarChart3 size={18} /> },
    { id: 'cost', label: 'Cost', icon: <DollarSign size={18} /> },
  ];

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="h-96 flex items-center justify-center text-gray-500">
          Loading analysis data...
        </div>
      );
    }

    switch (analysisTab) {
      case 'stress':
        return stress ? <StressTab data={stress} /> : null;
      case 'failure':
        return failure ? <FailureTab data={failure} /> : null;
      case 'thermal':
        return thermal ? <ThermalTab data={thermal} /> : null;
      case 'reliability':
        return reliability ? <ReliabilityTab data={reliability} /> : null;
      case 'cost':
        return cost ? <CostTab data={cost} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Design Analysis</h2>
        <p className="text-gray-600 mt-1">
          Detailed engineering analysis for Design {currentDesign}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAnalysisTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                analysisTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}

function StressTab({ data }: { data: DesignStress }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Maximum Stress</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="text-4xl font-bold text-gray-900">
            {data.max_stress.value_mpa} <span className="text-lg font-normal text-gray-500">MPa</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
              +{data.max_stress.margin_percent}% margin
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
              <dd className="font-medium">{data.max_stress.region.replace(/_/g, ' ')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Coordinates:</dt>
              <dd className="font-medium">
                r={data.max_stress.location.r}, z={data.max_stress.location.z}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stress Distribution</CardTitle>
        </CardHeader>
        <div className="h-64 bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 rounded-lg flex items-center justify-center">
          <div className="text-white font-medium bg-black/30 px-4 py-2 rounded">
            Stress Contour Visualization
          </div>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span>{data.contour_data.min_value} MPa</span>
          <span className="text-gray-500">von Mises stress</span>
          <span>{data.contour_data.max_value} MPa</span>
        </div>
      </Card>
    </div>
  );
}

function FailureTab({ data }: { data: DesignFailure }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Predicted Failure Mode</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full ${
                data.predicted_failure_mode.is_preferred ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xl font-semibold capitalize">
              {data.predicted_failure_mode.mode.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-gray-600">{data.predicted_failure_mode.explanation}</p>
          <div
            className={`p-3 rounded-lg ${
              data.predicted_failure_mode.is_preferred
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {data.predicted_failure_mode.is_preferred
              ? 'This is the PREFERRED failure mode - predictable and progressive'
              : 'WARNING: This is NOT the preferred failure mode'}
          </div>
          <dl className="space-y-2 text-sm border-t pt-4">
            <div className="flex justify-between">
              <dt className="text-gray-500">Location:</dt>
              <dd className="font-medium">{data.predicted_failure_mode.location.replace(/_/g, ' ')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Confidence:</dt>
              <dd className="font-medium">{(data.predicted_failure_mode.confidence * 100).toFixed(0)}%</dd>
            </div>
          </dl>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tsai-Wu Failure Criterion</CardTitle>
        </CardHeader>
        <div className="space-y-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">At Test Pressure</div>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{ width: `${Math.min(100, data.tsai_wu.max_at_test.value * 100)}%` }}
                />
              </div>
              <span className="font-medium w-16 text-right">{data.tsai_wu.max_at_test.value.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Layer {data.tsai_wu.max_at_test.layer} at {data.tsai_wu.max_at_test.location}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">At Burst Pressure</div>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    data.tsai_wu.max_at_burst.value >= 1 ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(100, data.tsai_wu.max_at_burst.value * 100)}%` }}
                />
              </div>
              <span className="font-medium w-16 text-right">{data.tsai_wu.max_at_burst.value.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Layer {data.tsai_wu.max_at_burst.layer} at {data.tsai_wu.max_at_burst.location}
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            Tsai-Wu index &lt; 1.0 indicates no failure. Value at burst ≥ 1.0 confirms failure prediction.
          </div>
        </div>
      </Card>
    </div>
  );
}

function ThermalTab({ data }: { data: DesignThermal }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Fast Fill Analysis</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{data.fast_fill.scenario}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Peak Gas Temp</div>
              <div className="text-2xl font-bold">{data.fast_fill.peak_gas_temp_c}°C</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Peak Wall Temp</div>
              <div className="text-2xl font-bold">{data.fast_fill.peak_wall_temp_c}°C</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Peak Liner Temp</div>
              <div className="text-2xl font-bold">{data.fast_fill.peak_liner_temp_c}°C</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Time to Peak</div>
              <div className="text-2xl font-bold">{data.fast_fill.time_to_peak_seconds}s</div>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg flex items-center justify-between ${
              data.fast_fill.status === 'pass'
                ? 'bg-green-50'
                : data.fast_fill.status === 'warn'
                ? 'bg-yellow-50'
                : 'bg-red-50'
            }`}
          >
            <span>Liner limit: {data.fast_fill.liner_limit_c}°C</span>
            <span
              className={`font-medium ${
                data.fast_fill.status === 'pass'
                  ? 'text-green-700'
                  : data.fast_fill.status === 'warn'
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}
            >
              {data.fast_fill.status.toUpperCase()}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thermal Stress</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="text-4xl font-bold text-gray-900">
            {data.thermal_stress.max_mpa} <span className="text-lg font-normal text-gray-500">MPa</span>
          </div>
          <div className="text-sm text-gray-500">at {data.thermal_stress.location.replace(/_/g, ' ')}</div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Hoop</span>
              <span className="font-medium">{data.thermal_stress.components.hoop_mpa} MPa</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Axial</span>
              <span className="font-medium">{data.thermal_stress.components.axial_mpa} MPa</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Radial</span>
              <span className="font-medium">{data.thermal_stress.components.radial_mpa} MPa</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ReliabilityTab({ data }: { data: DesignReliability }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Monte Carlo Analysis</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <div className="text-4xl font-bold text-gray-900">{data.monte_carlo.p_failure.toExponential(1)}</div>
            <div className="text-sm text-gray-500">Probability of failure</div>
          </div>
          <p className="text-gray-600">{data.monte_carlo.interpretation}</p>
          <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            {data.monte_carlo.comparison_to_requirement}
          </div>
          <div className="text-sm text-gray-500">Based on {data.monte_carlo.samples.toLocaleString()} samples</div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Burst Pressure Distribution</CardTitle>
        </CardHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.burst_distribution.histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="bin_center" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span>Mean: {data.burst_distribution.mean_bar} bar</span>
          <span>Std: {data.burst_distribution.std_bar} bar</span>
          <span>CoV: {(data.burst_distribution.cov * 100).toFixed(1)}%</span>
        </div>
      </Card>
    </div>
  );
}

function CostTab({ data }: { data: DesignCost }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Unit Cost</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="text-4xl font-bold text-gray-900">
            €{data.unit_cost_eur.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">per unit at production volume</div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.breakdown}
                dataKey="cost_eur"
                nameKey="component"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
              >
                {data.breakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `€${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
