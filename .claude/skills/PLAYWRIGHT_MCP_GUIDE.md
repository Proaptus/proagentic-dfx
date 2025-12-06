# Playwright MCP Usage Guide for Claude Code Skills

## Overview

This guide explains how to use the Playwright MCP tool directly in Claude Code Skills instead of writing Playwright test scripts (.spec.ts files).

**Key Principle:** Use Playwright MCP tools to interact with the browser in real-time, getting immediate feedback without the overhead of managing test files.

---

## When to Use Playwright MCP

### ✅ Use Playwright MCP for:
- Interactive testing during development workflows
- Feature verification in NOVAE skill
- UAT test execution with visual feedback
- Debugging user interactions
- Quick smoke testing
- Integration with Claude workflows

### ❌ Don't use Playwright MCP for:
- Automated testing in CI/CD pipelines (use test files instead)
- Complex multi-browser testing
- Performance benchmarking
- Recurring test suites that need to run on schedule

---

## Available Playwright MCP Tools

### Browser Navigation

#### Navigate to URL
```javascript
mcp__playwright__browser_navigate({ 
  url: "http://localhost:5173" 
})
```
- Opens the specified URL in the browser
- Waits for page to load
- Returns when navigation completes

#### Get Current Page State
```javascript
mcp__playwright__browser_snapshot()
```
- Returns accessibility snapshot of current page
- Shows page structure, elements, text content
- Useful for understanding what's visible
- No screenshots - just structured data

---

### User Interactions

#### Click Element
```javascript
mcp__playwright__browser_click({
  element: "Button name or description",  // Human-readable description
  ref: "button-id"                        // Element reference from snapshot
})
```
- Clicks the specified element
- Use human-readable `element` for clarity
- Use `ref` from snapshot for targeting

#### Type Text
```javascript
mcp__playwright__browser_type({
  element: "Email input field",
  ref: "email-input",
  text: "test@example.com",
  submit: false                           // Optional: press Enter after typing
})
```
- Types text into the element
- Set `submit: true` to press Enter after
- Useful for form inputs

#### Type Slowly (Character by Character)
```javascript
mcp__playwright__browser_type({
  element: "Search input",
  ref: "search",
  text: "react hooks",
  slowly: true                            // Types one character at a time
})
```
- Types one character at a time
- Useful for triggering key handlers
- Slower but can trigger real-time validation

#### Fill Multiple Form Fields
```javascript
mcp__playwright__browser_fill_form({
  fields: [
    { 
      name: "Email",                      // Human-readable field name
      type: "textbox",                    // Field type (textbox, checkbox, radio, combobox, slider)
      ref: "email-field",                 // Element reference
      value: "test@example.com"           // Value to set
    },
    { 
      name: "Password", 
      type: "textbox", 
      ref: "password-field", 
      value: "password123" 
    },
    { 
      name: "Remember Me", 
      type: "checkbox", 
      ref: "remember-checkbox", 
      value: "true"                       // "true" or "false" for checkboxes
    }
  ]
})
```
- Fills multiple form fields at once
- Supports: textbox, checkbox, radio, combobox, slider
- For combobox, `value` is the text of the option to select

#### Select Dropdown Option
```javascript
mcp__playwright__browser_select_option({
  element: "Priority dropdown",
  ref: "priority-select",
  values: ["High"]                        // Array of option values to select
})
```
- Selects one or more options from a dropdown
- `values` is an array for multi-select support
- Text should match the option label

---

### Waiting and Conditions

#### Wait for Text to Appear
```javascript
mcp__playwright__browser_wait_for({
  text: "Project created successfully",
  timeout: 30000                          // Optional: timeout in milliseconds
})
```
- Waits for text to appear on the page
- Default timeout: 30 seconds
- Useful for verifying success messages

#### Wait for Text to Disappear
```javascript
mcp__playwright__browser_wait_for({
  textGone: "Loading...",
  timeout: 30000
})
```
- Waits for text to disappear from the page
- Useful for waiting for loading to complete

#### Wait for Time
```javascript
mcp__playwright__browser_wait_for({
  time: 2                                 // Wait 2 seconds
})
```
- Simple wait without checking for conditions
- Use sparingly - prefer waiting for conditions

---

### Capturing State

#### Take Screenshot
```javascript
mcp__playwright__browser_take_screenshot({
  filename: "dashboard-state.png",        // Filename to save
  type: "png",                            // "png" or "jpeg" (default: png)
  fullPage: false                         // true: full scrollable page, false: viewport only
})
```
- Captures visual screenshot of current page
- Saves to disk for later review
- Useful for documenting state at critical points

#### Take Element Screenshot
```javascript
mcp__playwright__browser_take_screenshot({
  element: "Health status chip",          // Element description
  ref: "health-chip",                     // Element reference
  filename: "health-chip.png"
})
```
- Takes screenshot of specific element only
- Crops to element bounds

#### Get Console Messages
```javascript
mcp__playwright__browser_console_messages({
  onlyErrors: false                       // true: only error messages, false: all
})
```
- Returns all console messages since last call
- Use `onlyErrors: true` to debug errors
- Returns logs, warnings, errors

---

### Keyboard Interaction

#### Press Key
```javascript
mcp__playwright__browser_press_key({
  key: "Enter"                            // Key name
})
```
- Presses a keyboard key
- Supports: Enter, Escape, ArrowUp, ArrowDown, Tab, Backspace, etc.
- Useful for form submission, escaping modals, navigation

---

### Advanced Features

#### Fill Form with Checkbox
```javascript
mcp__playwright__browser_fill_form({
  fields: [
    { 
      name: "Accept Terms", 
      type: "checkbox", 
      ref: "terms-checkbox", 
      value: "true"                       // "true" to check, "false" to uncheck
    }
  ]
})
```
- For checkboxes, `value` is "true" or "false"

#### Fill Form with Radio Button
```javascript
mcp__playwright__browser_fill_form({
  fields: [
    { 
      name: "Shipping Method", 
      type: "radio", 
      ref: "shipping-standard", 
      value: "Standard"                   // Select the radio with this label
    }
  ]
})
```
- For radio buttons, `value` is the button label

#### Handle Dialogs
```javascript
mcp__playwright__browser_handle_dialog({
  accept: true,                           // true to accept, false to dismiss
  promptText: "user input"                // Optional: text to enter if prompt dialog
})
```
- Handles JavaScript dialogs (alert, confirm, prompt)

---

## Complete Example: Testing a User Flow

### Scenario: Create a new project

```javascript
// Step 1: Navigate to application
mcp__playwright__browser_navigate({ 
  url: "http://localhost:5173" 
})

// Step 2: See current state
mcp__playwright__browser_snapshot()

// Step 3: Click "Create Project" button
mcp__playwright__browser_click({
  element: "Create Project button",
  ref: "create-project-btn"
})

// Step 4: Wait for form to appear
mcp__playwright__browser_wait_for({ 
  text: "Project Details" 
})

// Step 5: Take screenshot of form
mcp__playwright__browser_take_screenshot({
  filename: "01-project-form.png"
})

// Step 6: Fill form fields
mcp__playwright__browser_fill_form({
  fields: [
    { 
      name: "Project Name", 
      type: "textbox", 
      ref: "project-name", 
      value: "Cloud Migration Initiative" 
    },
    { 
      name: "Description", 
      type: "textbox", 
      ref: "description", 
      value: "Migrate infrastructure to cloud" 
    },
    { 
      name: "Priority", 
      type: "combobox", 
      ref: "priority", 
      value: "High" 
    }
  ]
})

// Step 7: Click Create button
mcp__playwright__browser_click({
  element: "Create button",
  ref: "create-btn"
})

// Step 8: Wait for success
mcp__playwright__browser_wait_for({ 
  text: "Project created successfully" 
})

// Step 9: Verify no errors
const errors = await mcp__playwright__browser_console_messages({ 
  onlyErrors: true 
})
if (errors.length > 0) {
  throw new Error(`Console errors detected: ${errors.join(', ')}`)
}

// Step 10: Take final screenshot
mcp__playwright__browser_take_screenshot({
  filename: "02-project-created.png"
})

// Step 11: Navigate to project dashboard
mcp__playwright__browser_click({
  element: "View Dashboard",
  ref: "view-dashboard"
})

// Step 12: Verify dashboard loads
mcp__playwright__browser_wait_for({ 
  text: "Project Dashboard" 
})
```

---

## Integration with Skills

### NOVAE Skill Example

```javascript
// Step 7 of NOVAE loop: Testing

// 1. Run unit tests
// npm run test  ← Done separately

// 2. Verify user flow with Playwright MCP
mcp__playwright__browser_navigate({ url: "http://localhost:5173/dashboard" })
mcp__playwright__browser_wait_for({ text: "Dashboard" })

// 3. Interact with new feature
mcp__playwright__browser_click({
  element: "Health Status chip",
  ref: "health-status-chip"
})

// 4. Verify interaction worked
mcp__playwright__browser_wait_for({ text: "System Health Details" })

// 5. Capture final state
mcp__playwright__browser_take_screenshot({ filename: "feature-working.png" })

// 6. Check for errors
mcp__playwright__browser_console_messages({ onlyErrors: true })
```

### UAT Skill Example

```javascript
// Execute test case TC-047

// Navigate to agent mode
mcp__playwright__browser_navigate({ url: "http://localhost:5173/agent" })
mcp__playwright__browser_wait_for({ text: "Agent Mode" })

// Perform test actions
mcp__playwright__browser_type({
  element: "Query input",
  ref: "query-input",
  text: "What is the total project budget?"
})

mcp__playwright__browser_click({
  element: "Send button",
  ref: "send-btn"
})

// Wait for agent response
mcp__playwright__browser_wait_for({ text: "Total Budget" }, { timeout: 10000 })

// Capture result
mcp__playwright__browser_take_screenshot({ filename: "tc-047-result.png" })

// Verify success
const hasError = await mcp__playwright__browser_console_messages({ onlyErrors: true })
// Record: PASS if no errors, FAIL if errors found
```

---

## Best Practices

### 1. Use Human-Readable Element Names
```javascript
// ✅ Good - Clear what you're clicking
mcp__playwright__browser_click({
  element: "Create Project button",
  ref: "create-btn"
})

// ❌ Bad - Unclear what you're clicking
mcp__playwright__browser_click({
  element: "btn",
  ref: "btn-1"
})
```

### 2. Take Screenshots at Critical Points
```javascript
// After navigation
mcp__playwright__browser_navigate({ url: "..." })
mcp__playwright__browser_take_screenshot({ filename: "01-loaded.png" })

// After form fill
mcp__playwright__browser_fill_form({ fields: [...] })
mcp__playwright__browser_take_screenshot({ filename: "02-form-filled.png" })

// After submission
mcp__playwright__browser_click({ element: "Submit", ref: "submit" })
mcp__playwright__browser_wait_for({ text: "Success" })
mcp__playwright__browser_take_screenshot({ filename: "03-success.png" })
```

### 3. Check Console for Errors
```javascript
// Before verifying success, check for silent errors
const errors = await mcp__playwright__browser_console_messages({ onlyErrors: true })
if (errors.length > 0) {
  // Log the errors for debugging
  console.error("Console errors found:", errors)
  // Decide: fail test or proceed
}
```

### 4. Use Proper Timeouts
```javascript
// Wait for slow operations
mcp__playwright__browser_wait_for({
  text: "Processing complete...",
  timeout: 60000                          // 60 seconds for slow operations
})

// But don't wait unnecessarily
mcp__playwright__browser_wait_for({
  text: "Loaded",
  timeout: 5000                           // 5 seconds for fast operations
})
```

### 5. Combine Operations into Logical Groups
```javascript
// Group related operations
// 1. Navigate and setup
mcp__playwright__browser_navigate({ url: "..." })
mcp__playwright__browser_snapshot()

// 2. Perform actions
mcp__playwright__browser_click({ ... })
mcp__playwright__browser_type({ ... })

// 3. Verify results
mcp__playwright__browser_wait_for({ text: "..." })
mcp__playwright__browser_take_screenshot({ filename: "..." })
```

---

## Common Patterns

### Pattern 1: Login Flow
```javascript
mcp__playwright__browser_navigate({ url: "http://localhost:5173/login" })
mcp__playwright__browser_fill_form({
  fields: [
    { name: "Email", type: "textbox", ref: "email", value: "test@example.com" },
    { name: "Password", type: "textbox", ref: "password", value: "password123" }
  ]
})
mcp__playwright__browser_click({ element: "Sign In", ref: "signin-btn" })
mcp__playwright__browser_wait_for({ text: "Dashboard" })
```

### Pattern 2: Form with Validation
```javascript
mcp__playwright__browser_fill_form({
  fields: [
    { name: "Email", type: "textbox", ref: "email", value: "invalid" }
  ]
})
mcp__playwright__browser_click({ element: "Submit", ref: "submit-btn" })
mcp__playwright__browser_wait_for({ text: "Invalid email format" })
```

### Pattern 3: Modal Dialog
```javascript
mcp__playwright__browser_click({ element: "Delete Project", ref: "delete-btn" })
mcp__playwright__browser_wait_for({ text: "Are you sure?" })
mcp__playwright__browser_take_screenshot({ filename: "delete-modal.png" })
mcp__playwright__browser_click({ element: "Confirm Delete", ref: "confirm-delete" })
mcp__playwright__browser_wait_for({ text: "Project deleted" })
```

### Pattern 4: Dropdown Selection
```javascript
mcp__playwright__browser_click({ element: "Filter by Status", ref: "status-filter" })
mcp__playwright__browser_select_option({
  element: "Status dropdown",
  ref: "status-options",
  values: ["In Progress"]
})
mcp__playwright__browser_wait_for({ text: "In Progress" })
```

### Pattern 5: Keyboard Navigation
```javascript
mcp__playwright__browser_click({ element: "Search input", ref: "search" })
mcp__playwright__browser_type({ element: "Search", ref: "search", text: "react" })
mcp__playwright__browser_press_key({ key: "Enter" })
mcp__playwright__browser_wait_for({ text: "Search results" })
```

---

## Debugging Tips

### Issue: Element Not Found
```javascript
// Get snapshot to see current page structure
mcp__playwright__browser_snapshot()

// Use the reference from snapshot
mcp__playwright__browser_click({
  element: "Button",
  ref: "correct-reference-from-snapshot"
})
```

### Issue: Text Not Found
```javascript
// Take screenshot to see what's on page
mcp__playwright__browser_take_screenshot({ filename: "current-state.png" })

// Check console for errors
mcp__playwright__browser_console_messages({ onlyErrors: true })

// Wait longer if content is loading
mcp__playwright__browser_wait_for({ 
  text: "Expected text",
  timeout: 60000
})
```

### Issue: Timing Problem
```javascript
// Add explicit wait
mcp__playwright__browser_wait_for({ time: 2 })

// Or wait for a specific condition
mcp__playwright__browser_wait_for({ text: "Content loaded" })

// Take screenshot to verify state
mcp__playwright__browser_take_screenshot({ filename: "after-wait.png" })
```

### Issue: Silent Failures
```javascript
// Always check console
const errors = await mcp__playwright__browser_console_messages({ onlyErrors: true })
console.log("Console errors:", errors)

// Take screenshot to see visual state
mcp__playwright__browser_take_screenshot({ filename: "debug.png" })

// Get page snapshot for structure
mcp__playwright__browser_snapshot()
```

---

## References

- **NOVAE Skill**: `.claude/skills/novae/` - Uses Playwright MCP in testing phase
- **UAT Automation Skill**: `.claude/skills/uat-automation/` - Uses Playwright MCP for test execution
- **ProAgentic Development Guide**: `CLAUDE.md` - Overall development methodology

---

## Summary

### Key Takeaways

1. **Use Playwright MCP tools directly** - Don't write test scripts
2. **Get immediate feedback** - See results right away
3. **Take screenshots strategically** - Capture state at critical points
4. **Check console messages** - Monitor errors throughout
5. **Use human-readable descriptions** - Make tests easy to understand
6. **Integrate with skills** - Use in NOVAE and UAT workflows

### Tools at a Glance

| Task | Tool |
|------|------|
| Navigate | `browser_navigate()` |
| See state | `browser_snapshot()` |
| Click | `browser_click()` |
| Type | `browser_type()` |
| Fill form | `browser_fill_form()` |
| Select option | `browser_select_option()` |
| Wait for text | `browser_wait_for()` |
| Screenshot | `browser_take_screenshot()` |
| Console | `browser_console_messages()` |
| Press key | `browser_press_key()` |

---

**Version**: 1.0  
**Last Updated**: 2025-10-19  
**For**: Claude Code Skills (NOVAE, UAT Automation)
