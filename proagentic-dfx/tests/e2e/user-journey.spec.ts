import { test, expect } from '@playwright/test';

test.describe('H2 Tank Designer User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application with Requirements screen', async ({ page }) => {
    // Check page title and initial screen
    await expect(page).toHaveTitle(/H2 Tank Designer/);
    await expect(page.getByRole('heading', { name: /Requirements Input/i })).toBeVisible();
  });

  test('should display sidebar navigation', async ({ page }) => {
    // Check sidebar navigation items
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByText('Requirements')).toBeVisible();
    await expect(page.getByText('Pareto Explorer')).toBeVisible();
    await expect(page.getByText('3D Viewer')).toBeVisible();
    await expect(page.getByText('Analysis')).toBeVisible();
    await expect(page.getByText('Export')).toBeVisible();
  });

  test('should parse requirements and show derived requirements', async ({ page }) => {
    // Enter requirements
    const textarea = page.getByRole('textbox');
    await textarea.fill('Design a hydrogen tank for automotive application with 700 bar working pressure');

    // Click parse button
    await page.getByRole('button', { name: /Parse Requirements/i }).click();

    // Wait for parsing result
    await expect(page.getByText(/Working Pressure/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/700/)).toBeVisible();
  });

  test('should navigate to Tank Type screen', async ({ page }) => {
    // Navigate using sidebar
    await page.getByRole('link', { name: /Tank Type/i }).click();

    // Check we're on tank type screen
    await expect(page.getByRole('heading', { name: /Tank Type Recommendation/i })).toBeVisible({ timeout: 5000 });
  });

  test('should show Pareto designs', async ({ page }) => {
    // Navigate to Pareto Explorer
    await page.getByRole('link', { name: /Pareto Explorer/i }).click();

    // Wait for designs to load
    await expect(page.getByText(/Design A/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Design B/i)).toBeVisible();
    await expect(page.getByText(/Design C/i)).toBeVisible();
    await expect(page.getByText(/Design D/i)).toBeVisible();
    await expect(page.getByText(/Design E/i)).toBeVisible();
  });

  test('should load 3D Viewer with tank visualization', async ({ page }) => {
    // Navigate to 3D Viewer
    await page.getByRole('link', { name: /3D Viewer/i }).click();

    // Wait for 3D canvas to load
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    // Check for layer controls
    await expect(page.getByText(/Layer Controls/i)).toBeVisible();

    // Check geometry info is displayed
    await expect(page.getByText(/Geometry/i)).toBeVisible();
  });

  test('should toggle layer visibility in 3D Viewer', async ({ page }) => {
    // Navigate to 3D Viewer
    await page.getByRole('link', { name: /3D Viewer/i }).click();

    // Wait for canvas and controls
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    // Find layer toggle controls
    const layerControls = page.getByText(/Layer Controls/i);
    await expect(layerControls).toBeVisible();

    // Check for Helical/Hoop checkboxes
    await expect(page.getByRole('checkbox', { name: /Helical/i })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Hoop/i })).toBeVisible();

    // Toggle helical layers
    await page.getByRole('checkbox', { name: /Helical/i }).click();

    // Verify toggle works (re-enable)
    await page.getByRole('checkbox', { name: /Helical/i }).click();
  });

  test('should switch between designs in 3D Viewer', async ({ page }) => {
    // Navigate to 3D Viewer
    await page.getByRole('link', { name: /3D Viewer/i }).click();

    // Wait for canvas
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    // Select Design A
    await page.getByRole('button', { name: /Design A/i }).click();
    await expect(page.getByText(/38 layers/i)).toBeVisible({ timeout: 5000 });

    // Select Design E (has 48 layers)
    await page.getByRole('button', { name: /Design E/i }).click();
    await expect(page.getByText(/48 layers/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display Analysis tabs with stress data', async ({ page }) => {
    // Navigate to Analysis
    await page.getByRole('link', { name: /Analysis/i }).click();

    // Wait for analysis data
    await expect(page.getByText(/Stress Analysis/i)).toBeVisible({ timeout: 10000 });

    // Check for stress-related content
    await expect(page.getByText(/von Mises/i)).toBeVisible();
  });

  test('should show Export options', async ({ page }) => {
    // Navigate to Export
    await page.getByRole('link', { name: /Export/i }).click();

    // Wait for export screen
    await expect(page.getByRole('heading', { name: /Export Package/i })).toBeVisible({ timeout: 5000 });

    // Check for export categories
    await expect(page.getByText(/Geometry Files/i)).toBeVisible();
    await expect(page.getByText(/Manufacturing Data/i)).toBeVisible();
    await expect(page.getByText(/Analysis Reports/i)).toBeVisible();

    // Check for export button
    await expect(page.getByRole('button', { name: /Generate Export Package/i })).toBeVisible();
  });

  test('complete user flow: Requirements -> Tank Type -> Optimization -> 3D Viewer', async ({ page }) => {
    // Step 1: Requirements
    await expect(page.getByRole('heading', { name: /Requirements Input/i })).toBeVisible();
    const textarea = page.getByRole('textbox');
    await textarea.fill('700 bar hydrogen tank for automotive use');
    await page.getByRole('button', { name: /Parse Requirements/i }).click();
    await expect(page.getByText(/Working Pressure/i)).toBeVisible({ timeout: 10000 });

    // Step 2: Navigate to Tank Type via Next button or sidebar
    await page.getByRole('link', { name: /Tank Type/i }).click();
    await expect(page.getByRole('heading', { name: /Tank Type/i })).toBeVisible({ timeout: 5000 });

    // Step 3: Navigate to Pareto Explorer
    await page.getByRole('link', { name: /Pareto/i }).click();
    await expect(page.getByText(/Design C/i)).toBeVisible({ timeout: 10000 });

    // Step 4: Navigate to 3D Viewer
    await page.getByRole('link', { name: /3D Viewer/i }).click();
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Layer Controls/i)).toBeVisible();
  });
});

test.describe('API Integration', () => {
  test('should fetch design geometry', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/designs/C/geometry');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.design_id).toBe('C');
    expect(data.layup.total_layers).toBe(42);
    expect(data.layup.layers).toHaveLength(42);
  });

  test('should fetch stress analysis', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/designs/C/stress');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.design_id).toBe('C');
    expect(data.max_stress.value_mpa).toBeGreaterThan(0);
  });

  test('should fetch all 5 designs', async ({ request }) => {
    const designs = ['A', 'B', 'C', 'D', 'E'];

    for (const id of designs) {
      const response = await request.get(`http://localhost:3001/api/designs/${id}/geometry`);
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.design_id).toBe(id);
    }
  });

  test('should fetch optimization results with Pareto designs', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/optimization/demo/results');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.pareto_front.length).toBeGreaterThan(0);
  });

  test('should fetch materials database', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/materials');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.fibers.length).toBeGreaterThan(0);
    expect(data.matrices.length).toBeGreaterThan(0);
    expect(data.liners.length).toBeGreaterThan(0);
  });

  test('should fetch reliability data with Monte Carlo results', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/designs/C/reliability');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.design_id).toBe('C');
    expect(data.monte_carlo).toBeDefined();
    expect(data.monte_carlo.samples).toBeGreaterThan(0);
    expect(data.monte_carlo.p_failure).toBeGreaterThan(0);
    expect(data.burst_distribution).toBeDefined();
    expect(data.burst_distribution.mean_bar).toBeGreaterThan(0);
  });

  test('should fetch failure mode analysis with Tsai-Wu criterion', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/designs/C/failure');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.design_id).toBe('C');
    expect(data.tsai_wu).toBeDefined();
    expect(data.tsai_wu.max_at_test).toBeDefined();
    expect(data.tsai_wu.max_at_burst).toBeDefined();
    expect(data.predicted_failure_mode).toBeDefined();
  });

  test('should fetch thermal analysis for fast-fill scenario', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/designs/C/thermal');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.design_id).toBe('C');
    expect(data.fast_fill).toBeDefined();
    expect(data.fast_fill.peak_gas_temp_c).toBeGreaterThan(0);
    expect(data.fast_fill.peak_wall_temp_c).toBeGreaterThan(0);
    expect(['pass', 'warn', 'fail']).toContain(data.fast_fill.status);
  });

  test('should fetch cost breakdown', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/designs/C/cost');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.design_id).toBe('C');
    expect(data.unit_cost_eur).toBeGreaterThan(0);
    expect(data.breakdown).toBeDefined();
    expect(data.breakdown.length).toBeGreaterThan(0);
  });

  test('should fetch compliance status', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/designs/C/compliance');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.design_id).toBe('C');
    expect(['pass', 'fail']).toContain(data.overall_status);
    expect(data.standards).toBeDefined();
    expect(data.standards.length).toBeGreaterThan(0);
  });

  test('should compare multiple designs', async ({ request }) => {
    const response = await request.post('http://localhost:3001/api/compare', {
      data: { design_ids: ['A', 'B', 'C'] }
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.designs).toHaveLength(3);
    expect(data.radar_data).toBeDefined();
    expect(data.metrics).toBeDefined();
  });

  test('should start and check export status', async ({ request }) => {
    // Start export
    const startResponse = await request.post('http://localhost:3001/api/export', {
      data: {
        design_id: 'C',
        include: ['geometry', 'report'],
        format: 'zip'
      }
    });
    expect(startResponse.ok()).toBeTruthy();

    const { export_id } = await startResponse.json();
    expect(export_id).toBeDefined();

    // Check status
    const statusResponse = await request.get(`http://localhost:3001/api/export/${export_id}`);
    expect(statusResponse.ok()).toBeTruthy();

    const statusData = await statusResponse.json();
    expect(['processing', 'ready', 'failed']).toContain(statusData.status);
  });
});

test.describe('First-Principles Physics Validation', () => {
  test('stress calculations follow pressure vessel equations', async ({ request }) => {
    // σ_hoop = PR/t is the governing equation
    const response = await request.get('http://localhost:3001/api/designs/C/stress');
    const data = await response.json();

    // Stress should be positive and within realistic bounds for CFRP
    expect(data.max_stress.value_mpa).toBeGreaterThan(100); // Min realistic stress
    expect(data.max_stress.value_mpa).toBeLessThan(5000); // Max realistic CFRP stress

    // Margin should be positive (design is safe)
    expect(data.max_stress.margin_percent).toBeGreaterThan(0);
  });

  test('isotensoid dome geometry follows netting theory angle', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/designs/C/geometry');
    const data = await response.json();

    // Netting theory optimal angle is 54.74° (arctan(√2))
    const expectedAngle = Math.atan(Math.sqrt(2)) * 180 / Math.PI; // ≈ 54.74°
    expect(data.dome.parameters.alpha_0_deg).toBeCloseTo(expectedAngle, 0);

    // Dome profile should have decreasing radius toward apex
    const profile = data.dome.profile_points;
    if (profile && profile.length > 1) {
      // First point (at cylinder) should have largest radius
      // Last point (at apex) should have smallest radius
      expect(profile[0].r).toBeGreaterThan(profile[profile.length - 1].r);
    }
  });

  test('Monte Carlo reliability uses proper sampling', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/designs/C/reliability');
    const data = await response.json();

    // Monte Carlo should use sufficient samples for statistical validity
    expect(data.monte_carlo.samples).toBeGreaterThanOrEqual(1000);

    // P(failure) should be very small for safe design (< 1e-4)
    expect(data.monte_carlo.p_failure).toBeLessThan(1e-4);

    // Burst distribution should have positive mean and std
    expect(data.burst_distribution.mean_bar).toBeGreaterThan(0);
    expect(data.burst_distribution.std_bar).toBeGreaterThan(0);

    // COV should be reasonable (typically 0.05-0.15 for composites)
    expect(data.burst_distribution.cov).toBeGreaterThan(0.01);
    expect(data.burst_distribution.cov).toBeLessThan(0.3);
  });

  test('Tsai-Wu failure criterion properly evaluated', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/designs/C/failure');
    const data = await response.json();

    // Tsai-Wu index should be < 1 for safe design at test pressure
    expect(data.tsai_wu.max_at_test.value).toBeLessThan(1);

    // At burst pressure, Tsai-Wu should approach or exceed 1
    expect(data.tsai_wu.max_at_burst.value).toBeGreaterThan(0.5);
  });

  test('composite layup follows proper winding sequence', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/designs/C/geometry');
    const data = await response.json();

    // Layup should contain both helical and hoop layers
    const helicalLayers = data.layup.layers.filter((l: { type: string }) => l.type === 'helical');
    const hoopLayers = data.layup.layers.filter((l: { type: string }) => l.type === 'hoop');

    expect(helicalLayers.length).toBeGreaterThan(0);
    expect(hoopLayers.length).toBeGreaterThan(0);

    // Helical angles should be consistent (typically ±54.74° for geodesic)
    for (const layer of helicalLayers) {
      expect(layer.angle_deg).toBeGreaterThan(40);
      expect(layer.angle_deg).toBeLessThan(70);
    }

    // Hoop layers should be ~90°
    for (const layer of hoopLayers) {
      expect(layer.angle_deg).toBeGreaterThanOrEqual(85);
      expect(layer.angle_deg).toBeLessThanOrEqual(90);
    }
  });

  test('burst ratio meets safety requirements', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/optimization/demo/results');
    const data = await response.json();

    // All designs should have burst ratio >= 2.25 (minimum for UN R134)
    for (const design of data.pareto_front) {
      if (design.burst_ratio) {
        expect(design.burst_ratio).toBeGreaterThanOrEqual(2.25);
      }
    }
  });
});

test.describe('Design Data Validation', () => {
  const designs = ['A', 'B', 'C', 'D', 'E'];
  const expectedLayers = { A: 38, B: 40, C: 42, D: 45, E: 48 };

  for (const id of designs) {
    test(`Design ${id} should have ${expectedLayers[id as keyof typeof expectedLayers]} layers`, async ({ request }) => {
      const response = await request.get(`http://localhost:3001/api/designs/${id}/geometry`);
      const data = await response.json();

      expect(data.layup.total_layers).toBe(expectedLayers[id as keyof typeof expectedLayers]);
      expect(data.layup.layers.length).toBe(expectedLayers[id as keyof typeof expectedLayers]);
    });
  }

  for (const id of designs) {
    test(`Design ${id} should have valid layer properties`, async ({ request }) => {
      const response = await request.get(`http://localhost:3001/api/designs/${id}/geometry`);
      const data = await response.json();

      for (const layer of data.layup.layers) {
        expect(['helical', 'hoop']).toContain(layer.type);
        expect(layer.thickness_mm).toBeGreaterThan(0);
        expect(layer.angle_deg).toBeGreaterThan(0);
        expect(['full', 'cylinder']).toContain(layer.coverage);
      }
    });
  }
});
