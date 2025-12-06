#!/usr/bin/env python3
"""
Test suite for stop_validator.py Stop hook.

These tests validate that the hook:
1. Correctly reads transcript from transcript_path (not direct transcript field)
2. Only validates TodoWrite tool calls (not random "pending" strings in transcript)
3. Handles missing/invalid input gracefully
4. Always outputs valid JSON
5. Uses correct exit codes
"""

import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path


class TestStopValidator(unittest.TestCase):
    """Test cases for the Stop hook validator."""

    def setUp(self):
        """Set up test environment."""
        self.hook_script = Path(__file__).parent / "stop_validator.py"
        self.test_transcript = None

    def tearDown(self):
        """Clean up test files."""
        if self.test_transcript and os.path.exists(self.test_transcript):
            os.unlink(self.test_transcript)

    def run_hook(self, input_data):
        """Run the hook with given input and return output."""
        result = subprocess.run(
            ["python3", str(self.hook_script)],
            input=json.dumps(input_data),
            capture_output=True,
            text=True
        )
        return result

    def create_transcript(self, content):
        """Create a temporary transcript file with given content."""
        fd, path = tempfile.mkstemp(suffix=".jsonl", text=True)
        with os.fdopen(fd, 'w') as f:
            # Write JSONL lines
            for line in content:
                f.write(json.dumps(line) + '\n')
        self.test_transcript = path
        return path

    def test_reads_transcript_from_file_path(self):
        """Test that hook reads transcript from transcript_path, not transcript field."""
        # Create transcript with pending todo
        transcript_path = self.create_transcript([
            {"type": "tool_use", "name": "TodoWrite", "input": {"todos": [
                {"content": "Test task", "status": "pending", "activeForm": "Testing"}
            ]}}
        ])

        # Input with transcript_path (Claude Code's actual format)
        input_data = {
            "transcript_path": transcript_path,
            "stop_hook_active": False
        }

        result = self.run_hook(input_data)
        self.assertEqual(result.returncode, 2, "Should block with exit code 2")

        output = json.loads(result.stdout)
        self.assertEqual(output["decision"], "block")
        self.assertIn("INCOMPLETE TODOS DETECTED", output["reason"])

    def test_ignores_transcript_field_if_path_provided(self):
        """Test that transcript field is ignored when transcript_path is provided."""
        # Create empty transcript file
        transcript_path = self.create_transcript([])

        # Input with both transcript_path and transcript (path should be used)
        input_data = {
            "transcript_path": transcript_path,
            "transcript": '"status": "pending"',  # This should be ignored
            "stop_hook_active": False
        }

        result = self.run_hook(input_data)
        self.assertEqual(result.returncode, 0, "Should allow with exit code 0")

        output = json.loads(result.stdout)
        self.assertEqual(output["decision"], "allow")

    def test_only_validates_todowrite_tool_calls(self):
        """Test that hook only validates TodoWrite tool calls, not random 'pending' strings."""
        # Create transcript with "pending" in random places (not TodoWrite)
        transcript_path = self.create_transcript([
            {"type": "message", "content": "The status is pending for review"},
            {"type": "tool_use", "name": "Bash", "input": {"command": 'echo "status": "pending"'}},
            {"type": "message", "content": '"status": "pending" - this is just text'}
        ])

        input_data = {
            "transcript_path": transcript_path,
            "stop_hook_active": False
        }

        result = self.run_hook(input_data)
        self.assertEqual(result.returncode, 0, "Should allow - no actual TodoWrite pending todos")

        output = json.loads(result.stdout)
        self.assertEqual(output["decision"], "allow")

    def test_detects_real_pending_todos(self):
        """Test that hook correctly detects actual pending todos from TodoWrite."""
        # Create transcript with real TodoWrite pending todo
        transcript_path = self.create_transcript([
            {"type": "tool_use", "name": "TodoWrite", "input": {"todos": [
                {"content": "Fix bug", "status": "pending", "activeForm": "Fixing bug"},
                {"content": "Run tests", "status": "in_progress", "activeForm": "Running tests"}
            ]}}
        ])

        input_data = {
            "transcript_path": transcript_path,
            "stop_hook_active": False
        }

        result = self.run_hook(input_data)
        self.assertEqual(result.returncode, 2, "Should block with exit code 2")

        output = json.loads(result.stdout)
        self.assertEqual(output["decision"], "block")
        self.assertIn("1 pending task(s)", output["reason"])
        self.assertIn("1 in-progress task(s)", output["reason"])

    def test_allows_when_todos_completed(self):
        """Test that hook allows stopping when all todos are completed."""
        # Create transcript with completed todos
        transcript_path = self.create_transcript([
            {"type": "tool_use", "name": "TodoWrite", "input": {"todos": [
                {"content": "Fix bug", "status": "completed", "activeForm": "Fixing bug"},
                {"content": "Run tests", "status": "completed", "activeForm": "Running tests"}
            ]}}
        ])

        input_data = {
            "transcript_path": transcript_path,
            "stop_hook_active": False
        }

        result = self.run_hook(input_data)
        self.assertEqual(result.returncode, 0, "Should allow with exit code 0")

        output = json.loads(result.stdout)
        self.assertEqual(output["decision"], "allow")

    def test_handles_missing_transcript_file(self):
        """Test that hook handles missing transcript file gracefully."""
        input_data = {
            "transcript_path": "/nonexistent/file.jsonl",
            "stop_hook_active": False
        }

        result = self.run_hook(input_data)
        self.assertEqual(result.returncode, 0, "Should allow on error")

        output = json.loads(result.stdout)
        self.assertEqual(output["decision"], "allow")
        self.assertIn("Could not read transcript file", output["reason"])

    def test_handles_invalid_json_input(self):
        """Test that hook handles invalid JSON input gracefully."""
        result = subprocess.run(
            ["python3", str(self.hook_script)],
            input="not valid json",
            capture_output=True,
            text=True
        )

        self.assertEqual(result.returncode, 0, "Should exit 0 on parse error")

        output = json.loads(result.stdout)
        self.assertEqual(output["decision"], "allow")
        self.assertIn("parsing failed", output["reason"])

    def test_handles_empty_input(self):
        """Test that hook handles empty input gracefully."""
        result = subprocess.run(
            ["python3", str(self.hook_script)],
            input="{}",
            capture_output=True,
            text=True
        )

        self.assertEqual(result.returncode, 0, "Should allow with empty input")

        output = json.loads(result.stdout)
        self.assertEqual(output["decision"], "allow")

    def test_respects_stop_hook_active_flag(self):
        """Test that hook allows when stop_hook_active is true (prevent loops)."""
        # Create transcript with pending todos
        transcript_path = self.create_transcript([
            {"type": "tool_use", "name": "TodoWrite", "input": {"todos": [
                {"content": "Test", "status": "pending", "activeForm": "Testing"}
            ]}}
        ])

        input_data = {
            "transcript_path": transcript_path,
            "stop_hook_active": True  # This should bypass validation
        }

        result = self.run_hook(input_data)
        self.assertEqual(result.returncode, 0, "Should allow when stop_hook_active is true")

        output = json.loads(result.stdout)
        self.assertEqual(output["decision"], "allow")

    def test_always_outputs_valid_json(self):
        """Test that hook always outputs valid JSON regardless of input."""
        test_cases = [
            "{}",
            '{"transcript_path": "/fake/path"}',
            '{"stop_hook_active": true}',
            '{"transcript": "test"}',
            "invalid json",
            "",
        ]

        for input_str in test_cases:
            result = subprocess.run(
                ["python3", str(self.hook_script)],
                input=input_str,
                capture_output=True,
                text=True
            )

            # Should always output valid JSON
            try:
                output = json.loads(result.stdout)
                self.assertIn("decision", output, f"Missing decision for input: {input_str}")
                self.assertIn(output["decision"], ["allow", "block"], f"Invalid decision for input: {input_str}")
            except json.JSONDecodeError:
                self.fail(f"Invalid JSON output for input: {input_str}\nOutput: {result.stdout}")

    def test_only_detects_todos_from_current_session(self):
        """Test that hook only looks at todos from the current session, not old history."""
        # Create transcript with old completed todos and new pending ones
        transcript_path = self.create_transcript([
            # Old completed todos (should be ignored)
            {"type": "tool_use", "name": "TodoWrite", "input": {"todos": [
                {"content": "Old task 1", "status": "completed", "activeForm": "Working"},
                {"content": "Old task 2", "status": "completed", "activeForm": "Working"}
            ]}},
            # Most recent TodoWrite shows only one pending todo
            {"type": "tool_use", "name": "TodoWrite", "input": {"todos": [
                {"content": "Current task", "status": "pending", "activeForm": "Working"}
            ]}}
        ])

        input_data = {
            "transcript_path": transcript_path,
            "stop_hook_active": False
        }

        result = self.run_hook(input_data)
        self.assertEqual(result.returncode, 2, "Should block with pending todo")

        output = json.loads(result.stdout)
        self.assertEqual(output["decision"], "block")
        # Should only detect 1 pending task from the latest TodoWrite
        self.assertIn("1 pending task(s)", output["reason"])


if __name__ == "__main__":
    unittest.main()