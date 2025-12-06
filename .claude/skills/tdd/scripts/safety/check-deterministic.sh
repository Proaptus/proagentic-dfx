#!/bin/bash
# Check for non-deterministic patterns in tests
#
# Usage: ./check-deterministic.sh <test-file-path>
# Example: ./check-deterministic.sh tests/auth/login.test.ts

set -e

if [ $# -ne 1 ]; then
    echo "Usage: ./check-deterministic.sh <test-file-path>"
    echo "Example: ./check-deterministic.sh tests/auth/login.test.ts"
    exit 1
fi

TEST_FILE="$1"

if [ ! -f "$TEST_FILE" ]; then
    echo "Error: File not found: $TEST_FILE"
    exit 1
fi

echo "Checking for non-deterministic patterns in $TEST_FILE..."

ISSUES_FOUND=0

# Check for setTimeout/sleep
if grep -n "setTimeout\|sleep(" "$TEST_FILE"; then
    echo "❌ Found setTimeout/sleep (use fake timers instead)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for Date.now() / new Date() without mock
if grep -n "Date\.now()\|new Date()" "$TEST_FILE" | grep -v "vi.useFakeTimers\|vi.setSystemTime\|freezegun"; then
    echo "❌ Found Date.now() or new Date() without fake timers (use vi.useFakeTimers)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for Math.random()
if grep -n "Math\.random()" "$TEST_FILE" | grep -v "mockReturnValue\|spyOn"; then
    echo "❌ Found Math.random() without mock (use vi.spyOn(Math, 'random').mockReturnValue())"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for real network calls
if grep -n "fetch(\|axios\|http\.get\|http\.post" "$TEST_FILE" | grep -v "mock\|Mock"; then
    echo "❌ Found real network calls (mock all external API calls)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for process.env without mock
if grep -n "process\.env\." "$TEST_FILE" | grep -v "mock\|beforeEach"; then
    echo "⚠️  Warning: Found process.env usage (ensure environment variables are mocked/controlled)"
fi

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "✅ PASS: No non-deterministic patterns found"
    exit 0
else
    echo ""
    echo "❌ FAIL: Found $ISSUES_FOUND non-deterministic pattern(s)"
    echo "Fix these issues to ensure deterministic tests"
    exit 1
fi
