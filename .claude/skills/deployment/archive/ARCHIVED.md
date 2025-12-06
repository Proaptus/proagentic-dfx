# Archived Deployment Infrastructure

**Date Archived**: 2025-11-07

## Why Archived

The complex multi-mode deployment orchestrator was replaced with a simple linear workflow that matches the actual deployment process:

1. Deploy backend using `./deploy-server.sh`
2. Health check
3. Deploy to Netlify staging
4. Smoke UAT on staging
5. Deploy to production
6. Smoke UAT on production

The orchestrator supported 5 modes (full, smoke, backend-only, staging-only, production-only) but actual usage only ever needed the simple linear flow.

## What Was Archived

- `deploy-orchestrator.sh` - Complex multi-mode orchestrator with command-line argument parsing
- `modules/` - Individual deployment phase scripts (backend, staging, production, UAT, validation)
- `logging/` - JSON logging infrastructure for deployment events
- `helpers/` - Utility functions for config parsing and output formatting
- `safety/` - Pre-deployment checks (git status, env vars, credentials)

## Replaced With

- Simple `deploy.sh` script that follows the 6-step linear workflow
- Simplified `SKILL.md` that clearly documents each step
- Direct command execution instead of modular script orchestration

## If You Need This Again

The archived scripts are still functional. To restore:

```bash
cd /home/chine/projects/proagentic-clean/.claude/skills/deployment
mv archive/deploy-orchestrator.sh scripts/
mv archive/modules scripts/
mv archive/logging scripts/
mv archive/helpers scripts/
mv archive/safety scripts/
```

Then update SKILL.md to reference the orchestrator again.

## Key Lessons

1. **Simple is better**: The orchestrator was 290+ lines with 6 module scripts. The replacement is ~100 lines, single file.
2. **Match reality**: The orchestrator supported modes that were never used. The replacement matches actual workflow.
3. **Clear is better than clever**: Linear script with explicit steps beats flexible orchestrator with complex modes.
4. **Documentation matters**: Old SKILL.md made deployment sound like manual docker commands. New one is explicit: "Run ./deploy-server.sh"
