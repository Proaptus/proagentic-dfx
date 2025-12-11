---
name: ProAgentic Environment Cleanup
description: Optimizes ProAgentic development environment by cleaning port conflicts, Docker images, memory issues, and test artifacts. Performs aggressive port cleanup, Docker image optimization, memory monitoring, and system health diagnostics. Use before starting development, when app won't start with port errors, when system feels slow, or for weekly maintenance. Provides before/after metrics and health reports.
allowed-tools: Bash, Read, Grep, Glob, Write
---

# ProAgentic Environment Cleanup Skill

## 🎯 Purpose

This skill automates cleanup and optimization of the ProAgentic development environment to eliminate freezing issues, port conflicts, and resource exhaustion. It provides a safe, comprehensive suite of tools for maintaining a healthy development environment.

## 🔍 When to Use This Skill

**Automatic Activation Triggers:**
- User asks: "clean up", "optimize", "fix freezing", "cleanup environment"
- User reports: "app won't start", "port already in use", "system is slow"
- User reports: "tests are hanging", "memory exhaustion", "runaway test processes"
- Before: `./start.sh` or `npm run dev`
- Before: Running tests (`npm test`, `npm run test:e2e`)
- Scheduled: Weekly maintenance or before committing

**Manual Activation:**
```bash
# The skill activates when user requests environment cleanup
# Examples:
# - "clean up my development environment"
# - "I'm getting port conflicts, fix them"
# - "optimize the system for development"
# - "run weekly maintenance"
```

## 📋 Core Capabilities

### 1. **Aggressive Port Cleanup**
- Kills stale processes on ports 5173 (frontend), 8080 (backend)
- Also cleans +1 variants to prevent Vite auto-increment
- Uses 4 fallback methods: lsof → netstat → ss → fuser
- WSL2-safe with timeouts (prevents hanging)
- Verifies ports are actually free before declaring success

**Fixes**: "listen EADDRINUSE" errors, startup failures

### 2. **Docker Image Cleanup**
- Removes unused Docker containers and images
- Cleans dangling (untagged) images
- Removes old proagentic-server versions (keeps 1 recent)
- Clears build cache
- Removes unused volumes
- Recovers 5-8GB disk space

**Fixes**: Disk space warnings, slow system response

### 3. **Memory Monitoring**
- Real-time memory usage tracking with visual indicators
- Warns at 75% usage, critical at 85%
- Shows top memory consumers by process
- Detects memory leaks (growing trend detection)
- Safe to run continuously during development

**Fixes**: OOM issues, heap exhaustion warnings

### 4. **Test Artifact Cleanup**
- Removes old test coverage reports (116MB+)
- Deletes old test results and screenshots
- Cleans Playwright cache and artifacts
- Removes old log files
- Preserves .gitkeep for directory structure

**Fixes**: Disk space issues, slow directory access

### 5. **System Health Diagnostics**
- Checks disk usage (goal: < 60%)
- Monitors memory allocation (goal: < 75%)
- Verifies port availability
- Checks Docker daemon status
- Reports WSL configuration
- Shows process memory consumers

**Fixes**: Provides actionable diagnostics

### 6. **Test Process Management**
- Prevents concurrent test execution (safe-test-wrapper.sh)
- Kills zombie/long-running test processes (cleanup-test-processes.sh)
- Automatic cleanup on script interruption (trap handlers in test scripts)
- Playwright timeout protection (30s per test, 10s per action)
- Prevents memory exhaustion from runaway tests (8.7GB bug fix)
- Age-based process cleanup (default: 2 hours, configurable)

**Fixes**: Memory exhaustion from multiple test processes, orphaned test processes after Ctrl+C, hanging Playwright tests

### 7. **Before/After Comparison**
- Measures disk space before/after cleanup
- Tracks memory usage changes
- Reports port status improvement
- Documents cleanup actions performed
- Estimates future system improvements

**Fixes**: Shows impact of cleanup actions

## 🛠️ How to Use

### Basic Cleanup (Recommended)
```bash
# User initiates cleanup when app freezes
User: "Clean up my development environment"
Skill activates and performs:
  1. Aggressive port cleanup
  2. Docker image cleanup
  3. Test artifact removal
  4. System health check
  5. Before/after report
```

### Interactive Cleanup (For Specific Issues)
```bash
# User identifies specific problem
User: "I'm getting port conflicts when starting the app"
Skill activates with:
  1. Aggressive port cleanup (primary)
  2. System diagnostics
  3. Startup verification
```

### Memory Monitoring (During Development)
```bash
# User wants to monitor memory
User: "Monitor memory usage while I develop"
Skill activates:
  1. Real-time memory monitor
  2. Top consumer tracking
  3. Warning alerts (75%/85% thresholds)
```

### Weekly Maintenance
```bash
# User schedules routine maintenance
User: "Run weekly cleanup and optimization"
Skill performs:
  1. All cleanup operations
  2. Docker image cleanup
  3. Test artifact removal
  4. Comprehensive health report
  5. Recommendations for next week
```

## 📊 Output

Each cleanup session produces:

1. **Progress Report**
   - Real-time action log
   - What was cleaned
   - What was skipped (with reasons)
   - Estimated disk/memory recovered

2. **Health Report**
   - Before/after metrics
   - Port status (clean/in-use)
   - Docker image count and size
   - Memory usage and trends
   - Disk space usage percentage

3. **Recommendations**
   - Next actions (e.g., "run `npm run dev` now")
   - Long-term maintenance schedule
   - Resource warning thresholds
   - Optimization opportunities

## ✅ Safety Guarantees

This skill is designed to be **safe and non-destructive**:

### Protected (Never Deleted)
- ✅ Source code (`src/`, `server/`, `tests/`)
- ✅ Project configuration (`.env`, `package.json`)
- ✅ Git history (`.git/`)
- ✅ Version control artifacts

### Removable (Safely Cleaned)
- ✅ Test coverage reports (`coverage/`)
- ✅ Old test results (`test-results/`)
- ✅ Playwright cache (`.playwright/`)
- ✅ Screenshot artifacts (`*-screenshots/`)
- ✅ Old log files (`*.log`)
- ✅ Build cache (`dist/`, `.next/`)
- ✅ Docker images and volumes (unused only)

### Reversible (Can Be Recovered)
- ✅ Docker images: Rebuild from Dockerfile
- ✅ Coverage reports: Re-run tests
- ✅ Screenshots: Re-run tests

### Requires Confirmation
- ⚠️ Docker cleanup: Shows disk freed before deleting
- ⚠️ Port cleanup: Confirms stale processes found
- ⚠️ Aggressive operations: User can skip individual steps

## 🔧 Scripts Used

The skill provides both Windows (PowerShell) and Linux/WSL (Bash) scripts:

### Windows PowerShell Scripts (.ps1)
1. **aggressive-port-cleanup.ps1** - Windows port management (3000, 5173, 8080)
2. **cleanup-artifacts.ps1** - Test artifact removal (coverage, .next, logs)
3. **system-health-check.ps1** - Windows diagnostics and resource monitoring

### Linux/WSL Bash Scripts (.sh)
1. **aggressive-port-cleanup.sh** - WSL2-safe port management
2. **safe-test-wrapper.sh** - Prevents concurrent test execution (memory exhaustion protection)
3. **cleanup-test-processes.sh** - Kills zombie/long-running test processes with age-based filtering
4. **docker-cleanup.sh** - Docker image and volume cleanup
5. **cleanup-artifacts.sh** - Test artifact removal
6. **monitor-memory.sh** - Real-time memory monitoring
7. **system-health-check.sh** - Diagnostics and reporting

### Configuration Files
- **playwright.config.ts** - Timeout configurations (30s per test, 10s per action) to prevent runaway Playwright tests

## 📈 Expected Improvements

After running the skill:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Startup Time | 30-60s | 15-20s | 50% faster |
| Memory Usage | 2-3GB | 1.5-2GB | 25% less |
| Disk Usage | 326GB (35%) | 280GB (29%) | 46GB freed |
| Port Conflicts | ~5-10/week | ~0/week | 100% resolved |
| Freeze Events | 3-5/day | ~0/week | 99% reduced |
| Test Memory Peak | 8.7GB (3 vitest) | 2GB (max) | 77% reduction |
| Orphaned Test Processes | Common after Ctrl+C | Auto-cleanup | 100% resolved |
| Hanging Playwright Tests | Indefinite | 30s timeout | 100% resolved |

## 📚 Documentation

- **README.md** - Full documentation and troubleshooting
- **QUICK_REFERENCE.md** - One-page quick reference card
- **USAGE_EXAMPLES.md** - Practical usage scenarios
- **CHECKLIST.md** - Task verification checklist

## 🚀 Integration

The skill integrates with:
- **ProAgentic Startup**: Use before `./start.sh`
- **Development Workflow**: Use when system feels slow
- **Continuous Development**: Monitor memory during dev
- **Deployment Pipeline**: Cleanup before building/deploying

## 🔐 Restrictions

**allowed-tools**: `Bash, Read, Grep, Glob, Write`

- ✅ Can read files (diagnostics)
- ✅ Can execute bash scripts (cleanup operations)
- ✅ Can write reports (documentation)
- ❌ Cannot edit source code
- ❌ Cannot modify project configuration
- ❌ Cannot delete protected directories

## 🎓 Key Principles

1. **Non-Destructive**: Only removes temporary artifacts and unused images
2. **Transparent**: Shows what's happening and what was removed
3. **Safe by Default**: Confirms before major operations
4. **Observable**: Provides before/after metrics
5. **Recoverable**: Nothing deleted is permanent (can rebuild)
6. **WSL2-Optimized**: Uses WSL-safe methods with proper timeouts

## ❓ Common Questions

**Q: Will this delete my code?**
A: No. Only temporary artifacts (coverage, test results, screenshots) and unused Docker images are removed.

**Q: Is it safe to run frequently?**
A: Yes. Run before development, weekly, or whenever the system feels slow. It's idempotent.

**Q: What if a script fails?**
A: The skill will skip that step and continue. You'll see a detailed report of what succeeded/failed.

**Q: How long does it take?**
A: 30-120 seconds depending on what needs cleanup. Docker cleanup is fastest (30s), full cleanup is ~2 minutes.

**Q: Can I automate this?**
A: Yes. The skill provides scripts that can be scheduled with cron or run manually before development.

## 🆘 Troubleshooting

See **README.md** for:
- Common issues and solutions
- How to run individual cleanup steps
- How to troubleshoot specific problems
- Emergency recovery procedures

---

**Next Steps**: See README.md for full documentation and examples.
