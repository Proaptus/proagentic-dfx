'use client';

/**
 * Failure Equations Section Component
 * Displays engineering equations for failure analysis
 */

import { EquationDisplay } from './EquationDisplay';

export function FailureEquationsSection() {
  return (
    <div className="space-y-4 pt-4 border-t transition-all duration-300">
      <h3 className="text-lg font-semibold text-gray-900">Failure Criterion Equations</h3>

      <EquationDisplay
        title="Tsai-Wu Failure Criterion"
        equation="F_i × σ_i + F_ij × σ_i × σ_j < 1"
        variables={[
          { symbol: 'F_i', description: 'Linear strength coefficients' },
          { symbol: 'F_ij', description: 'Quadratic interaction coefficients' },
          { symbol: 'σ_i', description: 'Stress components (1, 2, 6 in lamina coords)' },
        ]}
        explanation="Tsai-Wu is a tensor polynomial criterion that accounts for interaction between different stress components. Index < 1.0 indicates no failure."
      />

      <EquationDisplay
        title="Hashin Fiber Tension Criterion"
        equation="((σ_11 / X_T)^2 + α × (τ_12^2 + τ_13^2) / S^2) ≥ 1"
        variables={[
          { symbol: 'σ_11', description: 'Longitudinal normal stress (fiber direction)' },
          { symbol: 'X_T', description: 'Longitudinal tensile strength', value: '2700 MPa' },
          { symbol: 'τ_12, τ_13', description: 'Shear stresses' },
          { symbol: 'S', description: 'Shear strength', value: '90 MPa' },
          { symbol: 'α', description: 'Shear contribution factor', value: '1.0' },
        ]}
        explanation="Hashin criterion separates failure modes: fiber tension/compression and matrix tension/compression. This allows for mode-specific damage evolution."
      />

      <EquationDisplay
        title="Failure Mode Preference"
        equation="Preference = fiber_breakage > delamination > matrix_cracking"
        explanation="Fiber-dominated failure is preferred because it is progressive and provides audible/visible warning (weeping, stress whitening) before catastrophic failure. Matrix failures can be sudden."
        defaultExpanded={false}
      />
    </div>
  );
}
