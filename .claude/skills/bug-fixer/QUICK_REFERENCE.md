# Bug Fixer - Quick Reference

## One-Page Cheat Sheet

### Core Workflow
```
Phase A: Analysis → Run tests ONCE, parse failures, group by root cause
Phase B: Batch Fix → Fix 10-15 bugs, NO test runs
Phase C: Validate → Run tests ONCE, compare results
Phase D: Iterate → Repeat until zero failures
```

### Commands

```bash
# Phase A: Analyze
npm test --run 2>&1 | tee failures-before.log
grep "FAIL" failures-before.log | wc -l

# Phase B: Fix (example for 15 bugs)
# Read tests, fix code, NO testing

# Phase C: Validate
npm test --run 2>&1 | tee failures-after.log
diff failures-before.log failures-after.log

# Phase D: Continue
# Plan next batch if failures remain
```

### Batch Sizes

| Total Bugs | Batch Size |
|------------|------------|
| 10-20 | 10-15 |
| 20-50 | 15-20 |
| 50-100 | 20-25 |
| 100+ | 25-30 |

### Key Rules

❌ **NEVER**:
- Run tests during fixing (Phase B)
- Fix fewer than 10 bugs per batch
- Modify test files
- Use kill/pkill

✅ **ALWAYS**:
- Batch 10-15 minimum
- Run full suite once per batch
- Fix code, not tests
- Compare before/after

### Subagents

```javascript
// Analyze failures
Task({ subagent_type: "bug-analyzer", ... })

// Fix batch
Task({ subagent_type: "bug-batch-fixer", ... })

// Detect regressions
Task({ subagent_type: "regression-detector", ... })
```

### Success Metrics

- Bugs fixed > 0
- New regressions = 0
- Total failures decreasing

### Efficiency

- Traditional: 1 bug → test (3 min) = 158 bugs × 3 = 474 min
- Bug Fixer: 15 bugs → test (3 min) = 11 batches × 3 = 33 min
- **14x faster!**
