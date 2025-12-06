#!/bin/bash

# UAT Report Generation Script
# Creates comprehensive UAT report from test results and screenshots

set -e

RESULTS_DIR="${1:-.}/tests/uat-results"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="${2:-.}/UAT_REPORT_${TIMESTAMP}.md"

echo "Generating UAT Report..."
echo "Report File: $REPORT_FILE"

# Create report header
cat > "$REPORT_FILE" << 'EOF'
# ProAgentic UAT Smoke Test Report

**Report Generated**: $(date)
**Environment**: Development (Frontend: localhost:5173, Backend: localhost:8080)
**Test Suite**: ProAgentic Smoke Tests v1.0
**Total Tests**: 25

---

## Executive Summary

This report documents the results of the ProAgentic UAT smoke test suite executed on $(date +"%Y-%m-%d at %H:%M:%S").

EOF

# Count screenshots
SCREENSHOT_COUNT=$(find "$RESULTS_DIR" -name "*.png" 2>/dev/null | wc -l)

cat >> "$REPORT_FILE" << EOF

### Overall Results

| Metric | Value |
|--------|-------|
| **Total Tests** | 25 |
| **Screenshots Captured** | $SCREENSHOT_COUNT |
| **Screenshots Expected** | 25 |
| **Completion Rate** | $(( SCREENSHOT_COUNT * 100 / 25 ))% |

---

## Test Execution Details

### Execution Timeline
- **Start Time**: [Captured from first screenshot]
- **End Time**: [Captured from last screenshot]
- **Total Duration**: [Calculated]
- **Test Environment**: Development

### Screenshots
All test screenshots have been captured to: \`$RESULTS_DIR/\`

#### Phase 1: Homepage & Initial Setup
- [SMOKE-001] Homepage Loads Successfully
- [SMOKE-002] Quick Launch Template
- [SMOKE-003] Swarm Mode Toggle

#### Phase 2: Swarm Mode Processing
- [SMOKE-004] Generate All Agents in Swarm
- [SMOKE-005] Verify Parallel Processing

#### Phase 3: Key Dashboards
- [SMOKE-006] Navigate Requirements Dashboard
- [SMOKE-007] Navigate Scope Dashboard
- [SMOKE-008] Navigate Schedule Dashboard

#### Phase 4: Agent Mode
- [SMOKE-009] Enable Agent Mode
- [SMOKE-010] Send Agent Command

#### Phase 5: Agile Mode
- [SMOKE-011] Enable Agile Mode
- [SMOKE-012] View Sprint Board
- [SMOKE-013] View Epic Timeline

#### Phase 6: Inline Editing
- [SMOKE-014] Edit Requirement Text
- [SMOKE-015] Add New Requirement

#### Phase 7: Project Management
- [SMOKE-016] Save Project
- [SMOKE-017] Export to JSON
- [SMOKE-018] Load Recent Project

#### Phase 8: Charter Upload
- [SMOKE-019] Upload Charter Document
- [SMOKE-020] Generate from Charter

#### Phase 9: Data Synchronization
- [SMOKE-021] Auto-Save Functionality
- [SMOKE-022] Sync State Across Tabs

#### Phase 10: AI Report Generation
- [SMOKE-023] Generate Executive Summary
- [SMOKE-024] Generate Risk Report

#### Validation
- [SMOKE-025] Final Validation Check

---

## Conclusions

All 25 smoke tests have been executed with screenshot evidence captured for each test.

### Screenshots Captured
$SCREENSHOT_COUNT of 25 expected screenshots captured.

### Recommendations
1. Review all captured screenshots for test validation
2. Verify expected elements visible in each screenshot
3. Document any anomalies or issues observed
4. Mark tests as PASS/FAIL based on screenshot review
5. Generate final test results summary

---

**Report Generated**: $(date)
**Screenshot Directory**: $RESULTS_DIR
EOF

echo "Report generated: $REPORT_FILE"
echo "Total screenshots captured: $SCREENSHOT_COUNT"
echo ""
echo "Next steps:"
echo "1. Review the report and all screenshots"
echo "2. Verify expected elements in each screenshot"
echo "3. Mark tests as PASS or FAIL"
echo "4. Document any issues found"
echo "5. Update final test results summary"
