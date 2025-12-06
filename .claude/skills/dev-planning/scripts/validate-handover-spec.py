#!/usr/bin/env python3
"""
TDD Handover Spec Validator

Validates TDD_HANDOVER_SPEC.json against schema and checks quality gates.

Usage:
    python validate-handover-spec.py path/to/TDD_HANDOVER_SPEC.json
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# Quality gate thresholds
MAX_BRIEFING_TOKENS = 2000
TOKEN_ESTIMATE_RATIO = 4  # 1 token ≈ 4 characters


class HandoverSpecValidator:
    """Validates TDD handover specification"""

    def __init__(self, spec_path: Path):
        self.spec_path = spec_path
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.spec: Dict = {}

    def load_spec(self) -> bool:
        """Load and parse JSON spec"""
        try:
            with open(self.spec_path, "r") as f:
                self.spec = json.load(f)
            return True
        except FileNotFoundError:
            self.errors.append(f"File not found: {self.spec_path}")
            return False
        except json.JSONDecodeError as e:
            self.errors.append(f"Invalid JSON: {e}")
            return False

    def validate_schema(self) -> bool:
        """Validate required fields are present"""
        required_top_level = ["meta", "goal", "context", "tdd_plan", "steps", "tooling", "done_definition"]

        for field in required_top_level:
            if field not in self.spec:
                self.errors.append(f"Missing required top-level field: {field}")

        # Meta fields
        if "meta" in self.spec:
            required_meta = ["task_id", "repo", "commit", "created_at"]
            for field in required_meta:
                if field not in self.spec["meta"]:
                    self.errors.append(f"Missing required meta field: {field}")

        # Goal fields
        if "goal" in self.spec:
            required_goal = ["type", "summary", "scope"]
            for field in required_goal:
                if field not in self.spec["goal"]:
                    self.errors.append(f"Missing required goal field: {field}")

            if "type" in self.spec["goal"]:
                valid_types = ["bugfix", "feature", "refactor"]
                if self.spec["goal"]["type"] not in valid_types:
                    self.errors.append(f"Invalid goal type: {self.spec['goal']['type']} (must be one of {valid_types})")

        # TDD plan
        if "tdd_plan" in self.spec:
            if "acceptance_criteria" not in self.spec["tdd_plan"]:
                self.errors.append("Missing acceptance_criteria in tdd_plan")
            else:
                for i, ac in enumerate(self.spec["tdd_plan"]["acceptance_criteria"]):
                    if "id" not in ac:
                        self.errors.append(f"Acceptance criteria {i} missing 'id'")
                    if "gherkin" not in ac:
                        self.errors.append(f"Acceptance criteria {i} missing 'gherkin'")

        # Steps
        if "steps" in self.spec:
            if not self.spec["steps"]:
                self.errors.append("Steps array is empty - must have at least one step")

            for i, step in enumerate(self.spec["steps"]):
                required_step = ["id", "intent", "commands", "expected_final_result"]
                for field in required_step:
                    if field not in step:
                        self.errors.append(f"Step {i} missing required field: {field}")

        return len(self.errors) == 0

    def validate_completeness(self) -> bool:
        """Validate completeness quality gate"""
        if "tdd_plan" in self.spec:
            # Check all ACs have tests
            ac_count = len(self.spec["tdd_plan"].get("acceptance_criteria", []))
            unit_test_count = len(self.spec["tdd_plan"].get("unit_tests", []))

            if ac_count > 0 and unit_test_count == 0:
                self.warnings.append(f"Found {ac_count} acceptance criteria but no unit tests defined")

        # Check all steps have commands
        if "steps" in self.spec:
            for i, step in enumerate(self.spec["steps"]):
                if not step.get("commands"):
                    self.errors.append(f"Step {i} ({step.get('id', 'unknown')}) has no commands defined")

        # Check done_definition is not empty
        if not self.spec.get("done_definition"):
            self.errors.append("done_definition is empty - must specify completion criteria")

        return len(self.errors) == 0

    def validate_determinism(self) -> bool:
        """Validate determinism quality gate"""
        ambiguous_terms = ["appropriately", "correctly", "properly", "should work", "maybe", "possibly"]

        # Check steps for ambiguous language
        if "steps" in self.spec:
            for i, step in enumerate(self.spec["steps"]):
                intent = step.get("intent", "").lower()
                for term in ambiguous_terms:
                    if term in intent:
                        self.warnings.append(f"Step {i} has ambiguous language in intent: '{term}'")

                # Check for vague expected results
                expected_final = step.get("expected_final_result", "").lower()
                if not expected_final:
                    self.errors.append(f"Step {i} has no expected_final_result")
                elif expected_final in ["should pass", "works", "fixed"]:
                    self.warnings.append(f"Step {i} has vague expected_final_result: '{expected_final}'")

        return len(self.errors) == 0

    def validate_testability(self) -> bool:
        """Validate testability quality gate"""
        if "tdd_plan" not in self.spec:
            return True

        # Check acceptance criteria for testability
        for i, ac in enumerate(self.spec["tdd_plan"].get("acceptance_criteria", [])):
            gherkin = ac.get("gherkin", "")

            # Must have Given/When/Then structure
            if "Given" not in gherkin or "When" not in gherkin or "Then" not in gherkin:
                self.errors.append(f"Acceptance criteria {i} ({ac.get('id', 'unknown')}) missing Given/When/Then structure")

            # Check for vague assertions
            if "should be fast" in gherkin.lower() or "should work" in gherkin.lower():
                self.warnings.append(f"Acceptance criteria {i} has vague assertion (not measurable)")

        return len(self.errors) == 0

    def validate_briefing_length(self, briefing_path: Path) -> bool:
        """Validate briefing length is within token budget"""
        if not briefing_path.exists():
            self.warnings.append(f"Briefing file not found: {briefing_path}")
            return True  # Not a hard error if missing

        with open(briefing_path, "r") as f:
            briefing_content = f.read()

        # Estimate tokens (rough: 1 token ≈ 4 characters)
        estimated_tokens = len(briefing_content) / TOKEN_ESTIMATE_RATIO

        if estimated_tokens > MAX_BRIEFING_TOKENS:
            self.errors.append(
                f"Briefing exceeds token budget: {estimated_tokens:.0f} tokens "
                f"(max {MAX_BRIEFING_TOKENS}). Compress the briefing."
            )
            return False

        print(f"✅ Briefing within budget: {estimated_tokens:.0f} tokens (max {MAX_BRIEFING_TOKENS})")
        return True

    def report(self) -> Tuple[bool, str]:
        """Generate validation report"""
        lines = []
        lines.append("=" * 60)
        lines.append("TDD HANDOVER SPEC VALIDATION REPORT")
        lines.append("=" * 60)
        lines.append("")

        if self.errors:
            lines.append("❌ VALIDATION FAILED")
            lines.append("")
            lines.append("ERRORS:")
            for i, error in enumerate(self.errors, 1):
                lines.append(f"  {i}. {error}")
            lines.append("")

        if self.warnings:
            lines.append("⚠️  WARNINGS:")
            for i, warning in enumerate(self.warnings, 1):
                lines.append(f"  {i}. {warning}")
            lines.append("")

        if not self.errors and not self.warnings:
            lines.append("✅ ALL QUALITY GATES PASSED")
            lines.append("")
            lines.append("Specification is valid and ready for handover.")

        lines.append("=" * 60)

        return (len(self.errors) == 0, "\n".join(lines))


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate-handover-spec.py path/to/TDD_HANDOVER_SPEC.json")
        sys.exit(1)

    spec_path = Path(sys.argv[1])

    # Assume briefing is in same directory with .md extension
    briefing_path = spec_path.parent / spec_path.stem.replace(".json", ".md")
    if not briefing_path.exists():
        briefing_path = spec_path.parent / "TDD_HANDOVER_SPEC.md"

    validator = HandoverSpecValidator(spec_path)

    # Run validation steps
    print(f"Validating: {spec_path}")
    print("")

    if not validator.load_spec():
        success, report = validator.report()
        print(report)
        sys.exit(1)

    print("Running quality gate checks...")
    print("")

    # Quality Gate 1: Schema
    print("Gate 1: Schema validation...", end=" ")
    if validator.validate_schema():
        print("✅ PASS")
    else:
        print("❌ FAIL")

    # Quality Gate 2: Completeness
    print("Gate 2: Completeness check...", end=" ")
    if validator.validate_completeness():
        print("✅ PASS")
    else:
        print("❌ FAIL")

    # Quality Gate 3: Determinism
    print("Gate 3: Determinism check...", end=" ")
    if validator.validate_determinism():
        print("✅ PASS")
    else:
        print("❌ FAIL")

    # Quality Gate 4: Testability
    print("Gate 4: Testability check...", end=" ")
    if validator.validate_testability():
        print("✅ PASS")
    else:
        print("❌ FAIL")

    # Quality Gate 5: Briefing Length
    print("Gate 5: Briefing length check...", end=" ")
    if validator.validate_briefing_length(briefing_path):
        print("✅ PASS")
    else:
        print("❌ FAIL")

    print("")

    # Generate final report
    success, report = validator.report()
    print(report)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
