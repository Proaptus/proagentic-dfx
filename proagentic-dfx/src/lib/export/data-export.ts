/**
 * Data Export Utilities for H2 Tank Designer
 *
 * Provides CSV and JSON export functionality for stress analysis data,
 * including per-layer stress breakdown and FEA mesh results.
 */

import type { DesignStress, MeshNode, StressNode } from '@/lib/types';

export interface ExportOptions {
  format: 'csv' | 'json';
  includeHeader: boolean;
  precision: number; // decimal places
}

export interface PerLayerStress {
  layer: number;
  type: string;
  angle_deg?: number;
  sigma1_mpa?: number;
  sigma2_mpa?: number;
  tau12_mpa?: number;
  hoop?: number;
  axial?: number;
  shear?: number;
  tsai_wu?: number;
  margin_pct?: number;
}

/**
 * Formats a number to specified precision
 */
function formatNumber(value: number, precision: number): string {
  return value.toFixed(precision);
}

/**
 * Escapes CSV field values that contain special characters
 */
function escapeCSVField(value: string | number): string {
  const strValue = String(value);
  if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }
  return strValue;
}

/**
 * Exports stress node data as CSV format
 *
 * CSV Format:
 * node_id,x,y,z,stress_mpa,region
 * 1,0.0,0.0,100.0,245.6,cylinder
 */
export function exportStressNodesAsCSV(
  nodes: StressNode[] | MeshNode[],
  options: ExportOptions
): string {
  const lines: string[] = [];

  // Add header if requested
  if (options.includeHeader) {
    if (nodes.length > 0 && 'id' in nodes[0]) {
      // MeshNode format (2D axisymmetric)
      lines.push('node_id,r,z,stress_mpa');
    } else {
      // StressNode format (3D)
      lines.push('node_id,x,y,z,stress_mpa');
    }
  }

  // Add data rows
  nodes.forEach((node, index) => {
    if ('id' in node) {
      // MeshNode format
      const meshNode = node as MeshNode;
      lines.push([
        meshNode.id,
        formatNumber(meshNode.r, options.precision),
        formatNumber(meshNode.z, options.precision),
        formatNumber(meshNode.stress, options.precision)
      ].join(','));
    } else {
      // StressNode format
      const stressNode = node as StressNode;
      lines.push([
        index + 1,
        formatNumber(stressNode.x, options.precision),
        formatNumber(stressNode.y, options.precision),
        formatNumber(stressNode.z, options.precision),
        formatNumber(stressNode.value, options.precision)
      ].join(','));
    }
  });

  return lines.join('\n');
}

/**
 * Exports per-layer stress breakdown as CSV
 *
 * CSV Format:
 * layer,type,angle_deg,sigma1_mpa,sigma2_mpa,tau12_mpa,tsai_wu,margin_pct
 * 1,helical,14.2,1250.3,45.2,23.1,0.72,28.5
 */
export function exportPerLayerStressAsCSV(
  layers: PerLayerStress[],
  options: ExportOptions
): string {
  const lines: string[] = [];

  // Add header if requested
  if (options.includeHeader) {
    const headers = ['layer', 'type'];

    // Dynamically add headers based on available data
    if (layers.some(l => l.angle_deg !== undefined)) headers.push('angle_deg');
    if (layers.some(l => l.sigma1_mpa !== undefined)) headers.push('sigma1_mpa');
    if (layers.some(l => l.sigma2_mpa !== undefined)) headers.push('sigma2_mpa');
    if (layers.some(l => l.tau12_mpa !== undefined)) headers.push('tau12_mpa');
    if (layers.some(l => l.hoop !== undefined)) headers.push('hoop_mpa');
    if (layers.some(l => l.axial !== undefined)) headers.push('axial_mpa');
    if (layers.some(l => l.shear !== undefined)) headers.push('shear_mpa');
    if (layers.some(l => l.tsai_wu !== undefined)) headers.push('tsai_wu');
    if (layers.some(l => l.margin_pct !== undefined)) headers.push('margin_pct');

    lines.push(headers.join(','));
  }

  // Add data rows
  layers.forEach(layer => {
    const row: (string | number)[] = [layer.layer, escapeCSVField(layer.type)];

    if (layer.angle_deg !== undefined) row.push(formatNumber(layer.angle_deg, options.precision));
    if (layer.sigma1_mpa !== undefined) row.push(formatNumber(layer.sigma1_mpa, options.precision));
    if (layer.sigma2_mpa !== undefined) row.push(formatNumber(layer.sigma2_mpa, options.precision));
    if (layer.tau12_mpa !== undefined) row.push(formatNumber(layer.tau12_mpa, options.precision));
    if (layer.hoop !== undefined) row.push(formatNumber(layer.hoop, options.precision));
    if (layer.axial !== undefined) row.push(formatNumber(layer.axial, options.precision));
    if (layer.shear !== undefined) row.push(formatNumber(layer.shear, options.precision));
    if (layer.tsai_wu !== undefined) row.push(formatNumber(layer.tsai_wu, options.precision));
    if (layer.margin_pct !== undefined) row.push(formatNumber(layer.margin_pct, options.precision));

    lines.push(row.join(','));
  });

  return lines.join('\n');
}

/**
 * Exports complete stress data as CSV format
 */
export function exportStressDataAsCSV(
  stressData: DesignStress,
  options: ExportOptions
): string {
  const sections: string[] = [];

  // Section 1: Metadata
  if (options.includeHeader) {
    sections.push('# Stress Analysis Export');
    sections.push(`# Design ID: ${stressData.design_id}`);
    sections.push(`# Load Case: ${stressData.load_case}`);
    sections.push(`# Load Pressure: ${stressData.load_pressure_bar} bar`);
    sections.push(`# Stress Type: ${stressData.stress_type}`);
    sections.push(`# Export Date: ${new Date().toISOString()}`);
    sections.push('');
  }

  // Section 2: Summary Statistics
  if (options.includeHeader) {
    sections.push('# Summary');
    sections.push('metric,value,unit');
  }
  sections.push(`max_stress,${formatNumber(stressData.max_stress.value_mpa, options.precision)},MPa`);
  sections.push(`max_stress_location_r,${formatNumber(stressData.max_stress.location.r, options.precision)},mm`);
  sections.push(`max_stress_location_z,${formatNumber(stressData.max_stress.location.z, options.precision)},mm`);
  sections.push(`max_stress_region,${escapeCSVField(stressData.max_stress.region)},`);
  sections.push(`allowable_stress,${formatNumber(stressData.max_stress.allowable_mpa, options.precision)},MPa`);
  sections.push(`margin,${formatNumber(stressData.max_stress.margin_percent, options.precision)},%`);

  if (stressData.contour_data) {
    sections.push(`min_stress,${formatNumber(stressData.contour_data.min_value, options.precision)},MPa`);
    sections.push(`max_stress_contour,${formatNumber(stressData.contour_data.max_value, options.precision)},MPa`);
  }

  sections.push('');

  // Section 3: Stress Nodes
  if (stressData.contour_data) {
    if (options.includeHeader) {
      sections.push('# Stress Field Data');
    }

    // Prefer mesh data over legacy nodes
    if (stressData.contour_data.mesh) {
      sections.push(exportStressNodesAsCSV(
        stressData.contour_data.mesh.nodes,
        { ...options, includeHeader: true }
      ));
    } else if (stressData.contour_data.nodes) {
      sections.push(exportStressNodesAsCSV(
        stressData.contour_data.nodes,
        { ...options, includeHeader: true }
      ));
    }

    sections.push('');
  }

  // Section 4: Per-Layer Stress
  if (stressData.per_layer_stress && stressData.per_layer_stress.length > 0) {
    if (options.includeHeader) {
      sections.push('# Per-Layer Stress');
    }

    sections.push(exportPerLayerStressAsCSV(
      stressData.per_layer_stress,
      { ...options, includeHeader: true }
    ));
  }

  return sections.join('\n');
}

/**
 * Exports stress data as JSON format
 *
 * JSON Format:
 * {
 *   "design_id": "C",
 *   "stress_type": "vonMises",
 *   "load_case": "test",
 *   "export_date": "2024-12-09T12:00:00Z",
 *   "summary": { ... },
 *   "nodes": [...],
 *   "per_layer_stress": [...]
 * }
 */
export function exportStressDataAsJSON(
  stressData: DesignStress,
  options: ExportOptions
): string {
  // Round all numeric values to specified precision
  const roundValue = (value: number) =>
    parseFloat(value.toFixed(options.precision));

  const exportData = {
    design_id: stressData.design_id,
    stress_type: stressData.stress_type,
    load_case: stressData.load_case,
    load_pressure_bar: roundValue(stressData.load_pressure_bar),
    export_date: new Date().toISOString(),

    summary: {
      max_stress_mpa: roundValue(stressData.max_stress.value_mpa),
      max_stress_location: {
        r: roundValue(stressData.max_stress.location.r),
        z: roundValue(stressData.max_stress.location.z),
        theta: roundValue(stressData.max_stress.location.theta)
      },
      max_stress_region: stressData.max_stress.region,
      allowable_mpa: roundValue(stressData.max_stress.allowable_mpa),
      margin_percent: roundValue(stressData.max_stress.margin_percent),
      min_stress_mpa: stressData.contour_data ? roundValue(stressData.contour_data.min_value) : null,
      mean_stress_mpa: stressData.contour_data ? calculateMeanStress(stressData.contour_data, options.precision) : null
    },

    contour_data: stressData.contour_data ? {
      type: stressData.contour_data.type,
      colormap: stressData.contour_data.colormap,
      min_value: roundValue(stressData.contour_data.min_value),
      max_value: roundValue(stressData.contour_data.max_value)
    } : null,

    // Include mesh nodes (prefer mesh over legacy nodes)
    nodes: stressData.contour_data?.mesh
      ? stressData.contour_data.mesh.nodes.map(node => ({
          id: node.id,
          r: roundValue(node.r),
          z: roundValue(node.z),
          stress: roundValue(node.stress)
        }))
      : stressData.contour_data?.nodes?.map((node, idx) => ({
          id: idx + 1,
          x: roundValue(node.x),
          y: roundValue(node.y),
          z: roundValue(node.z),
          stress: roundValue(node.value)
        })),

    // Include mesh elements if available
    elements: stressData.contour_data?.mesh?.elements?.map(elem => ({
      id: elem.id,
      nodes: elem.nodes,
      region: elem.region,
      centroid_stress: roundValue(elem.centroid_stress)
    })),

    per_layer_stress: stressData.per_layer_stress?.map(layer => {
      const roundedLayer: Record<string, number | string> = {
        layer: layer.layer,
        type: layer.type
      };

      if (layer.hoop !== undefined) roundedLayer.hoop_mpa = roundValue(layer.hoop);
      if (layer.axial !== undefined) roundedLayer.axial_mpa = roundValue(layer.axial);
      if (layer.shear !== undefined) roundedLayer.shear_mpa = roundValue(layer.shear);

      return roundedLayer;
    }),

    stress_concentration_factor: stressData.stress_concentration_factor
      ? roundValue(stressData.stress_concentration_factor)
      : null
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Calculate mean stress from contour data
 */
function calculateMeanStress(
  contourData: DesignStress['contour_data'],
  precision: number
): number {
  if (!contourData) return 0;

  let sum = 0;
  let count = 0;

  if (contourData.mesh?.nodes) {
    contourData.mesh.nodes.forEach(node => {
      sum += node.stress;
      count++;
    });
  } else if (contourData.nodes) {
    contourData.nodes.forEach(node => {
      sum += node.value;
      count++;
    });
  }

  return count > 0 ? parseFloat((sum / count).toFixed(precision)) : 0;
}

/**
 * Exports per-layer stress breakdown as standalone JSON
 */
export function exportPerLayerStressAsJSON(
  layers: PerLayerStress[],
  designId: string,
  options: ExportOptions
): string {
  const roundValue = (value: number) =>
    parseFloat(value.toFixed(options.precision));

  const exportData = {
    design_id: designId,
    export_date: new Date().toISOString(),
    export_type: 'per_layer_stress',
    layer_count: layers.length,

    layers: layers.map(layer => {
      const roundedLayer: Record<string, number | string> = {
        layer: layer.layer,
        type: layer.type
      };

      if (layer.angle_deg !== undefined) roundedLayer.angle_deg = roundValue(layer.angle_deg);
      if (layer.sigma1_mpa !== undefined) roundedLayer.sigma1_mpa = roundValue(layer.sigma1_mpa);
      if (layer.sigma2_mpa !== undefined) roundedLayer.sigma2_mpa = roundValue(layer.sigma2_mpa);
      if (layer.tau12_mpa !== undefined) roundedLayer.tau12_mpa = roundValue(layer.tau12_mpa);
      if (layer.hoop !== undefined) roundedLayer.hoop_mpa = roundValue(layer.hoop);
      if (layer.axial !== undefined) roundedLayer.axial_mpa = roundValue(layer.axial);
      if (layer.shear !== undefined) roundedLayer.shear_mpa = roundValue(layer.shear);
      if (layer.tsai_wu !== undefined) roundedLayer.tsai_wu = roundValue(layer.tsai_wu);
      if (layer.margin_pct !== undefined) roundedLayer.margin_pct = roundValue(layer.margin_pct);

      return roundedLayer;
    })
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Triggers a file download in the browser
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  // Create blob with BOM for CSV files (ensures proper Excel compatibility)
  const bom = mimeType.includes('csv') ? '\uFEFF' : '';
  const blob = new Blob([bom + content], { type: `${mimeType};charset=utf-8` });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convenience function: Export stress data and trigger download
 */
export function exportAndDownloadStressData(
  stressData: DesignStress,
  format: 'csv' | 'json',
  options?: Partial<ExportOptions>
): void {
  const defaultOptions: ExportOptions = {
    format,
    includeHeader: true,
    precision: 2,
    ...options
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const filename = `stress_${stressData.design_id}_${stressData.load_case}_${timestamp}.${format}`;

  let content: string;
  let mimeType: string;

  if (format === 'csv') {
    content = exportStressDataAsCSV(stressData, defaultOptions);
    mimeType = 'text/csv';
  } else {
    content = exportStressDataAsJSON(stressData, defaultOptions);
    mimeType = 'application/json';
  }

  downloadFile(content, filename, mimeType);
}

/**
 * Convenience function: Export per-layer stress and trigger download
 */
export function exportAndDownloadPerLayerStress(
  layers: PerLayerStress[],
  designId: string,
  format: 'csv' | 'json',
  options?: Partial<ExportOptions>
): void {
  const defaultOptions: ExportOptions = {
    format,
    includeHeader: true,
    precision: 2,
    ...options
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const filename = `per_layer_stress_${designId}_${timestamp}.${format}`;

  let content: string;
  let mimeType: string;

  if (format === 'csv') {
    content = exportPerLayerStressAsCSV(layers, defaultOptions);
    mimeType = 'text/csv';
  } else {
    content = exportPerLayerStressAsJSON(layers, designId, defaultOptions);
    mimeType = 'application/json';
  }

  downloadFile(content, filename, mimeType);
}
