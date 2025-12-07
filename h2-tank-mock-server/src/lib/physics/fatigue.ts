/**
 * Fatigue Analysis - S-N Curve Method
 * REQ-235: Implement fatigue life prediction
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
 * S-N curve parameters for common composite materials
 */
export interface SNParameters {
  C: number; // Material constant (cycles × MPa^m)
  m: number; // Slope exponent (unitless)
  enduranceLimit?: number; // Stress below which infinite life is assumed (MPa)
}

/**
 * Typical S-N parameters for carbon fiber/epoxy composites
 * Based on literature for unidirectional CF/Epoxy under tension
 */
export const CARBON_EPOXY_SN: SNParameters = {
  C: 1e12,  // 10^12 cycles × MPa^12
  m: 12,    // Typical for carbon fiber composites (range: 10-15)
  enduranceLimit: 500, // MPa (conservative estimate)
};

/**
 * Typical S-N parameters for glass fiber/epoxy composites
 */
export const GLASS_EPOXY_SN: SNParameters = {
  C: 1e11,
  m: 10,
  enduranceLimit: 300,
};

/**
 * Calculate fatigue life using S-N curve
 * Formula: N = C × (Δσ)^(-m)
 *
 * @param stressAmplitude - Alternating stress amplitude (MPa)
 * @param snParams - S-N curve parameters
 * @returns Number of cycles to failure
 *
 * Example:
 * For carbon fiber at 200 MPa stress amplitude:
 * N = 10^12 × (200)^(-12) = 10^12 / 200^12 ≈ 244 million cycles
 */
export function calculateFatigueLife(
  stressAmplitude: number,
  snParams: SNParameters = CARBON_EPOXY_SN
): number {
  if (stressAmplitude <= 0) {
    return Infinity; // No stress = infinite life
  }

  // Check endurance limit
  if (snParams.enduranceLimit && stressAmplitude < snParams.enduranceLimit) {
    return Infinity; // Below endurance limit = infinite life
  }

  // N = C × (Δσ)^(-m) = C / (Δσ^m)
  const cycles = snParams.C / Math.pow(stressAmplitude, snParams.m);

  return cycles;
}

/**
 * Calculate allowable stress for given fatigue life
 * Inverse of S-N equation: Δσ = (C/N)^(1/m)
 *
 * @param targetCycles - Target number of cycles
 * @param snParams - S-N curve parameters
 * @returns Allowable stress amplitude (MPa)
 *
 * Example:
 * For 1 million cycles with carbon fiber:
 * Δσ = (10^12 / 10^6)^(1/12) = (10^6)^(1/12) ≈ 3.98 MPa
 */
export function calculateAllowableStress(
  targetCycles: number,
  snParams: SNParameters = CARBON_EPOXY_SN
): number {
  if (targetCycles <= 0) {
    throw new Error('Target cycles must be positive');
  }

  // Δσ = (C/N)^(1/m)
  const stress = Math.pow(snParams.C / targetCycles, 1 / snParams.m);

  return stress;
}

/**
 * Calculate stress amplitude from pressure cycling
 *
 * @param minPressure - Minimum pressure in cycle (MPa)
 * @param maxPressure - Maximum pressure in cycle (MPa)
 * @param radius - Tank radius (m)
 * @param thickness - Wall thickness (m)
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
  // Calculate max and min stresses
  let maxStress: number;
  let minStress: number;

  if (stressType === 'hoop') {
    maxStress = (maxPressure * radius) / thickness;
    minStress = (minPressure * radius) / thickness;
  } else {
    // axial
    maxStress = (maxPressure * radius) / (2 * thickness);
    minStress = (minPressure * radius) / (2 * thickness);
  }

  // Stress amplitude = (σ_max - σ_min) / 2
  const amplitude = (maxStress - minStress) / 2;

  return amplitude;
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
 * Calculate stress ratio (R-ratio)
 * R = σ_min / σ_max
 *
 * @param minStress - Minimum stress (MPa)
 * @param maxStress - Maximum stress (MPa)
 * @returns Stress ratio (unitless)
 */
export function calculateStressRatio(
  minStress: number,
  maxStress: number
): number {
  if (maxStress === 0) {
    throw new Error('Maximum stress cannot be zero');
  }
  return minStress / maxStress;
}

/**
 * Apply mean stress correction using Goodman relation
 * Accounts for the effect of mean stress on fatigue life
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
  // Goodman relation: σ_eq = σ_a / (1 - σ_m / σ_ult)
  const correction = 1 - meanStress / ultimateStrength;

  if (correction <= 0) {
    throw new Error('Mean stress exceeds ultimate strength');
  }

  return stressAmplitude / correction;
}

/**
 * Calculate damage per cycle using Miner's rule
 * D = 1/N where N is cycles to failure at given stress
 *
 * @param stressAmplitude - Stress amplitude (MPa)
 * @param snParams - S-N curve parameters
 * @returns Damage per cycle (unitless)
 */
export function calculateDamagePerCycle(
  stressAmplitude: number,
  snParams: SNParameters = CARBON_EPOXY_SN
): number {
  const N = calculateFatigueLife(stressAmplitude, snParams);

  if (!isFinite(N)) {
    return 0; // Infinite life = no damage
  }

  return 1 / N;
}

/**
 * Calculate cumulative damage from variable amplitude loading
 * Using Palmgren-Miner linear damage rule: D = Σ(n_i / N_i)
 *
 * @param loadingBlocks - Array of loading blocks with stress and cycle count
 * @param snParams - S-N curve parameters
 * @returns Cumulative damage (failure occurs when D >= 1)
 */
export function calculateCumulativeDamage(
  loadingBlocks: Array<{ stressAmplitude: number; cycles: number }>,
  snParams: SNParameters = CARBON_EPOXY_SN
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
 * Calculate remaining life given cumulative damage
 *
 * @param currentDamage - Current cumulative damage (0 to 1)
 * @param stressAmplitude - Current stress amplitude (MPa)
 * @param snParams - S-N curve parameters
 * @returns Remaining cycles to failure
 */
export function calculateRemainingLife(
  currentDamage: number,
  stressAmplitude: number,
  snParams: SNParameters = CARBON_EPOXY_SN
): number {
  if (currentDamage >= 1) {
    return 0; // Already failed
  }

  const N = calculateFatigueLife(stressAmplitude, snParams);

  if (!isFinite(N)) {
    return Infinity;
  }

  // Remaining damage = 1 - current damage
  // Remaining cycles = remaining damage × N
  return (1 - currentDamage) * N;
}

/**
 * Estimate fatigue life for hydrogen pressure cycling
 * Typical hydrogen tank cycling: 0 to NWP (Nominal Working Pressure)
 *
 * @param workingPressure - Nominal working pressure (MPa)
 * @param radius - Tank radius (m)
 * @param thickness - Wall thickness (m)
 * @param ultimateStrength - Composite ultimate strength (MPa)
 * @param snParams - S-N curve parameters
 * @returns Predicted fatigue life (cycles)
 */
export function estimateHydrogenCycleLife(
  workingPressure: number,
  radius: number,
  thickness: number,
  ultimateStrength: number,
  snParams: SNParameters = CARBON_EPOXY_SN
): number {
  // Typical hydrogen cycling: 0 to NWP (R = 0)
  const minPressure = 0;
  const maxPressure = workingPressure;

  // Calculate stress amplitude (hoop stress is critical)
  const amplitude = calculateStressAmplitude(
    minPressure,
    maxPressure,
    radius,
    thickness,
    'hoop'
  );

  // Calculate mean stress
  const maxStress = (maxPressure * radius) / thickness;
  const minStress = 0;
  const meanStress = calculateMeanStress(minStress, maxStress);

  // Apply Goodman correction for mean stress effect
  const equivalentAmplitude = applyGoodmanCorrection(
    amplitude,
    meanStress,
    ultimateStrength
  );

  // Calculate fatigue life
  const cycles = calculateFatigueLife(equivalentAmplitude, snParams);

  return cycles;
}

/**
 * Safety factor for fatigue
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
    return Infinity; // Infinite predicted life
  }

  return predictedLife / requiredLife;
}
