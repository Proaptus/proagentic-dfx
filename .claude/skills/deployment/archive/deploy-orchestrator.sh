#!/bin/bash

# ProAgentic Deployment Orchestrator
# Main entry point for all deployment modes
# Usage:
#   deployment --mode full --project proagentic
#   deployment --mode smoke --project proagentic
#   deployment --mode backend-only --project proagentic
#   deployment --mode staging-only --project proagentic
#   deployment --mode production-only --project proagentic

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_DIR="$(cd "$SKILL_DIR/../.." && pwd)"

MODE="full"
PROJECT="proagentic"
CONFIG_FILE="${PROJECT_DIR}/deployment.config.yml"
SKIP_UAT=false

# Utility functions
log_header() {
  echo ""
  echo -e "${BLUE}=== $1 ===${NC}"
  echo ""
}

log_section() {
  echo -e "${BLUE}📦 $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅${NC} $1"
}

log_error() {
  echo -e "${RED}❌${NC} $1"
}

log_info() {
  echo -e "${YELLOW}ℹ️${NC} $1"
}

show_usage() {
  cat << EOF
ProAgentic Deployment Orchestrator

Usage: deployment [OPTIONS]

Options:
  --mode MODE              Deployment mode (required)
                          - full: Backend → Staging → UAT (full) → Production
                          - smoke: Backend → Staging → UAT (smoke) → Production
                          - backend-only: Backend only
                          - staging-only: Staging only
                          - production-only: Production only

  --project PROJECT        Project name (default: proagentic)
  --config FILE            Config file path (default: deployment.config.yml)
  --skip-uat              Skip UAT testing (not recommended)
  --help                  Show this help message

Examples:
  deployment --mode full --project proagentic
  deployment --mode smoke --project proagentic
  deployment --mode backend-only --project proagentic
  deployment --mode staging-only --project proagentic
  deployment --mode production-only --project proagentic

Modes Explained:
  full             - Complete deployment with comprehensive UAT (25-35 min)
  smoke            - Fast deployment with smoke tests (15-20 min)
  backend-only     - Deploy backend to Cloud Run only (5-10 min)
  staging-only     - Deploy frontend to staging alias (3-5 min)
  production-only  - Deploy frontend to production (2-3 min)

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --mode)
      MODE="$2"
      shift 2
      ;;
    --project)
      PROJECT="$2"
      shift 2
      ;;
    --config)
      CONFIG_FILE="$2"
      shift 2
      ;;
    --skip-uat)
      SKIP_UAT=true
      shift
      ;;
    --help)
      show_usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_usage
      exit 1
      ;;
  esac
done

# Validate mode
case "$MODE" in
  full|smoke|backend-only|staging-only|production-only)
    ;;
  *)
    log_error "Invalid mode: $MODE"
    show_usage
    exit 1
    ;;
esac

# Check config file exists
if [ ! -f "$CONFIG_FILE" ]; then
  log_error "Config file not found: $CONFIG_FILE"
  echo ""
  echo "Create one from the template:"
  echo "  cp .claude/skills/deployment/templates/deployment.config.example.yml deployment.config.yml"
  exit 1
fi

# Change to project directory
cd "$PROJECT_DIR"

# Header
log_header "ProAgentic Deployment - $MODE Mode"
echo "Project: $PROJECT"
echo "Config: $CONFIG_FILE"
echo "Started: $(date)"
echo ""

# Step 1: Initialize logging
log_section "Initializing deployment log"
source "$SCRIPT_DIR/logging/init-log.sh" "$PROJECT" "$MODE"
log_success "Deployment ID: $DEPLOYMENT_ID"
log_success "Log file: $LOG_FILE"

# Step 2: Pre-deployment checks
log_section "Running pre-deployment checks"
if bash "$SCRIPT_DIR/safety/pre-deploy-checks.sh"; then
  log_success "Pre-deployment checks passed"
  log_info "Logging phase: pre-deploy-checks"
  bash "$SCRIPT_DIR/logging/log-event.sh" "pre-deploy-checks" "success" "0" '{}' || true
else
  log_error "Pre-deployment checks failed"
  bash "$SCRIPT_DIR/logging/log-event.sh" "pre-deploy-checks" "failed" "0" '{}' || true
  exit 1
fi

# Step 3: Execute deployment based on mode
DEPLOYMENT_FAILED=0

case "$MODE" in
  full|smoke)
    # Backend deployment
    log_section "Deploying backend to Cloud Run"
    if bash "$SCRIPT_DIR/modules/deploy-backend.sh" "$CONFIG_FILE"; then
      log_success "Backend deployed successfully"
    else
      log_error "Backend deployment failed"
      DEPLOYMENT_FAILED=1
    fi
    
    if [ $DEPLOYMENT_FAILED -eq 0 ]; then
      # Staging deployment
      log_section "Deploying frontend to staging"
      if bash "$SCRIPT_DIR/modules/deploy-staging.sh" "$CONFIG_FILE"; then
        log_success "Staging deployed successfully"
      else
        log_error "Staging deployment failed"
        DEPLOYMENT_FAILED=1
      fi
    fi
    
    if [ $DEPLOYMENT_FAILED -eq 0 ] && [ "$SKIP_UAT" = false ]; then
      # UAT testing
      log_section "Running UAT tests (mode: $MODE)"
      TEST_SCOPE=$([ "$MODE" = "full" ] && echo "full" || echo "smoke")
      if bash "$SCRIPT_DIR/modules/run-uat.sh" "$CONFIG_FILE" "$TEST_SCOPE"; then
        log_success "UAT tests passed"
      else
        log_error "UAT tests failed"
        DEPLOYMENT_FAILED=1
      fi
    fi
    
    if [ $DEPLOYMENT_FAILED -eq 0 ]; then
      # Production deployment
      log_section "Deploying frontend to production"
      if bash "$SCRIPT_DIR/modules/deploy-production.sh" "$CONFIG_FILE"; then
        log_success "Production deployed successfully"
      else
        log_error "Production deployment failed"
        DEPLOYMENT_FAILED=1
      fi
    fi
    ;;
    
  backend-only)
    log_section "Deploying backend to Cloud Run"
    if bash "$SCRIPT_DIR/modules/deploy-backend.sh" "$CONFIG_FILE"; then
      log_success "Backend deployed successfully"
    else
      log_error "Backend deployment failed"
      DEPLOYMENT_FAILED=1
    fi
    ;;
    
  staging-only)
    log_section "Deploying frontend to staging"
    if bash "$SCRIPT_DIR/modules/deploy-staging.sh" "$CONFIG_FILE"; then
      log_success "Staging deployed successfully"
    else
      log_error "Staging deployment failed"
      DEPLOYMENT_FAILED=1
    fi
    ;;
    
  production-only)
    log_section "Deploying frontend to production"
    if bash "$SCRIPT_DIR/modules/deploy-production.sh" "$CONFIG_FILE"; then
      log_success "Production deployed successfully"
    else
      log_error "Production deployment failed"
      DEPLOYMENT_FAILED=1
    fi
    ;;
esac

# Step 4: Final validation
if [ $DEPLOYMENT_FAILED -eq 0 ]; then
  log_section "Validating deployment"
  bash "$SCRIPT_DIR/modules/validate-deployment.sh" "$CONFIG_FILE" "$MODE" || DEPLOYMENT_FAILED=1
fi

# Step 5: Summary
echo ""
log_header "Deployment Summary"
echo "Project: $PROJECT"
echo "Mode: $MODE"
echo "Status: $([ $DEPLOYMENT_FAILED -eq 0 ] && echo -e "${GREEN}✅ SUCCESS${NC}" || echo -e "${RED}❌ FAILED${NC}")"
echo "Deployment ID: $DEPLOYMENT_ID"
echo "Log: $LOG_FILE"
echo "Completed: $(date)"

# Update final log status
if [ $DEPLOYMENT_FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
  echo ""
  echo "View logs:"
  echo "  cat $LOG_FILE"
  echo ""
  echo "Next steps:"
  echo "  - Monitor application logs"
  echo "  - Verify key features work"
  echo "  - Check analytics for any issues"
  exit 0
else
  echo ""
  echo -e "${RED}❌ Deployment failed. See errors above.${NC}"
  echo ""
  echo "View logs:"
  echo "  cat $LOG_FILE | jq '.errors'"
  echo ""
  echo "Common fixes:"
  echo "  - Check environment variables"
  echo "  - Verify git status"
  echo "  - Run pre-deploy-checks manually"
  exit 1
fi
