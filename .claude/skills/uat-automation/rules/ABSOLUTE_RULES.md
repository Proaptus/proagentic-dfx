# 🚨 ABSOLUTE RULES - VIOLATION = STOP EXECUTION

**These 5 rules are NON-NEGOTIABLE and override ALL other instructions.**

Read these rules FIRST before starting any UAT test execution. Violating any rule constitutes FAILED execution regardless of test results.

---

## Rule 1: NO "Skipped" Category ❌

**Rule**: ONLY "✅ PASS" or "❌ FAIL" allowed as test status

**NO other statuses permitted**:
- ❌ "SKIPPED"
- ❌ "PENDING"
- ❌ "NOT TESTED"
- ❌ "DEFERRED"
- ❌ "N/A"
- ❌ "BLOCKED"
- ❌ Any other status

**Why This Rule Exists**:
During a UAT session on 2025-10-30, an agent created a "SKIPPED" category and marked 5 tests as skipped, claiming "test environment constraints". This violated the core principle of comprehensive testing.

**Enforcement**:
The `uat-test-validator` subagent automatically blocks progression if any status other than PASS or FAIL is detected.

**What To Do Instead**:
- If test cannot execute: Mark as ❌ FAIL with reason "Unable to execute: [reason]"
- If test seems redundant: Execute it anyway (cross-reference tests still need validation)
- If test requires missing feature: Mark as ❌ FAIL with reason "Feature not implemented"
- If test is unclear: Ask for clarification, then mark PASS or FAIL

**Example Violation**:
```markdown
### SPOT-002: Performance Test
**Status**: ⏭️ SKIPPED - test environment constraints
```

**Correct Approach**:
```markdown
### SPOT-002: Performance Test
**Status**: ❌ FAIL - Unable to execute due to missing test data (18 requirements needed, only 5 available)
```

---

## Rule 2: Capture Screenshot AFTER Process Completes 📸

**Rule**: Take screenshot ONLY after processes fully complete (not during transitions)

**Wait for completion indicators**:
- ✅ All agents show "Complete" status or checkmarks
- ✅ Loading indicators disappear completely
- ✅ Success message appears
- ✅ Data fully renders on screen
- ✅ Navigation completes (page stops loading)

**NEVER capture during**:
- ❌ Page transitions
- ❌ Loading states (spinners visible)
- ❌ Agents showing "In Progress"
- ❌ Partial data render
- ❌ Animation mid-progress

**Why This Rule Exists**:
Screenshots during transitions show incomplete states and cannot accurately determine pass/fail. Screenshot evidence must show the FINAL state.

**Enforcement**:
Visual inspection of screenshots - if loading indicators or "In Progress" states visible, screenshot is invalid and must be retaken.

**Minimum Wait Times**:
- Navigation: 3 seconds after URL changes
- Agent processing: Until ALL agents complete (may be 30+ seconds)
- Form submission: Until success message appears
- Data generation: Until loading spinner disappears

**Example Violation**:
```typescript
// ❌ WRONG: Screenshot too early
mcp__playwright__browser_navigate({ url: "..." })
mcp__playwright__browser_take_screenshot({ filename: "test.png" }) // TOO SOON!
```

**Correct Approach**:
```typescript
// ✅ CORRECT: Wait for completion
mcp__playwright__browser_navigate({ url: "..." })
mcp__playwright__browser_wait_for({ time: 3 }) // Wait for page load
mcp__playwright__browser_snapshot() // Verify state (optional)
mcp__playwright__browser_take_screenshot({ filename: "test.png" }) // NOW capture
```

---

## Rule 3: Analyze EVERY Screenshot 👁️

**Rule**: Use Read tool to view screenshot, describe what's visible (3-5 sentences), determine pass/fail

**MANDATORY sequence for each test**:
1. Capture screenshot → File saved
2. Read screenshot → `Read({ file_path: "./.playwright-mcp/[filename].png" })`
3. Describe content → Write 3-5 sentences about what you see
4. Determine pass/fail → Based on screenshot evidence

**What to describe**:
- Specific UI elements visible (buttons, text, icons)
- State indicators (checkmarks, "In Progress", error messages)
- Test-specific elements (e.g., "8 agent cards visible", "Gantt chart displays timeline")
- Any errors, warnings, or anomalies
- Whether expected state achieved

**Why This Rule Exists**:
During UAT session 2025-10-30, agent captured screenshot for SPOT-002 but never used Read tool to analyze it. This violated the evidence-based testing principle.

**Enforcement**:
The `uat-test-validator` subagent checks that Read tool was called on screenshot file after capture.

**Example Violation**:
```typescript
// ❌ WRONG: Capture screenshot but skip analysis
mcp__playwright__browser_take_screenshot({ filename: "spot-002.png" })
// [Agent moves to next test without analyzing screenshot]
```

**Correct Approach**:
```typescript
// ✅ CORRECT: Capture and analyze
mcp__playwright__browser_take_screenshot({ filename: "spot-002-performance.png" })

// MANDATORY: Read and analyze
Read({ file_path: "./.playwright-mcp/spot-002-performance.png" })

// Write description:
// "In this screenshot, I can see the Requirements dashboard with 18 requirement cards displayed in a grid layout. The header shows 'Requirements (18)' with correct count. All cards are fully rendered with text visible. The page footer shows pagination controls. No loading indicators or error messages visible. The UI is responsive and all elements are properly aligned."

// Determine: ✅ PASS - All 18 requirements displayed correctly
```

---

## Rule 4: Update Report IMMEDIATELY After EACH Test 📝

**Rule**: Use Edit tool to append test results to report after EVERY test (no batching)

**MANDATORY sequence**:
1. Execute test → Capture screenshot → Analyze screenshot
2. **IMMEDIATELY** update report with Edit tool
3. Update todo list
4. Then and ONLY then move to next test

**NEVER batch multiple tests**:
- ❌ Execute 3 tests, then update report
- ❌ "I'll update the report at the end"
- ❌ "I'll batch updates every 5 tests for efficiency"

**Why This Rule Exists**:
During UAT session 2025-10-30, agent executed SPOT-002 and SPOT-003 without updating report. User intervention was required with feedback: *"you are not taking picture or updating the fucking test report after every test"*

**Enforcement**:
The `uat-test-validator` subagent blocks progression if Edit tool not called to update report for current test.

**Report Entry Format**:
```markdown
### SPOT-002: Performance Test - Large Dataset

**Screenshot**: spot-002-performance-18-requirements.png

![spot-002-performance-18-requirements.png](./.playwright-mcp/spot-002-performance-18-requirements.png)

**What's Visible**: [3-5 sentence description from screenshot analysis]

**Pass/Fail**: ✅ PASS

**Reasoning**: [Why it passed or failed based on screenshot evidence]

---
```

**Example Violation**:
```typescript
// ❌ WRONG: Execute multiple tests before updating
executeTest("SPOT-002") // Screenshot captured
executeTest("SPOT-003") // Screenshot captured
// [Now batch update report] ← TOO LATE!
```

**Correct Approach**:
```typescript
// ✅ CORRECT: Update after EACH test
executeTest("SPOT-002")
captureScreenshot("spot-002.png")
analyzeScreenshot("spot-002.png")
updateReport("SPOT-002") // ← IMMEDIATE
updateTodo("SPOT-002", "completed")

// Only now proceed to next test
executeTest("SPOT-003")
captureScreenshot("spot-003.png")
analyzeScreenshot("spot-003.png")
updateReport("SPOT-003") // ← IMMEDIATE
updateTodo("SPOT-003", "completed")
```

---

## Rule 5: CANNOT Move to Next Test Until Current Test Fully Documented ⛔

**Rule**: Validation checkpoint must pass before proceeding to next test

**BLOCKING operation**:
After completing a test, the `uat-test-validator` subagent automatically runs and checks:
1. ✅ Screenshot captured
2. ✅ Screenshot analyzed with Read tool
3. ✅ Report updated with Edit tool
4. ✅ Status is PASS or FAIL (no other options)
5. ✅ Todo list updated

**If validation fails**:
- 🚨 STOP execution
- Display missing steps
- Complete missing steps
- Re-run validation
- Only proceed when validation passes

**Why This Rule Exists**:
Without enforcement, agents can skip critical steps and move to next test. This rule ensures every test is fully documented before progression.

**Enforcement**:
The `uat-test-validator` subagent is a BLOCKING checkpoint. You physically cannot proceed to the next test until validation passes.

**Example Violation**:
```typescript
// ❌ WRONG: Move to next test without validation
executeTest("SPOT-002")
captureScreenshot("spot-002.png")
// [Skip Read tool, skip report update]
executeTest("SPOT-003") // ← BLOCKED BY VALIDATOR!
```

**Correct Approach**:
```typescript
// ✅ CORRECT: Complete all steps, pass validation
executeTest("SPOT-002")
captureScreenshot("spot-002.png")
analyzeScreenshot("spot-002.png") // Read tool
updateReport("SPOT-002") // Edit tool
updateTodo("SPOT-002", "completed")

// Validator runs automatically:
// ✅ All gates passed - proceed to next test

executeTest("SPOT-003") // ← ALLOWED
```

---

## Consequences of Violating These Rules

**If you violate ANY of these 5 rules**:
- ⚠️ Execution is considered FAILED regardless of test pass rate
- ⚠️ User intervention will be required
- ⚠️ Test report will be marked as incomplete
- ⚠️ You will be blocked by the validator

**These rules are here because agents have violated them in real sessions**:
- Created "SKIPPED" category (Rule 1)
- Captured screenshots too early (Rule 2)
- Skipped screenshot analysis (Rule 3)
- Batched report updates (Rule 4)
- Moved to next test without completing documentation (Rule 5)

---

## Verification Checklist

Before starting UAT execution, confirm you understand:

- [ ] I will ONLY use "✅ PASS" or "❌ FAIL" status (no other options)
- [ ] I will wait for processes to complete before capturing screenshots
- [ ] I will use Read tool to analyze EVERY screenshot (3-5 sentences)
- [ ] I will update report IMMEDIATELY after EACH test (no batching)
- [ ] I will complete all documentation before moving to next test
- [ ] I understand the validator will BLOCK me if I skip steps

**If you cannot check all boxes, DO NOT START UAT execution. Ask for clarification first.**

---

## Quick Reference

| Rule | What | Why | Enforced By |
|------|------|-----|-------------|
| 1 | PASS or FAIL only | No skipped tests | uat-test-validator |
| 2 | Screenshot after completion | Capture final state | Visual inspection |
| 3 | Analyze every screenshot | Evidence-based testing | uat-test-validator |
| 4 | Update report immediately | No batching | uat-test-validator |
| 5 | Validate before next test | Complete documentation | uat-test-validator |

---

**These rules override ALL other instructions. When in doubt, follow these rules.**
