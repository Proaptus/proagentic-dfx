# Migration from Old Hook to ProSWARM Complete Orchestration Enforcement

## Overview

This guide explains how to replace the old `enforce-proswarm.py` hook with the new `enforce-proswarm-orchestration.py` hook that properly integrates ProSWARM as the full execution platform.

## Key Differences

### Old Hook: ProSWARM as Gate
```
orchestrate_task() → Mark "done" → Work freely
└─ One-time prerequisite check
```

### New Hook: ProSWARM as Platform
```
orchestrate_task() → memory_store() → subtask tracking → work tools → results coordination
└─ Continuous execution platform with lifecycle phases
```

## Migration Steps

### Step 1: Backup Old Hook (Optional)
```bash
cd ~/.claude/hooks
mv enforce-proswarm.py enforce-proswarm.py.deprecated
# Keep for reference if needed
```

### Step 2: Verify New Hook Exists
```bash
ls -la ~/.claude/hooks/enforce-proswarm-orchestration.py
# Should see the new hook file
```

### Step 3: Make New Hook Executable
```bash
chmod +x ~/.claude/hooks/enforce-proswarm-orchestration.py
```

### Step 4: Update Hook Configuration

If you have a custom Claude Code hook configuration, update the hook invocation:

**Old config:**
```json
{
  "hooks": {
    "PreToolUse": "./enforce-proswarm.py"
  }
}
```

**New config:**
```json
{
  "hooks": {
    "PreToolUse": "./enforce-proswarm-orchestration.py"
  }
}
```

### Step 5: Clear Session State
```bash
# Clear old session state to start fresh
rm ~/.claude/state/proswarm_session.json
# New hook will create fresh orchestration state
```

### Step 6: Verify Installation
```bash
# Check both files exist
ls -la ~/.claude/hooks/*proswarm*
# Expected output:
# enforce-proswarm-orchestration.py (NEW)
# enforce-proswarm.py.deprecated (OLD)
```

## What Changes in Behavior

### For You (The User)

**Old Workflow (Before):**
```python
# 1. Call orchestrate_task once
orchestrate_task("Fix bug")

# 2. Then work freely - no constraints
Edit("src/bug.ts", old, new)
Bash("npm test")
Task(subagent_type="tdd-test-generator", ...)
# All allowed after initial orchestrate_task call
```

**New Workflow (After):**
```python
# 1. Call orchestrate_task
orchestrate_task("Fix bug")

# 2. Establish main_task_id
memory_store("main_task_id", "task-123")

# 3. Activate subtask
memory_store("subtask_auth", json.dumps({
    "status": "in_progress",
    "description": "Fix authentication logic"
}))

# 4. Work tied to subtask
Edit("src/bug.ts", old, new)

# 5. Coordinate results
memory_store("test_results", json.dumps({
    "status": "PASS",
    "coverage": "95%"
}))

# 6. Track progress
update_subtask_status("subtask_auth", "completed")
```

**Why the Change:**
- Old hook didn't actually coordinate work—just checked a prerequisite
- New hook ensures work is coordinated through ProSWARM's memory protocol
- Results are traceable and measurable
- Parallel execution can be safely managed

### For ProSWARM (The Platform)

**Old Integration:**
- ProSWARM called once
- Results not tracked in memory
- No coordination between work phases
- No subtask lifecycle management

**New Integration:**
- ProSWARM orchestrates continuously
- All results stored in shared memory
- Clear phase progression (initialization → execution → validation → completion)
- Subtask lifecycle tracked and managed
- Adaptive refinement through multiple orchestration cycles

## Common Questions

### Q: Will my existing code still work?

**A:** Not immediately. The new hook enforces stricter requirements:

**Before (ALLOWED):**
```python
orchestrate_task("task")
Edit("src/file.ts", ...)  # ✓ Works with old hook
```

**After (BLOCKED):**
```python
orchestrate_task("task")
Edit("src/file.ts", ...)  # ❌ Blocked - no subtask context
```

**You need to add:**
```python
orchestrate_task("task")
memory_store("main_task_id", "task-123")
memory_store("subtask_code", "status: in_progress")
Edit("src/file.ts", ...)  # ✓ Now allowed
```

### Q: How do I migrate existing tasks?

**A:** Clear the session and start fresh:

```bash
rm ~/.claude/state/proswarm_orchestration.json
```

Next task will use the new enforcement model.

### Q: Can I use both hooks?

**A:** Not recommended. They conflict:
- Old hook: Permissive after one orchestrate_task call
- New hook: Requires ongoing memory coordination

Use only the new hook.

### Q: What if I want to temporarily disable the hook?

**A:** Rename it:
```bash
mv ~/.claude/hooks/enforce-proswarm-orchestration.py ~/.claude/hooks/enforce-proswarm-orchestration.py.disabled
```

Claude Code won't invoke disabled hooks. But remember: you'll lose orchestration enforcement.

### Q: How do I know if the hook is working?

**A:** Check the session state:
```bash
cat ~/.claude/state/proswarm_orchestration.json
```

**Healthy state:**
- `main_task_id` is not null
- `current_phase` is "execution" or "validation"
- `active_subtasks` is not empty
- `orphaned_work` is empty
- `memory_operations` has recent entries

### Q: What if orchestration gets stuck?

**A:** Reset:
```bash
rm ~/.claude/state/proswarm_orchestration.json
```

Start fresh task with `orchestrate_task()`.

## Troubleshooting

### Hook Says "PROSWARM ORCHESTRATION REQUIRED"

**Cause:** You tried to use a work tool (Edit, Write, Bash) without orchestration.

**Solution:**
```python
# First
orchestrate_task("Your task description")
memory_store("main_task_id", "task-id")

# Then use work tools
Edit(...)
```

### Hook Says "PROSWARM SUBTASK TRACKING REQUIRED"

**Cause:** You used a work tool but didn't activate a subtask.

**Solution:**
```python
# First establish subtask
memory_store("subtask_feature", json.dumps({
    "status": "in_progress"
}))

# Then use work tool
Edit(...)
```

### Hook Blocking Valid Work

**Check:**
1. Is `main_task_id` set? → `memory_store("main_task_id", "...")`
2. Is a subtask active? → `memory_store("subtask_*", ...)`
3. Did session timeout? → `rm ~/.claude/state/proswarm_orchestration.json`

### Memory Operations Not Being Logged

**Check:**
```bash
tail -10 ~/.claude/state/proswarm_memory.log
```

If empty:
- Check directory permissions: `ls -la ~/.claude/state/`
- Try manually creating: `touch ~/.claude/state/proswarm_memory.log`

## Benefits of Migration

| Feature | Old Hook | New Hook |
|---------|----------|----------|
| **Work Coordination** | ❌ Not tracked | ✅ Full coordination |
| **Result Traceability** | ❌ Not tracked | ✅ Memory logging |
| **Phase Tracking** | ❌ Binary | ✅ Multi-phase lifecycle |
| **Subtask Management** | ❌ Unknown | ✅ Active tracking |
| **Parallel Execution** | ❌ Unsafe | ✅ Managed safely |
| **Adaptive Refinement** | ❌ Not possible | ✅ Multiple orchestrations |
| **Session State** | ❌ Simple flag | ✅ Comprehensive |
| **Memory Protocol** | ❌ Not enforced | ✅ Standard keys validated |

## Timeline

**Phase 1 (Now): New Hook Available**
- New hook installed alongside old hook
- Documentation available
- No breaking changes yet

**Phase 2 (Recommended Soon): Migrate to New Hook**
- Replace old hook with new hook
- Start using new workflow
- Benefit from full orchestration

**Phase 3 (Future): Old Hook Deprecated**
- Old hook may be removed
- All work requires new orchestration model

## Support

If you have questions:

1. **Check PROSWARM_ORCHESTRATION_ENFORCEMENT.md** - Comprehensive reference
2. **Check examples above** - Common workflows
3. **Review session state** - `~/.claude/state/proswarm_orchestration.json`
4. **Check memory log** - `~/.claude/state/proswarm_memory.log`

---

**TL;DR:**

Old hook: "Just call orchestrate_task() once"
New hook: "Orchestrate_task() → memory_store() → subtask tracking → work → coordinate results → track progress"

The new approach ensures ProSWARM is actually orchestrating your work, not just a prerequisite to check off.
