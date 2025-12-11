---
id: HOWTO-tank-models-quickstart
doc_type: howto
title: "Tank Models 3D Library - Quick Start Guide"
status: accepted
last_verified_at: 2025-12-11
owner: "@ProAgentic/frontend-team"
code_refs:
  - path: "src/lib/tank-models/index.ts"
  - path: "src/lib/tank-models/TankModel3D.tsx"
keywords: ["quickstart", "3d", "tank", "guide", "tutorial"]
---

# Tank Models 3D Library - Quick Start Guide

## 30-Second Quick Start

```tsx
import { TankModel3D, TankType, DomeProfileType } from '@/lib/tank-models';

export function MyTankViewer() {
  return (
    <div className="w-full h-[600px]">
      <TankModel3D
        tankType={TankType.TYPE_IV}
        domeProfile={DomeProfileType.ISOTENSOID}
        cylinderRadius={200}
        cylinderLength={800}
        autoRotate={true}
      />
    </div>
  );
}
```

That's it! You now have a fully interactive 3D hydrogen tank viewer.

---

## What You Get

- **Interactive 3D View**: Drag to rotate, scroll to zoom
- **Type IV Tank**: Polymer liner + carbon fiber wrap (700 bar standard)
- **Isotensoid Dome**: Optimal shape for filament winding
- **Auto-Rotate**: Continuous rotation for presentation

---

## 5-Minute Customization

### Change Tank Type

```tsx
// Type I: All-metal (cheapest, heaviest)
tankType={TankType.TYPE_I}

// Type III: Metal liner + composite (350-450 bar)
tankType={TankType.TYPE_III}

// Type V: Linerless composite (lightest, experimental)
tankType={TankType.TYPE_V}
```

### Change Dome Shape

```tsx
// Perfect hemisphere (optimal stress distribution)
domeProfile={DomeProfileType.HEMISPHERICAL}

// Elliptical (adjustable depth)
domeProfile={DomeProfileType.ELLIPTICAL}

// Torispherical (ASME standard for industrial vessels)
domeProfile={DomeProfileType.TORISPHERICAL}
```

### Add Boss Configuration

```tsx
bossConfig={{
  type: BossType.FLANGED,
  innerDiameter: 25,
  outerDiameter: 50,
  length: 70,
}}
```

### Enable Cross-Section View

```tsx
showCrossSection={true}
```

---

## 10-Minute Advanced Usage

### Interactive Tank Type Selector

```tsx
import { useState } from 'react';
import {
  TankModel3D,
  TankType,
  DomeProfileType,
  getTankTypeSpec,
} from '@/lib/tank-models';

export function TankSelector() {
  const [type, setType] = useState<TankType>(TankType.TYPE_IV);
  const spec = getTankTypeSpec(type);

  return (
    <div>
      <div className="mb-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TankType)}
          className="px-4 py-2 border rounded"
        >
          <option value={TankType.TYPE_I}>Type I - All Metal</option>
          <option value={TankType.TYPE_II}>Type II - Hoop Wrap</option>
          <option value={TankType.TYPE_III}>Type III - Full Wrap</option>
          <option value={TankType.TYPE_IV}>Type IV - Polymer Liner</option>
          <option value={TankType.TYPE_V}>Type V - Linerless</option>
        </select>

        <div className="mt-2 text-sm text-gray-600">
          Pressure: {spec.typicalPressure.max} bar |
          Weight: {spec.weightRatio.toFixed(1)}× Type IV
        </div>
      </div>

      <div className="h-[600px]">
        <TankModel3D
          tankType={type}
          domeProfile={DomeProfileType.ISOTENSOID}
          cylinderRadius={200}
          cylinderLength={800}
        />
      </div>
    </div>
  );
}
```

---

## Common Use Cases

### 1. Compare All Tank Types

```tsx
import { AllTankTypesGrid } from '@/lib/tank-models/example';

export function Comparison() {
  return <AllTankTypesGrid />;
}
```

### 2. Adjustable Parameters

```tsx
import { InteractiveParametersExample } from '@/lib/tank-models/example';

export function ParameterTuner() {
  return <InteractiveParametersExample />;
}
```

### 3. Educational Demo

```tsx
import { TankTypeComparison } from '@/lib/tank-models/example';

export function EducationalDemo() {
  return <TankTypeComparison />;
}
```

---

## File Locations

```
Working Directory:
C:\Users\chine\Projects\proagentic-dfx\proagentic-dfx

Library Files:
src/lib/tank-models/
├── index.ts              # Import from here
├── tank-types.ts         # 5 tank type definitions
├── dome-profiles.ts      # 5 dome shape generators
├── boss-components.ts    # 4 boss types
├── liner-materials.ts    # 20+ material definitions
├── TankModel3D.tsx       # Main React component
├── example.tsx           # 6 complete examples
├── README.md             # Full documentation
├── QUICKSTART.md         # This file
└── IMPLEMENTATION_SUMMARY.md
```

---

## Import Reference

### All-in-One Import

```tsx
import {
  // Component
  TankModel3D,

  // Enums
  TankType,
  DomeProfileType,
  BossType,

  // Functions
  getTankTypeSpec,
  calculateTankMass,
  generateIsotensoidProfile,
  getMaterialVisual,
} from '@/lib/tank-models';
```

### Specific Imports

```tsx
// Tank specifications
import { TYPE_IV_SPEC, TYPE_V_SPEC } from '@/lib/tank-models';

// Materials
import { CARBON_T700_EPOXY, HDPE_LINER } from '@/lib/tank-models';

// Dome profiles
import { generateHemisphericalProfile } from '@/lib/tank-models';

// Boss geometry
import { createFlangedBoss } from '@/lib/tank-models';
```

---

## Props Quick Reference

### TankModel3DProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `tankType` | `TankType` | Yes | - | Tank type (I-V) |
| `domeProfile` | `DomeProfileType` | Yes | - | Dome shape |
| `cylinderRadius` | `number` | Yes | - | Radius in mm |
| `cylinderLength` | `number` | Yes | - | Length in mm |
| `bossConfig` | `object` | No | Standard boss | Boss configuration |
| `showCrossSection` | `boolean` | No | `false` | Enable cross-section view |
| `autoRotate` | `boolean` | No | `false` | Continuous rotation |
| `highlightRegion` | `string \| null` | No | `null` | Highlight specific region |
| `layerOpacity` | `number` | No | `0.85` | Layer transparency (0-1) |
| `onRegionClick` | `function` | No | - | Click handler |

---

## Tank Type Reference

| Type | Description | Pressure | Weight vs Type IV | Cost vs Type IV |
|------|-------------|----------|-------------------|-----------------|
| **Type I** | All-metal | 150-250 bar | 3.5× | 0.3× |
| **Type II** | Metal + hoop wrap | 200-300 bar | 2.8× | 0.5× |
| **Type III** | Metal + full wrap | 350-450 bar | 1.6× | 0.75× |
| **Type IV** | Polymer + full wrap | 350-700 bar | 1.0× (baseline) | 1.0× |
| **Type V** | Linerless composite | 350-700 bar | 0.75× | 1.8× |

---

## Dome Profile Reference

| Profile | Best For | Characteristics |
|---------|----------|-----------------|
| **Hemispherical** | All-metal tanks | Optimal stress, large depth |
| **Isotensoid** | Composite tanks | Optimal for winding, netting theory |
| **Elliptical** | Space-constrained | Adjustable aspect ratio |
| **Torispherical** | Industrial vessels | ASME standard, easy manufacturing |
| **Geodesic** | Experimental | High strength, complex geometry |

---

## Boss Type Reference

| Type | Best For | Features |
|------|----------|----------|
| **Standard** | Basic connections | Simple cylinder |
| **Integrated** | Rotomolded liners | Integral to liner |
| **Flanged** | Service ports | Bolted connection |
| **Multi-Port** | Advanced manifolds | Multiple offset ports |

---

## Need Help?

- **Full Documentation**: See [README.md](./README.md)
- **Code Examples**: See [example.tsx](./example.tsx)
- **Implementation Details**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## TypeScript Support

Full IntelliSense support:

```tsx
import { TankModel3D } from '@/lib/tank-models';

// Type-safe props
<TankModel3D
  tankType={} // Autocomplete shows: TYPE_I, TYPE_II, TYPE_III, TYPE_IV, TYPE_V
  domeProfile={} // Autocomplete shows: HEMISPHERICAL, ISOTENSOID, etc.
  cylinderRadius={200} // Hover shows: "number (mm)"
/>
```

---

## Performance Tips

1. **Default segments (50-64) are optimal** - Don't increase unless zooming very close
2. **Layer opacity 0.85 is sweet spot** - Lower = faster, higher = slower
3. **Cross-section has GPU cost** - Disable if not needed
4. **Auto-rotate is efficient** - <1% CPU overhead

---

## Ready to Start?

Copy this minimal example and start customizing:

```tsx
import { TankModel3D, TankType, DomeProfileType } from '@/lib/tank-models';

export default function MyPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">My H2 Tank</h1>
      <div className="h-[600px] border rounded-lg">
        <TankModel3D
          tankType={TankType.TYPE_IV}
          domeProfile={DomeProfileType.ISOTENSOID}
          cylinderRadius={200}
          cylinderLength={800}
          autoRotate={true}
        />
      </div>
    </div>
  );
}
```

You're all set! Happy tank modeling!
