# Skill Builder - Create Production-Ready Claude Code Skills

**Skill Builder** is a meta-skill that guides you through creating new Claude Code Skills following official conventions and best practices. It automates the entire skill creation process from requirements to deployment.

## Overview

**Purpose**: Systematic creation of Claude Code Skills with proper structure, documentation, and safety

**When to Use**:
- User asks to "create a skill" or "build a skill"
- User provides a skill specification
- User wants to automate a repetitive workflow
- User wants project-specific tooling

**Key Features**:
- 5-phase guided workflow (Requirements → Architecture → Implementation → Validation → Integration)
- Comprehensive templates for all skill components
- Automated file structure creation
- Built-in validation and testing
- Git integration and versioning

## Quick Start

### Installation

Skill Builder is automatically discovered from `.claude/skills/skill-builder/`.

Verify installation:
```bash
ls -la .claude/skills/skill-builder/
```

### First Use

Try creating a simple skill:

```
Create a skill called "Git Commit Helper" that guides me through writing good commit messages.
```

Skill Builder will guide you through the 5 phases systematically.

## The 5-Phase Process

### Phase 1: Requirements Gathering

Skill Builder asks clarifying questions:
- What does the skill do?
- When should it activate?
- Who will use it?
- What tools does it need?
- Are there safety concerns?

**Output**: Completed `SKILL_REQUIREMENTS.md`

### Phase 2: Architecture Planning

Plans the complete skill structure:
- File organization
- YAML frontmatter specification
- Documentation suite
- Templates needed
- Subagents (if any)
- Hooks configuration
- MCP integration

**Output**: Completed `ARCHITECTURE_PLAN.md`

### Phase 3: Implementation

Creates all files systematically:
1. Core SKILL.md with proper YAML frontmatter
2. Documentation suite (README, QUICK_REFERENCE, USAGE_EXAMPLES, CHECKLIST)
3. Templates appropriate to skill's domain
4. Scripts (safety validators, helpers)
5. Subagents (if needed)
6. Hooks configuration
7. MCP configuration

**Output**: Complete skill directory structure

### Phase 4: Validation

Verifies the skill works:
- File structure correct
- YAML frontmatter valid
- Scripts executable
- Documentation complete
- Skill discoverable by Claude
- Basic functionality tests pass

**Output**: Validation report

### Phase 5: Integration & Commit

Finalizes the skill:
- Updates .gitignore to allow skill files
- Creates comprehensive git commit
- Documents usage for team
- Pushes to repository

**Output**: Skill committed and ready to use

## Templates Provided

Skill Builder includes templates for every component:

### Phase 1-2 Templates
- **SKILL_REQUIREMENTS.md**: Requirements gathering template
- **ARCHITECTURE_PLAN.md**: Architecture planning template

### Phase 3 Templates
- **SKILL_TEMPLATE.md**: Complete SKILL.md structure with YAML frontmatter
- **README_TEMPLATE.md**: Comprehensive documentation template
- **CHECKLIST_TEMPLATE.md**: Task completion verification template
- **SUBAGENT_TEMPLATE.md**: Subagent structure with YAML frontmatter

All templates are fill-in-the-blank style with clear instructions.

## Usage

### Basic Usage

1. **Request skill creation**:
   ```
   Using Skill Builder, create a skill for [purpose]
   ```

2. **Answer requirements questions**: Skill Builder will ask about purpose, triggers, tools, safety, etc.

3. **Approve architecture**: Review the planned structure

4. **Watch implementation**: Skill Builder creates all files systematically

5. **Verify and commit**: Skill Builder validates and commits the new skill

### Advanced Usage

#### Create Skill from Detailed Spec

If you have a detailed specification:

```
Using Skill Builder, create a skill from this spec:
[Paste detailed specification]
```

Skill Builder will parse the spec and proceed through phases.

#### Modify Existing Skill

To enhance an existing skill:

```
Using Skill Builder, add [feature] to the [Skill Name] skill
```

Skill Builder will analyze the existing skill and plan modifications.

## Features

### Guided Requirements Gathering

Skill Builder asks targeted questions to understand:
- Skill purpose and goals
- Activation triggers and scenarios
- Target users and expertise level
- Core capabilities and optional features
- Tool requirements and dependencies
- Safety and security considerations
- Subagent needs
- Template requirements
- Documentation needs

### Automated Architecture Planning

Based on requirements, Skill Builder:
- Designs file structure
- Plans YAML frontmatter
- Identifies documentation sections
- Specifies templates needed
- Plans scripts and subagents
- Configures hooks if needed
- Sets up MCP integration
- Estimates timeline

### Systematic Implementation

Skill Builder creates files in logical order:
1. Core skill definition
2. Documentation suite
3. Templates
4. Scripts
5. Subagents
6. Configuration

Progress tracked with TodoWrite.

### Comprehensive Validation

Skill Builder verifies:
- ✅ File structure correct
- ✅ YAML syntax valid
- ✅ Scripts executable
- ✅ Documentation complete
- ✅ Templates practical
- ✅ Skill discoverable
- ✅ No errors on load

### Git Integration

Skill Builder handles version control:
- Updates .gitignore appropriately
- Creates descriptive commit messages
- Commits all skill files
- Pushes to repository

## Troubleshooting

### Skill Not Loading

**Symptom**: New skill doesn't appear in Claude's skill list

**Cause**: Invalid YAML frontmatter or missing required fields

**Solution**:
```bash
# Verify YAML syntax
cat .claude/skills/[skill-name]/SKILL.md | head -10

# Check for:
# - Three dashes before and after frontmatter
# - name: field present
# - description: field present
# - Proper YAML formatting
```

### Scripts Not Executable

**Symptom**: Scripts fail to run with permission error

**Cause**: Scripts not marked executable

**Solution**:
```bash
chmod +x .claude/skills/[skill-name]/scripts/**/*
```

### Skill Activates Incorrectly

**Symptom**: Skill activates when it shouldn't (or doesn't when it should)

**Cause**: Vague or incorrect description in YAML frontmatter

**Solution**: Update description to be more specific about triggers:
```yaml
# ❌ Vague
description: Helps with development

# ✅ Specific
description: Automates code review against React 18 best practices. Use after commits or when user asks for review.
```

### Missing Templates

**Symptom**: Skill references templates that don't exist

**Cause**: Templates not created during Phase 3

**Solution**:
```bash
# Create missing template
touch .claude/skills/[skill-name]/templates/[template-name]

# Update SKILL.md to reference it properly
```

## Best Practices

### Do's ✅
- **Be specific in requirements**: Clear requirements lead to better skills
- **Use templates**: Don't start from scratch, use provided templates
- **Test thoroughly**: Verify skill works before committing
- **Document well**: Future you will thank present you
- **Follow conventions**: Stick to established patterns

### Don'ts ❌
- **Don't skip phases**: Each phase builds on previous ones
- **Don't vague descriptions**: Skills won't activate correctly
- **Don't skip validation**: Untested skills break in production
- **Don't forget .gitignore**: Skill files must be tracked
- **Don't hardcode paths**: Use `$CLAUDE_PROJECT_DIR` in hooks

## Customization

### Add Custom Templates

Create your own skill component templates:

```bash
# Add to templates directory
touch .claude/skills/skill-builder/templates/MY_TEMPLATE.md

# Reference in SKILL.md
```

### Modify Workflow

Skill Builder's 5-phase process is customizable. You can:
- Skip phases for simple skills
- Add phases for complex skills
- Customize questions in Phase 1
- Adjust validation criteria in Phase 4

## Performance

**Typical Skill Creation Time**:
- Simple skill: 5-10 minutes
- Medium complexity: 15-30 minutes
- Complex skill with subagents: 30-60 minutes

**Resource Usage**: Light (only file creation and git operations)

## Security

### Safety Features
- No dangerous operations by default
- Scripts reviewed before making executable
- Git commits require explicit confirmation
- .gitignore updates reviewed

### Permissions Required
- File read/write in .claude/ directory
- Git commit permissions
- Script execution permissions (for created scripts)

## Limitations

1. **Cannot create skills that require external compilation**: Skills must be interpreted (Markdown, Python, Bash)
2. **Cannot test MCP integrations automatically**: MCP servers must be tested manually
3. **Cannot validate skill logic**: Only structure and syntax are validated
4. **Project-scope only**: Creates project-level skills, not user-level skills

## FAQ

### Q: Can I create a skill without going through all 5 phases?
A: Yes, for simple skills you can skip Architecture Planning (Phase 2) and go straight to Implementation.

### Q: Can Skill Builder modify existing skills?
A: Yes, request modifications and Skill Builder will analyze the existing skill and apply changes systematically.

### Q: How do I share skills with my team?
A: Skills in `.claude/skills/` are automatically shared when committed to git. Team members will have access after pulling.

### Q: Can I create skills that use MCP servers?
A: Yes, Skill Builder helps configure MCP integration in Phase 2 and Phase 3.

### Q: What if I want a skill with very specific behavior?
A: Provide a detailed specification with examples. The more detail you provide, the better the resulting skill.

## Examples

See `USAGE_EXAMPLES.md` for detailed, practical examples of creating different types of skills.

Quick examples:

### Example 1: Simple Skill
```
Create a skill that formats JSON files with proper indentation.
```
Skill Builder creates a lightweight skill with templates for JSON formatting.

### Example 2: Complex Skill with Subagents
```
Create a comprehensive testing skill that generates unit tests, integration tests, and E2E tests for React components.
```
Skill Builder creates skill with multiple subagents (unit-test-generator, integration-test-generator, e2e-test-generator) and comprehensive templates.

## Architecture

### Components
- **SKILL.md**: Core skill definition with 5-phase process
- **Templates**: 6 templates for all skill components
- **Examples**: Sample skill specifications
- **Documentation**: This README, QUICK_REFERENCE, USAGE_EXAMPLES, CHECKLIST

### Workflow
```
User Request → Phase 1 (Requirements) → Phase 2 (Architecture) →
Phase 3 (Implementation) → Phase 4 (Validation) → Phase 5 (Integration) →
Complete Skill
```

## Version History

### v1.0.0 (2025-10-19)
- Initial release
- 5-phase guided workflow
- 6 comprehensive templates
- Automated validation
- Git integration

## Related Documentation

- **SKILL.md**: Core skill definition
- **QUICK_REFERENCE.md**: One-page reference card
- **USAGE_EXAMPLES.md**: Practical skill creation scenarios
- **CHECKLIST.md**: Skill building verification checklist
- **templates/**: All skill component templates

## Support

**Documentation**: You're reading it!
**Quick Help**: See QUICK_REFERENCE.md
**Examples**: See USAGE_EXAMPLES.md
**Issues**: Report problems via project's issue tracker

---

**Last Updated**: 2025-10-19
**Version**: 1.0.0
