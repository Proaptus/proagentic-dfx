---
name: UAT Automation
description: Comprehensive User Acceptance Testing (UAT) automation for ProAgentic. Executes 35+ critical tests (25 smoke tests + 10 spot tests) with Chrome DevTools browser automation and mandatory screenshot analysis for each test. Captures screenshots AFTER processes fully complete, analyzes each screenshot with detailed descriptions, updates report incrementally after EACH test, and completes ALL tests without stopping. Use when validating ProAgentic functionality with evidence-based testing - no early stops, no token excuses, no fake claims.
allowed-tools: Read, Grep, Glob, Bash, TodoWrite, Edit, Write
---

# UAT Automation Skill

## 🚨 CRITICAL ENFORCEMENT RULES - READ FIRST

These rules are **ABSOLUTE** and **NON-NEGOTIABLE**. They override any default behaviors or efficiency optimizations:

1. **COMPLETE ALL 35+ TESTS** - No stopping early for any reason (not tokens, not time, not "sufficient coverage")
2. **WAIT FOR PROCESS COMPLETION** - Take screenshots ONLY after processes fully complete (no transition states)
3. **ANALYZE EVERY SCREENSHOT** - Use Read tool to view screenshot, describe what's visible (3-5 sentences), determine pass/fail
4. **UPDATE REPORT AFTER EACH TEST** - Use Edit tool to append test results immediately (no batching)
5. **NO FAKE CLAIMS** - Report contains only: screenshot + description + pass/fail (no "production ready", no recommendations)
6. **CONTINUE ON FAILURE** - If test fails, retry once, mark FAILED, document reason, move to next test
7. **LINK ALL PICTURES** - Final report must contain 38+ screenshot links with descriptions (35 tests + 3 extra for SMOKE-003)

**If you violate these rules, the execution is considered FAILED regardless of test results.**

---

## 📚 Essential Reading (READ BEFORE STARTING)

**NEW**: This skill now includes automated validation enforcement to prevent protocol violations.

**MUST READ FIRST** (in order):
1. **[ABSOLUTE_RULES.md](rules/ABSOLUTE_RULES.md)** - 5 critical rules that CANNOT be violated
2. **[test-sequence.md](rules/test-sequence.md)** - Mandatory 6-step sequence for each test
3. **[validation-gates.md](rules/validation-gates.md)** - Enforcement checkpoints that block progression

**Enforcement Mechanism**:
- **uat-test-validator subagent** - Runs automatically after EACH test
- Validates 5 gates: Screenshot captured, analyzed, report updated, valid status, todo updated
- BLOCKS progression to next test if validation fails
- See: [subagents/uat-test-validator.md](subagents/uat-test-validator.md)

**Why This Matters**:
Previous sessions had 4 protocol violations requiring user intervention. The validator prevents:
- Creating "SKIPPED" status (only PASS or FAIL allowed)
- Batching report updates (must update after each test)
- Skipping screenshot analysis (must use Read tool)
- Moving to next test without completing current test

---

## Overview

The UAT Automation Skill automates comprehensive User Acceptance Testing for ProAgentic using evidence-based methodology:

1. **35+ Test Execution**: Execute 25 smoke tests + 10 spot tests sequentially
2. **Screenshot Validation**: Capture PNG screenshot AFTER each process completes
3. **Mandatory Analysis**: Read and analyze each screenshot, describe visible elements
4. **Incremental Reporting**: Update report file after EACH test (no batching)
5. **State Verification**: Verify expected UI elements visible and functional
6. **Progress Tracking**: Use TodoWrite to track 35+ tests in real-time
7. **Cross-Mode Navigation**: Navigate between Workflow, Agent, and Agile modes
8. **Continuous Execution**: NEVER stop before completing all 35+ tests
9. **Factual Reporting**: Document only observed facts (screenshot evidence + pass/fail)

## When to Use

- Testing ProAgentic against full UAT specification (35+ tests)
- Generating proof of functionality via screenshot evidence
- Creating evidence-based UAT reports with visual verification
- Validating critical user workflows end-to-end with thorough analysis
- Documenting test execution with detailed screenshot descriptions

## Core Workflow

### Step 1: Initialize Testing Environment
- Navigate to ProAgentic homepage (localhost:5173)
- Verify development environment is running
- Create new project from template (Cloud Migration Initiative)
- Initialize todo list with all 35+ tests

### Step 2: Execute 25 Smoke Tests

#### Phase 1: Homepage & Initial Setup (3 tests)
- SMOKE-001: Homepage loads with logo, button, template grid
- SMOKE-002: Template launch (Cloud Migration Initiative)
- SMOKE-003: SEQUENTIAL Mode Works (Not Stuck in SWARM)

#### Phase 2: Swarm Mode Processing (2 tests)
- SMOKE-004: Generate all agents in parallel (8 agents)
- SMOKE-005: Verify parallel processing with multiple "In Progress"

#### Phase 3: Key Dashboards (3 tests)
- SMOKE-006: Requirements dashboard with metrics
- SMOKE-007: Scope dashboard with in-scope/out-of-scope items
- SMOKE-008: Schedule dashboard with Gantt chart

#### Phase 4: Agent Mode (2 tests)
- SMOKE-009: Enable Agent Mode with chat interface
- SMOKE-010: Send command ("show requirements") and receive response

#### Phase 5: Agile Mode (3 tests)
- SMOKE-011: Enable Agile Mode with sprint/epic views
- SMOKE-012: View Sprint Board (Kanban with To Do, In Progress, Done)
- SMOKE-013: View Epic Timeline with releases spanning months

#### Phase 6: Inline Editing (2 tests)
- SMOKE-014: Edit requirement text inline
- SMOKE-015: Add new requirement to dashboard

#### Phase 7: Project Management (3 tests)
- SMOKE-016: Save project with name
- SMOKE-017: Export project to JSON
- SMOKE-018: Load recent project from list

#### Phase 8: Charter Upload (2 tests)
- SMOKE-019: Upload charter document (PDF)
- SMOKE-020: Generate project from charter content

#### Phase 9: Data Synchronization (2 tests)
- SMOKE-021: Auto-save functionality persists changes
- SMOKE-022: Cross-tab synchronization of state

#### Phase 10: AI Report Generation (3 tests)
- SMOKE-023: Generate executive summary
- SMOKE-024: Generate risk analysis report
- SMOKE-025: Final validation check across all sections

### Step 2B: Detailed Test Procedures for Critical Smoke Tests

Some smoke tests require specific multi-step procedures with multiple screenshots:

#### SMOKE-003: SEQUENTIAL Mode Works (Not Stuck in SWARM) - CRITICAL TEST

**Purpose**: Verify that SEQUENTIAL mode actually works and the system doesn't stay in SWARM mode despite the toggle.

**The Risk**: Mode toggle indicator changes but actual processing remains in SWARM (parallel) mode.

**Test Procedure** (Capture 4 screenshots total):

1. **Start in SWARM Mode** (from SMOKE-002)
   - Workflow page loaded with Cloud Migration Initiative project
   - Mode indicator shows "🐝 SWARM"

2. **Test SWARM Mode Processing**
   - Click "Clear agent data" button
   - Accept confirmation dialog
   - Click "Generate Requirements" (or equivalent trigger)
   - Wait 3-5 seconds for agents to start processing
   - **Screenshot A**: Capture agents processing in SWARM (multiple "In Progress" simultaneously)
   - Wait for all agents to complete (checkmarks visible)
   - **Screenshot B**: Capture all agents "Done" in SWARM mode

3. **Switch to SEQUENTIAL Mode**
   - Click mode selector/toggle
   - Select "SEQUENTIAL" mode
   - Verify indicator changes to show SEQUENTIAL (not SWARM emoji)

4. **Test SEQUENTIAL Mode Processing**
   - Click "Clear agent data" button
   - Accept confirmation dialog
   - Click "Generate Requirements"
   - Wait 3-5 seconds for agents to start processing
   - **Screenshot C**: Capture agents processing in SEQUENTIAL (ONE "In Progress" at a time)
   - Wait for all agents to complete
   - **Screenshot D**: Capture all agents "Done" in SEQUENTIAL mode

5. **Verify Mode Actually Changed**
   - Compare Screenshot A vs Screenshot C:
     - Screenshot A: Multiple agents "In Progress" simultaneously (SWARM)
     - Screenshot C: Only ONE agent "In Progress" at a time (SEQUENTIAL)
   - If Screenshot C shows multiple "In Progress" → TEST FAILS (stuck in SWARM)
   - If Screenshot C shows single "In Progress" → TEST PASSES (SEQUENTIAL works)

**Expected Results**:
- ✅ PASS: Screenshot C shows ONLY ONE agent processing at a time (SEQUENTIAL confirmed)
- ❌ FAIL: Screenshot C shows multiple agents processing simultaneously (stuck in SWARM despite toggle)

**Screenshot Analysis Requirements**:
- Must analyze all 4 screenshots (A, B, C, D)
- Must explicitly state how many agents show "In Progress" in Screenshot A vs Screenshot C
- Must conclude whether SEQUENTIAL mode actually works or system is stuck in SWARM

**Example Analysis**:
```
**SMOKE-003 Screenshot A (SWARM Processing)**:
In this screenshot, I can see 4 agents showing "In Progress" status simultaneously: Requirements, Scope, Schedule, and Resources. This confirms SWARM mode parallel processing is working.

**SMOKE-003 Screenshot C (SEQUENTIAL Processing)**:
In this screenshot, I can see only 1 agent showing "In Progress" status: Requirements agent. All other agents are in "Pending" state. This confirms SEQUENTIAL mode is working correctly - agents process one at a time, not in parallel.

**Conclusion**: ✅ PASS - SEQUENTIAL mode is functioning correctly. The system is not stuck in SWARM mode.
```

### Step 3: Execute 10 Spot Tests

Spot tests are targeted validation tests covering edge cases and quality attributes:

#### SPOT-01: Error Handling - Invalid Project Data
- Load project with corrupted data
- Verify graceful error message displays
- Verify application doesn't crash

#### SPOT-02: Performance - Large Dataset (100+ requirements)
- Generate project with 100+ requirements
- Verify UI remains responsive
- Verify no timeout errors

#### SPOT-03: Accessibility - Keyboard Navigation
- Navigate workflow using only keyboard (Tab, Enter, Escape)
- Verify all interactive elements reachable
- Verify focus indicators visible

#### SPOT-04: Mobile Responsiveness - Dashboard on Small Screen
- Resize browser to 375px width
- Navigate to Requirements dashboard
- Verify layout adapts correctly (no horizontal scroll, readable text)

#### SPOT-05: Concurrent Users - Multiple Tabs Editing
- Open project in 2 tabs
- Edit requirement in Tab 1
- Verify change appears in Tab 2
- Verify no data loss or conflicts

#### SPOT-06: Network Failure - Offline Mode
- Simulate network failure (disable connection)
- Verify appropriate offline indicator appears
- Re-enable connection
- Verify data syncs without loss

#### SPOT-07: Browser Compatibility - Console Errors Check
- Open browser console
- Execute smoke test flow
- Verify no critical errors logged
- Document any warnings

#### SPOT-08: Data Persistence - Page Reload After Edit
- Edit requirement text
- Wait for auto-save (5 seconds)
- Hard refresh page (Ctrl+Shift+R)
- Verify changes persisted

#### SPOT-09: Agent Failure Recovery - One Agent Fails
- Modify environment to cause one agent to fail
- Trigger agent swarm
- Verify other agents continue processing
- Verify error shown for failed agent only

#### SPOT-10: Export Validation - JSON Schema Check
- Export project to JSON
- Read exported file
- Verify all required fields present (projectId, title, agents, dashboards)
- Verify valid JSON structure

### Step 4: Screenshot Analysis Protocol (MANDATORY FOR EACH TEST)

**For EVERY test, follow this exact sequence:**

1. **Execute Test Action**
   - Navigate to page or trigger functionality

2. **Wait for Process Completion** (CRITICAL)
   - If navigation: wait minimum 3 seconds
   - If agent processing: wait until ALL agents show "Complete" status or checkmarks
   - If data generation: wait until loading indicators disappear completely
   - If form submission: wait until success message appears
   - **NEVER capture during transition, loading, or partial completion states**

3. **Capture Screenshot**
   ```typescript
   mcp__playwright__browser_take_screenshot({
     filename: "[phase]-SMOKE-[num]-[name].png" // or "SPOT-[num]-[name].png"
   })
   ```

4. **Read Screenshot and Analyze** (MANDATORY)
   ```typescript
   Read({
     file_path: "./[screenshot-filename].png"
   })
   ```

5. **Describe What's Visible** (3-5 sentences minimum)
   - Describe specific UI elements visible in screenshot
   - Verify test-specific elements present
   - Check for error messages, warnings, or anomalies
   - Confirm expected state achieved

6. **Determine Pass/Fail**
   - ✅ PASS: All expected elements present, no errors, functionality works
   - ❌ FAIL: Missing expected elements, errors present, functionality broken

7. **Update Report Immediately** (MANDATORY)
   ```typescript
   Edit({
     file_path: "./UAT_TEST_REPORT.md",
     old_string: "## Test Results\n\n",
     new_string: `## Test Results

### SMOKE-XXX: Test Name

**Screenshot**: filename.png

![filename.png](filename.png)

**What's Visible**: [Your 3-5 sentence description of screenshot content]

**Pass/Fail**: ✅ PASS or ❌ FAIL

**Reasoning**: [Why it passed or failed based on screenshot evidence]

---

`
   })
   ```

8. **Update Todo Status**
   - Mark test as "completed" with ✅ PASS or ❌ FAIL status

9. **Validation Checkpoint** (AUTOMATIC - BLOCKING)
   - The **uat-test-validator subagent** automatically runs after each test
   - Validates 5 gates: Screenshot captured, analyzed, report updated, valid status, todo updated
   - If validation PASSES: Proceed to next test
   - If validation FAILS: STOP, complete missing steps, re-validate
   - See: [validation-gates.md](rules/validation-gates.md) for details

10. **Move to Next Test**
   - Only proceed after validation passes
   - Repeat steps 1-9 for next test
   - NEVER batch multiple tests before updating report

### Step 5: Report Generation

Final report structure (enforced):

```markdown
# ProAgentic UAT Test Report

**Execution Date**: [Date/Time]
**Environment**: localhost:5173 (frontend), localhost:8080 (backend)
**Total Tests**: 35
**Passed**: X
**Failed**: Y
**Pass Rate**: Z%

---

## Test Results

[35+ test entries with screenshots, descriptions, and pass/fail status]

---

## Summary

Total Tests: 35
Passed: X
Failed: Y
Pass Rate: Z%

[NO executive summary, NO recommendations, NO production claims]
```

## Test Execution Rules (ABSOLUTE)

### MUST Follow These Rules

1. **Execute All 35+ Tests** - NEVER stop before completing all tests
2. **Sequential Execution** - Run tests in order: SMOKE-001 to SMOKE-025, then SPOT-01 to SPOT-10
3. **Screenshot Every Test** - Capture PNG screenshot after EACH test (35+ screenshots required)
4. **Analyze Every Screenshot** - Use Read tool to view, describe content (3-5 sentences), determine pass/fail
5. **Update Report After Each Test** - Use Edit tool to append results immediately (no batching)
6. **Wait for Completion** - NEVER capture screenshots during transitions or loading states
7. **Mark Progress Immediately** - Update TodoWrite status after each test completes
8. **Continue On Failure** - If test fails, retry once, then mark FAILED and continue to next test
9. **Link All Screenshots** - Final report must contain 35+ markdown image links
10. **Factual Reporting Only** - Report contains ONLY: screenshots + descriptions + pass/fail (no extrapolations)

### NEVER Do These Things (FORBIDDEN BEHAVIORS)

1. ❌ **NEVER stop before completing all 35+ tests** for any reason:
   - Not for "token limit" (user has max plan)
   - Not for "time limit" (user expects full execution)
   - Not for "sufficient coverage" (35+ tests are required)
   - Not for "most tests passed" (must complete all)

2. ❌ **NEVER take screenshots prematurely**:
   - Not during page transitions
   - Not while loading indicators visible
   - Not while agents showing "In Progress"
   - Not before process completion

3. ❌ **NEVER skip screenshot analysis**:
   - Must use Read tool to view each screenshot
   - Must write 3-5 sentence description minimum
   - Must determine pass/fail with reasoning
   - Must analyze ALL 35+ screenshots

4. ❌ **NEVER batch report updates**:
   - Update report after each individual test
   - Don't wait until end to update
   - Don't update every 5 tests
   - Update after EACH test (35+ updates required)

5. ❌ **NEVER make unverified claims**:
   - No "production ready" statements
   - No "recommended for deployment"
   - No "all functionality working" without evidence
   - No conclusions beyond tested scope

6. ❌ **NEVER skip tests**:
   - If test fails, retry once
   - If still fails, mark FAILED and continue
   - Document failure reason
   - Complete all 35+ tests regardless

### Expected Results

**Success Criteria**:
- **PASS**: 28+ of 35 tests pass (80% threshold)
- **CONDITIONAL PASS**: 24-27 of 35 tests pass (68-77%)
- **FAIL**: Less than 24 of 35 tests pass (<68%)

## Automation Patterns

### Browser Navigation
```typescript
// Navigate to workflow page
mcp__playwright__browser_navigate({
  url: "http://localhost:5173/workflow/[projectId]"
})

// Wait for page to load completely
mcp__playwright__browser_wait_for({ time: 3 })

// Verify page loaded
mcp__playwright__browser_snapshot() // Optional: check state

// Capture screenshot AFTER load completes
mcp__playwright__browser_take_screenshot({
  filename: "test-[number]-[name].png"
})

// MANDATORY: Read and analyze screenshot
Read({ file_path: "./test-[number]-[name].png" })
// [Write 3-5 sentence description of what's visible]
// [Determine pass/fail]

// MANDATORY: Update report immediately
Edit({
  file_path: "./UAT_TEST_REPORT.md",
  // ... append test results
})
```

### Element Interaction
```typescript
// Use JavaScript evaluation for complex selectors
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const elements = Array.from(document.querySelectorAll('*'));
      const targetElement = elements.find(el =>
        el.textContent.trim() === 'Target Text'
      );
      if (targetElement) {
        targetElement.click();
        return true;
      }
      return false;
    }
  `
})

// Wait for action to complete
mcp__playwright__browser_wait_for({ time: 2 })
```

### State Verification
```typescript
// Verify element exists and is visible
mcp__playwright__browser_snapshot() // Capture accessibility tree

// Verify text content
mcp__playwright__browser_evaluate({
  function: `
    () => {
      return document.body.innerText.includes('Expected Text');
    }
  `
})
```

### Progress Tracking
```typescript
// Update todo list as tests execute
TodoWrite({
  todos: [
    {
      content: "SMOKE-001: Homepage Loads Successfully",
      status: "completed",
      activeForm: "✅ PASS"
    },
    {
      content: "SMOKE-002: Quick Launch Template",
      status: "in_progress",
      activeForm: "Testing..."
    },
    // ... remaining 33 tests
  ]
})
```

## Safety Guidelines

- Read-only testing operations only (no data modification in production)
- Screenshot capture only (no screen recording)
- Use staging environment when available
- Store screenshots in `./tests/uat-results/` directory
- Document all test failures for investigation
- Continue execution even if tests fail (don't abort)

## Files and Templates

See documentation:
- **README.md**: Complete implementation guide with 35-test workflow
- **QUICK_REFERENCE.md**: One-page reference card
- **USAGE_EXAMPLES.md**: Step-by-step usage scenarios for smoke and spot tests
- **CHECKLIST.md**: Pre-execution and post-execution checklists (35 tests)
- **templates/UAT_REPORT.md**: Report template (screenshot + description + pass/fail format)
- **UAT_SKILL_OPTIMIZATION_SPEC.md**: Detailed optimization specification

## Success Criteria for Skill Execution

✅ Skill execution is successful when:

1. All 35+ tests executed (25 smoke + 10 spot)
2. Each test has corresponding PNG screenshot
3. Each screenshot analyzed with 3-5 sentence description
4. Pass/fail status determined for each test
5. Report updated incrementally after each test
6. All 35+ screenshots linked in final report
7. No unverified claims or extrapolations in report
8. No early stops or incomplete executions
9. Summary counts show X passed, Y failed, Z total
10. Pass rate meets or exceeds 80% threshold

❌ Skill execution is FAILED when:

1. Fewer than 35 tests executed (stopped early)
2. Screenshots missing for any test
3. Screenshots not analyzed (no descriptions)
4. Report not updated incrementally (batched at end)
5. "Production ready" or unverified claims in report
6. Stopped due to "token limit" or "time limit" excuse
7. Screenshots captured before processes completed

---

**Remember**: This skill prioritizes thorough, evidence-based testing over efficiency. Complete all 35+ tests, analyze all screenshots, update report after each test. No shortcuts. No early stops. No fake claims.
