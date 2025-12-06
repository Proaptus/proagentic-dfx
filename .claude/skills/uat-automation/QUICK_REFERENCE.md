# UAT Automation - Quick Reference Card

## One-Page Guide to Running ProAgentic Smoke Tests

### Essential Commands

```bash
# Start ProAgentic development environment
cd /home/chine/projects/proagentic-clean
npm run dev

# Verify services running
curl http://localhost:5173  # Frontend
curl http://localhost:8080/api/health  # Backend
```

### Execute UAT Suite

```
"Run the UAT smoke test suite with screenshot validation for all 25 tests and generate comprehensive report"
```

### Test Coverage: 25 Tests Across 10 Phases

| Phase | Tests | Focus |
|-------|-------|-------|
| 1 | 3 | Homepage & templates |
| 2 | 2 | Swarm mode processing |
| 3 | 3 | Dashboard navigation |
| 4 | 2 | Agent mode commands |
| 5 | 3 | Agile mode & sprints |
| 6 | 2 | Inline editing |
| 7 | 3 | Project save/load |
| 8 | 2 | Charter upload |
| 9 | 2 | Data synchronization |
| 10 | 2 | AI report generation |
| Final | 1 | Validation check |

### Success Criteria

```
✅ PASS:          23+ tests pass (92%+)
⚠️  CONDITIONAL:  20-22 tests pass (80-91%)
❌ FAIL:          <20 tests pass (<80%)
```

### Key URLs

| Page | URL |
|------|-----|
| Homepage | http://localhost:5173 |
| Workflow | http://localhost:5173/workflow/[projectId] |
| Agent Mode | http://localhost:5173/agent/[projectId] |
| Agile Mode | http://localhost:5173/workflow/[projectId]/agile |
| API Health | http://localhost:8080/api/health |

### Critical Test Points

**SMOKE-001**: Logo visible, Create Project button, 8+ templates
**SMOKE-004**: 8 agents generate in parallel, progress shows
**SMOKE-006**: Requirements dashboard with counts and metrics
**SMOKE-012**: Sprint board with Kanban columns (To Do, In Progress, Done)
**SMOKE-023**: Executive summary generates with metrics
**SMOKE-025**: All dashboards accessible, no console errors

### Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Browser navigation timeout | Check localhost:5173 accessible, increase wait time to 5s |
| Element not found | Use JavaScript evaluation instead of ref selection |
| Screenshot token limit | Use `take_screenshot` not `snapshot`, viewport only |
| State lost after navigation | Wait 3s for page load, reload if needed |
| Agile mode fails | Complete full 5-step wizard, don't skip steps |

### Progress Tracking

```
1. Open TodoWrite with 25 test items
2. Mark tests as "in_progress" while executing
3. Capture screenshot after each test
4. Mark as "completed" with ✅ PASS or ❌ FAIL
5. Update progress after every 5 tests
6. Generate UAT report when all 25 complete
```

### Screenshot Checklist

✅ PNG format
✅ Filename: `[phase]-[test-id]-[name].png`
✅ Test-specific UI elements visible
✅ No critical errors in console
✅ Correct mode active (Workflow/Agent/Agile)
✅ Full viewport captured

### Execution Flow

```
START
  ↓
Navigate to http://localhost:5173
  ↓
Create Project (Cloud Migration Initiative template)
  ↓
Enable Swarm Mode
  ↓
SMOKE-001 → Screenshot → PASS ✅
SMOKE-002 → Screenshot → PASS ✅
...
SMOKE-025 → Screenshot → PASS ✅
  ↓
Generate UAT Report
  ↓
END
```

### Files & Templates

```
.claude/skills/uat-automation/
├── SKILL.md                     # Core skill definition
├── README.md                    # Full documentation
├── QUICK_REFERENCE.md          # This file
├── USAGE_EXAMPLES.md           # Step-by-step examples
├── CHECKLIST.md                # Pre/post checklists
├── templates/
│   ├── UAT_TEST_CASE.md        # Individual test template
│   ├── UAT_REPORT.md           # Report template
│   └── SCREENSHOT_VALIDATION.md # Validation checklist
└── scripts/
    ├── validate-screenshots.sh # Screenshot validation
    └── generate-report.sh      # Report generation
```

### Most Important Rules

1. **Execute Sequentially**: SMOKE-001 → SMOKE-025 in order
2. **Screenshot Every Test**: Proof of execution
3. **Never Stop Early**: Complete all 25 tests
4. **Update Progress**: Mark todos as completed
5. **No Skipping**: Failed test? Retry once, mark FAILED, continue
6. **Continuous Control**: Use TodoWrite to maintain context

### Tips for Success

- Use `mcp__playwright__browser_evaluate()` for complex selectors
- Always `wait_for` 3 seconds after navigation
- Use `take_screenshot` (not `snapshot`) for large pages
- Verify element with `evaluate` before clicking
- Document failures for troubleshooting
- Check console for errors: `browser_console_messages()`

### Getting Help

- **Full Guide**: See README.md for comprehensive documentation
- **Step-by-Step**: See USAGE_EXAMPLES.md for detailed scenarios
- **Checklists**: See CHECKLIST.md for pre/post verification
- **Test Specs**: See `/docs/UAT_SMOKE_TEST_SPECIFICATION.md`

---

**Total Execution Time**: 25-35 minutes for full suite
**Screenshot Directory**: `./tests/uat-results/`
**Report Location**: `./UAT_REPORT_[date].md`
