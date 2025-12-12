#!/usr/bin/env python3
"""
UAT Validation Enforcement Hook

BLOCKS test progression unless:
1. Screenshot was captured for current test
2. Screenshot was analyzed with Read tool
3. Report was updated with Edit tool
4. All 30 tests must complete before UAT ends

This hook PREVENTS the lying and fabrication that occurred on 2025-12-12.
"""

import json
import sys
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional

# Dynamic path resolution
SCRIPT_DIR = Path(__file__).resolve().parent
STATE_DIR = SCRIPT_DIR.parent / "state"
UAT_STATE_FILE = STATE_DIR / "uat_validation.json"

# UAT test patterns
SMOKE_TEST_PATTERN = r"smoke-\d{3}"
SPOT_TEST_PATTERN = r"spot-\d{2}"
TOTAL_REQUIRED_TESTS = 30


class UATEnforcer:
    """Enforces evidence-based UAT testing - NO FABRICATION ALLOWED."""

    def __init__(self):
        self.state_dir = STATE_DIR
        self.state_file = UAT_STATE_FILE
        self._ensure_dirs()

    def _ensure_dirs(self):
        """Create necessary directories."""
        self.state_dir.mkdir(parents=True, exist_ok=True)

    def get_state(self) -> Dict:
        """Load UAT validation state."""
        if self.state_file.exists():
            try:
                with open(self.state_file, 'r') as f:
                    state = json.load(f)
                    # Check session timeout (1 hour for UAT)
                    if state.get("last_activity"):
                        last = datetime.fromisoformat(state["last_activity"])
                        elapsed = (datetime.now() - last).total_seconds()
                        if elapsed > 3600:  # 1 hour timeout
                            return self._new_session()
                    return state
            except Exception:
                return self._new_session()
        return self._new_session()

    def _new_session(self) -> Dict:
        """Create new UAT session."""
        return {
            "session_started": datetime.now().isoformat(),
            "last_activity": datetime.now().isoformat(),
            "uat_active": False,
            "current_test": None,
            "tests_completed": [],
            "tests_with_screenshot": [],
            "tests_with_analysis": [],
            "tests_with_report_update": [],
            "screenshot_files": [],
            "validation_failures": [],
        }

    def save_state(self, state: Dict):
        """Persist state."""
        state["last_activity"] = datetime.now().isoformat()
        with open(self.state_file, 'w') as f:
            json.dump(state, f, indent=2)

    def activate_uat_mode(self, state: Dict):
        """Activate UAT enforcement mode."""
        state["uat_active"] = True
        state["session_started"] = datetime.now().isoformat()
        self.save_state(state)

    def extract_test_id_from_filename(self, filename: str) -> Optional[str]:
        """Extract test ID from screenshot filename."""
        import re
        # Match smoke-001, smoke-002, etc.
        match = re.search(r'(smoke-\d{3})', filename.lower())
        if match:
            return match.group(1).upper()
        # Match spot-01, spot-02, etc.
        match = re.search(r'(spot-\d{2})', filename.lower())
        if match:
            return match.group(1).upper()
        return None

    def extract_test_id_from_todo(self, content: str) -> Optional[str]:
        """Extract test ID from todo content."""
        import re
        # Match SMOKE-001, SMOKE-002, etc.
        match = re.search(r'(SMOKE-\d{3})', content.upper())
        if match:
            return match.group(1)
        # Match SPOT-01, SPOT-02, etc.
        match = re.search(r'(SPOT-\d{2})', content.upper())
        if match:
            return match.group(1)
        return None

    def validate_test_completion(self, test_id: str, state: Dict) -> Tuple[bool, str]:
        """
        Validate that a test can be marked complete.

        BLOCKS unless:
        1. Screenshot was captured
        2. Screenshot was analyzed
        3. Report was updated
        """
        missing_steps = []

        # Check 1: Screenshot captured?
        if test_id not in state.get("tests_with_screenshot", []):
            missing_steps.append(
                f"SCREENSHOT MISSING: No screenshot captured for {test_id}. "
                f"Use: mcp__chrome-devtools__take_screenshot({{ filename: '{test_id.lower()}-*.png' }})"
            )

        # Check 2: Screenshot analyzed?
        if test_id not in state.get("tests_with_analysis", []):
            missing_steps.append(
                f"ANALYSIS MISSING: Screenshot for {test_id} was not analyzed with Read tool. "
                f"Use: Read({{ file_path: 'screenshot-file.png' }}) to view and describe what's visible."
            )

        # Check 3: Report updated?
        if test_id not in state.get("tests_with_report_update", []):
            missing_steps.append(
                f"REPORT NOT UPDATED: Test {test_id} results not written to H2_UAT_REPORT.md. "
                f"Use: Edit({{ file_path: 'H2_UAT_REPORT.md', ... }}) to add test results immediately."
            )

        if missing_steps:
            return False, (
                f"🚨 UAT VALIDATION BLOCKED - {test_id} cannot be marked complete:\n\n" +
                "\n\n".join(missing_steps) +
                "\n\nComplete ALL steps before marking test as completed. NO FABRICATION ALLOWED."
            )

        return True, f"✅ {test_id} validated - all evidence collected"

    def process_tool_call(self, tool_name: str, tool_input: Dict) -> Tuple[bool, str]:
        """Process tool call and enforce UAT validation."""
        state = self.get_state()

        # Detect UAT skill activation
        if tool_name == "Skill":
            skill_name = tool_input.get("skill", "")
            if "uat" in skill_name.lower():
                self.activate_uat_mode(state)
                return True, "UAT mode activated - enforcement enabled"

        # If UAT not active, allow everything
        if not state.get("uat_active", False):
            return True, "UAT not active - no enforcement"

        # Track screenshot captures
        if "take_screenshot" in tool_name.lower() or tool_name == "mcp__chrome-devtools__take_screenshot":
            filename = tool_input.get("filename", "") or tool_input.get("filePath", "")
            if filename:
                test_id = self.extract_test_id_from_filename(filename)
                if test_id:
                    if test_id not in state["tests_with_screenshot"]:
                        state["tests_with_screenshot"].append(test_id)
                    state["screenshot_files"].append(filename)
                    state["current_test"] = test_id
                    self.save_state(state)
            return True, f"Screenshot captured for {test_id if test_id else 'unknown test'}"

        # Track screenshot analysis (Read on image file)
        if tool_name == "Read":
            file_path = tool_input.get("file_path", "")
            if file_path and (".png" in file_path.lower() or ".jpg" in file_path.lower()):
                # This is reading a screenshot
                test_id = self.extract_test_id_from_filename(file_path)
                if not test_id and state.get("current_test"):
                    test_id = state["current_test"]
                if test_id:
                    if test_id not in state["tests_with_analysis"]:
                        state["tests_with_analysis"].append(test_id)
                    self.save_state(state)
            return True, f"Screenshot analysis for {test_id if test_id else 'unknown test'}"

        # Track report updates
        if tool_name == "Edit":
            file_path = tool_input.get("file_path", "")
            new_string = tool_input.get("new_string", "")
            if "UAT" in file_path.upper() or "REPORT" in file_path.upper():
                # Check if this update is for a specific test
                test_id = self.extract_test_id_from_todo(new_string)
                if not test_id and state.get("current_test"):
                    test_id = state["current_test"]
                if test_id:
                    if test_id not in state["tests_with_report_update"]:
                        state["tests_with_report_update"].append(test_id)
                    self.save_state(state)
            return True, "Report update tracked"

        # CRITICAL: Block TodoWrite marking tests complete without evidence
        if tool_name == "TodoWrite":
            todos = tool_input.get("todos", [])
            for todo in todos:
                content = todo.get("content", "")
                status = todo.get("status", "")

                # If trying to mark a UAT test as completed
                if status == "completed":
                    test_id = self.extract_test_id_from_todo(content)
                    if test_id:
                        is_valid, reason = self.validate_test_completion(test_id, state)
                        if not is_valid:
                            state["validation_failures"].append({
                                "test_id": test_id,
                                "timestamp": datetime.now().isoformat(),
                                "reason": reason,
                            })
                            self.save_state(state)
                            return False, reason

                        # Mark as completed
                        if test_id not in state["tests_completed"]:
                            state["tests_completed"].append(test_id)
                        self.save_state(state)

            return True, "TodoWrite allowed"

        # Allow all other tools
        return True, "Tool allowed during UAT"


def main():
    """Main hook entry point."""
    try:
        data = json.load(sys.stdin)
        tool_name = data.get("tool_name", "")
        tool_input = data.get("tool_input", {})

        enforcer = UATEnforcer()
        is_allowed, reason = enforcer.process_tool_call(tool_name, tool_input)

        if is_allowed:
            output = {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "allow",
                    "reason": reason,
                }
            }
        else:
            output = {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": reason,
                }
            }

        print(json.dumps(output))
        sys.exit(0)

    except Exception as e:
        # Log error but allow (don't break everything)
        sys.stderr.write(f"UAT enforcement error: {str(e)}\n")
        output = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "allow",
                "reason": f"Error in UAT hook: {str(e)} - failing open"
            }
        }
        print(json.dumps(output))
        sys.exit(0)


if __name__ == "__main__":
    main()
