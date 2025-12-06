#!/usr/bin/env python3
"""
NOVAE Safety Validator for Bash Commands

This hook validates bash commands before execution to prevent:
- Process termination (kill, pkill, killall)
- Destructive operations (rm -rf /, force docker cleanup)
- Unsafe patterns specific to ProAgentic

Implements Claude Code PreToolUse hook with permission decisions:
- allow: Command is safe, proceed automatically
- deny: Command is forbidden, block with reason
- ask: Command needs explicit user confirmation

Context7 Reference: Claude Code Hooks - PreToolUse Decision Control
"""

import json
import re
import sys
from typing import Dict, Any, Literal


def send_decision(
    decision: Literal["allow", "deny", "ask"],
    reason: str
) -> None:
    """Send permission decision back to Claude Code."""
    output = {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": decision,
            "permissionDecisionReason": reason
        }
    }
    print(json.dumps(output))
    sys.exit(0)


def deny(reason: str) -> None:
    """Block the command with a reason."""
    send_decision("deny", reason)


def ask(reason: str) -> None:
    """Request explicit user confirmation."""
    send_decision("ask", reason)


def allow(reason: str = "Command is safe") -> None:
    """Allow the command to proceed."""
    send_decision("allow", reason)


def analyze_command(cmd: str) -> None:
    """Analyze bash command for safety issues."""

    # Critical: Process termination (ALWAYS DENY)
    process_termination_patterns = [
        r"\bkill\b",
        r"\bkillall\b",
        r"\bpkill\b",
        r"pkill\s+-f\s+[\"']?node.*server[\"']?",
    ]

    for pattern in process_termination_patterns:
        if re.search(pattern, cmd, re.IGNORECASE):
            deny(
                "❌ BLOCKED: Process termination commands are forbidden by NOVAE safety policy. "
                "Use 'npm run dev' or './start.sh &' to manage servers. "
                "Never use kill/pkill/killall commands."
            )

    # Critical: Root filesystem destruction (ALWAYS DENY)
    if re.search(r"rm\s+-[rf]+\s+/(?:\s|$)", cmd):
        deny("❌ BLOCKED: Attempting to delete root filesystem. This would destroy the system.")

    # High risk: Destructive operations (ASK for confirmation)
    destructive_patterns = [
        (r"\brm\s+-[rf]+", "Recursive file deletion"),
        (r"\bdocker\s+system\s+prune\s+-f", "Docker system cleanup"),
        (r"\bdocker\s+rm\s+-f", "Force Docker container removal"),
        (r"\bnpm\s+run\s+clean", "Project cleanup"),
        (r"\bgit\s+reset\s+--hard", "Git hard reset"),
        (r"\bgit\s+clean\s+-[fdx]+", "Git clean operation"),
    ]

    for pattern, description in destructive_patterns:
        if re.search(pattern, cmd, re.IGNORECASE):
            ask(
                f"⚠️ POTENTIALLY DESTRUCTIVE: {description}\n"
                f"Command: {cmd}\n"
                f"Please confirm this operation is intentional."
            )

    # ProAgentic-specific: Mock data in functional code (DENY)
    if re.search(r"(echo|cat)\s+.*mock.*\s*>\s*src/", cmd, re.IGNORECASE):
        deny(
            "❌ BLOCKED: Writing mock data to functional code (src/) is forbidden. "
            "Mock data is only allowed in tests/ or tmp/. "
            "This is a serious violation of ProAgentic coding standards."
        )

    # ProAgentic-specific: Direct database operations (ASK)
    if re.search(r"\b(psql|mysql|mongosh)\b", cmd, re.IGNORECASE):
        ask(
            "⚠️ DATABASE OPERATION: Direct database access detected.\n"
            "Ensure you're not modifying production data.\n"
            "Command: " + cmd
        )

    # ProAgentic-specific: Deployment commands (ASK)
    deployment_patterns = [
        r"\bdeploy\.sh\b",
        r"\bgcloud\s+run\s+deploy",
        r"\bnetlify\s+deploy\b",
        r"\bdocker\s+push",
    ]

    for pattern in deployment_patterns:
        if re.search(pattern, cmd, re.IGNORECASE):
            ask(
                "⚠️ DEPLOYMENT OPERATION: This command will deploy changes.\n"
                "Ensure all tests pass and you intend to deploy.\n"
                "Command: " + cmd
            )

    # Safe commands - no decision override needed
    # (Claude Code will handle normal permission flow)
    safe_patterns = [
        r"^\s*(ls|pwd|cd|echo|cat|grep|find|which|whereis)\b",
        r"^\s*(npm\s+(run\s+)?(dev|test|build|lint))\b",
        r"^\s*(git\s+(status|log|diff|branch))\b",
        r"^\s*ps\s+aux\s+\|\s+grep",
        r"^\s*curl\s+http",
    ]

    for pattern in safe_patterns:
        if re.search(pattern, cmd, re.IGNORECASE):
            allow("Safe command - proceeding automatically")

    # No match - let default permission flow handle it
    sys.exit(0)


def main() -> None:
    """Main entry point for the hook."""
    try:
        # Read hook input from stdin
        data: Dict[str, Any] = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error reading input: {e}", file=sys.stderr)
        sys.exit(1)

    # Only process Bash tool invocations
    tool_name = data.get("tool_name", "")
    if tool_name != "Bash":
        sys.exit(0)

    # Extract command
    tool_input = data.get("tool_input", {})
    command = tool_input.get("command", "")

    if not command:
        sys.exit(0)

    # Analyze and decide
    analyze_command(command)


if __name__ == "__main__":
    main()
