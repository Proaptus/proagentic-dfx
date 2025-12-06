# Hook Configuration Reference

## Current Configuration

Your `.claude/settings.json` is configured with validation hooks:

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

## Hook Files

### `.claude/hooks/stop_validator.py`

**Purpose**: Final validation before Claude can finish responding

**Validations**:
1. Todo Completion - All todos marked "completed"
2. Test Execution - Tests run if code changed
3. Test Failures - No failing tests
4. Coverage Requirements - ≥80% coverage
5. Incomplete Implementations - No TODOs/FIXMEs
6. Error Handling - All errors resolved
7. Task Scope - Full completion

**Exit Codes**:
- `0`: All validations passed
- `2`: Validation failed (blocks stopping)

**Configuration Points**:

```python
# Line 145: Coverage threshold
if min_coverage < 80.0:  # Adjust this value

# Lines 89-98: Todo status checks
todo_pattern = r'"status":\s*"(pending|in_progress)"'

# Lines 119-127: Test command patterns
bash_test_patterns = [
    r'"command":\s*"npm\s+(?:run\s+)?test',
    r'"command":\s*"vitest',
    r'"command":\s*"jest',
    r'"command":\s*"pytest',
]

# Lines 207-215: Incomplete implementation patterns
incomplete_patterns = [
    (r'TODO:.*(?:implement|fix|complete)', "..."),
    (r'FIXME:', "..."),
    (r'throw\s+new\s+Error\s*\(\s*["\']Not\s+implemented', "..."),
]
```

### `.claude/hooks/post_tool_validator.py`

**Purpose**: Real-time validation after each tool execution

**Validations**:
1. Test Execution - Real test output vs fake claims
2. Code Changes - Remind to test after modifications
3. Dangerous Operations - Block kill/pkill commands

**Exit Codes**:
- `0`: Validation passed
- `2`: Validation failed (blocks tool result)

**Configuration Points**:

```python
# Lines 33-41: Test command detection
test_command_patterns = [
    r'npm\s+(?:run\s+)?test',
    r'vitest',
    r'jest',
    r'pytest',
]

# Lines 44-52: Test output validation
test_output_patterns = [
    r'Test Suites:',
    r'Tests:\s+\d+\s+passed',
    r'✓|✔|PASS',
    r'Coverage\s+summary',
]

# Lines 116-130: File skip patterns
skip_patterns = [
    r'\.test\.',
    r'\.spec\.',
    r'test/',
    r'\.config\.',
    r'\.md$',
]

# Lines 135-137: Implementation file patterns
impl_patterns = [r'\.tsx?$', r'\.jsx?$', r'\.py$']
```

## Environment Variables

Hooks have access to these environment variables:

- `$CLAUDE_PROJECT_DIR`: Project root path
- `$CLAUDE_TOOL_NAME`: Name of tool being used
- `$CLAUDE_TOOL_INPUT`: Tool input parameters
- `$CLAUDE_TOOL_OUTPUT`: Tool execution output
- `$CLAUDE_FILE_PATHS`: Space-separated file paths

**Example Usage**:
```bash
command: "prettier --write $CLAUDE_FILE_PATHS"
```

## Hook Input/Output Format

### Stop Hook Input (stdin)

```json
{
  "transcript": "Full conversation transcript",
  "stopReason": "task_complete | max_turns | ...",
  "stop_hook_active": false,
  "session": {
    "id": "session-id",
    "started_at": "2025-01-05T10:00:00Z"
  }
}
```

### PostToolUse Hook Input (stdin)

```json
{
  "tool_name": "Bash | Write | Edit | ...",
  "tool_input": {
    "command": "npm test",
    "file_path": "src/main.ts",
    "...": "tool-specific inputs"
  },
  "tool_output": "Complete output from tool execution",
  "success": true
}
```

### Hook Output (stdout/stderr)

**Success** (exit 0):
```
# stdout: Informational messages (shown in transcript mode)
✅ Validation passed

# stderr: Warnings or notes (shown to user)
```

**Block** (exit 2):
```
# stderr: Error messages (shown to Claude for correction)
⛔ VALIDATION FAILED
[Detailed explanation]
[Required actions]
```

## Customization Examples

### 1. Add Custom Test Framework

Add to `stop_validator.py` line 119:

```python
bash_test_patterns = [
    r'"command":\s*"npm\s+(?:run\s+)?test',
    r'"command":\s*"vitest',
    r'"command":\s*"jest',
    r'"command":\s*"pytest',
    r'"command":\s*"cargo\s+test',        # Rust
    r'"command":\s*"go\s+test',           # Go
    r'"command":\s*"mvn\s+test',          # Maven
    r'"command":\s*"dotnet\s+test',       # .NET
]
```

### 2. Adjust Coverage Threshold by File Type

Replace `stop_validator.py` lines 145-155:

```python
def check_coverage_requirements(transcript: str) -> Tuple[bool, str]:
    """Check coverage with file-type specific thresholds."""
    coverage_values = []
    for pattern in coverage_patterns:
        matches = re.findall(pattern, transcript, re.IGNORECASE)
        coverage_values.extend([float(m) for m in matches])

    if not coverage_values:
        return True, ""

    min_coverage = min(coverage_values)

    # Different thresholds for different file types
    if 'src/utils/' in transcript:
        threshold = 90.0  # Utility functions need higher coverage
    elif 'src/components/' in transcript:
        threshold = 75.0  # UI components slightly lower
    else:
        threshold = 80.0  # Default threshold

    if min_coverage < threshold:
        return False, (
            f"INSUFFICIENT TEST COVERAGE:\n"
            f"Current coverage: {min_coverage:.1f}%\n"
            f"Required coverage: {threshold:.1f}%\n\n"
            "..."
        )
    return True, ""
```

### 3. Add Linting Validation

Add new validation to `stop_validator.py`:

```python
def check_linting(transcript: str) -> Tuple[bool, str]:
    """Check if linting passed."""
    # Check if code was modified
    has_code_changes = any(tool in transcript for tool in ['Write', 'Edit'])

    if not has_code_changes:
        return True, ""

    # Check for lint execution
    lint_patterns = [
        r'"command":\s*"npm\s+run\s+lint',
        r'"command":\s*"eslint',
    ]

    has_lint = any(re.search(p, transcript) for p in lint_patterns)

    if not has_lint:
        return False, (
            "LINTING NOT RUN:\n"
            "Code was modified but linting was not executed.\n\n"
            "Required: npm run lint"
        )

    # Check for lint errors
    if re.search(r'✖\s+\d+\s+problem', transcript):
        return False, "LINT ERRORS: Fix all linting issues before finishing"

    return True, ""

# Add to validations list
validations = [
    # ... existing
    ("Linting", check_linting),
]
```

### 4. Skip Validation for Specific Tasks

Add condition to `stop_validator.py` main():

```python
def main():
    input_data = read_hook_input()
    transcript = input_data.get('transcript', '')

    # Skip validation for documentation-only changes
    if all(
        '.md' in line or '.txt' in line
        for line in transcript.split('\n')
        if 'file_path' in line
    ):
        print("✅ Documentation-only change, skipping validation")
        sys.exit(0)

    # Continue with normal validation...
```

### 5. Add Project-Specific Rules

Create `.claude/hooks/project_rules.py`:

```python
def check_api_documentation(transcript: str) -> Tuple[bool, str]:
    """Ensure API endpoints are documented."""
    # Check if API route was added
    if re.search(r'app\.(get|post|put|delete)\s*\(', transcript):
        # Check if OpenAPI/Swagger docs were updated
        if 'openapi.yaml' not in transcript and 'swagger' not in transcript.lower():
            return False, (
                "API DOCUMENTATION MISSING:\n"
                "You added an API endpoint but didn't update API docs.\n"
                "Required: Update openapi.yaml or swagger documentation"
            )
    return True, ""

def check_database_migration(transcript: str) -> Tuple[bool, str]:
    """Ensure database changes have migrations."""
    # Check if database models were modified
    if re.search(r'class.*\(.*Model.*\)', transcript):
        # Check if migration was created
        if 'migration' not in transcript.lower():
            return False, (
                "DATABASE MIGRATION MISSING:\n"
                "You modified database models but didn't create a migration.\n"
                "Required: Create Alembic/Django migration"
            )
    return True, ""
```

Import in `stop_validator.py`:

```python
from project_rules import check_api_documentation, check_database_migration

validations = [
    # ... existing
    ("API Documentation", check_api_documentation),
    ("Database Migration", check_database_migration),
]
```

## Disabling Validations

### Temporary Disable (Single Session)

Comment out in `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      // Temporarily disabled
      // {
      //   "hooks": [{"type": "command", "command": "..."}]
      // }
    ]
  }
}
```

### Disable Specific Validation

Comment in hook file:

```python
validations = [
    ("Todo Completion", check_todo_completion),
    ("Test Execution", check_test_execution),
    # ("Coverage Requirements", check_coverage_requirements),  # Disabled
    ("Incomplete Implementations", check_incomplete_implementations),
]
```

### Conditional Disable

Add environment variable check:

```python
import os

def main():
    # Skip validation if SKIP_VALIDATION=1
    if os.getenv('SKIP_VALIDATION') == '1':
        sys.exit(0)

    # Continue with validation...
```

Then use: `SKIP_VALIDATION=1 claude-code`

## Hook Execution Order

1. **PreToolUse**: Before tool executes
   - Safety checks (dangerous commands)
   - File protection
   - Permission validation

2. **Tool Execution**: Actual tool runs

3. **PostToolUse**: After tool completes
   - Output validation
   - Test result checking
   - Completeness verification

4. **Stop**: When Claude tries to finish
   - Final completeness check
   - Todo validation
   - Coverage validation
   - Scope completion

## Debugging Hooks

### Add Debug Output

```python
import sys

# Add debug prints
print(f"DEBUG: transcript length = {len(transcript)}", file=sys.stderr)
print(f"DEBUG: validation result = {is_valid}", file=sys.stderr)
```

### Test Individual Validations

```python
# Run specific validation
result, reason = check_test_execution(transcript)
print(f"Result: {result}")
print(f"Reason: {reason}")
```

### View Hook Input

```bash
# Capture hook input to file
cat > test_input.json << 'EOF'
{
  "transcript": "Your test transcript here",
  "stopReason": "task_complete"
}
EOF

# Run hook with captured input
cat test_input.json | uv run .claude/hooks/stop_validator.py 2>&1
```

### Enable Verbose Mode

Add to hook:

```python
VERBOSE = os.getenv('HOOK_VERBOSE', '0') == '1'

if VERBOSE:
    print(f"DEBUG: Running validation {name}", file=sys.stderr)
```

Use: `HOOK_VERBOSE=1 claude-code`

## Performance Optimization

### Cache Regex Patterns

```python
import re

# Compile patterns once
TEST_PATTERNS = [
    re.compile(r'Test Suites:', re.IGNORECASE),
    re.compile(r'Tests:\s+\d+\s+passed', re.IGNORECASE),
]

# Use compiled patterns
has_test_output = any(p.search(tool_output) for p in TEST_PATTERNS)
```

### Skip Unnecessary Validations

```python
# Early exit if no code changes
if not any(tool in transcript for tool in ['Write', 'Edit']):
    print("✅ No code changes, validation passed")
    sys.exit(0)
```

### Limit Transcript Analysis

```python
# Only analyze last 10000 characters for performance
recent_transcript = transcript[-10000:]
```

## Integration with CI/CD

Hooks can be used in CI/CD pipelines:

```yaml
# .github/workflows/validate.yml
name: Validate AI Generated Code

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install uv
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Run Stop Validator
        run: |
          echo '{"transcript":"'$(cat commit_message.txt)'"}' | \
          uv run .claude/hooks/stop_validator.py
```

## Common Issues

### Issue: Hook not triggering

**Solution**: Check `.claude/settings.json` syntax and hook paths

### Issue: Permission denied

**Solution**: `chmod +x .claude/hooks/*.py`

### Issue: uv not found

**Solution**: Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`

### Issue: False positives

**Solution**: Adjust validation patterns in hook files

### Issue: Hook too strict

**Solution**: Lower thresholds or disable specific validations

## Resources

- [Full Documentation](README.md)
- [Quick Start Guide](QUICKSTART.md)
- [Claude Code Hooks Docs](https://docs.claude.com/en/docs/claude-code/hooks)
- [ProAgentic TDD Methodology](../../CLAUDE.md)

## Maintenance

### Review Schedule

- **Monthly**: Review validation patterns
- **After Framework Updates**: Update test patterns
- **After Project Changes**: Adjust thresholds
- **When False Positives**: Tune validation logic

### Version Control

```bash
# Track hook changes in git
git add .claude/hooks/
git commit -m "Update validation hooks"

# Tag hook versions
git tag -a hooks-v1.0 -m "Validation hooks version 1.0"
```

### Documentation Updates

Keep these files synchronized:
- `README.md`: Full documentation
- `QUICKSTART.md`: User guide
- `CONFIGURATION.md`: This file
- `.claude/settings.json`: Active config
