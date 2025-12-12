---
id: WALKTHROUGH-REQUIREMENTS-FULL-001
doc_type: test-report
title: 'Requirements Module - Detailed Walkthrough'
status: draft
date: 2025-12-12
owner: '@h2-tank-team'
last_verified_at: 2025-12-12
keywords: ['uat', 'walkthrough', 'requirements', 'detailed']
---

# Requirements Module - Detailed Walkthrough

**Module**: Requirements Input
**Date**: 2025-12-12
**Tester**: Antigravity
**Screenshots**: 15 captured in `docs/walkthroughs/`

---

## Screenshots

### Wizard Flow

| #   | File                                      | Description                           |
| --- | ----------------------------------------- | ------------------------------------- |
| 01  | ![Initial](REQ_01_initial.png)            | Initial state - Chat tab selected     |
| 02  | ![Step1](REQ_02_wizard_step1.png)         | Wizard Step 1 - Application selection |
| 03  | ![Step2](REQ_03_pressure.png)             | Step 2 - Pressure (700 bar default)   |
| 04  | ![Extreme](REQ_04_extreme_pressure.png)   | **BUG**: 9999 bar accepted            |
| 05  | ![Capacity](REQ_05_capacity.png)          | Step 3 - Capacity                     |
| 06  | ![Constraints](REQ_06_constraints.png)    | Step 4 - Weight & Cost                |
| 07  | ![Negative](REQ_07_negative_weight.png)   | **BUG**: -50kg accepted               |
| 08  | ![Environment](REQ_08_environment.png)    | Step 5 - Environment                  |
| 09  | ![TempError](REQ_09_temp_logic_error.png) | **BUG**: Max temp &lt; Min temp       |
| 10  | ![Cert](REQ_10_certification.png)         | Step 6 - Certification                |
| 11  | ![Review](REQ_11_review_9999bar.png)      | Step 7 - Review (9999 bar carried)    |

### Chat Flow

| #   | File                                              | Description                  |
| --- | ------------------------------------------------- | ---------------------------- |
| 12  | ![ChatFresh](REQ_12_chat_fresh.png)               | Chat - Fresh state           |
| 13  | ![ChatInput](REQ_13_chat_input.png)               | Chat - Submarine query input |
| 14  | ![ChatResponse](REQ_14_chat_response_50k_bug.png) | **BUG**: 50k→50€ parsing     |
| 15  | ![Help](REQ_15_help_panel.png)                    | Help panel                   |

---

## Bugs Found

### CRITICAL: No Input Validation

| Bug ID  | Severity | Field    | Input              | Expected | Actual   | Screenshot |
| ------- | -------- | -------- | ------------------ | -------- | -------- | ---------- |
| VAL-001 | Critical | Pressure | 9999 bar           | Error    | Accepted | REQ_04     |
| VAL-002 | Critical | Weight   | -50 kg             | Error    | Accepted | REQ_07     |
| VAL-003 | Critical | Max Temp | -100°C (below min) | Error    | Accepted | REQ_09     |

### HIGH: AI Parsing Errors

| Bug ID | Severity | Issue                     | Example                             | Screenshot |
| ------ | -------- | ------------------------- | ----------------------------------- | ---------- |
| AI-001 | High     | "k" multiplier ignored    | "50k"→"50"                          | REQ_14     |
| AI-002 | High     | Weight/Capacity confusion | "200kg weight"→"200 kg H2 capacity" | REQ_14     |

---

## Features Working

- ✓ Tab switching (Chat/Wizard)
- ✓ Quick Start buttons
- ✓ Wizard navigation (Next/Back)
- ✓ Inline edit requirements
- ✓ Help panel with keyboard shortcuts
- ✓ All 7 wizard steps complete

---

## Recommendations

1. **Immediate**: Add input validation
   - Pressure: max 1000 bar
   - Weight: must be positive
   - Temperature: max must be > min

2. **High**: Fix AI parsing
   - Handle "k" multiplier (1k, 20k)
   - Distinguish weight vs H2 capacity
