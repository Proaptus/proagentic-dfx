#!/usr/bin/env bash
# quarantine-doc.sh - Move document to quarantine with timestamp and reason

set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <file> <reason>"
  exit 1
fi

FILE="$1"
REASON="$2"

# Create quarantine directory with timestamp
TIMESTAMP=$(date +%Y-%m-%d-%H-%M)
QUARANTINE_DIR="docs/quarantine/$TIMESTAMP"
mkdir -p "$QUARANTINE_DIR"

# Move file
BASENAME=$(basename "$FILE")
mv "$FILE" "$QUARANTINE_DIR/$BASENAME"

# Create reason file
cat > "$QUARANTINE_DIR/QUARANTINE_REASON.md" << EOL
# Quarantine Reason

**Document**: $BASENAME
**Quarantined**: $(date +%Y-%m-%d\ %H:%M)
**Reason**: $REASON

**Action**: Review manually to determine if salvageable or can be deleted.
EOL

echo "Quarantined $FILE to $QUARANTINE_DIR/"
echo "Reason: $REASON"
