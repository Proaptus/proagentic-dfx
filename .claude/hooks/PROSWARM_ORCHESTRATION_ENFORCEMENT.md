---
status: superseded
superseded_by: [".claude/skills/proswarm/SKILL.md"]
last_verified_at: 2025-12-09
reason: Content consolidated into canonical skill definition
---

> **NOTE**: This document has been superseded. See `.claude/skills/proswarm/SKILL.md` for the canonical documentation.

# ProSWARM Complete Orchestration Enforcement

## Overview

This hook enforces that **ALL work is executed through ProSWARM's orchestration system**, not just that ProSWARM is invoked once at the start.

### The Critical Distinction

**Old Hook Model (WRONG):**
```
Call ProSWARM once → Mark "done" → Execute work freely
└─ ProSWARM is a prerequisite gate, not an execution platform
```

**New Hook Model (CORRECT):**
```
1. orchestrate_task() → Establish main_task_id
2. memory_store("subtask_X", ...) → Tie work to active subtasks
3. Use work tools → Linked to current subtask context
4. memory_store("test_results", ...) → Coordinate results
5. update_subtask_status() → Track progress
6. Repeat: Adapt & refine orchestration as needed
└─ ProSWARM IS the execution platform, not just a gate
```

## Task Lifecycle Phases

The enforcer tracks these phases:

### Phase 1: Initialization
- **Action**: Call `orchestrate_task()` or `predict_decomposition()`
- **Effect**: Establishes task description and planning
- **State**: `current_phase = "initialization"`

### Phase 2: Execution
- **Action**: Use `memory_store()` to establish `main_task_id`
- **Action**: Use `memory_store("subtask_X", ...)` to activate subtasks
- **Action**: Use work tools (Edit, Write, Bash, Task, Skill) tied to subtasks
- **Effect**: All work is tracked and coordinated
- **State**: `current_phase = "execution"`

### Phase 3: Validation
- **Action**: Store results in memory (`test_results`, `api_endpoints`, `bug_fixes`, etc.)
- **Action**: Call `update_subtask_status()` to mark subtasks complete
- **Effect**: Results coordinated through shared memory
- **State**: `current_phase = "validation"`

### Phase 4: Completion & Adaptation
- **Action**: Call `orchestrate_task()` again for refinement (adaptive)
- **Effect**: New cycle with improved plan
- **State**: Reset to `execution` or `completion`

## Key Enforcement Rules

### Rule 1: Work Tools Require Active Orchestration

**BLOCKED:**
```
// Without ProSWARM orchestration first
npm run edit src/app.ts  // ❌ DENIED - no main_task_id
npm run bash "npm test"  // ❌ DENIED - no orchestration context
```

**ALLOWED:**
```
// With ProSWARM orchestration
orchestrate_task("Fix authentication bug")  // ✓ Sets up task
memory_store("main_task_id", "task-123")    // ✓ Establishes context
memory_store("subtask_auth", ...)           // ✓ Activates subtask
Edit("src/auth.ts", ...)                    // ✓ Work tied to subtask
```

### Rule 2: Work Must Be Tied to Active Subtasks

**BLOCKED:**
```
// Orphaned work (not tied to a subtask)
Edit("src/component.tsx")  // ❌ DENIED - no active subtask context
```

**ALLOWED:**
```
// Work tied to subtask
memory_store("subtask_ui_component", "status: in_progress")
Edit("src/component.tsx")  // ✓ Associated with subtask_ui_component
```

### Rule 3: Results Must Be Coordinated Through Memory

**WRONG:**
```
Edit("src/fix.ts")           // Work done
npm test                      // Tests run
// No memory coordination - disconnected from orchestration
```

**RIGHT:**
```
memory_store("subtask_fix", "status: in_progress")
Edit("src/fix.ts")
Bash("npm test")
memory_store("test_results", JSON.stringify(testOutput))  // ✓ Coordinated
update_subtask_status("subtask_fix", "completed")          // ✓ Tracked
```

### Rule 4: Use Standard Memory Keys

ProSWARM defines standard memory keys for coordination:

**Task Management:**
- `main_task_id` - Primary task identifier
- `current_phase` - Current execution phase
- `subtask_count` - Number of subtasks
- `subtask_{id}` - Individual subtask data/status

**Results:**
- `test_results` - Test execution results
- `api_endpoints` - Created API endpoints
- `bug_fixes` - Applied bug fixes
- `performance_metrics` - Performance measurements

**Coordination:**
- `agent_assignments` - Agent task assignments
- `parallel_tasks` - Tasks running in parallel
- `dependencies` - Task dependencies
- `completion_status` - Completion tracking

## Enforcement Actions

### When Work Tool Is Called Without Orchestration

**Hook Blocks with Message:**
```
PROSWARM ORCHESTRATION REQUIRED: Work tools (Edit, Write, Bash, etc)
require active ProSWARM orchestration.

First call: mcp__proswarm-neural__orchestrate_task() with your task
description, or mcp__proswarm-neural__predict_decomposition() for quick
decomposition.

This establishes main_task_id and active subtask tracking.
```

**What to Do:**
```python
# 1. Start orchestration
orchestrate_task("Your task description here")

# 2. Establish main_task_id in memory
memory_store("main_task_id", "task-xyz123")

# 3. THEN use work tools
Edit("src/file.ts", old, new)
```

### When Work Tool Is Called Without Subtask Context

**Hook Blocks with Message:**
```
PROSWARM SUBTASK TRACKING REQUIRED: Work must be tied to active subtasks.

Before using work tools, use memory_store() to establish current subtask
context.

Example: memory_store('subtask_{subtask_id}', 'status: in_progress')

This links work to the orchestration task lifecycle.
```

**What to Do:**
```python
# 1. Activate subtask in memory
memory_store("subtask_feature_x", json.dumps({
    "status": "in_progress",
    "description": "Implement feature X",
    "assigned_tools": ["Edit", "Bash"]
}))

# 2. THEN use work tools
Edit("src/feature.ts", old, new)
```

## Session State Tracking

The enforcer maintains session state in:
```
~/.claude/state/proswarm_orchestration.json
```

**State Structure:**
```json
{
  "session_started": "2025-11-25T10:00:00",
  "last_activity": "2025-11-25T10:15:30",

  "orchestrations": [
    {
      "timestamp": "2025-11-25T10:00:00",
      "description": "Fix authentication bug"
    }
  ],

  "main_task_id": "task-abc123",
  "active_subtasks": ["subtask_auth", "subtask_tests"],
  "completed_subtasks": ["subtask_analysis"],
  "current_phase": "execution",

  "memory_operations": [
    {
      "tool": "mcp__proswarm-neural__memory_store",
      "key": "main_task_id",
      "timestamp": "2025-11-25T10:00:15",
      "value": "task-abc123"
    }
  ],

  "standard_keys_used": ["main_task_id", "subtask_auth", "test_results"],

  "work_tools_used": [
    {
      "tool": "Edit",
      "timestamp": "2025-11-25T10:01:00",
      "associated_subtasks": ["subtask_auth"]
    }
  ],

  "orphaned_work": []  // Should always be empty
}
```

## Memory Operation Logging

All memory operations are logged to:
```
~/.claude/state/proswarm_memory.log
```

**Log Format (JSONL):**
```json
{"timestamp": "2025-11-25T10:00:15", "tool": "mcp__proswarm-neural__memory_store", "key": "main_task_id", "value_preview": "task-abc123"}
{"timestamp": "2025-11-25T10:00:20", "tool": "mcp__proswarm-neural__memory_store", "key": "subtask_auth", "value_preview": "{\"status\": \"in_progress\"}"}
{"timestamp": "2025-11-25T10:00:25", "tool": "mcp__proswarm-neural__memory_get", "key": "main_task_id"}
```

This log allows you to:
- Verify memory coordination is happening
- Debug orchestration issues
- Track data flow through subtasks
- Audit compliance with memory protocol

## Allowed Tools (No Orchestration Required)

These tools don't require ProSWARM orchestration:

**Research & Analysis:**
- WebSearch, WebFetch
- Grep, Glob, Read
- mcp__context7__* (documentation lookup)
- mcp__sequential-thinking (thinking)

**Task Management:**
- TodoWrite, TodoRead

**User Interaction:**
- AskUserQuestion

**Inspection & Reads:**
- mcp__github__get*, mcp__github__list*
- mcp__supabase__list*, mcp__supabase__get*
- mcp__chrome-devtools__list*, mcp__chrome-devtools__take*

**Why:** These tools don't modify state or execute work. They're safe to use for exploration without orchestration overhead.

## Work Tools (Require Orchestration)

These tools REQUIRE active ProSWARM orchestration:

**Code Modification:**
- Edit, Write

**Execution:**
- Bash
- Task (subagent spawning)
- Skill (skill execution)

**GitHub Operations:**
- mcp__github__create*, mcp__github__push*, mcp__github__update*, mcp__github__merge*

**Database Operations:**
- mcp__supabase__apply*, mcp__supabase__execute*, mcp__supabase__deploy*

**Browser Automation:**
- mcp__chrome-devtools__click*, mcp__chrome-devtools__fill*, mcp__chrome-devtools__navigate*, mcp__chrome-devtools__evaluate*, mcp__chrome-devtools__press*

## Session Timeout

Sessions timeout after **30 minutes** without ProSWARM activity. This resets enforcement to require new orchestration.

**Rationale:** Long gaps indicate abandoned task context. New work requires fresh orchestration.

## Example: Correct TDD Workflow

```python
# STEP 1: Orchestrate task
orchestrate_task("Fix pagination bug causing duplicate items")
# Hook allows: Task setup

# STEP 2: Establish orchestration context
memory_store("main_task_id", "task-pagination-fix-123")
memory_store("subtask_test", json.dumps({
    "status": "in_progress",
    "description": "Create fail-to-pass test"
}))
# Hook allows: Memory coordination

# STEP 3: Write failing test (tied to subtask_test)
Edit("tests/pagination.test.ts", old, new)
Bash("npm test -- pagination.test.ts")
# Hook allows: Work tied to subtask_test

# STEP 4: Update subtask and coordinate results
memory_store("test_results", json.dumps({
    "file": "pagination.test.ts",
    "status": "FAIL",
    "reason": "Pagination duplicate on boundary"
}))
update_subtask_status("subtask_test", "completed")

# STEP 5: Activate next subtask
memory_store("subtask_fix", json.dumps({
    "status": "in_progress",
    "description": "Implement pagination fix"
}))
# Hook allows: New subtask activation

# STEP 6: Implement fix (tied to subtask_fix)
Edit("src/pagination.ts", old, new)
Bash("npm test -- pagination.test.ts")
# Hook allows: Work tied to subtask_fix

# STEP 7: Verify and update coordination
memory_store("test_results", json.dumps({
    "file": "pagination.test.ts",
    "status": "PASS",
    "coverage": "95%"
}))
memory_store("bug_fixes", json.dumps({
    "bug": "pagination-duplicate",
    "fix": "src/pagination.ts:42-56",
    "status": "complete"
}))
update_subtask_status("subtask_fix", "completed")

# STEP 8: Orchestrate final phase (adaptive)
orchestrate_task("Refactor pagination code for maintainability")
# Hook allows: New orchestration cycle
```

## Debugging Orchestration Issues

### Check Current Session State

```bash
cat ~/.claude/state/proswarm_orchestration.json
```

**Look for:**
- `main_task_id` is set (not null)
- `current_phase` is "execution" or "validation"
- `active_subtasks` is not empty
- `orphaned_work` is empty (should always be)

### Check Memory Operation Log

```bash
tail -20 ~/.claude/state/proswarm_memory.log
```

**Look for:**
- Recent `memory_store` operations with `main_task_id`
- `subtask_*` operations matching current work
- Standard key usage (`test_results`, `bug_fixes`, etc)

### Reset Session (If Stuck)

```bash
rm ~/.claude/state/proswarm_orchestration.json
# Next orchestrate_task() call will create fresh session
```

## Differences from Old Hook

| Aspect | Old Hook | New Hook |
|--------|----------|----------|
| **Purpose** | Gate access | Enable platform |
| **Orchestration** | One-time prerequisite | Continuous lifecycle |
| **Task Tracking** | Binary flag | Full phase tracking |
| **Memory** | Ignored | Coordinated & logged |
| **Subtasks** | Unknown | Actively tracked |
| **Phases** | Not tracked | Initialization → Execution → Validation → Completion |
| **Violations** | Work without orchestrate_task | Orphaned work (no subtask context) |
| **Session State** | Simple flag | Comprehensive state object |
| **Memory Protocol** | Not enforced | Standard keys validated |

## Session Reset Conditions

Session resets (requires new orchestration) when:

1. **Timeout**: 30 minutes without ProSWARM activity
2. **New Task**: User explicitly starts fresh task
3. **Manual Reset**: `rm ~/.claude/state/proswarm_orchestration.json`

**Why:** Ensures stale or abandoned orchestrations don't silently persist.

## Best Practices

### DO ✅
- Always call `orchestrate_task()` at task start
- Store `main_task_id` in memory immediately
- Create `subtask_*` keys before using work tools
- Store results in standard memory keys
- Call `update_subtask_status()` to track progress
- Use memory logging to audit coordination

### DON'T ❌
- Skip orchestration for "simple" tasks
- Use work tools without subtask context
- Leave memory operations incomplete
- Assume orchestration persists without memory coordination
- Ignore standard memory key protocol
- Modify state files directly (let hook manage it)

---

**The Key Insight:** ProSWARM is not a prerequisite to satisfy—it's the platform that enables intelligent, coordinated, parallel task execution. This hook ensures it's used that way.
