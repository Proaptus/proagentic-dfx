# ProSWARM Orchestration: Quick Reference

## The Pattern

```python
# 1. ORCHESTRATE: Initialize task
orchestrate_task("Clear description of what you're doing")

# 2. ESTABLISH: Set main_task_id in memory
memory_store("main_task_id", "task-xyz123")

# 3. ACTIVATE: Create subtask for this work
memory_store("subtask_feature_x", json.dumps({
    "status": "in_progress",
    "description": "What this subtask does"
}))

# 4. WORK: Use work tools tied to subtask
Edit("src/file.ts", old, new)
Bash("npm test")
Task(subagent_type="tdd-test-generator", ...)

# 5. COORDINATE: Store results in memory
memory_store("test_results", json.dumps({
    "status": "PASS",
    "coverage": "95%"
}))

# 6. TRACK: Mark subtask complete
update_subtask_status("subtask_feature_x", "completed")

# 7. ITERATE: Next subtask or adapt orchestration
memory_store("subtask_refactor", json.dumps({
    "status": "in_progress"
}))
# ... repeat steps 4-6
```

## Allowed Tools (No Orchestration Needed)

```python
# ✅ Analysis/Research (no orchestration required)
WebSearch("...")
WebFetch("...")
Grep("...")
Glob("...")
Read("/path/to/file")
AskUserQuestion(...)

# ✅ Inspection/Reads (no orchestration required)
mcp__github__get_issue(...)
mcp__github__list_pull_requests(...)
mcp__supabase__list_tables(...)

# ✅ Task Management (no orchestration required)
TodoWrite(...)
TodoRead(...)

# ✅ Thinking (no orchestration required)
mcp__sequential-thinking__sequentialthinking(...)
```

## Blocked Without Orchestration

```python
# ❌ Code modification (requires main_task_id + subtask)
Edit(...)
Write(...)

# ❌ Execution (requires main_task_id + subtask)
Bash(...)
Task(...)
Skill(...)

# ❌ GitHub operations (requires main_task_id + subtask)
mcp__github__create_issue(...)
mcp__github__push_files(...)
mcp__github__merge_pull_request(...)

# ❌ Database operations (requires main_task_id + subtask)
mcp__supabase__apply_migration(...)
mcp__supabase__execute_sql(...)

# ❌ Browser operations (requires main_task_id + subtask)
mcp__chrome-devtools__click(...)
mcp__chrome-devtools__fill(...)
mcp__chrome-devtools__navigate_page(...)
```

## Standard Memory Keys

Store results in these standard keys:

```python
# Task management
memory_store("main_task_id", "task-xyz")
memory_store("current_phase", "execution")
memory_store("subtask_{id}", json.dumps(data))

# Results
memory_store("test_results", json.dumps(results))
memory_store("api_endpoints", json.dumps(endpoints))
memory_store("bug_fixes", json.dumps(fixes))
memory_store("performance_metrics", json.dumps(metrics))

# Coordination
memory_store("agent_assignments", json.dumps(assignments))
memory_store("parallel_tasks", json.dumps(tasks))
memory_store("dependencies", json.dumps(deps))
memory_store("completion_status", json.dumps(status))
```

## Error Messages & What To Do

### Error: "PROSWARM ORCHESTRATION REQUIRED"

```
Work tools require active ProSWARM orchestration
```

**You tried:** `Edit(...)` without orchestration

**Fix:**
```python
orchestrate_task("Your task here")
memory_store("main_task_id", "task-123")
Edit(...)  # Now allowed
```

---

### Error: "PROSWARM SUBTASK TRACKING REQUIRED"

```
Work must be tied to active subtasks
```

**You tried:** `Edit(...)` without subtask context

**Fix:**
```python
memory_store("subtask_feature", json.dumps({"status": "in_progress"}))
Edit(...)  # Now allowed
```

---

### Error: "Session timed out"

```
Orchestration session inactive for 30 minutes
```

**Cause:** No ProSWARM activity for 30+ minutes

**Fix:**
```bash
# Option 1: Start fresh
orchestrate_task("New task")
memory_store("main_task_id", "task-456")

# Option 2: Reset session
rm ~/.claude/state/proswarm_orchestration.json
orchestrate_task("Continue task")
```

## Workflow Examples

### Example 1: Bug Fix (TDD)

```python
# 1. ORCHESTRATE
orchestrate_task("Fix pagination bug where items duplicate at page boundaries")

# 2. ESTABLISH context
memory_store("main_task_id", "task-pagination-fix")

# 3. SUBTASK 1: Create failing test
memory_store("subtask_test", {"status": "in_progress"})
Edit("tests/pagination.test.ts", old, new)
Bash("npm test -- pagination")
memory_store("test_results", {"status": "FAIL", "reason": "pagination-duplicate"})
update_subtask_status("subtask_test", "completed")

# 4. SUBTASK 2: Implement fix
memory_store("subtask_fix", {"status": "in_progress"})
Edit("src/pagination.ts", old, new)
Bash("npm test -- pagination")
memory_store("test_results", {"status": "PASS"})
update_subtask_status("subtask_fix", "completed")

# 5. SUBTASK 3: Refactor
memory_store("subtask_refactor", {"status": "in_progress"})
Edit("src/pagination.ts", old, new)
Bash("npm test -- pagination")
memory_store("test_results", {"status": "PASS"})
update_subtask_status("subtask_refactor", "completed")

# 6. ADAPT: Quality gates
orchestrate_task("Run quality gates on pagination fix")
memory_store("quality_gates", {"coverage": "95%", "mutations": "passed"})
```

### Example 2: Feature Implementation

```python
# 1. ORCHESTRATE
orchestrate_task("Implement dark mode toggle in settings")

# 2. ESTABLISH context
memory_store("main_task_id", "task-dark-mode")

# 3. SUBTASK 1: Design component
memory_store("subtask_component", {"status": "in_progress"})
Edit("src/components/DarkModeToggle.tsx", old, new)
Bash("npm test")
memory_store("api_endpoints", [...])
update_subtask_status("subtask_component", "completed")

# 4. SUBTASK 2: Add state management
memory_store("subtask_state", {"status": "in_progress"})
Edit("src/context/ThemeContext.ts", old, new)
Bash("npm test")
update_subtask_status("subtask_state", "completed")

# 5. SUBTASK 3: Integration
memory_store("subtask_integration", {"status": "in_progress"})
Edit("src/pages/Settings.tsx", old, new)
Bash("npm test -- e2e")
memory_store("test_results", {"status": "PASS"})
update_subtask_status("subtask_integration", "completed")

# 6. ADAPT: Refactor & validation
orchestrate_task("Refactor dark mode implementation for maintainability")
```

### Example 3: Performance Optimization

```python
# 1. ORCHESTRATE
orchestrate_task("Optimize dashboard loading performance")

# 2. ESTABLISH context
memory_store("main_task_id", "task-perf-dashboard")

# 3. PARALLEL SUBTASKS (coordinated)
memory_store("parallel_tasks", ["subtask_bundle", "subtask_query"])

# 4. SUBTASK 1: Bundle optimization
memory_store("subtask_bundle", {"status": "in_progress"})
Edit("vite.config.ts", old, new)
Bash("npm run build")
memory_store("performance_metrics", {"bundle_size": "reduced by 30%"})
update_subtask_status("subtask_bundle", "completed")

# 5. SUBTASK 2: Query optimization
memory_store("subtask_query", {"status": "in_progress"})
Edit("src/hooks/useDashboardData.ts", old, new)
Bash("npm run test:e2e")
memory_store("performance_metrics", {"query_time": "2.1s → 0.8s"})
update_subtask_status("subtask_query", "completed")

# 6. ADAPT: Validate improvements
orchestrate_task("Validate performance improvements and check regressions")
memory_store("performance_metrics", {
    "load_time": "5.2s → 2.3s",
    "bundle_size": "reduced by 40%",
    "regressions": "none"
})
```

## Session Debugging

### Check Current Status
```bash
cat ~/.claude/state/proswarm_orchestration.json | jq .
```

**Look for:**
- `main_task_id` is not null
- `active_subtasks` is not empty
- `current_phase` is "execution" or "validation"
- `orphaned_work` is empty

### View Memory Operations
```bash
tail -20 ~/.claude/state/proswarm_memory.log
```

**Look for:**
- Recent `memory_store` operations
- Subtask activation and completion
- Standard keys being used

### Reset Session (Start Fresh)
```bash
rm ~/.claude/state/proswarm_orchestration.json
```

Next `orchestrate_task()` creates new session.

## Key Principles

✅ **DO:**
- Always start with `orchestrate_task()`
- Store `main_task_id` immediately
- Create `subtask_*` before work
- Use standard memory keys
- Track progress via `update_subtask_status()`
- Adapt orchestration as needed (multiple `orchestrate_task()` calls)

❌ **DON'T:**
- Use work tools without orchestration
- Skip subtask creation
- Leave memory coordination incomplete
- Assume orchestration persists without memory operations
- Ignore standard memory protocol
- Modify state files manually

## One-Liner: Full Pattern

```python
orchestrate_task("Do X"); memory_store("main_task_id", "task-id"); memory_store("subtask_1", json.dumps({"status": "in_progress"})); Edit(...); memory_store("results", json.dumps(data)); update_subtask_status("subtask_1", "completed")
```

(But don't actually do this—use the multi-step pattern above for clarity!)

---

**Remember:** ProSWARM orchestrates your work. Give it the information it needs:
1. What you're doing (orchestrate_task)
2. Which subtask you're in (memory_store)
3. What results you got (memory_store results)
4. When you're done (update_subtask_status)
