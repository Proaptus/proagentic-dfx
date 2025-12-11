# UAT Automation - Quick Reference Card

## One-Page Guide to Running H2 Tank Designer Smoke Tests

### Essential Commands

```bash
# Start H2 Tank Designer development environment
cd proagentic-dfx
npm run dev

# Verify services running
curl http://localhost:3000       # Frontend
curl http://localhost:3001       # Mock server (if needed)
```

### Execute UAT Suite

```
"Run the UAT smoke test suite with screenshot validation for all 30 tests and generate comprehensive report"
```

### Test Coverage: 30 Tests Across 7 Phases

| Phase | Tests | Focus |
|-------|-------|-------|
| 1 | 4 | App initialization & navigation |
| 2 | 5 | Requirements entry (wizard/chat) |
| 3 | 4 | Pareto optimization |
| 4 | 4 | 3D visualization |
| 5 | 4 | Analysis screens |
| 6 | 4 | Validation & compliance |
| 7 | 5 | Export & sentry mode |

### Success Criteria

```
✅ PASS:          24+ tests pass (80%+)
⚠️ CONDITIONAL:  21-23 tests pass (70-79%)
❌ FAIL:          <21 tests pass (<70%)
```

### Key URLs

| Page | URL |
|------|-----|
| App (Normal) | http://localhost:3000 |
| App (Dev Mode) | http://localhost:3000?dev=true |
| Mock Server | http://localhost:3001 |

### Navigation Shortcuts

| Key | Screen |
|-----|--------|
| 1 | Requirements |
| 2 | Pareto Explorer |
| 3 | 3D Viewer |
| 4 | Compare |
| 5 | Analysis |
| 6 | Compliance |
| 7 | Validation |
| 8 | Export |
| 9 | Sentry Mode |
| ? | Help Panel |

### Critical Test Points

**SMOKE-001**: Sidebar visible, ProAgentic DfX header, H2 Tank module
**SMOKE-005**: Requirements wizard with form fields
**SMOKE-014**: 3D tank model renders in canvas
**SMOKE-019**: Analysis tabs load different content
**SMOKE-025**: Validation tests execute with results
**SMOKE-029**: Sentry dashboard shows monitoring data

### Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Navigation blocked | Use `?dev=true` to bypass restrictions |
| 3D model blank | Wait 5+ seconds for Three.js to render |
| Element not found | Use `take_snapshot()` to get UIDs |
| Charts not visible | Wait for SVG elements to render |
| Screenshot blank | Verify correct page is active |

### 6-Step Test Sequence (MANDATORY)

```
1. EXECUTE  → Action (navigate, click, fill)
2. WAIT     → For completion (3-5+ seconds)
3. CAPTURE  → take_screenshot({ filename: "..." })
4. ANALYZE  → Read({ file_path: "..." })
5. UPDATE   → Edit report immediately
6. PROCEED  → Update todo, next test
```

### Screenshot Checklist

✅ PNG format
✅ Filename: `smoke-[num]-[name].png`
✅ Test-specific UI elements visible
✅ No loading spinners
✅ No error messages
✅ Correct screen active

### Chrome DevTools MCP Commands

```typescript
// Navigate
mcp__chrome-devtools__navigate_page({ url: "..." })

// Take snapshot (get UIDs)
mcp__chrome-devtools__take_snapshot()

// Click element
mcp__chrome-devtools__click({ uid: "..." })

// Fill input
mcp__chrome-devtools__fill({ uid: "...", value: "..." })

// Press key
mcp__chrome-devtools__press_key({ key: "3" })

// Screenshot
mcp__chrome-devtools__take_screenshot({ filename: "..." })

// Evaluate JS
mcp__chrome-devtools__evaluate_script({
  function: `() => document.querySelector('canvas') !== null`
})
```

### Files & Templates

```
.claude/skills/uat-automation/
├── SKILL.md              # Core skill definition (30 tests)
├── README.md             # Full documentation
├── QUICK_REFERENCE.md    # This file
├── CHECKLIST.md          # Pre/post execution checklists
├── rules/
│   ├── ABSOLUTE_RULES.md # Critical rules
│   ├── test-sequence.md  # 6-step mandatory sequence
│   └── validation-gates.md
└── templates/
    └── UAT_REPORT.md     # Report template
```

### Most Important Rules

1. **Complete ALL 30 tests** - No stopping early
2. **Screenshot EVERY test** - Evidence required
3. **WAIT for completion** - No premature screenshots
4. **ANALYZE screenshots** - Use Read tool, write description
5. **UPDATE report IMMEDIATELY** - No batching
6. **CONTINUE on failure** - Retry once, mark FAIL, move on

### Tips for Success

- Use `?dev=true` for unrestricted navigation
- Wait 5+ seconds for 3D models to render
- Use `take_snapshot()` to find element UIDs
- Always verify canvas is rendered before 3D screenshots
- Check for loading spinners before capturing

### Execution Flow

```
START
  ↓
Navigate to http://localhost:3000?dev=true
  ↓
Initialize todo list with 30 tests
  ↓
SMOKE-001 → Screenshot → Analyze → Report → ✅
SMOKE-002 → Screenshot → Analyze → Report → ✅
...
SMOKE-030 → Screenshot → Analyze → Report → ✅
  ↓
Update summary statistics
  ↓
Generate final report
  ↓
END
```

---

**Total Execution Time**: 30-45 minutes for full suite
**Report File**: `H2_UAT_REPORT.md`
**Pass Threshold**: 80% (24/30 tests)
