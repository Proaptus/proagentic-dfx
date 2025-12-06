#!/bin/bash
# TDD Test Suite for doc-manager Phase 5 Consolidation Logic
#
# These tests verify that Phase 5 correctly:
# 1. Finds the LARGEST UAT*.md file and keeps it as canonical
# 2. Finds the LARGEST TDD*.md file and keeps it as canonical
# 3. Moves ALL other *.md files to quarantine directory
# 4. NEVER moves CLAUDE.md (protected)
# 5. Creates QUARANTINE_REASON.md in quarantine directory
# 6. Reports count of files quarantined
#
# Currently FAILING because Phase 5 has bugs:
# - Only 1-2 files moved instead of 250+
# - Sometimes canonical files get moved instead of kept
# - Loop logic is broken

set -u

# ============================================================================
# TEST CONFIGURATION
# ============================================================================

readonly TEST_DIR="/tmp/doc-manager-phase5-tests-$$"
readonly QUARANTINE_DIR="${TEST_DIR}/docs/quarantine/2025-10-25-consolidation"
readonly SCRIPT_PATH="/home/chine/projects/proagentic-clean/.claude/skills/doc-manager/scripts/doc-sweep.sh"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

setup_test() {
    local test_name="$1"
    TESTS_RUN=$((TESTS_RUN + 1))

    # Clean up previous test
    rm -rf "$TEST_DIR"
    mkdir -p "$TEST_DIR"

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST $TESTS_RUN: $test_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

teardown_test() {
    rm -rf "$TEST_DIR"
}

assert_file_exists() {
    local file="$1"
    local message="${2:-}"

    if [ -f "$file" ]; then
        echo "✓ File exists: $file"
        return 0
    else
        echo "✗ FAILED: File does not exist: $file"
        [ -n "$message" ] && echo "  $message"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

assert_file_not_exists() {
    local file="$1"
    local message="${2:-}"

    if [ ! -f "$file" ]; then
        echo "✓ File does not exist: $file"
        return 0
    else
        echo "✗ FAILED: File should not exist: $file"
        [ -n "$message" ] && echo "  $message"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

assert_file_count() {
    local directory="$1"
    local expected_count="$2"
    local pattern="${3:-*}"
    local message="${4:-}"

    local actual_count=0
    if [ -d "$directory" ]; then
        actual_count=$(find "$directory" -maxdepth 1 -name "$pattern" -type f 2>/dev/null | wc -l)
    fi

    if [ "$actual_count" -eq "$expected_count" ]; then
        echo "✓ File count correct in $directory: $actual_count files"
        return 0
    else
        echo "✗ FAILED: Expected $expected_count files in $directory but found $actual_count"
        [ -n "$message" ] && echo "  $message"
        if [ -d "$directory" ]; then
            echo "  Contents:"
            find "$directory" -maxdepth 1 -name "$pattern" -type f 2>/dev/null | sed 's/^/    /'
        fi
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

create_test_file() {
    local filepath="$1"
    local line_count="$2"

    mkdir -p "$(dirname "$filepath")"

    # Create file with specified number of lines
    > "$filepath"
    for ((i=1; i<=line_count; i++)); do
        echo "Line $i: Test content for $filepath" >> "$filepath"
    done
}

run_phase5() {
    # Source the doc-sweep script and run phase5_consolidate
    # Set PROJECT_ROOT to our test directory
    cd "$TEST_DIR"

    # Source the script - we need to extract and run just phase5_consolidate
    # For now, we'll run it by setting environment and calling the function

    # Create minimal environment
    export PROJECT_ROOT="$TEST_DIR"
    export DOCS_DIR="$TEST_DIR/docs"
    export DRY_RUN=false

    # Source script functions
    source "$SCRIPT_PATH" 2>/dev/null || {
        echo "✗ FAILED: Could not source doc-sweep.sh"
        return 1
    }

    # Run phase5
    phase5_consolidate 2>&1
}

# ============================================================================
# TEST CASE 1: Quarantine Non-Canonical Files
# ============================================================================

test_phase5_quarantine_non_canonical_files() {
    setup_test "Quarantine non-canonical files (8 UAT + 10 TDD)"

    # Create 8 UAT files with different sizes
    create_test_file "$TEST_DIR/UAT_001.md" 100
    create_test_file "$TEST_DIR/UAT_002.md" 500    # LARGEST - should be canonical
    create_test_file "$TEST_DIR/UAT_003.md" 200
    create_test_file "$TEST_DIR/UAT_004.md" 150
    create_test_file "$TEST_DIR/UAT_005.md" 300
    create_test_file "$TEST_DIR/UAT_006.md" 80
    create_test_file "$TEST_DIR/UAT_007.md" 250
    create_test_file "$TEST_DIR/UAT_008.md" 120

    # Create 10 TDD files with different sizes
    create_test_file "$TEST_DIR/TDD_001.md" 50
    create_test_file "$TEST_DIR/TDD_002.md" 400   # LARGEST - should be canonical
    create_test_file "$TEST_DIR/TDD_003.md" 150
    create_test_file "$TEST_DIR/TDD_004.md" 100
    create_test_file "$TEST_DIR/TDD_005.md" 75
    create_test_file "$TEST_DIR/TDD_006.md" 200
    create_test_file "$TEST_DIR/TDD_007.md" 350
    create_test_file "$TEST_DIR/TDD_008.md" 90
    create_test_file "$TEST_DIR/TDD_009.md" 180
    create_test_file "$TEST_DIR/TDD_010.md" 120

    # Verify setup
    echo "Initial state: 18 test files created"
    assert_file_count "$TEST_DIR" 18 "*.md"

    # Run phase5
    run_phase5

    # Verify canonical files stay in root
    assert_file_exists "$TEST_DIR/UAT_002.md" "Largest UAT file should be kept in root"
    assert_file_exists "$TEST_DIR/TDD_002.md" "Largest TDD file should be kept in root"

    # Verify other files moved to quarantine
    assert_file_exists "$QUARANTINE_DIR/UAT_001.md" "Non-canonical UAT files should be quarantined"
    assert_file_exists "$QUARANTINE_DIR/UAT_003.md"
    assert_file_exists "$QUARANTINE_DIR/UAT_004.md"
    assert_file_exists "$QUARANTINE_DIR/UAT_005.md"
    assert_file_exists "$QUARANTINE_DIR/UAT_006.md"
    assert_file_exists "$QUARANTINE_DIR/UAT_007.md"
    assert_file_exists "$QUARANTINE_DIR/UAT_008.md"

    assert_file_exists "$QUARANTINE_DIR/TDD_001.md" "Non-canonical TDD files should be quarantined"
    assert_file_exists "$QUARANTINE_DIR/TDD_003.md"
    assert_file_exists "$QUARANTINE_DIR/TDD_004.md"
    assert_file_exists "$QUARANTINE_DIR/TDD_005.md"
    assert_file_exists "$QUARANTINE_DIR/TDD_006.md"
    assert_file_exists "$QUARANTINE_DIR/TDD_007.md"
    assert_file_exists "$QUARANTINE_DIR/TDD_008.md"
    assert_file_exists "$QUARANTINE_DIR/TDD_009.md"
    assert_file_exists "$QUARANTINE_DIR/TDD_010.md"

    # Verify count: 8 UAT - 1 canonical + 10 TDD - 1 canonical = 16 in quarantine
    assert_file_count "$QUARANTINE_DIR" 17 "*.md" "Should have 16 markdown files + QUARANTINE_REASON.md"

    teardown_test
    return $((TESTS_FAILED > 0 ? 1 : 0))
}

# ============================================================================
# TEST CASE 2: Protect CLAUDE.md
# ============================================================================

test_phase5_protect_claude_md() {
    setup_test "Protect CLAUDE.md from quarantine"

    # Create CLAUDE.md (protected file)
    create_test_file "$TEST_DIR/CLAUDE.md" 1000

    # Create other test files
    create_test_file "$TEST_DIR/README.md" 100
    create_test_file "$TEST_DIR/NOTES.md" 150
    create_test_file "$TEST_DIR/ARCHITECTURE.md" 200
    create_test_file "$TEST_DIR/SETUP.md" 75
    create_test_file "$TEST_DIR/DEPLOYMENT.md" 180

    # Also add canonical UAT and TDD
    create_test_file "$TEST_DIR/UAT_CANONICAL.md" 500
    create_test_file "$TEST_DIR/TDD_CANONICAL.md" 400

    echo "Initial state: 8 test files created (including CLAUDE.md)"
    assert_file_count "$TEST_DIR" 8 "*.md"

    # Run phase5
    run_phase5

    # Verify CLAUDE.md is NOT in quarantine
    assert_file_exists "$TEST_DIR/CLAUDE.md" "CLAUDE.md must stay in root"
    assert_file_not_exists "$QUARANTINE_DIR/CLAUDE.md" "CLAUDE.md must NOT be moved to quarantine"

    # Verify other files are in quarantine
    assert_file_exists "$QUARANTINE_DIR/README.md" "Other .md files should be quarantined"
    assert_file_exists "$QUARANTINE_DIR/NOTES.md"
    assert_file_exists "$QUARANTINE_DIR/ARCHITECTURE.md"
    assert_file_exists "$QUARANTINE_DIR/SETUP.md"
    assert_file_exists "$QUARANTINE_DIR/DEPLOYMENT.md"

    # Count: 5 other files + canonical UAT + canonical TDD = 7 files moved
    # Plus QUARANTINE_REASON.md = 8 total in quarantine
    assert_file_count "$QUARANTINE_DIR" 8 "*.md" "Should have 5 regular + 2 canonical backups (if any) + QUARANTINE_REASON.md"

    teardown_test
    return $((TESTS_FAILED > 0 ? 1 : 0))
}

# ============================================================================
# TEST CASE 3: Create QUARANTINE_REASON.md
# ============================================================================

test_phase5_create_quarantine_reason() {
    setup_test "Create QUARANTINE_REASON.md in quarantine directory"

    # Create test files
    create_test_file "$TEST_DIR/UAT_MAIN.md" 300
    create_test_file "$TEST_DIR/TDD_MAIN.md" 250
    create_test_file "$TEST_DIR/OLD_NOTES.md" 100
    create_test_file "$TEST_DIR/TEMP_DOC.md" 50

    echo "Initial state: 4 test files created"
    assert_file_count "$TEST_DIR" 4 "*.md"

    # Run phase5
    run_phase5

    # Verify QUARANTINE_REASON.md exists
    assert_file_exists "$QUARANTINE_DIR/QUARANTINE_REASON.md" "Quarantine reason file must exist"

    # Verify it contains expected content
    if [ -f "$QUARANTINE_DIR/QUARANTINE_REASON.md" ]; then
        if grep -q "Documentation Consolidation" "$QUARANTINE_DIR/QUARANTINE_REASON.md"; then
            echo "✓ QUARANTINE_REASON.md contains expected title"
        else
            echo "✗ FAILED: QUARANTINE_REASON.md missing expected content"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi

        if grep -q "2025-10-25" "$QUARANTINE_DIR/QUARANTINE_REASON.md"; then
            echo "✓ QUARANTINE_REASON.md contains date"
        else
            echo "✗ FAILED: QUARANTINE_REASON.md missing date"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    fi

    teardown_test
    return $((TESTS_FAILED > 0 ? 1 : 0))
}

# ============================================================================
# TEST CASE 4: Count Files Quarantined
# ============================================================================

test_phase5_count_files_quarantined() {
    setup_test "Verify correct count of quarantined files (97 of 100)"

    # Create 100 test markdown files
    for i in {1..100}; do
        create_test_file "$TEST_DIR/DOC_${i}.md" $((RANDOM % 200 + 50))
    done

    # Create canonical UAT and TDD (largest)
    create_test_file "$TEST_DIR/UAT_CANONICAL.md" 1000
    create_test_file "$TEST_DIR/TDD_CANONICAL.md" 900

    # Create CLAUDE.md (protected)
    create_test_file "$TEST_DIR/CLAUDE.md" 800

    echo "Initial state: 103 test files created (100 docs + 1 UAT + 1 TDD + 1 CLAUDE.md)"
    assert_file_count "$TEST_DIR" 103 "*.md"

    # Run phase5
    run_phase5

    # Verify 2 canonical files stay in root
    assert_file_exists "$TEST_DIR/UAT_CANONICAL.md"
    assert_file_exists "$TEST_DIR/TDD_CANONICAL.md"

    # Verify CLAUDE.md stays in root
    assert_file_exists "$TEST_DIR/CLAUDE.md"

    # Verify quarantine count: 100 DOC files should be moved (2 canonical + 1 CLAUDE.md stay)
    assert_file_count "$QUARANTINE_DIR" 101 "*.md" "Should have 100 moved docs + QUARANTINE_REASON.md"

    teardown_test
    return $((TESTS_FAILED > 0 ? 1 : 0))
}

# ============================================================================
# TEST CASE 5: Canonical File Selection
# ============================================================================

test_phase5_canonical_file_selection() {
    setup_test "Verify largest file is selected as canonical"

    # Create UAT files with specific sizes to test selection logic
    create_test_file "$TEST_DIR/UAT_small.md" 100      # Small
    create_test_file "$TEST_DIR/UAT_large.md" 500      # LARGEST - should be canonical
    create_test_file "$TEST_DIR/UAT_medium.md" 300     # Medium

    # Create TDD files
    create_test_file "$TEST_DIR/TDD_small.md" 50       # Small
    create_test_file "$TEST_DIR/TDD_large.md" 400      # LARGEST - should be canonical
    create_test_file "$TEST_DIR/TDD_medium.md" 200     # Medium

    echo "Initial state: 6 test files (3 UAT + 3 TDD)"
    assert_file_count "$TEST_DIR" 6 "*.md"

    # Run phase5
    run_phase5

    # Verify canonical files (largest) stay in root
    assert_file_exists "$TEST_DIR/UAT_large.md" "UAT_large.md (500 lines) is largest and should be canonical"
    assert_file_exists "$TEST_DIR/TDD_large.md" "TDD_large.md (400 lines) is largest and should be canonical"

    # Verify non-canonical files moved to quarantine
    assert_file_not_exists "$TEST_DIR/UAT_small.md" "UAT_small.md should be moved to quarantine"
    assert_file_not_exists "$TEST_DIR/UAT_medium.md" "UAT_medium.md should be moved to quarantine"
    assert_file_not_exists "$TEST_DIR/TDD_small.md" "TDD_small.md should be moved to quarantine"
    assert_file_not_exists "$TEST_DIR/TDD_medium.md" "TDD_medium.md should be moved to quarantine"

    assert_file_exists "$QUARANTINE_DIR/UAT_small.md" "Non-canonical files should be in quarantine"
    assert_file_exists "$QUARANTINE_DIR/UAT_medium.md"
    assert_file_exists "$QUARANTINE_DIR/TDD_small.md"
    assert_file_exists "$QUARANTINE_DIR/TDD_medium.md"

    # Count: 2 canonical files in root + CLAUDE.md (auto-protected) + 4 quarantined + QUARANTINE_REASON.md
    assert_file_count "$QUARANTINE_DIR" 5 "*.md" "Should have 4 moved files + QUARANTINE_REASON.md"

    teardown_test
    return $((TESTS_FAILED > 0 ? 1 : 0))
}

# ============================================================================
# TEST CASE 6: Edge Case - No UAT files
# ============================================================================

test_phase5_no_uat_files() {
    setup_test "Handle case with no UAT files (only TDD)"

    # Create only TDD files (no UAT)
    create_test_file "$TEST_DIR/TDD_001.md" 100
    create_test_file "$TEST_DIR/TDD_002.md" 300   # Largest
    create_test_file "$TEST_DIR/TDD_003.md" 150

    # Create other files
    create_test_file "$TEST_DIR/README.md" 200
    create_test_file "$TEST_DIR/NOTES.md" 50

    echo "Initial state: 5 files (3 TDD + 2 other, 0 UAT)"
    assert_file_count "$TEST_DIR" 5 "*.md"

    # Run phase5
    run_phase5

    # Verify TDD canonical stays in root
    assert_file_exists "$TEST_DIR/TDD_002.md" "Largest TDD file should be canonical"

    # Verify other TDD files moved
    assert_file_exists "$QUARANTINE_DIR/TDD_001.md"
    assert_file_exists "$QUARANTINE_DIR/TDD_003.md"
    assert_file_exists "$QUARANTINE_DIR/README.md"
    assert_file_exists "$QUARANTINE_DIR/NOTES.md"

    # Count: 4 quarantined files + QUARANTINE_REASON.md
    assert_file_count "$QUARANTINE_DIR" 5 "*.md"

    teardown_test
    return $((TESTS_FAILED > 0 ? 1 : 0))
}

# ============================================================================
# TEST CASE 7: Edge Case - No TDD files
# ============================================================================

test_phase5_no_tdd_files() {
    setup_test "Handle case with no TDD files (only UAT)"

    # Create only UAT files (no TDD)
    create_test_file "$TEST_DIR/UAT_001.md" 100
    create_test_file "$TEST_DIR/UAT_002.md" 400   # Largest
    create_test_file "$TEST_DIR/UAT_003.md" 200

    # Create other files
    create_test_file "$TEST_DIR/ARCHITECTURE.md" 150
    create_test_file "$TEST_DIR/DESIGN.md" 75

    echo "Initial state: 5 files (3 UAT + 2 other, 0 TDD)"
    assert_file_count "$TEST_DIR" 5 "*.md"

    # Run phase5
    run_phase5

    # Verify UAT canonical stays in root
    assert_file_exists "$TEST_DIR/UAT_002.md" "Largest UAT file should be canonical"

    # Verify other UAT files moved
    assert_file_exists "$QUARANTINE_DIR/UAT_001.md"
    assert_file_exists "$QUARANTINE_DIR/UAT_003.md"
    assert_file_exists "$QUARANTINE_DIR/ARCHITECTURE.md"
    assert_file_exists "$QUARANTINE_DIR/DESIGN.md"

    # Count: 4 quarantined files + QUARANTINE_REASON.md
    assert_file_count "$QUARANTINE_DIR" 5 "*.md"

    teardown_test
    return $((TESTS_FAILED > 0 ? 1 : 0))
}

# ============================================================================
# TEST CASE 8: Large Scale Test
# ============================================================================

test_phase5_large_scale() {
    setup_test "Large scale test with 250+ files (REALISTIC SCENARIO)"

    # Create realistic distribution:
    # - 15 UAT files of various sizes
    # - 20 TDD files of various sizes
    # - 220 other .md files
    # Total: 255 files

    echo "Creating 255 test files... (this may take a moment)"

    # UAT files
    for i in {1..15}; do
        create_test_file "$TEST_DIR/UAT_$(printf "%03d" $i).md" $((100 + RANDOM % 900))
    done

    # TDD files
    for i in {1..20}; do
        create_test_file "$TEST_DIR/TDD_$(printf "%03d" $i).md" $((100 + RANDOM % 900))
    done

    # Other files
    for i in {1..220}; do
        create_test_file "$TEST_DIR/DOC_$(printf "%03d" $i).md" $((50 + RANDOM % 500))
    done

    # Add CLAUDE.md
    create_test_file "$TEST_DIR/CLAUDE.md" 2000

    # Count files
    local initial_count=$(find "$TEST_DIR" -maxdepth 1 -name "*.md" -type f | wc -l)
    echo "Initial state: $initial_count files created"
    assert_file_count "$TEST_DIR" 256 "*.md"

    # Run phase5
    echo "Running phase5_consolidate... (this is the real test)"
    run_phase5

    # Verify CLAUDE.md stays
    assert_file_exists "$TEST_DIR/CLAUDE.md"

    # Verify 2 canonical files stay (1 UAT + 1 TDD)
    # Find the canonical files by checking what's in root after consolidation
    local remaining_root=$(find "$TEST_DIR" -maxdepth 1 -name "*.md" -type f | wc -l)

    # Should have: CLAUDE.md + 1 canonical UAT + 1 canonical TDD = 3 files
    # If more than 3, then the consolidation failed to move non-canonical files
    if [ "$remaining_root" -eq 3 ]; then
        echo "✓ Correct number of files in root: 3 (CLAUDE.md + canonical UAT + canonical TDD)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "✗ FAILED: Expected 3 files in root, found $remaining_root"
        echo "  Root files:"
        find "$TEST_DIR" -maxdepth 1 -name "*.md" -type f | sed 's/^/    /'
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi

    # Verify quarantine count: 255 - 3 = 252 files quarantined (plus QUARANTINE_REASON.md)
    local quarantine_count=$(find "$QUARANTINE_DIR" -maxdepth 1 -name "*.md" -type f | wc -l)

    if [ "$quarantine_count" -eq 253 ]; then
        echo "✓ Correct number of files in quarantine: 253 (252 moved + QUARANTINE_REASON.md)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "✗ FAILED: Expected 253 files in quarantine, found $quarantine_count"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi

    teardown_test
    return $((TESTS_FAILED > 0 ? 1 : 0))
}

# ============================================================================
# TEST CASE 9: Files with same line count
# ============================================================================

test_phase5_tie_breaking() {
    setup_test "Handle tie-breaking when multiple files have same size"

    # Create UAT files where multiple have same size
    create_test_file "$TEST_DIR/UAT_001.md" 200
    create_test_file "$TEST_DIR/UAT_002.md" 200  # Same size as 001
    create_test_file "$TEST_DIR/UAT_003.md" 300  # LARGEST - canonical

    # Create TDD files where multiple have same size
    create_test_file "$TEST_DIR/TDD_001.md" 150
    create_test_file "$TEST_DIR/TDD_002.md" 250  # LARGEST - canonical
    create_test_file "$TEST_DIR/TDD_003.md" 250  # Same size as TDD_002

    echo "Initial state: 6 files with some ties"
    assert_file_count "$TEST_DIR" 6 "*.md"

    # Run phase5
    run_phase5

    # Verify largest files are canonical
    assert_file_exists "$TEST_DIR/UAT_003.md" "UAT_003.md (300 lines) is largest"
    assert_file_exists "$TEST_DIR/TDD_002.md" "TDD_002 or TDD_003 should be canonical"

    # Other files should be in quarantine
    assert_file_exists "$QUARANTINE_DIR/UAT_001.md"
    assert_file_exists "$QUARANTINE_DIR/UAT_002.md"

    # At least 4 files should be in quarantine (2 UAT + 2 TDD) + QUARANTINE_REASON.md
    local quarantine_count=$(find "$QUARANTINE_DIR" -maxdepth 1 -name "*.md" -type f | wc -l)
    if [ "$quarantine_count" -ge 5 ]; then
        echo "✓ Quarantine has at least 5 files (4 moved + reason file)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "✗ FAILED: Expected at least 5 files in quarantine, found $quarantine_count"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi

    teardown_test
    return $((TESTS_FAILED > 0 ? 1 : 0))
}

# ============================================================================
# RUN ALL TESTS
# ============================================================================

run_all_tests() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════════════╗"
    echo "║   TDD TEST SUITE: doc-manager Phase 5 Consolidation Logic             ║"
    echo "║   Testing Phase 5 of doc-sweep.sh (lines 208-315)                     ║"
    echo "╚════════════════════════════════════════════════════════════════════════╝"
    echo ""

    # Run each test
    test_phase5_quarantine_non_canonical_files || true
    test_phase5_protect_claude_md || true
    test_phase5_create_quarantine_reason || true
    test_phase5_count_files_quarantined || true
    test_phase5_canonical_file_selection || true
    test_phase5_no_uat_files || true
    test_phase5_no_tdd_files || true
    test_phase5_tie_breaking || true
    test_phase5_large_scale || true

    # Summary
    echo ""
    echo "╔════════════════════════════════════════════════════════════════════════╗"
    echo "║                         TEST SUMMARY                                   ║"
    echo "╚════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Tests run:    $TESTS_RUN"
    echo "Tests passed: $TESTS_PASSED"
    echo "Tests failed: $TESTS_FAILED"
    echo ""

    if [ "$TESTS_FAILED" -eq 0 ]; then
        echo "✓ ALL TESTS PASSED"
        echo ""
        return 0
    else
        echo "✗ SOME TESTS FAILED - Phase 5 has bugs that need fixing"
        echo ""
        return 1
    fi
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    # Verify script exists
    if [ ! -f "$SCRIPT_PATH" ]; then
        echo "ERROR: Script not found: $SCRIPT_PATH"
        exit 1
    fi

    run_all_tests
    exit $?
}

# Run tests if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
