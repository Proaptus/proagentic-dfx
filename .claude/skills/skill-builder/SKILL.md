---
name: Skill Builder
description: Guided workflow for creating new Claude Code Skills with proper structure, documentation, templates, subagents, and hooks. Use this when the user wants to create a new skill or asks you to build tooling/automation. Ensures skills follow official conventions and are production-ready.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# Skill Builder - Create Production-Ready Claude Code Skills

⚠️ **IMPORTANT: READ CLAUDE.md FIRST** - Before using this skill, read `/home/chine/projects/proagentic-clean/CLAUDE.md` completely, especially:
- Lines 105-225: Parallel Task Execution and MCP Tool Coordination
- Lines 800-880: MCP Coordination Best Practices
- New skills should follow the patterns and conventions defined in CLAUDE.md
- All new skills must include the CLAUDE.md first requirement (as demonstrated by updated skills)

> Meta-skill for building skills following official Claude Code conventions

## When to Use This Skill

- ✅ User explicitly asks to "create a skill" or "build a skill"
- ✅ User provides a detailed skill specification or concept
- ✅ User wants to automate a repetitive development workflow
- ✅ User wants to create project-specific tooling
- ✅ User says "make this into a skill" after describing a process

## 5-Phase Skill Building Process

### Phase 1: Requirements Gathering

Ask clarifying questions to understand:

1. **Skill Purpose**: What does this skill do?
2. **When to Use**: What triggers/scenarios activate this skill?
3. **Target Users**: Who will use this skill (project-specific or general)?
4. **Core Capabilities**: What are the main functions?
5. **Safety Requirements**: Any dangerous operations to block/control?
6. **Tool Requirements**: Which Claude Code tools are needed?
7. **Subagents Needed**: Any specialized agents needed?
8. **Templates/Examples**: What code templates would help adoption?

**Output**: Skill Requirements Document (see `templates/SKILL_REQUIREMENTS.md`)

### Phase 2: Architecture Planning

Based on requirements, plan:

```
Skill Structure:
├── SKILL.md                    # Core skill definition
├── README.md                   # Full documentation
├── QUICK_REFERENCE.md          # One-page reference
├── USAGE_EXAMPLES.md           # Practical scenarios
├── CHECKLIST.md                # Completion checklist
├── templates/                  # Code templates
│   ├── TEMPLATE_1.*
│   └── TEMPLATE_2.*
├── scripts/                    # Automation scripts
│   ├── safety/                 # Safety validators
│   └── helpers/                # Helper scripts
└── examples/                   # Example usage

Subagents (if needed):
├── .claude/agents/
│   ├── skill-name-agent-1.md
│   └── skill-name-agent-2.md

Configuration:
├── .claude/settings.json       # Hooks (if needed)
└── .mcp.json                   # MCP servers (if needed)
```

**Output**: Architecture Plan (see `templates/ARCHITECTURE_PLAN.md`)

### Phase 3: Implementation

Create files systematically:

**Step 1: Core SKILL.md**
- YAML frontmatter (name, description, allowed-tools)
- Clear methodology/workflow
- Safety rules
- Usage patterns
- Reference to documentation

Use template: `templates/SKILL_TEMPLATE.md`

**Step 2: Documentation Suite**
- README.md: Full documentation, troubleshooting, customization
- QUICK_REFERENCE.md: One-page quick reference card
- USAGE_EXAMPLES.md: 3-6 detailed usage scenarios
- CHECKLIST.md: Task completion verification

**Step 3: Templates**
- Create practical code templates for skill's domain
- Include comments explaining Context7 best practices
- Provide multiple variations (simple, advanced, edge cases)

**Step 4: Scripts (if needed)**
- Safety validators (Python/Bash)
- Helper automation (Bash)
- Make scripts executable: `chmod +x`

**Step 5: Subagents (if needed)**
- Create in `.claude/agents/`
- YAML frontmatter: name, description, model, tools
- Clear purpose and responsibilities
- Output format examples

**Step 6: Hooks (if needed)**
- Update `.claude/settings.json`
- PreToolUse: Block dangerous operations
- PostToolUse: Validate changes
- Use `$CLAUDE_PROJECT_DIR` for paths

**Step 7: MCP Configuration (if needed)**
- Update `.mcp.json`
- Add MCP servers required by skill
- Include clear setup instructions

### Phase 4: Validation

Verify the skill:

```bash
# 1. Check file structure
ls -la .claude/skills/<skill-name>/

# 2. Verify scripts are executable
ls -l .claude/skills/<skill-name>/scripts/**/*

# 3. Verify YAML frontmatter syntax
# Read SKILL.md and check formatting

# 4. Test skill is discoverable
# Ask Claude: "What skills are available?"

# 5. Test with simple prompt
# Try a basic usage of the skill
```

**Checklist**:
- [ ] SKILL.md has valid YAML frontmatter
- [ ] Description clearly states when to use skill
- [ ] All documentation files created
- [ ] Templates are practical and commented
- [ ] Scripts are executable
- [ ] Subagents have proper YAML frontmatter
- [ ] Hooks configuration is valid JSON
- [ ] Skill appears in Claude's skill list

### Phase 5: Integration & Commit

Finalize the skill:

1. **Update .gitignore** (if project-level skill):
   ```gitignore
   # Allow this skill
   !.claude/skills/<skill-name>/
   !.claude/agents/<skill-name>-*.md
   ```

2. **Create comprehensive commit**:
   ```bash
   git add -f .claude/skills/<skill-name>/ .claude/agents/<skill-name>-*.md
   git commit -m "feat: add <Skill Name> skill for Claude Code"
   git push origin main
   ```

3. **Document usage** for team members

## YAML Frontmatter Requirements

### SKILL.md Frontmatter (Required)

```yaml
---
name: Skill Name Here
description: Clear description stating what the skill does and when to use it. Claude uses this to decide when to activate the skill automatically. Be specific about triggers and use cases.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Task
---
```

**Fields**:
- `name` (required): Display name of the skill
- `description` (required): When/why to use this skill (critical for auto-activation)
- `allowed-tools` (optional): Restrict which tools Claude can use during skill execution
- `model` (optional): Specify model override (rarely needed)

### Subagent Frontmatter (Required)

```yaml
---
name: subagent-name
description: What this subagent does and when to use it proactively
model: inherit
tools: Read, Grep, Glob
---
```

## Templates Provided

This skill includes templates for:
- `SKILL_TEMPLATE.md` - Complete SKILL.md structure
- `README_TEMPLATE.md` - Documentation template
- `CHECKLIST_TEMPLATE.md` - Verification checklist
- `SUBAGENT_TEMPLATE.md` - Subagent structure
- `SKILL_REQUIREMENTS.md` - Requirements gathering
- `ARCHITECTURE_PLAN.md` - Planning document

## Best Practices

### Skill Design
1. **Single Responsibility**: Each skill should have one clear purpose
2. **Clear Triggers**: Description must clearly state when to use the skill
3. **Self-Contained**: Include all necessary templates and documentation
4. **Safe by Default**: Use allowed-tools to restrict dangerous operations
5. **Well-Documented**: Provide README, examples, and quick reference

### Documentation
1. **Layered Docs**: README (detailed), QUICK_REFERENCE (at-a-glance), EXAMPLES (practical)
2. **User-Centric**: Write from the user's perspective
3. **Troubleshooting**: Include common issues and solutions
4. **Visual Hierarchy**: Use headers, lists, code blocks effectively

### Templates
1. **Practical**: Templates should solve real problems
2. **Commented**: Explain why, not just what
3. **Best Practices**: Follow Context7 recommendations
4. **Variations**: Provide simple and advanced versions

### Safety
1. **Block Dangerous Commands**: Use hooks to prevent destructive operations
2. **Validate Input**: Check parameters before execution
3. **Graceful Errors**: Provide helpful error messages
4. **Rollback Plans**: Document how to undo changes

## Example: Building a "Code Review" Skill

### Phase 1: Requirements
```
Purpose: Automated code review against best practices
When: User commits code or asks for review
Users: All developers on project
Capabilities: Static analysis, Context7 validation, security checks
Safety: No code modifications, read-only operations
Tools: Read, Grep, Glob, Context7 MCP
Subagents: context7-validator, security-auditor
Templates: Review checklist, PR comment template
```

### Phase 2: Architecture
```
code-review/
├── SKILL.md (with allowed-tools: Read, Grep, Glob only)
├── README.md
├── QUICK_REFERENCE.md
├── USAGE_EXAMPLES.md
├── templates/
│   ├── REVIEW_CHECKLIST.md
│   └── PR_COMMENT.md
└── examples/
    └── sample-review.md

Subagents:
├── code-review-context7-validator.md
└── code-review-security-auditor.md

Hooks: PreToolUse to block Write/Edit during review
```

### Phase 3-5: Implementation → Validation → Commit

Follow the systematic process, creating each file, testing thoroughly, and committing when complete.

## Common Pitfalls to Avoid

❌ **Vague Description**: "Helps with development" → ✅ "Automates code review against React 18 and Express 4 best practices. Use after commits or when user asks for review."

❌ **Missing YAML Frontmatter**: Skill won't load → ✅ Always include name and description

❌ **No allowed-tools Restriction**: Too permissive → ✅ Restrict to minimum needed tools

❌ **Poor Documentation**: Users won't understand → ✅ Provide README, examples, quick ref

❌ **No Templates**: Users start from scratch → ✅ Include practical templates

❌ **Untested**: Skill breaks in production → ✅ Test thoroughly before committing

## Success Criteria

A well-built skill:
1. ✅ Loads without errors
2. ✅ Appears in Claude's skill list
3. ✅ Activates automatically on correct triggers
4. ✅ Has clear, comprehensive documentation
5. ✅ Includes practical templates
6. ✅ Follows safety best practices
7. ✅ Is committed to version control

## Interactive Mode

When user requests skill creation, guide them through each phase:

1. Ask requirements questions
2. Present architecture plan for approval
3. Create files systematically (show progress)
4. Validate each component
5. Commit when all tests pass

**Always use TodoWrite to track progress through the 5 phases.**

## Remember

- Skills are discovered automatically from `.claude/skills/` directory
- Description in YAML frontmatter determines when skill activates
- allowed-tools restricts Claude's capabilities during skill execution
- Templates accelerate adoption
- Documentation ensures long-term usability
- Testing prevents production issues

---

**See also**: `templates/` for all skill-building templates
