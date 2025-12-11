'use client';

import { useState, useEffect } from 'react';
import type { CurrencyCode } from '@/lib/utils/currency';
import {
  CostAnalysisPanelProps,
  PRODUCTION_VOLUMES,
  ProductionVolume,
  getVolumeReductionPct,
  generateManufacturingProcesses,
} from './cost-analysis.types';
import { KeyMetricsRow, UnitCostSummary } from './CostMetricsCards';
import {
  CostBreakdownChart,
  VolumeSensitivityChart,
  WeightCostTradeoffChart,
  MaterialComparisonTable,
} from './CostVisualizationCharts';
import { ManufacturingProcessChart, LearningCurveChart } from './CostChartsSection';
import { CostEquationsSection } from './CostEquationsSection';

export function CostAnalysisPanel({ data: initialData, designId = 'C', onCostDataChange }: CostAnalysisPanelProps) {
  const [costData, setCostData] = useState(initialData);
  const [productionVolume, setProductionVolume] = useState<ProductionVolume>('5k');
  const [isLoading, setIsLoading] = useState(false);
  const [showEquations, setShowEquations] = useState(false);
  const [currency] = useState<CurrencyCode>('EUR');

  useEffect(() => {
    const fetchCostData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/designs/${designId}/cost?volume=${productionVolume}`);
        if (response.ok) {
          const newData = await response.json();
          setCostData(newData);
          onCostDataChange?.(newData);
        }
      } catch (error) {
        console.error('Failed to fetch cost data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCostData();
  }, [productionVolume, designId, onCostDataChange]);

  // Extract data arrays
  const volumeSensitivity = costData.volume_sensitivity || [];
  const weightCostTradeoff = costData.weight_cost_tradeoff || [];
  const materialComparison = costData.material_comparison || [];
  const learningCurveData = costData.learning_curve || [];

  // Calculate key metrics
  const materialsCost = costData.breakdown.find(b => b.component === 'Materials')?.cost_eur || 0;
  const laborCost = costData.breakdown.find(b => b.component === 'Labor')?.cost_eur || 0;
  const overheadCost = costData.breakdown.find(b => b.component === 'Overhead')?.cost_eur || 0;
  const manufacturingCost = laborCost + overheadCost;

  // Cost reduction potential at higher volumes
  const volumeReductionPct = getVolumeReductionPct(productionVolume);

  // Manufacturing process breakdown
  const manufacturingProcesses = generateManufacturingProcesses(laborCost);

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="production-volume-select" className="block text-sm font-medium text-gray-700 mb-2">
            Production Volume
          </label>
          <select
            id="production-volume-select"
            value={productionVolume}
            onChange={(e) => setProductionVolume(e.target.value as ProductionVolume)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={isLoading}
          >
            {Object.entries(PRODUCTION_VOLUMES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowEquations(!showEquations)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showEquations
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          {showEquations ? 'Hide Equations' : 'Show Equations'}
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-sm text-gray-500 text-center py-2 animate-pulse">
          Calculating costs for {PRODUCTION_VOLUMES[productionVolume]}...
        </div>
      )}

      {/* Key Metrics Row */}
      <KeyMetricsRow
        unitCost={costData.unit_cost_eur}
        materialsCost={materialsCost}
        manufacturingCost={manufacturingCost}
        volumeReductionPct={volumeReductionPct}
        currency={currency}
      />

      {/* Unit Cost Summary */}
      <UnitCostSummary
        costData={costData}
        materialsCost={materialsCost}
        laborCost={laborCost}
        productionVolume={productionVolume}
        currency={currency}
      />

      {/* Cost Breakdown - Pie Chart */}
      <CostBreakdownChart
        breakdown={costData.breakdown}
        currency={currency}
      />

      {/* Production Volume Sensitivity */}
      <VolumeSensitivityChart
        data={volumeSensitivity}
        currentVolume={productionVolume}
        baselineCost={costData.unit_cost_eur}
        currency={currency}
      />

      {/* Weight-Cost Trade-off */}
      <WeightCostTradeoffChart
        data={weightCostTradeoff}
        currency={currency}
      />

      {/* Material Cost Comparison */}
      <MaterialComparisonTable
        data={materialComparison}
        currency={currency}
      />

      {/* Manufacturing Process Breakdown */}
      <ManufacturingProcessChart
        processes={manufacturingProcesses}
        currency={currency}
      />

      {/* Learning Curve Effect */}
      <LearningCurveChart data={learningCurveData} />

      {/* Collapsible Equations Section */}
      {showEquations && (
        <CostEquationsSection
          costData={costData}
          materialsCost={materialsCost}
          laborCost={laborCost}
          currency={currency}
        />
      )}
    </div>
  );
}
