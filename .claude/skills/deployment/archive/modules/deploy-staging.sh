#!/bin/bash

# Deploy frontend to Netlify staging alias
# Wrapper around ProAgentic's existing deploy-to-staging.sh
# Usage: deploy-staging.sh CONFIG_FILE

set -e

CONFIG_FILE="${1:-deployment.config.yml}"
START_TIME=$(date +%s)

# Load config values
NETLIFY_SITE=$(grep "netlify_site:" "$CONFIG_FILE" | cut -d':' -f2 | tr -d ' ')
NETLIFY_ALIAS=$(grep "netlify_alias:" "$CONFIG_FILE" | cut -d':' -f2 | tr -d ' ')
STAGING_DOMAIN=$(grep "cors_domain:" "$CONFIG_FILE" | grep -A1 "staging:" | tail -1 | cut -d':' -f2- | tr -d ' ')

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "📦 Building and deploying frontend to Netlify staging..."
echo "  Site: $NETLIFY_SITE"
echo "  Alias: $NETLIFY_ALIAS"
echo "  URL: https://${NETLIFY_ALIAS}.netlify.app"
echo ""

# Build frontend
echo "🔨 Building frontend..."
if npm run build:staging > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  DURATION=$(($(date +%s) - START_TIME))
  bash "${LOG_FILE:-.deployment/logs/latest.json}" "staging-build" "failed" "$DURATION" "{\"error\": \"npm build failed\"}" || true
  exit 1
fi

# Deploy to staging alias
echo "📤 Deploying to Netlify..."
if command -v netlify &> /dev/null; then
  if NETLIFY_SITE="$NETLIFY_SITE" netlify deploy \
      --dir=dist \
      --alias="$NETLIFY_ALIAS" \
      --message="Deployment $(date +%s)" \
      > /dev/null 2>&1; then
    DURATION=$(($(date +%s) - START_TIME))
    echo -e "${GREEN}✅ Staging deployment successful${NC}"
    echo "🌐 Staging URL: https://${NETLIFY_ALIAS}.netlify.app"
    
    # Log the phase
    bash "${LOG_FILE:-.deployment/logs/latest.json}" "staging-deploy" "success" "$DURATION" "{\"alias\": \"$NETLIFY_ALIAS\", \"domain\": \"$STAGING_DOMAIN\"}" || true
    exit 0
  else
    DURATION=$(($(date +%s) - START_TIME))
    echo -e "${RED}❌ Netlify deployment failed${NC}"
    echo "Try manual deploy:"
    echo "  netlify deploy --dir=dist --alias=$NETLIFY_ALIAS"
    bash "${LOG_FILE:-.deployment/logs/latest.json}" "staging-deploy" "failed" "$DURATION" "{\"error\": \"netlify deploy failed\"}" || true
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️ Netlify CLI not found${NC}"
  echo "Install with: npm install -g netlify-cli"
  DURATION=$(($(date +%s) - START_TIME))
  bash "${LOG_FILE:-.deployment/logs/latest.json}" "staging-deploy" "failed" "$DURATION" "{\"error\": \"netlify cli not installed\"}" || true
  exit 1
fi
