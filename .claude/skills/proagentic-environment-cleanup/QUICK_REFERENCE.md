# ProAgentic Environment Cleanup - Quick Reference

**One-page guide for fast cleanup operations**

---

## 🚀 Most Common Scenarios

### Scenario 1: App Won't Start (Port Error)
```bash
User: "My app won't start with a port error"

Skill runs:
./scripts/aggressive-port-cleanup.sh
./start.sh  # Should work now
```

### Scenario 2: System Feeling Slow
```bash
User: "The system is feeling slow"

Skill runs:
./scripts/monitor-memory.sh    # Check memory (Ctrl+C to stop)
./scripts/docker-cleanup.sh    # Free disk space
./scripts/system-health-check.sh  # Show status
```

### Scenario 3: Disk Space Running Out
```bash
User: "Disk is getting full"

Skill runs:
./scripts/docker-cleanup.sh        # Clean Docker (5.8GB freed)
./scripts/cleanup-artifacts.sh     # Clean test artifacts (150MB)
df -h  # Verify space freed
```

### Scenario 4: Weekly Maintenance
```bash
User: "Run my weekly cleanup"

Skill runs:
./scripts/aggressive-port-cleanup.sh
./scripts/docker-cleanup.sh
./scripts/cleanup-artifacts.sh
./scripts/system-health-check.sh
```

---

## 🔧 Individual Scripts

### Port Cleanup
```bash
./scripts/aggressive-port-cleanup.sh
# Fixes: Port conflicts, EADDRINUSE errors
# Time: ~10 seconds
# Safe: Yes, kills only stale processes
```

### Docker Cleanup
```bash
./scripts/docker-cleanup.sh
# Fixes: Disk space, slow I/O
# Frees: 5-8GB of disk space
# Time: ~1 minute
# Safe: Yes, can rebuild images
```

### Memory Monitor
```bash
./scripts/monitor-memory.sh
# Shows: Real-time memory usage with warnings
# Warns at: 75% usage, critical at 85%
# Exit: Press Ctrl+C to stop
```

### Artifact Cleanup
```bash
./scripts/cleanup-artifacts.sh
# Removes: Coverage, test results, screenshots, logs
# Frees: 150-200MB
# Time: ~30 seconds
# Safe: Yes, can re-run tests
```

### Health Check
```bash
./scripts/system-health-check.sh
# Shows: Disk, memory, ports, Docker, processes
# Time: ~5 seconds
# No cleanup: Just diagnostics
```

---

## 📊 Expected Results

| Operation | Time | Space Freed | Startup Time |
|-----------|------|-------------|--------------|
| Port cleanup | 10s | - | -30s |
| Docker cleanup | 1m | 5.8GB | - |
| Artifact cleanup | 30s | 150MB | -2s |
| Memory monitor | 5s/sample | - | - |
| Health check | 5s | - | - |
| **Full cleanup** | **2m** | **~6GB** | **-40s** |

---

## 🚦 Health Status Guide

### ✅ GREEN (All Good)
- Disk: < 50%
- Memory: < 60%
- Startup: < 30 seconds
- Port conflicts: 0/week

### 🟡 YELLOW (Monitor)
- Disk: 50-70%
- Memory: 60-75%
- Startup: 30-60 seconds
- Port conflicts: 1-5/week

**Action**: Run cleanup in next session

### 🔴 RED (Act Now)
- Disk: > 70%
- Memory: > 75%
- Startup: > 60 seconds
- Port conflicts: > 5/week

**Action**: Run cleanup immediately

---

## 🆘 Emergency Procedures

### Frozen System
```bash
# 1. Stop everything
pkill -f "node.*server"
pkill -f vite
systemctl stop docker

# 2. Full reset
wsl --shutdown
# Wait 30 seconds, WSL restarts automatically
```

### Port Stuck
```bash
# Method 1 (Preferred)
./scripts/aggressive-port-cleanup.sh

# Method 2 (If method 1 fails)
fuser -k 8080/tcp
fuser -k 5173/tcp
```

### Out of Disk Space
```bash
# Immediate action
./scripts/docker-cleanup.sh    # ~5.8GB
./scripts/cleanup-artifacts.sh # ~150MB
# If still low:
rm -rf ./dist ./build
```

---

## 📋 Command Checklist

- [ ] Run: `./scripts/aggressive-port-cleanup.sh`
- [ ] Run: `./scripts/docker-cleanup.sh`
- [ ] Run: `./scripts/cleanup-artifacts.sh`
- [ ] Verify: `./scripts/system-health-check.sh`
- [ ] Test: `./start.sh` (should start in < 20 seconds)

---

## ⚡ Performance Tips

1. **Fastest startup**: Run port cleanup before `./start.sh`
2. **Best diagnostics**: Run health check weekly
3. **Most space saved**: Run Docker cleanup (5.8GB)
4. **Memory safe**: Monitor every development session
5. **Least time**: Skip artifact cleanup if disk > 50%

---

## 🎯 When to Run Each Script

| Script | Before Dev | Weekly | Before Deploy | When Slow |
|--------|-----------|--------|---------------|-----------|
| Port cleanup | ✅ | ✅ | ✅ | ✅ |
| Docker cleanup | - | ✅ | ✅ | ✅ |
| Memory monitor | - | - | - | ✅ |
| Artifact cleanup | - | ✅ | ✅ | - |
| Health check | ✅ | ✅ | - | ✅ |

---

## 💾 What Gets Cleaned

### SAFE TO DELETE (Will Be Cleaned)
- coverage/ (116MB)
- test-results/
- .playwright/
- *-screenshots/
- *.log files
- Old Docker images
- Dangling volumes

### PROTECTED (Never Touched)
- src/
- server/
- tests/
- .env
- package.json
- .git/

---

## 🔗 File Locations

| File | Purpose | Run Command |
|------|---------|-------------|
| aggressive-port-cleanup.sh | Kill stale processes | `./scripts/aggressive-port-cleanup.sh` |
| docker-cleanup.sh | Remove unused Docker | `./scripts/docker-cleanup.sh` |
| monitor-memory.sh | Watch memory live | `./scripts/monitor-memory.sh` |
| cleanup-artifacts.sh | Remove test artifacts | `./scripts/cleanup-artifacts.sh` |
| system-health-check.sh | Show diagnostics | `./scripts/system-health-check.sh` |

---

## 📞 Troubleshooting

| Problem | Command |
|---------|---------|
| Port still in use | `./scripts/aggressive-port-cleanup.sh` |
| Disk full | `./scripts/docker-cleanup.sh` |
| App slow | `./scripts/monitor-memory.sh` then `./scripts/system-health-check.sh` |
| System frozen | `wsl --shutdown` |
| Docker broken | `docker system prune -a --force` |

---

## 🎓 Key Metrics to Remember

- **Healthy disk**: < 50%
- **Healthy memory**: < 60% idle, < 75% during dev
- **Fast startup**: < 20 seconds
- **Port cleanup frees**: ~2-3 seconds per startup
- **Docker cleanup frees**: ~5.8GB disk space
- **Artifact cleanup frees**: ~150MB disk space

---

**For detailed info**: See README.md or SKILL.md
**For examples**: See USAGE_EXAMPLES.md
**For verification**: See CHECKLIST.md
