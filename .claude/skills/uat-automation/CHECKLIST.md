# UAT Automation - Completion Checklist

## Pre-Execution Checklist

Before starting UAT smoke tests, verify:

### Environment Setup
- [ ] ProAgentic frontend running on http://localhost:5173
- [ ] ProAgentic backend running on http://localhost:8080
- [ ] Backend health check passing: `curl http://localhost:8080/api/health`
- [ ] Database accessible and seeded with test data
- [ ] Screenshots directory exists: `./tests/uat-results/`
- [ ] No unfinished tests from previous run

### Browser & System
- [ ] Playwright MCP available and functional
- [ ] Browser cache cleared
- [ ] No browser extensions interfering
- [ ] Screen resolution suitable for testing
- [ ] System has sufficient disk space for screenshots

### Documentation Review
- [ ] Read UAT_SMOKE_TEST_SPECIFICATION.md
- [ ] Reviewed all 25 test cases
- [ ] Understood expected results for each test
- [ ] Know success criteria (23+ tests = PASS)

---

## Execution Checklist

### Phase 1: Homepage & Initial Setup (3 tests)
- [ ] SMOKE-001: Homepage loads
  - [ ] Logo visible
  - [ ] Create Project button visible
  - [ ] Template grid shows 8+ cards
  - [ ] Screenshot captured
- [ ] SMOKE-002: Template launches
  - [ ] Cloud Migration Initiative template loads
  - [ ] Project title visible
  - [ ] Agent sidebar displays
  - [ ] Screenshot captured
- [ ] SMOKE-003: Swarm Mode enabled
  - [ ] Toggle switches to ON
  - [ ] "Swarm Mode: ON" with 🐝 visible
  - [ ] Screenshot captured

### Phase 2: Swarm Mode Processing (2 tests)
- [ ] SMOKE-004: Agents generate
  - [ ] Generate Requirements button clicked
  - [ ] All 8 agents process
  - [ ] Progress indicator shows completion
  - [ ] Checkmarks appear for all agents
  - [ ] Screenshot captured
- [ ] SMOKE-005: Parallel processing verified
  - [ ] Multiple agents show "In Progress"
  - [ ] SSE connection active
  - [ ] No blocking between agents
  - [ ] Screenshot captured

### Phase 3: Key Dashboards (3 tests)
- [ ] SMOKE-006: Requirements dashboard
  - [ ] Dashboard loads
  - [ ] Requirements section visible
  - [ ] Count badges show numbers
  - [ ] Metrics/analytics visible
  - [ ] Screenshot captured
- [ ] SMOKE-007: Scope dashboard
  - [ ] Dashboard loads
  - [ ] In-scope items listed
  - [ ] Out-of-scope items listed
  - [ ] Dependencies section visible
  - [ ] Screenshot captured
- [ ] SMOKE-008: Schedule dashboard
  - [ ] Dashboard loads
  - [ ] Timeline/Gantt chart visible
  - [ ] Milestones listed
  - [ ] Duration estimates shown
  - [ ] Screenshot captured

### Phase 4: Agent Mode (2 tests)
- [ ] SMOKE-009: Agent Mode enabled
  - [ ] Toggle switches to ON
  - [ ] Chat interface appears
  - [ ] Agent list visible
  - [ ] Screenshot captured
- [ ] SMOKE-010: Agent command sent
  - [ ] Command typed in chat
  - [ ] Message sent indicator appears
  - [ ] Agent processes command
  - [ ] Response appears in chat
  - [ ] Screenshot captured

### Phase 5: Agile Mode (3 tests)
- [ ] SMOKE-011: Agile Mode enabled
  - [ ] Toggle switches to ON
  - [ ] Sprint/epic views appear
  - [ ] Velocity charts visible
  - [ ] Screenshot captured
- [ ] SMOKE-012: Sprint Board viewed
  - [ ] Board loads
  - [ ] Kanban columns visible (To Do, In Progress, Done)
  - [ ] User stories display as cards
  - [ ] Screenshot captured
- [ ] SMOKE-013: Epic Timeline viewed
  - [ ] Timeline loads
  - [ ] Releases/epics visible
  - [ ] Timeline spans multiple months
  - [ ] Screenshot captured

### Phase 6: Inline Editing (2 tests)
- [ ] SMOKE-014: Requirement edited
  - [ ] Edit mode activated
  - [ ] Text becomes editable
  - [ ] Changes saved successfully
  - [ ] Success toast appears
  - [ ] Screenshot captured
- [ ] SMOKE-015: Requirement added
  - [ ] Add button clicked
  - [ ] Input field appears
  - [ ] Text entered and saved
  - [ ] New item added to list
  - [ ] Count badge updated
  - [ ] Screenshot captured

### Phase 7: Project Management (3 tests)
- [ ] SMOKE-016: Project saved
  - [ ] Save dialog appears
  - [ ] Project name entered
  - [ ] Save successful
  - [ ] Success message displayed
  - [ ] Screenshot captured
- [ ] SMOKE-017: Project exported
  - [ ] Export menu appears
  - [ ] JSON format selected
  - [ ] File downloaded
  - [ ] Success notification shown
  - [ ] Screenshot captured
- [ ] SMOKE-018: Recent project loaded
  - [ ] Return to homepage
  - [ ] Recent project visible
  - [ ] Project loads successfully
  - [ ] All data preserved
  - [ ] Screenshot captured

### Phase 8: Charter Upload (2 tests)
- [ ] SMOKE-019: Charter uploaded
  - [ ] Upload dialog opens
  - [ ] File selected
  - [ ] Upload progress shows
  - [ ] Success message appears
  - [ ] Screenshot captured
- [ ] SMOKE-020: Project generated from charter
  - [ ] Generation starts
  - [ ] AI processes content
  - [ ] Project generates with data
  - [ ] Workflow page loads
  - [ ] Screenshot captured

### Phase 9: Data Synchronization (2 tests)
- [ ] SMOKE-021: Auto-save works
  - [ ] Edit made in dashboard
  - [ ] Wait 5 seconds
  - [ ] Page refreshed
  - [ ] Changes persist
  - [ ] No data loss
  - [ ] Screenshot captured
- [ ] SMOKE-022: Cross-tab sync works
  - [ ] Project open in 2 tabs
  - [ ] Edit in Tab 1
  - [ ] Switch to Tab 2
  - [ ] Change appears in Tab 2
  - [ ] Consistent state maintained
  - [ ] Screenshot captured

### Phase 10: AI Report Generation (2 tests)
- [ ] SMOKE-023: Executive Summary generated
  - [ ] AI Reports tab clicked
  - [ ] Generation starts
  - [ ] Summary document creates
  - [ ] Key metrics included
  - [ ] Download option appears
  - [ ] Screenshot captured
- [ ] SMOKE-024: Risk Report generated
  - [ ] Risk Analysis clicked
  - [ ] AI processing begins
  - [ ] Risk matrix displays
  - [ ] Mitigation strategies included
  - [ ] Export options available
  - [ ] Screenshot captured

### Validation & Closure (1 test)
- [ ] SMOKE-025: Final validation
  - [ ] All major sections accessible
  - [ ] No console errors
  - [ ] Data integrity verified
  - [ ] Project complete and consistent
  - [ ] Screenshot captured

---

## Post-Execution Checklist

### Test Results Verification
- [ ] All 25 tests executed
- [ ] Each test has corresponding screenshot
- [ ] Screenshots are PNG format
- [ ] Filenames follow convention: `[phase]-SMOKE-[num]-[name].png`
- [ ] All screenshots capture relevant UI elements

### Screenshot Quality Review
- [ ] Logo/title visible in Phase 1 screenshots
- [ ] Agent processing visible in Phase 2 screenshots
- [ ] Dashboard content visible in Phase 3 screenshots
- [ ] Mode indicators visible in mode tests
- [ ] Form content visible in editing tests
- [ ] No critical errors in any screenshot

### Test Results Analysis
- [ ] Count passed tests (SMOKE-001 through SMOKE-025)
- [ ] Count failed tests (if any)
- [ ] Calculate pass rate: (passed / 25) × 100
- [ ] Verify against success criteria:
  - [ ] 23+ tests passed = PASS ✅
  - [ ] 20-22 tests passed = CONDITIONAL PASS ⚠️
  - [ ] <20 tests passed = FAIL ❌

### Report Generation
- [ ] UAT report created with:
  - [ ] Execution date and time
  - [ ] Environment details (localhost:5173, localhost:8080)
  - [ ] Total execution duration
  - [ ] Summary: Total/Passed/Failed counts
  - [ ] Pass rate percentage
  - [ ] Detailed results for each test
  - [ ] Phase-by-phase breakdown
  - [ ] All 25 screenshots embedded or linked
  - [ ] Failed test analysis (if any)
  - [ ] Recommendations for issues found

### Cleanup & Documentation
- [ ] Screenshots organized in proper directory
- [ ] Report saved with date in filename
- [ ] UAT results documented for team
- [ ] Any failures analyzed and documented
- [ ] Known issues noted for follow-up
- [ ] Test execution notes recorded

### Success Criteria Verification
- [ ] Pass rate meets or exceeds 80% ✅
- [ ] All critical tests (P0) passed
- [ ] No blocking issues identified
- [ ] System ready for production deployment
- [ ] Report ready for stakeholders

---

## Troubleshooting Checklist

If tests fail, verify:

### Browser & Navigation Issues
- [ ] Page loaded completely (wait 3+ seconds)
- [ ] Correct URL navigated to
- [ ] No browser console errors
- [ ] Element exists on page
- [ ] Element is visible (not hidden/overflow)
- [ ] Element is clickable (not disabled)

### Element Selection Issues
- [ ] Using JavaScript evaluation instead of ref
- [ ] Correct selectors for element type
- [ ] Element text matches expected
- [ ] Multiple elements with same text handled
- [ ] Wait time sufficient after interaction

### State & Data Issues
- [ ] Project data loaded from database
- [ ] Previous tests' data not interfering
- [ ] State persists across navigation
- [ ] No race conditions in async operations
- [ ] Sufficient wait time for async processes

### Screenshot Issues
- [ ] Viewport size appropriate
- [ ] Screenshot captures full content
- [ ] Filename matches test ID
- [ ] Directory exists for screenshots
- [ ] Disk space available
- [ ] File permissions correct

### Execution Flow Issues
- [ ] Tests execute in correct order
- [ ] No skipped tests
- [ ] Progress tracked in TodoWrite
- [ ] Each test has screenshot
- [ ] Status updated after each test
- [ ] No premature termination

---

## Quality Assurance Checklist

### Code Quality
- [ ] All test code follows patterns in USAGE_EXAMPLES.md
- [ ] JavaScript evaluation functions return boolean
- [ ] Wait times appropriate for operations
- [ ] Error handling in place
- [ ] No hardcoded delays except necessary waits

### Documentation Quality
- [ ] Test names match specification
- [ ] Expected results match spec
- [ ] Screenshots clearly show test outcome
- [ ] Issues documented with details
- [ ] Recommendations provided for failures

### Reporting Quality
- [ ] Report is comprehensive and clear
- [ ] Pass rate clearly stated
- [ ] Failed tests clearly identified
- [ ] Screenshots organized logically
- [ ] Issues prioritized by severity
- [ ] Recommendations actionable

---

## Sign-Off Checklist

When UAT execution complete, verify:

- [ ] All 25 tests executed
- [ ] All tests have screenshots
- [ ] Pass rate calculated and verified
- [ ] Report generated and reviewed
- [ ] Issues documented and categorized
- [ ] Screenshots organized and accessible
- [ ] Team notified of results
- [ ] Failed tests scheduled for investigation
- [ ] UAT artifacts archived
- [ ] Next steps identified

**UAT Status**: [ ] PASS | [ ] CONDITIONAL PASS | [ ] FAIL

**Pass Rate**: _____ % (Target: 80%+)

**Total Tests**: 25
**Passed**: _____
**Failed**: _____

**Sign-Off Date**: _________
**Executed By**: _________
**Reviewed By**: _________

---

## Notes Section

Use this space to document observations, issues, and recommendations:

```
Issues Encountered:
[Document any test failures or unusual behavior]

Recommendations:
[Suggestions for improvements or follow-up actions]

Additional Notes:
[Any other observations]
```
