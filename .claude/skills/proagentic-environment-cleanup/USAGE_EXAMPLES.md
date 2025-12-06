# ProAgentic Environment Cleanup - Real-World Usage Examples

Practical scenarios showing how to use the cleanup skill in daily development.

---

## Scenario 1: Morning Startup (Most Common)

**Situation**: You start your development day and want to ensure clean environment

**What You Do:**
```bash
# You arrive and want to start coding
User: "Start my development session"

# Or more specific:
User: "Clean up and start development"
```

**What The Skill Does:**
```
1. Aggressive port cleanup (checks ports 5173, 8080)
2. Health check (verify system ready)
3. Show results
4. Ready for ./start.sh
```

**Output:**
```
✅ ProAgentic Environment Cleanup

🔍 Step 1: Checking ports...
  ✅ Port 5173 (Vite) - CLEAN
  ✅ Port 8080 (Backend) - CLEAN

📊 Step 2: System health check...
  ✅ Disk: 35% (healthy)
  ✅ Memory: 50% (healthy)
  ✅ Docker: Running (healthy)

✅ Environment ready!

Next: Run ./start.sh
Expected startup: 15-20 seconds
```

**Then You Run:**
```bash
./start.sh
```

---

## Scenario 2: Port Conflict Error

**Situation**: You try to start the app but get a port error

**What You See:**
```
$ npm run dev
...
Error: listen EADDRINUSE: address already in use :::8080
```

**What You Do:**
```bash
User: "I'm getting a port conflict error, fix it"

# Or:
User: "Port 8080 is already in use"
```

**What The Skill Does:**
```
1. Aggressive port cleanup (primary focus)
   - Scans port 8080 and 5173
   - Finds stale Node process from previous session
   - Kills the process gracefully
   - Verifies port is free

2. Health check confirmation
   - Confirms ports now clean
   - Shows system ready

3. Guides next steps
```

**Output:**
```
🔍 Aggressive Port Cleanup Starting...

🔎 Cleaning port 8080 (Backend)...
  Found processes: [2451, 2452]
  Killed: PID 2451 ✅
  Killed: PID 2452 ✅
  ✅ Port 8080 is now clean

🔎 Cleaning port 5173 (Frontend)...
  ✅ No processes found
  ✅ Port 5173 is now clean

✅ Port cleanup complete!

📊 System Health:
  ✅ Ports: All clean
  ✅ Ready to start app

Next: Run ./start.sh
```

**Then You Run:**
```bash
./start.sh  # Should work this time!
```

---

## Scenario 3: System Feeling Slow

**Situation**: During development, app becomes sluggish and unresponsive

**What You Do:**
```bash
User: "The app is feeling slow, what's wrong?"

# Or more specific:
User: "Monitor memory and check system health"
```

**What The Skill Does:**
```
1. Starts memory monitor in real-time
2. Shows which processes consume memory
3. Identifies if memory is the issue
4. Suggests next action
```

**Output (Real-time Monitor):**
```
📊 ProAgentic Memory Monitor
==================================
Sampling every 5 seconds
⚠️  Warning threshold: 75%

Timestamp: 2025-10-27 13:45:23

📈 Memory Usage:
  Total: 10GB
  Used:  7.2GB  ⚠️  WARNING
  Free:  2.8GB
  Usage: 72%

  [████████████████░░░░]  72%

⚠️  WARNING: Memory usage at 72%

🔍 Top Memory Consumers (by %):
   35% - node (Backend server - 3.6GB) ⚠️
   12% - Claude CLI
    8% - VSCode server
    5% - Playwright test runner

💡 Tips:
  - Backend is consuming too much memory
  - Consider: Stop heavy tests, restart dev server
  - Press Ctrl+C to exit monitor
```

**You Then Do:**
```bash
# Option 1: Restart the backend server
# (kill node, let it restart, memory resets)

# Option 2: Stop tests
# (if tests are running, they use lots of memory)

# Option 3: Close VSCode extensions
# (language servers can be memory-hungry)
```

---

## Scenario 4: Disk Running Low

**Situation**: System is running out of disk space

**What You See:**
```
Disk usage: 95%
Warning: Only 50GB free
```

**What You Do:**
```bash
User: "Free up disk space"

# Or:
User: "Disk is almost full, clean it up"
```

**What The Skill Does:**
```
1. Check what's taking space
2. Docker cleanup (largest impact)
3. Test artifact cleanup
4. Report space freed
```

**Output:**
```
🐳 Docker Cleanup - Saving Disk Space

📊 Current Docker Disk Usage:
  Images:   8.8GB (11 images)
  Volumes:  500MB (unused)
  Cache:    200MB

🗑️  Cleaning unused Docker images...
  Removing: gcr.io/novae-compare/proagentic-server:old-v1
  Removing: gcr.io/novae-compare/proagentic-server:old-v2
  Removing dangling images (3.2GB)...

📊 Final Docker Disk Usage:
  Images:   3.0GB (3 images)
  Volumes:  0B (all cleaned)
  Cache:    0B

✅ Docker cleanup complete!
📈 Space freed: 5.8GB

🧹 Cleaning test artifacts...
  Removing: coverage/ (116MB)
  Removing: test-results/ (3.3MB)
  Removing: *-screenshots/ (45MB)

✅ Artifact cleanup complete!
📈 Space freed: 150MB

💾 Total Space Freed: 5.95GB

📊 Disk Status After Cleanup:
  Before: 950GB used (95%)
  After:  890GB used (88%)
  Target: < 80% for healthy system

✅ System now has breathing room!
```

**Results:**
```bash
df -h  # Shows ~6GB freed!
```

---

## Scenario 5: Weekly Maintenance

**Situation**: Every Sunday evening, you want to optimize the system

**What You Do:**
```bash
User: "Run my weekly cleanup and optimization"

# Or:
User: "Maintenance day - optimize everything"
```

**What The Skill Does:**
```
1. Aggressive port cleanup
2. Docker cleanup
3. Test artifact cleanup
4. System health check
5. Complete before/after report
```

**Output:**
```
🚀 ProAgentic Weekly Maintenance Starting...

⏱️  This will take ~3 minutes

STEP 1: Port Cleanup (30 seconds)
═══════════════════════════════════
  ✅ Port 5173 - clean
  ✅ Port 8080 - clean
  ✅ All stale processes removed

STEP 2: Docker Cleanup (60 seconds)
════════════════════════════════════
  🗑️  Removing 8 old images
  🗑️  Removing 4 unused volumes
  🗑️  Cleaning build cache
  📈 Space freed: 5.8GB

STEP 3: Artifact Cleanup (30 seconds)
══════════════════════════════════════
  🗑️  Removing coverage/ (116MB)
  🗑️  Removing test results (3.3MB)
  🗑️  Removing screenshots (45MB)
  📈 Space freed: 150MB

STEP 4: System Health Check (10 seconds)
═════════════════════════════════════════
  ✅ Disk: 29% (was 35%)
  ✅ Memory: 50% baseline
  ✅ Ports: Clean
  ✅ Docker: 3 images, 3.0GB
  ✅ WSL: 16 cores, 10GB RAM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 BEFORE vs AFTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Disk Usage:
  Before: 326GB (35%)
  After:  270GB (29%)
  Saved:  56GB ✅

Docker Images:
  Before: 11 images (8.8GB)
  After:  3 images (3.0GB)
  Saved:  5.8GB ✅

Test Artifacts:
  Before: 150MB
  After:  0MB
  Saved:  150MB ✅

Startup Performance:
  Before: 30-60 seconds
  After:  15-20 seconds
  Improved: 50% faster ✅

System Responsiveness:
  Before: Occasional slowness
  After:  Smooth and fast ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ MAINTENANCE COMPLETE

Next week: Same time, same cleanup
Estimated benefit: 99% fewer freeze events
```

---

## Scenario 6: Before Deployment

**Situation**: You're about to deploy to production and want clean state

**What You Do:**
```bash
User: "Prepare for deployment"

# Or:
User: "Clean up before deploying"
```

**What The Skill Does:**
```
1. Docker cleanup (remove old images that won't be deployed)
2. Test artifact cleanup (remove coverage and test files)
3. System health verification
4. Final go/no-go check
```

**Output:**
```
🚀 ProAgentic Pre-Deployment Cleanup

Step 1: Docker Cleanup
═════════════════════════════════════
  🗑️  Removing old builds and unused images
  ✅ Keeping production images:
     - gcr.io/novae-compare/proagentic-server:latest
     - node:22-alpine
     - public.ecr.aws/supabase/postgres

  📈 Space freed: 5.8GB

Step 2: Test Artifact Cleanup
═════════════════════════════════════
  🗑️  Removing coverage/
  🗑️  Removing test-results/
  🗑️  Removing e2e-screenshots/
  ✅ Removing anything test-related

  📈 Space freed: 150MB

Step 3: Final Health Check
═════════════════════════════════════
  ✅ Disk: 29% - healthy for deployment
  ✅ Build tools ready
  ✅ Docker daemon running
  ✅ All ports clean

Step 4: Deployment Readiness
═════════════════════════════════════
  ✅ Code: Ready to build
  ✅ Dependencies: npm install completed
  ✅ Docker: Clean slate
  ✅ System: Optimal performance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ READY FOR DEPLOYMENT

Next: npm run build:production
Then:  ./deploy.sh
```

---

## Scenario 7: Emergency Recovery

**Situation**: System is completely frozen, nothing works

**What You Do:**
```bash
User: "System is frozen, emergency recovery"

# Or practically:
# Kill your development in progress
# All windows frozen
```

**What The Skill Does:**
```
1. Attempts graceful shutdown
2. Kills stale processes
3. Cleans Docker
4. Full WSL reset if needed
```

**Output:**
```
🆘 Emergency System Recovery

WARNING: System appears to be frozen

Step 1: Graceful Shutdown Attempt
═════════════════════════════════════
  🛑 Stopping Node processes...
  🛑 Stopping Vite...
  🛑 Stopping Docker...
  ⏱️  Waiting for graceful shutdown... (30s)

Step 2: Force Cleanup
═════════════════════════════════════
  💥 Force killing remaining processes...
  ✅ Cleared 24 stale processes

Step 3: System Reset
═════════════════════════════════════
  🔄 Dropping filesystem caches...
  🔄 Stopping Docker daemon...
  ✅ System reset complete

Step 4: Recovery Status
═════════════════════════════════════
  ✅ Processes: Cleared
  ✅ Disk: Accessible
  ✅ Memory: Reset
  ✅ Ports: Clean

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  FINAL STEP: WSL Full Reset

If system is STILL frozen:
  wsl --shutdown
  # Wait 30 seconds
  # WSL restarts automatically

After restart:
  ./scripts/system-health-check.sh
  ./start.sh
```

---

## Scenario 8: Before Git Commit

**Situation**: You're about to commit your changes

**What You Do:**
```bash
User: "I'm ready to commit, clean up first"

# Or:
User: "Before I push, optimize everything"
```

**What The Skill Does:**
```
1. Port cleanup (ensure clean state)
2. Artifact cleanup (remove test files)
3. Health check (verify system ready)
4. Ready for git commit
```

**Output:**
```
✅ Pre-Commit Cleanup

Step 1: Environment Cleanup
═════════════════════════════════════
  ✅ Ports cleaned
  ✅ Test artifacts removed
  ✅ Coverage cleaned
  ✅ Logs archived

Step 2: System Verification
═════════════════════════════════════
  ✅ Disk: Healthy (35%)
  ✅ Memory: Normal (50%)
  ✅ Git status: Ready for commit

Step 3: What You're Committing
═════════════════════════════════════
  Only source code, no artifacts:
  ✅ src/ changes
  ✅ server/ changes
  ✅ tests/ changes
  ❌ coverage/ (cleaned)
  ❌ test-results/ (cleaned)
  ❌ *.log (cleaned)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ READY FOR COMMIT

Next:
  git add .
  git commit -m "your message"
  git push
```

---

## Scenario 9: Continuous Monitoring

**Situation**: Long development session, want to catch issues early

**What You Do:**
```bash
# Terminal 1: Your development work
./start.sh

# Terminal 2: Background monitoring
./scripts/monitor-memory.sh

# Terminal 3: Regular health checks (manual)
./scripts/system-health-check.sh
```

**Output (Memory Monitor - Real-Time):**
```
📊 ProAgentic Memory Monitor
==================================
Sampling every 5 seconds
⚠️  Warning threshold: 75%

Iteration 1 - Timestamp: 13:45:00
  Memory: 50% [█████████░░░░░░░░░░░] ✅ NORMAL

Iteration 2 - Timestamp: 13:45:05
  Memory: 55% [███████████░░░░░░░░░] ✅ NORMAL

Iteration 3 - Timestamp: 13:45:10
  Memory: 60% [██████████████░░░░░░] ✅ NORMAL

... working normally ...

Iteration 24 - Timestamp: 14:00:00
  Memory: 72% [████████████████░░░░] ⚠️  WARNING
  Top process: Backend (4GB)
  Recommendation: Restart backend or stop tests

Iteration 25 - Timestamp: 14:00:05
  Memory: 74% [██████████████████░░] ⚠️  WARNING - NEAR LIMIT
  Action: You restart backend
  Memory: 55% [███████████░░░░░░░░░] ✅ NORMAL

... back to normal ...
```

---

## Summary: When to Use What

| Situation | Command | Time |
|-----------|---------|------|
| Morning startup | aggressive-port-cleanup | 10s |
| App won't start | aggressive-port-cleanup | 10s |
| System slow | monitor-memory | Real-time |
| Disk low | docker-cleanup | 60s |
| Need diagnostics | system-health-check | 5s |
| Weekly maintenance | All scripts | 3m |
| Before deploy | docker-cleanup + artifacts | 2m |
| Emergency | Emergency recovery steps | 1m |

---

**For more details**: See README.md or SKILL.md
**For quick lookup**: See QUICK_REFERENCE.md
**For verification**: See CHECKLIST.md
