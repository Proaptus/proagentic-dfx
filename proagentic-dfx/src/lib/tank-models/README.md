---
id: REF-tank-models-3d
doc_type: reference
title: "Tank Models 3D Library"
status: accepted
last_verified_at: 2025-12-11
owner: "@ProAgentic/frontend-team"
code_refs:
  - path: "src/lib/tank-models/index.ts"
  - path: "src/lib/tank-models/tank-types.ts"
  - path: "src/lib/tank-models/dome-profiles.ts"
  - path: "src/lib/tank-models/boss-components.ts"
  - path: "src/lib/tank-models/liner-materials.ts"
test_refs:
  - path: "src/__tests__/lib/tank-geometry.test.ts"
keywords: ["3d", "tank", "visualization", "threejs", "geometry", "type-iv"]
---

# Tank Models 3D Library

Comprehensive 3D modeling library for hydrogen pressure vessel visualization in the H2 Tank Designer.

## Features

- **5 Tank Types** (Type I through Type V)
- **5 Dome Profiles** (Hemispherical, Isotensoid, Geodesic, Elliptical, Torispherical)
- **4 Boss Types** (Standard, Integrated, Flanged, Multi-Port)
- **Material Library** (20+ material definitions with visual properties)
- **WebGL Rendering** (optimized procedural geometry generation)

## Quick Start

```tsx
import { TankModel3D, TankType, DomeProfileType, BossType } from '@/lib/tank-models';

function MyComponent() {
  return (
    <TankModel3D
      tankType={TankType.TYPE_IV}
      domeProfile={DomeProfileType.ISOTENSOID}
      cylinderRadius={200}
      cylinderLength={800}
      bossConfig={{
        type: BossType.STANDARD_CYLINDRICAL,
        innerDiameter: 20,
        outerDiameter: 40,
        length: 60,
      }}
      showCrossSection={false}
      autoRotate={true}
      layerOpacity={0.85}
    />
  );
}
```

## Tank Types

### Type I - All Metal
- **Material**: Seamless steel or aluminum
- **Pressure**: 150-250 bar
- **Use Case**: Low-cost industrial storage
- **Weight**: Heaviest (3.5× Type IV)

```tsx
import { TankType, getTankTypeSpec } from '@/lib/tank-models';

const spec = getTankTypeSpec(TankType.TYPE_I);
console.log(spec.typicalPressure); // { min: 150, max: 250 }
```

### Type II - Metal Liner + Hoop Wrap
- **Material**: Metal liner + composite hoop wrapping
- **Pressure**: 200-300 bar
- **Use Case**: Intermediate weight/cost
- **Weight**: 2.8× Type IV

### Type III - Metal Liner + Full Wrap
- **Material**: Thin metal liner + full composite wrap
- **Pressure**: 350-450 bar
- **Use Case**: Heavy-duty vehicles (CNG, H2)
- **Weight**: 1.6× Type IV

### Type IV - Polymer Liner + Full Wrap
- **Material**: HDPE/PA liner + carbon fiber wrap
- **Pressure**: 350-700 bar
- **Use Case**: Modern FCEVs (industry standard)
- **Weight**: Baseline (1.0×)

```tsx
<TankModel3D
  tankType={TankType.TYPE_IV}
  domeProfile={DomeProfileType.ISOTENSOID}
  cylinderRadius={200}
  cylinderLength={800}
/>
```

### Type V - Linerless Composite
- **Material**: All-composite with permeation barrier
- **Pressure**: 350-700 bar
- **Use Case**: Advanced/experimental (weight-critical)
- **Weight**: Lightest (0.75× Type IV)

## Dome Profiles

### Hemispherical
Perfect half-sphere. Optimal stress distribution but large depth.

```tsx
import { DomeProfileType, generateHemisphericalProfile } from '@/lib/tank-models';

const profile = generateHemisphericalProfile({
  cylinderRadius: 200,
  bossRadius: 15,
  numPoints: 50,
});
```

### Isotensoid
Netting theory optimal shape: `r = R₀ × sin(α₀) / sin(α)`

Best for filament winding (Type III/IV tanks).

```tsx
const profile = generateIsotensoidProfile({
  cylinderRadius: 200,
  bossRadius: 15,
  windingAngle: 54.74, // Geodesic angle
  numPoints: 50,
});
```

### Geodesic
Icosahedron-based tessellation for research tanks.

### Elliptical
Semi-ellipsoid with adjustable aspect ratio.

```tsx
const profile = generateEllipticalProfile({
  cylinderRadius: 200,
  bossRadius: 15,
  aspectRatio: 0.6, // depth/radius
});
```

### Torispherical
ASME standard flanged & dished head (industrial vessels).

```tsx
const profile = generateTorisphericalProfile({
  cylinderRadius: 200,
  bossRadius: 15,
  crownRatio: 1.0,
  knuckleRatio: 0.06,
});
```

## Boss Components

### Standard Cylindrical
Simple cylinder protruding from dome apex.

```tsx
import { BossType, createStandardCylindricalBoss } from '@/lib/tank-models';

const boss = createStandardCylindricalBoss(
  20,  // innerDiameter (mm)
  40,  // outerDiameter (mm)
  60   // length (mm)
);
```

### Integrated
Integral part of liner (no separate component).

```tsx
const boss = createIntegratedBoss(20, 40, 60, 15); // taperAngle = 15°
```

### Flanged
Boss with mounting flange for bolted connections.

```tsx
const boss = createFlangedBoss(
  20,  // innerDiameter
  40,  // outerDiameter
  60,  // length
  80,  // flangeDiameter
  10,  // flangeThickness
  70,  // boltCircleDiameter
  6    // numberOfBolts
);
```

### Multi-Port
Multiple offset ports for manifolded connections.

```tsx
const boss = createMultiPortBoss(
  { id: 20, od: 40, length: 80 }, // main port
  [ // auxiliary ports
    { id: 10, od: 20, length: 40, angle: 45, radialOffset: 25 },
    { id: 10, od: 20, length: 40, angle: 135, radialOffset: 25 },
  ]
);
```

## Material Library

### Metals
```tsx
import { STEEL_LINER, ALUMINUM_6061_LINER, STAINLESS_STEEL_316L } from '@/lib/tank-models';
```

### Polymers
```tsx
import { HDPE_LINER, HDPE_BLACK_LINER, PA6_LINER, PA66_LINER } from '@/lib/tank-models';
```

### Carbon Fiber Composites
```tsx
import {
  CARBON_T700_EPOXY,
  CARBON_T800_EPOXY,
  CARBON_T1000_EPOXY,
  CARBON_IM7_EPOXY,
} from '@/lib/tank-models';
```

### Glass Fiber Composites
```tsx
import { GLASS_E_EPOXY, GLASS_S_EPOXY } from '@/lib/tank-models';
```

### Material Properties
Each material includes:
- `color: [r, g, b]` - RGB values (0-1)
- `opacity: number` - Transparency (0-1)
- `roughness: number` - Surface roughness (0 = mirror, 1 = matte)
- `metalness: number` - Metallic property (0 = dielectric, 1 = metallic)
- `texturePattern` - Weave pattern hint

```tsx
import { getMaterialVisual } from '@/lib/tank-models';

const material = getMaterialVisual('T700 Carbon Fiber');
console.log(material.color); // [0.1, 0.1, 0.12]
console.log(material.roughness); // 0.4
```

## Advanced Usage

### Custom Tank Configuration

```tsx
import {
  TankModel3D,
  TankType,
  DomeProfileType,
  BossType,
  getTankTypeSpec,
  calculateTankMass,
} from '@/lib/tank-models';

function CustomTankViewer() {
  const cylinderRadius = 225; // mm
  const cylinderLength = 900; // mm

  // Calculate tank mass
  const mass = calculateTankMass(
    TankType.TYPE_IV,
    cylinderRadius,
    cylinderLength,
    cylinderRadius * 0.6 // dome depth estimate
  );

  const handleRegionClick = (region: string, point: { x: number; y: number; z: number }) => {
    console.log(`Clicked ${region} at:`, point);
  };

  return (
    <div>
      <div className="mb-4">
        <h3>Type IV Tank - {mass.toFixed(2)} kg</h3>
      </div>
      <TankModel3D
        tankType={TankType.TYPE_IV}
        domeProfile={DomeProfileType.ISOTENSOID}
        cylinderRadius={cylinderRadius}
        cylinderLength={cylinderLength}
        bossConfig={{
          type: BossType.FLANGED,
          innerDiameter: 25,
          outerDiameter: 50,
          length: 70,
        }}
        showCrossSection={true}
        highlightRegion="dome"
        layerOpacity={0.8}
        onRegionClick={handleRegionClick}
      />
    </div>
  );
}
```

### Procedural Mesh Generation

For advanced use cases, you can generate meshes directly:

```tsx
import {
  generateIsotensoidProfile,
  createStandardCylindricalBoss,
  applyMaterialColor,
} from '@/lib/tank-models';

// Generate custom dome
const dome = generateIsotensoidProfile({
  cylinderRadius: 250,
  bossRadius: 20,
  windingAngle: 54.74,
  numPoints: 100, // High resolution
});

console.log(dome.volume); // mm³
console.log(dome.surfaceArea); // mm²

// Generate boss mesh
const boss = createStandardCylindricalBoss(25, 50, 80, 64); // 64 segments

console.log(boss.positions.length / 3); // vertex count
console.log(boss.indices.length / 3); // triangle count
```

## Integration with Existing CAD Viewer

The library integrates seamlessly with the existing `CADTankViewer`:

```tsx
import { CADTankViewer } from '@/components/cad/CADTankViewer';
import { TankType, getTankTypeSpec } from '@/lib/tank-models';
import type { DesignGeometry } from '@/lib/types';

function IntegratedViewer() {
  const typeSpec = getTankTypeSpec(TankType.TYPE_IV);

  const geometry: DesignGeometry = {
    dimensions: {
      inner_radius_mm: 200,
      outer_radius_mm: 230,
      cylinder_length_mm: 800,
      total_length_mm: 1200,
    },
    dome: {
      type: 'isotensoid',
      parameters: {
        alpha_0_deg: 54.74,
        depth_mm: 120,
        boss_id_mm: 20,
        boss_od_mm: 40,
      },
    },
    layup: {
      liner_thickness_mm: 3.2,
      layers: typeSpec.materialLayers.map((layer, idx) => ({
        type: idx % 2 === 0 ? 'hoop' : 'helical',
        thickness_mm: layer.thickness,
        angle_deg: idx % 2 === 0 ? 90 : 54.74,
        fiber_type: 'T700',
        resin_type: 'Epoxy',
      })),
    },
  };

  return (
    <CADTankViewer
      geometry={geometry}
      showStress={false}
      showWireframe={false}
      showCrossSection={false}
      autoRotate={true}
    />
  );
}
```

## API Reference

### Components
- `TankModel3D` - Main 3D rendering component

### Enums
- `TankType` - Tank type enumeration (TYPE_I - TYPE_V)
- `DomeProfileType` - Dome shape types
- `BossType` - Boss/port types

### Functions
- `getTankTypeSpec(type)` - Get tank specifications
- `calculateTankMass(type, radius, length, domeDepth)` - Calculate mass
- `generateDomeProfile(type, params)` - Generate dome geometry
- `getBossGeometry(type, params)` - Generate boss geometry
- `getMaterialVisual(name)` - Get material visual properties

## Performance Notes

- **Mesh Resolution**: Default 50-64 segments provides good quality/performance balance
- **Layer Count**: Type V tanks (4 layers) render slower than Type I (1 layer)
- **Cross-Section**: Enabling cross-section adds GPU overhead (clipping planes)
- **Auto-Rotate**: Minimal performance impact (<1% CPU)

## File Structure

```
src/lib/tank-models/
├── index.ts              # Main exports
├── README.md             # This file
├── tank-types.ts         # Tank type definitions (Type I-V)
├── dome-profiles.ts      # Dome shape generators
├── boss-components.ts    # Boss/port geometries
├── liner-materials.ts    # Material visual definitions
└── TankModel3D.tsx       # React 3D component
```

## License

Part of ProAgentic DfX - H2 Tank Designer module.
