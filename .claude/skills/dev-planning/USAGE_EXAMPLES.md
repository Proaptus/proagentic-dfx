# Dev Planning Skill - Usage Examples

> **Detailed examples showing complete input → planning process → output**

## Table of Contents

1. [Example 1: Bug Fix - Pagination Duplication](#example-1-bug-fix---pagination-duplication)
2. [Example 2: Feature - Metrics Dashboard](#example-2-feature---metrics-dashboard)
3. [Example 3: Refactoring - Authentication Patterns](#example-3-refactoring---authentication-patterns)

---

## Example 1: Bug Fix - Pagination Duplication

### User Request

```
User: "Fix bug where pagination repeats the last item from page N as the first item on page N+1.
The issue happens when we have 51 items and page size is 10."
```

### Planning Process

#### Phase A: Intake & Grounding

**Sequential Thinking (Decomposition)**:
```
Thought 1/3: Understand the pagination bug
- Symptom: Last item of page N appears as first item of page N+1
- Trigger: Happens with 51 items, page size 10 (boundary condition)
- Likely cause: Off-by-one error in slicing logic
- Impact: User-facing, data integrity issue
```

**Repo Analysis**:
```bash
# Find pagination code
grep -r "def page\|function page\|paginate" --include="*.py" --include="*.js" --include="*.ts"

# Results:
# - api/pager.py:42 - Paginator.page() method
# - ui/components/PaginationControl.tsx - UI component
# - tests/api/test_pager.py - Existing pagination tests
```

**Context7 Baseline**:
```
Query: Express pagination patterns, Python slicing best practices

Best Practices:
- Use zero-indexed slicing: items[start:end]
- Formula: start = (page - 1) * page_size, end = start + page_size
- Validate: end should not exceed total items
- Edge cases: empty dataset, last page with fewer items
```

#### Phase B: Plan the Work

**Sequential Thinking (Strategy)**:
```
Thought 2/3: Design test-first approach
- Step 1: Create Fail-to-Pass reproduction test (must FAIL initially)
- Step 2: Apply minimal fix to slicing logic
- Step 3: Add unit tests for edge cases
- Step 4: Verify coverage ≥80% on changed code

Dependencies: Step 2 depends on Step 1 (need failing test first)
Parallelization: Steps 3-4 can be done together
```

**Test Design**:
```gherkin
Feature: Pagination boundary handling
  Scenario: No duplicate items across page boundaries (FAIL→PASS)
    Given a dataset with 51 items (IDs 1-51)
    And page size is 10
    When I request page 1
    Then I should see exactly items [1,2,3,4,5,6,7,8,9,10]
    When I request page 2
    Then I should see exactly items [11,12,13,14,15,16,17,18,19,20]
    And there should be no items in common between page 1 and page 2

Unit Tests:
- test_pagination_no_duplicates (target: api.pager.Paginator.page)
- test_pagination_empty_dataset (edge case)
- test_pagination_last_page_partial (edge case)
```

**Action Sequence**:
```
S1: Create failing reproduction test
    Files: tests/api/test_pagination_bug_123.py (NEW)
    Command: pytest tests/api/test_pagination_bug_123.py::test_repro -v
    Expected Initial: FAIL (AssertionError: Item 10 found in both pages)
    Expected Final: PASS

S2: Apply minimal fix to slicing logic
    Files: api/pager.py (EDIT line 42)
    Command: pytest tests/api/test_pagination_bug_123.py -v
    Expected Initial: FAIL (from S1)
    Expected Final: PASS

S3: Add unit tests for edge cases
    Files: tests/api/test_pager.py (EDIT)
    Command: pytest tests/api/test_pager.py -v
    Expected Initial: Some tests may not exist
    Expected Final: All tests PASS

S4: Verify coverage
    Command: pytest --cov=api/pager --cov-report=term-missing
    Expected Initial: Coverage may be <80%
    Expected Final: Coverage ≥80% line, ≥70% branch
```

#### Phase C: Handover Preparation

**Context Packaging** (Briefing excerpt):
```markdown
# Problem
Pagination repeats the last item from page N as the first item on page N+1 when
dataset has 51 items and page size is 10 (off-by-one boundary error).

# Run This First
```bash
pytest tests/api/test_pagination_bug_123.py::test_repro -v
```
Expected: FAIL (proves bug exists)

# Impact Summary
- Type: bugfix
- Impacted Files:
  - Primary: api/pager.py (line 42)
  - Tests: tests/api/test_pagination_bug_123.py (new), tests/api/test_pager.py (edit)
```

**Self-Review (Reflexion Critique)**:
```
Critique Questions:
✅ Are all ACs testable? YES - Specific item IDs, verifiable by assertion
✅ Missing edge cases? Added empty dataset, partial last page
✅ Conflicts with existing code? Checked existing tests, no conflicts
✅ Performance impact? None - same O(1) slicing operation
✅ Rollback plan clear? YES - git revert or restore from main

Action: Spec approved, no changes needed
```

**Quality Gates**:
```
✅ Completeness: 4 steps, all have commands and expected results
✅ Determinism: Clear PASS/FAIL for each step
✅ Context Tightness: Briefing 487 tokens (under 2k)
✅ Testability: All ACs have pytest assertions
✅ Tool Awareness: pytest commands are executable
✅ Reflexion Pass: Critique completed, no issues
✅ Context7 Validation: Slicing follows Python best practices

RESULT: All gates pass → Emit handover spec
```

### Output Files

#### TDD_HANDOVER_SPEC.json (excerpt)

```json
{
  "meta": {
    "task_id": "bug-123-pagination-duplicates",
    "repo": "proagentic",
    "commit": "abc123def456",
    "created_at": "2025-01-25T10:30:00Z"
  },
  "goal": {
    "type": "bugfix",
    "summary": "Fix off-by-one error in pagination causing item duplication at page boundaries",
    "scope": [
      "Fix slicing logic in api/pager.py",
      "Add reproduction test",
      "Add unit tests for edge cases"
    ],
    "non_goals": [
      "Performance optimization",
      "UI redesign"
    ],
    "constraints": [
      "Backward compatible",
      "Response time <200ms"
    ]
  },
  "context": {
    "entry_points": [
      "api/pager.py:42 - Paginator.page()"
    ],
    "impacted_files": [
      "api/pager.py",
      "tests/api/test_pager.py",
      "tests/api/test_pagination_bug_123.py"
    ],
    "key_invariants": [
      "Page numbers are 1-indexed",
      "No item appears on multiple pages",
      "Empty dataset returns empty list, not error"
    ]
  },
  "tdd_plan": {
    "acceptance_criteria": [
      {
        "id": "AC1",
        "gherkin": "Feature: Pagination\n  Scenario: No duplicates across boundaries\n    Given a dataset of 51 items\n    When I request page 1 and page 2\n    Then no items should appear on both pages"
      }
    ],
    "unit_tests": [
      {
        "name": "test_pagination_no_duplicates",
        "target": "api.pager.Paginator.page",
        "cases": ["51 items / 10 per page", "100 items / 10 per page", "11 items / 10 per page"]
      },
      {
        "name": "test_pagination_empty_dataset",
        "target": "api.pager.Paginator.page",
        "cases": ["Empty list returns empty page"]
      }
    ],
    "coverage_targets": {
      "globs": ["api/pager.py"],
      "thresholds": {"line": 80, "branch": 70}
    }
  },
  "steps": [
    {
      "id": "S1",
      "intent": "Create failing reproduction test",
      "files_to_add": ["tests/api/test_pagination_bug_123.py"],
      "commands": ["pytest tests/api/test_pagination_bug_123.py::test_repro -v"],
      "expected_initial_result": "Test does not exist yet",
      "expected_final_result": "FAIL (AssertionError: Item 10 found in both pages)",
      "notes": "Use dataset with 51 items to trigger boundary condition"
    },
    {
      "id": "S2",
      "intent": "Apply minimal fix to slicing logic",
      "files_to_edit": ["api/pager.py"],
      "commands": ["pytest tests/api/test_pagination_bug_123.py -v"],
      "expected_initial_result": "FAIL (from S1)",
      "expected_final_result": "PASS",
      "notes": "Change line 42: end = start + page_size (was: end = start + page_size + 1)"
    },
    {
      "id": "S3",
      "intent": "Add unit tests for edge cases",
      "files_to_edit": ["tests/api/test_pager.py"],
      "commands": ["pytest tests/api/test_pager.py -v"],
      "expected_initial_result": "Existing tests pass, new tests don't exist",
      "expected_final_result": "All tests PASS (including new edge case tests)",
      "notes": "Add test_pagination_empty_dataset, test_pagination_last_page_partial"
    },
    {
      "id": "S4",
      "intent": "Verify coverage meets threshold",
      "commands": ["pytest --cov=api/pager --cov-report=term-missing"],
      "expected_initial_result": "Coverage may be <80%",
      "expected_final_result": "Coverage ≥80% line, ≥70% branch",
      "notes": "Focus on pager.py changed lines"
    }
  ],
  "tooling": {
    "language": "python",
    "test": ["pytest", "pytest --cov"],
    "lint_format": ["flake8", "black"]
  },
  "risks": [
    "Breaking change if existing code depends on buggy behavior - Check all usages",
    "Performance impact on large datasets - Add benchmark test if needed"
  ],
  "rollback": "git revert <commit-hash> OR git checkout main -- api/pager.py",
  "done_definition": [
    "All acceptance criteria pass (AC1)",
    "Unit tests pass (3 tests)",
    "Coverage ≥80% line, ≥70% branch on api/pager.py",
    "Linting clean (flake8)",
    "No performance regression"
  ]
}
```

#### TDD_HANDOVER_SPEC.md (excerpt)

```markdown
# TDD Handover Spec: Fix Pagination Duplication Bug

> **Generated**: 2025-01-25T10:30:00Z
> **Task ID**: bug-123-pagination-duplicates

## Problem

Pagination repeats the last item from page N as the first item on page N+1
when dataset has 51 items and page size is 10 (off-by-one boundary error).

## Run This First

```bash
pytest tests/api/test_pagination_bug_123.py::test_repro -v
```

**Expected**: `FAIL` (proves bug exists - item 10 appears on both pages)

## Implementation Steps

### Step 1: Create failing reproduction test
- **Command**: `pytest tests/api/test_pagination_bug_123.py::test_repro -v`
- **Files**: CREATE `tests/api/test_pagination_bug_123.py`
- **Expected Initial**: Test does not exist yet
- **Expected Final**: FAIL (AssertionError: Item 10 found in both pages)
- **Notes**: Use dataset with 51 items to trigger boundary condition

### Step 2: Apply minimal fix to slicing logic
- **Command**: `pytest tests/api/test_pagination_bug_123.py -v`
- **Files**: EDIT `api/pager.py` (line 42)
- **Expected Initial**: FAIL (from Step 1)
- **Expected Final**: PASS
- **Notes**: Change: `end = start + page_size` (was: `end = start + page_size + 1`)

### Step 3: Add unit tests for edge cases
- **Command**: `pytest tests/api/test_pager.py -v`
- **Files**: EDIT `tests/api/test_pager.py`
- **Expected Initial**: Existing tests pass, new tests don't exist
- **Expected Final**: All tests PASS
- **Notes**: Add `test_pagination_empty_dataset`, `test_pagination_last_page_partial`

### Step 4: Verify coverage
- **Command**: `pytest --cov=api/pager --cov-report=term-missing`
- **Expected Initial**: Coverage may be <80%
- **Expected Final**: Coverage ≥80% line, ≥70% branch

## Done Criteria

- [ ] AC1 passes (no duplicates across pages)
- [ ] Unit tests pass (3 tests)
- [ ] Coverage ≥80% line, ≥70% branch on `api/pager.py`
- [ ] Linting clean (`flake8`)
- [ ] No performance regression
```

---

## Example 2: Feature - Metrics Dashboard

### User Request

```
User: "Implement a metrics dashboard showing usage statistics over the last 30 days.
Include line charts for API calls, projects created, and tasks completed.
Users should be able to export data to CSV."
```

### Planning Process

#### Phase A: Intake & Grounding

**Sequential Thinking**:
```
Thought 1/4: Understand metrics dashboard requirements
- Primary feature: Visualize 30-day usage trends
- Metrics: API calls, projects created, tasks completed
- UI: Line charts (likely React + charting library)
- Export: CSV download functionality
- Data source: Need to query user activity logs
```

**Repo Analysis**:
```bash
# Find existing dashboard patterns
grep -r "Dashboard\|dashboard" src/components/

# Find charting library usage
grep -r "chart\|Chart" package.json src/

# Find data services
grep -r "getMetrics\|getUsage\|getStats" src/services/

# Results:
# - src/components/dashboards/ - Existing dashboard components
# - package.json: recharts@2.5.0 (already installed)
# - src/services/apiClient.ts - API client base
# - server/routes/ - Backend API routes
```

**Context7 Baseline**:
```
Query 1: React recharts best practices
- Use ResponsiveContainer for responsive charts
- Memoize data transformations to avoid re-renders
- Use React.memo for chart components
- Handle loading and error states

Query 2: Express metrics API patterns
- Use aggregation for time-series data
- Implement caching for expensive queries
- Return consistent date formats (ISO-8601)
- Add pagination for large datasets
```

#### Phase B: Plan the Work

**Sequential Thinking (Strategy)**:
```
Thought 2/4: Design test-first architecture
- Layer 1: Database queries (tests: mock DB, verify aggregation)
- Layer 2: API endpoints (tests: integration tests with test DB)
- Layer 3: Frontend data service (tests: mock API, verify transformations)
- Layer 4: UI components (tests: React Testing Library, mock data)
- Layer 5: CSV export (tests: verify format, content)

Dependencies:
- Layer 2 depends on Layer 1
- Layer 3 depends on Layer 2
- Layer 4 depends on Layer 3
- Layer 5 can be parallel with Layer 4

Parallelization: Layers 1-2 sequential, Layer 3 after Layer 2, Layers 4-5 parallel
```

**Test Design**:
```gherkin
Feature: Usage Metrics Dashboard

Scenario: View 30-day metrics (AC1)
  Given I am logged into ProAgentic
  And I have recorded activity over 30 days
  When I navigate to the Metrics Dashboard
  Then I should see three line charts:
    | Chart Name      | Data Points |
    | API Calls       | 30          |
    | Projects        | 30          |
    | Tasks           | 30          |
  And each chart should show dates on X-axis
  And each chart should show counts on Y-axis

Scenario: Export metrics to CSV (AC2)
  Given I am viewing the Metrics Dashboard
  And I have data for the last 30 days
  When I click the "Export CSV" button
  Then a file named "usage-metrics-YYYY-MM-DD.csv" should download
  And the CSV should contain 30 rows plus headers
  And the CSV should have columns: date, api_calls, projects_created, tasks_completed

Scenario: Empty metrics state (AC3 - Edge Case)
  Given I am a new user with no activity
  When I navigate to the Metrics Dashboard
  Then I should see a message "No activity data yet"
  And I should see placeholder charts with zero values

Unit Tests:
- test_get_user_metrics_aggregation (backend)
- test_metrics_api_endpoint (backend integration)
- test_fetch_metrics_service (frontend)
- test_transform_metrics_data (frontend)
- test_metrics_chart_component (frontend)
- test_csv_export_format (frontend)

Integration Tests:
- test_metrics_dashboard_end_to_end (Playwright)
- test_metrics_api_with_real_data (backend)
```

**Action Sequence**:
```
S1: Design acceptance tests (Gherkin + Playwright)
S2: Create backend database query function + tests
S3: Create backend API endpoint + tests
S4: Create frontend metrics service + tests
S5: Create frontend chart components + tests
S6: Create CSV export functionality + tests
S7: Integration testing (full flow)
S8: Verify coverage ≥80% on all new code
```

#### Phase C: Handover Preparation

**Context Packaging** (Briefing excerpt):
```markdown
# Problem
Implement metrics dashboard showing 30-day usage trends (API calls, projects, tasks)
with line charts and CSV export functionality.

# Run This First
```bash
# Create acceptance test (should FAIL - feature doesn't exist)
npm test tests/features/metrics-dashboard.test.tsx
```

# Impact Summary
- Type: feature
- Files Changed: 12 files
  - Backend: server/routes/metrics.js, server/services/metricsService.js (NEW)
  - Frontend: src/components/dashboards/MetricsDashboard.tsx (NEW)
  - Frontend: src/services/metricsService.ts (NEW)
  - Tests: 6 new test files
- Lines of Code: ~450 LOC
```

**Self-Review (Reflexion)**:
```
Critique Questions:
✅ Are all ACs testable? YES - Specific chart counts, CSV format verifiable
✅ Missing edge cases? Added: empty data state, error handling, date range edge cases
⚠️  Performance consideration: Large datasets (>1000 days) not addressed
   → Action: Add note in risks about pagination for historical data
✅ Security: CSV export could expose sensitive data
   → Action: Add authentication check to API endpoint
✅ Conflicts: Recharts already in package.json, no version conflicts

Actions Taken:
- Added risk: "Large historical datasets may cause performance issues"
- Added constraint: "API endpoint must verify user owns requested data"
- Updated S3 to include authentication middleware
```

**Quality Gates**:
```
✅ Completeness: 8 steps, all have commands and expected results
✅ Determinism: Clear PASS/FAIL for each step
✅ Context Tightness: Briefing 1,847 tokens (under 2k)
✅ Testability: All ACs have Playwright/Jest assertions
✅ Tool Awareness: npm test, Playwright commands are executable
✅ Reflexion Pass: Critique completed, security and performance risks added
✅ Context7 Validation: React + Recharts patterns follow best practices

RESULT: All gates pass → Emit handover spec
```

### Output Summary

**TDD_HANDOVER_SPEC.json**: 12 files impacted, 8 implementation steps, 3 acceptance criteria, 6 unit tests, 2 integration tests

**TDD_HANDOVER_SPEC.md**: Detailed step-by-step guide with specific commands and expected results for each phase

**Key Sections**:
- Database aggregation query design
- API endpoint with authentication
- Frontend service with React hooks
- Chart components using Recharts + React.memo
- CSV export using browser download API
- End-to-end Playwright test

---

## Example 3: Refactoring - Authentication Patterns

### User Request

```
User: "Refactor authentication code to use modern React patterns.
Current code uses class components and legacy context API.
Convert to functional components with hooks and modern Context API."
```

### Planning Process

#### Phase A: Intake & Grounding

**Sequential Thinking**:
```
Thought 1/4: Understand refactoring scope
- Current state: Class components, legacy Context API
- Target state: Functional components, hooks, modern Context API
- Goal: Improve maintainability, follow current best practices
- Constraint: Preserve all existing behavior (no feature changes)
- Risk: Breaking existing auth flows if not careful
```

**Repo Analysis**:
```bash
# Find class-based auth components
grep -r "class.*Component" src/ --include="*Auth*.tsx" --include="*auth*.tsx"

# Find legacy Context usage
grep -r "contextType\|getChildContext" src/

# Find all auth-related files
find src/ -name "*auth*" -o -name "*Auth*" | grep -v "test"

# Results:
# - src/context/AuthContext.tsx (legacy Context API)
# - src/components/auth/LoginForm.tsx (class component)
# - src/components/auth/ProtectedRoute.tsx (class component)
# - src/hooks/useAuth.ts (already uses hooks, good)
# - src/services/authService.ts (no changes needed)
# - 45 files import AuthContext
```

**Context7 Baseline**:
```
Query: React Context API modern patterns, React hooks best practices

Best Practices:
- Use createContext + useContext hook
- Memoize context value to prevent unnecessary re-renders
- Split context if values change at different rates
- Use TypeScript for context types
- Functional components with React.memo for performance
- Custom hooks to encapsulate context logic
```

#### Phase B: Plan the Work

**Sequential Thinking (Strategy)**:
```
Thought 2/4: Design refactor strategy (maintain green tests)
- Critical: All existing tests must stay GREEN throughout
- Step 1: Create behavior preservation tests (baseline)
- Step 2: Refactor AuthContext to modern API
- Step 3: Refactor components one-by-one
- Step 4: Update all imports and consumers
- Step 5: Remove legacy code, verify all tests still pass

Key insight: Need to test behavior BEFORE refactoring to ensure no regressions
```

**Test Design**:
```gherkin
Feature: Authentication Behavior Preservation

Scenario: Login flow unchanged (Behavior Preservation Test)
  Given I have existing auth tests that pass
  When I refactor auth code to modern patterns
  Then all existing auth tests must still pass
  And login flow produces same API calls
  And session management behaves identically
  And protected routes enforce auth the same way

Scenario: Modern Context API integration
  Given refactored auth context
  When components use useAuth hook
  Then they should receive same auth state as before
  And they should trigger same auth actions
  And no re-render loops should occur

Unit Tests:
- test_auth_context_provides_same_values (compare old vs new)
- test_use_auth_hook_returns_expected_interface
- test_login_form_behavior_unchanged
- test_protected_route_behavior_unchanged

Integration Tests:
- test_full_login_flow_end_to_end (Playwright, must pass before AND after)
- test_logout_flow_end_to_end (Playwright)
- test_protected_route_redirect (Playwright)
```

**Action Sequence**:
```
S1: Create baseline behavior preservation tests (must PASS before refactoring)
S2: Refactor AuthContext to modern API (all tests stay GREEN)
S3: Refactor LoginForm to functional component (all tests stay GREEN)
S4: Refactor ProtectedRoute to functional component (all tests stay GREEN)
S5: Update all consumer components to use useAuth hook (all tests stay GREEN)
S6: Remove legacy code and verify tests still pass
S7: Run full integration test suite
S8: Verify coverage maintained (≥80%)
```

#### Phase C: Handover Preparation

**Context Packaging** (Briefing excerpt):
```markdown
# Problem
Refactor authentication from class components + legacy Context API to
functional components + modern Context API with hooks. Preserve all behavior.

# Run This First
```bash
# Create baseline tests (must PASS before any refactoring)
npm test tests/auth/baseline-behavior.test.tsx
```
Expected: PASS (establishes current behavior as baseline)

# Impact Summary
- Type: refactor
- Files Changed: 8 files (auth core + 43 consumers updated)
  - Core: src/context/AuthContext.tsx (REFACTOR)
  - Components: src/components/auth/*.tsx (3 files REFACTOR)
  - Consumers: 43 files (import updates only)
- Lines of Code: ~380 LOC (mostly replacements, not additions)
```

**Self-Review (Reflexion)**:
```
Critique Questions:
✅ Behavior preservation guaranteed? YES - Baseline tests created first
✅ All consumers identified? YES - grep found 45 files, analyzed dependencies
⚠️  Risk of breaking changes? HIGH - Auth is critical
   → Action: Added extra safety step: run tests after EACH component refactor
✅ Performance regression? NO - Modern Context is more performant
✅ TypeScript type safety? YES - Maintaining existing types

Actions Taken:
- Enhanced S2-S5 to explicitly state "all tests stay GREEN"
- Added rollback command for each step
- Increased test coverage requirement from 70% to 80% (critical code)
```

**Quality Gates**:
```
✅ Completeness: 8 steps, all have commands and "tests stay GREEN" verification
✅ Determinism: Clear PASS/FAIL for each step
✅ Context Tightness: Briefing 1,654 tokens (under 2k)
✅ Testability: Baseline tests + existing tests verify behavior
✅ Tool Awareness: npm test commands are executable
✅ Reflexion Pass: Critique completed, extra safety steps added
✅ Context7 Validation: Modern Context API patterns follow React best practices

RESULT: All gates pass → Emit handover spec
```

### Output Summary

**TDD_HANDOVER_SPEC.json**: 8 files refactored, 43 consumer files updated, 8 implementation steps, 2 acceptance criteria (behavior preservation), 4 unit tests, 3 integration tests

**Key Safety Measures**:
- Baseline tests created BEFORE any refactoring
- Tests verified GREEN after EACH component refactor
- Rollback command provided for each step
- Integration tests run at end to verify full flows

---

## Common Patterns Across Examples

### Pattern 1: Test-First Design
All three examples follow:
1. Design tests FIRST
2. Create baseline (establish FAIL or current behavior)
3. Implement changes
4. Verify tests PASS

### Pattern 2: Phased Planning
All examples use three phases:
- Phase A: Understand (repo analysis + Context7)
- Phase B: Plan (tests + action sequence)
- Phase C: Package (briefing + validation)

### Pattern 3: Quality Gates
All examples validate:
- Completeness (all steps have commands)
- Determinism (clear PASS/FAIL)
- Testability (automated verification)
- Context7 validation (best practices)

### Pattern 4: Self-Critique
All examples use Reflexion to:
- Identify missing edge cases
- Add risk mitigations
- Improve plan before handover

### Pattern 5: Structured Output
All examples produce:
- JSON spec (machine-readable)
- Markdown briefing (human-readable)
- Clear "Run This First" command
- Step-by-step implementation guide

---

## Using These Examples

### As Templates
Copy the structure from the example closest to your task:
- Bug fix → Example 1
- New feature → Example 2
- Refactoring → Example 3

### As Validation
Check your plan against these examples:
- Do you have clear acceptance criteria?
- Are tests designed FIRST?
- Do steps have expected initial/final results?
- Is there a "Run This First" command?

### As Learning Material
Study how each example:
- Uses Sequential Thinking to decompose
- Leverages Context7 for best practices
- Creates Fail-to-Pass tests (bugs) or acceptance tests (features)
- Handles risks and edge cases

---

**Version**: 1.0.0 | **Last Updated**: 2025-01-25
