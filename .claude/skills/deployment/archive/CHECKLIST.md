# Deployment Checklist

Verify your deployment is ready with this comprehensive checklist.

## Pre-Deployment Checklist

### Git & Code
- [ ] On main branch: `git branch` shows `* main`
- [ ] No uncommitted changes: `git status` shows `working tree clean`
- [ ] Latest code pulled: `git pull origin main` succeeded
- [ ] All tests pass locally: `npm run test` shows passing tests
- [ ] Build succeeds: `npm run build` completes without errors
- [ ] Code linting passes: `npm run lint` shows no errors
- [ ] All commits are meaningful (not WIP or test commits)

### Configuration
- [ ] `deployment.config.yml` exists in project root
- [ ] `deployment.config.yml` contains all required fields:
  - [ ] `project` name
  - [ ] `backend.gcloud_project`
  - [ ] `backend.service_name`
  - [ ] `backend.region`
  - [ ] `staging.netlify_site`
  - [ ] `staging.netlify_alias`
  - [ ] `staging.cors_domain` is `https://staging--proagentic1.netlify.app`
  - [ ] `production.domain`
  - [ ] `production.cors_domain`
  - [ ] `uat.enabled` is true (or false if testing manually)
  - [ ] `uat.smoke_scope` and `uat.full_scope` are defined

### Environment Variables
- [ ] `OPENROUTER_API_KEY` is set: `echo $OPENROUTER_API_KEY` outputs a key
- [ ] `SUPABASE_URL` is set: `echo $SUPABASE_URL` outputs a URL
- [ ] `SUPABASE_SERVICE_KEY` is set: `echo $SUPABASE_SERVICE_KEY` outputs a key
- [ ] `NETLIFY_AUTH_TOKEN` is set: `echo $NETLIFY_AUTH_TOKEN` outputs a token
- [ ] All variables are valid (not empty, not dummy values)

### Authentication
- [ ] Google Cloud authenticated: `gcloud auth list` shows active account
- [ ] Google Cloud project correct: `gcloud config get-value project` shows `novae-compare`
- [ ] Netlify authenticated: `netlify status` shows logged-in status
- [ ] Docker authenticated: `docker login` completed successfully (if using private registry)

### Pre-Deploy Validation Script
```bash
# Run this before any deployment to verify everything is ready
./scripts/pre-deploy-checks.sh

# Should output: ✅ All checks passed!
# If any check fails, fix the issue before proceeding
```

- [ ] Pre-deploy checks script exists: `ls .claude/skills/deployment/scripts/safety/pre-deploy-checks.sh`
- [ ] Pre-deploy checks pass: `./scripts/pre-deploy-checks.sh` exits with code 0

## Deployment Checklist

### Before Starting Deployment

**Choose deployment mode:**
- [ ] Decided on deployment mode (full, smoke, backend-only, staging-only, production-only)
- [ ] Understand estimated deployment time
- [ ] Ensured no conflicts with other ongoing deployments

**Communication (optional but recommended):**
- [ ] Notified team of upcoming deployment (if applicable)
- [ ] Created deployment ticket/task for tracking
- [ ] Scheduled deployment during low-traffic period

### During Deployment

**Monitor deployment progress:**
- [ ] Deployment started: `deployment --mode [mode] --project proagentic`
- [ ] Monitor console output for progress
- [ ] Check logs in real-time: `tail -f .deployment/logs/latest.json`
- [ ] No errors in initial phases (pre-checks, backend build)

**For full/smoke deployments specifically:**
- [ ] Backend deployed successfully: console shows ✅ for backend phase
- [ ] Staging deployed successfully: console shows ✅ for staging phase
- [ ] UAT tests started: console shows UAT testing in progress
- [ ] UAT tests completed: console shows ✅ or ❌ for UAT results

### After Deployment

**Verify deployment succeeded:**
- [ ] Deployment script exited with code 0 (success)
- [ ] Deployment log exists: `ls -lh .deployment/logs/latest.json`
- [ ] Deployment status is `success`: `cat .deployment/logs/latest.json | jq '.status'`

**Check all deployments completed:**
```bash
# View all phases
cat .deployment/logs/latest.json | jq '.phases[] | {phase: .phase, status: .status}'

# Should show all phases with "success" status
```

- [ ] Pre-deploy checks: ✅ success
- [ ] Backend deployment: ✅ success (if applicable to mode)
- [ ] Staging deployment: ✅ success (if applicable to mode)
- [ ] UAT testing: ✅ success (if applicable to mode)
- [ ] Production deployment: ✅ success (if applicable to mode)

### Verify Deployments Live

**Backend health check (if backend deployed):**
```bash
curl -s https://proagentic-server-705044459306.europe-west2.run.app/api/health | jq '.'
```
- [ ] Returns HTTP 200
- [ ] JSON shows `"status": "healthy"` or `"status": "ok"`
- [ ] No error messages

**Staging health check (if staging deployed):**
```bash
curl -s https://staging--proagentic1.netlify.app/api/health | jq '.'
```
- [ ] Returns HTTP 200
- [ ] Page loads in browser
- [ ] No console errors in browser developer tools
- [ ] CORS headers present: `Access-Control-Allow-Origin: https://staging--proagentic1.netlify.app`

**Production health check (if production deployed):**
```bash
curl -s https://proagentic.ai/api/health | jq '.'
```
- [ ] Returns HTTP 200
- [ ] Page loads in browser at https://proagentic.ai
- [ ] No console errors in browser developer tools
- [ ] CORS headers present: `Access-Control-Allow-Origin: https://proagentic.ai`

### Smoke Testing (Post-Deployment)

**Critical flows work:**
- [ ] Can log in with test account (staging or production)
- [ ] Dashboard loads without errors
- [ ] Can create a new project
- [ ] Can perform key workflows (the ones you deployed)

**No regressions visible:**
- [ ] Previous features still work
- [ ] No JavaScript errors in console
- [ ] No API errors in network tab
- [ ] Performance acceptable (page loads in <3 seconds)

## Post-Deployment Documentation

### Log Deployment
- [ ] Noted deployment ID: `cat .deployment/logs/latest.json | jq '.deployment_id'`
- [ ] Added to deployment log/ticket:
  - [ ] What was deployed (features, fixes)
  - [ ] Deployment time (duration)
  - [ ] Any issues encountered and resolved
  - [ ] Verification steps completed

### Cleanup (if needed)
- [ ] Delete old revisions from Cloud Run (if excessive builds)
- [ ] Clean up local Docker images: `docker image prune`
- [ ] Update documentation if process changed

### Monitoring (Next 24 hours)
- [ ] Check error logs in Cloud Run: `gcloud run services logs read proagentic-server`
- [ ] Monitor Netlify analytics for issues
- [ ] Check user feedback/support tickets for new errors
- [ ] If issues found, prepare rollback or hotfix

## Rollback Checklist

**If deployment needs to be rolled back:**

### Backend Rollback
- [ ] Identified previous stable revision: `gcloud run revisions list --service=proagentic-server --region=europe-west2`
- [ ] Confirmed revision name and timestamp
- [ ] Executed rollback: `gcloud run services update-traffic proagentic-server --to-revisions=REVISION_NAME=100 --region=europe-west2`
- [ ] Verified traffic routed: `gcloud run services describe proagentic-server --region=europe-west2`
- [ ] Tested backend health: `curl -s https://proagentic-server-xxx.run.app/api/health`

### Frontend Rollback
- [ ] Opened Netlify dashboard → Deployments
- [ ] Found previous successful deployment
- [ ] Clicked "Restore" on that deployment
- [ ] Verified production updated: `curl -s https://proagentic.ai/api/health`
- [ ] Tested critical flows in browser

### Post-Rollback
- [ ] Notified team of rollback
- [ ] Documented what went wrong
- [ ] Created ticket to fix and re-test issue
- [ ] Committed post-mortem findings

## Issue Resolution Checklist

**If deployment fails at any step:**

1. **Identify the failing phase:**
   ```bash
   cat .deployment/logs/latest.json | jq '.phases[] | select(.status=="failed")'
   ```
   - [ ] Noted which phase failed

2. **Check error details:**
   ```bash
   cat .deployment/logs/latest.json | jq '.errors'
   ```
   - [ ] Read all error messages
   - [ ] Understood root cause

3. **Fix the issue:**
   - [ ] Identified root cause
   - [ ] Made code changes if necessary
   - [ ] Verified fix locally: `npm run test && npm run build`
   - [ ] Committed changes: `git add . && git commit -m "..."`

4. **Re-deploy:**
   - [ ] Ran appropriate deployment mode again
   - [ ] Monitored for same/new errors
   - [ ] If still failing, escalate or rollback

## Checklist Template

Copy and paste this for your deployment notes:

```markdown
## Deployment: [Date] - [Feature Name]

### Pre-Deployment
- [ ] Git checks passed
- [ ] Config validated
- [ ] Env vars set
- [ ] Auth verified
- [ ] Pre-checks passed

### Deployment
- [ ] Mode: [full/smoke/backend-only/staging-only/production-only]
- [ ] Started at: [time]
- [ ] Completed at: [time]
- [ ] Deployment ID: [id from logs]

### Post-Deployment
- [ ] All phases: ✅ success
- [ ] Backend health: ✅ ok
- [ ] Staging health: ✅ ok
- [ ] Production health: ✅ ok
- [ ] Smoke tests passed: ✅ all flows

### Sign-Off
- [ ] Deployment verified working
- [ ] No issues found
- [ ] Team notified
- [ ] Deployment complete!
```

## See Also

- [README.md](README.md) - Full documentation
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick lookup
- [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - Real scenarios
- [SKILL.md](SKILL.md) - Core skill definition
