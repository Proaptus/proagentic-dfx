# Deployment Usage Examples

Practical examples for common ProAgentic deployment scenarios.

## Example 1: Deploy New Feature to Production

**Scenario**: You've implemented a new dashboard feature, tested it locally, and it's ready for production.

**Steps**:

```bash
# 1. Ensure you're on main branch with latest code
git checkout main
git pull origin main

# 2. Verify no uncommitted changes
git status
# On branch main, working tree clean

# 3. Run full deployment with UAT
deployment --mode full --project proagentic
# Output:
# 🚀 ProAgentic Full Deployment
# Phase 1: Pre-deployment checks... ✅ (12 sec)
# Phase 2: Backend to Cloud Run... ✅ (3 min)
# Phase 3: Frontend to staging... ✅ (2 min)
# Phase 4: Running full UAT tests... ✅ (12 min)
# Phase 5: Frontend to production... ✅ (2 min)
# ✅ Deployment successful!
# 📋 Log: .deployment/logs/20251019-143022.json

# 4. Verify deployment log
cat .deployment/logs/latest.json | jq '.status'
# Output: "success"

# 5. Check production is live
curl -s https://proagentic.ai/api/health | jq '.'
# Output: { "status": "ok", "timestamp": "..." }
```

**Result**: New feature is now live in production after passing all tests.

---

## Example 2: Quick Hotfix with Smoke Tests

**Scenario**: Critical bug discovered in authentication. Fix is ready but needs quick validation.

**Steps**:

```bash
# 1. Fix the bug locally and commit
git checkout main
git pull origin main
# ... fix code ...
git add .
git commit -m "hotfix: resolve authentication timeout issue"

# 2. Use smoke mode for faster UAT (5-7 min instead of 15 min)
deployment --mode smoke --project proagentic
# Output:
# 🚀 ProAgentic Smoke Deployment
# Phase 1: Pre-deployment checks... ✅ (12 sec)
# Phase 2: Backend to Cloud Run... ✅ (3 min)
# Phase 3: Frontend to staging... ✅ (2 min)
# Phase 4: Running smoke UAT tests... ✅ (6 min) [only auth + dashboard]
# Phase 5: Frontend to production... ✅ (2 min)
# ✅ Deployment successful!

# 3. Check logs
cat .deployment/logs/latest.json | jq '.phases[] | select(.phase=="uat-testing")'
# Output:
# {
#   "phase": "uat-testing",
#   "status": "success",
#   "duration_seconds": 360,
#   "scope": "smoke",
#   "test_results": "all_passed"
# }
```

**Result**: Hotfix deployed in ~15 minutes with smoke tests validating critical flows.

---

## Example 3: Backend Hotfix Only

**Scenario**: API performance issue requires backend code change. Frontend is unchanged.

**Steps**:

```bash
# 1. Make and commit backend changes only
git checkout main
git pull origin main
# ... modify server/index.js ...
git add server/
git commit -m "fix: optimize API response time for large queries"

# 2. Deploy backend only (skips frontend builds)
deployment --mode backend-only --project proagentic
# Output:
# 🚀 ProAgentic Backend-Only Deployment
# Phase 1: Pre-deployment checks... ✅ (12 sec)
# Phase 2: Backend to Cloud Run... ✅ (4 min)
# ✅ Backend deployed successfully!
# 📍 Backend URL: https://proagentic-server-705044459306.europe-west2.run.app
# 📋 Log: .deployment/logs/20251019-144522.json

# 3. Verify backend health
curl -s https://proagentic-server-705044459306.europe-west2.run.app/api/health | jq '.'
# Output: { "status": "healthy", "uptime": "2 minutes" }

# 4. Check traffic routing
gcloud run services describe proagentic-server --region=europe-west2 | grep -A5 "traffic:"
# Output: 100% routed to latest revision
```

**Result**: Backend hotfix deployed in ~5 minutes without building/testing frontend.

---

## Example 4: Staging Pre-Flight Check

**Scenario**: Major UI refactor completed. Want to test on staging before full production deployment.

**Steps**:

```bash
# 1. Deploy only to staging for manual testing
deployment --mode staging-only --project proagentic
# Output:
# 🚀 ProAgentic Staging-Only Deployment
# Phase 1: Build frontend for staging... ✅ (3 min)
# Phase 2: Deploy to Netlify staging... ✅ (2 min)
# ✅ Staging deployed successfully!
# 📍 Staging URL: https://staging--proagentic1.netlify.app
# 📋 Log: .deployment/logs/20251019-150022.json

# 2. Open staging URL in browser
open https://staging--proagentic1.netlify.app
# Manual QA on staging environment

# 3. If everything looks good, run full deployment
deployment --mode full --project proagentic
# Proceeds with full UAT and production deployment

# 4. If issues found, fix and re-deploy staging
git add .
git commit -m "fix: UI styling issues on staging"
deployment --mode staging-only --project proagentic
```

**Result**: Manual testing on staging before full production pipeline.

---

## Example 5: Production-Only Deploy

**Scenario**: Frontend styling fix only, backend unchanged. UAT already passed separately.

**Steps**:

```bash
# 1. Frontend-only commit
git checkout main
git pull origin main
# ... fix frontend styling ...
git add src/
git commit -m "style: improve dashboard responsiveness"

# 2. Deploy only to production (useful if UAT was run manually)
deployment --mode production-only --project proagentic
# Output:
# 🚀 ProAgentic Production-Only Deployment
# Phase 1: Build frontend for production... ✅ (2 min)
# Phase 2: Deploy to production... ✅ (2 min)
# ✅ Production deployed successfully!
# 📍 Production URL: https://proagentic.ai
# 📋 Log: .deployment/logs/20251019-151522.json

# 3. Verify production updated
curl -s https://proagentic.ai/api/health | jq '.version'
```

**Result**: Frontend update deployed directly to production.

---

## Example 6: Debugging Failed Deployment

**Scenario**: Deployment failed during UAT testing. Need to understand what went wrong.

**Steps**:

```bash
# 1. Check the deployment log
cat .deployment/logs/latest.json | jq '.'
# Output shows which phase failed

# 2. Check for specific errors
cat .deployment/logs/latest.json | jq '.errors'
# Output:
# [
#   {
#     "phase": "uat-testing",
#     "error": "Test 'workflow-export' failed: timeout after 30s",
#     "timestamp": "2025-10-19T14:45:22Z"
#   }
# ]

# 3. Review the failing phase details
cat .deployment/logs/latest.json | jq '.phases[] | select(.phase=="uat-testing")'
# Output shows test results and failures

# 4. Fix the issue locally
# ... debug and fix workflow-export test issue ...
git add .
git commit -m "fix: workflow export timeout handling"

# 5. Re-run deployment (backend stays running from before)
deployment --mode full --project proagentic
# Will build and test again from scratch
```

**Result**: Identified test failure, fixed issue, re-deployed successfully.

---

## Example 7: Backend Rollback After Failed Deployment

**Scenario**: Backend deployment to production caused issues. Need to rollback quickly.

**Steps**:

```bash
# 1. List recent Cloud Run revisions
gcloud run revisions list --service=proagentic-server --region=europe-west2
# Output:
# REVISION                         ACTIVE  SERVICE               DEPLOYED
# proagentic-server-xyz789        YES     proagentic-server    2 minutes ago
# proagentic-server-abc456                 proagentic-server    1 hour ago
# proagentic-server-def123                 proagentic-server    3 hours ago

# 2. Route all traffic to previous revision (abc456)
gcloud run services update-traffic proagentic-server \
  --to-revisions=proagentic-server-abc456=100 \
  --region=europe-west2
# Output: Updating traffic... done.

# 3. Verify traffic routing
gcloud run services describe proagentic-server --region=europe-west2 | grep -A5 "traffic:"
# Output shows abc456 at 100%

# 4. Check backend is working
curl -s https://proagentic-server-705044459306.europe-west2.run.app/api/health
# Output: { "status": "healthy" }

# 5. Optional: Delete problematic revision
gcloud run revisions delete proagentic-server-xyz789 --region=europe-west2 --quiet
```

**Result**: Production backend rolled back to stable version in <1 minute.

---

## Example 8: Checking Deployment History

**Scenario**: Need to audit all deployments from past week.

**Steps**:

```bash
# 1. List all deployment logs
ls -lh .deployment/logs/
# Output:
# 20251019-143022.json  (full deployment)
# 20251019-144522.json  (backend-only)
# 20251018-093011.json  (smoke deployment)

# 2. Check specific deployment details
cat .deployment/logs/20251019-143022.json | jq '.'
# Shows complete deployment info

# 3. Parse all deployments for summary
for file in .deployment/logs/*.json; do
  echo "=== $file ==="
  jq '.project, .mode, .status, .started_at' "$file"
done

# 4. Find all failed deployments
jq -s '.[] | select(.status=="failed")' .deployment/logs/*.json

# 5. Calculate total deployment time
jq -s '[.[] | .completed_at - .started_at] | add/length' .deployment/logs/*.json
```

**Result**: Complete audit trail of all deployments with timing and status.

---

## Example 9: Parallel Development - Multiple Branches

**Scenario**: Two features in development. Need to test staging updates without waiting for production.

**Steps**:

```bash
# Branch A - Feature 1 (ready for staging)
git checkout feature/dashboard-charts
deployment --mode staging-only --project proagentic
# Tests on https://staging--proagentic1.netlify.app

# Branch B - Feature 2 (ready for production)
git checkout main
git pull origin main
# ... merge feature/workflow-export ...
deployment --mode full --project proagentic
# Full deployment + UAT + production

# Return to staging testing
git checkout feature/dashboard-charts
deployment --mode staging-only --project proagentic
```

**Result**: Can test staging independently from production deployments.

---

## Example 10: Monitoring Deployments

**Scenario**: Deployment is running. Want to monitor progress in real-time.

**Steps**:

```bash
# 1. Start deployment in one terminal
terminal-1:$ deployment --mode full --project proagentic

# 2. In another terminal, monitor the deployment log
terminal-2:$ watch -n 5 'cat .deployment/logs/latest.json | jq ".phases[-1]"'
# Updates every 5 seconds showing current phase

# 3. Check specific metrics
terminal-3:$ tail -f .deployment/logs/latest.json | jq '.'

# 4. When complete, view full summary
cat .deployment/logs/latest.json | jq '{
  status: .status,
  duration: .completed_at - .started_at,
  phases: [.phases[] | {phase: .phase, status: .status, duration: .duration_seconds}]
}'
```

**Result**: Real-time monitoring of multi-stage deployment process.

---

## Summary of Common Commands

```bash
# Basic deployments
deployment --mode full --project proagentic        # Full pipeline
deployment --mode smoke --project proagentic       # Quick UAT
deployment --mode backend-only --project proagentic # Backend only
deployment --mode staging-only --project proagentic # Frontend staging
deployment --mode production-only --project proagentic # Frontend prod

# Checking logs
cat .deployment/logs/latest.json                   # View latest log
cat .deployment/logs/$(ls -t .deployment/logs | head -1) # View most recent
jq '.phases[] | select(.phase=="backend-deploy")' .deployment/logs/latest.json

# Cloud Run (backend rollback)
gcloud run revisions list --service=proagentic-server --region=europe-west2
gcloud run services update-traffic proagentic-server --to-revisions=REVISION=100 --region=europe-west2

# Netlify (frontend rollback)
netlify deploy:list
netlify deploy --prod  # Deploy previous

# Verification
curl -s https://proagentic.ai/api/health
curl -s https://staging--proagentic1.netlify.app/api/health
```

---

## See Also

- [README.md](README.md) - Full documentation
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - One-page reference
- [SKILL.md](SKILL.md) - Core skill definition
