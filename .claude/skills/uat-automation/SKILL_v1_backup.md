---
name: UAT Automation
description: Comprehensive User Acceptance Testing (UAT) automation for ProAgentic. Executes 25 critical smoke tests across 10 phases with Playwright browser automation and screenshot validation for each test to prove execution. Captures real-time state verification, cross-mode navigation (Workflow/Agent/Agile), and generates detailed UAT reports. Use when validating ProAgentic functionality against UAT specification or running complete smoke test suite with screenshot evidence. Follows continuous execution control pattern - executes all tests sequentially without stopping, validates with screenshots, and produces comprehensive report.
allowed-tools: Read, Grep, Glob, Bash, TodoWrite
---

# UAT Automation Skill

## Overview

The UAT Automation Skill automates comprehensive User Acceptance Testing for ProAgentic using a proven methodology:

1. **Sequential Test Execution**: Execute all 25 smoke tests in order across 10 phases
2. **Screenshot Validation**: Capture PNG screenshots after each test to prove execution
3. **State Verification**: Assert expected UI elements and states after each test
4. **Progress Tracking**: Use TodoWrite to track execution progress in real-time
5. **Cross-Mode Navigation**: Navigate between Workflow, Agent, and Agile modes
6. **Report Generation**: Produce comprehensive UAT report with test results and screenshots
7. **Continuous Execution**: Never stop between tests - proceed through all 25 tests without pausing

## When to Use

- Testing ProAgentic against UAT specification (25 smoke tests)
- Generating proof of functionality via screenshots
- Creating comprehensive UAT reports for stakeholders
- Validating critical user workflows end-to-end
- Documenting test execution with visual evidence

## Core Workflow

### Step 1: Initialize Testing Environment
- Navigate to ProAgentic homepage (localhost:5173)
- Verify development environment is running
- Create new project from template (Cloud Migration Initiative)

### Step 2: Execute Smoke Tests (25 Total)
- **Phase 1** (3 tests): Homepage & template launch
- **Phase 2** (2 tests): Swarm mode processing with parallel agents
- **Phase 3** (3 tests): Navigate critical dashboards
- **Phase 4** (2 tests): Enable agent mode and send commands
- **Phase 5** (3 tests): Enable agile mode, sprint board, epics
- **Phase 6** (2 tests): Inline editing and requirement management
- **Phase 7** (3 tests): Project save, export, load
- **Phase 8** (2 tests): Charter upload and generation
- **Phase 9** (2 tests): Auto-save and cross-tab sync
- **Phase 10** (2 tests): AI report generation
- **Validation** (1 test): Final comprehensive check

### Step 3: Screenshot Validation
After each test, capture screenshot proving:
- Test-specific UI elements are visible
- Expected state has been reached
- No error messages present

### Step 4: Report Generation
Create UAT report containing:
- Total tests executed
- Pass/fail results
- Screenshots for each test
- Execution duration
- Critical issues identified

## Automation Patterns

### Browser Navigation
```typescript
// Navigate to workflow page
mcp__playwright__browser_navigate({
  url: "http://localhost:5173/workflow/[projectId]"
})

// Wait for page to load
mcp__playwright__browser_wait_for({ time: 3 })

// Capture screenshot for validation
mcp__playwright__browser_take_screenshot({
  filename: "test-[number]-[name].png"
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
      targetElement?.click();
      return true;
    }
  `
})
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
    // ... more tests
  ]
})
```

## Test Execution Rules

### Must Follow These Rules
1. **Execute Sequentially**: Run tests in order SMOKE-001 through SMOKE-025
2. **Screenshot Every Test**: Capture PNG screenshot after each test
3. **Never Stop Early**: Complete all 25 tests before generating report
4. **Update Progress**: Mark todos as completed immediately after each test
5. **Verify State**: Assert expected elements visible in each screenshot
6. **No Skipping**: If test fails, retry once, then mark failed and continue
7. **Continuous Control**: Use TodoWrite to maintain execution context

### Expected Results
- **PASS Criteria**: 23+ tests pass (92% threshold)
- **CONDITIONAL PASS**: 20-22 tests pass (80-91%)
- **FAIL**: Less than 20 tests pass (<80%)

## Safety Guidelines

- Read-only testing operations only
- No data modification in production environment
- Screenshot capture only (no screen recording)
- Use staging environment when available
- Clear screenshots after report generation
- Document any test failures for investigation

## Files and Templates

See documentation:
- **README.md**: Complete implementation guide
- **QUICK_REFERENCE.md**: One-page reference card
- **USAGE_EXAMPLES.md**: Step-by-step usage scenarios
- **CHECKLIST.md**: Pre-execution and post-execution checklists
- **templates/**: Test case and report templates

## Success Criteria

✅ Skill successfully completes when:
1. All 25 smoke tests executed
2. Each test has corresponding screenshot
3. Pass/fail status recorded for each test
4. Comprehensive UAT report generated
5. No unplanned stops or interruptions
6. Report shows >80% test pass rate
