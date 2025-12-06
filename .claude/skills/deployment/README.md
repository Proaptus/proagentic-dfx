# Deployment Skill

Simple, tested deployment workflow for ProAgentic production releases.

## Quick Start

**Activate from Claude Code**:
```
User: "Deploy ProAgentic to production"
```

**Or run manually**:
```bash
./deploy.sh
```

## The Process

1. **Deploy Backend** → `./deploy-server.sh` handles Docker, Cloud Run, traffic routing
2. **Health Check** → Verify backend responding at `/api/health`
3. **Deploy Staging** → Frontend to `staging--proagentic1.netlify.app`
4. **Smoke UAT** → Test critical flows on staging (via UAT skill)
5. **Deploy Production** → Frontend to `https://proagentic.ai`
6. **Final Smoke UAT** → Verify production works (via UAT skill)

**Time**: ~15-23 minutes

## Prerequisites

### Environment Variables

**Backend** (in `server/.env`):
- `OPENROUTER_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

**Frontend**:
- `NETLIFY_AUTH_TOKEN`

### Tools

- Docker
- gcloud CLI (authenticated to novae-compare)
- Netlify CLI (authenticated)
- Node.js & npm

### Pre-Flight

- Git working directory clean or committed
- On `main` branch
- Tests pass: `npm test`
- Build works: `npm run build`

## Critical Rules

### ✅ Always Do

- Use `./deploy-server.sh` for backend (never manual docker/gcloud commands)
- Run health check after backend deployment
- Run smoke UAT on staging before production
- Run final smoke UAT on production

### ❌ Never Do

- Skip UAT testing
- Deploy without health check
- Manually run docker build/push
- Deploy with uncommitted changes

## UAT Decision Tree

**Critical bugs** (STOP deployment):
- Authentication broken
- Data loss/corruption
- Application crashes
- Core features don't work

**Non-critical issues** (CONTINUE deployment):
- Minor UI bugs
- Cosmetic issues
- Edge case failures
- Performance warnings

## Troubleshooting

### Backend deployment fails

```bash
# Check environment variables
cat server/.env

# Check Docker
docker ps

# Re-authenticate gcloud
gcloud auth login

# Check server logs
gcloud run services logs read proagentic-server --region europe-west2 --limit 50
```

### Health check fails

```bash
# Check traffic routing
gcloud run services describe proagentic-server --region=europe-west2 | grep traffic

# Check environment variables in Cloud Run
gcloud run services describe proagentic-server --region=europe-west2 | grep env -A 20
```

### Netlify deployment fails

```bash
# Re-authenticate
netlify login

# Test build locally
npm run build

# Check Netlify status
netlify status
```

## Rollback

### Backend

```bash
# List revisions
gcloud run revisions list --service=proagentic-server --region=europe-west2

# Route to previous
gcloud run services update-traffic proagentic-server \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=europe-west2
```

### Frontend

Netlify Dashboard → proagentic1 → Deployments → Publish previous version

## Files

- `SKILL.md` - Full skill documentation with step-by-step instructions
- `deploy.sh` - Deployment script (can be run manually)
- `archive/` - Old complex deployment infrastructure (archived 2025-11-07)
- `templates/` - Configuration templates

## Why Simple?

**Old approach** (archived):
- 5 deployment modes
- 20+ module scripts
- Complex orchestrator
- 500+ lines of code

**New approach** (current):
- 1 linear workflow
- 1 deployment script
- ~100 lines of code
- Matches actual usage

Simple is better. We only ever deploy the full stack, not individual pieces.

## Support

See `SKILL.md` for complete documentation including:
- Detailed step-by-step execution
- Expected outputs at each step
- Complete troubleshooting guide
- Time estimates per phase
- Success criteria

Old complex documentation archived in `archive/` if needed.
