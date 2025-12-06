# Documentation Manager - Completion Checklist

> Verification checklist for doc-manager operations

## Pre-Flight Checklist

Before running doc-manager, verify:

### Environment Setup
- [ ] Python 3.8+ installed: `python3 --version`
- [ ] PyYAML installed: `pip install pyyaml`
- [ ] jsonschema installed: `pip install jsonschema`
- [ ] Scripts are executable: `chmod +x .claude/skills/doc-manager/scripts/*.sh`

### Project State
- [ ] Git working directory is clean (or changes committed)
- [ ] Current branch is up-to-date
- [ ] No merge conflicts in existing docs
- [ ] CLAUDE.md exists and is untouched

### Backup Preparation
- [ ] Recent Git commit exists (Git is primary backup)
- [ ] Understand quarantine process (docs moved, not deleted)
- [ ] Know how to restore from quarantine if needed

---

## Post-Execution Checklist

After running doc-manager, verify:

### Phase 1: Inventory Completed
- [ ] `docs/_index/inventory.json` created
- [ ] Inventory includes total file count
- [ ] Inventory shows classification breakdown
- [ ] CLAUDE.md excluded from inventory

### Phase 2: Analysis Completed
- [ ] Duplicates identified (if any)
- [ ] Conflicts identified (if any)
- [ ] Orphaned docs identified (if any)
- [ ] Analysis report generated

### Phase 3: Conflicts Resolved
- [ ] All conflicts have resolution decisions
- [ ] Winning docs marked `status: accepted`
- [ ] Losing docs marked `status: superseded`
- [ ] Bidirectional `supersedes`/`superseded_by` links added

### Phase 4: Migration Completed
- [ ] `docs/` directory structure created:
  - [ ] `docs/_index/`
  - [ ] `docs/feature/`
  - [ ] `docs/howto/`
  - [ ] `docs/reference/`
  - [ ] `docs/explanation/`
  - [ ] `docs/adr/`
  - [ ] `docs/test-report/`
  - [ ] `docs/runbook/`
  - [ ] `docs/quarantine/`
- [ ] All docs moved to appropriate directories
- [ ] YAML front matter added to docs that lacked it
- [ ] Internal links updated to reflect new locations

### Phase 5: Consolidation Completed
- [ ] Duplicate Feature Cards merged
- [ ] Unclear docs quarantined (not deleted)
- [ ] `docs/quarantine/YYYY-MM-DD-HH-MM/` directory created (if quarantine occurred)
- [ ] `QUARANTINE_REASON.md` created explaining each quarantined doc

### Phase 6: Linking Completed
- [ ] Feature Cards have `code_refs` (where applicable)
- [ ] Feature Cards have `test_refs` (where applicable)
- [ ] Code references include line numbers (e.g., `#L10-L50`)
- [ ] Test references include test names or CI run links

### Phase 7: Finalization Completed
- [ ] All docs validated against JSON Schema
- [ ] No validation errors: `python3 scripts/validate-frontmatter.py`
- [ ] `docs/_index/manifest.json` generated
- [ ] Manifest includes all expected docs
- [ ] Search metadata added (`boost`/`exclude`)

---

## Safety Verification

Critical safety checks:

### CLAUDE.md Protection
- [ ] CLAUDE.md untouched: `git status CLAUDE.md` shows no changes
- [ ] CLAUDE.md not in inventory
- [ ] CLAUDE.md not in any quarantine folder
- [ ] CLAUDE.md excluded from all operations

### No Data Loss
- [ ] No docs permanently deleted
- [ ] Quarantined docs preserved in `docs/quarantine/`
- [ ] Git history intact: `git log` shows all commits
- [ ] All superseded docs have bidirectional links (can trace history)

### Bulk Operations
- [ ] If >10 files modified, user was asked for confirmation
- [ ] Dry-run completed before actual execution (if used)
- [ ] Changes match preview from dry-run

---

## Quality Verification

Ensure documentation quality:

### YAML Front Matter
- [ ] All docs have YAML front matter
- [ ] All required fields present:
  - [ ] `id` (unique, stable)
  - [ ] `doc_type` (valid enum)
  - [ ] `title`
  - [ ] `status` (valid enum)
  - [ ] `last_verified_at` (ISO date format)
  - [ ] `owner` (CODEOWNERS format)
- [ ] Optional fields used appropriately:
  - [ ] `supersedes` (if doc replaces others)
  - [ ] `superseded_by` (if doc was replaced)
  - [ ] `code_refs` (for Feature Cards)
  - [ ] `test_refs` (for Feature Cards)
  - [ ] `evidence` (test results)

### Diátaxis Classification
- [ ] Tutorials separated from how-tos
- [ ] Reference docs separated from explanations
- [ ] Each doc has clear, single purpose
- [ ] No mixed-content documents (e.g., tutorial + API reference in one file)

### Evidence-Based Truth
- [ ] Feature Cards claiming features work have `evidence.tests_passed: true`
- [ ] Feature Cards have `test_refs` linking to proof
- [ ] ADRs have clear status (proposed/accepted/deprecated/superseded)
- [ ] No docs claim success without test evidence

### Traceability
- [ ] Feature Cards link to code via `code_refs`
- [ ] Feature Cards link to tests via `test_refs`
- [ ] ADRs link to related Feature Cards (via `sources_of_truth`)
- [ ] Superseded docs link to replacements

---

## Manifest Verification

Check `docs/_index/manifest.json`:

### Structure
- [ ] `generated_at` timestamp present
- [ ] `total_docs` count matches actual doc count
- [ ] `by_type` breakdown includes all Diátaxis types
- [ ] `by_status` breakdown includes all statuses
- [ ] `features` array includes all Feature Cards

### Content
- [ ] Each feature has:
  - [ ] `id`
  - [ ] `title`
  - [ ] `path`
  - [ ] `status`
  - [ ] `last_verified_at`
  - [ ] `owner`
- [ ] `code_refs` and `test_refs` populated (where applicable)
- [ ] `evidence` included (where available)
- [ ] `search` metadata added

### Accuracy
- [ ] Spot-check: pick 3 random Feature Cards from manifest
- [ ] Verify paths exist: `ls <path>`
- [ ] Verify front matter matches manifest entry
- [ ] Verify `code_refs` files exist

---

## Search Optimization Verification

Ensure search is optimized:

### Boost Applied
- [ ] Canonical Feature Cards have `search.boost: 2` or higher
- [ ] Most-used reference docs have `search.boost: 1.5` or higher
- [ ] Standard docs have `search.boost: 1` (default)

### Exclusions Applied
- [ ] Quarantined docs have `search.exclude: true`
- [ ] Superseded docs have `search.exclude: true`
- [ ] Archive/historical docs have `search.exclude: true`
- [ ] Drafts without value have `search.exclude: true`

---

## Quarantine Review

If docs were quarantined, review:

### Quarantine Directory
- [ ] `docs/quarantine/YYYY-MM-DD-HH-MM/` exists
- [ ] `QUARANTINE_REASON.md` explains why each doc was quarantined
- [ ] Quarantined docs preserved (not deleted)

### Quarantine Reasons
For each quarantined doc, verify reason is valid:
- [ ] Doc has no clear purpose → valid quarantine
- [ ] Doc contradicts tests → valid quarantine
- [ ] Doc appears to be experiment/draft → valid quarantine
- [ ] Doc is duplicate (superseded) → should be marked `superseded`, not quarantined
- [ ] Doc is valuable but needs front matter → should be restored and fixed

### False Positives
- [ ] Review quarantine for false positives
- [ ] Restore any valuable docs with proper front matter
- [ ] Delete confirmed junk (after review)

---

## Git Commit Verification

Before committing doc-manager changes:

### Staged Changes
- [ ] `git status` shows expected changes
- [ ] New `docs/` structure staged
- [ ] `docs/_index/inventory.json` staged
- [ ] `docs/_index/manifest.json` staged
- [ ] Quarantined docs staged (in quarantine folder)
- [ ] No unexpected deletions

### CLAUDE.md Safety
- [ ] `git status CLAUDE.md` shows no changes
- [ ] `git diff CLAUDE.md` shows no diff

### Commit Message
- [ ] Descriptive commit message:
  ```
  docs: consolidate and organize documentation

  - Run doc-manager 7-phase sweep
  - Migrate 45 docs to Diátaxis structure
  - Resolve 7 conflicts using evidence-based rules
  - Quarantine 5 unclear/contradictory docs
  - Generate manifest.json for AI agent queries
  - All YAML front matter validated
  ```

### Push
- [ ] Changes pushed to remote: `git push origin main`
- [ ] CI passes (if documentation validation in CI)

---

## Final Verification

Complete final checks:

### Functionality
- [ ] Can find docs easily in new structure
- [ ] Manifest queries work:
  ```bash
  jq '.features[] | select(.status == "accepted")' docs/_index/manifest.json
  ```
- [ ] Validation passes:
  ```bash
  python3 scripts/validate-frontmatter.py
  # Output: All docs valid
  ```

### User Experience
- [ ] Docs are easier to find than before
- [ ] No duplicate information
- [ ] Clear canonical source for each feature
- [ ] Links between docs work

### AI Agent Experience
- [ ] `manifest.json` provides fast lookups
- [ ] Front matter enables filtering by status, type, owner
- [ ] `code_refs` and `test_refs` enable traceability
- [ ] Search metadata guides agents to canonical docs

---

## Troubleshooting Checklist

If issues occur, check:

### Validation Errors
- [ ] Run: `python3 scripts/validate-frontmatter.py`
- [ ] Fix missing required fields
- [ ] Fix invalid enum values
- [ ] Fix date format (use ISO: YYYY-MM-DD)

### Manifest Not Generated
- [ ] Check validation passed first
- [ ] Re-run: `python3 scripts/generate-manifest.py`
- [ ] Check for errors in output

### CLAUDE.md Modified
- [ ] **CRITICAL**: This should NEVER happen
- [ ] Restore immediately: `git checkout CLAUDE.md`
- [ ] Report bug in doc-manager
- [ ] Check logs to identify what went wrong

### Too Many Quarantined
- [ ] Review quarantine reasons
- [ ] Restore false positives
- [ ] Adjust heuristics if needed

### Links Broken
- [ ] Check relative paths updated correctly
- [ ] Verify `code_refs` and `test_refs` point to existing files
- [ ] Update broken links manually

---

## Success Criteria

doc-manager execution is successful when:

✅ All docs organized into Diátaxis structure
✅ All docs have valid YAML front matter
✅ No validation errors
✅ Conflicts resolved with clear winners
✅ Duplicates consolidated or marked superseded
✅ Unclear docs quarantined (not lost)
✅ `manifest.json` generated successfully
✅ CLAUDE.md untouched
✅ Changes committed to Git
✅ Documentation easier to navigate and more accurate

---

## Regular Maintenance Checklist

Run monthly/quarterly:

### Monthly Light Sweep
- [ ] Run inventory: `./scripts/inventory-docs.sh`
- [ ] Run validation: `python3 scripts/validate-frontmatter.py`
- [ ] Fix any validation errors
- [ ] Regenerate manifest: `python3 scripts/generate-manifest.py`
- [ ] Commit changes

### Quarterly Full Sweep
- [ ] Run full 7-phase sweep: `./scripts/doc-sweep.sh`
- [ ] Review quarantine
- [ ] Update `last_verified_at` for critical docs
- [ ] Check all `code_refs` still valid (no refactored files)
- [ ] Commit changes

### Pre-Release Sweep
- [ ] Full 7-phase sweep
- [ ] Verify all Feature Cards have test evidence
- [ ] Update all `last_verified_at` dates
- [ ] Review and clean quarantine
- [ ] Generate final manifest
- [ ] Create docs package for release

---

**See also**:
- `README.md` - Full documentation
- `QUICK_REFERENCE.md` - Cheat sheet
- `USAGE_EXAMPLES.md` - Practical scenarios
