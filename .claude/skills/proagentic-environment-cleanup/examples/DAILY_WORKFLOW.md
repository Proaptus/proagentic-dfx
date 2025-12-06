# ProAgentic Cleanup Skill - Daily Workflow Guide

Daily routine for maintaining a healthy development environment.

## 📅 Morning Routine (2 minutes)

Start your day with a quick cleanup and health check.

### Step 1: Port Cleanup (1 minute)
```bash
cd /home/chine/projects/proagentic-clean
./scripts/aggressive-port-cleanup.sh
```

**Output:**
```
✅ Port cleanup complete!
✅ Ports 5173 and 8080 are now clean
```

### Step 2: Health Check (30 seconds)
```bash
./scripts/system-health-check.sh
```

**Output:**
```
✅ Disk: 35% (HEALTHY)
✅ Memory: 50% (HEALTHY)
✅ Ports: CLEAN
✅ READY FOR DEVELOPMENT
```

### Step 3: Start Development (20 seconds)
```bash
./start.sh
```

**Output:**
```
Frontend: http://localhost:5173
Backend:  http://localhost:8080
✅ Development environment is ready!
```

### Step 4: Optional - Monitor Memory
```bash
# In another terminal (keep running)
./scripts/monitor-memory.sh
```

**Output:**
```
📊 ProAgentic Memory Monitor
Memory: 50% [█████████░░░░░░░░░░░]
✅ NORMAL
```

---

## 🔄 During Development

### Watch for Warnings
- Memory monitor warns at 75%
  - Action: Stop concurrent tests or restart backend
- System feels slow
  - Action: Check memory monitor, restart if needed
- Port conflict error
  - Action: Run `./scripts/aggressive-port-cleanup.sh` again

### Regular Checks (Every 2-3 hours)
```bash
# Quick health check
./scripts/system-health-check.sh
```

---

## 🌙 Evening Shutdown

### Stop Development
```bash
# Terminal 1: Stop dev server
Ctrl+C  # Stops Vite and Backend

# Terminal 2: Stop memory monitor (if running)
Ctrl+C
```

### Optional - Clean Up for Tomorrow
```bash
# Remove test artifacts (optional)
./scripts/cleanup-artifacts.sh

# Verify system ready for tomorrow
./scripts/system-health-check.sh
```

---

## 🔧 If Something Goes Wrong

### Issue: App won't start with port error

**Command:**
```bash
./scripts/aggressive-port-cleanup.sh
./start.sh
```

**Expected Result:**
```
✅ Port cleanup complete!
✅ Ports 5173 and 8080 are now clean
✅ App starts successfully
```

### Issue: System is slow or freezing

**Command:**
```bash
./scripts/monitor-memory.sh
```

**What to do:**
1. Watch memory percentage
2. If > 75%: Stop tests or restart backend
3. If steadily rising: Possible memory leak, restart dev

### Issue: Disk space warnings

**Command:**
```bash
./scripts/docker-cleanup.sh
./scripts/cleanup-artifacts.sh
df -h  # Verify space freed
```

**Expected Result:**
```
✅ Docker cleanup complete!
✅ Space freed: 5.8GB
✅ Disk usage now healthy
```

---

## 📊 Health Targets

Monitor these metrics during your day:

| Metric | Goal | Action if Exceeded |
|--------|------|-------------------|
| Disk Usage | < 50% | Run docker-cleanup |
| Memory Baseline | < 60% | Restart or close extensions |
| Memory During Dev | < 75% | Stop tests or restart backend |
| Startup Time | < 30s | Run port cleanup |
| Port Conflicts | 0/day | Run aggressive cleanup |

---

## 📋 Daily Checklist

- [ ] **Morning**: Run port cleanup + health check (2 min)
- [ ] **Morning**: Start development with `./start.sh` (20 sec)
- [ ] **Optional**: Run memory monitor in background
- [ ] **During Day**: Monitor for warnings and alerts
- [ ] **During Day**: Do 1-2 quick health checks
- [ ] **Evening**: Stop dev server cleanly (Ctrl+C)
- [ ] **Optional**: Clean artifacts before next day

---

## 🎯 Weekly Maintenance (Run Every Sunday)

Every Sunday evening or Monday morning, run full cleanup:

```bash
# Full maintenance routine (3 minutes)
./scripts/aggressive-port-cleanup.sh     # 1 min
./scripts/docker-cleanup.sh              # 1 min
./scripts/cleanup-artifacts.sh           # 30 sec
./scripts/system-health-check.sh         # 10 sec
```

**Output:**
```
✅ Port cleanup complete
✅ Docker cleanup complete (freed 5.8GB)
✅ Artifact cleanup complete (freed 150MB)
✅ System ready for new week
```

---

## 📈 Weekly Metrics to Track

Maintain a simple log:

```
Week of Oct 27:
  Port conflicts: 0
  Freeze events: 0
  Startup time: 15-20s (avg)
  Memory baseline: 50%
  Disk usage: 29-35%
  Status: Healthy ✅

Week of Nov 3:
  Port conflicts: 0
  Freeze events: 0
  Startup time: 15-20s (avg)
  Memory baseline: 50%
  Disk usage: 30-35%
  Status: Healthy ✅
```

---

## 🚀 Performance Tips

### Fastest Startup
1. Run port cleanup first thing
2. Keep memory monitor running
3. This gives: 15-20 second startup

### Best Stability
1. Clean artifacts weekly
2. Monitor memory continuously
3. Restart backend if memory > 75%

### Longest Uptime
1. Keep memory < 60% baseline
2. Keep disk < 50% used
3. Restart dev server daily for fresh processes

---

## 💡 Quick Reference

### Most Used Commands
```bash
# Before starting
./scripts/aggressive-port-cleanup.sh && ./start.sh

# If slow
./scripts/monitor-memory.sh

# Weekly
./scripts/docker-cleanup.sh

# Full check
./scripts/system-health-check.sh
```

### Time Budget
- Morning routine: 2 minutes
- During day: 5-10 minutes (health checks)
- Evening: 1-2 minutes (optional cleanup)
- Weekly: 3 minutes (full cleanup)

### Health Targets
- Disk: < 50%
- Memory: < 60% idle, < 75% dev
- Startup: < 20s
- Ports: Always clean
- Freezes: 0/week

---

## ✨ Summary

By following this daily workflow, you'll have:
- ✅ Fast startup (15-20 seconds)
- ✅ Stable memory (no leaks)
- ✅ Clean ports (no conflicts)
- ✅ Healthy disk space
- ✅ Zero freeze events

**Time investment**: ~5 minutes per day = 99% fewer issues!
