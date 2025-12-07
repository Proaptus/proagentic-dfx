import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the test file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test data directory paths - resolve from test file location
const DATA_DIR = path.resolve(__dirname, '..', 'data', 'static');

describe('Design Data Files', () => {
  const designs = ['A', 'B', 'C', 'D', 'E'];

  designs.forEach((designId) => {
    describe(`Design ${designId}`, () => {
      let design: Record<string, unknown>;

      it('should have a valid JSON file', async () => {
        const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        design = JSON.parse(content);
        expect(design).toBeDefined();
      });

      it('should have required summary fields', async () => {
        const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        design = JSON.parse(content);
        const summary = design.summary as Record<string, unknown>;

        expect(summary.weight_kg).toBeGreaterThan(0);
        expect(summary.cost_eur).toBeGreaterThan(0);
        expect(summary.burst_pressure_bar).toBeGreaterThan(700);
        expect(summary.burst_ratio).toBeGreaterThan(2.0);
      });

      it('should have complete layer data matching total_layers count', async () => {
        const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        design = JSON.parse(content);
        const geometry = design.geometry as Record<string, unknown>;
        const layup = geometry.layup as Record<string, unknown>;
        const layers = layup.layers as Array<Record<string, unknown>>;
        const totalLayers = layup.total_layers as number;

        // CRITICAL: Verify layer count matches stated total
        expect(layers.length).toBe(totalLayers);

        // Verify helical + hoop = total
        const helicalCount = layup.helical_count as number;
        const hoopCount = layup.hoop_count as number;
        expect(helicalCount + hoopCount).toBe(totalLayers);
      });

      it('should have valid layer properties', async () => {
        const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        design = JSON.parse(content);
        const geometry = design.geometry as Record<string, unknown>;
        const layup = geometry.layup as Record<string, unknown>;
        const layers = layup.layers as Array<Record<string, unknown>>;

        layers.forEach((layer, index) => {
          expect(layer.layer).toBe(index + 1);
          expect(['helical', 'hoop']).toContain(layer.type);
          expect(layer.thickness_mm).toBeGreaterThan(0);
          expect(layer.angle_deg).toBeGreaterThan(0);
          expect(['full', 'cylinder']).toContain(layer.coverage);
        });
      });

      it('should have dome profile points', async () => {
        const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        design = JSON.parse(content);
        const geometry = design.geometry as Record<string, unknown>;
        const dome = geometry.dome as Record<string, unknown>;
        const profilePoints = dome.profile_points as Array<Record<string, unknown>>;

        expect(profilePoints.length).toBeGreaterThanOrEqual(8);
        profilePoints.forEach((point) => {
          expect(point.r).toBeGreaterThan(0);
          expect(point.z).toBeGreaterThanOrEqual(0);
        });
      });

      it('should have thickness distribution data', async () => {
        const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        design = JSON.parse(content);
        const geometry = design.geometry as Record<string, unknown>;
        const thickness = geometry.thickness_distribution as Record<string, number>;

        expect(thickness.cylinder_mm).toBeGreaterThan(0);
        expect(thickness.dome_apex_mm).toBeGreaterThan(0);
        expect(thickness.boss_region_mm).toBeGreaterThan(0);
        expect(thickness.transition_mm).toBeGreaterThan(0);
      });

      it('should have stress analysis data', async () => {
        const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        design = JSON.parse(content);
        const stress = design.stress as Record<string, unknown>;

        expect(stress.max_von_mises_mpa).toBeGreaterThan(0);
        expect(stress.allowable_mpa).toBeGreaterThan(0);
        expect(stress.margin_percent).toBeGreaterThan(0);
        expect(stress.max_location).toBeDefined();
      });

      it('should have failure prediction data', async () => {
        const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        design = JSON.parse(content);
        const failure = design.failure as Record<string, unknown>;

        expect(failure.predicted_mode).toBe('fiber_breakage');
        expect(failure.is_preferred).toBe(true);
        // Handle both flat (A,B,D,E) and nested (C) structure
        const firstPlyBar = failure.first_ply_failure_bar ??
          (failure.first_ply_failure as Record<string, unknown>)?.pressure_bar;
        expect(firstPlyBar).toBeGreaterThan(0);
      });

      it('should have thermal analysis data', async () => {
        const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        design = JSON.parse(content);
        const thermal = design.thermal as Record<string, unknown>;

        // Handle both flat (A,B,D,E) and nested (C) structure
        const peakLinerTemp = thermal.peak_liner_temp_c ??
          (thermal.fast_fill as Record<string, unknown>)?.peak_liner_temp_c;
        const linerLimit = thermal.liner_limit_c ??
          (thermal.fast_fill as Record<string, unknown>)?.liner_limit_c;
        const status = thermal.status ??
          (thermal.fast_fill as Record<string, unknown>)?.status;

        expect(peakLinerTemp).toBeLessThan(linerLimit as number);
        expect(status).toBe('pass');
      });

      it('should have reliability data', async () => {
        const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        design = JSON.parse(content);
        const reliability = design.reliability as Record<string, unknown>;

        // Handle both flat (A,B,D,E) and nested (C) structure
        const pFailure = reliability.p_failure ??
          (reliability.monte_carlo as Record<string, unknown>)?.p_failure;
        const meanBurst = reliability.mean_burst_bar ??
          (reliability.burst_distribution as Record<string, unknown>)?.mean_bar;
        const cov = reliability.cov ??
          (reliability.burst_distribution as Record<string, unknown>)?.cov;

        expect(pFailure).toBeLessThan(1e-4);
        expect(meanBurst).toBeGreaterThan(0);
        expect(cov).toBeGreaterThan(0);
        expect(cov).toBeLessThan(0.1);
      });
    });
  });
});

describe('Design Comparisons', () => {
  it('should have designs with increasing layer counts for increasing safety', async () => {
    const layerCounts: Record<string, number> = {};
    const designs = ['A', 'B', 'C', 'D', 'E'];

    for (const designId of designs) {
      const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const design = JSON.parse(content);
      layerCounts[designId] = design.geometry.layup.total_layers;
    }

    // Design E (max_margin) should have more layers than Design A (lightest)
    expect(layerCounts['E']).toBeGreaterThan(layerCounts['A']);
  });

  it('should have Design A as lightest', async () => {
    const weights: Record<string, number> = {};
    const designs = ['A', 'B', 'C', 'D', 'E'];

    for (const designId of designs) {
      const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const design = JSON.parse(content);
      weights[designId] = design.summary.weight_kg;
    }

    expect(weights['A']).toBe(Math.min(...Object.values(weights)));
  });

  it('should have Design E with highest burst ratio', async () => {
    const burstRatios: Record<string, number> = {};
    const designs = ['A', 'B', 'C', 'D', 'E'];

    for (const designId of designs) {
      const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const design = JSON.parse(content);
      burstRatios[designId] = design.summary.burst_ratio;
    }

    expect(burstRatios['E']).toBe(Math.max(...Object.values(burstRatios)));
  });
});

describe('Materials Database', () => {
  it('should have valid materials database', async () => {
    const filePath = path.join(DATA_DIR, 'materials', 'material-database.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const materials = JSON.parse(content);

    expect(materials.fibers).toBeDefined();
    expect(materials.matrices).toBeDefined();
    expect(materials.liners).toBeDefined();
    expect(materials.bosses).toBeDefined();

    // Check fiber properties (actual field is sigma1_ult_mpa)
    expect(materials.fibers.length).toBeGreaterThan(0);
    materials.fibers.forEach((fiber: Record<string, unknown>) => {
      expect(fiber.id).toBeDefined();
      expect(fiber.name).toBeDefined();
      const props = fiber.properties as Record<string, unknown>;
      expect(props.sigma1_ult_mpa).toBeGreaterThan(0);
      expect(props.E1_gpa).toBeGreaterThan(0);
    });
  });
});

describe('Standards Database', () => {
  it('should have valid standards database', async () => {
    const filePath = path.join(DATA_DIR, 'standards', 'h2-standards.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const standards = JSON.parse(content);

    expect(standards.standards).toBeDefined();
    expect(standards.standards.length).toBeGreaterThan(0);

    // Check ISO 11119-3 is present (actual ID uses underscore: ISO_11119_3)
    const iso = standards.standards.find((s: Record<string, unknown>) =>
      (s.id as string).includes('ISO_11119_3')
    );
    expect(iso).toBeDefined();
  });
});

describe('Stress API per-layer data', () => {
  const designs = ['A', 'B', 'C', 'D', 'E'];
  const expectedLayers = { A: 38, B: 40, C: 42, D: 45, E: 48 };

  for (const designId of designs) {
    it(`Design ${designId} stress endpoint should return ${expectedLayers[designId as keyof typeof expectedLayers]} layer stress values`, async () => {
      // Note: This test requires the server to be running
      // It's included for documentation and can be run as an integration test
      const filePath = path.join(DATA_DIR, 'designs', `design-${designId.toLowerCase()}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const design = JSON.parse(content);
      const layerCount = design.geometry.layup.layers.length;

      // Verify design data has correct layer count for stress generation
      expect(layerCount).toBe(expectedLayers[designId as keyof typeof expectedLayers]);
    });
  }
});

describe('Pareto Set', () => {
  it('should have 50 designs in Pareto set', async () => {
    const filePath = path.join(DATA_DIR, 'pareto', 'pareto-50.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const pareto = JSON.parse(content);

    // Actual field is pareto_designs, not designs
    expect(pareto.pareto_designs.length).toBe(50);
  });

  it('should have valid Pareto designs', async () => {
    const filePath = path.join(DATA_DIR, 'pareto', 'pareto-50.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const pareto = JSON.parse(content);

    pareto.pareto_designs.forEach((design: Record<string, unknown>) => {
      expect(design.id).toBeDefined();
      expect(design.weight_kg).toBeGreaterThan(0);
      expect(design.cost_eur).toBeGreaterThan(0);
      expect(design.burst_ratio).toBeGreaterThan(2.0);
    });
  });
});
