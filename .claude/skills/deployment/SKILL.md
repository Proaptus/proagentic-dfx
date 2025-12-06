---
name: Deployment
description: Deploys ProAgentic using the tested deployment workflow - backend via ./deploy-server.sh, then staging frontend, smoke UAT, and production. Use when deploying ProAgentic to production.
allowed-tools: Bash, Read, Skill
---

# Deployment Skill

## What This Does

Deploys ProAgentic to production using the standard workflow:

1. **Deploy Backend** → Runs `./deploy-server.sh` (handles Docker, Cloud Run, traffic routing)
2. **Health Check** → Verifies backend is responding
3. **Deploy Staging** → Deploys frontend to staging--proagentic1.netlify.app
4. **Smoke UAT** → Runs smoke tests on staging
5. **Deploy Production** → Deploys frontend to proagentic.ai
6. **Final Smoke UAT** → Verifies production deployment

## When to Use

- User says "deploy to production"
- User says "deploy ProAgentic"
- After merging a release PR
- For production releases

## When NOT to Use

- For local testing (use `npm run dev`)
- For backend-only changes without frontend updates (just run `./deploy-server.sh` directly)
- For experimental features (deploy to staging only)

## Execution Steps

### Step 1: Deploy Backend

Run the tested backend deployment script:

```bash
./deploy-server.sh
```

This script handles:
- Loading environment variables from server/.env
- Building Docker image
- Pushing to Google Container Registry
- Deploying to Cloud Run with all environment variables
- **Routing 100% traffic to new revision** (critical!)
- Health check verification

**Expected output**: "✅ Deployment complete!"

**If it fails**: Check the error message from the script and stop deployment.

### Step 2: Health Check

Verify backend is responding:

```bash
curl -s https://proagentic-server-705044459306.europe-west2.run.app/api/health | python3 -m json.tool
```

**Expected output**: `{"status": "ok", "timestamp": "...", "version": "..."}`

**If it fails**: Backend deployment didn't work. Do NOT proceed.

### Step 3: Deploy to Staging

Deploy frontend to Netlify staging:

```bash
npm run build
netlify deploy --alias=staging --dir=dist
```

**Expected output**: Netlify deploy URL shown

**If it fails**: Check Netlify authentication and build errors.

### Step 4: Run Smoke UAT on Staging

Activate UAT skill with smoke test scope:

```bash
Skill({ skill: "uat-automation" })
# When UAT skill asks, specify: "Run smoke tests on staging--proagentic1.netlify.app"
```

**Expected outcome**: Smoke tests complete (UAT skill generates report)

**If tests fail**:
- Review UAT report for critical bugs (auth failures, data loss, crashes)
- **Stop deployment** if critical bugs found
- **Continue deployment** if only non-critical issues (minor UI bugs, warnings)
- Non-critical issues should be tracked but don't block release

### Step 5: Deploy to Production

Deploy frontend to production:

```bash
npm run build
netlify deploy --prod --dir=dist
```

**Expected output**: Production URL (https://proagentic.ai) deployed

**If it fails**: Check Netlify authentication and build errors.

### Step 6: Final Smoke UAT on Production

Activate UAT skill for production verification:

```bash
Skill({ skill: "uat-automation" })
# When UAT skill asks, specify: "Run smoke tests on https://proagentic.ai"
```

**Expected outcome**: Smoke tests complete (UAT skill generates report)

**If critical bugs found**:
- Production has critical issues - immediate attention required
- Review UAT report and determine if rollback needed
- Critical bugs: auth failures, data loss, crashes, core features broken

**If non-critical issues found**:
- Track issues for next release
- Deployment is successful but improvements needed

## Critical Requirements

### Environment Variables Required

These must be set before deployment:

- `OPENROUTER_API_KEY` (in server/.env)
- `SUPABASE_URL` (in server/.env)
- `SUPABASE_SERVICE_KEY` (in server/.env)
- `NETLIFY_AUTH_TOKEN` (for Netlify CLI)

### Pre-Deployment Checks

Before starting, verify:

1. **Git status**: Working directory should be clean or committed
2. **Branch**: Should be on `main` branch
3. **Tests passing**: Run `npm test` to verify
4. **Environment files**: Ensure server/.env exists with required variables

### Never Do This

- ❌ NEVER manually run docker/gcloud commands (use ./deploy-server.sh)
- ❌ NEVER skip UAT testing before production
- ❌ NEVER deploy without health check verification
- ❌ NEVER commit with dirty working directory

## Rollback Procedure

If production deployment fails or UAT tests fail:

**Backend Rollback**:
```bash
gcloud run revisions list --service=proagentic-server --region=europe-west2
gcloud run services update-traffic proagentic-server \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=europe-west2
```

**Frontend Rollback**:
- Go to Netlify dashboard → proagentic1 site → Deployments
- Click "Publish deploy" on previous working version

## Success Criteria

Deployment is successful when:

✅ Backend health check returns `{"status": "ok"}`
✅ Staging UAT smoke tests pass
✅ Production is deployed without errors
✅ Production UAT smoke tests pass
✅ User can access https://proagentic.ai

## Troubleshooting

**"./deploy-server.sh failed"**
- Check server/.env has all required variables
- Check Docker is running
- Check gcloud authentication: `gcloud auth list`
- Check recent changes didn't break server code

**"Netlify deploy failed"**
- Check authentication: `netlify status`
- Check build succeeds locally: `npm run build`
- Check Netlify site configuration

**"UAT tests failed"**
- Review UAT report for specific failures
- Fix identified issues
- Restart deployment from appropriate step
- Do NOT proceed to production with failing tests

**"Health check failed"**
- Backend didn't deploy correctly
- Check Cloud Run logs: `gcloud run services logs read proagentic-server --region europe-west2 --limit 50`
- Verify environment variables are set in Cloud Run
- Check OpenRouter API key is valid

## Time Estimate

Full deployment typically takes:

- Backend deployment: 5-7 minutes
- Staging deployment: 2-3 minutes
- Smoke UAT: 3-5 minutes
- Production deployment: 2-3 minutes
- Final UAT: 3-5 minutes

**Total: ~15-23 minutes**
