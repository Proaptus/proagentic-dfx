# NOVAE Usage Examples

Complete examples of using the NOVAE skill for common development tasks.

## Example 1: Adding a New Feature

**Task**: Add a "System Health" indicator to the dashboard

### Prompt to Claude

```
Using NOVAE, implement a system health indicator on the dashboard.

Requirements:
- Show status chip (OK/Degraded/Down) based on /api/health endpoint
- Include loading state and error handling
- Add refresh button
- Test with Playwright MCP

Use parallel tasks for frontend component, backend endpoint, and test writing.
```

### Expected NOVAE Workflow

1. **Sequential Thinking** breaks down task:
   - Frontend: HealthStatus.tsx component
   - Backend: /api/health endpoint with status logic
   - Tests: Unit tests + Playwright MCP verification
   - These can be parallelized

2. **Context7** establishes baseline:
   - React 18: useState, useEffect, error boundaries
   - Express 4: async error handling, proper status codes
   - Playwright MCP: browser automation best practices

3. **Parallel Task execution**:
   ```javascript
   Task({ description: "Frontend component", ... }),
   Task({ description: "Backend endpoint", ... }),
   Task({ description: "Unit tests", ... })
   ```

4. **Sequential Thinking** synthesizes:
   - Contract: GET /api/health returns { status: 'ok'|'degraded'|'down' }
   - Integration: Component calls endpoint, displays chip
   - Gap: Need error boundary around component

5. **Context7** validates:
   - Verify error boundary pattern
   - Check async fetch pattern
   - Confirm Express error middleware

6. **Integration**: Wire frontend to backend

7. **Testing with Playwright MCP**:
   - Unit tests pass ✓
   - Playwright MCP verifies user flow:
     ```javascript
     mcp__playwright__browser_navigate({ url: "http://localhost:5173/dashboard" })
     mcp__playwright__browser_snapshot()
     // Verify health chip is visible
     mcp__playwright__browser_click({ element: "Refresh button", ref: "refresh-health" })
     mcp__playwright__browser_wait_for({ text: "Checking system health" })
     mcp__playwright__browser_take_screenshot({ filename: "health-loading.png" })
     mcp__playwright__browser_wait_for({ text: "System health" })
     mcp__playwright__browser_take_screenshot({ filename: "health-loaded.png" })
     ```
   - Lint/type checks pass ✓

8. **Final verification**: User can load dashboard → see status chip → refresh → see updated status

---

## Example 2: Fixing a Bug

**Task**: Fix login form not showing validation errors

### Prompt to Claude

```
Using NOVAE, debug and fix the login form validation issue.
Users report that validation errors don't appear when they enter invalid credentials.

Start with Sequential Thinking to analyze the problem, run parallel tasks to
investigate frontend and backend, then synthesize and fix using Playwright MCP
to verify the fix works end-to-end.
```

### Expected NOVAE Workflow

1. **Sequential Thinking** analyzes:
   - Frontend: Check form validation logic, error state management
   - Backend: Check /api/auth/login error responses
   - Tests: Verify error handling tests exist
   - Parallel investigation: frontend + backend

2. **Context7** checks patterns:
   - React form handling best practices
   - Express error response format
   - Error boundary usage

3. **Parallel Tasks**:
   ```javascript
   Task({ description: "Analyze login form component", ... }),
   Task({ description: "Check auth endpoint error handling", ... }),
   Task({ description: "Review existing tests", ... })
   ```

4. **Sequential Thinking** synthesizes findings:
   - Bug: Backend returns 401 with { error: "message" } but frontend expects { message: "..." }
   - Root cause: Response format mismatch
   - Fix: Standardize error format OR adjust frontend parsing

5. **Context7** validates fix approach:
   - Check Express error middleware pattern
   - Verify consistent error format across API

6. **Implementation**: Update backend error middleware to return consistent format

7. **Testing with Playwright MCP**:
   - Add unit test for invalid login attempt ✓
   - Use Playwright MCP to verify user flow:
     ```javascript
     mcp__playwright__browser_navigate({ url: "http://localhost:5173/login" })
     mcp__playwright__browser_fill_form({
       fields: [
         { name: "Email", type: "textbox", ref: "email", value: "invalid@email" },
         { name: "Password", type: "textbox", ref: "password", value: "wrong" }
       ]
     })
     mcp__playwright__browser_click({ element: "Sign in button", ref: "signin" })
     mcp__playwright__browser_wait_for({ text: "Invalid credentials" })
     mcp__playwright__browser_take_screenshot({ filename: "error-displayed.png" })
     ```
   - Check no regressions in other error handling ✓

8. **Final verification**: User enters invalid credentials → sees validation error → can retry

---

## Example 3: Code Review & Refactoring

**Task**: Review and modernize authentication code

### Prompt to Claude

```
Using NOVAE Context7 reviewer, audit the authentication code in src/services/auth.ts
and server/routes/auth.js. Check against current React 18 and Express 4 best practices.
Propose modernization opportunities. Verify changes work with Playwright MCP.
```

### Expected NOVAE Workflow

1. **Sequential Thinking** plans review:
   - Read auth service code
   - Read auth routes
   - Identify patterns to check with Context7
   - Parallel: frontend review + backend review

2. **Context7** fetches best practices:
   - React: hooks, context, secure storage
   - Express: JWT handling, async/await, middleware patterns

3. **Parallel Tasks**:
   ```javascript
   Task({ description: "Review frontend auth service", ... }),
   Task({ description: "Review backend auth routes", ... })
   ```

4. **Sequential Thinking** synthesizes:
   - Frontend: Using localStorage (security risk), .then().catch() (outdated)
   - Backend: Missing rate limiting, no refresh token logic
   - Priority: Security issues first, then modernization

5. **Context7** validates recommendations:
   - Check secure storage patterns (httpOnly cookies)
   - Verify rate limiting middleware pattern
   - Confirm JWT refresh token best practices

6. **Implementation** (if requested):
   - Move tokens to httpOnly cookies
   - Add rate limiting middleware
   - Implement refresh token logic
   - Update to async/await

7. **Testing**:
   - Add security tests ✓
   - Add rate limiting tests ✓
   - Verify existing auth flows still work with Playwright MCP:
     ```javascript
     mcp__playwright__browser_navigate({ url: "http://localhost:5173/login" })
     mcp__playwright__browser_fill_form({
       fields: [
         { name: "Email", type: "textbox", ref: "email", value: "test@example.com" },
         { name: "Password", type: "textbox", ref: "password", value: "password123" }
       ]
     })
     mcp__playwright__browser_click({ element: "Sign in", ref: "signin" })
     mcp__playwright__browser_wait_for({ text: "Dashboard" })
     mcp__playwright__browser_take_screenshot({ filename: "auth-success.png" })
     ```

8. **Final verification**: All auth flows work, security improved, code modernized

---

## Example 4: Testing User Flows

**Task**: Add test coverage for dashboard components

### Prompt to Claude

```
Using NOVAE, add test coverage for src/components/dashboards/.
Include unit tests and Playwright MCP verification for critical user flows.
```

### Expected NOVAE Workflow

1. **Sequential Thinking** plans testing:
   - Identify dashboard components without tests
   - Identify critical user flows
   - Parallel: component analysis + flow mapping

2. **Context7** checks testing patterns:
   - React Testing Library best practices
   - Playwright MCP best practices for browser automation
   - Mock patterns for API calls

3. **Parallel Tasks**:
   ```javascript
   Task({ description: "Identify untested components", ... }),
   Task({ description: "Map critical user flows", ... }),
   Task({ description: "Review existing test patterns", ... })
   ```

4. **Sequential Thinking** synthesizes:
   - 5 components with <50% coverage
   - 3 critical flows untested (project creation, export, deletion)
   - Prioritize: flows first, then component coverage

5. **Context7** validates test approach:
   - Verify testing-library/react patterns
   - Check Playwright MCP best practices
   - Confirm mock strategies

6. **Test Implementation**:
   - Write unit tests for uncovered components
   - Write Playwright MCP verification for project creation flow:
     ```javascript
     // User flow: Create new project
     mcp__playwright__browser_navigate({ url: "http://localhost:5173" })
     mcp__playwright__browser_click({ element: "New Project", ref: "new-project-btn" })
     mcp__playwright__browser_wait_for({ text: "Project Details" })
     mcp__playwright__browser_fill_form({
       fields: [
         { name: "Project Name", type: "textbox", ref: "project-name", value: "Cloud Migration" },
         { name: "Description", type: "textbox", ref: "description", value: "Migrate to cloud" }
       ]
     })
     mcp__playwright__browser_click({ element: "Create", ref: "create-btn" })
     mcp__playwright__browser_wait_for({ text: "Project created" })
     mcp__playwright__browser_take_screenshot({ filename: "project-created.png" })
     ```

7. **Test Verification**:
   - All new unit tests pass ✓
   - All Playwright MCP flows execute successfully ✓
   - Coverage increased to 85% ✓
   - No existing tests broken ✓

8. **Final verification**: Critical flows covered, high test coverage achieved

---

## Example 5: Complex Refactoring

**Task**: Refactor state management to use React Context

### Prompt to Claude

```
Using NOVAE, refactor the global state management from prop drilling to React Context API.
Ensure all components work after refactoring using Playwright MCP for end-to-end verification.
```

### Expected NOVAE Workflow

1. **Sequential Thinking** plans refactoring:
   - Identify all components using global state
   - Design Context structure
   - Parallel: component analysis + context design

2. **Context7** checks patterns:
   - React 18 Context API best practices
   - Custom hooks for context consumption
   - Performance optimization (useMemo, useCallback)

3. **Parallel Tasks**:
   ```javascript
   Task({ description: "Find components with prop drilling", ... }),
   Task({ description: "Design Context API structure", ... }),
   Task({ description: "Plan migration strategy", ... })
   ```

4. **Sequential Thinking** synthesizes:
   - 15 components affected
   - 3 context providers needed (Auth, Theme, AppState)
   - Migration: create contexts → update providers → update consumers

5. **Context7** validates design:
   - Check Context + hooks pattern
   - Verify provider composition
   - Confirm performance considerations

6. **Implementation** (phased):
   - Phase 1: Create context providers
   - Phase 2: Update root components
   - Phase 3: Migrate child components
   - Phase 4: Remove old props

7. **Testing with Playwright MCP**:
   - All existing unit tests still pass ✓
   - Add context provider unit tests ✓
   - Verify end-to-end flows work with Playwright MCP:
     ```javascript
     mcp__playwright__browser_navigate({ url: "http://localhost:5173/dashboard" })
     mcp__playwright__browser_wait_for({ text: "Dashboard" })
     // Test theme switching still works
     mcp__playwright__browser_click({ element: "Theme toggle", ref: "theme-btn" })
     mcp__playwright__browser_take_screenshot({ filename: "theme-switched.png" })
     // Test auth context still works
     mcp__playwright__browser_click({ element: "Profile", ref: "profile-btn" })
     mcp__playwright__browser_wait_for({ text: "Account Settings" })
     mcp__playwright__browser_take_screenshot({ filename: "profile-open.png" })
     ```

8. **Final verification**: All components work, state management cleaner, no prop drilling

---

## Example 6: Performance Optimization

**Task**: Optimize dashboard rendering performance

### Prompt to Claude

```
Using NOVAE, analyze and optimize dashboard rendering performance.
Use parallel tasks to identify issues. Apply optimizations and verify
with Playwright MCP that dashboard still functions correctly.
```

### Expected NOVAE Workflow

1. **Sequential Thinking** plans optimization:
   - Profile component rendering
   - Check for common performance issues
   - Parallel: re-render analysis + computation analysis

2. **Context7** checks patterns:
   - React.memo, useMemo, useCallback usage
   - Code splitting and lazy loading
   - Virtualization for long lists

3. **Parallel Tasks**:
   ```javascript
   Task({ description: "Identify unnecessary re-renders", ... }),
   Task({ description: "Find heavy computations", ... }),
   Task({ description: "Check for memory leaks", ... })
   ```

4. **Sequential Thinking** synthesizes:
   - 3 components re-rendering on every parent update
   - Heavy chart calculation not memoized
   - Large list not virtualized
   - Priority: unnecessary re-renders first

5. **Context7** validates optimizations:
   - Check React.memo usage patterns
   - Verify useMemo dependencies
   - Confirm virtualization library best practices

6. **Implementation**:
   - Add React.memo to child components
   - Wrap chart calculation in useMemo
   - Add virtualization to task list
   - Lazy load heavy chart library

7. **Testing with Playwright MCP**:
   - Performance improved (measure with profiler) ✓
   - Verify dashboard still renders with Playwright MCP:
     ```javascript
     mcp__playwright__browser_navigate({ url: "http://localhost:5173/dashboard" })
     mcp__playwright__browser_wait_for({ text: "Dashboard" })
     mcp__playwright__browser_take_screenshot({ filename: "dashboard-optimized.png" })
     // Verify interactivity still works
     mcp__playwright__browser_click({ element: "Expand section", ref: "expand" })
     mcp__playwright__browser_wait_for({ text: "Section content" })
     mcp__playwright__browser_take_screenshot({ filename: "section-expanded.png" })
     ```
   - No new bugs introduced ✓

8. **Final verification**: Dashboard renders faster, smooth scrolling, memory stable

---

## Tips for Effective NOVAE Usage

1. **Be specific in prompts**: Include requirements, constraints, and expected outcomes
2. **Mention parallel tasks explicitly**: Claude will break work into parallel tasks
3. **Reference Context7**: When you want library best practices verified
4. **Use Playwright MCP**: For browser interaction testing (not test files)
5. **Ask for TODO**: Request the NOVAE TODO template for complex tasks
6. **Request verification notes**: Ask for final Sequential Thinking verification

## Common Prompt Patterns

### Pattern 1: Feature with Evidence
```
"Using NOVAE, implement [feature]. Show me the NOVAE TODO, run parallel tasks
for [areas], validate with Context7, verify with Playwright MCP, and provide final verification notes."
```

### Pattern 2: Bug Fix with Analysis
```
"Using NOVAE, debug [issue]. Start with Sequential Thinking analysis, run
parallel tasks to investigate [areas], then fix and verify end-to-end with Playwright MCP."
```

### Pattern 3: Code Review
```
"Using NOVAE Context7 reviewer, audit [code area] against [library] best
practices. Propose improvements with specific code changes and Playwright MCP verification."
```

### Pattern 4: Testing with Playwright MCP
```
"Using NOVAE, add test coverage for [area]. Include unit tests and Playwright MCP
verification for user flows. Report results and coverage."
```

### Pattern 5: Refactoring
```
"Using NOVAE, refactor [code area] to [new pattern]. Use parallel tasks to
identify affected code, validate with Context7, and verify with Playwright MCP."
```

## Playwright MCP Quick Reference

Instead of writing test scripts, use MCP tools directly:

```javascript
// Navigation
mcp__playwright__browser_navigate({ url: "http://localhost:5173" })

// Get page state
mcp__playwright__browser_snapshot()

// Interaction
mcp__playwright__browser_click({ element: "Button name", ref: "btn-id" })
mcp__playwright__browser_type({ element: "Input", ref: "input-id", text: "value" })
mcp__playwright__browser_fill_form({ fields: [...] })
mcp__playwright__browser_select_option({ element: "Dropdown", ref: "select-id", values: ["option"] })

// Wait for state
mcp__playwright__browser_wait_for({ text: "Expected text" })
mcp__playwright__browser_wait_for({ textGone: "Text to disappear" })
mcp__playwright__browser_wait_for({ time: 2 })

// Capture state
mcp__playwright__browser_take_screenshot({ filename: "screenshot.png" })

// Debugging
mcp__playwright__browser_console_messages({ onlyErrors: true })
```
