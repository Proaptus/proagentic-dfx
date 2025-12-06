#!/usr/bin/env python3
"""
End-to-End tests for ProSWARM template.

Tests the complete orchestration workflow simulating Claude Code interaction.
"""

import pytest
import json
import subprocess
import sys
from pathlib import Path

TEMPLATE_DIR = Path(__file__).parent.parent.parent
HOOKS_DIR = TEMPLATE_DIR / ".claude" / "hooks"


class TestE2EOrchestration:
    """End-to-end tests for full orchestration workflow."""

    @pytest.fixture
    def clean_state(self):
        """Ensure clean state before each test."""
        state_dir = TEMPLATE_DIR / ".claude" / "state"
        state_file = state_dir / "proswarm_orchestration.json"
        if state_file.exists():
            state_file.unlink()
        yield state_dir
        if state_file.exists():
            state_file.unlink()

    def simulate_hook_call(self, tool_name: str, tool_input: dict) -> dict:
        """Simulate a PreToolUse hook call."""
        hook_path = HOOKS_DIR / "enforce-proswarm.py"
        input_data = {"tool_name": tool_name, "tool_input": tool_input}
        result = subprocess.run(
            [sys.executable, str(hook_path)],
            input=json.dumps(input_data),
            capture_output=True, text=True,
            cwd=str(TEMPLATE_DIR)
        )
        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError:
            pytest.fail(f"Hook returned invalid JSON: {result.stdout}")

    def is_allowed(self, result: dict) -> bool:
        """Check if hook allowed the tool call."""
        return result.get("hookSpecificOutput", {}).get("permissionDecision") == "allow"

    def get_reason(self, result: dict) -> str:
        """Get the reason from hook output."""
        ho = result.get("hookSpecificOutput", {})
        return ho.get("reason", "") or ho.get("permissionDecisionReason", "")

    def test_orchestration_tool_always_allowed(self, clean_state):
        """Test that orchestration tools work without prior setup."""
        result = self.simulate_hook_call(
            "mcp__proswarm-neural__orchestrate_task",
            {"task_description": "Build a new feature"}
        )
        assert self.is_allowed(result), f"Should allow: {self.get_reason(result)}"

    def test_memory_store_always_allowed(self, clean_state):
        """Test that memory_store is always allowed."""
        result = self.simulate_hook_call(
            "mcp__proswarm-neural__memory_store",
            {"key": "test_key", "value": "test_value"}
        )
        assert self.is_allowed(result)

    def test_complete_workflow_success(self, clean_state):
        """Test a complete valid workflow."""
        # Step 1: Orchestrate
        result = self.simulate_hook_call(
            "mcp__proswarm-neural__orchestrate_task",
            {"task_description": "Implement feature"}
        )
        assert self.is_allowed(result), "Step 1 failed"

        # Step 2: Store main_task_id
        result = self.simulate_hook_call(
            "mcp__proswarm-neural__memory_store",
            {"key": "main_task_id", "value": "task-e2e-001"}
        )
        assert self.is_allowed(result), "Step 2 failed"

        # Step 3: Store orchestration_plan
        result = self.simulate_hook_call(
            "mcp__proswarm-neural__memory_store",
            {"key": "orchestration_plan", "value": '{"subtasks": ["a"]}'}
        )
        assert self.is_allowed(result), "Step 3 failed"

        # Step 4: Store subtask context
        result = self.simulate_hook_call(
            "mcp__proswarm-neural__memory_store",
            {"key": "subtask_work", "value": "in_progress"}
        )
        assert self.is_allowed(result), "Step 4 failed"

        # Step 5: Work tools should now be allowed
        result = self.simulate_hook_call("Read", {"file_path": "/test.ts"})
        assert self.is_allowed(result), f"Read failed: {self.get_reason(result)}"

        result = self.simulate_hook_call("Bash", {"command": "npm test"})
        assert self.is_allowed(result), f"Bash failed: {self.get_reason(result)}"

    def test_read_blocked_without_orchestration(self, clean_state):
        """Test that Read is blocked without orchestration."""
        result = self.simulate_hook_call("Read", {"file_path": "/test.ts"})
        assert not self.is_allowed(result)
        assert "ORCHESTRATION REQUIRED" in self.get_reason(result)

    def test_bash_blocked_without_orchestration(self, clean_state):
        """Test that Bash is blocked without orchestration."""
        result = self.simulate_hook_call("Bash", {"command": "ls"})
        assert not self.is_allowed(result)
        assert "ORCHESTRATION REQUIRED" in self.get_reason(result)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
