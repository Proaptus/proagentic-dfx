# ProSWARM Neural Model Selection Guide

## ProSWARM + Claude: One Unified System

**CRITICAL**: ProSWARM orchestrates, Claude executes. They work as ONE system.

- ProSWARM's neural models (70+) decompose and classify tasks
- The neural model name (`bug_router`, `llm_gpt_oss_120b`, etc.) is for DECOMPOSITION only
- Claude model selection (opus/sonnet/haiku) is based on the TASK KEYWORDS

## Claude Model Routing (Task-Keyword Based)

Model selection uses **3 dimensions**:
```
Final Model = max(task_keywords, topology, pipeline_stage)
```

**Priority Order**: OPUS → SONNET → HAIKU → default(sonnet)

---

## Dimension 1: Execution Topology

| Topology | Description | Model Strategy |
|----------|-------------|----------------|
| **Linear** | A → B → C | Haiku throughout |
| **Fan-Out** | A → (B, C, D) parallel | Haiku in parallel |
| **Fan-In** | (B, C, D) → A aggregation | Sonnet/Opus at junction |
| **Connected** | Mixed dependencies | Haiku at leaves, Opus at junctions |
| **Cyclic** | Bidirectional deps | Opus throughout |

### Visual Guide
```
LINEAR (Haiku):        FAN-OUT (Haiku):       FAN-IN (Sonnet at D):
A → B → C              A → B                  B ─┐
                       A → C                  C ─┼→ D
                       A → D                  E ─┘

CONNECTED (Mixed):                CYCLIC (Opus all):
A → B ─┐                          A ←→ B
A → C ─┼→ E (Opus)                ↑↓    ↑↓
A → D ─┘                          C ←→ D
```

---

## Dimension 2: Pipeline Stage

ProSWARM orchestrates; Claude executes:

```
EXPLORATION → DECOMPOSITION → EXECUTION → AGGREGATION → FINAL REVIEW
  (ProSWARM)    (ProSWARM)     (Claude)     (Claude)      (Claude)
```

| Stage | Who | Claude Model |
|-------|-----|--------------|
| Exploration | ProSWARM | - |
| Decomposition | ProSWARM | - |
| Execution | Claude | Based on task keywords |
| Aggregation | Claude | `sonnet` minimum |
| **Final Review** | Claude | **upgrade from execution** |

### Critical Rule: Final Reviews
```javascript
function getReviewModel(executionModel) {
  if (executionModel === 'haiku') return 'sonnet';
  return 'opus'; // Sonnet/Opus → Opus review
}
```

---

## Dimension 3: Task Keywords (PRIMARY)

| Keywords | Model |
|----------|-------|
| architecture, security audit, distributed, microservice, encryption, payment, race condition, memory leak, data integrity, migration strategy | `opus` |
| implement feature, add endpoint, fix bug, unit test, refactor function, api route | `sonnet` |
| typo, rename, lint, format, config change, env variable, version bump | `haiku` |

---

## Agent-Specific Defaults

| Agent | Default | When Opus | When Haiku |
|-------|---------|-----------|------------|
| **proswarm-orchestrator** | `sonnet` | Cyclic dependencies, 5+ subtasks | Never |
| **proswarm-executor** | `sonnet` | Tier 3 models, junction nodes | Leaf nodes, Tier 1 |
| **proswarm-model-selector** | `sonnet` | Complex classification | **Never** (misclassifies) |
| **proswarm-memory-manager** | `haiku` | Conflict resolution | Always |
| **Explore** | `haiku` | Architecture analysis | File discovery |

> ⚠️ **VALIDATED**: Haiku misclassifies complex tasks. Model-selector requires Sonnet.

---

## Quick Decision Flowchart

```
START
  │
  ├─ Is topology cyclic? ──────────────────────► YES: Opus
  │
  ├─ Is this an aggregation node (3+ deps)? ───► YES: Sonnet minimum
  │
  ├─ Is this final review phase? ──────────────► YES: Upgrade from execution model
  │
  ├─ Does task use Tier 3 neural model? ───────► YES: Opus
  │
  ├─ Does task use Tier 2 neural model? ───────► YES: Sonnet
  │
  ├─ Contains Opus keywords? ──────────────────► YES: Opus
  │
  ├─ Contains Haiku keywords? ─────────────────► YES: Haiku
  │
  └─ Default ──────────────────────────────────► Sonnet
```

---

## CRITICAL: Task Tool Syntax

`subagent_type` ≠ `model` - They are **separate parameters**!

```javascript
// CORRECT syntax:
Task({
  subagent_type: 'proswarm-executor',  // Which agent to run
  model: 'opus',                        // Which Claude model powers it
  prompt: '...',
  description: '...'
});

// WRONG - 'haiku' is a model, not an agent!
Task({ subagent_type: 'haiku', ... });  // ERROR!
```

**Valid subagent_type:** `proswarm-executor`, `proswarm-orchestrator`, `proswarm-model-selector`, `Explore`, `general-purpose`

**Valid model:** `opus`, `sonnet`, `haiku`

---

## Spawning Examples

```javascript
// Cyclic graph - Opus throughout
Task({
  subagent_type: 'proswarm-executor',
  model: 'opus',
  prompt: 'Implement bidirectional sync between services',
  description: 'Complex sync implementation'
});

// Fan-out parallel - Haiku for speed (send ALL in one message)
Task({
  subagent_type: 'proswarm-executor',
  model: 'haiku',
  prompt: 'Run lint check',
  description: 'Lint check'
});
Task({
  subagent_type: 'proswarm-executor',
  model: 'haiku',
  prompt: 'Run format check',
  description: 'Format check'
});
Task({
  subagent_type: 'proswarm-executor',
  model: 'haiku',
  prompt: 'Run type check',
  description: 'Type check'
});

// Aggregation junction - Sonnet for synthesis
Task({
  subagent_type: 'proswarm-executor',
  model: 'sonnet',
  prompt: 'Combine test results and generate report',
  description: 'Aggregate results'
});

// Final review - Always upgrade from execution model
Task({
  subagent_type: 'proswarm-executor',
  model: 'opus',  // If execution used sonnet, review uses opus
  prompt: 'Review all changes, validate integration',
  description: 'Final review'
});
```

---

## Cost Optimization

| Model | Input | Output | Strategy |
|-------|-------|--------|----------|
| Opus | $15/MTok | $75/MTok | Reserve for junctions, reviews, Tier 3 |
| Sonnet | $3/MTok | $15/MTok | Default for execution, decomposition |
| Haiku | $0.25/MTok | $1.25/MTok | Aggressive parallel, leaves, exploration |

**Goal**: Maximize Haiku at leaves, minimize Opus to critical paths.

---

## Quick Selection Matrix

### By Task Keywords

| Keywords in Task | Primary Model | Secondary Models |
|-----------------|---------------|------------------|
| "test", "testing", "coverage" | `test_optimizer` | `test_coverage_analyzer`, `edge_case_generator` |
| "bug", "error", "crash", "fix" | `bug_router` | `crash_analyzer`, `race_condition_finder` |
| "api", "endpoint", "REST" | `api_builder` | `endpoint_optimizer`, `api_security_hardener` |
| "performance", "slow", "optimize" | `performance_bug_analyzer` | `profiler_analyzer`, `memory_leak_hunter` |
| "security", "vulnerability" | `security_audit_planner` | `penetration_test_planner`, `api_security_hardener` |
| "refactor", "clean", "organize" | `refactor_planner` | `code_splitter`, `component_splitter` |
| "docker", "container" | `docker_optimizer` | `k8s_manifest_generator` |
| "scale", "load", "traffic" | `scaling_planner` | `cache_strategy_planner`, `rate_limiter_designer` |

## Complete Model Catalog (70 Models)

### Testing & Quality Assurance (11 models)
```javascript
// Comprehensive testing
"test_optimizer"           // Optimize test suites (unit, integration, e2e)
"test_coverage_analyzer"   // Identify coverage gaps
"regression_suite_builder" // Build regression test suites
"test_mock_recommender"    // Recommend mocks for testing
"test_data_generator"      // Generate test fixtures
"test_flakyness_detector"  // Find and fix flaky tests
"test_parallelizer"        // Parallelize test execution
"edge_case_generator"      // Generate edge test cases
// Example usage
const testTask = await predict_decomposition("Optimize our test suite");
// Automatically uses: test_optimizer, test_parallelizer
```

### Bug Analysis & Resolution (5 models)
```javascript
"bug_router"               // Classify bugs (critical/high/medium/low)
"crash_analyzer"           // Analyze crash dumps and stack traces
"race_condition_finder"    // Detect concurrency issues
"memory_leak_hunter"       // Find memory leaks
"performance_bug_analyzer" // Identify performance bottlenecks
// Example usage
const bugFix = await predict_decomposition("Fix authentication crash");
// Automatically uses: bug_router, crash_analyzer
```

### API Development (6 models)
```javascript
"api_builder"              // Build REST/GraphQL endpoints
"endpoint_optimizer"       // Optimize API performance
"api_security_hardener"    // Secure APIs (JWT, CORS, validation)
"api_versioner"           // Manage API versions
"api_doc_generator"       // Generate API documentation
"webhook_builder"         // Create webhooks
// Example usage
const apiTask = await predict_decomposition("Build user management API");
// Automatically uses: api_builder, api_security_hardener, api_doc_generator
```

### Performance Optimization (8 models)
```javascript
"performance_bug_analyzer" // Find performance issues
"profiler_analyzer"       // Analyze CPU/memory profiles
"memory_leak_hunter"      // Detect memory leaks
"cache_strategy_planner"  // Design caching strategies
"bundle_optimizer"        // Optimize JavaScript bundles
"query_optimizer"         // Optimize database queries
"lazy_loading_planner"    // Implement lazy loading
"css_optimizer"          // Optimize CSS
// Example usage
const perfTask = await predict_decomposition("Optimize page load time");
// Automatically uses: performance_bug_analyzer, bundle_optimizer, lazy_loading_planner
```

### Security & Compliance (5 models)
```javascript
"security_audit_planner"   // Plan security audits
"penetration_test_planner" // Plan penetration tests
"api_security_hardener"    // Harden API security
"encryption_planner"       // Plan encryption strategies
"license_auditor"         // Audit licenses
// Example usage
const securityTask = await predict_decomposition("Perform security audit");
// Automatically uses: security_audit_planner, penetration_test_planner
```

### Code Organization & Refactoring (10 models)
```javascript
"refactor_planner"        // Plan refactoring strategies
"code_splitter"          // Split code modules
"component_splitter"     // Split React/Vue components
"abstraction_extractor"  // Extract abstractions
"service_decomposer"     // Decompose into microservices
"module_migrator"        // Migrate modules
"naming_optimizer"       // Optimize naming conventions
"code_smell_detector"    // Detect code smells
"legacy_modernizer"      // Modernize legacy code
"dependency_analyzer"    // Analyze dependencies
// Example usage
const refactorTask = await predict_decomposition("Refactor authentication module");
// Automatically uses: refactor_planner, code_splitter, abstraction_extractor
```

### Infrastructure & DevOps (8 models)
```javascript
"ci_pipeline_builder"      // Build CI/CD pipelines
"docker_optimizer"         // Optimize Docker images
"k8s_manifest_generator"   // Generate Kubernetes configs
"scaling_planner"          // Plan scaling strategies
"monitoring_planner"       // Setup monitoring
"backup_planner"          // Plan backup strategies
"cdn_planner"             // Configure CDN
"db_sharding_planner"     // Plan database sharding
// Example usage
const infraTask = await predict_decomposition("Setup CI/CD pipeline");
// Automatically uses: ci_pipeline_builder, docker_optimizer
```

### UI/UX & Frontend (4 models)
```javascript
"responsive_designer"      // Design responsive layouts
"animation_builder"       // Build animations
"form_validator_builder"  // Build form validation
"accessibility_improver"  // Improve accessibility
// Example usage
const uiTask = await predict_decomposition("Make dashboard responsive");
// Automatically uses: responsive_designer, css_optimizer
```

### Database & Data (5 models)
```javascript
"schema_migrator"         // Migrate database schemas
"orm_migrator"           // Migrate ORM configurations
"query_optimizer"        // Optimize queries
"index_planner"         // Plan database indexes
"data_archiver"         // Archive old data
// Example usage
const dbTask = await predict_decomposition("Optimize database performance");
// Automatically uses: query_optimizer, index_planner
```

### Documentation (4 models)
```javascript
"doc_generator_planner"   // Plan documentation generation
"api_doc_generator"      // Generate API docs
"readme_builder"         // Build README files
"tutorial_planner"       // Plan tutorials
// Example usage
const docTask = await predict_decomposition("Generate project documentation");
// Automatically uses: doc_generator_planner, readme_builder
```

### Specialized Features (4 models)
```javascript
"i18n_planner"           // Plan internationalization
"ssr_planner"           // Plan server-side rendering
"image_optimizer_planner" // Optimize images
"rate_limiter_designer"  // Design rate limiting
// Example usage
const i18nTask = await predict_decomposition("Add multi-language support");
// Automatically uses: i18n_planner
```

## Model Selection Algorithm

```javascript
function selectOptimalModels(taskDescription) {
  const keywords = taskDescription.toLowerCase();
  const selectedModels = [];

  // Priority 1: Bug fixes
  if (keywords.match(/bug|error|crash|fix/)) {
    selectedModels.push('bug_router');
    if (keywords.includes('memory')) selectedModels.push('memory_leak_hunter');
    if (keywords.includes('race')) selectedModels.push('race_condition_finder');
  }

  // Priority 2: Testing
  if (keywords.match(/test|coverage|mock/)) {
    selectedModels.push('test_optimizer');
    if (keywords.includes('coverage')) selectedModels.push('test_coverage_analyzer');
    if (keywords.includes('flaky')) selectedModels.push('test_flakyness_detector');
  }

  // Priority 3: Performance
  if (keywords.match(/performance|slow|optimize/)) {
    selectedModels.push('performance_bug_analyzer');
    if (keywords.includes('memory')) selectedModels.push('memory_leak_hunter');
    if (keywords.includes('bundle')) selectedModels.push('bundle_optimizer');
  }

  // Priority 4: Security
  if (keywords.match(/security|vulnerability|audit/)) {
    selectedModels.push('security_audit_planner');
    if (keywords.includes('api')) selectedModels.push('api_security_hardener');
  }

  // Priority 5: Architecture
  if (keywords.match(/refactor|clean|organize/)) {
    selectedModels.push('refactor_planner');
    if (keywords.includes('split')) selectedModels.push('code_splitter');
  }

  return selectedModels;
}
```

## Confidence Thresholds

| Confidence Level | Action |
|-----------------|--------|
| > 0.9 | Execute automatically |
| 0.7 - 0.9 | Execute with monitoring |
| 0.5 - 0.7 | Request user confirmation |
| < 0.5 | Decompose further or request clarification |

## Model Combination Patterns

### Pattern 1: Full Stack Feature
```javascript
const models = [
  'api_builder',          // Backend API
  'component_splitter',   // Frontend components
  'state_manager_planner', // State management
  'test_optimizer'        // Testing
];
```

### Pattern 2: Performance Optimization
```javascript
const models = [
  'performance_bug_analyzer', // Identify issues
  'profiler_analyzer',        // Profile code
  'bundle_optimizer',         // Optimize bundles
  'cache_strategy_planner'    // Add caching
];
```

### Pattern 3: Security Hardening
```javascript
const models = [
  'security_audit_planner',   // Plan audit
  'penetration_test_planner', // Plan tests
  'api_security_hardener',    // Secure APIs
  'encryption_planner'        // Encrypt data
];
```

## Tips for Model Selection

1. **Be specific in task descriptions** - More detail = better model selection
2. **Trust automatic selection** - ProSWARM has 84.8% accuracy
3. **Check confidence scores** - Low confidence may need clarification
4. **Use multiple models** - Complex tasks benefit from multiple perspectives
5. **Monitor model performance** - Track which models work best for your use cases

---

*Remember: ProSWARM automatically selects the best models based on your task description. This guide helps you understand the selection process.*