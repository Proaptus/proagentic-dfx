#!/bin/bash

# Test Artifact Cleanup Script for ProAgentic
# Removes old coverage reports, test results, and screenshots
# Usage: ./scripts/cleanup-artifacts.sh

set -e

echo "🧹 ProAgentic Test Artifact Cleanup"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run from project root."
    exit 1
fi

echo "⏱️  Cleaning up test artifacts..."
echo ""

# Arrays to track cleanup
CLEANED=()
SKIPPED=()
FREED_MB=0

# Function to clean a directory
clean_directory() {
    local dir=$1
    local description=$2

    if [ -d "$dir" ]; then
        # Get size before (in MB)
        local size_before=$(du -sm "$dir" 2>/dev/null | awk '{print $1}' || echo "0")

        echo "  🗑️  Cleaning $description ($size_before MB)..."
        rm -rf "$dir"

        # Create .gitkeep if directory had one
        if [ -d ".git" ] && [ "$dir" != ".git" ]; then
            mkdir -p "$dir"
            touch "$dir/.gitkeep"
        fi

        CLEANED+=("$dir ($size_before MB)")
        FREED_MB=$((FREED_MB + size_before))
    else
        SKIPPED+=("$dir (doesn't exist)")
    fi
}

# Clean coverage reports (largest)
clean_directory "coverage" "coverage reports (116MB+)"

# Clean test results
clean_directory "test-results" "test results"

# Clean Playwright cache
clean_directory ".playwright" "Playwright cache"

# Clean screenshot artifacts
clean_directory "uat-screenshots" "UAT screenshots"
clean_directory "e2e-screenshots" "E2E screenshots"
clean_directory "playwright-report" "Playwright report"

# Clean old log files (but not current server.log)
if [ -d "logs" ]; then
    echo "  🗑️  Cleaning logs directory..."
    rm -rf "logs"
    mkdir -p "logs"
    touch "logs/.gitkeep"
    CLEANED+=("logs/")
fi

# Clean old test session results
if [ -f "test-results-initial.log" ]; then
    echo "  🗑️  Cleaning test result logs..."
    rm -f test-results-*.log
    CLEANED+=("test-results*.log")
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Cleaned Items:"
for item in "${CLEANED[@]}"; do
    echo "  ✅ $item"
done

if [ ${#SKIPPED[@]} -gt 0 ]; then
    echo ""
    echo "⏭️  Skipped (not found):"
    for item in "${SKIPPED[@]}"; do
        echo "  ⏭️  $item"
    done
fi

echo ""
echo "💾 Space Freed: ${FREED_MB}MB"
echo ""

if [ "$FREED_MB" -gt 0 ]; then
    echo "✅ Disk space has been freed!"
else
    echo "ℹ️  No artifacts found to clean (already clean)"
fi

echo ""
