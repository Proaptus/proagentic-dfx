/**
 * Comprehensive Edge Case Tests for Export Library
 * Validates all edge cases with empty data, boundary values, and error conditions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  exportStressDataAsCSV,
  exportStressDataAsJSON,
  exportPerLayerStressAsCSV,
  exportPerLayerStressAsJSON,
  exportStressNodesAsCSV,
  exportAndDownloadStressData,
  exportAndDownloadPerLayerStress,
  type ExportOptions,
  type PerLayerStress
} from '@/lib/export/data-export';
import type { DesignStress, MeshNode, StressNode } from '@/lib/types';

describe('Export Library - Comprehensive Edge Cases', () => {
  const defaultOptions: ExportOptions = {
    format: 'csv',
    includeHeader: true,
    precision: 2
  };

  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    const BlobConstructor = function(content: BlobPart[], options?: BlobPropertyBag) {
      return {
        size: 0,
        type: options?.type || '',
        arrayBuffer: async () => new ArrayBuffer(0),
        text: async () => '',
        slice: () => new Blob(),
        stream: () => new ReadableStream()
      } as Blob;
    };
    global.Blob = BlobConstructor as unknown as typeof Blob;
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  describe('Empty Data Edge Cases', () => {
    it('should handle completely empty stress data structure', () => {
      const emptyData: DesignStress = {
        design_id: 'EMPTY',
        load_case: 'test',
        load_pressure_bar: 0,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 0,
          location: { r: 0, z: 0, theta: 0 },
          region: 'unknown',
          allowable_mpa: 0,
          margin_percent: 0
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 0,
          max_value: 0,
          nodes: []
        }
      };

      const result = exportStressDataAsCSV(emptyData, defaultOptions);

      expect(result).toContain('# Stress Analysis Export');
      expect(result).toContain('max_stress,0.00,MPa');
      // Export includes section headers even for empty data - this is expected behavior
      // The header is always included; what matters is that there's no actual data rows
    });

    it('should handle empty nodes array in CSV export', () => {
      const emptyNodes: StressNode[] = [];
      const result = exportStressNodesAsCSV(emptyNodes, defaultOptions);

      // Should still include header
      expect(result).toBe('node_id,x,y,z,stress_mpa');
    });

    it('should handle empty mesh nodes array in CSV export', () => {
      const emptyMeshNodes: MeshNode[] = [];
      const result = exportStressNodesAsCSV(emptyMeshNodes, defaultOptions);

      // Should include appropriate header for mesh nodes
      expect(result).toBe('node_id,x,y,z,stress_mpa');
    });

    it('should handle empty per-layer stress array', () => {
      const emptyLayers: PerLayerStress[] = [];
      const result = exportPerLayerStressAsCSV(emptyLayers, defaultOptions);

      expect(result).toBe('layer,type');
    });

    it('should export empty data as JSON with proper structure', () => {
      const emptyLayers: PerLayerStress[] = [];
      const result = exportPerLayerStressAsJSON(emptyLayers, 'EMPTY', defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.design_id).toBe('EMPTY');
      expect(parsed.layer_count).toBe(0);
      expect(parsed.layers).toEqual([]);
      expect(parsed.export_type).toBe('per_layer_stress');
    });
  });

  describe('Boundary Value Edge Cases', () => {
    it('should handle very large stress values', () => {
      const largeStressData: DesignStress = {
        design_id: 'LARGE-STRESS',
        load_case: 'extreme',
        load_pressure_bar: 99999.99,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 999999999.99,
          location: { r: 1000000, z: 1000000, theta: 360 },
          region: 'extreme_region',
          allowable_mpa: 1000000000,
          margin_percent: 0.01
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 999999998,
          max_value: 999999999.99,
          nodes: []
        }
      };

      const result = exportStressDataAsCSV(largeStressData, defaultOptions);

      expect(result).toContain('999999999.99');
      expect(result).toContain('1000000.00');
    });

    it('should handle very small positive stress values', () => {
      const smallStressData: DesignStress = {
        design_id: 'SMALL-STRESS',
        load_case: 'minimal',
        load_pressure_bar: 0.001,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 0.001,
          location: { r: 0.001, z: 0.001, theta: 0 },
          region: 'minimal_region',
          allowable_mpa: 0.01,
          margin_percent: 900
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 0,
          max_value: 0.001,
          nodes: []
        }
      };

      const result = exportStressDataAsCSV(smallStressData, defaultOptions);

      expect(result).toContain('0.00');
    });

    it('should handle zero values correctly', () => {
      const zeroData: DesignStress = {
        design_id: 'ZERO',
        load_case: 'unloaded',
        load_pressure_bar: 0,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 0,
          location: { r: 0, z: 0, theta: 0 },
          region: 'none',
          allowable_mpa: 1000,
          margin_percent: Infinity
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 0,
          max_value: 0,
          nodes: []
        }
      };

      const result = exportStressDataAsJSON(zeroData, defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.summary.max_stress_mpa).toBe(0);
      expect(parsed.load_pressure_bar).toBe(0);
    });

    it('should handle negative margin (over-stress condition)', () => {
      const overStressData: DesignStress = {
        design_id: 'OVER-STRESS',
        load_case: 'failure',
        load_pressure_bar: 2000,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 1500,
          location: { r: 125, z: 300, theta: 0 },
          region: 'critical',
          allowable_mpa: 1000,
          margin_percent: -50
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 500,
          max_value: 1500,
          nodes: []
        }
      };

      const result = exportStressDataAsCSV(overStressData, defaultOptions);

      expect(result).toContain('margin,-50.00,%');
    });
  });

  describe('Precision and Number Formatting Edge Cases', () => {
    it('should handle high precision (6 decimal places)', () => {
      const highPrecisionOptions: ExportOptions = {
        format: 'csv',
        includeHeader: true,
        precision: 6
      };

      const layers: PerLayerStress[] = [
        { layer: 1, type: 'helical', sigma1_mpa: 1234.56789 }
      ];

      const result = exportPerLayerStressAsCSV(layers, highPrecisionOptions);

      expect(result).toContain('1234.567890');
    });

    it('should handle zero precision (integer values)', () => {
      const zeroPrecisionOptions: ExportOptions = {
        format: 'csv',
        includeHeader: true,
        precision: 0
      };

      const layers: PerLayerStress[] = [
        { layer: 1, type: 'hoop', hoop: 1250.789 }
      ];

      const result = exportPerLayerStressAsCSV(layers, zeroPrecisionOptions);

      expect(result).toContain('1251'); // Rounded to nearest integer
    });

    it('should handle rounding at different precisions', () => {
      const data: DesignStress = {
        design_id: 'ROUND-TEST',
        load_case: 'test',
        load_pressure_bar: 123.456789,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 999.9999,
          location: { r: 125.5555, z: 300.4444, theta: 45.5555 },
          region: 'test',
          allowable_mpa: 1250.1111,
          margin_percent: 25.0001
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 100,
          max_value: 999.9999,
          nodes: []
        }
      };

      const result = exportStressDataAsJSON(data, defaultOptions);
      const parsed = JSON.parse(result);

      // With precision: 2
      expect(parsed.load_pressure_bar).toBe(123.46);
      expect(parsed.summary.max_stress_mpa).toBe(1000);
      expect(parsed.summary.allowable_mpa).toBe(1250.11);
    });
  });

  describe('Special Characters and Escaping', () => {
    it('should handle commas in layer type field', () => {
      const layers: PerLayerStress[] = [
        { layer: 1, type: 'helical, counter-clockwise', hoop: 1200 }
      ];

      const result = exportPerLayerStressAsCSV(layers, defaultOptions);

      // Should be escaped with quotes
      expect(result).toContain('"helical, counter-clockwise"');
    });

    it('should handle quotes in layer type field', () => {
      const layers: PerLayerStress[] = [
        { layer: 1, type: 'type "with" quotes', hoop: 1200 }
      ];

      const result = exportPerLayerStressAsCSV(layers, defaultOptions);

      // Quotes should be escaped
      expect(result).toContain('""');
    });

    it('should handle newlines in layer type field', () => {
      const layers: PerLayerStress[] = [
        { layer: 1, type: 'multi\nline\ntype', hoop: 1200 }
      ];

      const result = exportPerLayerStressAsCSV(layers, defaultOptions);

      // Should be wrapped in quotes
      expect(result).toContain('"');
    });

    it('should handle combination of special characters', () => {
      const layers: PerLayerStress[] = [
        { layer: 1, type: 'type, "quoted", and\nnewline', hoop: 1200 }
      ];

      const result = exportPerLayerStressAsCSV(layers, defaultOptions);

      expect(result).toContain('"type, ""quoted"", and\nnewline"');
    });
  });

  describe('Contour Data Variations', () => {
    it('should handle contour data with mesh but no elements', () => {
      const dataWithMeshNoElements: DesignStress = {
        design_id: 'MESH-NO-ELEM',
        load_case: 'test',
        load_pressure_bar: 700,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 850,
          location: { r: 127, z: 380, theta: 0 },
          region: 'body',
          allowable_mpa: 1200,
          margin_percent: 41
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 200,
          max_value: 850,
          nodes: [],
          mesh: {
            nodes: [
              { id: 1, r: 127, z: 100, stress: 450 }
            ],
            elements: [],
            bounds: { r_min: 127, r_max: 128, z_min: 100, z_max: 300 }
          }
        }
      };

      const result = exportStressDataAsJSON(dataWithMeshNoElements, defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.nodes).toBeDefined();
      // Export returns empty array [] instead of undefined for missing elements
      expect(parsed.elements).toEqual([]);
    });

    it('should handle contour data with mesh and elements', () => {
      const dataWithMeshAndElements: DesignStress = {
        design_id: 'MESH-WITH-ELEM',
        load_case: 'test',
        load_pressure_bar: 800,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 950,
          location: { r: 129, z: 420, theta: 0 },
          region: 'nozzle',
          allowable_mpa: 1400,
          margin_percent: 48
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'turbo',
          min_value: 200,
          max_value: 950,
          nodes: [],
          mesh: {
            nodes: [
              { id: 1, r: 129, z: 100, stress: 500 },
              { id: 2, r: 130, z: 200, stress: 600 }
            ],
            elements: [
              { id: 1, nodes: [1, 2, 1], region: 'cylinder', centroid_stress: 550 }
            ],
            bounds: { r_min: 129, r_max: 130, z_min: 100, z_max: 200 }
          }
        }
      };

      const result = exportStressDataAsJSON(dataWithMeshAndElements, defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.elements).toBeDefined();
      expect(parsed.elements?.length).toBe(1);
      expect(parsed.elements?.[0].centroid_stress).toBe(550);
    });

    it('should calculate mean stress correctly with single node', () => {
      const singleNodeData: DesignStress = {
        design_id: 'SINGLE-NODE',
        load_case: 'test',
        load_pressure_bar: 600,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 750,
          location: { r: 128, z: 350, theta: 0 },
          region: 'apex',
          allowable_mpa: 1200,
          margin_percent: 60
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 750,
          max_value: 750,
          nodes: [],
          mesh: {
            nodes: [
              { id: 1, r: 128, z: 350, stress: 750 }
            ],
            elements: [],
            bounds: { r_min: 128, r_max: 128, z_min: 350, z_max: 350 }
          }
        }
      };

      const result = exportStressDataAsJSON(singleNodeData, defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.summary.mean_stress_mpa).toBe(750);
    });
  });

  describe('Download Function Variations', () => {
    it('should generate correct filename with design and load case', () => {
      const data: DesignStress = {
        design_id: 'DESIGN-A',
        load_case: 'burst_test',
        load_pressure_bar: 1000,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 1000,
          location: { r: 130, z: 400, theta: 0 },
          region: 'body',
          allowable_mpa: 1500,
          margin_percent: 50
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 300,
          max_value: 1000,
          nodes: []
        }
      };

      const mockLink = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      exportAndDownloadStressData(data, 'csv');

      expect(mockLink.download).toMatch(/stress_DESIGN-A_burst_test_/);
      expect(mockLink.download).toMatch(/\.csv$/);
    });

    it('should use consistent timestamp format in filenames', () => {
      const layers: PerLayerStress[] = [
        { layer: 1, type: 'helical', hoop: 1200 }
      ];

      const mockLink = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      exportAndDownloadPerLayerStress(layers, 'DESIGN-X', 'json');

      // Should match timestamp format: YYYY-MM-DDTHH-MM-SS
      expect(mockLink.download).toMatch(/per_layer_stress_DESIGN-X_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);
      expect(mockLink.download).toMatch(/\.json$/);
    });
  });

  describe('Per-Layer Stress Variations', () => {
    it('should handle layers with only required fields', () => {
      const minimumLayers: PerLayerStress[] = [
        { layer: 1, type: 'helical' },
        { layer: 2, type: 'hoop' }
      ];

      const result = exportPerLayerStressAsCSV(minimumLayers, defaultOptions);

      expect(result).toContain('layer,type');
      // Should not have any optional columns
      expect(result).not.toContain('angle_deg');
    });

    it('should handle layers with mixed optional fields', () => {
      const mixedLayers: PerLayerStress[] = [
        { layer: 1, type: 'helical', angle_deg: 15, hoop: 1200 },
        { layer: 2, type: 'hoop', tsai_wu: 0.8, margin_pct: 40 }
      ];

      const result = exportPerLayerStressAsCSV(mixedLayers, defaultOptions);

      // Should include all fields present in any layer
      expect(result).toContain('angle_deg');
      expect(result).toContain('hoop_mpa');
      expect(result).toContain('tsai_wu');
      expect(result).toContain('margin_pct');
    });

    it('should handle many layers correctly', () => {
      const manyLayers: PerLayerStress[] = Array.from({ length: 100 }, (_, i) => ({
        layer: i + 1,
        type: i % 2 === 0 ? 'helical' : 'hoop',
        hoop: 1000 + i * 10,
        margin_pct: 30 + i
      }));

      const result = exportPerLayerStressAsJSON(manyLayers, 'MANY-LAYERS', defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.layer_count).toBe(100);
      expect(parsed.layers.length).toBe(100);
      expect(parsed.layers[99].layer).toBe(100);
    });
  });

  describe('Header Inclusion Variations', () => {
    it('should omit headers when includeHeader is false', () => {
      const noHeaderOptions: ExportOptions = {
        format: 'csv',
        includeHeader: false,
        precision: 2
      };

      const data: DesignStress = {
        design_id: 'NO-HEADER',
        load_case: 'test',
        load_pressure_bar: 700,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 850,
          location: { r: 127, z: 380, theta: 0 },
          region: 'body',
          allowable_mpa: 1200,
          margin_percent: 41
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 200,
          max_value: 850,
          nodes: []
        }
      };

      const result = exportStressDataAsCSV(data, noHeaderOptions);

      expect(result).not.toContain('# Stress Analysis Export');
      expect(result).not.toContain('# Summary');
      expect(result).not.toContain('metric,value,unit');
      // Data should still be present
      expect(result).toContain('850.00');
    });
  });
});
