#!/bin/bash
# Flakiness detection - run tests multiple times
#
# Usage: ./flakiness-check.sh [test-file-or-pattern]
# Default: Run all tests 3 times
# Example: ./flakiness-check.sh tests/auth/login.test.ts

set -e

RUNS=3
TEST_PATTERN="${1:-}"

echo "Running flakiness detection (${RUNS} consecutive runs)..."
if [ -n "$TEST_PATTERN" ]; then
    echo "Test pattern: $TEST_PATTERN"
fi
echo ""

FAILURES=0

for i in $(seq 1 $RUNS); do
    echo "Run ${i}/${RUNS}..."

    if [ -n "$TEST_PATTERN" ]; then
        if npm test -- "$TEST_PATTERN" --silent; then
            echo "  ✅ Run $i passed"
        else
            echo "  ❌ Run $i failed"
            FAILURES=$((FAILURES + 1))
        fi
    else
        if npm test --silent; then
            echo "  ✅ Run $i passed"
        else
            echo "  ❌ Run $i failed"
            FAILURES=$((FAILURES + 1))
        fi
    fi
done

echo ""

if [ $FAILURES -eq 0 ]; then
    echo "✅ PASS: All $RUNS runs passed - No flaky tests detected"
    exit 0
elif [ $FAILURES -eq $RUNS ]; then
    echo "❌ FAIL: All $RUNS runs failed - Tests are broken"
    exit 1
else
    echo "❌ FAIL: $FAILURES out of $RUNS runs failed - FLAKY TESTS DETECTED"
    echo ""
    echo "Flaky tests are non-deterministic. Common causes:"
    echo "  - Real time dependencies (use fake timers)"
    echo "  - Real network calls (mock external APIs)"
    echo "  - Math.random() without seeding"
    echo "  - Race conditions in async code"
    echo "  - Shared state between tests"
    echo ""
    echo "Run: ./scripts/safety/check-deterministic.sh <test-file>"
    exit 1
fi
