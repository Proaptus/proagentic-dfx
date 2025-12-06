# Dev Planning Skill

## Overview

The **Dev Planning skill** transforms user requests (features, bugs, refactors) into comprehensive, **TDD-ready development plans** using research-backed AI planning methodologies. This skill implements the **Plan-then-Act paradigm**, separating strategic planning from tactical execution to improve reliability and code quality.

### What This Skill Does

✅ Analyzes repositories to understand impact and dependencies
✅ Designs **tests FIRST** before any implementation (TDD methodology)
✅ Creates structured, executable specifications in JSON + Markdown
✅ Performs **self-critique** (Reflexion) to validate plans
✅ Integrates with **Context7** for library best practices
✅ Produces ready-to-execute handover specifications for TDD agents

### Research Foundations

This skill synthesizes patterns from multiple research sources:

| Source | Pattern | Application |
|--------|---------|-------------|
| **Microsoft Research (2024)** | Repository-level planning | Multi-file coordination, dependency analysis |
| **Anthropic (2024)** | Building Effective Agents | Tool-aware planning, structured outputs |
| **Routine Framework (Xia et al.)** | Structural planning | Decomposition, action sequences |
| **Planning-Driven Programming (Lei et al.)** | Test-first design | Acceptance criteria → implementation |
| **ChatDev (Qian et al.)** | Multi-agent collaboration | Specialized subagents for planning phases |
| **SWE-bench** | Test-driven validation | Fail-to-pass tests, PASS_TO_PASS regression |

### ⚡ CRITICAL: No Timeline, Date, or Estimate Data

This skill produces **ONLY phase-based task definitions** with NO temporal information:
- ❌ No timelines or deadlines
- ❌ No milestone dates
- ❌ No effort estimates (hours, days, weeks)
- ❌ No resource estimates (LOC, team capacity)
- ❌ No timestamps or date fields

**Why?** These details become obsolete and corrupt context. AI agents determine actual execution timing during implementation. Planning output is task-based only.

## When to Use This Skill

### ✅ Use Dev Planning For:

- **Complex features**: Multi-file, multi-component implementations
- **Bug fixes**: Need structured reproduction and test design
- **Refactoring**: Preserve behavior while improving code structure
- **Unclear requirements**: Clarification needed before coding
- **TDD preparation**: Want comprehensive test specifications before implementation
- **Architecture planning**: Need to understand impacts and dependencies

### ❌ Don't Use Dev Planning For:

- **Trivial changes**: Single-line fixes, simple documentation updates
- **Well-understood tasks**: You already know exactly what to do
- **Time-critical fixes**: Emergency hotfixes (plan afterwards)
- **Configuration changes**: Non-code changes with no logic

## The Three-Phase Planning Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│  PHASE A: Intake & Grounding                                 │
│  → Normalize request (goal, scope, constraints)              │
│  → Repo analysis (find impacted files, dependencies)         │
│  → Context7 baseline (current best practices)                │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  PHASE B: Plan the Work (BEFORE Code)                        │
│  → Sequential Thinking: Decompose task logically             │
│  → Design tests FIRST (acceptance, unit, integration)        │
│  → Define action sequence with expected results              │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  PHASE C: Handover Preparation                               │
│  → Package context (compact briefing + full JSON spec)       │
│  → Self-review with Reflexion critique                       │
│  → Validate quality gates                                    │
│  → Emit TDD Handover Spec (JSON + Markdown)                  │
└──────────────────────────────────────────────────────────────┘
```

### Phase A: Intake & Grounding

**Goal**: Understand the problem and establish baseline context

**Steps**:
1. **Normalize the request**
   - Extract: goal, scope, non-goals, constraints, definition of done
   - For bugs: capture repro steps, observed vs. expected behavior
   - For features: identify user stories and acceptance criteria
   - For refactors: document current state and target state

2. **Repo analysis** (read-only)
   - Identify modules/files likely impacted
   - Map public interfaces, invariants, dependencies
   - List entry points and call chains
   - Document current architectural patterns

3. **Context7 baseline**
   - Query Context7 for all relevant libraries (React, Express, TypeScript, etc.)
   - Document current best practices
   - Identify patterns to follow

**Outputs**: Normalized problem statement, impacted files list, Context7 best practices

### Phase B: Plan the Work

**Goal**: Decompose into testable steps, design tests first, specify actions

**Steps**:
4. **Sequential Thinking: Initial decomposition**
   - Break down task logically using Sequential Thinking MCP
   - Identify dependencies and parallelization opportunities
   - Consider alternative approaches (branch and score)
   - Select best approach with rationale

5. **Design tests FIRST** (TDD)
   - Write acceptance criteria in Gherkin (Given/When/Then)
   - Specify unit test intents (names, targets, cases)
   - Specify integration test intents (scope, environment)
   - For bugs: create Fail-to-Pass reproduction test
   - For features: define examples and edge cases
   - Note coverage goals

6. **Action sequence & tool specification**
   - For each step: specify files to touch, edit intent, test to write/run
   - Define expected initial result (FAIL) and expected final result (PASS)
   - Order by dependency: tests first → minimal fix → pass → refactor

**Outputs**: Structured test plan, step-by-step implementation sequence

### Phase C: Handover Preparation

**Goal**: Create TDD-ready handover spec with validation

**Steps**:
7. **Context packaging**
   - Produce compact Briefing (≤2k tokens): problem, approach, impact, risks
   - Produce Full Appendix (JSON): complete structured specification
   - Prioritize brevity and structure

8. **Self-review (Reflexion)**
   - Run Reflexion-style critique: testable ACs? Missing edge cases? Conflicts?
   - Adversarial check: "poke holes" in the plan
   - Update spec based on critique

9. **Quality gates validation**
   - ✅ Completeness: Every AC has test intent, every step defines commands
   - ✅ Determinism: No ambiguous "maybe/should"; steps yield PASS/FAIL
   - ✅ Context tightness: Briefing under target length, JSON validates
   - ✅ Testability: All acceptance criteria verifiable by automated tests
   - ✅ Tool awareness: All commands are executable
   - Block handover unless all gates pass

10. **Emit TDD Handover Spec**
    - Write `TDD_HANDOVER_SPEC.json` (machine-readable)
    - Write `TDD_HANDOVER_SPEC.md` (human-readable briefing)
    - Display path to user

**Outputs**: `TDD_HANDOVER_SPEC.json`, `TDD_HANDOVER_SPEC.md`

## Integration with ProAgentic MCP Coordination

This skill implements the **continuous execution control pattern** from ProAgentic's CLAUDE.md:

```
Initial Analysis (Sequential Thinking)
    ↓
Quality Baseline (Context7: resolve + get docs)
    ↓
Parallel Execution (Task tool with specialized subagents)
    ↓
Results Analysis (Sequential Thinking: synthesize)
    ↓
Quality Validation (Context7: verify implementations)
    ↓
Self-Review (Reflexion via subagent)
    ↓
Final Specification (Emit handover spec)
```

### Mandatory MCP Usage

- **Sequential Thinking**: Use at start (decomposition), after parallel tasks (synthesis), before handover (verification)
- **Context7**: Use before planning (baseline), after plan generation (validation)
- **Task Tool**: Use for all complex sub-tasks (repo analysis, test design, self-review, context packaging)

### Specialized Subagents

The skill uses specialized subagents for each phase:

- **dev-planning-diagnostics**: Phase A - Intake & Grounding
- **dev-planning-design**: Phase B - Test-First Design
- **dev-planning-task-generation**: Phase C - Action Sequence & Handover

## Output Format

The skill produces **two artifacts**:

### 1. TDD_HANDOVER_SPEC.json (Machine-Readable)

Structured JSON following schema in `templates/TDD_HANDOVER_SPEC.json`:

```json
{
  "meta": { "task_id": "...", "repo": "...", "commit": "...", "created_at": "..." },
  "goal": { "type": "bugfix|feature|refactor", "summary": "...", "scope": [...], "non_goals": [...] },
  "context": { "entry_points": [...], "impacted_files": [...], "key_invariants": [...] },
  "tdd_plan": {
    "acceptance_criteria": [{"id":"AC1", "gherkin":"..."}],
    "unit_tests": [{"name":"...", "target":"...", "cases":[...]}],
    "integration_tests": [{"name":"...", "scope":"...", "env":"..."}],
    "coverage_targets": {"globs":[...], "thresholds":{"line":80, "branch":70}}
  },
  "steps": [
    {
      "id": "S1",
      "intent": "Create failing test reproducing bug",
      "commands": ["pytest tests/test_bug.py -q"],
      "expected_initial_result": "FAIL",
      "expected_final_result": "PASS"
    }
  ],
  "tooling": { "language": "...", "test": [...], "lint_format": [...] },
  "risks": [...],
  "done_definition": [...]
}
```

### 2. TDD_HANDOVER_SPEC.md (Human-Readable)

Markdown briefing following template in `templates/TDD_HANDOVER_SPEC.md`:

- **Problem statement** (plain English)
- **Run This First** (command to produce failing test)
- **Impact summary** (files/modules)
- **Primary risks** & mitigations
- **Approach** (strategy and rationale)
- **Test plan** (acceptance criteria, unit tests, integration tests)
- **Implementation steps** (detailed step-by-step)
- **Done criteria** (checklist)
- **Quick reference** (commands)

## Quality Gates (MUST PASS)

All quality gates must pass before handover:

1. ✅ **Completeness**: Every AC has at least one test intent; every step defines commands and expected results
2. ✅ **Determinism**: No ambiguous "maybe/should"; each step yields PASS/FAIL
3. ✅ **Context Tightness**: Briefing under 2k tokens; JSON validates against schema
4. ✅ **Testability**: All acceptance criteria are verifiable by automated tests
5. ✅ **Tool Awareness**: All commands are executable with available tools
6. ✅ **Reflexion Pass**: Self-critique has been run and spec updated
7. ✅ **Context7 Validation**: All library usage follows current best practices

**If any gate fails**: Update the plan and re-run validation before handover.

## Usage Pattern

### Simple Usage (User Invokes Skill)

```bash
# User requests planning
User: "Plan the fix for pagination bug where last item duplicates on next page"

# Claude invokes dev-planning skill
# Skill runs three phases automatically
# Outputs TDD Handover Spec

Claude: ✅ TDD Handover Spec ready at: /home/user/project/TDD_HANDOVER_SPEC.md

Summary: Fix off-by-one error in pagination (api/pager.py)
Tests designed: 1 reproduction test + 2 unit tests
Implementation steps: 3 (write test → fix slicing → verify)

Ready to hand off to TDD agent or review manually.
```

### Detailed Workflow (Internal)

```
Phase A: Intake & Grounding
  ├─ Sequential Thinking: Understand pagination bug
  ├─ Task: Repo analysis (find pagination code)
  └─ Context7: Check React/Express pagination patterns

Phase B: Plan the Work
  ├─ Sequential Thinking: Decompose into testable steps
  ├─ Task: Design Fail-to-Pass test + unit tests
  └─ Define action sequence (write failing test → fix → verify)

Phase C: Handover Prep
  ├─ Task: Package context (briefing + JSON)
  ├─ Task: Self-review (Reflexion critique)
  ├─ Context7: Validate planned approach
  └─ Emit: TDD_HANDOVER_SPEC.json + TDD_HANDOVER_SPEC.md
```

## Common Scenarios

### Scenario 1: Bug Fix

**Example**: "Pagination repeats last item on page boundaries"

**Planning Flow**:
1. Gather repro steps and observed vs. expected behavior
2. Repo analysis: Find affected pagination code
3. Design Fail-to-Pass reproduction test
4. Plan minimal fix + regression tests
5. Emit TDD handover spec

**Output**: Spec with 1 reproduction test (FAIL→PASS) + 2 unit tests + fix steps

### Scenario 2: Feature Implementation

**Example**: "Add metrics dashboard showing usage over time"

**Planning Flow**:
1. Clarify user stories and acceptance criteria
2. Repo analysis: Identify integration points (API, UI, database)
3. Design acceptance tests (Gherkin) + unit tests
4. Plan implementation steps (data layer → API → UI)
5. Emit TDD handover spec

**Output**: Spec with 3 acceptance criteria + 8 unit tests + 5 integration tests + 10 implementation steps

### Scenario 3: Refactoring

**Example**: "Refactor authentication to use modern React patterns"

**Planning Flow**:
1. Document current state (class components, legacy patterns)
2. Repo analysis: Map dependencies, find all auth usage
3. Design tests to preserve behavior
4. Plan refactor steps (maintain green tests throughout)
5. Emit TDD handover spec

**Output**: Spec with 5 behavior preservation tests + 12 refactor steps (each maintains green)

## Integration with TDD Skill

Once this skill produces the TDD Handover Spec:

```
Dev Planning Skill → TDD_HANDOVER_SPEC.{json,md} → TDD Skill → Implementation
```

**Workflow**:
1. **Review** (optional): User reviews the plan for accuracy
2. **Handoff**: User invokes TDD skill with handover spec path
3. **Execution**: TDD skill reads spec and implements following test-driven development
4. **Validation**: TDD skill runs all tests and reports results

**Example**:
```bash
# 1. Generate plan
User: "Plan fix for pagination bug"
Claude: [runs dev-planning skill] → TDD_HANDOVER_SPEC.md created

# 2. Review (optional)
User: [reviews TDD_HANDOVER_SPEC.md]

# 3. Execute with TDD skill
User: "Run TDD skill with TDD_HANDOVER_SPEC.json"
Claude: [runs tdd skill] → Implementation complete, all tests pass
```

## Troubleshooting

### Problem: Plan is too vague or high-level

**Symptoms**: Steps lack concrete commands, no specific file paths

**Solution**:
- Re-run with more specific Sequential Thinking decomposition
- Break into smaller, more atomic steps
- Add concrete examples to each step

### Problem: Tests are not concrete enough

**Symptoms**: No specific test cases, vague assertions, missing fixtures

**Solution**:
- Review acceptance criteria template (`templates/ACCEPTANCE_CRITERIA.md`)
- Add concrete Given/When/Then examples
- Specify exact expected values (not "should work correctly")

### Problem: Handover spec fails quality gates

**Symptoms**: Validation errors during Phase C

**Solution**:
- Review specific gate failures in output
- Update plan to address failures
- Re-run self-reviewer subagent
- Check JSON schema validation

### Problem: Context7 not returning relevant docs

**Symptoms**: Generic or missing best practices

**Solution**:
- Refine topic queries (be more specific)
- Try library-specific keywords
- Check library ID resolution (use resolve-library-id first)
- Search for specific patterns (e.g., "hooks" instead of "React patterns")

### Problem: Repo analysis misses key files

**Symptoms**: Important dependencies not in impacted files list

**Solution**:
- Use more comprehensive grep patterns
- Search for imports/usage, not just definitions
- Check indirect dependencies (files that import impacted modules)
- Manually review and add missing files to spec

## Performance Notes

- **Token efficiency**: Briefing kept ≤2k tokens (research shows long prompts degrade TDD performance)
- **Parallel execution**: Repo analysis, test design, context packaging run concurrently via Task tool
- **Context7 caching**: Library docs cached for session reuse
- **Incremental planning**: For large tasks, break into multiple planning phases

## File Structure

```
/home/chine/projects/proagentic-clean/.claude/skills/dev-planning/
├── SKILL.md                        # Main skill definition
├── README.md                       # This file (comprehensive docs)
├── QUICK_REFERENCE.md              # One-page cheat sheet
├── USAGE_EXAMPLES.md               # Detailed examples with output
├── CHECKLIST.md                    # Quality gates checklist
├── templates/
│   ├── TDD_HANDOVER_SPEC.json     # JSON schema
│   ├── TDD_HANDOVER_SPEC.md       # Markdown template
│   └── ACCEPTANCE_CRITERIA.md     # Gherkin template
├── examples/
│   ├── bug-fix-pagination.json    # Example: bug fix spec
│   ├── feature-metrics-dashboard.json  # Example: feature spec
│   └── refactor-auth-patterns.json     # Example: refactor spec
└── scripts/
    ├── validate-spec.sh           # Validate JSON against schema
    └── run-planning.sh            # Helper script to invoke skill
```

## References

- **Microsoft Research (2024)**: Repository-Level Coding Using LLMs and Planning
- **Anthropic (2024)**: Building Effective Agents
- **Xia et al. (2025)**: Routine - A Structural Planning Framework for LLM Agents
- **Lei et al. (2024)**: Planning-Driven Programming Workflow
- **Qian et al. (2023)**: Communicative Agents for Software Development (ChatDev)
- **SWE-bench**: Test-Driven Development Benchmarks
- **ProAgentic CLAUDE.md**: MCP Coordination and Continuous Execution Control

## Additional Documentation

- **Quick Reference**: See `QUICK_REFERENCE.md` for one-page summary
- **Usage Examples**: See `USAGE_EXAMPLES.md` for detailed examples with full input/output
- **Completion Checklist**: See `CHECKLIST.md` for quality gate validation
- **Templates**: See `templates/` for JSON schema and markdown templates
- **Examples**: See `examples/` for sample specifications

---

**Version**: 1.0.0
**Last Updated**: 2025-01-25
**Maintainer**: ProAgentic Development Team
