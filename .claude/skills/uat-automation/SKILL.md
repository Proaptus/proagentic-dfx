---
name: UAT Automation
description: Comprehensive User Acceptance Testing (UAT) automation for H2 Tank Designer (proagentic-dfx). Executes 30 critical smoke tests covering requirements entry, 3D visualization, analysis panels, compliance, validation, and export. Uses Chrome DevTools browser automation with mandatory screenshot analysis. Captures screenshots AFTER processes complete, analyzes each with detailed descriptions, updates report incrementally. Use when validating H2 Tank Designer functionality with evidence-based testing.
allowed-tools: Read, Grep, Glob, Bash, TodoWrite, Edit, Write
---

# UAT Automation Skill - H2 Tank Designer

## 🚨 HOOK ENFORCEMENT ACTIVE - FABRICATION BLOCKED

**This skill uses `enforce-uat-validation.py` hook that BLOCKS:**

1. **Marking any test "completed" without screenshot file existing**
2. **Moving to next test without analyzing screenshot with Read tool**
3. **Progressing without updating H2_UAT_REPORT.md with Edit tool**

The hook tracks:

- `tests_with_screenshot` - Tests that have screenshot files
- `tests_with_analysis` - Tests where screenshot was Read
- `tests_with_report_update` - Tests where report was Edit'd

**If you try to cheat, the hook will DENY the TodoWrite call.**

---

## CRITICAL ENFORCEMENT RULES - READ FIRST

These rules are **ABSOLUTE** and **NON-NEGOTIABLE**:

1. **COMPLETE ALL 30 TESTS** - No stopping early for any reason
2. **WAIT FOR PROCESS COMPLETION** - Take screenshots ONLY after processes fully complete
3. **ANALYZE EVERY SCREENSHOT** - Use Read tool to view screenshot, describe what's visible (3-5 sentences), determine pass/fail
4. **UPDATE REPORT AFTER EACH TEST** - Use Edit tool to append test results immediately (no batching)
5. **NO FAKE CLAIMS** - Report contains only: screenshot + description + pass/fail
6. **CONTINUE ON FAILURE** - If test fails, retry once, mark FAILED, document reason, move to next test

---

## Target Application: H2 Tank Designer

| Property         | Value                             |
| ---------------- | --------------------------------- |
| **Application**  | ProAgentic DfX - H2 Tank Designer |
| **URL**          | http://localhost:3000             |
| **Dev Mode URL** | http://localhost:3000?dev=true    |
| **Technology**   | Next.js + React + Three.js        |
| **Mock Server**  | http://localhost:3001             |

### Navigation Structure

The app has 9 screens organized in 4 sections:

```
Design:
  - Requirements (default screen)
  - Pareto Explorer
  - 3D Viewer

Analysis:
  - Compare
  - Analysis

Validation:
  - Compliance
  - Validation

Output:
  - Export
  - Sentry Mode
```

### Navigation Prerequisites

- **Requirements**: Always accessible
- **Pareto**: Requires requirements submitted
- **All other screens**: Require Pareto front generated or design selected

**Tip**: Use `?dev=true` query parameter to bypass navigation restrictions during testing.

---

## Essential Reading

**MUST READ FIRST** (in order):

1. **[ABSOLUTE_RULES.md](rules/ABSOLUTE_RULES.md)** - 5 critical rules that CANNOT be violated
2. **[test-sequence.md](rules/test-sequence.md)** - Mandatory 6-step sequence for each test
3. **[validation-gates.md](rules/validation-gates.md)** - Enforcement checkpoints

---

## 30 Smoke Tests for H2 Tank Designer

### Phase 1: App Initialization & Navigation (4 tests)

#### SMOKE-001: App Loads with Sidebar Navigation

**Purpose**: Verify application loads correctly with all UI elements
**Steps**:

1. Navigate to http://localhost:3000
2. Wait for app to load completely (3 seconds)
3. Capture screenshot
   **Expected**:

- Sidebar visible with "ProAgentic DfX" header
- Navigation sections: Design, Analysis, Validation, Output
- Requirements screen active by default
- Module selector shows "H2 Tank"

#### SMOKE-002: Requirements Screen Default State

**Purpose**: Verify Requirements screen loads as default
**Steps**:

1. Check Requirements nav item is highlighted
2. Main content shows requirements form
3. Capture screenshot
   **Expected**:

- Requirements nav item has active indicator (blue left border)
- Requirements form or wizard visible in main content
- No error messages

#### SMOKE-003: Module Selector Shows H2 Tank

**Purpose**: Verify H2 Tank module is active and other modules show "Soon"
**Steps**:

1. Click module selector dropdown
2. Capture expanded dropdown
   **Expected**:

- "H2 Tank" shows with green checkmark (active)
- "Pressure Vessel" shows "Soon" badge
- Dropdown styled correctly

#### SMOKE-004: Help Panel Opens with Keyboard Shortcuts

**Purpose**: Verify help panel shows keyboard navigation
**Steps**:

1. Press "?" key or click help icon
2. Wait for panel to open
3. Capture screenshot
   **Expected**:

- Help panel slides in from right
- Shows keyboard shortcuts (1-9 for navigation, ?, Esc)
- Panel is dismissible

### Phase 2: Requirements Entry (5 tests)

#### SMOKE-005: Requirements Wizard Mode

**Purpose**: Verify wizard-based requirements entry
**Steps**:

1. Navigate to Requirements screen
2. Select "Wizard" tab if not default
3. Capture wizard interface
   **Expected**:

- Multi-step wizard visible
- Progress indicator shows current step
- Form fields for tank parameters
- Next/Previous navigation buttons

#### SMOKE-006: Enter Basic Tank Parameters

**Purpose**: Test form input functionality
**Steps**:

1. Fill in tank dimensions (length, diameter)
2. Set pressure and temperature
3. Select tank type from dropdown
4. Capture filled form
   **Expected**:

- Form fields accept input
- Validation indicators (if any)
- Values displayed correctly

#### SMOKE-007: Chat Mode for AI Requirements

**Purpose**: Verify AI chat interface for requirements
**Steps**:

1. Switch to "Chat" tab
2. View chat interface
3. Capture chat UI
   **Expected**:

- Chat input area visible
- Message history area
- Send button functional

#### SMOKE-008: Progress Indicator Updates

**Purpose**: Verify progress tracking during wizard
**Steps**:

1. Navigate through wizard steps
2. Observe progress indicator changes
3. Capture progress state
   **Expected**:

- Progress bar or step indicator visible
- Current step highlighted
- Completed steps marked

#### SMOKE-009: Submit Requirements

**Purpose**: Test requirements submission flow
**Steps**:

1. Complete all wizard steps
2. Click submit/generate button
3. Wait for design generation
4. Capture completion state
   **Expected**:

- Loading indicator during generation
- Success message or navigation to Pareto
- No errors

### Phase 3: Pareto Optimization (4 tests)

#### SMOKE-010: Pareto Screen Shows Optimization Chart

**Purpose**: Verify Pareto front visualization
**Steps**:

1. Navigate to Pareto Explorer (nav key: 2)
2. Wait for chart to render
3. Capture Pareto chart
   **Expected**:

- Scatter plot or Pareto chart visible
- Design points plotted
- Axis labels (Cost vs Mass or similar)
- Legend if applicable

#### SMOKE-011: Design Points Selectable

**Purpose**: Test design point interaction
**Steps**:

1. Click on a design point in Pareto chart
2. Observe selection feedback
3. Capture selected state
   **Expected**:

- Point highlights on selection
- Design details panel updates
- Selection indicator visible

#### SMOKE-012: Filter/Sort Design Options

**Purpose**: Verify filtering capabilities
**Steps**:

1. Look for filter/sort controls
2. Apply a filter or sort option
3. Capture filtered results
   **Expected**:

- Filter controls visible
- Designs re-order or filter correctly
- Clear indication of active filters

#### SMOKE-013: Select Optimal Design

**Purpose**: Test design selection for downstream screens
**Steps**:

1. Select a design from Pareto front
2. Click "Select" or equivalent action
3. Capture confirmation
   **Expected**:

- Design selection confirmed
- Can proceed to other screens (3D Viewer, Analysis)
- Selected design indicator

### Phase 4: 3D Visualization (4 tests)

#### SMOKE-014: 3D Tank Model Renders

**Purpose**: Verify Three.js 3D visualization
**Steps**:

1. Navigate to 3D Viewer (nav key: 3)
2. Wait for model to load
3. Capture 3D view
   **Expected**:

- 3D tank model visible
- Proper lighting and materials
- No WebGL errors
- Tank geometry matches type

#### SMOKE-015: Camera Controls Work

**Purpose**: Test 3D interaction controls
**Steps**:

1. Rotate view (drag)
2. Zoom in/out (scroll)
3. Pan (right-click drag or shift+drag)
4. Capture different angle
   **Expected**:

- Smooth rotation
- Zoom works both directions
- Pan shifts view
- No model clipping

#### SMOKE-016: Section Controls (Cross-Section)

**Purpose**: Test cross-section visualization
**Steps**:

1. Find section/cutaway controls
2. Enable cross-section view
3. Capture sectioned model
   **Expected**:

- Cross-section reveals interior
- Interior structure visible
- Section plane adjustable (if supported)

#### SMOKE-017: Tank Type Variations Display

**Purpose**: Verify different tank type renders
**Steps**:

1. Look for tank type showcase or selector
2. View different tank types (Type I, II, III, IV)
3. Capture type variations
   **Expected**:

- Different tank types show different geometry
- Type labels visible
- Smooth transitions between types

### Phase 5: Analysis Screens (4 tests)

#### SMOKE-018: Compare Screen with Design Cards

**Purpose**: Verify design comparison functionality
**Steps**:

1. Navigate to Compare (nav key: 4)
2. View comparison cards
3. Capture comparison view
   **Expected**:

- Multiple design cards displayed
- Key metrics shown (cost, mass, volume)
- Visual comparison aids (charts, bars)

#### SMOKE-019: Analysis Tabs Work

**Purpose**: Test analysis panel tabs
**Steps**:

1. Navigate to Analysis (nav key: 5)
2. Click through tabs: Thermal, Cost, Reliability, Failure
3. Capture each tab
   **Expected**:

- Each tab loads different content
- No blank panels
- Relevant charts/data for each analysis type

#### SMOKE-020: Charts Render Correctly

**Purpose**: Verify chart components work
**Steps**:

1. View various charts (radar, histogram, pie, etc.)
2. Check for data visualization
3. Capture charts
   **Expected**:

- Charts render with data
- Legends visible
- Tooltips on hover (if interactive)
- No rendering errors

#### SMOKE-021: Stress Contour Visualization

**Purpose**: Test stress analysis visualization
**Steps**:

1. Navigate to stress analysis view
2. View contour/heatmap
3. Capture visualization
   **Expected**:

- Color-coded stress distribution
- Color scale/legend
- Stress values indicated

### Phase 6: Validation & Compliance (4 tests)

#### SMOKE-022: Compliance Standards Library

**Purpose**: Verify compliance standards panel
**Steps**:

1. Navigate to Compliance (nav key: 6)
2. View standards library
3. Capture standards list
   **Expected**:

- Standards listed (ISO, ASME, etc.)
- Check/compliance status indicators
- Expandable details

#### SMOKE-023: Run Compliance Checks

**Purpose**: Test compliance check execution
**Steps**:

1. Click "Run Checks" or equivalent
2. Wait for checks to complete
3. Capture results
   **Expected**:

- Progress indicator during check
- Results show pass/fail per standard
- Summary statistics

#### SMOKE-024: Validation Screen Tests

**Purpose**: Verify validation test interface
**Steps**:

1. Navigate to Validation (nav key: 7)
2. View available tests
3. Capture test list
   **Expected**:

- Test categories listed
- Run individual or all tests options
- Status indicators (pending, pass, fail)

#### SMOKE-025: Run All Validation Tests

**Purpose**: Test full validation suite
**Steps**:

1. Click "Run Tests" button
2. Wait for completion
3. Capture results summary
   **Expected**:

- All tests execute
- Results displayed (pass/fail counts)
- Detailed results expandable

### Phase 7: Export & Sentry (5 tests)

#### SMOKE-026: Export Configuration Options

**Purpose**: Verify export configuration panel
**Steps**:

1. Navigate to Export (nav key: 8)
2. View configuration options
3. Capture options panel
   **Expected**:

- Export format options (JSON, PDF, CAD)
- Section toggles (include/exclude data)
- Output settings

#### SMOKE-027: Generate Export Package

**Purpose**: Test export generation
**Steps**:

1. Configure export options
2. Click "Generate Export" button
3. Wait for generation
4. Capture completion
   **Expected**:

- Progress during generation
- Success message
- Download link or file created

#### SMOKE-028: Export Dialog Format Selection

**Purpose**: Test export dialog functionality
**Steps**:

1. Open export dialog
2. View format options
3. Capture dialog
   **Expected**:

- Dialog modal visible
- Format selection (PNG, PDF, JSON)
- Quality/resolution options if applicable

#### SMOKE-029: Sentry Mode Dashboard

**Purpose**: Verify design monitoring screen
**Steps**:

1. Navigate to Sentry Mode (nav key: 9)
2. View monitoring dashboard
3. Capture dashboard
   **Expected**:

- Sensor/monitoring data displayed
- Inspection schedule visible
- Status indicators
- Real-time or simulated data

#### SMOKE-030: Screenshot Export Functionality

**Purpose**: Test screenshot capture feature
**Steps**:

1. Navigate to 3D Viewer or Analysis
2. Find screenshot/export button
3. Capture screenshot of export UI
   **Expected**:

- Screenshot button accessible
- Format options available
- Preview or direct download

---

## Test Execution Protocol

### For Each Test (MANDATORY)

```
1. EXECUTE test action
2. WAIT for completion (minimum 3 seconds, longer for processing)
3. CAPTURE screenshot: mcp__chrome-devtools__take_screenshot({ filename: "..." })
4. ANALYZE screenshot: Read({ file_path: "..." })
5. DESCRIBE what's visible (3-5 sentences)
6. UPDATE report immediately: Edit({ file_path: "./H2_UAT_REPORT.md", ... })
7. UPDATE todo: Mark test completed
8. PROCEED to next test
```

### Screenshot Naming Convention

```
smoke-[num]-[short-name].png

Examples:
- smoke-001-app-loads.png
- smoke-014-3d-tank-render.png
- smoke-026-export-config.png
```

### Report Entry Format

```markdown
### SMOKE-XXX: Test Name

**Screenshot**: smoke-xxx-name.png

![smoke-xxx-name.png](smoke-xxx-name.png)

**What's Visible**: [3-5 sentence description]

**Pass/Fail**: PASS or FAIL

**Reasoning**: [Why it passed or failed]

---
```

---

## Success Criteria

| Metric         | Pass Threshold  |
| -------------- | --------------- |
| Total Tests    | 30              |
| Pass Rate      | 80% (24/30)     |
| Screenshots    | 30 captured     |
| Report Updated | After each test |

---

## Chrome DevTools MCP Commands

### Navigation

```typescript
mcp__chrome - devtools__navigate_page({ url: 'http://localhost:3000?dev=true' });
```

### Take Screenshot

```typescript
mcp__chrome - devtools__take_screenshot({ filename: 'smoke-001-app-loads.png' });
```

### Take Snapshot (accessibility tree)

```typescript
mcp__chrome - devtools__take_snapshot();
```

### Click Element

```typescript
mcp__chrome - devtools__click({ uid: 'element-uid-from-snapshot' });
```

### Fill Form Field

```typescript
mcp__chrome - devtools__fill({ uid: 'input-uid', value: '100' });
```

### Press Key

```typescript
mcp__chrome - devtools__press_key({ key: 'Enter' });
```

### Evaluate JavaScript

```typescript
mcp__chrome -
  devtools__evaluate_script({
    function: `() => document.querySelector('button')?.click()`,
  });
```

---

## Pre-Test Checklist

Before starting UAT:

1. [ ] H2 Tank Designer running on localhost:3000
2. [ ] Mock server running on localhost:3001 (if needed)
3. [ ] Browser connected to Chrome DevTools MCP
4. [ ] Report file created: H2_UAT_REPORT.md
5. [ ] Todo list initialized with 30 tests

---

## Files and Templates

- **README.md**: Full implementation guide
- **QUICK_REFERENCE.md**: One-page reference
- **templates/UAT_REPORT.md**: Report template
- **rules/ABSOLUTE_RULES.md**: Critical rules
- **rules/test-sequence.md**: 6-step mandatory sequence
- **rules/validation-gates.md**: Validation checkpoints

---

**Remember**: Complete ALL 30 tests. Analyze ALL screenshots. Update report after EACH test. No shortcuts.
