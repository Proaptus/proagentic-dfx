#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
PostToolUse Hook Validator - Immediate Validation After Tool Execution

This hook runs immediately after Claude executes a tool to validate:
1. Test commands actually produce test output (not fake tests)
2. Write/Edit operations on test files are followed by test execution
3. Bash commands that claim to test actually run test frameworks
4. Test output shows real pass/fail results

Exit codes:
- 0: Validation passed
- 2: Validation failed, block and provide feedback to Claude
"""

import json
import sys
import re
from typing import Dict, Tuple


def read_hook_input() -> Dict:
    """Read and parse JSON input from stdin."""
    try:
        return json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(f"ERROR: Failed to parse hook input: {e}", file=sys.stderr)
        sys.exit(0)


def validate_test_execution(tool_name: str, tool_input: Dict, tool_output: str) -> Tuple[bool, str]:
    """
    Validate that test commands produce actual test output.
    Returns: (is_valid, reason)
    """
    if tool_name != 'Bash':
        return True, ""

    command = tool_input.get('command', '')

    # Check if this is a test command
    test_command_patterns = [
        r'npm\s+(?:run\s+)?test',
        r'vitest',
        r'jest',
        r'pytest',
        r'yarn\s+test',
        r'pnpm\s+test',
    ]

    is_test_command = any(
        re.search(pattern, command, re.IGNORECASE) for pattern in test_command_patterns
    )

    if not is_test_command:
        return True, ""

    # Validate that output contains real test results
    test_output_patterns = [
        r'Test Suites:',
        r'Tests:\s+\d+\s+passed',
        r'✓|✔|PASS',  # Test pass indicators
        r'✗|✘|FAIL',  # Test fail indicators
        r'\d+\s+passed.*\d+\s+total',
        r'Coverage\s+summary',
        r'Ran\s+\d+\s+test',
    ]

    has_test_output = any(
        re.search(pattern, tool_output, re.IGNORECASE | re.MULTILINE)
        for pattern in test_output_patterns
    )

    if not has_test_output:
        return False, (
            "FAKE TEST EXECUTION DETECTED:\n"
            f"Command claimed to run tests: {command}\n"
            "But the output does not contain actual test results.\n\n"
            "This is a CRITICAL violation. You must:\n"
            "1. Run the ACTUAL test command using the Bash tool\n"
            "2. Show the COMPLETE test output\n"
            "3. Analyze the REAL test results\n"
            "4. Never claim tests ran without showing output\n\n"
            "Faking test execution is unacceptable and undermines trust."
        )

    # Check for test failures
    failure_patterns = [
        r'FAIL(?:ED)?',
        r'\d+\s+failing',
        r'Test Suites:.*\d+\s+failed',
        r'Tests:.*\d+\s+failed',
    ]

    has_failures = any(
        re.search(pattern, tool_output, re.IGNORECASE) for pattern in failure_patterns
    )

    if has_failures:
        return False, (
            "TEST FAILURES DETECTED:\n"
            "The test execution shows failures. You must:\n"
            "1. Read the test output carefully to identify which tests failed\n"
            "2. Locate the failing test code\n"
            "3. Diagnose why each test is failing\n"
            "4. Fix the code or test to make it pass\n"
            "5. Re-run tests to verify the fix\n\n"
            "Do not continue to other tasks while tests are failing."
        )

    return True, ""


def validate_code_changes(tool_name: str, tool_input: Dict) -> Tuple[bool, str]:
    """
    Validate that code changes to implementation files are tested.
    Returns: (is_valid, reason)
    """
    if tool_name not in ['Write', 'Edit', 'MultiEdit']:
        return True, ""

    file_path = tool_input.get('file_path', '')

    # Skip validation for test files themselves and config files
    skip_patterns = [
        r'\.test\.',
        r'\.spec\.',
        r'test/',
        r'tests/',
        r'__tests__/',
        r'\.config\.',
        r'\.md$',
        r'\.json$',
        r'\.yml$',
        r'\.yaml$',
    ]

    should_skip = any(
        re.search(pattern, file_path, re.IGNORECASE) for pattern in skip_patterns
    )

    if should_skip:
        return True, ""

    # Check if this is a TypeScript/JavaScript implementation file
    impl_patterns = [r'\.tsx?$', r'\.jsx?$', r'\.py$']

    is_impl_file = any(
        re.search(pattern, file_path, re.IGNORECASE) for pattern in impl_patterns
    )

    if not is_impl_file:
        return True, ""

    # Implementation file was modified - remind to run tests
    return False, (
        f"CODE MODIFICATION REQUIRES TESTING:\n"
        f"You modified: {file_path}\n\n"
        "After modifying implementation code, you MUST:\n"
        "1. Run the relevant test suite immediately\n"
        "2. Verify all tests pass\n"
        "3. Fix any failing tests before continuing\n\n"
        "Use: npm test or npm run test:coverage\n"
        "Show the complete test output."
    )


def validate_dangerous_operations(tool_name: str, tool_input: Dict) -> Tuple[bool, str]:
    """
    Block dangerous operations that could break the system.
    Returns: (is_valid, reason)
    """
    if tool_name == 'Bash':
        command = tool_input.get('command', '')

        # Check for kill commands (except chrome)
        if re.search(r'\bkill(?:all)?\b', command, re.IGNORECASE):
            if 'chrome' not in command.lower():
                return False, (
                    "DANGEROUS COMMAND BLOCKED:\n"
                    f"Command: {command}\n\n"
                    "Using 'kill' commands is FORBIDDEN (except for Chrome cleanup).\n"
                    "To restart the server, use: ./start.sh &\n"
                    "Never use kill, pkill, or killall on node processes."
                )

        # Check for pkill on node
        if re.search(r'pkill.*node', command, re.IGNORECASE):
            return False, (
                "DANGEROUS COMMAND BLOCKED:\n"
                f"Command: {command}\n\n"
                "Using 'pkill' on node processes is FORBIDDEN.\n"
                "To restart the server, use: ./start.sh &\n"
                "The start script safely clears ports and restarts."
            )

    return True, ""


def main():
    """Main validation logic."""
    input_data = read_hook_input()

    tool_name = input_data.get('tool_name', '')
    tool_input = input_data.get('tool_input', {})
    tool_output = input_data.get('tool_output', '')

    # Run validations
    validations = [
        ("Dangerous Operations", lambda: validate_dangerous_operations(tool_name, tool_input)),
        ("Test Execution", lambda: validate_test_execution(tool_name, tool_input, tool_output)),
        ("Code Changes", lambda: validate_code_changes(tool_name, tool_input)),
    ]

    for name, validator in validations:
        is_valid, reason = validator()
        if not is_valid:
            print("\n" + "="*80, file=sys.stderr)
            print(f"⛔ {name.upper()} VALIDATION FAILED", file=sys.stderr)
            print("="*80, file=sys.stderr)
            print(reason, file=sys.stderr)
            print("="*80 + "\n", file=sys.stderr)
            sys.exit(2)

    # Validation passed
    sys.exit(0)


if __name__ == '__main__':
    main()
