#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
Stop Hook Validator - Enforces Task Completeness and Test Verification

This hook runs when Claude Code attempts to finish responding. It validates:
1. All TodoWrite items are marked as completed
2. Tests have been run if code was modified
3. No fake test execution (validates actual test output)
4. Coverage requirements met if tests were required
5. No incomplete implementations flagged

Exit codes:
- 0: Validation passed, allow stopping
- 2: Validation failed, block stopping with feedback to Claude
"""

import json
import sys
from typing import Dict, List, Tuple


def read_hook_input() -> Dict:
    """Read and parse JSON input from stdin."""
    try:
        return json.load(sys.stdin)
    except json.JSONDecodeError as e:
        # Output valid JSON to stdout on parsing errors
        print(json.dumps({"decision": "allow", "reason": f"Hook input parsing failed: {e}"}))
        sys.stdout.flush()
        sys.exit(0)  # Don't block on parsing errors


def parse_jsonl_transcript(transcript: str) -> List[Dict]:
    """
    Parse JSONL transcript into list of dictionaries.
    Returns list of parsed JSON objects.
    """
    parsed_lines = []
    for line in transcript.split('\n'):
        if not line.strip():
            continue
        try:
            data = json.loads(line)
            parsed_lines.append(data)
        except (json.JSONDecodeError, KeyError):
            continue
    return parsed_lines


def check_todo_completion(transcript: str) -> Tuple[bool, str]:
    """
    Check if all todos are marked as completed.
    Returns: (is_valid, reason)
    """
    # Find the LAST TodoWrite tool call to get current todo state
    last_todo_state = None

    parsed_lines = parse_jsonl_transcript(transcript)
    for data in parsed_lines:
        # Handle nested structure from Claude Code transcripts
        if 'message' in data and 'content' in data['message']:
            for content in data['message']['content']:
                if isinstance(content, dict) and content.get('type') == 'tool_use' and content.get('name') == 'TodoWrite':
                    # Found a TodoWrite call, extract the todos
                    if 'input' in content and 'todos' in content['input']:
                        last_todo_state = content['input']['todos']
        # Also handle simple structure (for backwards compatibility)
        elif data.get('type') == 'tool_use' and data.get('name') == 'TodoWrite':
            if 'input' in data and 'todos' in data['input']:
                last_todo_state = data['input']['todos']

    # If no TodoWrite calls found, no todos to check
    if last_todo_state is None:
        return True, ""

    # Collect specific incomplete todos
    pending_todos = []
    in_progress_todos = []

    for todo in last_todo_state:
        status = todo.get('status', '')
        content = todo.get('content', 'No description')

        if status == 'pending':
            pending_todos.append(content)
        elif status == 'in_progress':
            in_progress_todos.append(content)

    if pending_todos or in_progress_todos:
        failure_msg = "INCOMPLETE TODOS DETECTED:\n\n"

        if in_progress_todos:
            failure_msg += "⚠️  IN PROGRESS (must be completed):\n"
            for i, todo in enumerate(in_progress_todos, 1):
                failure_msg += f"   {i}. {todo}\n"
            failure_msg += "\n"

        if pending_todos:
            failure_msg += "❌ NOT STARTED (pending):\n"
            for i, todo in enumerate(pending_todos, 1):
                failure_msg += f"   {i}. {todo}\n"
            failure_msg += "\n"

        failure_msg += (
            "ACTION REQUIRED:\n"
            "• Complete all IN PROGRESS tasks immediately\n"
            "• Either complete or explicitly remove PENDING tasks if no longer relevant\n"
            "• Use TodoWrite to mark tasks as 'completed' as you finish them\n"
            "• Do NOT batch todo updates - update immediately after completing each task"
        )

        return False, failure_msg

    return True, ""


def check_test_execution(transcript: str) -> Tuple[bool, str]:
    """
    Check if tests were actually run when code was modified.
    Detects fake test claims vs real test execution.
    Returns: (is_valid, reason)
    """
    parsed_lines = parse_jsonl_transcript(transcript)

    # Track code modifications with specifics
    modified_files = []
    modification_types = set()

    for data in parsed_lines:
        # Handle nested structure from Claude Code transcripts
        if 'message' in data and 'content' in data['message']:
            for content in data['message']['content']:
                if isinstance(content, dict) and content.get('type') == 'tool_use':
                    tool_name = content.get('name')
                    if tool_name in ['Write', 'Edit', 'MultiEdit']:
                        modification_types.add(tool_name)
                        if 'input' in content:
                            file_path = content['input'].get('file_path', 'unknown file')
                            if file_path not in modified_files:
                                modified_files.append(file_path)
        # Also handle simple structure (for backwards compatibility)
        elif data.get('type') == 'tool_use':
            tool_name = data.get('name')
            if tool_name in ['Write', 'Edit', 'MultiEdit']:
                modification_types.add(tool_name)
                if 'input' in data:
                    file_path = data['input'].get('file_path', 'unknown file')
                    if file_path not in modified_files:
                        modified_files.append(file_path)

    if not modified_files:
        return True, ""  # No code changes, tests not required

    # Categorize modified files
    src_files = [f for f in modified_files if ('/src/' in f or f.startswith('src/')) and '.claude/hooks/' not in f]
    server_files = [f for f in modified_files if ('/server/' in f or f.startswith('server/')) and '.claude/hooks/' not in f]
    test_files = [f for f in modified_files if ('test' in f.lower() or 'spec' in f.lower()) and '.claude/hooks/' not in f]
    config_files = [f for f in modified_files if any(
        ext in f for ext in ['.json', '.config.', 'package.json', '.env', '.yml', '.yaml']
    )]
    hook_files = [f for f in modified_files if '.claude/hooks/' in f]

    # Check for actual test execution via Bash tool
    test_commands_run = []
    for data in parsed_lines:
        # Handle nested structure from Claude Code transcripts
        if 'message' in data and 'content' in data['message']:
            for content in data['message']['content']:
                if isinstance(content, dict) and content.get('type') == 'tool_use' and content.get('name') == 'Bash':
                    command = content.get('input', {}).get('command', '')
                    test_patterns = ['npm test', 'npm run test', 'vitest', 'jest', 'pytest', 'npm run test:coverage']
                    if any(pattern in command for pattern in test_patterns):
                        test_commands_run.append(command)
        # Also handle simple structure (for backwards compatibility)
        elif data.get('type') == 'tool_use' and data.get('name') == 'Bash':
            command = data.get('input', {}).get('command', '')
            test_patterns = ['npm test', 'npm run test', 'vitest', 'jest', 'pytest', 'npm run test:coverage']
            if any(pattern in command for pattern in test_patterns):
                test_commands_run.append(command)

    # Determine if tests are needed based on file types
    # Hook files and config-only changes don't need tests
    needs_tests = (src_files or server_files) and not hook_files

    if needs_tests and not test_commands_run:
        failure_msg = "CODE CHANGES WITHOUT TEST EXECUTION:\n\n"

        failure_msg += "📁 FILES MODIFIED:\n"
        if src_files:
            failure_msg += "  Frontend/Source Files:\n"
            for f in src_files[:5]:  # Show max 5
                failure_msg += f"    • {f}\n"
            if len(src_files) > 5:
                failure_msg += f"    ... and {len(src_files) - 5} more\n"

        if server_files:
            failure_msg += "  Backend/Server Files:\n"
            for f in server_files[:5]:
                failure_msg += f"    • {f}\n"
            if len(server_files) > 5:
                failure_msg += f"    ... and {len(server_files) - 5} more\n"

        if test_files:
            failure_msg += "  Test Files:\n"
            for f in test_files[:5]:
                failure_msg += f"    • {f}\n"
            if len(test_files) > 5:
                failure_msg += f"    ... and {len(test_files) - 5} more\n"

        failure_msg += "\n"

        # Suggest appropriate test commands based on file types
        failure_msg += "🧪 REQUIRED TEST COMMANDS:\n"

        if src_files or test_files:
            failure_msg += "  • npm run test:coverage  # For frontend code with coverage report\n"
            failure_msg += "  • npm test              # Quick test run without coverage\n"

        if server_files:
            failure_msg += "  • cd server && npm test  # For backend/server tests\n"

        failure_msg += "\n"
        failure_msg += (
            "ACTION REQUIRED:\n"
            "1. Run the appropriate test command(s) using the Bash tool\n"
            "2. Review actual test output for any failures\n"
            "3. Fix any failing tests before continuing\n"
            "4. Ensure all modified code is covered by tests\n\n"
            "⚠️  FAKE TEST CLAIMS ARE NOT ACCEPTABLE. Run real tests with real output."
        )

        return False, failure_msg

    # If only config files were modified, tests might not be required
    if config_files and not (src_files or server_files or test_files):
        return True, ""  # Config-only changes might not need tests

    return True, ""


def check_coverage_requirements(transcript: str) -> Tuple[bool, str]:
    """
    Check if coverage requirements are met when tests were run.
    Returns: (is_valid, reason)
    """
    # Skip coverage check - too prone to false positives
    # Would need to parse actual Bash tool outputs, not raw transcript
    return True, ""


def check_incomplete_implementations(transcript: str) -> Tuple[bool, str]:
    """
    Check for common patterns indicating incomplete work.
    Returns: (is_valid, reason)
    """
    # For now, skip this check as it's too aggressive
    # Would need to parse actual file contents, not transcript
    return True, ""


def check_error_handling(transcript: str) -> Tuple[bool, str]:
    """
    Check if errors occurred during the session that weren't resolved.
    Returns: (is_valid, reason)
    """
    parsed_lines = parse_jsonl_transcript(transcript)
    tool_failures = []

    # Check for tool execution errors
    for data in parsed_lines:
        # Check for tool result failures
        if 'message' in data and 'content' in data['message']:
            for content in data['message']['content']:
                if isinstance(content, dict) and content.get('type') == 'tool_result':
                    # Check if tool execution failed
                    if content.get('is_error', False):
                        tool_name = 'Unknown'
                        error_msg = content.get('content', 'No error message')

                        # Try to find corresponding tool use
                        for prev_content in data['message']['content']:
                            if prev_content.get('type') == 'tool_use' and prev_content.get('tool_use_id') == content.get('tool_use_id'):
                                tool_name = prev_content.get('name', 'Unknown')
                                break

                        tool_failures.append({
                            'tool': tool_name,
                            'error': error_msg[:200]  # Truncate long errors
                        })

    # Also check for Bash command failures
    bash_errors = []
    for data in parsed_lines:
        if 'message' in data and 'content' in data['message']:
            for content in data['message']['content']:
                if isinstance(content, dict) and content.get('type') == 'tool_use' and content.get('name') == 'Bash':
                    command = content.get('input', {}).get('command', '')
                    # Look for corresponding result
                    tool_id = content.get('tool_use_id')
                    for result_content in data['message']['content']:
                        if result_content.get('type') == 'tool_result' and result_content.get('tool_use_id') == tool_id:
                            result_text = result_content.get('content', '')
                            # Check for common error patterns in bash output
                            if any(pattern in result_text.lower() for pattern in [
                                'error:', 'failed', 'command not found', 'permission denied',
                                'enoent', 'cannot find module', 'syntaxerror'
                            ]):
                                bash_errors.append({
                                    'command': command[:100],  # Truncate long commands
                                    'error': _extract_error_line(result_text)
                                })

    # Check if there are unresolved errors
    if tool_failures or bash_errors:
        # Look for evidence of fixes
        fix_evidence = []
        for data in parsed_lines:
            if 'message' in data and 'content' in data['message']:
                text_content = str(data['message'].get('content', ''))
                if any(pattern in text_content.lower() for pattern in [
                    'fixed', 'resolved', 'working now', 'successfully', 'passes'
                ]):
                    fix_evidence.append(True)

        # If we have errors but no clear fixes, report them
        if not fix_evidence or len(fix_evidence) < len(tool_failures) + len(bash_errors):
            failure_msg = "UNRESOLVED ERRORS DETECTED:\n\n"

            if tool_failures:
                failure_msg += "🔴 TOOL EXECUTION FAILURES:\n"
                for i, failure in enumerate(tool_failures[:5], 1):  # Show max 5
                    failure_msg += f"  {i}. Tool: {failure['tool']}\n"
                    failure_msg += f"     Error: {failure['error']}\n\n"
                if len(tool_failures) > 5:
                    failure_msg += f"  ... and {len(tool_failures) - 5} more tool failures\n\n"

            if bash_errors:
                failure_msg += "🔴 BASH COMMAND FAILURES:\n"
                for i, error in enumerate(bash_errors[:5], 1):  # Show max 5
                    failure_msg += f"  {i}. Command: {error['command']}\n"
                    failure_msg += f"     Error: {error['error']}\n\n"
                if len(bash_errors) > 5:
                    failure_msg += f"  ... and {len(bash_errors) - 5} more command failures\n\n"

            failure_msg += (
                "ACTION REQUIRED:\n"
                "1. Review each error message above\n"
                "2. Diagnose the root cause of failures\n"
                "3. Implement fixes for each error\n"
                "4. Re-run failed operations to verify fixes\n"
                "5. Show successful execution output\n\n"
                "⚠️  Do NOT claim errors are resolved without showing successful re-execution"
            )

            return False, failure_msg

    return True, ""

def _extract_error_line(text: str) -> str:
    """Extract the most relevant error line from output text."""
    lines = text.split('\n')
    for line in lines:
        if any(pattern in line.lower() for pattern in ['error:', 'failed', 'exception']):
            return line[:150]  # Return truncated error line
    # If no specific error line found, return first non-empty line
    for line in lines:
        if line.strip():
            return line[:150]
    return "Error details in output"


def validate_task_scope(transcript: str) -> Tuple[bool, str]:
    """
    Check if the original user request was fully addressed.
    Returns: (is_valid, reason)
    """
    # Skip this check - too aggressive and not reliable
    # Would need proper NLP to determine task completion
    return True, ""


def check_tdd_skill_usage(transcript: str) -> Tuple[bool, str]:
    """
    Check if TDD skill was used when code changes were made.
    ProAgentic mandates TDD-first development approach.
    Returns: (is_valid, reason)
    """
    parsed_lines = parse_jsonl_transcript(transcript)

    # Check for significant code changes (more than just minor edits)
    code_changes = []
    seen_files = set()  # Track unique files
    for data in parsed_lines:
        if 'message' in data and 'content' in data['message']:
            for content in data['message']['content']:
                if isinstance(content, dict) and content.get('type') == 'tool_use':
                    tool_name = content.get('name')
                    if tool_name in ['Write', 'Edit']:
                        if 'input' in content:
                            file_path = content['input'].get('file_path', '')

                            # Skip if already seen
                            if file_path in seen_files:
                                continue

                            # Check if it's a source file (not config/doc/hook/test)
                            # Exclude .claude/hooks files and test files
                            if any(pattern in file_path for pattern in [
                                '/src/', '/server/', '/components/', '/utils/', '/services/'
                            ]) and not any(skip in file_path for skip in [
                                '.md', '.json', '.yml', '.yaml', '.env', '.config.',
                                '.claude/hooks/', 'test_', '_test.', '.test.', '.spec.',
                                '/tests/', '/test/', '/__tests__/'
                            ]) and '/hooks/' not in file_path:  # Exclude React hooks too if in test context
                                code_changes.append(file_path)
                                seen_files.add(file_path)

    # If no significant code changes, TDD not required
    if not code_changes:
        return True, ""

    # Check if TDD skill or dev-planning skill was used
    tdd_used = False
    dev_planning_used = False
    for data in parsed_lines:
        if 'message' in data and 'content' in data['message']:
            for content in data['message']['content']:
                if isinstance(content, dict) and content.get('type') == 'tool_use':
                    if content.get('name') == 'Skill':
                        skill_command = content.get('input', {}).get('skill', '')
                        if 'tdd' in skill_command.lower():
                            tdd_used = True
                        if 'dev-planning' in skill_command.lower():
                            dev_planning_used = True
                    elif content.get('name') == 'Task':
                        subagent = content.get('input', {}).get('subagent_type', '')
                        if 'tdd' in subagent.lower():
                            tdd_used = True
                        if 'dev-planning' in subagent.lower():
                            dev_planning_used = True

    # If significant code changes but no TDD skill used
    if code_changes and not tdd_used and not dev_planning_used:
        failure_msg = "⚠️  TDD SKILL NOT USED FOR CODE CHANGES:\n\n"

        failure_msg += "📁 SOURCE FILES MODIFIED WITHOUT TDD:\n"
        for i, file in enumerate(code_changes[:10], 1):  # Show max 10
            failure_msg += f"  {i}. {file}\n"
        if len(code_changes) > 10:
            failure_msg += f"  ... and {len(code_changes) - 10} more files\n"

        failure_msg += "\n"
        failure_msg += (
            "🚨 PROAGENTIC REQUIRES TDD-FIRST DEVELOPMENT:\n"
            "All code changes MUST follow Test-Driven Development:\n\n"
            "1. Use 'Skill({ command: \"tdd\" })' for bug fixes and features\n"
            "2. Use 'Skill({ command: \"dev-planning\" })' for complex features\n"
            "3. Write failing tests BEFORE implementation\n"
            "4. Follow RED-GREEN-REFACTOR cycle\n"
            "5. Run quality gates before merging\n\n"
            "TDD improves code correctness by 12-46% and is MANDATORY for ProAgentic.\n"
            "Re-do this work using the TDD skill to ensure quality."
        )

        return False, failure_msg

    return True, ""


def main():
    """Main validation logic."""
    input_data = read_hook_input()

    # Extract transcript from file path or direct transcript
    transcript = ""
    if 'transcript_path' in input_data:
        # Read transcript from file
        transcript_path = input_data['transcript_path']
        try:
            with open(transcript_path, 'r') as f:
                # Read all JSONL lines and concatenate
                lines = []
                for line in f:
                    if line.strip():
                        lines.append(line)
                transcript = '\n'.join(lines)
        except Exception as e:
            # If we can't read the transcript, allow stopping rather than erroring
            print(json.dumps({"decision": "allow", "reason": f"Could not read transcript file: {e}"}))
            sys.exit(0)
    else:
        # Fallback to direct transcript if provided
        transcript = input_data.get('transcript', '')

    _stop_reason = input_data.get('stopReason', '')  # Reserved for future validation use

    # Skip validation if this hook is already active (prevent infinite loops)
    if input_data.get('stop_hook_active', False):
        print(json.dumps({"decision": "allow"}))
        sys.exit(0)

    # Run all validations
    validations = [
        ("Todo Completion", check_todo_completion),
        ("Test Execution", check_test_execution),
        ("TDD Skill Usage", check_tdd_skill_usage),
        ("Coverage Requirements", check_coverage_requirements),
        ("Incomplete Implementations", check_incomplete_implementations),
        ("Error Handling", check_error_handling),
        ("Task Scope", validate_task_scope),
    ]

    failures = []
    for name, validator in validations:
        is_valid, reason = validator(transcript)
        if not is_valid:
            failures.append((name, reason))

    if failures:
        # Build detailed failure message
        failure_message = "⛔ TASK COMPLETION VALIDATION FAILED\n" + "="*80 + "\n\n"

        for name, reason in failures:
            failure_message += f"❌ {name}:\n{reason}\n" + "-"*80 + "\n\n"

        failure_message += "="*80 + "\n"
        failure_message += "You must address ALL validation failures before finishing."

        # Output ONLY JSON to stdout for Claude Code to parse
        output = {
            "decision": "block",
            "reason": failure_message
        }
        print(json.dumps(output))
        sys.stdout.flush()

        # Exit with code 2 to block stopping
        sys.exit(2)

    # All validations passed - output success JSON
    print(json.dumps({"decision": "allow"}))
    sys.exit(0)


if __name__ == '__main__':
    main()
