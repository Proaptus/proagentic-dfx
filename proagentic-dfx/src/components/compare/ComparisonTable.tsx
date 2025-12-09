'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

export interface ComparisonMetric {
  name: string;
  key: string;
  unit: string;
  format: (value: number) => string;
  betterWhen: 'higher' | 'lower';
}

export interface DesignData {
  id: string;
  metrics: Record<string, number>;
}

export interface ComparisonTableProps {
  designs: DesignData[];
  metrics: ComparisonMetric[];
  onDesignSelect?: (designId: string) => void;
}

export function ComparisonTable({ designs, metrics, onDesignSelect }: ComparisonTableProps) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (metricKey: string) => {
    if (sortBy === metricKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(metricKey);
      setSortOrder('asc');
    }
  };

  const getBestValue = (metricKey: string, betterWhen: 'higher' | 'lower') => {
    const values = designs.map((d) => d.metrics[metricKey]);
    return betterWhen === 'higher' ? Math.max(...values) : Math.min(...values);
  };

  const getPercentageDiff = (value: number, baseValue: number): number => {
    if (baseValue === 0) return 0;
    return ((value - baseValue) / baseValue) * 100;
  };

  const isBest = (designId: string, metricKey: string, betterWhen: 'higher' | 'lower'): boolean => {
    const value = designs.find((d) => d.id === designId)?.metrics[metricKey];
    const bestValue = getBestValue(metricKey, betterWhen);
    return value === bestValue;
  };

  // Use first design as baseline for comparison
  const baselineDesign = designs[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Metrics Comparison</CardTitle>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 sticky left-0 bg-gray-50">
                Metric
              </th>
              {designs.map((design) => (
                <th
                  key={design.id}
                  className="text-center py-3 px-4 font-semibold text-gray-700"
                >
                  <button
                    onClick={() => onDesignSelect?.(design.id)}
                    className="hover:text-blue-600 transition-colors"
                  >
                    Design {design.id}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => {
              const _bestValue = getBestValue(metric.key, metric.betterWhen);

              return (
                <tr
                  key={metric.key}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 sticky left-0 bg-white group-hover:bg-gray-50">
                    <button
                      onClick={() => handleSort(metric.key)}
                      className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
                    >
                      {metric.name}
                      {sortBy === metric.key && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </span>
                      )}
                    </button>
                    <div className="text-xs text-gray-500 mt-0.5">{metric.unit}</div>
                  </td>

                  {designs.map((design) => {
                    const value = design.metrics[metric.key];
                    const isOptimal = isBest(design.id, metric.key, metric.betterWhen);
                    const baseValue = baselineDesign.metrics[metric.key];
                    const percentDiff = getPercentageDiff(value, baseValue);
                    const isBetter =
                      metric.betterWhen === 'higher' ? value > baseValue : value < baseValue;

                    return (
                      <td
                        key={design.id}
                        className={`text-center py-3 px-4 transition-colors ${
                          isOptimal ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          {/* Main Value */}
                          <div
                            className={`font-semibold ${
                              isOptimal ? 'text-green-700' : 'text-gray-900'
                            }`}
                          >
                            {metric.format(value)}
                            {isOptimal && (
                              <CheckCircle
                                size={14}
                                className="inline ml-1 text-green-500"
                              />
                            )}
                          </div>

                          {/* Percentage Difference (except for baseline) */}
                          {design.id !== baselineDesign.id && (
                            <div
                              className={`text-xs flex items-center justify-center gap-1 ${
                                isBetter
                                  ? 'text-green-600'
                                  : percentDiff === 0
                                  ? 'text-gray-500'
                                  : 'text-red-600'
                              }`}
                            >
                              {isBetter ? (
                                <ArrowUp size={12} />
                              ) : percentDiff < 0 ? (
                                <ArrowDown size={12} />
                              ) : null}
                              {percentDiff > 0 ? '+' : ''}
                              {percentDiff.toFixed(1)}%
                            </div>
                          )}

                          {/* Baseline indicator */}
                          {design.id === baselineDesign.id && (
                            <div className="text-xs text-gray-400">baseline</div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle size={14} className="text-green-500" />
          <span className="text-gray-700">Best value for metric</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUp size={14} className="text-green-600" />
          <span className="text-gray-700">Better than baseline</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowDown size={14} className="text-red-600" />
          <span className="text-gray-700">Worse than baseline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 rounded border border-green-200" />
          <span className="text-gray-700">Optimal value</span>
        </div>
      </div>
    </Card>
  );
}
