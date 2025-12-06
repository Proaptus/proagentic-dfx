#!/usr/bin/env bash
# inventory-docs.sh - Scan and catalog all Markdown documentation

set -euo pipefail

# Output JSON inventory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

find "$PROJECT_ROOT" -name "*.md" -type f ! -name "CLAUDE.md" ! -path "*/.git/*" ! -path "*/node_modules/*" | \
jq -R -s '
  split("\n") | map(select(length > 0)) | 
  {
    scanned_at: (now | todate),
    total_files: length,
    files: map({path: .})
  }
'
