#!/usr/bin/env python3
"""
Test Quality Validator for TDD Skill

Detects vacuous tests (tests without assertions or with trivial assertions).
Prevents weak tests from passing quality gates.

Usage:
    ./validate-test-quality.py <test-file-path>
    ./validate-test-quality.py tests/auth/login.test.ts

Checks for:
- Tests without assertions (no expect, assert, etc.)
- Trivial assertions (expect(true).toBe(true))
- Always-true conditions
- Empty test bodies
"""

import re
import sys
from pathlib import Path
from typing import List, Tuple


class TestQualityIssue:
    def __init__(self, test_name: str, line_number: int, issue_type: str, description: str):
        self.test_name = test_name
        self.line_number = line_number
        self.issue_type = issue_type
        self.description = description

    def __str__(self):
        return f"Line {self.line_number}: [{self.issue_type}] {self.test_name} - {self.description}"


def extract_tests(content: str, file_extension: str) -> List[Tuple[str, int, str]]:
    """Extract test cases from file content."""
    tests = []

    if file_extension in ['.ts', '.tsx', '.js', '.jsx']:
        # Match: it('test name', () => { ... })
        # Match: test('test name', () => { ... })
        pattern = r"(it|test)\s*\(\s*['\"`](.*?)['\"`]\s*,\s*(?:async\s*)?\(.*?\)\s*=>\s*\{(.*?)\n\s*\}(?:\)|;)"
        matches = re.finditer(pattern, content, re.DOTALL)

        for match in matches:
            test_name = match.group(2)
            test_body = match.group(3)
            line_number = content[:match.start()].count('\n') + 1
            tests.append((test_name, line_number, test_body))

    elif file_extension == '.py':
        # Match: def test_something(self):
        pattern = r"def\s+(test_\w+)\s*\(.*?\)\s*:\s*(.*?)(?=\n    def|\n\nclass|\Z)"
        matches = re.finditer(pattern, content, re.DOTALL)

        for match in matches:
            test_name = match.group(1)
            test_body = match.group(2)
            line_number = content[:match.start()].count('\n') + 1
            tests.append((test_name, line_number, test_body))

    return tests


def check_no_assertions(test_body: str, file_extension: str) -> bool:
    """Check if test has no assertions."""
    if file_extension in ['.ts', '.tsx', '.js', '.jsx']:
        # Check for: expect(...), assert(...), should(...), toHaveBeenCalled()
        assertion_patterns = [
            r'\bexpect\s*\(',
            r'\bassert\s*\(',
            r'\.should\(',
            r'\.toHaveBeenCalled',
            r'\.toEqual\(',
            r'\.toBe\(',
            r'\.toContain\(',
        ]
    elif file_extension == '.py':
        # Check for: assert, assertEqual, assertTrue, etc.
        assertion_patterns = [
            r'\bassert\s+',
            r'\.assert\w+\(',
            r'pytest\.raises',
        ]
    else:
        return False

    return not any(re.search(pattern, test_body) for pattern in assertion_patterns)


def check_trivial_assertions(test_body: str, file_extension: str) -> List[str]:
    """Check for trivial/vacuous assertions."""
    issues = []

    if file_extension in ['.ts', '.tsx', '.js', '.jsx']:
        # Trivial patterns
        trivial_patterns = [
            (r'expect\s*\(\s*true\s*\)\.toBe\s*\(\s*true\s*\)', 'expect(true).toBe(true) - Always true'),
            (r'expect\s*\(\s*false\s*\)\.toBe\s*\(\s*false\s*\)', 'expect(false).toBe(false) - Always true'),
            (r'expect\s*\(\s*1\s*\)\.toBe\s*\(\s*1\s*\)', 'expect(1).toBe(1) - Always true'),
            (r'expect\s*\(\s*\[\s*\]\s*\)\.toEqual\s*\(\s*\[\s*\]\s*\)', 'expect([]).toEqual([]) - Always true'),
            (r'expect\s*\(\s*\{\s*\}\s*\)\.toEqual\s*\(\s*\{\s*\}\s*\)', 'expect({}).toEqual({}) - Always true'),
        ]

        for pattern, description in trivial_patterns:
            if re.search(pattern, test_body):
                issues.append(description)

    elif file_extension == '.py':
        # Trivial Python patterns
        trivial_patterns = [
            (r'assert\s+True\s*(?:==\s*True)?', 'assert True - Always true'),
            (r'assert\s+1\s*==\s*1', 'assert 1 == 1 - Always true'),
            (r'assert\s+\[\s*\]\s*==\s*\[\s*\]', 'assert [] == [] - Always true'),
        ]

        for pattern, description in trivial_patterns:
            if re.search(pattern, test_body):
                issues.append(description)

    return issues


def check_empty_test_body(test_body: str) -> bool:
    """Check if test body is effectively empty."""
    # Remove comments and whitespace
    cleaned = re.sub(r'//.*', '', test_body)  # Remove line comments
    cleaned = re.sub(r'/\*.*?\*/', '', cleaned, flags=re.DOTALL)  # Remove block comments
    cleaned = re.sub(r'#.*', '', cleaned)  # Remove Python comments
    cleaned = cleaned.strip()

    # Check if only contains: pass, TODO, or nothing
    return (
        cleaned == ''
        or cleaned == 'pass'
        or cleaned.lower().startswith('todo')
        or cleaned.lower().startswith('// todo')
        or cleaned.lower().startswith('# todo')
    )


def validate_test_file(file_path: Path) -> List[TestQualityIssue]:
    """Validate a test file and return list of issues."""
    issues = []

    if not file_path.exists():
        print(f"Error: File not found: {file_path}")
        sys.exit(1)

    content = file_path.read_text(encoding='utf-8')
    file_extension = file_path.suffix
    tests = extract_tests(content, file_extension)

    if not tests:
        print(f"Warning: No tests found in {file_path}")
        return issues

    print(f"Analyzing {len(tests)} tests in {file_path.name}...")

    for test_name, line_number, test_body in tests:
        # Check for empty test body
        if check_empty_test_body(test_body):
            issues.append(TestQualityIssue(
                test_name,
                line_number,
                "EMPTY_TEST",
                "Test body is empty or contains only TODO/pass"
            ))
            continue

        # Check for missing assertions
        if check_no_assertions(test_body, file_extension):
            issues.append(TestQualityIssue(
                test_name,
                line_number,
                "NO_ASSERTIONS",
                "Test has no assertions - cannot validate behavior"
            ))

        # Check for trivial assertions
        trivial_issues = check_trivial_assertions(test_body, file_extension)
        for trivial_issue in trivial_issues:
            issues.append(TestQualityIssue(
                test_name,
                line_number,
                "TRIVIAL_ASSERTION",
                trivial_issue
            ))

    return issues


def main():
    if len(sys.argv) != 2:
        print("Usage: ./validate-test-quality.py <test-file-path>")
        print("Example: ./validate-test-quality.py tests/auth/login.test.ts")
        sys.exit(1)

    file_path = Path(sys.argv[1])
    issues = validate_test_file(file_path)

    if not issues:
        print(f"\n✅ PASS: All tests in {file_path.name} have proper assertions")
        sys.exit(0)
    else:
        print(f"\n❌ FAIL: Found {len(issues)} test quality issues:\n")
        for issue in issues:
            print(f"  {issue}")

        print("\n❌ Test quality validation failed")
        print("Fix these issues before proceeding with TDD workflow")
        sys.exit(1)


if __name__ == "__main__":
    main()
