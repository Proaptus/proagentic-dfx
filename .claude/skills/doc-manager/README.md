# Documentation Manager - Full Documentation

> Research-backed documentation management for AI-optimized codebases

## Table of Contents

1. [Overview](#overview)
2. [When to Use](#when-to-use)
3. [Installation](#installation)
4. [How It Works](#how-it-works)
5. [7-Phase Workflow](#7-phase-workflow)
6. [Templates](#templates)
7. [Scripts](#scripts)
8. [Subagents](#subagents)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)
12. [Advanced Usage](#advanced-usage)

## Overview

The **Documentation Manager** skill automates the organization, validation, and maintenance of project documentation following research-backed principles:

- **Diátaxis Framework**: Separates docs into tutorial, how-to, reference, explanation
- **Docs-as-Code**: Version-controlled, CI-validated, living documentation
- **Evidence-Based Truth**: Prefers docs with passing tests and recent verification
- **Machine-Readable**: YAML front matter + JSON Schema validation
- **Traceable**: Links docs to code and tests
- **AI-Optimized**: Generates manifest.json for fast agent queries

### What Problems Does It Solve?

❌ **Before doc-manager**:
- Documentation scattered across 20+ directories
- 5 different documents claiming to describe the same feature
- Contradictory information ("Feature X is complete" vs "Feature X is broken")
- No way to know which doc is current/accurate
- Failed experiment write-ups mixed with actual documentation
- AI agents confused by misleading or duplicate content

✅ **After doc-manager**:
- Single source of truth for each feature
- Clear Diátaxis structure (tutorial, how-to, reference, explanation, ADR)
- Conflicts resolved using test results and timestamps
- All docs have machine-readable metadata
- Links from docs to code and tests
- `manifest.json` for fast agent lookups
- Unclear docs quarantined (not lost, but marked for review)

## When to Use

### Triggers for Running doc-manager

✅ **Use this skill when:**

1. **After Feature Development**
   - Multiple docs created during implementation
   - "Success" write-ups that may not reflect reality
   - Temporary notes and experiments left behind

2. **Documentation Debt Accumulation**
   - Docs haven't been organized in weeks/months
   - New contributors find docs confusing
   - Multiple contradictory docs exist

3. **Before Major Releases**
   - Need to ensure docs are accurate and current
   - Want to present clean documentation to users
   - Preparing for external audit or review

4. **Regular Maintenance**
   - Monthly/quarterly doc hygiene sweeps
   - Continuous improvement of documentation quality

5. **User Explicitly Requests**
   - "Tidy up the docs"
   - "Consolidate documentation"
   - "Clean up scattered markdown files"
   - "Organize project documentation"

### When NOT to Use

❌ **Do NOT use when:**
- Editing a single document (use Edit tool directly)
- Writing brand new documentation (use templates)
- CLAUDE.md needs updating (NEVER touch this file with doc-manager)
- Making small typo fixes

## Installation

The skill is already installed in `.claude/skills/doc-manager/`. No additional setup required.

### Prerequisites

- Python 3.8+ (for validation and manifest generation scripts)
- `PyYAML` and `jsonschema` Python packages

Install Python dependencies:

```bash
pip install pyyaml jsonschema
```

### Verify Installation

```bash
# Check skill is discoverable
ls -la .claude/skills/doc-manager/

# Test scripts are executable
ls -l .claude/skills/doc-manager/scripts/
```

## How It Works

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. INVENTORY: Scan all .md files (except CLAUDE.md)       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ANALYSIS: Detect duplicates, conflicts, orphans          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. RESOLVE: Apply evidence-based rules to conflicts        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. MIGRATE: Add YAML, move to Diátaxis structure           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. CONSOLIDATE: Merge duplicates, quarantine unclear       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. LINK: Add code_refs and test_refs                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. FINALIZE: Validate YAML, generate manifest.json         │
└─────────────────────────────────────────────────────────────┘
```

### Parallel Subagent Execution

The skill uses **4 specialized subagents** running in parallel for speed:

```javascript
// Phase 1: Inventory + Analysis (parallel)
Task("doc-manager-inventory", "Scan and catalog all docs"),
Task("doc-manager-consolidator", "Detect duplicates and conflicts")

// Phase 6: Linking (parallel)
Task("doc-manager-linker", "Link docs to code and tests")

// Phase 7: Validation (final)
Task("doc-manager-validator", "Validate YAML and generate manifest")
```

## 7-Phase Workflow

### Phase 1: Inventory & Discovery

**Goal**: Find all Markdown documentation

**Process**:
1. Walk entire project directory tree
2. Find all `*.md` files
3. **SKIP** `CLAUDE.md` (hard-coded exclusion)
4. Parse YAML front matter (if exists)
5. Classify by `doc_type` or mark as "unknown"
6. Build `inventory.json`

**Output**: `docs/_index/inventory.json`

**Example Inventory Entry**:
```json
{
  "path": "src/components/Dashboard/README.md",
  "has_frontmatter": false,
  "detected_type": "explanation",
  "word_count": 450,
  "last_modified": "2025-10-20T15:30:00Z"
}
```

### Phase 2: Analysis & Conflict Detection

**Goal**: Identify problems

**Detection Methods**:

1. **Duplicate Detection**:
   - Content similarity (shingling, embeddings)
   - Same feature referenced (file paths, keywords)
   - Multiple Feature Cards for one component

2. **Conflict Detection**:
   - Same topic, different claims
   - Status conflicts ("complete" vs "in-progress")
   - Test evidence conflicts (one says tests pass, another says fail)

3. **Orphan Detection**:
   - No clear doc_type
   - No owner
   - No links to code or tests

**Output**: Analysis report with conflicts and recommendations

### Phase 3: Conflict Resolution

**Goal**: Resolve contradictions using objective rules

**Resolution Rules** (priority order):

1. **Status Priority**:
   ```
   accepted > proposed > draft > (no status)
   ```

2. **Evidence Priority**:
   ```
   evidence.tests_passed: true > false > missing
   ```

3. **Recency Priority**:
   ```
   Newer last_verified_at WITH passing tests wins
   ```

4. **ADR Authority**:
   ```
   Latest accepted ADR wins for architecture claims
   ```

5. **Test Results**:
   ```
   Doc pointing to passing CI run > failing run > no run
   ```

**Actions**:
- Winner: Keep as-is, possibly boost status to `accepted`
- Loser: Set `status: superseded`, add `superseded_by: [winner-id]`
- Update winner with `supersedes: [loser-id]`

**Example Resolution**:

Before:
```
docs/old-feature-doc.md:
  status: draft
  last_verified_at: 2025-09-01
  evidence: (missing)

docs/new-feature-doc.md:
  status: accepted
  last_verified_at: 2025-10-20
  evidence: { tests_passed: true }
```

After:
```
docs/old-feature-doc.md:
  status: superseded
  superseded_by: ["FEAT-2025-10-new"]

docs/new-feature-doc.md:
  status: accepted
  supersedes: ["FEAT-2025-09-old"]
```

### Phase 4: Migration & Reorganization

**Goal**: Create Diátaxis structure and add metadata

**Directory Structure Created**:

```
docs/
├── _index/
│   ├── inventory.json
│   └── manifest.json
├── feature/              # Feature Cards (what the system does)
├── howto/                # Step-by-step task guides
├── reference/            # API docs, configuration, lookup
├── explanation/          # Concepts, architecture, "why"
├── adr/                  # Architectural Decision Records
├── test-report/          # Test execution summaries
├── runbook/              # Operational procedures
└── quarantine/           # Docs needing human review
    └── 2025-10-25-14-30/ # Timestamped quarantine batches
```

**Migration Process**:

For each document:

1. **Add YAML Front Matter** (if missing):
   - Generate unique `id`
   - Classify `doc_type` using heuristics
   - Set initial `status: draft`
   - Add `last_verified_at: <today>`
   - Infer `owner` from Git history or CODEOWNERS

2. **Classify Document Type**:

   Heuristics for classification:
   - Contains "Step 1", "Step 2" → `howto`
   - Contains ADR number or "Decision" → `adr`
   - Contains API endpoints, config options → `reference`
   - Contains "why", "concept", "background" → `explanation`
   - Contains test results, CI links → `test_report`
   - Contains "Feature:", code_refs → `feature`

3. **Move to Appropriate Directory**:
   ```bash
   mv src/components/Dashboard/README.md \
      docs/explanation/dashboard-architecture.md
   ```

4. **Update Internal Links**:
   - Rewrite relative paths
   - Add bidirectional links

### Phase 5: Consolidation

**Goal**: Merge duplicates and clean up

**Merge Process**:

1. **Identify Canonical Document**:
   - Most recent with passing tests
   - Highest status (accepted > proposed > draft)
   - Most complete (most sections filled)

2. **Merge Content**:
   - Take all sections from canonical
   - Add unique content from duplicates
   - Preserve history in "Version History" section

3. **Mark Duplicates as Superseded**:
   ```yaml
   status: superseded
   superseded_by: ["FEAT-2025-10-canonical"]
   ```

4. **Quarantine Unclear Docs**:

   Move to `docs/quarantine/YYYY-MM-DD-HH-MM/` if:
   - No clear topic
   - Contradicts tests
   - Appears to be experiment/draft with no value
   - No evidence of accuracy

   Create `QUARANTINE_REASON.md`:
   ```markdown
   # Quarantine Reason

   **Document**: experiment-notes.md
   **Quarantined**: 2025-10-25 14:30
   **Reason**: Experimental notes from failed implementation attempt.
                Claims feature is complete but tests show it's not implemented.
                No code_refs or test_refs found.
   **Action**: Review manually to determine if salvageable.
   ```

**Never Delete**: Docs are moved to quarantine, not deleted. Git history + quarantine = double safety.

### Phase 6: Linking to Code & Tests

**Goal**: Make documentation traceable

**Linking Process**:

1. **Code Reference Discovery**:
   - Parse document for mentioned files
   - Search codebase for symbols/functions discussed
   - Use tree-sitter or grep for symbol lookup
   - Add to `code_refs`

2. **Test Reference Discovery**:
   - Find test files related to code_refs
   - Search for test names matching doc topics
   - Link to CI runs (GitHub Actions, etc.)
   - Add to `test_refs`

3. **Source Links**:
   - Add line number ranges for precision
   - Link to specific commits when relevant

**Example Enhanced Front Matter**:

```yaml
---
id: FEAT-2025-10-dashboard
doc_type: feature
title: "Dashboard Component"
code_refs:
  - path: "src/components/Dashboard/Dashboard.tsx#L15-L89"
  - symbol: "Dashboard.render"
  - path: "src/components/Dashboard/hooks/useDashboardData.ts"
test_refs:
  - path: "tests/components/Dashboard.test.tsx::test_renders_correctly"
  - path: "tests/components/Dashboard.test.tsx::test_handles_error_state"
  - ci_run: "gh-actions://runs/12345678"
evidence:
  tests_passed: true
  coverage_delta: "+3.2%"
---
```

### Phase 7: Finalization & Validation

**Goal**: Validate and generate manifest

**Validation**:

1. **YAML Front Matter Validation**:
   - Run `validate-frontmatter.py` against JSON Schema
   - Check required fields (id, doc_type, title, status, last_verified_at, owner)
   - Verify enum values (status, doc_type)
   - Check date formats

2. **Link Validation**:
   - Verify `code_refs` paths exist
   - Verify `test_refs` paths exist
   - Check `supersedes` and `superseded_by` links are bidirectional

3. **Content Validation**:
   - Ensure title matches front matter
   - Check for broken internal links

**Manifest Generation**:

Create `docs/_index/manifest.json`:

```json
{
  "generated_at": "2025-10-25T14:30:00Z",
  "total_docs": 47,
  "by_type": {
    "feature": 12,
    "howto": 8,
    "reference": 5,
    "explanation": 10,
    "adr": 7,
    "test_report": 3,
    "runbook": 2
  },
  "by_status": {
    "accepted": 35,
    "proposed": 5,
    "draft": 4,
    "superseded": 3
  },
  "features": [
    {
      "id": "FEAT-2025-10-dashboard",
      "title": "Dashboard Component",
      "path": "docs/feature/dashboard.md",
      "status": "accepted",
      "last_verified_at": "2025-10-25",
      "owner": "@team-frontend",
      "code_refs": ["src/components/Dashboard/Dashboard.tsx"],
      "test_refs": ["tests/components/Dashboard.test.tsx"],
      "evidence": { "tests_passed": true },
      "search": { "boost": 2 }
    }
  ]
}
```

**Search Optimization**:
- Add `search.boost: 2` to canonical Feature Cards
- Add `search.exclude: true` to quarantine, superseded, and archive docs

## Templates

The skill provides 8 ready-to-use templates:

### 1. FEATURE_CARD.md

Documents a feature, capability, or component.

**Use when**: Describing what the system can do

**Structure**:
- TL;DR (one-sentence summary)
- Behavior (inputs, outputs, side effects)
- Configuration & Flags
- File & Symbol Map
- Evidence (tests, ADRs)
- Limitations

### 2. ADR_TEMPLATE.md

Architectural Decision Record (MADR format).

**Use when**: Documenting architectural/technical decisions

**Structure**:
- Context (the problem)
- Decision (what was decided)
- Consequences (implications)
- Status (proposed/accepted/deprecated/superseded)

### 3. HOWTO_TEMPLATE.md

Step-by-step task guide.

**Use when**: Teaching someone how to accomplish a specific task

**Structure**:
- Goal (what you'll accomplish)
- Prerequisites
- Steps (numbered, sequential)
- Verification (how to confirm success)

### 4. REFERENCE_TEMPLATE.md

API documentation, configuration reference, or lookup table.

**Use when**: Providing quick-lookup information

**Structure**:
- Overview
- Parameters/Options (table format)
- Examples
- See Also

### 5. EXPLANATION_TEMPLATE.md

Concept explanation or architectural overview.

**Use when**: Explaining "why" or providing background understanding

**Structure**:
- Overview (what this is about)
- Concepts (key ideas)
- How It Works (explanation)
- Related Topics

### 6. TEST_REPORT_TEMPLATE.md

Test execution results and evidence.

**Use when**: Documenting test outcomes, not test plans

**Structure**:
- Summary (pass/fail counts)
- Test Results (detailed breakdown)
- CI Run Links
- Coverage Impact

### 7. RUNBOOK_TEMPLATE.md

Operational procedures for production incidents.

**Use when**: Documenting on-call procedures, troubleshooting

**Structure**:
- Alert/Symptom
- Diagnosis Steps
- Resolution Steps
- Prevention

### 8. README_TEMPLATE.md

Standard README structure for repositories/components.

**Use when**: Creating or standardizing README files

**Structure**:
- Overview
- Installation
- Usage
- Configuration
- Contributing
- License

## Scripts

### 1. doc-sweep.sh

**Main orchestration script** - runs all 7 phases.

```bash
# Full sweep
./scripts/doc-sweep.sh

# Dry-run (preview only)
./scripts/doc-sweep.sh --dry-run

# Specific phases
./scripts/doc-sweep.sh --phase inventory,analysis
```

**Options**:
- `--dry-run`: Preview changes without applying
- `--phase <phase-list>`: Run specific phases only
- `--skip-confirmation`: Don't ask for bulk operation approval

### 2. validate-frontmatter.py

Validate YAML front matter against JSON Schema.

```bash
# Validate all docs
python3 scripts/validate-frontmatter.py

# Validate specific file
python3 scripts/validate-frontmatter.py docs/feature/dashboard.md

# Strict mode (fail on warnings)
python3 scripts/validate-frontmatter.py --strict
```

**Output**:
```
✓ docs/feature/dashboard.md: Valid
✗ docs/howto/setup.md: Missing required field 'owner'
⚠ docs/adr/ADR-0012.md: Warning: old date format (update to ISO)
```

### 3. generate-manifest.py

Generate `manifest.json` from all docs.

```bash
# Generate manifest
python3 scripts/generate-manifest.py

# Output to custom location
python3 scripts/generate-manifest.py --output custom/path/manifest.json

# Include quarantined docs
python3 scripts/generate-manifest.py --include-quarantine
```

### 4. quarantine-doc.sh

Move a document to quarantine with timestamp.

```bash
# Quarantine a doc with reason
./scripts/quarantine-doc.sh docs/old-notes.md "Experimental notes, no evidence"

# Quarantine multiple docs
./scripts/quarantine-doc.sh docs/draft-*.md "Unfinished drafts"
```

### 5. inventory-docs.sh

Scan and catalog all documentation.

```bash
# Full inventory
./scripts/inventory-docs.sh

# Inventory specific directory
./scripts/inventory-docs.sh src/components/
```

### 6. link-to-code.py

Find and add code/test references to docs.

```bash
# Link all docs
python3 scripts/link-to-code.py

# Link specific doc
python3 scripts/link-to-code.py docs/feature/dashboard.md

# Dry-run
python3 scripts/link-to-code.py --dry-run
```

## Subagents

### doc-manager-inventory

**Purpose**: Scan filesystem and catalog all Markdown docs

**Tools**: Read, Grep, Glob

**Responsibilities**:
- Find all `.md` files (skip CLAUDE.md)
- Parse YAML front matter
- Classify documents
- Generate inventory.json

**Output Format**:
```json
{
  "scanned_at": "2025-10-25T14:00:00Z",
  "total_files": 73,
  "with_frontmatter": 28,
  "without_frontmatter": 45,
  "by_directory": {
    "docs/": 15,
    "src/": 30,
    "server/": 12,
    ".": 16
  },
  "files": [...]
}
```

### doc-manager-consolidator

**Purpose**: Detect duplicates, resolve conflicts, merge docs

**Tools**: Read, Grep, Edit, Write

**Responsibilities**:
- Detect content similarity
- Identify conflicts
- Apply resolution rules
- Merge duplicates
- Mark superseded docs

**Output Format**:
- Consolidated docs with proper front matter
- Conflict resolution report

### doc-manager-validator

**Purpose**: Validate YAML against JSON Schema

**Tools**: Read, Bash (runs Python script)

**Responsibilities**:
- Load JSON Schema
- Parse YAML front matter
- Validate against schema
- Report errors and warnings

**Output Format**:
```json
{
  "validated_at": "2025-10-25T14:30:00Z",
  "total_docs": 47,
  "valid": 45,
  "errors": 2,
  "warnings": 5,
  "issues": [
    {
      "path": "docs/howto/setup.md",
      "severity": "error",
      "message": "Missing required field 'owner'"
    }
  ]
}
```

### doc-manager-linker

**Purpose**: Link docs to code and tests

**Tools**: Read, Grep, Glob, Edit

**Responsibilities**:
- Find code files mentioned in docs
- Find test files related to features
- Add `code_refs` to front matter
- Add `test_refs` to front matter
- Link to CI runs when possible

**Output Format**:
- Enhanced docs with `code_refs` and `test_refs`

## Configuration

### JSON Schema (frontmatter-schema.json)

Located at `templates/frontmatter-schema.json`, defines valid YAML structure.

**Key Requirements**:
- `id`: Unique identifier (string)
- `doc_type`: Enum (feature, howto, reference, explanation, adr, test_report, runbook)
- `title`: Document title (string)
- `status`: Enum (draft, proposed, accepted, deprecated, superseded)
- `last_verified_at`: ISO date (YYYY-MM-DD)
- `owner`: CODEOWNERS format (@team-name or @username)

**Optional Fields**:
- `supersedes`: Array of IDs this doc replaces
- `superseded_by`: Array of IDs that replaced this doc
- `code_refs`: Array of code file references
- `test_refs`: Array of test file references
- `evidence`: Test results object
- `search`: Search metadata (boost, exclude)

### Customize Heuristics

Edit scripts to adjust classification heuristics:

**File**: `scripts/inventory-docs.sh`

```bash
# Current heuristic: "Step 1" → howto
# Add new heuristic: "Tutorial" → tutorial

if grep -q "Tutorial" "$file"; then
  doc_type="tutorial"
fi
```

## Troubleshooting

### Issue: "YAML front matter validation failed"

**Cause**: Missing required fields or invalid values

**Solution**:
```bash
# Run validator to see specific errors
python3 scripts/validate-frontmatter.py docs/problematic-doc.md

# Common fixes:
# - Add missing 'owner' field
# - Change status to valid enum (draft/proposed/accepted/deprecated/superseded)
# - Fix date format to ISO (YYYY-MM-DD)
```

### Issue: "Duplicate Feature Cards found"

**Cause**: Multiple docs describe same feature

**Solution**: Let doc-manager consolidate automatically, or manually:
```bash
# Mark older doc as superseded
# Edit older-doc.md:
---
status: superseded
superseded_by: ["FEAT-2025-10-newer"]
---

# Edit newer-doc.md:
---
status: accepted
supersedes: ["FEAT-2025-09-older"]
---
```

### Issue: "manifest.json not generated"

**Cause**: Validation errors blocking generation

**Solution**:
```bash
# Fix all validation errors first
python3 scripts/validate-frontmatter.py

# Then regenerate manifest
python3 scripts/generate-manifest.py
```

### Issue: "CLAUDE.md was modified"

**Cause**: Bug in doc-manager (should never happen)

**Solution**:
```bash
# Restore from Git
git checkout CLAUDE.md

# Report bug - this should NEVER happen
# Check logs to find what went wrong
```

### Issue: "Too many docs quarantined"

**Cause**: Aggressive heuristics or false positives

**Solution**:
```bash
# Review quarantine
ls docs/quarantine/YYYY-MM-DD-HH-MM/
cat docs/quarantine/YYYY-MM-DD-HH-MM/QUARANTINE_REASON.md

# Restore false positives
mv docs/quarantine/YYYY-MM-DD-HH-MM/good-doc.md docs/feature/

# Adjust heuristics in scripts/
```

## Best Practices

### 1. Run Regular Sweeps

```bash
# Monthly light sweep
./scripts/doc-sweep.sh --phase inventory,validation

# Quarterly full sweep
./scripts/doc-sweep.sh
```

### 2. Always Use Templates

When creating new docs, start from templates:

```bash
cp .claude/skills/doc-manager/templates/FEATURE_CARD.md \
   docs/feature/my-new-feature.md
```

### 3. Link to Code Early

Add `code_refs` and `test_refs` as soon as you write a doc:

```yaml
code_refs:
  - path: "src/components/MyComponent.tsx"
test_refs:
  - path: "tests/components/MyComponent.test.tsx"
```

### 4. Keep ADRs Immutable

Never delete ADRs. Only update status:

```yaml
# If superseded by ADR-0015
status: superseded
superseded_by: ["ADR-0015"]
```

### 5. Review Quarantine

Regularly review quarantined docs:

```bash
ls docs/quarantine/
# Restore valuable docs, delete confirmed junk
```

### 6. Validate Before Commit

```bash
# Run validation
python3 scripts/validate-frontmatter.py

# Only commit when validation passes
git add docs/
git commit -m "docs: add feature documentation"
```

## Advanced Usage

### Custom Conflict Resolution Rules

Edit `scripts/doc-sweep.sh` to add custom rules:

```bash
# Example: Prefer docs owned by @arch-team for architecture questions

if [ "$doc_type" == "explanation" ] && [ "$owner" == "@arch-team" ]; then
  priority_boost=10
fi
```

### Automated CI Validation

Add to `.github/workflows/docs.yml`:

```yaml
- name: Validate Documentation
  run: |
    python3 .claude/skills/doc-manager/scripts/validate-frontmatter.py --strict
```

### Custom Manifest Queries

Query `manifest.json` for specific docs:

```bash
# Find all accepted Feature Cards
jq '.features[] | select(.status == "accepted")' docs/_index/manifest.json

# Find docs with failing tests
jq '.features[] | select(.evidence.tests_passed == false)' docs/_index/manifest.json
```

### Batch Updates

Update all docs with a script:

```bash
# Add owner to all docs missing it
for file in docs/**/*.md; do
  if ! grep -q "owner:" "$file"; then
    # Add owner based on directory
    sed -i '/^---$/a owner: "@team-core"' "$file"
  fi
done
```

---

## See Also

- `QUICK_REFERENCE.md` - One-page cheat sheet
- `USAGE_EXAMPLES.md` - Practical scenarios
- `CHECKLIST.md` - Verification checklist
- `SKILL.md` - Core skill definition

## References

- **Diátaxis**: https://diataxis.fr/
- **ADR Best Practices**: https://adr.github.io/
- **Docs-as-Code**: https://www.writethedocs.org/guide/docs-as-code/
- **JSON Schema**: https://json-schema.org/
