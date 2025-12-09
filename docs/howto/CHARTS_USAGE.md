---
doc_type: howto
title: "H2 Tank Designer Professional Engineering Charts"
version: 1.0.0
date: 2025-12-09
owner: "@h2-tank-team"
status: accepted
last_verified_at: 2025-12-09
---
# H2 Tank Designer Professional Engineering Charts

Professional, production-ready chart components for engineering data visualization using Recharts.

## Available Charts

### 1. StressContourChart
**Purpose**: Visualize stress distributions with color-mapped contours

**Features**:
- Color-mapped stress visualization (blue=low, red=high stress)
- Max/min stress markers with reference lines
- Region highlighting (dome, cylinder, transition, boss)
- Layer selection dropdown
- Interactive tooltips with precise values
- Export to PNG/SVG

**Usage**:
```tsx
import { StressContourChart } from '@/components/charts';
import type { DesignStress, CompositeLayer } from '@/lib/types';

const stressData: DesignStress = {
  design_id: "design-001",
  load_case: "burst",
  load_pressure_bar: 875,
  stress_type: "Von Mises",
  max_stress: {
    value_mpa: 1450,
    location: { r: 125.5, z: 45.2, theta: 0 },
    region: "dome",
    allowable_mpa: 1650,
    margin_percent: 12.1,
  },
  contour_data: {
    type: "stress_contour",
    colormap: "viridis",
    min_value: 50,
    max_value: 1450,
    nodes: [
      { x: 100, y: 0, z: 0, value: 850 },
      { x: 105, y: 10, z: 0, value: 920 },
      // ... more nodes
    ],
  },
};

const layers: CompositeLayer[] = [
  { layer: 1, type: 'helical', angle_deg: 15, thickness_mm: 0.5, coverage: 'full' },
  { layer: 2, type: 'hoop', angle_deg: 90, thickness_mm: 0.4, coverage: 'cylinder' },
];

<StressContourChart
  stressData={stressData}
  layers={layers}
  onExport={(format) => console.log(`Export as ${format}`)}
/>
```

---

### 2. HistogramChart
**Purpose**: Distribution visualization with normal curve overlay

**Features**:
- Configurable bin count
- Mean/std deviation markers
- Confidence interval bands
- Normal distribution overlay
- Statistical summary panel
- Interactive tooltips

**Usage**:
```tsx
import { HistogramChart } from '@/components/charts';

const burstData = {
  data: [
    { bin_center: 860, count: 5 },
    { bin_center: 870, count: 12 },
    { bin_center: 880, count: 28 },
    { bin_center: 890, count: 45 },
    { bin_center: 900, count: 62 },
    { bin_center: 910, count: 45 },
    { bin_center: 920, count: 28 },
    { bin_center: 930, count: 12 },
    { bin_center: 940, count: 5 },
  ],
  mean: 900,
  std: 15.2,
};

<HistogramChart
  data={burstData.data}
  mean={burstData.mean}
  std={burstData.std}
  title="Burst Pressure Distribution"
  xLabel="Burst Pressure"
  yLabel="Frequency"
  unit="bar"
  showNormalOverlay={true}
  confidenceInterval={{ lower: 870, upper: 930 }}
  onExport={(format) => console.log(`Export as ${format}`)}
/>
```

---

### 3. TornadoChart
**Purpose**: Sensitivity analysis visualization

**Features**:
- Horizontal bar chart sorted by magnitude
- Positive/negative impact visualization
- Color coding by impact intensity
- Top 3 most influential parameters
- Interactive tooltips

**Usage**:
```tsx
import { TornadoChart, type SensitivityParameter } from '@/components/charts';

const sensitivityData: SensitivityParameter[] = [
  {
    parameter: 'fiber_strength',
    label: 'Fiber Strength',
    low_impact: -12.5,
    high_impact: 15.3,
    baseline: 2500,
    unit: 'MPa',
  },
  {
    parameter: 'wall_thickness',
    label: 'Wall Thickness',
    low_impact: -18.2,
    high_impact: 22.1,
    baseline: 15.5,
    unit: 'mm',
  },
  {
    parameter: 'fiber_angle',
    label: 'Fiber Angle',
    low_impact: -8.1,
    high_impact: 9.4,
    baseline: 15,
    unit: 'deg',
  },
  // ... more parameters
];

<TornadoChart
  data={sensitivityData}
  title="Parameter Sensitivity Analysis"
  sortByMagnitude={true}
  threshold={10}
  onExport={(format) => console.log(`Export as ${format}`)}
/>
```

---

### 4. ConvergenceChart
**Purpose**: Optimization progress tracking

**Features**:
- Multi-line time series (best/average/worst)
- Generation markers
- Zoom/pan controls (brush)
- Real-time update support
- Convergence detection
- Goal reference line

**Usage**:
```tsx
import { ConvergenceChart, type ConvergenceData } from '@/components/charts';

const optimizationData: ConvergenceData[] = [
  { generation: 0, best_fitness: 0.45, average_fitness: 0.23, worst_fitness: 0.12, std_dev: 0.08 },
  { generation: 1, best_fitness: 0.52, average_fitness: 0.31, worst_fitness: 0.15, std_dev: 0.09 },
  { generation: 2, best_fitness: 0.61, average_fitness: 0.42, worst_fitness: 0.22, std_dev: 0.11 },
  // ... more generations
  { generation: 50, best_fitness: 0.94, average_fitness: 0.89, worst_fitness: 0.82, std_dev: 0.03 },
];

<ConvergenceChart
  data={optimizationData}
  title="Genetic Algorithm Convergence"
  yLabel="Fitness Score"
  goalValue={0.95}
  enableZoom={true}
  realTimeUpdate={false}
  onExport={(format) => console.log(`Export as ${format}`)}
/>
```

---

### 5. RadarChart
**Purpose**: Multi-criteria design comparison

**Features**:
- Multiple design overlays
- Normalized 0-100 scale
- Interactive legend
- Overall score calculation
- Automatic inversion for "lower is better" metrics
- Design selection chips

**Usage**:
```tsx
import { RadarChart, type RadarMetric, type RadarDesignData } from '@/components/charts';

const metrics: RadarMetric[] = [
  { metric: 'weight_kg', label: 'Weight', unit: 'kg', higherIsBetter: false },
  { metric: 'cost_eur', label: 'Cost', unit: 'â‚¬', higherIsBetter: false },
  { metric: 'burst_ratio', label: 'Burst Ratio', higherIsBetter: true },
  { metric: 'fatigue_life', label: 'Fatigue Life', unit: 'cycles', higherIsBetter: true },
  { metric: 'vol_efficiency', label: 'Vol. Efficiency', higherIsBetter: true },
];

const designs: RadarDesignData[] = [
  {
    designId: 'A',
    designName: 'Lightest',
    color: '#10B981',
    values: { weight_kg: 45, cost_eur: 2800, burst_ratio: 2.8, fatigue_life: 15000, vol_efficiency: 0.72 },
  },
  {
    designId: 'B',
    designName: 'Balanced',
    color: '#3B82F6',
    values: { weight_kg: 52, cost_eur: 2200, burst_ratio: 3.2, fatigue_life: 18500, vol_efficiency: 0.75 },
  },
  {
    designId: 'C',
    designName: 'Max Safety',
    color: '#8B5CF6',
    values: { weight_kg: 58, cost_eur: 3100, burst_ratio: 3.8, fatigue_life: 22000, vol_efficiency: 0.68 },
  },
];

<RadarChart
  metrics={metrics}
  designs={designs}
  title="Design Comparison"
  normalizeData={true}
  onExport={(format) => console.log(`Export as ${format}`)}
/>
```

---

### 6. LineProfileChart
**Purpose**: Engineering profiles (thickness, stress, temperature vs position)

**Features**:
- Dual Y-axis support
- Region annotations with colored bands
- Statistical summary
- Profile comparison
- Interactive region highlighting

**Usage**:
```tsx
import { LineProfileChart, type ProfileDataPoint } from '@/components/charts';

const thicknessProfile: ProfileDataPoint[] = [
  { position: 0, value: 18.5, secondaryValue: 450, region: 'boss' },
  { position: 25, value: 16.2, secondaryValue: 520, region: 'dome' },
  { position: 50, value: 15.1, secondaryValue: 680, region: 'dome' },
  { position: 75, value: 14.8, secondaryValue: 850, region: 'transition' },
  { position: 100, value: 14.5, secondaryValue: 920, region: 'cylinder' },
  { position: 150, value: 14.5, secondaryValue: 915, region: 'cylinder' },
  // ... more points
];

const regions = [
  { start: 0, end: 20, label: 'Boss', color: '#EF4444' },
  { start: 20, end: 80, label: 'Dome', color: '#8B5CF6' },
  { start: 80, end: 95, label: 'Transition', color: '#F59E0B' },
  { start: 95, end: 200, label: 'Cylinder', color: '#06B6D4' },
];

<LineProfileChart
  data={thicknessProfile}
  title="Thickness & Stress Profile"
  xLabel="Axial Position"
  yLabel="Thickness"
  secondaryYLabel="Stress"
  unit="mm"
  secondaryUnit="MPa"
  regions={regions}
  showRegionBands={true}
  dualAxis={true}
  onExport={(format) => console.log(`Export as ${format}`)}
/>
```

---

### 7. PieChartEnhanced
**Purpose**: Cost breakdown and composition analysis

**Features**:
- Interactive segments with hover effects
- Percentage labels
- Center total display (for donut mode)
- Detailed breakdown panel
- Automatic sorting by value
- Statistical summary

**Usage**:
```tsx
import { PieChartEnhanced, type PieDataItem } from '@/components/charts';

const costBreakdown: PieDataItem[] = [
  { name: 'Carbon Fiber', value: 1250, category: 'Material', color: '#3B82F6' },
  { name: 'Epoxy Resin', value: 420, category: 'Material', color: '#10B981' },
  { name: 'Liner (HDPE)', value: 380, category: 'Material', color: '#F59E0B' },
  { name: 'Manufacturing', value: 680, category: 'Process', color: '#EF4444' },
  { name: 'Quality Control', value: 180, category: 'Process', color: '#8B5CF6' },
  { name: 'Assembly', value: 220, category: 'Process', color: '#06B6D4' },
];

<PieChartEnhanced
  data={costBreakdown}
  title="Unit Cost Breakdown"
  unit="â‚¬"
  showPercentages={true}
  showValues={true}
  innerRadius={60} // 0 for pie, >0 for donut
  onExport={(format) => console.log(`Export as ${format}`)}
/>
```

---

## Common Features

All charts include:
- **Responsive Design**: Auto-sizing with ResponsiveContainer
- **Dark Theme Compatible**: Uses Tailwind CSS classes
- **Engineering Number Formatting**: Proper units and precision
- **Export Functionality**: PNG/SVG export hooks
- **Interactive Tooltips**: Contextual information on hover
- **TypeScript Support**: Full type safety
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Styling

Charts use Tailwind CSS for styling and are compatible with dark mode. Colors follow the project's design system:

- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Danger: Red (#EF4444)
- Info: Violet (#8B5CF6)

## Performance

- Optimized with `useMemo` for data processing
- Efficient re-rendering with React best practices
- Handles large datasets (tested with 10,000+ points)
- Real-time update support for live data

## Best Practices

1. **Data Validation**: Always validate data before passing to charts
2. **Loading States**: Show skeleton or spinner while data loads
3. **Error Boundaries**: Wrap charts in error boundaries
4. **Responsive Containers**: Ensure parent has defined height
5. **Export Implementation**: Implement actual export logic using canvas/SVG

## Example: Complete Integration

```tsx
'use client';

import { useState } from 'react';
import { StressContourChart, HistogramChart, TornadoChart } from '@/components/charts';

export function AnalysisDashboard({ designId }: { designId: string }) {
  const [stressData, setStressData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    fetchAnalysisData(designId).then(data => {
      setStressData(data.stress);
      setLoading(false);
    });
  }, [designId]);

  if (loading) return <div>Loading analysis...</div>;

  return (
    <div className="grid grid-cols-2 gap-6 h-screen p-6">
      <div className="h-[600px]">
        <StressContourChart
          stressData={stressData}
          onExport={handleExport}
        />
      </div>
      <div className="h-[600px]">
        <HistogramChart
          data={histogramData}
          mean={900}
          std={15}
        />
      </div>
    </div>
  );
}
```

## License

Part of the H2 Tank Designer project.

