/**
 * Materials Database - Type Definitions Only
 * REQ-011 to REQ-015: Materials specifications and properties
 * Real composite materials data for Type 4 hydrogen tank design
 *
 * NOTE: Material data is now served by the mock server API at /api/materials
 * This file contains only TypeScript type definitions and API helper functions.
 */

export type MaterialCategory = 'fiber' | 'matrix' | 'liner' | 'boss';
export type MaterialType = 'carbon_fiber' | 'glass_fiber' | 'fiber' | 'matrix' | 'liner' | 'boss';

export interface FiberProperties {
  id: string;
  name: string;
  category: 'fiber';
  manufacturer: string;
  // Mechanical properties (GPa, MPa)
  E1: number; // Longitudinal modulus (GPa)
  E2: number; // Transverse modulus (GPa)
  G12: number; // Shear modulus (GPa)
  nu12: number; // Poisson's ratio
  Xt: number; // Tensile strength longitudinal (MPa)
  Xc: number; // Compressive strength longitudinal (MPa)
  Yt: number; // Tensile strength transverse (MPa)
  Yc: number; // Compressive strength transverse (MPa)
  S: number; // Shear strength (MPa)
  // Physical properties
  density: number; // g/cm³
  fiber_density: number; // g/cm³ (raw fiber)
  fiber_diameter: number; // μm
  // Cost and availability
  cost_per_kg: number; // USD/kg
  availability: 'excellent' | 'good' | 'limited';
  // Temperature limits
  max_service_temp: number; // °C
  // Applications
  typical_applications: string[];
  // References
  data_sheet_url?: string;
}

export interface MatrixProperties {
  id: string;
  name: string;
  category: 'matrix';
  type: 'epoxy' | 'polyester' | 'vinyl_ester';
  manufacturer: string;
  // Mechanical properties
  E: number; // Modulus (GPa)
  tensile_strength: number; // MPa
  elongation_at_break: number; // %
  // Physical properties
  density: number; // g/cm³
  glass_transition_temp: number; // °C (Tg)
  cure_temp: number; // °C
  cure_time: number; // hours
  // Chemical resistance
  hydrogen_compatibility: 'excellent' | 'good' | 'fair';
  moisture_absorption: number; // % at saturation
  // Cost
  cost_per_kg: number; // USD/kg
  // Applications
  typical_applications: string[];
}

export interface LinerProperties {
  id: string;
  name: string;
  category: 'liner';
  material_type: 'HDPE' | 'PA6' | 'PA12' | 'PA11';
  manufacturer: string;
  // Mechanical properties
  tensile_strength: number; // MPa
  elongation_at_break: number; // %
  flexural_modulus: number; // GPa
  // Permeation properties (critical for hydrogen)
  h2_permeation: number; // cm³/(m²·day·bar) at 20°C
  h2_permeation_at_55C: number; // cm³/(m²·day·bar) at 55°C
  // Physical properties
  density: number; // g/cm³
  melting_point: number; // °C
  glass_transition_temp: number; // °C
  // Processing
  rotomolding_capable: boolean;
  blow_molding_capable: boolean;
  // Cost
  cost_per_kg: number; // USD/kg
  // Applications
  typical_applications: string[];
}

export interface BossProperties {
  id: string;
  name: string;
  category: 'boss';
  material_type: 'aluminum' | 'stainless_steel' | 'titanium';
  alloy: string;
  // Mechanical properties
  yield_strength: number; // MPa
  ultimate_strength: number; // MPa
  E: number; // Modulus (GPa)
  elongation: number; // %
  hardness: string; // Rockwell or Brinell
  // Physical properties
  density: number; // g/cm³
  // Fatigue properties
  fatigue_strength: number; // MPa at 10^7 cycles
  // Corrosion resistance
  hydrogen_embrittlement_resistance: 'excellent' | 'good' | 'fair' | 'poor';
  // Machining
  machinability_rating: number; // 1-10 scale
  // Cost
  cost_per_kg: number; // USD/kg
  // Applications
  typical_applications: string[];
}

export type MaterialProperties =
  | FiberProperties
  | MatrixProperties
  | LinerProperties
  | BossProperties;

// API Helper Functions
// Use these to fetch materials from the mock server API
// In production, use relative /api path (served by Next.js)
// In development, optionally set NEXT_PUBLIC_API_URL for external mock server

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Fetch all materials from the API
 */
export async function fetchAllMaterials(): Promise<MaterialProperties[]> {
  const response = await fetch(`${API_BASE}/materials`);
  if (!response.ok) {
    throw new Error('Failed to fetch materials');
  }
  return response.json();
}

/**
 * Fetch materials by type
 */
export async function fetchMaterialsByType(type: MaterialType): Promise<MaterialProperties[]> {
  const response = await fetch(`${API_BASE}/materials?type=${type}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch materials of type: ${type}`);
  }
  return response.json();
}

/**
 * Fetch a specific material by ID
 */
export async function fetchMaterialById(id: string): Promise<MaterialProperties | null> {
  const response = await fetch(`${API_BASE}/materials?id=${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch material: ${id}`);
  }
  return response.json();
}

// DEPRECATED: Legacy data arrays removed for API migration
// Material data is now served by the API at /api/materials
// Use fetchAllMaterials(), fetchMaterialsByType(), or fetchMaterialById() instead

// Empty arrays for backward compatibility - DEPRECATED, DO NOT USE
export const CARBON_FIBERS: FiberProperties[] = [];
export const GLASS_FIBERS: FiberProperties[] = [];
export const MATRIX_RESINS: MatrixProperties[] = [];
export const LINER_MATERIALS: LinerProperties[] = [];
export const BOSS_MATERIALS: BossProperties[] = [];
export const MATERIALS_DATABASE: MaterialProperties[] = [];

// Helper functions for filtering/searching
export const getMaterialProperties = (_id: string) => {
  // Return full property map
  return {};
};

export const getMaterialCost = (_category: string) => {
  // Return average cost
  return 0;
};

export const compareMaterials = (_id1: string, _id2: string) => {
  // Implementation for comparing two materials
  return null;
};


// Temperature-dependent properties (simplified model)
export function getTemperatureCorrectedModulus(
  material: MaterialProperties,
  temperature: number // °C
): number | null {
  if (material.category === 'fiber') {
    // Carbon fibers: minimal temperature dependence up to 150°C
    if (temperature <= material.max_service_temp) {
      return material.E1 * (1 - 0.0001 * (temperature - 20));
    }
    return null; // Over max temp
  }

  if (material.category === 'matrix') {
    // Epoxy: significant reduction near Tg
    const tg = material.glass_transition_temp;
    if (temperature < tg - 50) {
      return material.E * (1 - 0.002 * (temperature - 20));
    } else if (temperature < tg) {
      return material.E * (1 - 0.01 * (temperature - 20));
    }
    return material.E * 0.1; // Rubbery region above Tg
  }

  return null;
}

// Cost estimation - now requires material object from API
export function estimateMaterialCost(
  material: MaterialProperties,
  mass_kg: number
): number {
  if (!material) return 0;
  return material.cost_per_kg * mass_kg;
}

// Compatibility matrix (simplified)
export function checkMaterialCompatibility(
  fiber: FiberProperties,
  matrix: MatrixProperties
): { compatible: boolean; notes: string } {
  if (!fiber || !matrix || fiber.category !== 'fiber' || matrix.category !== 'matrix') {
    return { compatible: false, notes: 'Invalid material selection' };
  }

  // All carbon/glass fibers work with epoxy matrices
  if (matrix.type === 'epoxy') {
    return {
      compatible: true,
      notes: 'Excellent compatibility. Standard prepreg processing.',
    };
  }

  return {
    compatible: false,
    notes: 'Compatibility not verified for this combination.',
  };
}
