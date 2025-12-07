# OpenCascade.js CAD Integration - Installation Guide

## Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd C:\Users\chine\Projects\h2_tank_designer\h2-tank-frontend

# Install OpenCascade.js (main package)
npm install opencascade.js

# Install Emscripten types (for STEP export)
npm install --save-dev @types/emscripten
```

### Step 2: Update Next.js Configuration

**Backup your current config**:
```bash
copy next.config.ts next.config.BACKUP.ts
```

**Replace `next.config.ts` with**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
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

**Or use the example**:
```bash
copy next.config.EXAMPLE.ts next.config.ts
```

### Step 3: Test WASM Loading

**Create test page**: `src/app/cad-test/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { loadOpenCascade } from '@/lib/cad/opencascade-loader';

export default function CADTest() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    loadOpenCascade()
      .then(() => setStatus('✅ OpenCascade.js loaded successfully!'))
      .catch((err) => setStatus(`❌ Error: ${err.message}`));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">OpenCascade.js Test</h1>
      <p className="mt-4">{status}</p>
    </div>
  );
}
```

**Run development server**:
```bash
npm run dev
```

**Open browser**:
```
http://localhost:3000/cad-test
```

**Expected result**: "✅ OpenCascade.js loaded successfully!" (may take 2-3 seconds)

---

## Files Created (Verification)

Run this to verify all files exist:

```bash
# CAD library files
dir src\lib\cad\opencascade-loader.ts
dir src\lib\cad\tank-geometry.ts

# CAD component
dir src\components\three\CADTankModel.tsx

# Documentation
dir OPENCASCADE_INTEGRATION_PLAN.md
dir CAD_INTEGRATION_SUMMARY.md
dir INSTALLATION_GUIDE.md
dir next.config.EXAMPLE.ts
```

**Expected files**:
- ✅ `src/lib/cad/opencascade-loader.ts` (WASM loader)
- ✅ `src/lib/cad/tank-geometry.ts` (B-rep geometry functions)
- ✅ `src/components/three/CADTankModel.tsx` (React component)
- ✅ `next.config.EXAMPLE.ts` (webpack configuration)
- ✅ `OPENCASCADE_INTEGRATION_PLAN.md` (detailed plan)
- ✅ `CAD_INTEGRATION_SUMMARY.md` (research summary)
- ✅ `INSTALLATION_GUIDE.md` (this file)

---

## Integration with Existing Viewer

### Option A: Side-by-Side Comparison (Recommended for Testing)

Keep both viewers and add a toggle:

**Update `ViewerScreen.tsx`**:

```typescript
const [useCAD, setUseCAD] = useState(false);

return (
  <>
    <Button onClick={() => setUseCAD(!useCAD)}>
      {useCAD ? 'Use Three.js Viewer' : 'Use CAD Viewer'}
    </Button>

    <Canvas>
      {useCAD ? (
        <CADTankModel dimensions={cadDimensions} />
      ) : (
        <TankModel geometry={geometry} />
      )}
    </Canvas>
  </>
);
```

### Option B: Full Replacement (Production)

Replace `TankModel` with `CADTankModel`:

```typescript
import { CADTankModel } from '@/components/three/CADTankModel';

// Convert DesignGeometry to TankDimensions
const cadDimensions = {
  innerRadius: geometry.dimensions.inner_radius_mm,
  outerRadius: geometry.dimensions.inner_radius_mm + geometry.dimensions.wall_thickness_mm,
  cylinderLength: geometry.dimensions.cylinder_length_mm,
  domeHeight: geometry.dome.parameters.depth_mm,
  bossInnerDiameter: geometry.dome.parameters.boss_id_mm,
  bossOuterDiameter: geometry.dome.parameters.boss_od_mm,
  bossLength: 70, // Default boss length
  linerThickness: geometry.layup?.liner_thickness_mm ?? 3.2,
};

return (
  <Canvas>
    <CADTankModel dimensions={cadDimensions} />
  </Canvas>
);
```

---

## Adding STEP Export Button

**Update `ViewerScreen.tsx`**:

```typescript
import { useCADExport } from '@/components/three/CADTankModel';
import { Download } from 'lucide-react';

export function ViewerScreen() {
  const exportToSTEP = useCADExport();
  const [exporting, setExporting] = useState(false);

  const handleExportSTEP = async () => {
    try {
      setExporting(true);
      await exportToSTEP(cadDimensions, 'h2_tank_design.step');
      alert('STEP file downloaded successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. See console for details.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Button onClick={handleExportSTEP} disabled={exporting}>
        {exporting ? 'Exporting...' : 'Export STEP'}
        <Download className="ml-2" size={16} />
      </Button>
    </>
  );
}
```

---

## Troubleshooting

### Problem: "Cannot resolve 'fs'" Error

**Cause**: Webpack trying to bundle Node.js modules

**Solution**: Verify `next.config.ts` has fallback configuration:
```typescript
if (!isServer) {
  config.resolve.fallback = {
    fs: false,
    // ... other modules
  };
}
```

**Then restart dev server**:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Problem: WASM Module Fails to Load

**Symptoms**: Console error "failed to load wasm module"

**Solutions**:

1. **Clear Next.js cache**:
   ```bash
   rmdir /s .next
   npm run dev
   ```

2. **Check browser compatibility**:
   - Chrome/Edge: ✅ Full support
   - Firefox: ✅ Full support
   - Safari: ✅ Requires recent version (14+)

3. **Check network tab**:
   - Look for `.wasm` file requests
   - Verify files are loading (may be large, 20-60 MB)

4. **Check webpack config**:
   ```typescript
   config.experiments = {
     asyncWebAssembly: true,  // Must be true
   };
   ```

### Problem: Slow First Load

**Expected**: First WASM load takes 2-5 seconds (60+ MB download)

**Solutions**:

1. **Show loading indicator** (already in CADTankModel):
   ```typescript
   if (loading) {
     return <LoadingPlaceholder />;
   }
   ```

2. **Use CDN for WASM files** (production):
   ```typescript
   // next.config.ts
   assetPrefix: 'https://your-cdn.com',
   ```

3. **Create custom OpenCascade build** (advanced):
   - Only include modules you need
   - Can reduce size to ~20-30 MB
   - See: https://ocjs.org/docs/app-dev-workflow/custom-builds

### Problem: "Out of Memory" Errors

**Symptoms**: Build fails or browser crashes

**Solutions**:

1. **Increase Node memory limit**:
   ```json
   // package.json
   {
     "scripts": {
       "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev",
       "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
     }
   }
   ```

2. **Limit concurrent operations**:
   - Don't generate multiple solids simultaneously
   - Dispose unused geometry
   - Use `useEffect` cleanup

3. **Reduce mesh resolution**:
   ```typescript
   // Increase deflection = fewer triangles = less memory
   meshBRepSolid(oc, shape, 1.0); // Instead of 0.5
   ```

### Problem: TypeScript Errors in CAD Files

**Symptoms**: "Property 'X' does not exist on type 'OpenCascadeInstance'"

**Solutions**:

1. **Extend interface** in `opencascade-loader.ts`:
   ```typescript
   export interface OpenCascadeInstance {
     // Add missing property
     YourMissingClass: any;
   }
   ```

2. **Use type assertion**:
   ```typescript
   const oc = await loadOpenCascade() as any;
   ```

3. **Install type package**:
   ```bash
   npm install --save-dev @sridhar-mani/opencascade-types
   ```

---

## Performance Tips

### Development
- **Hot reload works** - changes to CAD code trigger regeneration
- **WASM loads once** - singleton pattern prevents reloading
- **Use `console.time`** to profile geometry generation

### Production
1. **Code splitting**:
   ```typescript
   const CADTankModel = dynamic(() => import('@/components/three/CADTankModel'), {
     ssr: false,
     loading: () => <LoadingSpinner />,
   });
   ```

2. **Lazy loading**:
   ```typescript
   // Only load OpenCascade when user clicks "Export STEP"
   const handleExport = async () => {
     const { exportToSTEP } = await import('@/lib/cad/tank-geometry');
     // ... export logic
   };
   ```

3. **Caching**:
   ```typescript
   // Cache generated geometry
   const geometryCache = new Map<string, THREE.BufferGeometry>();
   const cacheKey = JSON.stringify(dimensions);
   if (geometryCache.has(cacheKey)) {
     return geometryCache.get(cacheKey);
   }
   ```

---

## Next Steps

### Week 1: Testing & Validation
- [ ] Run `npm install opencascade.js`
- [ ] Update `next.config.ts`
- [ ] Test WASM loading at `/cad-test`
- [ ] Verify no webpack errors
- [ ] Profile first load time

### Week 2: Implementation
- [ ] Complete `meshBRepSolid()` function
- [ ] Test simple cylinder generation
- [ ] Test isotensoid dome generation
- [ ] Verify mesh extraction works

### Week 3: Integration
- [ ] Add CAD viewer toggle to ViewerScreen
- [ ] Test side-by-side comparison
- [ ] Implement STEP export
- [ ] Test export in FreeCAD/SolidWorks

### Week 4: Production
- [ ] Replace Three.js viewer with CAD viewer
- [ ] Add composite layer offset operations
- [ ] Performance optimization
- [ ] Documentation and user guide

---

## Support & Resources

### Official Documentation
- **OpenCascade.js**: https://ocjs.org/
- **GitHub**: https://github.com/donalffons/opencascade.js
- **Examples**: https://github.com/donalffons/opencascade.js-examples

### Community
- **OCC Forum**: https://dev.opencascade.org/
- **Stack Overflow**: Tag `opencascade.js`
- **GitHub Issues**: https://github.com/donalffons/opencascade.js/issues

### Internal Documentation
- **Integration Plan**: `OPENCASCADE_INTEGRATION_PLAN.md`
- **Research Summary**: `CAD_INTEGRATION_SUMMARY.md`
- **This Guide**: `INSTALLATION_GUIDE.md`

---

## Summary

**Status**: ✅ **Ready for Installation**

**Time to First Test**: ~5 minutes
1. Install dependencies (1 min)
2. Update config (1 min)
3. Create test page (2 min)
4. Run and verify (1 min)

**Time to Full Integration**: ~4 weeks
- Week 1: Setup and testing
- Week 2: Mesh extraction and basic solids
- Week 3: STEP export and advanced features
- Week 4: Production integration

**Next Command**:
```bash
npm install opencascade.js
```

**Then**: Update `next.config.ts` and test at `http://localhost:3000/cad-test`

Good luck! This is the RIGHT approach for a professional CAD interface. 🚀
