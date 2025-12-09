/**
 * Tank Models Library
 *
 * Comprehensive 3D hydrogen tank component library for visualization.
 * Exports tank type definitions, dome profiles, boss geometries, and materials.
 */

// Tank Types
export {
  TankType,
  TYPE_I_SPEC,
  TYPE_II_SPEC,
  TYPE_III_SPEC,
  TYPE_IV_SPEC,
  TYPE_V_SPEC,
  getTankTypeSpec,
  calculateTankMass,
  getCostMultiplier,
  type TankTypeSpec,
  type MaterialLayer,
} from './tank-types';

// Dome Profiles
export {
  DomeProfileType,
  generateHemisphericalProfile,
  generateIsotensoidProfile,
  generateGeodesicProfile,
  generateEllipticalProfile,
  generateTorisphericalProfile,
  generateDomeProfile,
  type DomeProfile,
  type DomeProfileParams,
} from './dome-profiles';

// Boss Components
export {
  BossType,
  createStandardCylindricalBoss,
  createIntegratedBoss,
  createFlangedBoss,
  createMultiPortBoss,
  getBossGeometry,
  type BossGeometry,
  type BossMeshData,
} from './boss-components';

// Liner Materials
export {
  MATERIAL_LIBRARY,
  // Metals
  STEEL_LINER,
  ALUMINUM_6061_LINER,
  ALUMINUM_7075_LINER,
  STAINLESS_STEEL_316L,
  // Polymers
  HDPE_LINER,
  HDPE_BLACK_LINER,
  PA6_LINER,
  PA66_LINER,
  // Carbon composites
  CARBON_T700_EPOXY,
  CARBON_T800_EPOXY,
  CARBON_T1000_EPOXY,
  CARBON_IM7_EPOXY,
  // Glass composites
  GLASS_E_EPOXY,
  GLASS_S_EPOXY,
  // Aramid
  ARAMID_KEVLAR_EPOXY,
  // Protective
  GEL_COAT_CLEAR,
  GEL_COAT_BLACK,
  UV_PROTECTION_LAYER,
  // Permeation barriers
  PERMEATION_BARRIER_POLYMER,
  // Visualization colors
  LAYER_COLOR_HOOP,
  LAYER_COLOR_HELICAL,
  // Functions
  getMaterialVisual,
  generateWeaveTextureCoords,
  applyMaterialColor,
  type MaterialVisual,
} from './liner-materials';

// Main 3D Component
export {
  TankModel3D,
  type TankModel3DProps,
} from './TankModel3D';
