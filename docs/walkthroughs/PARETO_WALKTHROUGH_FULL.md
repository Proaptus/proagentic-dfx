---
id: WALKTHROUGH-PARETO-FULL-001
doc_type: test-report
title: 'Pareto Explorer - Detailed Walkthrough'
status: draft
date: 2025-12-12
owner: '@h2-tank-team'
last_verified_at: 2025-12-12
keywords: ['uat', 'walkthrough', 'pareto', 'detailed']
---

# Pareto Explorer - Detailed Walkthrough

**Module**: Pareto Explorer
**Date**: 2025-12-12
**Tester**: Antigravity
**Screenshots**: 10 captured

---

## Screenshots

| #   | File                               | Description                              |
| --- | ---------------------------------- | ---------------------------------------- |
| 01  | PARETO_01_initial.png              | Initial state - Chart loaded             |
| 02  | PARETO_02_fullpage.png             | Full page capture                        |
| 03  | PARETO_03_top.png                  | Top of page - chart area                 |
| 04  | PARETO_04_design_selected.png      | P35 selected                             |
| 05  | PARETO_05_3dviewer_P35_no_data.png | **BUG**: 3D Viewer shows no data for P35 |
| 06  | PARETO_06_chart_and_controls.png   | Chart with controls                      |
| 07  | PARETO_07_xaxis_dropdown.png       | X-axis dropdown                          |
| 08  | PARETO_08_legend_toggled.png       | Legend toggled                           |
| 09  | PARETO_09_multi_select.png         | Multiple selections                      |
| 10  | PARETO_10_console_errors.png       | Console with CORS errors                 |

---

## Bugs Found

### CRITICAL: CORS Errors for PXX Designs

| Bug ID   | Severity | Issue                                                             |
| -------- | -------- | ----------------------------------------------------------------- |
| CORS-001 | Critical | Access to `http://localhost:3001/api/designs/P35` blocked by CORS |
| CORS-002 | Critical | Same for `/api/designs/P35/stress`                                |
| CORS-003 | Critical | Same for `/api/designs/P35/geometry`                              |

**Root Cause**: Backend API at port 3001 not running or lacks CORS headers.
**Impact**: Cannot view any Pareto-generated designs (P1-P50) in 3D Viewer.

### HIGH: 3D Viewer Context Loss

When clicking "View in 3D" from Pareto:

- Header shows correct design ID (P35)
- But displays "No geometry data available"
- Design selection only shows A-E, not PXX

### MEDIUM: Chart Sizing Warnings

Console shows: "The width(-1) and height(-1) of chart should be greater than 0"

- Occurs during screen transitions
- May cause rendering issues

---

## Features Working

- ✓ Pareto chart renders with 50 designs
- ✓ Design selection (select button) works
- ✓ Design categorization (lightest, balanced, conservative, max margin)
- ✓ Legend toggle
- ✓ X/Y axis dropdowns visible
- ✓ PNG/SVG export buttons present
- ✓ Each design shows: Weight, Cost, Burst pressure

---

## Gaps & UX Issues

| ID      | Type    | Description                                    |
| ------- | ------- | ---------------------------------------------- |
| GAP-P01 | Feature | No multi-select comparison mode visible        |
| GAP-P02 | Feature | No filter by design category                   |
| GAP-P03 | UX      | PXX designs don't work in 3D viewer            |
| GAP-P04 | UX      | No loading indicator when fetching design data |

---

## Design Cards Info

Each Pareto design card shows:

- Design ID (P1-P50)
- Category (lightest/balanced/conservative/max margin)
- Weight (kg)
- Cost (€)
- Burst pressure (bar)
- Select button
- View in 3D button
