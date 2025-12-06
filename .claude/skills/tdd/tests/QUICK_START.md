# Quick Start: doc-manager Phase 5 Tests

## Run Tests

```bash
/home/chine/projects/proagentic-clean/.claude/skills/tdd/tests/doc-manager-phase5.sh
```

## Expected Output

### Current State (RED - All tests fail)
```
Tests run:    9
Tests passed: 0
Tests failed: 49

✗ SOME TESTS FAILED - Phase 5 has bugs that need fixing
```

### After Implementation (GREEN - All tests pass)
```
Tests run:    9
Tests passed: 9
Tests failed: 0

✓ ALL TESTS PASSED
```

## Test Files

| File | Purpose |
|------|---------|
| `doc-manager-phase5.sh` | Main test suite (645 lines) |
| `TEST_GENERATION_SUMMARY.md` | Full documentation of all tests |
| `BUG_ANALYSIS.md` | Root cause analysis of Phase 5 bugs |
| `QUICK_START.md` | This file - quick reference |

## What Tests Verify

**Phase 5 (lines 208-315 in doc-sweep.sh) must:**

1. Find largest UAT*.md file → keep in root as canonical
2. Find largest TDD*.md file → keep in root as canonical
3. Move ALL other *.md files → to `docs/quarantine/2025-10-25-consolidation/`
4. Protect CLAUDE.md → never move to quarantine
5. Create QUARANTINE_REASON.md → explain what happened
6. Report count → log how many files quarantined

## Test Cases at a Glance

| Test | Files | Purpose |
|------|-------|---------|
| `test_phase5_quarantine_non_canonical_files` | 18 (8 UAT + 10 TDD) | Main functionality |
| `test_phase5_protect_claude_md` | 8 | CLAUDE.md protection |
| `test_phase5_create_quarantine_reason` | 4 | Documentation file |
| `test_phase5_count_files_quarantined` | 103 | Counting accuracy |
| `test_phase5_canonical_file_selection` | 6 | Canonical selection logic |
| `test_phase5_no_uat_files` | 5 | Edge case: missing UAT |
| `test_phase5_no_tdd_files` | 5 | Edge case: missing TDD |
| `test_phase5_large_scale` | 256 | Realistic scenario (250+) |
| `test_phase5_tie_breaking` | 6 | Same-sized files |

## Current Bugs (Proven by Tests)

**Bug #1**: Variable assignment in bash loops creates subshell context
- Variables don't persist after loop exits
- `canonical_uat` and `canonical_tdd` always empty

**Bug #2**: Canonical file selection never updates max_lines
- Comparison logic broken
- No files identified as canonical

**Bug #3**: File move loop never executes
- Empty canonical variables cause all continue conditions to trigger
- No files actually moved to quarantine

**Result**: 0 files moved, quarantine directory never created

## Files to Read

For detailed understanding:
1. Read `TEST_GENERATION_SUMMARY.md` for full test documentation
2. Read `BUG_ANALYSIS.md` for technical details of bugs
3. Read test code in `doc-manager-phase5.sh` to see exact assertions
4. Read Phase 5 code: `/home/chine/projects/proagentic-clean/.claude/skills/doc-manager/scripts/doc-sweep.sh` lines 208-315

## Workflow

### Step 1: Confirm Tests Fail (Current)
```bash
/home/chine/projects/proagentic-clean/.claude/skills/tdd/tests/doc-manager-phase5.sh
# Expected: 49 failures
```

### Step 2: Fix Phase 5 Code
Edit `/home/chine/projects/proagentic-clean/.claude/skills/doc-manager/scripts/doc-sweep.sh` lines 208-315
- Fix variable scope in loops
- Fix canonical file selection logic
- Fix file movement loop

### Step 3: Run Tests After Each Fix
```bash
/home/chine/projects/proagentic-clean/.claude/skills/tdd/tests/doc-manager-phase5.sh
# Watch failures decrease from 49 → 0
```

### Step 4: Verify on Real Project
```bash
cd /home/chine/projects/proagentic-clean
./doc-manager/scripts/doc-sweep.sh
ls -la UAT*.md TDD*.md                          # Should show 2 files
ls -la docs/quarantine/2025-10-25-consolidation | wc -l  # Should show 250+
```

## Key Assertions

Tests check these specific conditions:

```bash
# Canonical files stay in root
assert_file_exists "$TEST_DIR/UAT_002.md"
assert_file_exists "$TEST_DIR/TDD_002.md"

# Non-canonical files moved
assert_file_exists "$QUARANTINE_DIR/UAT_001.md"
assert_file_not_exists "$TEST_DIR/UAT_001.md"

# CLAUDE.md protection
assert_file_exists "$TEST_DIR/CLAUDE.md"
assert_file_not_exists "$QUARANTINE_DIR/CLAUDE.md"

# Quarantine directory created
assert_file_exists "$QUARANTINE_DIR/QUARANTINE_REASON.md"

# File counts accurate
assert_file_count "$QUARANTINE_DIR" 253 "*.md"
```

## Troubleshooting

**Q: Tests still showing failures**
A: Edit Phase 5 code (lines 208-315) and fix the three bugs

**Q: Which bug to fix first?**
A: Fix variable scope issue (#1), then selection logic (#2), then move loop (#3)

**Q: How to debug?**
A: Add `log_info` statements in Phase 5 to see what's happening:
```bash
log_info "Found canonical UAT: $canonical_uat"
log_info "Found canonical TDD: $canonical_tdd"
```

**Q: Can I run individual tests?**
A: Yes, look in doc-manager-phase5.sh and call specific functions:
```bash
source doc-manager-phase5.sh
test_phase5_canonical_file_selection
```

## Success Criteria

All tests pass when:
- [ ] 256 files created in test
- [ ] 3 files remain in root (CLAUDE.md + UAT canonical + TDD canonical)
- [ ] 253 files in quarantine (252 moved + QUARANTINE_REASON.md)
- [ ] QUARANTINE_REASON.md contains "Documentation Consolidation" and date
- [ ] All 9 test cases pass
- [ ] All 49+ assertions pass

## Related Files

```
Project Structure:
  /home/chine/projects/proagentic-clean/
  ├── .claude/skills/doc-manager/
  │   └── scripts/
  │       └── doc-sweep.sh (Phase 5: lines 208-315) ← EDIT THIS
  └── .claude/skills/tdd/tests/
      ├── doc-manager-phase5.sh ← RUN THIS
      ├── TEST_GENERATION_SUMMARY.md ← READ THIS
      ├── BUG_ANALYSIS.md ← UNDERSTAND THIS
      └── QUICK_START.md ← YOU ARE HERE
```

## Testing Philosophy

These tests follow TDD (Test-Driven Development):
1. Write tests FIRST (RED) - ✓ Done, all fail
2. Implement code (GREEN) - Next step
3. Refactor (REFACTOR) - After green
4. Repeat for next feature

Tests ensure Phase 5:
- Works on small datasets (18 files)
- Works on medium datasets (100+ files)
- Works on realistic data (250+ files)
- Handles edge cases (no UAT, no TDD)
- Never damages protected files (CLAUDE.md)
- Creates proper documentation (QUARANTINE_REASON.md)

---

**Ready to implement Phase 5?**
→ Start with TEST_GENERATION_SUMMARY.md to understand all tests
→ Then read BUG_ANALYSIS.md to understand what to fix
→ Then edit doc-sweep.sh to fix the bugs
→ Then run tests to verify all pass
