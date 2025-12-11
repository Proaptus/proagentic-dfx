---
name: Deployment
description: Deploys ProAgentic DfX (H2 Tank Designer) using the full CI/CD pipeline. Runs all quality gates (lint, typecheck, tests, coverage, E2E) then deploys to Vercel. Use when deploying to staging or production, or when running the full CI pipeline locally.
allowed-tools: Bash, Read, Glob, Grep
---

# Deployment Skill - ProAgentic DfX

## What This Does

Deploys the H2 Tank Designer frontend to Vercel using the full CI/CD pipeline:

1. **File Size Check** - Verify all files are within AI-optimized limits
2. **Lint & Type Check** - ESLint + TypeScript validation
3. **Unit Tests** - Run Vitest with coverage reporting
4. **Build Verification** - Next.js production build
5. **Mock Server Tests** - Verify mock API responses
6. **E2E Tests** - Playwright end-to-end tests
7. **Deploy** - Push to Vercel (staging or production)

## When to Use

- User says "deploy to production" or "deploy to staging"
- User says "run CI" or "run the pipeline"
- After completing a feature and wanting to deploy
- Before merging a PR (to validate all gates pass)

## When NOT to Use

- For local development (use `npm run dev`)
- For quick lint checks (use `npm run lint`)
- For running single tests (use `npm test`)

## Execution Steps

### Pre-Flight Checks

Before starting, verify:

```bash
# 1. Check git status - should be clean
cd proagentic-dfx && git status

# 2. Verify on correct branch
git branch --show-current
# main → production deploy
# staging → staging deploy
# feature/* → preview deploy (via PR)

# 3. Check working directory
pwd
# Should be in proagentic-dfx/
```

### Step 1: File Size Check

```bash
cd proagentic-dfx
node ../scripts/check-file-sizes.mjs all
```

**Expected**: No files over limits (500 lines for components, 800 for types/tests)

**If fails**: Split large files before proceeding

### Step 2: Lint & Type Check

```bash
npm run lint
npx tsc --noEmit
```

**Expected**: No errors

**If fails**: Fix lint/type errors before proceeding

### Step 3: Unit Tests with Coverage

```bash
npm run test:coverage
```

**Expected**:
- All tests pass
- Coverage meets threshold (≥80% for critical paths)

**If fails**: Fix failing tests or increase coverage

### Step 4: Build Verification

```bash
npm run build
```

**Expected**: Build completes without errors

**If fails**: Check for build-time errors (missing dependencies, TypeScript issues)

### Step 5: Mock Server Tests

```bash
cd ../h2-tank-mock-server
npm test
```

**Expected**: All mock server tests pass

**If fails**: Mock server API contracts may be broken

### Step 6: E2E Tests (Optional for local, required for PR)

```bash
cd ../proagentic-dfx
npx playwright install --with-deps chromium
npm run test:e2e
```

**Expected**: All Playwright tests pass

**If fails**: Review playwright-report for failures

### Step 7: Deploy to Vercel

**For Staging** (branch: `staging`):
```bash
git push origin staging
```
GitHub Actions will auto-deploy to: `https://proagentic-dfx-staging.vercel.app`

**For Production** (branch: `main`):
```bash
git push origin main
```
GitHub Actions will auto-deploy to: `https://dfx.proagentic.ai`

**For Preview** (any PR):
- Open PR against `main` or `staging`
- GitHub Actions deploys preview automatically
- Preview URL posted in PR comments

### Manual Vercel Deploy (if needed)

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy preview
cd proagentic-dfx
vercel

# Deploy production (requires confirmation)
vercel --prod
```

## Environment Configuration

### Required Secrets (GitHub Actions)

These must be configured in GitHub repository secrets:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

### Local Environment

For local development and testing:

```bash
# No secrets required - uses mock server
cd proagentic-dfx
npm run dev
```

## Quality Gates Summary

| Gate | Command | Required |
|------|---------|----------|
| File Sizes | `node scripts/check-file-sizes.mjs all` | Always |
| Lint | `npm run lint` | Always |
| Types | `npx tsc --noEmit` | Always |
| Unit Tests | `npm test` | Always |
| Coverage | `npm run test:coverage` | PR to main |
| Build | `npm run build` | Always |
| Mock Server | `cd h2-tank-mock-server && npm test` | Always |
| E2E | `npm run test:e2e` | PR to main |

## Deployment Targets

| Branch | Target | URL |
|--------|--------|-----|
| `main` | Production | https://dfx.proagentic.ai |
| `staging` | Staging | https://proagentic-dfx-staging.vercel.app |
| PR | Preview | Auto-generated Vercel URL |

## Rollback Procedure

### Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select the proagentic-dfx project
3. Go to Deployments
4. Find the last working deployment
5. Click "..." → "Promote to Production"

### Via CLI

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

## Success Criteria

Deployment is successful when:

- All quality gates pass (lint, types, tests, build)
- Vercel deployment completes without errors
- Target URL is accessible and functional
- No critical console errors in browser

## Troubleshooting

### "File size check failed"

```bash
# Find large files
node scripts/check-file-sizes.mjs all

# Split components following patterns in CLAUDE.md
# Target: <350 lines per file
```

### "Lint/Type errors"

```bash
# Auto-fix what's possible
npm run lint:fix

# Check remaining issues
npm run lint
npx tsc --noEmit
```

### "Tests failing"

```bash
# Run tests in watch mode for debugging
npm run test:watch

# Run specific test file
npm test -- path/to/test.test.ts
```

### "Build failed"

```bash
# Check for Next.js specific issues
npm run build 2>&1 | head -100

# Common issues:
# - Missing imports
# - Server/client component mismatches
# - Environment variable issues
```

### "E2E tests failing"

```bash
# Run with UI for debugging
npm run test:e2e:ui

# Check Playwright report
open playwright-report/index.html
```

### "Vercel deployment failed"

```bash
# Check Vercel CLI status
vercel whoami

# Re-link project if needed
vercel link

# Check deployment logs
vercel logs <deployment-url>
```

## Pipeline Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Push to Branch                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Gate 0: File Size Check                                    │
│  node scripts/check-file-sizes.mjs all                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Gate 1: Lint & Type Check                                  │
│  npm run lint && npx tsc --noEmit                          │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  Gate 2: Unit Tests     │   │  Gate 3: Build          │
│  npm run test:coverage  │   │  npm run build          │
└─────────────────────────┘   └─────────────────────────┘
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Gate 4: Mock Server Tests                                  │
│  cd h2-tank-mock-server && npm test                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Gate 5: E2E Tests (PR to main only)                       │
│  npm run test:e2e                                          │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Preview      │ │  Staging      │ │  Production   │
│  (PR)         │ │  (staging)    │ │  (main)       │
└───────────────┘ └───────────────┘ └───────────────┘
```

## Time Estimates

| Phase | Duration |
|-------|----------|
| File sizes + Lint + Types | ~1 min |
| Unit tests + Coverage | ~2-3 min |
| Build | ~1-2 min |
| Mock server tests | ~30 sec |
| E2E tests | ~3-5 min |
| Vercel deployment | ~1-2 min |
| **Total** | **~8-14 min** |
