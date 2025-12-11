'use client';

/**
 * Cost Equations Section Component
 * Displays engineering equations for cost analysis
 */

import { EquationDisplay } from './EquationDisplay';
import type { DesignCost } from '@/lib/types';
import { formatCurrency, type CurrencyCode } from '@/lib/utils/currency';

interface CostEquationsSectionProps {
  costData: DesignCost;
  materialsCost: number;
  laborCost: number;
  currency: CurrencyCode;
}

export function CostEquationsSection({
  costData,
  materialsCost,
  laborCost,
  currency,
}: CostEquationsSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-top-2">
      <h3 className="text-lg font-semibold text-gray-900">Cost Engineering Equations</h3>

      <EquationDisplay
        title="Unit Cost Model"
        equation="C_unit = C_material + C_labor + C_tooling + C_overhead"
        variables={[
          { symbol: 'C_unit', description: 'Total unit cost', value: formatCurrency(costData.unit_cost_eur, currency) },
          { symbol: 'C_material', description: 'Direct material cost', value: formatCurrency(materialsCost, currency) },
          { symbol: 'C_labor', description: 'Direct labor cost', value: formatCurrency(laborCost, currency) },
          { symbol: 'C_tooling', description: 'Amortized tooling', value: formatCurrency(85, currency) },
          { symbol: 'C_overhead', description: 'Factory overhead', value: formatCurrency(120, currency) },
        ]}
        explanation="Unit cost is sum of direct materials, direct labor, amortized tooling costs, and allocated factory overhead (utilities, supervision, QC)."
      />

      <EquationDisplay
        title="Material Cost Calculation"
        equation="C_material = (m_fiber × p_fiber) + (m_matrix × p_matrix) + (m_liner × p_liner)"
        variables={[
          { symbol: 'm_fiber', description: 'Carbon fiber mass', value: '18.5 kg' },
          { symbol: 'p_fiber', description: 'Fiber unit price', value: formatCurrency(45, currency, { perUnit: 'kg' }) },
          { symbol: 'm_matrix', description: 'Epoxy resin mass', value: '4.2 kg' },
          { symbol: 'p_matrix', description: 'Resin unit price', value: formatCurrency(12, currency, { perUnit: 'kg' }) },
          { symbol: 'm_liner', description: 'HDPE liner mass', value: '3.8 kg' },
          { symbol: 'p_liner', description: 'Liner unit price', value: formatCurrency(6, currency, { perUnit: 'kg' }) },
        ]}
        explanation="Material cost is mass-weighted sum of all constituents. Carbon fiber typically dominates (47-52% of total cost) due to high price per kg."
      />

      <EquationDisplay
        title="Volume Scaling (Economies of Scale)"
        equation="C(V) = C_fixed / V + C_variable"
        variables={[
          { symbol: 'C(V)', description: 'Unit cost at volume V' },
          { symbol: 'C_fixed', description: 'Fixed costs (tooling, setup)', value: formatCurrency(425000, currency, { compact: true }) + '/year' },
          { symbol: 'V', description: 'Annual production volume', value: '5,000 units' },
          { symbol: 'C_variable', description: 'Variable cost per unit', value: formatCurrency(costData.unit_cost_eur * 0.75, currency) },
        ]}
        explanation="Fixed costs (tooling, equipment, setup) are amortized over production volume. Higher volumes reduce per-unit fixed cost allocation. Variable costs (materials, labor) remain constant per unit."
        defaultExpanded={false}
      />

      <EquationDisplay
        title="Learning Curve Model"
        equation="C_n = C_1 × n^(log_2(LR))"
        variables={[
          { symbol: 'C_n', description: 'Cost of nth unit' },
          { symbol: 'C_1', description: 'Cost of first unit', value: formatCurrency(costData.unit_cost_eur * 2.5, currency) },
          { symbol: 'n', description: 'Cumulative production count' },
          { symbol: 'LR', description: 'Learning rate', value: '0.85 (85%)' },
        ]}
        explanation="Wright's learning curve: cost decreases by (1-LR) each time cumulative production doubles. 85% learning rate means 15% cost reduction per doubling."
        defaultExpanded={false}
      />
    </div>
  );
}
