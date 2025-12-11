#!/bin/bash
#
# ProAgentic DfX - Local CI/CD Pipeline Runner
# Mirrors the GitHub Actions workflow for local validation
#
# Usage:
#   ./deploy.sh          # Run full pipeline
#   ./deploy.sh --quick  # Skip E2E tests
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Parse arguments
QUICK_MODE=false
for arg in "$@"; do
    case $arg in
        --quick|-q)
            QUICK_MODE=true
            shift
            ;;
    esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ProAgentic DfX - CI/CD Pipeline${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Determine project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/proagentic-dfx"
MOCK_SERVER_DIR="$PROJECT_ROOT/h2-tank-mock-server"

# Check we're in the right place
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Error: Cannot find proagentic-dfx directory${NC}"
    echo "Expected: $FRONTEND_DIR"
    exit 1
fi

cd "$FRONTEND_DIR"

# Track timing
START_TIME=$(date +%s)

step_header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Pre-flight checks
step_header "Pre-Flight Checks"

echo -n "Checking git status... "
if git diff --quiet && git diff --staged --quiet; then
    echo -e "${GREEN}clean${NC}"
else
    echo -e "${YELLOW}uncommitted changes${NC}"
    echo -e "${YELLOW}Warning: You have uncommitted changes. Consider committing first.${NC}"
fi

echo -n "Current branch: "
BRANCH=$(git branch --show-current)
echo -e "${CYAN}$BRANCH${NC}"

echo -n "Node version: "
node --version

# Gate 0: File Size Check
step_header "Gate 0: File Size Check"

if [ -f "$PROJECT_ROOT/scripts/check-file-sizes.mjs" ]; then
    if node "$PROJECT_ROOT/scripts/check-file-sizes.mjs" all; then
        echo -e "${GREEN}✓ File sizes OK${NC}"
    else
        echo -e "${RED}✗ File size check failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ File size check script not found, skipping${NC}"
fi

# Gate 1: Lint & Type Check
step_header "Gate 1: Lint & Type Check"

echo "Running ESLint..."
if npm run lint; then
    echo -e "${GREEN}✓ Lint passed${NC}"
else
    echo -e "${RED}✗ Lint failed${NC}"
    exit 1
fi

echo ""
echo "Running TypeScript check..."
if npx tsc --noEmit; then
    echo -e "${GREEN}✓ Type check passed${NC}"
else
    echo -e "${RED}✗ Type check failed${NC}"
    exit 1
fi

# Gate 2: Unit Tests
step_header "Gate 2: Unit Tests with Coverage"

if npm run test:coverage; then
    echo -e "${GREEN}✓ Unit tests passed${NC}"
else
    echo -e "${RED}✗ Unit tests failed${NC}"
    exit 1
fi

# Gate 3: Build
step_header "Gate 3: Build Verification"

if npm run build; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Gate 4: Mock Server Tests
step_header "Gate 4: Mock Server Tests"

if [ -d "$MOCK_SERVER_DIR" ]; then
    cd "$MOCK_SERVER_DIR"
    if npm test; then
        echo -e "${GREEN}✓ Mock server tests passed${NC}"
    else
        echo -e "${RED}✗ Mock server tests failed${NC}"
        exit 1
    fi
    cd "$FRONTEND_DIR"
else
    echo -e "${YELLOW}⚠ Mock server directory not found, skipping${NC}"
fi

# Gate 5: E2E Tests (optional with --quick)
if [ "$QUICK_MODE" = true ]; then
    step_header "Gate 5: E2E Tests (SKIPPED - quick mode)"
    echo -e "${YELLOW}⚠ E2E tests skipped due to --quick flag${NC}"
else
    step_header "Gate 5: E2E Tests"

    echo "Installing Playwright browsers..."
    npx playwright install --with-deps chromium

    if npm run test:e2e; then
        echo -e "${GREEN}✓ E2E tests passed${NC}"
    else
        echo -e "${RED}✗ E2E tests failed${NC}"
        echo ""
        echo "View report: npx playwright show-report"
        exit 1
    fi
fi

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ All Quality Gates Passed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Duration: ${CYAN}${MINUTES}m ${SECONDS}s${NC}"
echo ""
echo "Ready to deploy:"
echo ""
echo -e "  ${CYAN}Production:${NC}  git push origin main"
echo -e "  ${CYAN}Staging:${NC}     git push origin staging"
echo -e "  ${CYAN}Preview:${NC}     Push branch and open PR"
echo ""
echo "Deployment URLs:"
echo ""
echo -e "  ${CYAN}Production:${NC}  https://dfx.proagentic.ai"
echo -e "  ${CYAN}Staging:${NC}     https://proagentic-dfx-staging.vercel.app"
echo ""

# Offer to push
if [ "$BRANCH" = "main" ]; then
    echo -e "${YELLOW}You're on main branch.${NC}"
    read -p "Push to production? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin main
        echo -e "${GREEN}✓ Pushed to production. GitHub Actions will deploy.${NC}"
    fi
elif [ "$BRANCH" = "staging" ]; then
    echo -e "${YELLOW}You're on staging branch.${NC}"
    read -p "Push to staging? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin staging
        echo -e "${GREEN}✓ Pushed to staging. GitHub Actions will deploy.${NC}"
    fi
else
    echo "Push your branch to create a PR for preview deployment."
fi
