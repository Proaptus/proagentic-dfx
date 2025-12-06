# [Skill Name]

[One or two paragraph overview of what this skill does and why it's valuable]

## Overview

**Purpose**: [Main purpose of the skill]

**When to Use**: [Primary use cases]

**Key Features**:
- [Feature 1]
- [Feature 2]
- [Feature 3]

## Quick Start

### Installation

The skill is automatically discovered from `.claude/skills/[skill-name]/`.

Verify installation:
```bash
# Check skill files exist
ls -la .claude/skills/[skill-name]/

# Ask Claude to list skills
"What skills are available?"
```

### First Use

Try this simple example:

```
[Example prompt that demonstrates basic usage]
```

**Expected Result**: [What should happen]

## Usage

### Basic Usage

[Step-by-step guide for basic usage]

1. **[Step 1]**: [Description]
2. **[Step 2]**: [Description]
3. **[Step 3]**: [Description]

### Advanced Usage

[More complex scenarios]

#### Scenario 1: [Name]
[Detailed description]

#### Scenario 2: [Name]
[Detailed description]

## Configuration

[If skill has configuration options]

### Option 1: [Name]
```
[How to configure]
```

### Option 2: [Name]
```
[How to configure]
```

## Features

### Feature 1: [Name]
[Detailed explanation of feature]

**Example**:
```
[Usage example]
```

### Feature 2: [Name]
[Continue for each major feature]

## Templates

This skill includes the following templates:

### [Template Name]
**File**: `templates/[filename]`
**Purpose**: [What it's for]
**Usage**: [How to use it]

**Example**:
```[language]
[Template example]
```

### [Another Template]
[Repeat for each template]

## Subagents

[If skill uses subagents]

### [Subagent Name]
**Purpose**: [What it does]
**Activation**: [When it's used]
**Location**: `.claude/agents/[filename]`

## Troubleshooting

### Common Issues

#### Issue 1: [Problem Description]
**Symptoms**:
- [Symptom 1]
- [Symptom 2]

**Cause**: [Why it happens]

**Solution**:
```bash
[Commands or steps to fix]
```

#### Issue 2: [Problem Description]
[Repeat structure]

### Debugging

Enable debug mode:
```bash
[How to enable debugging if applicable]
```

### Getting Help

1. Check `QUICK_REFERENCE.md` for quick solutions
2. Review `USAGE_EXAMPLES.md` for practical scenarios
3. [Other support channels]

## Best Practices

### Do's ✅
- [Best practice 1]
- [Best practice 2]
- [Best practice 3]

### Don'ts ❌
- [Anti-pattern 1]
- [Anti-pattern 2]
- [Anti-pattern 3]

## Customization

### Extending the Skill

You can customize this skill by:

1. **[Customization 1]**: [How to do it]
2. **[Customization 2]**: [How to do it]

### Adding Templates

To add your own templates:

```bash
# Create new template
touch .claude/skills/[skill-name]/templates/my-template.[ext]

# Update SKILL.md to reference it
```

### Modifying Behavior

[How to modify skill behavior if applicable]

## Integration

### With Other Skills

This skill works well with:
- **[Skill Name]**: [How they work together]
- **[Skill Name]**: [How they work together]

### With MCP Servers

[If skill uses MCP servers]

Required MCP servers:
- **[Server Name]**: [Purpose]

Setup:
```bash
[Setup instructions]
```

### With CI/CD

[If skill can be used in CI/CD]

```yaml
# Example CI/CD integration
[Configuration example]
```

## Performance

**Typical Execution Time**: [X seconds/minutes]
**Resource Usage**: [Light/Medium/Heavy]
**Scalability**: [How it handles large projects]

## Security

### Safety Features
- [Safety feature 1]
- [Safety feature 2]

### Permissions Required
- [Permission 1]
- [Permission 2]

### Data Handling
[How skill handles sensitive data]

## Limitations

Be aware of these limitations:

1. **[Limitation 1]**: [Description and workaround if any]
2. **[Limitation 2]**: [Description and workaround]
3. **[Limitation 3]**: [Description and workaround]

## FAQ

### Q: [Common question 1]?
A: [Answer]

### Q: [Common question 2]?
A: [Answer]

### Q: [Common question 3]?
A: [Answer]

## Examples

See `USAGE_EXAMPLES.md` for detailed, practical examples.

Quick examples:

### Example 1: [Simple Case]
```
[User prompt]
```
Result: [What happens]

### Example 2: [Complex Case]
```
[User prompt]
```
Result: [What happens]

## Architecture

[Optional: Technical details about skill architecture]

### Components
- **SKILL.md**: [Purpose]
- **Templates**: [Purpose]
- **Scripts**: [Purpose]
- **Subagents**: [Purpose]

### Workflow Diagram
```
[Text-based workflow diagram if helpful]
User Request → [Step 1] → [Step 2] → [Step 3] → Result
```

## Contributing

[If skill is team-shared and can be improved]

To improve this skill:

1. **Suggest improvements**: [How]
2. **Report issues**: [Where]
3. **Add templates**: [Process]

## Version History

### v1.0.0 (YYYY-MM-DD)
- Initial release
- [Feature 1]
- [Feature 2]

### v1.1.0 (YYYY-MM-DD) [if applicable]
- [Enhancement 1]
- [Bug fix 1]

## Related Documentation

- **SKILL.md**: Core skill definition
- **QUICK_REFERENCE.md**: One-page reference
- **USAGE_EXAMPLES.md**: Practical scenarios
- **CHECKLIST.md**: Verification checklist

## License

[If applicable]

## Support

**Issues**: [Where to report problems]
**Questions**: [Where to ask questions]
**Updates**: [How to get notified of updates]

---

**Last Updated**: [YYYY-MM-DD]
**Maintainer**: [Name/Team]
