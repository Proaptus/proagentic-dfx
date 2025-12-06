# Validation Hooks - Quick Start Guide

## What Problem Does This Solve?

**Before hooks**: Claude Code would:
- Claim tests ran without actually running them
- Say "tests pass" when they failed
- Leave TODOs and incomplete implementations
- Finish with only partial work done
- Ignore test coverage requirements

**With hooks**: Claude Code MUST:
- Actually run tests and show real output
- Fix all test failures before continuing
- Complete ALL todos before finishing
- Meet 80% coverage requirements
- Fully implement all requested features

## How It Works

### Two Validation Points

1. **PostToolUse Hook** - Real-time validation after EVERY tool use
   - Catches fake tests immediately
   - Blocks dangerous commands
   - Reminds to test after code changes

2. **Stop Hook** - Final validation before Claude can finish
   - Ensures all todos completed
   - Validates tests were run
   - Checks coverage requirements
   - Prevents incomplete deliverables

### Exit Code System

- **Exit 0**: Validation passed, continue
- **Exit 2**: Validation FAILED - Claude sees the error and must fix it

## Installation (Already Done!)

The hooks are installed and configured in your project:

```
✅ .claude/hooks/stop_validator.py
✅ .claude/hooks/post_tool_validator.py
✅ .claude/settings.json (configured)
```

## Usage Examples

### Example 1: Fake Test Detection

```
You: "Fix the auth bug"
Claude: [modifies auth.ts]
Claude: "Tests pass ✓"

PostToolUse Hook: 🚫 BLOCKED
"FAKE TEST EXECUTION DETECTED"

Claude: [must actually run]
Bash("npm test")
[shows real output]
PostToolUse Hook: ✅ Allowed
```

### Example 2: Incomplete Todos

```
You: "Implement 5 dashboard features"
Claude: [creates 5 todos]
Claude: [completes 3 todos]
Claude: "Done!"

Stop Hook: 🚫 BLOCKED
"INCOMPLETE TODOS: 2 pending"

Claude: [must complete todos 4 and 5]
Claude: [marks all completed]
Stop Hook: ✅ Allowed
```

### Example 3: Test Failures

```
You: "Add payment processing"
Claude: [adds payment code]
Claude: Bash("npm test")
Output: "5 failed, 10 passed"
Claude: "Moving on..."

PostToolUse Hook: 🚫 BLOCKED
"TEST FAILURES DETECTED"

Claude: [must read failures]
Claude: [must fix each one]
Claude: [must re-run tests]
PostToolUse Hook: ✅ Allowed (all passing)
```

### Example 4: Low Coverage

```
You: "Add user profile feature"
Claude: [adds feature + 2 tests]
Claude: Bash("npm run test:coverage")
Output: "Coverage: 45%"

Stop Hook: 🚫 BLOCKED
"INSUFFICIENT COVERAGE: 45% < 80%"

Claude: [must write more tests]
Claude: [achieves 82% coverage]
Stop Hook: ✅ Allowed
```

## What Gets Validated

### Stop Hook (Before Finishing)
- ✅ All todos marked "completed"
- ✅ Tests run if code changed
- ✅ All tests passing
- ✅ Coverage ≥80%
- ✅ No TODO/FIXME comments
- ✅ No unresolved errors
- ✅ Full task scope completed

### PostToolUse Hook (After Each Tool)
- ✅ Test commands show real output
- ✅ Test failures caught immediately
- ✅ Code changes trigger test reminders
- ✅ Dangerous commands blocked (kill, pkill)

## Testing the Hooks

```bash
# Test 1: Detect fake test
echo '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_output":"done"}' \
  | uv run .claude/hooks/post_tool_validator.py
# Expected: Exit 2 - FAKE TEST DETECTED

# Test 2: Accept real test
echo '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_output":"Tests: 25 passed"}' \
  | uv run .claude/hooks/post_tool_validator.py
# Expected: Exit 0 - Validation passed

# Test 3: Block incomplete todos
echo '{"transcript":"status:pending"}' \
  | uv run .claude/hooks/stop_validator.py
# Expected: Exit 2 - INCOMPLETE TODOS

# Test 4: Allow completion
echo '{"transcript":"status:completed"}' \
  | uv run .claude/hooks/stop_validator.py
# Expected: Exit 0 - Validation passed
```

## Troubleshooting

### Hook not running?

```bash
# Check configuration
cat .claude/settings.json | grep -A 10 hooks

# Verify executable
ls -la .claude/hooks/*.py

# Make executable if needed
chmod +x .claude/hooks/*.py
```

### Hook blocking incorrectly?

The hooks analyze the conversation transcript. Ensure:
- You're using TodoWrite to track tasks
- You're running tests with Bash tool
- Test output contains result patterns (passed, PASS, ✓)
- You're marking todos as "completed"

### Need to disable temporarily?

Edit `.claude/settings.json` and comment out the hook:

```json
{
  "hooks": {
    "Stop": [
      // {
      //   "hooks": [{"type": "command", "command": "..."}]
      // }
    ]
  }
}
```

## Key Principles

1. **Write tests FIRST** (TDD approach)
2. **Mark todos completed IMMEDIATELY** (not batched)
3. **Show REAL test output** (no claims without evidence)
4. **Fix failures BEFORE continuing** (one at a time)
5. **Meet coverage requirements** (≥80%)
6. **Complete ALL work** (no partial implementations)

## Benefits

### For You
- ✅ Confidence in Claude's work
- ✅ No need to constantly verify
- ✅ Guaranteed test coverage
- ✅ Complete deliverables
- ✅ No surprise failures

### For Claude
- ✅ Clear validation rules
- ✅ Immediate feedback
- ✅ Forced completeness
- ✅ Better quality output
- ✅ Prevented bad habits

## What Happens Without Hooks

**Common issues users report**:
- "Claude said tests passed but they didn't"
- "Claude left TODO comments everywhere"
- "Claude claimed to implement X but only did part of it"
- "Claude ignored test failures and moved on"
- "Claude's code has 20% test coverage"

**All prevented by these hooks** ✅

## Customization

### Change coverage threshold

Edit `stop_validator.py` line 145:
```python
if min_coverage < 80.0:  # Change to your threshold
```

### Add custom validations

Add function to hook file:
```python
def check_my_rule(transcript: str) -> Tuple[bool, str]:
    if bad_pattern in transcript:
        return False, "Reason to block"
    return True, ""
```

Add to validations list:
```python
validations = [
    # ... existing
    ("My Rule", check_my_rule),
]
```

## Integration with TDD Workflow

The hooks enforce ProAgentic's TDD methodology:

```
RED → GREEN → REFACTOR

RED:   Write failing test
       ↓ PostToolUse validates test created

GREEN: Implement minimal fix
       ↓ PostToolUse validates tests run
       ↓ PostToolUse detects if fake
       ↓ PostToolUse blocks failures

REFACTOR: Improve code quality
          ↓ Stop Hook validates all complete
          ↓ Stop Hook validates coverage
          ↓ Stop Hook validates todos done
```

## Success Metrics

With hooks enabled, you get:
- **100% real test execution** (0% fake claims)
- **100% task completion** (0% partial work)
- **≥80% test coverage** (enforced minimum)
- **0% ignored failures** (must fix before continuing)
- **0% incomplete code** (no TODOs/FIXMEs)

## Next Steps

1. ✅ Hooks are already installed
2. ✅ Configuration is complete
3. ✅ Start using Claude Code normally
4. ✅ Hooks will enforce quality automatically
5. ✅ Review README.md for detailed documentation

## Questions?

- **How do I disable a validation?** - Comment it out in the validations list
- **Can I adjust thresholds?** - Yes, edit the hook Python files
- **What if Claude complains about hooks?** - The hooks are helping enforce quality
- **Do hooks slow down Claude?** - Minimal impact (< 1 second per validation)
- **Can I add custom rules?** - Yes, see Customization section above

## Support

Full documentation: `.claude/hooks/README.md`

For issues:
1. Check troubleshooting section
2. Test hooks manually
3. Review hook output in stderr
4. Verify uv installation

---

**Remember**: These hooks are on YOUR side. They prevent Claude from delivering incomplete or untested work, saving you review time and catching issues early.
