/**
 * ⚠️ DEPRECATED - This file is no longer the recommended approach
 *
 * Instead of writing Playwright test scripts (.spec.ts files), use the
 * Playwright MCP tool directly in your Claude workflows.
 *
 * This provides:
 * - Immediate browser interaction feedback (no test file execution)
 * - Flexible testing without test infrastructure
 * - Real-time screenshots and console output
 * - Better integration with Claude's workflow
 *
 * ============================================================
 * MIGRATION GUIDE: From Test Scripts to Playwright MCP
 * ============================================================
 *
 * OLD APPROACH (❌ Don't use this anymore):
 * 1. Create .spec.ts test file
 * 2. Write test code with playwright/test
 * 3. Run: npm run test:e2e
 * 4. Wait for execution
 * 5. Read test output
 *
 * NEW APPROACH (✅ Use this instead):
 * 1. Use Playwright MCP tools directly in Claude workflow
 * 2. See immediate results
 * 3. Take screenshots and logs on demand
 * 4. Continue with next step based on results
 *
 * ============================================================
 * PLAYWRIGHT MCP TOOL REFERENCE
 * ============================================================
 *
 * Browser Navigation:
 *   mcp__playwright__browser_navigate({ url: "http://localhost:5173" })
 *
 * Get Page State:
 *   mcp__playwright__browser_snapshot()
 *
 * Click Element:
 *   mcp__playwright__browser_click({
 *     element: "Submit button",
 *     ref: "submit-btn"
 *   })
 *
 * Type Text:
 *   mcp__playwright__browser_type({
 *     element: "Email input",
 *     ref: "email",
 *     text: "test@example.com"
 *   })
 *
 * Fill Form:
 *   mcp__playwright__browser_fill_form({
 *     fields: [
 *       { name: "Email", type: "textbox", ref: "email", value: "test@example.com" },
 *       { name: "Password", type: "textbox", ref: "password", value: "password123" }
 *     ]
 *   })
 *
 * Select Dropdown:
 *   mcp__playwright__browser_select_option({
 *     element: "Priority dropdown",
 *     ref: "priority",
 *     values: ["High"]
 *   })
 *
 * Wait for Condition:
 *   mcp__playwright__browser_wait_for({
 *     text: "Project created successfully"
 *   })
 *
 * Wait for Text to Disappear:
 *   mcp__playwright__browser_wait_for({
 *     textGone: "Loading..."
 *   })
 *
 * Wait for Time:
 *   mcp__playwright__browser_wait_for({ time: 2 })
 *
 * Take Screenshot:
 *   mcp__playwright__browser_take_screenshot({
 *     filename: "dashboard.png"
 *   })
 *
 * Get Console Messages:
 *   mcp__playwright__browser_console_messages({ onlyErrors: true })
 *
 * Press Key:
 *   mcp__playwright__browser_press_key({ key: "Enter" })
 *
 * ============================================================
 * EXAMPLE: Testing a User Flow with Playwright MCP
 * ============================================================
 *
 * // User journey: Create a project
 * 1. Navigate to home page
 *    mcp__playwright__browser_navigate({ url: "http://localhost:5173" })
 *
 * 2. See current state
 *    mcp__playwright__browser_snapshot()
 *
 * 3. Click "Create Project" button
 *    mcp__playwright__browser_click({
 *      element: "Create Project button",
 *      ref: "create-project-btn"
 *    })
 *
 * 4. Wait for form to appear
 *    mcp__playwright__browser_wait_for({ text: "Project Details" })
 *
 * 5. Take screenshot of form
 *    mcp__playwright__browser_take_screenshot({ filename: "project-form.png" })
 *
 * 6. Fill in form fields
 *    mcp__playwright__browser_fill_form({
 *      fields: [
 *        { name: "Project Name", type: "textbox", ref: "project-name", value: "Cloud Migration" },
 *        { name: "Description", type: "textbox", ref: "description", value: "Migrate to cloud infrastructure" }
 *      ]
 *    })
 *
 * 7. Click submit
 *    mcp__playwright__browser_click({
 *      element: "Create button",
 *      ref: "create-btn"
 *    })
 *
 * 8. Wait for success
 *    mcp__playwright__browser_wait_for({ text: "Project created successfully" })
 *
 * 9. Capture final state
 *    mcp__playwright__browser_take_screenshot({ filename: "project-created.png" })
 *
 * 10. Check for errors
 *     mcp__playwright__browser_console_messages({ onlyErrors: true })
 *
 * ============================================================
 * INTEGRATION WITH NOVAE SKILL
 * ============================================================
 *
 * When using NOVAE for feature implementation:
 *
 * 1. Implement the feature (frontend/backend)
 * 2. Write unit tests with Vitest
 * 3. Use Playwright MCP in the testing phase to verify user flows:
 *
 *    // Testing step (step 7 of NOVAE loop)
 *    mcp__playwright__browser_navigate({ url: "http://localhost:5173" })
 *    mcp__playwright__browser_snapshot()
 *    // ... interact with feature
 *    mcp__playwright__browser_take_screenshot({ filename: "feature-working.png" })
 *    mcp__playwright__browser_console_messages({ onlyErrors: false })
 *
 * This provides immediate feedback without requiring test file management.
 *
 * ============================================================
 * WHEN TO WRITE TEST FILES (.spec.ts)
 * ============================================================
 *
 * Still write .spec.ts files when you need:
 * - Automated testing in CI/CD pipelines
 * - Recurring test execution
 * - Complex test scenarios with setup/teardown
 * - Performance benchmarking
 * - Multi-browser testing
 *
 * For interactive development and feature verification, use Playwright MCP.
 *
 * ============================================================
 * QUESTIONS?
 * ============================================================
 *
 * See:
 * - SKILL.md: NOVAE methodology and Playwright MCP section
 * - USAGE_EXAMPLES.md: Real-world examples using Playwright MCP
 * - README.md: Skill setup and best practices
 */

// This file is kept for reference only.
// For active test file examples, see the project's /tests directory
