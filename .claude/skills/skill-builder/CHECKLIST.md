# Skill Builder - Completion Checklist

Use this checklist to verify that your skill was built correctly and is ready for use.

---

## Pre-Execution Checklist

Before starting skill creation:

- [ ] Clear understanding of skill purpose
- [ ] Identified activation triggers
- [ ] Determined required tools
- [ ] Considered safety requirements
- [ ] Identified need for subagents
- [ ] Planned templates/examples needed
- [ ] Reviewed similar existing skills (if any)

---

## Phase 1: Requirements Gathering

### Skill Identity
- [ ] Skill name chosen (clear, concise, descriptive)
- [ ] Purpose clearly defined
- [ ] Target users identified

### Triggers & Scenarios
- [ ] Primary use cases documented
- [ ] Activation triggers specified
- [ ] Edge cases considered
- [ ] "When NOT to use" documented

### Capabilities & Tools
- [ ] Core capabilities listed
- [ ] Required tools identified (Read, Grep, Glob, Edit, Write, Bash, Task)
- [ ] Optional features planned
- [ ] Tool restrictions considered

### Safety & Security
- [ ] Dangerous operations identified
- [ ] Safety constraints documented
- [ ] Confirmation requirements specified
- [ ] User permission needs outlined

### Components
- [ ] Subagent needs assessed
- [ ] Template requirements identified
- [ ] Documentation needs planned
- [ ] Example specifications outlined

**Phase 1 Status**: ⏳ Pending / 🔄 In Progress / ✅ Complete

---

## Phase 2: Architecture Planning

### File Structure
- [ ] Directory structure designed
- [ ] Required files listed
- [ ] Optional components identified
- [ ] File naming conventions established

### YAML Frontmatter
- [ ] `name:` field specified
- [ ] `description:` field written (clear, specific, includes triggers)
- [ ] `allowed-tools:` list finalized
- [ ] `model:` field specified (if needed)

### Documentation Plan
- [ ] README sections outlined
- [ ] QUICK_REFERENCE structure planned
- [ ] USAGE_EXAMPLES scenarios identified
- [ ] CHECKLIST items defined

### Templates
- [ ] Template files listed
- [ ] Template purposes documented
- [ ] Template formats decided
- [ ] Fill-in-the-blank approach confirmed

### Scripts & Automation
- [ ] Helper scripts identified
- [ ] Script languages chosen (Bash, Python, etc.)
- [ ] Script permissions planned
- [ ] Error handling designed

### Subagents
- [ ] Subagent responsibilities defined
- [ ] Subagent YAML frontmatter planned
- [ ] Subagent tools determined
- [ ] Integration approach designed

### Hooks Configuration
- [ ] PreToolUse hooks planned (if needed)
- [ ] PostToolUse hooks planned (if needed)
- [ ] SubagentStop hooks planned (if needed)
- [ ] Hook commands specified

### MCP Integration
- [ ] MCP servers identified
- [ ] API endpoints documented
- [ ] Authentication requirements specified
- [ ] Environment variables planned

**Phase 2 Status**: ⏳ Pending / 🔄 In Progress / ✅ Complete

---

## Phase 3: Implementation

### Core Skill Definition
- [ ] `.claude/skills/[skill-name]/SKILL.md` created
- [ ] YAML frontmatter present (three dashes before/after)
- [ ] `name:` field populated correctly
- [ ] `description:` field clear and specific
- [ ] `allowed-tools:` list complete
- [ ] "When to Use This Skill" section written
- [ ] Core workflow documented step-by-step
- [ ] Safety rules clearly specified
- [ ] Usage patterns provided
- [ ] Examples included
- [ ] Version and changelog present

### Documentation Suite
- [ ] `README.md` created (comprehensive documentation)
  - [ ] Overview section
  - [ ] Quick start guide
  - [ ] Usage instructions
  - [ ] Features explained
  - [ ] Troubleshooting section
  - [ ] Best practices
  - [ ] FAQ
- [ ] `QUICK_REFERENCE.md` created (one-page reference)
  - [ ] Commands summary
  - [ ] File structure
  - [ ] Quick fixes
- [ ] `USAGE_EXAMPLES.md` created (practical scenarios)
  - [ ] Multiple examples (simple → complex)
  - [ ] Complete walkthroughs
  - [ ] Expected results documented
- [ ] `CHECKLIST.md` created (this file)

### Templates
- [ ] All templates created in `templates/` directory
- [ ] Templates are fill-in-the-blank style
- [ ] Template purposes documented
- [ ] Templates follow established patterns
- [ ] Template usage instructions clear

### Scripts
- [ ] All scripts created in `scripts/` directory
- [ ] Scripts have clear purposes
- [ ] Scripts include error handling
- [ ] Scripts have proper shebang lines
- [ ] Scripts marked executable (`chmod +x`)
- [ ] Scripts tested independently

### Subagents
- [ ] All subagents created in `.claude/agents/`
- [ ] Subagent naming: `[skill-name]-[agent-name].md`
- [ ] Each subagent has YAML frontmatter
- [ ] Subagent responsibilities clearly defined
- [ ] Input/output formats documented
- [ ] Integration with main skill explained
- [ ] Example interactions provided

### Hooks Configuration
- [ ] `.claude/settings.json` updated (if hooks needed)
- [ ] Hook matchers correct
- [ ] Hook commands use `$CLAUDE_PROJECT_DIR`
- [ ] Hook timeouts appropriate
- [ ] Hook error handling considered

### MCP Configuration
- [ ] `.mcp.json` updated (if MCP needed)
- [ ] Server URLs correct
- [ ] Authentication configured
- [ ] Environment variables documented

**Phase 3 Status**: ⏳ Pending / 🔄 In Progress / ✅ Complete

---

## Phase 4: Validation

### File Structure Validation
- [ ] Directory structure matches plan
```bash
ls -la .claude/skills/[skill-name]/
```
- [ ] All required files present
- [ ] File naming follows conventions
- [ ] Directory permissions correct

### YAML Frontmatter Validation
- [ ] YAML syntax valid
```bash
cat .claude/skills/[skill-name]/SKILL.md | head -15
```
- [ ] Three dashes before frontmatter (`---`)
- [ ] Three dashes after frontmatter (`---`)
- [ ] `name:` field present and non-empty
- [ ] `description:` field present and descriptive
- [ ] `allowed-tools:` list present
- [ ] No YAML syntax errors (indentation, colons, quotes)

### Scripts Validation
- [ ] Scripts are executable
```bash
ls -l .claude/skills/[skill-name]/scripts/**/*
```
- [ ] Scripts run without errors
- [ ] Scripts produce expected output
- [ ] Script error handling works

### Documentation Validation
- [ ] README is comprehensive (covers all features)
- [ ] QUICK_REFERENCE is truly one-page
- [ ] USAGE_EXAMPLES are practical and complete
- [ ] CHECKLIST is thorough
- [ ] No broken links in documentation
- [ ] All referenced files exist

### Skill Discoverability
- [ ] Skill appears in Claude's skill list
```
Ask Claude: "What skills are available?"
```
- [ ] Skill description is accurate
- [ ] Skill activates on correct triggers

### Functionality Testing
- [ ] Core functionality works
```
Test basic skill usage
```
- [ ] Edge cases handled
- [ ] Error handling proper
- [ ] Safety constraints enforced
- [ ] Subagents activate correctly (if applicable)
- [ ] Hooks work as expected (if applicable)

### Subagent Validation (if applicable)
- [ ] Subagents load correctly
- [ ] Subagent YAML frontmatter valid
- [ ] Subagents activate on correct conditions
- [ ] Subagent outputs are correct
- [ ] Integration with main skill works

**Phase 4 Status**: ⏳ Pending / 🔄 In Progress / ✅ Complete / ❌ Failures

---

## Phase 5: Integration & Commit

### Version Control Preparation
- [ ] `.gitignore` updated to allow skill files
```bash
echo "!.claude/skills/[skill-name]/" >> .gitignore
echo "!.claude/agents/[skill-name]-*.md" >> .gitignore
echo "!.claude/settings.json" >> .gitignore  # if hooks added
echo "!.mcp.json" >> .gitignore  # if MCP added
```

### Git Staging
- [ ] All skill files staged
```bash
git add -f .claude/skills/[skill-name]/
git add -f .claude/agents/[skill-name]-*.md  # if subagents
git add -f .claude/settings.json  # if hooks
git add -f .mcp.json  # if MCP
```
- [ ] Staged files reviewed
```bash
git status
```
- [ ] No unintended files staged

### Commit Message
- [ ] Descriptive commit message written
- [ ] Follows format:
```
feat: Add [Skill Name] skill

- [Key feature 1]
- [Key feature 2]
- [Key feature 3]
- Documentation: README, QUICK_REFERENCE, USAGE_EXAMPLES, CHECKLIST
- Templates: [list templates]
- [Subagents: list if any]
- [Safety features]

Follows official Claude Code Skills conventions.
```

### Commit & Push
- [ ] Changes committed
```bash
git commit -m "[commit message]"
```
- [ ] Commit successful (no errors)
- [ ] Changes pushed to remote
```bash
git push
```
- [ ] Push successful

### Team Communication
- [ ] Team notified of new skill (if applicable)
- [ ] Usage instructions shared
- [ ] Demo completed (if needed)

**Phase 5 Status**: ⏳ Pending / 🔄 In Progress / ✅ Complete

---

## Quality Checks

### Code Quality
- [ ] Follows established conventions
- [ ] Consistent naming throughout
- [ ] Clear, concise language
- [ ] No hardcoded paths (uses `$CLAUDE_PROJECT_DIR`)
- [ ] Proper error messages

### Documentation Quality
- [ ] Grammar and spelling correct
- [ ] Code examples work
- [ ] Links are valid
- [ ] Formatting consistent
- [ ] TODOs removed or addressed

### Usability
- [ ] Skill is intuitive to use
- [ ] Error messages are helpful
- [ ] Documentation is accessible
- [ ] Examples are practical
- [ ] Troubleshooting guide is useful

---

## Safety & Security

- [ ] No hardcoded secrets or API keys
- [ ] Dangerous operations require confirmation
- [ ] Input validation present (where applicable)
- [ ] Error messages don't leak sensitive data
- [ ] File permissions appropriate
- [ ] Scripts reviewed for security issues

---

## Performance

- [ ] Skill executes in reasonable time
- [ ] No unnecessary tool calls
- [ ] Efficient file operations
- [ ] Proper error handling (fails fast on errors)
- [ ] Resource usage reasonable

---

## Success Criteria

Overall success requires:

- [ ] All Phase 1-5 items complete
- [ ] YAML frontmatter valid and complete
- [ ] All required files present
- [ ] Documentation comprehensive and accurate
- [ ] Skill discoverable by Claude
- [ ] Core functionality tested and working
- [ ] Safety constraints enforced
- [ ] Changes committed and pushed
- [ ] No blocking issues

---

## Issues Encountered

Document any issues for future reference:

| Issue | Severity | Resolution | Notes |
|-------|----------|------------|-------|
| | High/Med/Low | | |
| | High/Med/Low | | |

---

## Final Status

**Overall Status**: ⏳ Pending / 🔄 In Progress / ✅ Complete / ❌ Failed

**Completion Date**: [YYYY-MM-DD HH:MM]

**Skill Name**: [Name of skill created]

**Sign-off**: ☐ Skill is production-ready and committed

---

## Post-Completion Actions

After skill is complete and committed:

- [ ] Test skill in real scenarios
- [ ] Gather user feedback
- [ ] Monitor for issues
- [ ] Plan improvements based on usage
- [ ] Update documentation if needed
- [ ] Share learnings with team

---

## Notes

[Any additional context, observations, or lessons learned during skill creation]

---

## Skill Builder Improvement Suggestions

[Suggestions for improving the Skill Builder process based on this experience]

---

**Legend**:
- ✅ Complete
- 🔄 In Progress
- ⏳ Pending
- ❌ Failed
- ⚠️ Needs Attention
- 💡 Suggestion

---

**Version**: 1.0.0 | **Last Updated**: 2025-10-19
