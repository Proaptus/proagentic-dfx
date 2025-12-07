/**
 * Pressure Vessel Mechanics
 * Thin-wall pressure vessel stress calculations
 *
 * Applicable to: H2 Tanks, CNG/LNG Tanks, Pressure Vessels, Aerospace Fuel Tanks
 */

/**
 * Calculate hoop (circumferential) stress in a cylindrical pressure vessel
 * Formula: σ_hoop = (P × r) / t
 *
 * @param pressure - Internal pressure (MPa)
 * @param radius - Inner radius (mm)
 * @param thickness - Wall thickness (mm)
 * @returns Hoop stress (MPa)
 */
export function calculateHoopStress(
  pressure: number,
  radius: number,
  thickness: number
): number {
  if (thickness <= 0) {
    throw new Error('Wall thickness must be positive');
  }
  return (pressure * radius) / thickness;
}

/**
 * Calculate axial (longitudinal) stress in a cylindrical pressure vessel
 * Formula: σ_axial = (P × r) / (2 × t)
 *
 * @param pressure - Internal pressure (MPa)
 * @param radius - Inner radius (mm)
 * @param thickness - Wall thickness (mm)
 * @returns Axial stress (MPa)
 */
export function calculateAxialStress(
  pressure: number,
  radius: number,
  thickness: number
): number {
  if (thickness <= 0) {
    throw new Error('Wall thickness must be positive');
  }
  return (pressure * radius) / (2 * thickness);
}

/**
 * Calculate von Mises equivalent stress
 * Formula: σ_vm = √(σ1² + σ2² - σ1×σ2)
 *
 * @param hoopStress - Hoop stress (MPa)
 * @param axialStress - Axial stress (MPa)
 * @returns Von Mises stress (MPa)
 */
export function calculateVonMisesStress(
  hoopStress: number,
  axialStress: number
): number {
  return Math.sqrt(
    hoopStress * hoopStress +
    axialStress * axialStress -
    hoopStress * axialStress
  );
}

/**
 * Calculate required wall thickness for a given pressure
 * Formula: t = (P × r × SF) / σ_allowable
 *
 * @param pressure - Design pressure (MPa)
 * @param radius - Inner radius (mm)
 * @param allowableStress - Allowable material stress (MPa)
 * @param safetyFactor - Safety factor (default 2.25 for hydrogen tanks)
 * @returns Required wall thickness (mm)
 */
export function calculateRequiredThickness(
  pressure: number,
  radius: number,
  allowableStress: number,
  safetyFactor: number = 2.25
): number {
  if (allowableStress <= 0) {
    throw new Error('Allowable stress must be positive');
  }
  return (pressure * radius * safetyFactor) / allowableStress;
}

/**
 * Calculate burst pressure for a given geometry and material
 * Formula: P_burst = (σ_ultimate × t) / r
 *
 * @param ultimateStrength - Material ultimate strength (MPa)
 * @param thickness - Wall thickness (mm)
 * @param radius - Inner radius (mm)
 * @returns Burst pressure (MPa)
 */
export function calculateBurstPressure(
  ultimateStrength: number,
  thickness: number,
  radius: number
): number {
  if (radius <= 0) {
    throw new Error('Radius must be positive');
  }
  return (ultimateStrength * thickness) / radius;
}

/**
 * Calculate burst ratio (burst pressure / working pressure)
 *
 * @param burstPressure - Burst pressure (MPa)
 * @param workingPressure - Working pressure (MPa)
 * @returns Burst ratio (should be >= 2.25 for hydrogen tanks)
 */
export function calculateBurstRatio(
  burstPressure: number,
  workingPressure: number
): number {
  if (workingPressure <= 0) {
    throw new Error('Working pressure must be positive');
  }
  return burstPressure / workingPressure;
}

/**
 * Calculate stress ratio (R-ratio) for fatigue analysis
 * R = σ_min / σ_max
 *
 * @param minStress - Minimum stress (MPa)
 * @param maxStress - Maximum stress (MPa)
 * @returns R-ratio (unitless)
 */
export function calculateRRatio(
  minStress: number,
  maxStress: number
): number {
  if (maxStress === 0) {
    throw new Error('Maximum stress cannot be zero');
  }
  return minStress / maxStress;
}

/**
 * Calculate internal volume of a cylindrical vessel with hemispherical ends
 *
 * @param innerRadius - Inner radius (mm)
 * @param cylinderLength - Cylinder length (mm)
 * @returns Internal volume (liters)
 */
export function calculateCylinderVolume(
  innerRadius: number,
  cylinderLength: number
): number {
  const radiusM = innerRadius / 1000; // Convert to meters
  const lengthM = cylinderLength / 1000; // Convert to meters

  // Cylinder volume: π × r² × L
  const cylinderVolume = Math.PI * radiusM * radiusM * lengthM;

  // Two hemispherical caps = one sphere: (4/3) × π × r³
  const sphereVolume = (4 / 3) * Math.PI * radiusM * radiusM * radiusM;

  // Convert m³ to liters (1 m³ = 1000 L)
  return (cylinderVolume + sphereVolume) * 1000;
}

/**
 * Calculate tank weight (simplified)
 *
 * @param innerRadius - Inner radius (mm)
 * @param outerRadius - Outer radius (mm)
 * @param cylinderLength - Cylinder length (mm)
 * @param density - Material density (kg/m³)
 * @returns Weight (kg)
 */
export function calculateTankWeight(
  innerRadius: number,
  outerRadius: number,
  cylinderLength: number,
  density: number
): number {
  const innerRadiusM = innerRadius / 1000;
  const outerRadiusM = outerRadius / 1000;
  const lengthM = cylinderLength / 1000;

  // Volume of material = outer volume - inner volume
  const outerCylinder = Math.PI * outerRadiusM * outerRadiusM * lengthM;
  const innerCylinder = Math.PI * innerRadiusM * innerRadiusM * lengthM;
  const outerSphere = (4 / 3) * Math.PI * outerRadiusM * outerRadiusM * outerRadiusM;
  const innerSphere = (4 / 3) * Math.PI * innerRadiusM * innerRadiusM * innerRadiusM;

  const materialVolume = (outerCylinder + outerSphere) - (innerCylinder + innerSphere);

  return materialVolume * density;
}
