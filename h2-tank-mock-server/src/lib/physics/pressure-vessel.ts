/**
 * Pressure Vessel Mechanics - First-Principles Physics
 * REQ-231: Implement real pressure vessel equations
 *
 * Based on thin-wall pressure vessel theory:
 * - Hoop stress (circumferential): σ_hoop = PR/t
 * - Axial stress (longitudinal): σ_axial = PR/(2t)
 * - Netting theory optimal angle: tan²α = 2, α = 54.74°
 */

/**
 * Calculate hoop (circumferential) stress in a thin-walled pressure vessel
 * Formula: σ_hoop = PR/t
 *
 * @param pressure - Internal pressure (MPa)
 * @param radius - Inner radius (m)
 * @param thickness - Wall thickness (m)
 * @returns Hoop stress (MPa)
 *
 * Example:
 * P = 700 bar = 70 MPa
 * R = 175 mm = 0.175 m
 * t = 25 mm = 0.025 m
 * σ_hoop = 70 × 0.175 / 0.025 = 490 MPa
 */
export function calculateHoopStress(
  pressure: number,
  radius: number,
  thickness: number
): number {
  if (thickness <= 0) {
    throw new Error('Wall thickness must be positive');
  }
  if (radius <= 0) {
    throw new Error('Radius must be positive');
  }

  return (pressure * radius) / thickness;
}

/**
 * Calculate axial (longitudinal) stress in a thin-walled pressure vessel
 * Formula: σ_axial = PR/(2t)
 *
 * @param pressure - Internal pressure (MPa)
 * @param radius - Inner radius (m)
 * @param thickness - Wall thickness (m)
 * @returns Axial stress (MPa)
 *
 * Example:
 * P = 700 bar = 70 MPa
 * R = 175 mm = 0.175 m
 * t = 25 mm = 0.025 m
 * σ_axial = 70 × 0.175 / (2 × 0.025) = 245 MPa
 */
export function calculateAxialStress(
  pressure: number,
  radius: number,
  thickness: number
): number {
  if (thickness <= 0) {
    throw new Error('Wall thickness must be positive');
  }
  if (radius <= 0) {
    throw new Error('Radius must be positive');
  }

  return (pressure * radius) / (2 * thickness);
}

/**
 * Calculate burst pressure for a composite pressure vessel
 * Formula: P_burst = (σ_ult × t) / (R × SF)
 *
 * @param tensileStrength - Ultimate tensile strength of composite (MPa)
 * @param thickness - Wall thickness (m)
 * @param radius - Inner radius (m)
 * @param safetyFactor - Safety factor (default 2.25 for hydrogen tanks per UN ECE R134)
 * @returns Burst pressure (MPa)
 */
export function calculateBurstPressure(
  tensileStrength: number,
  thickness: number,
  radius: number,
  safetyFactor: number = 2.25
): number {
  if (thickness <= 0 || radius <= 0 || safetyFactor <= 0) {
    throw new Error('All parameters must be positive');
  }

  return (tensileStrength * thickness) / (radius * safetyFactor);
}

/**
 * Calculate netting theory optimal winding angle
 * Netting theory: For a thin-walled cylindrical pressure vessel,
 * the optimal helical winding angle is where tan²α = 2
 *
 * @returns Optimal winding angle in degrees (54.74°)
 */
export function getNettingTheoryAngle(): number {
  // tan²α = 2, therefore α = arctan(√2)
  const angleRad = Math.atan(Math.sqrt(2));
  const angleDeg = (angleRad * 180) / Math.PI;
  return angleDeg; // 54.735610317245346°
}

/**
 * Calculate stress ratio (hoop to axial)
 * For a cylinder: σ_hoop / σ_axial = 2.0 (from netting theory)
 *
 * @param hoopStress - Hoop stress (MPa)
 * @param axialStress - Axial stress (MPa)
 * @returns Stress ratio
 */
export function calculateStressRatio(
  hoopStress: number,
  axialStress: number
): number {
  if (axialStress === 0) {
    throw new Error('Axial stress cannot be zero');
  }
  return hoopStress / axialStress;
}

/**
 * Calculate working pressure from burst pressure
 * Working pressure = Burst pressure / Burst ratio
 *
 * @param burstPressure - Burst pressure (MPa)
 * @param burstRatio - Burst ratio (typically 2.25 for hydrogen)
 * @returns Working pressure (MPa)
 */
export function calculateWorkingPressure(
  burstPressure: number,
  burstRatio: number = 2.25
): number {
  if (burstRatio <= 1) {
    throw new Error('Burst ratio must be greater than 1');
  }
  return burstPressure / burstRatio;
}

/**
 * Calculate test pressure from working pressure
 * Test pressure = Working pressure × Test factor
 *
 * @param workingPressure - Working pressure (MPa)
 * @param testFactor - Test factor (typically 1.5 for hydrogen)
 * @returns Test pressure (MPa)
 */
export function calculateTestPressure(
  workingPressure: number,
  testFactor: number = 1.5
): number {
  if (testFactor <= 1) {
    throw new Error('Test factor must be greater than 1');
  }
  return workingPressure * testFactor;
}

/**
 * Calculate required wall thickness for given pressure and stress
 * Formula: t = PR/σ_allow
 *
 * @param pressure - Internal pressure (MPa)
 * @param radius - Inner radius (m)
 * @param allowableStress - Allowable stress (MPa)
 * @returns Required wall thickness (m)
 */
export function calculateRequiredThickness(
  pressure: number,
  radius: number,
  allowableStress: number
): number {
  if (allowableStress <= 0) {
    throw new Error('Allowable stress must be positive');
  }
  return (pressure * radius) / allowableStress;
}

/**
 * Calculate stored energy in pressurized vessel
 * Formula: E = P²VR/(2E_material) for thin-walled vessels
 * Simplified: E ≈ P×V/2 for ideal gas
 *
 * @param pressure - Internal pressure (MPa)
 * @param volume - Internal volume (L)
 * @returns Stored energy (MJ)
 */
export function calculateStoredEnergy(
  pressure: number,
  volume: number
): number {
  // Convert: pressure from MPa to Pa, volume from L to m³
  const pressurePa = pressure * 1e6;
  const volumeM3 = volume / 1000;

  // Energy = P×V/2 (simplified for ideal gas)
  const energyJ = (pressurePa * volumeM3) / 2;
  const energyMJ = energyJ / 1e6;

  return energyMJ;
}
