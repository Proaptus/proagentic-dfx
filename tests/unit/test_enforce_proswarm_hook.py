#!/usr/bin/env python3
"""
Unit tests for the ProSWARM enforcement hook.

Tests the core validation logic of enforce-proswarm.py without
requiring actual Claude Code or MCP connections.
"""

import pytest
import json
from pathlib import Path
from datetime import datetime, timedelta
import tempfile
import shutil
import importlib.util

# Add hooks directory to path
HOOKS_DIR = Path(__file__).parent.parent.parent / ".claude" / "hooks"

# Import module with hyphenated name using importlib
spec = importlib.util.spec_from_file_location("enforce_proswarm", HOOKS_DIR / "enforce-proswarm.py")
enforce_proswarm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(enforce_proswarm)

# Extract classes from the module
ProSWARMEnforcer = enforce_proswarm.ProSWARMEnforcer
STANDARD_MEMORY_KEYS = enforce_proswarm.STANDARD_MEMORY_KEYS


class TestProSWARMEnforcer:
    """Test suite for ProSWARMEnforcer class."""

    @pytest.fixture
    def temp_state_dir(self):
        """Create a temporary state directory for testing."""
        temp_dir = tempfile.mkdtemp()
        yield Path(temp_dir)
        shutil.rmtree(temp_dir, ignore_errors=True)

    @pytest.fixture
    def enforcer(self, temp_state_dir):
        """Create an enforcer with temporary state directory."""
        enforcer = ProSWARMEnforcer()
        enforcer.state_dir = temp_state_dir
        enforcer.state_file = temp_state_dir / "proswarm_orchestration.json"
        enforcer.memory_log = temp_state_dir / "proswarm_memory.log"
        enforcer._ensure_dirs()
        return enforcer

    # ==================== Session State Tests ====================

    def test_new_session_creates_valid_state(self, enforcer):
        """Test that a new session has all required fields."""
        state = enforcer._new_session()

        assert "session_started" in state
        assert "last_activity" in state
        assert "orchestrations" in state
        assert "main_task_id" in state
        assert "active_subtasks" in state
        assert "completed_subtasks" in state
        assert "current_phase" in state
        assert "memory_operations" in state
        assert state["main_task_id"] is None
        assert state["current_phase"] == "initialization"

    def test_session_timeout_creates_new_session(self, enforcer):
        """Test that sessions timeout after 60 seconds."""
        # Create an old session
        old_time = (datetime.now() - timedelta(seconds=70)).isoformat()
        old_state = {
            "session_started": old_time,
            "last_activity": old_time,
            "main_task_id": "old-task-123",
            "orchestrations": [{"test": "data"}],
            "active_subtasks": [],
            "completed_subtasks": [],
            "current_phase": "execution",
            "memory_operations": [],
            "standard_keys_used": [],
            "work_tools_used": [],
            "orphaned_work": [],
        }

        with open(enforcer.state_file, 'w') as f:
            json.dump(old_state, f)

        # Get session should return new session due to timeout
        state = enforcer.get_session_state()
        assert state["main_task_id"] is None
        assert state["current_phase"] == "initialization"

    def test_session_persists_within_timeout(self, enforcer):
        """Test that sessions persist within 60 second window."""
        # Create a recent session
        recent_time = (datetime.now() - timedelta(seconds=30)).isoformat()
        recent_state = {
            "session_started": recent_time,
            "last_activity": recent_time,
            "main_task_id": "recent-task-456",
            "orchestrations": [],
            "active_subtasks": [],
            "completed_subtasks": [],
            "current_phase": "execution",
            "memory_operations": [],
            "standard_keys_used": [],
            "work_tools_used": [],
            "orphaned_work": [],
        }

        with open(enforcer.state_file, 'w') as f:
            json.dump(recent_state, f)

        # Get session should return existing session
        state = enforcer.get_session_state()
        assert state["main_task_id"] == "recent-task-456"

    # ==================== Tool Classification Tests ====================

    def test_orchestration_tools_identified(self, enforcer):
        """Test that ProSWARM orchestration tools are correctly identified."""
        orchestration_tools = [
            "mcp__proswarm-neural__orchestrate_task",
            "mcp__proswarm-neural__predict_decomposition",
            "mcp__proswarm-neural__execute_plan",
            "mcp__proswarm-neural__update_subtask_status",
            "mcp__proswarm-neural__memory_store",
            "mcp__proswarm-neural__memory_get",
        ]

        for tool in orchestration_tools:
            assert enforcer._is_orchestration_tool(tool), f"{tool} should be orchestration tool"

    def test_work_tools_identified(self, enforcer):
        """Test that work/execution tools are correctly identified."""
        work_tools = [
            "Bash",
            "Write",
            "Edit",
            "mcp__github__create_pull_request",
            "mcp__github__push_files",
            "mcp__supabase__execute_sql",
            "mcp__chrome-devtools__click",
            "mcp__chrome-devtools__fill",
        ]

        for tool in work_tools:
            assert enforcer._is_work_tool(tool), f"{tool} should be work tool"

    def test_analysis_tools_identified(self, enforcer):
        """Test that analysis/lookup tools are correctly identified."""
        analysis_tools = [
            "Read",
            "Grep",
            "Glob",
            "WebSearch",
            "WebFetch",
            "TodoWrite",
            "mcp__memory__search_nodes",
            "mcp__context7__get-library-docs",
            "mcp__github__get_issue",
            "mcp__github__list_issues",
        ]

        for tool in analysis_tools:
            assert enforcer._is_analysis_tool(tool), f"{tool} should be analysis tool"

    def test_task_skill_not_work_tools(self, enforcer):
        """Test that Task and Skill are NOT classified as work tools."""
        assert not enforcer._is_work_tool("Task")
        assert not enforcer._is_work_tool("Skill")

    # ==================== Validation Tests ====================

    def test_orchestration_tools_always_allowed(self, enforcer):
        """Test that orchestration tools are allowed without prior setup."""
        is_valid, reason = enforcer.validate_orchestration(
            "mcp__proswarm-neural__orchestrate_task",
            {"task_description": "Test task"}
        )
        assert is_valid
        assert "allowed" in reason.lower()

    def test_work_tools_blocked_without_orchestration(self, enforcer):
        """Test that work tools are blocked without main_task_id."""
        # Ensure no main_task_id
        state = enforcer.get_session_state()
        assert state["main_task_id"] is None

        is_valid, reason = enforcer.validate_orchestration("Bash", {"command": "ls"})
        assert not is_valid
        assert "PROSWARM ORCHESTRATION REQUIRED" in reason

    def test_work_tools_blocked_without_subtask(self, enforcer):
        """Test that work tools are blocked without subtask context."""
        # Set main_task_id but no subtask
        state = enforcer.get_session_state()
        state["main_task_id"] = "task-123"
        enforcer.save_session_state(state)

        is_valid, reason = enforcer.validate_orchestration("Bash", {"command": "ls"})
        assert not is_valid
        assert "SUBTASK TRACKING REQUIRED" in reason

    def test_work_tools_allowed_with_full_context(self, enforcer):
        """Test that work tools are allowed with orchestration and subtask."""
        # Set up full context
        state = enforcer.get_session_state()
        state["main_task_id"] = "task-123"
        state["memory_operations"] = [
            {"tool": "mcp__proswarm-neural__memory_store", "key": "subtask_work", "timestamp": datetime.now().isoformat()}
        ]
        enforcer.save_session_state(state)

        is_valid, reason = enforcer.validate_orchestration("Bash", {"command": "npm test"})
        assert is_valid

    def test_analysis_tools_blocked_without_subtask(self, enforcer):
        """Test that analysis tools require subtask context."""
        # Set main_task_id but no subtask
        state = enforcer.get_session_state()
        state["main_task_id"] = "task-123"
        enforcer.save_session_state(state)

        is_valid, reason = enforcer.validate_orchestration("Read", {"file_path": "/test.ts"})
        assert not is_valid
        assert "SUBTASK TRACKING REQUIRED" in reason

    # ==================== Memory Operation Tests ====================

    def test_memory_store_updates_main_task_id(self, enforcer):
        """Test that memory_store with main_task_id updates state."""
        enforcer.process_tool_call(
            "mcp__proswarm-neural__memory_store",
            {"key": "main_task_id", "value": "task-789"}
        )

        state = enforcer.get_session_state()
        assert state["main_task_id"] == "task-789"

    def test_orchestration_plan_capture_tracked(self, enforcer):
        """Test that orchestration_plan storage is tracked."""
        # First orchestrate
        enforcer.process_tool_call(
            "mcp__proswarm-neural__orchestrate_task",
            {"task_description": "Test"}
        )

        state = enforcer.get_session_state()
        assert state.get("proswarm_plan_pending") is True

        # Then store plan
        enforcer.process_tool_call(
            "mcp__proswarm-neural__memory_store",
            {"key": "orchestration_plan", "value": '{"test": "plan"}'}
        )

        state = enforcer.get_session_state()
        assert state.get("proswarm_plan_captured") is True

    def test_subtask_extraction_from_memory(self, enforcer):
        """Test extraction of subtask IDs from memory operations."""
        memory_ops = [
            {"key": "subtask_analysis", "tool": "mcp__proswarm-neural__memory_store"},
            {"key": "subtask_implementation", "tool": "mcp__proswarm-neural__memory_store"},
            {"key": "main_task_id", "tool": "mcp__proswarm-neural__memory_store"},
        ]

        subtasks = enforcer.extract_subtasks_from_memory(memory_ops)
        assert "analysis" in subtasks
        assert "implementation" in subtasks
        assert len(subtasks) == 2

    # ==================== Integration Tests ====================

    def test_full_orchestration_workflow(self, enforcer):
        """Test a complete valid orchestration workflow."""
        # Step 1: Orchestrate
        is_valid, _ = enforcer.process_tool_call(
            "mcp__proswarm-neural__orchestrate_task",
            {"task_description": "Build feature X"}
        )
        assert is_valid

        # Step 2: Store main_task_id
        is_valid, _ = enforcer.process_tool_call(
            "mcp__proswarm-neural__memory_store",
            {"key": "main_task_id", "value": "task-full-test"}
        )
        assert is_valid

        # Step 3: Store orchestration_plan
        is_valid, _ = enforcer.process_tool_call(
            "mcp__proswarm-neural__memory_store",
            {"key": "orchestration_plan", "value": '{"subtasks": ["a", "b"]}'}
        )
        assert is_valid

        # Step 4: Store subtask context
        is_valid, _ = enforcer.process_tool_call(
            "mcp__proswarm-neural__memory_store",
            {"key": "subtask_work", "value": "status: in_progress"}
        )
        assert is_valid

        # Step 5: Now work tools should be allowed
        is_valid, reason = enforcer.validate_orchestration("Bash", {"command": "npm test"})
        assert is_valid, f"Work tool should be allowed: {reason}"

        is_valid, reason = enforcer.validate_orchestration("Read", {"file_path": "/test.ts"})
        assert is_valid, f"Analysis tool should be allowed: {reason}"


class TestStandardMemoryKeys:
    """Test the standard memory keys configuration."""

    def test_required_keys_present(self):
        """Test that all required standard keys are defined."""
        required = ["main_task_id", "current_phase", "subtask_count"]
        for key in required:
            assert key in STANDARD_MEMORY_KEYS

    def test_result_keys_present(self):
        """Test that result tracking keys are defined."""
        result_keys = ["test_results", "api_endpoints", "bug_fixes", "performance_metrics"]
        for key in result_keys:
            assert key in STANDARD_MEMORY_KEYS


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
