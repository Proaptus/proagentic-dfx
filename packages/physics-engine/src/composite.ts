/**
 * Composite Material Analysis
 * Failure criteria for fiber-reinforced composites
 *
 * Applicable to: H2 Tanks, Composite Pressure Vessels, Aerospace Structures
 */

/**
 * Composite ply properties
 */
export interface PlyProperties {
  E1: number;      // Longitudinal modulus (MPa)
  E2: number;      // Transverse modulus (MPa)
  G12: number;     // Shear modulus (MPa)
  nu12: number;    // Major Poisson's ratio
  Xt: number;      // Longitudinal tensile strength (MPa)
  Xc: number;      // Longitudinal compressive strength (MPa)
  Yt: number;      // Transverse tensile strength (MPa)
  Yc: number;      // Transverse compressive strength (MPa)
  S12: number;     // In-plane shear strength (MPa)
}

/**
 * Stress state in a ply
 */
export interface PlyStress {
  sigma1: number;   // Longitudinal stress (MPa)
  sigma2: number;   // Transverse stress (MPa)
  tau12: number;    // Shear stress (MPa)
}

/**
 * Common composite material properties
 */
export const COMPOSITE_MATERIALS = {
  T700_EPOXY: {
    E1: 135000,
    E2: 10000,
    G12: 5000,
    nu12: 0.3,
    Xt: 2550,
    Xc: 1470,
    Yt: 80,
    Yc: 240,
    S12: 90,
  } as PlyProperties,
  IM7_EPOXY: {
    E1: 165000,
    E2: 8500,
    G12: 4500,
    nu12: 0.3,
    Xt: 2860,
    Xc: 1590,
    Yt: 75,
    Yc: 250,
    S12: 98,
  } as PlyProperties,
  GLASS_EPOXY: {
    E1: 45000,
    E2: 10000,
    G12: 4500,
    nu12: 0.3,
    Xt: 1020,
    Xc: 620,
    Yt: 40,
    Yc: 145,
    S12: 70,
  } as PlyProperties,
};

/**
 * Calculate Tsai-Wu failure index
 *
 * The Tsai-Wu criterion is: F1*σ1 + F2*σ2 + F11*σ1² + F22*σ2² + F66*τ12² + 2*F12*σ1*σ2 = 1
 *
 * Returns a failure index where:
 * - Index < 1: Safe
 * - Index = 1: At failure boundary
 * - Index > 1: Failed
 *
 * @param stress - Ply stress state
 * @param props - Ply material properties
 * @returns Tsai-Wu failure index (< 1 is safe)
 */
export function calculateTsaiWuIndex(
  stress: PlyStress,
  props: PlyProperties
): number {
  const { sigma1, sigma2, tau12 } = stress;
  const { Xt, Xc, Yt, Yc, S12 } = props;

  // Tsai-Wu coefficients
  const F1 = 1 / Xt - 1 / Xc;
  const F2 = 1 / Yt - 1 / Yc;
  const F11 = 1 / (Xt * Xc);
  const F22 = 1 / (Yt * Yc);
  const F66 = 1 / (S12 * S12);

  // F12 interaction term (using empirical correlation)
  const F12 = -0.5 * Math.sqrt(F11 * F22);

  // Calculate failure index
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
 * Calculate Hashin failure criteria
 * Returns separate indices for fiber and matrix failure modes
 *
 * @param stress - Ply stress state
 * @param props - Ply material properties
 * @returns Object with fiber and matrix failure indices
 */
export function calculateHashinIndices(
  stress: PlyStress,
  props: PlyProperties
): { fiber: number; matrix: number; fiberMode: string; matrixMode: string } {
  const { sigma1, sigma2, tau12 } = stress;
  const { Xt, Xc, Yt, Yc, S12 } = props;

  let fiberIndex = 0;
  let matrixIndex = 0;
  let fiberMode = 'none';
  let matrixMode = 'none';

  // Fiber failure modes
  if (sigma1 >= 0) {
    // Fiber tension
    fiberIndex = (sigma1 / Xt) * (sigma1 / Xt) + (tau12 / S12) * (tau12 / S12);
    fiberMode = 'tension';
  } else {
    // Fiber compression
    fiberIndex = (sigma1 / Xc) * (sigma1 / Xc);
    fiberMode = 'compression';
  }

  // Matrix failure modes
  if (sigma2 >= 0) {
    // Matrix tension
    matrixIndex = (sigma2 / Yt) * (sigma2 / Yt) + (tau12 / S12) * (tau12 / S12);
    matrixMode = 'tension';
  } else {
    // Matrix compression
    matrixIndex =
      (sigma2 / (2 * S12)) * (sigma2 / (2 * S12)) +
      ((Yc / (2 * S12)) * (Yc / (2 * S12)) - 1) * (sigma2 / Yc) +
      (tau12 / S12) * (tau12 / S12);
    matrixMode = 'compression';
  }

  return {
    fiber: fiberIndex,
    matrix: matrixIndex,
    fiberMode,
    matrixMode,
  };
}

/**
 * Calculate maximum stress failure criterion
 * Simple check: compare stresses to allowables
 *
 * @param stress - Ply stress state
 * @param props - Ply material properties
 * @returns Object with margin of safety for each component
 */
export function calculateMaxStressMargins(
  stress: PlyStress,
  props: PlyProperties
): { longitudinal: number; transverse: number; shear: number } {
  const { sigma1, sigma2, tau12 } = stress;
  const { Xt, Xc, Yt, Yc, S12 } = props;

  // Longitudinal margin
  const longAllowable = sigma1 >= 0 ? Xt : Xc;
  const longitudinal = longAllowable / Math.abs(sigma1) - 1;

  // Transverse margin
  const transAllowable = sigma2 >= 0 ? Yt : Yc;
  const transverse = transAllowable / Math.abs(sigma2) - 1;

  // Shear margin
  const shear = S12 / Math.abs(tau12) - 1;

  return {
    longitudinal,
    transverse,
    shear,
  };
}

/**
 * Calculate ply stress from laminate loads using Classical Laminate Theory (simplified)
 *
 * @param angle - Ply angle (degrees)
 * @param Nx - Normal force in x-direction (N/mm)
 * @param Ny - Normal force in y-direction (N/mm)
 * @param Nxy - Shear force (N/mm)
 * @param thickness - Ply thickness (mm)
 * @returns Ply stress in material coordinates
 */
export function calculatePlyStress(
  angle: number,
  Nx: number,
  Ny: number,
  Nxy: number,
  thickness: number
): PlyStress {
  const angleRad = (angle * Math.PI) / 180;
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);

  // Laminate stresses
  const sigmaX = Nx / thickness;
  const sigmaY = Ny / thickness;
  const tauXY = Nxy / thickness;

  // Transform to material coordinates
  const sigma1 = c * c * sigmaX + s * s * sigmaY + 2 * c * s * tauXY;
  const sigma2 = s * s * sigmaX + c * c * sigmaY - 2 * c * s * tauXY;
  const tau12 = -c * s * sigmaX + c * s * sigmaY + (c * c - s * s) * tauXY;

  return { sigma1, sigma2, tau12 };
}

/**
 * Calculate first ply failure (FPF) pressure
 * Iterates through plies to find the lowest failure pressure
 *
 * @param layup - Array of ply angles (degrees)
 * @param radius - Vessel radius (mm)
 * @param thickness - Total wall thickness (mm)
 * @param props - Ply material properties
 * @returns First ply failure pressure (MPa) and critical ply info
 */
export function calculateFirstPlyFailure(
  layup: number[],
  radius: number,
  thickness: number,
  props: PlyProperties
): { pressure: number; criticalPly: number; failureMode: string } {
  const _plyThickness = thickness / layup.length; // Reserved for future per-ply stress distribution
  void _plyThickness; // Silence unused var warning
  let minPressure = Infinity;
  let criticalPly = 0;
  let failureMode = '';

  for (let i = 0; i < layup.length; i++) {
    const angle = layup[i];

    // Test pressure (will be scaled)
    const testPressure = 1; // MPa

    // Calculate loads from pressure (cylindrical vessel)
    const Nx = (testPressure * radius) / 2; // Axial
    const Ny = testPressure * radius; // Hoop
    const Nxy = 0;

    // Get ply stress
    const stress = calculatePlyStress(angle, Nx, Ny, Nxy, thickness);

    // Calculate Tsai-Wu index at test pressure
    const index = calculateTsaiWuIndex(stress, props);

    // Scale to find failure pressure
    // Since stress scales linearly with pressure, and Tsai-Wu is quadratic
    // P_failure = P_test / sqrt(index)
    const failurePressure = testPressure / Math.sqrt(index);

    if (failurePressure < minPressure) {
      minPressure = failurePressure;
      criticalPly = i + 1;

      // Determine failure mode
      const hashin = calculateHashinIndices(stress, props);
      if (hashin.fiber > hashin.matrix) {
        failureMode = `Fiber ${hashin.fiberMode}`;
      } else {
        failureMode = `Matrix ${hashin.matrixMode}`;
      }
    }
  }

  return {
    pressure: minPressure,
    criticalPly,
    failureMode,
  };
}
