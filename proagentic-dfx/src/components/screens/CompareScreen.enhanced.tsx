'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { getDesign, getDesignStress } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CompareResponse, DesignSummary, DesignStress } from '@/lib/types';
import { Plus, X, ArrowLeftRight, ScatterChart } from 'lucide-react';

// Enhanced comparison components
import { ComparisonTable, type ComparisonMetric, type DesignData } from '@/components/compare/ComparisonTable';
import { RadarComparison, type RadarMetric, type RadarDesignData } from '@/components/compare/RadarComparison';
import { StressComparison, type StressData } from '@/components/compare/StressComparison';

export function CompareScreen() {
  const { selectedDesigns, setSelectedDesigns, setCurrentDesign, setScreen, paretoFront } = useAppStore();

  const [_comparison, _setComparison] = useState<CompareResponse | null>(null);
  const [designDetails, setDesignDetails] = useState<Map<string, DesignSummary>>(new Map());
  const [stressDetails, setStressDetails] = useState<Map<string, DesignStress>>(new Map());
  const [loading, setLoading] = useState(false);
  const [syncViews, setSyncViews] = useState(true);

  // Use selected designs, or default to first 3 from Pareto front
  const designsToCompare = useMemo(() => {
    const defaultDesigns = paretoFront.slice(0, 3).map((d) => d.id);
    return selectedDesigns.length >= 2 ? selectedDesigns : defaultDesigns.length >= 2 ? defaultDesigns : ['A', 'B', 'C'];
  }, [selectedDesigns, paretoFront]);

  // Maximum 4 designs for comparison
  const maxDesigns = 4;
  const canAddMore = designsToCompare.length < maxDesigns;

  // Available designs to add
  const availableDesigns = paretoFront.length > 0
    ? paretoFront.map((d) => d.id).filter((id) => !designsToCompare.includes(id))
    : ['A', 'B', 'C', 'D', 'E'].filter((id) => !designsToCompare.includes(id));

  // Load comparison data
  const designsKey = designsToCompare.join(',');

  useEffect(() => {
    if (designsToCompare.length === 0) return;

    setLoading(true);
    const promises = designsToCompare.map((id) =>
      Promise.all([getDesign(id), getDesignStress(id)])
    );

    Promise.all(promises)
      .then((results) => {
        const detailsMap = new Map<string, DesignSummary>();
        const stressMap = new Map<string, DesignStress>();

        results.forEach(([design, stress], index) => {
          if (design) detailsMap.set(designsToCompare[index], design as DesignSummary);
          if (stress) stressMap.set(designsToCompare[index], stress as DesignStress);
        });

        setDesignDetails(detailsMap);
        setStressDetails(stressMap);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [designsKey, designsToCompare]);

  // Handlers
  const handleAddDesign = (designId: string) => {
    if (canAddMore && !designsToCompare.includes(designId)) {
      setSelectedDesigns([...designsToCompare, designId]);
    }
  };

  const handleRemoveDesign = (designId: string) => {
    if (designsToCompare.length > 2) {
      setSelectedDesigns(designsToCompare.filter((id) => id !== designId));
    }
  };

  const handleSwapDesigns = (index1: number, index2: number) => {
    const newDesigns = [...designsToCompare];
    [newDesigns[index1], newDesigns[index2]] = [newDesigns[index2], newDesigns[index1]];
    setSelectedDesigns(newDesigns);
  };

  const handleSelectDesign = (id: string) => {
    setCurrentDesign(id);
    setScreen('viewer');
  };

  const _handleExport = (id: string) => {
    setCurrentDesign(id);
    setScreen('export');
  };

  // Prepare data for comparison components
  const comparisonMetrics: ComparisonMetric[] = [
    {
      name: 'Weight',
      key: 'weight_kg',
      unit: 'kg',
      format: (v) => v.toFixed(1),
      betterWhen: 'lower',
    },
    {
      name: 'Cost',
      key: 'cost_eur',
      unit: '€',
      format: (v) => v.toLocaleString(),
      betterWhen: 'lower',
    },
    {
      name: 'Burst Pressure',
      key: 'burst_pressure_bar',
      unit: 'bar',
      format: (v) => v.toFixed(0),
      betterWhen: 'higher',
    },
    {
      name: 'Fatigue Life',
      key: 'fatigue_life_cycles',
      unit: 'cycles',
      format: (v) => v.toLocaleString(),
      betterWhen: 'higher',
    },
    {
      name: 'Stress Margin',
      key: 'stress_margin_percent',
      unit: '%',
      format: (v) => `+${v.toFixed(1)}`,
      betterWhen: 'higher',
    },
  ];

  const designDataForTable: DesignData[] = designsToCompare.map((id) => {
    const details = designDetails.get(id);
    const stress = stressDetails.get(id);

    return {
      id,
      metrics: {
        weight_kg: details?.summary.weight_kg || 0,
        cost_eur: details?.summary.cost_eur || 0,
        burst_pressure_bar: details?.summary.burst_pressure_bar || 0,
        fatigue_life_cycles: details?.summary.fatigue_life_cycles || 0,
        stress_margin_percent: stress?.max_stress.margin_percent || 0,
      },
    };
  });

  // Radar chart data
  const radarMetrics: RadarMetric[] = [
    {
      key: 'weight',
      label: 'Weight',
      normalize: (value, allValues) => {
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);
        // Invert because lower is better
        return ((max - value) / (max - min || 1)) * 100;
      },
    },
    {
      key: 'cost',
      label: 'Cost',
      normalize: (value, allValues) => {
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);
        return ((max - value) / (max - min || 1)) * 100;
      },
    },
    {
      key: 'burst',
      label: 'Burst Pressure',
      normalize: (value, allValues) => {
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);
        return ((value - min) / (max - min || 1)) * 100;
      },
    },
    {
      key: 'fatigue',
      label: 'Fatigue Life',
      normalize: (value, allValues) => {
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);
        return ((value - min) / (max - min || 1)) * 100;
      },
    },
    {
      key: 'margin',
      label: 'Stress Margin',
      normalize: (value, allValues) => {
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);
        return ((value - min) / (max - min || 1)) * 100;
      },
    },
  ];

  const radarDesignData: RadarDesignData[] = designsToCompare.map((id) => {
    const details = designDetails.get(id);
    const stress = stressDetails.get(id);

    return {
      id,
      label: `Design ${id}`,
      metrics: {
        weight: details?.summary.weight_kg || 0,
        cost: details?.summary.cost_eur || 0,
        burst: details?.summary.burst_pressure_bar || 0,
        fatigue: details?.summary.fatigue_life_cycles || 0,
        margin: stress?.max_stress.margin_percent || 0,
      },
    };
  });

  // Stress comparison data
  const stressComparisonData: StressData[] = designsToCompare.map((id) => {
    const stress = stressDetails.get(id);
    return {
      designId: id,
      maxStress: stress?.max_stress?.value_mpa || 0,
      allowable: stress?.max_stress?.allowable_mpa || 0,
      margin: stress?.max_stress?.margin_percent || 0,
      location: stress?.max_stress?.region || 'Unknown',
      safetyFactor: (stress?.max_stress?.allowable_mpa || 0) / (stress?.max_stress?.value_mpa || 1) || 1,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Loading comparison data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Design Selection */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Design Comparison</h2>
            <p className="text-gray-600 mt-1">
              Compare performance metrics and visualizations across {designsToCompare.length} designs.
            </p>
          </div>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={syncViews}
                onChange={(e) => setSyncViews(e.target.checked)}
                className="rounded border-gray-300"
              />
              Sync 3D Views
            </label>
          </div>
        </div>

        {/* Multi-Design Header */}
        <Card className="bg-gray-50">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">Selected Designs:</span>

            {designsToCompare.map((id, index) => (
              <div key={id} className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border-2 border-blue-200">
                  <span className="font-semibold text-blue-700">Design {id}</span>
                  {designsToCompare.length > 2 && (
                    <button
                      onClick={() => handleRemoveDesign(id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove design"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {index < designsToCompare.length - 1 && (
                  <button
                    onClick={() => handleSwapDesigns(index, index + 1)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Swap positions"
                  >
                    <ArrowLeftRight size={16} className="text-gray-400" />
                  </button>
                )}
              </div>
            ))}

            {canAddMore && (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                  <Plus size={16} />
                  Add Design
                </button>
                <div className="hidden group-hover:block absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[150px]">
                  {availableDesigns.slice(0, 5).map((id) => (
                    <button
                      key={id}
                      onClick={() => handleAddDesign(id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      Design {id}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Comparison Metrics Table */}
      <ComparisonTable
        designs={designDataForTable}
        metrics={comparisonMetrics}
        onDesignSelect={handleSelectDesign}
      />

      {/* Radar Chart and Stress Comparison */}
      <div className="grid grid-cols-2 gap-6">
        <RadarComparison designs={radarDesignData} metrics={radarMetrics} />
        <div className="space-y-6">
          {/* Trade-off Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScatterChart size={18} />
                Trade-off Analysis
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Pareto Recommendations</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">•</span>
                    <span>
                      <strong>Design {designsToCompare[0]}</strong>: Best overall balance of weight and cost
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">•</span>
                    <span>
                      <strong>Design {designsToCompare[1]}</strong>: Optimal for high-performance applications
                    </span>
                  </li>
                  {designsToCompare[2] && (
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>
                        <strong>Design {designsToCompare[2]}</strong>: Cost-optimized solution
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-gray-700 mb-1">Selection Criteria:</p>
                <ul className="space-y-1">
                  <li>• Weight vs Cost Pareto frontier</li>
                  <li>• Minimum safety margin: 10%</li>
                  <li>• Burst pressure compliance: 700 bar</li>
                  <li>• Manufacturing feasibility verified</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Stress Comparison */}
      <StressComparison stressData={stressComparisonData} />

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => setScreen('pareto')}>
          Back to Dashboard
        </Button>
        <Button onClick={() => handleSelectDesign(designsToCompare[0])}>
          View Design {designsToCompare[0]} in 3D
        </Button>
      </div>
    </div>
  );
}
