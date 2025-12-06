# Deployment Skill - Complete Documentation

Complete guide for using the ProAgentic Deployment Skill for reliable, consistent deployments with error detection and validation.

## Quick Start

```bash
# Set up deployment config once
cp templates/deployment.config.example.yml deployment.config.yml
# Edit deployment.config.yml with your project details

# Full deployment (backend → staging → UAT → production)
deployment --mode full --project proagentic

# Smoke test deployment (faster UAT)
deployment --mode smoke --project proagentic

# Backend only (for hotfixes)
deployment --mode backend-only --project proagentic
```

## Prerequisites

- Node.js 20+, npm 10+
- Docker & Docker Compose
- Google Cloud SDK with active authentication
- Netlify CLI installed and authenticated
- Git with clean working directory on main branch
- Environment variables set:
  - `OPENROUTER_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `NETLIFY_AUTH_TOKEN` (for Netlify deploys)

## Setup (One-Time)

1. **Create deployment config**:
   ```bash
   cp .claude/skills/deployment/templates/deployment.config.example.yml deployment.config.yml
   ```

2. **Edit `deployment.config.yml`** with your project details:
   - `gcloud_project`: Your Google Cloud project ID
   - `service_name`: Cloud Run service name
   - `region`: Cloud Run region
   - `netlify_site`: Netlify site name
   - `domain`: Production domain

3. **Verify credentials**:
   ```bash
   # Google Cloud
   gcloud auth list
   gcloud config get-value project
   
   # Netlify
   netlify status
   
   # Environment variables
   echo $OPENROUTER_API_KEY
   echo $SUPABASE_URL
   ```

4. **Test the skill** with backend-only mode:
   ```bash
   deployment --mode backend-only --project proagentic
   ```

## Deployment Modes Explained

### Full Deployment
**Command**: `deployment --mode full --project proagentic`

**Flow**:
1. Pre-deployment checks (5 min)
2. Backend to Cloud Run (3-5 min)
3. Frontend to staging (2-3 min)
4. Run full UAT tests (10-15 min)
5. Frontend to production (2-3 min)

**Use When**: Deploying major features or bug fixes ready for production

**Total Time**: 25-35 minutes

### Smoke Deployment
**Command**: `deployment --mode smoke --project proagentic`

**Flow**:
1. Pre-deployment checks
2. Backend to Cloud Run
3. Frontend to staging
4. Run smoke tests only (5-7 min) - faster UAT subset
5. Frontend to production

**Use When**: Quick fixes or minor updates that need validation

**Total Time**: 15-20 minutes

### Backend Only
**Command**: `deployment --mode backend-only --project proagentic`

**Flow**:
1. Pre-deployment checks
2. Backend to Cloud Run with health check
3. Verify traffic routing (100% to new revision)

**Use When**: 
- Hotfixing backend issues
- API changes without frontend changes
- Testing backend changes in staging first

**Total Time**: 5-10 minutes

### Staging Only
**Command**: `deployment --mode staging-only --project proagentic`

**Flow**:
1. Build frontend for staging
2. Deploy to staging--proagentic1.netlify.app alias
3. Validate CORS/CSP headers
4. Health check staging frontend

**Use When**: 
- Testing frontend changes before UAT
- Debugging staging-specific issues
- Quick frontend iteration

**Total Time**: 3-5 minutes

### Production Only
**Command**: `deployment --mode production-only --project proagentic`

**Flow**:
1. Build frontend for production
2. Deploy to proagentic.ai
3. Validate CORS/CSP headers for production
4. Health check production frontend

**Use When**: 
- Manual production deploy after UAT passes externally
- Deploying frontend without backend changes
- Re-deploying after fixing issues

**Total Time**: 2-3 minutes

## Understanding Deployment Logs

All deployments generate JSON logs in `.deployment/logs/<deployment-id>.json`:

```bash
# View latest deployment
cat .deployment/logs/$(ls -t .deployment/logs | head -1)

# Parse specific phase
cat .deployment/logs/latest.json | jq '.phases[] | select(.phase=="backend-deploy")'

# Check for errors
cat .deployment/logs/latest.json | jq '.errors'
```

**Log Fields**:
- `deployment_id`: Unique ID (timestamp-based)
- `project`: Project name
- `mode`: Deployment mode used
- `status`: success | failed | partial
- `started_at` / `completed_at`: ISO timestamps
- `phases`: Array of phase results with status and duration
- `errors`: Array of any errors encountered

## Configuration Reference

### deployment.config.yml

```yaml
# Project identifier
project: proagentic

# Backend (Cloud Run) configuration
backend:
  gcloud_project: novae-compare        # Google Cloud project ID
  service_name: proagentic-server      # Cloud Run service name
  region: europe-west2                 # Cloud Run region
  docker_registry: gcr.io              # Registry prefix

# Staging (Netlify) configuration
staging:
  netlify_site: proagentic1            # Netlify site name (from settings)
  netlify_alias: staging--proagentic1  # Deploy preview alias
  cors_domain: https://staging--proagentic1.netlify.app  # CORS validation domain

# Production (Netlify) configuration
production:
  domain: https://proagentic.ai        # Production domain
  cors_domain: https://proagentic.ai   # CORS validation domain

# UAT (Testing) configuration
uat:
  enabled: true                        # Enable UAT testing
  smoke_scope:                         # Tests for --mode smoke
    - auth
    - dashboard
  full_scope:                          # Tests for --mode full
    - auth
    - dashboard
    - workflow
    - export
```

**Important**: Do NOT put secrets in this file. Use environment variables instead.

## Environment Variables Required

Set these before deploying:

```bash
# OpenRouter API Key
export OPENROUTER_API_KEY="sk-or-v1-..."

# Supabase
export SUPABASE_URL="https://qyomydbmtndkprjmsdin.supabase.co"
export SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIs..."

# Netlify (for frontend deploys)
export NETLIFY_AUTH_TOKEN="xxx_netlify_token_xxx"

# Google Cloud (usually auto-authenticated via gcloud CLI)
gcloud auth login
```

## Common Workflows

### 1. Deploy New Feature to Production

```bash
# 1. Make sure you're on main branch
git checkout main

# 2. Commit your changes
git add .
git commit -m "feat: add new dashboard feature"

# 3. Full deployment (includes testing)
deployment --mode full --project proagentic

# 4. Check deployment log
cat .deployment/logs/latest.json | jq '.'
```

### 2. Quick Fix with Smoke Tests

```bash
# For time-sensitive fixes, use smoke tests (faster)
git checkout main
git add .
git commit -m "fix: resolve authentication issue"

deployment --mode smoke --project proagentic
```

### 3. Backend Hotfix Only

```bash
# If only backend code changed
git checkout main
git add .
git commit -m "hotfix: API response timeout"

deployment --mode backend-only --project proagentic
```

### 4. Staging Pre-Flight Check

```bash
# Before full deployment, check staging first
deployment --mode staging-only --project proagentic

# Test manually on https://staging--proagentic1.netlify.app
# If good, continue with full deployment
```

### 5. Backend Rollback

```bash
# List recent revisions
gcloud run revisions list --service=proagentic-server --region=europe-west2

# Route traffic to previous revision
gcloud run services update-traffic proagentic-server \
  --to-revisions=proagentic-server-abc123=100 \
  --region=europe-west2
```

## Troubleshooting

### Error: "Git working directory not clean"
**Cause**: Uncommitted changes prevent deployment

**Solution**:
```bash
# Commit your changes
git add .
git commit -m "description"

# Or stash them temporarily
git stash
```

### Error: "CORS validation failed for staging"
**Cause**: Staging domain mismatch or missing CORS headers

**Solution**:
1. Verify staging URL: `echo $STAGING_URL` → must be `https://staging--proagentic1.netlify.app`
2. Check `netlify.toml` CORS configuration
3. Check backend `server/index.js` line 85-118 includes staging domain
4. Verify deployment to correct alias: `netlify deploy --alias staging`

### Error: "Backend health check failed"
**Cause**: Backend not running or not responding

**Solution**:
```bash
# Check Cloud Run service
gcloud run services list --region=europe-west2

# Check recent logs
gcloud run services describe proagentic-server --region=europe-west2

# Check environment variables in Cloud Run are correct
# Verify OPENROUTER_API_KEY, SUPABASE_* are set
```

### Error: "UAT tests failed"
**Cause**: One or more tests didn't pass

**Solution**:
1. Check UAT output in deployment log: `cat .deployment/logs/latest.json | jq '.phases[] | select(.phase=="uat-testing")'`
2. Review test failures in detail
3. Fix issues locally and test with `npm run test`
4. Retry deployment when ready

### Error: "Netlify deploy timed out"
**Cause**: Build or deployment took too long

**Solution**:
```bash
# Try manual deploy to see actual error
netlify deploy --build --context=staging --site=proagentic1

# Check Netlify build logs
netlify logs:deploy

# For production
netlify deploy --prod --open
```

### Error: "gcloud authentication failed"
**Cause**: Not authenticated with Google Cloud

**Solution**:
```bash
# Authenticate
gcloud auth login

# Set project
gcloud config set project novae-compare

# Verify
gcloud auth list
gcloud config get-value project
```

### Error: "NETLIFY_AUTH_TOKEN not set"
**Cause**: Netlify authentication token missing

**Solution**:
```bash
# Get your token from Netlify
# https://app.netlify.com/user/applications#personal-access-tokens

# Set it
export NETLIFY_AUTH_TOKEN="your-token-here"

# Verify
netlify status
```

## Advanced Configuration

### Custom Pre-Deploy Checks

Add custom validation by modifying `.claude/skills/deployment/scripts/safety/pre-deploy-checks.sh`:

```bash
# Example: Check specific file exists
if [ ! -f "server/.env" ]; then
  error "server/.env not found"
fi
```

### Conditional UAT Scope

Modify UAT scope in `deployment.config.yml` based on changes:

```yaml
# For frontend-only changes
smoke_scope:
  - auth

# For full feature
full_scope:
  - auth
  - dashboard
  - workflow
  - export
```

### Multiple Project Support

Create separate configs:

```bash
# Project 1
deployment.config.yml

# Project 2
deployment.config.project2.yml

# Use with --config flag
deployment --mode full --project proagentic --config deployment.config.project2.yml
```

## Performance Optimization

### Parallel Builds
The skill uses `docker build` which is single-threaded. To speed up:

```bash
# Build images in parallel manually before deployment
docker build -f Dockerfile.backend -t backend:latest . &
docker build -f Dockerfile.frontend -t frontend:latest . &
wait
```

### Skip UAT for Development
For rapid iteration in staging:

```bash
deployment --mode staging-only --project proagentic
# Skip full pipeline, just deploy to staging
```

### Local Testing Before Deploy
Always test locally first:

```bash
npm run dev          # Test frontend locally
npm run test         # Run test suite
npm run lint         # Check code quality
npm run build        # Verify production build works
```

## Security Best Practices

1. **Never commit secrets**: Keep all API keys in environment variables
2. **Rotate credentials regularly**: Update OPENROUTER_API_KEY, SUPABASE_SERVICE_KEY
3. **Use git branches**: Always develop on feature branches, deploy from main
4. **Review before deploying**: Check git diff before running deployment
5. **Monitor after deploy**: Check Cloud Run logs and Netlify analytics post-deployment
6. **Limit access**: Only deploy from authenticated machines
7. **Audit deployments**: Check `.deployment/logs/` for deployment history

## See Also

- [SKILL.md](SKILL.md) - Core skill definition
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - One-page cheat sheet
- [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - Practical scenarios
- [UAT Automation Skill](../uat-automation/SKILL.md) - Testing integration
