#!/bin/bash

# UAT Cleanup Script
# Removes old screenshot files and organizes test artifacts

set -e

RESULTS_DIR="${1:-.}/tests/uat-results"
DAYS_TO_KEEP="${2:-7}"
ARCHIVE_DIR="${3:-.}/tests/uat-archive"

echo "UAT Cleanup Script"
echo "=================="
echo "Results Directory: $RESULTS_DIR"
echo "Days to Keep: $DAYS_TO_KEEP"
echo "Archive Directory: $ARCHIVE_DIR"
echo ""

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

# Find and move old screenshots to archive
echo "Archiving screenshots older than $DAYS_TO_KEEP days..."
find "$RESULTS_DIR" -name "*.png" -mtime +$DAYS_TO_KEEP -exec mv {} "$ARCHIVE_DIR/" \; 2>/dev/null || true

# Create archive with timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
ARCHIVE_FILE="$ARCHIVE_DIR/uat-screenshots-archive-$TIMESTAMP.tar.gz"

if [ -f "$ARCHIVE_DIR"/*.png ]; then
    echo "Creating archive: $ARCHIVE_FILE"
    cd "$ARCHIVE_DIR"
    tar -czf "uat-screenshots-archive-$TIMESTAMP.tar.gz" *.png
    rm -f *.png
    cd - > /dev/null
    echo "Archived $(ls -1 "$ARCHIVE_DIR"/*.tar.gz 2>/dev/null | wc -l) archive file(s)"
fi

# Remove old reports
echo "Cleaning up old UAT reports (older than $DAYS_TO_KEEP days)..."
find . -maxdepth 1 -name "UAT_REPORT_*.md" -mtime +$DAYS_TO_KEEP -delete 2>/dev/null || true

# Count remaining files
CURRENT_SCREENSHOTS=$(find "$RESULTS_DIR" -name "*.png" 2>/dev/null | wc -l)
CURRENT_REPORTS=$(find . -maxdepth 1 -name "UAT_REPORT_*.md" 2>/dev/null | wc -l)

echo ""
echo "Cleanup Summary"
echo "==============="
echo "Current screenshots in results: $CURRENT_SCREENSHOTS"
echo "Current UAT reports: $CURRENT_REPORTS"
echo "Archive location: $ARCHIVE_DIR"
echo ""
echo "Cleanup completed successfully!"
