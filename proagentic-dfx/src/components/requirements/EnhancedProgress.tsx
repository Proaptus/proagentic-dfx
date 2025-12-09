'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader2, TrendingUp, Clock, Zap } from 'lucide-react';
import type { ProgressEvent } from '@/lib/types';

interface EnhancedProgressProps {
  progress: ProgressEvent;
}

export function EnhancedProgress({ progress }: EnhancedProgressProps) {
  const stages = [
    { name: 'Initialize', threshold: 0 },
    { name: 'Explore', threshold: 20 },
    { name: 'Optimize', threshold: 50 },
    { name: 'Refine', threshold: 80 },
    { name: 'Complete', threshold: 100 },
  ];

  const currentStage =
    stages.filter((s) => progress.progress_percent >= s.threshold).pop() || stages[0];

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Memoize heights for convergence chart with deterministic values
  const convergenceHeights = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => 
      Math.min(95, 30 + i * 3.2)
    );
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Progress</CardTitle>
      </CardHeader>

      <div className="px-4 pb-4 space-y-6">
        {/* Multi-Stage Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Current Stage</span>
            <Badge variant="info">{currentStage.name}</Badge>
          </div>
          <div className="relative">
            <div className="flex justify-between mb-1">
              {stages.map((stage, idx) => (
                <div
                  key={stage.name}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / stages.length}%` }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      progress.progress_percent >= stage.threshold
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {progress.progress_percent >= stage.threshold ? (
                      <span className="text-xs font-bold">✓</span>
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      progress.progress_percent >= stage.threshold
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {stage.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress.progress_percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Generation {progress.generation}/50</span>
            <span className="font-medium text-gray-900">{progress.progress_percent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-1"
              style={{ width: `${progress.progress_percent}%` }}
            >
              {progress.progress_percent > 10 && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-blue-600" />
              <div className="text-xs text-gray-500">Designs Evaluated</div>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {progress.designs_evaluated.toLocaleString()}
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-green-600" />
              <div className="text-xs text-gray-500">Pareto Front</div>
            </div>
            <div className="text-xl font-bold text-gray-900">{progress.pareto_size}</div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-orange-600" />
              <div className="text-xs text-gray-500">Time Remaining</div>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {formatTime(progress.remaining_seconds)}
            </div>
          </div>
        </div>

        {/* Current Best Designs Preview */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Best Designs</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-xs font-medium text-green-900 mb-2">Lightest</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-green-700">Weight:</span>
                  <span className="font-mono font-medium text-green-900">
                    {progress.current_best.lightest.weight_kg.toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Cost:</span>
                  <span className="font-mono font-medium text-green-900">
                    €{progress.current_best.lightest.cost_eur.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs font-medium text-blue-900 mb-2">Cheapest</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-700">Weight:</span>
                  <span className="font-mono font-medium text-blue-900">
                    {progress.current_best.cheapest.weight_kg.toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Cost:</span>
                  <span className="font-mono font-medium text-blue-900">
                    €{progress.current_best.cheapest.cost_eur.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-xs font-medium text-purple-900 mb-2">Most Reliable</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-purple-700">Weight:</span>
                  <span className="font-mono font-medium text-purple-900">
                    {progress.current_best.most_reliable.weight_kg.toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">P(fail):</span>
                  <span className="font-mono font-medium text-purple-900">
                    {(progress.current_best.most_reliable.p_failure * 100).toExponential(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Convergence Mini Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Convergence</h4>
          <div className="bg-gray-50 rounded-lg p-4 h-24 flex items-end gap-1">
            {Array.from({ length: Math.min(progress.generation, 20) }).map((_, i) => {
              const height = convergenceHeights[i];
              return (
                <div
                  key={i}
                  className="flex-1 bg-blue-600 rounded-t transition-all duration-300"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-blue-600 pt-2 border-t border-gray-200">
          <Loader2 className="animate-spin" size={20} />
          <span className="font-medium">Optimizing...</span>
        </div>
      </div>
    </Card>
  );
}
