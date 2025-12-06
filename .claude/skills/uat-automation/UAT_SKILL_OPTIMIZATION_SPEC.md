# UAT Automation Skill - Optimization Specification

## Date: 2025-10-30

## Optimization Goal

Transform the UAT Automation Skill to enforce thorough, evidence-based testing with **zero tolerance for shortcuts, early stops, or unverified claims**. Every test must have a screenshot, every screenshot must be analyzed, and every result must be documented incrementally.

## Current State Analysis

### Existing Strengths
- 25-test smoke test structure across 10 phases
- Playwright MCP integration for browser automation
- Screenshot capture workflow
- Todo-based progress tracking
- Comprehensive checklist

### Critical Gaps Identified

| Gap ID | Issue | Impact | User Requirement |
|--------|-------|--------|------------------|
| GAP-01 | Only 25 tests specified | Incomplete coverage | 25 smoke tests + 10 spot tests = **35 tests minimum** |
| GAP-02 | Screenshot capture without analysis | No verification | **Analyze each screenshot** - describe what's visible and determine pass/fail |
| GAP-03 | Report generated at end | No incremental validation | **Update report after EACH test** - no batching |
| GAP-04 | No wait-for-completion mandate | Premature screenshots | **Wait for processes to fully complete** before screenshots |
| GAP-05 | Weak continuous execution | Risk of early stops | **Complete ALL tests** - no stopping early, no token excuses |
| GAP-06 | Production-ready claims in template | Unverified assertions | **No fake claims** - only factual screenshot + description + pass/fail |
| GAP-07 | Executive summaries in report | Dilutes evidence | **Report = 35+ pictures** with descriptions and pass/fail only |

## Detailed Requirements (User-Specified)

### 1. Test Coverage Requirements

**Mandatory Test Count**: 35+ tests
- **25 smoke tests** (existing structure across 10 phases)
- **10 spot tests** (new requirement - targeted validation tests)

**Spot Test Definition**:
Spot tests are focused, targeted tests that validate specific functionality or edge cases not covered by smoke tests. Examples:
- Error handling and recovery
- Boundary conditions
- Performance under load
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility validation

**Enforcement Rule**:
- TodoWrite must list all 35+ tests at start
- Each test must be marked "completed" before moving to next
- NO skipping tests
- NO batching test execution

### 2. Screenshot Analysis Requirements

**For EVERY test, the following steps are MANDATORY**:

1. **Wait for Process Completion**:
   - If test involves navigation: wait minimum 3 seconds
   - If test involves agent processing: wait until ALL agents show "Complete" status
   - If test involves data generation: wait until generation indicator disappears
   - If test involves form submission: wait for success message
   - **NEVER take screenshot during transition or loading state**

2. **Capture Screenshot**:
   - Use `mcp__playwright__browser_take_screenshot()` with descriptive filename
   - Format: `[phase]-SMOKE-[number]-[test-name].png` or `SPOT-[number]-[test-name].png`
   - Must be PNG format
   - Must capture relevant viewport (not cropped)

3. **Analyze Screenshot Content**:
   - **MANDATORY**: Use `Read` tool to view the captured screenshot
   - **MANDATORY**: Describe what is visible in the screenshot
   - **MANDATORY**: Verify test-specific elements are present
   - **MANDATORY**: Check for error messages or warnings
   - **MANDATORY**: Determine pass/fail based on expected vs actual

4. **Document Analysis**:
   - Write analysis to report immediately (no batching)
   - Include:
     - Test ID and name
     - Screenshot filename with markdown link
     - **Detailed description of what's visible** (3-5 sentences minimum)
     - **Pass/Fail determination** with reasoning
     - Any anomalies or issues observed

**Example Analysis Format**:
```markdown
#### SMOKE-004: Generate All Agents in Swarm

**Screenshot**: `02-SMOKE-004-agents-processing.png`

![02-SMOKE-004-agents-processing.png](02-SMOKE-004-agents-processing.png)

**What's Visible**:
In this screenshot, I can see the ProAgentic workflow page with the agent sidebar on the left showing 8 agents. All agents display green checkmarks indicating completion. The main content area shows the Requirements dashboard populated with data. The top navigation bar displays "Cloud Migration Initiative" as the project title. The swarm mode indicator in the top right shows "🐝 Swarm Mode: ON". No error messages are visible in the interface.

**Expected Elements**:
- ✅ All 8 agents showing checkmarks (Requirements, Scope, Schedule, Risk, Resources, APDA, Quality, Recommendations)
- ✅ Dashboard content populated (not empty)
- ✅ Swarm mode indicator active
- ✅ No console errors visible

**Pass/Fail**: ✅ PASS

**Reasoning**: All expected elements are present and functional. Agent processing completed successfully and data populated correctly.
```

### 3. Incremental Report Updates

**CRITICAL RULE**: Update the UAT report document after EVERY SINGLE test.

**Workflow**:
```
1. Execute test
2. Wait for process completion
3. Capture screenshot
4. Read screenshot and analyze
5. **UPDATE REPORT IMMEDIATELY** ← MANDATORY
6. Mark todo as completed
7. Move to next test
```

**Report Update Process**:
- Use `Edit` tool to append test results to report file
- Add test entry with screenshot link and analysis
- Update summary counts (total passed, total failed)
- Do NOT wait to update report at end
- Report must be continuously updated state document

**Why This Matters**:
If execution stops or times out, the report contains all completed tests up to that point. No work is lost.

### 4. No Early Stops - Zero Tolerance Policy

**ABSOLUTE RULES**:
1. **NEVER stop execution before all 35+ tests complete**
2. **NEVER use "token limit" as reason to stop** - user is on max plan
3. **NEVER use "time limit" as reason to stop** - user expects full execution
4. **NEVER skip tests** - if a test fails, mark FAILED and continue
5. **NEVER batch screenshots** - take and analyze each one individually

**What to Do If**:
- **Test fails**: Retry once. If still fails, mark FAILED, document reason, continue to next test
- **Page doesn't load**: Wait additional time (up to 10s), check console errors, document issue, mark FAILED if unrecoverable, continue
- **Element not found**: Try alternative selectors, use JavaScript evaluation, document if element truly missing, mark FAILED if critical, continue
- **Timeout occurs**: Increase wait time, retry navigation, document if persistent, mark FAILED if blocking, continue

**Forbidden Behaviors**:
- ❌ "I've completed X tests, that should be sufficient" - **NO, complete all 35+**
- ❌ "Token limit approaching, stopping early" - **NO, user has max plan**
- ❌ "Most tests passed, stopping to save time" - **NO, complete all tests**
- ❌ "Taking screenshots without analyzing them" - **NO, analyze each one**
- ❌ "Batching report updates for efficiency" - **NO, update after each test**

### 5. Factual Reporting Only

**PROHIBITED Content in Reports**:
- ❌ "Production ready" claims
- ❌ "Recommended for deployment" statements
- ❌ Executive summaries without evidence
- ❌ Quality assessments without data
- ❌ "All functionality working as expected" without proof
- ❌ Conclusions that extrapolate beyond tested scope

**REQUIRED Content in Reports**:
- ✅ Screenshot for each test
- ✅ Detailed description of what's visible in screenshot
- ✅ Pass/Fail status for each test
- ✅ Summary counts (X passed, Y failed, Z total)
- ✅ Factual observations only
- ✅ Issues documented with evidence (screenshots of errors)

**Report Structure** (User-Specified):
```markdown
# ProAgentic UAT Test Report

**Execution Date**: [Date/Time]
**Environment**: [localhost:5173 / localhost:8080]
**Total Tests**: 35
**Passed**: X
**Failed**: Y
**Pass Rate**: Z%

---

## Test Results

[FOR EACH TEST: 35+ entries exactly like this format]

### SMOKE-001: Homepage Loads Successfully

**Screenshot**: 01-SMOKE-001-homepage-loads.png

![01-SMOKE-001-homepage-loads.png](01-SMOKE-001-homepage-loads.png)

**What's Visible**: [3-5 sentences describing exactly what you see in the screenshot]

**Pass/Fail**: ✅ PASS or ❌ FAIL

**Reasoning**: [Why it passed or failed based on screenshot evidence]

---

[Repeat for all 35 tests]

---

## Summary

Total Tests: 35
Passed: X
Failed: Y
Pass Rate: Z%

[END OF REPORT - No recommendations, no production claims, no executive summary]
```

### 6. Spot Test Specifications

**10 Spot Tests Required** (in addition to 25 smoke tests):

1. **SPOT-01: Error Handling - Invalid Project Data**
   - Expected: Graceful error message, no crash

2. **SPOT-02: Performance - Large Dataset (100+ requirements)**
   - Expected: UI remains responsive, no timeout

3. **SPOT-03: Accessibility - Keyboard Navigation**
   - Expected: All interactive elements reachable via keyboard

4. **SPOT-04: Mobile Responsiveness - Dashboard on Small Screen**
   - Expected: Layout adapts correctly to 375px width

5. **SPOT-05: Concurrent Users - Multiple Tabs Editing**
   - Expected: No data loss, conflict resolution working

6. **SPOT-06: Network Failure - Offline Mode**
   - Expected: Appropriate offline indicator, no data loss on reconnect

7. **SPOT-07: Browser Compatibility - Console Errors Check**
   - Expected: No critical errors in browser console

8. **SPOT-08: Data Persistence - Page Reload After Edit**
   - Expected: Changes persist after hard refresh

9. **SPOT-09: Agent Failure Recovery - One Agent Fails**
   - Expected: Other agents continue, error shown for failed agent

10. **SPOT-10: Export Validation - JSON Schema Check**
    - Expected: Exported JSON contains all required fields

## Implementation Plan

### Phase 1: Update SKILL.md

**Changes Required**:
1. Update description: "Executes 35+ tests (25 smoke + 10 spot)"
2. Add "Screenshot Analysis Mandate" section with strict requirements
3. Add "Incremental Reporting Mandate" section
4. Add "Zero Tolerance for Early Stops" section
5. Add "Spot Test Specifications" section with 10 tests
6. Strengthen "Test Execution Rules" with absolute language
7. Add "Forbidden Behaviors" section
8. Remove any "production ready" language

### Phase 2: Update README.md

**Changes Required**:
1. Document 35-test suite structure (25 smoke + 10 spot)
2. Add "Screenshot Analysis Protocol" section
3. Add "Incremental Report Updates" workflow
4. Update "Handling Test Failures" to emphasize continuation
5. Add "Spot Test Execution" section
6. Update troubleshooting to address common stop-early scenarios

### Phase 3: Update UAT_REPORT.md Template

**Changes Required**:
1. Remove "Executive Summary" section
2. Remove "Recommendations" section
3. Remove "Ready for Production" language
4. Remove "Sign-Off" section
5. Simplify to: Summary stats + 35 test entries + final summary
6. Update template to enforce screenshot + description + pass/fail format
7. Add placeholder entries for all 35 tests

### Phase 4: Create Validation Script

**New File**: `scripts/validate-uat-execution.sh`

**Purpose**: Validate UAT execution meets all requirements

**Checks**:
- [ ] Exactly 35+ test entries in report
- [ ] Each test has screenshot file
- [ ] Each screenshot file exists on disk
- [ ] Each test has "What's Visible" description (3+ sentences)
- [ ] Each test has Pass/Fail status
- [ ] Report updated incrementally (check file modification times)
- [ ] No "production ready" language in report
- [ ] Summary counts match actual test count

### Phase 5: Update CHECKLIST.md

**Changes Required**:
1. Add spot test entries (SPOT-01 through SPOT-10)
2. Add "Screenshot Analysis" checkbox for each test
3. Add "Report Updated" checkbox for each test
4. Add "No Early Stops" verification section
5. Update success criteria: 28+ of 35 tests = PASS (80%)

## Success Criteria for This Optimization

The UAT skill optimization is successful when:

1. ✅ Skill description specifies 35+ tests (25 smoke + 10 spot)
2. ✅ SKILL.md enforces screenshot analysis for every test
3. ✅ SKILL.md enforces incremental report updates
4. ✅ SKILL.md prohibits early stops with absolute language
5. ✅ Report template contains only: screenshots + descriptions + pass/fail
6. ✅ Validation script exists and checks all requirements
7. ✅ Documentation updated with new 35-test workflow
8. ✅ Spot test specifications documented
9. ✅ All "production ready" language removed
10. ✅ Enforcement rules use mandatory language ("MUST", "NEVER", "ABSOLUTE")

## User Satisfaction Criteria

User will be satisfied when UAT skill execution:
- Completes all 35+ tests without stopping
- Updates report after each test
- Analyzes each screenshot with detailed description
- Links all 35+ pictures in final report
- Contains only factual observations (no fake claims)
- Does not use "token limit" or "time limit" as excuse to stop

## Risk Mitigation

**Risk**: Skill might still stop early despite optimization
**Mitigation**: Add "CRITICAL ENFORCEMENT" section to SKILL.md with absolute rules that override any defaults

**Risk**: Claude might interpret "production ready" removal as no conclusions allowed
**Mitigation**: Clarify that factual summaries (X passed, Y failed) are allowed, just not extrapolated claims

**Risk**: Incremental report updates might conflict with markdown formatting
**Mitigation**: Use `Edit` tool with old_string/new_string to append entries safely

## Next Steps

1. Generate patches for all affected files
2. Review patches for completeness
3. Apply patches to skill files
4. Create validation script
5. Test updated skill with sample UAT execution
6. Document changes in optimization report

---

**Optimization Specification Complete**
**Ready for Patch Generation**
