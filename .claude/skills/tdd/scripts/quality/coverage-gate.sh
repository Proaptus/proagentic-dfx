#!/bin/bash
# Coverage threshold gate for TDD workflow
#
# Usage: ./coverage-gate.sh [threshold]
# Default threshold: 80%
# Example: ./coverage-gate.sh 85

set -e

THRESHOLD=${1:-80}

echo "Running coverage check (threshold: ${THRESHOLD}%)..."

# Run tests with coverage
npm test -- --coverage --silent 2>&1 | tee coverage-output.txt

# Extract coverage percentage (works with Vitest and Jest)
if grep -q "All files" coverage-output.txt; then
    # Vitest format
    COVERAGE=$(grep "All files" coverage-output.txt | awk '{print $4}' | tr -d '%')
elif grep -q "Statements" coverage-output.txt; then
    # Jest format
    COVERAGE=$(grep "All files" coverage-output.txt | awk '{print $2}' | tr -d '%')
else
    echo "⚠️  Warning: Could not parse coverage output"
    COVERAGE=0
fi

echo ""
echo "Coverage: ${COVERAGE}%"
echo "Threshold: ${THRESHOLD}%"

# Compare coverage to threshold
if (( $(echo "$COVERAGE >= $THRESHOLD" | bc -l) )); then
    echo "✅ PASS: Coverage ${COVERAGE}% meets threshold of ${THRESHOLD}%"
    rm -f coverage-output.txt
    exit 0
else
    echo "❌ FAIL: Coverage ${COVERAGE}% below threshold of ${THRESHOLD}%"
    echo ""
    echo "Generate detailed report: npm test -- --coverage"
    rm -f coverage-output.txt
    exit 1
fi
