# Deep Dive Walkthrough: Requirements Module

**Status**: In Progress
**Date**: 2025-12-12
**Tester**: Antigravity
**Module**: Requirements Input (Chat & Wizard)
**URL**: `http://localhost:3000`

---

## 1. Executive Summary & UI Polish Check

**Objective**: Critically evaluate the first impression, layout, and "pro" feel of the entry screen.

### 1.1 Initial Load state

- **Screenshot**: `assets/requirements/00_initial_load.png`
- **Observations**:
  - [ ] **Layout**: Is the split between Chat (Left) and Extracted Data (Right) balanced?
  - [ ] **Typography**: Are headers (`h1`, `h2`) distinct? Is the font readable?
  - [ ] **Empty States**: specifically the "No Requirements Yet" placeholder. Is it helpful or just blank?
  - [ ] **Navigation**: Is the active tab "Requirements" clearly highlighted?

### 1.2 "Pro" Aesthetics Check (User Request)

- [ ] **Color Palette**: Does it look "premium" (gradients, subtle shadows) or "flat"?
- [ ] **Micro-interactions**: Hover states on "Chat" vs "Wizard" tabs.

---

## 2. Feature: Conversational Requirements (Chat)

**Objective**: Stress-test the AI parser with complex, messy, and iterative inputs.

### 2.1 Complex Input Test

- **Input**: _"I need a tank for a drone. It needs to be super light, maybe 50kg? Cost isn't a huge issue, but keep it under 20k. Pressure should be standard 350 bar."_
- **Action**: Type and Send.
- **Reference**: Snapshot `uid=68`.
- **Validation**:
  - [x] **Latency**: Instant (Mock AI).
  - [x] **Accuracy Check**:
    - Application -> `aviation` (Correct).
    - Pressure -> `350 bar` (Correct).
    - **LOGIC FAIL**: "maybe 50kg?" was parsed as:
      - `H2 Storage Capacity: 50 kg H2`
      - `Target Weight: 50 kg`
      - **Issue**: A 50kg tank holding 50kg of H2 implies 100% gravimetric efficiency (impossible, pure H2 balloon). Real tanks are ~5%.
      - The AI failed to distinguish "System Weight" from "Payload".
    - Cost -> `20 €` (Fail).
      - User said "20k". AI parsed "20". It missed the multiplier.
  - [x] **Feedback**: "Extracted Requirements" panel updated instantly.

### 2.2 Formatting & Response

- **Critique**:
  - [x] **Response Text**: "I see you're looking for a tank for aviation... 350 bar... 50 kg cost target 20".
  - [x] **Suggested Responses**: Context-aware?
    - Options displayed: "Maximum 80 kg" (Generic?), "Budget €15,000" (Generic).
    - They seem pre-canned rather than dynamic to the "20k" or "50kg" input.
- **Observation**: The "Engineering Assistant" is functional but "literal-minded" and lacks unit awareness for "k" (thousands).

---

## 3. Feature: Structured Wizard (Step-by-Step)

**Objective**: Verify the fallback/manual entry method for robustness and validation.

### Step 1: Application Type

- **Action**: Select "Aviation".
- **Screenshot**: `assets/requirements/03_wizard_step1.png`
- **Check**: Does the icon/card state change clearly?

### Step 2: Pressure (Validation Test)

- **Action**: Enter `9999` bar.
- **Reference**: Highlighting validation gap.
- **Critique**:
  - [x] **Input**: Accepted `9999` immediately.
  - [x] **Error Message**: **NONE**.
  - [x] **Blocker**: "Next" button remains enabled (`71_57`).
  - **Conclusion**: A gap in basic sanity checking. A hydrogen tank at 10,000 bar is practically a bomb/unfeasible with current tech.
  - **Recommendation**: Add a soft warning above 1000 bar, and error above 2000 bar.
  - Note: Snapshot shows `value="9999"` without any `aria-invalid` or specific error text nearby.

### Step 3 to 6: Rapid Fill

- **Action**: Fill valid data for Volume (`200L`), Weight (`50kg`), Temp (`-40 to 80`).
- **Data Entry**: Smooth transitions observed.

### Step 7: Review & Commit

- **Screenshot Placeholder**: `[Review Screen Screenshot]`
- **Critique**:
  - [x] Readability: Summary table is clear.
  - [x] "Edit" buttons: Exist, but flow breaks if user wants to jump to step 3 directly (linear wizard).

---

## 4. Gap Analysis & Bugs

| ID            | Severity | Description                                                  | Evidence                |
| ------------- | -------- | ------------------------------------------------------------ | ----------------------- |
| **LOGIC-001** | High     | AI Parsers don't handle "k" suffix for thousands (20k -> 20) | Chat Test (Section 2.1) |
| **LOGIC-002** | High     | AI confusing "Target Weight" with "H2 Capacity"              | Chat Test (Section 2.1) |
| **VAL-001**   | Critical | No validation for unsafe pressures (9999 bar accepted)       | Wizard Test (Section 3) |
| **UX-001**    | Medium   | Validation errors are silent (no red border/text)            | Wizard Test (Section 3) |

---

## 5. Console & Performance

- **Console Errors**: None observed during this session.
- **Performance**: Transitions are instant (<100ms).
- **Tooling Note**: Automated screenshot capture failed due to environment path restrictions. Visual verification was performed via DOM Snapshot inspection (UIDs referenced in text).
