---
name: NOVAE – User-Journey-Driven Development
description: Run the NOVAE loop (Sequential Thinking → Context7 QA → Parallel Tasks → Integration → Tests) for React/TypeScript + Express projects like ProAgentic. Use for features, bug fixes, or refactors that must be validated end-to-end. Prioritize user flows, Playwright MCP, and safety (never kill processes).
allowed-tools: Read, Grep, Glob, Edit, Write, Task
---

# NOVAE – User-Journey-Driven Development

⚠️ **IMPORTANT: READ CLAUDE.md FIRST** - Before using this skill, read `/home/chine/projects/proagentic-clean/CLAUDE.md` completely, especially:
- Lines 39-153: MCP Tool Coordination and Sequential Thinking/Context7 usage patterns
- Lines 227-243: TODO-Driven Development with Continuous Execution Control
- Lines 315-338: ProAgentic Development Commands
- Lines 882-906: NOVAE D3 Methodology (UX-driven, End-to-End validation, Self-sufficient testing)
- This skill implements the NOVAE methodology defined in CLAUDE.md

> Core goal: ship changes that **work end-to-end for the user journey**, not just per-file fixes.

## Continuous-Control Rhythm (repeat for every task)

1) **Initial Analysis (Sequential Thinking)**
   - Break request into small chunks.
   - Identify what can run **in parallel**.
   - Draft a short TODO (see `templates/NOVAE_TODO.md`).

2) **Quality Baseline (Context7)**
   - Check current best practices for affected libraries (React 18, Vite, Express, etc.).
   - Capture key patterns to follow (error boundaries, hooks rules, middleware patterns).

3) **Parallel Execution (Task tool)**
   - Launch independent tasks in parallel (frontend component, backend route, tests).
   - Each task must name paths, expectations, and outputs clearly.

4) **Results Synthesis (Sequential Thinking)**
   - Aggregate outputs, find gaps/contract mismatches, and list next steps.

5) **Quality Validation (Context7)**
   - Re-validate implementations against library best practices; adjust as needed.

6) **Integration & Gap Fill**
   - Wire pieces together and resolve schema/type mismatches.

7) **Testing with Playwright MCP**
   - Unit/integration (Vitest) + **Playwright MCP** for user flows.
   - Use `mcp__playwright__*` tools directly to execute browser interactions (navigate, click, type, screenshot, etc.).
   - **NEVER write Playwright test scripts** - always use the Playwright MCP tool for browser automation.
   - Lint + type checks must pass (see hooks, which auto-run checks after edits).

8) **Final Verification (Sequential Thinking)**
   - Confirm the original user flow is solid and nothing else broke.

## Playwright MCP Usage

Instead of writing `.spec.ts` test files, use the Playwright MCP tool directly in your Claude workflow:

### Available Playwright MCP Operations

```javascript
// Navigate to page
mcp__playwright__browser_navigate({ url: "http://localhost:5173" })

// Take accessibility snapshot (shows page structure)
mcp__playwright__browser_snapshot()

// Click element by reference
mcp__playwright__browser_click({
  element: "Submit button",
  ref: "submit-btn"
})

// Type text into element
mcp__playwright__browser_type({
  element: "Email input",
  ref: "email-field",
  text: "test@example.com"
})

// Wait for text to appear
mcp__playwright__browser_wait_for({
  text: "Project created successfully"
})

// Take screenshot
mcp__playwright__browser_take_screenshot({
  filename: "dashboard-state.png"
})

// Get console messages (useful for debugging)
mcp__playwright__browser_console_messages({ onlyErrors: true })

// Press keyboard keys
mcp__playwright__browser_press_key({ key: "Enter" })

// Fill form fields
mcp__playwright__browser_fill_form({
  fields: [
    { name: "Email", type: "textbox", ref: "email", value: "test@example.com" },
    { name: "Password", type: "textbox", ref: "password", value: "password123" }
  ]
})

// Select dropdown option
mcp__playwright__browser_select_option({
  element: "Priority dropdown",
  ref: "priority-select",
  values: ["High"]
})
```

### Key Principles

1. **No Test Script Files**: Don't create `.spec.ts` or test scripts
2. **Direct Interaction**: Use MCP tools to interact with browser in real-time
3. **Immediate Feedback**: See results immediately instead of running test files
4. **Flexible Testing**: Can test any scenario without writing test infrastructure
5. **Screenshots & Logs**: Capture state at critical points using MCP tools

### Example: Testing a User Flow

```javascript
// WRONG - Don't write test scripts
// ❌ Create file: dashboard.spec.ts with test code, then run it

// CORRECT - Use Playwright MCP directly
// ✅ Navigate, interact, verify using MCP tools
mcp__playwright__browser_navigate({ url: "http://localhost:5173" })
mcp__playwright__browser_snapshot() // See current state
mcp__playwright__browser_click({ element: "Create Project", ref: "create-btn" })
mcp__playwright__browser_wait_for({ text: "Project name" })
mcp__playwright__browser_type({ element: "Project name input", ref: "name", text: "My Project" })
mcp__playwright__browser_click({ element: "Create button", ref: "create" })
mcp__playwright__browser_wait_for({ text: "Project created successfully" })
mcp__playwright__browser_take_screenshot({ filename: "project-created.png" })
```

## Safety rules (strict)

- **Never use** `kill`, `killall`, or `pkill` for server control.
- Prefer: `npm run dev` to start; check status with `ps aux | grep "node.*server"`.
- Restarts/logs follow project scripts. Ask if unclear.

## Parallel Task examples (patterns)

Use the Task tool to run independent checks concurrently—**don't** serialize them:

```javascript
// Frontend analysis (React components)
Task({
  description: "Frontend analysis (components/hooks)",
  prompt: "Scan /src/components and /src/hooks for unnecessary re-renders, heavy computations, and missing error boundaries. Cite files/lines; propose minimal fixes.",
  subagent_type: "general-purpose"
}),
// Backend analysis (Express routes/middleware)
Task({
  description: "Backend error handling review",
  prompt: "Review /server/routes and middleware for async/await consistency, error propagation, and request validation. Propose concrete improvements.",
  subagent_type: "general-purpose"
}),
// Tests coverage gap
Task({
  description: "Test coverage gap analysis",
  prompt: "Examine /tests for untested critical paths. Generate concrete test cases with file paths.",
  subagent_type: "general-purpose"
})
```

## Example micro-feature: "Project Health" widget

* **Frontend**: `HealthStatus.tsx` with typed props + loading/error UI.
* **Backend**: ensure `/api/health` returns `{ status: 'ok'|'degraded'|'down' }`.
* **Tests**: unit on component + Playwright MCP to verify chip renders and responds to user interactions.

## Required artifacts to produce per loop

* Updated TODO with status
* Notes on Context7 guidance applied
* Parallel tasks log + synthesis
* Test results (Vitest + Playwright MCP interactions)
* Screenshots/logs from Playwright MCP verification
* Summary of user flow verification

## Reference templates

* See `CHECKLIST.md` and `/templates/*` (PR template, TODO, error boundary, Express error middleware, Zod request validation).

## ProAgentic-specific conventions

* **Stack**: React 18, TypeScript, Vite 5, Express 4, Vitest, Playwright MCP
* **Build**: `npm run build`, `npm run dev` (starts both frontend/backend)
* **Tests**: `npm run test` (unit), `npm run test:e2e` (Playwright test files), Playwright MCP (for in-flow testing)
* **Lint**: `npm run lint` (ESLint + type checking)
* **API**: OpenRouter integration with quality scoring
* **No mocks in functional code**: Mocks only in tests or tmp
* **Deployment**: Docker + Cloud Run (production), Netlify (staging)
