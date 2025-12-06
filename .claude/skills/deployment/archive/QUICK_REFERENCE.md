# Deployment Quick Reference

One-page cheat sheet for ProAgentic deployments.

## Commands

```bash
# Full deployment (backend → staging → UAT → production)
deployment --mode full --project proagentic

# Smoke deployment (backend → staging → smoke tests → production)
deployment --mode smoke --project proagentic

# Backend only
deployment --mode backend-only --project proagentic

# Staging only
deployment --mode staging-only --project proagentic

# Production only
deployment --mode production-only --project proagentic

# Skip UAT testing (not recommended)
deployment --mode full --project proagentic --skip-uat
```

## Pre-Deployment Checklist

- [ ] On `main` branch: `git branch`
- [ ] No uncommitted changes: `git status`
- [ ] Latest code pulled: `git pull origin main`
- [ ] Environment variables set:
  ```bash
  echo $OPENROUTER_API_KEY  # Should output key
  echo $SUPABASE_URL        # Should output URL
  echo $NETLIFY_AUTH_TOKEN  # Should output token
  ```
- [ ] Google Cloud authenticated: `gcloud auth list`
- [ ] Google Cloud project correct: `gcloud config get-value project`
- [ ] Netlify authenticated: `netlify status`
- [ ] Tests pass locally: `npm run test`
- [ ] Build works: `npm run build`

## Deployment Timeline

| Mode | Time | Stages |
|------|------|--------|
| full | 25-35 min | Pre-checks → Backend → Staging → Full UAT → Production |
| smoke | 15-20 min | Pre-checks → Backend → Staging → Smoke UAT → Production |
| backend-only | 5-10 min | Pre-checks → Backend → Health check |
| staging-only | 3-5 min | Build → Deploy to staging → Validate |
| production-only | 2-3 min | Build → Deploy to proagentic.ai → Validate |

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Git working directory not clean | `git add . && git commit -m "..."` |
| CORS validation failed | Check staging domain is `staging--proagentic1.netlify.app` |
| Backend health check failed | Check Cloud Run logs: `gcloud run services describe proagentic-server --region=europe-west2` |
| UAT tests failed | Check `.deployment/logs/latest.json` for details |
| Authentication failed | Run `gcloud auth login` and `netlify login` |

## Log Files

```bash
# View latest deployment log
cat .deployment/logs/$(ls -t .deployment/logs | head -1)

# Check specific phase
cat .deployment/logs/latest.json | jq '.phases[] | select(.phase=="backend-deploy")'

# List all deployments
ls -lh .deployment/logs/

# Parse errors
cat .deployment/logs/latest.json | jq '.errors'
```

## Cloud Run Commands

```bash
# List revisions
gcloud run revisions list --service=proagentic-server --region=europe-west2

# Check recent deploys
gcloud run services describe proagentic-server --region=europe-west2

# View logs
gcloud run services logs read proagentic-server --region=europe-west2 --limit=50

# Rollback to previous revision
gcloud run services update-traffic proagentic-server \
  --to-revisions=REVISION_NAME=100 --region=europe-west2
```

## Netlify Commands

```bash
# Check site status
netlify status

# View recent deploys
netlify deploy:list

# Manual staging deploy
netlify deploy --build --context=staging --alias=staging

# Manual production deploy
netlify deploy --prod

# View deploy logs
netlify logs:deploy
```

## Environment Variables

```bash
# Set temporarily (this session only)
export OPENROUTER_API_KEY="sk-or-v1-..."
export SUPABASE_URL="https://..."
export SUPABASE_SERVICE_KEY="eyJ..."
export NETLIFY_AUTH_TOKEN="netlify_xxx"

# Set permanently (add to ~/.bashrc or ~/.zshrc)
echo 'export OPENROUTER_API_KEY="sk-or-v1-..."' >> ~/.bashrc
source ~/.bashrc
```

## Validation Domains

| Environment | Domain |
|-------------|--------|
| Staging | https://staging--proagentic1.netlify.app |
| Production | https://proagentic.ai |

## Configuration File Location

```bash
# Main config
deployment.config.yml

# Example template
.claude/skills/deployment/templates/deployment.config.example.yml
```

## Deployment Log Format

```json
{
  "deployment_id": "20251019-143022",
  "status": "success",
  "phases": [
    { "phase": "pre-deploy-checks", "status": "success", "duration_seconds": 12 },
    { "phase": "backend-deploy", "status": "success", "duration_seconds": 180 },
    { "phase": "staging-deploy", "status": "success", "duration_seconds": 90 },
    { "phase": "uat-testing", "status": "success", "duration_seconds": 300 },
    { "phase": "production-deploy", "status": "success", "duration_seconds": 60 }
  ],
  "errors": []
}
```

## Status Codes

- ✅ `success` - Deployment completed successfully
- ❌ `failed` - Deployment failed, check errors array
- ⚠️ `partial` - Some phases succeeded, some failed
- ⏭️ `skipped` - Phase skipped (e.g., UAT with --skip-uat)

## Key Files Reference

| File | Purpose |
|------|---------|
| `SKILL.md` | Core skill definition |
| `README.md` | Full documentation |
| `QUICK_REFERENCE.md` | This file |
| `USAGE_EXAMPLES.md` | Practical scenarios |
| `deployment.config.yml` | Project configuration |
| `.deployment/logs/` | Deployment logs |

## See Also

- [README.md](README.md) - Full documentation
- [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - Real scenarios
- [UAT Automation Skill](../uat-automation/SKILL.md) - Testing integration
