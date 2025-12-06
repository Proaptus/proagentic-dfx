#!/bin/bash

# Initialize deployment log in JSON format
# Usage: source init-log.sh "mode" "project"

set -e

DEPLOYMENT_ID=$(date +"%Y%m%d-%H%M%S")
PROJECT_NAME="${1:-proagentic}"
DEPLOYMENT_MODE="${2:-full}"
LOG_DIR=".deployment/logs"
LOG_FILE="$LOG_DIR/${DEPLOYMENT_ID}.json"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Create symbolic link to latest deployment
ln -sf "${DEPLOYMENT_ID}.json" "$LOG_DIR/latest.json" 2>/dev/null || true

# Initialize the JSON log file
cat > "$LOG_FILE" << EOF
{
  "deployment_id": "$DEPLOYMENT_ID",
  "project": "$PROJECT_NAME",
  "mode": "$DEPLOYMENT_MODE",
  "status": "in_progress",
  "started_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "completed_at": null,
  "phases": [],
  "errors": []
}
EOF

# Export for use in other scripts
export DEPLOYMENT_ID
export LOG_FILE
export DEPLOYMENT_MODE

echo "$LOG_FILE"
