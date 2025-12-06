#!/bin/bash
# Wrapper script to call the actual stop_validator.py
# Uses relative path from script location for portability
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "$SCRIPT_DIR/stop_validator.py" "$@"
