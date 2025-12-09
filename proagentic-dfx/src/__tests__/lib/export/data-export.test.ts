/**
 * Tests for Data Export Utilities
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
import type { DesignStress, MeshNode, StressNode } from '@/lib/types';

describe('Data Export - CSV Functions', () => {
  const mockStressData: DesignStress = {
    design_id: 'TEST-001',
    load_case: 'test_pressure',
    load_pressure_bar: 875,
    stress_type: 'vonMises',
    max_stress: {
      value_mpa: 892.7,
      location: { r: 125.5, z: 450.2, theta: 0 },
      region: 'dome_apex',
      allowable_mpa: 1250.0,
      margin_percent: 40.1
    },
    contour_data: {
      type: 'filled_contour',
      colormap: 'jet',
      min_value: 125.3,
      max_value: 892.7,
      nodes: [
        { x: 0, y: 0, z: 100, value: 245.6 },
        { x: 10.5, y: 0, z: 100, value: 248.3 },
        { x: 20.0, y: 0, z: 100, value: 251.0 }
      ],
      mesh: {
        nodes: [
          { id: 1, r: 125.0, z: 0, stress: 245.6 },
          { id: 2, r: 125.5, z: 50, stress: 268.4 },
          { id: 3, r: 126.0, z: 100, stress: 312.8 }
        ],
        elements: [
          { id: 1, nodes: [1, 2, 3], region: 'cylinder', centroid_stress: 275.6 }
        ],
        bounds: { r_min: 125, r_max: 126, z_min: 0, z_max: 100 }
      }
    },
    per_layer_stress: [
      { layer: 1, type: 'helical', hoop: 1250.3, axial: 45.2, shear: 23.1 },
      { layer: 2, type: 'hoop', hoop: 1180.5, axial: 52.1, shear: 18.4 }
    ]
  };

  const defaultOptions: ExportOptions = {
    format: 'csv',
    includeHeader: true,
    precision: 2
  };

  describe('exportStressNodesAsCSV', () => {
    it('should export MeshNode data with header', () => {
      const result = exportStressNodesAsCSV(
        mockStressData.contour_data.mesh!.nodes,
        defaultOptions
      );

      expect(result).toContain('node_id,r,z,stress_mpa');
      expect(result).toContain('1,125.00,0.00,245.60');
      expect(result).toContain('2,125.50,50.00,268.40');
      expect(result).toContain('3,126.00,100.00,312.80');
    });

    it('should export StressNode data with header', () => {
      const result = exportStressNodesAsCSV(
        mockStressData.contour_data.nodes,
        defaultOptions
      );

      expect(result).toContain('node_id,x,y,z,stress_mpa');
      expect(result).toContain('1,0.00,0.00,100.00,245.60');
      expect(result).toContain('2,10.50,0.00,100.00,248.30');
    });

    it('should respect precision setting', () => {
      const highPrecisionOptions: ExportOptions = {
        ...defaultOptions,
        precision: 4
      };

      const result = exportStressNodesAsCSV(
        mockStressData.contour_data.mesh!.nodes,
        highPrecisionOptions
      );

      expect(result).toContain('1,125.0000,0.0000,245.6000');
    });

    it('should omit header when requested', () => {
      const noHeaderOptions: ExportOptions = {
        ...defaultOptions,
        includeHeader: false
      };

      const result = exportStressNodesAsCSV(
        mockStressData.contour_data.mesh!.nodes,
        noHeaderOptions
      );

      expect(result).not.toContain('node_id');
      expect(result).toContain('1,125.00,0.00,245.60');
    });
  });

  describe('exportPerLayerStressAsCSV', () => {
    const mockLayers: PerLayerStress[] = [
      {
        layer: 1,
        type: 'helical',
        angle_deg: 14.2,
        sigma1_mpa: 1250.3,
        sigma2_mpa: 45.2,
        tau12_mpa: 23.1,
        tsai_wu: 0.72,
        margin_pct: 28.5
      },
      {
        layer: 2,
        type: 'hoop',
        angle_deg: 88.0,
        sigma1_mpa: 1180.5,
        sigma2_mpa: 52.1,
        tau12_mpa: 18.4,
        tsai_wu: 0.65,
        margin_pct: 35.2
      }
    ];

    it('should export per-layer data with all columns', () => {
      const result = exportPerLayerStressAsCSV(mockLayers, defaultOptions);

      expect(result).toContain('layer,type,angle_deg,sigma1_mpa,sigma2_mpa,tau12_mpa,tsai_wu,margin_pct');
      expect(result).toContain('1,helical,14.20,1250.30,45.20,23.10,0.72,28.50');
      expect(result).toContain('2,hoop,88.00,1180.50,52.10,18.40,0.65,35.20');
    });

    it('should handle partial data gracefully', () => {
      const partialLayers: PerLayerStress[] = [
        { layer: 1, type: 'helical', hoop: 1250.3, axial: 45.2 },
        { layer: 2, type: 'hoop', hoop: 1180.5, axial: 52.1 }
      ];

      const result = exportPerLayerStressAsCSV(partialLayers, defaultOptions);

      expect(result).toContain('layer,type,hoop_mpa,axial_mpa');
      expect(result).not.toContain('sigma1_mpa');
    });

    it('should escape special characters in type field', () => {
      const layersWithSpecialChars: PerLayerStress[] = [
        { layer: 1, type: 'helical, wound', hoop: 1250.3, axial: 45.2 }
      ];

      const result = exportPerLayerStressAsCSV(layersWithSpecialChars, defaultOptions);

      expect(result).toContain('"helical, wound"');
    });
  });

  describe('exportStressDataAsCSV', () => {
    it('should export complete stress data with all sections', () => {
      const result = exportStressDataAsCSV(mockStressData, defaultOptions);

      // Check metadata section
      expect(result).toContain('# Stress Analysis Export');
      expect(result).toContain('# Design ID: TEST-001');
      expect(result).toContain('# Load Case: test_pressure');
      expect(result).toContain('# Load Pressure: 875 bar');

      // Check summary section
      expect(result).toContain('# Summary');
      expect(result).toContain('max_stress,892.70,MPa');
      expect(result).toContain('margin,40.10,%');

      // Check stress nodes section
      expect(result).toContain('# Stress Field Data');
      expect(result).toContain('node_id,r,z,stress_mpa');

      // Check per-layer section
      expect(result).toContain('# Per-Layer Stress');
      expect(result).toContain('layer,type,hoop_mpa,axial_mpa,shear_mpa');
    });

    it('should handle missing per_layer_stress', () => {
      const dataWithoutLayers = { ...mockStressData, per_layer_stress: undefined };
      const result = exportStressDataAsCSV(dataWithoutLayers, defaultOptions);

      expect(result).not.toContain('# Per-Layer Stress');
      expect(result).toContain('# Stress Field Data');
    });

    it('should omit metadata when header is disabled', () => {
      const noHeaderOptions: ExportOptions = {
        ...defaultOptions,
        includeHeader: false
      };

      const result = exportStressDataAsCSV(mockStressData, noHeaderOptions);

      expect(result).not.toContain('# Stress Analysis Export');
      expect(result).not.toContain('# Design ID');
    });
  });
});

describe('Data Export - JSON Functions', () => {
  const mockStressData: DesignStress = {
    design_id: 'TEST-002',
    load_case: 'burst',
    load_pressure_bar: 2100,
    stress_type: 'vonMises',
    max_stress: {
      value_mpa: 1892.7,
      location: { r: 125.5, z: 450.2, theta: 0 },
      region: 'boss_transition',
      allowable_mpa: 2250.0,
      margin_percent: 18.9
    },
    contour_data: {
      type: 'filled_contour',
      colormap: 'turbo',
      min_value: 325.3,
      max_value: 1892.7,
      nodes: [
        { x: 0, y: 0, z: 100, value: 545.6 },
        { x: 10.5, y: 0, z: 100, value: 548.3 }
      ]
    },
    per_layer_stress: [
      { layer: 1, type: 'helical', hoop: 1850.3, axial: 145.2, shear: 123.1 }
    ],
    stress_concentration_factor: 1.45
  };

  const defaultOptions: ExportOptions = {
    format: 'json',
    includeHeader: true,
    precision: 2
  };

  describe('exportStressDataAsJSON', () => {
    it('should export valid JSON structure', () => {
      const result = exportStressDataAsJSON(mockStressData, defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.design_id).toBe('TEST-002');
      expect(parsed.stress_type).toBe('vonMises');
      expect(parsed.load_case).toBe('burst');
      expect(parsed.load_pressure_bar).toBe(2100);
      expect(parsed.export_date).toBeDefined();
    });

    it('should include summary with rounded values', () => {
      const result = exportStressDataAsJSON(mockStressData, defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.summary.max_stress_mpa).toBe(1892.7);
      expect(parsed.summary.margin_percent).toBe(18.9);
      expect(parsed.summary.allowable_mpa).toBe(2250);
      expect(parsed.summary.max_stress_region).toBe('boss_transition');
    });

    it('should include nodes with rounded coordinates', () => {
      const result = exportStressDataAsJSON(mockStressData, defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.nodes).toHaveLength(2);
      expect(parsed.nodes[0]).toEqual({
        id: 1,
        x: 0,
        y: 0,
        z: 100,
        stress: 545.6
      });
    });

    it('should include per-layer stress', () => {
      const result = exportStressDataAsJSON(mockStressData, defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.per_layer_stress).toHaveLength(1);
      expect(parsed.per_layer_stress[0]).toEqual({
        layer: 1,
        type: 'helical',
        hoop_mpa: 1850.3,
        axial_mpa: 145.2,
        shear_mpa: 123.1
      });
    });

    it('should respect precision setting', () => {
      const highPrecisionOptions: ExportOptions = {
        ...defaultOptions,
        precision: 4
      };

      const result = exportStressDataAsJSON(mockStressData, highPrecisionOptions);
      const parsed = JSON.parse(result);

      // Check that values have proper precision
      expect(parsed.summary.max_stress_mpa).toBe(1892.7);
      expect(typeof parsed.summary.max_stress_mpa).toBe('number');
    });

    it('should include stress concentration factor', () => {
      const result = exportStressDataAsJSON(mockStressData, defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.stress_concentration_factor).toBe(1.45);
    });

    it('should calculate mean stress from nodes', () => {
      const result = exportStressDataAsJSON(mockStressData, defaultOptions);
      const parsed = JSON.parse(result);

      // Mean of 545.6 and 548.3 = 546.95 ≈ 546.95
      expect(parsed.summary.mean_stress_mpa).toBeCloseTo(546.95, 1);
    });
  });

  describe('exportPerLayerStressAsJSON', () => {
    const mockLayers: PerLayerStress[] = [
      {
        layer: 1,
        type: 'helical',
        angle_deg: 14.2,
        sigma1_mpa: 1250.3,
        sigma2_mpa: 45.2,
        tau12_mpa: 23.1
      },
      {
        layer: 2,
        type: 'hoop',
        angle_deg: 88.0,
        sigma1_mpa: 1180.5,
        sigma2_mpa: 52.1,
        tau12_mpa: 18.4
      }
    ];

    it('should export valid JSON with metadata', () => {
      const result = exportPerLayerStressAsJSON(mockLayers, 'TEST-003', defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.design_id).toBe('TEST-003');
      expect(parsed.export_type).toBe('per_layer_stress');
      expect(parsed.layer_count).toBe(2);
      expect(parsed.export_date).toBeDefined();
    });

    it('should include all layer data with proper rounding', () => {
      const result = exportPerLayerStressAsJSON(mockLayers, 'TEST-003', defaultOptions);
      const parsed = JSON.parse(result);

      expect(parsed.layers).toHaveLength(2);
      expect(parsed.layers[0]).toEqual({
        layer: 1,
        type: 'helical',
        angle_deg: 14.2,
        sigma1_mpa: 1250.3,
        sigma2_mpa: 45.2,
        tau12_mpa: 23.1
      });
    });
  });
});

describe('Data Export - Download Functions', () => {
  beforeEach(() => {
    // Mock DOM APIs
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock Blob constructor
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

    // Mock document methods
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  describe('downloadFile', () => {
    it('should create blob and trigger download', () => {
      const mockClick = vi.fn();
      const mockLink = {
        href: '',
        download: '',
        click: mockClick
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      downloadFile('test content', 'test.csv', 'text/csv');

      expect(mockLink.download).toBe('test.csv');
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockClick).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should add BOM for CSV files', () => {
      let capturedContent = '';
      const BlobConstructor = function(content: BlobPart[]) {
        capturedContent = content[0] as string;
        return {} as Blob;
      };
      global.Blob = BlobConstructor as unknown as typeof Blob;

      const mockClick = vi.fn();
      const mockLink = {
        href: '',
        download: '',
        click: mockClick
      } as unknown as HTMLAnchorElement;
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      downloadFile('test content', 'test.csv', 'text/csv');

      expect(capturedContent).toContain('\uFEFF');
      expect(capturedContent).toContain('test content');
    });

    it('should not add BOM for JSON files', () => {
      let capturedContent = '';
      const BlobConstructor = function(content: BlobPart[]) {
        capturedContent = content[0] as string;
        return {} as Blob;
      };
      global.Blob = BlobConstructor as unknown as typeof Blob;

      const mockClick = vi.fn();
      const mockLink = {
        href: '',
        download: '',
        click: mockClick
      } as unknown as HTMLAnchorElement;
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      downloadFile('{"test": "content"}', 'test.json', 'application/json');

      expect(capturedContent).not.toContain('\uFEFF');
      expect(capturedContent).toBe('{"test": "content"}');
    });
  });

  describe('exportAndDownloadStressData', () => {
    const mockStressData: DesignStress = {
      design_id: 'TEST-DL',
      load_case: 'test',
      load_pressure_bar: 875,
      stress_type: 'vonMises',
      max_stress: {
        value_mpa: 892.7,
        location: { r: 125.5, z: 450.2, theta: 0 },
        region: 'dome_apex',
        allowable_mpa: 1250.0,
        margin_percent: 40.1
      },
      contour_data: {
        type: 'filled_contour',
        colormap: 'jet',
        min_value: 125.3,
        max_value: 892.7,
        nodes: [
          { x: 0, y: 0, z: 100, value: 245.6 }
        ]
      }
    };

    it('should export and download CSV', () => {
      const mockClick = vi.fn();
      const mockLink = {
        href: '',
        download: '',
        click: mockClick
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      exportAndDownloadStressData(mockStressData, 'csv');

      expect(mockLink.download).toMatch(/stress_TEST-DL_test_.*\.csv/);
      expect(mockClick).toHaveBeenCalled();
    });

    it('should export and download JSON', () => {
      const mockClick = vi.fn();
      const mockLink = {
        href: '',
        download: '',
        click: mockClick
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      exportAndDownloadStressData(mockStressData, 'json');

      expect(mockLink.download).toMatch(/stress_TEST-DL_test_.*\.json/);
      expect(mockClick).toHaveBeenCalled();
    });

    it('should use custom options', () => {
      const mockClick = vi.fn();
      const mockLink = {
        href: '',
        download: '',
        click: mockClick
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      exportAndDownloadStressData(mockStressData, 'csv', { precision: 4 });

      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('exportAndDownloadPerLayerStress', () => {
    const mockLayers: PerLayerStress[] = [
      { layer: 1, type: 'helical', hoop: 1250.3, axial: 45.2, shear: 23.1 }
    ];

    it('should export and download per-layer CSV', () => {
      const mockClick = vi.fn();
      const mockLink = {
        href: '',
        download: '',
        click: mockClick
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      exportAndDownloadPerLayerStress(mockLayers, 'TEST-PL', 'csv');

      expect(mockLink.download).toMatch(/per_layer_stress_TEST-PL_.*\.csv/);
      expect(mockClick).toHaveBeenCalled();
    });

    it('should export and download per-layer JSON', () => {
      const mockClick = vi.fn();
      const mockLink = {
        href: '',
        download: '',
        click: mockClick
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      exportAndDownloadPerLayerStress(mockLayers, 'TEST-PL', 'json');

      expect(mockLink.download).toMatch(/per_layer_stress_TEST-PL_.*\.json/);
      expect(mockClick).toHaveBeenCalled();
    });
  });
});

describe('Data Export - Edge Cases', () => {
  const defaultOptions: ExportOptions = {
    format: 'csv',
    includeHeader: true,
    precision: 2
  };

  it('should handle empty nodes array', () => {
    const result = exportStressNodesAsCSV([], defaultOptions);
    expect(result).toBe('node_id,x,y,z,stress_mpa');
  });

  it('should handle empty layers array', () => {
    const result = exportPerLayerStressAsCSV([], defaultOptions);
    expect(result).toBe('layer,type');
  });

  it('should handle very large numbers', () => {
    const largeNodes: MeshNode[] = [
      { id: 1, r: 999999.123456, z: 888888.654321, stress: 7777.888999 }
    ];

    const result = exportStressNodesAsCSV(largeNodes, { ...defaultOptions, precision: 3 });

    expect(result).toContain('999999.123');
    expect(result).toContain('888888.654');
    expect(result).toContain('7777.889');
  });

  it('should handle very small numbers', () => {
    const smallNodes: MeshNode[] = [
      { id: 1, r: 0.000123, z: 0.000456, stress: 0.000789 }
    ];

    const result = exportStressNodesAsCSV(smallNodes, { ...defaultOptions, precision: 6 });

    expect(result).toContain('0.000123');
    expect(result).toContain('0.000456');
    expect(result).toContain('0.000789');
  });

  it('should handle special characters in string fields', () => {
    const layers: PerLayerStress[] = [
      { layer: 1, type: 'helical, "special", with\nnewline', hoop: 1000 }
    ];

    const result = exportPerLayerStressAsCSV(layers, defaultOptions);

    // Should escape quotes and wrap in quotes due to special chars
    expect(result).toContain('"helical, ""special"", with\nnewline"');
  });
});
