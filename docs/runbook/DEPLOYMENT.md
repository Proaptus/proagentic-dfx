---
id: REF-DEPLOY-001
doc_type: reference
title: "Deployment Guide"
status: accepted
last_verified_at: 2025-12-07
owner: "@proaptus"
code_refs:
  - path: ".github/workflows/ci.yml"
  - path: "proagentic-dfx/.vercel/project.json"
test_refs:
  - ci_run: "gh-actions://runs/20009683134"
evidence:
  tests_passed: true
keywords: ["deployment", "vercel", "ci", "cd", "github-actions", "local-dev"]
---

# ProAgentic DFX - Deployment Guide

## Overview

This document covers the CI/CD pipeline and deployment configuration for the ProAgentic DFX platform.

## Architecture

```
proagentic-dfx/
├── .github/workflows/    # GitHub Actions CI/CD
├── proagentic-dfx/       # Main frontend application (Next.js)
├── h2-tank-mock-server/  # H2 Tank module mock server
└── docs/                 # Documentation
```

## CI/CD Pipeline

### Quality Gates

The pipeline enforces 5 quality gates before deployment:

| Gate | Description | Trigger |
|------|-------------|---------|
| 1. Lint & Type Check | ESLint + TypeScript | All pushes |
| 2. Unit Tests | Vitest with 60% coverage threshold | All pushes |
| 3. Build Verification | Next.js production build | All pushes |
| 4. Mock Server Tests | H2 Tank mock server Vitest | All pushes |
| 5. E2E Tests | Playwright chromium | PRs to main only |

### Deployment Environments

| Environment | Branch | URL | Auto-deploy |
|-------------|--------|-----|-------------|
| Preview | feature/*, PR | `*.vercel.app` | Yes (on PR) |
| Production | main | `dfx.proagentic.ai` | Yes (on merge) |

## Vercel Configuration

### Required Secrets

Configure these in GitHub repository secrets:

```
VERCEL_TOKEN       - Vercel deployment token
VERCEL_ORG_ID      - Organization/team ID
VERCEL_PROJECT_ID  - Project ID
```

### Function Limits (Free Plan)

| Resource | Limit |
|----------|-------|
| Execution time | 10 seconds |
| Memory | 1024 MB |
| Payload | 4.5 MB |

### Getting Vercel IDs

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
cd proagentic-dfx
vercel login
vercel link

# Get project info
cat .vercel/project.json
```

## Branch Protection Rules

### Recommended Settings for `main` branch:

1. **Require pull request before merging**
   - Require approvals: 1
   - Dismiss stale reviews when new commits are pushed

2. **Require status checks to pass**
   - Lint & Type Check
   - Unit Tests
   - Build Verification
   - Mock Server Tests

3. **Require branches to be up to date**

4. **Do not allow bypassing settings**

## Local Development

### Setup

```bash
# Clone repository
git clone <repo-url>
cd proagentic-dfx

# Install dependencies
cd proagentic-dfx && npm install
cd ../h2-tank-mock-server && npm install

# Start mock server (terminal 1)
cd h2-tank-mock-server && npm run dev

# Start frontend (terminal 2)
cd proagentic-dfx && npm run dev
```

### Running Tests

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:coverage

# E2E tests (requires mock server running)
npm run test:e2e

# Full validation
npm run validate
```

### Pre-commit Checks

Run before committing:

```bash
npm run validate
```

## Troubleshooting

### Build Failures

1. **TypeScript errors**: Run `npm run typecheck` locally
2. **ESLint errors**: Run `npm run lint:fix`
3. **Test failures**: Run `npm run test` locally

### Deployment Issues

1. **Vercel function timeout**: Check function execution time (max 10s on free plan)
2. **Memory issues**: Optimize WASM loading or upgrade plan
3. **Build size**: Check `.next` directory size (max 250MB uncompressed)

## Release Process

1. Create feature branch from `develop`
2. Implement changes
3. Run `npm run validate`
4. Create PR to `develop`
5. After review, merge to `develop`
6. Create PR from `develop` to `main`
7. E2E tests run automatically
8. After merge to `main`, production deploys automatically

## Monitoring

### Health Check

Production health endpoint: `https://dfx.proagentic.ai/api/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-07T00:00:00.000Z",
  "environment": "production",
  "version": "0.1.0"
}
```

### Vercel Dashboard

Monitor deployments, logs, and analytics at:
https://vercel.com/dashboard
