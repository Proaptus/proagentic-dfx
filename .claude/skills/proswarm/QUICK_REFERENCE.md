# ProSWARM Quick Reference

## 🚀 Essential Commands

```javascript
// ALWAYS START WITH THIS
const taskId = await orchestrate_task("Your task description");
await memory_store("main_task_id", taskId);

// Decompose tasks
const plan = await predict_decomposition("Task to break down");

// Execute plan
await execute_plan(taskId);

// Store/retrieve data
await memory_store("key", JSON.stringify(data));
const data = JSON.parse(await memory_get("key"));
```

## 🧠 Model Selection (Top 20)

| Task | Model | Use Case |
|------|-------|----------|
| **Bug Fixing** | `bug_router` | Classify bug severity |
| | `crash_analyzer` | Analyze crashes |
| | `race_condition_finder` | Find race conditions |
| **Testing** | `test_optimizer` | Optimize test suites |
| | `test_coverage_analyzer` | Find coverage gaps |
| | `edge_case_generator` | Generate edge cases |
| **API** | `api_builder` | Build REST endpoints |
| | `endpoint_optimizer` | Optimize APIs |
| | `api_security_hardener` | Secure APIs |
| **Performance** | `performance_bug_analyzer` | Find perf issues |
| | `memory_leak_hunter` | Detect memory leaks |
| | `profiler_analyzer` | Analyze profiles |
| **Security** | `security_audit_planner` | Plan security audits |
| | `penetration_test_planner` | Plan pen tests |
| **Refactoring** | `refactor_planner` | Plan refactoring |
| | `code_splitter` | Split code modules |
| **Infrastructure** | `ci_pipeline_builder` | Build CI/CD |
| | `docker_optimizer` | Optimize Docker |
| | `k8s_manifest_generator` | Generate K8s configs |
| | `scaling_planner` | Plan scaling |

## 📦 Memory Keys

```javascript
// Standard keys
"main_task_id"          // Primary task
"current_phase"         // Execution phase
"subtask_{id}"          // Subtask data
"test_results"          // Test results
"api_endpoints"         // API endpoints
"bug_fixes"            // Bug fixes
"agent_assignments"     // Agent tasks
"parallel_tasks"       // Parallel work
```

## ⚡ Common Patterns

### Bug Fix
```javascript
const bugTask = await orchestrate_task("Fix auth bug");
await memory_store("bug_type", "authentication");
await execute_plan(bugTask);
```

### Feature Implementation
```javascript
const feature = await orchestrate_task("Build user dashboard");
const decomp = await predict_decomposition(feature);
// Executes API, UI, and tests in parallel
await execute_plan(feature);
```

### Performance Optimization
```javascript
const perfTask = await orchestrate_task("Optimize app performance");
await memory_store("baseline_metrics", JSON.stringify(metrics));
await execute_plan(perfTask);
```

## 🎯 Task Type → Model Map

| If task contains... | Use these models |
|-------------------|------------------|
| "test", "coverage" | test_optimizer, test_coverage_analyzer |
| "bug", "fix", "error" | bug_router, crash_analyzer |
| "api", "endpoint" | api_builder, endpoint_optimizer |
| "performance", "slow" | performance_bug_analyzer, profiler_analyzer |
| "security", "vulnerability" | security_audit_planner, api_security_hardener |
| "refactor", "clean" | refactor_planner, code_splitter |
| "docker", "k8s" | docker_optimizer, k8s_manifest_generator |
| "scale", "load" | scaling_planner, cache_strategy_planner |

## 🔄 Workflow Steps

1. **Initialize**: `orchestrate_task()` → store task_id
2. **Decompose**: `predict_decomposition()` → get subtasks
3. **Store Context**: `memory_store()` → share data
4. **Execute**: `execute_plan()` → run tasks
5. **Iterate**: Repeat for emerging subtasks

## ⚠️ Critical Rules

1. **ALWAYS orchestrate first** - Never skip initialization
2. **Store everything** - Use memory for ALL data sharing
3. **Decompose continuously** - Not just once
4. **Execute in parallel** - When tasks are independent
5. **Use right models** - Match model to task type

## 📊 Performance Stats

- Task decomposition: **<1ms**
- Orchestration: **4-7ms**
- SWE-Bench accuracy: **84.8%**
- Token savings: **32.3%**
- Parallel speedup: **2.8-4.4x**

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| ProSWARM not responding | Restart: `npx pro-swarm mcp start` |
| Memory not persisting | Use `JSON.stringify/parse` |
| Wrong model selected | Be specific in task description |
| Tasks not parallel | Check dependencies first |

---
**Remember**: ProSWARM is your PRIMARY workflow, not a tool!