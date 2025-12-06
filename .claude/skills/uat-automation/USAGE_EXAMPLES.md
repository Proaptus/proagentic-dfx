# UAT Automation - Usage Examples

## Complete Step-by-Step Execution Examples

### Example 1: Execute Full 25-Test UAT Suite

**Scenario**: You need to run complete ProAgentic UAT with screenshot validation and generate comprehensive report.

**Trigger**: 
```
"Run the UAT smoke test suite with screenshot validation for all 25 tests"
```

**Expected Flow**:

1. **Initialize Environment**
   ```bash
   # Verify services running
   curl http://localhost:5173
   curl http://localhost:8080/api/health
   ```

2. **Create TodoList for All 25 Tests**
   ```typescript
   TodoWrite({
     todos: [
       // Phase 1 (3 tests)
       { 
         content: "SMOKE-001: Homepage Loads Successfully",
         status: "pending",
         activeForm: "Navigate to homepage"
       },
       { 
         content: "SMOKE-002: Quick Launch Template",
         status: "pending",
         activeForm: "Launch Cloud Migration template"
       },
       { 
         content: "SMOKE-003: Swarm Mode Toggle",
         status: "pending",
         activeForm: "Enable Swarm Mode"
       },
       // Phase 2 (2 tests)
       { 
         content: "SMOKE-004: Generate All Agents in Swarm",
         status: "pending",
         activeForm: "Process 8 agents in parallel"
       },
       { 
         content: "SMOKE-005: Verify Parallel Processing",
         status: "pending",
         activeForm: "Verify multiple agents running simultaneously"
       },
       // ... continue for all 25 tests
     ]
   })
   ```

3. **Execute Phase 1 Tests**
   
   **SMOKE-001: Homepage Loads Successfully**
   ```typescript
   // Navigate to homepage
   mcp__playwright__browser_navigate({
     url: "http://localhost:5173"
   })
   
   // Wait for load
   mcp__playwright__browser_wait_for({ time: 3 })
   
   // Take screenshot
   mcp__playwright__browser_take_screenshot({
     filename: "01-SMOKE-001-homepage-loads.png"
   })
   
   // Update progress
   TodoWrite({
     todos: [
       {
         content: "SMOKE-001: Homepage Loads Successfully",
         status: "completed",
         activeForm: "✅ PASS - Logo visible, Create Project button, 8+ templates"
       },
       // ...
     ]
   })
   ```

   **SMOKE-002: Quick Launch Template**
   ```typescript
   // Get project template launch button
   mcp__playwright__browser_evaluate({
     function: `
       () => {
         const buttons = Array.from(document.querySelectorAll('button'));
         const launchBtn = buttons.find(b => 
           b.textContent.includes('Launch') && 
           b.closest('[class*="card"], [class*="template"]')
         );
         if (launchBtn) {
           launchBtn.click();
           return true;
         }
         return false;
       }
     `
   })
   
   // Wait for navigation
   mcp__playwright__browser_wait_for({ time: 5 })
   
   // Take screenshot
   mcp__playwright__browser_take_screenshot({
     filename: "01-SMOKE-002-template-launch.png"
   })
   
   // Update progress
   TodoWrite({
     todos: [
       // ... SMOKE-001 completed
       {
         content: "SMOKE-002: Quick Launch Template",
         status: "completed",
         activeForm: "✅ PASS - Cloud Migration Initiative template loaded"
       },
       // ...
     ]
   })
   ```

   **SMOKE-003: Swarm Mode Toggle**
   ```typescript
   // Find and toggle swarm mode
   mcp__playwright__browser_evaluate({
     function: `
       () => {
         const toggles = Array.from(document.querySelectorAll('input[type="checkbox"], [role="switch"]'));
         const swarmToggle = toggles.find(t => 
           t.getAttribute('aria-label')?.includes('Swarm') ||
           t.closest('label')?.textContent.includes('Swarm')
         );
         if (swarmToggle) {
           swarmToggle.click();
           return true;
         }
         return false;
       }
     `
   })
   
   // Wait for state change
   mcp__playwright__browser_wait_for({ time: 2 })
   
   // Take screenshot
   mcp__playwright__browser_take_screenshot({
     filename: "01-SMOKE-003-swarm-mode-toggle.png"
   })
   
   // Update progress
   TodoWrite({
     todos: [
       // ... SMOKE-001,002 completed
       {
         content: "SMOKE-003: Swarm Mode Toggle",
         status: "completed",
         activeForm: "✅ PASS - Swarm Mode ON with 🐝 emoji"
       },
       // ...
     ]
   })
   ```

4. **Execute Phase 2 Tests (Swarm Processing)**

   **SMOKE-004: Generate All Agents in Swarm**
   ```typescript
   // Click Generate Requirements button
   mcp__playwright__browser_evaluate({
     function: `
       () => {
         const buttons = Array.from(document.querySelectorAll('button'));
         const generateBtn = buttons.find(b => 
           b.textContent.includes('Generate') && 
           b.textContent.includes('Requirements')
         );
         if (generateBtn) {
           generateBtn.click();
           return true;
         }
         return false;
       }
     `
   })
   
   // Wait for agent processing (up to 45 seconds)
   mcp__playwright__browser_wait_for({ time: 45 })
   
   // Take screenshot showing all agents complete
   mcp__playwright__browser_take_screenshot({
     filename: "02-SMOKE-004-agents-processing.png"
   })
   
   // Update progress
   TodoWrite({
     todos: [
       // ... previous tests completed
       {
         content: "SMOKE-004: Generate All Agents in Swarm",
         status: "completed",
         activeForm: "✅ PASS - All 8 agents completed with checkmarks"
       },
       // ...
     ]
   })
   ```

5. **Continue Through All Phases** (follow same pattern for SMOKE-005 through SMOKE-025)

6. **Generate Comprehensive UAT Report**
   ```typescript
   // After all 25 tests complete, create report file
   // Report should include:
   // - Test results summary (pass rate, total, failed)
   // - Detailed results for each test
   // - Screenshots for all tests
   // - Execution duration
   // - Issues identified
   // - Recommendations
   ```

---

### Example 2: Running Phase 3 Tests Only (Dashboard Navigation)

**Scenario**: You want to validate dashboard functionality only (3 tests).

**Trigger**:
```
"Test Phase 3 dashboards - Requirements, Scope, and Schedule navigation"
```

**Execution**:

```typescript
// Start with project already loaded
// Navigate to Requirements dashboard
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
      const reqTab = tabs.find(t => t.textContent.includes('Requirements'));
      if (reqTab) {
        reqTab.click();
        return true;
      }
      return false;
    }
  `
})

mcp__playwright__browser_wait_for({ time: 3 })
mcp__playwright__browser_take_screenshot({
  filename: "03-SMOKE-006-requirements-dashboard.png"
})

// Navigate to Scope dashboard
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
      const scopeTab = tabs.find(t => t.textContent.includes('Scope'));
      if (scopeTab) {
        scopeTab.click();
        return true;
      }
      return false;
    }
  `
})

mcp__playwright__browser_wait_for({ time: 3 })
mcp__playwright__browser_take_screenshot({
  filename: "03-SMOKE-007-scope-dashboard.png"
})

// Navigate to Schedule dashboard
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
      const scheduleTab = tabs.find(t => t.textContent.includes('Schedule'));
      if (scheduleTab) {
        scheduleTab.click();
        return true;
      }
      return false;
    }
  `
})

mcp__playwright__browser_wait_for({ time: 3 })
mcp__playwright__browser_take_screenshot({
  filename: "03-SMOKE-008-schedule-dashboard.png"
})
```

---

### Example 3: Switching Between Modes (Workflow → Agent → Agile)

**Scenario**: Navigate through different modes to test mode switching.

**Trigger**:
```
"Test mode switching - Workflow to Agent Mode to Agile Mode"
```

**Execution**:

```typescript
// Get current project ID from URL
const projectId = window.location.pathname.split('/').pop();

// Switch to Agent Mode
mcp__playwright__browser_navigate({
  url: `http://localhost:5173/agent/${projectId}`
})
mcp__playwright__browser_wait_for({ time: 3 })
mcp__playwright__browser_take_screenshot({
  filename: "04-SMOKE-009-agent-mode-enabled.png"
})

// Send agent command
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const input = document.querySelector('input[placeholder*="message"], textarea');
      if (input) {
        input.value = "Show the risk register";
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        input.dispatchEvent(enterEvent);
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 5 })
mcp__playwright__browser_take_screenshot({
  filename: "04-SMOKE-010-agent-command-response.png"
})

// Switch to Agile Mode
mcp__playwright__browser_navigate({
  url: `http://localhost:5173/workflow/${projectId}/agile`
})
mcp__playwright__browser_wait_for({ time: 5 })
mcp__playwright__browser_take_screenshot({
  filename: "05-SMOKE-011-agile-mode-enabled.png"
})

// View Sprint Board
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
      const sprintTab = tabs.find(t => t.textContent.includes('Sprint Board'));
      if (sprintTab) {
        sprintTab.click();
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 3 })
mcp__playwright__browser_take_screenshot({
  filename: "05-SMOKE-012-sprint-board.png"
})

// View Epic Timeline
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
      const epicTab = tabs.find(t => t.textContent.includes('Epic') || t.textContent.includes('Timeline'));
      if (epicTab) {
        epicTab.click();
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 3 })
mcp__playwright__browser_take_screenshot({
  filename: "05-SMOKE-013-epic-timeline.png"
})
```

---

### Example 4: Inline Editing Operations

**Scenario**: Test requirement editing and adding new requirements.

**Trigger**:
```
"Test inline editing - edit requirement text and add new requirement"
```

**Execution**:

```typescript
// Navigate to Requirements dashboard
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
      const reqTab = tabs.find(t => t.textContent.includes('Requirements'));
      if (reqTab) {
        reqTab.click();
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 3 })

// Find and click Edit button for first requirement
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
      const editBtn = buttons.find(b => 
        (b.textContent.includes('Edit') || b.innerHTML.includes('pencil')) &&
        !b.textContent.includes('Requirement')
      );
      if (editBtn) {
        editBtn.click();
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 2 })

// Edit the requirement text
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const textareas = Array.from(document.querySelectorAll('textarea, input[type="text"]'));
      const reqInput = textareas[0];
      if (reqInput) {
        const originalValue = reqInput.value;
        reqInput.value = originalValue + " - UPDATED";
        const event = new Event('change', { bubbles: true });
        reqInput.dispatchEvent(event);
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 1 })

// Save changes
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveBtn = buttons.find(b => 
        b.textContent.includes('Save') || 
        b.innerHTML.includes('checkmark') ||
        b.title?.includes('Save')
      );
      if (saveBtn) {
        saveBtn.click();
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 2 })
mcp__playwright__browser_take_screenshot({
  filename: "06-SMOKE-014-edit-requirement.png"
})

// Add new requirement
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => 
        (b.textContent.includes('Add') || b.textContent.includes('Create')) &&
        b.textContent.includes('Requirement')
      );
      if (addBtn) {
        addBtn.click();
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 2 })

// Type new requirement
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const inputs = Array.from(document.querySelectorAll('textarea, input[type="text"]'));
      const newReqInput = inputs[inputs.length - 1];
      if (newReqInput) {
        newReqInput.value = "New requirement: Implement advanced features";
        const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        newReqInput.dispatchEvent(event);
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 2 })
mcp__playwright__browser_take_screenshot({
  filename: "06-SMOKE-015-add-requirement.png"
})
```

---

### Example 5: Project Management Operations

**Scenario**: Test saving, exporting, and loading projects.

**Trigger**:
```
"Test project management - save, export to JSON, and load recent project"
```

**Execution**:

```typescript
// Save Project
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveBtn = buttons.find(b => b.textContent.includes('Save') && b.textContent.includes('Project'));
      if (saveBtn) {
        saveBtn.click();
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 2 })

// Enter project name
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const input = document.querySelector('input[placeholder*="name"], input[placeholder*="Project"]');
      if (input) {
        input.value = "Cloud Migration Initiative - Updated";
        return true;
      }
      return false;
    }
  `
})

// Click save button in dialog
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmBtn = buttons.find(b => b.textContent.includes('Save') && !b.textContent.includes('Project'));
      if (confirmBtn) {
        confirmBtn.click();
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 3 })
mcp__playwright__browser_take_screenshot({
  filename: "07-SMOKE-016-save-project.png"
})

// Export to JSON
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const exportBtn = buttons.find(b => b.textContent.includes('Export'));
      if (exportBtn) {
        exportBtn.click();
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 2 })

// Select JSON format
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const options = Array.from(document.querySelectorAll('[role="option"], button'));
      const jsonOption = options.find(o => o.textContent.includes('JSON'));
      if (jsonOption) {
        jsonOption.click();
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 2 })
mcp__playwright__browser_take_screenshot({
  filename: "07-SMOKE-017-export-json.png"
})

// Navigate back to homepage
mcp__playwright__browser_navigate({
  url: "http://localhost:5173"
})
mcp__playwright__browser_wait_for({ time: 3 })

// Click on recent project to load
mcp__playwright__browser_evaluate({
  function: `
    () => {
      const projectCards = Array.from(document.querySelectorAll('[class*="project"], [class*="recent"]'));
      if (projectCards.length > 0) {
        projectCards[0].click();
        return true;
      }
      return false;
    }
  `
})
mcp__playwright__browser_wait_for({ time: 5 })
mcp__playwright__browser_take_screenshot({
  filename: "07-SMOKE-018-load-recent-project.png"
})
```

---

## Key Patterns Used in All Examples

1. **Navigation Pattern**:
   ```typescript
   mcp__playwright__browser_navigate({ url: "..." })
   mcp__playwright__browser_wait_for({ time: 3 })
   ```

2. **Element Selection Pattern**:
   ```typescript
   mcp__playwright__browser_evaluate({
     function: `() => {
       const elements = Array.from(document.querySelectorAll('*'));
       const target = elements.find(el => el.textContent.includes('Target'));
       if (target) target.click();
       return true;
     }`
   })
   ```

3. **Screenshot Pattern**:
   ```typescript
   mcp__playwright__browser_take_screenshot({
     filename: "[phase]-SMOKE-[num]-[name].png"
   })
   ```

4. **Progress Pattern**:
   ```typescript
   TodoWrite({
     todos: [{
       content: "SMOKE-XXX: Test name",
       status: "completed",
       activeForm: "✅ PASS - specific result"
     }]
   })
   ```

All examples follow the continuous execution control principle: execute sequentially without pausing, verify with screenshots, update progress, and continue to next test.
