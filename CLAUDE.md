# Claude Code Configuration - ProSWARM Template

## 🎯 PROSWARM NEURAL ORCHESTRATION - PRIMARY WORKFLOW ENGINE

**CRITICAL**: ProSWARM is your PRIMARY workflow engine. Use it CONTINUOUSLY throughout ALL task execution, not just once. Every task must flow through ProSWARM's neural decomposition and orchestration pipeline.

### Core Principle: Continuous Orchestration

ProSWARM is NOT a one-time tool - it's your fundamental way of thinking about and executing ALL complex tasks. The ProSWARM MCP server provides:

- **70+ Specialized Neural Models**: Instant task classification and planning (<1ms)
- **84.8% SWE-Bench Accuracy**: Proven performance on real-world development tasks
- **Shared Memory System**: Perfect data sharing between agents
- **Parallel Execution**: Up to 4.4x speedup through intelligent task routing

### MANDATORY: Always Start with ProSWARM

```javascript
// STEP 1: Initialize orchestration (ALWAYS FIRST)
const result = (await mcp__proswarm) - neural__orchestrate_task('Your task description');
(await mcp__proswarm) - neural__memory_store('main_task_id', result.task_id);

// STEP 2: Store the decomposition plan
(await mcp__proswarm) - neural__memory_store('orchestration_plan', JSON.stringify(result.plan));

// STEP 3: Establish subtask context BEFORE any tool use
(await mcp__proswarm) - neural__memory_store('subtask_work', 'status: in_progress');

// STEP 4: NOW you can use any tools - they are tied to the orchestration
Read('/src/file.ts'); // ✅ ALLOWED
Grep('pattern', '/src'); // ✅ ALLOWED
Bash('npm test'); // ✅ ALLOWED

// STEP 5: Execute the plan
(await mcp__proswarm) - neural__execute_plan(result.task_id);
```

## 🔴 SINGLE SOURCE OF TRUTH (SSOT) - CRITICAL

**THE RTM (Requirements Traceability Matrix) IS THE SSOT FOR THIS PROJECT.**

| Document       | Location                                   | Purpose                                      |
| -------------- | ------------------------------------------ | -------------------------------------------- |
| **RTM Audit**  | `docs/test-report/RTM_AUDIT_2025-12-11.md` | Current compliance status, gaps, priorities  |
| **RTM Review** | `docs/test-report/RTM_REVIEW_REPORT.md`    | Detailed requirement-by-requirement analysis |

### ALWAYS CHECK RTM BEFORE:

- Making architectural decisions
- Prioritizing work
- Claiming a feature is "complete"
- Updating documentation

### RTM Key Metrics (as of 2025-12-11):

- **~330 requirements** (after deduplication)
- **64% overall compliance**
- **Frontend Core**: 74% (B+)
- **Mock Server**: 81% (A-)
- **Export/CAD**: 11% (F - Critical Gap)
- **Professional Features**: 33% (D+)

---

## 📋 PROJECT OVERVIEW

**ProAgentic DfX** - Multi-agent AI ecosystem for Design for Excellence (DfX), starting with the H2 Tank Designer module.

### Competition Context

| Field              | Details                                       |
| ------------------ | --------------------------------------------- |
| **Competition**    | Agentic AI Pioneers Prize - Development Phase |
| **Competition ID** | 2355                                          |
| **Organiser**      | Innovate UK (UKRI) + DSIT                     |
| **Sector**         | Advanced Manufacturing                        |
| **Challenge**      | Detailed Design for X Agents                  |
| **Prize**          | £250k (sector) + £250k (overall bonus)        |
| **Deadline**       | 23 February 2026 at 11:00 UK                  |
| **Interview**      | 16-18 March 2026 (London)                     |

### Competition Documentation

```
agentic-pioneers-prize/
├── COMPETITION_OVERVIEW.md    # Full competition details
├── SCORING_CRITERIA.md        # Assessor scoring guidance
├── TIMELINE.md                # Key dates and milestones
├── OUR_APPROACH.md            # Strategy and technical approach
├── application/               # Scored questions (Q10-Q15)
├── appendices/                # Visual appendix templates
└── interview/                 # Demo preparation
```

### Technology Stack (Verified against RTM)

| Layer           | Technology                                                    | Notes                     |
| --------------- | ------------------------------------------------------------- | ------------------------- |
| **Frontend**    | React 18 + TypeScript + Next.js 14 + Tailwind CSS             | App Router                |
| **3D/CAD**      | Three.js (@react-three/fiber) + OpenCascade.js                | B-rep solids, STEP export |
| **Mock Server** | Next.js 14 (App Router) + TypeScript                          | Port 3001                 |
| **Physics**     | First-principles equations (pressure vessel, Tsai-Wu, Hashin) | In mock server            |
| **AI/LLM**      | Claude API, GPT-4 (fallback)                                  | Requirements chat         |
| **Testing**     | Vitest + React Testing Library + Playwright                   | 80%+ coverage target      |
| **Deployment**  | Vercel (production) + Docker (local)                          | CI/CD pipeline            |

**NOTE**: CadQuery, Gmsh, CalculiX are planned for production backend, not currently implemented.

## 🚨 MANDATORY PROSWARM HOOK ENFORCEMENT

**CRITICAL**: This project uses strict PreToolUse hooks that enforce ProSWARM orchestration on ALL tool use.

### The Hook Enforces:

**Phase 1: Orchestration Required**

- ❌ **BLOCKED**: ANY tool without `main_task_id` set
- ✅ **ALLOWED**: `orchestrate_task()` to start fresh orchestration

**Phase 2: Subtask Binding Required**

- ❌ **BLOCKED**: All tools without active subtask context
- ✅ **REQUIRED**: `memory_store('subtask_{id}', 'status: in_progress')`

**Phase 3: Agent Spawning Requires Plan**

- ❌ **BLOCKED**: Task/Skill tools without captured orchestration_plan
- ✅ **REQUIRED**: `memory_store('orchestration_plan', plan)` after orchestration

**Phase 4: Session Timeout (60 seconds - BY DESIGN)**

- Timeout is a FEATURE, not a bug
- Simply call `orchestrate_task()` for your next piece of work
- Memory is SHARED - context persists across all orchestrations

### What This Means:

You **CANNOT**:

- ❌ Read files without orchestration
- ❌ Search code (Grep) without orchestration
- ❌ Run bash commands without orchestration
- ❌ Edit files without orchestration
- ❌ Spawn agents without orchestration plan

You **MUST**:

1. ✅ Call `orchestrate_task(description)` FIRST
2. ✅ Store `memory_store('main_task_id', taskId)`
3. ✅ Store `memory_store('subtask_{id}', context)` BEFORE any tool use
4. ✅ Store `memory_store('orchestration_plan', plan)` BEFORE spawning agents

## 🐝 PROSWARM NEURAL MODELS (70+ Specialized Models)

### Testing & Quality

- `test_optimizer`, `test_coverage_analyzer`, `regression_suite_builder`, `edge_case_generator`, `test_flakyness_detector`

### Bug Analysis & Resolution

- `bug_router`, `crash_analyzer`, `race_condition_finder`, `memory_leak_hunter`, `performance_bug_analyzer`

### API Development

- `api_builder`, `endpoint_optimizer`, `api_security_hardener`, `api_doc_generator`

### Performance Optimization

- `profiler_analyzer`, `cache_strategy_planner`, `bundle_optimizer`, `query_optimizer`, `lazy_loading_planner`

### Security & Compliance

- `security_audit_planner`, `penetration_test_planner`, `encryption_planner`

### Infrastructure & DevOps

- `ci_pipeline_builder`, `docker_optimizer`, `k8s_manifest_generator`, `scaling_planner`

### Code Organization

- `refactor_planner`, `code_splitter`, `component_splitter`, `abstraction_extractor`

## 🛠️ AVAILABLE SKILLS

```bash
Skill({ skill: "proswarm" })      # Master orchestration
Skill({ skill: "tdd" })           # Test-Driven Development
Skill({ skill: "dev-planning" })  # Development planning
Skill({ skill: "bug-fixer" })     # Batch bug fixing (10-15+ bugs)
Skill({ skill: "doc-manager" })   # Documentation management
Skill({ skill: "skill-builder" }) # Create new skills
Skill({ skill: "novae" })         # NOVAE workflow
Skill({ skill: "uat-automation" }) # UAT testing
```

## 🤖 AVAILABLE AGENTS

**ProSWARM Core**: `proswarm-orchestrator`, `proswarm-executor`, `proswarm-model-selector`, `proswarm-memory-manager`

**TDD**: `tdd-test-generator`, `tdd-self-debugger`, `tdd-multi-sampler`, `tdd-quality-gatekeeper`

**Dev Planning**: `dev-planning-repo-analyzer`, `dev-planning-test-designer`, `dev-planning-self-reviewer`, `dev-planning-context-packager`

**Other**: `bug-analyzer`, `bug-batch-fixer`, `regression-detector`, `novae-test-runner`, `novae-sequential-thinking`, `novae-context7-reviewer`

## 🧪 TDD WORKFLOW

```
Step 1: Generate failing tests BEFORE implementation
Step 2: Implement to Green (Self-Debug Loop)
Step 3: Multi-Sample & Select (For Hard Problems)
Step 4: Refactor While Staying Green
Step 5: Quality Gates (≥80% coverage)
```

## 🚨 SAFETY GUIDELINES

### ⛔ FORBIDDEN:

- `kill`, `killall`, `pkill -f "node.*server"`
- **EXCEPTION**: `pkill -f chrome` is ALLOWED

### 🚫 GIT COMMIT QUALITY - NO SHORTCUTS

- **NEVER use `--no-verify`** to bypass pre-commit hooks
- **ALWAYS fix file size violations** before committing
- If pre-commit hook fails due to file size limits, **split the files** to meet standards
- Quality gates exist for a reason - maintain code standards at all times
- Only exception: explicit user approval for temporary bypass (document why)

## 📏 FILE SIZE LIMITS - AI-OPTIMIZED CODE

**CRITICAL**: Keep files small for AI context efficiency. Large files degrade AI performance.

### Hard Limits (Enforced by pre-commit hook)

| File Type         | Max Lines | Max Size |
| ----------------- | --------- | -------- |
| Components/Routes | 500       | 35KB     |
| Type definitions  | 800       | 35KB     |
| Test files        | 800       | 35KB     |

### Recommended Limits (ESLint warnings)

| Metric             | Limit | Why                       |
| ------------------ | ----- | ------------------------- |
| Lines per file     | 350   | Fits in AI context window |
| Lines per function | 50    | Single responsibility     |
| Parameters         | 5     | Cognitive load            |
| Nesting depth      | 4     | Readability               |
| Complexity         | 15    | Maintainability           |

### When You Hit Limits - Split Patterns

```typescript
// ❌ BAD: One huge component file (500+ lines)
// src/components/Dashboard.tsx

// ✅ GOOD: Split by concern
// src/components/dashboard/
//   ├── Dashboard.tsx           (< 200 lines - composition only)
//   ├── DashboardHeader.tsx     (< 100 lines)
//   ├── DashboardMetrics.tsx    (< 100 lines)
//   ├── DashboardCharts.tsx     (< 100 lines)
//   ├── useDashboardData.ts     (< 100 lines - custom hook)
//   └── dashboard.types.ts      (< 50 lines)
```

### Commands

```bash
npm run check:sizes      # Check all files
npm run check:sizes:staged  # Check staged files only (pre-commit)
```

## 📊 MEMORY PROTOCOL

```javascript
// Standard Keys
'main_task_id'; // Primary task identifier
'orchestration_plan'; // Full decomposition structure
'subtask_{id}'; // Individual subtask data
'test_results'; // Test execution results
```

## 🔴 REQUIRED MCP SERVERS

- **proswarm-neural**: PRIMARY workflow engine
- **sequential-thinking**: Execution control
- **context7**: Library documentation
- **chrome-devtools**: Browser automation
- **github**: Repository management
- **memory**: Knowledge graph

## 📖 QUICK REFERENCE

```javascript
// 1. Orchestrate
const result = await orchestrate_task("Your task");
await memory_store("main_task_id", result.task_id);
await memory_store("orchestration_plan", JSON.stringify(result.plan));

// 2. Establish subtask
await memory_store("subtask_work", "status: in_progress");

// 3. NOW use tools
Read(...), Grep(...), Edit(...), Bash(...)

// 4. Execute plan
await execute_plan(result.task_id);
```

### Performance Benchmarks:

- Task Decomposition: <1ms
- SWE-Bench Accuracy: 84.8%
- Parallel Speedup: 2.8-4.4x

---

**Remember**: ProSWARM is your PRIMARY workflow engine. Use it CONTINUOUSLY!
