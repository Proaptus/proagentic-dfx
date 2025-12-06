#!/bin/bash
#
# Simple ProAgentic Deployment Script
# Follows the standard workflow: Backend → Staging → Smoke UAT → Production → Final UAT
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ProAgentic Production Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Deploy Backend
echo -e "${BLUE}Step 1/6: Deploying Backend${NC}"
echo "Running: ./deploy-server.sh"
echo ""

if ./deploy-server.sh; then
  echo -e "${GREEN}✅ Backend deployed successfully${NC}"
else
  echo -e "${RED}❌ Backend deployment failed${NC}"
  exit 1
fi

echo ""
echo "Waiting 5 seconds for backend to stabilize..."
sleep 5

# Step 2: Health Check
echo ""
echo -e "${BLUE}Step 2/6: Health Check${NC}"
echo "Checking: https://proagentic-server-705044459306.europe-west2.run.app/api/health"
echo ""

HEALTH_CHECK=$(curl -s https://proagentic-server-705044459306.europe-west2.run.app/api/health)
if echo "$HEALTH_CHECK" | grep -q '"status":"ok"'; then
  echo -e "${GREEN}✅ Backend health check passed${NC}"
  echo "$HEALTH_CHECK" | python3 -m json.tool
else
  echo -e "${RED}❌ Backend health check failed${NC}"
  echo "$HEALTH_CHECK"
  exit 1
fi

# Step 3: Deploy to Staging
echo ""
echo -e "${BLUE}Step 3/6: Deploying to Staging${NC}"
echo "Building frontend..."
npm run build

echo ""
echo "Deploying to Netlify staging..."
netlify deploy --alias=staging --dir=dist

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Staging deployed: https://staging--proagentic1.netlify.app${NC}"
else
  echo -e "${RED}❌ Staging deployment failed${NC}"
  exit 1
fi

# Step 4: Smoke UAT on Staging
echo ""
echo -e "${BLUE}Step 4/6: Running Smoke UAT on Staging${NC}"
echo -e "${YELLOW}⚠️  UAT Skill activation required - please run smoke tests on staging${NC}"
echo ""
echo "Target: https://staging--proagentic1.netlify.app"
echo "Scope: Smoke tests (auth, dashboard, basic functionality)"
echo ""
read -p "Press Enter when UAT tests complete, or Ctrl+C to abort..."

echo ""
read -p "Were critical bugs found? (y/N): " critical_bugs
if [[ "$critical_bugs" =~ ^[Yy]$ ]]; then
  echo -e "${RED}❌ Critical bugs found in staging UAT - stopping deployment${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Staging UAT passed (or non-critical issues only)${NC}"
fi

# Step 5: Deploy to Production
echo ""
echo -e "${BLUE}Step 5/6: Deploying to Production${NC}"
echo "Building frontend..."
npm run build

echo ""
echo "Deploying to Netlify production..."
netlify deploy --prod --dir=dist

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Production deployed: https://proagentic.ai${NC}"
else
  echo -e "${RED}❌ Production deployment failed${NC}"
  exit 1
fi

# Step 6: Final Smoke UAT on Production
echo ""
echo -e "${BLUE}Step 6/6: Running Final Smoke UAT on Production${NC}"
echo -e "${YELLOW}⚠️  UAT Skill activation required - please run smoke tests on production${NC}"
echo ""
echo "Target: https://proagentic.ai"
echo "Scope: Smoke tests (auth, dashboard, basic functionality)"
echo ""
read -p "Press Enter when UAT tests complete..."

echo ""
read -p "Were critical bugs found? (y/N): " critical_bugs_prod
if [[ "$critical_bugs_prod" =~ ^[Yy]$ ]]; then
  echo -e "${RED}❌ Critical bugs found in production - immediate attention required${NC}"
  echo ""
  echo "Consider rollback:"
  echo "  Netlify: Dashboard → Deployments → Publish previous version"
  exit 1
else
  echo -e "${GREEN}✅ Production UAT passed${NC}"
fi

# Success
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Backend:     https://proagentic-server-705044459306.europe-west2.run.app"
echo "Staging:     https://staging--proagentic1.netlify.app"
echo "Production:  https://proagentic.ai"
echo ""
echo "Next steps:"
echo "  - Monitor Cloud Run logs for any backend errors"
echo "  - Check Netlify dashboard for frontend metrics"
echo "  - Review UAT reports for tracked issues"
echo ""
