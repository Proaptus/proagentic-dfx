#!/usr/bin/env python3
"""
ProSWARM Complete Orchestration Enforcement Hook

Enforces that ALL work is executed through ProSWARM's orchestration system:
1. Initial orchestration via orchestrate_task() or predict_decomposition()
2. All work tied to active subtasks (subtask_{id} tracking in memory)
3. Results coordinated through shared memory protocol
4. Continuous task lifecycle management
5. Adaptive refinement through multiple orchestration cycles

This ensures ProSWARM is not just a prerequisite, but the actual execution platform.
"""

import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional

# Dynamic path resolution - works in any project
SCRIPT_DIR = Path(__file__).resolve().parent
STATE_DIR = SCRIPT_DIR.parent / "state"
STATE_FILE = STATE_DIR / "proswarm_orchestration.json"
MEMORY_LOG_FILE = STATE_DIR / "proswarm_memory.log"
SESSION_TIMEOUT = 1800  # 30 minutes

# Standard ProSWARM memory keys from README.md
STANDARD_MEMORY_KEYS = {
    # Task Management
    "main_task_id",
    "current_phase",
    "subtask_count",
    # Results
    "test_results",
    "api_endpoints",
    "bug_fixes",
    "performance_metrics",
    # Coordination
    "agent_assignments",
    "parallel_tasks",
    "dependencies",
    "completion_status",
}

class ProSWARMEnforcer:
    """Enforces ProSWARM orchestration throughout task lifecycle."""

    def __init__(self):
        self.state_dir = STATE_DIR
        self.state_file = STATE_FILE
        self.memory_log = MEMORY_LOG_FILE
        self._ensure_dirs()

    def _ensure_dirs(self):
        """Create necessary directories."""
        self.state_dir.mkdir(parents=True, exist_ok=True)

    def get_session_state(self) -> Dict:
        """Load current orchestration session state."""
        if self.state_file.exists():
            try:
                with open(self.state_file, 'r') as f:
                    state = json.load(f)
                    # Check session timeout
                    if state.get("last_activity"):
                        last = datetime.fromisoformat(state["last_activity"])
                        elapsed = (datetime.now() - last).total_seconds()
                        # CRITICAL: 60 second timeout catches conversation boundaries
                        # Prevents stale state from previous conversation allowing unorchestrated work
                        if elapsed > 60:
                            return self._new_session()
                        # Also enforce 30 minute hard limit
                        if elapsed > SESSION_TIMEOUT:
                            return self._new_session()
                    return state
            except Exception:
                return self._new_session()
        return self._new_session()

    def _new_session(self) -> Dict:
        """Create new orchestration session."""
        return {
            "session_started": datetime.now().isoformat(),
            "last_activity": datetime.now().isoformat(),
            "proswarm_skill_active": False,  # Only enforce when skill is loaded
            "orchestrations": [],  # List of orchestrate_task calls
            "main_task_id": None,
            "active_subtasks": [],  # Subtasks being worked on
            "completed_subtasks": [],
            "current_phase": "initialization",  # initialization, execution, validation, completion
            "memory_operations": [],  # Track memory_store/memory_get calls
            "standard_keys_used": [],  # Track usage of standard memory keys
            "work_tools_used": [],  # Track work tools (Edit, Write, Bash, etc)
            "orphaned_work": [],  # Work not tied to subtasks (VIOLATIONS)
        }

    def save_session_state(self, state: Dict):
        """Persist session state."""
        state["last_activity"] = datetime.now().isoformat()
        with open(self.state_file, 'w') as f:
            json.dump(state, f, indent=2)

    def log_memory_operation(self, tool_name: str, key: str, value: Optional[str] = None):
        """Log memory operations for coordination tracking."""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "tool": tool_name,
            "key": key,
            "value_preview": str(value)[:100] if value else None,
        }
        with open(self.memory_log, 'a') as f:
            f.write(json.dumps(log_entry) + "\n")

    def extract_task_id_from_memory(self, memory_operations: List[Dict]) -> Optional[str]:
        """Extract main_task_id from memory operations."""
        # Look for memory_store calls that set main_task_id
        for op in memory_operations:
            if op.get("key") == "main_task_id" and op.get("tool") == "mcp__proswarm-neural__memory_store":
                return op.get("value")
        return None

    def extract_subtasks_from_memory(self, memory_operations: List[Dict]) -> List[str]:
        """Extract active subtask IDs from memory operations."""
        subtasks = set()
        for op in memory_operations:
            key = op.get("key", "")
            # Match subtask_{id} pattern
            if key.startswith("subtask_"):
                subtask_id = key.split("subtask_")[1]
                subtasks.add(subtask_id)
        return list(subtasks)

    def validate_orchestration(self, tool_name: str, tool_input: Dict) -> Tuple[bool, str]:
        """
        Validate that work is being executed through ProSWARM orchestration.

        Returns: (is_valid, reason)
        """
        state = self.get_session_state()

        # CRITICAL: Only enforce when ProSWARM skill is active
        if not state.get("proswarm_skill_active", False):
            return True, "ProSWARM skill not active - no enforcement"

        # Phase 1: Allow orchestration setup tools (always allowed)
        if self._is_orchestration_tool(tool_name):
            return True, "ProSWARM orchestration setup allowed"

        # Phase 1b: Allow Skill loading anytime (skills load features, not work execution)
        if tool_name == "Skill":
            return True, "Skill loading allowed (features can be loaded anytime)"

        # Phase 2: ALL non-orchestration tools REQUIRE active orchestration (main_task_id must be set)
        # This prevents agents from doing free analysis/investigation without ProSWARM coordination
        if not state.get("main_task_id"):
            return False, (
                "PROSWARM ORCHESTRATION REQUIRED: ALL tools (analysis, investigation, work tools) "
                "require active ProSWARM orchestration to be initiated first. "
                "Call: mcp__proswarm__orchestrate_task() with your task description. "
                "This establishes main_task_id and ensures ALL work is coordinated by ProSWARM."
            )

        # Phase 3: Work tools REQUIRE active subtask context (only for Bash, Edit, Write, etc - not Task/Skill)
        if self._is_work_tool(tool_name):
            # Check if work is tied to active subtasks
            current_subtasks = self.extract_subtasks_from_memory(state.get("memory_operations", []))
            if not current_subtasks:
                return False, (
                    "PROSWARM SUBTASK TRACKING REQUIRED: Work must be tied to active subtasks. "
                    "Before using work tools, use memory_store() to establish current subtask context. "
                    "Example: memory_store('subtask_{subtask_id}', 'status: in_progress') "
                    "This links work to the orchestration task lifecycle."
                )

            # Log the work tool usage
            state["work_tools_used"].append({
                "tool": tool_name,
                "timestamp": datetime.now().isoformat(),
                "associated_subtasks": current_subtasks,
            })

            self.save_session_state(state)
            return True, f"Work tool allowed (subtasks: {current_subtasks})"

        # Phase 4: Analysis/lookup tools ALSO require subtask context
        # This prevents wandering off to analyze unrelated code without the orchestration knowing about it
        if self._is_analysis_tool(tool_name):
            current_subtasks = self.extract_subtasks_from_memory(state.get("memory_operations", []))
            if not current_subtasks:
                return False, (
                    "PROSWARM SUBTASK TRACKING REQUIRED: Analysis tools (Read, Grep, etc) must be tied to active subtasks. "
                    "Use memory_store() to establish subtask context: memory_store('subtask_{id}', 'status: in_progress') "
                    "This ensures all investigation is coordinated with the orchestration plan."
                )
            return True, "Analysis tool allowed (tied to active subtask)"

        # Phase 5: Task tool (agent spawning) allowed if orchestration is active
        # Skill is handled earlier (Phase 1b) to allow feature loading anytime
        if tool_name == "Task":
            return True, "Task tool allowed (agent spawning coordinated with orchestration)"

        # Unknown tool - allow
        return True, "Unknown tool type - allowing"

    def _is_orchestration_tool(self, tool_name: str) -> bool:
        """Check if tool is ProSWARM orchestration tool."""
        orchestration_tools = [
            "mcp__proswarm__orchestrate_task",
            "mcp__proswarm__predict_decomposition",
            "mcp__proswarm__execute_plan",
            "mcp__proswarm__update_subtask_status",
            "mcp__proswarm__memory_store",
            "mcp__proswarm__memory_get",
        ]
        return any(tool_name.startswith(t) or t in tool_name for t in orchestration_tools)

    def _is_analysis_tool(self, tool_name: str) -> bool:
        """Check if tool is analysis/lookup (doesn't require orchestration)."""
        analysis_tools = [
            "WebSearch", "WebFetch",
            "Grep", "Glob", "Read",
            "TodoWrite", "TodoRead",
            "AskUserQuestion",
            "mcp__memory__",
            "mcp__context7__",
            "mcp__sequential-thinking",
            "mcp__chrome-devtools__list",
            "mcp__chrome-devtools__take",
            "mcp__chrome-devtools__get",
            "mcp__chrome-devtools__wait",  # Added wait_for
            "mcp__chrome-devtools__navigate",  # Added navigate (read-only)
            "mcp__github__get",
            "mcp__github__list",
            "mcp__github__search",
            "mcp__supabase__list",
            "mcp__supabase__get",
            "mcp__supabase__search",
        ]
        return any(tool_name.startswith(t) or t in tool_name for t in analysis_tools)

    def _is_work_tool(self, tool_name: str) -> bool:
        """Check if tool is a work/execution tool (NOT including Task/Skill agent spawning)."""
        work_tools = [
            "Bash",
            "Write",
            "Edit",
            # NOTE: Task and Skill are NOT work tools - they're agent coordination tools
            # They are handled separately in Phase 5 for plan capture requirement
            "mcp__github__create",
            "mcp__github__push",
            "mcp__github__update",
            "mcp__github__merge",
            "mcp__supabase__apply",
            "mcp__supabase__execute",
            "mcp__supabase__deploy",
            "mcp__chrome-devtools__click",
            "mcp__chrome-devtools__fill",
            "mcp__chrome-devtools__evaluate",
            "mcp__chrome-devtools__press",
        ]
        return any(tool_name.startswith(w) or w in tool_name for w in work_tools)

    def process_tool_call(self, tool_name: str, tool_input: Dict) -> Tuple[bool, str]:
        """
        Process tool call and enforce orchestration requirements.

        Returns: (allow, reason)
        """
        state = self.get_session_state()

        # Detect ProSWARM skill activation
        if tool_name == "Skill":
            skill_name = tool_input.get("skill", "")
            if "proswarm" in skill_name.lower():
                state["proswarm_skill_active"] = True
                state["skill_activated_at"] = datetime.now().isoformat()
                self.save_session_state(state)
                return True, "ProSWARM skill activated - enforcement enabled"

        # START FRESH when a new orchestration begins
        # This prevents stale subtasks/main_task_id from previous orchestrations being reused
        if "orchestrate_task" in tool_name:
            # Preserve skill activation state across orchestration resets
            was_active = state.get("proswarm_skill_active", False)
            state = self._new_session()  # Reset to clean state
            state["proswarm_skill_active"] = was_active  # Preserve activation
            state["orchestrations"] = [{
                "timestamp": datetime.now().isoformat(),
                "description": tool_input.get("task_description", ""),
            }]
            state["current_phase"] = "execution"
            # CRITICAL: Store that ProSWARM plan is pending so we can enforce it
            state["proswarm_plan_pending"] = True
            state["plan_execution_started"] = False
            # main_task_id will be set when memory_store is called with main_task_id
            self.save_session_state(state)

        # Track memory operations
        if "memory_store" in tool_name:
            key = tool_input.get("key", "")
            value = tool_input.get("value", "")
            state = self.get_session_state()

            # Track the memory operation
            state["memory_operations"].append({
                "tool": tool_name,
                "key": key,
                "timestamp": datetime.now().isoformat(),
                "value": value[:100] if value else None,
            })

            # Update main_task_id if set
            if key == "main_task_id":
                state["main_task_id"] = value

            # CRITICAL: When orchestration_plan is stored, mark that Claude Code has captured the ProSWARM recommendations
            if key == "orchestration_plan":
                state["proswarm_plan_pending"] = False
                state["proswarm_plan_captured"] = True
                state["plan_stored_at"] = datetime.now().isoformat()

            # Track standard keys
            if key in STANDARD_MEMORY_KEYS:
                state["standard_keys_used"].append(key)

            self.save_session_state(state)
            self.log_memory_operation(tool_name, key, value)

        if "memory_get" in tool_name:
            key = tool_input.get("key", "")
            state = self.get_session_state()
            state["memory_operations"].append({
                "tool": tool_name,
                "key": key,
                "timestamp": datetime.now().isoformat(),
            })
            self.save_session_state(state)
            self.log_memory_operation(tool_name, key)

        # Validate orchestration requirements
        is_valid, reason = self.validate_orchestration(tool_name, tool_input)
        return is_valid, reason


def main():
    """Main hook entry point."""
    try:
        data = json.load(sys.stdin)
        tool_name = data.get("tool_name", "")
        tool_input = data.get("tool_input", {})

        enforcer = ProSWARMEnforcer()
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
        # Fail open but log
        sys.stderr.write(f"ProSWARM orchestration enforcement error: {str(e)}\n")
        output = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "allow",
                "reason": "Error in enforcement hook - failing open"
            }
        }
        print(json.dumps(output))
        sys.exit(0)


if __name__ == "__main__":
    main()
