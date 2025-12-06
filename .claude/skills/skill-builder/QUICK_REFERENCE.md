# Skill Builder - Quick Reference

**One-page reference card for creating Claude Code Skills**

---

## 🎯 The 5-Phase Process

```
1. Requirements Gathering → Clarify purpose, triggers, tools, safety
2. Architecture Planning → Design structure, frontmatter, docs, templates
3. Implementation      → Create SKILL.md, docs, templates, scripts, subagents
4. Validation          → Verify structure, YAML, executability, discoverability
5. Integration         → Update .gitignore, commit, push
```

---

## 📁 Required File Structure

```
.claude/skills/[skill-name]/
├── SKILL.md                    # Core definition (YAML frontmatter required!)
├── README.md                   # Comprehensive documentation
├── QUICK_REFERENCE.md          # This file
├── USAGE_EXAMPLES.md           # Practical scenarios
├── CHECKLIST.md                # Verification checklist
├── templates/                  # Fill-in-the-blank templates
│   ├── [template1].[ext]
│   └── [template2].[ext]
├── scripts/                    # Helper scripts (if needed)
│   └── [script].sh or .py
└── examples/                   # Example specifications (optional)

.claude/agents/                 # Subagents (if needed)
└── [skill-name]-[agent].md    # YAML frontmatter required!
```

---

## 🔑 Critical: YAML Frontmatter

**Every SKILL.md and subagent MUST start with:**

```yaml
---
name: [Skill Name]
description: Clear, specific description stating what this skill does and when to use it. Include activation triggers.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Task
---
```

**Common Mistakes:**
- ❌ Missing three dashes before/after frontmatter
- ❌ Vague description → Skill won't activate correctly
- ❌ Missing `name:` or `description:` fields
- ❌ Invalid YAML syntax (wrong indentation)

---

## 🚀 Quick Start Commands

### Invoke Skill Builder
```
Using Skill Builder, create a skill for [purpose]
```

### Example Requests
```
Create a skill that formats JSON files with proper indentation.
Create a comprehensive testing skill that generates unit tests for React components.
Using Skill Builder, add [feature] to the [Skill Name] skill
```

---

## 📋 Phase 1: Requirements Template

Use `templates/SKILL_REQUIREMENTS.md` to gather:
- **Skill Identity**: Name, purpose, version
- **Activation Triggers**: When should it run?
- **Target Users**: Who uses it?
- **Core Capabilities**: What does it do?
- **Tool Requirements**: Which tools does it need?
- **Safety Concerns**: Any dangerous operations?
- **Subagents**: Need specialized helpers?
- **Templates**: What fill-in templates are helpful?

---

## 📋 Phase 2: Architecture Template

Use `templates/ARCHITECTURE_PLAN.md` to plan:
- **File Structure**: What files to create?
- **YAML Frontmatter**: Exact specification
- **Documentation Sections**: What to document?
- **Templates**: What templates to provide?
- **Scripts**: Any automation needed?
- **Subagents**: Specialized agents needed?
- **Hooks Configuration**: PreToolUse? PostToolUse?
- **MCP Integration**: External services?

---

## 📋 Phase 3: Implementation Templates

### Core Skill
Use `templates/SKILL_TEMPLATE.md` for SKILL.md structure

### Documentation Suite
- Use `templates/README_TEMPLATE.md` for README.md
- Use `templates/CHECKLIST_TEMPLATE.md` for CHECKLIST.md

### Subagents
Use `templates/SUBAGENT_TEMPLATE.md` for each subagent

---

## 📋 Phase 4: Validation Checklist

```bash
# File structure correct?
ls -la .claude/skills/[skill-name]/

# YAML syntax valid?
cat .claude/skills/[skill-name]/SKILL.md | head -10

# Scripts executable?
ls -l .claude/skills/[skill-name]/scripts/**/*

# Skill discoverable by Claude?
# Ask Claude: "What skills are available?"

# No errors on load?
# Check Claude startup logs
```

---

## 📋 Phase 5: Integration Commands

```bash
# Update .gitignore
echo "!.claude/skills/[skill-name]/" >> .gitignore
echo "!.claude/agents/[skill-name]-*.md" >> .gitignore

# Commit skill files
git add -f .claude/skills/[skill-name]/ .claude/agents/[skill-name]-*.md
git commit -m "feat: Add [Skill Name] skill

- Core skill definition with YAML frontmatter
- Documentation suite (README, QUICK_REFERENCE, USAGE_EXAMPLES, CHECKLIST)
- Templates for [list templates]
- Subagents: [list if any]
- Safety: [safety features]

Follows official Claude Code Skills conventions."

# Push to repository
git push
```

---

## 🛠️ Troubleshooting Quick Fixes

### Skill Not Loading
```bash
# Check YAML frontmatter
cat .claude/skills/[skill-name]/SKILL.md | head -10
# Fix: Ensure three dashes before/after, name: and description: present
```

### Scripts Not Executable
```bash
chmod +x .claude/skills/[skill-name]/scripts/**/*
```

### Skill Activates Incorrectly
```yaml
# ❌ Vague
description: Helps with development

# ✅ Specific
description: Automates code review against React 18 best practices. Use after commits or when user asks for review.
```

---

## 💡 Best Practices

### Do's ✅
- **Specific descriptions**: Include clear activation triggers
- **Use templates**: Don't start from scratch
- **Test thoroughly**: Verify before committing
- **Document well**: README, examples, quick reference
- **Follow conventions**: Stick to established patterns

### Don'ts ❌
- **Don't skip phases**: Each builds on previous
- **Don't use vague descriptions**: Skills won't activate
- **Don't skip validation**: Test before committing
- **Don't forget .gitignore**: Skills must be tracked
- **Don't hardcode paths**: Use `$CLAUDE_PROJECT_DIR`

---

## 📚 Template Quick Reference

| Template | Purpose | When to Use |
|----------|---------|-------------|
| SKILL_REQUIREMENTS.md | Requirements gathering | Phase 1 |
| ARCHITECTURE_PLAN.md | Architecture planning | Phase 2 |
| SKILL_TEMPLATE.md | Core SKILL.md structure | Phase 3 |
| README_TEMPLATE.md | Comprehensive docs | Phase 3 |
| CHECKLIST_TEMPLATE.md | Verification checklist | Phase 3 |
| SUBAGENT_TEMPLATE.md | Subagent structure | Phase 3 (if needed) |

---

## 🎯 Common Skill Patterns

### Simple Skill (No Subagents)
```
SKILL.md + README.md + 1-2 templates + CHECKLIST.md
Time: 5-10 minutes
```

### Medium Skill (With Scripts)
```
SKILL.md + README.md + templates/ + scripts/ + CHECKLIST.md
Time: 15-30 minutes
```

### Complex Skill (With Subagents)
```
SKILL.md + README.md + templates/ + scripts/ + 2-3 subagents + hooks + CHECKLIST.md
Time: 30-60 minutes
```

---

## 🔗 Related Files

- **SKILL.md**: Core skill definition and 5-phase process
- **README.md**: Comprehensive documentation with troubleshooting
- **USAGE_EXAMPLES.md**: Practical skill creation scenarios
- **CHECKLIST.md**: Verification checklist for skill building
- **templates/**: All component templates

---

## 🚨 Critical Reminders

1. **YAML frontmatter is MANDATORY** - Skills won't load without it
2. **description field determines activation** - Be specific!
3. **allowed-tools restricts capabilities** - List all needed tools
4. **Test before committing** - Validate structure and functionality
5. **Update .gitignore** - Skills must be tracked in git

---

**Quick Help**: If stuck, see README.md section on troubleshooting

**Version**: 1.0.0 | **Last Updated**: 2025-10-19
