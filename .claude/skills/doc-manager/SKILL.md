---
name: Documentation Manager (Docs-as-Code)
description: Manages, consolidates, and optimizes project documentation following research-backed docs-as-code principles. Use this skill when documentation becomes scattered, duplicated, or contradictory after development work. Also use when user explicitly requests "tidy docs", "consolidate documentation", "clean up docs", or "organize documentation". Applies Diátaxis framework, enforces YAML front matter, resolves conflicts using evidence-based rules, and generates machine-readable manifest for AI agents. NEVER modifies CLAUDE.md.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Task
---

# Documentation Manager - Docs-as-Code Implementation

> Automated documentation management following research-backed principles for AI-optimized knowledge bases

## CRITICAL SAFETY RULE

**⛔ NEVER TOUCH CLAUDE.md**: The `CLAUDE.md` file is EXEMPT from all doc-manager operations. Do not read, edit, move, or analyze `CLAUDE.md` in any way.

## What This Skill Does

This skill implements a comprehensive **docs-as-code** workflow that:

1. **Inventories** all Markdown documentation across the entire project
2. **Analyzes** documents for duplicates, conflicts, and missing structure
3. **Consolidates** scattered documentation into a coherent, organized system
4. **Enforces** Diátaxis framework (tutorial, how-to, reference, explanation) + engineering types (ADR, Feature Card, Test Report, Runbook)
5. **Validates** YAML front matter against JSON Schema
6. **Links** documentation to code and tests
7. **Generates** machine-readable `manifest.json` for AI agent consumption
8. **Quarantines** (never deletes) unclear or contradictory documents

## When to Use This Skill

✅ **Use this skill when:**
- Documentation is scattered across multiple directories
- Multiple documents describe the same feature (duplicates)
- Contradictory information exists in different docs
- After feature development when many docs were created
- Documents lack structure or metadata
- User explicitly requests: "tidy docs", "consolidate documentation", "clean up docs"
- Regular maintenance (monthly/quarterly doc hygiene)

❌ **Do NOT use when:**
- Making small edits to a single document
- Writing new documentation from scratch (use templates directly)
- CLAUDE.md needs updating (NEVER touch this file)

## Workflow: 7-Phase Documentation Sweep

### Phase 1: Inventory & Discovery

**Objective**: Find and catalog ALL Markdown documents in the project

**Actions**:
1. Use `doc-manager-inventory` subagent to scan project
2. Exclude `CLAUDE.md` from all operations
3. Parse existing YAML front matter (if present)
4. Classify documents by type or mark as "unknown"
5. Generate `inventory.json` with all findings

**Output**: `docs/_index/inventory.json`

### Phase 2: Analysis & Conflict Detection

**Objective**: Identify problems requiring resolution

**Actions**:
1. Use `doc-manager-consolidator` to detect:
   - Duplicate documents (content similarity)
   - Conflicting information (same topic, different claims)
   - Orphaned documents (no clear purpose)
   - Scattered READMEs needing consolidation
2. Build conflict resolution plan

**Output**: Analysis report with conflicts and duplicates

### Phase 3: Conflict Resolution

**Objective**: Resolve contradictions using evidence-based rules

**Resolution Rules** (in priority order):
1. **Status Priority**: `accepted` > `proposed` > `draft`
2. **Evidence Priority**: Docs with `evidence.tests_passed: true` win
3. **Recency Priority**: Newer `last_verified_at` with passing tests
4. **ADR Authority**: Latest accepted ADR wins for architecture decisions
5. **Test Results**: Prefer docs pointing to passing CI runs

**Actions**:
1. Apply resolution rules systematically
2. Mark losers as `status: superseded`
3. Add `superseded_by` links (bidirectional)
4. Create resolution report

**Output**: Conflict resolution decisions

### Phase 4: Migration & Reorganization

**Objective**: Move documents into Diátaxis structure with proper metadata

**Actions**:
1. Create `docs/` structure if missing:
   ```
   docs/
   ├── _index/
   ├── feature/
   ├── howto/
   ├── reference/
   ├── explanation/
   ├── adr/
   ├── test-report/
   ├── runbook/
   └── quarantine/
   ```

2. For each document:
   - Add YAML front matter if missing (use heuristics)
   - Classify into Diátaxis category
   - Move to appropriate directory
   - Update internal links

3. Handle scattered READMEs:
   - Keep root `README.md`
   - Move component READMEs to `docs/explanation/` or `docs/reference/`
   - Update cross-references

**Output**: Organized `docs/` directory with migrated content

### Phase 5: Consolidation

**Objective**: Merge duplicates and clean up

**Actions**:
1. Merge duplicate Feature Cards:
   - Keep most complete/recent version
   - Mark others as `superseded`
   - Preserve bidirectional links
2. Quarantine unclear documents:
   - Move to `docs/quarantine/YYYY-MM-DD-HH-MM/`
   - Add `QUARANTINE_REASON.md` explaining why
3. Never delete (Git is backup, quarantine is safety net)

**Output**: Consolidated, minimal doc set

### Phase 6: Linking to Code & Tests

**Objective**: Create traceable documentation

**Actions**:
1. Use `doc-manager-linker` subagent to:
   - Find code files matching doc topics
   - Find test files validating doc claims
   - Add `code_refs` to front matter
   - Add `test_refs` to front matter
   - Link to CI runs when available

**Example**:
```yaml
code_refs:
  - path: "src/components/Dashboard.tsx#L15-L89"
  - symbol: "Dashboard.render"
test_refs:
  - path: "tests/components/Dashboard.test.tsx::test_renders_correctly"
  - ci_run: "gh-actions://runs/12345678"
```

**Output**: Docs with traceable links

### Phase 7: Finalization & Validation

**Objective**: Validate and generate manifest

**Actions**:
1. Use `doc-manager-validator` to validate ALL docs against JSON Schema
2. Fix validation errors
3. Generate `docs/_index/manifest.json`:
   - Machine-readable index of all docs
   - Include metadata (status, last_verified_at, owner, links)
   - Enable fast agent queries
4. Add search metadata:
   - `search.boost: 2` for canonical Feature Cards
   - `search.exclude: true` for archives/quarantine
5. Create final summary report

**Output**:
- `docs/_index/manifest.json`
- Validation report
- Summary of changes

## Subagent Coordination

This skill uses **4 specialized subagents** for parallel execution:

### 1. doc-manager-inventory
**Purpose**: Scan and catalog all documentation
**Tools**: Read, Grep, Glob
**Output**: `inventory.json` with all discovered docs

### 2. doc-manager-consolidator
**Purpose**: Detect duplicates, resolve conflicts, merge docs
**Tools**: Read, Grep, Edit, Write
**Output**: Consolidated document set with superseded links

### 3. doc-manager-validator
**Purpose**: Validate YAML front matter against JSON Schema
**Tools**: Read, Bash (Python script)
**Output**: Validation report with errors/warnings

### 4. doc-manager-linker
**Purpose**: Link docs to code and tests
**Tools**: Read, Grep, Glob, Edit
**Output**: Enhanced docs with `code_refs` and `test_refs`

## Execution Pattern

```javascript
// Launch parallel subagents for inventory and analysis
Task({
  description: "Inventory all documentation",
  prompt: "Use doc-manager-inventory subagent to scan entire project for .md files (excluding CLAUDE.md), parse YAML front matter, classify by type, and generate inventory.json in docs/_index/",
  subagent_type: "general-purpose"
}),
Task({
  description: "Analyze for conflicts and duplicates",
  prompt: "Use doc-manager-consolidator to analyze inventory, detect duplicate docs, identify conflicts, and create resolution plan using evidence-based rules",
  subagent_type: "general-purpose"
})

// After analysis, consolidate and reorganize
// Then link to code
// Finally validate and generate manifest
```

## YAML Front Matter Schema

All documents MUST have this structure:

```yaml
---
id: FEAT-2025-10-abc                    # Stable, unique ID
doc_type: feature|howto|reference|explanation|adr|test_report|runbook
title: "User profile import"
status: draft|proposed|accepted|deprecated|superseded
last_verified_at: 2025-10-25            # ISO date
owner: "@team-name"                     # CODEOWNERS format
supersedes: ["FEAT-2024-07-old"]        # Replaces these docs
superseded_by: []                       # Later replaced by these (if any)
code_refs:
  - path: "src/file.ts#L10-L50"
  - symbol: "ClassName.methodName"
test_refs:
  - path: "tests/file.test.ts::test_name"
  - ci_run: "gh-actions://runs/12345"
evidence:
  tests_passed: true
  coverage_delta: "+2.5%"
sources_of_truth: ["ADR-0012"]
search:
  boost: 2                              # Ranking boost
  exclude: false                        # Exclude from search?
keywords: ["profile", "import"]
---
```

## Safety Features

### 1. CLAUDE.md Protection
Hard-coded exclusion - NEVER touch this file under any circumstances.

### 2. Quarantine, Not Delete
Move questionable docs to `docs/quarantine/YYYY-MM-DD-HH-MM/` with explanation. Never permanently delete (Git history + quarantine = double safety).

### 3. Bulk Operation Confirmation
If >10 files will be moved/modified, ask user for confirmation before proceeding.

### 4. Dry-Run Mode
Preview changes before applying:
```bash
./scripts/doc-sweep.sh --dry-run
```

### 5. Immutable ADRs
Architectural Decision Records are never deleted. Only update status and add superseded links.

## Templates Provided

This skill includes ready-to-use templates:

- **FEATURE_CARD.md** - Document a feature/capability
- **ADR_TEMPLATE.md** - Architectural decisions (MADR format)
- **HOWTO_TEMPLATE.md** - Step-by-step guides
- **REFERENCE_TEMPLATE.md** - API/configuration reference
- **EXPLANATION_TEMPLATE.md** - Concepts and explanations
- **TEST_REPORT_TEMPLATE.md** - Test execution results
- **RUNBOOK_TEMPLATE.md** - Operational procedures
- **README_TEMPLATE.md** - Standard README structure
- **frontmatter-schema.json** - JSON Schema for validation

## Scripts Provided

- **doc-sweep.sh** - Main orchestration script (runs all 7 phases)
- **validate-frontmatter.py** - YAML validation against JSON Schema
- **generate-manifest.py** - Create manifest.json from docs
- **quarantine-doc.sh** - Move doc to quarantine with timestamp
- **inventory-docs.sh** - Scan and catalog all documentation
- **link-to-code.py** - Find and link code/test references

## Quick Start

```bash
# Run complete doc sweep
cd .claude/skills/doc-manager
./scripts/doc-sweep.sh

# Dry-run to preview changes
./scripts/doc-sweep.sh --dry-run

# Just validate existing docs
./scripts/validate-frontmatter.py

# Generate manifest only
./scripts/generate-manifest.py
```

## Success Criteria

After running doc-manager, you should have:

✅ All docs in proper Diátaxis directories
✅ All docs with valid YAML front matter
✅ No duplicate Feature Cards
✅ Conflicts resolved with clear superseded links
✅ Docs linked to code and tests
✅ `docs/_index/manifest.json` generated
✅ Unclear docs quarantined (not deleted)
✅ Search metadata optimized
✅ CLAUDE.md untouched

## Maintenance

Run doc-manager regularly:
- **Monthly**: Light sweep for new docs
- **Quarterly**: Full 7-phase sweep
- **After major features**: Consolidate new documentation
- **Before releases**: Ensure docs are current and accurate

## References

This skill implements patterns from:
- **Diátaxis Framework**: Structured documentation taxonomy
- **ADR Best Practices**: Immutable decision logs with status
- **Docs-as-Code**: Version-controlled, CI-validated documentation
- **JSON Schema 2020-12**: Metadata validation
- **SWE-bench Verified**: Test-based truth verification

---

**See also**:
- `README.md` - Full documentation and troubleshooting
- `QUICK_REFERENCE.md` - One-page cheat sheet
- `USAGE_EXAMPLES.md` - Practical usage scenarios
- `templates/` - All document templates
- `scripts/` - Automation scripts
