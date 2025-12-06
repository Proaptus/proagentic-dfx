# ProAgentic Environment Cleanup - Verification Checklist

Use this checklist to verify cleanup operations are complete and successful.

---

## Pre-Cleanup Checklist

Before running cleanup, verify these preconditions:

- [ ] No critical work is running (save and close VSCode/terminals)
- [ ] All documents are saved
- [ ] Git status is clean (or changes are committed)
- [ ] You have backup of important files (optional but recommended)
- [ ] System has internet connection (for pulling Docker images)
- [ ] 5 minutes available for cleanup

---

## Full Cleanup Verification

### Step 1: Aggressive Port Cleanup ✓

Run: `./scripts/aggressive-port-cleanup.sh`

**Verification Checklist:**
- [ ] Script starts without errors
- [ ] Output shows port checking for 5173, 8080, 5174, 8081
- [ ] All ports show "CLEAN" status
- [ ] No error messages
- [ ] Script completes in < 30 seconds

**Expected Output Signs:**
```
✓ "✅ Port cleanup complete!"
✓ "All ports ready for startup"
✓ No "Error" messages
```

**If Failed:**
- [ ] Verify ports are not manually held open
- [ ] Check: `lsof -i :8080` shows nothing
- [ ] Try: `fuser -k 8080/tcp` manually
- [ ] Restart WSL: `wsl --shutdown`

---

### Step 2: Docker Cleanup ✓

Run: `./scripts/docker-cleanup.sh`

**Verification Checklist:**
- [ ] Script shows Docker version (Docker available)
- [ ] Shows "Current Docker Disk Usage" before cleanup
- [ ] Removes containers, images, volumes step-by-step
- [ ] Shows "Final Docker Disk Usage" after cleanup
- [ ] Reports disk space freed (should be > 100MB)
- [ ] Script completes in < 2 minutes
- [ ] No error messages

**Expected Output Signs:**
```
✓ Docker disk usage shown
✓ "✅ Docker cleanup complete!"
✓ Space saved displayed (e.g., "5.8GB freed")
✓ No critical errors
```

**Verify After:**
- [ ] Run `docker system df` to see current state
- [ ] Should show 3-5GB of Docker images (down from 8.8GB)
- [ ] Should show < 50MB of volumes

**If Failed:**
- [ ] Docker daemon running? `systemctl status docker`
- [ ] Try: `docker system prune -a --force` manually
- [ ] Check disk space: `df -h`

---

### Step 3: Memory Monitor ✓

Run: `./scripts/monitor-memory.sh` (Run for 20-30 seconds, then Ctrl+C)

**Verification Checklist:**
- [ ] Script starts and shows memory header
- [ ] Sampling interval shown (5 seconds)
- [ ] Memory usage displayed as percentage
- [ ] Visual bar graph shown
- [ ] Top processes listed
- [ ] Status shows "NORMAL" if < 75%
- [ ] No crashes or errors
- [ ] Runs smoothly for the 30 seconds

**Expected Output Signs:**
```
✓ "Memory usage: 45-60%" (during idle)
✓ "[████████░░░░░░░░░░░]" (visual bar)
✓ "✅ NORMAL: Memory usage at 50%"
✓ Top processes listed by %
```

**Verify Memory Health:**
- [ ] Baseline memory < 60% when idle
- [ ] During dev, memory stays < 75%
- [ ] Memory not steadily increasing (no leak)
- [ ] VSCode/Claude CLI shown as top consumers (expected)

**If Failed:**
- [ ] High memory usage (> 75%)? Stop concurrent processes
- [ ] Memory growing? Possible memory leak
- [ ] Can't run script? Bash issue, try `bash ./scripts/monitor-memory.sh`

---

### Step 4: Test Artifact Cleanup ✓

Run: `./scripts/cleanup-artifacts.sh`

**Verification Checklist:**
- [ ] Script starts without errors
- [ ] Shows directories being cleaned: coverage/, test-results/, etc.
- [ ] Reports space freed (should be > 50MB)
- [ ] Script completes in < 1 minute
- [ ] No critical error messages

**Expected Output Signs:**
```
✓ "Removing coverage/" (116MB)
✓ "Removing test-results/" (3.3MB)
✓ "Removing *-screenshots/"
✓ "✅ Artifact cleanup complete!"
```

**Verify After:**
- [ ] Run: `du -sh coverage test-results .playwright`
- [ ] All directories should be minimal or empty
- [ ] Confirm: `ls -la coverage/` shows only .gitkeep

**If Failed:**
- [ ] Permission denied? Check file ownership
- [ ] Directory doesn't exist? That's OK, script handles it
- [ ] Disk space not freed? Old files may be taking space elsewhere

---

### Step 5: System Health Check ✓

Run: `./scripts/system-health-check.sh`

**Verification Checklist:**
- [ ] Script runs and shows system diagnostics
- [ ] Disk usage shown (should be < 60% = HEALTHY)
- [ ] Memory shown (should be < 75% = HEALTHY)
- [ ] Port 5173 status shown (should be FREE)
- [ ] Port 8080 status shown (should be FREE)
- [ ] Docker daemon status shown (should be RUNNING)
- [ ] WSL configuration shown (should show cores and RAM)
- [ ] Top processes listed
- [ ] Overall status at end (should be READY FOR DEVELOPMENT)

**Expected Output Signs:**
```
✓ All checks showing ✅ GREEN
✓ "READY FOR DEVELOPMENT"
✓ "Ports 5173 and 8080: FREE"
✓ "Disk usage: 29% - HEALTHY"
✓ "Memory: 50% - HEALTHY"
```

**Health Status Guide:**
- [ ] Disk < 50%: GREEN ✅
- [ ] Disk 50-70%: YELLOW ⚠️
- [ ] Disk > 70%: RED 🔴
- [ ] Memory < 60%: GREEN ✅
- [ ] Memory 60-75%: YELLOW ⚠️
- [ ] Memory > 75%: RED 🔴

**If Failed:**
- [ ] Red status? Run additional cleanup
- [ ] Port in use? Run aggressive-port-cleanup again
- [ ] Disk still high? Run docker-cleanup again

---

## Post-Cleanup Verification

After all cleanup steps, verify system is ready:

### Quick Startup Test
```bash
# Verify startup works
./start.sh
```

**Success Checklist:**
- [ ] Vite starts without port errors
- [ ] Backend starts on port 8080
- [ ] Both show "ready" status
- [ ] Frontend loads at http://localhost:5173
- [ ] API responds at http://localhost:8080/api/health
- [ ] No console errors or warnings
- [ ] Startup completed in < 30 seconds

**If Failed:**
- [ ] Port error? Run aggressive-port-cleanup again
- [ ] Backend crash? Check server.log for errors
- [ ] Vite error? Clear node_modules: `rm -rf node_modules && npm install`

### Disk Space Verification
```bash
df -h
```

**Success Checklist:**
- [ ] Disk usage < 60% (was higher before cleanup)
- [ ] Free space > 100GB
- [ ] No warning messages
- [ ] File system is "/dev/sdd"

### Memory Baseline
```bash
free -h
```

**Success Checklist:**
- [ ] Total memory: 9-10GB
- [ ] Used memory: < 60% of total
- [ ] Available: > 4GB
- [ ] No swap usage (or minimal)

### Docker Status
```bash
docker system df
```

**Success Checklist:**
- [ ] Images: 3-5 images total
- [ ] Image size: 2.5-3.0GB (down from 8.8GB)
- [ ] Containers: 0 running (inactive)
- [ ] Volumes: 0 unused

---

## Daily Cleanup Routine Checklist

Use this before starting your development day:

```bash
# Morning routine (takes 1-2 minutes)
./scripts/aggressive-port-cleanup.sh     # (1 min) ☐
./scripts/system-health-check.sh         # (5 sec) ☐

# Verify startup
./start.sh                                # (20 sec) ☐

# Monitor memory (optional, keep in background)
./scripts/monitor-memory.sh &             # (background) ☐
```

**Completion Checklist:**
- [ ] Aggressive port cleanup: COMPLETE
- [ ] System health: All GREEN ✅
- [ ] App startup: SUCCESS
- [ ] Ready to develop: YES

---

## Weekly Cleanup Routine Checklist

Run every Sunday evening or Monday morning:

```bash
# Full cleanup routine (takes ~3 minutes)
./scripts/aggressive-port-cleanup.sh     # (1 min) ☐
./scripts/docker-cleanup.sh              # (60 sec) ☐
./scripts/cleanup-artifacts.sh           # (30 sec) ☐
./scripts/system-health-check.sh         # (5 sec) ☐
```

**Completion Checklist:**
- [ ] All 4 scripts executed
- [ ] No error messages
- [ ] Disk space freed: > 100MB
- [ ] Final health status: GREEN ✅
- [ ] Ready for next week: YES

---

## Before Deployment Checklist

Run before deploying to production:

- [ ] Aggressive port cleanup ✓
- [ ] Docker cleanup ✓
- [ ] Test artifact cleanup ✓
- [ ] System health check ✓
- [ ] All results GREEN ✓
- [ ] App starts cleanly ✓
- [ ] Ready to build and deploy ✓

---

## Emergency Recovery Checklist

If system is frozen or broken:

- [ ] Save all work if possible
- [ ] Kill dev processes gracefully (Ctrl+C)
- [ ] Run: `pkill -f "node.*server"`
- [ ] Run: `pkill -f vite`
- [ ] Run: `systemctl stop docker`
- [ ] Run: `wsl --shutdown`
- [ ] Wait 30 seconds (WSL restarts auto)
- [ ] Verify: `./scripts/system-health-check.sh`
- [ ] Restart: `./start.sh`

---

## Troubleshooting Checklist

If cleanup isn't working:

### Port cleanup fails
- [ ] Try manual: `fuser -k 8080/tcp`
- [ ] Verify: `lsof -i :8080` (should show nothing)
- [ ] Check processes: `ps aux | grep node`
- [ ] Last resort: `wsl --shutdown`

### Docker cleanup fails
- [ ] Check Docker is running: `systemctl status docker`
- [ ] Try manual: `docker system prune -a --force`
- [ ] Check disk has space: `df -h`
- [ ] Verify Docker daemon: `docker ps`

### Memory monitor fails
- [ ] Check Bash version: `bash --version`
- [ ] Run directly: `bash ./scripts/monitor-memory.sh`
- [ ] Check permissions: `ls -l ./scripts/monitor-memory.sh`
- [ ] Make executable: `chmod +x ./scripts/monitor-memory.sh`

### App won't start after cleanup
- [ ] Check ports are clean: `lsof -i :8080 :5173`
- [ ] Check disk space: `df -h` (need > 50GB free)
- [ ] Check memory: `free -h` (need > 3GB available)
- [ ] Check npm cache: `npm cache clean --force`
- [ ] Reinstall: `rm -rf node_modules && npm install`

---

## Success Criteria

✅ **CLEANUP IS SUCCESSFUL IF:**

1. **All scripts run without errors**
   - No "Error" messages
   - No "Permission denied"
   - No "Command not found"

2. **Measurable improvements**
   - Disk space freed: > 100MB
   - Docker images reduced: from 8.8GB to 3.0GB
   - Startup faster: from 30-60s to 15-20s
   - Memory baseline: 1.5-2GB

3. **System is healthy**
   - Disk usage: < 60%
   - Memory usage: < 60% idle
   - All ports clean (5173, 8080)
   - Docker running normally
   - App starts in < 20 seconds

4. **Ready for development**
   - `./start.sh` works first time
   - No port conflicts
   - No memory warnings
   - No disk space warnings

---

## Cleanup Status Template

Use this to track your cleanup success:

```
📋 ProAgentic Cleanup Status

Date: [today's date]
Time: [time of cleanup]

✅ Tasks Completed:
  ☑ Aggressive port cleanup
  ☑ Docker cleanup
  ☑ Memory monitor (sampled)
  ☑ Test artifact cleanup
  ☑ System health check

📊 Metrics:
  Disk before: __%  Disk after: __%  Freed: __GB
  Memory before: __MB  Memory after: __MB
  Startup time: __s (goal: < 20s)

✅ System Status:
  Ports: ✅ CLEAN
  Docker: ✅ OPTIMIZED
  Memory: ✅ HEALTHY
  Disk: ✅ HEALTHY

🚀 Ready to develop: YES / NO
```

---

**For detailed information**: See README.md
**For quick reference**: See QUICK_REFERENCE.md
**For examples**: See USAGE_EXAMPLES.md
