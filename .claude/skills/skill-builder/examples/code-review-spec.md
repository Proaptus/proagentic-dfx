# Example Skill Specification: React Code Reviewer

**Complexity Level**: Medium (25-40 minutes to implement)

This example shows a more complex skill with a dedicated subagent, templates, and Context7 integration.

---

## Skill Identity

**Name**: React Code Reviewer

**Purpose**: Automated code review for React components against React 18 best practices, identifying anti-patterns, performance issues, and suggesting improvements

**Version**: 1.0.0

---

## Activation Triggers

The skill should activate when:
- User commits React component changes
- User says "review this" or "check my code"
- Before creating pull requests
- After major refactoring of React components
- User explicitly asks for React code review

The skill should NOT activate when:
- Working with non-React code
- User is still actively writing code (wait for commit)
- Running automated tests (different skill)

---

## Target Users

- React developers (intermediate to advanced)
- Code reviewers wanting automated first-pass review
- Teams adopting React 18 best practices

**Expertise Level**: Intermediate (assumes React knowledge)

---

## Core Capabilities

### Must Have (MVP)
1. **Anti-pattern Detection**: Identify common React anti-patterns
   - Unnecessary re-renders
   - Missing dependency arrays in useEffect
   - Incorrect hook usage
   - Direct state mutation

2. **Performance Analysis**: Detect performance issues
   - Heavy computations in render
   - Missing memoization opportunities
   - Prop drilling anti-patterns

3. **Best Practices Verification**: Check against React 18 patterns
   - Proper error boundary usage
   - Concurrent features adoption
   - Correct TypeScript types

4. **Report Generation**: Create actionable review reports
   - Severity levels (critical, high, medium, low)
   - Line numbers and file references
   - Suggested fixes

### Nice to Have (Future)
- Automatic fix suggestions (code generation)
- Integration with git hooks for pre-commit review
- Team coding standards customization
- Historical trend analysis

---

## Tool Requirements

**Required Tools**:
- `Read`: Read React component files
- `Grep`: Search for patterns
- `Glob`: Find React component files (.tsx, .jsx)
- `Task`: Launch analyzer subagent

**MCP Integrations**:
- **Context7**: Query React 18 best practices
- **Sequential Thinking**: Analyze complex patterns and synthesize findings

**External Dependencies**:
- None (pure analysis)

---

## Safety & Security Considerations

### Safety Requirements
- **No automatic changes**: Only suggest, never modify code automatically
- **Clear severity levels**: Help developers prioritize fixes
- **Context-aware**: Consider project-specific patterns
- **Privacy**: No code sent to external services except Context7 for docs

### Prohibited Operations
- Never modify code without explicit user approval
- Never delete or overwrite files
- Never run untrusted code from components

---

## Subagents

### Subagent 1: react-review-analyzer

**Purpose**: Analyze individual React components for issues

**Responsibilities**:
- Parse component structure
- Identify hooks usage patterns
- Detect anti-patterns
- Calculate performance impact
- Generate detailed findings

**Tools Needed**: Read, Grep

**Input Format**:
```json
{
  "component_path": "src/components/Dashboard.tsx",
  "analysis_depth": "detailed",
  "focus_areas": ["performance", "best-practices", "anti-patterns"]
}
```

**Output Format**:
```json
{
  "component": "Dashboard.tsx",
  "findings": [
    {
      "type": "anti-pattern",
      "severity": "high",
      "line": 42,
      "issue": "Missing useEffect dependency array",
      "suggestion": "Add [userId, fetchData] to dependency array",
      "reference": "https://react.dev/reference/react/useEffect"
    }
  ],
  "performance_score": 85,
  "best_practices_score": 92
}
```

---

## Templates & Examples

### Template 1: Review Report Template

**File**: `templates/REVIEW_REPORT.md`

**Purpose**: Structured format for code review reports

**Structure**:
```markdown
# React Code Review Report

**Component**: [Component Name]
**Reviewed**: [Date/Time]
**Overall Score**: [0-100]

## Summary
[Brief overview of findings]

## Critical Issues (Severity: High)
- [Issue 1 with line numbers and fix]
- [Issue 2 with line numbers and fix]

## Performance Concerns (Severity: Medium)
- [Concern 1]
- [Concern 2]

## Suggestions for Improvement (Severity: Low)
- [Suggestion 1]
- [Suggestion 2]

## Good Patterns Observed
- [Good practice 1]
- [Good practice 2]

## Next Steps
- [ ] [Action 1]
- [ ] [Action 2]
```

### Template 2: Review Checklist

**File**: `templates/REVIEW_CHECKLIST.md`

**Purpose**: Pre-review checklist for reviewers

**Items**:
- Component compiles without errors
- Tests exist and pass
- TypeScript types complete
- Dependencies up to date

---

## Documentation Requirements

### README.md
- Overview of review process
- Installation and Context7 setup
- How to interpret review reports
- Severity level explanations
- Integration with CI/CD
- Troubleshooting common issues

### QUICK_REFERENCE.md
- Review command patterns
- Severity level quick reference
- Common anti-patterns list
- Quick fix patterns

### USAGE_EXAMPLES.md
- Example 1: Single component review
- Example 2: Full directory review
- Example 3: Pre-commit integration
- Example 4: Interpreting reports

### CHECKLIST.md
- Pre-review verification
- Post-review actions
- Fix prioritization guide

---

## Integration Requirements

### Other Skills
- Works with Testing skill (run tests after fixes)
- Works with Git Commit Helper (include review summary in commits)

### MCP Servers
- **Context7**: For React best practices verification
- **Sequential Thinking**: For complex pattern analysis

### Hooks
No hooks needed (manual activation only)

---

## Testing Strategy

### Basic Functionality Tests
1. Review component with known issues → Detects all issues
2. Review clean component → Reports no major issues
3. Generate report → Report is well-formatted
4. Subagent activation → Subagent launches correctly

### Edge Cases
1. Very large component (>500 lines)
2. Component with no hooks
3. Class component (legacy)
4. Component with TypeScript errors
5. Empty file

### Integration Tests
1. Context7 integration works
2. Subagent returns proper format
3. Multiple components reviewed in sequence

---

## Success Metrics

The skill is successful if:
- Detects 90%+ of common React anti-patterns
- No false positives on best-practice code
- Reports are clear and actionable
- Developers use it regularly (weekly)
- Average review time < 2 minutes per component

---

## Example User Interactions

### Example 1: Single Component Review

**User Request**: "Review src/components/Dashboard.tsx"

**Expected Skill Behavior**:
1. Use Context7 to get React 18 best practices
2. Read Dashboard.tsx
3. Launch react-review-analyzer subagent with component path
4. Receive analysis from subagent
5. Synthesize findings
6. Generate review report using template
7. Present report to user with severity-based highlighting
8. Suggest priority fixes

**Expected Output**:
```
React Code Review Report for Dashboard.tsx

Overall Score: 78/100

Critical Issues (2):
  Line 42: Missing useEffect dependency array
  Line 67: Direct state mutation detected

Performance Concerns (1):
  Line 89: Heavy computation in render, consider useMemo

Good Patterns (3):
  ✓ Proper TypeScript types throughout
  ✓ Error boundary implementation correct
  ✓ Accessible button labels present

Suggested Priority:
1. Fix critical issues (Lines 42, 67)
2. Add useMemo for performance (Line 89)
3. Consider refactoring large component (>300 lines)
```

### Example 2: Pre-Commit Review

**User Request**: "Review all changed components before committing"

**Expected Skill Behavior**:
1. Use git to find changed .tsx/.jsx files
2. For each component: run analysis in parallel
3. Collect all findings
4. Generate summary report
5. Highlight blockers (critical issues)
6. Ask user: "Fix critical issues before committing?"

---

## Workflow Diagram

```
User Request
    ↓
Context7: Get React 18 Best Practices
    ↓
Find React Components (Glob)
    ↓
For Each Component:
    ↓
Launch react-review-analyzer Subagent
    ↓
Subagent Analyzes:
  - Hooks patterns
  - Performance issues
  - Anti-patterns
  - Best practices compliance
    ↓
Subagent Returns Findings
    ↓
Main Skill Synthesizes All Results
    ↓
Generate Review Report (use template)
    ↓
Present to User with Priorities
```

---

## Notes

- Medium complexity skill with one subagent
- Requires Context7 MCP integration
- Should take 25-40 minutes to implement with Skill Builder
- Can be extended with more subagents for different frameworks (Vue, Angular)
- Good example of proactive subagent usage

---

## Implementation Considerations

### Subagent Design
- Subagent should be stateless
- Subagent analyzes ONE component at a time
- Main skill handles parallelization

### Context7 Usage
- Query once at start for best practices
- Cache results for batch reviews
- Re-query if reviewing after long interval

### Performance
- Use Task tool to review multiple components in parallel
- Limit to 10 concurrent reviews
- Stream results as they complete

---

**How to Use This Spec**:

```
Using Skill Builder, create a React Code Reviewer skill from this specification:
[Paste this entire document]
```

Or with Context7 first:

```
First, use Context7 to get the latest React 18 best practices for hooks and performance.
Then, using Skill Builder, create a React Code Reviewer skill following examples/code-review-spec.md
```

---

**Version**: 1.0.0 | **Last Updated**: 2025-10-19
