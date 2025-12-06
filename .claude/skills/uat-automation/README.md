# UAT Automation Skill - Complete Documentation

## Overview

The UAT Automation Skill provides a comprehensive, battle-tested methodology for executing ProAgentic's 25-test smoke test suite with screenshot validation and detailed reporting. This skill captures the exact testing workflow that successfully validated all critical ProAgentic functionality.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Environment Setup](#environment-setup)
3. [Test Execution](#test-execution)
4. [Screenshot Validation](#screenshot-validation)
5. [Report Generation](#report-generation)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- ProAgentic application running locally:
  - Frontend: http://localhost:5173
  - Backend: http://localhost:8080
- Playwright MCP available in Claude Code
- Node.js environment for running development server

### Quick Start

1. Ensure ProAgentic is running:
   ```bash
   cd /home/chine/projects/proagentic-clean
   npm run dev
   ```

2. Invoke the UAT Automation Skill:
   ```
   Run the UAT smoke test suite with screenshot validation for all 25 tests
   ```

3. Wait for execution to complete (~25-35 minutes)

4. Review generated UAT report with screenshots

## Environment Setup

### Verify Development Environment

```bash
# Check frontend is running
curl http://localhost:5173 -I

# Check backend is running
curl http://localhost:8080/api/health

# Check browser can connect
ps aux | grep -E "(vite|webpack)" | grep -v grep
```

### Directory Structure for Screenshots

Screenshots are captured to: `./tests/uat-results/[test-id].png`

Create directory if needed:
```bash
mkdir -p tests/uat-results
```

### Environment Variables

No special environment variables required for UAT testing. All tests use local development environment.

## Test Execution

### 25-Test Smoke Test Suite Structure

The UAT Skill executes 25 tests organized across 10 phases:

#### Phase 1: Homepage & Initial Setup (3 tests)
- SMOKE-001: Homepage loads with logo, button, template grid
- SMOKE-002: Template launch (Cloud Migration Initiative)
- SMOKE-003: Swarm Mode toggle enabled

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

#### Phase 10: AI Report Generation (2 tests)
- SMOKE-023: Generate executive summary
- SMOKE-024: Generate risk analysis report
- SMOKE-025: Final validation check across all sections

### Execution Flow

1. **Navigate to Homepage**: `http://localhost:5173`
2. **Create Project**: Select "Cloud Migration Initiative" template
3. **Enable Swarm Mode**: Toggle swarm mode ON
4. **Generate Requirements**: Trigger agent swarm
5. **Navigate Dashboards**: Requirements → Scope → Schedule
6. **Test Agent Mode**: Send command to agent
7. **Test Agile Mode**: Convert to agile and view sprint/epic
8. **Test Editing**: Edit requirement text and add new requirement
9. **Test Project Management**: Save, export, reload project
10. **Test Data Sync**: Auto-save and cross-tab sync
11. **Test Reports**: Generate summaries and risk reports
12. **Final Validation**: Verify all components working

### Handling Test Failures

**If a test fails:**

1. Check browser console for errors:
   ```typescript
   mcp__playwright__browser_console_messages({ onlyErrors: true })
   ```

2. Take screenshot for debugging:
   ```typescript
   mcp__playwright__browser_take_screenshot({
     filename: "debug-[test-id].png",
     fullPage: true
   })
   ```

3. Verify element exists:
   ```typescript
   mcp__playwright__browser_snapshot()
   ```

4. Retry test once, then mark as FAILED and continue to next test

5. Document failure in UAT report

## Screenshot Validation

### How Screenshots Prove Execution

Each screenshot validates:

1. **Test-Specific UI Elements**: Required elements visible for that test
2. **State Achievement**: Expected state reached (e.g., agent processing, modal open)
3. **No Errors**: Browser console shows no critical errors
4. **Correct Mode**: Right mode active (Workflow/Agent/Agile)

### Screenshot Naming Convention

```
[phase-number]-[test-id]-[test-name].png

Examples:
- 01-SMOKE-001-homepage-loads.png
- 02-SMOKE-004-agents-processing.png
- 05-SMOKE-013-epic-timeline.png
```

### Screenshot Quality Checklist

✅ Screenshot is PNG format
✅ Filename matches test ID
✅ Relevant UI elements visible
✅ No critical errors in console
✅ Timestamp or timing context visible if relevant
✅ Full viewport captured (not cropped)

## Report Generation

### UAT Report Contents

The final UAT report includes:

```
ProAgentic UAT Smoke Test Report
================================

Execution Date: [date/time]
Environment: Development (localhost:5173, localhost:8080)
Duration: [total time]

SUMMARY
-------
Total Tests: 25
Passed: X
Failed: Y
Pass Rate: Z%

DETAILED RESULTS
----------------
Phase 1: Homepage & Initial Setup
  ✅ SMOKE-001: Homepage Loads Successfully
  ✅ SMOKE-002: Quick Launch Template
  ✅ SMOKE-003: Swarm Mode Toggle
  [Phase 1 screenshots]

[Phases 2-10 with same format]

FAILED TESTS
------------
[List any failures with reasons]

SCREENSHOTS
-----------
[All 25 test screenshots with descriptions]

CONCLUSION
----------
[Summary of test results and recommendations]
```

### Generating Report Programmatically

Use the report template:
```bash
./scripts/generate-report.sh
```

Or manually create Markdown report with all screenshots embedded.

## Troubleshooting

### Problem: Browser Navigation Timeouts

**Symptoms**: Test stalls on navigation, timeout errors

**Solutions**:
1. Check localhost:5173 is accessible: `curl http://localhost:5173`
2. Increase wait time: `mcp__playwright__browser_wait_for({ time: 5 })`
3. Reload page: `mcp__playwright__browser_navigate({ url: "http://localhost:5173" })`

### Problem: Element Not Found

**Symptoms**: "Ref not found" or "Element not found" errors

**Solution**: Use JavaScript evaluation instead of ref-based selection:
```typescript
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const elements = Array.from(document.querySelectorAll('*'));
      const target = elements.find(el => 
        el.textContent.trim() === 'Expected Text'
      );
      if (target) {
        target.click();
        return true;
      }
      return false;
    }
  `
})
```

### Problem: Screenshot Token Limit

**Symptoms**: Token limit exceeded when capturing snapshot

**Solutions**:
1. Use `browser_take_screenshot` instead of `browser_snapshot` for large pages
2. Capture viewport only (not full page): `fullPage: false`
3. Break long tests into multiple shorter navigation steps

### Problem: State Not Persistent Between Tests

**Symptoms**: Dashboard content missing after navigation

**Solutions**:
1. Verify page fully loaded: `mcp__playwright__browser_wait_for({ time: 3 })`
2. Check for console errors: `mcp__playwright__browser_console_messages()`
3. Reload page if state lost: `mcp__playwright__browser_navigate({ url: "..." })`

### Problem: Agile Mode Conversion Fails

**Symptoms**: Agile mode doesn't complete, errors during wizard

**Solution**: Complete the 5-step wizard fully:
1. Estimation approach selection
2. Sprint settings configuration
3. Dependencies review
4. Risk assessment
5. Review and generate

Don't skip steps or cancel midway.

## Best Practices

### 1. Continuous Execution Without Stopping

✅ **DO**: Run all 25 tests sequentially without pausing
```
Test 1 → Screenshot → Test 2 → Screenshot → ... → Test 25 → Screenshot → Report
```

❌ **DON'T**: Stop between tests or ask for approval
```
Test 1 → [STOP] → Wait for user input → Test 2 → [STOP]
```

### 2. Progress Tracking with TodoWrite

✅ **DO**: Update todo list after each test
```typescript
TodoWrite({
  todos: [
    { content: "SMOKE-001: ...", status: "completed", activeForm: "✅ PASS" },
    { content: "SMOKE-002: ...", status: "in_progress", activeForm: "Testing..." },
    // ... 
  ]
})
```

### 3. Screenshot Validation

✅ **DO**: Verify test-specific elements in every screenshot
- Test 006: Requirements dashboard visible with counts
- Test 012: Sprint board with columns (To Do, In Progress, Done)
- Test 023: Executive summary generation dialog

### 4. Error Recovery

✅ **DO**: Handle errors gracefully
1. First failure: Retry once
2. Second failure: Mark FAILED, continue to next test
3. Document in report

### 5. Cross-Mode Navigation

✅ **DO**: Use direct URL navigation for mode switching:
```
Workflow: /workflow/[projectId]
Agent: /agent/[projectId]
Agile: /workflow/[projectId]/agile
```

### 6. State Management

✅ **DO**: Wait for page loads and state changes
```typescript
// Navigate
mcp__playwright__browser_navigate({ url: "..." })

// Wait for load
mcp__playwright__browser_wait_for({ time: 3 })

// Verify state
mcp__playwright__browser_snapshot()

// Capture proof
mcp__playwright__browser_take_screenshot()
```

### 7. Comprehensive Reporting

✅ **DO**: Document everything in UAT report
- Test ID and name
- Expected results
- Actual results
- Screenshot
- Pass/fail status
- Any issues encountered

## Advanced Usage

### Running Specific Phase Only

To run tests from single phase, modify test list:

```typescript
// Run only Phase 1 (tests 1-3)
TodoWrite({
  todos: [
    { content: "SMOKE-001: ...", status: "pending", ... },
    { content: "SMOKE-002: ...", status: "pending", ... },
    { content: "SMOKE-003: ...", status: "pending", ... },
  ]
})
```

### Debugging Failed Tests

For detailed debugging:

```typescript
// 1. Navigate to test
mcp__playwright__browser_navigate({ url: "..." })

// 2. Capture snapshot for inspection
mcp__playwright__browser_snapshot()

// 3. Check console for errors
mcp__playwright__browser_console_messages({ onlyErrors: true })

// 4. Evaluate specific state
mcp__playwright__browser_evaluate({
  function: `() => {
    return {
      url: window.location.href,
      title: document.title,
      hasErrors: !!document.querySelector('[role="alert"]')
    }
  }`
})

// 5. Take screenshot for analysis
mcp__playwright__browser_take_screenshot({ fullPage: true })
```

### Customizing Test Coverage

Modify test list in TodoWrite to include/exclude specific tests:

```typescript
// Example: Skip Phase 8 (charter upload) for quick smoke test
TodoWrite({
  todos: [
    // Phases 1-7: 18 tests
    { ... },
    // Skip Phase 8: 2 tests
    // Phases 9-10: 4 tests
    { ... }
  ]
})
```

## Integration with CI/CD

This skill can be integrated into CI/CD pipelines:

```bash
# Run UAT in headless mode
npm run test:uat

# Generate report automatically
./scripts/generate-report.sh

# Upload screenshots to artifact store
./scripts/upload-artifacts.sh

# Check pass rate against threshold
if [ $(grep "Pass Rate" uat-report.md | grep -oE "[0-9]+") -ge 92 ]; then
  echo "UAT PASSED"
else
  echo "UAT FAILED"
  exit 1
fi
```

## Support and Maintenance

### Updating Tests

If ProAgentic UI changes:

1. Update SMOKE test specifications in `/docs/UAT_SMOKE_TEST_SPECIFICATION.md`
2. Update element selectors in test cases
3. Update expected screenshot elements
4. Re-run full UAT suite
5. Update this documentation

### Adding New Tests

To add tests beyond Phase 10:

1. Create new SMOKE-026+ test in specification
2. Add to appropriate phase or create Phase 11+
3. Update test list in skill
4. Document expected results and screenshots
5. Execute and capture screenshot

### Reporting Issues

Document issues in UAT report:

```markdown
## Issues Identified

### Critical (Blocks Functionality)
- [Issue ID]: Description

### Major (Impacts User Experience)
- [Issue ID]: Description

### Minor (Does Not Block)
- [Issue ID]: Description
```

## Version History

- **v1.0** (2025-10-24): Initial UAT Automation Skill with 25-test smoke test suite
  - Phase 1-10 test coverage
  - Playwright MCP automation
  - Screenshot validation
  - Comprehensive UAT reporting
