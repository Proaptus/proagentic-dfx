#!/usr/bin/env python3
"""
Hook to block Claude Code from killing node processes and IDE.
Allows killing other processes (e.g., chrome, zombie processes).
"""
import json
import sys
import re

def main():
    try:
        data = json.load(sys.stdin)

        tool_name = data.get("tool_name", "")
        tool_input = data.get("tool_input", {})
        command = tool_input.get("command", "")

        if tool_name != "Bash":
            sys.exit(0)

        # BLOCKED: Patterns that kill node/IDE processes
        blocked_patterns = [
            r'kill.*node',                    # kill with node
            r'pkill.*node',                   # pkill node processes
            r'killall.*node',                 # killall node
            r'kill\s+-9?\s+\d+.*server',      # kill PID for server
            r'pkill\s+-f.*server',            # pkill -f server
            r'pkill\s+-f.*index\.js',         # pkill -f index.js
            r'pkill\s+-f.*vite',              # pkill vite dev server
            r'pkill\s+-f.*antigravity',       # IDE processes
            r'pkill\s+-f.*code-server',       # VS Code server
            r'kill.*antigravity',             # IDE processes
            r'npm\s+run\s+dev:cleanup',       # dev cleanup script (uses kill internally)
            r'lsof.*xargs\s+kill',            # lsof pipe to kill
        ]

        # ALLOWED: Safe kill operations
        allowed_patterns = [
            r'pkill.*chrome',                 # Chrome cleanup for DevTools
            r'pkill.*playwright',             # Playwright cleanup
            r'kill.*chrome',                  # Chrome kill
            r'ps\s+aux',                      # Just listing processes (not killing)
            r'lsof\s+-i',                     # Just checking ports (not killing)
        ]

        # Check allowed first
        for pattern in allowed_patterns:
            if re.search(pattern, command, re.IGNORECASE):
                output = {"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "allow"}}
                print(json.dumps(output))
                sys.exit(0)

        # Check blocked
        for pattern in blocked_patterns:
            if re.search(pattern, command, re.IGNORECASE):
                output = {
                    "hookSpecificOutput": {
                        "hookEventName": "PreToolUse",
                        "permissionDecision": "deny",
                        "permissionDecisionReason": f"BLOCKED: Cannot kill node/IDE processes. Ask user to restart server. Pattern matched: {pattern}"
                    }
                }
                print(json.dumps(output))
                sys.exit(0)

        # Everything else allowed
        output = {"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "allow"}}
        print(json.dumps(output))
        sys.exit(0)

    except Exception as e:
        sys.stderr.write(f"Hook error: {str(e)}\n")
        sys.exit(0)

if __name__ == "__main__":
    main()
