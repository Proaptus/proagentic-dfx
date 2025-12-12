---
id: INFRA-SUMMARY-2025-12-12
doc_type: runbook
title: 'Infrastructure Tasks Summary - Quick Reference'
version: 1.0.0
date: 2025-12-12
owner: '@h2-tank-team'
status: draft
---

# INFRASTRUCTURE TASKS SUMMARY

## Quick Reference - MVP Scope

**Generated**: 2025-12-12
**Full Details**: See INFRASTRUCTURE_TASKS_CLARIFIED.md

---

## UPDATED TASKS

### BACK-001: Database Schema & Migrations

**MVP Scope**: SQLite + Prisma (NOT PostgreSQL)

**Key Decisions**:

- ✅ SQLite acceptable for single-user competition demo
- ✅ Prisma ORM for TypeScript type safety
- ✅ 4 core tables: designs, optimization_jobs, materials, standards
- ❌ NO users/sessions tables (single user mode)

**Acceptance Criteria**:

- Materials seeded (30+ entries)
- Standards seeded (4 entries: ISO, UN, EC, SAE)
- Prisma client can query database
- Design creation works

**Effort**: 20 hours

---

### BACK-002: Authentication Service

**MVP Scope**: Environment variable credentials + JWT

**Key Decisions**:

- ✅ Single username/password in .env (no database users)
- ✅ JWT tokens in HTTP-only cookies
- ✅ 24-hour session timeout
- ❌ NO registration, password reset, or multi-user

**Deliverables**:

- `POST /api/auth/login` - Credential validation
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/session` - Session check
- Middleware for protected routes

**Acceptance Criteria**:

- Valid credentials grant access
- Invalid credentials rejected
- Protected routes require auth
- Session expires after 24h

**Effort**: 12 hours

---

### BACK-004: File Storage Service

**MVP Scope**: Local filesystem with limits

**Key Decisions**:

- ✅ Local FS storage (NOT cloud)
- ✅ 1GB total quota, 50MB max file size
- ✅ 7-day auto-cleanup for temp files
- ✅ Path traversal security
- ❌ NO GCS/S3 (abstraction ready for future)

**Deliverables**:

- StorageAdapter interface
- LocalStorageAdapter implementation
- Temp file cleanup job
- Storage health monitoring

**Acceptance Criteria**:

- Write and read files work
- Path traversal prevented
- Storage quota enforced
- Old files cleaned up automatically

**Effort**: 8 hours

---

## NEW TASKS

### BACK-106: Minimal Login Page

**MVP Scope**: Simple authentication UI

**Deliverables**:

- `/login` route with username/password form
- "Remember me" checkbox (7-day session)
- Logout button in app header
- Protected route wrapper

**Acceptance Criteria**:

- Successful login redirects to dashboard
- Invalid credentials show error
- Remember me extends session
- Logout clears session

**Effort**: 6 hours

---

### BACK-107: Health Check Endpoints

**MVP Scope**: Monitoring and CI/CD support

**Deliverables**:

- `GET /api/health` - Basic liveness (no auth)
- `GET /api/health/deep` - Full health check (auth required)
- `GET /api/health/ready` - Readiness check (Kubernetes-style)

**Health Checks**:

- Database connectivity
- Filesystem writable
- LLM API reachable
- Storage quota status

**Acceptance Criteria**:

- Basic health always responds
- Deep health requires auth
- Detects database failure
- Readiness waits for startup

**Effort**: 4 hours

---

### BACK-108: Configuration Management

**MVP Scope**: Environment variable schema and validation

**Deliverables**:

- Zod schema for all env vars
- `.env.example` template
- Startup validation
- Runtime config API (admin only)

**Environment Variables**:

```bash
# Server
NODE_ENV, PORT

# Database
DATABASE_URL

# Auth
ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET

# LLM
ANTHROPIC_API_KEY, OPENAI_API_KEY (optional)

# Storage
STORAGE_PATH, STORAGE_QUOTA_GB, TEMP_FILE_RETENTION_DAYS

# Features
ENABLE_OPTIMIZATION, ENABLE_EXPORT

# Optional
SENTRY_DSN, LOG_LEVEL
```

**Acceptance Criteria**:

- Startup fails with missing vars
- Invalid values rejected
- Config API returns safe values (no secrets)
- Runtime updates work

**Effort**: 4 hours

---

## MVP IN vs OUT

### IN SCOPE (MVP)

| Feature        | Implementation           |
| -------------- | ------------------------ |
| Database       | SQLite with Prisma       |
| Authentication | Single-user env var      |
| Sessions       | JWT in HTTP-only cookies |
| File Storage   | Local FS with quota      |
| Login UI       | Simple form              |
| Health Checks  | Basic + deep             |
| Configuration  | Env var validation       |

### OUT OF SCOPE (Future)

| Feature             | Reason                            |
| ------------------- | --------------------------------- |
| PostgreSQL          | SQLite sufficient for single user |
| User registration   | Single user mode                  |
| Password reset      | Environment variable credentials  |
| Cloud storage       | Local FS + abstraction ready      |
| OAuth/SSO           | Not needed for competition        |
| Multi-tenancy       | Single user deployment            |
| Advanced monitoring | Production ops phase              |

---

## EFFORT & TIMELINE

| Task                | Hours   | Dependencies |
| ------------------- | ------- | ------------ |
| BACK-108 (Config)   | 4h      | None         |
| BACK-001 (Database) | 20h     | BACK-108     |
| BACK-107 (Health)   | 4h      | BACK-001     |
| BACK-002 (Auth)     | 12h     | BACK-001     |
| BACK-106 (Login UI) | 6h      | BACK-002     |
| BACK-004 (Storage)  | 8h      | BACK-108     |
| **TOTAL**           | **54h** |              |

**Timeline**: 1.5 weeks with 2 developers

---

## IMPLEMENTATION ORDER

**Day 1-2** (8h):

1. BACK-108 (Config) - 4h
2. Start BACK-001 (Database) - 4h

**Day 3-5** (20h): 3. Complete BACK-001 (Database) - 16h 4. BACK-107 (Health) - 4h

**Day 6-7** (12h): 5. BACK-002 (Auth) - 12h

**Day 8** (6h): 6. BACK-106 (Login UI) - 6h

**Day 9-10** (8h): 7. BACK-004 (Storage) - 8h

**Day 11** (10h): 8. Integration testing

---

## VALIDATION CHECKLIST

Before marking Phase 1 complete:

**Database (BACK-001)**:

- [ ] Prisma schema created
- [ ] Materials seeded (30+ entries)
- [ ] Standards seeded (4 entries)
- [ ] Database queries work

**Authentication (BACK-002)**:

- [ ] Login endpoint works
- [ ] Logout endpoint works
- [ ] Session validation works
- [ ] Protected routes require auth

**File Storage (BACK-004)**:

- [ ] File write/read works
- [ ] Path traversal prevented
- [ ] Quota enforced
- [ ] Cleanup job runs

**Login UI (BACK-106)**:

- [ ] Login page accessible
- [ ] Form validates input
- [ ] Successful login redirects
- [ ] Logout button works

**Health Checks (BACK-107)**:

- [ ] Basic health responds
- [ ] Deep health checks database
- [ ] Readiness check works
- [ ] Used in CI pipeline

**Configuration (BACK-108)**:

- [ ] .env.example complete
- [ ] Startup validation works
- [ ] Config API returns safe values
- [ ] Runtime updates work

**Integration**:

- [ ] E2E test: Login → Dashboard → Logout
- [ ] Unit tests ≥80% coverage
- [ ] Health check in CI pipeline
- [ ] Documentation complete

---

## QUICK START

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your values

# 2. Initialize database
npx prisma migrate dev --name init
npx prisma db seed

# 3. Start server
npm run dev

# 4. Verify health
curl http://localhost:3001/api/health

# 5. Login
# Navigate to http://localhost:3000/login
# Username: judge (from .env)
# Password: h2tank2025 (from .env)
```

---

## RELATED DOCUMENTS

- **Full Details**: INFRASTRUCTURE_TASKS_CLARIFIED.md
- **Parent Backlog**: BACKEND_DEVELOPMENT_BACKLOG.md
- **Requirements**: RTM_AUDIT_2025-12-11.md
- **Architecture**: BACKEND_SPECIFICATION.md

---

_Generated by ProSWARM Neural Orchestration - 2025-12-12_
