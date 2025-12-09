'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2, Send } from 'lucide-react';

interface SurrogateMetric {
  output: string;
  r_squared: number;
  rmse: number;
  confidence_interval_low: number;
  confidence_interval_high: number;
  status: 'excellent' | 'good' | 'acceptable' | 'poor';
}

const SURROGATE_METRICS: SurrogateMetric[] = [
  {
    output: 'Burst Pressure',
    r_squared: 0.984,
    rmse: 2.3,
    confidence_interval_low: 0.96,
    confidence_interval_high: 0.99,
    status: 'excellent',
  },
  {
    output: 'Max Stress',
    r_squared: 0.971,
    rmse: 4.1,
    confidence_interval_low: 0.94,
    confidence_interval_high: 0.98,
    status: 'excellent',
  },
  {
    output: 'Thermal Response',
    r_squared: 0.945,
    rmse: 5.8,
    confidence_interval_low: 0.91,
    confidence_interval_high: 0.97,
    status: 'good',
  },
  {
    output: 'Fatigue Life',
    r_squared: 0.889,
    rmse: 8.2,
    confidence_interval_low: 0.83,
    confidence_interval_high: 0.93,
    status: 'acceptable',
  },
  {
    output: 'Permeation Rate',
    r_squared: 0.912,
    rmse: 6.5,
    confidence_interval_low: 0.87,
    confidence_interval_high: 0.95,
    status: 'good',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent':
      return '#22c55e';
    case 'good':
      return '#3b82f6';
    case 'acceptable':
      return '#f59e0b';
    case 'poor':
      return '#ef4444';
    default:
      return '#94a3b8';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'excellent':
    case 'good':
      return <CheckCircle2 size={16} className="text-green-600" />;
    case 'acceptable':
      return <AlertTriangle size={16} className="text-yellow-600" />;
    case 'poor':
      return <AlertTriangle size={16} className="text-red-600" />;
    default:
      return null;
  }
};

export function SurrogateConfidencePanel() {
  const chartData = SURROGATE_METRICS.map((m) => ({
    name: m.output,
    'R² Score': m.r_squared,
    status: m.status,
  }));

  const handleRequestFEA = () => {
    console.log('Requesting FEA validation...');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Surrogate Model Confidence
          </CardTitle>
        </CardHeader>
        <div className="p-4 space-y-6">
          {/* R² Score Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Model Accuracy (R² Scores)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                <YAxis domain={[0.8, 1.0]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="R² Score" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Metrics Table */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Detailed Confidence Metrics</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Output</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-700">R²</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-700">RMSE</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">
                      95% Confidence
                    </th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {SURROGATE_METRICS.map((metric, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{metric.output}</td>
                      <td className="px-4 py-2 text-right font-mono">{metric.r_squared.toFixed(3)}</td>
                      <td className="px-4 py-2 text-right font-mono">{metric.rmse.toFixed(1)}%</td>
                      <td className="px-4 py-2 text-center font-mono text-xs">
                        [{metric.confidence_interval_low.toFixed(2)}, {metric.confidence_interval_high.toFixed(2)}]
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(metric.status)}
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                              metric.status === 'excellent'
                                ? 'bg-green-100 text-green-700'
                                : metric.status === 'good'
                                ? 'bg-blue-100 text-blue-700'
                                : metric.status === 'acceptable'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {metric.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interpretation Guide */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Model Quality Assessment</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>R² &gt; 0.95: Excellent - High confidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>R² 0.90-0.95: Good - Acceptable for optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>R² 0.85-0.90: Acceptable - Verify critical results</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>R² &lt; 0.85: Poor - FEA validation required</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Overall Assessment</h4>
              <div className="text-sm text-green-700 space-y-2">
                <p className="font-medium">Surrogate models show high accuracy across all outputs.</p>
                <p>
                  Burst pressure and stress predictions have excellent confidence (R² &gt; 0.97).
                  Fatigue life model acceptable but recommend FEA validation for critical applications.
                </p>
              </div>
            </div>
          </div>

          {/* Request FEA Validation Button */}
          <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-orange-600" size={24} />
              <div>
                <h4 className="font-medium text-orange-900">Recommend Full FEA Validation</h4>
                <p className="text-sm text-orange-700">
                  For production designs, validate surrogate predictions with detailed FEA
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleRequestFEA}>
              <Send size={16} className="mr-2" />
              Request FEA Validation
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
