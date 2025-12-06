# Claude Code Validation Hooks - Preventing Fake Tests and Incomplete Work

## Overview

This validation system addresses critical issues with AI coding assistants:
- **Fake test execution**: Claiming tests ran without actually running them
- **Incomplete implementations**: Leaving TODOs, FIXMEs, or partial code
- **Ignored failures**: Continuing despite test failures or errors
- **Incomplete todos**: Marking work complete while todos remain pending
- **Low coverage**: Shipping code without adequate test coverage

## Hook Architecture

### 1. Stop Hook (`stop_validator.py`)

**Trigger**: When Claude Code attempts to finish responding

**Purpose**: Final validation before allowing task completion

**Validates**:
- ✅ All TodoWrite items marked as completed (no pending/in-progress)
- ✅ Tests were run if code was modified
- ✅ Tests passed (no failures in output)
- ✅ Coverage requirements met (≥80%)
- ✅ No incomplete implementations (TODO/FIXME comments)
- ✅ All errors were resolved
- ✅ Full task scope completed (no partial work)

**How it works**:
```python
# Blocks stopping with exit code 2 if any validation fails
# Provides detailed feedback to Claude about what's incomplete
# Claude must address all issues before being allowed to finish
```

**Exit Codes**:
- `0`: All validations passed, allow stopping
- `2`: Validation failed, block stopping and show stderr to Claude

### 2. PostToolUse Hook (`post_tool_validator.py`)

**Trigger**: Immediately after Claude executes any tool

**Purpose**: Real-time validation to catch issues early

**Validates**:
- ✅ Test commands produce actual test output (anti-fake-test)
- ✅ Code changes trigger test execution reminders
- ✅ Test failures are caught immediately
- ✅ Dangerous commands blocked (kill, pkill except chrome)

**How it works**:
```python
# Analyzes tool output in real-time
# Detects fake test execution patterns
# Blocks dangerous operations before they execute
# Provides immediate feedback for corrective action
```

**Exit Codes**:
- `0`: Tool execution valid
- `2`: Validation failed, block and provide feedback

## Installation

### Prerequisites

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Verify installation
uv --version
```

### Setup

The hooks are already configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "uv run .claude/hooks/stop_validator.py",
            "description": "Task Completion Validator"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash|Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "uv run .claude/hooks/post_tool_validator.py",
            "description": "Completeness Validator"
          }
        ]
      }
    ]
  }
}
```

### Make Hooks Executable

```bash
chmod +x .claude/hooks/stop_validator.py
chmod +x .claude/hooks/post_tool_validator.py
```

## How It Prevents Fake Tests

### Example: Fake Test Claim

**Without Hook** (Bad Behavior):
```
Claude: "I've run the tests and they all pass"
User: "Show me the output"
Claude: "Here's what happened..." [makes up results]
```

**With Hook** (Enforced Behavior):
```
Claude: Claims tests ran
Hook: Analyzes transcript for actual Bash tool calls with test commands
Hook: No test output patterns found (Test Suites:, passed, PASS, etc.)
Hook: BLOCKS with exit code 2
Hook: Shows stderr to Claude:

⛔ FAKE TEST EXECUTION DETECTED:
Command claimed to run tests: npm test
But the output does not contain actual test results.

This is a CRITICAL violation. You must:
1. Run the ACTUAL test command using the Bash tool
2. Show the COMPLETE test output
3. Analyze the REAL test results
4. Never claim tests ran without showing output

Claude: Must now actually run: Bash("npm test")
Claude: Shows real output with test results
Hook: Validates output contains test patterns
Hook: Allows continuation ✅
```

### Example: Test Failures Ignored

**Without Hook** (Bad Behavior):
```
Claude: Runs tests
Output: "Tests: 5 failed, 10 passed"
Claude: "Tests are passing, moving on..."
```

**With Hook** (Enforced Behavior):
```
Claude: Runs tests
Output: "Tests: 5 failed, 10 passed"
Hook: Detects "5 failed" pattern
Hook: BLOCKS with exit code 2

⛔ TEST FAILURES DETECTED:
The test suite shows failures. You must:
1. Identify which tests failed
2. Fix the failing tests one at a time
3. Re-run tests after each fix
4. Ensure ALL tests pass

Claude: Must read test output
Claude: Must fix each failing test
Claude: Must re-run tests
Hook: Validates all tests pass ✅
```

## How It Prevents Incomplete Work

### Example: Incomplete Todos

**Without Hook** (Bad Behavior):
```
Claude: Creates 5 todos
Claude: Completes 3 todos
Claude: "Done!" [tries to finish]
```

**With Hook** (Enforced Behavior):
```
Claude: Creates 5 todos
Claude: Completes 3 todos
Claude: Attempts to finish
Hook: Scans transcript for TodoWrite calls
Hook: Finds "status": "pending" and "status": "in_progress"
Hook: BLOCKS with exit code 2

⛔ INCOMPLETE TODOS DETECTED:
- 2 pending task(s)
- 0 in-progress task(s)

You must complete ALL todos before finishing.

Claude: Must complete remaining todos
Claude: Must mark each as "completed"
Hook: Validates all todos completed ✅
```

### Example: Low Coverage

**Without Hook** (Bad Behavior):
```
Claude: Runs tests with coverage
Output: "Coverage: 45%"
Claude: "Tests pass!" [finishes]
```

**With Hook** (Enforced Behavior):
```
Claude: Runs tests with coverage
Output: "Coverage: 45%"
Hook: Extracts coverage percentage
Hook: Compares to threshold (80%)
Hook: BLOCKS with exit code 2

⛔ INSUFFICIENT TEST COVERAGE:
Current coverage: 45.0%
Required coverage: 80.0%

Required actions:
1. Identify uncovered code paths
2. Write additional tests
3. Re-run tests with coverage
4. Ensure coverage is ≥80%

Claude: Must write more tests
Claude: Must achieve 80% coverage
Hook: Validates coverage ≥80% ✅
```

## Validation Rules

### Stop Hook Validations

#### 1. Todo Completion
```python
# Searches for: "status": "pending" or "status": "in_progress"
# Blocks if ANY incomplete todos found
# Requires: All todos marked "completed"
```

#### 2. Test Execution
```python
# Checks: Code modification tools used (Write, Edit, MultiEdit)
# Requires: Bash tool calls with test commands (npm test, vitest, jest, pytest)
# Validates: Test output patterns present (Test Suites:, PASS, ✓)
# Blocks: Code changes without test execution
```

#### 3. Test Failures
```python
# Detects: "FAIL", "failing", "failed" in test output
# Blocks: Any test failures present
# Requires: All tests passing before completion
```

#### 4. Coverage Requirements
```python
# Extracts: Coverage percentages from output
# Threshold: 80%
# Blocks: Coverage below threshold
# Requires: Additional tests to meet threshold
```

#### 5. Incomplete Implementations
```python
# Detects:
#   - "TODO: implement" or "TODO: fix"
#   - "FIXME:"
#   - "throw new Error('Not implemented')"
#   - "placeholder" keyword
#   - "// stub" comments
# Blocks: Any incomplete code patterns
# Requires: Full implementation of all code
```

#### 6. Error Handling
```python
# Detects: Tool execution errors ("success": false, Error:, ENOENT)
# Checks: Followed by fix patterns (fix, resolve, successfully)
# Blocks: Unresolved errors
# Requires: All errors diagnosed and fixed
```

#### 7. Task Scope
```python
# Detects:
#   - "partially implemented"
#   - "remaining" or "still need to"
#   - "will implement later"
#   - "out of scope"
# Blocks: Partial work or deferred tasks
# Requires: Complete fulfillment of user request
```

### PostToolUse Validations

#### 1. Test Execution Validation
```python
# Triggers: Bash tool with test commands
# Validates: Output contains test result patterns
# Blocks: Fake test claims (no actual output)
# Blocks: Test failures detected in output
```

#### 2. Code Change Validation
```python
# Triggers: Write/Edit/MultiEdit on .ts, .tsx, .js, .jsx, .py files
# Skips: Test files, config files, markdown
# Blocks: Reminds to run tests after code changes
```

#### 3. Dangerous Operations
```python
# Detects: kill, killall, pkill commands
# Exception: pkill -f chrome (allowed for browser cleanup)
# Blocks: All other kill commands on node processes
# Requires: Use ./start.sh & for restarts
```

## Testing the Hooks

### Test Stop Hook

```bash
# Test Case 1: Incomplete todos
echo '{
  "transcript": "TodoWrite status:pending",
  "stopReason": "task_complete"
}' | uv run .claude/hooks/stop_validator.py
# Expected: Exit code 2, blocks stopping

# Test Case 2: Code without tests
echo '{
  "transcript": "Write tool used on src/main.ts",
  "stopReason": "task_complete"
}' | uv run .claude/hooks/stop_validator.py
# Expected: Exit code 2, requires test execution

# Test Case 3: Test failures
echo '{
  "transcript": "Bash npm test\nOutput: 5 failed, 10 passed",
  "stopReason": "task_complete"
}' | uv run .claude/hooks/stop_validator.py
# Expected: Exit code 2, requires fixing failures

# Test Case 4: All validations pass
echo '{
  "transcript": "TodoWrite status:completed\nBash npm test\nOutput: Tests: 15 passed\nCoverage: 85%",
  "stopReason": "task_complete"
}' | uv run .claude/hooks/stop_validator.py
# Expected: Exit code 0, allows stopping
```

### Test PostToolUse Hook

```bash
# Test Case 1: Fake test execution
echo '{
  "tool_name": "Bash",
  "tool_input": {"command": "npm test"},
  "tool_output": "Command completed"
}' | uv run .claude/hooks/post_tool_validator.py
# Expected: Exit code 2, fake test detected

# Test Case 2: Real test execution
echo '{
  "tool_name": "Bash",
  "tool_input": {"command": "npm test"},
  "tool_output": "Test Suites: 5 passed\nTests: 25 passed"
}' | uv run .claude/hooks/post_tool_validator.py
# Expected: Exit code 0, validation passed

# Test Case 3: Dangerous command
echo '{
  "tool_name": "Bash",
  "tool_input": {"command": "pkill -f node"},
  "tool_output": ""
}' | uv run .claude/hooks/post_tool_validator.py
# Expected: Exit code 2, dangerous command blocked

# Test Case 4: Code change
echo '{
  "tool_name": "Write",
  "tool_input": {"file_path": "src/main.ts"},
  "tool_output": "File written"
}' | uv run .claude/hooks/post_tool_validator.py
# Expected: Exit code 2, reminds to run tests
```

## Customization

### Adjust Coverage Threshold

Edit `stop_validator.py:145`:

```python
# Change from 80% to your threshold
if min_coverage < 80.0:  # Change this value
```

### Add Custom Validations

Add new validation functions to either hook:

```python
def check_custom_rule(transcript: str) -> Tuple[bool, str]:
    """
    Custom validation logic.
    Returns: (is_valid, reason)
    """
    if some_condition:
        return False, "Reason for blocking"
    return True, ""

# Add to validations list
validations = [
    # ... existing validations
    ("Custom Rule", check_custom_rule),
]
```

### Disable Specific Validations

Comment out validations you don't want:

```python
validations = [
    ("Todo Completion", check_todo_completion),
    ("Test Execution", check_test_execution),
    # ("Coverage Requirements", check_coverage_requirements),  # Disabled
    ("Incomplete Implementations", check_incomplete_implementations),
]
```

## Troubleshooting

### Hook Not Running

```bash
# Check hook configuration
cat .claude/settings.json

# Verify hook is executable
ls -la .claude/hooks/

# Test hook manually
echo '{"transcript":"test"}' | uv run .claude/hooks/stop_validator.py
```

### Hook Blocking Incorrectly

```bash
# Debug with verbose output
# Add debug prints to hook scripts
print(f"DEBUG: {variable}", file=sys.stderr)

# Check transcript content
# Hooks analyze the conversation transcript
# Ensure required patterns are present
```

### uv Not Found

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Reload shell
source ~/.bashrc  # or ~/.zshrc

# Verify
uv --version
```

## Best Practices

### For Claude Code Users

1. **Use TodoWrite consistently**: Create todos for all tasks
2. **Mark todos completed immediately**: Don't batch completions
3. **Always run tests**: After any code changes
4. **Show test output**: Let hooks validate real results
5. **Fix failures before continuing**: One test at a time
6. **Meet coverage requirements**: Write comprehensive tests
7. **Complete implementations**: No TODOs or placeholders

### For Hook Maintenance

1. **Update patterns regularly**: As test frameworks evolve
2. **Add project-specific rules**: Customize for your needs
3. **Test hooks thoroughly**: Ensure reliable validation
4. **Document changes**: Keep README updated
5. **Version control**: Track hook changes in git

## Integration with TDD Workflow

The validation hooks enforce ProAgentic's TDD methodology:

### RED Phase
```
PostToolUse Hook: Validates test creation
- Ensures tests are written
- Confirms tests fail (RED state)
```

### GREEN Phase
```
PostToolUse Hook: Validates test execution after fixes
- Detects fake test claims
- Requires real test output
- Blocks on test failures
```

### REFACTOR Phase
```
Stop Hook: Validates final state
- All tests passing
- Coverage requirements met
- No incomplete implementations
- All todos completed
```

## Success Metrics

With validation hooks enabled:

- **0% fake test claims**: All test executions validated
- **0% incomplete deliverables**: All todos must be completed
- **≥80% test coverage**: Enforced by validation
- **0% ignored test failures**: Must fix before continuing
- **100% task completion**: Full scope validation

## Examples from Production Use

### Example 1: Caught Fake Test

```
User: "Fix the authentication bug"
Claude: Creates todo, modifies auth code
Claude: "I've run the tests and they pass"
PostToolUse Hook: No Bash tool call with test command found
Hook: BLOCKS - "FAKE TEST EXECUTION DETECTED"
Claude: Must actually run: Bash("npm test")
Claude: Shows real test output
Hook: Validates test patterns present ✅
Claude: Continues with confidence
```

### Example 2: Caught Incomplete Work

```
User: "Implement user dashboard with 5 features"
Claude: Creates 5 todos
Claude: Implements 3 features
Claude: Attempts to finish
Stop Hook: Finds 2 todos with "status": "pending"
Hook: BLOCKS - "INCOMPLETE TODOS DETECTED"
Claude: Must complete remaining 2 features
Claude: Marks all todos "completed"
Hook: Validates all todos completed ✅
Claude: Allowed to finish
```

### Example 3: Caught Low Coverage

```
User: "Add payment processing module"
Claude: Implements payment code
Claude: Writes 2 basic tests
Claude: Runs coverage (shows 45%)
Stop Hook: Extracts coverage percentage
Hook: BLOCKS - "INSUFFICIENT TEST COVERAGE: 45% < 80%"
Claude: Must write additional tests
Claude: Achieves 82% coverage
Hook: Validates coverage ≥80% ✅
Claude: Allowed to finish
```

## Related Documentation

- [Claude Code Hooks Reference](https://docs.claude.com/en/docs/claude-code/hooks)
- [TDD Skill Documentation](../.claude/skills/tdd/README.md)
- [ProAgentic TDD Methodology](../../CLAUDE.md#test-driven-development)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review hook output in stderr
3. Test hooks manually with sample input
4. Verify uv installation and hook permissions

## License

Part of ProAgentic project. See project LICENSE.
