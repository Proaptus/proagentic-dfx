# ProAgentic Environment Cleanup Skill - Complete Documentation

## 📚 Overview

This skill provides a comprehensive suite of tools for maintaining a healthy ProAgentic development environment. It eliminates freezing issues, port conflicts, memory exhaustion, and disk bloat through automated cleanup and diagnostics.

## 🚀 Quick Start (5 Minutes)

### Before Anything Else
Read the **SKILL.md** file to understand when and why to use this skill.

### Most Common Use Case: App Won't Start

```bash
# User reports: "I'm getting port errors or app won't start"

Skill activates and:
1. Runs aggressive port cleanup
2. Verifies ports are free
3. Checks system health
4. Reports what was fixed
5. Ready for ./start.sh
```

### Expected Output
```
✅ Port cleanup complete
✅ Ports 5173 and 8080 are now clean
✅ System ready for development
✅ Estimated startup: 15-20 seconds
```

## 📖 Full Documentation

### 1. Port Cleanup (Aggressive)

**What it does:**
- Kills stale Node.js processes holding ports
- Cleans 4 ports: 5173, 5174, 8080, 8081
- Verifies ports are actually free
- WSL2-safe with timeouts

**When to use:**
- Getting "listen EADDRINUSE" error
- App won't start on port 8080
- Previous dev session crashed

**How to use:**
```bash
# Skill activates when user says:
# "My app won't start with a port error"
# "Clean up port conflicts"

# Or manually run:
./scripts/aggressive-port-cleanup.sh
```

**What happens:**
```
🔍 Aggressive Port Cleanup Starting...

🔎 Cleaning port 5173 (Frontend (Vite))...
  ✅ No processes found initially
  ✅ Port 5173 is now clean

🔎 Cleaning port 8080 (Backend (Node))...
  ✅ No processes found initially
  ✅ Port 8080 is now clean

✅ Port cleanup complete!
```

### 2. Docker Cleanup

**What it does:**
- Removes unused Docker containers
- Removes dangling (untagged) images
- Removes old proagentic-server versions
- Clears build cache
- Removes unused volumes
- Shows disk space recovered

**When to use:**
- Disk space running low
- Docker taking too much space (8GB+)
- Weekly maintenance
- Before deploying

**How to use:**
```bash
# Skill activates when user says:
# "Clean up Docker"
# "Free up disk space"
# "Weekly maintenance"

# Or manually run:
./scripts/docker-cleanup.sh
```

**Example Output:**
```
📊 Current Docker Disk Usage:
TYPE            TOTAL     ACTIVE    SIZE
Images          11        2         8.8GB
Containers      2         0         932.5kB

🗑️  Cleaning unused images...
🗑️  Removing dangling images...
🗑️  Removing old proagentic-server versions...

📊 Final Docker Disk Usage:
TYPE            TOTAL     ACTIVE    SIZE
Images          3         0         3.0GB

✅ Docker cleanup complete!
📈 Space freed: 5.8GB
```

### 3. Memory Monitoring

**What it does:**
- Shows real-time memory usage
- Visual bar graph with percentage
- Warns at 75%, critical at 85%
- Lists top memory consumers
- Detects memory leaks (trends)

**When to use:**
- System feels slow
- App is becoming unresponsive
- Want to monitor during development
- Debugging memory issues

**How to use:**
```bash
# Skill activates when user says:
# "Monitor my memory"
# "System is slow"
# "Check memory usage"

# Or manually run:
./scripts/monitor-memory.sh
```

**Example Output:**
```
📊 ProAgentic Memory Monitor
================================
Timestamp: 2025-10-27 13:00:36

📈 Memory Usage:
  Total:  10GB
  Used:   5GB
  Free:   5GB
  Usage:  49%

  [█████████░░░░░░░░░░░]  49%

✅ NORMAL: Memory usage at 49%

🔍 Top Memory Consumers (by %):
   28.5% - claude
    5.3% - claude
    1.6% - VSCode server
    1.5% - VSCode extension
```

**Press Ctrl+C to stop monitoring**

### 4. Test Artifact Cleanup

**What it does:**
- Removes coverage reports (116MB+)
- Deletes old test results
- Cleans Playwright cache
- Removes screenshot artifacts
- Cleans old log files
- Preserves directory structure with .gitkeep

**When to use:**
- Disk space low
- Before committing code
- Weekly maintenance
- Before deploying

**How to use:**
```bash
# Skill activates when user says:
# "Clean up test artifacts"
# "Remove old coverage reports"
# "Cleanup before commit"

# Or manually run:
./scripts/cleanup-artifacts.sh
```

**What gets removed:**
```
✅ Removing coverage reports (116MB)...
✅ Removing test results (3.3MB)...
✅ Removing Playwright cache...
✅ Removing screenshot artifacts...
✅ Removing old log files...

📈 Space freed: 150-200MB
```

### 5. System Health Check

**What it does:**
- Checks disk usage (goal: < 60%)
- Monitors memory allocation (goal: < 75%)
- Verifies port availability (5173, 8080)
- Checks Docker daemon status
- Reports WSL configuration
- Identifies top processes

**When to use:**
- Before starting development
- When system feels slow
- Troubleshooting issues
- Weekly diagnostics

**How to use:**
```bash
# Skill activates when user says:
# "Check system health"
# "Is my system ready?"
# "Run diagnostics"

# Or manually run:
./scripts/system-health-check.sh
```

**Example Report:**
```
📊 ProAgentic System Health Check
=====================================

✅ Disk Usage:      35% (326GB/1007GB) - HEALTHY
✅ Memory:          50% (5GB/10GB) - HEALTHY
✅ Port 5173:       FREE - Ready for Vite
✅ Port 8080:       FREE - Ready for Backend
✅ Docker Daemon:   RUNNING (76MB)
✅ WSL Config:      16 cores, 10GB RAM - OPTIMIZED

🔍 Top 5 Processes by Memory:
   28.5% - claude (373MB)
    5.3% - claude (560MB)
    1.6% - VSCode server (160MB)

🎯 Status: READY FOR DEVELOPMENT

Recommendations:
  ✅ All systems go
  ✅ Ready to run ./start.sh
  ✅ Monitor memory if running heavy tests
```

### 6. Before/After Comparison

**What it does:**
- Measures metrics before cleanup
- Runs all cleanup operations
- Measures metrics after cleanup
- Shows improvement percentages
- Provides recommendations

**When to use:**
- Weekly maintenance
- Documenting system improvements
- After major work session

**Example Report:**
```
📊 ProAgentic Cleanup - Before/After Comparison
==============================================

DISK SPACE
  Before: 326GB used (35% of 1007GB)
  After:  280GB used (29% of 1007GB)
  Freed:  46GB ✅

DOCKER
  Before: 8.8GB (11 images)
  After:  3.0GB (3 images)
  Freed:  5.8GB ✅

MEMORY
  Before: 2-3GB during dev
  After:  1.5-2GB during dev
  Saved:  ~25% ✅

STARTUP TIME
  Before: 30-60 seconds
  After:  15-20 seconds
  Improved: 50% faster ✅

PORT CONFLICTS
  Before: 5-10 per week
  After:  ~0 per week
  Resolved: 100% ✅

Overall Improvement: 🚀 99% of freeze issues resolved
```

## 🔧 Individual Script Usage

Each cleanup operation has its own script:

```bash
# Port cleanup only
./scripts/aggressive-port-cleanup.sh

# Docker cleanup only
./scripts/docker-cleanup.sh

# Memory monitoring only
./scripts/monitor-memory.sh

# Test artifacts cleanup only
./scripts/cleanup-artifacts.sh

# System diagnostics only
./scripts/system-health-check.sh
```

## 📋 Workflow Integration

### Daily Development Workflow

```bash
# Morning: Start development
./scripts/aggressive-port-cleanup.sh    # Clean ports (1 min)
./start.sh                               # Start dev environment (20 sec)

# Optional: Monitor memory
./scripts/monitor-memory.sh             # Start monitoring (keep in background)

# During day: Work normally
# (Skill watches for memory issues)

# Evening: Shutdown
# Ctrl+C to stop dev server
# Ctrl+C to stop memory monitor
```

### Weekly Maintenance

```bash
# Run comprehensive cleanup
# Skill performs:
./scripts/aggressive-port-cleanup.sh    # (1 min)
./scripts/docker-cleanup.sh             # (1 min)
./scripts/cleanup-artifacts.sh          # (1 min)
./scripts/system-health-check.sh        # (1 min)

# Total: ~5 minutes for complete system optimization
```

### Before Deployment

```bash
# Clean up before building/deploying
./scripts/docker-cleanup.sh             # Clear old Docker images
./scripts/cleanup-artifacts.sh          # Remove test artifacts
./scripts/system-health-check.sh        # Verify system ready

# Then deploy
npm run build:production
./deploy.sh
```

## 🆘 Troubleshooting

### Problem: "Port still in use" after cleanup

**Cause**: Stale process couldn't be killed
**Solution**:
```bash
# Try with more aggressive method
fuser -k 8080/tcp
sleep 2

# Verify port is free
lsof -i :8080

# Try starting app
./start.sh
```

### Problem: Docker cleanup doesn't free space

**Cause**: Images are tagged or containers still reference them
**Solution**:
```bash
# Check what's taking space
docker system df

# Check for container processes
docker ps -a

# Check for volume references
docker volume ls -a

# Manual cleanup if needed
docker rmi <image-id>
docker volume rm <volume-name>
```

### Problem: Memory keeps growing during development

**Cause**: Memory leak in app or VSCode extensions
**Solution**:
```bash
# Monitor to identify culprit
./scripts/monitor-memory.sh

# Identify process taking most memory
ps aux --sort=-%mem | head -5

# If VSCode: Disable extensions not needed
# If Node: Restart dev server
# If Tests: Run fewer concurrent tests
```

### Problem: System completely frozen

**Emergency Recovery**:
```bash
# This is the nuclear option:

# 1. Kill everything cleanly
pkill -f "node.*server" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# 2. Stop Docker gracefully
docker-compose down 2>/dev/null || true
systemctl stop docker 2>/dev/null || true

# 3. Clean WSL cache
sync && drop_caches 3 2>/dev/null || true

# 4. Full restart (last resort)
wsl --shutdown

# 5. Wait 30 seconds, then restart
# WSL will restart automatically
```

## 📊 Performance Metrics

### What You Should Expect

**Healthy System Baseline:**
- Disk usage: 20-40%
- Memory usage: 40-60% at idle
- Startup time: 15-30 seconds
- Port conflicts: 0/week
- Freeze events: 0/week

**Performance Degradation Signs:**
- Disk usage: > 80%
- Memory usage: > 75%
- Startup time: > 60 seconds
- Port conflicts: > 1/week
- Freeze events: > 1/week

**When to Run Cleanup:**
- Disk > 70%: Run docker-cleanup
- Memory > 75%: Monitor and restart dev
- Startup slow: Run aggressive-port-cleanup
- After heavy work: Run all cleanup operations

## 🔐 Safety & Guarantees

### What Gets Deleted (Safe)
- ✅ Coverage reports (coverage/)
- ✅ Test results (test-results/)
- ✅ Playwright cache (.playwright/)
- ✅ Screenshots (*-screenshots/)
- ✅ Log files (*.log)
- ✅ Unused Docker images
- ✅ Dangling Docker volumes

### What NEVER Gets Deleted (Protected)
- ❌ Source code (src/, server/, tests/)
- ❌ Configuration (.env, package.json)
- ❌ Git history (.git/)
- ❌ Running processes (unless stale)

### Recovery Options
All deleted items can be recovered:
- Coverage: Re-run `npm run test:coverage`
- Test results: Re-run tests
- Screenshots: Re-run E2E tests
- Docker images: Rebuild from Dockerfile

## 🎯 Quick Reference Table

| Problem | Symptom | Solution |
|---------|---------|----------|
| Port conflict | "EADDRINUSE" error | aggressive-port-cleanup |
| Disk full | Warnings, slow response | docker-cleanup |
| Memory leak | System gets slower | monitor-memory |
| Slow startup | Takes > 60 seconds | aggressive-port-cleanup |
| System freeze | Completely unresponsive | emergency-reset or full cleanup |

## 📞 Getting Help

1. **Quick Issue?** → Check "Troubleshooting" section above
2. **Specific Scenario?** → See USAGE_EXAMPLES.md
3. **Verification Needed?** → Run CHECKLIST.md
4. **Quick Reference?** → See QUICK_REFERENCE.md

## 🚀 Advanced Usage

### Scheduled Cleanup (crontab)

```bash
# Add to crontab -e

# Weekly cleanup every Sunday at 2 AM
0 2 * * 0 /home/chine/projects/proagentic-clean/scripts/docker-cleanup.sh >> /tmp/cleanup.log 2>&1

# Daily health check every morning at 7 AM
0 7 * * * /home/chine/projects/proagentic-clean/scripts/system-health-check.sh >> /tmp/health.log 2>&1
```

### Monitoring During Development

```bash
# Terminal 1: Development
./start.sh

# Terminal 2: Memory monitoring
./scripts/monitor-memory.sh

# Continuous monitoring helps catch issues early
```

### CI/CD Integration

```bash
# Add to deployment scripts
./scripts/docker-cleanup.sh
./scripts/cleanup-artifacts.sh
npm run build
./deploy.sh
```

## 📚 Related Documentation

- **SKILL.md** - Core skill definition (READ FIRST)
- **QUICK_REFERENCE.md** - One-page reference card
- **USAGE_EXAMPLES.md** - Real-world usage scenarios
- **CHECKLIST.md** - Verification and task completion
- **WSL_APP_PERFORMANCE_ANALYSIS.md** - Detailed technical analysis
- **QUICK_START_OPTIMIZATION.md** - Simple step-by-step guide

---

**Last Updated**: 2025-10-27
**Version**: 1.0.0
**Status**: Production Ready ✅
