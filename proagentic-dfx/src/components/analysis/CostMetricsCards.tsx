'use client';

/**
 * Cost Metrics Cards
 * Key performance indicators and summary cards for cost analysis
 */

import { Card } from '@/components/ui/Card';
import { formatCurrency, type CurrencyCode } from '@/lib/utils/currency';
import { DollarSign, TrendingDown, Package, Factory } from 'lucide-react';
import type { DesignCost } from '@/lib/types';
import { PRODUCTION_VOLUMES, type ProductionVolume } from './cost-analysis.types';

// ============================================================================
// Key Metrics Row
// ============================================================================

interface KeyMetricsRowProps {
  unitCost: number;
  materialsCost: number;
  manufacturingCost: number;
  volumeReductionPct: number;
  currency: CurrencyCode;
}

export function KeyMetricsRow({
  unitCost,
  materialsCost,
  manufacturingCost,
  volumeReductionPct,
  currency
}: KeyMetricsRowProps) {
  const costReductionLabel = volumeReductionPct === 0 ? 'Baseline' :
                             volumeReductionPct > 0 ? `+${volumeReductionPct}%` : `${volumeReductionPct}%`;

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card className="transition-all hover:shadow-md">
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <DollarSign size={16} />
            Unit Cost
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(unitCost, currency)}
          </div>
          <div className="text-xs text-gray-500 mt-1">per tank</div>
        </div>
      </Card>

      <Card className="transition-all hover:shadow-md">
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Package size={16} />
            Material Cost
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(materialsCost, currency)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {((materialsCost / unitCost) * 100).toFixed(0)}% of total
          </div>
        </div>
      </Card>

      <Card className="transition-all hover:shadow-md">
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Factory size={16} />
            Manufacturing Cost
          </div>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(manufacturingCost, currency)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {((manufacturingCost / unitCost) * 100).toFixed(0)}% of total
          </div>
        </div>
      </Card>

      <Card className="transition-all hover:shadow-md">
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <TrendingDown size={16} />
            Volume Sensitivity
          </div>
          <div className={`text-3xl font-bold ${volumeReductionPct < 0 ? 'text-green-600' : volumeReductionPct > 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {costReductionLabel}
          </div>
          <div className="text-xs text-gray-500 mt-1">vs. 5K baseline</div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// Unit Cost Summary Card
// ============================================================================

interface UnitCostSummaryProps {
  costData: DesignCost;
  materialsCost: number;
  laborCost: number;
  productionVolume: ProductionVolume;
  currency: CurrencyCode;
}

export function UnitCostSummary({
  costData,
  materialsCost,
  laborCost,
  productionVolume,
  currency
}: UnitCostSummaryProps) {
  const fiberCostShare = costData.breakdown.find(b =>
    b.component.includes('Fiber') || b.component.includes('Carbon')
  )?.percentage || 47;

  return (
    <Card className="transition-all hover:shadow-md">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={18} />
          <h3 className="text-lg font-semibold">Unit Cost Analysis</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Unit Cost (at {PRODUCTION_VOLUMES[productionVolume]})</div>
            <div className="text-4xl font-bold text-gray-900">
              {formatCurrency(costData.unit_cost_eur, currency)}
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1">Material Cost</div>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(materialsCost, currency)}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {((materialsCost / costData.unit_cost_eur) * 100).toFixed(0)}%
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="text-xs text-gray-600 mb-1">Labor Cost</div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(laborCost, currency)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {((laborCost / costData.unit_cost_eur) * 100).toFixed(0)}%
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cost per kg:</span>
              <span className="font-mono font-semibold">{formatCurrency(costData.unit_cost_eur / 47, currency)}/kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fiber cost share:</span>
              <span className="font-mono font-semibold">{fiberCostShare}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Production volume:</span>
              <span className="font-medium">{PRODUCTION_VOLUMES[productionVolume].split(' ')[0]} units/year</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded mt-4">
          Based on automated filament winding with quality control. Includes materials, direct labor, tooling amortization, and overhead.
        </div>
      </div>
    </Card>
  );
}
