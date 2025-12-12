---
id: BACKLOG-AGENT-ORCHESTRATOR
doc_type: reference
title: 'Agent Orchestrator Backlog Items - Ready for Insertion'
version: 1.0.0
date: 2025-12-12
owner: '@h2-tank-team'
status: ready
---

# Agent Orchestrator Backlog Items

## Purpose

This document contains properly formatted backlog items (BACK-081 through BACK-086) ready for insertion into `docs/runbook/BACKEND_DEVELOPMENT_BACKLOG.md`. These items address the critical gap identified in the RTM review: **missing top-level orchestration capability**.

---

## BACK-081: Agent Execution Orchestrator (REQ-410)

**Priority**: P1 Critical
**Complexity**: XL
**Requirements**: REQ-410, REQ-070, Automation
**Dependencies**: All existing API endpoints

**Description**:
Master controller that orchestrates the complete H2 Tank Designer workflow autonomously. This is the **top-level orchestration item** that coordinates all pipeline stages using a state machine pattern with decision points at each junction.

**Deliverables**:

- [ ] `src/orchestrator/AgentOrchestrator.ts` - Core orchestrator class
- [ ] `src/orchestrator/StateMachine.ts` - State transition logic
- [ ] `src/orchestrator/StageExecutors.ts` - Individual stage implementations
- [ ] `src/orchestrator/WorkflowContext.ts` - Shared context management
- [ ] `src/orchestrator/CheckpointManager.ts` - State persistence
- [ ] `POST /api/agent/orchestrate` - Start new workflow
- [ ] `GET /api/agent/{sessionId}` - Get workflow state
- [ ] `POST /api/agent/{sessionId}/pause` - Pause execution
- [ ] `POST /api/agent/{sessionId}/resume` - Resume execution
- [ ] `POST /api/agent/{sessionId}/abort` - Abort workflow
- [ ] `GET /api/agent/{sessionId}/checkpoints` - List checkpoints
- [ ] `POST /api/agent/{sessionId}/restore/{checkpointId}` - Restore from checkpoint
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests for full workflow
- [ ] Performance benchmarks (target: <30s for typical workflow)

**Workflow Steps**:

1. Parse requirements (NL or structured)
2. Select tank type (rule-based or LLM-assisted)
3. Select materials (rule-based decision)
4. Start optimization (monitor SSE progress)
5. Evaluate Pareto front
6. Select optimal design (decision engine)
7. Run all analyses (stress, failure, thermal, cost)
8. Check compliance (standards verification)
9. Validate design (FEA validation)
10. Generate export package (STEP, PDF, JSON)

**Error Recovery**:

- Automatic retry with exponential backoff (max 5 attempts)
- Graceful degradation (skip optional analyses on failure)
- State persistence for manual intervention
- Rollback to last stable checkpoint

**Success Criteria**:

- [ ] Successfully orchestrates Requirements → Export in <30 seconds
- [ ] Handles errors gracefully with automatic retry
- [ ] State persists across server restarts
- [ ] Rollback restores to last stable checkpoint
- [ ] All decisions logged with explanations
- [ ] Progress updates broadcast in real-time
- [ ] 80%+ test coverage
- [ ] Zero memory leaks in 24-hour continuous operation

---

## BACK-082: Agent State Machine

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: State Management
**Dependencies**: BACK-081

**Description**:
Define and implement the state machine that governs workflow transitions, ensuring valid state changes, persistence across restarts, and visualization support for UI integration.

**Deliverables**:

- [ ] `src/orchestrator/StateMachine.ts` - State machine implementation
- [ ] `src/orchestrator/stores/IStateStore.ts` - State persistence interface
- [ ] `src/orchestrator/stores/PostgresStateStore.ts` - PostgreSQL implementation
- [ ] `src/orchestrator/stores/InMemoryStateStore.ts` - Testing implementation
- [ ] `migrations/xxx_create_workflow_states.sql` - Database schema
- [ ] `src/orchestrator/StateVisualizer.ts` - UI data formatting
- [ ] Unit tests for state machine logic (100% coverage)
- [ ] Integration tests for persistence
- [ ] State recovery tests (simulate server restart)

**State Definition**:

```
States: initializing, parsing_requirements, selecting_tank_type,
        selecting_materials, running_optimization, evaluating_designs,
        selecting_optimal, running_analyses, checking_compliance,
        validating_design, generating_export, completed, failed, paused
```

**State Persistence**:

- PostgreSQL storage for production
- In-memory store for testing
- Automatic state snapshots every 5 seconds
- State recovery on server restart

**Timeout Handling**:

- Per-stage timeout configuration (e.g., optimization: 60s, analysis: 30s)
- Automatic transition to FAILED on timeout
- Manual intervention hooks
- Timeout warning broadcasts (at 80% of limit)

**Success Criteria**:

- [ ] All state transitions validated before execution
- [ ] Invalid transitions throw descriptive errors
- [ ] State persists to database within 100ms
- [ ] State recovery works after simulated crash
- [ ] Progress calculation accurate to ±5%
- [ ] ETA estimation accurate to ±20%
- [ ] Manual intervention hooks fire at correct times
- [ ] 100% test coverage

---

## BACK-083: Agent Decision Engine

**Priority**: P1 Critical
**Complexity**: XL
**Requirements**: REQ-070
**Dependencies**: BACK-081

**Description**:
Implements the decision-making logic that drives workflow routing. Combines rule-based decisions (deterministic), LLM-assisted decisions (ambiguous cases), and user preference learning.

**Deliverables**:

- [ ] `src/decision/IDecisionEngine.ts` - Decision engine interface
- [ ] `src/decision/AgentDecisionEngine.ts` - Main implementation
- [ ] `src/decision/RuleEngine.ts` - Rule-based decision logic
- [ ] `src/decision/rules/TankTypeRules.ts` - Tank type selection rules
- [ ] `src/decision/rules/MaterialRules.ts` - Material selection rules
- [ ] `src/decision/rules/StandardRules.ts` - Standard selection rules
- [ ] `src/decision/LLMDecisionClient.ts` - LLM integration for ambiguous cases
- [ ] `src/decision/PreferenceStore.ts` - User preference learning
- [ ] `src/decision/DecisionLog.ts` - Audit trail storage
- [ ] `GET /api/agent/{sessionId}/decisions` - Get decision history
- [ ] `GET /api/agent/decisions/{decisionId}/explain` - Explain decision
- [ ] `POST /api/agent/decisions/{decisionId}/feedback` - User feedback
- [ ] Unit tests for all rules (100% coverage)
- [ ] Integration tests for LLM fallback
- [ ] Performance tests (decision latency <500ms)

**Decision Types**:

1. **Tank Type Selection**:
   - Rule: Pressure ≥70 MPa → Type IV
   - Rule: Temperature <-40°C → Type IV
   - LLM fallback for edge cases

2. **Material Selection**:
   - Rule: Cryogenic temps → HDPE liner
   - Rule: High pressure → T700 carbon fiber
   - User preference learning

3. **Optimization Goal**:
   - Rule: Automotive → Minimize mass
   - Rule: Stationary → Minimize cost
   - User preference learning

4. **Design Selection**:
   - Rule: Select Pareto-optimal with highest safety factor
   - LLM: Evaluate trade-offs if multiple candidates

**Explainability**:

- Human-readable explanations for every decision
- Evidence citations (which rule, which data point, which standard)
- Alternative options considered with rejection reasons
- Confidence levels (0-1 scale)

**Success Criteria**:

- [ ] 95%+ accuracy on rule-based decisions
- [ ] LLM fallback latency <2 seconds
- [ ] All decisions logged with explanations
- [ ] User preference learning improves accuracy over time
- [ ] Decision explanations validated by domain expert
- [ ] Zero decisions made without audit trail
- [ ] 100% test coverage on rule logic

---

## BACK-084: Agent Progress Broadcasting

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-410 (Async progress tracking)
**Dependencies**: BACK-081, BACK-082

**Description**:
Real-time progress broadcasting system using WebSockets to stream workflow status updates to connected clients. Enables live monitoring of agent execution with current stage, progress percentage, decisions made, and next action preview.

**Deliverables**:

- [ ] `src/broadcasting/AgentProgressBroadcaster.ts` - WebSocket server
- [ ] `src/broadcasting/ProgressEventTypes.ts` - Event type definitions
- [ ] `src/broadcasting/ClientAuthentication.ts` - Auth middleware
- [ ] `proagentic-dfx/src/lib/agent/AgentProgressClient.ts` - Frontend client
- [ ] `GET /api/agent/progress (WebSocket)` - WebSocket endpoint
- [ ] Unit tests for broadcaster (event emission)
- [ ] Integration tests for client reconnection
- [ ] Load tests (100 concurrent connections)

**Event Types**:

- `workflow.started` - Initial connection
- `workflow.stage_changed` - Stage transition
- `workflow.progress_updated` - Progress increment (0-100%)
- `workflow.decision_made` - Decision recorded with reasoning
- `workflow.error` - Error occurred with recovery options
- `workflow.paused` - User paused workflow
- `workflow.resumed` - User resumed workflow
- `workflow.completed` - Workflow finished successfully
- `workflow.failed` - Workflow failed (final state)

**WebSocket Features**:

- Connection management (multiple concurrent workflows)
- Client authentication and authorization
- Automatic reconnection handling (exponential backoff)
- Heartbeat/ping-pong for connection health (30s interval)
- Message queuing during disconnection

**Success Criteria**:

- [ ] Supports 100+ concurrent connections
- [ ] Messages delivered within 100ms of emission
- [ ] Automatic reconnection works after network drop
- [ ] No messages lost during brief disconnections (<5s)
- [ ] Heartbeat detects dead connections within 30s
- [ ] Client library handles all event types
- [ ] Zero memory leaks over 24-hour operation

---

## BACK-085: Agent Error Recovery

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: Error Handling
**Dependencies**: BACK-081, BACK-082

**Description**:
Comprehensive error recovery system that handles failures gracefully with automatic retry, graceful degradation, partial result preservation, and manual recovery UI.

**Deliverables**:

- [ ] `src/recovery/ErrorRecoveryManager.ts` - Main recovery logic
- [ ] `src/recovery/CircuitBreaker.ts` - Circuit breaker implementation
- [ ] `src/recovery/ErrorClassifier.ts` - Error classification
- [ ] `src/recovery/RetryStrategies.ts` - Retry strategy definitions
- [ ] `src/recovery/PartialResultPreserver.ts` - Save intermediate results
- [ ] `proagentic-dfx/src/components/agent/RecoveryDialog.tsx` - Manual recovery UI
- [ ] `POST /api/agent/{sessionId}/recover` - Trigger recovery action
- [ ] `GET /api/agent/{sessionId}/partial-results` - Retrieve partial results
- [ ] Unit tests for error classification (100% coverage)
- [ ] Integration tests for recovery scenarios
- [ ] Chaos testing (inject random failures)

**Error Classification**:

1. **Transient**: Retry automatically (network timeout, rate limit)
   - Retry strategy: Exponential backoff (1s, 2s, 4s, 8s, 16s)
   - Max retries: 5

2. **Validation**: User input required (invalid material combination)
   - Retry strategy: No automatic retry
   - Recovery action: Request user correction

3. **Degradable**: Can skip (optional analysis unavailable)
   - Retry strategy: 2 attempts, then skip
   - Recovery action: Skip and continue with warning

4. **Fatal**: Cannot recover (API key invalid, service down)
   - Retry strategy: No retry
   - Recovery action: Abort with partial results

**Circuit Breaker**:

- Open circuit after 5 consecutive failures
- Reset timeout: 60 seconds
- Half-open state for testing recovery

**Partial Result Preservation**:

- Save intermediate results at checkpoints
- Preserve Pareto front even if analysis fails
- Allow manual continuation from last success
- Export partial results if final export fails

**Success Criteria**:

- [ ] 90%+ recovery rate for transient errors
- [ ] Circuit breaker prevents cascade failures
- [ ] Partial results preserved at all checkpoints
- [ ] Manual recovery UI provides clear options
- [ ] All errors classified correctly
- [ ] No data loss during recovery
- [ ] Recovery actions execute within 5 seconds

---

## BACK-086: UAT Flow Automation

**Priority**: P2 Enhancement
**Complexity**: L
**Requirements**: Automated Testing
**Dependencies**: BACK-081, UAT Automation Skill

**Description**:
Automated test runner that uses the agent orchestrator to execute the complete UAT workflow, capturing screenshots at milestones, validating results, and detecting regressions.

**Deliverables**:

- [ ] `src/testing/UATFlowAutomation.ts` - Test runner
- [ ] `src/testing/ScreenshotComparator.ts` - Visual regression detection
- [ ] `src/testing/UATReportGenerator.ts` - Report generation
- [ ] `scripts/run-uat-automation.ts` - CLI runner
- [ ] `baselines/` - Baseline screenshot directory
- [ ] GitHub Actions workflow for nightly UAT runs
- [ ] Unit tests for test runner logic
- [ ] Documentation for adding new UAT tests

**Test Coverage**:

- Phase 1: App initialization & navigation (4 tests)
- Phase 2: Requirements entry (5 tests)
- Phase 3: Pareto optimization (4 tests)
- Phase 4: 3D visualization (4 tests)
- Phase 5: Analysis panels (4 tests)
- Phase 6: Compliance checking (3 tests)
- Phase 7: Validation (3 tests)
- Phase 8: Export generation (3 tests)
- **Total**: 30 smoke tests

**Validation**:

- Automated pass/fail determination using computer vision
- Screenshot comparison for regression detection (pixelmatch)
- Error message detection (console errors, UI error states)
- Performance threshold validation (workflow <30s)

**Regression Detection**:

- Baseline screenshot storage (version-controlled)
- Visual diff calculation (threshold: 5% pixel difference)
- Threshold-based failure detection
- Changelog correlation (link failures to commits)

**Success Criteria**:

- [ ] All 30 UAT tests execute successfully
- [ ] Screenshot comparison detects visual regressions (±5% threshold)
- [ ] Full suite completes in <5 minutes
- [ ] Report generated in Markdown with embedded images
- [ ] Failures correlated to recent commits
- [ ] Can run in CI/CD pipeline (GitHub Actions)
- [ ] Zero flaky tests (3 consecutive runs, same result)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal**: Establish core infrastructure

- [ ] BACK-082: Agent State Machine
  - PostgreSQL schema migration
  - State machine implementation
  - In-memory store for testing
  - State persistence tests

- [ ] BACK-081: Agent Execution Orchestrator (MVP)
  - Minimal viable orchestrator
  - Sequential stage execution
  - Basic checkpoint system
  - Integration tests

- [ ] BACK-084: Progress Broadcasting
  - WebSocket server setup
  - Basic event types
  - Frontend client library
  - Connection health monitoring

**Deliverables**: Working orchestrator with state persistence and live progress updates

---

### Phase 2: Intelligence (Week 3-4)

**Goal**: Add decision-making and error handling

- [ ] BACK-083: Agent Decision Engine
  - Rule engine implementation
  - Tank type selection rules
  - Material selection rules
  - LLM fallback integration
  - Decision audit trail

- [ ] BACK-085: Error Recovery
  - Error classifier
  - Retry strategies
  - Circuit breaker
  - Partial result preservation
  - Manual recovery UI

**Deliverables**: Intelligent decision-making with robust error recovery

---

### Phase 3: Validation (Week 5)

**Goal**: Automated testing and validation

- [ ] BACK-086: UAT Flow Automation
  - Test runner implementation
  - Screenshot comparison
  - Baseline management
  - Report generation
  - CI/CD integration

- [ ] End-to-end integration testing
  - Full workflow tests
  - Error injection tests
  - Performance benchmarks
  - Chaos testing

**Deliverables**: Automated UAT suite with regression detection

---

### Phase 4: Polish (Week 6)

**Goal**: Production readiness

- [ ] Manual recovery UI refinement
- [ ] Decision explainability improvements
- [ ] Performance optimization (sub-30s target)
- [ ] Documentation (API specs, user guide, admin guide)
- [ ] Demo preparation for competition interview
- [ ] Security audit (auth, rate limiting, input validation)

**Deliverables**: Production-ready agent orchestrator with comprehensive documentation

---

## Competition Impact

### UKRI Scoring Criteria Alignment

| Scoring Criterion         | How Agent Orchestrator Demonstrates                                                    |
| ------------------------- | -------------------------------------------------------------------------------------- |
| **Agentic AI Capability** | Autonomous workflow execution with decision-making, error recovery, and explainability |
| **Innovation**            | Novel combination of rule-based + LLM-assisted decisions with user preference learning |
| **User Experience**       | "One-click" design generation reduces workflow from hours to minutes                   |
| **Reliability**           | Circuit breaker, graceful degradation, partial result preservation                     |
| **Transparency**          | Decision audit trail, explainable AI, real-time progress broadcasting                  |

### Demo Narrative (Interview)

> "Our H2 Tank Designer features an advanced Agent Workflow Orchestrator that demonstrates true agentic AI capability. Watch as I provide a natural language requirement: 'I need a 70 MPa hydrogen tank for automotive use, 5kg capacity.'
>
> The agent autonomously:
>
> 1. Parses the requirement and extracts key parameters
> 2. **Decides** on Type IV tank type (rule-based: pressure ≥70 MPa)
> 3. **Decides** on carbon fiber material (T700 for high pressure)
> 4. **Runs** Pareto optimization (monitors SSE progress)
> 5. **Evaluates** 50+ designs on the Pareto front
> 6. **Decides** on optimal design (LLM-assisted trade-off evaluation)
> 7. **Runs** all analyses in parallel (stress, failure, thermal, cost)
> 8. **Checks** compliance with ISO 11119-3
> 9. **Validates** design with FEA
> 10. **Generates** complete export package (STEP, PDF, JSON)
>
> All in under 30 seconds. Every decision is logged with human-readable explanations. If an error occurs, the circuit breaker prevents cascade failures and graceful degradation ensures partial results are preserved.
>
> This is not just automation—this is intelligent orchestration with explainability, error recovery, and user preference learning."

---

## Metrics & Success Criteria

### Technical Metrics

| Metric                    | Target | Measurement Method                  |
| ------------------------- | ------ | ----------------------------------- |
| Workflow Success Rate     | >95%   | (Completed / Total Started) × 100   |
| Error Recovery Rate       | >90%   | (Recovered / Total Errors) × 100    |
| Average Workflow Duration | <30s   | Median completion time              |
| Decision Accuracy         | >95%   | Correct decisions / Total decisions |
| WebSocket Uptime          | >99.9% | Connected time / Total time         |
| State Persistence Latency | <100ms | Time to write state to DB           |

### User Experience Metrics

| Metric                     | Target | Measurement Method                      |
| -------------------------- | ------ | --------------------------------------- |
| "One-click" Design Success | >90%   | Workflows with zero manual intervention |
| User Satisfaction          | 4.5+/5 | Post-workflow survey                    |
| Decision Explainability    | 4.0+/5 | User comprehension score                |
| Error Message Clarity      | 4.0+/5 | User feedback on recovery UI            |

---

## References

- **Full Design Document**: `docs/runbook/AGENT_ORCHESTRATOR_DESIGN.md`
- **RTM Audit**: `docs/test-report/RTM_AUDIT_2025-12-11.md`
- **Backend Backlog**: `docs/runbook/BACKEND_DEVELOPMENT_BACKLOG.md`
- **UAT Automation Skill**: `.claude/skills/uat-automation/SKILL.md`
- **ProSWARM Documentation**: `.claude/hooks/PROSWARM_PHILOSOPHY.md`

---

**Document Status**: Ready for insertion into backend backlog
**Created**: 2025-12-12
**Owner**: @h2-tank-team
**Next Action**: Insert items BACK-081 through BACK-086 into backend development backlog after BACK-070
