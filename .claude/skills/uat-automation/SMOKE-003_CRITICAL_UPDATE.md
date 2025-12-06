# SMOKE-003 Critical Update

## Date: 2025-10-30

## Issue Identified

The original SMOKE-003 test specification was incomplete:
- **Original**: "SMOKE-003: Swarm Mode toggle enabled"
- **Problem**: Only tested that the toggle indicator changes, not that the mode actually works

## Critical Risk

**The system could stay in SWARM mode despite the toggle showing SEQUENTIAL mode.**

This is a serious bug where:
- User clicks toggle to switch to SEQUENTIAL mode
- Toggle indicator changes to show "SEQUENTIAL"
- But agents still process in parallel (SWARM behavior)
- User thinks SEQUENTIAL is working, but it's actually broken

## Corrected Test Specification

**SMOKE-003: SEQUENTIAL Mode Works (Not Stuck in SWARM) - CRITICAL TEST**

### Purpose
Verify that SEQUENTIAL mode **actually works** and the system doesn't stay in SWARM mode despite the toggle.

### Test Procedure

The test now requires **4 screenshots** and **comparative analysis**:

1. **Test SWARM Mode Processing**
   - Clear agent data
   - Generate agents in SWARM mode
   - **Screenshot A**: Capture multiple agents "In Progress" simultaneously
   - Wait for completion
   - **Screenshot B**: Capture all agents "Done"

2. **Switch to SEQUENTIAL Mode**
   - Click mode selector
   - Select SEQUENTIAL mode
   - Verify indicator changes

3. **Test SEQUENTIAL Mode Processing**
   - Clear agent data
   - Generate agents in SEQUENTIAL mode
   - **Screenshot C**: Capture ONE agent "In Progress" at a time
   - Wait for completion
   - **Screenshot D**: Capture all agents "Done"

4. **Comparative Analysis**
   - Compare Screenshot A (SWARM) vs Screenshot C (SEQUENTIAL)
   - Screenshot A: Multiple agents "In Progress" simultaneously
   - Screenshot C: ONLY ONE agent "In Progress" at a time
   - If Screenshot C shows multiple "In Progress" → **TEST FAILS** (stuck in SWARM)
   - If Screenshot C shows single "In Progress" → **TEST PASSES** (SEQUENTIAL works)

### Pass Criteria

✅ **PASS**: Screenshot C shows ONLY ONE agent processing at a time
- Confirms SEQUENTIAL mode is actually working
- Confirms system is not stuck in SWARM mode

❌ **FAIL**: Screenshot C shows multiple agents processing simultaneously
- System stuck in SWARM mode despite toggle
- Critical bug that breaks SEQUENTIAL functionality

### Example Analysis

```markdown
**SMOKE-003 Screenshot A (SWARM Processing)**:
In this screenshot, I can see 4 agents showing "In Progress" status simultaneously:
Requirements, Scope, Schedule, and Resources. The agent sidebar shows all 4 with
animated loading indicators. This confirms SWARM mode parallel processing is working
correctly with multiple agents executing concurrently.

**SMOKE-003 Screenshot C (SEQUENTIAL Processing)**:
In this screenshot, I can see only 1 agent showing "In Progress" status: the
Requirements agent. All other agents (Scope, Schedule, Resources, Risk, APDA,
Quality, Recommendations) are in "Pending" state with no loading indicators.
This confirms SEQUENTIAL mode is working correctly - agents process one at a
time, not in parallel.

**Comparison**:
- SWARM (Screenshot A): 4 agents "In Progress" concurrently
- SEQUENTIAL (Screenshot C): 1 agent "In Progress", 7 agents "Pending"
- Difference: SWARM processes in parallel, SEQUENTIAL processes sequentially
- Conclusion: ✅ PASS - SEQUENTIAL mode is functioning correctly. The system
  is not stuck in SWARM mode despite the toggle.
```

## Impact on Test Count

### Original Plan
- 35 tests total
- 35 screenshots (1 per test)

### Updated Plan
- 35 tests total (unchanged)
- **38 screenshots** (SMOKE-003 requires 4 instead of 1)
  - 25 smoke tests = 28 screenshots (SMOKE-003 has 4, others have 1)
  - 10 spot tests = 10 screenshots
  - Total: 38 screenshots

## Files Updated

1. **SKILL_IMPROVED.md**
   - Added "Step 2B: Detailed Test Procedures for Critical Smoke Tests"
   - Detailed SMOKE-003 procedure with 4-screenshot workflow
   - Updated CRITICAL ENFORCEMENT RULE #7: "38+ screenshot links"

2. **UAT_REPORT_IMPROVED.md**
   - Expanded SMOKE-003 section with 4 screenshot placeholders
   - Added comparative analysis template
   - Updated header: "35 tests, 38 screenshots"

3. **validate-uat-execution.sh**
   - Updated REQUIRED_SCREENSHOTS from 35 to 38
   - Updated validation checks to expect 38 screenshots
   - Added comments explaining SMOKE-003 requires 4

## Why This Matters

### Before (Incomplete Test)
```
1. Click toggle to SEQUENTIAL
2. Verify indicator shows "SEQUENTIAL"
3. Take 1 screenshot
4. Mark PASS ✅
```

**Problem**: Toggle indicator could change but mode doesn't actually work.

### After (Complete Test)
```
1. Test SWARM with screenshots (prove parallel processing works)
2. Switch to SEQUENTIAL
3. Test SEQUENTIAL with screenshots (prove sequential processing works)
4. Compare screenshots side-by-side
5. Mark PASS only if Screenshot C shows ONE agent processing
```

**Benefit**: Actually verifies SEQUENTIAL mode works, not just the indicator.

## Key Insight from User

> "the risk is that it stays in swarm mode despite the toggles"

This insight revealed that:
- We need to test actual behavior, not just UI indicators
- We need comparative analysis (SWARM vs SEQUENTIAL screenshots)
- We need to prove ONE agent processes at a time in SEQUENTIAL mode

## Recommendation

**All future mode/toggle tests should follow this pattern:**
1. Test Mode A with screenshot (prove Mode A works)
2. Switch to Mode B
3. Test Mode B with screenshot (prove Mode B works)
4. Compare screenshots (prove modes are different)
5. Only mark PASS if behavior actually changed

**Don't just test that the toggle indicator changes.**

---

**Update Status**: ✅ COMPLETE
**SMOKE-003 Now**: CRITICAL TEST with proper verification
**Screenshot Count**: 38 (was 35)
**Validation Script**: Updated to expect 38 screenshots
