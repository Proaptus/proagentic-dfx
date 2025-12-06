#!/usr/bin/env bash
#
# NOVAE Post-Edit Validation Script
#
# Runs automatically after Write/Edit tool usage to provide immediate feedback
# on code quality issues. This helps catch problems early in the development cycle.
#
# Checks performed:
# 1. ESLint (code style and patterns)
# 2. TypeScript type checking
# 3. Vitest (quick test run on changed files)
#
# Context7 Reference: Claude Code Hooks - PostToolUse

set -euo pipefail

# Color output for better readability
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Exit codes (non-zero means feedback to Claude, but don't block)
readonly EXIT_SUCCESS=0

log_info() {
    echo -e "${GREEN}[NOVAE Validation]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[NOVAE Validation]${NC} $*"
}

log_error() {
    echo -e "${RED}[NOVAE Validation]${NC} $*"
}

# Check if we're in a Node.js project
if [[ ! -f "package.json" ]]; then
    log_warn "No package.json found - skipping validation"
    exit $EXIT_SUCCESS
fi

# Check if npm is available
if ! command -v npm >/dev/null 2>&1; then
    log_warn "npm not found - skipping validation"
    exit $EXIT_SUCCESS
fi

log_info "Running post-edit validation..."

# Track if any checks failed (for summary)
checks_failed=0

# 1. ESLint check
log_info "Running ESLint..."
if npm run lint --silent 2>&1; then
    log_info "✓ ESLint passed"
else
    log_error "✗ ESLint found issues"
    checks_failed=$((checks_failed + 1))
fi

# 2. TypeScript type checking
log_info "Running TypeScript type check..."
if npm run -s typecheck 2>&1 || npm run -s tsc --noEmit 2>&1; then
    log_info "✓ TypeScript types valid"
else
    log_error "✗ TypeScript type errors found"
    checks_failed=$((checks_failed + 1))
fi

# 3. Quick test run (only changed files, if Vitest available)
if command -v npx >/dev/null 2>&1; then
    if npx --yes vitest --version >/dev/null 2>&1; then
        log_info "Running Vitest on changed files..."
        # Use --reporter=dot for minimal output, --silent to reduce noise
        # --changed only runs tests for modified files (fast)
        if npx vitest --reporter=dot --silent --changed --run 2>&1 | grep -v "^$"; then
            log_info "✓ Tests passed"
        else
            log_warn "⚠ Some tests may have failed (check output above)"
            checks_failed=$((checks_failed + 1))
        fi
    else
        log_warn "Vitest not available - skipping test run"
    fi
else
    log_warn "npx not available - skipping test run"
fi

# Summary
echo ""
if [[ $checks_failed -eq 0 ]]; then
    log_info "========================================="
    log_info "All validation checks passed! ✓"
    log_info "========================================="
else
    log_warn "========================================="
    log_warn "$checks_failed validation check(s) failed"
    log_warn "Review the output above and fix issues"
    log_warn "========================================="
fi

# Always exit 0 - we provide feedback but don't block Claude
# Claude will see the output and can decide how to respond
exit $EXIT_SUCCESS
