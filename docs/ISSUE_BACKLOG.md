# H2 TANK DESIGNER - COMPREHENSIVE ISSUE BACKLOG

**Generated**: 2025-12-12
**Source**: Walkthrough UAT Testing
**Total Issues**: 61

---

## BACKLOG OVERVIEW

| Priority         | Count | Description                          |
| ---------------- | ----- | ------------------------------------ |
| 🔴 P0 - Critical | 4     | Blocking core functionality          |
| 🟠 P1 - High     | 8     | Major bugs affecting user experience |
| 🟡 P2 - Medium   | 18    | Significant gaps and enhancements    |
| 🟢 P3 - Low      | 31    | Nice-to-have improvements            |

---

## 🔴 P0 - CRITICAL (Fix Immediately)

### ISSUE-001: CORS Errors Block All Pareto API Calls

**Module**: Backend/API
**Type**: Bug
**Status**: ✅ RESOLVED (commit cc155af)
**Reported**: 2025-12-12

**Description**:
Frontend (localhost:3000) cannot access backend API (localhost:3001) due to missing CORS headers. All Pareto design data requests fail with CORS policy errors.

**Console Error**:

```
Access to fetch at 'http://localhost:3001/api/...' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Impact**:

- Pareto designs P1-P50 cannot load geometry
- 3D Viewer shows "No Data" for all Pareto designs
- Compare, Analysis, Compliance unusable for Pareto designs

**Acceptance Criteria**:

- [ ] Backend responds with `Access-Control-Allow-Origin: *` or specific origin
- [ ] All API endpoints accessible from frontend
- [ ] P1-P50 designs load geometry in 3D Viewer

**Labels**: `bug`, `critical`, `backend`, `CORS`

---

### ISSUE-002: P1-P50 Designs Not Available in Design Selectors

**Module**: All Modules
**Type**: Bug
**Status**: ✅ RESOLVED (commit cc155af)
**Reported**: 2025-12-12

**Description**:
After running Pareto optimization generating 50 designs (P1-P50), these designs are NOT available in any downstream module's design selector. Only hardcoded designs A-E appear.

**Affected Modules**:

- 3D Viewer: Selector shows only A, B, C, D, E
- Compare: Selector shows only A-E
- Analysis: Selector shows only A-E
- Compliance: Selector shows only A-E
- Validation: Selector shows only A-E
- Export: Selector shows only A-E
- Sentry Mode: Only shows Design A

**Impact**:

- Complete workflow break between Pareto and all downstream modules
- Users cannot analyze, export, or validate Pareto-optimized designs

**Acceptance Criteria**:

- [ ] All design selectors include P1-P50 when available
- [ ] Selector dynamically updates when Pareto results load
- [ ] "View in 3D" from Pareto navigates to correct design

**Labels**: `bug`, `critical`, `workflow`, `all-modules`

---

### ISSUE-003: Pareto "View in 3D" Loads Wrong Design ID

**Module**: Pareto → 3D Viewer
**Type**: Bug
**Status**: ✅ RESOLVED (commit cc155af)
**Reported**: 2025-12-12

**Description**:
When clicking "View in 3D" on design P1 in Pareto Explorer, the 3D Viewer shows "Design P10" in the header instead of "Design P1". The design ID mapping is incorrect.

**Steps to Reproduce**:

1. Navigate to Pareto Explorer
2. Select design P1
3. Click "View in 3D"
4. Observe 3D Viewer header shows "P10" not "P1"

**Impact**: User sees wrong design, loses confidence in data accuracy

**Acceptance Criteria**:

- [ ] Clicking "View in 3D" on P1 shows "Design P1" in 3D Viewer
- [ ] All P1-P50 designs map correctly

**Labels**: `bug`, `critical`, `pareto`, `viewer`

---

### ISSUE-004: Backend Server Not Running

**Module**: Backend
**Type**: Infrastructure
**Status**: Open
**Reported**: 2025-12-12

**Description**:
The backend API server on localhost:3001 is not running or not configured correctly. All API calls to backend endpoints fail.

**Impact**: All Pareto design data inaccessible

**Acceptance Criteria**:

- [ ] Backend server starts automatically with `npm run dev`
- [ ] API responds at localhost:3001
- [ ] Health check endpoint available

**Labels**: `infrastructure`, `critical`, `backend`

---

## 🟠 P1 - HIGH PRIORITY

### ISSUE-005: Invalid Pressure Values Accepted (9999 bar)

**Module**: Requirements Wizard
**Type**: Bug
**Status**: ✅ RESOLVED (GuidedRequirementsWizard.tsx + wizard-constants.ts)
**Reported**: 2025-12-12

**Description**:
The Requirements Wizard accepts physically impossible pressure values. User can enter 9999 bar which is far beyond any tank capability (typical max is 1000 bar).

**Input Tested**: 9999 bar → Accepted ❌

**Expected Behavior**: Show validation error for values > 1000 bar

**Acceptance Criteria**:

- [ ] Pressure input validates range (200-1000 bar)
- [ ] Error message shown for out-of-range values
- [ ] Cannot proceed to next step with invalid value

**Labels**: `bug`, `high`, `validation`, `requirements`

---

### ISSUE-006: Negative Weight Values Accepted (-50 kg)

**Module**: Requirements Wizard
**Type**: Bug
**Status**: ✅ RESOLVED (GuidedRequirementsWizard.tsx)
**Reported**: 2025-12-12

**Description**:
The Requirements Wizard accepts negative weight values. User can enter -50 kg which is physically impossible.

**Input Tested**: -50 kg → Accepted ❌

**Expected Behavior**: Show validation error for values ≤ 0

**Acceptance Criteria**:

- [ ] Weight input validates minimum > 0
- [ ] Error message shown for invalid values
- [ ] Cannot proceed with invalid value

**Labels**: `bug`, `high`, `validation`, `requirements`

---

### ISSUE-007: Temperature Range Validation Missing

**Module**: Requirements Wizard
**Type**: Bug
**Status**: ✅ RESOLVED (GuidedRequirementsWizard.tsx)
**Reported**: 2025-12-12

**Description**:
The wizard accepts max temperature lower than min temperature (e.g., Min: 100°C, Max: 50°C).

**Input Tested**: Min 100°C, Max 50°C → Accepted ❌

**Expected Behavior**: Show error when Max < Min

**Acceptance Criteria**:

- [ ] Validate max temp > min temp
- [ ] Show clear error message
- [ ] Highlight both fields as invalid

**Labels**: `bug`, `high`, `validation`, `requirements`

---

### ISSUE-008: AI Parser Ignores "k" Multiplier

**Module**: Requirements Chat
**Type**: Bug
**Status**: ✅ RESOLVED (commit cc155af - parseNumberWithSuffix helper)
**Reported**: 2025-12-12

**Description**:
When user types "50k cycles" or "50,000 cycles", the AI extracts only "50" instead of 50,000.

**Input Tested**: "50k fatigue cycles" → Extracted as 50 ❌
**Expected**: 50,000

**Impact**: Orders of magnitude error in requirements

**Acceptance Criteria**:

- [ ] "50k" parses to 50000
- [ ] "50,000" parses to 50000
- [ ] "50K" (uppercase) parses to 50000

**Labels**: `bug`, `high`, `ai`, `requirements`

---

### ISSUE-009: AI Parser Confuses Weight and Capacity

**Module**: Requirements Chat
**Type**: Bug
**Status**: ✅ RESOLVED
**Reported**: 2025-12-12

**Description**:
When user mentions "5 kg capacity", the AI sometimes interprets this as target weight instead of hydrogen storage capacity.

**Impact**: Wrong requirement category populated

**Resolution**:
Added context-aware regex patterns in parse/route.ts that distinguish between hydrogen capacity patterns ("5 kg capacity", "store 5 kg hydrogen") and tank weight patterns ("target weight 80 kg", "weight limit").

**Acceptance Criteria**:

- [x] "5 kg capacity" → hydrogen_capacity_kg
- [x] "target weight 80 kg" → target_weight_kg
- [x] Context-aware parsing with multiple patterns

**Labels**: `bug`, `high`, `ai`, `requirements`

---

### ISSUE-010: Compliance "Verified" Column Always Shows "No"

**Module**: Compliance
**Type**: Bug
**Status**: ✅ RESOLVED (commit cc155af - explicit verified field in API)
**Reported**: 2025-12-12

**Description**:
In the Compliance Matrix tab, all requirements show "Verified: No" even though the design has passed compliance and shows 100%.

**Expected**: Verified should show "Yes" for passed requirements

**Acceptance Criteria**:

- [ ] Verified column reflects actual verification status
- [ ] Passed requirements show "Yes"

**Labels**: `bug`, `high`, `compliance`, `data`

---

### ISSUE-011: 3D Viewer Shows "Loading..." Indefinitely on Failure

**Module**: 3D Viewer
**Type**: Bug
**Status**: ✅ RESOLVED (useGeometryLoader hook with 10s timeout + retry)
**Reported**: 2025-12-12

**Description**:
When a design fails to load geometry (e.g., due to CORS), the viewer shows "Loading geometry..." indefinitely with no error message or timeout.

**Expected Behavior**:

- Show error message after timeout
- Offer retry button
- Suggest returning to Pareto

**Acceptance Criteria**:

- [ ] Loading times out after 10 seconds
- [ ] Error message displayed
- [ ] Retry button available

**Labels**: `bug`, `high`, `viewer`, `ux`

---

### ISSUE-012: Export Generation Has No Progress Indicator

**Module**: Export
**Type**: Bug
**Status**: ✅ RESOLVED (ExportSummary with Loader2 spinner + ExportProgressIndicator)
**Reported**: 2025-12-12

**Description**:
When clicking "Generate export package", the button becomes disabled but there is no spinner or progress bar to indicate generation is in progress.

**Impact**: User doesn't know if action succeeded or is still processing

**Acceptance Criteria**:

- [ ] Spinner shown during generation
- [ ] Progress percentage if possible
- [ ] Success/failure toast message

**Labels**: `bug`, `high`, `export`, `ux`

---

## 🟡 P2 - MEDIUM PRIORITY

### ISSUE-013: No Multi-Select Comparison in Pareto

**Module**: Pareto Explorer
**Type**: Feature Request
**Status**: Open

**Description**:
Cannot select multiple designs from Pareto chart to compare side-by-side. Would need to select 2-3 designs and click "Compare Selected".

**Acceptance Criteria**:

- [ ] Shift-click or checkboxes to select multiple
- [ ] "Compare Selected" button appears
- [ ] Navigates to Compare with selected designs

**Labels**: `enhancement`, `medium`, `pareto`

---

### ISSUE-014: No Filter by Category in Pareto

**Module**: Pareto Explorer
**Type**: Feature Request
**Status**: Open

**Description**:
Cannot filter design cards by category (balanced, lightweight, economical, etc.). Would help narrow down options.

**Acceptance Criteria**:

- [ ] Category filter buttons or dropdown
- [ ] Cards filter based on selection
- [ ] Chart highlights filtered designs

**Labels**: `enhancement`, `medium`, `pareto`

---

### ISSUE-015: No Sorting Options for Design Cards

**Module**: Pareto Explorer
**Type**: Feature Request
**Status**: Open

**Description**:
Design cards P1-P50 cannot be sorted. Would be useful to sort by weight, cost, or other metrics.

**Acceptance Criteria**:

- [ ] Sort dropdown with metric options
- [ ] Ascending/descending toggle
- [ ] Cards reorder dynamically

**Labels**: `enhancement`, `medium`, `pareto`

---

### ISSUE-016: Chart Rendering Warnings in Console

**Module**: Pareto Explorer
**Type**: Bug
**Status**: ✅ RESOLVED

**Description**:
Console shows warnings about chart width/height during rendering:

```
Warning: The chart component has a width of 0
```

**Impact**: Minor - charts still render, but indicates timing issue

**Resolution**:
Added `min-w-[300px] min-h-[300px]` to ParetoChart wrapper div to ensure ResponsiveContainer always has dimensions on initial render.

**Acceptance Criteria**:

- [x] No console warnings on chart render
- [x] Proper container sizing before render

**Labels**: `bug`, `medium`, `pareto`, `charts`

---

### ISSUE-017: No Tooltips on Chart Points

**Module**: Pareto Explorer
**Type**: Feature Request
**Status**: ✅ RESOLVED

**Description**:
Hovering over points in Pareto scatter plot doesn't show detailed tooltip with design info.

**Resolution**:
Already implemented in ParetoChart.tsx (lines 404-474) with comprehensive tooltip showing:

- Design ID with Recommended/Selected badges
- Weight and Cost
- Burst Pressure and Ratio
- P(failure) with scientific notation
- Fatigue Life cycles
- Trade-off category with color coding
- Click instruction for selection

**Acceptance Criteria**:

- [x] Hover shows design ID
- [x] Shows key metrics (weight, cost)
- [x] Shows category

**Labels**: `enhancement`, `medium`, `pareto`, `charts`

---

### ISSUE-018: Design Cards Don't Show All Metrics

**Module**: Pareto Explorer
**Type**: Feature Request
**Status**: Open

**Description**:
Design cards show limited info. Would be useful to see more metrics without navigating away.

**Acceptance Criteria**:

- [ ] Expand/collapse for more details
- [ ] Or modal with full metrics

**Labels**: `enhancement`, `medium`, `pareto`, `ux`

---

### ISSUE-019: No Camera Presets in 3D Viewer

**Module**: 3D Viewer
**Type**: Feature Request
**Status**: Open

**Description**:
3D Viewer has no quick camera position presets. User must manually rotate to get front/back/top views.

**Acceptance Criteria**:

- [ ] Front, Back, Left, Right, Top, Bottom buttons
- [ ] Isometric preset
- [ ] Smooth camera animation

**Labels**: `enhancement`, `medium`, `viewer`

---

### ISSUE-020: No Keyboard Shortcuts in 3D Viewer

**Module**: 3D Viewer
**Type**: Feature Request
**Status**: ✅ RESOLVED

**Description**:
View mode toggles (Stress, Wireframe, Cross-section) have no keyboard shortcuts.

**Resolution**:
Already implemented in `useViewerKeyboardShortcuts.ts` and documented in `KeyboardShortcutsHelp.tsx`:

- S: Toggle stress view
- W: Toggle wireframe
- C: Toggle cross-section
- Shift+R: Toggle auto-rotate
- Shift+L: Toggle liner visibility
- ?: Show keyboard shortcuts help overlay

**Acceptance Criteria**:

- [x] Shortcuts documented (KeyboardShortcutsHelp.tsx)
- [x] Work when viewer focused (useViewerKeyboardShortcuts.ts)

**Labels**: `enhancement`, `medium`, `viewer`

---

### ISSUE-021: Measurement History Always Shows 0

**Module**: 3D Viewer
**Type**: Bug
**Status**: Open

**Description**:
The measurement tools panel shows "History: 0" but it's unclear if measurements are being recorded or if this is a bug.

**Acceptance Criteria**:

- [ ] Measurement history records all measurements
- [ ] Clear button to reset history
- [ ] Export measurements

**Labels**: `bug`, `medium`, `viewer`

---

### ISSUE-022: Compare Cannot Show More Than 2 Designs

**Module**: Compare
**Type**: Feature Request
**Status**: Open

**Description**:
Compare screen only shows 2 designs side-by-side. Would be useful to compare 3-4 designs.

**Acceptance Criteria**:

- [ ] Support 2-4 design comparison
- [ ] Responsive layout

**Labels**: `enhancement`, `medium`, `compare`

---

### ISSUE-023: No Radar Chart in Compare

**Module**: Compare
**Type**: Feature Request
**Status**: Open

**Description**:
Compare uses only metric cards. A radar/spider chart would visually show trade-offs across all dimensions.

**Acceptance Criteria**:

- [ ] Radar chart with all 6 metrics
- [ ] Overlay both designs
- [ ] Toggle between chart and table view

**Labels**: `enhancement`, `medium`, `compare`, `charts`

---

### ISSUE-024: No Export Comparison as PDF

**Module**: Compare
**Type**: Feature Request
**Status**: Open

**Description**:
Cannot export comparison results as PDF for sharing with team or stakeholders.

**Acceptance Criteria**:

- [ ] Export button on Compare screen
- [ ] PDF includes all metrics and winner summary

**Labels**: `enhancement`, `medium`, `compare`, `export`

---

### ISSUE-025: Analysis Has No Design Comparison Mode

**Module**: Analysis
**Type**: Feature Request
**Status**: Open

**Description**:
Cannot overlay stress contours or compare analysis results between two designs.

**Acceptance Criteria**:

- [ ] Side-by-side stress comparison
- [ ] Difference highlighting

**Labels**: `enhancement`, `medium`, `analysis`

---

### ISSUE-026: No Interactive Chart in Analysis

**Module**: Analysis
**Type**: Feature Request
**Status**: Open

**Description**:
Cannot click on stress contour chart to see stress value at specific point.

**Acceptance Criteria**:

- [ ] Click to see stress at point
- [ ] Crosshairs with coordinates
- [ ] Tooltip with value

**Labels**: `enhancement`, `medium`, `analysis`, `charts`

---

### ISSUE-027: Standards Library Loading Slow

**Module**: Compliance
**Type**: Performance
**Status**: Open

**Description**:
Standards Library tab shows "Loading standards library..." for a long time before content appears.

**Acceptance Criteria**:

- [ ] Faster loading
- [ ] Or proper progress indicator

**Labels**: `performance`, `medium`, `compliance`

---

### ISSUE-028: No PDF Export for Compliance Report

**Module**: Compliance
**Type**: Feature Request
**Status**: Open

**Description**:
Cannot export compliance report as PDF for certification documentation.

**Acceptance Criteria**:

- [ ] Export button on Compliance screen
- [ ] PDF includes all clauses, matrix, test requirements

**Labels**: `enhancement`, `medium`, `compliance`, `export`

---

### ISSUE-029: FEA Request Shows No Status

**Module**: Validation
**Type**: Feature Request
**Status**: Open

**Description**:
After clicking "Request FEA Validation", there's no status indicator or confirmation.

**Acceptance Criteria**:

- [ ] Confirmation toast
- [ ] Status tracker (Pending, In Progress, Complete)
- [ ] Email notification when complete

**Labels**: `enhancement`, `medium`, `validation`

---

### ISSUE-030: No Batch Export of Multiple Designs

**Module**: Export
**Type**: Feature Request
**Status**: Open

**Description**:
Cannot export multiple designs at once. Must export each design individually.

**Acceptance Criteria**:

- [ ] Checkbox to select multiple designs
- [ ] Single ZIP with all designs

**Labels**: `enhancement`, `medium`, `export`

---

## 🟢 P3 - LOW PRIORITY

### ISSUE-031: No Loading Indicator on Chart Renders

**Module**: Pareto Explorer
**Type**: UX Enhancement
**Status**: Open

**Description**: Charts render without loading state.

**Labels**: `enhancement`, `low`, `ux`

---

### ISSUE-032: Wizard Steps Not Keyboard Navigable

**Module**: Requirements
**Type**: Accessibility
**Status**: Open

**Description**: Cannot use Tab/Arrow keys to navigate wizard steps.

**Labels**: `enhancement`, `low`, `accessibility`

---

### ISSUE-033: No Undo for Measurement Deletions

**Module**: 3D Viewer
**Type**: Feature Request
**Status**: Open

**Labels**: `enhancement`, `low`, `viewer`

---

### ISSUE-034: Best Performance Icons Same When Tied

**Module**: Compare
**Type**: UX Enhancement
**Status**: Open

**Description**: When metrics are equal (e.g., P(Failure) = 0 for both), both show crown icons.

**Labels**: `enhancement`, `low`, `compare`

---

### ISSUE-035: No Link to Standard Document PDFs

**Module**: Compliance
**Type**: Feature Request
**Status**: Open

**Description**: Standards cards don't link to actual ISO/UN standard documents.

**Labels**: `enhancement`, `low`, `compliance`

---

### ISSUE-036: No Print-Friendly View for Compliance

**Module**: Compliance
**Type**: Feature Request
**Status**: Open

**Labels**: `enhancement`, `low`, `compliance`

---

### ISSUE-037: No Validation History

**Module**: Validation
**Type**: Feature Request
**Status**: Open

**Description**: Cannot see previous validation results.

**Labels**: `enhancement`, `low`, `validation`

---

### ISSUE-038: No Download History in Export

**Module**: Export
**Type**: Feature Request
**Status**: Open

**Description**: Cannot see previously generated export packages.

**Labels**: `enhancement`, `low`, `export`

---

### ISSUE-039: No Email Delivery Option for Export

**Module**: Export
**Type**: Feature Request
**Status**: Open

**Description**: Would be useful to email export package directly to team.

**Labels**: `enhancement`, `low`, `export`

---

### ISSUE-040: Sentry Cannot Add Custom Monitoring Points

**Module**: Sentry Mode
**Type**: Feature Request
**Status**: Open

**Description**: User cannot add their own monitoring point locations.

**Labels**: `enhancement`, `low`, `sentry`

---

### ISSUE-041: No IoT Platform Integration in Sentry

**Module**: Sentry Mode
**Type**: Feature Request
**Status**: Open

**Description**: Would be useful to connect to real sensor platforms.

**Labels**: `enhancement`, `low`, `sentry`

---

### ISSUE-042: No Sensor Part Numbers in Sentry

**Module**: Sentry Mode
**Type**: Feature Request
**Status**: Open

**Description**: Sensor recommendations don't include specific product models.

**Labels**: `enhancement`, `low`, `sentry`

---

### ISSUE-043: 3D View Controls Not Intuitive in Sentry

**Module**: Sentry Mode
**Type**: UX Enhancement
**Status**: Open

**Labels**: `enhancement`, `low`, `sentry`, `ux`

---

### ISSUE-044: No Export of Sentry Monitoring Spec

**Module**: Sentry Mode
**Type**: Feature Request
**Status**: Open

**Description**: Cannot export monitoring specification as PDF.

**Labels**: `enhancement`, `low`, `sentry`, `export`

---

### ISSUE-045: Help Panel Not Tested

**Module**: Global
**Type**: Testing Gap
**Status**: Open

**Description**: Help panel (? key) functionality not verified.

**Labels**: `testing`, `low`

---

### ISSUE-046: Settings Panel Not Tested

**Module**: Global
**Type**: Testing Gap
**Status**: Open

**Labels**: `testing`, `low`

---

### ISSUE-047: Search Functionality Not Tested

**Module**: Global
**Type**: Testing Gap
**Status**: Open

**Labels**: `testing`, `low`

---

### ISSUE-048: Theme Toggle Persistence Not Tested

**Module**: Global
**Type**: Testing Gap
**Status**: Open

**Labels**: `testing`, `low`

---

### ISSUE-049: Undo/Redo Limits Not Tested

**Module**: Global
**Type**: Testing Gap
**Status**: Open

**Labels**: `testing`, `low`

---

### ISSUE-050: Enhanced Compare Screen Not Tested

**Module**: Compare
**Type**: Testing Gap
**Status**: Open

**Description**: CompareScreen.enhanced.tsx exists but not tested.

**Labels**: `testing`, `low`

---

### ISSUE-051: Enhanced Compliance Screen Not Tested

**Module**: Compliance
**Type**: Testing Gap
**Status**: Open

**Description**: ComplianceScreen.enhanced.v2.tsx exists but not tested.

**Labels**: `testing`, `low`

---

### ISSUE-052: Enhanced Viewer Screen Not Tested

**Module**: 3D Viewer
**Type**: Testing Gap
**Status**: Open

**Description**: ViewerScreen.enhanced.tsx exists but not tested.

**Labels**: `testing`, `low`

---

### ISSUE-053: AnnotationPanel Not Visible

**Module**: 3D Viewer
**Type**: Testing Gap
**Status**: Open

**Description**: AnnotationPanel.tsx exists in code but not visible in UI.

**Labels**: `testing`, `low`, `viewer`

---

### ISSUE-054: LiveExtractionPanel Not Visible

**Module**: Requirements
**Type**: Testing Gap
**Status**: Open

**Description**: LiveExtractionPanel.tsx exists but not visible.

**Labels**: `testing`, `low`, `requirements`

---

### ISSUE-055: StandardsPanel Not Visible

**Module**: Requirements
**Type**: Testing Gap
**Status**: Open

**Labels**: `testing`, `low`, `requirements`

---

### ISSUE-056: SurrogateConfidencePanel Not Tested

**Module**: Validation
**Type**: Testing Gap
**Status**: Open

**Labels**: `testing`, `low`, `validation`

---

### ISSUE-057: TestPlanPanel Not Tested

**Module**: Validation
**Type**: Testing Gap
**Status**: Open

**Labels**: `testing`, `low`, `validation`

---

### ISSUE-058: GlossaryPanel Not Tested

**Module**: Help
**Type**: Testing Gap
**Status**: Open

**Labels**: `testing`, `low`, `help`

---

### ISSUE-059: No Mobile Responsiveness Testing

**Module**: Global
**Type**: Testing Gap
**Status**: Open

**Labels**: `testing`, `low`, `responsive`

---

### ISSUE-060: No Accessibility (a11y) Audit

**Module**: Global
**Type**: Testing Gap
**Status**: Open

**Labels**: `testing`, `low`, `accessibility`

---

### ISSUE-061: No Performance Testing

**Module**: Global
**Type**: Testing Gap
**Status**: Open

**Labels**: `testing`, `low`, `performance`

---

## SUMMARY BY MODULE

| Module       | P0    | P1    | P2     | P3     | Total  |
| ------------ | ----- | ----- | ------ | ------ | ------ |
| Backend/API  | 2     | 0     | 0      | 0      | 2      |
| Requirements | 0     | 5     | 0      | 3      | 8      |
| Pareto       | 1     | 0     | 6      | 1      | 8      |
| 3D Viewer    | 1     | 1     | 3      | 4      | 9      |
| Compare      | 0     | 0     | 3      | 1      | 4      |
| Analysis     | 0     | 0     | 2      | 0      | 2      |
| Compliance   | 0     | 1     | 2      | 2      | 5      |
| Validation   | 0     | 0     | 1      | 3      | 4      |
| Export       | 0     | 1     | 1      | 2      | 4      |
| Sentry Mode  | 0     | 0     | 0      | 5      | 5      |
| Global       | 0     | 0     | 0      | 10     | 10     |
| **Total**    | **4** | **8** | **18** | **31** | **61** |

---

## RECOMMENDED SPRINT PLAN

### Sprint 1: Critical Fixes (Week 1)

- ISSUE-001: CORS fix
- ISSUE-002: P1-P50 in selectors
- ISSUE-003: Design ID mapping
- ISSUE-004: Backend server

### Sprint 2: Input Validation (Week 2)

- ISSUE-005: Pressure validation
- ISSUE-006: Weight validation
- ISSUE-007: Temperature validation
- ISSUE-008: AI "k" parser
- ISSUE-009: AI weight/capacity

### Sprint 3: UX Polish (Week 3)

- ISSUE-010: Compliance Verified column
- ISSUE-011: Loading timeout
- ISSUE-012: Export progress
- ISSUE-017: Chart tooltips
- ISSUE-019: Camera presets

### Sprint 4+: Enhancements

- Remaining P2 and P3 issues
