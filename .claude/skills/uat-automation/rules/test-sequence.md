# Mandatory Test Execution Sequence

**For EVERY test (SMOKE-001 through SPOT-010), follow this exact 6-step sequence.**

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
│ STEP 6: Update Todo & Validate                              │
└─────────────────────────────────────────────────────────────┘
```

**NEVER skip a step. NEVER batch multiple tests.**

---

## STEP 1: Execute Test Action

**Purpose**: Perform the test interaction

**Actions**:
- Navigate to test URL
- Click button
- Type text
- Submit form
- Trigger functionality
- Wait for action to START

**Example**:
```typescript
// For SPOT-002: Load large dataset
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const generateBtn = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Generate Requirements'));
      if (generateBtn) generateBtn.click();
      return true;
    }
  `
})
```

**Success criteria**: Action triggered, process started

**Next step**: Wait for process to COMPLETE (not just start)

---

## STEP 2: Wait for Process Completion (CRITICAL)

**Purpose**: Ensure process fully completes before capturing screenshot

**This is the MOST VIOLATED step** - agents frequently capture screenshots too early.

**Wait indicators by test type**:

### Navigation Tests
- Wait: 3 seconds minimum after URL changes
- Verify: Page stops loading, elements visible

```typescript
mcp__playwright__browser_navigate({ url: "..." })
mcp__playwright__browser_wait_for({ time: 3 })
```

### Agent Processing Tests
- Wait: Until ALL agents show "Complete" or checkmarks
- Verify: No "In Progress" states visible
- Duration: May be 30-60 seconds

```typescript
// Start agent processing
triggerAgentGeneration()

// Wait for completion (not just start!)
mcp__playwright__browser_wait_for({ time: 5 }) // Initial wait
mcp__playwright__browser_snapshot() // Check state

// If agents still "In Progress", wait longer
mcp__playwright__browser_wait_for({ time: 10 })
mcp__playwright__browser_snapshot() // Check again

// Repeat until ALL agents "Complete"
```

### Form Submission Tests
- Wait: Until success message appears
- Verify: Toast notification or success indicator visible

```typescript
submitForm()
mcp__playwright__browser_wait_for({ time: 2 })
// Verify success message appears
```

### Data Generation Tests
- Wait: Until loading spinner disappears
- Verify: Data fully rendered on screen

```typescript
generateData()
mcp__playwright__browser_wait_for({ time: 5 })
// Verify loading indicators gone
```

**CRITICAL**: If you capture screenshot during a transition, loading state, or partial completion, the screenshot is INVALID and test FAILS.

**Success criteria**: Process 100% complete, final state achieved

**Next step**: Capture screenshot of final state

---

## STEP 3: Capture Screenshot

**Purpose**: Create visual evidence of test result

**Tool**: `mcp__playwright__browser_take_screenshot`

**Filename convention**:
- Smoke tests: `smoke-[num]-[name].png`
- Spot tests: `spot-[num]-[name].png`
- Multi-screenshot tests: `smoke-003-a-swarm-processing.png`, `smoke-003-b-swarm-complete.png`

**Example**:
```typescript
mcp__playwright__browser_take_screenshot({
  filename: "spot-002-performance-18-requirements.png"
})
```

**File location**: `./.playwright-mcp/[filename].png`

**Success criteria**:
- File saved successfully
- File size > 0 bytes (not empty)
- Filename follows convention

**Next step**: Read and analyze screenshot

---

## STEP 4: Analyze Screenshot (Read Tool)

**Purpose**: View screenshot, describe content, determine pass/fail

**Tool**: `Read({ file_path: "./.playwright-mcp/[filename].png" })`

**MANDATORY steps**:
1. Call Read tool on screenshot file
2. Write 3-5 sentence description of what's visible
3. Determine pass/fail based on screenshot evidence

**Description should include**:
- Specific UI elements visible (buttons, text, icons, counts)
- State indicators (checkmarks, "In Progress", error messages)
- Test-specific elements (e.g., "18 requirement cards", "Gantt chart")
- Any errors, warnings, or anomalies
- Conclusion about expected state

**Example**:
```typescript
Read({ file_path: "./.playwright-mcp/spot-002-performance-18-requirements.png" })

// Write description:
// "In this screenshot, I can see the Requirements dashboard displaying 18 requirement cards in a grid layout. The header shows 'Requirements (18)' confirming the count. All cards are fully rendered with titles and descriptions visible. The page is responsive with no loading indicators. Pagination controls are present at the bottom. No error messages or warnings visible."

// Determine: ✅ PASS - Large dataset (18 requirements) loads correctly, UI remains responsive
```

**Success criteria**:
- Read tool invoked on screenshot
- Description written (3-5 sentences minimum)
- Pass/fail determination made with reasoning

**Next step**: Update report with results

---

## STEP 5: Update Report (Edit Tool)

**Purpose**: Document test results immediately

**Tool**: `Edit({ file_path: "./UAT_COMPREHENSIVE_TEST_REPORT.md", ... })`

**Entry format**:
```markdown
### SPOT-002: Performance Test - Large Dataset

**Screenshot**: spot-002-performance-18-requirements.png

![spot-002-performance-18-requirements.png](./.playwright-mcp/spot-002-performance-18-requirements.png)

**What's Visible**: [Your 3-5 sentence description from Step 4]

**Pass/Fail**: ✅ PASS or ❌ FAIL

**Reasoning**: [Why it passed or failed based on screenshot evidence]

---
```

**CRITICAL**: Update report IMMEDIATELY after analyzing screenshot. DO NOT batch updates.

**Example**:
```typescript
Edit({
  file_path: "./UAT_COMPREHENSIVE_TEST_REPORT.md",
  old_string: "## Test Results\n\n",
  new_string: `## Test Results

### SPOT-002: Performance Test - Large Dataset

**Screenshot**: spot-002-performance-18-requirements.png

![spot-002-performance-18-requirements.png](./.playwright-mcp/spot-002-performance-18-requirements.png)

**What's Visible**: In this screenshot, I can see the Requirements dashboard displaying 18 requirement cards in a grid layout. The header shows "Requirements (18)" confirming the count. All cards are fully rendered with titles and descriptions visible. The page is responsive with no loading indicators. No error messages or warnings visible.

**Pass/Fail**: ✅ PASS

**Reasoning**: Large dataset (18 requirements) loads correctly, UI remains responsive, no performance issues detected.

---

`
})
```

**Success criteria**:
- Edit tool called
- Test entry added to report
- Entry includes screenshot link, description, pass/fail, reasoning

**Next step**: Update todo and validate

---

## STEP 6: Update Todo & Validate

**Purpose**: Mark test complete, trigger validation, proceed only if validation passes

**Actions**:
1. Call TodoWrite to mark current test "completed"
2. Mark next test "in_progress" (if not last test)
3. **Automatic**: `uat-test-validator` subagent runs
4. Check validation result
5. If PASS → Proceed to next test
6. If FAIL → Complete missing steps, re-validate

**Example**:
```typescript
TodoWrite({
  todos: [
    // ... previous tests
    {
      content: "SPOT-002: Performance - Large Dataset",
      status: "completed",
      activeForm: "✅ PASS"
    },
    {
      content: "SPOT-003: Accessibility - Keyboard Navigation",
      status: "in_progress",
      activeForm: "Testing accessibility"
    },
    // ... remaining tests
  ]
})

// Validator runs automatically and checks:
// ✅ Screenshot captured
// ✅ Screenshot analyzed with Read tool
// ✅ Report updated with Edit tool
// ✅ Status is PASS or FAIL (no other options)
// ✅ Todo updated

// If validation passes:
// → Proceed to STEP 1 for next test

// If validation fails:
// → Display missing steps
// → Complete missing steps
// → Re-validate
// → Only then proceed to next test
```

**Success criteria**:
- Todo list updated
- Validation checkpoint passed
- Ready for next test

**Next step**: Return to STEP 1 for next test

---

## Complete Example: SPOT-002

Here's the complete 6-step sequence for SPOT-002:

```typescript
// ═══════════════════════════════════════════════════════════
// STEP 1: Execute Test Action
// ═══════════════════════════════════════════════════════════

mcp__playwright__browser_evaluate({
  function: `
    () => {
      const generateBtn = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Generate Requirements'));
      if (generateBtn) {
        generateBtn.click();
        return true;
      }
      return false;
    }
  `
})

// ═══════════════════════════════════════════════════════════
// STEP 2: Wait for Process Completion
// ═══════════════════════════════════════════════════════════

// Initial wait for agents to start
mcp__playwright__browser_wait_for({ time: 5 })

// Check if agents still processing
mcp__playwright__browser_snapshot() // See if "In Progress" visible

// Wait for all agents to complete
mcp__playwright__browser_wait_for({ time: 30 })

// Verify completion
mcp__playwright__browser_snapshot() // All agents should show "Complete"

// ═══════════════════════════════════════════════════════════
// STEP 3: Capture Screenshot
// ═══════════════════════════════════════════════════════════

mcp__playwright__browser_take_screenshot({
  filename: "spot-002-performance-18-requirements.png"
})

// ═══════════════════════════════════════════════════════════
// STEP 4: Analyze Screenshot (Read Tool)
// ═══════════════════════════════════════════════════════════

Read({ file_path: "./.playwright-mcp/spot-002-performance-18-requirements.png" })

// Description:
// "In this screenshot, I can see the Requirements dashboard displaying 18 requirement
// cards in a grid layout. The header shows 'Requirements (18)' confirming the count.
// All cards are fully rendered with titles and descriptions visible. The page is
// responsive with no loading indicators. Pagination controls are present at the bottom.
// No error messages or warnings visible."

// Determination: ✅ PASS - Large dataset loads correctly, UI remains responsive

// ═══════════════════════════════════════════════════════════
// STEP 5: Update Report (Edit Tool)
// ═══════════════════════════════════════════════════════════

Edit({
  file_path: "./UAT_COMPREHENSIVE_TEST_REPORT.md",
  old_string: "## Test Results\n\n",
  new_string: `## Test Results

### SPOT-002: Performance Test - Large Dataset

**Screenshot**: spot-002-performance-18-requirements.png

![spot-002-performance-18-requirements.png](./.playwright-mcp/spot-002-performance-18-requirements.png)

**What's Visible**: In this screenshot, I can see the Requirements dashboard displaying 18 requirement cards in a grid layout. The header shows "Requirements (18)" confirming the count. All cards are fully rendered with titles and descriptions visible. The page is responsive with no loading indicators. No error messages or warnings visible.

**Pass/Fail**: ✅ PASS

**Reasoning**: Large dataset (18 requirements) loads correctly, UI remains responsive, no performance issues detected.

---

`
})

// ═══════════════════════════════════════════════════════════
// STEP 6: Update Todo & Validate
// ═══════════════════════════════════════════════════════════

TodoWrite({
  todos: [
    {
      content: "SPOT-002: Performance - Large Dataset",
      status: "completed",
      activeForm: "✅ PASS"
    },
    {
      content: "SPOT-003: Accessibility - Keyboard Navigation",
      status: "in_progress",
      activeForm: "Testing accessibility"
    }
  ]
})

// Validator runs automatically:
// ✅ Test SPOT-002 Validation: PASSED
//   ✓ Screenshot captured: spot-002-performance-18-requirements.png (152 KB)
//   ✓ Screenshot analyzed: Read tool called at 14:32:15
//   ✓ Report updated: Edit tool called, entry added at line 679
//   ✓ Valid status: ✅ PASS
//   ✓ Todo updated: Test marked completed
//
// Ready to proceed to next test: SPOT-003

// NOW proceed to SPOT-003 (return to STEP 1)
```

---

## Common Violations

### Violation 1: Skipping Read Tool (Step 4)

```typescript
// ❌ WRONG
captureScreenshot("spot-002.png")
updateReport("SPOT-002") // Skipped Read tool!
```

**Consequence**: Validator blocks progression - "Screenshot not analyzed with Read tool"

### Violation 2: Batching Report Updates (Step 5)

```typescript
// ❌ WRONG
executeTest("SPOT-002")
captureScreenshot("spot-002.png")
executeTest("SPOT-003")
captureScreenshot("spot-003.png")
// Now batch update report ← TOO LATE!
updateReport("SPOT-002")
updateReport("SPOT-003")
```

**Consequence**: Validator blocks progression after SPOT-002 - "Report not updated with test entry"

### Violation 3: Capturing Screenshot Too Early (Step 2)

```typescript
// ❌ WRONG
triggerAgentGeneration()
mcp__playwright__browser_wait_for({ time: 2 }) // TOO SHORT!
captureScreenshot() // Agents still "In Progress"
```

**Consequence**: Screenshot shows incomplete state, test result invalid

### Violation 4: Using Status Other Than PASS/FAIL (Step 5)

```markdown
<!-- ❌ WRONG -->
### SPOT-002: Performance Test
**Pass/Fail**: ⏭️ SKIPPED - test environment constraints
```

**Consequence**: Validator blocks progression - "Invalid test status - only PASS or FAIL allowed"

---

## Checklist for Each Test

Use this checklist to verify you've completed all steps:

```
Test: SPOT-002

[ ] Step 1: Test action executed (generate 18 requirements)
[ ] Step 2: Process completed (all agents show "Complete")
[ ] Step 3: Screenshot captured (spot-002-performance-18-requirements.png)
[ ] Step 4: Screenshot analyzed with Read tool (3-5 sentences written)
[ ] Step 5: Report updated with Edit tool (entry added to report)
[ ] Step 6: Todo updated (test marked completed)
[ ] Validation passed (all 5 gates passed)

Progress: 0/7 complete - CANNOT proceed to next test until all checked
```

---

## When Things Go Wrong

### Test Fails to Execute

**Action**: Mark as ❌ FAIL, document reason, proceed to next test

```markdown
### SPOT-002: Performance Test
**Pass/Fail**: ❌ FAIL
**Reasoning**: Unable to execute - test data missing (need 18 requirements, only 5 available)
```

### Screenshot Capture Fails

**Action**: Retry screenshot capture, if fails again mark as ❌ FAIL

### Report Update Fails

**Action**: Check report file path, retry Edit tool, verify file permissions

### Validation Fails

**Action**: Review validation output, complete missing steps, re-validate

---

## Summary

**The 6-step sequence is MANDATORY for EVERY test:**

1. **Execute** test action
2. **Wait** for process completion (CRITICAL - no shortcuts)
3. **Capture** screenshot
4. **Analyze** screenshot with Read tool (3-5 sentences)
5. **Update** report with Edit tool (immediately, no batching)
6. **Validate** before proceeding to next test

**NEVER skip steps. NEVER batch tests. NEVER proceed without validation.**

This sequence is enforced by the `uat-test-validator` subagent which automatically blocks progression if steps are skipped.

---

**References**:
- ABSOLUTE_RULES.md - 5 critical rules
- validation-gates.md - Validator gate details
- uat-test-validator subagent - Enforcement mechanism
