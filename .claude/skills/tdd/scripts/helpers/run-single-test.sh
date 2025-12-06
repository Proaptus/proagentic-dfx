#!/bin/bash
# Fast single-test execution (Claude Code pattern)
#
# Usage: ./run-single-test.sh <test-file> [test-name]
# Example: ./run-single-test.sh tests/auth.test.ts "should refresh token"
# Example: ./run-single-test.sh tests/auth.test.ts

set -e

if [ $# -lt 1 ]; then
    echo "Usage: ./run-single-test.sh <test-file> [test-name]"
    echo ""
    echo "Examples:"
    echo "  ./run-single-test.sh tests/auth.test.ts"
    echo "  ./run-single-test.sh tests/auth.test.ts \"should refresh token\""
    exit 1
fi

TEST_FILE="$1"
TEST_NAME="${2:-}"

if [ ! -f "$TEST_FILE" ]; then
    echo "Error: Test file not found: $TEST_FILE"
    exit 1
fi

echo "Running single test: $TEST_FILE"
if [ -n "$TEST_NAME" ]; then
    echo "Test name filter: $TEST_NAME"
fi
echo ""

# Run single test with Vitest or Jest
if [ -n "$TEST_NAME" ]; then
    npm test -- "$TEST_FILE" -t "$TEST_NAME"
else
    npm test -- "$TEST_FILE"
fi
