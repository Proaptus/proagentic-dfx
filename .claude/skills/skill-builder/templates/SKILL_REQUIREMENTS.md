# Skill Requirements Document

**Phase 1: Requirements Gathering**

Fill in this template during requirements gathering to ensure comprehensive skill planning.

---

## Skill Identity

**Skill Name**: [e.g., "Code Review Automator"]

**One-Line Summary**: [What does this skill do in one sentence?]

**Scope**:
- [ ] Project-specific (only for this project)
- [ ] General-purpose (works across projects)
- [ ] Domain-specific (e.g., only for React projects)

---

## Purpose & Goals

### Primary Purpose
[Detailed description of what this skill accomplishes]

### Success Criteria
What makes this skill successful?
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Activation Triggers

**When should Claude use this skill?**

List specific triggers:
1. [e.g., "User commits code"]
2. [e.g., "User says 'review this code'"]
3. [e.g., "User asks for security audit"]

**Automatic vs Manual**:
- [ ] Skill activates automatically based on description
- [ ] Skill requires explicit invocation by name

---

## Target Users

**Who will use this skill?**
- [ ] Solo developers
- [ ] Team of developers
- [ ] Non-technical users
- [ ] AI/automation systems

**User Expertise Level**:
- [ ] Beginner-friendly
- [ ] Intermediate (some knowledge required)
- [ ] Advanced (expert users only)

---

## Core Capabilities

### Main Functions
List 3-7 core functions this skill provides:

1. **[Function Name]**
   - Description: [What it does]
   - Input: [What it needs]
   - Output: [What it produces]

2. **[Function Name]**
   - Description:
   - Input:
   - Output:

3. **[Function Name]**
   - Description:
   - Input:
   - Output:

### Optional/Advanced Features
Features that enhance but aren't required:
- [ ] Feature 1
- [ ] Feature 2

---

## Tool Requirements

**Claude Code Tools Needed**:
- [ ] Read (file reading)
- [ ] Write (file creation)
- [ ] Edit (file modification)
- [ ] Glob (pattern matching)
- [ ] Grep (content search)
- [ ] Bash (shell commands)
- [ ] Task (parallel execution)

**External Tool Dependencies**:
- [ ] MCP Server: [name]
- [ ] CLI Tool: [name]
- [ ] API: [name]

**allowed-tools Restriction**:
Should this skill restrict which tools Claude can use?
- [ ] Yes, restrict to: [list tools]
- [ ] No, allow all tools

---

## Safety & Security

### Dangerous Operations
Does this skill perform any dangerous operations?
- [ ] File deletion
- [ ] Process termination
- [ ] Network requests
- [ ] System modifications
- [ ] Data deletion
- [ ] Code execution
- [ ] None

### Safety Measures Required
- [ ] PreToolUse hook to block dangerous commands
- [ ] PostToolUse hook to validate changes
- [ ] Input validation
- [ ] Confirmation prompts
- [ ] Rollback mechanisms
- [ ] Audit logging

### Security Considerations
- [ ] Handles sensitive data (API keys, passwords)
- [ ] Makes external network calls
- [ ] Executes user-provided code
- [ ] Modifies security-critical files
- [ ] None of the above

---

## Subagents

**Does this skill need specialized subagents?**
- [ ] No, skill is self-contained
- [ ] Yes, need subagents

If yes, list subagents:

### Subagent 1: [Name]
- **Purpose**: [What it does]
- **When to use**: [Trigger conditions]
- **Tools needed**: [List]
- **Output format**: [What it returns]

### Subagent 2: [Name]
- **Purpose**:
- **When to use**:
- **Tools needed**:
- **Output format**:

---

## Templates & Examples

### Code Templates Needed
What templates would help users adopt this skill?

1. **[Template Name]** (e.g., "PR Comment Template")
   - Format: [Markdown, TypeScript, Python, etc.]
   - Purpose: [What problem it solves]
   - Complexity: [Simple, Medium, Advanced]

2. **[Template Name]**
   - Format:
   - Purpose:
   - Complexity:

### Example Scenarios
Describe 3-6 real-world usage scenarios:

#### Scenario 1: [Name]
**Situation**: [When would this happen?]
**User Action**: [What does user do?]
**Skill Response**: [What does skill do?]
**Outcome**: [Result]

#### Scenario 2: [Name]
**Situation**:
**User Action**:
**Skill Response**:
**Outcome**:

---

## Documentation Needs

### README Sections Required
- [ ] Quick Start
- [ ] Installation/Setup
- [ ] Usage Examples
- [ ] Configuration Options
- [ ] Troubleshooting
- [ ] FAQ
- [ ] API Reference
- [ ] Contributing Guidelines

### Quick Reference Content
What should be on the one-page quick reference?
- [ ] Command list
- [ ] Keyboard shortcuts
- [ ] Common patterns
- [ ] Troubleshooting tips
- [ ] Configuration options

---

## Integration Requirements

### Git Integration
- [ ] Update .gitignore to allow skill files
- [ ] Commit skill to version control
- [ ] Create git hooks
- [ ] None

### Build System Integration
- [ ] Add to package.json scripts
- [ ] Update CI/CD pipeline
- [ ] Add to Makefile
- [ ] None

### Team Communication
- [ ] Document in team wiki
- [ ] Send announcement email
- [ ] Demo in team meeting
- [ ] None

---

## Testing Strategy

### Validation Tests
How will we verify the skill works?

1. **[Test Name]**
   - Test: [What to test]
   - Expected: [Expected result]
   - Pass Criteria: [How to know it passed]

2. **[Test Name]**
   - Test:
   - Expected:
   - Pass Criteria:

### Edge Cases to Test
- [ ] Empty input
- [ ] Invalid input
- [ ] Large files
- [ ] Network failures
- [ ] Permission errors
- [ ] Concurrent execution

---

## Success Metrics

### Quantitative Metrics
How will we measure success?
- [ ] Time saved: [X minutes/task]
- [ ] Error reduction: [X% fewer errors]
- [ ] Usage frequency: [X times/day]
- [ ] Adoption rate: [X% of team]

### Qualitative Metrics
- [ ] Developer satisfaction
- [ ] Code quality improvement
- [ ] Reduced cognitive load
- [ ] Faster onboarding

---

## Open Questions

List any unresolved questions:
1. [Question 1]
2. [Question 2]
3. [Question 3]

---

## Approval

**Requirements Approved By**: [Name]
**Date**: [YYYY-MM-DD]
**Next Phase**: Architecture Planning

---

**Notes**: [Any additional context or decisions made during requirements gathering]
