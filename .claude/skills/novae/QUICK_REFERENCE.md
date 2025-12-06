# NOVAE Quick Reference Card

## The 8-Step Loop

```
1. Initial Analysis (Sequential Thinking)
   → Break down task, identify parallelizable work

2. Quality Baseline (Context7)
   → Establish library best practices

3. Parallel Execution (Task tool)
   → Run independent tasks concurrently

4. Results Synthesis (Sequential Thinking)
   → Aggregate outputs, find gaps

5. Quality Validation (Context7)
   → Verify against best practices

6. Integration & Gap Fill
   → Wire components together

7. Testing
   → Unit/integration/E2E, lint, type checks

8. Final Verification (Sequential Thinking)
   → Confirm user flow success
```

## Key Commands

```bash
# Development
npm run dev              # Start dev environment
npm run build            # Build for production

# Testing
npm run test             # Unit/integration tests
npm run test:coverage    # With coverage report
npm run test:e2e         # Playwright E2E tests

# Quality
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run typecheck        # TypeScript checking
```

## File Locations

```
.claude/
├── skills/novae/
│   ├── SKILL.md                    # Main skill definition
│   ├── CHECKLIST.md                # Completion checklist
│   ├── README.md                   # Full documentation
│   ├── USAGE_EXAMPLES.md           # Example scenarios
│   ├── templates/                  # Code templates
│   │   ├── NOVAE_TODO.md
│   │   ├── PR_TEMPLATE.md
│   │   ├── PLAYWRIGHT_EXAMPLE.spec.ts
│   │   ├── REACT_ERROR_BOUNDARY.tsx
│   │   ├── EXPRESS_ERROR_MIDDLEWARE.ts
│   │   └── ZOD_REQUEST_VALIDATION.ts
│   └── scripts/
│       ├── safety/validate-bash-safe.py
│       └── post-edit-validate.sh
├── agents/
│   ├── novae-sequential-thinking.md
│   ├── novae-context7-reviewer.md
│   └── novae-test-runner.md
└── settings.json                   # Hooks configuration
```

## Prompt Patterns

### Feature Implementation
```
"Using NOVAE, implement [feature]. Use parallel tasks for [areas],
validate with Context7, then run Playwright."
```

### Bug Fix
```
"Using NOVAE, fix [bug]. Start with Sequential Thinking, run [analysis]
in parallel, then verify end-to-end."
```

### Code Review
```
"Using NOVAE Context7 reviewer, audit [code] against [library] best
practices. Propose improvements."
```

### Testing
```
"Using NOVAE test runner, add test coverage for [area]. Include
unit, integration, and E2E tests."
```

## Safety Features

### Automatically Blocked
- ❌ `kill`, `killall`, `pkill`
- ❌ `rm -rf /`
- ❌ Mock data in src/

### Requires Confirmation
- ⚠️ Destructive operations (rm -rf)
- ⚠️ Database operations
- ⚠️ Deployment commands

### Post-Edit Checks (Automatic)
- ✅ ESLint
- ✅ TypeScript type checking
- ✅ Vitest on changed files

## Subagents

### novae-sequential-thinking
- **When**: At every major step
- **Purpose**: Break down work, synthesize results, verify completion
- **Output**: Task breakdown, synthesis notes, verification checklist

### novae-context7-reviewer
- **When**: Before and after code changes
- **Purpose**: Validate against library best practices
- **Output**: Patterns validated, deviations found, improvements suggested

### novae-test-runner
- **When**: After edits, before completion
- **Purpose**: Run tests autonomously and report results
- **Output**: Test results, failure analysis, fixes

## Common Issues

### Skill Not Loading
```bash
# Check file exists
ls .claude/skills/novae/SKILL.md

# Restart Claude Code
claude --debug
```

### Hooks Not Working
```bash
# Verify scripts executable
ls -l .claude/skills/novae/scripts/**/*

# Test manually
echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | \
  python3 .claude/skills/novae/scripts/safety/validate-bash-safe.py
```

### Tests Failing After Edit
This is expected! Review output, fix issues, re-run.

## ProAgentic Context

**Stack**: React 18 + TypeScript + Vite 5 + Express 4 + Vitest + Playwright

**Safety**: Never kill processes, use npm scripts

**Testing**: Always include Playwright for user flows

**Quality**: Lint + type checks must pass

## Context7 Libraries to Check

- React 18 (hooks, error boundaries)
- TypeScript 5.x (strict mode)
- Vite 5 (config, plugins)
- Express 4 (middleware, async/await)
- Zod (schema validation)
- Vitest (async tests, mocking)
- Playwright (user-centric testing)

## Remember

1. ✅ Start with Sequential Thinking
2. ✅ Use Context7 proactively
3. ✅ Parallelize everything possible
4. ✅ Test complete user journeys
5. ✅ Let hooks guide you
6. ✅ Trust the subagents

---

**Need more details?** See README.md and USAGE_EXAMPLES.md
