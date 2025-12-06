# Documentation Manager - Quick Reference

> One-page cheat sheet for doc-manager skill

## When to Use

✅ Docs scattered across project
✅ Duplicates and conflicts
✅ After feature development
✅ User says "tidy docs" or "consolidate documentation"
✅ Regular maintenance (monthly/quarterly)

❌ Single doc edits
❌ New doc creation (use templates)
❌ **NEVER for CLAUDE.md**

## Quick Start

```bash
# Full doc sweep
cd .claude/skills/doc-manager
./scripts/doc-sweep.sh

# Dry-run (preview only)
./scripts/doc-sweep.sh --dry-run

# Just validate
python3 scripts/validate-frontmatter.py

# Generate manifest
python3 scripts/generate-manifest.py
```

## 7-Phase Workflow

| Phase | Action | Output |
|-------|--------|--------|
| 1. Inventory | Scan all `.md` files | `inventory.json` |
| 2. Analysis | Detect duplicates/conflicts | Analysis report |
| 3. Resolve | Apply evidence-based rules | Conflict decisions |
| 4. Migrate | Add YAML, move to Diátaxis | Organized `docs/` |
| 5. Consolidate | Merge duplicates, quarantine | Clean doc set |
| 6. Link | Add `code_refs`, `test_refs` | Traceable docs |
| 7. Finalize | Validate YAML, generate manifest | `manifest.json` |

## Conflict Resolution Rules (Priority Order)

1. **Status**: `accepted` > `proposed` > `draft`
2. **Evidence**: `tests_passed: true` > `false` > missing
3. **Recency**: Newer `last_verified_at` with passing tests
4. **ADR**: Latest accepted ADR wins
5. **Tests**: Doc with passing CI run wins

## Directory Structure

```
docs/
├── _index/               # Inventory and manifest
├── feature/              # Feature Cards
├── howto/                # Step-by-step guides
├── reference/            # API/config reference
├── explanation/          # Concepts/architecture
├── adr/                  # Architectural Decision Records
├── test-report/          # Test results
├── runbook/              # Operations procedures
└── quarantine/           # Docs needing review
    └── YYYY-MM-DD-HH-MM/ # Timestamped batches
```

## YAML Front Matter (Required)

```yaml
---
id: FEAT-2025-10-unique-id
doc_type: feature|howto|reference|explanation|adr|test_report|runbook
title: "Feature Name"
status: draft|proposed|accepted|deprecated|superseded
last_verified_at: 2025-10-25
owner: "@team-name"
supersedes: []
superseded_by: []
code_refs:
  - path: "src/file.ts#L10-L50"
test_refs:
  - path: "tests/file.test.ts::test_name"
  - ci_run: "gh-actions://runs/12345"
evidence:
  tests_passed: true
search:
  boost: 2
  exclude: false
keywords: ["tag1", "tag2"]
---
```

## Templates

| Template | Use When | Doc Type |
|----------|----------|----------|
| `FEATURE_CARD.md` | Describing a feature/capability | feature |
| `ADR_TEMPLATE.md` | Documenting architecture decision | adr |
| `HOWTO_TEMPLATE.md` | Step-by-step task guide | howto |
| `REFERENCE_TEMPLATE.md` | API/config lookup | reference |
| `EXPLANATION_TEMPLATE.md` | Explaining concepts | explanation |
| `TEST_REPORT_TEMPLATE.md` | Test results | test_report |
| `RUNBOOK_TEMPLATE.md` | Operational procedures | runbook |
| `README_TEMPLATE.md` | Repository README | - |

## Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `doc-sweep.sh` | Full 7-phase sweep | `./scripts/doc-sweep.sh` |
| `validate-frontmatter.py` | YAML validation | `python3 scripts/validate-frontmatter.py` |
| `generate-manifest.py` | Create manifest.json | `python3 scripts/generate-manifest.py` |
| `quarantine-doc.sh` | Move doc to quarantine | `./scripts/quarantine-doc.sh <file> "reason"` |
| `inventory-docs.sh` | Scan and catalog | `./scripts/inventory-docs.sh` |
| `link-to-code.py` | Link to code/tests | `python3 scripts/link-to-code.py` |

## Subagents

| Subagent | Purpose | Phase |
|----------|---------|-------|
| `doc-manager-inventory` | Scan and catalog docs | 1 |
| `doc-manager-consolidator` | Merge and resolve | 2-5 |
| `doc-manager-validator` | Validate YAML | 7 |
| `doc-manager-linker` | Link to code/tests | 6 |

## Safety Features

✅ **CLAUDE.md Protected**: Hard-coded exclusion
✅ **Quarantine, Not Delete**: Docs moved to quarantine with reason
✅ **Bulk Confirmation**: Ask before modifying >10 files
✅ **Dry-Run Mode**: Preview before applying
✅ **Immutable ADRs**: Never delete, only update status
✅ **Git Backup**: Rely on Git history

## Common Commands

```bash
# Full sweep with dry-run first
./scripts/doc-sweep.sh --dry-run
./scripts/doc-sweep.sh

# Validate specific doc
python3 scripts/validate-frontmatter.py docs/feature/my-doc.md

# Quarantine a doc
./scripts/quarantine-doc.sh docs/old-notes.md "Outdated, no evidence"

# Generate manifest only
python3 scripts/generate-manifest.py

# Link specific doc to code
python3 scripts/link-to-code.py docs/feature/dashboard.md
```

## Troubleshooting Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Validation errors | `python3 scripts/validate-frontmatter.py` to see details |
| Duplicate Feature Cards | Let doc-manager consolidate, or mark older as `superseded` |
| Manifest not generated | Fix validation errors first |
| CLAUDE.md modified | `git checkout CLAUDE.md` (report bug!) |
| Too many quarantined | Review `docs/quarantine/*/QUARANTINE_REASON.md` |

## Doc Type Decision Tree

```
Documenting a feature/capability?
  → Use FEATURE_CARD.md (doc_type: feature)

Teaching how to do a task?
  → Use HOWTO_TEMPLATE.md (doc_type: howto)

Documenting API/config/lookup info?
  → Use REFERENCE_TEMPLATE.md (doc_type: reference)

Explaining a concept/architecture?
  → Use EXPLANATION_TEMPLATE.md (doc_type: explanation)

Recording an architecture decision?
  → Use ADR_TEMPLATE.md (doc_type: adr)

Documenting test results?
  → Use TEST_REPORT_TEMPLATE.md (doc_type: test_report)

Writing operational procedures?
  → Use RUNBOOK_TEMPLATE.md (doc_type: runbook)
```

## Validation Checklist

Before running doc-sweep:
- [ ] Install Python dependencies: `pip install pyyaml jsonschema`
- [ ] Scripts are executable: `chmod +x scripts/*.sh`
- [ ] Git working directory is clean (commit changes)

After running doc-sweep:
- [ ] All docs have valid YAML front matter
- [ ] No validation errors: `python3 scripts/validate-frontmatter.py`
- [ ] Manifest generated: `ls docs/_index/manifest.json`
- [ ] CLAUDE.md untouched: `git status CLAUDE.md`
- [ ] Review quarantine: `ls docs/quarantine/`
- [ ] Commit changes: `git add docs/ && git commit -m "docs: consolidate and organize"`

## Best Practices

1. **Run monthly light sweeps**: `./scripts/doc-sweep.sh --phase inventory,validation`
2. **Always use templates** for new docs
3. **Add code_refs early** when writing docs
4. **Keep ADRs immutable** (only update status)
5. **Review quarantine regularly**
6. **Validate before committing**: `python3 scripts/validate-frontmatter.py`

## Quick Reference: YAML Field Meanings

| Field | Meaning | Example |
|-------|---------|---------|
| `id` | Unique, stable identifier | `FEAT-2025-10-abc` |
| `doc_type` | Diátaxis category | `feature`, `howto`, `adr` |
| `title` | Human-readable title | `"Dashboard Component"` |
| `status` | Lifecycle stage | `accepted`, `draft`, `superseded` |
| `last_verified_at` | Last accuracy check | `2025-10-25` |
| `owner` | Responsible team/person | `"@team-frontend"` |
| `supersedes` | IDs this doc replaces | `["FEAT-2024-09-old"]` |
| `superseded_by` | IDs that replaced this | `["FEAT-2025-11-new"]` |
| `code_refs` | Links to code | `path`, `symbol` |
| `test_refs` | Links to tests | `path`, `ci_run` |
| `evidence` | Test results | `tests_passed`, `coverage_delta` |
| `search.boost` | Search ranking | `2` (boost), `1` (normal) |
| `search.exclude` | Hide from search | `true`, `false` |

---

**Full docs**: See `README.md`
**Examples**: See `USAGE_EXAMPLES.md`
**Checklist**: See `CHECKLIST.md`
