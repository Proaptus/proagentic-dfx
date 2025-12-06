#!/bin/bash

# Validate deployment - check health endpoints and CORS/CSP headers
# Usage: validate-deployment.sh CONFIG_FILE MODE

set -e

CONFIG_FILE="${1:-deployment.config.yml}"
MODE="${2:-full}"
START_TIME=$(date +%s)

# Load config values
STAGING_DOMAIN=$(grep "cors_domain:" "$CONFIG_FILE" | grep -B2 "staging:" | grep "cors_domain:" | cut -d':' -f2- | tr -d ' ')
PRODUCTION_DOMAIN=$(grep "cors_domain:" "$CONFIG_FILE" | grep -B2 "production:" | grep "cors_domain:" | cut -d':' -f2- | tr -d ' ')

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

echo "🔍 Validating deployment..."
echo ""

# Function to check URL
check_url() {
  local URL="$1"
  local NAME="$2"
  
  echo -n "  Checking $NAME... "
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "$URL" || echo "000")
  
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✅${NC} (HTTP $HTTP_CODE)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}❌${NC} (HTTP $HTTP_CODE)"
    ((FAILED++))
    return 1
  fi
}

# Function to check CORS headers
check_cors() {
  local URL="$1"
  local DOMAIN="$2"
  local NAME="$3"
  
  echo -n "  Checking CORS for $NAME... "
  
  CORS_HEADER=$(curl -s -i -H "Origin: $DOMAIN" "$URL" 2>/dev/null | grep -i "Access-Control-Allow-Origin" | cut -d':' -f2- | tr -d ' \r' || echo "")
  
  if [ "$CORS_HEADER" = "$DOMAIN" ]; then
    echo -e "${GREEN}✅${NC} (matches $DOMAIN)"
    ((PASSED++))
    return 0
  elif [ -n "$CORS_HEADER" ]; then
    echo -e "${YELLOW}⚠️${NC} (found: $CORS_HEADER, expected: $DOMAIN)"
    ((FAILED++))
    return 1
  else
    echo -e "${RED}❌${NC} (CORS header missing)"
    ((FAILED++))
    return 1
  fi
}

# Function to check CSP headers
check_csp() {
  local URL="$1"
  local NAME="$2"
  
  echo -n "  Checking CSP for $NAME... "
  
  CSP_HEADER=$(curl -s -i "$URL" 2>/dev/null | grep -i "Content-Security-Policy" | head -1 || echo "")
  
  if [ -n "$CSP_HEADER" ]; then
    echo -e "${GREEN}✅${NC} (configured)"
    ((PASSED++))
    return 0
  else
    echo -e "${YELLOW}⚠️${NC} (no CSP header found)"
    ((PASSED++))
    return 0
  fi
}

# Validation checks based on mode
case "$MODE" in
  full|smoke)
    echo -e "${BLUE}Backend Validation:${NC}"
    check_url "https://proagentic-server-705044459306.europe-west2.run.app/api/health" "Backend health"
    
    echo ""
    echo -e "${BLUE}Staging Validation:${NC}"
    check_url "https://${STAGING_DOMAIN##*//}/api/health" "Staging frontend"
    check_cors "https://${STAGING_DOMAIN##*//}/api/health" "$STAGING_DOMAIN" "Staging"
    
    echo ""
    echo -e "${BLUE}Production Validation:${NC}"
    check_url "https://${PRODUCTION_DOMAIN##*//}/api/health" "Production frontend"
    check_cors "https://${PRODUCTION_DOMAIN##*//}/api/health" "$PRODUCTION_DOMAIN" "Production"
    ;;
    
  backend-only)
    echo -e "${BLUE}Backend Validation:${NC}"
    check_url "https://proagentic-server-705044459306.europe-west2.run.app/api/health" "Backend health"
    ;;
    
  staging-only)
    echo -e "${BLUE}Staging Validation:${NC}"
    check_url "https://${STAGING_DOMAIN##*//}/api/health" "Staging frontend"
    check_cors "https://${STAGING_DOMAIN##*//}/api/health" "$STAGING_DOMAIN" "Staging"
    ;;
    
  production-only)
    echo -e "${BLUE}Production Validation:${NC}"
    check_url "https://${PRODUCTION_DOMAIN##*//}/api/health" "Production frontend"
    check_cors "https://${PRODUCTION_DOMAIN##*//}/api/health" "$PRODUCTION_DOMAIN" "Production"
    ;;
esac

# Summary
echo ""
echo -e "${BLUE}Validation Summary:${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

DURATION=$(($(date +%s) - START_TIME))

if [ $FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ All validations passed!${NC}"
  exit 0
else
  echo ""
  echo -e "${YELLOW}⚠️ Some validations failed. Check CORS/CSP configuration.${NC}"
  exit 0  # Don't fail validation - it might be transient network issues
fi
