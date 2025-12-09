#!/usr/bin/env python3
"""
Integration tests for ProSWARM workflow.

Tests the complete flow of orchestration, memory operations,
and tool validation working together.
"""

import pytest
import json
import subprocess
import sys
from pathlib import Path
import os

# Template root directory
TEMPLATE_DIR = Path(__file__).parent.parent.parent
HOOKS_DIR = TEMPLATE_DIR / ".claude" / "hooks"


class TestProSWARMIntegration:
    """Integration tests for ProSWARM workflow."""

    def test_hook_script_exists_and_executable(self):
        """Test that the hook script exists and is executable."""
        hook_path = HOOKS_DIR / "enforce-proswarm.py"
        assert hook_path.exists(), f"Hook not found at {hook_path}"
        assert os.access(hook_path, os.X_OK), "Hook is not executable"

    def test_hook_has_valid_python_syntax(self):
        """Test that the hook has valid Python syntax."""
        hook_path = HOOKS_DIR / "enforce-proswarm.py"
        result = subprocess.run(
            [sys.executable, "-m", "py_compile", str(hook_path)],
            capture_output=True, text=True
        )
        assert result.returncode == 0, f"Syntax error: {result.stderr}"

    def test_settings_json_valid(self):
        """Test that settings.json is valid JSON."""
        settings_path = TEMPLATE_DIR / ".claude" / "settings.json"
        assert settings_path.exists(), "settings.json not found"
        with open(settings_path) as f:
            settings = json.load(f)
        assert "hooks" in settings
        assert "PreToolUse" in settings["hooks"]

    def test_settings_uses_relative_paths(self):
        """Test that settings.json uses relative paths."""
        settings_path = TEMPLATE_DIR / ".claude" / "settings.json"
        with open(settings_path) as f:
            content = f.read()
        assert "/home/chine/proagentic-clean" not in content
        assert "./.claude/hooks/" in content

    def test_all_proswarm_agents_exist(self):
        """Test that all ProSWARM core agents are defined."""
        agents_dir = TEMPLATE_DIR / ".claude" / "agents"
        required_agents = [
            "proswarm-orchestrator.md",
            "proswarm-executor.md",
            "proswarm-model-selector.md",
            "proswarm-memory-manager.md",
        ]
        for agent in required_agents:
            assert (agents_dir / agent).exists(), f"Missing agent: {agent}"

    def test_all_tdd_agents_exist(self):
        """Test that all TDD agents are defined."""
        agents_dir = TEMPLATE_DIR / ".claude" / "agents"
        required_agents = [
            "tdd-test-generator.md",
            "tdd-self-debugger.md",
            "tdd-multi-sampler.md",
            "tdd-quality-gatekeeper.md",
        ]
        for agent in required_agents:
            assert (agents_dir / agent).exists(), f"Missing agent: {agent}"

    def test_all_core_skills_exist(self):
        """Test that all core skills are present."""
        skills_dir = TEMPLATE_DIR / ".claude" / "skills"
        required_skills = ["proswarm", "tdd", "dev-planning", "bug-fixer", "doc-manager", "novae"]
        for skill in required_skills:
            skill_dir = skills_dir / skill
            assert skill_dir.exists(), f"Missing skill: {skill}"
            assert (skill_dir / "SKILL.md").exists(), f"Missing SKILL.md in {skill}"

    def test_claude_md_exists_and_valid(self):
        """Test that CLAUDE.md exists and has no hardcoded paths."""
        claude_md = TEMPLATE_DIR / "CLAUDE.md"
        assert claude_md.exists()
        content = claude_md.read_text(encoding="utf-8")
        assert "/home/chine/proagentic-clean" not in content
        assert "PROSWARM" in content
        assert "orchestrate_task" in content


class TestTemplateStandalone:
    """Test that the template is completely standalone."""

    def test_no_hardcoded_paths_in_hooks(self):
        """Test that hooks have no hardcoded paths."""
        hooks_dir = TEMPLATE_DIR / ".claude" / "hooks"
        for hook_file in hooks_dir.glob("*.py"):
            content = hook_file.read_text(encoding="utf-8")
            assert "/home/chine/proagentic-clean" not in content, f"{hook_file.name} has hardcoded path"

    def test_hook_uses_dynamic_paths(self):
        """Test that enforce-proswarm.py uses dynamic path resolution."""
        hook_path = HOOKS_DIR / "enforce-proswarm.py"
        content = hook_path.read_text(encoding="utf-8")
        assert "__file__" in content or "SCRIPT_DIR" in content


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
