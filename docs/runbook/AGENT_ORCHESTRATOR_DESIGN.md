---
id: AGENT-ORCHESTRATOR-DESIGN
doc_type: reference
title: 'Agent Workflow Orchestrator - Comprehensive Design'
version: 1.0.0
date: 2025-12-12
owner: '@h2-tank-team'
status: draft
---

# Agent Workflow Orchestrator - Comprehensive Design

## Executive Summary

This document provides detailed specifications for the **Agent Workflow Orchestrator** system that enables autonomous execution of the entire H2 Tank Designer workflow from requirements to export. This addresses the critical gap identified in the RTM audit where top-level orchestration capability is missing.

### System Purpose

Enable fully autonomous workflow execution:

- **Input**: Natural language requirements or structured parameters
- **Process**: Parse → Route → Optimize → Analyze → Validate → Export
- **Output**: Complete design package with engineering documentation
- **Monitoring**: Real-time progress updates via WebSocket
- **Recovery**: Automatic error handling with rollback capability

### Strategic Value

| Benefit               | Impact                                                               |
| --------------------- | -------------------------------------------------------------------- |
| **Competition Edge**  | Demonstrates advanced agentic AI capability (UKRI scoring criteria)  |
| **User Experience**   | "One-click" design generation reduces workflow from hours to minutes |
| **Quality Assurance** | Automated UAT validation ensures consistent results                  |
| **Scalability**       | Foundation for multi-module expansion (pressure vessels, etc.)       |

---

## BACK-081: Agent Execution Orchestrator (REQ-410)

### Priority & Scope

**Priority**: P1 Critical
**Complexity**: XL
**Requirements**: REQ-410, REQ-070, Automation
**Dependencies**: All existing API endpoints

### Description

Master controller that orchestrates the complete H2 Tank Designer workflow autonomously. This is the **top-level orchestration item** that coordinates all pipeline stages using a state machine pattern with decision points.

### Core Capabilities

1. **Pipeline Orchestration**
   - Sequential stage execution: Requirements → Pareto → Selection → Analysis → Validation → Export
   - Parallel execution where possible (multiple analysis types, compliance checks)
   - Conditional routing based on tank type, materials, standards
   - Progress tracking with ETA calculation

2. **Decision Engine Integration**
   - Rule-based decisions (tank type selection based on pressure/temperature)
   - LLM-assisted decisions (ambiguous requirements, trade-off evaluation)
   - User preference learning from historical selections
   - Explainable decision logging

3. **Error Recovery**
   - Automatic retry with exponential backoff
   - Graceful degradation (skip optional analyses on failure)
   - State persistence for manual intervention
   - Rollback to last stable checkpoint

4. **State Management**
   - Persistent state across restarts
   - State visualization for UI integration
   - Checkpoint creation at major milestones
   - Manual override capability

### Architecture

```typescript
// Core orchestrator interface
interface AgentOrchestrator {
  // Lifecycle methods
  initialize(requirements: RequirementsInput): Promise<WorkflowSession>;
  execute(sessionId: string): Promise<WorkflowResult>;
  pause(sessionId: string): Promise<void>;
  resume(sessionId: string): Promise<void>;
  abort(sessionId: string, reason: string): Promise<void>;

  // State management
  getState(sessionId: string): Promise<WorkflowState>;
  restoreFromCheckpoint(checkpointId: string): Promise<WorkflowSession>;
  createCheckpoint(sessionId: string, name: string): Promise<Checkpoint>;

  // Monitoring
  subscribe(sessionId: string, callback: ProgressCallback): Subscription;
  getMetrics(sessionId: string): Promise<WorkflowMetrics>;
}

// State machine definition
enum WorkflowStage {
  INITIALIZING = 'initializing',
  PARSING_REQUIREMENTS = 'parsing_requirements',
  SELECTING_TANK_TYPE = 'selecting_tank_type',
  SELECTING_MATERIALS = 'selecting_materials',
  RUNNING_OPTIMIZATION = 'running_optimization',
  EVALUATING_DESIGNS = 'evaluating_designs',
  SELECTING_OPTIMAL = 'selecting_optimal',
  RUNNING_ANALYSES = 'running_analyses',
  CHECKING_COMPLIANCE = 'checking_compliance',
  VALIDATING_DESIGN = 'validating_design',
  GENERATING_EXPORT = 'generating_export',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
}

// Workflow state
interface WorkflowState {
  sessionId: string;
  stage: WorkflowStage;
  progress: number; // 0-100
  currentStep: StepDescriptor;
  decisions: DecisionRecord[];
  checkpoints: Checkpoint[];
  errors: ErrorRecord[];
  startedAt: Date;
  estimatedCompletion?: Date;
}

// Decision record (for explainability)
interface DecisionRecord {
  id: string;
  stage: WorkflowStage;
  type: 'rule-based' | 'llm-assisted' | 'user-preference';
  question: string;
  options: DecisionOption[];
  selectedOption: string;
  reasoning: string;
  confidence: number;
  timestamp: Date;
}
```

### State Transition Logic

```typescript
// State machine transitions
const ALLOWED_TRANSITIONS: Record<WorkflowStage, WorkflowStage[]> = {
  [WorkflowStage.INITIALIZING]: [WorkflowStage.PARSING_REQUIREMENTS, WorkflowStage.FAILED],
  [WorkflowStage.PARSING_REQUIREMENTS]: [
    WorkflowStage.SELECTING_TANK_TYPE,
    WorkflowStage.FAILED,
    WorkflowStage.PAUSED,
  ],
  [WorkflowStage.SELECTING_TANK_TYPE]: [
    WorkflowStage.SELECTING_MATERIALS,
    WorkflowStage.PARSING_REQUIREMENTS, // rollback
    WorkflowStage.FAILED,
    WorkflowStage.PAUSED,
  ],
  [WorkflowStage.SELECTING_MATERIALS]: [
    WorkflowStage.RUNNING_OPTIMIZATION,
    WorkflowStage.SELECTING_TANK_TYPE, // rollback
    WorkflowStage.FAILED,
    WorkflowStage.PAUSED,
  ],
  [WorkflowStage.RUNNING_OPTIMIZATION]: [
    WorkflowStage.EVALUATING_DESIGNS,
    WorkflowStage.FAILED,
    WorkflowStage.PAUSED,
  ],
  [WorkflowStage.EVALUATING_DESIGNS]: [
    WorkflowStage.SELECTING_OPTIMAL,
    WorkflowStage.RUNNING_OPTIMIZATION, // retry with different params
    WorkflowStage.FAILED,
    WorkflowStage.PAUSED,
  ],
  [WorkflowStage.SELECTING_OPTIMAL]: [
    WorkflowStage.RUNNING_ANALYSES,
    WorkflowStage.EVALUATING_DESIGNS, // re-evaluate
    WorkflowStage.FAILED,
    WorkflowStage.PAUSED,
  ],
  [WorkflowStage.RUNNING_ANALYSES]: [
    WorkflowStage.CHECKING_COMPLIANCE,
    WorkflowStage.FAILED,
    WorkflowStage.PAUSED,
  ],
  [WorkflowStage.CHECKING_COMPLIANCE]: [
    WorkflowStage.VALIDATING_DESIGN,
    WorkflowStage.RUNNING_ANALYSES, // retry analyses
    WorkflowStage.FAILED,
    WorkflowStage.PAUSED,
  ],
  [WorkflowStage.VALIDATING_DESIGN]: [
    WorkflowStage.GENERATING_EXPORT,
    WorkflowStage.CHECKING_COMPLIANCE, // recheck
    WorkflowStage.FAILED,
    WorkflowStage.PAUSED,
  ],
  [WorkflowStage.GENERATING_EXPORT]: [WorkflowStage.COMPLETED, WorkflowStage.FAILED],
  [WorkflowStage.COMPLETED]: [],
  [WorkflowStage.FAILED]: [
    WorkflowStage.INITIALIZING, // full restart
  ],
  [WorkflowStage.PAUSED]: [
    // Can resume from any paused stage
    WorkflowStage.PARSING_REQUIREMENTS,
    WorkflowStage.SELECTING_TANK_TYPE,
    WorkflowStage.SELECTING_MATERIALS,
    WorkflowStage.RUNNING_OPTIMIZATION,
    WorkflowStage.EVALUATING_DESIGNS,
    WorkflowStage.SELECTING_OPTIMAL,
    WorkflowStage.RUNNING_ANALYSES,
    WorkflowStage.CHECKING_COMPLIANCE,
    WorkflowStage.VALIDATING_DESIGN,
    WorkflowStage.GENERATING_EXPORT,
  ],
};

// Stage execution with error handling
async function executeStage(stage: WorkflowStage, context: WorkflowContext): Promise<StageResult> {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Execute stage-specific logic
      const result = await stageExecutors[stage](context);

      // Create checkpoint on major milestones
      if (CHECKPOINT_STAGES.includes(stage)) {
        await createCheckpoint(context.sessionId, stage);
      }

      return result;
    } catch (error) {
      attempt++;

      if (attempt >= maxRetries) {
        // Max retries exceeded
        return {
          success: false,
          error: error as Error,
          recoverable: isRecoverableError(error),
        };
      }

      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
}
```

### Deliverables

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

### Success Criteria

- [ ] Successfully orchestrates Requirements → Export in <30 seconds
- [ ] Handles errors gracefully with automatic retry
- [ ] State persists across server restarts
- [ ] Rollback restores to last stable checkpoint
- [ ] All decisions logged with explanations
- [ ] Progress updates broadcast in real-time
- [ ] 80%+ test coverage
- [ ] Zero memory leaks in 24-hour continuous operation

### Example Usage

```typescript
// Initialize orchestrator
const orchestrator = new AgentOrchestrator({
  decisionEngine: new DecisionEngine(),
  stateStore: new PostgresStateStore(),
  progressBroadcaster: new WebSocketBroadcaster(),
});

// Start workflow
const session = await orchestrator.initialize({
  mode: 'natural-language',
  input: 'I need a 70 MPa hydrogen tank for automotive use, 5kg capacity',
  userPreferences: {
    optimizationGoal: 'minimize-mass',
    safetyMargin: 'conservative',
  },
});

// Subscribe to progress
orchestrator.subscribe(session.id, (update) => {
  console.log(`Stage: ${update.stage}, Progress: ${update.progress}%`);
  console.log(`Current step: ${update.currentStep.description}`);
  if (update.decision) {
    console.log(`Decision: ${update.decision.question} → ${update.decision.selectedOption}`);
    console.log(`Reasoning: ${update.decision.reasoning}`);
  }
});

// Execute workflow
const result = await orchestrator.execute(session.id);

if (result.success) {
  console.log('Workflow completed successfully');
  console.log(`Design ID: ${result.designId}`);
  console.log(`Export package: ${result.exportPackageUrl}`);
} else {
  console.log(`Workflow failed: ${result.error.message}`);
  console.log(`Recoverable: ${result.error.recoverable}`);
  console.log(`Last checkpoint: ${result.lastCheckpoint.id}`);
}
```

---

## BACK-082: Agent State Machine

### Priority & Scope

**Priority**: P1 Critical
**Complexity**: L
**Requirements**: State Management
**Dependencies**: BACK-081

### Description

Define and implement the state machine that governs workflow transitions, ensuring valid state changes, persistence across restarts, and visualization support for UI integration.

### Core Capabilities

1. **State Definition**
   - 13 workflow stages (see BACK-081)
   - Valid transitions between stages
   - State metadata (progress %, ETA, current action)
   - Checkpoint markers at critical stages

2. **State Persistence**
   - PostgreSQL storage for production
   - In-memory store for testing
   - Automatic state snapshots every 5 seconds
   - State recovery on server restart

3. **State Visualization**
   - JSON representation for UI rendering
   - Progress calculation (weighted by stage complexity)
   - Stage history tracking
   - Timeline view support

4. **Timeout Handling**
   - Per-stage timeout configuration
   - Automatic transition to FAILED on timeout
   - Manual intervention hooks
   - Timeout warning broadcasts (at 80% of limit)

### Architecture

```typescript
// State machine implementation
class WorkflowStateMachine {
  private currentState: WorkflowStage;
  private stateHistory: StateHistoryEntry[];
  private stateStore: IStateStore;

  constructor(initialState: WorkflowStage, stateStore: IStateStore) {
    this.currentState = initialState;
    this.stateHistory = [];
    this.stateStore = stateStore;
  }

  // Transition with validation
  async transition(targetState: WorkflowStage, context: TransitionContext): Promise<boolean> {
    // Validate transition is allowed
    if (!this.canTransition(targetState)) {
      throw new InvalidTransitionError(
        `Cannot transition from ${this.currentState} to ${targetState}`
      );
    }

    // Execute pre-transition hooks
    await this.executePreTransitionHooks(targetState, context);

    // Record history
    this.stateHistory.push({
      fromState: this.currentState,
      toState: targetState,
      timestamp: new Date(),
      context: context,
    });

    // Update state
    const previousState = this.currentState;
    this.currentState = targetState;

    // Persist state
    await this.stateStore.saveState({
      stage: this.currentState,
      history: this.stateHistory,
      timestamp: new Date(),
    });

    // Execute post-transition hooks
    await this.executePostTransitionHooks(previousState, context);

    return true;
  }

  // Check if transition is valid
  canTransition(targetState: WorkflowStage): boolean {
    const allowedTargets = ALLOWED_TRANSITIONS[this.currentState] || [];
    return allowedTargets.includes(targetState);
  }

  // Get current state with metadata
  getState(): WorkflowStateSnapshot {
    const progress = this.calculateProgress();
    const eta = this.estimateCompletion();

    return {
      currentStage: this.currentState,
      progress: progress,
      estimatedCompletion: eta,
      stateHistory: this.stateHistory,
      canPause: this.isPauseable(),
      canRollback: this.hasCheckpoint(),
      nextStages: ALLOWED_TRANSITIONS[this.currentState],
    };
  }

  // Progress calculation (weighted by stage complexity)
  private calculateProgress(): number {
    const stageWeights: Record<WorkflowStage, number> = {
      [WorkflowStage.INITIALIZING]: 2,
      [WorkflowStage.PARSING_REQUIREMENTS]: 5,
      [WorkflowStage.SELECTING_TANK_TYPE]: 3,
      [WorkflowStage.SELECTING_MATERIALS]: 3,
      [WorkflowStage.RUNNING_OPTIMIZATION]: 30, // Most time-consuming
      [WorkflowStage.EVALUATING_DESIGNS]: 10,
      [WorkflowStage.SELECTING_OPTIMAL]: 5,
      [WorkflowStage.RUNNING_ANALYSES]: 20,
      [WorkflowStage.CHECKING_COMPLIANCE]: 8,
      [WorkflowStage.VALIDATING_DESIGN]: 7,
      [WorkflowStage.GENERATING_EXPORT]: 7,
      [WorkflowStage.COMPLETED]: 0,
      [WorkflowStage.FAILED]: 0,
      [WorkflowStage.PAUSED]: 0,
    };

    const totalWeight = Object.values(stageWeights).reduce((a, b) => a + b, 0);
    let completedWeight = 0;

    // Sum weights of completed stages
    for (const entry of this.stateHistory) {
      completedWeight += stageWeights[entry.fromState] || 0;
    }

    return Math.round((completedWeight / totalWeight) * 100);
  }

  // ETA estimation based on historical performance
  private estimateCompletion(): Date | null {
    // Use historical data to estimate remaining time
    // For MVP, use fixed stage durations
    const stageDurations: Record<WorkflowStage, number> = {
      [WorkflowStage.PARSING_REQUIREMENTS]: 2000,
      [WorkflowStage.SELECTING_TANK_TYPE]: 1000,
      [WorkflowStage.SELECTING_MATERIALS]: 1000,
      [WorkflowStage.RUNNING_OPTIMIZATION]: 15000,
      [WorkflowStage.EVALUATING_DESIGNS]: 3000,
      [WorkflowStage.SELECTING_OPTIMAL]: 1000,
      [WorkflowStage.RUNNING_ANALYSES]: 8000,
      [WorkflowStage.CHECKING_COMPLIANCE]: 2000,
      [WorkflowStage.VALIDATING_DESIGN]: 2000,
      [WorkflowStage.GENERATING_EXPORT]: 3000,
      // ... other stages
    };

    const remainingStages = this.getRemainingStages();
    const remainingTime = remainingStages.reduce(
      (total, stage) => total + (stageDurations[stage] || 0),
      0
    );

    return new Date(Date.now() + remainingTime);
  }
}

// State persistence interface
interface IStateStore {
  saveState(state: PersistedState): Promise<void>;
  loadState(sessionId: string): Promise<PersistedState | null>;
  deleteState(sessionId: string): Promise<void>;
  listSessions(): Promise<SessionMetadata[]>;
}

// PostgreSQL implementation
class PostgresStateStore implements IStateStore {
  async saveState(state: PersistedState): Promise<void> {
    await db.query(
      `INSERT INTO workflow_states (session_id, stage, state_data, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (session_id)
       DO UPDATE SET stage = $2, state_data = $3, updated_at = NOW()`,
      [state.sessionId, state.stage, JSON.stringify(state)]
    );
  }

  async loadState(sessionId: string): Promise<PersistedState | null> {
    const result = await db.query(`SELECT state_data FROM workflow_states WHERE session_id = $1`, [
      sessionId,
    ]);

    return result.rows[0]?.state_data || null;
  }
}
```

### Deliverables

- [ ] `src/orchestrator/StateMachine.ts` - State machine implementation
- [ ] `src/orchestrator/stores/IStateStore.ts` - State persistence interface
- [ ] `src/orchestrator/stores/PostgresStateStore.ts` - PostgreSQL implementation
- [ ] `src/orchestrator/stores/InMemoryStateStore.ts` - Testing implementation
- [ ] `migrations/xxx_create_workflow_states.sql` - Database schema
- [ ] `src/orchestrator/StateVisualizer.ts` - UI data formatting
- [ ] Unit tests for state machine logic (100% coverage)
- [ ] Integration tests for persistence
- [ ] State recovery tests (simulate server restart)

### Success Criteria

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

### Priority & Scope

**Priority**: P1 Critical
**Complexity**: XL
**Requirements**: REQ-070
**Dependencies**: BACK-081

### Description

Implements the decision-making logic that drives workflow routing. Combines rule-based decisions (deterministic), LLM-assisted decisions (ambiguous cases), and user preference learning.

### Core Capabilities

1. **Rule-Based Decisions**
   - Tank type selection (Type III vs Type IV based on pressure/temperature)
   - Material compatibility checks
   - Standard selection based on application
   - Optimization goal defaults

2. **LLM-Assisted Decisions**
   - Ambiguous requirement interpretation
   - Trade-off evaluation (cost vs mass vs safety)
   - Design recommendation selection
   - Constraint conflict resolution

3. **User Preference Learning**
   - Track historical selections per user
   - Identify patterns (e.g., always prefers Type IV)
   - Pre-populate decisions with learned preferences
   - Allow manual override

4. **Decision Audit Trail**
   - Log every decision with full context
   - Record reasoning (rule applied or LLM response)
   - Track confidence scores
   - Enable decision replay/explanation

5. **Explainable Decisions**
   - Human-readable explanations for every decision
   - Evidence citations (which rule, which data point)
   - Alternative options considered
   - Confidence levels

### Architecture

```typescript
// Decision engine interface
interface IDecisionEngine {
  // Make a decision
  decide(question: DecisionQuestion, context: DecisionContext): Promise<DecisionResult>;

  // Explain a past decision
  explain(decisionId: string): Promise<DecisionExplanation>;

  // Learn from user feedback
  learn(decisionId: string, userFeedback: UserFeedback): Promise<void>;

  // Get decision history
  getHistory(sessionId: string): Promise<DecisionRecord[]>;
}

// Decision question structure
interface DecisionQuestion {
  id: string;
  stage: WorkflowStage;
  type: DecisionType;
  question: string;
  options: DecisionOption[];
  constraints?: DecisionConstraint[];
  userPreferences?: UserPreferences;
}

enum DecisionType {
  TANK_TYPE_SELECTION = 'tank_type_selection',
  MATERIAL_SELECTION = 'material_selection',
  STANDARD_SELECTION = 'standard_selection',
  OPTIMIZATION_GOAL = 'optimization_goal',
  DESIGN_SELECTION = 'design_selection',
  TRADE_OFF_EVALUATION = 'trade_off_evaluation',
  CONSTRAINT_RESOLUTION = 'constraint_resolution',
}

// Decision result
interface DecisionResult {
  questionId: string;
  selectedOption: string;
  reasoning: string;
  confidence: number; // 0-1
  method: 'rule-based' | 'llm-assisted' | 'user-preference';
  alternativesConsidered: AlternativeOption[];
  evidenceCitations: EvidenceCitation[];
  timestamp: Date;
}

// Decision engine implementation
class AgentDecisionEngine implements IDecisionEngine {
  private ruleEngine: RuleEngine;
  private llmClient: LLMClient;
  private preferenceStore: IPreferenceStore;
  private decisionLog: IDecisionLog;

  async decide(question: DecisionQuestion, context: DecisionContext): Promise<DecisionResult> {
    // Step 1: Check for user preference
    const userPref = await this.preferenceStore.getPreference(context.userId, question.type);

    if (userPref && userPref.confidence > 0.8) {
      return {
        questionId: question.id,
        selectedOption: userPref.preferredOption,
        reasoning: `Based on your past selections, you typically prefer ${userPref.preferredOption}`,
        confidence: userPref.confidence,
        method: 'user-preference',
        alternativesConsidered: question.options,
        evidenceCitations: [
          {
            type: 'historical-selection',
            description: `${userPref.selectionCount} previous selections`,
          },
        ],
        timestamp: new Date(),
      };
    }

    // Step 2: Try rule-based decision
    const ruleResult = await this.ruleEngine.evaluate(question, context);

    if (ruleResult.applicable) {
      return {
        questionId: question.id,
        selectedOption: ruleResult.selectedOption,
        reasoning: ruleResult.rule.explanation,
        confidence: ruleResult.rule.confidence,
        method: 'rule-based',
        alternativesConsidered: ruleResult.alternativesConsidered,
        evidenceCitations: ruleResult.rule.evidenceCitations,
        timestamp: new Date(),
      };
    }

    // Step 3: Fall back to LLM for ambiguous cases
    const llmResult = await this.llmClient.decideWithReasoning({
      question: question.question,
      options: question.options,
      context: context,
      requirements: context.requirements,
    });

    const result = {
      questionId: question.id,
      selectedOption: llmResult.selectedOption,
      reasoning: llmResult.reasoning,
      confidence: llmResult.confidence,
      method: 'llm-assisted' as const,
      alternativesConsidered: llmResult.alternativesConsidered,
      evidenceCitations: llmResult.evidenceCitations,
      timestamp: new Date(),
    };

    // Log decision
    await this.decisionLog.record(result);

    return result;
  }

  async explain(decisionId: string): Promise<DecisionExplanation> {
    const decision = await this.decisionLog.get(decisionId);

    return {
      question: decision.question,
      selectedOption: decision.selectedOption,
      reasoning: decision.reasoning,
      method: decision.method,
      evidence: decision.evidenceCitations,
      alternatives: decision.alternativesConsidered.map((alt) => ({
        option: alt.option,
        whyNotSelected: alt.rejectionReason,
      })),
      userCanOverride: true,
    };
  }

  async learn(decisionId: string, userFeedback: UserFeedback): Promise<void> {
    const decision = await this.decisionLog.get(decisionId);

    if (userFeedback.action === 'accept') {
      // Reinforce preference
      await this.preferenceStore.recordSelection(
        userFeedback.userId,
        decision.questionType,
        decision.selectedOption
      );
    } else if (userFeedback.action === 'override') {
      // Learn from correction
      await this.preferenceStore.recordSelection(
        userFeedback.userId,
        decision.questionType,
        userFeedback.correctedOption
      );

      // If LLM decision was overridden, log for model improvement
      if (decision.method === 'llm-assisted') {
        await this.llmClient.logFeedback({
          decisionId: decisionId,
          wasCorrect: false,
          correctOption: userFeedback.correctedOption,
        });
      }
    }
  }
}

// Rule engine for deterministic decisions
class RuleEngine {
  private rules: DecisionRule[];

  async evaluate(
    question: DecisionQuestion,
    context: DecisionContext
  ): Promise<RuleEvaluationResult> {
    // Find applicable rule
    const applicableRule = this.rules.find(
      (rule) => rule.type === question.type && rule.condition(context)
    );

    if (!applicableRule) {
      return { applicable: false };
    }

    // Execute rule
    const selectedOption = applicableRule.select(context, question.options);

    return {
      applicable: true,
      rule: applicableRule,
      selectedOption: selectedOption,
      alternativesConsidered: question.options.filter((opt) => opt.id !== selectedOption),
    };
  }
}

// Example rules
const TANK_TYPE_SELECTION_RULE: DecisionRule = {
  type: DecisionType.TANK_TYPE_SELECTION,
  name: 'High Pressure Type IV Rule',
  condition: (context) => {
    const pressure = context.requirements.workingPressure;
    return pressure >= 70; // MPa
  },
  select: (context, options) => {
    // Type IV for high pressure (≥70 MPa)
    return options.find((opt) => opt.id === 'type-iv')!.id;
  },
  explanation: 'Type IV tanks are required for working pressures ≥70 MPa',
  confidence: 0.95,
  evidenceCitations: [
    {
      type: 'standard',
      description: 'ISO 11119-3 recommends Type IV for high-pressure applications',
    },
    {
      type: 'engineering-data',
      description: 'Type IV tanks demonstrate superior performance above 70 MPa',
    },
  ],
};

const MATERIAL_SELECTION_RULE: DecisionRule = {
  type: DecisionType.MATERIAL_SELECTION,
  name: 'Cryogenic HDPE Liner Rule',
  condition: (context) => {
    const minTemp = context.requirements.minTemperature;
    return minTemp < -40; // °C
  },
  select: (context, options) => {
    // HDPE liner for cryogenic temps
    return options.find((opt) => opt.id === 'hdpe-liner')!.id;
  },
  explanation: 'HDPE maintains ductility at cryogenic temperatures below -40°C',
  confidence: 0.9,
  evidenceCitations: [
    {
      type: 'material-data',
      description: 'HDPE glass transition temperature: -110°C',
    },
  ],
};
```

### Deliverables

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

### Success Criteria

- [ ] 95%+ accuracy on rule-based decisions
- [ ] LLM fallback latency <2 seconds
- [ ] All decisions logged with explanations
- [ ] User preference learning improves accuracy over time
- [ ] Decision explanations validated by domain expert
- [ ] Zero decisions made without audit trail
- [ ] 100% test coverage on rule logic

---

## BACK-084: Agent Progress Broadcasting

### Priority & Scope

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: REQ-410 (Async progress tracking)
**Dependencies**: BACK-081, BACK-082

### Description

Real-time progress broadcasting system using WebSockets to stream workflow status updates to connected clients. Enables live monitoring of agent execution.

### Core Capabilities

1. **WebSocket Server**
   - Connection management (multiple concurrent workflows)
   - Client authentication and authorization
   - Automatic reconnection handling
   - Heartbeat/ping-pong for connection health

2. **Progress Updates**
   - Current stage and substep
   - Progress percentage (0-100)
   - Estimated completion time
   - Decisions made with reasoning
   - Next action preview

3. **Event Types**
   - `workflow.started` - Initial connection
   - `workflow.stage_changed` - Stage transition
   - `workflow.progress_updated` - Progress increment
   - `workflow.decision_made` - Decision recorded
   - `workflow.error` - Error occurred
   - `workflow.paused` - User paused
   - `workflow.resumed` - User resumed
   - `workflow.completed` - Workflow finished
   - `workflow.failed` - Workflow failed

4. **Client Library**
   - TypeScript client for frontend integration
   - Automatic reconnection with exponential backoff
   - Message queuing during disconnection
   - Type-safe event handlers

### Architecture

```typescript
// WebSocket server implementation
import { WebSocketServer, WebSocket } from 'ws';

class AgentProgressBroadcaster {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocket>>;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.clients = new Map();

    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(ws: WebSocket, req: Request) {
    // Extract session ID from URL
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      ws.close(1008, 'Missing sessionId parameter');
      return;
    }

    // Authenticate client (verify session exists)
    // ... auth logic ...

    // Register client
    if (!this.clients.has(sessionId)) {
      this.clients.set(sessionId, new Set());
    }
    this.clients.get(sessionId)!.add(ws);

    // Send initial state
    this.sendInitialState(ws, sessionId);

    // Handle disconnection
    ws.on('close', () => {
      this.clients.get(sessionId)?.delete(ws);
      if (this.clients.get(sessionId)?.size === 0) {
        this.clients.delete(sessionId);
      }
    });

    // Heartbeat
    ws.on('pong', () => {
      (ws as any).isAlive = true;
    });
  }

  // Broadcast progress update to all clients watching this session
  broadcast(sessionId: string, event: ProgressEvent): void {
    const clients = this.clients.get(sessionId);

    if (!clients || clients.size === 0) {
      return;
    }

    const message = JSON.stringify(event);

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Send initial state to newly connected client
  private async sendInitialState(ws: WebSocket, sessionId: string): Promise<void> {
    const state = await getWorkflowState(sessionId);

    ws.send(
      JSON.stringify({
        type: 'workflow.started',
        data: {
          sessionId: sessionId,
          stage: state.stage,
          progress: state.progress,
          estimatedCompletion: state.estimatedCompletion,
          decisions: state.decisions,
        },
        timestamp: new Date().toISOString(),
      })
    );
  }

  // Heartbeat interval to detect dead connections
  startHeartbeat(): void {
    setInterval(() => {
      this.clients.forEach((clients, sessionId) => {
        clients.forEach((client) => {
          if (!(client as any).isAlive) {
            client.terminate();
            clients.delete(client);
            return;
          }

          (client as any).isAlive = false;
          client.ping();
        });
      });
    }, 30000); // 30 seconds
  }
}

// Progress event structure
interface ProgressEvent {
  type: ProgressEventType;
  data: ProgressEventData;
  timestamp: string;
}

type ProgressEventType =
  | 'workflow.started'
  | 'workflow.stage_changed'
  | 'workflow.progress_updated'
  | 'workflow.decision_made'
  | 'workflow.error'
  | 'workflow.paused'
  | 'workflow.resumed'
  | 'workflow.completed'
  | 'workflow.failed';

interface ProgressEventData {
  sessionId: string;
  stage?: WorkflowStage;
  progress?: number;
  estimatedCompletion?: string;
  currentStep?: StepDescriptor;
  decision?: DecisionRecord;
  error?: ErrorRecord;
  nextAction?: NextActionPreview;
}

// Client library for frontend
class AgentProgressClient {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private eventHandlers: Map<ProgressEventType, Function[]> = new Map();

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  connect(): void {
    const url = `ws://localhost:3001/api/agent/progress?sessionId=${this.sessionId}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log(`Connected to workflow ${this.sessionId}`);
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const progressEvent: ProgressEvent = JSON.parse(event.data);
      this.handleEvent(progressEvent);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed, attempting reconnect...');
      this.reconnect();
    };
  }

  private handleEvent(event: ProgressEvent): void {
    const handlers = this.eventHandlers.get(event.type) || [];
    handlers.forEach((handler) => handler(event.data));
  }

  on(eventType: ProgressEventType, handler: Function): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    setTimeout(() => {
      console.log(`Reconnect attempt ${this.reconnectAttempts}`);
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

### Deliverables

- [ ] `src/broadcasting/AgentProgressBroadcaster.ts` - WebSocket server
- [ ] `src/broadcasting/ProgressEventTypes.ts` - Event type definitions
- [ ] `src/broadcasting/ClientAuthentication.ts` - Auth middleware
- [ ] `proagentic-dfx/src/lib/agent/AgentProgressClient.ts` - Frontend client
- [ ] `GET /api/agent/progress (WebSocket)` - WebSocket endpoint
- [ ] Unit tests for broadcaster (event emission)
- [ ] Integration tests for client reconnection
- [ ] Load tests (100 concurrent connections)

### Success Criteria

- [ ] Supports 100+ concurrent connections
- [ ] Messages delivered within 100ms of emission
- [ ] Automatic reconnection works after network drop
- [ ] No messages lost during brief disconnections
- [ ] Heartbeat detects dead connections within 30s
- [ ] Client library handles all event types
- [ ] Zero memory leaks over 24-hour operation

### Example Usage

```typescript
// Frontend usage
const progressClient = new AgentProgressClient(sessionId);

progressClient.on('workflow.stage_changed', (data) => {
  console.log(`Stage changed to: ${data.stage}`);
  updateUI({ stage: data.stage });
});

progressClient.on('workflow.progress_updated', (data) => {
  console.log(`Progress: ${data.progress}%`);
  updateProgressBar(data.progress);
});

progressClient.on('workflow.decision_made', (data) => {
  console.log(`Decision: ${data.decision.question}`);
  console.log(`Selected: ${data.decision.selectedOption}`);
  console.log(`Reasoning: ${data.decision.reasoning}`);
  showDecisionNotification(data.decision);
});

progressClient.on('workflow.completed', (data) => {
  console.log('Workflow completed!');
  redirectToExportPage();
});

progressClient.on('workflow.failed', (data) => {
  console.error(`Workflow failed: ${data.error.message}`);
  showErrorDialog(data.error);
});

progressClient.connect();
```

---

## BACK-085: Agent Error Recovery

### Priority & Scope

**Priority**: P1 Critical
**Complexity**: M
**Requirements**: Error Handling
**Dependencies**: BACK-081, BACK-082

### Description

Comprehensive error recovery system that handles failures gracefully with automatic retry, graceful degradation, partial result preservation, and manual recovery UI.

### Core Capabilities

1. **Automatic Retry with Backoff**
   - Exponential backoff (1s, 2s, 4s, 8s, 16s)
   - Max 5 retries per operation
   - Different retry strategies per error type
   - Circuit breaker to prevent cascade failures

2. **Graceful Degradation**
   - Skip optional analyses on failure
   - Continue workflow with partial results
   - Mark skipped operations clearly in output
   - Provide degraded capability warnings

3. **Partial Result Preservation**
   - Save intermediate results at checkpoints
   - Preserve Pareto front even if analysis fails
   - Allow manual continuation from last success
   - Export partial results if final export fails

4. **Manual Recovery UI**
   - Show recovery options to user
   - Allow retry with modified parameters
   - Provide skip/continue option
   - Display error context and suggestions

5. **Error Classification**
   - **Transient**: Retry automatically (network timeout, rate limit)
   - **Validation**: User input required (invalid material combination)
   - **Fatal**: Cannot recover (API key invalid, service down)
   - **Degradable**: Can skip (optional analysis unavailable)

### Architecture

```typescript
// Error recovery manager
class ErrorRecoveryManager {
  private circuitBreakers: Map<string, CircuitBreaker>;
  private retryStrategies: Map<ErrorClass, RetryStrategy>;

  constructor() {
    this.circuitBreakers = new Map();
    this.initializeRetryStrategies();
  }

  async executeWithRecovery<T>(
    operation: Operation<T>,
    context: OperationContext
  ): Promise<RecoveryResult<T>> {
    const circuitBreaker = this.getCircuitBreaker(operation.id);

    // Check circuit breaker state
    if (circuitBreaker.isOpen()) {
      return {
        success: false,
        error: new CircuitBreakerOpenError(`Operation ${operation.id} circuit is open`),
        recoveryAction: RecoveryAction.SKIP_OR_MANUAL,
      };
    }

    let lastError: Error | null = null;
    let attempt = 0;
    const errorClass = await this.classifyError(operation);
    const strategy = this.retryStrategies.get(errorClass)!;

    while (attempt < strategy.maxRetries) {
      try {
        // Execute operation
        const result = await operation.execute(context);

        // Success - reset circuit breaker
        circuitBreaker.recordSuccess();

        return {
          success: true,
          data: result,
          recoveryAction: null,
        };
      } catch (error) {
        lastError = error as Error;
        attempt++;

        // Record failure in circuit breaker
        circuitBreaker.recordFailure();

        // Classify error
        const classification = await this.classifyError(error);

        // Check if retryable
        if (!strategy.shouldRetry(error, attempt)) {
          break;
        }

        // Wait before retry (exponential backoff)
        const delay = strategy.calculateDelay(attempt);
        await sleep(delay);

        console.log(`Retry ${attempt}/${strategy.maxRetries} for ${operation.id} after ${delay}ms`);
      }
    }

    // All retries exhausted or non-retryable error
    const recoveryAction = await this.determineRecoveryAction(lastError!, context);

    return {
      success: false,
      error: lastError!,
      recoveryAction: recoveryAction,
      partialResults: context.partialResults,
    };
  }

  private async classifyError(error: Error): Promise<ErrorClass> {
    // Network errors - transient
    if (error.name === 'NetworkError' || error.message.includes('timeout')) {
      return ErrorClass.TRANSIENT;
    }

    // Validation errors - user input required
    if (error.name === 'ValidationError') {
      return ErrorClass.VALIDATION;
    }

    // Rate limiting - transient with longer backoff
    if (error.message.includes('rate limit')) {
      return ErrorClass.TRANSIENT;
    }

    // Auth errors - fatal
    if (error.name === 'UnauthorizedError') {
      return ErrorClass.FATAL;
    }

    // Analysis errors - potentially degradable
    if (error.name === 'AnalysisError') {
      return ErrorClass.DEGRADABLE;
    }

    // Default to fatal
    return ErrorClass.FATAL;
  }

  private async determineRecoveryAction(
    error: Error,
    context: OperationContext
  ): Promise<RecoveryAction> {
    const errorClass = await this.classifyError(error);

    switch (errorClass) {
      case ErrorClass.TRANSIENT:
        // Should have been retried, but all retries failed
        return RecoveryAction.MANUAL_RETRY;

      case ErrorClass.VALIDATION:
        // User needs to correct input
        return RecoveryAction.USER_INPUT_REQUIRED;

      case ErrorClass.DEGRADABLE:
        // Can skip this operation
        if (context.operation.isOptional) {
          return RecoveryAction.SKIP_AND_CONTINUE;
        } else {
          return RecoveryAction.DEGRADE_AND_CONTINUE;
        }

      case ErrorClass.FATAL:
        // Cannot recover automatically
        return RecoveryAction.ABORT_WITH_PARTIAL;

      default:
        return RecoveryAction.ABORT_WITH_PARTIAL;
    }
  }

  // Circuit breaker implementation
  private getCircuitBreaker(operationId: string): CircuitBreaker {
    if (!this.circuitBreakers.has(operationId)) {
      this.circuitBreakers.set(
        operationId,
        new CircuitBreaker({
          failureThreshold: 5, // Open after 5 consecutive failures
          resetTimeout: 60000, // Try again after 60s
        })
      );
    }
    return this.circuitBreakers.get(operationId)!;
  }

  private initializeRetryStrategies(): void {
    this.retryStrategies.set(ErrorClass.TRANSIENT, {
      maxRetries: 5,
      shouldRetry: (error, attempt) => attempt < 5,
      calculateDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 30000),
    });

    this.retryStrategies.set(ErrorClass.VALIDATION, {
      maxRetries: 0, // No automatic retry
      shouldRetry: () => false,
      calculateDelay: () => 0,
    });

    this.retryStrategies.set(ErrorClass.DEGRADABLE, {
      maxRetries: 2, // Try twice then degrade
      shouldRetry: (error, attempt) => attempt < 2,
      calculateDelay: (attempt) => 2000 * attempt,
    });

    this.retryStrategies.set(ErrorClass.FATAL, {
      maxRetries: 0, // No retry
      shouldRetry: () => false,
      calculateDelay: () => 0,
    });
  }
}

// Circuit breaker implementation
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failures = 0;
  private lastFailureTime: Date | null = null;

  constructor(private config: CircuitBreakerConfig) {}

  isOpen(): boolean {
    // If circuit is open, check if reset timeout has passed
    if (this.state === 'open' && this.lastFailureTime) {
      const elapsed = Date.now() - this.lastFailureTime.getTime();
      if (elapsed > this.config.resetTimeout) {
        this.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'open';
    }
  }
}

// Error classes
enum ErrorClass {
  TRANSIENT = 'transient', // Retry automatically
  VALIDATION = 'validation', // User input required
  DEGRADABLE = 'degradable', // Can skip operation
  FATAL = 'fatal', // Cannot recover
}

// Recovery actions
enum RecoveryAction {
  MANUAL_RETRY = 'manual_retry',
  USER_INPUT_REQUIRED = 'user_input_required',
  SKIP_AND_CONTINUE = 'skip_and_continue',
  DEGRADE_AND_CONTINUE = 'degrade_and_continue',
  ABORT_WITH_PARTIAL = 'abort_with_partial',
}

// Recovery result
interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  recoveryAction: RecoveryAction | null;
  partialResults?: Record<string, unknown>;
}
```

### Deliverables

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

### Success Criteria

- [ ] 90%+ recovery rate for transient errors
- [ ] Circuit breaker prevents cascade failures
- [ ] Partial results preserved at all checkpoints
- [ ] Manual recovery UI provides clear options
- [ ] All errors classified correctly
- [ ] No data loss during recovery
- [ ] Recovery actions execute within 5 seconds

---

## BACK-086: UAT Flow Automation

### Priority & Scope

**Priority**: P2 Enhancement
**Complexity**: L
**Requirements**: Automated Testing
**Dependencies**: BACK-081, UAT Automation Skill

### Description

Automated test runner that uses the agent orchestrator to execute the complete UAT workflow, capturing screenshots at milestones, validating results, and detecting regressions.

### Core Capabilities

1. **Automated Test Runner**
   - Execute all 30 UAT smoke tests using agent
   - Screen-by-screen navigation
   - Screenshot capture at checkpoints
   - Parallel test execution (where possible)

2. **Validation**
   - Automated pass/fail determination using CV
   - Screenshot comparison for regression detection
   - Error message detection
   - Performance threshold validation

3. **Regression Detection**
   - Baseline screenshot storage
   - Visual diff calculation
   - Threshold-based failure detection
   - Changelog correlation (link failures to commits)

4. **Reporting**
   - Markdown report with embedded screenshots
   - Pass/fail summary
   - Performance metrics (workflow duration)
   - Failure analysis with stack traces

### Architecture

```typescript
// UAT automation orchestrator
class UATFlowAutomation {
  private orchestrator: AgentOrchestrator;
  private browser: Browser; // Playwright
  private screenshotBaselines: Map<string, Buffer>;

  async runFullUATSuite(): Promise<UATReport> {
    const report: UATReport = {
      totalTests: 30,
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: [],
      startTime: new Date(),
      endTime: null,
      screenshots: [],
    };

    // Initialize browser
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Test 1: App loads
    await this.runTest(
      'SMOKE-001',
      async () => {
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        const screenshot = await page.screenshot();
        await this.compareScreenshot('smoke-001-app-load', screenshot);
      },
      report
    );

    // Test 5-9: Requirements workflow via agent
    await this.runTest(
      'SMOKE-005-009',
      async () => {
        // Use agent orchestrator to fill requirements
        const session = await this.orchestrator.initialize({
          mode: 'structured',
          input: {
            workingPressure: 70,
            capacity: 5,
            application: 'automotive',
          },
        });

        // Monitor progress in UI
        await page.waitForSelector('[data-testid="requirements-submitted"]');

        // Capture screenshot
        const screenshot = await page.screenshot({ fullPage: true });
        await this.compareScreenshot('smoke-009-requirements-submitted', screenshot);
      },
      report
    );

    // Test 10-13: Pareto exploration via agent
    await this.runTest(
      'SMOKE-010-013',
      async () => {
        // Agent should have generated Pareto front
        await page.click('[data-nav="pareto"]');
        await page.waitForSelector('[data-testid="pareto-chart"]');

        // Agent selects optimal design
        const result = await this.orchestrator.execute(session.id);

        // Verify selection in UI
        await page.waitForSelector('[data-testid="design-selected"]');

        const screenshot = await page.screenshot({ fullPage: true });
        await this.compareScreenshot('smoke-013-design-selected', screenshot);
      },
      report
    );

    // Continue for all 30 tests...

    report.endTime = new Date();
    await browser.close();

    return report;
  }

  private async runTest(
    testId: string,
    testFn: () => Promise<void>,
    report: UATReport
  ): Promise<void> {
    try {
      await testFn();
      report.passed++;
      report.tests.push({
        id: testId,
        status: 'passed',
        duration: 0, // Calculate actual duration
      });
    } catch (error) {
      report.failed++;
      report.tests.push({
        id: testId,
        status: 'failed',
        error: (error as Error).message,
        duration: 0,
      });
    }
  }

  private async compareScreenshot(name: string, screenshot: Buffer): Promise<void> {
    const baseline = this.screenshotBaselines.get(name);

    if (!baseline) {
      // No baseline - save as new baseline
      this.screenshotBaselines.set(name, screenshot);
      await fs.writeFile(`baselines/${name}.png`, screenshot);
      return;
    }

    // Compare with baseline using pixelmatch
    const diff = pixelmatch(
      PNG.sync.read(baseline).data,
      PNG.sync.read(screenshot).data,
      null,
      1920,
      1080,
      { threshold: 0.1 }
    );

    const diffPercentage = (diff / (1920 * 1080)) * 100;

    if (diffPercentage > 5) {
      // Visual regression detected
      throw new VisualRegressionError(
        `Screenshot ${name} differs by ${diffPercentage.toFixed(2)}%`
      );
    }
  }
}
```

### Deliverables

- [ ] `src/testing/UATFlowAutomation.ts` - Test runner
- [ ] `src/testing/ScreenshotComparator.ts` - Visual regression detection
- [ ] `src/testing/UATReportGenerator.ts` - Report generation
- [ ] `scripts/run-uat-automation.ts` - CLI runner
- [ ] `baselines/` - Baseline screenshot directory
- [ ] GitHub Actions workflow for nightly UAT runs
- [ ] Unit tests for test runner logic
- [ ] Documentation for adding new UAT tests

### Success Criteria

- [ ] All 30 UAT tests execute successfully
- [ ] Screenshot comparison detects visual regressions
- [ ] Full suite completes in <5 minutes
- [ ] Report generated in Markdown with embedded images
- [ ] Failures correlated to recent commits
- [ ] Can run in CI/CD pipeline
- [ ] Zero flaky tests (3 consecutive runs, same result)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

- [ ] BACK-082: Agent State Machine (Core infrastructure)
- [ ] BACK-081: Agent Execution Orchestrator (Minimal viable orchestrator)
- [ ] BACK-084: Progress Broadcasting (WebSocket setup)

### Phase 2: Intelligence (Week 3-4)

- [ ] BACK-083: Agent Decision Engine (Rule-based + LLM fallback)
- [ ] BACK-085: Error Recovery (Retry + Circuit breaker)

### Phase 3: Validation (Week 5)

- [ ] BACK-086: UAT Flow Automation (Automated testing)
- [ ] End-to-end integration testing
- [ ] Performance optimization

### Phase 4: Polish (Week 6)

- [ ] Manual recovery UI
- [ ] Documentation
- [ ] Demo preparation for competition interview

---

## Testing Strategy

### Unit Tests

- **State Machine**: 100% coverage of transitions
- **Decision Engine**: 100% coverage of rules
- **Error Recovery**: All error classes and recovery actions
- **Progress Broadcasting**: Event emission and delivery

### Integration Tests

- **Full Workflow**: Requirements → Export
- **Error Recovery**: Inject failures at each stage
- **WebSocket**: Client reconnection scenarios
- **State Persistence**: Server restart mid-workflow

### Performance Tests

- **Orchestration Latency**: <30s for typical workflow
- **Decision Latency**: <500ms for rule-based, <2s for LLM
- **WebSocket Throughput**: 100+ concurrent connections
- **State Persistence**: <100ms to save state

### Chaos Tests

- **Network Failures**: Random connection drops
- **Service Outages**: Simulate mock server down
- **Resource Exhaustion**: Memory pressure, CPU saturation
- **Concurrent Workflows**: 10+ simultaneous executions

---

## Success Metrics

### Technical Metrics

| Metric                    | Target | Measurement                 |
| ------------------------- | ------ | --------------------------- |
| Workflow Success Rate     | >95%   | Completed / Total           |
| Error Recovery Rate       | >90%   | Recovered / Total Errors    |
| Average Workflow Duration | <30s   | Median completion time      |
| Decision Accuracy         | >95%   | Correct / Total Decisions   |
| WebSocket Uptime          | >99.9% | Connected time / Total time |
| State Persistence Latency | <100ms | Write time                  |

### User Experience Metrics

| Metric                     | Target | Measurement              |
| -------------------------- | ------ | ------------------------ |
| "One-click" Design Success | >90%   | No manual intervention   |
| User Satisfaction          | 4.5+/5 | Post-workflow survey     |
| Decision Explainability    | 4.0+/5 | User comprehension score |
| Error Message Clarity      | 4.0+/5 | User feedback            |

### Competition Impact

- **Demonstrates** advanced agentic AI capability (UKRI scoring)
- **Reduces** design time from hours to minutes
- **Enables** non-expert users to create compliant designs
- **Provides** audit trail for regulatory submission

---

## Appendix: API Specifications

### POST /api/agent/orchestrate

**Description**: Start new workflow orchestration

**Request**:

```typescript
{
  mode: 'natural-language' | 'structured',
  input: string | StructuredRequirements,
  userPreferences?: {
    optimizationGoal?: 'minimize-mass' | 'minimize-cost',
    safetyMargin?: 'conservative' | 'standard' | 'aggressive',
  },
}
```

**Response**:

```typescript
{
  sessionId: string,
  stage: WorkflowStage,
  estimatedCompletion: string, // ISO 8601
  websocketUrl: string,
}
```

### GET /api/agent/{sessionId}

**Description**: Get current workflow state

**Response**:

```typescript
{
  sessionId: string,
  stage: WorkflowStage,
  progress: number, // 0-100
  estimatedCompletion: string,
  decisions: DecisionRecord[],
  checkpoints: Checkpoint[],
  errors: ErrorRecord[],
}
```

### POST /api/agent/{sessionId}/pause

**Description**: Pause workflow execution

**Response**:

```typescript
{
  success: boolean,
  pausedAt: string, // ISO 8601
  stage: WorkflowStage,
}
```

### WS /api/agent/progress?sessionId={id}

**Description**: WebSocket for real-time progress updates

**Events**:

- `workflow.started`
- `workflow.stage_changed`
- `workflow.progress_updated`
- `workflow.decision_made`
- `workflow.error`
- `workflow.paused`
- `workflow.resumed`
- `workflow.completed`
- `workflow.failed`

**Event Schema**:

```typescript
{
  type: ProgressEventType,
  data: {
    sessionId: string,
    stage?: WorkflowStage,
    progress?: number,
    decision?: DecisionRecord,
    error?: ErrorRecord,
  },
  timestamp: string, // ISO 8601
}
```

---

**Document Status**: Draft
**Next Review**: After Phase 1 implementation
**Owner**: @h2-tank-team
**Created**: 2025-12-12
