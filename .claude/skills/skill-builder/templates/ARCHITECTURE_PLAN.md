# Skill Architecture Plan

**Phase 2: Architecture Planning**

Based on requirements, plan the complete skill structure.

---

## Skill Overview

**Name**: [Skill Name]
**Type**: [Project-specific / General-purpose / Domain-specific]
**Complexity**: [Simple / Medium / Complex]

---

## File Structure

```
.claude/skills/[skill-name]/
├── SKILL.md                    # Core skill definition
├── README.md                   # Full documentation
├── QUICK_REFERENCE.md          # One-page reference
├── USAGE_EXAMPLES.md           # Practical scenarios
├── CHECKLIST.md                # Completion checklist
├── templates/                  # Code templates
│   ├── [template-1].*
│   ├── [template-2].*
│   └── [template-3].*
├── scripts/                    # Automation scripts
│   ├── safety/                 # Safety validators
│   │   └── [validator].py
│   └── helpers/                # Helper scripts
│       └── [helper].sh
└── examples/                   # Example usage
    ├── [example-1].md
    └── [example-2].md

.claude/agents/                 # Subagents (if needed)
├── [skill-name]-[agent-1].md
└── [skill-name]-[agent-2].md

.claude/settings.json           # Hooks configuration (if needed)
.mcp.json                       # MCP servers (if needed)
```

---

## SKILL.md Specification

### YAML Frontmatter
```yaml
---
name: [Skill Name]
description: [Clear description stating what the skill does and when to use it. Include specific triggers and use cases. This is critical for auto-activation.]
allowed-tools: [List of allowed tools: Read, Grep, Glob, Edit, Write, Bash, Task]
model: [inherit | claude-3-5-sonnet-20241022 | etc. - usually omit this]
---
```

### Content Sections
1. **Introduction**: Purpose and goals
2. **When to Use**: Activation triggers
3. **Workflow**: Step-by-step process
4. **Safety Rules**: Constraints and requirements
5. **Examples**: Usage patterns
6. **Reference**: Links to templates and docs

---

## Documentation Plan

### README.md Sections
1. Overview
2. Quick Start
3. [Additional sections from requirements]
4. Troubleshooting
5. Customization
6. [More sections as needed]

**Estimated Length**: [X pages]

### QUICK_REFERENCE.md Content
- [ ] Key commands
- [ ] Common patterns
- [ ] Troubleshooting tips
- [ ] File locations
- [ ] [Other items]

**Target**: Single page (fits on screen without scrolling)

### USAGE_EXAMPLES.md Scenarios
1. **[Scenario 1 Name]**: [Brief description]
2. **[Scenario 2 Name]**: [Brief description]
3. **[Scenario 3 Name]**: [Brief description]
4. [Add 3-6 total scenarios]

### CHECKLIST.md Items
- [ ] [Checkpoint 1]
- [ ] [Checkpoint 2]
- [ ] [Checkpoint 3]
- [ ] [Add all verification items]

---

## Templates

### Template 1: [Name]
- **File**: `templates/[filename].[ext]`
- **Purpose**: [What problem it solves]
- **Format**: [Markdown / TypeScript / Python / Bash / etc.]
- **Size**: [Small (< 50 lines) / Medium (50-200) / Large (> 200)]

**Sections**:
1. [Section 1]
2. [Section 2]
3. [Section 3]

### Template 2: [Name]
- **File**: `templates/[filename].[ext]`
- **Purpose**:
- **Format**:
- **Size**:

[Add more templates as needed]

---

## Scripts

### Safety Scripts

#### [Validator Name]
- **File**: `scripts/safety/[name].py`
- **Purpose**: [What it validates/blocks]
- **Trigger**: [PreToolUse / PostToolUse]
- **Blocks**: [List dangerous patterns]
- **Allows**: [List safe patterns]

**Implementation Notes**:
- [Tech stack: Python 3]
- [Dependencies: none / list]
- [Error handling approach]

### Helper Scripts

#### [Helper Name]
- **File**: `scripts/helpers/[name].sh`
- **Purpose**: [What it automates]
- **Inputs**: [Parameters]
- **Outputs**: [Return values]

[Add more scripts as needed]

---

## Subagents

### Subagent 1: [Name]

**File**: `.claude/agents/[skill-name]-[agent-name].md`

**YAML Frontmatter**:
```yaml
---
name: [skill-name]-[agent-name]
description: [What this agent does and when to use it proactively]
model: inherit
tools: [List of allowed tools]
---
```

**Responsibilities**:
1. [Responsibility 1]
2. [Responsibility 2]
3. [Responsibility 3]

**Input Format**: [What it receives]
**Output Format**: [What it returns]

### Subagent 2: [Name]
[Repeat structure for each subagent]

---

## Hooks Configuration

### PreToolUse Hooks

#### Hook 1: [Name]
- **Matcher**: [Tool name or pattern]
- **Script**: [Path to validator]
- **Purpose**: [What it prevents]
- **Decisions**:
  - ✅ Allow: [Safe patterns]
  - ❌ Deny: [Dangerous patterns]
  - ⚠️ Ask: [Needs confirmation]

### PostToolUse Hooks

#### Hook 1: [Name]
- **Matcher**: [Tool name or pattern]
- **Script**: [Path to validator]
- **Purpose**: [What it validates]
- **Actions**:
  - [Check 1]
  - [Check 2]
  - [Check 3]

**settings.json Structure**:
```json
{
  "hooks": {
    "PreToolUse": [ ... ],
    "PostToolUse": [ ... ],
    "SubagentStop": [ ... ]
  }
}
```

---

## MCP Integration

### Required MCP Servers

#### Server 1: [Name]
- **Type**: http / stdio
- **URL/Command**: [Connection info]
- **Purpose**: [Why needed]
- **Tools Provided**: [List MCP tools]

#### Server 2: [Name]
[Repeat for each server]

**mcp.json Structure**:
```json
{
  "mcpServers": {
    "[server-name]": {
      "type": "http",
      "url": "...",
      "headers": { ... }
    }
  }
}
```

---

## Dependencies

### System Requirements
- [ ] Operating System: [Linux / macOS / Windows / All]
- [ ] Node.js version: [X.Y.Z or higher]
- [ ] Python version: [X.Y or higher]
- [ ] Other: [List]

### External Tools
- [ ] Tool 1: [name] - [purpose]
- [ ] Tool 2: [name] - [purpose]

### Installation Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

---

## Testing Plan

### Unit Tests
- [ ] Test 1: [What to test]
- [ ] Test 2: [What to test]

### Integration Tests
- [ ] Test 1: [What to test]
- [ ] Test 2: [What to test]

### E2E Tests
- [ ] Test 1: [Complete workflow]
- [ ] Test 2: [Complete workflow]

### Manual Verification
1. [Verification step 1]
2. [Verification step 2]
3. [Verification step 3]

---

## Implementation Sequence

### Phase 3.1: Core Files
1. Create SKILL.md
2. Create README.md
3. Create QUICK_REFERENCE.md
4. Create USAGE_EXAMPLES.md
5. Create CHECKLIST.md

### Phase 3.2: Templates
1. Create Template 1
2. Create Template 2
3. [More templates]

### Phase 3.3: Scripts
1. Create safety validators
2. Create helper scripts
3. Make scripts executable

### Phase 3.4: Subagents
1. Create Subagent 1
2. Create Subagent 2
3. [More subagents]

### Phase 3.5: Configuration
1. Update hooks configuration
2. Update MCP configuration
3. Update .gitignore

---

## Validation Checklist

Before moving to Phase 4:

- [ ] All planned files created
- [ ] YAML frontmatter valid
- [ ] Scripts executable
- [ ] Documentation complete
- [ ] Templates practical
- [ ] Examples cover key scenarios
- [ ] Safety measures implemented
- [ ] Ready for testing

---

## Risk Assessment

### Technical Risks
1. **[Risk 1]**
   - Impact: [High / Medium / Low]
   - Probability: [High / Medium / Low]
   - Mitigation: [How to address]

2. **[Risk 2]**
   - Impact:
   - Probability:
   - Mitigation:

### User Experience Risks
1. **[Risk 1]**
   - Impact:
   - Mitigation:

---

## Timeline Estimate

- Phase 3 (Implementation): [X hours]
- Phase 4 (Validation): [Y hours]
- Phase 5 (Integration): [Z hours]
- **Total**: [Total hours]

---

## Approval

**Architecture Approved By**: [Name]
**Date**: [YYYY-MM-DD]
**Next Phase**: Implementation

---

**Notes**: [Any architectural decisions, trade-offs, or important context]
