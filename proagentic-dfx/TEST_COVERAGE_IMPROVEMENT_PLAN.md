# Test Coverage Improvement Plan

**ProSWARM Task ID**: task-1765466435
**Target Coverage**: 80% (Lines, Statements, Branches, Functions)
**Current Coverage**: ~60% Lines, ~59% Statements, ~50% Branches, ~53% Functions
**Generated**: 2025-12-11

---

## Executive Summary

This plan outlines the systematic approach to reach 80% test coverage using ProSWARM Neural Orchestration with parallel agent swarms. The current gap requires approximately **2,500+ lines of new test code** across **25 priority files**.

### Coverage Gap Analysis

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Lines | 60.57% | 80% | +19.43% |
| Statements | 58.96% | 80% | +21.04% |
| Branches | 50.46% | 80% | +29.54% |
| Functions | 53.29% | 80% | +26.71% |

---

## Phase 1: Critical Coverage Gaps (Priority 1)

### Files with 0-10% Coverage - HIGHEST PRIORITY

These files contribute most to the coverage deficit and must be addressed first.

| # | File | Current | Lines Untested | Est. Tests | Agent Assignment |
|---|------|---------|----------------|------------|------------------|
| 1 | `components/ui/DataTable.tsx` | 0% | ~415 lines (68-482) | 25-30 tests | **Agent Swarm A1** |
| 2 | `components/ui/Tabs.tsx` | 0% | ~130 lines (36-168) | 15-20 tests | **Agent Swarm A1** |
| 3 | `components/ui/GlobalSearch.tsx` | 1.6% | ~320 lines (51-370) | 20-25 tests | **Agent Swarm A2** |
| 4 | `components/ui/ThemeProvider.tsx` | 2.8% | ~70 lines (28-99) | 10-12 tests | **Agent Swarm A2** |
| 5 | `components/charts/ParetoChart.tsx` | 3.9% | ~390 lines (108-498) | 25-30 tests | **Agent Swarm A3** |

**Subtotal Phase 1**: ~95-117 tests, ~1,325 untested lines

### Test Specifications for Phase 1

#### 1. DataTable.tsx (0% -> 80%)
```typescript
// Tests needed:
- Rendering with empty data
- Rendering with populated data
- Column sorting (asc/desc)
- Pagination (next, prev, page size)
- Row selection (single, multi)
- Search/filter functionality
- Column visibility toggle
- Export functionality
- Loading states
- Error states
- Responsive behavior
- Accessibility (keyboard nav, ARIA)
```

#### 2. Tabs.tsx (0% -> 80%)
```typescript
// Tests needed:
- Default tab rendering
- Tab switching via click
- Tab switching via keyboard (arrow keys)
- Controlled vs uncontrolled mode
- Disabled tabs
- Tab panel content rendering
- ARIA attributes
- Focus management
```

#### 3. GlobalSearch.tsx (1.6% -> 80%)
```typescript
// Tests needed:
- Search input rendering
- Debounced search
- Search results display
- Keyboard navigation (up/down/enter/escape)
- Category filtering
- Recent searches
- No results state
- Loading state
- Click outside to close
- Accessibility
```

#### 4. ThemeProvider.tsx (2.8% -> 80%)
```typescript
// Tests needed:
- Default theme application
- Theme switching (light/dark/system)
- Theme persistence (localStorage)
- System preference detection
- CSS variable updates
- Context value provision
- Hydration handling
```

#### 5. ParetoChart.tsx (3.9% -> 80%)
```typescript
// Tests needed:
- Chart rendering with data
- Empty state rendering
- Axis configuration (X/Y metric selection)
- Point selection/highlighting
- Tooltip display
- Legend rendering
- Zoom/pan functionality
- Trade-off category coloring
- Responsive resize
- Export to image
- Accessibility
```

---

## Phase 2: Low Coverage Files (Priority 2)

### Files with 10-50% Coverage

| # | File | Current | Lines Untested | Est. Tests | Agent Assignment |
|---|------|---------|----------------|------------|------------------|
| 6 | `components/ui/Progress.tsx` | 14.8% | ~165 lines (106-271) | 12-15 tests | **Agent Swarm B1** |
| 7 | `components/charts/RadarChart.tsx` | 46.6% | ~80 lines | 10-12 tests | **Agent Swarm B1** |
| 8 | `components/screens/ViewerScreen.tsx` | 52% | ~150 lines | 15-20 tests | **Agent Swarm B2** |
| 9 | `lib/screenshot-utils.ts` | 49.4% | ~100 lines | 12-15 tests | **Agent Swarm B2** |
| 10 | `components/charts/TornadoChart.tsx` | 57.4% | ~60 lines | 8-10 tests | **Agent Swarm B3** |
| 11 | `components/cad/CADViewer.tsx` | ~45% | ~200 lines | 15-20 tests | **Agent Swarm B3** |

**Subtotal Phase 2**: ~72-92 tests, ~755 untested lines

### Test Specifications for Phase 2

#### 6. Progress.tsx (14.8% -> 80%)
```typescript
// Tests needed:
- Linear progress rendering
- Circular progress rendering
- Determinate mode (value prop)
- Indeterminate mode (animation)
- Custom colors/styling
- Size variants
- Label display
- ARIA progressbar role
```

#### 7. RadarChart.tsx (46.6% -> 80%)
```typescript
// Tests needed:
- Multi-series data rendering
- Axis labels
- Value tooltips
- Legend items
- Color customization
- Responsive sizing
- Animation states
```

#### 8. ViewerScreen.tsx (52% -> 80%)
```typescript
// Tests needed:
- 3D viewer initialization
- Camera controls
- Layer visibility toggles
- Section controls
- Material rendering
- Screenshot capture
- Export functionality
- Loading states
- Error handling
```

#### 9. screenshot-utils.ts (49.4% -> 80%)
```typescript
// Tests needed:
- Canvas capture
- Image format conversion
- Download trigger
- Blob creation
- Error handling for missing canvas
- Browser API mocking
```

---

## Phase 3: Medium Coverage Files (Priority 3)

### Files with 50-70% Coverage Needing Improvement

| # | File | Current | Gap to 80% | Est. Tests | Agent Assignment |
|---|------|---------|------------|------------|------------------|
| 12 | `components/analysis/StressPanel.tsx` | ~60% | ~20% | 8-10 tests | **Agent Swarm C1** |
| 13 | `components/analysis/FailurePanel.tsx` | ~55% | ~25% | 10-12 tests | **Agent Swarm C1** |
| 14 | `components/analysis/ThermalPanel.tsx` | ~58% | ~22% | 8-10 tests | **Agent Swarm C2** |
| 15 | `components/analysis/CostPanel.tsx` | ~62% | ~18% | 6-8 tests | **Agent Swarm C2** |
| 16 | `components/compliance/ComplianceScreen.tsx` | ~65% | ~15% | 6-8 tests | **Agent Swarm C3** |
| 17 | `components/screens/ExportScreen.tsx` | ~58% | ~22% | 10-12 tests | **Agent Swarm C3** |

**Subtotal Phase 3**: ~48-60 tests

---

## Phase 4: Fix Existing Failing Tests (Priority 4)

### Current Test Failures to Resolve

Before adding new tests, these existing failures must be fixed:

| Test File | Failed Tests | Root Cause | Agent Assignment |
|-----------|--------------|------------|------------------|
| `ValidationScreen.test.tsx` | 16 | Component-mock mismatch | **Agent Swarm D1** |
| `CompareScreen.test.tsx` | 3 | JSX whitespace text matching | **Agent Swarm D1** |
| `RequirementsChat.test.tsx` | 2 | Async state timing | **Agent Swarm D2** |
| Multiple chart tests | ~10 | Canvas/SVG mocking | **Agent Swarm D2** |
| Multiple UI tests | ~104 | Various mock issues | **Agent Swarm D3** |

**Strategy**:
1. Update component mocks to match actual implementations
2. Use `waitFor` with proper timeouts for async state
3. Mock canvas/SVG APIs properly for chart tests
4. Fix JSX text queries using `getByRole` or regex patterns

---

## ProSWARM Parallel Agent Assignments

### Swarm Configuration

```
TOTAL AGENTS: 12 Parallel Agents in 4 Swarms

SWARM A (Critical Coverage - Phase 1):
├── Agent A1: DataTable + Tabs tests
├── Agent A2: GlobalSearch + ThemeProvider tests
└── Agent A3: ParetoChart tests

SWARM B (Low Coverage - Phase 2):
├── Agent B1: Progress + RadarChart tests
├── Agent B2: ViewerScreen + screenshot-utils tests
└── Agent B3: TornadoChart + CADViewer tests

SWARM C (Medium Coverage - Phase 3):
├── Agent C1: StressPanel + FailurePanel tests
├── Agent C2: ThermalPanel + CostPanel tests
└── Agent C3: ComplianceScreen + ExportScreen tests

SWARM D (Fix Failures - Phase 4):
├── Agent D1: ValidationScreen + CompareScreen fixes
├── Agent D2: RequirementsChat + chart test fixes
└── Agent D3: UI component test fixes
```

### ProSWARM Neural Models to Use

| Phase | Neural Model | Purpose |
|-------|--------------|---------|
| 1-3 | `test_coverage_analyzer` | Identify uncovered code paths |
| 1-3 | `edge_case_generator` | Generate edge case tests |
| 4 | `bug_router` | Classify test failure types |
| 4 | `test_flakyness_detector` | Identify timing issues |
| All | `refactor_planner` | Plan test file organization |

---

## Execution Timeline (Sequential Phases)

### Phase Execution Order

```
PHASE 1 (Parallel Swarm A): Critical 0-10% files
├── Duration: 2-3 hours
├── Tests: 95-117 new tests
├── Coverage Impact: +10-12%
└── Target after: ~70% coverage

PHASE 2 (Parallel Swarm B): Low 10-50% files
├── Duration: 1.5-2 hours
├── Tests: 72-92 new tests
├── Coverage Impact: +5-7%
└── Target after: ~77% coverage

PHASE 3 (Parallel Swarm C): Medium 50-70% files
├── Duration: 1-1.5 hours
├── Tests: 48-60 new tests
├── Coverage Impact: +3-4%
└── Target after: ~80% coverage

PHASE 4 (Parallel Swarm D): Fix failures
├── Duration: 1-2 hours
├── Tests: 135 fixes
├── Coverage Impact: Stabilization
└── Target after: 80%+ stable
```

---

## Test File Structure

### Recommended Test Organization

```
src/__tests__/
├── components/
│   ├── ui/
│   │   ├── DataTable.test.tsx          # NEW - Phase 1
│   │   ├── Tabs.test.tsx               # NEW - Phase 1
│   │   ├── GlobalSearch.test.tsx       # NEW - Phase 1
│   │   ├── Progress.test.tsx           # NEW - Phase 2
│   │   └── ThemeProvider.test.tsx      # NEW - Phase 1
│   ├── charts/
│   │   ├── ParetoChart.test.tsx        # NEW - Phase 1
│   │   ├── RadarChart.test.tsx         # ENHANCE - Phase 2
│   │   └── TornadoChart.test.tsx       # ENHANCE - Phase 2
│   ├── analysis/
│   │   ├── StressPanel.test.tsx        # ENHANCE - Phase 3
│   │   ├── FailurePanel.test.tsx       # ENHANCE - Phase 3
│   │   ├── ThermalPanel.test.tsx       # ENHANCE - Phase 3
│   │   └── CostPanel.test.tsx          # ENHANCE - Phase 3
│   ├── screens/
│   │   ├── ViewerScreen.test.tsx       # ENHANCE - Phase 2
│   │   ├── ExportScreen.test.tsx       # ENHANCE - Phase 3
│   │   ├── ValidationScreen.test.tsx   # FIX - Phase 4
│   │   └── CompareScreen.test.tsx      # FIX - Phase 4
│   └── cad/
│       └── CADViewer.test.tsx          # NEW - Phase 2
├── lib/
│   ├── screenshot-utils.test.ts        # NEW - Phase 2
│   └── charts/
│       └── pareto-config.test.ts       # ENHANCE - Phase 3
└── hooks/
    └── useTheme.test.ts                # NEW - Phase 1
```

---

## Mock Strategy

### Required Test Mocks

```typescript
// 1. Canvas/WebGL Mock (for 3D components)
vi.mock('three', () => ({
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    setSize: vi.fn(),
    render: vi.fn(),
    domElement: document.createElement('canvas'),
  })),
  Scene: vi.fn(),
  PerspectiveCamera: vi.fn(),
  // ... other Three.js mocks
}));

// 2. Recharts Mock (for chart components)
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  ScatterChart: ({ children }) => <div data-testid="scatter-chart">{children}</div>,
  // ... other Recharts mocks
}));

// 3. Browser APIs Mock (for screenshots)
Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: vi.fn(() => 'data:image/png;base64,mock'),
});

// 4. localStorage Mock (for theme)
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 5. matchMedia Mock (for responsive/theme)
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});
```

---

## Estimated Test Counts Summary

| Phase | New Tests | Enhanced Tests | Fixed Tests | Total |
|-------|-----------|----------------|-------------|-------|
| Phase 1 | 95-117 | 0 | 0 | ~106 |
| Phase 2 | 45-55 | 27-37 | 0 | ~86 |
| Phase 3 | 0 | 48-60 | 0 | ~54 |
| Phase 4 | 0 | 0 | 135 | ~135 |
| **TOTAL** | **140-172** | **75-97** | **135** | **~381** |

---

## Success Criteria

### Coverage Thresholds (Pre-commit Hook)

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### Validation Commands

```bash
# Run all tests with coverage
npm run test -- --coverage

# Check specific file coverage
npm run test -- --coverage --collectCoverageFrom='src/components/ui/DataTable.tsx'

# Run tests for single file
npm run test -- src/__tests__/components/ui/DataTable.test.tsx

# Verify pre-commit hook passes
npm run check:sizes && npm run test -- --coverage
```

---

## Risk Mitigation

### Potential Blockers

| Risk | Mitigation |
|------|------------|
| Canvas API not available in JSDOM | Use jest-canvas-mock or vitest-canvas-mock |
| Three.js WebGL context issues | Mock entire Three.js module |
| Async state timing issues | Use waitFor with increased timeout |
| Component-mock interface drift | Generate mocks from actual component props |
| Large test files (>800 lines) | Split into describe blocks in separate files |

---

## ProSWARM Orchestration Commands

### Initialize Plan Execution

```javascript
// When ready to execute (NOT NOW - PLAN ONLY):
await mcp__proswarm__orchestrate_task("Execute test coverage improvement Phase 1");
await mcp__proswarm__memory_store("coverage_plan_phase", "1");
await mcp__proswarm__execute_plan(taskId);
```

### Monitor Progress

```javascript
// Check memory for progress
await mcp__proswarm__memory_get("coverage_phase1_status");
await mcp__proswarm__memory_get("tests_written_count");
await mcp__proswarm__memory_get("current_coverage");
```

---

## Appendix: Full Uncovered Lines Reference

### Phase 1 Files - Detailed Line Ranges

```
DataTable.tsx: 68-482 (ALL uncovered)
  - Lines 68-120: Table header rendering
  - Lines 121-200: Row rendering logic
  - Lines 201-280: Pagination component
  - Lines 281-350: Sorting logic
  - Lines 351-420: Selection handling
  - Lines 421-482: Filter/search

Tabs.tsx: 36-168 (ALL uncovered)
  - Lines 36-80: Tab list rendering
  - Lines 81-120: Tab panel switching
  - Lines 121-168: Keyboard navigation

GlobalSearch.tsx: 51-370 (98.4% uncovered)
  - Lines 51-100: Search input
  - Lines 101-180: Results dropdown
  - Lines 181-250: Category filters
  - Lines 251-320: Keyboard nav
  - Lines 321-370: Recent searches

ThemeProvider.tsx: 28-99 (97.2% uncovered)
  - Lines 28-50: Context creation
  - Lines 51-75: Theme switching logic
  - Lines 76-99: System preference detection

ParetoChart.tsx: 108-498 (96.1% uncovered)
  - Lines 108-180: Chart setup
  - Lines 181-280: Data processing
  - Lines 281-380: Interaction handlers
  - Lines 381-450: Tooltip/legend
  - Lines 451-498: Export functionality
```

---

**END OF PLAN DOCUMENT**

*This plan was generated using ProSWARM Neural Orchestration (task-1765466435)*
*DO NOT EXECUTE - This is a planning document only*
