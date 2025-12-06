#!/bin/bash

# UAT Screenshot Validation Script
# Validates all screenshot files from UAT execution
# Checks for: proper format, naming convention, file size, integrity

set -e

SCREENSHOT_DIR="${1:-.}/tests/uat-results"
REPORT_FILE="${2:-.}/UAT_SCREENSHOT_VALIDATION.txt"

echo "UAT Screenshot Validation Report"
echo "=================================="
echo "Generated: $(date)"
echo "Screenshot Directory: $SCREENSHOT_DIR"
echo ""

# Check if directory exists
if [ ! -d "$SCREENSHOT_DIR" ]; then
    echo "ERROR: Screenshot directory not found: $SCREENSHOT_DIR"
    exit 1
fi

# Initialize counters
TOTAL=0
VALID=0
INVALID=0
MISSING=0

# Expected test IDs
EXPECTED_TESTS=(
    "01-SMOKE-001" "01-SMOKE-002" "01-SMOKE-003"
    "02-SMOKE-004" "02-SMOKE-005"
    "03-SMOKE-006" "03-SMOKE-007" "03-SMOKE-008"
    "04-SMOKE-009" "04-SMOKE-010"
    "05-SMOKE-011" "05-SMOKE-012" "05-SMOKE-013"
    "06-SMOKE-014" "06-SMOKE-015"
    "07-SMOKE-016" "07-SMOKE-017" "07-SMOKE-018"
    "08-SMOKE-019" "08-SMOKE-020"
    "09-SMOKE-021" "09-SMOKE-022"
    "10-SMOKE-023" "10-SMOKE-024" "10-SMOKE-025"
)

echo "Validating screenshots..."
echo ""

for test_id in "${EXPECTED_TESTS[@]}"; do
    TOTAL=$((TOTAL + 1))
    
    # Find screenshot matching this test ID
    SCREENSHOT=$(find "$SCREENSHOT_DIR" -name "*$test_id*.png" 2>/dev/null | head -n 1)
    
    if [ -z "$SCREENSHOT" ]; then
        echo "❌ MISSING: $test_id - No screenshot found"
        MISSING=$((MISSING + 1))
        INVALID=$((INVALID + 1))
        continue
    fi
    
    # Check if file exists and is readable
    if [ ! -f "$SCREENSHOT" ] || [ ! -r "$SCREENSHOT" ]; then
        echo "❌ INVALID: $test_id - File not readable"
        INVALID=$((INVALID + 1))
        continue
    fi
    
    # Check file size (should be > 1KB)
    FILE_SIZE=$(stat -f%z "$SCREENSHOT" 2>/dev/null || stat -c%s "$SCREENSHOT" 2>/dev/null)
    if [ "$FILE_SIZE" -lt 1024 ]; then
        echo "❌ INVALID: $test_id - File too small ($FILE_SIZE bytes)"
        INVALID=$((INVALID + 1))
        continue
    fi
    
    # Check if it's a valid PNG
    if ! file "$SCREENSHOT" | grep -q "PNG image"; then
        echo "❌ INVALID: $test_id - Not a valid PNG file"
        INVALID=$((INVALID + 1))
        continue
    fi
    
    # All checks passed
    echo "✅ VALID: $test_id - $SCREENSHOT ($(numfmt --to=iec $FILE_SIZE 2>/dev/null || echo $FILE_SIZE' bytes'))"
    VALID=$((VALID + 1))
done

echo ""
echo "Summary"
echo "======="
echo "Total Tests: $TOTAL"
echo "Valid Screenshots: $VALID"
echo "Missing Screenshots: $MISSING"
echo "Invalid Screenshots: $INVALID"
echo "Validation Rate: $(( VALID * 100 / TOTAL ))%"
echo ""

# Determine validation status
if [ $VALID -eq $TOTAL ]; then
    echo "✅ ALL SCREENSHOTS VALIDATED SUCCESSFULLY"
    exit 0
elif [ $VALID -ge 23 ]; then
    echo "⚠️  CONDITIONAL VALIDATION: $VALID/$TOTAL screenshots valid (80%+ threshold met)"
    exit 0
else
    echo "❌ VALIDATION FAILED: Only $VALID/$TOTAL screenshots valid"
    exit 1
fi
