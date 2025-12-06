#!/bin/bash

# Pre-deployment validation checks
# Verifies git status, config, credentials, and environment before deployment
# Usage: ./pre-deploy-checks.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

FAILED=0
PASSED=0

# Utility functions
check_pass() {
  echo -e "${GREEN}✅${NC} $1"
  ((PASSED++))
}

check_fail() {
  echo -e "${RED}❌${NC} $1"
  ((FAILED++))
}

check_warn() {
  echo -e "${YELLOW}⚠️${NC} $1"
}

echo -e "${BLUE}=== Pre-Deployment Validation ===${NC}"
echo ""

# 1. Check Git Status
echo "📋 Git Checks:"
if git status > /dev/null 2>&1; then
  # Check if on main branch
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    check_pass "On main/master branch"
  else
    check_fail "Not on main/master branch (currently on: $CURRENT_BRANCH)"
  fi
  
  # Check working directory is clean
  if [ -z "$(git status --porcelain)" ]; then
    check_pass "No uncommitted changes"
  else
    check_fail "Working directory has uncommitted changes"
    git status --short
  fi
  
  # Check if up to date with remote
  git fetch origin > /dev/null 2>&1
  if [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main 2>/dev/null || git rev-parse origin/master 2>/dev/null)" ]; then
    check_pass "Up to date with remote"
  else
    check_warn "Local branch is behind remote (consider: git pull origin main)"
  fi
else
  check_fail "Not a git repository"
fi

echo ""

# 2. Check Configuration
echo "📁 Configuration Checks:"
if [ -f "deployment.config.yml" ]; then
  check_pass "deployment.config.yml exists"
  
  # Check for required fields
  if grep -q "^project:" deployment.config.yml; then
    check_pass "Project name configured"
  else
    check_fail "Project name not in deployment.config.yml"
  fi
  
  if grep -q "^backend:" deployment.config.yml && grep -q "gcloud_project:" deployment.config.yml; then
    check_pass "Backend configuration present"
  else
    check_fail "Backend configuration missing"
  fi
  
  if grep -q "^staging:" deployment.config.yml && grep -q "netlify_site:" deployment.config.yml; then
    check_pass "Staging configuration present"
  else
    check_fail "Staging configuration missing"
  fi
else
  check_fail "deployment.config.yml not found (copy from .claude/skills/deployment/templates/deployment.config.example.yml)"
fi

echo ""

# 3. Check Environment Variables
echo "🔐 Environment Variables:"
if [ -n "$OPENROUTER_API_KEY" ]; then
  check_pass "OPENROUTER_API_KEY set"
else
  check_fail "OPENROUTER_API_KEY not set"
fi

if [ -n "$SUPABASE_URL" ]; then
  check_pass "SUPABASE_URL set"
else
  check_fail "SUPABASE_URL not set"
fi

if [ -n "$SUPABASE_SERVICE_KEY" ]; then
  check_pass "SUPABASE_SERVICE_KEY set"
else
  check_fail "SUPABASE_SERVICE_KEY not set"
fi

# Netlify token is optional for backend-only deployments
if [ -n "$NETLIFY_AUTH_TOKEN" ]; then
  check_pass "NETLIFY_AUTH_TOKEN set"
else
  check_warn "NETLIFY_AUTH_TOKEN not set (required for frontend deployments)"
fi

echo ""

# 4. Check Authentication
echo "🔑 Authentication:"
if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
  check_pass "Google Cloud authenticated"
  
  # Check project
  GCLOUD_PROJECT=$(gcloud config get-value project 2>/dev/null)
  if [ "$GCLOUD_PROJECT" = "novae-compare" ]; then
    check_pass "Google Cloud project is: novae-compare"
  else
    check_fail "Google Cloud project is: $GCLOUD_PROJECT (expected: novae-compare)"
  fi
else
  check_fail "Not authenticated with Google Cloud (run: gcloud auth login)"
fi

if command -v netlify &> /dev/null; then
  if netlify status > /dev/null 2>&1; then
    check_pass "Netlify CLI authenticated"
  else
    check_warn "Netlify CLI not authenticated (run: netlify login)"
  fi
else
  check_warn "Netlify CLI not installed (required for frontend deploys)"
fi

echo ""

# 5. Check Build Requirements
echo "🔨 Build Requirements:"
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  check_pass "Node.js installed: $NODE_VERSION"
else
  check_fail "Node.js not installed"
fi

if command -v npm &> /dev/null; then
  check_pass "npm installed"
else
  check_fail "npm not installed"
fi

if command -v docker &> /dev/null; then
  check_pass "Docker installed"
else
  check_fail "Docker not installed (required for backend builds)"
fi

echo ""

# 6. Check Build Artifacts
echo "🏗️ Build Checks:"
if [ -d "node_modules" ]; then
  check_pass "Dependencies installed"
else
  check_warn "node_modules not found (run: npm install)"
fi

if command -v npm &> /dev/null; then
  if npm run build > /dev/null 2>&1; then
    check_pass "Build succeeds"
  else
    check_fail "Build fails (run: npm run build locally to debug)"
  fi
else
  check_warn "npm not available, skipping build check"
fi

echo ""

# 7. Check Database Connection (if Supabase credentials set)
echo "🗄️ Database Checks:"
if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_KEY" ]; then
  # Try a simple curl to check connectivity
  if curl -s -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    "$SUPABASE_URL/rest/v1/" > /dev/null 2>&1; then
    check_pass "Supabase connectivity OK"
  else
    check_warn "Could not verify Supabase connection (may be blocked by network)"
  fi
else
  check_warn "Supabase credentials not set, skipping database check"
fi

echo ""

# Summary
echo -e "${BLUE}=== Summary ===${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}❌ $FAILED check(s) failed. Please fix the issues above before deploying.${NC}"
  exit 1
fi
