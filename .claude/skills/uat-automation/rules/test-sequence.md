# Mandatory Test Execution Sequence - H2 Tank Designer

**For EVERY test (SMOKE-001 through SMOKE-030), follow this exact 6-step sequence.**

This sequence is **MANDATORY** and **NON-NEGOTIABLE**. You cannot skip steps or change the order.

---

## The 6-Step Mandatory Sequence

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Execute Test Action                                 │
│ STEP 2: Wait for Process Completion                         │
│ STEP 3: Capture Screenshot                                  │
│ STEP 4: Analyze Screenshot (Read Tool)                      │
│ STEP 5: Update Report (Edit Tool)                           │
│ STEP 6: Update Todo & Proceed                               │
└─────────────────────────────────────────────────────────────┘
```

**NEVER skip a step. NEVER batch multiple tests.**

---

## STEP 1: Execute Test Action

**Purpose**: Perform the test interaction

**Common Actions for H2 Tank Designer**:
- Navigate to screens using keyboard shortcuts (1-9)
- Click buttons using snapshot UIDs
- Fill form fields in Requirements wizard
- Interact with 3D viewer (rotate, zoom)
- Click tabs in Analysis panels

**Example - Navigate to 3D Viewer**:
```typescript
// Use keyboard shortcut
mcp__chrome-devtools__press_key({ key: "3" })

// OR click nav item
mcp__chrome-devtools__take_snapshot()
// Find "3D Viewer" button UID from snapshot
mcp__chrome-devtools__click({ uid: "nav-3d-viewer-uid" })
```

**Example - Fill Requirements Form**:
```typescript
mcp__chrome-devtools__take_snapshot()
// Find form field UIDs
mcp__chrome-devtools__fill({ uid: "length-input", value: "1000" })
mcp__chrome-devtools__fill({ uid: "diameter-input", value: "500" })
```

**Success criteria**: Action triggered, process started

**Next step**: Wait for process to COMPLETE (not just start)

---

## STEP 2: Wait for Process Completion (CRITICAL)

**Purpose**: Ensure process fully completes before capturing screenshot

**This is the MOST VIOLATED step** - screenshots taken too early are INVALID.

### Wait Times by Test Type

| Test Type | Minimum Wait | What to Check |
|-----------|--------------|---------------|
| Page Navigation | 3 seconds | Page loaded, no spinners |
| Form Input | 1 second | Input accepted, validation shown |
| 3D Model Load | 5 seconds | Model rendered, no loading |
| Analysis Tab Switch | 2 seconds | Charts rendered |
| Export Generation | 10 seconds | Progress complete |
| Compliance Checks | 15 seconds | All checks complete |

### H2 Tank Designer Specific Waits

**Requirements Wizard Navigation**:
```typescript
// After clicking Next step
await mcp__chrome-devtools__wait_for({ text: "Step 2", timeout: 5000 })
```

**3D Model Loading**:
```typescript
// After navigating to 3D Viewer
// Wait for canvas to render
mcp__chrome-devtools__evaluate_script({
  function: `() => {
    const canvas = document.querySelector('canvas');
    return canvas && canvas.width > 0;
  }`
})
// Then wait additional 3 seconds for full render
```

**Chart Rendering**:
```typescript
// After switching analysis tabs
// Wait for SVG charts to render
mcp__chrome-devtools__evaluate_script({
  function: `() => {
    const charts = document.querySelectorAll('svg');
    return charts.length > 0;
  }`
})
```

**Success criteria**: Process 100% complete, final state achieved

**Next step**: Capture screenshot of final state

---

## STEP 3: Capture Screenshot

**Purpose**: Create visual evidence of test result

**Tool**: `mcp__chrome-devtools__take_screenshot`

**Filename Convention for H2 Tank Designer**:
```
smoke-[num]-[short-name].png

Examples:
- smoke-001-app-loads.png
- smoke-005-wizard-mode.png
- smoke-014-3d-tank-render.png
- smoke-019-analysis-tabs.png
- smoke-026-export-config.png
```

**Example**:
```typescript
mcp__chrome-devtools__take_screenshot({
  filename: "smoke-014-3d-tank-render.png"
})
```

**Full Page Screenshot** (if needed):
```typescript
mcp__chrome-devtools__take_screenshot({
  filename: "smoke-022-compliance-full.png",
  fullPage: true
})
```

**Success criteria**:
- File saved successfully
- Image shows complete UI state
- No loading indicators visible

**Next step**: Read and analyze screenshot

---

## STEP 4: Analyze Screenshot (Read Tool)

**Purpose**: View screenshot, describe content, determine pass/fail

**Tool**: `Read({ file_path: "smoke-xxx-name.png" })`

**MANDATORY steps**:
1. Call Read tool on screenshot file
2. Write 3-5 sentence description of what's visible
3. Determine pass/fail based on screenshot evidence

**H2 Tank Designer Specific Analysis Points**:

### Navigation Tests (SMOKE-001 to 004)
- Is sidebar visible with all sections?
- Is "ProAgentic DfX" header present?
- Is H2 Tank module indicator shown?
- Is correct screen active (blue indicator)?

### Requirements Tests (SMOKE-005 to 009)
- Is wizard/chat interface visible?
- Are form fields rendered?
- Is progress indicator correct?
- Are values displayed properly?

### Pareto Tests (SMOKE-010 to 013)
- Is scatter plot/chart rendered?
- Are design points visible?
- Is selection feedback working?
- Are axis labels present?

### 3D Viewer Tests (SMOKE-014 to 017)
- Is 3D model rendered (not blank canvas)?
- Is tank geometry visible?
- Are controls responsive?
- Is cross-section working (if applicable)?

### Analysis Tests (SMOKE-018 to 021)
- Are comparison cards displayed?
- Do tabs switch content properly?
- Are charts rendered with data?
- Is stress visualization showing colors?

### Validation Tests (SMOKE-022 to 025)
- Are standards/tests listed?
- Are status indicators visible?
- Do results show pass/fail?
- Is summary accurate?

### Export Tests (SMOKE-026 to 030)
- Are export options displayed?
- Is format selection working?
- Is progress/completion shown?
- Is Sentry dashboard populated?

**Example Analysis**:
```
Read({ file_path: "smoke-014-3d-tank-render.png" })

**Description**:
In this screenshot, I can see the 3D Viewer screen with a Type IV hydrogen tank
model rendered in the center canvas. The tank shows a cylindrical body with
hemispherical end caps, rendered with realistic metallic materials and ambient
lighting. The sidebar navigation is visible on the left with "3D Viewer"
highlighted with a blue indicator. Camera control buttons are visible in the
top-right corner of the canvas. No error messages or loading indicators are
present.

**Determination**: ✅ PASS - 3D model renders correctly with proper geometry and
materials.
```

**Success criteria**:
- Read tool invoked on screenshot
- Description written (3-5 sentences minimum)
- Pass/fail determination made with clear reasoning

**Next step**: Update report with results

---

## STEP 5: Update Report (Edit Tool)

**Purpose**: Document test results immediately

**Tool**: `Edit({ file_path: "./H2_UAT_REPORT.md", ... })`

**Report File**: `H2_UAT_REPORT.md` (in project root or specified directory)

**Entry Format**:
```markdown
### SMOKE-014: 3D Tank Model Renders

**Screenshot**: smoke-014-3d-tank-render.png

![smoke-014-3d-tank-render.png](smoke-014-3d-tank-render.png)

**What's Visible**: In this screenshot, I can see the 3D Viewer screen with a
Type IV hydrogen tank model rendered in the center canvas. The tank shows a
cylindrical body with hemispherical end caps. The sidebar shows "3D Viewer"
active. Camera controls visible in top-right. No errors present.

**Pass/Fail**: ✅ PASS

**Reasoning**: 3D model renders correctly with proper geometry, materials, and
lighting. All expected UI elements present.

---
```

**CRITICAL**: Update report IMMEDIATELY after analyzing screenshot. DO NOT batch updates.

**Example Edit Command**:
```typescript
Edit({
  file_path: "./H2_UAT_REPORT.md",
  old_string: "## Test Results\n\n",
  new_string: `## Test Results

### SMOKE-014: 3D Tank Model Renders

**Screenshot**: smoke-014-3d-tank-render.png

![smoke-014-3d-tank-render.png](smoke-014-3d-tank-render.png)

**What's Visible**: [Your description from Step 4]

**Pass/Fail**: ✅ PASS

**Reasoning**: [Your reasoning from Step 4]

---

`
})
```

**Success criteria**:
- Edit tool called
- Test entry added to report
- Entry includes screenshot link, description, pass/fail, reasoning

**Next step**: Update todo and proceed

---

## STEP 6: Update Todo & Proceed

**Purpose**: Mark test complete, update progress, move to next test

**Actions**:
1. Call TodoWrite to mark current test "completed"
2. Mark next test "in_progress"
3. Proceed to next test (return to Step 1)

**Example**:
```typescript
TodoWrite({
  todos: [
    // Previous tests...
    {
      content: "SMOKE-013: Select Optimal Design",
      status: "completed",
      activeForm: "✅ PASS"
    },
    {
      content: "SMOKE-014: 3D Tank Model Renders",
      status: "completed",
      activeForm: "✅ PASS"
    },
    {
      content: "SMOKE-015: Camera Controls Work",
      status: "in_progress",
      activeForm: "Testing camera controls"
    },
    // Remaining tests...
  ]
})
```

**Success criteria**:
- Todo list updated with test result
- Next test marked in_progress
- Ready to proceed

**Next step**: Return to STEP 1 for next test

---

## Complete Example: SMOKE-014 (3D Tank Render)

```typescript
// ═══════════════════════════════════════════════════════════
// STEP 1: Execute Test Action
// ═══════════════════════════════════════════════════════════

// Navigate to 3D Viewer using keyboard shortcut
mcp__chrome-devtools__press_key({ key: "3" })

// ═══════════════════════════════════════════════════════════
// STEP 2: Wait for Process Completion
// ═══════════════════════════════════════════════════════════

// Wait for navigation
// (3 seconds for page load)

// Wait for 3D model to render
// (additional 5 seconds for Three.js canvas)

// Verify canvas is rendered
mcp__chrome-devtools__evaluate_script({
  function: `() => {
    const canvas = document.querySelector('canvas');
    return canvas && canvas.width > 0 && canvas.height > 0;
  }`
})
// Returns: true

// ═══════════════════════════════════════════════════════════
// STEP 3: Capture Screenshot
// ═══════════════════════════════════════════════════════════

mcp__chrome-devtools__take_screenshot({
  filename: "smoke-014-3d-tank-render.png"
})

// ═══════════════════════════════════════════════════════════
// STEP 4: Analyze Screenshot (Read Tool)
// ═══════════════════════════════════════════════════════════

Read({ file_path: "smoke-014-3d-tank-render.png" })

// Write description:
// "In this screenshot, I can see the 3D Viewer screen with a Type IV
// hydrogen tank model rendered in the center canvas. The tank displays
// a cylindrical body with hemispherical end caps, rendered with realistic
// metallic materials and proper lighting. The sidebar navigation shows
// '3D Viewer' as active with a blue indicator. Camera control buttons
// are visible. No error messages or loading spinners present."

// Determination: ✅ PASS - 3D model renders correctly

// ═══════════════════════════════════════════════════════════
// STEP 5: Update Report (Edit Tool)
// ═══════════════════════════════════════════════════════════

Edit({
  file_path: "./H2_UAT_REPORT.md",
  old_string: "## Test Results\n\n",
  new_string: `## Test Results

### SMOKE-014: 3D Tank Model Renders

**Screenshot**: smoke-014-3d-tank-render.png

![smoke-014-3d-tank-render.png](smoke-014-3d-tank-render.png)

**What's Visible**: In this screenshot, I can see the 3D Viewer screen with
a Type IV hydrogen tank model rendered in the center canvas. The tank
displays a cylindrical body with hemispherical end caps, rendered with
realistic metallic materials and proper lighting. The sidebar navigation
shows '3D Viewer' as active with a blue indicator. Camera control buttons
are visible. No error messages or loading spinners present.

**Pass/Fail**: ✅ PASS

**Reasoning**: 3D model renders correctly with proper geometry, materials,
and lighting. All expected UI elements present and functional.

---

`
})

// ═══════════════════════════════════════════════════════════
// STEP 6: Update Todo & Proceed
// ═══════════════════════════════════════════════════════════

TodoWrite({
  todos: [
    {
      content: "SMOKE-014: 3D Tank Model Renders",
      status: "completed",
      activeForm: "✅ PASS"
    },
    {
      content: "SMOKE-015: Camera Controls Work",
      status: "in_progress",
      activeForm: "Testing camera controls"
    }
  ]
})

// NOW proceed to SMOKE-015 (return to STEP 1)
```

---

## Common Violations

### Violation 1: Skipping Read Tool (Step 4)
```typescript
// ❌ WRONG
takeScreenshot("smoke-014.png")
updateReport("SMOKE-014") // Skipped Read tool - no analysis!
```
**Fix**: Always call `Read({ file_path: "..." })` on screenshot and write description.

### Violation 2: Batching Report Updates (Step 5)
```typescript
// ❌ WRONG
executeTest("SMOKE-014")
executeTest("SMOKE-015")
executeTest("SMOKE-016")
updateReport("SMOKE-014, 015, 016") // Batched - TOO LATE!
```
**Fix**: Update report immediately after EACH test.

### Violation 3: Capturing Screenshot Too Early (Step 2)
```typescript
// ❌ WRONG
navigateTo3DViewer()
// wait(1) // TOO SHORT for 3D to render!
takeScreenshot() // Blank canvas!
```
**Fix**: Wait for 3D canvas to fully render (5+ seconds, verify with script).

### Violation 4: Wrong Screenshot Path
```typescript
// ❌ WRONG
Read({ file_path: "./screenshots/smoke-014.png" }) // Wrong path!
```
**Fix**: Use correct path where screenshot was saved.

---

## Checklist for Each Test

```
Test: SMOKE-___

[ ] Step 1: Test action executed
[ ] Step 2: Waited for completion (verified no loading)
[ ] Step 3: Screenshot captured with correct filename
[ ] Step 4: Screenshot analyzed with Read tool (3-5 sentences)
[ ] Step 5: Report updated immediately with Edit tool
[ ] Step 6: Todo updated, ready for next test

Progress: 0/6 complete
```

---

## Summary

**The 6-step sequence is MANDATORY for EVERY test:**

1. **Execute** test action (navigate, click, fill)
2. **Wait** for process completion (CRITICAL - use appropriate delays)
3. **Capture** screenshot with descriptive filename
4. **Analyze** screenshot with Read tool (3-5 sentence description)
5. **Update** report with Edit tool (immediately, no batching)
6. **Proceed** after updating todo

**NEVER skip steps. NEVER batch tests. Complete all 30 tests.**
