# Example Skill Specification: JSON Formatter

**Complexity Level**: Simple (5-10 minutes to implement)

This is an example specification you can use as a template when requesting Skill Builder to create a simple skill.

---

## Skill Identity

**Name**: JSON Formatter

**Purpose**: Format JSON files with consistent indentation and validate JSON structure

**Version**: 1.0.0

---

## Activation Triggers

The skill should activate when:
- User says "format JSON" or "prettify JSON"
- User provides a .json file that needs formatting
- User asks to standardize JSON indentation
- User works with package.json, tsconfig.json, or other config files

The skill should NOT activate when:
- User is working with JSON inside code files (use code formatter instead)
- User is writing new JSON from scratch

---

## Target Users

- All developers on the team
- Anyone working with JSON configuration files
- QA engineers reviewing config files

**Expertise Level**: Beginner-friendly

---

## Core Capabilities

### Must Have (MVP)
1. **Validate JSON**: Check JSON is syntactically correct before formatting
2. **Format with 2-space indentation**: Consistent formatting across all files
3. **Backup original**: Create .backup file before making changes
4. **Verify result**: Ensure formatted file is still valid JSON

### Nice to Have (Future)
- Support for 4-space indentation option
- Format multiple files at once
- Sort JSON keys alphabetically (optional)

---

## Tool Requirements

**Required Tools**:
- `Read`: Read JSON files
- `Write`: Write formatted JSON
- `Bash`: Run `jq` command for validation and formatting

**External Dependencies**:
- `jq`: JSON processor (must be installed)

---

## Safety & Security Considerations

### Safety Requirements
- **Always backup** before overwriting files
- **Validate JSON** before and after formatting
- **Clear error messages** when JSON is invalid
- **Confirm** before formatting multiple files

### Prohibited Operations
- Never format without backup
- Never overwrite if validation fails
- Never format non-JSON files

---

## Subagents

**Needed**: No

**Reason**: Simple formatting task, no need for specialized subagents

---

## Templates & Examples

### Templates Needed
None (formatting logic is inline in SKILL.md)

### Examples Needed
- Example 1: Format single JSON file (package.json)
- Example 2: Format multiple JSON files in directory
- Example 3: Handle invalid JSON gracefully

---

## Documentation Requirements

### README.md
- Installation verification (check jq is installed)
- Basic usage examples
- Troubleshooting common issues
- FAQ about backup files

### QUICK_REFERENCE.md
- Command patterns
- File location reference
- Quick troubleshooting

### USAGE_EXAMPLES.md
- Single file formatting
- Multiple file formatting
- Error handling examples

### CHECKLIST.md
- Pre-format verification
- Post-format validation
- Backup verification

---

## Integration Requirements

### Other Skills
No integration needed

### MCP Servers
No MCP integration needed

### Hooks
No hooks needed

---

## Testing Strategy

### Basic Functionality Tests
1. Format valid JSON → Success
2. Attempt to format invalid JSON → Clear error message
3. Verify backup created → Backup file exists
4. Verify formatted output is valid → jq validation passes

### Edge Cases
1. Empty JSON file
2. Very large JSON file (>1MB)
3. JSON with unicode characters
4. Nested JSON structures

---

## Success Metrics

The skill is successful if:
- JSON files are formatted with consistent 2-space indentation
- Backup files are always created before formatting
- Invalid JSON is detected and reported clearly
- Users find it intuitive and fast

---

## Example User Interaction

**User Request**: "Format package.json"

**Expected Skill Behavior**:
1. Read package.json
2. Run `jq . package.json` to validate
3. If valid, create package.json.backup
4. Format with `jq --indent 2 . package.json`
5. Write formatted content back
6. Report success: "✅ Formatted package.json (234 lines, 2-space indentation)"

---

## Notes

- This is a simple, single-purpose skill
- No subagents or complex templates needed
- Should take 5-10 minutes to implement with Skill Builder
- Good starting point for learning skill creation

---

**How to Use This Spec**:

```
Using Skill Builder, create a skill from this specification:
[Paste this entire document]
```

Or reference it:

```
Using Skill Builder, create a JSON Formatter skill following the example in examples/simple-formatter-spec.md
```

---

**Version**: 1.0.0 | **Last Updated**: 2025-10-19
