---
id: GUIDE-ACTIVATION-001
doc_type: howto
title: "Quick Activation Guide - Enhanced 3D Viewer & Comparison"
status: accepted
last_verified_at: 2025-12-09
owner: "@h2-tank-team"
keywords: ["activation", "viewer", "comparison", "enhanced screens"]
related_docs:
  - "docs/implementation/CHARTS_IMPLEMENTATION_SUMMARY.md"
  - "docs/implementation/REQUIREMENTS_SCREEN_ENHANCEMENTS.md"
code_refs:
  - path: "proagentic-dfx/src/components/screens/ViewerScreen.tsx"
  - path: "proagentic-dfx/src/components/screens/ViewerScreen.enhanced.tsx"
  - path: "proagentic-dfx/src/components/screens/CompareScreen.tsx"
  - path: "proagentic-dfx/src/components/screens/CompareScreen.enhanced.tsx"
  - path: "proagentic-dfx/src/components/viewer/ViewerControls.tsx"
  - path: "proagentic-dfx/src/components/viewer/LayerControls.tsx"
  - path: "proagentic-dfx/src/components/viewer/GeometryDetails.tsx"
  - path: "proagentic-dfx/src/components/viewer/SectionControls.tsx"
  - path: "proagentic-dfx/src/components/viewer/MeasurementTools.tsx"
  - path: "proagentic-dfx/src/components/viewer/AnnotationPanel.tsx"
  - path: "proagentic-dfx/src/components/compare/ComparisonTable.tsx"
  - path: "proagentic-dfx/src/components/compare/RadarComparison.tsx"
  - path: "proagentic-dfx/src/components/compare/StressComparison.tsx"
---

# Quick Activation Guide - Enhanced 3D Viewer & Comparison

## Step-by-Step Activation

### Option 1: Full Replacement (Recommended)

Replace both screens with enhanced versions:

```bash
# Navigate to project directory
cd C:\Users\chine\Projects\proagentic-dfx\proagentic-dfx

# Backup original screens
cp src/components/screens/ViewerScreen.tsx src/components/screens/ViewerScreen.original.tsx
cp src/components/screens/CompareScreen.tsx src/components/screens/CompareScreen.original.tsx

# Activate enhanced screens
mv src/components/screens/ViewerScreen.enhanced.tsx src/components/screens/ViewerScreen.tsx
mv src/components/screens/CompareScreen.enhanced.tsx src/components/screens/CompareScreen.tsx

# Start development server
npm run dev
```

### Option 2: Gradual Integration

Use enhanced components selectively in existing screens:

```typescript
// In your existing ViewerScreen.tsx
import { ViewerControls } from '@/components/viewer/ViewerControls';
import { LayerControls } from '@/components/viewer/LayerControls';
import { GeometryDetails } from '@/components/viewer/GeometryDetails';

// Add to your screen component
<ViewerControls
  onViewPreset={handleViewPreset}
  cameraState={cameraState}
  // ... other props
/>
```

### Option 3: Side-by-Side Testing

Keep both versions and route to enhanced version:

```typescript
// In your routing/screen manager
import { ViewerScreen as ViewerScreenOriginal } from './ViewerScreen.original';
import { ViewerScreen as ViewerScreenEnhanced } from './ViewerScreen';

// Use enhanced version
const ViewerScreen = ViewerScreenEnhanced;
```

## Verification Checklist

After activation, verify the following features work:

### ViewerScreen
- [ ] Design selector shows available designs
- [ ] 3D model loads and renders correctly
- [ ] View presets (Front, Side, Top, Iso) change camera
- [ ] Zoom slider adjusts view
- [ ] Auto-rotate toggle works
- [ ] Layer controls show/hide layers
- [ ] Layer opacity slider adjusts transparency
- [ ] Section controls show cross-section
- [ ] Design info overlay displays correctly
- [ ] Geometry details panel expands/collapses

### CompareScreen
- [ ] Multiple designs load (2-4 designs)
- [ ] Add design button shows available designs
- [ ] Remove design button removes from comparison
- [ ] Swap button reorders designs
- [ ] Comparison table shows all metrics
- [ ] Sort by metric works (click headers)
- [ ] Radar chart displays correctly
- [ ] Stress comparison shows all designs
- [ ] Trade-off analysis panel appears
- [ ] Click design name navigates to viewer

## Common Issues & Solutions

### Issue: Import errors for new components

**Solution**: Ensure TypeScript can find the components:
```bash
# Check if files exist
ls src/components/viewer/
ls src/components/compare/

# Restart TypeScript server in your IDE
# VSCode: Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### Issue: Missing lucide-react icons

**Solution**: Verify lucide-react is installed:
```bash
npm list lucide-react
# If missing:
npm install lucide-react
```

### Issue: Recharts not found

**Solution**: Verify recharts is installed (already in dependencies):
```bash
npm list recharts
# If missing:
npm install recharts
```

### Issue: WebGL renderer errors

**Solution**: The enhanced screens use the existing CADTankViewer. Ensure:
- Original CADTankViewer.tsx is working
- WebGLRenderer.ts is present
- Canvas element is properly sized

## Feature-Specific Testing

### Testing Measurement Tools
1. Click "Distance" button
2. Click two points on 3D model
3. Measurement should appear in history list
4. Click trash icon to delete measurement
5. Click "Clear All" to remove all measurements

### Testing Annotations
1. Click "Text Note" button
2. Click on 3D model to place annotation
3. Enter text in the annotation
4. Click "Save"
5. Use eye icon to show/hide
6. Click edit icon to modify text

### Testing Section View
1. Toggle section view ON
2. Select section direction (X/Y/Z)
3. Move position slider
4. Model should cut at the plane position
5. Toggle "Show Interior" to reveal internal structure

### Testing Comparison
1. Start with 2 designs selected
2. Click "Add Design" to add 3rd design
3. Click swap arrows to reorder
4. Click design in table to view in 3D
5. Toggle metrics in radar chart
6. Verify stress comparison shows all designs

## Performance Optimization

If you experience performance issues:

1. **Reduce visible layers**: Hide layers you don't need
2. **Disable auto-rotate**: Turn off when not needed
3. **Lower opacity**: Reduce layer opacity for faster rendering
4. **Limit comparisons**: Compare 2-3 designs instead of 4
5. **Close unused panels**: Collapse geometry details when not needed

## Customization Points

### Colors
Edit layer colors in `LayerControls.tsx`:
```typescript
const LAYER_COLORS: Record<string, string> = {
  helical: '#F97316',  // Change to your brand color
  hoop: '#0EA5E9',     // Change to your brand color
  liner: '#9CA3AF',
};
```

### View Presets
Edit camera positions in `ViewerScreen.tsx`:
```typescript
const presets: Record<ViewPreset, Partial<CameraState>> = {
  front: { position: [0, 0, 2], rotation: [0, 0] },
  // Customize positions as needed
};
```

### Comparison Metrics
Edit metrics in `CompareScreen.tsx`:
```typescript
const comparisonMetrics: ComparisonMetric[] = [
  {
    name: 'Weight',
    key: 'weight_kg',
    unit: 'kg',
    format: (v) => v.toFixed(1),
    betterWhen: 'lower',  // or 'higher'
  },
  // Add more metrics
];
```

## Integration with Existing Features

### With Requirements Chat
The enhanced viewer and comparison screens work seamlessly with the existing requirements chat feature.

### With Export/Analysis Screens
Navigation between screens is preserved.

### With State Management
All screens use the existing `useAppStore`.

## Rollback Procedure

If you need to revert to original screens:

```bash
# Restore original screens
mv src/components/screens/ViewerScreen.original.tsx src/components/screens/ViewerScreen.tsx
mv src/components/screens/CompareScreen.original.tsx src/components/screens/CompareScreen.tsx

# Restart dev server
npm run dev
```
