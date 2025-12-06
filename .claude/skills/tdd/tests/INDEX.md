# TDD Test Generation Index: doc-manager Phase 5

## Files Generated

All files located in: `/home/chine/projects/proagentic-clean/.claude/skills/tdd/tests/`

### 1. Test Suite (Executable)
**File**: `doc-manager-phase5.sh`
- Size: 24 KB, 645 lines
- Type: Bash shell script (executable)
- Purpose: Complete test suite with 9 test cases
- Status: Executable, ready to run

**Contains**:
- Test configuration (lines 19-30)
- Helper functions (lines 32-144)
- 9 test functions (lines 146-580)
- Test runner (lines 586-645)

**Run with**:
```bash
/home/chine/projects/proagentic-clean/.claude/skills/tdd/tests/doc-manager-phase5.sh
```

---

### 2. Test Documentation
**File**: `TEST_GENERATION_SUMMARY.md`
- Size: 15 KB
- Type: Comprehensive documentation
- Purpose: Full specification of all tests, helpers, and coverage

**Contains**:
- Overview of test generation
- Phase 5 specification (what must be tested)
- Current bugs (proven by tests)
- 9 test cases with detailed descriptions
- Test infrastructure and helper functions
- Success criteria for implementation
- Commands for Phase 2

**Read for**: Understanding what each test does

---

### 3. Bug Analysis
**File**: `BUG_ANALYSIS.md`
- Size: 11 KB
- Type: Technical analysis document
- Purpose: Root cause analysis of Phase 5 bugs

**Contains**:
- Executive summary of 3 critical bugs
- Bug #1: Variable scope issue (explanation, location, impact)
- Bug #2: Selection logic broken (explanation, location, impact)
- Bug #3: Move loop never executes (explanation, location, impact)
- How tests prove each bug
- Root cause analysis with bash examples
- Fixing the bugs (solutions for each)
- Test coverage of bugs

**Read for**: Understanding what's broken and why

---

### 4. Quick Reference
**File**: `QUICK_START.md`
- Size: 6.3 KB
- Type: Quick reference guide
- Purpose: Fast introduction and troubleshooting

**Contains**:
- How to run tests
- Expected output (RED vs GREEN)
- Test files overview
- What tests verify
- Test cases at a glance
- Current bugs summary
- Files to read (in order)
- Workflow (Step 1-4)
- Key assertions
- Troubleshooting Q&A
- Success criteria
- Related files

**Read for**: Quick overview before diving deep

---

### 5. This File
**File**: `INDEX.md`
- Purpose: Navigation guide for all test-related files

---

## Test Results Summary

```
Generated:    9 test cases
Assertions:   49+
Current:      RED (all fail)
Expected:     GREEN (all pass after implementation)

Failures:
  - Canonical files not identified
  - Files not moved to quarantine
  - Directory not created
  - Counts incorrect
```

---

## Quick Start Guide

### 1. Run Tests (See Current Status)
```bash
/home/chine/projects/proagentic-clean/.claude/skills/tdd/tests/doc-manager-phase5.sh
```

### 2. Understand What's Being Tested
Read in order:
1. `QUICK_START.md` (5-minute overview)
2. `TEST_GENERATION_SUMMARY.md` (detailed specs)
3. `BUG_ANALYSIS.md` (understand the bugs)

### 3. Look at Test Code
```bash
less /home/chine/projects/proagentic-clean/.claude/skills/tdd/tests/doc-manager-phase5.sh
```

### 4. Find Code to Fix
```bash
vim /home/chine/projects/proagentic-clean/.claude/skills/doc-manager/scripts/doc-sweep.sh +208
```

### 5. Re-run Tests After Fixes
```bash
/home/chine/projects/proagentic-clean/.claude/skills/tdd/tests/doc-manager-phase5.sh
```

---

## File Reading Order

### For Quick Understanding (15 minutes)
1. QUICK_START.md
2. Run tests to see failures
3. BUG_ANALYSIS.md (focus on Bug #1)

### For Full Understanding (1 hour)
1. QUICK_START.md
2. TEST_GENERATION_SUMMARY.md (read all 9 tests)
3. BUG_ANALYSIS.md (read all 3 bugs)
4. doc-manager-phase5.sh (review test code)

### For Implementation (ongoing)
1. Keep QUICK_START.md nearby
2. Reference BUG_ANALYSIS.md while fixing
3. Run tests frequently
4. Check TEST_GENERATION_SUMMARY.md for edge cases

---

## Test Cases (Quick Reference)

| # | Test Name | Input | Purpose |
|---|-----------|-------|---------|
| 1 | quarantine_non_canonical_files | 18 files | Main functionality |
| 2 | protect_claude_md | 8 files | CLAUDE.md protection |
| 3 | create_quarantine_reason | 4 files | Documentation creation |
| 4 | count_files_quarantined | 103 files | Counting accuracy |
| 5 | canonical_file_selection | 6 files | Selection logic |
| 6 | no_uat_files | 5 files | Edge case: no UAT |
| 7 | no_tdd_files | 5 files | Edge case: no TDD |
| 8 | large_scale | 256 files | Realistic 250+ files |
| 9 | tie_breaking | 6 files | Same-size files |

---

## Phase 5 Code Location

**File**: `/home/chine/projects/proagentic-clean/.claude/skills/doc-manager/scripts/doc-sweep.sh`
**Lines**: 208-315
**Function**: `phase5_consolidate()`

This is what needs to be fixed to make tests pass.

---

## Bug Summary

### Bug #1: Variable Scope
- Lines 225, 238
- Variables lost after loop exits
- Result: canonical_uat="" and canonical_tdd=""

### Bug #2: Selection Logic
- Lines 227-231, 240-244
- max_lines never updated
- Result: No files identified as canonical

### Bug #3: Move Loop
- Lines 255-276
- Empty variables cause all continue statements
- Result: No files moved to quarantine

All bugs must be fixed for tests to pass.

---

## Success Criteria

Tests pass when Phase 5 correctly:
1. Identifies largest UAT file (canonical)
2. Identifies largest TDD file (canonical)
3. Moves all other .md files to quarantine
4. Protects CLAUDE.md from quarantine
5. Creates QUARANTINE_REASON.md
6. Reports accurate file counts

---

## Maintenance

### Adding New Tests
1. Add test function to `doc-manager-phase5.sh`
2. Update count in `TEST_GENERATION_SUMMARY.md`
3. Add to summary tables
4. Run: `./doc-manager-phase5.sh` to verify

### Running Tests in CI/CD
```bash
#!/bin/bash
# Add to CI pipeline
/home/chine/projects/proagentic-clean/.claude/skills/tdd/tests/doc-manager-phase5.sh
[ $? -eq 0 ] && echo "All tests passed" || exit 1
```

### Debugging Failed Tests
1. Run single test function:
   ```bash
   source doc-manager-phase5.sh
   test_phase5_canonical_file_selection
   ```
2. Check temp directory:
   ```bash
   ls -la /tmp/doc-manager-phase5-tests-*/
   ```
3. Add log_info statements to Phase 5 code
4. Re-run tests

---

## Related Documentation

### ProAgentic Project
- `/home/chine/projects/proagentic-clean/CLAUDE.md` - Project instructions
- `/home/chine/projects/proagentic-clean/.claude/skills/doc-manager/SKILL.md` - Skill overview
- `/home/chine/projects/proagentic-clean/.claude/skills/doc-manager/scripts/doc-sweep.sh` - Code to fix

### TDD Skill
- `/home/chine/projects/proagentic-clean/.claude/skills/tdd/README.md` - TDD overview
- `/home/chine/projects/proagentic-clean/.claude/skills/tdd/SKILL.md` - Skill details
- `/home/chine/projects/proagentic-clean/.claude/skills/tdd/templates/` - Test templates

---

## Support

For questions or issues:
1. Check QUICK_START.md troubleshooting section
2. Review BUG_ANALYSIS.md for technical details
3. Look at test code in doc-manager-phase5.sh
4. Check Phase 5 code at doc-sweep.sh lines 208-315

---

## Status

Generated: 2025-10-25
Status: Complete - Ready for Phase 2 (Implementation)
Tests: RED (all fail on current code)
Quality: High (9 cases, 49+ assertions, deterministic, isolated)

Next: Fix Phase 5 code to make tests pass (GREEN)
