/**
 * Hydrogen Permeation Analysis
 * Based on Fick's law of diffusion
 *
 * Permeation rate: J = P × A × (p₁ - p₂) / L
 *
 * Where:
 * - J = permeation rate (mol/s or NmL/hr/L)
 * - P = permeability coefficient (mol·m/(m²·s·Pa))
 * - A = surface area (m²)
 * - p₁, p₂ = partial pressures (Pa)
 * - L = thickness (m)
 */

/**
 * Calculate hydrogen permeation rate through liner
 * Using Fick's law: J = P × A × Δp / L
 *
 * @param permeability - Material permeability coefficient (mol·m/(m²·s·Pa))
 * @param surfaceArea - Liner surface area (m²)
 * @param pressureDifference - Pressure difference across liner (Pa)
 * @param thickness - Liner thickness (m)
 * @returns Permeation rate (mol/s)
 */
export function calculatePermeationRate(
  permeability: number,
  surfaceArea: number,
  pressureDifference: number,
  thickness: number
): number {
  if (thickness <= 0) {
    throw new Error('Thickness must be positive');
  }

  // J = P × A × Δp / L
  const permeationRate = (permeability * surfaceArea * pressureDifference) / thickness;

  return permeationRate;
}

/**
 * Convert permeation rate from mol/s to NmL/hr/L
 * (Normal milliliters per hour per liter of tank volume)
 *
 * @param permeationMolPerSec - Permeation rate (mol/s)
 * @param tankVolume - Tank internal volume (L)
 * @returns Permeation rate (NmL/hr/L)
 */
export function convertPermeationUnits(
  permeationMolPerSec: number,
  tankVolume: number
): number {
  // 1 mol H₂ at STP = 22.4 L = 22,400 mL
  const molarVolumeNmL = 22400; // NmL/mol

  // mol/s → NmL/hr
  const permeationNmLPerHr = permeationMolPerSec * molarVolumeNmL * 3600;

  // NmL/hr → NmL/hr/L
  const permeationNormalized = permeationNmLPerHr / tankVolume;

  return permeationNormalized;
}

/**
 * Typical permeability coefficients for liner materials
 * Units: mol·m/(m²·s·Pa) or mol/(m·s·Pa)
 */
export const PERMEABILITY_COEFFICIENTS = {
  HDPE: 3.5e-13,        // High-density polyethylene
  PA6: 1.2e-13,         // Polyamide (Nylon 6)
  PA66: 1.0e-13,        // Polyamide 66
  ALUMINUM: 1e-16,      // Aluminum (very low)
  STEEL: 1e-17,         // Steel (very low)
  COMPOSITE: 1e-14,     // Carbon fiber composite (through matrix)
};

/**
 * Calculate permeation for a composite tank with liner
 *
 * @param linerMaterial - Liner permeability coefficient
 * @param linerThickness - Liner thickness (mm)
 * @param tankRadius - Tank radius (mm)
 * @param cylinderLength - Cylinder length (mm)
 * @param pressure - Internal pressure (bar)
 * @param temperature - Temperature (°C, default 20°C)
 * @returns Permeation rate (NmL/hr/L)
 */
export function calculateTankPermeation(
  linerMaterial: number,
  linerThickness: number,
  tankRadius: number,
  cylinderLength: number,
  pressure: number,
  temperature: number = 20
): number {
  // Convert units to SI
  const thicknessSI = linerThickness / 1000; // mm → m
  const radiusSI = tankRadius / 1000; // mm → m
  const lengthSI = cylinderLength / 1000; // mm → m
  const pressureSI = pressure * 1e5; // bar → Pa

  // Calculate surface area (cylinder + 2 hemispheres = cylinder + sphere)
  const cylinderArea = 2 * Math.PI * radiusSI * lengthSI;
  const sphereArea = 4 * Math.PI * radiusSI * radiusSI;
  const totalArea = cylinderArea + sphereArea;

  // Temperature correction (Arrhenius relation)
  // P(T) = P₀ × exp(-Ea/RT)
  // Simplified: P(T) ≈ P₀ × exp(β(T - T₀))
  const tempCorrectionFactor = Math.exp(0.05 * (temperature - 20)); // β ≈ 0.05 /°C
  const permeabilityAdjusted = linerMaterial * tempCorrectionFactor;

  // Pressure difference (internal pressure - atmospheric)
  const atmosphericPressure = 1.01325e5; // Pa
  const pressureDiff = pressureSI - atmosphericPressure;

  // Calculate permeation rate
  const permeationMolPerSec = calculatePermeationRate(
    permeabilityAdjusted,
    totalArea,
    pressureDiff,
    thicknessSI
  );

  // Calculate tank volume
  const cylinderVolume = Math.PI * radiusSI * radiusSI * lengthSI;
  const sphereVolume = (4 / 3) * Math.PI * radiusSI ** 3;
  const tankVolumeM3 = cylinderVolume + sphereVolume;
  const tankVolumeL = tankVolumeM3 * 1000;

  // Convert to NmL/hr/L
  const permeationNormalized = convertPermeationUnits(
    permeationMolPerSec,
    tankVolumeL
  );

  return permeationNormalized;
}

/**
 * Calculate pressure loss due to permeation over time
 *
 * @param initialPressure - Initial pressure (bar)
 * @param permeationRate - Permeation rate (NmL/hr/L)
 * @param timeHours - Time elapsed (hours)
 * @param temperature - Temperature (°C)
 * @returns Pressure after permeation (bar)
 */
export function calculatePressureLoss(
  initialPressure: number,
  permeationRate: number,
  timeHours: number,
  temperature: number = 20
): number {
  // Convert temperature to Kelvin
  const tempK = temperature + 273.15;

  // Calculate total volume lost (NmL)
  const volumeLostNmL = permeationRate * timeHours;

  // Convert NmL to moles (at STP)
  const molarVolumeNmL = 22400;
  const molesLost = volumeLostNmL / molarVolumeNmL;

  // Calculate initial moles using ideal gas law
  // PV = nRT → n = PV/(RT)
  // For 1 L tank at initial pressure
  const R = 8.314; // J/(mol·K)
  const initialPressurePa = initialPressure * 1e5;
  const volumeM3 = 0.001; // 1 L
  const initialMoles = (initialPressurePa * volumeM3) / (R * tempK);

  // Remaining moles
  const remainingMoles = initialMoles - molesLost;

  // Calculate final pressure
  const finalPressurePa = (remainingMoles * R * tempK) / volumeM3;
  const finalPressureBar = finalPressurePa / 1e5;

  return Math.max(0, finalPressureBar);
}

/**
 * Check if permeation meets regulatory requirements
 * UN ECE R134 requirement: < 6 NmL/hr/L for 70 MPa tanks
 *
 * @param permeationRate - Calculated permeation rate (NmL/hr/L)
 * @param limit - Regulatory limit (NmL/hr/L), default 6.0
 * @returns Whether permeation is acceptable
 */
export function checkPermeationCompliance(
  permeationRate: number,
  limit: number = 6.0
): { compliant: boolean; margin: number } {
  const compliant = permeationRate <= limit;
  const margin = ((limit - permeationRate) / limit) * 100;

  return { compliant, margin };
}

/**
 * Calculate required liner thickness to meet permeation limit
 *
 * @param permeabilityCoeff - Material permeability
 * @param surfaceArea - Liner surface area (m²)
 * @param pressureDiff - Pressure difference (Pa)
 * @param maxPermeationRate - Maximum allowed permeation (mol/s)
 * @returns Required liner thickness (m)
 */
export function calculateRequiredLinerThickness(
  permeabilityCoeff: number,
  surfaceArea: number,
  pressureDiff: number,
  maxPermeationRate: number
): number {
  // From J = P × A × Δp / L
  // L = P × A × Δp / J
  const thickness =
    (permeabilityCoeff * surfaceArea * pressureDiff) / maxPermeationRate;

  return thickness;
}

/**
 * Estimate time to reach minimum operating pressure due to permeation
 *
 * @param initialPressure - Initial pressure (bar)
 * @param minPressure - Minimum operating pressure (bar)
 * @param permeationRate - Permeation rate (NmL/hr/L)
 * @param temperature - Temperature (°C)
 * @returns Time in hours
 */
export function calculateTimeToMinPressure(
  initialPressure: number,
  minPressure: number,
  permeationRate: number,
  temperature: number = 20
): number {
  // This is a simplified calculation
  // More accurate would involve solving differential equation
  const tempK = temperature + 273.15;
  const R = 8.314;

  const initialPressurePa = initialPressure * 1e5;
  const minPressurePa = minPressure * 1e5;
  const volumeM3 = 0.001; // 1 L

  const initialMoles = (initialPressurePa * volumeM3) / (R * tempK);
  const finalMoles = (minPressurePa * volumeM3) / (R * tempK);

  const molesLost = initialMoles - finalMoles;
  const volumeLostNmL = molesLost * 22400; // mol → NmL

  const timeHours = volumeLostNmL / permeationRate;

  return timeHours;
}
