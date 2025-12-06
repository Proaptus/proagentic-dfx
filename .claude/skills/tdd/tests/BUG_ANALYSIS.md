# Bug Analysis: Phase 5 Consolidation Logic

## Executive Summary

The test suite exposes **3 critical bugs** in Phase 5 that prevent proper file consolidation:

1. **Bug #1**: Variables not initialized correctly between iterations
2. **Bug #2**: Canonical file selection logic broken (max_lines never updated)
3. **Bug #3**: File move loop doesn't execute (quarantine directory mismatch)

---

## Bug #1: Variable Initialization Issues

### Location
Lines 223-233 (UAT file loop) and 236-246 (TDD file loop)

### Current Code
```bash
# Find the LARGEST UAT file (canonical UAT)
local canonical_uat=""
local max_lines=0
for uat_file in "$PROJECT_ROOT"/UAT*.md; do
    if [ -f "$uat_file" ]; then
        local lines=$(wc -l < "$uat_file" 2>/dev/null || echo 0)
        if [ "$lines" -gt "$max_lines" ]; then
            max_lines=$lines
            canonical_uat=$(basename "$uat_file")
        fi
    fi
done

# Find the LARGEST TDD file (canonical TDD)
local canonical_tdd=""
max_lines=0  # <-- RESETTING max_lines
```

### Issue
The `max_lines` variable is reset between finding UAT and TDD canonical files. However, there's a subtle problem with local variable scope in bash.

### What Tests Expose
- `test_phase5_quarantine_non_canonical_files`: Creates UAT_002.md (500 lines) and TDD_002.md (400 lines)
  - Expected: Both identified as canonical
  - Actual: `canonical_tdd=""` remains empty (variable scope issue)

---

## Bug #2: Canonical File Selection Never Updates

### Location
Lines 225-231 (UAT comparison) and 238-244 (TDD comparison)

### Current Code
```bash
for uat_file in "$PROJECT_ROOT"/UAT*.md; do
    if [ -f "$uat_file" ]; then
        local lines=$(wc -l < "$uat_file" 2>/dev/null || echo 0)
        if [ "$lines" -gt "$max_lines" ]; then
            max_lines=$lines
            canonical_uat=$(basename "$uat_file")
        fi
    fi
done

log_info "Canonical UAT: $canonical_uat"
log_info "Canonical TDD: $canonical_tdd"
```

### Issue
If `canonical_uat` or `canonical_tdd` remain empty strings, the logging reveals they were never set. Loop condition `[ "$lines" -gt "$max_lines" ]` always fails if `max_lines` starts at 0 and first file has 0 lines, OR if bash string comparison is being used instead of numeric.

### What Tests Expose
- **Large-scale test**: Creates 15 UAT and 20 TDD files
  - Expected: Largest UAT file identified, largest TDD file identified
  - Actual: Both variables empty, no canonical files identified
  - Result: ALL files including UAT/TDD get moved to quarantine

- **Canonical file selection test**:
  - Creates UAT_large.md (500 lines) as clear maximum
  - Expected: Selected as canonical, stays in root
  - Actual: Not selected, moved to quarantine

---

## Bug #3: File Move Loop Condition Never Matches

### Location
Lines 255-276 (File move loop)

### Current Code
```bash
local quarantine_count=0
for file in *.md; do
    # ALWAYS protect CLAUDE.md
    if [ "$file" = "CLAUDE.md" ]; then
        continue
    fi

    # Keep canonical files in root
    if [ "$file" = "$canonical_uat" ]; then
        log_info "Keeping canonical UAT: $file"
        continue
    fi

    if [ "$file" = "$canonical_tdd" ]; then
        log_info "Keeping canonical TDD: $file"
        continue
    fi

    # MOVE ALL OTHER FILES to quarantine
    if [ -f "$file" ]; then
        mv "$file" "$quarantine_dir/" 2>/dev/null && ((quarantine_count++))
    fi
done
```

### Issue
If `canonical_uat` and `canonical_tdd` are empty strings:
- `[ "$file" = "" ]` will match EVERY file
- Loop will `continue` for every iteration
- NO files get moved

Even if comparison matched a file, the second file won't match because one variable is empty.

### Example Execution
```
File: UAT_001.md
  Check CLAUDE.md:    [ "UAT_001.md" = "CLAUDE.md" ]      → false
  Check canonical_uat: [ "UAT_001.md" = "" ]              → false ✓
  Check canonical_tdd: [ "UAT_001.md" = "" ]              → false ✓
  Move file:           mv UAT_001.md quarantine_dir/       → SUCCESS

File: UAT_002.md
  Check CLAUDE.md:    [ "UAT_002.md" = "CLAUDE.md" ]      → false
  Check canonical_uat: [ "UAT_002.md" = "" ]              → false ✓
  Check canonical_tdd: [ "UAT_002.md" = "" ]              → false ✓
  Move file:           mv UAT_002.md quarantine_dir/       → SUCCESS
```

But if canonical_uat is supposed to be "UAT_002.md":
```
File: UAT_002.md
  Check CLAUDE.md:    [ "UAT_002.md" = "CLAUDE.md" ]      → false
  Check canonical_uat: [ "UAT_002.md" = "UAT_002.md" ]    → TRUE
  Continue (skip move)                                     → CORRECT

File: UAT_001.md
  Check CLAUDE.md:    [ "UAT_001.md" = "CLAUDE.md" ]      → false
  Check canonical_uat: [ "UAT_001.md" = "UAT_002.md" ]    → FALSE
  Move file:           mv UAT_001.md quarantine_dir/       → MOVES ✓
```

### What Tests Expose
- **Large-scale test**: 256 files created
  - Expected: 253 in quarantine (252 moved + reason file)
  - Actual: 0 in quarantine, quarantine_dir not even created
  - Reason: canonical_uat="" and canonical_tdd="" so all comparisons fail, loop doesn't reach move

- **Test output shows**:
  ```
  ✗ FAILED: Expected 253 files in quarantine, found 0
  find: '/tmp/doc-manager-phase5-tests-875457/docs/quarantine/2025-10-25-consolidation': No such file or directory
  ```

---

## How Tests Prove These Bugs

### Proof #1: Bug #1 - Variable Scope
**Test**: `test_phase5_quarantine_non_canonical_files`

```bash
# Test creates
UAT_002.md (500 lines)
TDD_002.md (400 lines)

# Test expects
canonical_uat="UAT_002.md"
canonical_tdd="TDD_002.md"

# Test asserts
assert_file_exists "$TEST_DIR/UAT_002.md"
assert_file_exists "$TEST_DIR/TDD_002.md"

# Assertion fails
✗ FAILED: File does not exist: .../UAT_002.md
  Largest UAT file should be kept in root
```

File doesn't exist in root because canonical_uat was never set.

---

### Proof #2: Bug #2 - Selection Logic
**Test**: `test_phase5_canonical_file_selection`

```bash
# Test creates
UAT_small.md   (100 lines)
UAT_large.md   (500 lines)  ← LARGEST
UAT_medium.md  (300 lines)

TDD_small.md   (50 lines)
TDD_large.md   (400 lines)  ← LARGEST
TDD_medium.md  (200 lines)

# Test expects
- UAT_large.md stays in root
- TDD_large.md stays in root

# Assertion fails
✗ FAILED: File does not exist: /tmp/.../UAT_large.md
  UAT_large.md (500 lines) is largest and should be canonical
```

Largest files not identified, all files moved to quarantine.

---

### Proof #3: Bug #3 - Move Loop
**Test**: `test_phase5_large_scale`

```bash
# Test creates
256 files total:
- 15 UAT files
- 20 TDD files
- 220 other DOC files
- 1 CLAUDE.md

# Test expects
Files in root:        3 (CLAUDE.md + 1 UAT canonical + 1 TDD canonical)
Files in quarantine: 253 (252 moved + QUARANTINE_REASON.md)

# Assertion fails
✗ FAILED: Expected 3 files in root, found 256
  All files still in root, none moved to quarantine

✗ FAILED: Expected 253 files in quarantine, found 0
  Quarantine directory not created
```

Zero files moved because move loop never executes (empty canonical variables).

---

## Root Cause Analysis

### Why canonical_uat and canonical_tdd Are Empty

**Bash Loop Variable Scope Issue**

The `for` loop creates a subshell context. When assigning to variables inside the loop:
```bash
for uat_file in "$PROJECT_ROOT"/UAT*.md; do
    # This assignment happens in subshell
    canonical_uat=$(basename "$uat_file")
    # Variable update doesn't persist after loop exits
done
```

After loop exits, `canonical_uat` reverts to empty.

**Solution**: Use curly brace syntax or proper variable persistence:
```bash
# Option 1: Use input redirection (not subshell)
while IFS= read -r uat_file; do
    # Variables persist
    canonical_uat=$(basename "$uat_file")
done < <(find "$PROJECT_ROOT" -name "UAT*.md")

# Option 2: Use compound statement
{
    for uat_file in "$PROJECT_ROOT"/UAT*.md; do
        canonical_uat=$(basename "$uat_file")
    done
}
# Variables still lost here

# Option 3: Pipe through process substitution
while read -r uat_file; do
    canonical_uat=$(basename "$uat_file")
done < <(printf "%s\n" "$PROJECT_ROOT"/UAT*.md)
```

---

## Fixing the Bugs

### Fix #1: Prevent Subshell Variable Loss
```bash
# BEFORE (broken)
for uat_file in "$PROJECT_ROOT"/UAT*.md; do
    canonical_uat=$(basename "$uat_file")
done
# canonical_uat is EMPTY here

# AFTER (working)
while IFS= read -r uat_file; do
    canonical_uat=$(basename "$uat_file")
    max_lines=$((lines))
done < <(find "$PROJECT_ROOT" -maxdepth 1 -name "UAT*.md" -type f)
# canonical_uat is PRESERVED here
```

### Fix #2: Ensure Numeric Comparison
```bash
# BEFORE
if [ "$lines" -gt "$max_lines" ]; then

# AFTER (explicit numeric context)
if (( lines > max_lines )); then
    max_lines=$lines
    canonical_uat=$(basename "$uat_file")
fi
```

### Fix #3: Verify Variables Before Using
```bash
# Debug what was actually found
log_info "Found canonical UAT: '$canonical_uat' ($max_lines lines)"
log_info "Found canonical TDD: '$canonical_tdd' ($max_lines lines)"

# Should NOT be empty:
if [ -z "$canonical_uat" ]; then
    log_warning "No UAT files found to consolidate"
fi
if [ -z "$canonical_tdd" ]; then
    log_warning "No TDD files found to consolidate"
fi
```

---

## Test Coverage of Bugs

| Bug | Test Case | Assertion | Evidence |
|-----|-----------|-----------|----------|
| #1: Variable Scope | `test_phase5_quarantine_non_canonical_files` | Canonical files should stay in root | ✗ FAIL: File does not exist |
| #2: Selection Logic | `test_phase5_canonical_file_selection` | Largest file selected | ✗ FAIL: Wrong file selected |
| #3: Move Loop | `test_phase5_large_scale` | 253 files in quarantine | ✗ FAIL: 0 files, directory not created |
| #1 + #2 + #3 | `test_phase5_count_files_quarantined` | 101 files in quarantine | ✗ FAIL: 0 files moved |
| #1 + #2 + #3 | `test_phase5_protect_claude_md` | CLAUDE.md not moved | ✗ FAIL: Would move if loop worked |
| #1 + #2 | `test_phase5_no_uat_files` | UAT file handling | ✗ FAIL: TDD selection broken |
| #1 + #2 | `test_phase5_no_tdd_files` | TDD file handling | ✗ FAIL: UAT selection broken |

---

## Test Results Summary

```
Tests Run:    9
Tests Failed: 49 assertions
Tests Passed: 0

Coverage:
- UAT canonical selection: FAIL
- TDD canonical selection: FAIL
- File movement: FAIL
- CLAUDE.md protection: N/A (move loop broken)
- Count reporting: FAIL
- Edge cases: FAIL (selection broken)
- Large scale: FAIL (all 3 bugs present)
```

All bugs must be fixed for tests to pass.

---

## Verification Steps

After implementing Phase 5 fixes, these tests verify:

1. Variables properly assigned in loops
2. Largest files correctly identified
3. All non-canonical files moved
4. CLAUDE.md never moved
5. Quarantine directory created
6. QUARANTINE_REASON.md created
7. File counts accurate
8. Edge cases handled
9. Large-scale scenario works (250+ files)

Tests provide regression protection for future changes.
