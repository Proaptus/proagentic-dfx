/**
 * Composite Analysis - Tsai-Wu Failure Criterion
 * REQ-232: Implement Tsai-Wu failure analysis
 *
 * Tsai-Wu failure criterion for composite materials:
 * F₁σ₁ + F₂σ₂ + F₁₁σ₁² + F₂₂σ₂² + F₆₆τ₁₂² + 2F₁₂σ₁σ₂ < 1
 *
 * Where:
 * - σ₁ = longitudinal stress (MPa)
 * - σ₂ = transverse stress (MPa)
 * - τ₁₂ = in-plane shear stress (MPa)
 * - F_i = strength parameters
 */

/**
 * Composite material strength properties
 */
export interface TsaiWuStrengths {
  X_t: number; // Longitudinal tensile strength (MPa)
  X_c: number; // Longitudinal compressive strength (MPa)
  Y_t: number; // Transverse tensile strength (MPa)
  Y_c: number; // Transverse compressive strength (MPa)
  S: number;   // Shear strength (MPa)
}

/**
 * Typical carbon fiber/epoxy strengths (T700/Epoxy)
 */
export const CARBON_EPOXY_STRENGTHS: TsaiWuStrengths = {
  X_t: 2500,  // Longitudinal tensile (MPa)
  X_c: 1200,  // Longitudinal compressive (MPa)
  Y_t: 80,    // Transverse tensile (MPa)
  Y_c: 200,   // Transverse compressive (MPa)
  S: 100      // Shear strength (MPa)
};

/**
 * Calculate Tsai-Wu failure index
 * Returns a value where:
 * - < 1.0: Safe (no failure predicted)
 * - = 1.0: At failure threshold
 * - > 1.0: Failure predicted
 *
 * @param sigma1 - Longitudinal stress (MPa, positive = tension)
 * @param sigma2 - Transverse stress (MPa, positive = tension)
 * @param tau12 - In-plane shear stress (MPa)
 * @param strengths - Material strength properties
 * @returns Tsai-Wu failure index (unitless)
 */
export function calculateTsaiWuIndex(
  sigma1: number,
  sigma2: number,
  tau12: number,
  strengths: TsaiWuStrengths
): number {
  // Linear terms
  const F1 = 1 / strengths.X_t - 1 / strengths.X_c;
  const F2 = 1 / strengths.Y_t - 1 / strengths.Y_c;

  // Quadratic terms
  const F11 = 1 / (strengths.X_t * strengths.X_c);
  const F22 = 1 / (strengths.Y_t * strengths.Y_c);
  const F66 = 1 / (strengths.S * strengths.S);

  // Interaction term (conservative estimate: -0.5√(F11×F22))
  const F12 = -0.5 * Math.sqrt(F11 * F22);

  // Tsai-Wu failure criterion
  const index =
    F1 * sigma1 +
    F2 * sigma2 +
    F11 * sigma1 * sigma1 +
    F22 * sigma2 * sigma2 +
    F66 * tau12 * tau12 +
    2 * F12 * sigma1 * sigma2;

  return index;
}

/**
 * Calculate margin of safety from Tsai-Wu index
 * MS = (1/√TW_index) - 1
 *
 * @param tsaiWuIndex - Tsai-Wu failure index
 * @returns Margin of safety (0 = at limit, positive = safe, negative = failed)
 */
export function calculateMarginOfSafety(tsaiWuIndex: number): number {
  if (tsaiWuIndex <= 0) {
    return Infinity; // No stress, infinite margin
  }
  return 1 / Math.sqrt(tsaiWuIndex) - 1;
}

/**
 * Calculate safety factor from Tsai-Wu index
 * SF = 1/√TW_index
 *
 * @param tsaiWuIndex - Tsai-Wu failure index
 * @returns Safety factor (>1 = safe, 1 = at limit, <1 = failed)
 */
export function calculateSafetyFactor(tsaiWuIndex: number): number {
  if (tsaiWuIndex <= 0) {
    return Infinity;
  }
  return 1 / Math.sqrt(tsaiWuIndex);
}

/**
 * Calculate failure pressure multiplier
 * Returns the factor by which current stress can be multiplied before failure
 *
 * @param tsaiWuIndex - Tsai-Wu failure index at current load
 * @returns Failure multiplier (e.g., 2.0 means can handle 2x current load)
 */
export function calculateFailureMultiplier(tsaiWuIndex: number): number {
  if (tsaiWuIndex <= 0) {
    return Infinity;
  }
  return 1 / Math.sqrt(tsaiWuIndex);
}

/**
 * Hashin failure criteria (alternative to Tsai-Wu)
 * Separates fiber and matrix failure modes
 */
export interface HashinIndices {
  fiberTension: number;      // Fiber tension failure
  fiberCompression: number;  // Fiber compression failure
  matrixTension: number;     // Matrix tension failure
  matrixCompression: number; // Matrix compression failure
}

/**
 * Calculate Hashin failure indices
 * Each mode is independent; failure occurs if any index >= 1
 *
 * @param sigma1 - Longitudinal stress (MPa)
 * @param sigma2 - Transverse stress (MPa)
 * @param tau12 - Shear stress (MPa)
 * @param strengths - Material strengths
 * @returns Hashin failure indices for each mode
 */
export function calculateHashinIndices(
  sigma1: number,
  sigma2: number,
  tau12: number,
  strengths: TsaiWuStrengths
): HashinIndices {
  let fiberTension = 0;
  let fiberCompression = 0;
  let matrixTension = 0;
  let matrixCompression = 0;

  // Fiber tension (σ₁ > 0)
  if (sigma1 >= 0) {
    fiberTension = Math.pow(sigma1 / strengths.X_t, 2);
  }
  // Fiber compression (σ₁ < 0)
  else {
    fiberCompression = Math.pow(sigma1 / strengths.X_c, 2);
  }

  // Matrix tension (σ₂ > 0)
  if (sigma2 >= 0) {
    matrixTension =
      Math.pow(sigma2 / strengths.Y_t, 2) +
      Math.pow(tau12 / strengths.S, 2);
  }
  // Matrix compression (σ₂ < 0)
  else {
    matrixCompression =
      Math.pow(sigma2 / (2 * strengths.S), 2) +
      (Math.pow(strengths.Y_c / (2 * strengths.S), 2) - 1) *
        (sigma2 / strengths.Y_c) +
      Math.pow(tau12 / strengths.S, 2);
  }

  return {
    fiberTension,
    fiberCompression,
    matrixTension,
    matrixCompression,
  };
}

/**
 * Determine predicted failure mode from Hashin indices
 *
 * @param hashinIndices - Calculated Hashin indices
 * @returns String describing the predicted failure mode
 */
export function predictFailureMode(hashinIndices: HashinIndices): string {
  const max = Math.max(
    hashinIndices.fiberTension,
    hashinIndices.fiberCompression,
    hashinIndices.matrixTension,
    hashinIndices.matrixCompression
  );

  if (max < 1.0) {
    return 'No failure predicted';
  }

  if (max === hashinIndices.fiberTension) {
    return 'Fiber tension failure';
  }
  if (max === hashinIndices.fiberCompression) {
    return 'Fiber compression failure';
  }
  if (max === hashinIndices.matrixTension) {
    return 'Matrix tension failure (includes shear)';
  }
  return 'Matrix compression failure';
}

/**
 * Calculate layer stresses from global pressure vessel stresses
 * Transforms stresses based on fiber orientation angle
 *
 * @param sigmaHoop - Global hoop stress (MPa)
 * @param sigmaAxial - Global axial stress (MPa)
 * @param fiberAngle - Fiber angle from axial direction (degrees)
 * @returns Local stresses in fiber coordinate system
 */
export function transformStresses(
  sigmaHoop: number,
  sigmaAxial: number,
  fiberAngle: number
): { sigma1: number; sigma2: number; tau12: number } {
  const theta = (fiberAngle * Math.PI) / 180; // Convert to radians
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  // Stress transformation equations
  const sigma1 =
    sigmaHoop * sin * sin +
    sigmaAxial * cos * cos;

  const sigma2 =
    sigmaHoop * cos * cos +
    sigmaAxial * sin * sin;

  const tau12 =
    -(sigmaHoop - sigmaAxial) * sin * cos;

  return { sigma1, sigma2, tau12 };
}
