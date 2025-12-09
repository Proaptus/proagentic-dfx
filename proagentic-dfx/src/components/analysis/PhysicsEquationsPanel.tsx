'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { EquationDisplay } from './EquationDisplay';
import { BookOpen, Calculator, Atom } from 'lucide-react';

export function PhysicsEquationsPanel() {
  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <Card className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <BookOpen size={20} />
            Engineering Physics & Equations Reference
          </CardTitle>
        </CardHeader>
        <div className="px-4 pb-4">
          <p className="text-gray-700 leading-relaxed">
            This section provides the fundamental equations, theories, and methodologies used in composite pressure vessel analysis.
            All stress, failure, thermal, and reliability calculations are based on these rigorous engineering principles.
          </p>
        </div>
      </Card>

      {/* Pressure Vessel Theory */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <Calculator size={20} className="text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Pressure Vessel Theory</h3>
        </div>

        <EquationDisplay
          title="Hoop Stress (Circumferential) - Thin Wall"
          equation="σ_h = (P × r) / t"
          variables={[
            { symbol: 'σ_h', description: 'Hoop stress (circumferential tension)' },
            { symbol: 'P', description: 'Internal pressure' },
            { symbol: 'r', description: 'Mean radius of cylinder' },
            { symbol: 't', description: 'Wall thickness' },
          ]}
          explanation="For cylindrical pressure vessels with r/t > 10, hoop stress is the primary stress component. It acts tangentially around the circumference and is the dominant stress in filament-wound vessels."
          defaultExpanded={true}
        />

        <EquationDisplay
          title="Axial Stress (Longitudinal)"
          equation="σ_a = (P × r) / (2t)"
          variables={[
            { symbol: 'σ_a', description: 'Axial stress (longitudinal)' },
          ]}
          explanation="Axial stress acts along the cylinder length and is exactly half the hoop stress for thin-wall cylinders. This 2:1 ratio is fundamental to filament winding angle optimization."
        />

        <EquationDisplay
          title="Radial Stress"
          equation="σ_r ≈ -P (at inner surface)"
          variables={[
            { symbol: 'σ_r', description: 'Radial stress (through-thickness)' },
          ]}
          explanation="Radial stress is compressive and equals -P at the inner surface, zero at outer surface. Typically neglected in thin-wall theory but important for thick laminates."
        />

        <EquationDisplay
          title="Netting Theory (Ideal Winding Angle)"
          equation="tan²(θ) = σ_h / σ_a = 2"
          variables={[
            { symbol: 'θ', description: 'Helical winding angle from cylinder axis' },
            { symbol: 'σ_h', description: 'Hoop stress' },
            { symbol: 'σ_a', description: 'Axial stress' },
          ]}
          explanation="Netting theory assumes fibers carry all load (matrix carries none). For 2:1 hoop-to-axial stress ratio, optimal angle is 54.74° (arctan(√2)). Real designs use ±15° helical + 90° hoop to handle end effects."
        />

        <EquationDisplay
          title="Isotensoid Dome Equation"
          equation="r(s) = r_0 × exp(∫[tan(θ)/sin(θ)]ds)"
          variables={[
            { symbol: 'r(s)', description: 'Dome radius at arc length s' },
            { symbol: 'r_0', description: 'Initial radius at cylinder-dome junction' },
            { symbol: 'θ', description: 'Fiber angle at each point' },
          ]}
          explanation="Isotensoid dome profile ensures constant fiber tension throughout geodesic winding path. This minimizes stress concentrations and optimizes material usage in dome regions."
          defaultExpanded={false}
        />
      </div>

      {/* Composite Laminate Theory */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2 border-b pb-2">
          <Atom size={20} className="text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">Classical Laminate Theory (CLT)</h3>
        </div>

        <EquationDisplay
          title="Lamina Stress-Strain Relationship"
          equation="[σ] = [Q] × [ε]"
          variables={[
            { symbol: '[σ]', description: 'Stress vector {σ_1, σ_2, τ_12}' },
            { symbol: '[Q]', description: 'Reduced stiffness matrix (plane stress)' },
            { symbol: '[ε]', description: 'Strain vector {ε_1, ε_2, γ_12}' },
          ]}
          explanation="Each lamina (ply) is treated as orthotropic. Principal axes (1,2) align with fiber/transverse directions. Q matrix contains elastic constants E_1, E_2, G_12, ν_12."
          defaultExpanded={true}
        />

        <EquationDisplay
          title="Laminate Constitutive Equation (ABD Matrix)"
          equation="[N, M] = [A, B; B, D] × [ε_0, κ]"
          variables={[
            { symbol: '[N]', description: 'In-plane force resultants (N/m)' },
            { symbol: '[M]', description: 'Moment resultants (N)' },
            { symbol: '[A]', description: 'Extensional stiffness matrix' },
            { symbol: '[B]', description: 'Coupling stiffness matrix' },
            { symbol: '[D]', description: 'Bending stiffness matrix' },
            { symbol: '[ε_0]', description: 'Mid-plane strains' },
            { symbol: '[κ]', description: 'Curvatures' },
          ]}
          explanation="CLT homogenizes laminate as equivalent plate. A relates in-plane loads to strains, D relates moments to curvatures, B couples extension-bending (zero for symmetric laminates)."
        />

        <EquationDisplay
          title="Fiber Volume Fraction"
          equation="V_f = (m_f / ρ_f) / [(m_f / ρ_f) + (m_m / ρ_m)]"
          variables={[
            { symbol: 'V_f', description: 'Fiber volume fraction', value: '0.62' },
            { symbol: 'm_f', description: 'Mass of fibers' },
            { symbol: 'ρ_f', description: 'Fiber density (carbon)', value: '1.8 g/cm³' },
            { symbol: 'm_m', description: 'Mass of matrix' },
            { symbol: 'ρ_m', description: 'Matrix density (epoxy)', value: '1.2 g/cm³' },
          ]}
          explanation="Fiber volume fraction determines composite properties. Higher V_f = higher strength/stiffness but harder to impregnate. Typical range: 0.55-0.65 for filament winding."
        />

        <EquationDisplay
          title="Rule of Mixtures (Longitudinal Modulus)"
          equation="E_1 = E_f × V_f + E_m × V_m"
          variables={[
            { symbol: 'E_1', description: 'Longitudinal elastic modulus' },
            { symbol: 'E_f', description: 'Fiber modulus', value: '230 GPa (T700)' },
            { symbol: 'V_f', description: 'Fiber volume fraction', value: '0.62' },
            { symbol: 'E_m', description: 'Matrix modulus', value: '3.5 GPa (epoxy)' },
            { symbol: 'V_m', description: 'Matrix volume fraction = 1 - V_f', value: '0.38' },
          ]}
          explanation="Fiber-dominated property: longitudinal stiffness is weighted average. Fibers carry ~97% of load in fiber direction."
        />
      </div>

      {/* Failure Criteria */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2 border-b pb-2">
          <Calculator size={20} className="text-red-600" />
          <h3 className="text-xl font-bold text-gray-900">Composite Failure Criteria</h3>
        </div>

        <EquationDisplay
          title="Tsai-Wu Failure Criterion (Full Form)"
          equation="F_i × σ_i + F_ij × σ_i × σ_j < 1"
          variables={[
            { symbol: 'F_1', description: '= 1/X_T - 1/X_C' },
            { symbol: 'F_2', description: '= 1/Y_T - 1/Y_C' },
            { symbol: 'F_11', description: '= 1/(X_T × X_C)' },
            { symbol: 'F_22', description: '= 1/(Y_T × Y_C)' },
            { symbol: 'F_66', description: '= 1/S²' },
            { symbol: 'F_12', description: '= -0.5/√(X_T × X_C × Y_T × Y_C)' },
          ]}
          explanation="Tensor polynomial criterion accounting for all stress components and interactions. X_T/X_C = longitudinal tension/compression strength, Y_T/Y_C = transverse, S = shear strength. Index < 1 = safe."
          defaultExpanded={true}
        />

        <EquationDisplay
          title="Hashin Fiber Tension Failure"
          equation="((σ_11 / X_T)² + α × (τ_12² + τ_13²) / S²) ≥ 1"
          variables={[
            { symbol: 'σ_11', description: 'Fiber direction normal stress' },
            { symbol: 'X_T', description: 'Fiber tensile strength', value: '2700 MPa' },
            { symbol: 'τ_12, τ_13', description: 'In-plane and out-of-plane shear stresses' },
            { symbol: 'S', description: 'Shear strength', value: '90 MPa' },
            { symbol: 'α', description: 'Shear contribution factor', value: '1.0' },
          ]}
          explanation="Hashin separates failure modes: fiber vs matrix, tension vs compression. This allows progressive damage modeling - different modes degrade properties differently."
        />

        <EquationDisplay
          title="Hashin Matrix Tension Failure"
          equation="((σ_22 / Y_T)² + (τ_12 / S)²) ≥ 1"
          variables={[
            { symbol: 'σ_22', description: 'Transverse normal stress' },
            { symbol: 'Y_T', description: 'Matrix tensile strength', value: '65 MPa' },
            { symbol: 'τ_12', description: 'Shear stress' },
          ]}
          explanation="Matrix-dominated failure typically occurs first but may not be catastrophic. Allows continued load-carrying via fiber bridging until fiber failure."
          defaultExpanded={false}
        />

        <EquationDisplay
          title="Maximum Stress Criterion (Simple)"
          equation="σ_1 < X_T, σ_2 < Y_T, τ_12 < S"
          variables={[
            { symbol: 'σ_1, σ_2', description: 'Principal stresses' },
          ]}
          explanation="Simplest criterion: each stress component must not exceed its allowable. Conservative but doesn't account for interaction. Often used for preliminary design."
          defaultExpanded={false}
        />
      </div>

      {/* Thermal Analysis */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2 border-b pb-2">
          <Calculator size={20} className="text-orange-600" />
          <h3 className="text-xl font-bold text-gray-900">Thermal Analysis</h3>
        </div>

        <EquationDisplay
          title="Adiabatic Compression (Ideal Gas)"
          equation="T_2 / T_1 = (P_2 / P_1)^((γ-1)/γ)"
          variables={[
            { symbol: 'T_1', description: 'Initial temperature', value: '293 K (20°C)' },
            { symbol: 'T_2', description: 'Final temperature after compression' },
            { symbol: 'P_1', description: 'Initial pressure', value: '1 bar' },
            { symbol: 'P_2', description: 'Final pressure', value: '700 bar' },
            { symbol: 'γ', description: 'Heat capacity ratio (H₂)', value: '1.41' },
          ]}
          explanation="Fast-fill compression is nearly adiabatic. For H₂ at 700 bar: T_2 ≈ 358K (85°C). Actual temperature lower due to heat transfer to walls."
          defaultExpanded={true}
        />

        <EquationDisplay
          title="Thermal Stress (Constrained Expansion)"
          equation="σ_thermal = E × Δα × ΔT / (1 - ν)"
          variables={[
            { symbol: 'E', description: 'Elastic modulus' },
            { symbol: 'Δα', description: 'CTE mismatch (liner - composite)' },
            { symbol: 'ΔT', description: 'Temperature change' },
            { symbol: 'ν', description: 'Poisson\'s ratio' },
          ]}
          explanation="When materials with different CTEs are bonded, temperature changes create interface stress. HDPE (α ≈ 120×10⁻⁶/°C) expands far more than carbon fiber (α ≈ 0.5×10⁻⁶/°C)."
        />

        <EquationDisplay
          title="1D Heat Transfer (Transient)"
          equation="∂T/∂t = α_t × (∂²T/∂r²)"
          variables={[
            { symbol: 'T', description: 'Temperature' },
            { symbol: 't', description: 'Time' },
            { symbol: 'α_t', description: 'Thermal diffusivity = k/(ρ×c_p)' },
            { symbol: 'r', description: 'Radial coordinate' },
          ]}
          explanation="Heat diffusion equation governs temperature distribution through tank wall during fast fill. Low thermal diffusivity of composites creates steep gradients."
          defaultExpanded={false}
        />
      </div>

      {/* Reliability & Statistics */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2 border-b pb-2">
          <Calculator size={20} className="text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Reliability & Probabilistic Analysis</h3>
        </div>

        <EquationDisplay
          title="Monte Carlo Sampling"
          equation="P_failure ≈ (Number of failures) / (Total samples)"
          variables={[
            { symbol: 'P_failure', description: 'Estimated failure probability' },
          ]}
          explanation="Randomly sample input parameters from distributions (normal, lognormal, Weibull), run FEA for each sample, count failures. Converges to true probability with large N (typically 10,000-100,000 samples)."
          defaultExpanded={true}
        />

        <EquationDisplay
          title="Latin Hypercube Sampling (LHS)"
          equation="Stratified sampling: divide each distribution into N intervals"
          explanation="More efficient than pure Monte Carlo. Ensures full coverage of probability space with fewer samples. Reduces variance of estimator by ~50% compared to random sampling."
          defaultExpanded={false}
        />

        <EquationDisplay
          title="Normal Distribution"
          equation="f(x) = (1 / (σ√(2π))) × exp(-(x-μ)²/(2σ²))"
          variables={[
            { symbol: 'μ', description: 'Mean (center)' },
            { symbol: 'σ', description: 'Standard deviation (spread)' },
          ]}
          explanation="Most material properties follow normal distribution. 68% of values within ±1σ, 95% within ±2σ, 99.7% within ±3σ."
        />

        <EquationDisplay
          title="Weibull Distribution (Fiber Strength)"
          equation="F(x) = 1 - exp(-(x/λ)^k)"
          variables={[
            { symbol: 'F(x)', description: 'Cumulative probability of failure at stress x' },
            { symbol: 'λ', description: 'Scale parameter (characteristic strength)' },
            { symbol: 'k', description: 'Shape parameter (Weibull modulus)', value: '8-12 for carbon fiber' },
          ]}
          explanation="Fiber strength exhibits weakest-link behavior (defect-controlled). Weibull distribution captures lower tail better than normal. Higher k = less scatter."
          defaultExpanded={false}
        />

        <EquationDisplay
          title="Coefficient of Variation (CoV)"
          equation="CoV = σ / μ"
          variables={[
            { symbol: 'CoV', description: 'Normalized measure of dispersion' },
            { symbol: 'σ', description: 'Standard deviation' },
            { symbol: 'μ', description: 'Mean' },
          ]}
          explanation="CoV allows comparison of variability across different scales. Typical CoV values: fiber strength 3-5%, matrix strength 8-12%, manufacturing defects 15-25%."
        />

        <EquationDisplay
          title="Safety Factor"
          equation="SF = Capacity / Demand = P_burst / P_operating"
          variables={[
            { symbol: 'SF', description: 'Safety factor' },
          ]}
          explanation="Deterministic safety margin. Regulations require SF ≥ 2.25 for H₂ tanks (burst/working pressure). Accounts for material scatter, model uncertainty, and degradation."
        />
      </div>

      {/* Summary Card */}
      <Card className="border-l-4 border-green-500 bg-green-50">
        <div className="p-4">
          <h4 className="font-semibold text-green-900 mb-2">Engineering Notes</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• All analyses use finite element methods (FEA) with these equations as governing physics</li>
            <li>• Classical Laminate Theory (CLT) provides material property homogenization</li>
            <li>• Tsai-Wu and Hashin criteria predict failure modes and locations</li>
            <li>• Monte Carlo simulation quantifies uncertainty and reliability</li>
            <li>• Thermal-structural coupling captures fast-fill effects</li>
            <li>• Netting theory guides optimal fiber orientations</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
