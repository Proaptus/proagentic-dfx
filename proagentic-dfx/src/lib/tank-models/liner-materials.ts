/**
 * Liner Material Visual Definitions
 *
 * Visual appearance properties for different liner and composite materials
 * used in hydrogen pressure vessels.
 */

export interface MaterialVisual {
  name: string;
  category: 'metal' | 'polymer' | 'composite' | 'protective';
  color: [number, number, number]; // RGB 0-1
  opacity: number;
  roughness: number; // 0 = mirror, 1 = matte
  metalness: number; // 0 = dielectric, 1 = metallic
  emissive?: [number, number, number]; // Optional glow
  texturePattern?: 'carbon-weave' | 'glass-weave' | 'brushed-metal' | 'smooth';
}

/**
 * METAL LINERS
 */

export const STEEL_LINER: MaterialVisual = {
  name: 'Steel (4130 Chromoly)',
  category: 'metal',
  color: [0.65, 0.67, 0.7], // Silvery gray
  opacity: 1.0,
  roughness: 0.3,
  metalness: 1.0,
  texturePattern: 'brushed-metal',
};

export const ALUMINUM_6061_LINER: MaterialVisual = {
  name: 'Aluminum 6061-T6',
  category: 'metal',
  color: [0.75, 0.78, 0.82], // Bright silvery
  opacity: 1.0,
  roughness: 0.25,
  metalness: 1.0,
  texturePattern: 'brushed-metal',
};

export const ALUMINUM_7075_LINER: MaterialVisual = {
  name: 'Aluminum 7075-T6',
  category: 'metal',
  color: [0.72, 0.75, 0.78], // Slightly darker than 6061
  opacity: 1.0,
  roughness: 0.3,
  metalness: 1.0,
  texturePattern: 'brushed-metal',
};

export const STAINLESS_STEEL_316L: MaterialVisual = {
  name: 'Stainless Steel 316L',
  category: 'metal',
  color: [0.8, 0.82, 0.85], // Bright, reflective
  opacity: 1.0,
  roughness: 0.2,
  metalness: 1.0,
  texturePattern: 'smooth',
};

/**
 * POLYMER LINERS
 */

export const HDPE_LINER: MaterialVisual = {
  name: 'HDPE (High-Density Polyethylene)',
  category: 'polymer',
  color: [0.612, 0.639, 0.686], // Light gray (natural HDPE)
  opacity: 0.6,
  roughness: 0.5,
  metalness: 0.0,
  texturePattern: 'smooth',
};

export const HDPE_BLACK_LINER: MaterialVisual = {
  name: 'HDPE (Carbon Black)',
  category: 'polymer',
  color: [0.15, 0.15, 0.15], // Near black
  opacity: 0.7,
  roughness: 0.4,
  metalness: 0.0,
  texturePattern: 'smooth',
};

export const PA6_LINER: MaterialVisual = {
  name: 'PA6 (Nylon 6)',
  category: 'polymer',
  color: [0.92, 0.91, 0.85], // Cream/beige
  opacity: 0.5,
  roughness: 0.6,
  metalness: 0.0,
  texturePattern: 'smooth',
};

export const PA66_LINER: MaterialVisual = {
  name: 'PA66 (Nylon 6,6)',
  category: 'polymer',
  color: [0.88, 0.87, 0.82], // Slightly darker cream
  opacity: 0.5,
  roughness: 0.6,
  metalness: 0.0,
  texturePattern: 'smooth',
};

/**
 * CARBON FIBER COMPOSITES
 */

export const CARBON_T700_EPOXY: MaterialVisual = {
  name: 'T700 Carbon Fiber / Epoxy',
  category: 'composite',
  color: [0.1, 0.1, 0.12], // Very dark gray (almost black)
  opacity: 0.95,
  roughness: 0.4,
  metalness: 0.1,
  texturePattern: 'carbon-weave',
};

export const CARBON_T800_EPOXY: MaterialVisual = {
  name: 'T800 Carbon Fiber / Epoxy',
  category: 'composite',
  color: [0.08, 0.08, 0.1], // Slightly darker than T700
  opacity: 0.95,
  roughness: 0.35,
  metalness: 0.15,
  texturePattern: 'carbon-weave',
};

export const CARBON_T1000_EPOXY: MaterialVisual = {
  name: 'T1000 Carbon Fiber / Epoxy',
  category: 'composite',
  color: [0.05, 0.05, 0.08], // Nearly black
  opacity: 0.98,
  roughness: 0.3,
  metalness: 0.2,
  texturePattern: 'carbon-weave',
};

export const CARBON_IM7_EPOXY: MaterialVisual = {
  name: 'IM7 Carbon Fiber / Epoxy',
  category: 'composite',
  color: [0.12, 0.12, 0.14],
  opacity: 0.95,
  roughness: 0.4,
  metalness: 0.1,
  texturePattern: 'carbon-weave',
};

/**
 * GLASS FIBER COMPOSITES
 */

export const GLASS_E_EPOXY: MaterialVisual = {
  name: 'E-Glass Fiber / Epoxy',
  category: 'composite',
  color: [0.85, 0.88, 0.82], // Pale yellowish-white
  opacity: 0.7,
  roughness: 0.6,
  metalness: 0.0,
  texturePattern: 'glass-weave',
};

export const GLASS_S_EPOXY: MaterialVisual = {
  name: 'S-Glass Fiber / Epoxy',
  category: 'composite',
  color: [0.9, 0.92, 0.88], // Slightly brighter than E-glass
  opacity: 0.75,
  roughness: 0.5,
  metalness: 0.0,
  texturePattern: 'glass-weave',
};

/**
 * ARAMID FIBER COMPOSITES
 */

export const ARAMID_KEVLAR_EPOXY: MaterialVisual = {
  name: 'Kevlar (Aramid) / Epoxy',
  category: 'composite',
  color: [0.95, 0.88, 0.35], // Golden yellow
  opacity: 0.8,
  roughness: 0.5,
  metalness: 0.0,
  texturePattern: 'carbon-weave',
};

/**
 * PROTECTIVE LAYERS
 */

export const GEL_COAT_CLEAR: MaterialVisual = {
  name: 'Clear Gel Coat',
  category: 'protective',
  color: [0.98, 0.98, 1.0], // Near white/transparent
  opacity: 0.3,
  roughness: 0.1,
  metalness: 0.0,
  texturePattern: 'smooth',
};

export const GEL_COAT_BLACK: MaterialVisual = {
  name: 'Black Gel Coat',
  category: 'protective',
  color: [0.05, 0.05, 0.05],
  opacity: 1.0,
  roughness: 0.2,
  metalness: 0.0,
  texturePattern: 'smooth',
};

export const UV_PROTECTION_LAYER: MaterialVisual = {
  name: 'UV Protection Layer',
  category: 'protective',
  color: [0.92, 0.94, 0.96], // Very light gray/white
  opacity: 0.4,
  roughness: 0.15,
  metalness: 0.0,
  texturePattern: 'smooth',
};

/**
 * PERMEATION BARRIERS (Type V)
 */

export const PERMEATION_BARRIER_POLYMER: MaterialVisual = {
  name: 'Permeation Barrier (Polymer Film)',
  category: 'polymer',
  color: [0.9, 0.9, 0.95], // Near white with slight blue tint
  opacity: 0.3,
  roughness: 0.05,
  metalness: 0.0,
  texturePattern: 'smooth',
};

/**
 * LAYER COLOR CODING (for visualization clarity)
 */

export const LAYER_COLOR_HOOP: MaterialVisual = {
  name: 'Hoop Layer (Visualization)',
  category: 'composite',
  color: [0.055, 0.647, 0.914], // Blue (#0EA5E9)
  opacity: 0.85,
  roughness: 0.4,
  metalness: 0.1,
  texturePattern: 'carbon-weave',
};

export const LAYER_COLOR_HELICAL: MaterialVisual = {
  name: 'Helical Layer (Visualization)',
  category: 'composite',
  color: [0.976, 0.451, 0.086], // Orange (#F97316)
  opacity: 0.85,
  roughness: 0.4,
  metalness: 0.1,
  texturePattern: 'carbon-weave',
};

/**
 * Material library organized by category
 */
export const MATERIAL_LIBRARY = {
  metal: {
    steel: STEEL_LINER,
    aluminum_6061: ALUMINUM_6061_LINER,
    aluminum_7075: ALUMINUM_7075_LINER,
    stainless_316l: STAINLESS_STEEL_316L,
  },
  polymer: {
    hdpe: HDPE_LINER,
    hdpe_black: HDPE_BLACK_LINER,
    pa6: PA6_LINER,
    pa66: PA66_LINER,
    permeation_barrier: PERMEATION_BARRIER_POLYMER,
  },
  composite_carbon: {
    t700: CARBON_T700_EPOXY,
    t800: CARBON_T800_EPOXY,
    t1000: CARBON_T1000_EPOXY,
    im7: CARBON_IM7_EPOXY,
  },
  composite_glass: {
    e_glass: GLASS_E_EPOXY,
    s_glass: GLASS_S_EPOXY,
  },
  composite_aramid: {
    kevlar: ARAMID_KEVLAR_EPOXY,
  },
  protective: {
    gel_coat_clear: GEL_COAT_CLEAR,
    gel_coat_black: GEL_COAT_BLACK,
    uv_protection: UV_PROTECTION_LAYER,
  },
  visualization: {
    hoop: LAYER_COLOR_HOOP,
    helical: LAYER_COLOR_HELICAL,
  },
};

/**
 * Get material visual by name
 */
export function getMaterialVisual(materialName: string): MaterialVisual {
  // Normalize name
  const normalized = materialName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // Search all categories
  for (const category of Object.values(MATERIAL_LIBRARY)) {
    for (const [key, material] of Object.entries(category)) {
      if (key === normalized || material.name.toLowerCase().includes(normalized)) {
        return material;
      }
    }
  }

  // Default to HDPE liner if not found
  return HDPE_LINER;
}

/**
 * Generate texture coordinates for weave patterns
 */
export function generateWeaveTextureCoords(
  positions: Float32Array,
  weaveScale: number = 50 // mm per repeat
): Float32Array {
  const uvs = new Float32Array((positions.length / 3) * 2);

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    // Cylindrical unwrap
    const u = (Math.atan2(z, x) / (Math.PI * 2) + 0.5) * weaveScale;
    const v = y / weaveScale;

    uvs[(i / 3) * 2] = u;
    uvs[(i / 3) * 2 + 1] = v;
  }

  return uvs;
}

/**
 * Apply material color to mesh vertices
 */
export function applyMaterialColor(
  vertexCount: number,
  material: MaterialVisual
): Float32Array {
  const colors = new Float32Array(vertexCount * 3);

  for (let i = 0; i < vertexCount; i++) {
    colors[i * 3] = material.color[0];
    colors[i * 3 + 1] = material.color[1];
    colors[i * 3 + 2] = material.color[2];
  }

  return colors;
}
