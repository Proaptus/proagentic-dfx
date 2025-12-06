# Validation Gates - Enforcement Checkpoints

**The `uat-test-validator` subagent runs these 5 validation gates after EVERY test.**

These gates are **BLOCKING checkpoints** - you cannot proceed to the next test until all gates pass.

---

## Overview

```
After completing a test:

1. Screenshot Captured? → YES → Gate 1 PASS ✅
2. Screenshot Analyzed? → YES → Gate 2 PASS ✅
3. Report Updated? → YES → Gate 3 PASS ✅
4. Valid Status (PASS/FAIL)? → YES → Gate 4 PASS ✅
5. Todo Updated? → YES → Gate 5 PASS ✅

All 5 gates PASS? → Proceed to next test
Any gate FAILS? → STOP, complete missing steps
```

---

## Gate 1: Screenshot Captured ✅

**What it checks**: Screenshot file exists at expected path

**Expected path**: `./.playwright-mcp/{test-id}-*.png`

**Validation logic**:
```typescript
const expectedPath = `./.playwright-mcp/spot-002-*.png`
const fileExists = fs.existsSync(expectedPath)
const fileSize = fs.statSync(expectedPath).size

if (fileExists && fileSize > 0) {
  return PASS
} else {
  return FAIL
}
```

**Pass criteria**:
- File exists in `.playwright-mcp/` directory
- Filename matches test ID (e.g., `spot-002-*.png`)
- File size > 0 bytes (not empty)
- File is PNG format

**Fail criteria**:
- File does not exist
- File size is 0 bytes
- Wrong file format (not PNG)
- Filename doesn't match test ID

**Example pass**:
```
✅ Gate 1 PASSED: Screenshot captured
→ File: .playwright-mcp/spot-002-performance-18-requirements.png
→ Size: 152 KB
→ Format: PNG
```

**Example fail**:
```
❌ Gate 1 FAILED: Screenshot not captured
→ Expected: .playwright-mcp/spot-002-*.png
→ Found: No file at path
→ ACTION REQUIRED: Use browser_take_screenshot to capture screenshot
```

---

## Gate 2: Screenshot Analyzed with Read Tool 👁️

**What it checks**: Read tool was invoked on the screenshot file

**Validation logic**:
```typescript
// Search recent tool calls for Read invocation
const recentToolCalls = getRecentToolCalls(last50Calls)
const readToolCalled = recentToolCalls.some(call =>
  call.tool === "Read" &&
  call.file_path.includes("spot-002") &&
  call.timestamp > screenshotCaptureTime
)

if (readToolCalled) {
  return PASS
} else {
  return FAIL
}
```

**Pass criteria**:
- Read tool invoked AFTER screenshot captured
- Read tool file_path matches screenshot filename
- Analysis text written (3-5 sentences)

**Fail criteria**:
- Read tool NOT invoked
- Read tool called on wrong file
- Read tool called BEFORE screenshot (wrong order)
- No analysis text written after Read

**Example pass**:
```
✅ Gate 2 PASSED: Screenshot analyzed
→ Read tool called: 14:32:15 (3 seconds after screenshot)
→ File analyzed: .playwright-mcp/spot-002-performance-18-requirements.png
→ Analysis text: 5 sentences written
```

**Example fail**:
```
❌ Gate 2 FAILED: Screenshot not analyzed
→ Screenshot captured: 14:32:12
→ Read tool: NOT CALLED
→ ACTION REQUIRED: Use Read tool to view screenshot and write 3-5 sentence description
```

**Common mistake**: Agent captures screenshot but skips Read tool, moves directly to report update

---

## Gate 3: Report Updated with Test Entry 📝

**What it checks**: Report file was edited with test results for current test

**Validation logic**:
```typescript
// Search recent tool calls for Edit on report
const editToolCalled = recentToolCalls.some(call =>
  call.tool === "Edit" &&
  call.file_path.includes("UAT_COMPREHENSIVE_TEST_REPORT.md") &&
  call.new_string.includes("SPOT-002") &&
  call.timestamp > screenshotAnalysisTime
)

// Read report file to verify entry exists
const reportContent = fs.readFileSync("./UAT_COMPREHENSIVE_TEST_REPORT.md", "utf8")
const entryExists = reportContent.includes("### SPOT-002")
const hasScreenshot = reportContent.includes("![spot-002")
const hasStatus = reportContent.includes("**Pass/Fail**:")

if (editToolCalled && entryExists && hasScreenshot && hasStatus) {
  return PASS
} else {
  return FAIL
}
```

**Pass criteria**:
- Edit tool called on UAT_COMPREHENSIVE_TEST_REPORT.md
- Test entry includes test ID heading (e.g., "### SPOT-002")
- Test entry includes screenshot link (markdown image)
- Test entry includes "**Pass/Fail**:" with status
- Test entry includes analysis text (description)

**Fail criteria**:
- Edit tool NOT called
- Edit called on wrong file
- Test entry missing from report
- Screenshot not linked
- Status missing
- Description missing

**Example pass**:
```
✅ Gate 3 PASSED: Report updated
→ Edit tool called: 14:32:18
→ File: UAT_COMPREHENSIVE_TEST_REPORT.md
→ Entry added: "### SPOT-002: Performance Test - Large Dataset"
→ Screenshot linked: ✓
→ Status present: ✓
→ Description: 5 sentences (✓)
```

**Example fail**:
```
❌ Gate 3 FAILED: Report not updated
→ Edit tool: NOT CALLED
→ Report file: Not modified since SPOT-001
→ ACTION REQUIRED: Use Edit tool to append test results to report
```

**Common mistake**: Agent executes 2-3 tests before updating report (batching)

---

## Gate 4: Valid Status (PASS or FAIL Only) ⚠️

**What it checks**: Test status is ONLY "✅ PASS" or "❌ FAIL" (no other statuses)

**Validation logic**:
```typescript
const reportContent = fs.readFileSync("./UAT_COMPREHENSIVE_TEST_REPORT.md", "utf8")

// Extract test entry for current test
const testEntry = extractTestEntry(reportContent, "SPOT-002")

// Check for valid status
const hasPassStatus = testEntry.includes("✅ PASS")
const hasFailStatus = testEntry.includes("❌ FAIL")

// Check for invalid statuses
const hasSkippedStatus = testEntry.includes("SKIPPED") || testEntry.includes("⏭️")
const hasPendingStatus = testEntry.includes("PENDING") || testEntry.includes("⏸️")
const hasBlockedStatus = testEntry.includes("BLOCKED") || testEntry.includes("🚧")

if ((hasPassStatus || hasFailStatus) && !hasSkippedStatus && !hasPendingStatus && !hasBlockedStatus) {
  return PASS
} else {
  return FAIL
}
```

**Pass criteria**:
- Status is exactly "✅ PASS" OR exactly "❌ FAIL"
- No other status markers present
- Status appears in "**Pass/Fail**:" field

**Fail criteria**:
- Status is "SKIPPED", "PENDING", "BLOCKED", "N/A", or any other
- Multiple statuses present (e.g., "PASS but skipped")
- Status field missing entirely

**Example pass**:
```
✅ Gate 4 PASSED: Valid status
→ Status: ✅ PASS
→ Validation: Status is one of allowed values
```

**Example fail**:
```
❌ Gate 4 FAILED: Invalid test status
→ Found status: "⏭️ SKIPPED - test environment constraints"
→ Allowed statuses: ONLY "✅ PASS" or "❌ FAIL"
→ ACTION REQUIRED: Change status to PASS or FAIL (no other options allowed)
```

**Critical rule**: This gate enforces ABSOLUTE RULE #1 - "NO skipped category"

**Common mistake**: Agent creates "SKIPPED" status for tests that seem redundant or difficult

---

## Gate 5: Todo List Updated ✔️

**What it checks**: Test marked as "completed" in todo list

**Validation logic**:
```typescript
// Search recent tool calls for TodoWrite
const todoWriteCalled = recentToolCalls.some(call =>
  call.tool === "TodoWrite" &&
  call.timestamp > reportUpdateTime
)

// Check todo list content
const todoListContent = getTodoListState()
const currentTestStatus = todoListContent.find(todo =>
  todo.content.includes("SPOT-002")
)?.status

if (todoWriteCalled && currentTestStatus === "completed") {
  return PASS
} else {
  return FAIL
}
```

**Pass criteria**:
- TodoWrite called after report update
- Current test status is "completed"
- Next test status is "in_progress" (if not last test)

**Fail criteria**:
- TodoWrite NOT called
- Current test status still "in_progress"
- Next test already marked "in_progress" (skipped current)

**Example pass**:
```
✅ Gate 5 PASSED: Todo list updated
→ TodoWrite called: 14:32:20
→ SPOT-002 status: completed ✓
→ SPOT-003 status: in_progress ✓
```

**Example fail**:
```
❌ Gate 5 FAILED: Todo list not updated
→ SPOT-002 status: in_progress (should be completed)
→ SPOT-003 status: pending (should be in_progress)
→ ACTION REQUIRED: Call TodoWrite to mark test completed
```

---

## Complete Validation Output

### When All Gates Pass

```
✅ Test SPOT-002 Validation: PASSED (5/5 gates)

  ✓ Gate 1: Screenshot captured
    → File: .playwright-mcp/spot-002-performance-18-requirements.png (152 KB)

  ✓ Gate 2: Screenshot analyzed
    → Read tool called: 14:32:15
    → Analysis: 5 sentences written

  ✓ Gate 3: Report updated
    → Edit tool called: 14:32:18
    → Entry added at line 679

  ✓ Gate 4: Valid status
    → Status: ✅ PASS

  ✓ Gate 5: Todo updated
    → Test marked completed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ VALIDATION PASSED - Ready to proceed to next test: SPOT-003
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### When One or More Gates Fail

```
❌ Test SPOT-002 Validation: FAILED (3/5 gates passed)

  ✓ Gate 1: Screenshot captured
    → File: .playwright-mcp/spot-002-performance-18-requirements.png (152 KB)

  ✗ Gate 2: Screenshot analyzed
    → ERROR: Read tool NOT CALLED
    → ACTION: Use Read tool to view screenshot

  ✗ Gate 3: Report updated
    → ERROR: Edit tool NOT CALLED
    → ACTION: Use Edit tool to append test results

  ✓ Gate 4: Valid status
    → Status: ✅ PASS

  ✓ Gate 5: Todo updated
    → Test marked completed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 VALIDATION FAILED - STOP EXECUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Required Actions (complete before proceeding):

1. Use Read tool on: .playwright-mcp/spot-002-performance-18-requirements.png
2. Write 3-5 sentence description of screenshot content
3. Use Edit tool to append test results to UAT_COMPREHENSIVE_TEST_REPORT.md

DO NOT PROCEED TO SPOT-003 UNTIL ALL 5 GATES PASS.
```

---

## How to Handle Validation Failures

### Step 1: Read Validation Output

Carefully read which gates failed and what actions are required.

### Step 2: Complete Missing Steps

Execute the required actions in order:

1. If Gate 2 failed → Use Read tool on screenshot
2. If Gate 3 failed → Use Edit tool to update report
3. If Gate 4 failed → Change status to PASS or FAIL
4. If Gate 5 failed → Call TodoWrite

### Step 3: Re-Run Validation

After completing missing steps, the validator runs again automatically.

### Step 4: Verify All Gates Pass

Only proceed to next test when validation output shows:

```
✅ VALIDATION PASSED - Ready to proceed to next test
```

---

## Edge Cases

### Cross-Reference Tests

Some tests reference earlier tests (e.g., SPOT-005 references SMOKE-022).

**Validation handling**:
- Gates 1-5 still apply
- Can reuse screenshot from referenced test
- Must explicitly state "Cross-reference to SMOKE-022" in report
- Must update report with entry (even if cross-reference)
- Status must still be PASS or FAIL (not "SKIPPED")

### Multi-Screenshot Tests

Some tests require multiple screenshots (e.g., SMOKE-003 needs 4 screenshots).

**Validation handling**:
- Gate 1 checks for PRIMARY screenshot
- Additional screenshots are supplementary
- All screenshots must be analyzed with Read tool
- Report must include all screenshots
- Validation checks primary screenshot only

### Test Retry After Failure

If a test fails and is retried:

**Validation handling**:
- First attempt: FAIL → Validator passes (FAIL is valid)
- Retry: Capture new screenshot, analyze, update report
- If retry succeeds: Status changes to PASS → Validator passes
- If retry fails: Status remains FAIL → Validator passes

---

## Metrics

After implementing validation gates, measure:

**Protocol Violation Rate**:
- Target: 0 violations per session
- Current: 4 violations per session (before gates)
- Metric: Count how many times gates block progression

**User Intervention Rate**:
- Target: 0 interventions per session
- Current: 3 interventions per session (before gates)
- Metric: Count how many times user must correct agent

**Smooth Test Completion Rate**:
- Target: 35/35 tests (100%)
- Current: ~27/35 tests (~77%)
- Metric: Tests completed without validation failures

---

## Summary

**5 Validation Gates** run automatically after EVERY test:

1. **Screenshot Captured** - File exists, PNG format, correct path
2. **Screenshot Analyzed** - Read tool called, description written
3. **Report Updated** - Edit tool called, entry added with screenshot
4. **Valid Status** - ONLY "✅ PASS" or "❌ FAIL" allowed
5. **Todo Updated** - Test marked completed, next test in_progress

**All 5 gates must PASS before proceeding to next test.**

**Validation is AUTOMATIC and BLOCKING** - you cannot bypass it.

**Validation prevents**:
- Creating "SKIPPED" category (Gate 4)
- Batching report updates (Gate 3)
- Skipping screenshot analysis (Gate 2)
- Moving to next test without completing current (Gates 1-5)

---

**References**:
- ABSOLUTE_RULES.md - 5 critical rules
- test-sequence.md - Mandatory 6-step sequence
- uat-test-validator subagent - Enforcement implementation
