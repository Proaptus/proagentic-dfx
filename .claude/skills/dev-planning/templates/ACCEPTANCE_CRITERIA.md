# Acceptance Criteria Template (Gherkin)

> Use this template to write behavior-driven acceptance criteria in Gherkin format.
> Gherkin provides a structured, executable specification that's both human-readable and automatable.

---

## Feature: [Feature Name]

As a [type of user]
I want [some goal]
So that [some reason/benefit]

---

## Scenario 1: [Scenario Name - Happy Path]

**Given** [precondition or initial context]
**And** [additional precondition]
**When** [action or event]
**And** [additional action]
**Then** [expected outcome]
**And** [additional expected outcome]

### Example (Concrete)
```gherkin
Given a dataset with 51 items
And page size is 10
When I request page 1
Then I should see items 1 through 10
When I request page 2
Then I should see items 11 through 20
And none of the items from page 1 should appear in page 2
```

---

## Scenario 2: [Scenario Name - Edge Case]

**Given** [edge case precondition]
**When** [action under edge case]
**Then** [expected outcome for edge case]

### Example (Concrete)
```gherkin
Given an empty dataset
When I request page 1 with size 10
Then I should receive an empty list
And the status should be 200 OK
And the response should indicate "No items found"
```

---

## Scenario 3: [Scenario Name - Error Case]

**Given** [precondition for error]
**When** [action that triggers error]
**Then** [error behavior expected]

### Example (Concrete)
```gherkin
Given a dataset with 100 items
When I request page 0 with size 10
Then I should receive a 400 Bad Request error
And the error message should say "Page number must be >= 1"
```

---

## Scenario 4: [Scenario Name - Integration/E2E]

**Given** [multi-component setup]
**And** [additional setup]
**When** [user action through full system]
**And** [follow-up action]
**Then** [end-to-end outcome]
**And** [state verification across components]

### Example (Concrete)
```gherkin
Given I am logged into the ProAgentic dashboard
And I have 3 projects with recorded activity
When I navigate to the Usage Metrics Dashboard
And I select "Last 30 Days" timeframe
Then I should see a line chart with 30 data points
And I should see summary cards showing:
  | Metric      | Value |
  | Projects    | 3     |
  | Tasks       | 45    |
  | AI Calls    | 150   |
When I click the "Export CSV" button
Then a file named "usage-metrics-YYYY-MM-DD.csv" should download
And the CSV should contain 30 rows plus headers
```

---

## Gherkin Best Practices

### 1. Use Business Language (Not Implementation Details)
❌ **Bad**: "When I call POST /api/v1/paginate with params {page: 2, size: 10}"
✅ **Good**: "When I request page 2 with size 10"

### 2. Be Specific About Expected Outcomes
❌ **Bad**: "Then the system should work correctly"
✅ **Good**: "Then I should see items 11 through 20 with no duplicates from page 1"

### 3. Use Data Tables for Multiple Values
```gherkin
Then I should see summary cards showing:
  | Metric      | Value |
  | Projects    | 3     |
  | Tasks       | 45    |
  | AI Calls    | 150   |
```

### 4. Use Scenario Outlines for Multiple Test Cases
```gherkin
Scenario Outline: Pagination boundaries
  Given a dataset with <total_items> items
  When I request page <page_num> with size <page_size>
  Then I should see items <start_item> through <end_item>

  Examples:
    | total_items | page_num | page_size | start_item | end_item |
    | 51          | 1        | 10        | 1          | 10       |
    | 51          | 2        | 10        | 11         | 20       |
    | 51          | 6        | 10        | 51         | 51       |
```

### 5. Include Positive, Negative, and Edge Cases
- **Positive**: Happy path, expected usage
- **Negative**: Error cases, invalid input
- **Edge**: Boundaries, empty sets, null values, performance limits

---

## Common Patterns

### Authentication/Authorization
```gherkin
Scenario: Unauthorized access denied
  Given I am not logged in
  When I try to access the metrics dashboard
  Then I should be redirected to the login page
  And I should see the message "Please log in to continue"
```

### CRUD Operations
```gherkin
Scenario: Create new resource
  Given I am on the [resource] creation page
  When I fill in the form with:
    | Field       | Value       |
    | Name        | Test Item   |
    | Description | Test Desc   |
  And I click "Create"
  Then I should see "Resource created successfully"
  And I should see the new resource in the list
```

### Data Validation
```gherkin
Scenario: Invalid input rejected
  Given I am on the form page
  When I enter "[invalid_value]" in the "[field_name]" field
  And I submit the form
  Then I should see the error "Invalid [field_name]: [reason]"
  And the form should not be submitted
```

### Asynchronous Operations
```gherkin
Scenario: Long-running operation with feedback
  Given I have uploaded a large file
  When I click "Process"
  Then I should see a progress indicator
  And after processing completes
  Then I should see "Processing complete: 1000 items processed"
```

### API Responses
```gherkin
Scenario: API returns paginated data
  Given there are 100 items in the database
  When I request GET /api/items?page=2&size=20
  Then the response status should be 200
  And the response body should contain:
    | Field       | Value |
    | items       | 20 items (array) |
    | page        | 2     |
    | total_pages | 5     |
    | total_items | 100   |
```

---

## Template for Bug Fixes

```gherkin
Feature: [Bug Title from Issue Tracker]

  # Reference to original bug report
  # GitHub Issue: #123
  # Reported By: [User/Team]
  # Severity: [High/Medium/Low]

Scenario: Reproduce the bug (Fail-to-Pass Test)
  Given [preconditions that trigger the bug]
  When [action that exposes the bug]
  Then [buggy behavior observed]
    # This should FAIL initially
    # After fix, update to expected correct behavior

Scenario: Correct behavior after fix
  Given [same preconditions]
  When [same action]
  Then [correct expected outcome]
  And [verify no side effects]
```

### Example: Pagination Bug
```gherkin
Feature: Pagination boundary handling
  # GitHub Issue: #123
  # Bug: Last item from page N appears as first item on page N+1

Scenario: Bug reproduction (MUST FAIL initially)
  Given a dataset with 51 items (IDs 1-51)
  And page size is 10
  When I request page 1
  Then I should see items 1-10
  When I request page 2
  Then I should see items 11-20
  # Currently FAILS: item 10 appears in both pages

Scenario: Correct behavior after fix (MUST PASS after implementation)
  Given a dataset with 51 items (IDs 1-51)
  And page size is 10
  When I request page 1
  Then I should see exactly items [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  When I request page 2
  Then I should see exactly items [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  And there should be no items in common between page 1 and page 2
```

---

## Checklist for Good Acceptance Criteria

- [ ] Written in business language (not technical implementation)
- [ ] Specific and measurable (clear pass/fail)
- [ ] Includes Given (setup), When (action), Then (outcome)
- [ ] Covers happy path
- [ ] Covers edge cases
- [ ] Covers error cases
- [ ] Verifiable by automated test
- [ ] No ambiguous terms ("should be fast" → "should respond in <200ms")
- [ ] Uses concrete examples (not abstract descriptions)
- [ ] Independent (doesn't depend on other scenarios' state)

---

## Integration with Dev Planning Skill

The dev-planning-test-designer subagent uses this template to create acceptance criteria during **Phase B: Plan the Work**.

**Output**: Gherkin scenarios are included in:
- `TDD_HANDOVER_SPEC.json` (`tdd_plan.acceptance_criteria`)
- `TDD_HANDOVER_SPEC.md` (summary in briefing)

**Usage in TDD**: The TDD skill/agent uses these scenarios to:
1. Create executable tests (e.g., Pytest-BDD, Cucumber, SpecFlow)
2. Verify implementation matches requirements
3. Serve as documentation of expected behavior

---

**Reference**: Cucumber Gherkin syntax - https://cucumber.io/docs/gherkin/reference/
