# H2 Tank Designer UAT Checklist

## Pre-Execution Checklist

Before starting UAT, verify:

### Environment Setup
- [ ] H2 Tank Designer frontend running on http://localhost:3000
- [ ] Mock server running on http://localhost:3001 (if needed)
- [ ] Chrome browser open with DevTools MCP connected
- [ ] Report file created: `H2_UAT_REPORT.md`
- [ ] Todo list initialized with all 30 tests
- [ ] Dev mode enabled: Add `?dev=true` to URL for unrestricted navigation

### System Check
- [ ] Screenshots directory exists or will be created
- [ ] Sufficient disk space for 30+ screenshots
- [ ] No previous test artifacts blocking

---

## Test Execution Checklist

### Phase 1: App Initialization & Navigation (4 tests)

- [ ] **SMOKE-001**: App Loads with Sidebar Navigation
  - [ ] Navigate to http://localhost:3000
  - [ ] Wait 3 seconds for load
  - [ ] Screenshot: `smoke-001-app-loads.png`
  - [ ] Screenshot analyzed with Read tool
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-002**: Requirements Screen Default State
  - [ ] Verify Requirements nav highlighted
  - [ ] Screenshot: `smoke-002-requirements-default.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-003**: Module Selector Shows H2 Tank
  - [ ] Click module selector dropdown
  - [ ] Screenshot: `smoke-003-module-selector.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-004**: Help Panel Opens
  - [ ] Press "?" key or click help
  - [ ] Screenshot: `smoke-004-help-panel.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

### Phase 2: Requirements Entry (5 tests)

- [ ] **SMOKE-005**: Requirements Wizard Mode
  - [ ] View wizard interface
  - [ ] Screenshot: `smoke-005-wizard-mode.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-006**: Enter Basic Tank Parameters
  - [ ] Fill form fields
  - [ ] Screenshot: `smoke-006-tank-params.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-007**: Chat Mode for AI Requirements
  - [ ] Switch to Chat tab
  - [ ] Screenshot: `smoke-007-chat-mode.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-008**: Progress Indicator Updates
  - [ ] Navigate wizard steps
  - [ ] Screenshot: `smoke-008-progress.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-009**: Submit Requirements
  - [ ] Complete wizard and submit
  - [ ] Screenshot: `smoke-009-submit.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

### Phase 3: Pareto Optimization (4 tests)

- [ ] **SMOKE-010**: Pareto Screen Shows Chart
  - [ ] Navigate to Pareto (key: 2)
  - [ ] Screenshot: `smoke-010-pareto-chart.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-011**: Design Points Selectable
  - [ ] Click design point
  - [ ] Screenshot: `smoke-011-design-select.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-012**: Filter/Sort Design Options
  - [ ] Apply filter/sort
  - [ ] Screenshot: `smoke-012-filter-sort.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-013**: Select Optimal Design
  - [ ] Select design from Pareto
  - [ ] Screenshot: `smoke-013-optimal-design.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

### Phase 4: 3D Visualization (4 tests)

- [ ] **SMOKE-014**: 3D Tank Model Renders
  - [ ] Navigate to 3D Viewer (key: 3)
  - [ ] Wait for model to load
  - [ ] Screenshot: `smoke-014-3d-tank-render.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-015**: Camera Controls Work
  - [ ] Rotate, zoom, pan
  - [ ] Screenshot: `smoke-015-camera-controls.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-016**: Section Controls (Cross-Section)
  - [ ] Enable cross-section view
  - [ ] Screenshot: `smoke-016-section-controls.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-017**: Tank Type Variations
  - [ ] View different tank types
  - [ ] Screenshot: `smoke-017-tank-types.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

### Phase 5: Analysis Screens (4 tests)

- [ ] **SMOKE-018**: Compare Screen with Cards
  - [ ] Navigate to Compare (key: 4)
  - [ ] Screenshot: `smoke-018-compare-cards.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-019**: Analysis Tabs Work
  - [ ] Navigate to Analysis (key: 5)
  - [ ] Click through tabs
  - [ ] Screenshot: `smoke-019-analysis-tabs.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-020**: Charts Render Correctly
  - [ ] View various charts
  - [ ] Screenshot: `smoke-020-charts.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-021**: Stress Contour Visualization
  - [ ] View stress contour
  - [ ] Screenshot: `smoke-021-stress-contour.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

### Phase 6: Validation & Compliance (4 tests)

- [ ] **SMOKE-022**: Compliance Standards Library
  - [ ] Navigate to Compliance (key: 6)
  - [ ] Screenshot: `smoke-022-compliance-standards.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-023**: Run Compliance Checks
  - [ ] Click Run Checks
  - [ ] Wait for completion
  - [ ] Screenshot: `smoke-023-compliance-checks.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-024**: Validation Screen Tests
  - [ ] Navigate to Validation (key: 7)
  - [ ] Screenshot: `smoke-024-validation-tests.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-025**: Run All Validation Tests
  - [ ] Click Run Tests
  - [ ] Wait for completion
  - [ ] Screenshot: `smoke-025-validation-results.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

### Phase 7: Export & Sentry (5 tests)

- [ ] **SMOKE-026**: Export Configuration Options
  - [ ] Navigate to Export (key: 8)
  - [ ] Screenshot: `smoke-026-export-config.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-027**: Generate Export Package
  - [ ] Click Generate Export
  - [ ] Wait for completion
  - [ ] Screenshot: `smoke-027-export-generate.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-028**: Export Dialog Format Selection
  - [ ] Open export dialog
  - [ ] Screenshot: `smoke-028-export-dialog.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-029**: Sentry Mode Dashboard
  - [ ] Navigate to Sentry (key: 9)
  - [ ] Screenshot: `smoke-029-sentry-dashboard.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

- [ ] **SMOKE-030**: Screenshot Export Functionality
  - [ ] Find screenshot export
  - [ ] Screenshot: `smoke-030-screenshot-export.png`
  - [ ] Screenshot analyzed
  - [ ] Report updated
  - [ ] Status: ___

---

## Post-Execution Checklist

After completing all tests:

- [ ] **All 30 tests executed**
- [ ] **All 30 screenshots captured**
- [ ] **All 30 screenshots analyzed** (Read tool used for each)
- [ ] **Report updated after each test** (30 entries)
- [ ] **Summary statistics updated** in report header
- [ ] **Failed tests documented** with reasons
- [ ] **No "SKIPPED" status** (only PASS or FAIL)

---

## Success Criteria

| Metric | Required | Actual |
|--------|----------|--------|
| Tests Executed | 30 | ___ |
| Screenshots Captured | 30 | ___ |
| Screenshots Analyzed | 30 | ___ |
| Report Entries | 30 | ___ |
| Pass Rate | ≥80% | ___% |

**Final Status**: [ ] PASS / [ ] FAIL

---

## Sign-Off

**UAT Status**: [ ] PASS | [ ] CONDITIONAL PASS | [ ] FAIL

**Pass Rate**: _____ % (Target: 80%+)

**Total Tests**: 30
**Passed**: _____
**Failed**: _____

**Execution Date**: _________
**Executed By**: UAT Automation Skill

---

## Notes

```
Issues Encountered:
[Document any test failures or unusual behavior]

Recommendations:
[Suggestions for improvements or follow-up actions]

Additional Notes:
[Any other observations]
```
