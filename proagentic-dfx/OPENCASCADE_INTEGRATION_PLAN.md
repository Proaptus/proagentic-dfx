# OpenCascade.js CAD Integration Plan

## Executive Summary

**Problem**: Current 3D viewer uses Three.js primitives (LatheGeometry, simple meshes). This is **not acceptable** for a CAD application. We need proper B-rep solid modeling with parametric geometry, STEP export, and professional CAD capabilities.

**Solution**: Integrate OpenCascade.js (OCCT WebAssembly port) to replace Three.js geometry generation with true CAD kernel operations.

## Current State Analysis

### Existing 3D Viewer (`src/components/three/TankModel.tsx`)

**What it does**:
- ✅ Isotensoid dome profile calculation (good math)
- ✅ Layer-by-layer visualization
- ✅ Boss geometry positioning
- ✅ Fiber winding path visualization

**Critical Problems**:
- ❌ Uses `THREE.LatheGeometry` - simple mesh primitives, NOT CAD solids
- ❌ No B-rep topology - just triangulated meshes
- ❌ Cannot export to STEP format (required for engineering workflows)
- ❌ No parametric constraints or design intent
- ❌ No proper solid boolean operations

### Current Tech Stack
- **Frontend**: Next.js 16.0.7 + React 19.2.0 + TypeScript
- **3D**: `@react-three/fiber` 9.4.2 + `@react-three/drei` 10.7.7
- **Geometry**: Three.js 0.181.2 (mesh-only, no CAD)

## OpenCascade.js Overview

### What is OpenCascade.js?

- **Port** of OpenCascade Technology (OCCT) to JavaScript/WebAssembly
- **Emscripten** compilation of professional CAD kernel
- **B-rep modeling**: Boundary representation with proper topology
- **STEP/IGES** export: Industry-standard CAD file formats
- **Near-native** performance via WebAssembly

### Package Information

```bash
# Main package (LGPL-2.1)
npm: opencascade.js@1.1.1
Size: 66.7 MB unpacked
Last updated: Over 1 year ago (2020-09-27)

# Alternative: Replicad (MIT, more recent)
npm: replicad@0.20.4
npm: replicad-opencascadejs@0.20.2 (custom OCC build)
Size: 31.2 MB unpacked
Last updated: 1 week ago
```

**Recommendation**: Use **opencascade.js 1.1.1** (stable, proven) OR consider **replicad** (modern API wrapper, MIT license, actively maintained).

## Architecture Plan

### Phase 1: Setup & Loading (Week 1)

**Files to Create**:

1. **`src/lib/cad/opencascade-loader.ts`** ✅ CREATED
   - Singleton WASM loader
   - Next.js SSR-safe (client-only dynamic import)
   - TypeScript types for OCC API
   - Caching and error handling

2. **`src/lib/cad/tank-geometry.ts`** ✅ CREATED
   - B-rep solid generation functions
   - Parametric tank model builder
   - Isotensoid dome with proper revolution
   - Boss/valve geometry
   - STEP export function

3. **`next.config.ts`** (UPDATE REQUIRED)
   - Webpack 5 configuration for WASM
   - Fallback settings for Node.js modules
   - WASM file loading

**Next.js Configuration Required**:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Don't bundle these on the server
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        perf_hooks: false,
        os: false,
        worker_threads: false,
        crypto: false,
        stream: false,
      };
    }

    // Handle .wasm files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
};

export default nextConfig;
```

### Phase 2: CAD Geometry Generation (Week 2)

**Replace Three.js Geometry with B-rep Solids**:

```typescript
// OLD: Three.js LatheGeometry
const points = generateFullProfile(radiusOffset);
const geometry = new THREE.LatheGeometry(points, 64);

// NEW: OpenCascade B-rep revolution
const oc = await loadOpenCascade();
const dome = createIsotensoidDome(oc, radius, alpha0, domeHeight);
const cylinder = createCylinder(oc, radius, length);
const tank = fuseSolids(oc, [dome, cylinder, topDome]);
```

**Key Operations**:

1. **Isotensoid Dome** (REQ-212):
   - Generate profile curve from isotensoid equation
   - Create wire from curve points
   - Revolve around Z-axis using `BRepPrimAPI_MakeRevol`
   - Result: True geodesic dome (NOT hemisphere)

2. **Cylinder** (REQ-211):
   - Use `BRepPrimAPI_MakeCylinder` for center section
   - Exact dimensions, parametric constraints

3. **Boolean Operations**:
   - `BRepAlgoAPI_Fuse` to combine cylinder + domes
   - `BRepAlgoAPI_Cut` to create boss holes
   - Single unified solid with proper topology

4. **Composite Layers** (REQ-213):
   - Generate base liner solid
   - Use offset operations for each layer
   - Thickness-based solid shells

### Phase 3: Mesh Extraction for Visualization (Week 2-3)

**Bridge CAD → WebGL**:

```typescript
// Generate B-rep solid (CAD)
const tankSolid = createTankSolid(oc, dimensions);

// Mesh the solid for rendering (WebGL)
new oc.BRepMesh_IncrementalMesh(tankSolid, 0.5, false, 0.5, true);

// Extract triangulation data
const meshData = extractTriangulation(tankSolid);

// Create Three.js BufferGeometry from mesh
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(meshData.vertices, 3));
geometry.setAttribute('normal', new THREE.Float32BufferAttribute(meshData.normals, 3));
geometry.setIndex(meshData.indices);
```

**Challenge**: Extracting mesh data from `TopoDS_Shape` requires:
- Iterating over faces (`TopExp_Explorer`)
- Getting face triangulation (`BRep_Tool::Triangulation`)
- Converting OCC data structures to TypedArrays

### Phase 4: STEP Export (Week 3)

**REQ-215: Export to STEP format**:

```typescript
export async function exportTankToSTEP(
  oc: OpenCascadeInstance,
  tankSolid: any,
  filename: string = 'h2_tank.step'
): Promise<Blob> {
  const writer = new oc.STEPControl_Writer();

  // Transfer B-rep solid to STEP model
  writer.Transfer(
    tankSolid,
    oc.STEPControl_StepModelType.STEPControl_ManifoldSolidBrep,
    true
  );

  // Write to Emscripten virtual filesystem
  writer.Write(filename);

  // Read from virtual FS and create Blob
  const stepContent = FS.readFile(filename, { encoding: 'utf8' });
  return new Blob([stepContent], { type: 'application/step' });
}
```

### Phase 5: UI Integration (Week 4)

**Update `ViewerScreen.tsx`**:
- Add "Export STEP" button
- Implement CAD model regeneration on parameter changes
- Show B-rep solid instead of mesh primitives
- Maintain layer visibility controls

**Update `TankModel.tsx`**:
- Replace `useMemo` geometry with `useEffect` CAD generation
- Handle async WASM loading
- Mesh B-rep solids for Three.js rendering
- Keep stress visualization working

## Implementation Steps

### Step 1: Install Dependencies

```bash
cd h2-tank-frontend
npm install opencascade.js
npm install --save-dev @types/emscripten  # For FS types
```

**Alternative** (if choosing Replicad):
```bash
npm install replicad replicad-opencascadejs
```

### Step 2: Update Next.js Config

**File**: `next.config.ts`

Add webpack configuration for WASM loading (see Phase 1 above).

### Step 3: Implement Loader

**File**: `src/lib/cad/opencascade-loader.ts` ✅ DONE

- Singleton pattern
- Client-side only loading
- Error handling
- TypeScript types

### Step 4: Implement Geometry Functions

**File**: `src/lib/cad/tank-geometry.ts` ✅ DONE (skeleton)

**TODO**:
- Complete `createIsotensoidDome()` wire building
- Implement `meshBRepSolid()` triangulation extraction
- Complete `exportToSTEP()` with virtual FS access
- Add layer offset operations

### Step 5: Create CAD Viewer Component

**File**: `src/components/three/CADTankModel.tsx` (NEW)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { loadOpenCascade } from '@/lib/cad/opencascade-loader';
import { createTankLinerSolid, meshBRepSolid } from '@/lib/cad/tank-geometry';
import * as THREE from 'three';

export function CADTankModel({ dimensions }: Props) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Load OpenCascade WASM
      const oc = await loadOpenCascade();

      // Generate B-rep solid
      const solid = createTankLinerSolid(oc, dimensions);

      // Mesh for visualization
      const meshData = meshBRepSolid(oc, solid, 0.5);

      if (mounted) {
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(meshData.vertices, 3));
        geom.setAttribute('normal', new THREE.Float32BufferAttribute(meshData.normals, 3));
        geom.setIndex(meshData.indices);
        setGeometry(geom);
      }
    })();

    return () => { mounted = false; };
  }, [dimensions]);

  if (!geometry) {
    return <mesh><boxGeometry args={[0.1, 0.1, 0.1]} /></mesh>;
  }

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#9CA3AF" />
    </mesh>
  );
}
```

### Step 6: Update ViewerScreen

**File**: `src/components/screens/ViewerScreen.tsx`

Add STEP export button:

```typescript
<Button onClick={handleExportSTEP}>
  Export STEP <Download className="ml-2" size={16} />
</Button>
```

Implement handler:

```typescript
const handleExportSTEP = async () => {
  const oc = await loadOpenCascade();
  const solid = createTankLinerSolid(oc, dimensions);
  const blob = await exportToSTEP(oc, solid, 'h2_tank.step');

  // Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'h2_tank.step';
  a.click();
  URL.revokeObjectURL(url);
};
```

## Requirements Coverage

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **REQ-211**: Parametric tank solids | 🟡 In Progress | `createTankLinerSolid()` |
| **REQ-212**: Isotensoid dome B-rep | 🟡 In Progress | `createIsotensoidDome()` |
| **REQ-213**: Composite layer solids | 🟡 Planned | `createCompositeLayer()` |
| **REQ-214**: Boss geometry | 🟡 In Progress | `createBossGeometry()` |
| **REQ-215**: STEP export | 🟡 In Progress | `exportToSTEP()` |

## Performance Considerations

### WASM File Size
- **opencascade.js**: 66.7 MB unpacked
- **Solution**: Host WASM files on CDN, use lazy loading
- **Alternative**: Custom OCC build with only needed modules (~20-30 MB)

### Loading Time
- First load: ~2-3 seconds (WASM download + init)
- **Solution**: Show loading indicator, cache in browser
- Subsequent loads: Instant (cached instance)

### Memory Usage
- CAD kernel: ~100-200 MB RAM
- Each solid: ~1-10 MB depending on complexity
- **Solution**: Dispose unused solids, limit concurrent operations

### Mesh Generation
- `BRepMesh_IncrementalMesh`: ~50-200ms for tank
- **Solution**: Generate once, cache geometry
- Update only on parameter change

## Blocking Issues & Concerns

### 1. ❌ WASM Loading in Next.js
**Issue**: Webpack 5 requires specific config for WASM

**Solution**:
```typescript
config.experiments = {
  asyncWebAssembly: true,
};
```

### 2. ❌ Mesh Extraction Complexity
**Issue**: `TopoDS_Shape` → Triangle mesh requires OCC API knowledge

**Solution**: Use `TopExp_Explorer` to iterate faces, extract triangulation
- Reference: OpenCascade.js examples repository
- Fallback: Use simpler visualization initially

### 3. ❌ Virtual Filesystem for STEP Export
**Issue**: Emscripten FS object access

**Solution**:
```typescript
import type { FS } from 'emscripten';
declare global {
  var FS: typeof FS;
}
```

### 4. 🟡 License Compatibility
**Issue**: opencascade.js is LGPL-2.1 (copyleft)

**Solutions**:
- LGPL allows dynamic linking (WASM = separate module) ✅
- Alternative: Use **replicad** (MIT license) if concerned
- Consult legal team for commercial use

### 5. 🟡 Type Definitions
**Issue**: opencascade.js types are incomplete/outdated

**Solution**:
- Use `@sridhar-mani/opencascade-types` package
- Extend types as needed in `opencascade-loader.ts`

## Alternative: Replicad

If OpenCascade.js proves too complex, consider **Replicad**:

**Pros**:
- ✅ Cleaner API (wrapper around OCC)
- ✅ MIT license
- ✅ Active maintenance (updated 1 week ago)
- ✅ Better TypeScript support
- ✅ Smaller bundle (31 MB vs 67 MB)

**Cons**:
- ❌ Another abstraction layer
- ❌ Less direct control over OCC
- ❌ Fewer examples

**Example**:
```typescript
import { Sketcher, Drawing } from 'replicad';

const sketch = new Sketcher('XY')
  .vLine(10)
  .hLine(5)
  .close();

const solid = sketch.extrude(20);
```

## Next Steps

1. **Decision Point**: opencascade.js vs replicad
   - Recommend: **Start with opencascade.js** (more proven, better for learning)
   - Fallback: Switch to replicad if API too complex

2. **Week 1 Tasks**:
   - [ ] Update `next.config.ts` with webpack config
   - [ ] Install `opencascade.js` package
   - [ ] Test WASM loading in development
   - [ ] Verify loader singleton works

3. **Week 2 Tasks**:
   - [ ] Implement isotensoid dome generation
   - [ ] Complete B-rep solid creation
   - [ ] Extract mesh from TopoDS_Shape
   - [ ] Render in Three.js viewer

4. **Week 3 Tasks**:
   - [ ] Implement STEP export
   - [ ] Test with FreeCAD/SolidWorks import
   - [ ] Add composite layer offset operations
   - [ ] Performance optimization

5. **Week 4 Tasks**:
   - [ ] UI integration
   - [ ] Export button in ViewerScreen
   - [ ] Parameter update handling
   - [ ] Documentation

## Resources

### Official Documentation
- **OpenCascade.js Docs**: https://ocjs.org/
- **GitHub Repository**: https://github.com/donalffons/opencascade.js
- **Examples**: https://github.com/donalffons/opencascade.js-examples
- **NPM Package**: https://www.npmjs.com/package/opencascade.js

### Alternative: Replicad
- **Website**: https://replicad.xyz/
- **TypeScript Guide**: https://replicad.xyz/docs/advanced-topics/typescript/
- **NPM**: https://www.npmjs.com/package/replicad

### OCCT Core Documentation
- **STEP Translator**: https://dev.opencascade.org/doc/overview/html/occt_user_guides__step.html
- **Bottle Tutorial**: https://dev.opencascade.org/doc/overview/html/occt__tutorial.html
- **B-rep Modeling**: https://dev.opencascade.org/doc/refman/html/class_b_rep_lib___make_solid.html

### Community
- **OCC Forum**: https://dev.opencascade.org/content/using-opencascadejs-import-step-transform-and-export-step
- **Hacker News**: https://news.ycombinator.com/item?id=34867641 (Replicad discussion)

---

## Summary

**Status**: 🟡 **Foundation Ready, Implementation In Progress**

**Files Created**:
- ✅ `src/lib/cad/opencascade-loader.ts` - WASM loader with TypeScript types
- ✅ `src/lib/cad/tank-geometry.ts` - B-rep geometry functions (skeleton)
- ✅ `OPENCASCADE_INTEGRATION_PLAN.md` - This document

**Next Critical Step**:
1. Update `next.config.ts` with webpack WASM configuration
2. Install `opencascade.js` package
3. Test WASM loading in development environment

**Timeline**: 4 weeks to full CAD integration with STEP export

**Risk Level**: 🟡 Medium (WASM complexity, mesh extraction, but proven technology)

**Recommendation**: Proceed with opencascade.js integration. This is the RIGHT approach for a professional CAD interface, not a "fucking 3D viewer."
