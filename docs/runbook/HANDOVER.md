---
doc_type: runbook
title: "ProSWARM Template Handover Document"
version: 1.0.0
date: 2025-12-09
owner: "@h2-tank-team"
status: accepted
last_verified_at: 2025-12-09
---
# ProSWARM Template Handover Document

## Purpose

This is a **standalone ProSWARM-ready project template** created from the battle-tested ProAgentic Clean project. Clone this template to bootstrap new projects with full ProSWARM orchestration enforcement.

## What's Been Set Up

### 1. ProSWARM Enforcement Hook (CRITICAL)

**Location**: `.claude/hooks/enforce-proswarm.py`

This hook **BLOCKS ALL TOOLS** unless you follow the ProSWARM orchestration workflow:

```javascript
// MANDATORY SEQUENCE - Do this FIRST before ANY tool use:

// Step 1: Orchestrate your task
const result = await mcp__proswarm-neural__orchestrate_task("Your task description");

// Step 2: Store main_task_id
await mcp__proswarm-neural__memory_store("main_task_id", result.task_id);

// Step 3: Store orchestration_plan
await mcp__proswarm-neural__memory_store("orchestration_plan", JSON.stringify(result.plan));

// Step 4: Establish subtask context
await mcp__proswarm-neural__memory_store("subtask_work", "status: in_progress");

// Step 5: NOW you can use tools
Read(), Grep(), Bash(), Edit(), Write()  // All allowed after steps 1-4
```

**Session Timeout**: 60 seconds by design. When tools get blocked, just re-orchestrate.

### 2. Directory Structure

```
proswarm-template/
â”œâ”€â”€ CLAUDE.md                 # Main Claude Code config (READ THIS)
â”œâ”€â”€ HANDOVER.md               # This file
â”œâ”€â”€ pytest.ini                # Test configuration
â”œâ”€â”€ .gemini/GEMINI.md         # Cross-platform Gemini support
â”œâ”€â”€ tests/
â”‚   â”œâ”€â”€ unit/                 # 18 unit tests for hook logic
â”‚   â”œâ”€â”€ integration/          # 10 integration tests
â”‚   â””â”€â”€ e2e/                  # 5 E2E workflow tests
â””â”€â”€ .claude/
    â”œâ”€â”€ settings.json         # Hook configuration (relative paths)
    â”œâ”€â”€ state/                # Session state (auto-managed)
    â”œâ”€â”€ agents/               # 26 agent definitions
    â”œâ”€â”€ hooks/                # Enforcement hooks
    â””â”€â”€ skills/               # 12 skill definitions
```

### 3. Available Skills

| Skill | Purpose |
|-------|---------|
| `proswarm` | Master orchestration (PRIMARY) |
| `tdd` | Test-Driven Development workflow |
| `dev-planning` | Development planning & requirements |
| `bug-fixer` | Batch bug fixing (10-15+ bugs) |
| `doc-manager` | Documentation management |
| `novae` | NOVAE execution workflow |
| `uat-automation` | UAT testing |
| `deployment` | Deployment workflows |
| `skill-builder` | Create new skills |

### 4. Available Agents

**ProSWARM Core**: `proswarm-orchestrator`, `proswarm-executor`, `proswarm-model-selector`, `proswarm-memory-manager`

**TDD**: `tdd-test-generator`, `tdd-self-debugger`, `tdd-multi-sampler`, `tdd-quality-gatekeeper`

**Dev Planning**: `dev-planning-repo-analyzer`, `dev-planning-test-designer`, `dev-planning-self-reviewer`, `dev-planning-context-packager`

### 5. Test Suite (33 Tests - ALL PASSING)

```bash
# Run all tests
cd /home/chine/proswarm-template
python3 -m pytest tests/ -v

# Results: 33 passed
# - Unit tests: 18 (hook logic, tool classification, sessions)
# - Integration tests: 10 (agents, skills, settings validation)
# - E2E tests: 5 (full orchestration workflow)
```

---

## REMAINING BUG FIXES (6 Minor Ruff Issues)

These are style/linting issues that don't affect functionality but should be fixed for code quality.

### Bug 1: Bare `except` clause
**File**: `.claude/hooks/enforce-proswarm.py`
**Line**: 77
**Issue**: `E722` - Do not use bare `except`

**Current Code**:
```python
            except:
                return self._new_session()
```

**Fixed Code**:
```python
            except Exception:
                return self._new_session()
```

---

### Bug 2: Unused variable `errors_found`
**File**: `.claude/hooks/stop_validator.py`
**Line**: 272
**Issue**: `F841` - Local variable `errors_found` is assigned but never used

**Current Code**:
```python
    errors_found = []
    tool_failures = []
```

**Fix Options**:
1. **Prefix with underscore** (if intentionally unused):
```python
    _errors_found = []
    tool_failures = []
```

2. **Remove if truly unused** - Check if it's used later in the function first.

---

### Bug 3: Unused variable `stop_reason`
**File**: `.claude/hooks/stop_validator.py`
**Line**: 501
**Issue**: `F841` - Local variable `stop_reason` is assigned but never used

**Current Code**:
```python
    stop_reason = input_data.get('stopReason', '')
```

**Fix Options**:
1. **Prefix with underscore** (if intentionally unused):
```python
    _stop_reason = input_data.get('stopReason', '')
```

2. **Remove if truly unused** - Check if it should be used in validations.

---

### Bug 4: Unused variable `result`
**File**: `.claude/skills/tdd/templates/pytest-test-template.py`
**Line**: 256
**Issue**: `F841` - Local variable `result` is assigned but never used

**Current Code**:
```python
        result = function_to_test({"user_id": "123"})

        mock_external.fetch.assert_called_once()
```

**Fixed Code** (add assertion using result):
```python
        result = function_to_test({"user_id": "123"})

        mock_external.fetch.assert_called_once()
        assert result is not None  # Or appropriate assertion
```

**OR** prefix with underscore if result is intentionally ignored:
```python
        _result = function_to_test({"user_id": "123"})
```

---

### Bug 5: `== True` comparison
**File**: `tests/unit/test_enforce_proswarm_hook.py`
**Line**: 250
**Issue**: `E712` - Comparison to `True` should be `is True` or remove comparison

**Current Code**:
```python
        assert state.get("proswarm_plan_pending") == True
```

**Fixed Code**:
```python
        assert state.get("proswarm_plan_pending") is True
```

---

### Bug 6: `== True` comparison
**File**: `tests/unit/test_enforce_proswarm_hook.py`
**Line**: 259
**Issue**: `E712` - Comparison to `True` should be `is True` or remove comparison

**Current Code**:
```python
        assert state.get("proswarm_plan_captured") == True
```

**Fixed Code**:
```python
        assert state.get("proswarm_plan_captured") is True
```

---

## Verification Commands

After fixing all bugs, run these commands to verify:

```bash
cd /home/chine/proswarm-template

# 1. Run ruff linting check (should show 0 errors)
ruff check .

# 2. Run full test suite (should show 33 passed)
python3 -m pytest tests/ -v

# 3. Verify Python syntax
python3 -m py_compile .claude/hooks/enforce-proswarm.py
python3 -m py_compile .claude/hooks/stop_validator.py
```

**Expected Results**:
- `ruff check .`: No issues found
- `pytest`: 33 passed, 0 failed
- `py_compile`: No output (success)

---

## How to Use This Template

### For New Projects

```bash
# Copy template to new location
cp -r /home/chine/proswarm-template /path/to/new-project
cd /path/to/new-project

# Update CLAUDE.md with your project specifics
# Edit the "PROJECT OVERVIEW" section

# Start Claude Code - enforcement activates automatically
claude
```

### Working Within This Template

1. **Always orchestrate first** - Every task starts with `orchestrate_task()`
2. **Store context** - main_task_id, orchestration_plan, subtask_*
3. **Then use tools** - Only after context is established
4. **Re-orchestrate on timeout** - It's normal, just orchestrate again

### Loading Client Data

To use this template for a client project:

1. Copy the template to a new directory
2. Load your client specification data
3. Update CLAUDE.md with project-specific details
4. ProSWARM will decompose and orchestrate work automatically

## MCP Servers Required

These must be running globally (they are on this system):

- **proswarm-neural**: Primary orchestration engine
- **sequential-thinking**: Execution control
- **context7**: Library documentation
- **chrome-devtools**: Browser automation
- **github**: Repository management
- **memory**: Knowledge graph

## Quick Reference

### When Tools Get Blocked

```
PROSWARM ORCHESTRATION REQUIRED...
```

**Solution**: Re-orchestrate with your current task:
```javascript
await mcp__proswarm-neural__orchestrate_task("What you're trying to do");
await mcp__proswarm-neural__memory_store("main_task_id", result.task_id);
await mcp__proswarm-neural__memory_store("orchestration_plan", JSON.stringify(result.plan));
await mcp__proswarm-neural__memory_store("subtask_work", "in_progress");
// Now tools work again
```

### Spawning Agents

```javascript
Task({
  subagent_type: 'proswarm-executor',  // Agent name (not model!)
  model: 'sonnet',                      // Claude model: opus/sonnet/haiku
  prompt: 'Your task description'
});
```

### Using Skills

```javascript
Skill({ skill: "tdd" });        // TDD workflow
Skill({ skill: "proswarm" });   // Full orchestration
Skill({ skill: "bug-fixer" });  // Batch bug fixing
```

## Files Modified From Original

These files were modified to make the template standalone:

| File | Change |
|------|--------|
| `.claude/settings.json` | Absolute paths â†’ Relative paths |
| `.claude/hooks/enforce-proswarm.py` | Hardcoded path â†’ Dynamic `__file__` resolution |
| `.claude/hooks/stop_validator_wrapper.sh` | Hardcoded path â†’ `SCRIPT_DIR` variable |
| `CLAUDE.md` | ProAgentic-specific â†’ Generic template |

## Contact / Origin

- **Source**: Created from `/home/chine/proagentic-clean`
- **Date**: November 2024
- **Purpose**: Reusable ProSWARM template for client projects

---

**Remember**: ProSWARM orchestration is MANDATORY. The hooks enforce this by design. Embrace the workflow!

