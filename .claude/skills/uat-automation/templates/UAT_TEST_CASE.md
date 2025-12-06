# UAT Test Case Template

Use this template for documenting individual UAT test cases.

---

## Test Case: [TEST_ID]

### Basic Information
- **Test ID**: SMOKE-XXX
- **Test Name**: [Descriptive name]
- **Phase**: [1-10]
- **Priority**: P0 / P1
- **Duration**: [Expected time in seconds]

### Description
[Clear description of what this test validates]

### Prerequisites
- [ ] ProAgentic application running
- [ ] Backend accessible
- [ ] Project created from template
- [ ] Previous phase tests passed
- [Additional prerequisites]

### Test Steps

**Step 1**: [Action]
```typescript
// Code example showing how to perform this step
mcp__playwright__browser_navigate({
  url: "http://localhost:5173/workflow/[projectId]"
})
mcp__playwright__browser_wait_for({ time: 3 })
```

**Step 2**: [Action]
```typescript
// Code example
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const elements = Array.from(document.querySelectorAll('*'));
      const target = elements.find(el => el.textContent.includes('Target'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    }
  `
})
```

**Step 3**: [Capture Screenshot]
```typescript
// Code example
mcp__playwright__browser_take_screenshot({
  filename: "[phase]-SMOKE-XXX-[name].png"
})
```

### Expected Results
- [ ] **Element 1**: [Description of expected state]
- [ ] **Element 2**: [Description of expected state]
- [ ] **Element 3**: [Description of expected state]
- [ ] **Console**: No critical errors
- [ ] **Screenshot**: [Describe what should be visible in screenshot]

### Verification Criteria
```typescript
// Verification code to validate expected results
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const hasElement1 = !!document.querySelector('[data-testid="element1"]');
      const hasElement2 = document.body.innerText.includes('Expected Text');
      const hasErrors = !!document.querySelector('[role="alert"]');
      
      return hasElement1 && hasElement2 && !hasErrors;
    }
  `
})
```

### Pass Criteria
- [ ] All expected elements visible
- [ ] No error messages displayed
- [ ] UI is in expected state
- [ ] Screenshot shows required elements
- [ ] No console errors detected

### Fail Criteria
- [ ] Required element not found
- [ ] Error message displayed
- [ ] UI in unexpected state
- [ ] Screenshot missing required elements
- [ ] Critical console error present

### Screenshot Evidence
- **Expected Filename**: `[phase]-SMOKE-XXX-[test-name].png`
- **Should Show**: [Specific UI elements/state]
- **Should NOT Show**: [Error indicators, missing elements, etc.]

### Troubleshooting

**If test fails:**

1. **Element not found?**
   ```typescript
   // Verify element exists
   mcp__playwright__browser_evaluate({
     function: `
       () => {
         const elements = Array.from(document.querySelectorAll('*'));
         console.log('Elements containing text:', 
           elements.filter(e => e.textContent.includes('Search Term')));
         return true;
       }
     `
   })
   ```

2. **Page not loaded?**
   ```typescript
   // Increase wait time
   mcp__playwright__browser_wait_for({ time: 5 })
   
   // Reload page if needed
   mcp__playwright__browser_navigate({
     url: "http://localhost:5173/workflow/[projectId]"
   })
   ```

3. **State issue?**
   ```typescript
   // Take debug screenshot
   mcp__playwright__browser_take_screenshot({
     filename: "debug-SMOKE-XXX.png",
     fullPage: true
   })
   
   // Check console
   mcp__playwright__browser_console_messages({ onlyErrors: true })
   ```

### Retry Procedure
1. Note failure timestamp and error
2. Wait 3 seconds
3. Retry test once using same steps
4. If still fails:
   - Document error message
   - Take debug screenshot
   - Mark test as FAILED
   - Continue to next test

### Progress Tracking
```typescript
// After test completes, update progress
TodoWrite({
  todos: [
    {
      content: "SMOKE-XXX: [Test Name]",
      status: "completed",  // or "in_progress" or "pending"
      activeForm: "✅ PASS" // or specific status
    },
    // ... other tests
  ]
})
```

### Related Tests
- **Before this test**: SMOKE-[XXX-1]
- **After this test**: SMOKE-[XXX+1]
- **Depends on**: [Other tests/features]
- **Blocks**: [Other tests/features]

### Notes
[Any additional notes, observations, or context specific to this test]

### Execution Log
```
Start Time: [timestamp]
Duration: [seconds]
Status: [PASS/FAIL]
Retry Count: [number]
Issues: [if any]
End Time: [timestamp]
```

---

## Test Execution Record

**Execution Date**: [YYYY-MM-DD]
**Executed By**: [Name/Agent]
**Result**: [ ] PASS | [ ] FAIL
**Screenshot Path**: `tests/uat-results/[filename].png`
**Notes**: [Execution notes]
