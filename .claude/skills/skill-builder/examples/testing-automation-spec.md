# Example Skill Specification: Comprehensive Testing Automation

**Complexity Level**: Complex (45-60 minutes to implement)

This example demonstrates a sophisticated skill with multiple subagents, templates, hooks, and comprehensive testing coverage.

---

## Skill Identity

**Name**: Comprehensive Testing Automation

**Purpose**: Generate unit tests, integration tests, and E2E tests for React components with automatic test coverage analysis and gap identification

**Version**: 1.0.0

---

## Activation Triggers

The skill should activate when:
- User creates new React component without tests
- User says "generate tests" or "add test coverage"
- User asks "what's not tested?" or "analyze coverage"
- After major refactoring (proactive test update)
- User explicitly requests test generation

The skill should NOT activate when:
- Tests already exist with >80% coverage
- User is still actively developing component
- Component is trivial (<10 lines)

---

## Target Users

- React developers (all levels)
- QA engineers
- Teams adopting TDD or increasing test coverage

**Expertise Level**: Beginner to Advanced

---

## Core Capabilities

### Must Have (MVP)
1. **Unit Test Generation**: Create Vitest tests for components
   - Component rendering tests
   - Props validation tests
   - Event handler tests
   - Hook behavior tests
   - Edge case coverage

2. **Integration Test Generation**: Create tests for component interactions
   - Parent-child component interactions
   - Context provider tests
   - API integration tests
   - State management tests

3. **E2E Test Generation**: Create Playwright tests for user flows
   - Complete user journeys
   - Multi-step interactions
   - Form submissions
   - Navigation flows

4. **Coverage Analysis**: Analyze test coverage gaps
   - Identify untested code paths
   - Calculate coverage percentages
   - Highlight critical untested functions
   - Suggest additional test cases

5. **Test Report**: Generate comprehensive test documentation
   - Tests created summary
   - Coverage improvements
   - Remaining gaps
   - Next steps recommendations

### Nice to Have (Future)
- Test maintenance mode (update existing tests)
- Visual regression testing
- Performance testing generation
- Accessibility testing integration
- Custom test templates per team

---

## Tool Requirements

**Required Tools**:
- `Read`: Read component files and existing tests
- `Write`: Write test files
- `Glob`: Find components and test files
- `Grep`: Search for test patterns
- `Bash`: Run test commands and coverage reports
- `Task`: Launch multiple subagents in parallel

**MCP Integrations**:
- **Context7**: Query React Testing Library and Playwright best practices
- **Sequential Thinking**: Plan test strategies and synthesize coverage analysis
- **Playwright**: Execute E2E tests for validation

**External Dependencies**:
- Vitest (unit/integration tests)
- React Testing Library
- Playwright (E2E tests)
- Coverage tools (c8 or Istanbul)

---

## Safety & Security Considerations

### Safety Requirements
- **Never overwrite existing tests** without explicit confirmation
- **Preview tests** before writing files
- **Run tests** after generation to verify they pass
- **Rollback** if generated tests fail compilation

### Prohibited Operations
- Never delete existing tests
- Never modify component code
- Never commit untested changes
- Never generate tests that import production secrets

---

## Subagents

### Subagent 1: unit-test-generator

**Purpose**: Generate Vitest unit tests for React components

**Responsibilities**:
- Analyze component structure (props, state, hooks)
- Generate component rendering tests
- Create props validation tests
- Test event handlers
- Cover edge cases
- Generate snapshot tests (if appropriate)

**Tools Needed**: Read, Write

**Input Format**:
```json
{
  "component_path": "src/components/Button.tsx",
  "test_depth": "comprehensive",
  "include_snapshots": true,
  "mock_dependencies": ["api", "router"]
}
```

**Output Format**:
```json
{
  "test_file_path": "tests/components/Button.spec.tsx",
  "test_content": "[Full test file content]",
  "tests_generated": 12,
  "coverage_estimate": 95
}
```

### Subagent 2: integration-test-generator

**Purpose**: Generate integration tests for component interactions

**Responsibilities**:
- Identify parent-child relationships
- Test context provider interactions
- Test API integration points
- Generate multi-component tests
- Test state management flows

**Tools Needed**: Read, Write, Grep

**Input Format**:
```json
{
  "component_path": "src/components/Dashboard.tsx",
  "related_components": ["Header", "Sidebar", "Content"],
  "api_endpoints": ["/api/data", "/api/user"],
  "test_scenarios": ["data-loading", "user-interaction"]
}
```

**Output Format**:
```json
{
  "test_file_path": "tests/integration/Dashboard.integration.spec.tsx",
  "test_content": "[Full test file content]",
  "scenarios_covered": 8,
  "dependencies_mocked": ["api", "auth"]
}
```

### Subagent 3: e2e-test-generator

**Purpose**: Generate Playwright E2E tests for user flows

**Responsibilities**:
- Map user journeys through application
- Generate navigation tests
- Create form submission tests
- Test multi-step interactions
- Add accessibility checks
- Generate visual regression tests

**Tools Needed**: Read, Write, Playwright

**Input Format**:
```json
{
  "user_flow": "login-to-dashboard",
  "start_url": "/login",
  "steps": [
    "fill login form",
    "submit",
    "verify redirect to /dashboard",
    "check dashboard loaded"
  ],
  "assertions": ["user-info-visible", "dashboard-data-loaded"]
}
```

**Output Format**:
```json
{
  "test_file_path": "tests/e2e/login-flow.spec.ts",
  "test_content": "[Full Playwright test content]",
  "user_flows_covered": 3,
  "accessibility_checks": true
}
```

### Subagent 4: coverage-analyzer

**Purpose**: Analyze test coverage and identify gaps

**Responsibilities**:
- Run coverage reports
- Parse coverage data
- Identify untested functions
- Identify untested branches
- Calculate coverage percentages
- Prioritize gaps by criticality
- Suggest specific test cases for gaps

**Tools Needed**: Read, Bash, Grep

**Input Format**:
```json
{
  "component_path": "src/components/Dashboard.tsx",
  "existing_tests": ["tests/components/Dashboard.spec.tsx"],
  "coverage_threshold": 80
}
```

**Output Format**:
```json
{
  "overall_coverage": 72,
  "line_coverage": 75,
  "branch_coverage": 68,
  "function_coverage": 80,
  "untested_functions": ["handleEdgeCase", "formatData"],
  "untested_branches": [
    {
      "line": 42,
      "condition": "if (user.role === 'admin')",
      "missing_branch": "admin role"
    }
  ],
  "suggested_tests": [
    "Test handleEdgeCase with invalid input",
    "Test admin role branch in render"
  ],
  "critical_gaps": ["Error handling not tested"]
}
```

---

## Templates & Examples

### Template 1: Unit Test Template

**File**: `templates/UNIT_TEST_TEMPLATE.spec.tsx`

**Purpose**: Standard structure for Vitest component tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { [ComponentName] } from '@/components/[ComponentName]';

describe('[ComponentName]', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<[ComponentName] />);
      // assertions
    });

    it('should render with custom props', () => {
      // test custom props
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', () => {
      // test click handling
    });

    it('should handle form submissions', () => {
      // test form submission
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined props', () => {
      // test edge cases
    });

    it('should handle error states', () => {
      // test error handling
    });
  });
});
```

### Template 2: Integration Test Template

**File**: `templates/INTEGRATION_TEST_TEMPLATE.spec.tsx`

**Purpose**: Multi-component interaction tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { [ParentComponent] } from '@/components/[ParentComponent]';
import { mockAPI } from '@/tests/mocks/api';

describe('[ParentComponent] Integration', () => {
  beforeEach(() => {
    mockAPI.reset();
  });

  it('should load and display data from API', async () => {
    mockAPI.getData.mockResolvedValue({ data: [...] });
    render(<[ParentComponent] />);
    await waitFor(() => {
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockAPI.getData.mockRejectedValue(new Error('Failed'));
    render(<[ParentComponent] />);
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });
});
```

### Template 3: E2E Test Template

**File**: `templates/E2E_TEST_TEMPLATE.spec.ts`

**Purpose**: Playwright user journey tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('[User Flow Name]', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/start-url');
  });

  test('should complete [user goal]', async ({ page }) => {
    // Step 1: [action]
    await page.fill('[selector]', 'value');

    // Step 2: [action]
    await page.click('[selector]');

    // Step 3: [verification]
    await expect(page.locator('[selector]')).toBeVisible();

    // Step 4: [final check]
    await expect(page).toHaveURL('/expected-url');
  });

  test('should handle errors in [flow step]', async ({ page }) => {
    // Error scenario test
  });
});
```

### Template 4: Test Report Template

**File**: `templates/TEST_REPORT.md`

**Purpose**: Summary of testing work done

```markdown
# Testing Automation Report

**Component**: [Component Name]
**Generated**: [Date/Time]
**Coverage Before**: [X]%
**Coverage After**: [Y]%
**Improvement**: +[Z]%

## Tests Generated

### Unit Tests ([N] tests)
- [Test file 1] ([M] tests)
  - Rendering: [X] tests
  - Interactions: [Y] tests
  - Edge cases: [Z] tests

### Integration Tests ([N] tests)
- [Test file 1] ([M] tests)
  - Component interactions: [X] tests
  - API integration: [Y] tests

### E2E Tests ([N] flows)
- [Flow 1]: [description]
- [Flow 2]: [description]

## Coverage Analysis

**Overall**: [X]% → [Y]%
**Lines**: [X]% → [Y]%
**Branches**: [X]% → [Y]%
**Functions**: [X]% → [Y]%

## Remaining Gaps

Critical (High Priority):
- [ ] [Gap 1 with line number]
- [ ] [Gap 2 with line number]

Minor (Low Priority):
- [ ] [Gap 3]

## Next Steps

1. Run all tests: `npm test`
2. Review generated tests
3. Add edge cases for critical gaps
4. Update tests as component evolves
```

---

## Documentation Requirements

### README.md (Comprehensive)
- Overview of testing automation
- Installation and setup
- How to generate tests for components
- Understanding generated tests
- Coverage analysis interpretation
- Customization options
- Integration with CI/CD
- Troubleshooting

### QUICK_REFERENCE.md
- Command patterns
- Subagent summary
- Template reference
- Coverage threshold guide

### USAGE_EXAMPLES.md
- Example 1: Generate tests for new component
- Example 2: Increase coverage for existing component
- Example 3: Generate E2E tests for user flow
- Example 4: Batch test generation for directory
- Example 5: Coverage analysis and gap filling

### CHECKLIST.md
- Pre-generation verification
- Post-generation validation
- Test quality checks
- Coverage goal verification

---

## Integration Requirements

### Other Skills
- Works with React Code Reviewer (run review before tests)
- Works with Git Commit Helper (include test summary)
- Works with Deployment skill (run tests before deploy)

### MCP Servers
- **Context7**: For React Testing Library and Playwright best practices
- **Sequential Thinking**: For test strategy planning and gap analysis
- **Playwright**: For E2E test execution and validation

### Hooks

**PostToolUse Hook** (after Write):
```json
{
  "matcher": "Write",
  "hooks": [{
    "type": "command",
    "command": "bash $CLAUDE_PROJECT_DIR/.claude/skills/testing-automation/scripts/validate-tests.sh",
    "timeout": 60
  }]
}
```

**Purpose**: Automatically run generated tests to verify they compile and pass

---

## Scripts

### Script 1: validate-tests.sh

**Purpose**: Validate generated tests compile and run

```bash
#!/bin/bash
# Run after generating tests to verify they work

# Check if test file was just created
LAST_TEST=$(git diff --name-only | grep "\.spec\.")

if [ -n "$LAST_TEST" ]; then
  echo "Validating test: $LAST_TEST"
  npm run test -- "$LAST_TEST"
fi
```

### Script 2: coverage-report.sh

**Purpose**: Generate and parse coverage reports

```bash
#!/bin/bash
# Generate coverage report and extract metrics

npm run test:coverage -- "$1"
# Parse coverage/coverage-summary.json
# Extract line, branch, function coverage percentages
```

---

## Testing Strategy (For the Skill Itself)

### Basic Functionality Tests
1. Generate unit tests for simple component → Tests created and pass
2. Generate integration tests → Tests created and pass
3. Generate E2E tests → Tests created and pass
4. Run coverage analysis → Accurate coverage report

### Edge Cases
1. Component with no props
2. Component with complex TypeScript types
3. Component with external API calls
4. Component with no existing tests vs component with tests
5. Very large component (>500 lines)

### Integration Tests
1. All 4 subagents activate correctly
2. Subagents run in parallel
3. Coverage analyzer produces accurate results
4. Generated tests integrate with existing test suite

---

## Success Metrics

The skill is successful if:
- Generated tests compile without errors (100%)
- Generated tests pass on first run (>90%)
- Coverage increases by at least 30% per component
- Generated tests follow project conventions
- E2E tests capture complete user flows
- Developers accept 80%+ of generated tests without modification
- Test generation takes <5 minutes per component

---

## Example User Interactions

### Example 1: New Component

**User Request**: "Generate comprehensive tests for src/components/UserProfile.tsx"

**Expected Skill Behavior**:
1. Use Sequential Thinking to plan test strategy
2. Use Context7 to get React Testing Library best practices
3. Read UserProfile.tsx and analyze structure
4. Launch all 3 test generator subagents in parallel:
   - unit-test-generator for UserProfile
   - integration-test-generator for UserProfile interactions
   - e2e-test-generator for profile viewing flow
5. Wait for all subagents to complete
6. Collect generated test files
7. Write test files to appropriate locations
8. PostToolUse hook: Run tests to verify they pass
9. Launch coverage-analyzer subagent
10. Generate test report using template
11. Present summary to user with coverage improvement

**Expected Output**:
```
Testing Automation Complete for UserProfile.tsx

Tests Generated:
✓ Unit Tests: tests/components/UserProfile.spec.tsx (18 tests)
✓ Integration Tests: tests/integration/UserProfile.integration.spec.tsx (6 tests)
✓ E2E Tests: tests/e2e/profile-viewing.spec.ts (3 user flows)

Coverage Improvement:
  Before: 0%
  After: 87%
  Lines: 245/280 covered
  Branches: 32/38 covered
  Functions: 18/20 covered

Remaining Gaps (3):
  High Priority:
    - Line 142: Error handling for API failure (no test)
    - Line 89: Admin-only feature branch (no test)

  Low Priority:
    - Line 210: Edge case for null avatar (minor)

All generated tests passed ✓

Next Steps:
  1. Review generated tests: git diff tests/
  2. Add tests for 2 high-priority gaps
  3. Run full test suite: npm test
```

### Example 2: Coverage Analysis

**User Request**: "What's not tested in src/components/Dashboard.tsx?"

**Expected Skill Behavior**:
1. Find existing tests for Dashboard
2. Run coverage analysis
3. Launch coverage-analyzer subagent
4. Analyze coverage report
5. Identify specific untested lines and branches
6. Suggest concrete test cases for gaps
7. Offer to generate missing tests

**Expected Output**:
```
Coverage Analysis for Dashboard.tsx

Current Coverage: 64%
  Lines: 180/280 (64%)
  Branches: 18/32 (56%)
  Functions: 12/15 (80%)

Critical Untested Areas:

1. Error Handling (Lines 89-95):
   - API error responses not tested
   - Suggested test: "should display error message when API fails"

2. Admin Features (Lines 142-156):
   - Admin-only dashboard sections not tested
   - Suggested test: "should show admin panel when user role is admin"

3. Edge Cases (Lines 210-220):
   - Empty data state not tested
   - Suggested test: "should show empty state when no data available"

Would you like me to generate tests for these gaps? (y/n)
```

---

## Workflow Diagram

```
User Request: "Generate tests for Component X"
    ↓
Sequential Thinking: Plan test strategy
    ↓
Context7: Get testing best practices
    ↓
Read Component X: Analyze structure
    ↓
Parallel Launch (Task tool):
  ├─ unit-test-generator (analyze props, hooks, events)
  ├─ integration-test-generator (analyze interactions, API)
  └─ e2e-test-generator (map user flows)
    ↓
Wait for all subagents to complete
    ↓
Collect generated test files
    ↓
Write test files
    ↓
PostToolUse Hook: Run tests to validate
    ↓
Launch coverage-analyzer subagent
    ↓
Analyze coverage improvements and gaps
    ↓
Generate test report (use template)
    ↓
Present summary to user
    ↓
Offer to generate tests for remaining gaps
```

---

## Notes

- Complex skill with 4 subagents
- Requires Context7, Sequential Thinking, and Playwright MCP
- Uses PostToolUse hook for automatic validation
- Should take 45-60 minutes to implement with Skill Builder
- Most comprehensive example of skill capabilities
- Good template for building other automation skills

---

## Implementation Considerations

### Parallel Execution
Use Task tool to launch all 3 test generators in parallel:
- Speeds up generation significantly
- Each subagent is independent
- Main skill waits for all to complete

### Context7 Integration
- Query once at start for best practices
- Share results with all subagents via input
- Cache for batch test generation

### Coverage Analysis
- Run after generating tests
- Parse JSON coverage reports
- Identify specific untested lines (not just percentages)

### Quality Assurance
- PostToolUse hook validates tests compile
- Run tests immediately after generation
- Report any failures clearly
- Offer to fix or regenerate

---

**How to Use This Spec**:

```
Using Skill Builder, create a Comprehensive Testing Automation skill from this specification:
[Paste this entire document]
```

Or break it down:

```
Using Skill Builder, create a testing skill with these capabilities:
1. Generate unit tests with Vitest
2. Generate integration tests
3. Generate E2E tests with Playwright
4. Analyze coverage and suggest missing tests

Follow the specification in examples/testing-automation-spec.md
```

---

**Version**: 1.0.0 | **Last Updated**: 2025-10-19
