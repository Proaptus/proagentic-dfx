# Documentation Manager - Usage Examples

> Practical scenarios showing how to use doc-manager skill

## Example 1: After Feature Development - Consolidate Scattered Docs

### Scenario

You just finished implementing a new "User Profile Import" feature. During development, you created:
- `server/docs/import-api.md` (API docs)
- `src/components/ProfileImport/README.md` (component docs)
- `USER_IMPORT_SUCCESS.md` (in project root, claiming success)
- `import-feature-complete.md` (also in root, duplicate)
- Several experiment notes in `experiments/profile-import/`

Documentation is scattered, some claims are inaccurate, and you need to consolidate.

### Solution

**Step 1: Run doc-manager with dry-run**

```bash
cd .claude/skills/doc-manager
./scripts/doc-sweep.sh --dry-run
```

**Step 2: Review preview**

Preview shows:
- 5 documents related to profile import found
- 2 duplicates detected (USER_IMPORT_SUCCESS.md and import-feature-complete.md)
- 1 conflict: USER_IMPORT_SUCCESS.md claims feature is complete, but tests show it's partially implemented
- Experiment notes have no clear purpose

**Step 3: Run full sweep**

```bash
./scripts/doc-sweep.sh
```

**Step 4: Result**

After sweep:
```
docs/
├── feature/
│   └── FEAT-2025-10-profile-import.md    # Consolidated Feature Card
├── reference/
│   └── profile-import-api.md              # API reference (migrated)
├── explanation/
│   └── profile-import-architecture.md     # Component docs (migrated)
└── quarantine/
    └── 2025-10-25-14-30/
        ├── USER_IMPORT_SUCCESS.md         # Quarantined (inaccurate claim)
        ├── import-feature-complete.md     # Quarantined (duplicate)
        ├── experiment-notes.md            # Quarantined (no value)
        └── QUARANTINE_REASON.md           # Explains why
```

**FEAT-2025-10-profile-import.md** (consolidated):
```yaml
---
id: FEAT-2025-10-profile-import
doc_type: feature
title: "User Profile Import"
status: accepted
last_verified_at: 2025-10-25
owner: "@team-backend"
code_refs:
  - path: "server/routes/profile-import.js#L10-L85"
  - path: "src/components/ProfileImport/ProfileImport.tsx"
test_refs:
  - path: "tests/server/profile-import.test.js::test_imports_csv"
  - ci_run: "gh-actions://runs/12345678"
evidence:
  tests_passed: true
  coverage_delta: "+4.2%"
search:
  boost: 2
keywords: ["profile", "import", "csv", "user"]
---

## TL;DR
Allows admins to bulk import user profiles from CSV files via API or UI component.

## Behavior
- **Input**: CSV file with columns: email, name, role, department
- **Output**: Created user profiles + import summary report
- **Idempotency**: Skips existing users (by email), updates if `--update` flag set
- **Error modes**: Validation errors returned per-row, partial imports allowed

## Configuration & Flags
- `PROFILE_IMPORT_MAX_ROWS`: Max rows per import (default: 10000)
- `--update` flag: Update existing users instead of skipping

## File & Symbol Map
- `server/routes/profile-import.js#L10-L85`
- `src/components/ProfileImport/ProfileImport.tsx`

## Evidence
- Tests: All passing (see CI run 12345678)
- Coverage: +4.2%

## Limitations
- Max 10,000 rows per import
- CSV only (no Excel support yet)
```

---

## Example 2: Resolve Conflicting Documentation

### Scenario

Two documents claim different things about the "Dashboard Refresh Rate":

**docs/old-dashboard-doc.md**:
```yaml
status: draft
last_verified_at: 2025-09-01
```
Claims: "Dashboard refreshes every 30 seconds"

**docs/dashboard-performance.md**:
```yaml
status: accepted
last_verified_at: 2025-10-20
evidence: { tests_passed: true }
```
Claims: "Dashboard refreshes every 5 seconds (configurable)"

Which is correct?

### Solution

**Step 1: Run doc-manager**

```bash
./scripts/doc-sweep.sh
```

**Step 2: Conflict resolution automatically applied**

Resolution rules:
1. Status: `accepted` > `draft` ✓
2. Evidence: `tests_passed: true` > missing ✓
3. Recency: 2025-10-20 > 2025-09-01 ✓

Winner: **docs/dashboard-performance.md**

**Step 3: Result**

**docs/old-dashboard-doc.md** (marked superseded):
```yaml
status: superseded
superseded_by: ["FEAT-2025-10-dashboard-refresh"]
```

**docs/feature/dashboard-refresh.md** (migrated and updated):
```yaml
status: accepted
supersedes: ["FEAT-2025-09-old-dashboard"]
evidence: { tests_passed: true }
```

Conflict resolved! The doc with passing tests and recent verification wins.

---

## Example 3: Organize Scattered READMEs

### Scenario

Your project has READMEs everywhere:
```
README.md                           # Root (good)
src/components/Dashboard/README.md  # Component explanation
src/utils/README.md                 # Utilities explanation
server/README.md                    # Backend overview
tests/README.md                     # Testing guide
deploy/README.md                    # Deployment guide
```

Some are outdated, some duplicate info from root README.

### Solution

**Step 1: Run doc-manager**

```bash
./scripts/doc-sweep.sh
```

**Step 2: Classification**

doc-manager classifies each README:
- Root `README.md`: Keep as-is (standard location)
- `src/components/Dashboard/README.md`: → `docs/explanation/dashboard-component.md`
- `src/utils/README.md`: → `docs/reference/utility-functions.md`
- `server/README.md`: → `docs/explanation/backend-architecture.md`
- `tests/README.md`: → `docs/howto/running-tests.md`
- `deploy/README.md`: → `docs/runbook/deployment.md`

**Step 3: Result**

```
docs/
├── explanation/
│   ├── dashboard-component.md
│   └── backend-architecture.md
├── reference/
│   └── utility-functions.md
├── howto/
│   └── running-tests.md
└── runbook/
    └── deployment.md
```

Root `README.md` updated with links to organized docs:
```markdown
# ProAgentic

## Documentation
- [Dashboard Component](docs/explanation/dashboard-component.md)
- [Backend Architecture](docs/explanation/backend-architecture.md)
- [Utility Functions Reference](docs/reference/utility-functions.md)
- [Running Tests](docs/howto/running-tests.md)
- [Deployment](docs/runbook/deployment.md)
```

---

## Example 4: Monthly Maintenance Sweep

### Scenario

It's the first Monday of the month. You run a light doc sweep to catch any new scattered docs and validate existing ones.

### Solution

**Step 1: Light sweep (inventory + validation only)**

```bash
./scripts/doc-sweep.sh --phase inventory,validation
```

**Step 2: Review findings**

Output:
```
✓ Scanned 73 .md files
✓ 68 docs have valid YAML front matter
✗ 5 docs have validation errors
⚠ 3 new docs found without front matter
```

**Step 3: Fix validation errors**

```bash
python3 scripts/validate-frontmatter.py

Output:
✗ docs/feature/new-feature.md: Missing 'owner' field
✗ docs/howto/setup.md: Invalid status 'complete' (must be draft/proposed/accepted/deprecated/superseded)
```

**Step 4: Fix manually**

Edit `docs/feature/new-feature.md`:
```yaml
owner: "@team-backend"  # Add missing field
```

Edit `docs/howto/setup.md`:
```yaml
status: accepted  # Change 'complete' to 'accepted'
```

**Step 5: Add front matter to new docs**

New docs found: `DEPLOYMENT_NOTES.md`, `API_CHANGES.md`, `BUG_FIX_SUMMARY.md`

Use templates:
```bash
# Convert DEPLOYMENT_NOTES.md to runbook
cp .claude/skills/doc-manager/templates/RUNBOOK_TEMPLATE.md \
   docs/runbook/deployment-notes.md
# Copy content and add proper front matter

# Convert API_CHANGES.md to reference
cp .claude/skills/doc-manager/templates/REFERENCE_TEMPLATE.md \
   docs/reference/api-changes.md

# Convert BUG_FIX_SUMMARY.md to test report
cp .claude/skills/doc-manager/templates/TEST_REPORT_TEMPLATE.md \
   docs/test-report/bug-fix-validation.md
```

**Step 6: Regenerate manifest**

```bash
python3 scripts/generate-manifest.py
```

**Step 7: Commit**

```bash
git add docs/
git commit -m "docs: monthly maintenance - validate and organize new docs"
```

---

## Example 5: Pre-Release Documentation Audit

### Scenario

You're preparing for a major release (v2.0). You need to ensure ALL documentation is accurate, current, and well-organized before release.

### Solution

**Step 1: Full sweep with strict validation**

```bash
./scripts/doc-sweep.sh
python3 scripts/validate-frontmatter.py --strict
```

**Step 2: Review quarantine**

Check what was quarantined:
```bash
ls docs/quarantine/2025-10-25-10-00/
cat docs/quarantine/2025-10-25-10-00/QUARANTINE_REASON.md
```

Output:
```
Quarantined: experiment-auth-flow.md
Reason: Describes experimental OAuth flow that was never implemented.
        No code_refs, no test_refs, contradicts current auth implementation.
Action: Review and delete if not needed for v2.0.
```

**Step 3: Verify all Feature Cards have evidence**

```bash
# Query manifest for docs without test evidence
jq '.features[] | select(.evidence.tests_passed == null or .evidence.tests_passed == false)' \
   docs/_index/manifest.json
```

Output shows 2 Feature Cards claiming features work but no test evidence.

**Step 4: Add test evidence or update status**

For each doc without evidence:
- Write tests to validate claims
- Update front matter with `test_refs` and `evidence`
- OR downgrade `status` to `draft` if untested

**Step 5: Update all `last_verified_at` dates**

For critical docs, manually verify and update:
```yaml
last_verified_at: 2025-10-25  # Verified today for v2.0 release
```

**Step 6: Generate final manifest**

```bash
python3 scripts/generate-manifest.py
```

**Step 7: Create release docs package**

```bash
# Copy organized docs to release
mkdir release-v2.0-docs
cp -r docs/ release-v2.0-docs/
tar -czf release-v2.0-docs.tar.gz release-v2.0-docs/
```

---

## Example 6: Link Docs to Code After Refactoring

### Scenario

You refactored the `Dashboard` component, moving code from `Dashboard.tsx` to multiple files:
- `Dashboard.tsx` (main component)
- `hooks/useDashboardData.ts`
- `hooks/useDashboardFilters.ts`
- `utils/dashboardHelpers.ts`

The existing Feature Card still references the old single file.

### Solution

**Step 1: Run linker script on specific doc**

```bash
python3 scripts/link-to-code.py docs/feature/dashboard.md
```

**Step 2: Review updates**

Script automatically finds new files and updates `code_refs`:

**Before**:
```yaml
code_refs:
  - path: "src/components/Dashboard.tsx"
```

**After**:
```yaml
code_refs:
  - path: "src/components/Dashboard/Dashboard.tsx#L10-L85"
  - path: "src/components/Dashboard/hooks/useDashboardData.ts"
  - path: "src/components/Dashboard/hooks/useDashboardFilters.ts"
  - path: "src/components/Dashboard/utils/dashboardHelpers.ts"
test_refs:
  - path: "tests/components/Dashboard/Dashboard.test.tsx::test_renders_correctly"
  - path: "tests/components/Dashboard/hooks/useDashboardData.test.ts"
```

**Step 3: Verify and commit**

```bash
git diff docs/feature/dashboard.md
git add docs/feature/dashboard.md
git commit -m "docs: update Dashboard feature card with refactored code refs"
```

---

## Example 7: Quarantine and Restore

### Scenario

doc-manager quarantined a document that you actually need: `performance-tuning-notes.md`.

### Solution

**Step 1: Review quarantine reason**

```bash
cat docs/quarantine/2025-10-25-14-30/QUARANTINE_REASON.md
```

Output:
```
Quarantined: performance-tuning-notes.md
Reason: No clear doc_type, no front matter, appears to be draft notes.
Action: Add proper front matter and classify, then restore.
```

**Step 2: Add front matter**

```bash
# Copy quarantined doc
cp docs/quarantine/2025-10-25-14-30/performance-tuning-notes.md \
   /tmp/performance-tuning-notes.md

# Add front matter (use template)
cat > /tmp/temp-frontmatter.txt << 'EOF'
---
id: EXPL-2025-10-performance-tuning
doc_type: explanation
title: "Performance Tuning Guidelines"
status: accepted
last_verified_at: 2025-10-25
owner: "@team-performance"
keywords: ["performance", "optimization", "tuning"]
---
EOF

# Combine front matter + content
cat /tmp/temp-frontmatter.txt \
    docs/quarantine/2025-10-25-14-30/performance-tuning-notes.md \
    > docs/explanation/performance-tuning.md
```

**Step 3: Validate**

```bash
python3 scripts/validate-frontmatter.py docs/explanation/performance-tuning.md
```

Output:
```
✓ docs/explanation/performance-tuning.md: Valid
```

**Step 4: Restore complete**

```bash
# Remove from quarantine (optional, Git history preserves it)
rm docs/quarantine/2025-10-25-14-30/performance-tuning-notes.md

# Commit
git add docs/explanation/performance-tuning.md
git commit -m "docs: restore and properly format performance tuning guide"
```

---

## Summary: When to Use Each Workflow

| Scenario | Commands | Expected Outcome |
|----------|----------|------------------|
| **After feature dev** | `./scripts/doc-sweep.sh` | Consolidate scattered docs into organized structure |
| **Conflicting docs** | `./scripts/doc-sweep.sh` | Resolve conflicts using evidence-based rules |
| **Scattered READMEs** | `./scripts/doc-sweep.sh` | Organize into Diátaxis categories |
| **Monthly maintenance** | `./scripts/doc-sweep.sh --phase inventory,validation` | Light sweep, validate existing docs |
| **Pre-release audit** | `./scripts/doc-sweep.sh` + manual review | Ensure all docs accurate and current |
| **After refactoring** | `python3 scripts/link-to-code.py <file>` | Update code_refs to match new structure |
| **Restore quarantined** | Add front matter + validate + commit | Properly formatted doc in correct location |

---

**See also**:
- `README.md` - Full documentation
- `QUICK_REFERENCE.md` - Cheat sheet
- `CHECKLIST.md` - Verification checklist
