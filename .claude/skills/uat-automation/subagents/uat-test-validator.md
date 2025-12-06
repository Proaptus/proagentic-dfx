# UAT Test Validator Subagent

## Purpose

Validates test completion before allowing progression to next test. This subagent acts as a **BLOCKING CHECKPOINT** that prevents protocol violations during UAT test execution.

## When to Use

**AUTOMATICALLY INVOKED** after EACH test by the main UAT Automation skill. This is not a manual tool - it runs as an enforcement gate.

## Validation Gates

After EVERY test, this validator checks 5 critical requirements:

### Gate 1: Screenshot Exists ✅

**Check**: Screenshot file exists at expected path

```bash
# Expected path pattern
.playwright-mcp/{test-id}-*.png
```

**Validation**:
- File must exist in filesystem
- File must be PNG format
- File size must be > 0 bytes (not empty)

**If fails**:
```
❌ VALIDATION FAILED: Screenshot not captured
→ Expected: .playwright-mcp/SPOT-002-*.png
→ Found: No file at path
→ ACTION REQUIRED: Capture screenshot before proceeding
```

### Gate 2: Screenshot Analyzed with Read Tool 👁️

**Check**: Read tool was invoked on the screenshot file

**Validation**:
- Search recent tool calls for Read invocation
- Path must match screenshot filename
- Read must have occurred AFTER screenshot capture

**If fails**:
```
❌ VALIDATION FAILED: Screenshot not analyzed with Read tool
→ Screenshot: .playwright-mcp/SPOT-002-performance.png
→ Read tool: NOT CALLED
→ ACTION REQUIRED: Use Read tool to view and describe screenshot (3-5 sentences)
```

### Gate 3: Report Updated with Test Entry 📝

**Check**: Report file was edited with test results

**Validation**:
- Edit tool was called on UAT_COMPREHENSIVE_TEST_REPORT.md
- Test entry contains test ID (e.g., "SPOT-002")
- Entry includes screenshot link
- Entry includes analysis text (3+ sentences)
- Entry includes pass/fail status

**If fails**:
```
❌ VALIDATION FAILED: Report not updated with test entry
→ Report file: UAT_COMPREHENSIVE_TEST_REPORT.md
→ Edit tool: NOT CALLED for this test
→ ACTION REQUIRED: Use Edit tool to append test results immediately
```

### Gate 4: Valid Status (PASS or FAIL Only) ⚠️

**Check**: Test status is ONLY "✅ PASS" or "❌ FAIL"

**Validation**:
- Parse test status from report
- Must contain EXACTLY one of: "✅ PASS" or "❌ FAIL"
- CANNOT contain: "⏭️ SKIPPED", "⏸️ PENDING", "🚧 IN PROGRESS", or any other status

**If fails**:
```
❌ VALIDATION FAILED: Invalid test status
→ Found status: "⏭️ SKIPPED - test environment constraints"
→ Allowed statuses: ONLY "✅ PASS" or "❌ FAIL"
→ ACTION REQUIRED: Change status to PASS or FAIL (no other options)
```

**CRITICAL**: This gate enforces the core rule "NO skipped category". Any test must be either PASS (works correctly) or FAIL (doesn't work). There is NO middle ground.

### Gate 5: Todo List Updated ✔️

**Check**: Test marked as "completed" in todo list

**Validation**:
- TodoWrite was called
- Current test status changed to "completed"
- Next test status changed to "in_progress" (if not last test)

**If fails**:
```
❌ VALIDATION FAILED: Todo list not updated
→ Test: SPOT-002
→ Current status: in_progress (should be completed)
→ ACTION REQUIRED: Call TodoWrite to mark test completed
```

## Validation Output Format

### Success Case

When all gates pass:

```
✅ Test SPOT-002 Validation: PASSED
  ✓ Screenshot captured: spot-002-performance-18-requirements.png (152 KB)
  ✓ Screenshot analyzed: Read tool called at 14:32:15
  ✓ Report updated: Edit tool called, entry added at line 679
  ✓ Valid status: ✅ PASS
  ✓ Todo updated: Test marked completed

Ready to proceed to next test: SPOT-003
```

### Failure Case

When any gate fails:

```
❌ Test SPOT-002 Validation: FAILED (2/5 gates passed)
  ✓ Screenshot captured: spot-002-performance-18-requirements.png (152 KB)
  ✗ Screenshot analyzed: NO Read tool call found
  ✗ Report updated: NO Edit tool call found
  ✓ Valid status: ✅ PASS
  ✓ Todo updated: Test marked completed

🚨 STOP: Complete missing steps before proceeding to next test

Required Actions:
1. Use Read tool on: .playwright-mcp/spot-002-performance-18-requirements.png
2. Write 3-5 sentence description of screenshot content
3. Use Edit tool to append test results to UAT_COMPREHENSIVE_TEST_REPORT.md

DO NOT PROCEED TO SPOT-003 UNTIL ALL GATES PASS.
```

## Implementation Pattern

This validator should be called after EACH test using this pattern:

```typescript
// After completing a test (e.g., SPOT-002)

// 1. Execute test
mcp__playwright__browser_click({ ... })
mcp__playwright__browser_wait_for({ time: 3 })

// 2. Capture screenshot
mcp__playwright__browser_take_screenshot({
  filename: "spot-002-performance-18-requirements.png"
})

// 3. Analyze screenshot (MANDATORY)
Read({ file_path: "./.playwright-mcp/spot-002-performance-18-requirements.png" })
// [Write 3-5 sentence description]

// 4. Update report (MANDATORY)
Edit({
  file_path: "./UAT_COMPREHENSIVE_TEST_REPORT.md",
  // ... append test results
})

// 5. Update todo
TodoWrite({ todos: [ /* mark completed */ ] })

// 6. VALIDATE (AUTOMATIC - BLOCKING)
// This subagent runs automatically and BLOCKS if validation fails

// 7. Only proceed to next test if validation passed
```

## How This Prevents Violations

### Violation 1: "Skipped" Category

**Before**: Agent could mark tests as "SKIPPED" without enforcement

**After**: Gate 4 BLOCKS any status other than PASS or FAIL
- Detects "SKIPPED", "PENDING", etc. in report
- STOPS execution
- Forces agent to use PASS or FAIL only

### Violation 2: No Report Update

**Before**: Agent could batch 2-3 tests before updating report

**After**: Gate 3 BLOCKS progression if report not updated
- Checks Edit tool was called for current test
- Verifies test entry exists in report
- STOPS if report not updated immediately

### Violation 3: No Screenshot Analysis

**Before**: Agent could skip Read tool, move to next test

**After**: Gate 2 BLOCKS if screenshot not analyzed
- Verifies Read tool called on screenshot
- Confirms analysis occurred after capture
- STOPS if Read tool not invoked

### Violation 4: Math Errors in Counts

**Before**: Manual counting led to "27 passed" when actually 26

**After**: Automated counting from report file
- Parse report for ✅ PASS markers
- Count automatically (no manual counting)
- Display actual count vs. expected

## Automation Level

**Fully Automated Validation**

This subagent runs automatically after each test. The main UAT Automation skill should:

1. Execute test
2. Capture screenshot
3. Analyze screenshot
4. Update report
5. **AUTOMATICALLY invoke uat-test-validator**
6. Check validation result
7. If PASS → Proceed to next test
8. If FAIL → Display missing steps, STOP execution

## Integration with Main Skill

The main UAT Automation skill SKILL.md should be updated to include:

```markdown
## Validation Checkpoint (After EACH Test)

After completing steps 1-5 for a test, the **uat-test-validator subagent**
automatically validates completion before allowing progression to the next test.

**This is a BLOCKING operation** - you cannot proceed to the next test until
validation passes.

The validator checks:
1. Screenshot captured
2. Screenshot analyzed with Read tool
3. Report updated with Edit tool
4. Status is PASS or FAIL (no other options)
5. Todo list updated

If validation fails, complete the missing steps before proceeding.
```

## Success Metrics

After implementing this validator:

**Target Metrics**:
- Protocol Violations: 0 (currently 4 per session)
- User Interventions Required: 0 (currently 3 per session)
- Tests Completed Smoothly: 35/35 (currently ~27/35)
- Report Update Lag: 0 tests (currently 2-3 test lag)

**Measurement**:
- Track validation failures per session
- Count how many times validator blocks progression
- Measure user interventions needed (should be zero)

## Edge Cases

### Edge Case 1: Cross-Reference Tests

Some SPOT tests reference earlier SMOKE tests (e.g., SPOT-005 references SMOKE-022).

**Handling**:
- Cross-reference tests still need validation
- Must explicitly state "Cross-reference to SMOKE-022" in report
- Can reuse screenshot from referenced test
- Must update report and todo (validation applies)
- Status must still be PASS or FAIL (no "skipped")

### Edge Case 2: Test Failure and Retry

If a test fails and is retried:

**Handling**:
- First attempt: FAIL → validator passes (FAIL is valid status)
- Retry: Execute again, capture new screenshot
- If retry succeeds: Update report with PASS, validator passes
- If retry fails: Keep FAIL status, validator passes
- Proceed to next test (validator allows FAIL status)

### Edge Case 3: Multiple Screenshots for One Test

Some tests require multiple screenshots (e.g., SMOKE-003 needs 4 screenshots).

**Handling**:
- Validator checks for PRIMARY screenshot
- Additional screenshots are supplementary
- All screenshots must be analyzed with Read tool
- Report must include all screenshots
- Validation passes if primary screenshot validated

## Validator Limitations

This validator checks for:
- ✅ Presence of files and tool calls
- ✅ Status is PASS or FAIL only
- ✅ Report structure is correct

This validator does NOT check for:
- ❌ Quality of screenshot analysis (3-5 sentences is guideline)
- ❌ Accuracy of pass/fail determination
- ❌ Content quality of test report
- ❌ Whether test actually executed correctly

**Why**: The validator enforces protocol compliance, not test quality. It prevents structural violations but trusts the agent's judgment on pass/fail decisions.

## Maintenance

This validator should be updated if:
- New validation gates are added
- Report format changes
- Screenshot naming convention changes
- Todo tracking structure changes

## References

- **Main Skill**: `.claude/skills/uat-automation/SKILL.md`
- **Handover Document**: Root directory `UAT_SKILL_IMPROVEMENT_HANDOVER.md`
- **Issue Tracking**: Session transcript 2025-10-30 (4 protocol violations documented)

---

**Remember**: This validator is the enforcement mechanism that makes "instructions" become "requirements". Without this validator, agents can violate protocol. With this validator, protocol violations are blocked automatically.
