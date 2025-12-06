#!/bin/bash

# Deploy frontend to Netlify production (proagentic.ai)
# Usage: deploy-production.sh CONFIG_FILE

set -e

CONFIG_FILE="${1:-deployment.config.yml}"
START_TIME=$(date +%s)

# Load config values
PRODUCTION_DOMAIN=$(grep "domain:" "$CONFIG_FILE" | grep -A1 "production:" | tail -1 | cut -d':' -f2- | tr -d ' ')

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 Deploying frontend to production..."
echo "  Domain: $PRODUCTION_DOMAIN"
echo ""

# Build frontend for production
echo "🔨 Building frontend for production..."
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  DURATION=$(($(date +%s) - START_TIME))
  exit 1
fi

# Deploy to production
echo "📤 Deploying to production..."
if command -v netlify &> /dev/null; then
  if netlify deploy \
      --dir=dist \
      --prod \
      --message="Production deployment $(date +%s)" \
      > /dev/null 2>&1; then
    DURATION=$(($(date +%s) - START_TIME))
    echo -e "${GREEN}✅ Production deployment successful${NC}"
    echo "🌐 Production URL: $PRODUCTION_DOMAIN"
    exit 0
  else
    DURATION=$(($(date +%s) - START_TIME))
    echo -e "${RED}❌ Netlify production deployment failed${NC}"
    echo "Try manual deploy:"
    echo "  netlify deploy --dir=dist --prod"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️ Netlify CLI not found${NC}"
  DURATION=$(($(date +%s) - START_TIME))
  exit 1
fi
