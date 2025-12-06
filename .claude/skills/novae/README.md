# NOVAE Skill - User-Journey-Driven Development

## Overview

**NOVAE** (User-Journey-Driven Development) is a comprehensive Claude Code Skill that implements continuous execution control and quality assurance for software development. It ensures every code change is validated end-to-end through the lens of user journeys, not just isolated fixes.

## What's Included

### Core Skill
- **SKILL.md**: Main skill definition with NOVAE methodology loop (includes Playwright MCP section)
- **CHECKLIST.md**: Completion checklist for task verification
- **USAGE_EXAMPLES.md**: Real-world examples using Playwright MCP for testing

### Subagents (`.claude/agents/`)
- **novae-sequential-thinking**: Execution control at every step
- **novae-context7-reviewer**: Quality assurance via Context7 best practices
- **novae-test-runner**: Autonomous test execution and validation

### Safety Hooks (`.claude/settings.json`)
- **PreToolUse (Bash)**: Blocks dangerous commands (kill, pkill, destructive ops)
- **PostToolUse (Write/Edit)**: Runs lint, typecheck, tests after code changes
- **SubagentStop**: Notification when subagent completes

### Templates (`templates/`)
- **NOVAE_TODO.md**: Structured task planning template
- **PR_TEMPLATE.md**: Evidence-based PR template
- **PLAYWRIGHT_EXAMPLE.spec.ts**: Deprecation notice with Playwright MCP migration guide
- **REACT_ERROR_BOUNDARY.tsx**: React error boundary template
- **EXPRESS_ERROR_MIDDLEWARE.ts**: Express error handling
- **ZOD_REQUEST_VALIDATION.ts**: Type-safe request validation

### Scripts (`scripts/`)
- **safety/validate-bash-safe.py**: Command safety validator
- **post-edit-validate.sh**: Post-edit quality checks

## Quick Start

### 1. Verify Installation

The skill should be automatically discovered by Claude Code. Check available skills:

```
Ask Claude: "What skills are available?"
```

You should see "NOVAE – User-Journey-Driven Development" in the list.

### 2. Configure MCP Servers (Optional)

If you have Context7 and Sequential Thinking MCP servers, update `.mcp.json` with your endpoints:

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://your-context7-server.com/mcp",
      "headers": { "Authorization": "Bearer ${CONTEXT7_TOKEN}" }
    },
    "sequential-thinking": {
      "type": "http",
      "url": "https://your-seq-think-server.com/mcp",
      "headers": { "Authorization": "Bearer ${SEQTHINK_TOKEN}" }
    }
  }
}
```

Or add via CLI:
```bash
claude mcp add --transport http context7 --scope project <url>
```

### 3. Set Environment Variables

```bash
export CONTEXT7_TOKEN="your-token"
export SEQTHINK_TOKEN="your-token"
```

### 4. Test the Skill

Try a simple task to verify everything works:

```
Ask Claude: "Using NOVAE, add a simple health check indicator to the dashboard. 
Use parallel tasks for frontend and backend. Verify with Playwright MCP."
```

## Usage Patterns

### Feature Implementation

```
"Implement [feature] with NOVAE. Use parallel tasks for [frontend/backend/tests],
validate with Context7, then verify with Playwright MCP. Show me the NOVAE TODO 
and final verification notes."
```

### Bug Fix

```
"Fix [bug] using NOVAE. Start with Sequential Thinking, run [analysis] in parallel.
Synthesize results, integrate, verify with Playwright MCP, and test end-to-end."
```

### Code Review

```
"Review [component/area] with NOVAE Context7 reviewer. Check against current
best practices for React 18, Express 4, and TypeScript. Verify with Playwright MCP."
```

### Testing

```
"Run NOVAE test suite for [feature]. Include unit tests and Playwright MCP
verification for user flows. Report any failures with fixes."
```

## The NOVAE Loop (8 Steps)

1. **Initial Analysis (Sequential Thinking)**: Break down task, identify parallelizable work
2. **Quality Baseline (Context7)**: Establish library best practices
3. **Parallel Execution (Task tool)**: Run independent tasks concurrently
4. **Results Synthesis (Sequential Thinking)**: Aggregate outputs, find gaps
5. **Quality Validation (Context7)**: Verify against best practices
6. **Integration & Gap Fill**: Wire components together
7. **Testing**: Unit/integration/Playwright MCP, lint, type checks
8. **Final Verification (Sequential Thinking)**: Confirm user flow success

## Playwright MCP Integration

NOVAE includes Playwright MCP for direct browser interaction testing:

### Key Principle

**Don't write Playwright test scripts (.spec.ts files)** - use the Playwright MCP tool directly in your Claude workflow for immediate feedback.

### Available Playwright MCP Tools

```javascript
// Navigation
mcp__playwright__browser_navigate({ url: "http://localhost:5173" })

// Snapshot current page state
mcp__playwright__browser_snapshot()

// User interactions
mcp__playwright__browser_click({ element: "Button", ref: "btn-id" })
mcp__playwright__browser_type({ element: "Input", ref: "input-id", text: "value" })
mcp__playwright__browser_fill_form({ fields: [...] })
mcp__playwright__browser_select_option({ element: "Dropdown", ref: "select-id", values: ["option"] })

// Wait for conditions
mcp__playwright__browser_wait_for({ text: "Expected text" })
mcp__playwright__browser_wait_for({ textGone: "Text to disappear" })
mcp__playwright__browser_wait_for({ time: 2 })

// Capture and debug
mcp__playwright__browser_take_screenshot({ filename: "screenshot.png" })
mcp__playwright__browser_console_messages({ onlyErrors: true })

// Additional actions
mcp__playwright__browser_press_key({ key: "Enter" })
```

### Example: Testing a User Flow

```javascript
// Navigate to page
mcp__playwright__browser_navigate({ url: "http://localhost:5173" })

// See current state
mcp__playwright__browser_snapshot()

// Click button
mcp__playwright__browser_click({
  element: "Create Project button",
  ref: "create-project-btn"
})

// Wait for form
mcp__playwright__browser_wait_for({ text: "Project Details" })

// Fill form
mcp__playwright__browser_fill_form({
  fields: [
    { name: "Project Name", type: "textbox", ref: "name", value: "My Project" }
  ]
})

// Submit
mcp__playwright__browser_click({ element: "Create", ref: "create-btn" })

// Verify success
mcp__playwright__browser_wait_for({ text: "Project created" })

// Capture final state
mcp__playwright__browser_take_screenshot({ filename: "success.png" })
```

For complete examples, see **USAGE_EXAMPLES.md** and **SKILL.md**.

## Safety Features

### Automatic Command Blocking

The safety validator automatically blocks:
- ❌ `kill`, `killall`, `pkill` commands
- ❌ `rm -rf /` (root filesystem deletion)
- ❌ Mock data in functional code (src/)
- ⚠️ Destructive operations (asks for confirmation)
- ⚠️ Database operations (asks for confirmation)
- ⚠️ Deployment commands (asks for confirmation)

### Post-Edit Validation

After every Write/Edit:
- ✅ Runs ESLint
- ✅ Runs TypeScript type checking
- ✅ Runs Vitest on changed files
- ✅ Provides immediate feedback

## Troubleshooting

### Skill Not Loading

1. Verify file structure:
   ```bash
   ls -la .claude/skills/novae/SKILL.md
   ```

2. Check Claude Code debug output:
   ```bash
   claude --debug
   ```

3. Restart Claude Code

### Hooks Not Working

1. Verify scripts are executable:
   ```bash
   ls -l .claude/skills/novae/scripts/**/*
   ```

2. Test scripts manually:
   ```bash
   echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | python3 .claude/skills/novae/scripts/safety/validate-bash-safe.py
   ```

3. Check settings.json syntax:
   ```bash
   cat .claude/settings.json | python3 -m json.tool
   ```

### MCP Servers Not Connecting

1. Verify .mcp.json syntax:
   ```bash
   cat .mcp.json | python3 -m json.tool
   ```

2. Check environment variables:
   ```bash
   echo $CONTEXT7_TOKEN
   echo $SEQTHINK_TOKEN
   ```

3. Test MCP connection manually (refer to MCP server docs)

### Tests Failing After Edit

This is expected! The post-edit validator provides immediate feedback:

1. Review the error output
2. Fix the issues
3. Re-run tests: `npm run test`
4. Continue when all tests pass

### Playwright MCP Issues

**"Servers not responding" - Tests fail to connect**
1. Ensure dev servers running: `npm run dev`
2. Wait 10 seconds for servers to start
3. Verify ports available: `lsof -i :5173` and `lsof -i :8080`

**"Screenshot not captured" - Screenshot files not created**
1. Check disk space: `df -h`
2. Verify write permissions: `ls -la .`
3. Ensure screenshots directory exists

**"Browser appears stuck" - Playwright interactions timeout**
1. Increase wait timeout in calls
2. Add debugging with `mcp__playwright__browser_console_messages()`
3. Check server performance: `top`

## Customization

### Add Custom Templates

Create new templates in `templates/` directory:

```bash
touch .claude/skills/novae/templates/MY_CUSTOM_TEMPLATE.tsx
```

Reference in SKILL.md under "Reference templates" section.

### Add Custom Safety Rules

Edit `scripts/safety/validate-bash-safe.py`:

```python
# Add to destructive_patterns list
destructive_patterns = [
    # ... existing patterns
    (r"my-dangerous-pattern", "Description"),
]
```

### Adjust Post-Edit Checks

Edit `scripts/post-edit-validate.sh`:

```bash
# Add custom checks
if command -v my-custom-linter >/dev/null 2>&1; then
    my-custom-linter
fi
```

## ProAgentic-Specific Features

This NOVAE implementation is tailored for ProAgentic:

- **Stack**: React 18, TypeScript, Vite 5, Express 4, Vitest, Playwright MCP
- **Safety**: Blocks process termination, mock data in src/
- **Testing**: Emphasizes Playwright MCP for user journey validation
- **Quality**: Enforces lint + type checks before completion
- **Deployment**: Supports Docker, Cloud Run, Netlify

## Best Practices

1. **Always start with Sequential Thinking**: Break down tasks logically
2. **Use Context7 proactively**: Check best practices before AND after coding
3. **Parallelize everything possible**: Use Task tool for concurrent execution
4. **Use Playwright MCP for testing**: Direct browser interaction without test files
5. **Test complete user journeys**: Not just isolated components
6. **Let hooks guide you**: Fix issues immediately when validation fails
7. **Trust the subagents**: They're designed to work autonomously

## Support & Feedback

For issues or suggestions:
1. Check this README and troubleshooting section
2. Review CLAUDE.md project documentation
3. Check SKILL.md for detailed methodology
4. See USAGE_EXAMPLES.md for real-world patterns
5. Claude Code official docs: https://docs.claude.com/en/docs/claude-code/skills

## Version

**Version**: 2.0.0
**Last Updated**: 2025-10-19
**Compatible with**: Claude Code (with Playwright MCP support)

---

**Key Changes in v2.0.0:**
- Integrated Playwright MCP for direct browser interaction
- Deprecated Playwright test script template
- Added comprehensive Playwright MCP usage guide
- Updated examples to use Playwright MCP instead of test files
- Clarified when to write test files vs use Playwright MCP
