# ProSWARM Orchestration Plan Template

## Task Overview
**Main Task**: [Your main task description]
**Complexity Level**: [Simple/Medium/Complex/Critical]
**Estimated Subtasks**: [Number]
**Parallel Execution Possible**: [Yes/No/Partial]

## Neural Model Selection
Based on task analysis, these models will be used:

### Primary Models
- [ ] **Model Name**: `model_id` - [Why this model is needed]
- [ ] **Model Name**: `model_id` - [Why this model is needed]
- [ ] **Model Name**: `model_id` - [Why this model is needed]

### Support Models
- [ ] **Model Name**: `model_id` - [May be used for specific subtasks]
- [ ] **Model Name**: `model_id` - [May be used for specific subtasks]

## Decomposition Strategy

### Phase 1: Initialization
```javascript
// Initialize main task
const mainTaskId = await orchestrate_task("[Main task description]");
await memory_store("main_task_id", mainTaskId);
await memory_store("task_type", "[bug_fix/feature/optimization/refactor]");
```

### Phase 2: Analysis & Decomposition
```javascript
// Decompose into subtasks
const decomposition = await predict_decomposition("[Main task description]");

// Store decomposition plan
await memory_store("decomposition_plan", JSON.stringify(decomposition));
await memory_store("subtask_count", decomposition.subtasks.length);
```

### Phase 3: Subtask Orchestration
```javascript
// Subtask 1: [Description]
const subtask1 = await orchestrate_task("[Subtask 1 description]");
// Model: [model_name] - [Why this model]

// Subtask 2: [Description]
const subtask2 = await orchestrate_task("[Subtask 2 description]");
// Model: [model_name] - [Why this model]

// Subtask 3: [Description]
const subtask3 = await orchestrate_task("[Subtask 3 description]");
// Model: [model_name] - [Why this model]
```

### Phase 4: Execution Strategy
```javascript
// Parallel execution (if independent)
await Promise.all([
  execute_plan(subtask1),
  execute_plan(subtask2),
  execute_plan(subtask3)
]);

// OR Sequential execution (if dependent)
await execute_plan(subtask1);
await execute_plan(subtask2); // Depends on subtask1
await execute_plan(subtask3); // Depends on subtask2
```

### Phase 5: Integration & Validation
```javascript
// Integration task
const integrationTask = await orchestrate_task("[Integration description]");
await execute_plan(integrationTask);

// Validation task
const validationTask = await orchestrate_task("[Validation description]");
await execute_plan(validationTask);
```

## Memory Management Plan

### Critical Data to Store
```javascript
// Task metadata
await memory_store("main_task_id", mainTaskId);
await memory_store("task_status", "in_progress");
await memory_store("start_time", Date.now());

// Task-specific data
await memory_store("[data_key_1]", JSON.stringify(data1));
await memory_store("[data_key_2]", JSON.stringify(data2));
await memory_store("[data_key_3]", JSON.stringify(data3));

// Results
await memory_store("subtask_results", JSON.stringify(results));
await memory_store("validation_status", "passed");
```

### Data Dependencies
- Subtask 2 requires: `[data from subtask 1]`
- Subtask 3 requires: `[data from subtask 2]`
- Integration requires: `[all subtask results]`

## Success Criteria
- [ ] All subtasks complete successfully
- [ ] Integration tests pass
- [ ] Performance metrics meet targets
- [ ] No regressions introduced
- [ ] Documentation updated

## Risk Mitigation
- **Risk 1**: [Description] → **Mitigation**: [Strategy]
- **Risk 2**: [Description] → **Mitigation**: [Strategy]
- **Risk 3**: [Description] → **Mitigation**: [Strategy]

## Monitoring & Metrics
```javascript
// Track execution time
const startTime = Date.now();
// ... execution ...
const duration = Date.now() - startTime;
await memory_store("execution_duration", duration);

// Track success rate
await memory_store("subtasks_completed", completedCount);
await memory_store("subtasks_failed", failedCount);
```

## Rollback Plan
If execution fails:
1. Retrieve last stable state from memory
2. Identify failure point
3. Rollback changes
4. Re-orchestrate with adjusted parameters

## Notes
- [Any additional considerations]
- [Dependencies or prerequisites]
- [Known limitations]