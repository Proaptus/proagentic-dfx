---
id: REF-CICD-001
doc_type: reference
title: "CI/CD Pipeline Reference"
status: accepted
last_verified_at: 2025-12-07
owner: "@proaptus"
code_refs:
  - path: ".github/workflows/ci.yml"
test_refs:
  - ci_run: "gh-actions://runs/20009683134"
evidence:
  tests_passed: true
keywords: ["ci", "cd", "github-actions", "vercel", "deployment"]
---

# ProAgentic DFX - CI/CD Pipeline Reference

## Overview

The CI/CD pipeline is built with GitHub Actions and Vercel, providing automated quality gates and deployments for the ProAgentic DFX platform.

## Triggers

| Event | Branches | Action |
|-------|----------|--------|
| **Push** | `main`, `staging`, `feature/**` | Run all quality gates + deploy |
| **Pull Request** | `main`, `staging` | Run quality gates + preview deploy |
| **Manual** | Any | `workflow_dispatch` trigger |

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CI/CD Pipeline Flow                          │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │  Security Audit  │ (parallel, independent)
                    └──────────────────┘

┌──────────────────┐
│ Lint & TypeCheck │ ◄── Gate 1: Code Quality
└────────┬─────────┘
         │
         ├───────────────┬───────────────┐
         ▼               ▼               ▼
┌────────────────┐ ┌──────────┐ ┌─────────────────┐
│  Unit Tests    │ │  Build   │ │ Mock Server     │
│  + Coverage    │ │  Verify  │ │ Tests           │
└────────┬───────┘ └────┬─────┘ └────────┬────────┘
         │              │                │
         └──────────────┼────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
┌────────────────┐ ┌──────────┐ ┌─────────────────┐
│ Deploy Preview │ │ Deploy   │ │ Deploy          │
│ (PR only)      │ │ Staging  │ │ Production      │
└────────────────┘ └──────────┘ └─────────────────┘
```

## Quality Gates

### Gate 1: Lint & Type Check
- **ESLint**: Code quality and style enforcement
- **TypeScript**: Static type checking with `tsc --noEmit`
- **Blocks**: All downstream jobs if fails

### Gate 2: Unit Tests with Coverage
- **Framework**: Vitest + React Testing Library
- **Coverage**: Reports uploaded as artifacts (7-day retention)
- **Requires**: Gate 1 to pass

### Gate 3: Build Verification
- **Next.js Build**: Ensures production build succeeds
- **Artifacts**: `.next/` folder uploaded (1-day retention)
- **Requires**: Gate 1 to pass

### Gate 4: Mock Server Tests
- **Target**: `h2-tank-mock-server/` API tests
- **Validates**: Backend API contract compliance
- **Requires**: Gate 1 to pass

### Gate 5: E2E Tests (PRs to main only)
- **Framework**: Playwright with Chromium
- **Condition**: Only runs on PRs targeting `main`
- **Reports**: Playwright HTML reports uploaded (7-day retention)
- **Requires**: Gates 3 & 4 to pass

### Security Audit
- **Runs**: In parallel (non-blocking)
- **Checks**: `npm audit --audit-level=high` on both packages
- **Status**: `continue-on-error: true` (advisory only)

## Deployment Environments

| Environment | Trigger | URL | Requirements |
|-------------|---------|-----|--------------|
| **Preview** | PR created | Dynamic (commented on PR) | Unit tests + Build |
| **Staging** | Push to `staging` | `proagentic-dfx-staging.vercel.app` | All quality gates |
| **Production** | Push to `main` | `dfx.proagentic.ai` / `proagentic-dfx.vercel.app` | All quality gates |

## Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | API token for Vercel deployments |
| `VERCEL_ORG_ID` | Team/Org ID: `team_ryncQsBxiri8n6geVwNeUVag` |
| `VERCEL_PROJECT_ID` | Project ID: `prj_hd4DnCKVIegyFxM1LLmDhecVMWru` |

## Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

- Cancels in-progress runs when new commits are pushed to the same branch
- Prevents resource waste and deployment conflicts

## Typical Run Times

| Job | Duration |
|-----|----------|
| Security Audit | ~10s |
| Mock Server Tests | ~17s |
| Unit Tests | ~28s |
| Lint & Type Check | ~34s |
| Build Verification | ~35s |
| Deploy Production | ~1m 20s |
| **Total** | **~2 minutes** |

## Workflow File

**Location**: `.github/workflows/ci.yml`

## Troubleshooting

### Common Issues

1. **Root Directory Error**: If Vercel reports "Root Directory does not exist", ensure Vercel project settings have Root Directory cleared (the CI workflow handles directory context).

2. **Token Expired**: Create a new token at https://vercel.com/account/settings/tokens with "Full Account" scope.

3. **Tests Failing**: Check the coverage report artifact for details.

## Related Documentation

- [Deployment Guide](../DEPLOYMENT.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
