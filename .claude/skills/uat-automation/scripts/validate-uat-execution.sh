#!/bin/bash

# UAT Execution Validation Script
# Validates that UAT execution meets all mandatory requirements

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPORT_FILE="./UAT_TEST_REPORT.md"
SCREENSHOTS_DIR="./tests/uat-results"
REQUIRED_TESTS=35  # 25 smoke + 10 spot tests
REQUIRED_SCREENSHOTS=38  # 35 tests + 3 extra for SMOKE-003 (requires 4 screenshots)
MIN_PASS_RATE=80

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0

echo "=================================================="
echo "UAT Execution Validation Script"
echo "=================================================="
echo ""

# Check 1: Report file exists
echo -n "Check 1: Report file exists... "
if [ -f "$REPORT_FILE" ]; then
    echo -e "${GREEN}PASS${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}FAIL${NC} - $REPORT_FILE not found"
    ((CHECKS_FAILED++))
    exit 1
fi

# Check 2: Report contains required number of test entries (35+)
echo -n "Check 2: Report contains 35+ test entries... "
TEST_COUNT=$(grep -c "^### SMOKE-\|^### SPOT-" "$REPORT_FILE" || true)
if [ "$TEST_COUNT" -ge "$REQUIRED_TESTS" ]; then
    echo -e "${GREEN}PASS${NC} (Found $TEST_COUNT tests)"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}FAIL${NC} (Found only $TEST_COUNT tests, expected $REQUIRED_TESTS)"
    ((CHECKS_FAILED++))
fi

# Check 3: Each test has screenshot references (38 total including SMOKE-003's 4 screenshots)
echo -n "Check 3: Screenshot references present... "
SCREENSHOT_LINES=$(grep -c "^\*\*Screenshot" "$REPORT_FILE" || true)
if [ "$SCREENSHOT_LINES" -ge "$REQUIRED_SCREENSHOTS" ]; then
    echo -e "${GREEN}PASS${NC} (Found $SCREENSHOT_LINES screenshot references)"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}FAIL${NC} (Found only $SCREENSHOT_LINES screenshot references, expected $REQUIRED_SCREENSHOTS)"
    ((CHECKS_FAILED++))
fi

# Check 4: Screenshots directory exists
echo -n "Check 4: Screenshots directory exists... "
if [ -d "$SCREENSHOTS_DIR" ]; then
    echo -e "${GREEN}PASS${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}FAIL${NC} - $SCREENSHOTS_DIR not found"
    ((CHECKS_FAILED++))
fi

# Check 5: Screenshot files exist on disk
echo -n "Check 5: Screenshot files exist on disk... "
SCREENSHOT_FILES=$(find "$SCREENSHOTS_DIR" -type f -name "*.png" 2>/dev/null | wc -l)
if [ "$SCREENSHOT_FILES" -ge "$REQUIRED_SCREENSHOTS" ]; then
    echo -e "${GREEN}PASS${NC} (Found $SCREENSHOT_FILES PNG files)"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}WARNING${NC} (Found only $SCREENSHOT_FILES PNG files, expected $REQUIRED_SCREENSHOTS)"
    ((CHECKS_FAILED++))
fi

# Check 6: Each test has "What's Visible" description (38 total including SMOKE-003's 4)
echo -n "Check 6: 'What's Visible' descriptions present... "
DESCRIPTIONS=$(grep -c "^\*\*What's Visible" "$REPORT_FILE" || true)
if [ "$DESCRIPTIONS" -ge "$REQUIRED_SCREENSHOTS" ]; then
    echo -e "${GREEN}PASS${NC} (Found $DESCRIPTIONS descriptions)"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}FAIL${NC} (Found only $DESCRIPTIONS descriptions, expected $REQUIRED_SCREENSHOTS)"
    ((CHECKS_FAILED++))
fi

# Check 7: Each test has Pass/Fail status
echo -n "Check 7: Each test has Pass/Fail status... "
PASS_FAIL=$(grep -c "^\*\*Pass/Fail\*\*:" "$REPORT_FILE" || true)
if [ "$PASS_FAIL" -ge "$REQUIRED_TESTS" ]; then
    echo -e "${GREEN}PASS${NC} (Found $PASS_FAIL pass/fail statuses)"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}FAIL${NC} (Found only $PASS_FAIL pass/fail statuses, expected $REQUIRED_TESTS)"
    ((CHECKS_FAILED++))
fi

# Check 8: Report has no "production ready" or similar unverified claims
echo -n "Check 8: No unverified 'production ready' claims... "
FAKE_CLAIMS=$(grep -i "production ready\|recommended for deployment\|ready for release" "$REPORT_FILE" | wc -l)
if [ "$FAKE_CLAIMS" -eq 0 ]; then
    echo -e "${GREEN}PASS${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}FAIL${NC} (Found $FAKE_CLAIMS unverified claims)"
    ((CHECKS_FAILED++))
fi

# Check 9: Summary section exists with counts
echo -n "Check 9: Summary section exists with counts... "
if grep -q "Total Tests: [0-9]" "$REPORT_FILE" && \
   grep -q "Passed: [0-9]" "$REPORT_FILE" && \
   grep -q "Failed: [0-9]" "$REPORT_FILE"; then
    echo -e "${GREEN}PASS${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}FAIL${NC} (Summary section incomplete)"
    ((CHECKS_FAILED++))
fi

# Check 10: Calculate pass rate and verify threshold
echo -n "Check 10: Pass rate meets or exceeds ${MIN_PASS_RATE}% threshold... "
PASSED_TESTS=$(grep -c "✅ PASS" "$REPORT_FILE" || true)
FAILED_TESTS=$(grep -c "❌ FAIL" "$REPORT_FILE" || true)
TOTAL_COMPLETED=$((PASSED_TESTS + FAILED_TESTS))

if [ "$TOTAL_COMPLETED" -gt 0 ]; then
    PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_COMPLETED))
    if [ "$PASS_RATE" -ge "$MIN_PASS_RATE" ]; then
        echo -e "${GREEN}PASS${NC} (Pass rate: ${PASS_RATE}% - $PASSED_TESTS/$TOTAL_COMPLETED tests passed)"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}WARNING${NC} (Pass rate: ${PASS_RATE}% - below ${MIN_PASS_RATE}% threshold)"
        ((CHECKS_FAILED++))
    fi
else
    echo -e "${RED}FAIL${NC} (No pass/fail statuses found in report)"
    ((CHECKS_FAILED++))
fi

# Check 11: Verify descriptions are detailed (minimum 50 characters)
echo -n "Check 11: Descriptions are detailed (50+ chars)... "
SHORT_DESCRIPTIONS=0
while IFS= read -r line; do
    LENGTH=${#line}
    if [ "$LENGTH" -lt 50 ]; then
        ((SHORT_DESCRIPTIONS++))
    fi
done < <(grep -A1 "^\*\*What's Visible\*\*:" "$REPORT_FILE" | grep -v "^\*\*What's Visible\*\*:" | grep -v "^--$" || true)

if [ "$SHORT_DESCRIPTIONS" -eq 0 ]; then
    echo -e "${GREEN}PASS${NC} (All descriptions are detailed)"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}WARNING${NC} (Found $SHORT_DESCRIPTIONS descriptions shorter than 50 characters)"
    # Not a critical failure, so we'll still count it as passed but warn
    ((CHECKS_PASSED++))
fi

# Check 12: Verify markdown image links are present
echo -n "Check 12: Markdown image links present... "
IMAGE_LINKS=$(grep -c "^!\[.*\](.*\.png)" "$REPORT_FILE" || true)
if [ "$IMAGE_LINKS" -ge "$REQUIRED_SCREENSHOTS" ]; then
    echo -e "${GREEN}PASS${NC} (Found $IMAGE_LINKS image links)"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}FAIL${NC} (Found only $IMAGE_LINKS image links, expected $REQUIRED_SCREENSHOTS)"
    ((CHECKS_FAILED++))
fi

# Final Results
echo ""
echo "=================================================="
echo "Validation Results"
echo "=================================================="
echo ""
echo "Checks Passed: ${GREEN}${CHECKS_PASSED}${NC}"
echo "Checks Failed: ${RED}${CHECKS_FAILED}${NC}"
echo ""

if [ "$CHECKS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}✅ UAT EXECUTION VALID${NC}"
    echo "All mandatory requirements met."
    exit 0
else
    echo -e "${RED}❌ UAT EXECUTION INVALID${NC}"
    echo "Some mandatory requirements not met."
    echo ""
    echo "Common issues:"
    echo "1. Execution stopped before completing all 35 tests"
    echo "2. Screenshots not captured or analyzed for all tests"
    echo "3. Report not updated incrementally after each test"
    echo "4. Descriptions too brief or missing"
    echo "5. Unverified claims present in report"
    echo ""
    echo "Review the failed checks above and re-run UAT execution."
    exit 1
fi
