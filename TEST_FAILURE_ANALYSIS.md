# Test Failure Root Cause Analysis - ProAgentic DfX

Analysis Date: 2025-12-10
Total Failures: 94 across 14 test files
Success Rate: 95.5%

---

## TOP 5 FAILURE CATEGORIES

1. DATA NORMALIZATION & EDGE CASES - 23 tests
   Files: src/lib/charts/chart-utils.ts
   Issue: calculateDomain() doesn't handle negative values, NaN, Infinity, empty arrays
   Example: calculateDomain([-50, 100]) returns [0, 100] instead of [-50, 100]
   Fix: Add validation for NaN/Infinity, handle identical values with padding, empty array check

2. REACT act() WARNINGS - 19 tests  
   Files: CostAnalysisPanel, FailureAnalysisPanel, ThermalAnalysisPanel tests
   Issue: Async state updates not wrapped in act()
   Fix: Use waitFor() for async operations, mock API calls

3. COMPONENT DATA LOADING - 15 tests
   Files: CostAnalysisPanel.test.tsx
   Issue: Mock API responses missing or incomplete
   Fix: Add comprehensive fetch mocks for /api/designs/* endpoints

4. ACCESSIBILITY STANDARDS - 23 tests
   Files: accessibility-ci.test.tsx
   Issue: Missing WCAG 2.1 AA compliance (landmarks, labels, skip links)
   Fix: Add <main>, <label>, alt text, fix heading hierarchy

5. NUMBER FORMATTING - 14 tests
   Files: src/lib/charts/chart-utils.ts formatValue()
   Issue: Precision lost, unit suffix missing, Infinity not handled
   Example: formatValue(123.456, 2) returns "123" instead of "123.46"
   Fix: Use toFixed(), add unit after number, return '-' for invalid values

---

## MINIMAL CODE FIXES

### Fix 1: calculateDomain() - src/lib/charts/chart-utils.ts

export function calculateDomain(values: number[], padding = 0.1): [number, number] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('calculateDomain requires non-empty array');
  }
  
  const validValues = values.filter(v => Number.isFinite(v));
  if (validValues.length === 0) {
    throw new Error('No valid finite values');
  }
  
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  
  if (min === max) {
    const delta = Math.abs(min) * padding || padding;
    return [min - delta, max + delta];
  }
  
  const range = max - min;
  return [min - range * padding, max + range * padding];
}

### Fix 2: normalizeValues() - src/lib/charts/chart-utils.ts

export function normalizeValues(values: number[]): number[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('normalizeValues requires non-empty array');
  }
  
  const finite = values.filter(v => Number.isFinite(v));
  if (finite.length === 0) {
    throw new Error('No valid finite values');
  }
  
  const [min, max] = calculateDomain(values);
  if (min === max) return values.map(() => 0.5);
  
  return values.map(v => (v - min) / (max - min));
}

### Fix 3: formatValue() - src/lib/charts/chart-utils.ts

export function formatValue(value: number, decimals = 2, unit = ''): string {
  if (!Number.isFinite(value)) return '-';
  if (value === 0) return '0';
  
  let formatted: string;
  
  if (Math.abs(value) >= 1e6) {
    formatted = (value / 1e6).toFixed(1) + 'M';
  } else if (Math.abs(value) >= 1e3) {
    formatted = (value / 1e3).toFixed(1) + 'K';
  } else {
    formatted = value.toFixed(decimals);
  }
  
  if (unit && !formatted.includes(unit)) formatted += unit;
  return formatted;
}

### Fix 4: Test Setup Mocks - CostAnalysisPanel.test.tsx

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/api/designs/') && url.includes('/cost')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          cost_breakdown: { material: 100, manufacturing: 50, overhead: 25 },
          unit_cost: 175,
          volume_sensitivity: [{ volume: 5000, cost: 175 }]
        })
      } as Response);
    }
    return Promise.reject(new Error('Not found'));
  }));
});

### Fix 5: Accessibility - Add to Components

// Add <main> wrapper in screens
export function AnalysisScreen() {
  return <main role="main">...</main>;
}

// Add labels to form controls  
<label htmlFor="volume-select">Production Volume</label>
<select id="volume-select" {...props}>...</select>

// Add alt text to charts
<div role="img" aria-label="Cost breakdown: Material 47%...">
  <PieChart data={data} />
</div>

---

## ARCHITECTURAL FIXES

1. DELETE these files (API routes should not be in frontend):
   - src/app/api/auth/route.ts
   - src/app/api/designs/route.ts
   - src/app/api/designs/[designId]/route.ts
   - src/app/api/designs/[designId]/stress/route.ts

2. Remove hardcoded 'N/A' values from:
   - src/components/screens/AnalysisScreen.tsx
   - src/components/screens/ValidationScreen.tsx
   - src/components/analysis/ReliabilityPanel.tsx

---

## EXPECTED IMPACT

- Fixes: 94 test failures
- Time: 4-5 hours implementation
- Result: 100% test pass rate (2000+ passing tests)

