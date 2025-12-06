# Dev Planning Skill - Quality Gates Checklist

> **Use this checklist to validate TDD Handover Specs before handoff to TDD agent or manual implementation**

## Overview

This checklist implements the **Quality Gates** from Phase C: Handover Preparation. All gates must pass before a TDD Handover Spec is considered ready for execution.

**Block handover if ANY gate fails** - update the plan and re-validate.

---

## 🎯 Quality Gate 1: Completeness

**Goal**: Ensure all required information is present and actionable

### Checklist

- [ ] **Every acceptance criterion has at least one test intent**
  - Check: `tdd_plan.acceptance_criteria` in JSON
  - Each AC should map to a test in `unit_tests` or `integration_tests`

- [ ] **Every implementation step defines commands**
  - Check: `steps[].commands` in JSON
  - Commands should be exact, executable shell commands

- [ ] **Every step has expected results**
  - Check: `steps[].expected_final_result` in JSON
  - Should clearly state PASS/FAIL or other verifiable outcome

- [ ] **All impacted files are listed**
  - Check: `context.impacted_files` in JSON
  - Should include all files to be created or modified

- [ ] **Entry points are documented**
  - Check: `context.entry_points` in JSON
  - Should list primary functions/methods with file:line references

### Validation Commands

```bash
# Check JSON structure completeness
node -e "
const spec = require('./TDD_HANDOVER_SPEC.json');
const incomplete = [];

// Check ACs have tests
spec.tdd_plan.acceptance_criteria.forEach(ac => {
  const hasTest = spec.tdd_plan.unit_tests.some(t => t.name.includes(ac.id)) ||
                  spec.tdd_plan.integration_tests.some(t => t.name.includes(ac.id));
  if (!hasTest) incomplete.push('AC ' + ac.id + ' has no test');
});

// Check steps have commands
spec.steps.forEach(step => {
  if (!step.commands || step.commands.length === 0) {
    incomplete.push('Step ' + step.id + ' missing commands');
  }
  if (!step.expected_final_result) {
    incomplete.push('Step ' + step.id + ' missing expected_final_result');
  }
});

if (incomplete.length > 0) {
  console.log('INCOMPLETE:', incomplete.join(', '));
  process.exit(1);
} else {
  console.log('✅ Completeness check passed');
}
"
```

---

## 🎯 Quality Gate 2: Determinism

**Goal**: Ensure no ambiguity - every step produces clear PASS/FAIL

### Checklist

- [ ] **No ambiguous terms in step descriptions**
  - ❌ Avoid: "should work", "might need", "probably"
  - ✅ Use: "must pass", "will create", "verifies"

- [ ] **Expected results are specific**
  - ❌ Avoid: "Test passes", "Works correctly"
  - ✅ Use: "PASS (0 failures, 3 passed)", "Coverage ≥80%"

- [ ] **Commands are unambiguous**
  - ❌ Avoid: "Run tests", "Fix the code"
  - ✅ Use: "pytest tests/test_bug.py -v", "Edit api/pager.py line 42"

- [ ] **Acceptance criteria are binary (pass/fail)**
  - Each Gherkin scenario should have clear Then statements
  - Should be verifiable by automated test

- [ ] **No conditional language in steps**
  - ❌ Avoid: "If X, then do Y; otherwise Z"
  - ✅ Use: Separate steps for different paths

### Validation Pattern

```bash
# Check for ambiguous terms in JSON
grep -i "maybe\|might\|probably\|should work\|correct" TDD_HANDOVER_SPEC.json
# If output: FAIL (ambiguous terms found)
# If no output: PASS
```

### Common Ambiguous Terms to Replace

| ❌ Ambiguous | ✅ Deterministic |
|--------------|------------------|
| "should work correctly" | "PASS (all assertions succeed)" |
| "fix the bug" | "Change line 42: `end = start + size`" |
| "test passes" | "PASS (0 failures, 3 tests passed)" |
| "improve performance" | "Response time <200ms (was 450ms)" |
| "handle error" | "Return 400 with error message 'Invalid page'" |

---

## 🎯 Quality Gate 3: Context Tightness

**Goal**: Keep specifications concise for optimal LLM performance

### Checklist

- [ ] **Markdown briefing ≤2k tokens**
  - Research shows long prompts degrade TDD performance
  - Target: 1500-2000 tokens for optimal performance

- [ ] **JSON validates against schema**
  - Check: `templates/TDD_HANDOVER_SPEC.json` schema
  - All required fields present
  - No extra/invalid fields

- [ ] **No redundant information**
  - Briefing summarizes, JSON has details
  - Don't repeat full JSON content in Markdown

- [ ] **Context is packaged, not scattered**
  - All relevant info in handover spec
  - No dependencies on external docs (link to them, but summarize key points)

### Validation Commands

```bash
# Count tokens in Markdown briefing (approximate)
wc -w TDD_HANDOVER_SPEC.md
# Target: <2000 words (roughly equals <2000 tokens for English text)

# Validate JSON against schema
npm install -g ajv-cli
ajv validate -s templates/TDD_HANDOVER_SPEC.json -d TDD_HANDOVER_SPEC.json
# Should output: "valid"

# Check for redundancy (brief vs JSON)
# Manual review: Is information duplicated unnecessarily?
```

### Token Budget Guidelines

| Section | Target Tokens | Max Tokens |
|---------|---------------|------------|
| Problem statement | 50-100 | 150 |
| Run This First | 30-50 | 80 |
| Impact Summary | 100-150 | 200 |
| Primary Risks | 150-200 | 300 |
| Approach | 200-300 | 400 |
| Test Plan | 300-400 | 500 |
| Implementation Steps | 500-700 | 1000 |
| Done Criteria | 100-150 | 200 |
| **TOTAL** | **1500-2000** | **2500** |

---

## 🎯 Quality Gate 4: Testability

**Goal**: All acceptance criteria are verifiable by automated tests

### Checklist

- [ ] **Every acceptance criterion has automated test**
  - Check: Each AC in `tdd_plan.acceptance_criteria` maps to test
  - Manual verification: Can this be tested automatically?

- [ ] **Tests specify exact expected outcomes**
  - ❌ Avoid: "System works correctly"
  - ✅ Use: "Response contains items [1,2,3,4,5]"

- [ ] **Tests include setup/fixtures if needed**
  - Check: `unit_tests[].fixtures` and `integration_tests[].env`
  - Complex tests should document required setup

- [ ] **Edge cases have corresponding tests**
  - Empty datasets, boundary conditions, error cases
  - Each edge case should have a test

- [ ] **Coverage targets are measurable**
  - Check: `tdd_plan.coverage_targets.thresholds`
  - Should specify line % and branch %

### Test Coverage Validation

```bash
# After implementation, verify coverage meets targets
pytest --cov=<modules> --cov-report=term-missing
# Check output against: tdd_plan.coverage_targets.thresholds

# Verify all ACs have tests
node -e "
const spec = require('./TDD_HANDOVER_SPEC.json');
spec.tdd_plan.acceptance_criteria.forEach(ac => {
  console.log('AC ' + ac.id + ':', ac.gherkin.split('\\n')[0]);
  // Manually verify: Is there a test for this?
});
"
```

### Testability Red Flags

| ❌ Not Testable | ✅ Testable |
|------------------|-------------|
| "UI looks good" | "Button renders with text 'Submit'" |
| "Performance is acceptable" | "Response time <200ms" |
| "Code is maintainable" | "Cyclomatic complexity <10" |
| "Error handling works" | "Returns 400 with message 'Invalid input'" |

---

## 🎯 Quality Gate 5: Tool Awareness

**Goal**: All commands are executable with available tools

### Checklist

- [ ] **Commands use available tools**
  - Check: `tooling.test`, `tooling.build`, `tooling.lint_format`
  - Don't reference tools not in project

- [ ] **File paths are valid**
  - Check: `context.impacted_files` exist or are clearly marked as NEW
  - Paths should be relative to project root

- [ ] **Test framework commands are correct**
  - Python: `pytest`, not `unittest`
  - JavaScript: `npm test`, `jest`, `vitest`
  - Match project's actual test setup

- [ ] **Build commands match project setup**
  - Check `package.json` scripts or `Makefile`
  - Use actual commands from project

- [ ] **Linting/formatting tools are available**
  - Check project dependencies
  - Don't suggest ESLint if project uses TSLint, etc.

### Validation Commands

```bash
# Verify test command exists
npm run test --dry-run
# OR
pytest --version

# Verify lint command exists
npm run lint --dry-run
# OR
flake8 --version

# Verify build command exists
npm run build --dry-run

# Check all files in impacted_files exist or are marked NEW
node -e "
const spec = require('./TDD_HANDOVER_SPEC.json');
const fs = require('fs');
spec.context.impacted_files.forEach(file => {
  if (!fs.existsSync(file)) {
    const isNew = spec.steps.some(s => s.files_to_add && s.files_to_add.includes(file));
    if (!isNew) console.log('⚠️  File does not exist and not marked as NEW:', file);
  }
});
"
```

---

## 🎯 Quality Gate 6: Reflexion Pass

**Goal**: Self-critique has validated the plan

### Checklist

- [ ] **Self-review critique was performed**
  - Check planning output logs for Reflexion section
  - Should see "Critique Questions" and "Actions Taken"

- [ ] **Critique identified potential issues**
  - At minimum: ACs testable? Missing edge cases? Conflicts?
  - Should show adversarial thinking

- [ ] **Issues were addressed**
  - Check: Were risks added to spec?
  - Check: Were edge cases added to tests?
  - Check: Were conflicts resolved?

- [ ] **No unresolved critique items**
  - All "Action:" items should be completed
  - If critique found issues, spec should be updated

### Reflexion Validation Questions

Ask yourself (or have subagent ask):

1. **Completeness**:
   - Are all acceptance criteria testable?
   - Are edge cases covered?
   - Is error handling specified?

2. **Conflicts**:
   - Does this conflict with existing code patterns?
   - Are there version conflicts in dependencies?
   - Does this break backward compatibility?

3. **Risks**:
   - What could go wrong?
   - Are there performance implications?
   - Are there security concerns?

4. **Assumptions**:
   - What assumptions are being made?
   - Are they documented?
   - Have they been validated?

### Example Critique Output

```
Critique Questions:
✅ Are all ACs testable? YES - All have concrete assertions
✅ Missing edge cases? Added: empty dataset, large dataset (>1000 items)
✅ Conflicts? Checked dependencies, no version conflicts
⚠️  Performance impact? Large datasets not addressed
   → Action: Added risk + mitigation for pagination

Actions Taken:
- Added test: test_pagination_large_dataset (1000 items)
- Added risk: "Performance impact on large datasets - implement pagination if needed"
- Added coverage target: 90% for critical pagination logic
```

---

## 🎯 Quality Gate 7: Context7 Validation

**Goal**: All library usage follows current best practices

### Checklist

- [ ] **Context7 was queried for all relevant libraries**
  - Check planning logs for Context7 calls
  - Should see queries for React, Express, TypeScript, testing frameworks, etc.

- [ ] **Plan follows documented best practices**
  - Manual review: Do planned patterns match Context7 recommendations?
  - Examples: React hooks usage, Express middleware patterns, TypeScript types

- [ ] **No deprecated patterns**
  - Check Context7 docs for deprecation warnings
  - Plan should use current, supported APIs

- [ ] **Library versions are compatible**
  - Check package.json versions against Context7 docs
  - No breaking changes between documented version and project version

### Context7 Validation Pattern

```bash
# Review planning logs for Context7 usage
# Look for:
# - mcp__context7__resolve-library-id (library lookup)
# - mcp__context7__get-library-docs (documentation retrieval)

# Manually verify:
# 1. Were relevant libraries queried?
# 2. Do planned patterns match Context7 recommendations?
# 3. Are there deprecation warnings to address?
```

### Common Libraries to Validate

| Library | Best Practices to Check |
|---------|-------------------------|
| React | Hooks, functional components, Context API, memo usage |
| Express | Middleware patterns, async/await, error handling |
| TypeScript | Type definitions, strict mode, interface patterns |
| Testing (Vitest/Jest) | Test structure, mocking patterns, async tests |
| Playwright | Page object model, fixtures, assertions |

---

## ✅ Final Validation

### Pre-Handover Checklist

Before emitting TDD Handover Spec, ALL gates must pass:

- [ ] ✅ Quality Gate 1: Completeness
- [ ] ✅ Quality Gate 2: Determinism
- [ ] ✅ Quality Gate 3: Context Tightness
- [ ] ✅ Quality Gate 4: Testability
- [ ] ✅ Quality Gate 5: Tool Awareness
- [ ] ✅ Quality Gate 6: Reflexion Pass
- [ ] ✅ Quality Gate 7: Context7 Validation

### If Any Gate Fails

1. **Document the failure**: What specific check failed?
2. **Update the plan**: Address the specific issue
3. **Re-run validation**: Check the gate again
4. **Re-run dependent gates**: Some gates depend on others (e.g., Reflexion may catch issues in Completeness)

### Final Sign-Off

```
All quality gates passed: YES/NO

If YES:
  ✅ TDD Handover Spec ready for execution
  ✅ Emit TDD_HANDOVER_SPEC.json
  ✅ Emit TDD_HANDOVER_SPEC.md
  ✅ Display path to user

If NO:
  ❌ Block handover
  ❌ Document failing gates
  ❌ Update plan and re-validate
```

---

## 🛠️ Automated Validation Script

```bash
#!/bin/bash
# validate-handover-spec.sh
# Automates quality gate checks

set -e

echo "🔍 Validating TDD Handover Spec..."

# Gate 1: Completeness
echo "✓ Gate 1: Completeness"
node scripts/validate-completeness.js TDD_HANDOVER_SPEC.json

# Gate 2: Determinism
echo "✓ Gate 2: Determinism"
! grep -i "maybe\|might\|probably\|should work" TDD_HANDOVER_SPEC.json || {
  echo "❌ FAIL: Ambiguous terms found"
  exit 1
}

# Gate 3: Context Tightness
echo "✓ Gate 3: Context Tightness"
WORD_COUNT=$(wc -w < TDD_HANDOVER_SPEC.md)
if [ "$WORD_COUNT" -gt 2500 ]; then
  echo "⚠️  WARNING: Briefing has $WORD_COUNT words (target: <2000)"
fi

# JSON schema validation
ajv validate -s templates/TDD_HANDOVER_SPEC.json -d TDD_HANDOVER_SPEC.json

# Gate 4: Testability
echo "✓ Gate 4: Testability"
node scripts/validate-testability.js TDD_HANDOVER_SPEC.json

# Gate 5: Tool Awareness
echo "✓ Gate 5: Tool Awareness"
node scripts/validate-tool-awareness.js TDD_HANDOVER_SPEC.json

# Gate 6: Reflexion Pass
echo "✓ Gate 6: Reflexion Pass"
# Manual check: Review planning logs for Reflexion output

# Gate 7: Context7 Validation
echo "✓ Gate 7: Context7 Validation"
# Manual check: Review planning logs for Context7 usage

echo ""
echo "✅ All automated quality gates passed!"
echo "📋 Manual checks required:"
echo "   - Gate 6: Verify Reflexion critique in planning logs"
echo "   - Gate 7: Verify Context7 best practices followed"
```

---

## 📊 Quality Metrics

Track these metrics over time to improve planning quality:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Plans passing all gates on first attempt | ≥80% | Track pass rate |
| Average briefing token count | 1500-2000 | `wc -w TDD_HANDOVER_SPEC.md` |
| Time from planning to TDD execution | <30 min | Log timestamps |
| TDD implementation success rate | ≥90% | Track: spec → implementation → tests pass |
| Reflexion-caught issues per plan | 2-4 | Count "Actions Taken" in critique |

---

**Version**: 1.0.0 | **Last Updated**: 2025-01-25

**Usage**: Run this checklist during Phase C: Handover Preparation before emitting TDD Handover Spec
