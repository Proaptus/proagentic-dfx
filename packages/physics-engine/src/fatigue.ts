/**
 * Fatigue Analysis - S-N Curve Method
 * Applicable to: Pressure Vessels, Composite Structures, Aerospace Components
 *
 * S-N curve (Stress-Life) approach:
 * N = C × (Δσ)^(-m)
 *
 * Where:
 * - N = number of cycles to failure
 * - Δσ = stress amplitude (MPa)
 * - C = material constant (typically 10^12 for carbon fiber composites)
 * - m = slope exponent (10-15 for composites, vs 3-5 for metals)
 */

/**
 * S-N curve parameters for different materials
 */
export interface SNParameters {
  C: number;           // Material constant (cycles × MPa^m)
  m: number;           // Slope exponent (unitless)
  enduranceLimit?: number; // Stress below which infinite life is assumed (MPa)
}

/**
 * Predefined S-N parameters for common materials
 */
export const SN_PARAMETERS = {
  CARBON_EPOXY: {
    C: 1e12,
    m: 12,
    enduranceLimit: 500,
  } as SNParameters,
  GLASS_EPOXY: {
    C: 1e11,
    m: 10,
    enduranceLimit: 300,
  } as SNParameters,
  STEEL: {
    C: 1e9,
    m: 3,
    enduranceLimit: 200,
  } as SNParameters,
  ALUMINUM: {
    C: 5e8,
    m: 4,
    enduranceLimit: undefined, // Aluminum has no true endurance limit
  } as SNParameters,
};

/**
 * Calculate fatigue life using S-N curve
 * Formula: N = C × (Δσ)^(-m) = C / (Δσ^m)
 *
 * @param stressAmplitude - Alternating stress amplitude (MPa)
 * @param snParams - S-N curve parameters
 * @returns Number of cycles to failure
 */
export function calculateFatigueLife(
  stressAmplitude: number,
  snParams: SNParameters = SN_PARAMETERS.CARBON_EPOXY
): number {
  if (stressAmplitude <= 0) {
    return Infinity; // No stress = infinite life
  }

  // Check endurance limit
  if (snParams.enduranceLimit && stressAmplitude < snParams.enduranceLimit) {
    return Infinity; // Below endurance limit = infinite life
  }

  // N = C / (Δσ^m)
  return snParams.C / Math.pow(stressAmplitude, snParams.m);
}

/**
 * Calculate allowable stress for given fatigue life
 * Inverse of S-N equation: Δσ = (C/N)^(1/m)
 *
 * @param targetCycles - Target number of cycles
 * @param snParams - S-N curve parameters
 * @returns Allowable stress amplitude (MPa)
 */
export function calculateAllowableStress(
  targetCycles: number,
  snParams: SNParameters = SN_PARAMETERS.CARBON_EPOXY
): number {
  if (targetCycles <= 0) {
    throw new Error('Target cycles must be positive');
  }
  return Math.pow(snParams.C / targetCycles, 1 / snParams.m);
}

/**
 * Calculate stress amplitude from pressure cycling
 *
 * @param minPressure - Minimum pressure in cycle (MPa)
 * @param maxPressure - Maximum pressure in cycle (MPa)
 * @param radius - Tank radius (mm)
 * @param thickness - Wall thickness (mm)
 * @param stressType - Type of stress ('hoop' or 'axial')
 * @returns Stress amplitude (MPa)
 */
export function calculateStressAmplitude(
  minPressure: number,
  maxPressure: number,
  radius: number,
  thickness: number,
  stressType: 'hoop' | 'axial' = 'hoop'
): number {
  let maxStress: number;
  let minStress: number;

  if (stressType === 'hoop') {
    maxStress = (maxPressure * radius) / thickness;
    minStress = (minPressure * radius) / thickness;
  } else {
    maxStress = (maxPressure * radius) / (2 * thickness);
    minStress = (minPressure * radius) / (2 * thickness);
  }

  // Stress amplitude = (σ_max - σ_min) / 2
  return (maxStress - minStress) / 2;
}

/**
 * Calculate mean stress
 *
 * @param minStress - Minimum stress (MPa)
 * @param maxStress - Maximum stress (MPa)
 * @returns Mean stress (MPa)
 */
export function calculateMeanStress(
  minStress: number,
  maxStress: number
): number {
  return (maxStress + minStress) / 2;
}

/**
 * Apply Goodman mean stress correction
 * Formula: σ_eq = σ_a / (1 - σ_m / σ_ult)
 *
 * @param stressAmplitude - Alternating stress amplitude (MPa)
 * @param meanStress - Mean stress (MPa)
 * @param ultimateStrength - Ultimate tensile strength (MPa)
 * @returns Equivalent fully-reversed stress amplitude (MPa)
 */
export function applyGoodmanCorrection(
  stressAmplitude: number,
  meanStress: number,
  ultimateStrength: number
): number {
  const correction = 1 - meanStress / ultimateStrength;

  if (correction <= 0) {
    throw new Error('Mean stress exceeds ultimate strength');
  }

  return stressAmplitude / correction;
}

/**
 * Calculate cumulative damage using Palmgren-Miner rule
 * D = Σ(n_i / N_i)
 *
 * @param loadingBlocks - Array of loading blocks with stress and cycle count
 * @param snParams - S-N curve parameters
 * @returns Cumulative damage (failure occurs when D >= 1)
 */
export function calculateCumulativeDamage(
  loadingBlocks: Array<{ stressAmplitude: number; cycles: number }>,
  snParams: SNParameters = SN_PARAMETERS.CARBON_EPOXY
): number {
  let totalDamage = 0;

  for (const block of loadingBlocks) {
    const N = calculateFatigueLife(block.stressAmplitude, snParams);
    if (isFinite(N)) {
      totalDamage += block.cycles / N;
    }
  }

  return totalDamage;
}

/**
 * Calculate fatigue safety factor
 * SF = N_predicted / N_required
 *
 * @param predictedLife - Predicted fatigue life (cycles)
 * @param requiredLife - Required fatigue life (cycles)
 * @returns Safety factor (should be > 1.0)
 */
export function calculateFatigueSafetyFactor(
  predictedLife: number,
  requiredLife: number
): number {
  if (requiredLife <= 0) {
    throw new Error('Required life must be positive');
  }
  if (!isFinite(predictedLife)) {
    return Infinity;
  }
  return predictedLife / requiredLife;
}
