---
name: Dev Planning
description: |
  AI-driven development planning skill that produces TDD-ready specifications using research-backed methodologies (Plan-then-Act, Reflexion, ToT/LATS, ReAct).

  USE THIS SKILL PROACTIVELY when:
  - User requests a feature implementation
  - User reports a bug that needs fixing
  - User asks for code refactoring
  - Task involves multiple files or components
  - Requirements need clarification before coding
  - You need to create a comprehensive development plan

  This skill implements the complete planning pipeline: repo analysis → test-first design → structured plan generation → self-critique → TDD handover specification.

  OUTPUT: Structured TDD Handover Spec (JSON + Markdown) ready for TDD agent consumption.
allowed-tools: Read, Grep, Glob, Write, Task, mcp__context7__resolve-library-id, mcp__context7__get-library-docs, mcp__sequential-thinking__sequentialthinking
---

# Dev Planning Skill - Research-Backed AI Planning for TDD

> **⚠️ IMPORTANT: READ CLAUDE.md FIRST** - This skill implements the continuous execution control pattern defined in `/home/chine/projects/proagentic-clean/CLAUDE.md` (lines 105-225, 800-880). All planning follows ProAgentic MCP coordination requirements.

## Overview

This skill transforms user requests (features, bugs, refactors) into comprehensive, TDD-ready development plans using research-backed AI planning methodologies:

- **Plan-then-Act Paradigm**: Separate planning from execution for reliability
- **Test-First Design**: Specify tests before implementation (acceptance criteria, reproduction tests, unit/integration tests)
- **Structured Plans**: Use JSON schema + Markdown for unambiguous interpretation
- **Context Packaging**: Compress relevant context (≤2k tokens briefing + full appendix)
- **Self-Critique (Reflexion)**: Internal validation before handover
- **Tool-Aware Planning**: Explicit commands/tools for each step
- **Repo-Level Awareness**: Dependency analysis and multi-file coordination

**Research Foundation**: Based on Microsoft Research (2024), Anthropic agent guidelines (2024), Routine framework, Planning-Driven Programming, ChatDev multi-agent collaboration, and SWE-bench TDD patterns.

## Three-Phase Planning Pipeline

### Phase A: Intake & Grounding

**Goal**: Understand the problem, gather context, establish baseline

1. **Normalize the request**
   - Extract: goal, scope, non-goals, constraints, definition of done
   - For bugs: capture repro steps, observed vs. expected behavior
   - For features: identify user stories and acceptance criteria
   - For refactors: document current state and target state

2. **Repo analysis (read-only)**
   - Identify modules/files likely impacted
   - Map public interfaces, invariants, dependencies
   - List entry points and call chains
   - Document current architectural patterns
   - **Use Task tool with dev-planning-repo-analyzer subagent**

3. **Context7 baseline**
   - Query Context7 for all relevant libraries (React 18, Express 4, Vite 5, TypeScript, etc.)
   - Document current best practices
   - Identify patterns to follow
   - **Mandatory per CLAUDE.md continuous QA requirements**

### Phase B: Plan the Work (Before Code)

**Goal**: Decompose into testable steps, design tests first, specify action sequence

4. **Sequential Thinking: Initial decomposition**
   - Use Sequential Thinking to break down task logically
   - Identify dependencies and parallelization opportunities
   - Consider alternative approaches (ToT/LATS branching for complex problems)
   - Score and select best approach
   - **Mandatory per CLAUDE.md continuous execution control**

5. **Design tests FIRST (TDD)**
   - Write acceptance criteria in Gherkin (Given/When/Then)
   - Specify unit test intents (test names, targets, cases)
   - Specify integration test intents (scope, environment setup)
   - For bugs: create Fail-to-Pass reproduction test
   - For features: define examples and edge cases
   - Note coverage goals for changed code paths
   - **Use Task tool with dev-planning-test-designer subagent**

6. **Action sequence & tool specification**
   - For each step: specify files to touch, edit intent, test to write/run, command to execute
   - Examples: `pytest tests/test_bug_xyz.py`, `npm test`, `npm run lint`, etc.
   - Define expected initial result (FAIL) and expected final result (PASS)
   - This implements ReAct pattern: reasoning interleaved with concrete actions
   - Order by dependency: tests first → minimal fix → pass → refactor

### Phase C: Handover Preparation

**Goal**: Create TDD-ready handover spec with self-validation

7. **Context packaging**
   - Produce compact Briefing (≤2k tokens): problem, approach, impact, risks, first command
   - Produce Full Appendix (JSON): complete structured specification
   - Prioritize brevity and structure (research shows long instructions degrade TDD performance)
   - **Use Task tool with dev-planning-context-packager subagent**

8. **Self-review (Reflexion)**
   - Run Reflexion-style critique: Are all ACs testable? Missing edge cases? Conflicts?
   - Adversarial check: Try to "poke holes" in the plan
   - Update spec based on critique
   - **Use Task tool with dev-planning-self-reviewer subagent**

9. **Quality gates validation**
   - Completeness: Every AC has test intent, every step defines commands + expected results
   - Determinism: No ambiguous "maybe/should"; each step yields PASS/FAIL
   - Context tightness: Briefing under target length, JSON validates against schema
   - Tool awareness: All commands are executable and tool references are valid
   - **Block handover unless all gates pass**

10. **Emit TDD Handover Spec**
    - Write JSON specification (following schema in templates/TDD_HANDOVER_SPEC.json)
    - Write Markdown briefing (following template in templates/TDD_HANDOVER_SPEC.md)
    - Both saved in project root: `TDD_HANDOVER_SPEC.json` and `TDD_HANDOVER_SPEC.md`
    - Display path to user: "TDD Handover Spec ready at: /path/to/TDD_HANDOVER_SPEC.md"

## Integration with ProAgentic MCP Coordination

This skill implements the continuous execution control pattern from CLAUDE.md:

```
Initial Analysis (Sequential Thinking)
    ↓
Quality Baseline (Context7)
    ↓
Parallel Execution (Task tool with specialized subagents)
    ↓
Results Analysis (Sequential Thinking)
    ↓
Quality Validation (Context7)
    ↓
Self-Review (Reflexion via subagent)
    ↓
Final Specification (Emit handover spec)
```

**Mandatory MCP Usage**:
- **Sequential Thinking**: Use at start (decomposition), after parallel tasks (synthesis), before handover (verification)
- **Context7**: Use before planning (baseline), after plan generation (validation)
- **Task Tool**: Use for all complex sub-tasks (repo analysis, test design, self-review, context packaging)

## Output Format

**CRITICAL: All outputs contain ONLY phase-based task definitions. NO timelines, dates, milestones, deadline estimates, resource estimates, lines-of-code estimates, or effort hours. These are determined by AI agents during execution.**

The skill produces two artifacts:

### 1. TDD_HANDOVER_SPEC.json (Machine-Readable)

Structured JSON following schema (NO TIMESTAMPS, TIMELINES, DATES, MILESTONES, OR ESTIMATES):
```json
{
  "meta": { "task_id": "...", "repo": "...", "commit": "..." },
  "goal": { "type": "bugfix|feature|refactor", "summary": "...", "scope": [...], "non_goals": [...], "constraints": [...] },
  "context": { "entry_points": [...], "impacted_files": [...], "key_invariants": [...], "related_issues_docs": [...] },
  "tdd_plan": {
    "acceptance_criteria": [{"id":"AC1", "gherkin":"Feature: ...\nScenario: ...\nGiven ...\nWhen ...\nThen ..."}],
    "unit_tests": [{"name":"...", "target":"...", "cases":[...]}],
    "integration_tests": [{"name":"...", "scope":"...", "env":"..."}],
    "coverage_targets": {"globs":[...], "thresholds":{"line":80, "branch":70}}
  },
  "steps": [
    {
      "id": "S1",
      "intent": "Create failing test reproducing bug",
      "files_to_add": ["tests/test_bug.py"],
      "commands": ["pytest tests/test_bug.py -q"],
      "expected_initial_result": "FAIL",
      "expected_final_result": "PASS",
      "notes": "fixtures X, mock Y"
    }
  ],
  "tooling": { "language": "...", "build": [...], "test": [...], "lint_format": [...] },
  "risks": [...],
  "rollback": "...",
  "done_definition": [...]
}
```

### 2. TDD_HANDOVER_SPEC.md (Human-Readable)

Markdown briefing with:
- Problem statement (plain English)
- Chosen approach (rationale)
- Impact summary (files/modules)
- Primary risks & mitigations
- Run this first: commands to produce failing test
- Full test plan
- Step-by-step implementation guide

## Quality Gates (MUST PASS before handover)

1. ✅ **Completeness**: Every AC has at least one test intent; every step defines commands and expected results
2. ✅ **Determinism**: No ambiguous "maybe/should"; each step yields PASS/FAIL when run
3. ✅ **Context Tightness**: Briefing under 2k tokens; JSON validates against schema
4. ✅ **Testability**: All acceptance criteria are verifiable by automated tests
5. ✅ **Tool Awareness**: All commands are executable with available tools
6. ✅ **Reflexion Pass**: Self-critique has been run and spec updated
7. ✅ **Context7 Validation**: All library usage follows current best practices

**If any gate fails**: Update the plan and re-run validation before handover.

## Usage Pattern

```
User: "Fix bug where pagination repeats last item on page boundaries"

Claude (using Dev Planning skill):
  Phase A: Intake & Grounding
    - Sequential Thinking: Understand pagination bug
    - Task: Repo analysis (find pagination code)
    - Context7: Check React/Express pagination patterns

  Phase B: Plan the Work
    - Sequential Thinking: Decompose into testable steps
    - Task: Design Fail-to-Pass test + unit tests
    - Define action sequence (write failing test → fix → verify)

  Phase C: Handover Prep
    - Task: Package context (briefing + JSON)
    - Task: Self-review (Reflexion critique)
    - Context7: Validate planned approach
    - Emit: TDD_HANDOVER_SPEC.json + TDD_HANDOVER_SPEC.md

  Output:
    "✅ TDD Handover Spec ready at: /home/user/project/TDD_HANDOVER_SPEC.md

     Summary: Fix off-by-one error in pagination (api/pager.py)
     Tests designed: 1 reproduction test + 2 unit tests
     Implementation steps: 3 (write test → fix slicing → verify)

     Ready to hand off to TDD agent or review manually."
```

## Safety & Best Practices

### Safety Rules
- **Read-only during analysis**: No code modifications until TDD execution phase
- **Explicit tool usage**: Every command must be specified and validated
- **Rollback planning**: Every plan includes rollback/revert instructions
- **Scope enforcement**: Flag out-of-scope work explicitly

### Best Practices
- **Keep plans simple**: As concise as possible while covering essentials
- **Maintain transparency**: Show reasoning at each step
- **Preserve context**: Encapsulate all relevant information in handover spec
- **Test-driven**: Tests specified before any implementation
- **Repo-aware**: Consider dependencies and multi-file coordination

## Common Scenarios

### Scenario 1: Bug Fix
1. Gather repro steps and observed vs. expected behavior
2. Repo analysis: Find affected code
3. Design Fail-to-Pass reproduction test
4. Plan minimal fix + regression tests
5. Emit TDD handover spec

### Scenario 2: Feature Implementation
1. Clarify user stories and acceptance criteria
2. Repo analysis: Identify integration points
3. Design acceptance tests (Gherkin) + unit tests
4. Plan implementation steps (data → logic → UI)
5. Emit TDD handover spec

### Scenario 3: Refactoring
1. Document current state and target state
2. Repo analysis: Map dependencies
3. Design tests to preserve behavior
4. Plan refactor steps (maintain green tests throughout)
5. Emit TDD handover spec

## Integration with TDD Skill

Once this skill produces the TDD Handover Spec:

1. **Review** (optional): User reviews the plan for accuracy
2. **Handoff**: User invokes TDD skill with handover spec path
3. **Execution**: TDD skill reads spec and implements following test-driven development
4. **Validation**: TDD skill runs all tests and reports results

```
Dev Planning Skill → TDD_HANDOVER_SPEC.{json,md} → TDD Skill → Implementation
```

## Troubleshooting

**Problem**: Plan is too vague or high-level
- **Solution**: Re-run with more specific Sequential Thinking decomposition; break into smaller steps

**Problem**: Tests are not concrete enough
- **Solution**: Invoke test-designer subagent again with specific examples and edge cases

**Problem**: Handover spec fails quality gates
- **Solution**: Review gate failures, update plan, re-run self-reviewer subagent

**Problem**: Context7 not returning relevant docs
- **Solution**: Refine topic queries; try library-specific keywords; check library ID resolution

## Performance Notes

- **Token efficiency**: Briefing kept ≤2k tokens (research shows long prompts degrade TDD performance)
- **Parallel execution**: Repo analysis, test design, context packaging run concurrently via Task tool
- **Context7 caching**: Library docs cached for session reuse
- **Incremental planning**: For large tasks, break into multiple planning phases

## References

- Microsoft Research (2024): Repository-Level Coding Using LLMs and Planning
- Anthropic (2024): Building Effective Agents
- Xia et al. (2025): Routine - A Structural Planning Framework for LLM Agents
- Lei et al. (2024): Planning-Driven Programming Workflow
- Qian et al. (2023): Communicative Agents for Software Development (ChatDev)
- SWE-bench: Test-Driven Development Benchmarks

## Documentation

- Full documentation: `README.md`
- Quick reference: `QUICK_REFERENCE.md`
- Usage examples: `USAGE_EXAMPLES.md`
- Completion checklist: `CHECKLIST.md`
- Templates: `templates/`
- Example plans: `examples/`

---

**Version**: 1.0.0
**Last Updated**: 2025-01-25
**Maintainer**: ProAgentic Development Team
