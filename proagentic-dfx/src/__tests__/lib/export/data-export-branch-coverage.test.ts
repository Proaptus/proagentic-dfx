/**
 * Data Export Branch Coverage Tests
 * Focus on uncovered branches and edge cases for improved coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  exportStressDataAsCSV,
  exportStressDataAsJSON,
  exportPerLayerStressAsCSV,
  exportPerLayerStressAsJSON,
  exportStressNodesAsCSV,
  downloadFile,
  exportAndDownloadStressData,
  exportAndDownloadPerLayerStress,
  type ExportOptions,
  type PerLayerStress
} from '@/lib/export/data-export';
import type { DesignStress } from '@/lib/types';

describe('Data Export - Branch Coverage', () => {
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

  describe('exportStressDataAsCSV - Format Branches', () => {
    // Test all export format paths
    it('should export CSV with all data sections present', () => {
      const mockData: DesignStress = {
        design_id: 'FULL-TEST',
        load_case: 'pressure_test',
        load_pressure_bar: 950,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 1000.5,
          location: { r: 130, z: 400, theta: 45 },
          region: 'cylinder_weld',
          allowable_mpa: 1350,
          margin_percent: 35
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 100,
          max_value: 1000.5,
          nodes: [],
          mesh: {
            nodes: [
              { id: 1, r: 130, z: 100, stress: 450 },
              { id: 2, r: 131, z: 200, stress: 550 }
            ],
            elements: [
              { id: 1, nodes: [1, 2, 1], region: 'cylinder', centroid_stress: 500 }
            ],
            bounds: { r_min: 130, r_max: 131, z_min: 100, z_max: 200 }
          }
        },
        per_layer_stress: [
          { layer: 1, type: 'helical', hoop: 1200, axial: 50, shear: 25 }
        ]
      };

      const result = exportStressDataAsCSV(mockData, defaultOptions);

      expect(result).toContain('# Stress Analysis Export');
      expect(result).toContain('# Design ID: FULL-TEST');
      expect(result).toContain('max_stress,1000.50,MPa');
      expect(result).toContain('# Per-Layer Stress');
    });

    it('should handle CSV export without contour_data', () => {
      // Test case: contour_data is completely absent (undefined)
      // This should NOT output "# Stress Field Data" section
      const mockData = {
        design_id: 'NO-CONTOUR',
        load_case: 'test',
        load_pressure_bar: 500,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 800,
          location: { r: 125, z: 300, theta: 0 },
          region: 'boss',
          allowable_mpa: 1000,
          margin_percent: 25
        }
        // No contour_data property at all
      } as unknown as DesignStress;

      const result = exportStressDataAsCSV(mockData, defaultOptions);

      expect(result).toContain('# Summary');
      expect(result).toContain('margin,25.00,%');
      expect(result).not.toContain('# Stress Field Data');
    });

    it('should export CSV without per_layer_stress', () => {
      const mockData: DesignStress = {
        design_id: 'NO-LAYERS',
        load_case: 'test',
        load_pressure_bar: 600,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 750,
          location: { r: 128, z: 350, theta: 90 },
          region: 'apex',
          allowable_mpa: 1200,
          margin_percent: 60
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'viridis',
          min_value: 200,
          max_value: 750,
          nodes: [
            { x: 0, y: 0, z: 100, value: 300 }
          ],
          mesh: {
            nodes: [],
            elements: [],
            bounds: { r_min: 0, r_max: 1, z_min: 100, z_max: 200 }
          }
        }
      };

      const result = exportStressDataAsCSV(mockData, defaultOptions);

      expect(result).toContain('# Stress Field Data');
      expect(result).not.toContain('# Per-Layer Stress');
    });

    it('should prefer mesh nodes over legacy nodes', () => {
      const mockData: DesignStress = {
        design_id: 'MESH-PREFER',
        load_case: 'test',
        load_pressure_bar: 700,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 900,
          location: { r: 127, z: 380, theta: 0 },
          region: 'transition',
          allowable_mpa: 1300,
          margin_percent: 44
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 150,
          max_value: 900,
          nodes: [
            { x: 0, y: 0, z: 100, value: 400 }
          ],
          mesh: {
            nodes: [
              { id: 1, r: 127, z: 100, stress: 450 },
              { id: 2, r: 128, z: 200, stress: 550 }
            ],
            elements: [
              { id: 1, nodes: [1, 2, 1], region: 'cylinder', centroid_stress: 500 }
            ],
            bounds: { r_min: 127, r_max: 128, z_min: 100, z_max: 200 }
          }
        }
      };

      const result = exportStressDataAsCSV(mockData, defaultOptions);

      // Should use mesh nodes (have r,z format) not legacy nodes (have x,y,z)
      expect(result).toContain('node_id,r,z,stress_mpa');
      expect(result).toContain('1,127.00,100.00,450.00');
    });

    it('should use legacy nodes when mesh not available', () => {
      // Test case: mesh property is NOT present, so legacy nodes (x,y,z format) should be used
      // The implementation checks: if (contour_data.mesh) then use mesh.nodes, else use nodes
      const mockData: DesignStress = {
        design_id: 'LEGACY-NODES',
        load_case: 'test',
        load_pressure_bar: 500,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 700,
          location: { r: 126, z: 300, theta: 0 },
          region: 'body',
          allowable_mpa: 1000,
          margin_percent: 43
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 100,
          max_value: 700,
          nodes: [
            { x: 10, y: 20, z: 100, value: 350 },
            { x: 11, y: 21, z: 200, value: 400 }
          ]
          // NO mesh property - this triggers the legacy nodes path
        }
      };

      const result = exportStressDataAsCSV(mockData, defaultOptions);

      expect(result).toContain('node_id,x,y,z,stress_mpa');
      expect(result).toContain('1,10.00,20.00,100.00,350.00');
    });
  });

  describe('exportStressDataAsJSON - Format Branches', () => {
    it('should export JSON with mesh elements', () => {
      const mockData: DesignStress = {
        design_id: 'JSON-MESH',
        load_case: 'test',
        load_pressure_bar: 800,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 950,
          location: { r: 129, z: 420, theta: 30 },
          region: 'nozzle',
          allowable_mpa: 1400,
          margin_percent: 48
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 200,
          max_value: 950,
          nodes: [],
          mesh: {
            nodes: [
              { id: 1, r: 129, z: 100, stress: 500 }
            ],
            elements: [
              { id: 1, nodes: [1, 1, 1], region: 'cylinder', centroid_stress: 500 }
            ],
            bounds: { r_min: 129, r_max: 130, z_min: 100, z_max: 300 }
          }
        },
        stress_concentration_factor: 1.8
      };

      const result = exportStressDataAsJSON(mockData, defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.elements).toBeDefined();
      expect(parsed.elements.length).toBe(1);
      expect(parsed.stress_concentration_factor).toBe(1.8);
    });

    it('should export JSON without stress_concentration_factor', () => {
      const mockData: DesignStress = {
        design_id: 'JSON-NO-SCF',
        load_case: 'test',
        load_pressure_bar: 600,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 850,
          location: { r: 128, z: 400, theta: 0 },
          region: 'body',
          allowable_mpa: 1250,
          margin_percent: 47
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 150,
          max_value: 850,
          nodes: [
            { x: 5, y: 10, z: 50, value: 425 }
          ],
          mesh: {
            nodes: [],
            elements: [],
            bounds: { r_min: 0, r_max: 1, z_min: 50, z_max: 100 }
          }
        }
      };

      const result = exportStressDataAsJSON(mockData, defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.stress_concentration_factor).toBeNull();
    });

    it('should handle min/mean stress calculation with mesh nodes', () => {
      const mockData: DesignStress = {
        design_id: 'JSON-STATS',
        load_case: 'test',
        load_pressure_bar: 750,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 900,
          location: { r: 127, z: 380, theta: 0 },
          region: 'transition',
          allowable_mpa: 1300,
          margin_percent: 44
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 200,
          max_value: 900,
          nodes: [],
          mesh: {
            nodes: [
              { id: 1, r: 127, z: 100, stress: 300 },
              { id: 2, r: 128, z: 200, stress: 500 },
              { id: 3, r: 129, z: 300, stress: 700 }
            ],
            elements: [
              { id: 1, nodes: [1, 2, 3], region: 'cylinder', centroid_stress: 500 }
            ],
            bounds: { r_min: 127, r_max: 129, z_min: 100, z_max: 300 }
          }
        }
      };

      const result = exportStressDataAsJSON(mockData, defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.summary.min_stress_mpa).toBe(200);
      // Mean of 300, 500, 700 = 500
      expect(parsed.summary.mean_stress_mpa).toBeCloseTo(500, 1);
    });

    it('should handle JSON with legacy nodes and calculate statistics', () => {
      // When mesh is NOT present, legacy nodes with x,y,z format are used
      const mockData: DesignStress = {
        design_id: 'JSON-LEGACY',
        load_case: 'test',
        load_pressure_bar: 650,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 820,
          location: { r: 126, z: 370, theta: 45 },
          region: 'boss',
          allowable_mpa: 1100,
          margin_percent: 34
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'viridis',
          min_value: 180,
          max_value: 820,
          nodes: [
            { x: 8, y: 15, z: 120, value: 400 },
            { x: 9, y: 16, z: 220, value: 600 }
          ]
          // No mesh property - so legacy nodes will be used
        }
      };

      const result = exportStressDataAsJSON(mockData, defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.nodes[0]).toHaveProperty('x');
      expect(parsed.nodes[0]).toHaveProperty('y');
      expect(parsed.nodes[0]).toHaveProperty('z');
      expect(parsed.summary.mean_stress_mpa).toBeCloseTo(500, 1);
    });

    it('should return empty nodes array when mesh exists but has no nodes', () => {
      // When mesh property exists (even with empty nodes), the implementation
      // returns an empty array, not undefined
      const mockData: DesignStress = {
        design_id: 'JSON-NO-NODES',
        load_case: 'test',
        load_pressure_bar: 500,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 700,
          location: { r: 124, z: 300, theta: 0 },
          region: 'cap',
          allowable_mpa: 1000,
          margin_percent: 43
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 100,
          max_value: 700,
          nodes: [],
          mesh: {
            nodes: [],
            elements: [],
            bounds: { r_min: 0, r_max: 1, z_min: 0, z_max: 100 }
          }
        }
      };

      const result = exportStressDataAsJSON(mockData, defaultOptions);
      const parsed = JSON.parse(result);

      // When mesh exists, it returns empty array (mapped from empty mesh.nodes)
      expect(parsed.nodes).toEqual([]);
    });
  });

  describe('exportPerLayerStressAsCSV - Field Branches', () => {
    it('should export all optional fields when present', () => {
      const layers: PerLayerStress[] = [
        {
          layer: 1,
          type: 'helical',
          angle_deg: 20,
          sigma1_mpa: 1300,
          sigma2_mpa: 60,
          tau12_mpa: 30,
          hoop: 1250,
          axial: 50,
          shear: 25,
          tsai_wu: 0.75,
          margin_pct: 33
        }
      ];

      const result = exportPerLayerStressAsCSV(layers, defaultOptions);

      expect(result).toContain('layer,type,angle_deg,sigma1_mpa,sigma2_mpa,tau12_mpa,hoop_mpa,axial_mpa,shear_mpa,tsai_wu,margin_pct');
    });

    it('should export only available fields (sparse data)', () => {
      const layers: PerLayerStress[] = [
        { layer: 1, type: 'hoop', hoop: 1100, margin_pct: 45 }
      ];

      const result = exportPerLayerStressAsCSV(layers, defaultOptions);

      expect(result).toContain('layer,type,hoop_mpa,margin_pct');
      expect(result).not.toContain('sigma1_mpa');
      expect(result).not.toContain('angle_deg');
    });

    it('should dynamically detect which columns to include', () => {
      const layers: PerLayerStress[] = [
        { layer: 1, type: 'helical', angle_deg: 15, hoop: 1200 },
        { layer: 2, type: 'hoop', sigma1_mpa: 1250 }
      ];

      const result = exportPerLayerStressAsCSV(layers, defaultOptions);

      // Should include all fields from both layers
      expect(result).toContain('angle_deg');
      expect(result).toContain('sigma1_mpa');
      expect(result).toContain('hoop_mpa');
    });
  });

  describe('exportPerLayerStressAsJSON - Field Branches', () => {
    it('should include all optional fields in JSON export', () => {
      const layers: PerLayerStress[] = [
        {
          layer: 1,
          type: 'helical',
          angle_deg: 22.5,
          sigma1_mpa: 1350,
          sigma2_mpa: 65,
          tau12_mpa: 32,
          hoop: 1280,
          axial: 55,
          shear: 28,
          tsai_wu: 0.78,
          margin_pct: 36
        }
      ];

      const result = exportPerLayerStressAsJSON(layers, 'DESIGN-FULL', defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.layers[0]).toHaveProperty('angle_deg');
      expect(parsed.layers[0]).toHaveProperty('sigma1_mpa');
      expect(parsed.layers[0]).toHaveProperty('hoop_mpa');
      expect(parsed.layers[0]).toHaveProperty('tsai_wu');
    });

    it('should omit undefined fields in JSON', () => {
      const layers: PerLayerStress[] = [
        { layer: 1, type: 'hoop', hoop: 1150 }
      ];

      const result = exportPerLayerStressAsJSON(layers, 'DESIGN-SPARSE', defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.layers[0]).toHaveProperty('layer');
      expect(parsed.layers[0]).toHaveProperty('type');
      expect(parsed.layers[0]).toHaveProperty('hoop_mpa');
      expect(parsed.layers[0]).not.toHaveProperty('sigma1_mpa');
    });
  });

  describe('downloadFile - Format Branches', () => {
    it('should add BOM to CSV files', () => {
      let capturedContent = '';
      const BlobConstructor = function(content: BlobPart[]) {
        capturedContent = content[0] as string;
        return {} as Blob;
      };
      global.Blob = BlobConstructor as unknown as typeof Blob;

      const mockLink = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      downloadFile('col1,col2\n1,2', 'data.csv', 'text/csv');

      expect(capturedContent).toContain('\uFEFF');
    });

    it('should not add BOM to JSON files', () => {
      let capturedContent = '';
      const BlobConstructor = function(content: BlobPart[]) {
        capturedContent = content[0] as string;
        return {} as Blob;
      };
      global.Blob = BlobConstructor as unknown as typeof Blob;

      const mockLink = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      downloadFile('{"key":"value"}', 'data.json', 'application/json');

      expect(capturedContent).not.toContain('\uFEFF');
    });
  });

  describe('exportAndDownloadStressData - Format Branches', () => {
    it('should export and download as CSV', () => {
      const mockData: DesignStress = {
        design_id: 'DL-CSV',
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
          min_value: 100,
          max_value: 850,
          nodes: []
        }
      };

      const mockLink = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      exportAndDownloadStressData(mockData, 'csv');

      expect(mockLink.download).toMatch(/\.csv$/);
    });

    it('should export and download as JSON', () => {
      const mockData: DesignStress = {
        design_id: 'DL-JSON',
        load_case: 'burst',
        load_pressure_bar: 950,
        stress_type: 'vonMises',
        max_stress: {
          value_mpa: 1050,
          location: { r: 130, z: 450, theta: 90 },
          region: 'nozzle',
          allowable_mpa: 1500,
          margin_percent: 43
        },
        contour_data: {
          type: 'filled_contour',
          colormap: 'jet',
          min_value: 200,
          max_value: 1050,
          nodes: []
        }
      };

      const mockLink = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      exportAndDownloadStressData(mockData, 'json');

      expect(mockLink.download).toMatch(/\.json$/);
    });
  });

  describe('exportAndDownloadPerLayerStress - Format Branches', () => {
    it('should export and download per-layer as CSV', () => {
      const layers: PerLayerStress[] = [
        { layer: 1, type: 'helical', hoop: 1300, axial: 60 }
      ];

      const mockLink = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      exportAndDownloadPerLayerStress(layers, 'DESIGN-PL', 'csv');

      expect(mockLink.download).toMatch(/per_layer_stress.*\.csv$/);
    });

    it('should export and download per-layer as JSON', () => {
      const layers: PerLayerStress[] = [
        { layer: 1, type: 'hoop', hoop: 1200, axial: 50 },
        { layer: 2, type: 'helical', hoop: 1150, axial: 55 }
      ];

      const mockLink = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      exportAndDownloadPerLayerStress(layers, 'DESIGN-PL', 'json');

      expect(mockLink.download).toMatch(/per_layer_stress.*\.json$/);
    });
  });

  describe('Empty Data Handling', () => {
    it('should handle empty nodes array in CSV', () => {
      const result = exportStressNodesAsCSV([], defaultOptions);
      expect(result).toBe('node_id,x,y,z,stress_mpa');
    });

    it('should handle empty layers array in CSV', () => {
      const result = exportPerLayerStressAsCSV([], defaultOptions);
      expect(result).toBe('layer,type');
    });

    it('should handle empty layers in JSON', () => {
      const result = exportPerLayerStressAsJSON([], 'EMPTY', defaultOptions);
      const parsed = JSON.parse(result);
      expect(parsed.layer_count).toBe(0);
      expect(parsed.layers).toEqual([]);
    });
  });
});
