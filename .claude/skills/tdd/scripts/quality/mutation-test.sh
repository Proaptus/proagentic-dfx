#!/bin/bash
# Quick mutation testing on changed lines
#
# Usage: ./mutation-test.sh [files...]
# If no files specified, runs on git diff

set -e

echo "Running mutation tests on changed code..."

# Check if Stryker is installed
if ! command -v npx stryker &> /dev/null; then
    echo "⚠️  Stryker not installed. Install with:"
    echo "   npm install --save-dev @stryker-mutator/core"
    echo "   npm install --save-dev @stryker-mutator/typescript-checker"
    echo ""
    echo "Skipping mutation testing..."
    exit 0
fi

# Get changed files from git or use provided files
if [ $# -eq 0 ]; then
    CHANGED_FILES=$(git diff --name-only HEAD | grep -E '\.(ts|tsx|js|jsx)$' || echo "")
    if [ -z "$CHANGED_FILES" ]; then
        echo "No changed files found in git diff"
        echo "✅ SKIP: No mutation testing needed"
        exit 0
    fi
else
    CHANGED_FILES="$@"
fi

echo "Testing mutations in:"
echo "$CHANGED_FILES" | sed 's/^/  - /'
echo ""

# Run Stryker on changed files only
npx stryker run --mutate "$CHANGED_FILES" --testRunner vitest

echo ""
echo "✅ Mutation testing complete"
echo "Review detailed report: ./reports/mutation/html/index.html"
