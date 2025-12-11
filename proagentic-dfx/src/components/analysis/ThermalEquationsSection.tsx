'use client';

/**
 * ThermalEquationsSection Component
 * Displays engineering equations for thermal analysis
 */

import { EquationDisplay } from './EquationDisplay';
import type { DesignThermal } from '@/lib/types';

interface ThermalEquationsSectionProps {
  thermalData: DesignThermal;
}

export function ThermalEquationsSection({ thermalData }: ThermalEquationsSectionProps) {
  return (
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
  );
}
