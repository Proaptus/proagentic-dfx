#!/bin/bash

# Deploy backend to Google Cloud Run
# Wrapper around ProAgentic's existing deploy-server.sh
# Usage: deploy-backend.sh CONFIG_FILE

set -e

CONFIG_FILE="${1:-deployment.config.yml}"
START_TIME=$(date +%s)

# Load config values (simplified parsing)
GCLOUD_PROJECT=$(grep "gcloud_project:" "$CONFIG_FILE" | cut -d':' -f2 | tr -d ' ')
SERVICE_NAME=$(grep "service_name:" "$CONFIG_FILE" | grep -v "#" | head -1 | cut -d':' -f2 | tr -d ' ')
REGION=$(grep "^  region:" "$CONFIG_FILE" | cut -d':' -f2 | tr -d ' ')

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔨 Building and deploying backend to Cloud Run..."
echo "  Project: $GCLOUD_PROJECT"
echo "  Service: $SERVICE_NAME"
echo "  Region: $REGION"
echo ""

# Check if deploy script exists
if [ -f "./deploy-server.sh" ]; then
  # Use existing ProAgentic deploy script
  if bash ./deploy-server.sh; then
    DURATION=$(($(date +%s) - START_TIME))
    echo ""
    echo -e "${GREEN}✅ Backend deployment successful${NC}"
    
    # Log the phase
    BACKEND_URL="https://${SERVICE_NAME}-*.${REGION}.run.app"
    bash "${LOG_DIR}/log-event.sh" "backend-deploy" "success" "$DURATION" "{\"service\": \"$SERVICE_NAME\", \"region\": \"$REGION\"}" || true
    exit 0
  else
    DURATION=$(($(date +%s) - START_TIME))
    echo ""
    echo -e "${RED}❌ Backend deployment failed${NC}"
    bash "${LOG_DIR}/log-event.sh" "backend-deploy" "failed" "$DURATION" "{\"error\": \"deployment script failed\"}" || true
    exit 1
  fi
elif [ -f "./.claude/skills/deployment/scripts/modules/deploy-server.sh" ]; then
  # Fallback location
  if bash ./.claude/skills/deployment/scripts/modules/deploy-server.sh; then
    DURATION=$(($(date +%s) - START_TIME))
    echo ""
    echo -e "${GREEN}✅ Backend deployment successful${NC}"
    bash "${LOG_DIR}/log-event.sh" "backend-deploy" "success" "$DURATION" "{\"service\": \"$SERVICE_NAME\"}" || true
    exit 0
  else
    DURATION=$(($(date +%s) - START_TIME))
    echo ""
    echo -e "${RED}❌ Backend deployment failed${NC}"
    bash "${LOG_DIR}/log-event.sh" "backend-deploy" "failed" "$DURATION" "{\"error\": \"deployment script failed\"}" || true
    exit 1
  fi
else
  echo -e "${RED}❌ Deploy script not found${NC}"
  echo "Expected: ./deploy-server.sh"
  DURATION=$(($(date +%s) - START_TIME))
  bash "${LOG_DIR}/log-event.sh" "backend-deploy" "failed" "$DURATION" "{\"error\": \"deploy script not found\"}" || true
  exit 1
fi
