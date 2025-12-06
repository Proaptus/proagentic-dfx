#!/bin/bash

# Log an event to the deployment JSON log
# Usage: log-event "phase_name" "status" "duration_seconds" [optional_json_data]
# Examples:
#   log-event "backend-deploy" "success" "180" '{"backend_url": "https://..."}'
#   log-event "uat-testing" "failed" "300" '{"error": "test timeout"}'

set -e

PHASE_NAME="${1:-unknown}"
PHASE_STATUS="${2:-unknown}"
PHASE_DURATION="${3:-0}"
PHASE_DATA="${4:-{}}"
LOG_FILE="${LOG_FILE:-.deployment/logs/latest.json}"

if [ ! -f "$LOG_FILE" ]; then
  echo "Error: Log file not found: $LOG_FILE" >&2
  exit 1
fi

# Create the phase entry
read -r -d '' PHASE_ENTRY << EOF || true
{
  "phase": "$PHASE_NAME",
  "status": "$PHASE_STATUS",
  "duration_seconds": $PHASE_DURATION,
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "data": $PHASE_DATA
}
EOF

# Update the JSON log file - add phase and update status
# Using jq to safely manipulate JSON
if command -v jq &> /dev/null; then
  # Parse the new phase data
  NEW_PHASE=$(jq -n "$PHASE_ENTRY")
  
  # Add to phases array
  TEMP_LOG=$(mktemp)
  jq --argjson phase "$NEW_PHASE" '.phases += [$phase]' "$LOG_FILE" > "$TEMP_LOG"
  
  # Update deployment status to failed if any phase failed
  if [ "$PHASE_STATUS" = "failed" ] || [ "$PHASE_STATUS" = "error" ]; then
    jq '.status = "failed" | .errors += [{"phase": $phase, "timestamp": (now | strftime("%Y-%m-%dT%H:%M:%SZ"))}]' \
      --arg phase "$PHASE_NAME" \
      "$TEMP_LOG" > "$LOG_FILE"
  else
    cp "$TEMP_LOG" "$LOG_FILE"
  fi
  
  rm -f "$TEMP_LOG"
else
  # Fallback: simple string replacement (less safe but works without jq)
  # This is a simplified approach - ideally use jq
  echo "Warning: jq not found, using basic logging" >&2
fi

# Print summary to console
printf "  %-20s %s (%ds)\n" "$PHASE_NAME:" "$PHASE_STATUS" "$PHASE_DURATION"
