---
status: superseded
superseded_by: [".claude/skills/proswarm/SKILL.md"]
last_verified_at: 2025-12-09
reason: Philosophy concepts incorporated into canonical skill definition
---

> **NOTE**: This document has been superseded. See `.claude/skills/proswarm/SKILL.md` for the canonical documentation.

# ProSWARM Complete Orchestration: Philosophy & Vision

## The Problem with the Old Approach

The old hook treated ProSWARM like a **prerequisite gate**:

```
User: "Can I use Edit?"
Old Hook: "Did you call orchestrate_task()?"
User: "Yes, I called it 5 minutes ago."
Old Hook: "✅ Sure, go ahead and use Edit for the next hour"
```

**This is wrong because:**
1. ProSWARM is treated as a checkbox ("Did you orchestrate?") not a platform
2. Work is disconnected from orchestration after the initial call
3. Results are never coordinated back through ProSWARM
4. No visibility into what work is being done or why
5. Parallel execution is unsafe (no coordination mechanism)
6. Adaptation and refinement aren't possible (orchestration is one-shot)

---

## The Solution: ProSWARM as Execution Platform

The new hook treats ProSWARM as the **actual execution platform**:

```
User: "Can I use Edit?"
New Hook: "Is orchestrate_task() active?"
User: "Yes, task-123"
New Hook: "Is there an active subtask?"
User: "Yes, subtask_auth"
New Hook: "✅ Proceed. Edit is tied to subtask_auth"
```

**Then after the work:**
```
User: memory_store("test_results", ...)
New Hook: "✓ Results coordinated through ProSWARM memory"
```

**Then tracking progress:**
```
User: update_subtask_status("subtask_auth", "completed")
New Hook: "✓ ProSWARM knows subtask_auth is done, can start parallel subtask_tests"
```

---

## Core Insight: Orchestration ≠ Permission

**Old Model (Wrong):**
```
Orchestration = Permission to work
└─ Call orchestrate_task() → Get permission → Work freely
```

**New Model (Correct):**
```
Orchestration = Coordinated Execution Context
├─ Establish task scope (orchestrate_task)
├─ Manage subtask lifecycle (subtask_*, update_subtask_status)
├─ Share results through memory (memory_store standard keys)
├─ Track progress continuously (current_phase, completion_status)
└─ Enable safe parallelization (dependencies, parallel_tasks)
```

---

## Why This Matters

### 1. **Visibility & Traceability**

**Old:** Did I call orchestrate_task()? ✓ That's all we know.

**New:**
- What's the main task? → `main_task_id`
- What phase are we in? → `current_phase`
- What subtasks are active? → `active_subtasks`, `subtask_*`
- What results do we have? → `test_results`, `api_endpoints`, `bug_fixes`
- What's the completion status? → `completion_status`, memory operations log

**Benefit:** Complete audit trail of work and results

### 2. **Safe Parallelization**

**Old:**
```python
# These run in parallel, but how do we coordinate?
Edit("src/auth.ts", ...)
Edit("src/api.ts", ...)
Bash("npm test")  # Which file does this test?
```

**New:**
```python
# Explicit coordination
memory_store("parallel_tasks", ["subtask_auth", "subtask_api"])
memory_store("dependencies", ["subtask_tests depends on [subtask_auth, subtask_api]"])

# Now parallel execution is safe
Edit("src/auth.ts", ...)     # Tied to subtask_auth
Edit("src/api.ts", ...)      # Tied to subtask_api
Bash("npm test")             # Knows it depends on both

memory_store("test_results", ...)  # Results tracked
```

**Benefit:** Can safely run independent subtasks in parallel

### 3. **Adaptive Refinement**

**Old:** One-time orchestration. Can't adapt.

**New:** Multiple orchestration cycles:
```python
# Cycle 1: Initial orchestration and execution
orchestrate_task("Fix bug")
memory_store("main_task_id", "task-123")
memory_store("subtask_test", ...)
Edit(...)
memory_store("test_results", ...)

# Cycle 2: Refine based on results
orchestrate_task("Refactor based on test results")  # NEW orchestration
memory_store("subtask_refactor", ...)
Edit(...)

# Cycle 3: Final validation
orchestrate_task("Run quality gates")  # ANOTHER orchestration
Bash("npm run test:coverage")
memory_store("quality_gates", ...)
```

**Benefit:** Continuous improvement through multiple orchestration passes

### 4. **Task Decomposition at Runtime**

**Old:** orchestrate_task() is static. Decomposition happens once.

**New:** Decomposition evolves:
```python
# Initial orchestration sees the big picture
orchestrate_task("Build user dashboard with stats and activity feed")

# As we discover complexity, create more detailed subtasks
memory_store("subtask_stats_component", ...)
memory_store("subtask_stats_api", ...)
memory_store("subtask_activity_component", ...)
memory_store("subtask_activity_api", ...)
memory_store("subtask_integration", ...)

# Each subtask is tracked and coordinated
```

**Benefit:** Start high-level, decompose to detail as needed

### 5. **Result Coordination**

**Old:** Edit, Bash, Task... results are scattered. How do we know what was done?

**New:** Results flow through standard memory keys:
```python
# After tests
memory_store("test_results", {
    "passed": 245,
    "failed": 0,
    "coverage": "94%"
})

# After API changes
memory_store("api_endpoints", [
    "/api/users",
    "/api/users/{id}",
    "/api/users/{id}/profile"
])

# After bug fixes
memory_store("bug_fixes", [
    {"bug": "auth-timeout", "fix": "session.ts:42-56"},
    {"bug": "pagination-duplicate", "fix": "list.ts:130-145"}
])

# Unified view of what changed
```

**Benefit:** Complete picture of changes in one place (memory)

---

## The Four Questions ProSWARM Answers

### Old Hook Can Only Answer:
1. "Did you call orchestrate_task?" → Yes/No

### New Hook Answers:
1. **"What are we building?"** → `main_task_id`, `current_phase`
2. **"What subtasks are we working on?"** → `active_subtasks`, `subtask_*`
3. **"What results do we have?"** → Standard keys (`test_results`, `bug_fixes`, etc)
4. **"What's our progress?"** → `completion_status`, memory operation log

---

## The Three Phases of Orchestration

### Phase 1: Initialization
```
User describes task → orchestrate_task()
ProSWARM analyzes scope
Hook allows setup
```

### Phase 2: Execution
```
Activate subtask → memory_store("subtask_X", ...)
Do work → Edit, Bash, Task, Skill
Coordinate results → memory_store("test_results", ...)
Track progress → update_subtask_status()
Repeat for next subtask
```

### Phase 3: Validation & Adaptation
```
Validate results → Check standard keys
Adapt if needed → orchestrate_task() again
Refine scope → Update subtasks
Or complete task → Final update_subtask_status()
```

---

## The Memory Protocol: The Key Innovation

The **shared memory system** is what makes ProSWARM a true orchestration platform:

```
┌─────────────────────────────────────────┐
│      ProSWARM Shared Memory System       │
├─────────────────────────────────────────┤
│                                          │
│  main_task_id: "task-123"               │
│  current_phase: "execution"             │
│  active_subtasks: ["sub_test", "sub_fix"]│
│  subtask_test: {status: "in_progress"}  │
│  subtask_fix: {status: "in_progress"}   │
│  test_results: {passed: 10, failed: 0}  │
│  bug_fixes: [{...}, {...}]              │
│  performance_metrics: {load_time: "2s"} │
│  dependencies: ["test → fix → refactor"]│
│  parallel_tasks: ["sub_perf", "sub_api"]│
│                                          │
│  ↑↑↑ All agents see the same state ↑↑↑  │
│                                          │
└─────────────────────────────────────────┘

   ↙        ↙        ↙        ↙
  Edit     Bash    Task    Skill
  ↓        ↓        ↓        ↓
memory_store() coordinates all results
```

This is the magic: **All agents coordinate through shared memory keys.**

---

## Real Example: Bug Fix Workflow

### OLD APPROACH (What's Wrong):
```python
orchestrate_task("Fix auth bug")
# [Hook: ✅ Orchestrate called, everything allowed]

# Problem: We don't know what's happening
Edit("src/auth.ts", ...)
Bash("npm test")
Task(subagent_type="tdd-test-generator", ...)
Skill(skill="tdd")
# [Hook: ✅ All allowed, orchestration prerequisite satisfied]

# Another Edit/Bash/Task without clear connection
Edit("src/utils.ts", ...)
# [Hook: ✅ Still allowed, no insight into what this is for]

# Result: Did we fix the bug? Did tests pass? No visibility.
```

### NEW APPROACH (How It Works):
```python
# 1. Orchestrate with clear scope
orchestrate_task("Fix authentication bug causing JWT token expiration after 5 minutes")
memory_store("main_task_id", "task-auth-jwt-fix-20250125")

# 2. First subtask: Write failing test
memory_store("subtask_test", json.dumps({
    "status": "in_progress",
    "description": "Create fail-to-pass test reproducing JWT expiration",
    "tool_chain": ["Edit", "Bash"]
}))

Edit("tests/auth.test.ts", old_test, new_test)
Bash("npm test -- auth.test.ts")  # FAILS (RED)

memory_store("test_results", json.dumps({
    "subtask": "subtask_test",
    "status": "RED",
    "failure": "JWT token expires after 5 minutes"
}))

# 3. Second subtask: Fix the bug
memory_store("subtask_fix", json.dumps({
    "status": "in_progress",
    "description": "Implement JWT token refresh logic",
    "depends_on": "subtask_test"
}))

Edit("src/auth/jwt.ts", old_logic, new_logic)
Bash("npm test -- auth.test.ts")  # PASSES (GREEN)

memory_store("test_results", json.dumps({
    "subtask": "subtask_fix",
    "status": "GREEN",
    "coverage": "98%"
}))
update_subtask_status("subtask_fix", "completed")

# 4. Third subtask: Refactor
memory_store("subtask_refactor", json.dumps({
    "status": "in_progress",
    "description": "Refactor JWT logic for maintainability"
}))

Edit("src/auth/jwt.ts", old_style, new_style)
Bash("npm test -- auth.test.ts")  # STILL PASSES

memory_store("test_results", json.dumps({
    "subtask": "subtask_refactor",
    "status": "PASS",
    "coverage": "98%"
}))
update_subtask_status("subtask_refactor", "completed")

# 5. Validate and adapt
orchestrate_task("Run quality gates on JWT fix")
memory_store("quality_gates", json.dumps({
    "coverage": "98%",
    "mutation_score": "95%",
    "flakiness": "0%",
    "regressions": "none"
}))
update_subtask_status("subtask_test", "completed")

# RESULT: Complete audit trail
# - What was fixed? task-auth-jwt-fix-20250125
# - How was it fixed? subtask_test → subtask_fix → subtask_refactor
# - What results? All test_results, coverage, mutations logged
# - Is it complete? quality_gates passed
# - Is it safe? No regressions detected
```

---

## Why Claude Code Should Use This

1. **Claude Code orchestrates complex multi-step tasks**
   - Bug fixes (reproduce → fix → refactor)
   - Feature implementation (design → build → test → integrate)
   - Refactoring (analyze → plan → refactor → validate)

2. **Visibility into AI execution**
   - Users can see what Claude did and why
   - Results are traceable through memory
   - Can monitor progress in real-time

3. **Safe parallel execution**
   - ProSWARM coordinates dependencies
   - Independent subtasks run safely in parallel
   - Results merge through shared memory

4. **Adaptive development**
   - Can start with rough orchestration
   - Refine decomposition as complexity emerges
   - Multiple orchestration cycles improve results

5. **Compliance & Audit**
   - Every change is linked to a subtask
   - Every subtask is in the memory log
   - Complete audit trail of all work

---

## The Shift in Thinking

**Old Mental Model:**
> "Call orchestrate_task() first, then do whatever you need to do."

**New Mental Model:**
> "ProSWARM IS your execution framework. Orchestration, coordination, and results flow through it. Don't work around it—work through it."

---

## Success Criteria

You'll know the new orchestration is working when:

✅ **Visibility**
- Can see `main_task_id` for every task
- Can list active subtasks and their status
- Can see all results in memory keys

✅ **Coordination**
- Subtasks are activated before work
- Results are stored in standard memory keys
- Progress is tracked via `update_subtask_status()`

✅ **Safety**
- Parallel subtasks are explicitly marked
- Dependencies are declared
- Hook prevents orphaned work

✅ **Completeness**
- Every tool use is tied to a subtask
- Every result is coordinated through memory
- Session state shows complete task lifecycle

✅ **Traceability**
- Memory operation log shows everything
- Can replay task from log if needed
- Complete audit trail exists

---

## Next Steps

1. **Enable new hook**: Point Claude Code to `enforce-proswarm-orchestration.py`
2. **Clear session**: `rm ~/.claude/state/proswarm_orchestration.json`
3. **Read quick reference**: `PROSWARM_QUICK_REFERENCE.md`
4. **Try it out**: Follow the patterns in the examples
5. **Monitor**: Check session state and memory log

---

## Summary

**Old Hook:** "Did you call orchestrate_task()?" → Gate model

**New Hook:** "Is your work coordinated through ProSWARM?" → Platform model

The difference is everything. ProSWARM goes from being a prerequisite you check off to being the actual execution platform that orchestrates, coordinates, and tracks all your work.

This is how Claude Code becomes a true intelligent agent: not by calling functions in sequence, but by operating within a coordinated, observable, adaptable execution framework.
