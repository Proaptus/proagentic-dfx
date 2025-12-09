'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export interface StressData {
  designId: string;
  maxStress: number;
  allowable: number;
  margin: number;
  location: string;
  safetyFactor: number;
}

export interface StressComparisonProps {
  stressData: StressData[];
  showContours?: boolean;
}

export function StressComparison({ stressData, showContours: _showContours = false }: StressComparisonProps) {
  const getMarginColor = (margin: number): string => {
    if (margin >= 20) return 'text-green-600 bg-green-50';
    if (margin >= 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMarginIcon = (margin: number) => {
    if (margin >= 10) {
      return <CheckCircle size={16} className="text-green-500" />;
    }
    return <AlertTriangle size={16} className="text-yellow-500" />;
  };

  const minStress = Math.min(...stressData.map((d) => d.maxStress));
  const maxStress = Math.max(...stressData.map((d) => d.maxStress));
  const bestMargin = Math.max(...stressData.map((d) => d.margin));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stress Analysis Comparison</CardTitle>
      </CardHeader>

      <div className="space-y-4">
        {/* Side-by-side stress tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stressData.map((data) => {
            const isLowest = data.maxStress === minStress;
            const isBestMargin = data.margin === bestMargin;

            return (
              <div
                key={data.designId}
                className={`border rounded-lg p-4 transition-all ${
                  isBestMargin
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Design {data.designId}</h4>
                  {isBestMargin && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                </div>

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-600">Max Stress:</dt>
                    <dd className={`font-semibold ${isLowest ? 'text-green-600' : 'text-gray-900'}`}>
                      {data.maxStress.toFixed(1)} MPa
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Allowable:</dt>
                    <dd className="font-medium text-gray-700">{data.allowable.toFixed(1)} MPa</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-600">Margin:</dt>
                    <dd className={`font-bold ${getMarginColor(data.margin)} px-2 py-0.5 rounded`}>
                      +{data.margin.toFixed(1)}%
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Safety Factor:</dt>
                    <dd className="font-medium text-gray-700">{data.safetyFactor.toFixed(2)}</dd>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <dt className="text-gray-600 text-xs mb-1">Critical Location:</dt>
                    <dd className="text-xs text-gray-900 font-medium">{data.location}</dd>
                  </div>
                </dl>

                {/* Visual stress indicator */}
                <div className="mt-3">
                  <div className="text-xs text-gray-600 mb-1">Stress Utilization</div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        (data.maxStress / data.allowable) * 100 > 90
                          ? 'bg-red-500'
                          : (data.maxStress / data.allowable) * 100 > 80
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min((data.maxStress / data.allowable) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>{((data.maxStress / data.allowable) * 100).toFixed(0)}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparative Analysis Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Design</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Max Stress</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Allowable</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Margin</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Safety Factor</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {stressData.map((data) => {
                const isLowest = data.maxStress === minStress;
                const isBestMargin = data.margin === bestMargin;

                return (
                  <tr
                    key={data.designId}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      isBestMargin ? 'bg-green-50' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-medium text-gray-900">
                      Design {data.designId}
                    </td>
                    <td className={`text-right py-2 px-3 font-semibold ${
                      isLowest ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {data.maxStress.toFixed(1)} MPa
                    </td>
                    <td className="text-right py-2 px-3 text-gray-700">
                      {data.allowable.toFixed(1)} MPa
                    </td>
                    <td className={`text-right py-2 px-3 font-bold ${
                      data.margin >= 20 ? 'text-green-600' : data.margin >= 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      +{data.margin.toFixed(1)}%
                    </td>
                    <td className="text-right py-2 px-3 text-gray-700">
                      {data.safetyFactor.toFixed(2)}
                    </td>
                    <td className="text-center py-2 px-3">
                      {getMarginIcon(data.margin)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Safety Margin Comparison */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Safety Margin Comparison</h4>
          <div className="space-y-3">
            {stressData.map((data) => {
              const isBest = data.margin === bestMargin;

              return (
                <div key={data.designId}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700 font-medium">
                      Design {data.designId}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {data.margin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                        isBest ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((data.margin / bestMargin) * 100, 100)}%` }}
                    >
                      {isBest && (
                        <div className="flex items-center justify-end h-full pr-2">
                          <CheckCircle size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-blue-700 font-semibold mb-1">Best Design</div>
            <div className="text-blue-900">
              Design {stressData.find((d) => d.margin === bestMargin)?.designId} with{' '}
              <span className="font-bold">+{bestMargin.toFixed(1)}%</span> margin
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-green-700 font-semibold mb-1">Stress Range</div>
            <div className="text-green-900">
              {minStress.toFixed(1)} - {maxStress.toFixed(1)} MPa
              <span className="text-xs text-green-700 ml-2">
                ({((maxStress - minStress) / minStress * 100).toFixed(1)}% variation)
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
          <div className="font-semibold text-gray-700 mb-2">Interpretation</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>Margin ≥ 20% (Excellent)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded" />
            <span>10% ≤ Margin &lt; 20% (Acceptable)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span>Margin &lt; 10% (Review Required)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
