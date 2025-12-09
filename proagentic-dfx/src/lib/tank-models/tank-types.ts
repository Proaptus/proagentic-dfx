/**
 * Tank Type Definitions - Type I through Type V Hydrogen Tanks
 *
 * Defines geometric specifications for different hydrogen pressure vessel types
 * according to industry standards (SAE J2579, ISO 11119, etc.)
 */

export enum TankType {
  TYPE_I = 'TYPE_I',     // All-metal (steel/aluminum)
  TYPE_II = 'TYPE_II',   // Metal liner + hoop wrap
  TYPE_III = 'TYPE_III', // Metal liner + full composite wrap
  TYPE_IV = 'TYPE_IV',   // Polymer liner + full composite wrap
  TYPE_V = 'TYPE_V',     // Linerless all-composite
}

export interface TankTypeSpec {
  type: TankType;
  name: string;
  description: string;
  hasMetal: boolean;
  hasPolymer: boolean;
  hasComposite: boolean;
  compositePattern: 'none' | 'hoop' | 'full' | 'advanced';
  typicalPressure: { min: number; max: number }; // bar
  weightRatio: number; // Relative to Type IV (1.0 = baseline)
  costRatio: number; // Relative to Type IV
  materialLayers: MaterialLayer[];
}

export interface MaterialLayer {
  name: string;
  thickness: number; // mm
  density: number; // kg/m³
  color: [number, number, number]; // RGB 0-1
  opacity: number;
  order: number; // 0 = innermost
}

/**
 * Type I: All-Metal Construction
 * - Seamless steel or aluminum cylinder with domed ends
 * - Highest weight, lowest cost
 * - Typical: 200-250 bar
 */
export const TYPE_I_SPEC: TankTypeSpec = {
  type: TankType.TYPE_I,
  name: 'Type I (All-Metal)',
  description: 'Seamless steel or aluminum pressure vessel',
  hasMetal: true,
  hasPolymer: false,
  hasComposite: false,
  compositePattern: 'none',
  typicalPressure: { min: 150, max: 250 },
  weightRatio: 3.5, // Heaviest
  costRatio: 0.3,   // Cheapest
  materialLayers: [
    {
      name: 'Steel/Aluminum Wall',
      thickness: 12.0,
      density: 7850, // Steel
      color: [0.7, 0.75, 0.78], // Metallic gray
      opacity: 1.0,
      order: 0,
    },
  ],
};

/**
 * Type II: Metal Liner + Hoop Wrap
 * - Metal liner with composite hoop (circumferential) wrapping
 * - Improved weight vs Type I, limited by hoop-only wrap
 * - Typical: 250-300 bar
 */
export const TYPE_II_SPEC: TankTypeSpec = {
  type: TankType.TYPE_II,
  name: 'Type II (Metal + Hoop Wrap)',
  description: 'Metal liner with hoop-wrapped composite reinforcement',
  hasMetal: true,
  hasPolymer: false,
  hasComposite: true,
  compositePattern: 'hoop',
  typicalPressure: { min: 200, max: 300 },
  weightRatio: 2.8,
  costRatio: 0.5,
  materialLayers: [
    {
      name: 'Metal Liner',
      thickness: 8.0,
      density: 2700, // Aluminum
      color: [0.75, 0.77, 0.8],
      opacity: 1.0,
      order: 0,
    },
    {
      name: 'Hoop Wrap (Carbon/Glass)',
      thickness: 6.0,
      density: 1600,
      color: [0.15, 0.15, 0.15], // Dark carbon fiber
      opacity: 0.9,
      order: 1,
    },
  ],
};

/**
 * Type III: Metal Liner + Full Composite Wrap
 * - Thin metal liner (structural backup) + full helical/hoop composite wrap
 * - Good balance of safety, weight, and cost
 * - Typical: 350-450 bar
 */
export const TYPE_III_SPEC: TankTypeSpec = {
  type: TankType.TYPE_III,
  name: 'Type III (Metal Liner + Full Wrap)',
  description: 'Metal liner fully overwrapped with composite material',
  hasMetal: true,
  hasPolymer: false,
  hasComposite: true,
  compositePattern: 'full',
  typicalPressure: { min: 350, max: 450 },
  weightRatio: 1.6,
  costRatio: 0.75,
  materialLayers: [
    {
      name: 'Metal Liner (Aluminum)',
      thickness: 3.2,
      density: 2700,
      color: [0.8, 0.82, 0.85],
      opacity: 0.8,
      order: 0,
    },
    {
      name: 'Hoop Wrap',
      thickness: 8.0,
      density: 1550,
      color: [0.055, 0.647, 0.914], // Blue hoop
      opacity: 0.85,
      order: 1,
    },
    {
      name: 'Helical Wrap',
      thickness: 12.0,
      density: 1550,
      color: [0.976, 0.451, 0.086], // Orange helical
      opacity: 0.85,
      order: 2,
    },
  ],
};

/**
 * Type IV: Polymer Liner + Full Composite Wrap
 * - HDPE/PA liner (non-structural) + full composite wrap (load-bearing)
 * - Best weight/volume ratio, industry standard for 700 bar
 * - Typical: 350-700 bar
 */
export const TYPE_IV_SPEC: TankTypeSpec = {
  type: TankType.TYPE_IV,
  name: 'Type IV (Polymer Liner + Full Wrap)',
  description: 'Polymer liner with full composite overwrap (most common 700 bar)',
  hasMetal: false,
  hasPolymer: true,
  hasComposite: true,
  compositePattern: 'full',
  typicalPressure: { min: 350, max: 700 },
  weightRatio: 1.0, // Baseline
  costRatio: 1.0,   // Baseline
  materialLayers: [
    {
      name: 'HDPE Liner',
      thickness: 3.2,
      density: 950,
      color: [0.612, 0.639, 0.686], // Light gray
      opacity: 0.6,
      order: 0,
    },
    {
      name: 'Hoop Wrap (T700)',
      thickness: 10.0,
      density: 1550,
      color: [0.055, 0.647, 0.914],
      opacity: 0.9,
      order: 1,
    },
    {
      name: 'Helical Wrap (T700)',
      thickness: 15.0,
      density: 1550,
      color: [0.976, 0.451, 0.086],
      opacity: 0.9,
      order: 2,
    },
  ],
};

/**
 * Type V: Linerless All-Composite
 * - No liner - pure composite structure with permeation barrier
 * - Lightest, most expensive, requires perfect manufacturing
 * - Typical: 350-700 bar (experimental)
 */
export const TYPE_V_SPEC: TankTypeSpec = {
  type: TankType.TYPE_V,
  name: 'Type V (Linerless Composite)',
  description: 'All-composite construction with integrated permeation barrier',
  hasMetal: false,
  hasPolymer: false,
  hasComposite: true,
  compositePattern: 'advanced',
  typicalPressure: { min: 350, max: 700 },
  weightRatio: 0.75, // Lightest
  costRatio: 1.8,    // Most expensive
  materialLayers: [
    {
      name: 'Permeation Barrier Layer',
      thickness: 0.5,
      density: 1200,
      color: [0.9, 0.9, 0.95], // Near-white
      opacity: 0.4,
      order: 0,
    },
    {
      name: 'Inner Hoop Wrap',
      thickness: 8.0,
      density: 1600,
      color: [0.055, 0.647, 0.914],
      opacity: 0.95,
      order: 1,
    },
    {
      name: 'Helical Wrap',
      thickness: 18.0,
      density: 1600,
      color: [0.976, 0.451, 0.086],
      opacity: 0.95,
      order: 2,
    },
    {
      name: 'Outer Protective Layer',
      thickness: 1.5,
      density: 1400,
      color: [0.1, 0.1, 0.12],
      opacity: 1.0,
      order: 3,
    },
  ],
};

/**
 * Get tank type specification by type
 */
export function getTankTypeSpec(type: TankType): TankTypeSpec {
  switch (type) {
    case TankType.TYPE_I:
      return TYPE_I_SPEC;
    case TankType.TYPE_II:
      return TYPE_II_SPEC;
    case TankType.TYPE_III:
      return TYPE_III_SPEC;
    case TankType.TYPE_IV:
      return TYPE_IV_SPEC;
    case TankType.TYPE_V:
      return TYPE_V_SPEC;
    default:
      return TYPE_IV_SPEC; // Default to most common
  }
}

/**
 * Calculate tank mass based on type and geometry
 */
export function calculateTankMass(
  type: TankType,
  innerRadius: number, // mm
  length: number, // mm
  domeDepth: number // mm
): number {
  const spec = getTankTypeSpec(type);
  const cylinderVolume = Math.PI * Math.pow(innerRadius, 2) * length; // mm³
  const domeVolume = (2 / 3) * Math.PI * Math.pow(innerRadius, 2) * domeDepth * 2; // Both ends
  const totalVolume = cylinderVolume + domeVolume;

  let totalMass = 0;
  for (const layer of spec.materialLayers) {
    const layerRadius = innerRadius + layer.thickness;
    const layerVolume = totalVolume * (Math.pow(layerRadius, 2) / Math.pow(innerRadius, 2));
    const layerMass = (layerVolume * 1e-9) * layer.density; // Convert mm³ to m³
    totalMass += layerMass;
  }

  return totalMass; // kg
}

/**
 * Estimate manufacturing cost multiplier by type
 */
export function getCostMultiplier(type: TankType): number {
  return getTankTypeSpec(type).costRatio;
}
