# ProSWARM Neural Orchestration Skill

## Overview

ProSWARM Neural Orchestration is a comprehensive skill that transforms Claude into a hyper-intelligent task orchestrator using 70+ specialized neural models for instant task decomposition and parallel execution.

## Core Capabilities

### 1. Neural Task Decomposition
- **70+ Specialized Models**: Each model trained for specific task types
- **<1ms Inference**: Instant task classification and planning
- **Domain Expertise**: Models for testing, bugs, APIs, performance, security, and more
- **Confidence Scoring**: Each prediction includes reliability metrics

### 2. Continuous Orchestration
- **Task Lifecycle Management**: From initialization to completion
- **Dynamic Workspace Creation**: Isolated environments for each task
- **Parallel Execution**: Run independent subtasks simultaneously
- **Adaptive Refinement**: Continuously improve plans based on results

### 3. Shared Memory System
- **Inter-Agent Communication**: Perfect data sharing between agents
- **Session Persistence**: Memory lasts throughout task execution
- **JSON Support**: Handle complex data structures
- **Coordination Protocol**: Standardized memory keys for common data

## Installation

### Prerequisites
```bash
# Ensure ProSWARM MCP is installed
npm install -g pro-swarm

# Or use directly with npx
npx pro-swarm --version
```

### MCP Configuration
Add to your `.mcp.json`:
```json
{
  "mcpServers": {
    "proswarm-neural": {
      "command": "npx",
      "args": ["pro-swarm", "mcp", "start"],
      "env": {
        "PROSWARM_WORKSPACE": "${HOME}/projects"
      }
    }
  }
}
```

### Skill Installation
1. Copy this skill to any Claude project:
```bash
cp -r /path/to/proswarm-skill/.claude/skills/proswarm /your/project/.claude/skills/
```

2. Copy subagents:
```bash
cp /path/to/proswarm-skill/.claude/agents/proswarm-*.md /your/project/.claude/agents/
```

3. Verify installation:
```bash
ls -la .claude/skills/proswarm/
ls -la .claude/agents/proswarm-*.md
```

## Usage Guide

### Basic Orchestration
```javascript
// Start any complex task
"Implement a user authentication system with JWT tokens"
// ProSWARM automatically:
// 1. Orchestrates the task
// 2. Decomposes into subtasks
// 3. Selects appropriate neural models
// 4. Executes in parallel where possible
```

### Model Categories

#### Testing & Quality (11 models)
- `test_optimizer`: Optimize test suites
- `test_coverage_analyzer`: Identify coverage gaps
- `regression_suite_builder`: Build regression tests
- `test_mock_recommender`: Suggest mocks
- `test_data_generator`: Create test fixtures
- `test_flakyness_detector`: Find flaky tests
- `test_parallelizer`: Parallelize test execution
- `edge_case_generator`: Generate edge cases

#### Bug Analysis & Fixing (6 models)
- `bug_router`: Classify bug severity
- `crash_analyzer`: Analyze crash dumps
- `race_condition_finder`: Detect race conditions
- `memory_leak_hunter`: Find memory leaks
- `performance_bug_analyzer`: Optimize performance

#### API Development (6 models)
- `api_builder`: Build REST endpoints
- `endpoint_optimizer`: Optimize API performance
- `api_security_hardener`: Secure APIs
- `api_versioner`: Version management
- `api_doc_generator`: Generate documentation
- `webhook_builder`: Create webhooks

#### Performance Optimization (8 models)
- `performance_bug_analyzer`: Find performance bugs
- `profiler_analyzer`: Analyze profiles
- `memory_leak_hunter`: Detect leaks
- `cache_strategy_planner`: Plan caching
- `bundle_optimizer`: Optimize bundles
- `query_optimizer`: Optimize queries
- `lazy_loading_planner`: Implement lazy loading
- `css_optimizer`: Optimize CSS

#### Security & Compliance (5 models)
- `security_audit_planner`: Plan audits
- `penetration_test_planner`: Plan pen tests
- `api_security_hardener`: Harden APIs
- `encryption_planner`: Plan encryption
- `license_auditor`: Audit licenses

#### Infrastructure & DevOps (8 models)
- `ci_pipeline_builder`: Build CI/CD
- `docker_optimizer`: Optimize containers
- `k8s_manifest_generator`: Generate K8s configs
- `scaling_planner`: Plan scaling
- `monitoring_planner`: Setup monitoring
- `backup_planner`: Plan backups
- `cdn_planner`: CDN configuration
- `db_sharding_planner`: Database sharding

#### Code Organization (10 models)
- `refactor_planner`: Plan refactoring
- `code_splitter`: Split code modules
- `component_splitter`: Split components
- `abstraction_extractor`: Extract abstractions
- `service_decomposer`: Decompose services
- `module_migrator`: Migrate modules
- `naming_optimizer`: Optimize naming
- `code_smell_detector`: Detect code smells
- `legacy_modernizer`: Modernize legacy code
- `dependency_analyzer`: Analyze dependencies

### Memory Protocol

#### Standard Keys
```javascript
// Task Management
"main_task_id"        // Primary task ID
"current_phase"       // Current execution phase
"subtask_count"       // Number of subtasks
"subtask_{id}"        // Individual subtask data

// Results
"test_results"        // Test execution results
"api_endpoints"       // Created API endpoints
"bug_fixes"          // Applied bug fixes
"performance_metrics" // Performance measurements

// Coordination
"agent_assignments"   // Agent task assignments
"parallel_tasks"     // Tasks running in parallel
"dependencies"       // Task dependencies
"completion_status"  // Completion tracking
```

## Advanced Patterns

### Pattern 1: Complex Bug Fix
```javascript
// User: "Fix the authentication bug causing session timeouts"

// ProSWARM automatically:
1. Classifies with bug_router → "auth", "high priority"
2. Analyzes with crash_analyzer → identifies timeout source
3. Orchestrates fix:
   - auth_implementer → fix session logic
   - test_optimizer → create tests
   - regression_suite_builder → prevent regression
4. Executes in parallel where possible
5. Validates with test execution
```

### Pattern 2: Full Feature Implementation
```javascript
// User: "Build a real-time chat feature"

// ProSWARM orchestrates:
1. Decomposes with multiple models:
   - api_builder → WebSocket endpoints
   - component_splitter → UI components
   - state_manager_planner → state management
   - test_optimizer → test suite

2. Parallel execution:
   - Backend API (api_builder, webhook_builder)
   - Frontend UI (component_splitter, responsive_designer)
   - Testing (test_optimizer, edge_case_generator)
   - Infrastructure (scaling_planner, monitoring_planner)
```

### Pattern 3: Performance Optimization
```javascript
// User: "Optimize the app's loading time"

// ProSWARM coordinates:
1. Analysis phase (parallel):
   - profiler_analyzer → identify bottlenecks
   - bundle_optimizer → analyze bundle size
   - query_optimizer → check DB queries

2. Optimization phase:
   - lazy_loading_planner → implement lazy loading
   - cache_strategy_planner → add caching
   - css_optimizer → optimize styles
   - image_optimizer_planner → optimize images

3. Validation:
   - performance_bug_analyzer → verify improvements
   - test_optimizer → ensure no regressions
```

## Troubleshooting

### Issue: ProSWARM not responding
```bash
# Check MCP server status
ps aux | grep pro-swarm

# Restart MCP server
pkill -f "pro-swarm"
npx pro-swarm mcp start
```

### Issue: Memory not persisting
```javascript
// Always use JSON.stringify for complex objects
await memory_store("data", JSON.stringify(complexObject));

// Parse when retrieving
const data = JSON.parse(await memory_get("data"));
```

### Issue: Task not decomposing properly
```javascript
// Be specific in task descriptions
// ❌ "Fix bug"
// ✅ "Fix authentication bug causing JWT token expiration"

// Use appropriate model selection
const decomposition = await predict_decomposition(
  "Fix React performance issues" // Will trigger performance models
);
```

## Performance Benchmarks

| Metric | ProSWARM | Industry Average | Improvement |
|--------|----------|------------------|-------------|
| Task Decomposition | <1ms | 100ms | 100x |
| Orchestration | 4-7ms | 50-100ms | 10x |
| SWE-Bench Accuracy | 84.8% | 70.3% | +14.5% |
| Token Usage | -32.3% | Baseline | 32% savings |
| Parallel Speedup | 2.8-4.4x | Sequential | 4x faster |

## Integration with Other Skills

### With TDD Skill
ProSWARM can orchestrate test-first development:
1. Decompose requirements into test specifications
2. Store specs in shared memory
3. TDD skill retrieves and executes test-first workflow

### With Dev Planning Skill
ProSWARM enhances planning:
1. Orchestrate comprehensive planning phase
2. Use neural models for accurate task breakdown
3. Store plan in memory for execution

### With UAT Automation
ProSWARM coordinates testing:
1. Decompose UAT requirements
2. Orchestrate parallel test execution
3. Aggregate results in shared memory

## Best Practices

### DO ✅
- **Always start with orchestrate_task()** for any complex work
- **Use memory_store() liberally** to share data between agents
- **Select models based on task type** for optimal results
- **Decompose continuously** as new complexity emerges
- **Execute in parallel** when tasks are independent
- **Trust the neural models** - they have 84.8% accuracy

### DON'T ❌
- **Don't skip orchestration** for complex tasks
- **Don't use ProSWARM for single-step tasks**
- **Don't forget to store intermediate results**
- **Don't execute dependent tasks in parallel**
- **Don't ignore model confidence scores**
- **Don't treat ProSWARM as a one-time tool**

## Customization

### Adding Custom Memory Keys
```javascript
// Define project-specific keys
const PROJECT_KEYS = {
  DB_SCHEMA: "project_db_schema",
  API_SPEC: "project_api_spec",
  TEST_CONFIG: "project_test_config"
};

// Use consistently across agents
await memory_store(PROJECT_KEYS.DB_SCHEMA, schema);
```

### Model Selection Strategy
```javascript
// Create model selection logic
function selectModelsForTask(taskDescription) {
  const keywords = taskDescription.toLowerCase();

  if (keywords.includes("test")) {
    return ["test_optimizer", "test_coverage_analyzer"];
  }
  if (keywords.includes("performance")) {
    return ["performance_bug_analyzer", "profiler_analyzer"];
  }
  // ... more selections
}
```

## Contributing

To improve this skill:
1. Test with various task types
2. Document new patterns
3. Report issues with specific models
4. Suggest new memory protocol keys
5. Share performance benchmarks

## License

This skill is part of ProSWARM and follows the same dual license:
- Apache License 2.0
- MIT License

## Support

- **ProSWARM Docs**: https://docs.proswarm.dev
- **Issue Tracker**: https://github.com/pronet/pro-FANN/issues
- **Discord**: https://discord.gg/proswarm

---

*Built with ProSWARM - Achieving superhuman performance through neural orchestration*