# Data Export Module

Provides CSV and JSON export functionality for stress analysis data from the H2 Tank Designer.

## Features

- Export complete stress analysis data (nodes, summary, per-layer breakdown)
- Export per-layer stress data separately
- Support for both CSV and JSON formats
- Configurable precision and formatting
- Browser download integration
- BOM support for Excel CSV compatibility
- Proper handling of 2D axisymmetric and 3D mesh data

## Usage

### Quick Export

```typescript
import { exportAndDownloadStressData } from '@/lib/export';

// Export stress data as CSV
exportAndDownloadStressData(stressData, 'csv');

// Export as JSON with custom precision
exportAndDownloadStressData(stressData, 'json', { precision: 4 });
```

### Per-Layer Stress Export

```typescript
import { exportAndDownloadPerLayerStress } from '@/lib/export';

const layers = [
  {
    layer: 1,
    type: 'helical',
    angle_deg: 14.2,
    sigma1_mpa: 1250.3,
    sigma2_mpa: 45.2,
    tau12_mpa: 23.1,
    tsai_wu: 0.72,
    margin_pct: 28.5
  }
];

// Export as CSV
exportAndDownloadPerLayerStress(layers, 'DESIGN-001', 'csv');

// Export as JSON
exportAndDownloadPerLayerStress(layers, 'DESIGN-001', 'json');
```

### Custom Export Options

```typescript
import { exportStressDataAsCSV, downloadFile } from '@/lib/export';

const csvContent = exportStressDataAsCSV(stressData, {
  format: 'csv',
  includeHeader: true,
  precision: 3 // 3 decimal places
});

// Custom filename
downloadFile(csvContent, 'custom_export.csv', 'text/csv');
```

### Advanced Usage

```typescript
import {
  exportStressDataAsJSON,
  exportStressNodesAsCSV,
  exportPerLayerStressAsCSV
} from '@/lib/export';

// Export just the nodes
const nodesCSV = exportStressNodesAsCSV(
  stressData.contour_data.mesh.nodes,
  { format: 'csv', includeHeader: true, precision: 2 }
);

// Export just per-layer data
const layersCSV = exportPerLayerStressAsCSV(
  stressData.per_layer_stress,
  { format: 'csv', includeHeader: true, precision: 2 }
);

// Export as JSON for API consumption
const jsonData = exportStressDataAsJSON(stressData, {
  format: 'json',
  includeHeader: false,
  precision: 2
});
```

## Output Formats

### CSV Format - Complete Stress Data

```csv
# Stress Analysis Export
# Design ID: C
# Load Case: test_pressure
# Load Pressure: 875 bar
# Stress Type: vonMises
# Export Date: 2024-12-09T12:00:00Z

# Summary
metric,value,unit
max_stress,892.70,MPa
max_stress_location_r,125.50,mm
max_stress_location_z,450.20,mm
max_stress_region,dome_apex,
allowable_stress,1250.00,MPa
margin,40.10,%
min_stress,125.30,MPa
max_stress_contour,892.70,MPa

# Stress Field Data
node_id,r,z,stress_mpa
1,125.00,0.00,245.60
2,125.50,50.00,268.40
3,126.00,100.00,312.80

# Per-Layer Stress
layer,type,hoop_mpa,axial_mpa,shear_mpa
1,helical,1250.30,45.20,23.10
2,hoop,1180.50,52.10,18.40
```

### JSON Format - Complete Stress Data

```json
{
  "design_id": "C",
  "stress_type": "vonMises",
  "load_case": "test_pressure",
  "load_pressure_bar": 875,
  "export_date": "2024-12-09T12:00:00Z",
  "summary": {
    "max_stress_mpa": 892.7,
    "max_stress_location": {
      "r": 125.5,
      "z": 450.2,
      "theta": 0
    },
    "max_stress_region": "dome_apex",
    "allowable_mpa": 1250,
    "margin_percent": 40.1,
    "min_stress_mpa": 125.3,
    "mean_stress_mpa": 456.2
  },
  "contour_data": {
    "type": "filled_contour",
    "colormap": "jet",
    "min_value": 125.3,
    "max_value": 892.7
  },
  "nodes": [
    { "id": 1, "r": 125, "z": 0, "stress": 245.6 },
    { "id": 2, "r": 125.5, "z": 50, "stress": 268.4 },
    { "id": 3, "r": 126, "z": 100, "stress": 312.8 }
  ],
  "elements": [
    {
      "id": 1,
      "nodes": [1, 2, 3],
      "region": "cylinder",
      "centroid_stress": 275.6
    }
  ],
  "per_layer_stress": [
    {
      "layer": 1,
      "type": "helical",
      "hoop_mpa": 1250.3,
      "axial_mpa": 45.2,
      "shear_mpa": 23.1
    }
  ],
  "stress_concentration_factor": 1.45
}
```

## Export Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | `'csv' \| 'json'` | - | Export format |
| `includeHeader` | `boolean` | `true` | Include headers/metadata |
| `precision` | `number` | `2` | Decimal places for numeric values |

## Per-Layer Stress Fields

The export supports both classical laminate theory and simple layer stress formats:

### Classical Laminate Theory
- `layer`: Layer number
- `type`: Layer type (helical, hoop)
- `angle_deg`: Winding angle in degrees
- `sigma1_mpa`: Principal stress in fiber direction
- `sigma2_mpa`: Principal stress transverse to fiber
- `tau12_mpa`: In-plane shear stress
- `tsai_wu`: Tsai-Wu failure index (0-1)
- `margin_pct`: Safety margin percentage

### Simple Format
- `layer`: Layer number
- `type`: Layer type
- `hoop_mpa`: Hoop stress
- `axial_mpa`: Axial stress
- `shear_mpa`: Shear stress

## Browser Compatibility

- Uses native `Blob` API for file generation
- Creates download links via `URL.createObjectURL`
- BOM character added to CSV for Excel compatibility
- Automatic cleanup of object URLs after download

## File Naming Convention

Exported files follow this naming pattern:

- **Stress Data**: `stress_{design_id}_{load_case}_{timestamp}.{ext}`
- **Per-Layer**: `per_layer_stress_{design_id}_{timestamp}.{ext}`

Example: `stress_C_test_pressure_2024-12-09T12-00-00.csv`

## Testing

Comprehensive test coverage includes:
- CSV/JSON format validation
- Precision handling
- Edge cases (empty arrays, special characters)
- Download functionality
- BOM insertion for CSV
- Mock data scenarios

Run tests:
```bash
npm test -- src/__tests__/lib/export/data-export.test.ts
```

## Integration Example

```typescript
// In a React component
import { exportAndDownloadStressData } from '@/lib/export';

function AnalysisScreen() {
  const handleExportCSV = () => {
    if (stressData) {
      exportAndDownloadStressData(stressData, 'csv', {
        precision: 3,
        includeHeader: true
      });
    }
  };

  const handleExportJSON = () => {
    if (stressData) {
      exportAndDownloadStressData(stressData, 'json', {
        precision: 4,
        includeHeader: true
      });
    }
  };

  return (
    <div>
      <button onClick={handleExportCSV}>Export CSV</button>
      <button onClick={handleExportJSON}>Export JSON</button>
    </div>
  );
}
```

## API Reference

See [data-export.ts](./data-export.ts) for full API documentation with JSDoc comments.
