# ProSWARM Usage Examples

## Example 1: Full-Stack Feature Implementation

### Scenario
"Implement a complete user profile system with avatar upload, bio editing, and social links"

### ProSWARM Orchestration
```javascript
// Step 1: Initialize main task
const mainTaskId = await orchestrate_task(
  "Implement user profile system with avatar, bio, and social links"
);
await memory_store("main_task_id", mainTaskId);

// Step 2: Decompose into subtasks (happens automatically)
// ProSWARM uses these models:
// - api_builder: Creates profile endpoints
// - component_splitter: Designs UI components
// - state_manager_planner: Plans state management
// - test_optimizer: Generates test suite

// Step 3: Store specifications
await memory_store("profile_schema", JSON.stringify({
  avatar: "string (URL)",
  bio: "string (max 500 chars)",
  socialLinks: "array of {platform, url}"
}));

// Step 4: Execute parallel subtasks
const apiTask = await orchestrate_task("Build profile API endpoints");
const uiTask = await orchestrate_task("Create profile UI components");
const uploadTask = await orchestrate_task("Implement avatar upload");
const testTask = await orchestrate_task("Write comprehensive tests");

// Step 5: Execute all in parallel
await Promise.all([
  execute_plan(apiTask),
  execute_plan(uiTask),
  execute_plan(uploadTask),
  execute_plan(testTask)
]);

// Step 6: Integration task
const integrationTask = await orchestrate_task("Integrate all profile components");
await execute_plan(integrationTask);
```

### Expected Outcome
- REST API with CRUD operations for profiles
- React components for profile display/edit
- Avatar upload with image optimization
- Full test coverage (unit + integration)
- State management with Context/Redux
- Input validation and error handling

---

## Example 2: Critical Bug Fix with Testing

### Scenario
"Users report that the shopping cart loses items after 5 minutes of inactivity"

### ProSWARM Orchestration
```javascript
// Step 1: Classify and analyze bug
const bugTaskId = await orchestrate_task(
  "Fix shopping cart timeout bug losing items after 5 minutes"
);

// Step 2: ProSWARM automatically selects models:
// - bug_router: Classifies as "high priority, state management"
// - crash_analyzer: Identifies session timeout issue
// - race_condition_finder: Checks for timing issues
// - test_optimizer: Creates reproduction test

// Step 3: Store bug context
await memory_store("bug_details", JSON.stringify({
  type: "state_persistence",
  severity: "high",
  component: "shopping_cart",
  timeout: "5_minutes"
}));

// Step 4: Create reproduction test first (TDD approach)
const reproTest = await orchestrate_task(
  "Create failing test that reproduces cart timeout bug"
);
await execute_plan(reproTest);

// Step 5: Implement fix
const fixTask = await orchestrate_task(
  "Implement session persistence for shopping cart"
);
await execute_plan(fixTask);

// Step 6: Verify fix and add regression tests
const verifyTask = await orchestrate_task(
  "Verify cart persistence and add regression tests"
);
await execute_plan(verifyTask);

// Step 7: Store fix documentation
await memory_store("bug_fix_applied", JSON.stringify({
  solution: "Implemented localStorage persistence with session sync",
  files_modified: ["CartContext.tsx", "useCart.ts", "api/cart.ts"],
  tests_added: ["cart.timeout.test.ts", "cart.persistence.test.ts"]
}));
```

### Expected Outcome
- Reproduction test that fails before fix
- Session persistence implementation
- localStorage fallback for cart data
- Synchronization with backend
- Comprehensive test coverage
- No regression in other cart features

---

## Example 3: Performance Optimization Campaign

### Scenario
"The dashboard page takes 8 seconds to load. Optimize it to under 2 seconds"

### ProSWARM Orchestration
```javascript
// Step 1: Initialize performance optimization
const perfTaskId = await orchestrate_task(
  "Optimize dashboard loading from 8s to under 2s"
);

// Step 2: Baseline measurement
await memory_store("baseline_metrics", JSON.stringify({
  current_load_time: 8000,
  target_load_time: 2000,
  largest_contentful_paint: 7500,
  time_to_interactive: 8200
}));

// Step 3: ProSWARM selects optimization models:
// - performance_bug_analyzer: Identifies bottlenecks
// - profiler_analyzer: Analyzes CPU/memory usage
// - bundle_optimizer: Optimizes JavaScript bundles
// - lazy_loading_planner: Plans lazy loading strategy
// - cache_strategy_planner: Designs caching approach
// - query_optimizer: Optimizes database queries

// Step 4: Parallel analysis phase
const analysisTasks = [
  orchestrate_task("Profile React render performance"),
  orchestrate_task("Analyze bundle size and dependencies"),
  orchestrate_task("Audit database queries"),
  orchestrate_task("Check API response times")
];

for (const task of analysisTasks) {
  await execute_plan(task);
}

// Step 5: Retrieve analysis results
const renderIssues = await memory_get("render_performance_issues");
const bundleIssues = await memory_get("bundle_analysis");
const queryIssues = await memory_get("slow_queries");

// Step 6: Implement optimizations in priority order
const optimizations = [
  orchestrate_task("Implement code splitting for dashboard"),
  orchestrate_task("Add React.memo to expensive components"),
  orchestrate_task("Optimize database queries with indexes"),
  orchestrate_task("Implement Redis caching for API"),
  orchestrate_task("Lazy load non-critical components"),
  orchestrate_task("Optimize images with CDN")
];

// Execute optimizations
for (const opt of optimizations) {
  await execute_plan(opt);
  // Measure after each optimization
  const metrics = await orchestrate_task("Measure current performance");
  await execute_plan(metrics);
}

// Step 7: Final validation
const validationTask = await orchestrate_task(
  "Validate dashboard loads under 2 seconds"
);
await execute_plan(validationTask);
```

### Expected Outcome
- Dashboard loads in <2 seconds
- Code splitting reducing initial bundle by 60%
- Memoization preventing unnecessary re-renders
- Database queries optimized with proper indexes
- Redis caching reducing API latency by 80%
- Lazy loading deferring 40% of components
- CDN serving optimized images

---

## Example 4: Security Audit and Hardening

### Scenario
"Perform security audit on the authentication system and fix any vulnerabilities"

### ProSWARM Orchestration
```javascript
// Step 1: Initialize security audit
const auditTaskId = await orchestrate_task(
  "Complete security audit of authentication system with fixes"
);

// Step 2: ProSWARM activates security models:
// - security_audit_planner: Plans comprehensive audit
// - penetration_test_planner: Designs pen test scenarios
// - api_security_hardener: Identifies API vulnerabilities
// - encryption_planner: Reviews encryption practices

// Step 3: Parallel security scans
const scans = [
  orchestrate_task("Test for SQL injection vulnerabilities"),
  orchestrate_task("Check for XSS attack vectors"),
  orchestrate_task("Audit JWT token implementation"),
  orchestrate_task("Review password hashing algorithm"),
  orchestrate_task("Check for CSRF vulnerabilities"),
  orchestrate_task("Audit rate limiting implementation")
];

// Execute all scans in parallel
await Promise.all(scans.map(scan => execute_plan(scan)));

// Step 4: Store vulnerability report
await memory_store("vulnerabilities_found", JSON.stringify([
  { type: "weak_password_hashing", severity: "high" },
  { type: "missing_rate_limiting", severity: "medium" },
  { type: "jwt_secret_in_code", severity: "critical" }
]));

// Step 5: Fix vulnerabilities in priority order
const fixes = [
  orchestrate_task("Move JWT secret to environment variable"),
  orchestrate_task("Upgrade to bcrypt with cost factor 12"),
  orchestrate_task("Implement rate limiting with Redis"),
  orchestrate_task("Add CSRF token validation"),
  orchestrate_task("Implement security headers")
];

for (const fix of fixes) {
  await execute_plan(fix);
}

// Step 6: Validation testing
const validationTask = await orchestrate_task(
  "Run penetration tests to verify all fixes"
);
await execute_plan(validationTask);
```

### Expected Outcome
- JWT secrets in secure environment variables
- bcrypt password hashing with appropriate cost
- Rate limiting preventing brute force attacks
- CSRF protection on all state-changing operations
- Security headers (HSTS, CSP, X-Frame-Options)
- Comprehensive security test suite
- Detailed security audit report

---

## Example 5: Microservices Decomposition

### Scenario
"Break down the monolithic e-commerce app into microservices"

### ProSWARM Orchestration
```javascript
// Step 1: Analyze monolith
const analysisTask = await orchestrate_task(
  "Analyze monolithic e-commerce app for microservices decomposition"
);

// Step 2: ProSWARM uses architecture models:
// - architecture_reviewer: Reviews current architecture
// - service_decomposer: Identifies service boundaries
// - dependency_analyzer: Maps dependencies
// - api_builder: Designs inter-service APIs

// Step 3: Store domain analysis
await memory_store("identified_services", JSON.stringify([
  "user-service",
  "product-catalog-service",
  "inventory-service",
  "order-service",
  "payment-service",
  "notification-service"
]));

// Step 4: Create service scaffolds
const services = [
  "user-service",
  "product-catalog-service",
  "inventory-service",
  "order-service",
  "payment-service",
  "notification-service"
];

for (const service of services) {
  const serviceTask = await orchestrate_task(
    `Create ${service} with API and database`
  );
  await execute_plan(serviceTask);
}

// Step 5: Implement inter-service communication
const commTask = await orchestrate_task(
  "Implement service mesh with gRPC and message queue"
);
await execute_plan(commTask);

// Step 6: Migration strategy
const migrationTask = await orchestrate_task(
  "Create data migration and cutover plan"
);
await execute_plan(migrationTask);

// Step 7: Containerization
const containerTasks = services.map(service =>
  orchestrate_task(`Containerize ${service} with Docker`)
);
await Promise.all(containerTasks.map(task => execute_plan(task)));

// Step 8: Orchestration setup
const k8sTask = await orchestrate_task(
  "Create Kubernetes manifests for all services"
);
await execute_plan(k8sTask);
```

### Expected Outcome
- 6 independent microservices with clear boundaries
- RESTful APIs for external communication
- gRPC for internal service communication
- Message queue for async operations
- Individual databases per service
- Docker containers for each service
- Kubernetes deployment manifests
- Service mesh for observability
- Zero-downtime migration plan

---

## Example 6: AI-Powered Feature Integration

### Scenario
"Add AI-powered product recommendations to the e-commerce site"

### ProSWARM Orchestration
```javascript
// Step 1: Plan AI feature
const aiTaskId = await orchestrate_task(
  "Implement AI product recommendations with personalization"
);

// Step 2: Technical design decomposition
const decomposition = await predict_decomposition(
  "Design ML pipeline for product recommendations"
);

// Step 3: Parallel implementation tracks
const mlTasks = [
  orchestrate_task("Setup data pipeline for user behavior"),
  orchestrate_task("Implement collaborative filtering algorithm"),
  orchestrate_task("Create content-based recommendation engine"),
  orchestrate_task("Build hybrid recommendation model"),
  orchestrate_task("Create A/B testing framework")
];

const apiTasks = [
  orchestrate_task("Build recommendation API endpoints"),
  orchestrate_task("Implement caching strategy for recommendations"),
  orchestrate_task("Create personalization service")
];

const uiTasks = [
  orchestrate_task("Design recommendation UI components"),
  orchestrate_task("Implement lazy loading for recommendations"),
  orchestrate_task("Create preference management interface")
];

// Execute all tracks in parallel
await Promise.all([
  ...mlTasks.map(t => execute_plan(t)),
  ...apiTasks.map(t => execute_plan(t)),
  ...uiTasks.map(t => execute_plan(t))
]);

// Step 4: Integration and testing
const integrationTask = await orchestrate_task(
  "Integrate ML models with API and UI"
);
await execute_plan(integrationTask);

// Step 5: Performance optimization
const mlOptTask = await orchestrate_task(
  "Optimize ML inference for <100ms response time"
);
await execute_plan(mlOptTask);

// Step 6: Store metrics
await memory_store("ai_feature_metrics", JSON.stringify({
  inference_time: "85ms",
  accuracy: "0.78",
  coverage: "0.92",
  cache_hit_rate: "0.73"
}));
```

### Expected Outcome
- Real-time product recommendations
- Hybrid ML model (collaborative + content-based)
- <100ms API response time
- Redis caching for hot recommendations
- A/B testing framework
- User preference management
- Personalization based on browsing history
- Fallback to popular items for new users

---

## Common Patterns Across Examples

### 1. Always Initialize First
```javascript
const taskId = await orchestrate_task("Main task description");
await memory_store("main_task_id", taskId);
```

### 2. Let ProSWARM Select Models
ProSWARM automatically chooses the right models based on task description keywords.

### 3. Use Parallel Execution
When tasks are independent, execute them simultaneously for massive speedup.

### 4. Store Everything in Memory
Share all data between agents/tasks using the memory system.

### 5. Iterate and Refine
Continue decomposing as new complexity emerges during execution.

### 6. Validate Results
Always include validation tasks to ensure objectives are met.

---

*These examples demonstrate ProSWARM's ability to handle complex, real-world development scenarios with neural-powered orchestration.*