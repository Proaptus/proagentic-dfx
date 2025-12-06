# Skill Builder - Usage Examples

Practical, detailed examples of creating different types of skills using Skill Builder.

---

## Table of Contents

1. [Example 1: Simple Formatter Skill](#example-1-simple-formatter-skill)
2. [Example 2: Code Review Skill with Subagent](#example-2-code-review-skill-with-subagent)
3. [Example 3: Comprehensive Testing Skill](#example-3-comprehensive-testing-skill)
4. [Example 4: Modifying an Existing Skill](#example-4-modifying-an-existing-skill)
5. [Example 5: Documentation Generator Skill](#example-5-documentation-generator-skill)
6. [Example 6: Deployment Automation Skill](#example-6-deployment-automation-skill)

---

## Example 1: Simple Formatter Skill

**Scenario**: Create a skill that formats JSON files with proper indentation.

### User Request
```
Using Skill Builder, create a skill that formats JSON files with proper indentation.
```

### Phase 1: Requirements Gathering

**Skill Builder asks:**
- What does the skill do? → Formats JSON files with 2-space indentation
- When should it activate? → When user says "format JSON" or works with .json files
- Who will use it? → All developers on the team
- What tools does it need? → Read, Write, Bash (for jq validation)
- Are there safety concerns? → Backup original file before formatting
- Does it need subagents? → No
- What templates are needed? → None (simple formatting)
- Special requirements? → Validate JSON before formatting

**Output**: `SKILL_REQUIREMENTS.md` completed

### Phase 2: Architecture Planning

**Skill Builder plans:**
```yaml
File Structure:
  .claude/skills/json-formatter/
  ├── SKILL.md
  ├── README.md
  ├── QUICK_REFERENCE.md
  ├── USAGE_EXAMPLES.md
  └── CHECKLIST.md

YAML Frontmatter:
  name: JSON Formatter
  description: Format JSON files with proper indentation. Use when user says "format JSON" or when working with .json files that need standardization.
  allowed-tools: Read, Write, Bash

Documentation:
  - README: Installation, usage, troubleshooting
  - QUICK_REFERENCE: Commands and options
  - USAGE_EXAMPLES: Common scenarios
  - CHECKLIST: Validation steps

Scripts: None (inline formatting logic)
Subagents: None
Hooks: None
MCP Integration: None
```

**Output**: `ARCHITECTURE_PLAN.md` completed

### Phase 3: Implementation

**Skill Builder creates:**

**`.claude/skills/json-formatter/SKILL.md`**
```yaml
---
name: JSON Formatter
description: Format JSON files with proper indentation (2 spaces). Use when user says "format JSON" or when working with .json files that need standardization. Validates JSON before formatting.
allowed-tools: Read, Write, Bash
---

# JSON Formatter - Standardize JSON File Formatting

> Automatically format JSON files with consistent 2-space indentation and validate structure.

## When to Use This Skill

- ✅ User says "format JSON" or "prettify JSON"
- ✅ User provides a .json file that needs formatting
- ✅ User asks to standardize JSON indentation
- ❌ Do not use for JSON inside code files (use code formatter instead)

## Core Workflow

### Step 1: Locate JSON File
Read the JSON file path from user request or search for .json files.

### Step 2: Validate JSON
Use `jq` to validate JSON structure before formatting.

### Step 3: Backup Original
Create backup at `[filename].json.backup` before making changes.

### Step 4: Format JSON
Use `jq` with 2-space indentation to format the file.

### Step 5: Verify Result
Confirm formatted file is valid JSON and report changes.

## Safety Rules & Constraints

### Required Actions
- ✅ Always backup original file before formatting
- ✅ Validate JSON structure before and after formatting
- ✅ Report any syntax errors clearly

### Prohibited Actions
- ❌ Never overwrite without backup
- ❌ Never format non-JSON files

## Usage Patterns

### Pattern 1: Format Specific File
```
Format package.json
```

**What happens**:
1. Read package.json
2. Validate JSON with jq
3. Backup to package.json.backup
4. Format with 2-space indentation
5. Write formatted content
6. Verify result

### Pattern 2: Format Multiple Files
```
Format all JSON files in config/
```

**What happens**:
1. Find all .json files in config/
2. For each file: validate, backup, format, verify
3. Report summary of all files processed

## Examples

### Example 1: Single File

**User Request**: "Format src/config/settings.json"

**Skill Response**:
1. Read src/config/settings.json
2. Run `jq . src/config/settings.json` to validate
3. Create backup: src/config/settings.json.backup
4. Format with `jq --indent 2 . src/config/settings.json`
5. Write formatted content back
6. Report: "✅ Formatted settings.json (234 lines, 2-space indentation)"

**Result**: File formatted with consistent indentation, backup saved

---

**Version**: 1.0.0
**Last Updated**: 2025-10-19
```

**Documentation files**: README.md, QUICK_REFERENCE.md, USAGE_EXAMPLES.md, CHECKLIST.md created using templates

### Phase 4: Validation

```bash
# File structure correct ✅
ls -la .claude/skills/json-formatter/

# YAML syntax valid ✅
cat .claude/skills/json-formatter/SKILL.md | head -10

# Skill discoverable ✅
# Asked Claude: "What skills are available?" → JSON Formatter appears

# Basic functionality test ✅
# Tested: "Format package.json" → Success
```

### Phase 5: Integration & Commit

```bash
# Update .gitignore
echo "!.claude/skills/json-formatter/" >> .gitignore

# Commit
git add -f .claude/skills/json-formatter/
git commit -m "feat: Add JSON Formatter skill

- Formats JSON files with 2-space indentation
- Validates JSON before formatting
- Creates automatic backups
- Supports single files and directories

Follows official Claude Code Skills conventions."

git push
```

**Time Taken**: ~10 minutes

---

## Example 2: Code Review Skill with Subagent

**Scenario**: Create a skill that performs code review against React 18 best practices.

### User Request
```
Using Skill Builder, create a comprehensive code review skill that checks React components against React 18 best practices.
```

### Phase 1: Requirements Gathering

**Key Requirements**:
- **Purpose**: Automated code review for React components
- **Triggers**: After commits, when user says "review this", before PRs
- **Tools**: Read, Grep, Glob, Task
- **Safety**: No automatic changes, only suggestions
- **Subagents**: Yes - dedicated analyzer subagent
- **Templates**: Review report template, checklist template
- **Integration**: Context7 for best practices verification

### Phase 2: Architecture Planning

```yaml
File Structure:
  .claude/skills/react-review/
  ├── SKILL.md
  ├── README.md
  ├── QUICK_REFERENCE.md
  ├── USAGE_EXAMPLES.md
  ├── CHECKLIST.md
  └── templates/
      ├── REVIEW_REPORT.md
      └── REVIEW_CHECKLIST.md

  .claude/agents/
  └── react-review-analyzer.md

YAML Frontmatter:
  name: React Code Reviewer
  description: Automated code review against React 18 best practices. Use after commits or when user asks for review. Proactively activates before PRs.
  allowed-tools: Read, Grep, Glob, Task

Subagents:
  - react-review-analyzer: Analyzes components, identifies anti-patterns
```

### Phase 3: Implementation

**Main Skill** (`.claude/skills/react-review/SKILL.md`):
```yaml
---
name: React Code Reviewer
description: Automated code review against React 18 best practices. Use after commits or when user asks for review. Proactively activates before PRs.
allowed-tools: Read, Grep, Glob, Task
---

# React Code Reviewer - Automated Best Practices Analysis

## Core Workflow

### Step 1: Identify Target Components
Use Glob to find React components (.tsx, .jsx files)

### Step 2: Analyze with Context7
Query Context7 for React 18 best practices

### Step 3: Launch Analyzer Subagent
Use Task tool to launch react-review-analyzer for each component

### Step 4: Synthesize Results
Collect all findings and prioritize by severity

### Step 5: Generate Report
Create comprehensive review report with actionable suggestions

## When to Use This Skill

- ✅ User commits React component changes
- ✅ User says "review this" or "check my code"
- ✅ Before creating pull requests
- ✅ After major refactoring
- ❌ Do not use for non-React code

[... rest of SKILL.md content ...]
```

**Subagent** (`.claude/agents/react-review-analyzer.md`):
```yaml
---
name: react-review-analyzer
description: Analyze React components for anti-patterns, performance issues, and best practice violations. Use proactively when reviewing React code.
model: inherit
tools: Read, Grep
---

# React Review Analyzer - Component Analysis Expert

## Your Primary Responsibilities

### 1. Anti-Pattern Detection
- **What**: Identify common React anti-patterns
- **When**: For every component analyzed
- **How**: Pattern matching against known anti-patterns
- **Output**: List of anti-patterns with severity ratings

### 2. Performance Analysis
- **What**: Detect unnecessary re-renders, heavy computations
- **When**: For components with hooks or state
- **How**: Analyze useEffect dependencies, memo usage
- **Output**: Performance improvement suggestions

### 3. Best Practices Verification
- **What**: Verify compliance with React 18 best practices
- **When**: For all components
- **How**: Check against Context7 React patterns
- **Output**: Compliance score and recommendations

[... rest of subagent content ...]
```

**Templates**:
- `REVIEW_REPORT.md`: Structured report format
- `REVIEW_CHECKLIST.md`: Pre-review checklist

### Phase 4: Validation

```bash
# Tested on sample React components
# Subagent loaded correctly
# Reports generated with actionable feedback
```

### Phase 5: Integration & Commit

```bash
git add -f .claude/skills/react-review/ .claude/agents/react-review-analyzer.md
git commit -m "feat: Add React Code Reviewer skill with analyzer subagent

- Automated React 18 best practices review
- Dedicated analyzer subagent for component analysis
- Anti-pattern detection and performance analysis
- Review report and checklist templates
- Context7 integration for current best practices"

git push
```

**Time Taken**: ~35 minutes

---

## Example 3: Comprehensive Testing Skill

**Scenario**: Create a skill that generates unit tests, integration tests, and E2E tests for React components.

### User Request
```
Using Skill Builder, create a comprehensive testing skill that generates unit tests, integration tests, and E2E tests for React components. Include test coverage analysis.
```

### Key Implementation Details

**File Structure**:
```
.claude/skills/react-testing/
├── SKILL.md
├── README.md
├── templates/
│   ├── UNIT_TEST_TEMPLATE.spec.tsx
│   ├── INTEGRATION_TEST_TEMPLATE.spec.tsx
│   └── E2E_TEST_TEMPLATE.spec.ts
└── [documentation files]

.claude/agents/
├── react-testing-unit-generator.md
├── react-testing-integration-generator.md
└── react-testing-e2e-generator.md
```

**Multiple Subagents**:
- `unit-generator`: Creates unit tests for components
- `integration-generator`: Creates integration tests
- `e2e-generator`: Creates Playwright E2E tests

**Workflow**:
1. User specifies component to test
2. Main skill analyzes component structure
3. Launches 3 subagents in parallel (Task tool)
4. Each subagent generates appropriate tests
5. Main skill combines tests and runs coverage analysis
6. Reports coverage gaps and suggests additional tests

**Time Taken**: ~50 minutes (complex with 3 subagents)

---

## Example 4: Modifying an Existing Skill

**Scenario**: Add a new feature to the JSON Formatter skill - support for YAML formatting.

### User Request
```
Using Skill Builder, add YAML formatting support to the JSON Formatter skill. Rename it to "Format Master".
```

### Skill Builder Process

**Phase 1: Analysis**
- Skill Builder reads existing JSON Formatter skill
- Identifies components to modify
- Plans new YAML formatting capability

**Phase 2: Architecture**
```yaml
Changes:
  - Update YAML frontmatter (name, description)
  - Add YAML formatting logic to SKILL.md
  - Update documentation to include YAML examples
  - Add YAML validation with yq tool
  - Update templates if needed
```

**Phase 3: Implementation**
- Updates SKILL.md with new YAML logic
- Modifies description: "Format JSON and YAML files..."
- Adds YAML examples to USAGE_EXAMPLES.md
- Updates README.md with YAML usage

**Phase 4: Validation**
- Tests JSON formatting still works
- Tests new YAML formatting
- Verifies documentation accuracy

**Phase 5: Commit**
```bash
git add .claude/skills/format-master/
git commit -m "feat: Expand JSON Formatter to Format Master with YAML support

- Renamed JSON Formatter to Format Master
- Added YAML formatting with yq validation
- Updated documentation with YAML examples
- Maintains backward compatibility with JSON"

git push
```

**Time Taken**: ~15 minutes

---

## Example 5: Documentation Generator Skill

**Scenario**: Create a skill that generates comprehensive documentation for code files.

### User Request
```
Create a skill that automatically generates JSDoc comments, README sections, and usage examples for TypeScript/JavaScript code files.
```

### Key Features

**Capabilities**:
- Analyzes TypeScript/JavaScript files
- Generates JSDoc comments for functions/classes
- Creates README sections based on code structure
- Extracts usage examples from tests
- Generates API documentation

**Templates Provided**:
- `JSDOC_TEMPLATE.ts`: JSDoc comment format
- `README_SECTION_TEMPLATE.md`: README section structure
- `API_DOC_TEMPLATE.md`: API documentation format

**Subagent**:
- `documentation-analyzer`: Analyzes code structure and relationships

**Safety Features**:
- Never overwrites existing documentation without confirmation
- Creates preview before applying changes
- Maintains existing custom documentation

**Time Taken**: ~40 minutes

---

## Example 6: Deployment Automation Skill

**Scenario**: Create a skill that automates deployment to staging and production with safety checks.

### User Request
```
Using Skill Builder, create a deployment skill that handles staging and production deployments with pre-deployment checks, health monitoring, and rollback capability.
```

### Key Implementation

**File Structure**:
```
.claude/skills/deployment-automation/
├── SKILL.md
├── README.md
├── scripts/
│   ├── pre-deploy-checks.sh
│   ├── health-check.sh
│   └── rollback.sh
├── templates/
│   └── DEPLOYMENT_CHECKLIST.md
└── [documentation files]

.claude/agents/
├── deployment-validator.md
└── deployment-monitor.md
```

**Hooks Configuration**:
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "bash .claude/skills/deployment-automation/scripts/pre-deploy-checks.sh"
      }]
    }]
  }
}
```

**Safety Features**:
- Pre-deployment checklist (tests pass, linting, type checking)
- Health monitoring post-deployment
- Automatic rollback on failure
- Deployment confirmation prompt for production

**Subagents**:
- `deployment-validator`: Validates deployment readiness
- `deployment-monitor`: Monitors health after deployment

**Workflow**:
1. User triggers deployment
2. Validator subagent runs pre-checks
3. Deployment script executes
4. Monitor subagent watches health endpoints
5. Reports success or triggers rollback

**Time Taken**: ~60 minutes (complex with scripts and hooks)

---

## Common Patterns Summary

### Simple Skills (5-10 min)
- Single SKILL.md + basic docs
- No subagents
- Minimal templates
- Example: JSON Formatter

### Medium Skills (15-30 min)
- SKILL.md + comprehensive docs
- Optional: 1 subagent
- 2-3 templates
- Optional: helper scripts
- Example: Code Review Skill

### Complex Skills (30-60 min)
- SKILL.md + full documentation suite
- Multiple subagents (2-3)
- Multiple templates
- Scripts and hooks
- MCP integration
- Example: Comprehensive Testing Skill, Deployment Automation

---

## Tips for Each Phase

### Requirements Phase
- Ask clarifying questions early
- Document edge cases
- Identify integration points

### Architecture Phase
- Start simple, add complexity as needed
- Consider future extensions
- Plan for error handling

### Implementation Phase
- Follow templates closely
- Test incrementally
- Document as you go

### Validation Phase
- Test happy path first
- Test edge cases
- Verify error handling

### Integration Phase
- Update .gitignore first
- Write descriptive commit messages
- Document for team

---

## Next Steps

After creating a skill:
1. **Use it immediately** - Test with real scenarios
2. **Gather feedback** - Ask team members to try it
3. **Iterate** - Improve based on usage
4. **Share** - Document learnings in team wiki

---

**Version**: 1.0.0 | **Last Updated**: 2025-10-19
