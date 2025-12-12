---
id: INFRA-CLARIFIED-2025-12-12
doc_type: runbook
title: 'Infrastructure Tasks Clarified - MVP Scope'
version: 1.0.0
date: 2025-12-12
owner: '@h2-tank-team'
status: draft
last_verified_at: 2025-12-12
supersedes: []
keywords: ['infrastructure', 'backend', 'mvp', 'authentication', 'database', 'storage']
sources_of_truth: ['BACKEND_DEVELOPMENT_BACKLOG', 'RTM_AUDIT_2025-12-11']
---

# INFRASTRUCTURE TASKS CLARIFIED

## MVP Scope with Explicit Acceptance Criteria

**Generated**: 2025-12-12
**Purpose**: Clarify existing BACK-001, BACK-002, BACK-004 and define new BACK-106, BACK-107, BACK-108 with MVP-appropriate scope

---

## EXECUTIVE SUMMARY

This document expands infrastructure tasks from the Backend Development Backlog with:

- **Explicit MVP vs Future scope boundaries**
- **Clear acceptance criteria for each task**
- **Single-user vs multi-user clarification**
- **Competition demo requirements**

### Updated Tasks Summary

| Task ID  | Title                        | Priority | Complexity | MVP Scope            |
| -------- | ---------------------------- | -------- | ---------- | -------------------- |
| BACK-001 | Database Schema & Migrations | P1       | L          | SQLite for MVP       |
| BACK-002 | Authentication Service       | P1       | M          | Single-user env vars |
| BACK-004 | File Storage Service         | P1       | S          | Local FS with limits |
| BACK-106 | Minimal Login Page           | P1       | S          | NEW - Simple form    |
| BACK-107 | Health Check Endpoints       | P1       | S          | NEW - Monitoring     |
| BACK-108 | Configuration Management     | P1       | S          | NEW - Env validation |

---

## UPDATED TASKS

### BACK-001: Database Schema & Migrations (ENHANCED)

**Priority**: P1 Critical
**Complexity**: L (Large)
**Requirements**: Infrastructure
**Dependencies**: None

**ORIGINAL SCOPE**: "PostgreSQL database schema for storing designs, optimization jobs, analysis results, and user sessions"

**MVP SCOPE CLARIFICATION**:

#### Database Technology Decision

| Option     | MVP            | Production | Rationale                            |
| ---------- | -------------- | ---------- | ------------------------------------ |
| **SQLite** | ✅ RECOMMENDED | ❌         | Single-user, zero config, file-based |
| PostgreSQL | ⚠️ ACCEPTABLE  | ✅         | Multi-user ready, more complex setup |

**MVP Decision**: SQLite is ACCEPTABLE for competition demo with single judge/evaluator. PostgreSQL setup adds deployment complexity without demo value.

#### Schema Design (MVP vs Future)

**Tables Required (MVP)**:

```sql
-- Core tables (MVP ONLY)
CREATE TABLE designs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  geometry_json TEXT NOT NULL,  -- JSONB in future
  analysis_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE optimization_jobs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  config_json TEXT NOT NULL,
  results_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

CREATE TABLE materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  properties_json TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE standards (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  version TEXT,
  clauses_json TEXT
);
```

**Tables DEFERRED (Future Multi-User)**:

```sql
-- NOT IN MVP
CREATE TABLE users (...);      -- Single user = no users table
CREATE TABLE sessions (...);   -- Environment credentials = no sessions
CREATE TABLE projects (...);   -- Single active project = no projects table
```

#### Migration Tooling

| Tool    | MVP                | Production | Notes                                  |
| ------- | ------------------ | ---------- | -------------------------------------- |
| Prisma  | ✅ RECOMMENDED     | ✅         | TypeScript-native, migrations built-in |
| Drizzle | ⚠️ ACCEPTABLE      | ✅         | Lighter, SQL-first                     |
| Raw SQL | ❌ NOT RECOMMENDED | ❌         | No type safety                         |

**MVP Decision**: Prisma for TypeScript type generation and automatic migrations.

#### Deliverables (MVP)

- [ ] Prisma schema file (`prisma/schema.prisma`)
- [ ] Initial migration script
- [ ] Seed script for materials database (30+ materials from mock server)
- [ ] Seed script for standards database (ISO 11119-3, UN R134, EC 79/2009, SAE J2579)
- [ ] Database connection pooling (even SQLite benefits from connection reuse)
- [ ] `.env.example` with `DATABASE_URL` template

#### Acceptance Criteria (MVP)

```typescript
// AC-001: Prisma client can connect and query
const design = await prisma.design.findUnique({ where: { id: 'test-id' } });
// ✅ PASS if no error

// AC-002: Materials seeded correctly
const materials = await prisma.material.findMany();
// ✅ PASS if count >= 30

// AC-003: Standards seeded correctly
const standards = await prisma.standard.findMany();
// ✅ PASS if count >= 4 (ISO, UN, EC, SAE)

// AC-004: Design creation works
const newDesign = await prisma.design.create({
  data: {
    id: 'test-design-001',
    name: 'Test Tank',
    geometry_json: JSON.stringify({ ... }),
    analysis_json: JSON.stringify({ ... })
  }
});
// ✅ PASS if newDesign.id === 'test-design-001'
```

#### Backup/Restore (MVP)

```bash
# Simple file copy for SQLite
cp ./prisma/dev.db ./backups/dev-backup-$(date +%Y%m%d).db

# Restore
cp ./backups/dev-backup-20250212.db ./prisma/dev.db
```

**Future (PostgreSQL)**: pg_dump/pg_restore

#### What's OUT OF SCOPE (MVP)

- ❌ User authentication tables (see BACK-106)
- ❌ Multi-tenancy support
- ❌ Read replicas
- ❌ Database sharding
- ❌ Advanced indexing strategies (B-tree indexes sufficient)
- ❌ Database monitoring/alerting
- ❌ Automated backups (manual copy acceptable)

---

### BACK-002: Authentication Service (ENHANCED)

**Priority**: P1 Critical
**Complexity**: M (Medium)
**Requirements**: Infrastructure, Security
**Dependencies**: BACK-001 (for session storage if needed)

**ORIGINAL SCOPE**: "Basic authentication with session management. Single-user mode acceptable for MVP, but architecture should support multi-user."

**MVP SCOPE CLARIFICATION**:

#### Authentication Strategy (Competition Demo)

**CONTEXT**: Competition demo to single judge or small panel. Multi-user authentication is NOT a scoring criterion.

**MVP Decision**: Environment variable credentials (NO database users table)

#### Implementation Approach

```typescript
// .env
ADMIN_USERNAME=judge
ADMIN_PASSWORD=h2tank2025  # Change before demo!
SESSION_SECRET=random-secret-here

// auth/service.ts
export function validateCredentials(username: string, password: string): boolean {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

export function generateSessionToken(): string {
  return crypto.randomUUID(); // Simple token generation
}
```

#### Session Management (MVP)

**Options**:

| Approach          | MVP            | Production | Notes                   |
| ----------------- | -------------- | ---------- | ----------------------- |
| JWT tokens        | ✅ RECOMMENDED | ✅         | Stateless, no DB needed |
| HTTP-only cookies | ✅ ACCEPTABLE  | ✅         | Simple, secure          |
| Database sessions | ❌ OVERKILL    | ✅         | Requires session table  |

**MVP Decision**: JWT tokens in HTTP-only cookies (best of both worlds)

```typescript
// auth/jwt.ts
import jwt from 'jsonwebtoken';

interface SessionPayload {
  username: string;
  loginTime: number;
}

export function createSessionToken(username: string): string {
  const payload: SessionPayload = {
    username,
    loginTime: Date.now(),
  };

  return jwt.sign(payload, process.env.SESSION_SECRET!, {
    expiresIn: '24h', // 24-hour timeout
  });
}

export function validateSessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, process.env.SESSION_SECRET!) as SessionPayload;
  } catch {
    return null;
  }
}
```

#### Deliverables (MVP)

- [ ] `POST /api/auth/login` - Credential validation
  - Input: `{ username: string, password: string }`
  - Output: `{ success: boolean, token?: string }`
  - Sets HTTP-only cookie with JWT

- [ ] `POST /api/auth/logout` - Session termination
  - Clears authentication cookie
  - No DB cleanup needed (stateless JWT)

- [ ] `GET /api/auth/session` - Session validation
  - Returns `{ valid: boolean, username?: string }`
  - Used by frontend to check auth status

- [ ] Middleware for protected routes
  - `requireAuth()` middleware
  - Checks JWT validity
  - Returns 401 if invalid/missing

- [ ] `.env.example` with auth configuration template

#### Acceptance Criteria (MVP)

```typescript
// AC-001: Valid credentials grant access
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  }),
});
const data = await response.json();
// ✅ PASS if data.success === true && data.token exists

// AC-002: Invalid credentials rejected
const response2 = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    username: 'wrong',
    password: 'wrong',
  }),
});
const data2 = await response2.json();
// ✅ PASS if data2.success === false

// AC-003: Protected routes require auth
const protectedResponse = await fetch('/api/designs');
// ✅ PASS if status === 401 (without auth cookie)

const authedResponse = await fetch('/api/designs', {
  headers: { Cookie: `auth=${validToken}` },
});
// ✅ PASS if status === 200

// AC-004: Session expires after 24 hours
// (Manual test - create token, wait 24h, verify rejection)
```

#### Security Features (MVP)

- ✅ HTTP-only cookies (XSS protection)
- ✅ Secure flag in production (HTTPS only)
- ✅ CSRF protection via SameSite=Strict
- ✅ 24-hour session timeout
- ✅ No password storage (env var only)
- ❌ Rate limiting (DEFER - see BACK-003)
- ❌ Account lockout (single user = not needed)
- ❌ Password reset (env var = change manually)
- ❌ Multi-factor auth (overkill for MVP)

#### What's OUT OF SCOPE (MVP)

- ❌ User registration
- ❌ Password reset flow
- ❌ Email verification
- ❌ OAuth/SSO integration
- ❌ Role-based access control (RBAC)
- ❌ Audit logging
- ❌ Session revocation (JWT = can't revoke until expiry)

---

### BACK-004: File Storage Service (ENHANCED)

**Priority**: P1 Critical
**Complexity**: S (Small)
**Requirements**: REQ-111 to REQ-120 (Export functionality)
**Dependencies**: None

**ORIGINAL SCOPE**: "Local file storage with abstraction layer for future cloud migration."

**MVP SCOPE CLARIFICATION**:

#### Storage Strategy

**CONTEXT**: Export files (STEP, PDF, CSV) generated during demo need temporary storage. No long-term archival needed for competition.

**MVP Decision**: Local filesystem with size limits and automatic cleanup

#### Storage Limits (MVP)

| Resource                   | MVP Limit | Rationale                  |
| -------------------------- | --------- | -------------------------- |
| **Max file size**          | 50 MB     | STEP files ~10MB, PDF ~5MB |
| **Storage quota per user** | 1 GB      | Single user = global limit |
| **Temp file retention**    | 7 days    | Auto-cleanup old exports   |
| **Max files per export**   | 20 files  | Reasonable package size    |

#### Directory Structure

```
storage/
├── temp/              # Temporary files (auto-cleanup)
│   ├── exports/       # Export packages
│   │   └── {job-id}/  # One folder per export job
│   └── uploads/       # Future: user uploads
├── persistent/        # Long-term storage (manual cleanup)
│   ├── materials/     # Seeded material data
│   └── standards/     # Standards PDFs (future)
└── .gitignore         # Exclude from version control
```

#### Abstraction Interface

```typescript
// storage/interface.ts
export interface StorageAdapter {
  write(path: string, data: Buffer | string): Promise<void>;
  read(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  list(prefix: string): Promise<string[]>;
  getSize(path: string): Promise<number>;
}

// storage/local.ts
export class LocalStorageAdapter implements StorageAdapter {
  constructor(private basePath: string) {}

  async write(path: string, data: Buffer | string): Promise<void> {
    const fullPath = this.resolvePath(path);
    await fs.promises.writeFile(fullPath, data);
  }

  private resolvePath(path: string): string {
    // Security: prevent path traversal
    const normalized = path.replace(/\.\./g, '');
    return join(this.basePath, normalized);
  }

  // ... other methods
}

// storage/cloud.ts (FUTURE)
export class GCSStorageAdapter implements StorageAdapter {
  // Cloud implementation for future
}
```

#### Deliverables (MVP)

- [ ] `StorageAdapter` interface definition
- [ ] `LocalStorageAdapter` implementation
- [ ] File path security (prevent traversal attacks)
- [ ] Storage quota enforcement
- [ ] Temp file cleanup job (runs on startup, checks every 24h)
- [ ] `GET /api/storage/stats` - Storage usage endpoint
- [ ] `.env.example` with storage configuration

#### Acceptance Criteria (MVP)

```typescript
// AC-001: Write and read files
const storage = new LocalStorageAdapter('./storage/temp');
await storage.write('exports/test-001/design.step', stepFileData);
const retrieved = await storage.read('exports/test-001/design.step');
// ✅ PASS if retrieved.equals(stepFileData)

// AC-002: Path traversal prevented
await storage.write('../../../etc/passwd', 'hack');
// ✅ PASS if file written to storage/temp/etc/passwd (sanitized path)

// AC-003: Storage quota enforced
// Write 1.1 GB of data
// ✅ PASS if last write throws "Quota exceeded" error

// AC-004: Old files cleaned up
// Create file with mtime = 8 days ago
await storage.write('exports/old/file.pdf', 'data');
await runCleanupJob();
const exists = await storage.exists('exports/old/file.pdf');
// ✅ PASS if exists === false
```

#### Storage Health Monitoring

```typescript
// storage/health.ts
export interface StorageHealth {
  total_space_bytes: number;
  used_space_bytes: number;
  available_space_bytes: number;
  file_count: number;
  oldest_file_age_days: number;
  quota_usage_percent: number;
}

export async function getStorageHealth(): Promise<StorageHealth> {
  const stats = await fs.promises.statfs('./storage');
  const fileList = await listAllFiles('./storage');

  return {
    total_space_bytes: stats.blocks * stats.bsize,
    used_space_bytes: (stats.blocks - stats.bfree) * stats.bsize,
    available_space_bytes: stats.bavail * stats.bsize,
    file_count: fileList.length,
    oldest_file_age_days: calculateOldestFileAge(fileList),
    quota_usage_percent: calculateQuotaUsage(),
  };
}
```

#### Cloud Migration Path (FUTURE)

```typescript
// Easy swap in production
const storage =
  process.env.NODE_ENV === 'production'
    ? new GCSStorageAdapter(process.env.GCS_BUCKET!)
    : new LocalStorageAdapter('./storage/temp');

// All app code uses StorageAdapter interface - no changes needed
```

#### What's OUT OF SCOPE (MVP)

- ❌ Cloud storage (GCS/S3/R2)
- ❌ CDN integration
- ❌ Image optimization
- ❌ Video streaming
- ❌ File versioning
- ❌ Encryption at rest (filesystem encryption sufficient)
- ❌ Access control lists (ACLs)
- ❌ File deduplication

---

## NEW TASKS

### BACK-106: Minimal Login Page (NEW)

**Priority**: P1 Critical
**Complexity**: S (Small)
**Requirements**: Security, UX
**Dependencies**: BACK-002

**Purpose**: Simple authentication UI for competition demo

#### Description

Create a minimal login page for single-user access. NO registration, NO password reset, NO forgot password flow.

#### Deliverables

- [ ] `/login` route with simple form
  - Username input
  - Password input
  - "Remember me" checkbox (extends session to 7 days)
  - Login button
  - Error message display

- [ ] Session cookie handling
  - Set cookie on successful login
  - Redirect to `/` after login
  - Clear cookie on logout

- [ ] Logout button in app header
  - Visible when authenticated
  - Clears session, redirects to `/login`

- [ ] Protected route wrapper
  - Redirects to `/login` if not authenticated
  - All app routes require auth except `/login`

#### UI Mockup (Minimal)

```tsx
// app/login/page.tsx
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">H2 Tank Designer</h1>
          <p className="mt-2 text-sm text-gray-600">ProAgentic DfX - Competition Demo</p>
        </div>

        <form className="mt-8 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="remember" className="ml-2 text-sm">
              Remember me (7 days)
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
```

#### Acceptance Criteria

```typescript
// AC-001: Successful login redirects to dashboard
await page.goto('/login');
await page.fill('#username', 'judge');
await page.fill('#password', 'h2tank2025');
await page.click('button[type="submit"]');
await page.waitForURL('/');
// ✅ PASS if redirected to dashboard

// AC-002: Invalid credentials show error
await page.goto('/login');
await page.fill('#username', 'wrong');
await page.fill('#password', 'wrong');
await page.click('button[type="submit"]');
const error = await page.textContent('.error-message');
// ✅ PASS if error.includes('Invalid credentials')

// AC-003: Remember me extends session
await page.check('#remember');
await page.click('button[type="submit"]');
const cookies = await page.context().cookies();
const authCookie = cookies.find((c) => c.name === 'auth');
// ✅ PASS if authCookie.expires > Date.now() + 6 * 24 * 60 * 60 * 1000

// AC-004: Logout clears session
await page.click('button:has-text("Logout")');
await page.waitForURL('/login');
const cookiesAfterLogout = await page.context().cookies();
// ✅ PASS if no auth cookie present
```

#### What's OUT OF SCOPE

- ❌ Registration page
- ❌ Password reset
- ❌ Forgot password
- ❌ Email verification
- ❌ Social login (Google, GitHub, etc.)
- ❌ Password strength indicator
- ❌ CAPTCHA

---

### BACK-107: Health Check Endpoints (NEW)

**Priority**: P1 Critical
**Complexity**: S (Small)
**Requirements**: Monitoring, DevOps
**Dependencies**: BACK-001, BACK-004

**Purpose**: Enable monitoring and CI/CD health checks

#### Deliverables

- [ ] `GET /api/health` - Basic liveness check
  - Returns 200 if server is running
  - No authentication required
  - Response: `{ status: "ok", timestamp: number }`

- [ ] `GET /api/health/deep` - Deep health check (requires auth)
  - Database connectivity
  - File system writable
  - LLM API reachable
  - Storage quota check
  - Response: `{ status: "ok" | "degraded" | "down", checks: { ... } }`

- [ ] `GET /api/health/ready` - Readiness check (Kubernetes-style)
  - Returns 200 when server is ready to accept traffic
  - Returns 503 during startup or shutdown

#### Response Schemas

```typescript
// GET /api/health
interface BasicHealth {
  status: "ok";
  timestamp: number;
  version: string;  // e.g., "1.0.0"
}

// GET /api/health/deep
interface DeepHealth {
  status: "ok" | "degraded" | "down";
  timestamp: number;
  checks: {
    database: HealthCheck;
    filesystem: HealthCheck;
    llm: HealthCheck;
    storage: HealthCheck;
  };
}

interface HealthCheck {
  status: "ok" | "degraded" | "down";
  latency_ms?: number;
  message?: string;
  last_checked: number;
}

// Example response
{
  "status": "ok",
  "timestamp": 1702566000000,
  "checks": {
    "database": {
      "status": "ok",
      "latency_ms": 5,
      "last_checked": 1702566000000
    },
    "filesystem": {
      "status": "ok",
      "latency_ms": 2,
      "message": "2.3 GB available",
      "last_checked": 1702566000000
    },
    "llm": {
      "status": "degraded",
      "latency_ms": 1500,
      "message": "High latency (> 1000ms)",
      "last_checked": 1702565990000
    },
    "storage": {
      "status": "ok",
      "message": "42% quota used",
      "last_checked": 1702566000000
    }
  }
}
```

#### Implementation

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: Date.now(),
    version: process.env.npm_package_version || '1.0.0',
  });
}

// app/api/health/deep/route.ts
export async function GET(req: Request) {
  // Require auth for deep checks
  const session = await validateSession(req);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const checks = await runHealthChecks();
  const overallStatus = determineOverallStatus(checks);

  return Response.json({
    status: overallStatus,
    timestamp: Date.now(),
    checks,
  });
}

async function runHealthChecks(): Promise<DeepHealth['checks']> {
  const [db, fs, llm, storage] = await Promise.all([
    checkDatabase(),
    checkFilesystem(),
    checkLLM(),
    checkStorage(),
  ]);

  return { database: db, filesystem: fs, llm, storage };
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      latency_ms: Date.now() - start,
      last_checked: Date.now(),
    };
  } catch (error) {
    return {
      status: 'down',
      message: error.message,
      last_checked: Date.now(),
    };
  }
}
```

#### Acceptance Criteria

```typescript
// AC-001: Basic health check always responds
const response = await fetch('/api/health');
const data = await response.json();
// ✅ PASS if response.status === 200 && data.status === "ok"

// AC-002: Deep health check requires auth
const unauthedResponse = await fetch('/api/health/deep');
// ✅ PASS if unauthedResponse.status === 401

const authedResponse = await fetch('/api/health/deep', {
  headers: { Cookie: `auth=${validToken}` },
});
// ✅ PASS if authedResponse.status === 200

// AC-003: Deep check detects database failure
// (Stop database, run check)
const response = await fetch('/api/health/deep', { headers: authHeaders });
const data = await response.json();
// ✅ PASS if data.checks.database.status === "down"

// AC-004: Readiness check waits for startup
const responseBeforeReady = await fetch('/api/health/ready');
// ✅ PASS if responseBeforeReady.status === 503

// (Wait for app startup complete)
const responseAfterReady = await fetch('/api/health/ready');
// ✅ PASS if responseAfterReady.status === 200
```

#### Use Cases

**CI/CD Pipeline**:

```bash
# Wait for service to be ready before running tests
while ! curl -f http://localhost:3001/api/health/ready; do
  echo "Waiting for service..."
  sleep 2
done
echo "Service ready, running tests..."
npm test
```

**Docker Healthcheck**:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1
```

**Monitoring (Uptime Robot, Pingdom)**:

- Monitor `/api/health` every 5 minutes
- Alert if down for > 2 minutes

---

### BACK-108: Configuration Management (NEW)

**Priority**: P1 Critical
**Complexity**: S (Small)
**Requirements**: DevOps, Security
**Dependencies**: None

**Purpose**: Centralized environment variable management with validation

#### Deliverables

- [ ] Environment variable schema definition
- [ ] `.env.example` template file
- [ ] Config validation on startup
- [ ] Runtime config API (admin only)
- [ ] Config documentation

#### Environment Variables Schema

```typescript
// config/schema.ts
import { z } from 'zod';

export const configSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().int().min(1000).max(65535).default(3001),

  // Database
  DATABASE_URL: z.string().url().startsWith('file:').or(z.string().url().startsWith('postgresql:')),

  // Authentication
  ADMIN_USERNAME: z.string().min(3).max(50),
  ADMIN_PASSWORD: z.string().min(8).max(100),
  SESSION_SECRET: z.string().min(32),

  // LLM
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),

  // Storage
  STORAGE_PATH: z.string().default('./storage'),
  STORAGE_QUOTA_GB: z.coerce.number().positive().default(1),
  TEMP_FILE_RETENTION_DAYS: z.coerce.number().int().positive().default(7),

  // Features
  ENABLE_OPTIMIZATION: z.coerce.boolean().default(true),
  ENABLE_EXPORT: z.coerce.boolean().default(true),

  // Optional
  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Config = z.infer<typeof configSchema>;
```

#### `.env.example` Template

```bash
# .env.example - Copy to .env and fill in values

# ==========================================
# SERVER CONFIGURATION
# ==========================================
NODE_ENV=development
PORT=3001

# ==========================================
# DATABASE
# ==========================================
# SQLite (recommended for MVP)
DATABASE_URL=file:./prisma/dev.db

# PostgreSQL (production)
# DATABASE_URL=postgresql://user:password@localhost:5432/h2tank

# ==========================================
# AUTHENTICATION (COMPETITION DEMO)
# ==========================================
# ⚠️ CHANGE THESE BEFORE DEMO!
ADMIN_USERNAME=judge
ADMIN_PASSWORD=h2tank2025
SESSION_SECRET=replace-with-random-32-char-string

# Generate random secret:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ==========================================
# LLM APIS
# ==========================================
# Claude (required)
ANTHROPIC_API_KEY=sk-ant-api03-...

# OpenAI (fallback, optional)
# OPENAI_API_KEY=sk-...

# ==========================================
# FILE STORAGE
# ==========================================
STORAGE_PATH=./storage
STORAGE_QUOTA_GB=1
TEMP_FILE_RETENTION_DAYS=7

# ==========================================
# FEATURE FLAGS
# ==========================================
ENABLE_OPTIMIZATION=true
ENABLE_EXPORT=true

# ==========================================
# MONITORING (OPTIONAL)
# ==========================================
# SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=info
```

#### Startup Validation

```typescript
// config/validate.ts
import { configSchema } from './schema';

export function validateConfig(): Config {
  const result = configSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Configuration validation failed:');
    console.error(result.error.format());
    console.error('\n💡 Check .env.example for required variables');
    process.exit(1);
  }

  console.log('✅ Configuration validated successfully');
  return result.data;
}

// server.ts
import { validateConfig } from './config/validate';

const config = validateConfig();
console.log(`Starting server on port ${config.PORT}...`);
```

#### Runtime Config API

```typescript
// app/api/admin/config/route.ts
export async function GET(req: Request) {
  const session = await validateSession(req);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return safe config (no secrets)
  return Response.json({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    STORAGE_QUOTA_GB: process.env.STORAGE_QUOTA_GB,
    ENABLE_OPTIMIZATION: process.env.ENABLE_OPTIMIZATION,
    ENABLE_EXPORT: process.env.ENABLE_EXPORT,
    LOG_LEVEL: process.env.LOG_LEVEL,
  });
}

export async function PATCH(req: Request) {
  const session = await validateSession(req);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updates = await req.json();

  // Only allow runtime-safe updates
  const allowedKeys = ['LOG_LEVEL', 'ENABLE_OPTIMIZATION', 'ENABLE_EXPORT'];

  for (const [key, value] of Object.entries(updates)) {
    if (!allowedKeys.includes(key)) {
      return Response.json({ error: `Cannot update ${key} at runtime` }, { status: 400 });
    }
    process.env[key] = String(value);
  }

  return Response.json({ success: true });
}
```

#### Acceptance Criteria

```typescript
// AC-001: Startup fails with missing required vars
delete process.env.ADMIN_USERNAME;
// ✅ PASS if process exits with error message

// AC-002: Startup succeeds with all required vars
// (All vars set in .env)
// ✅ PASS if server starts without errors

// AC-003: Invalid values rejected
process.env.PORT = 'invalid';
// ✅ PASS if validation fails with error message

// AC-004: Config API returns safe values
const response = await fetch('/api/admin/config', { headers: authHeaders });
const config = await response.json();
// ✅ PASS if config does NOT include ADMIN_PASSWORD or SESSION_SECRET

// AC-005: Runtime updates work
await fetch('/api/admin/config', {
  method: 'PATCH',
  headers: authHeaders,
  body: JSON.stringify({ LOG_LEVEL: 'debug' }),
});
// ✅ PASS if process.env.LOG_LEVEL === 'debug'
```

#### What's OUT OF SCOPE

- ❌ Dynamic config reloading (restart required)
- ❌ Config versioning
- ❌ Config encryption
- ❌ Config audit logging
- ❌ Multi-environment config files (use .env.development, .env.production manually)

---

## MVP SCOPE SUMMARY

### What's IN (MVP)

| Feature            | Scope                                                      |
| ------------------ | ---------------------------------------------------------- |
| **Database**       | SQLite with Prisma, 4 core tables, seeded data             |
| **Authentication** | Single-user env var credentials, JWT sessions, 24h timeout |
| **File Storage**   | Local FS with 1GB quota, 7-day retention, path security    |
| **Login UI**       | Simple form, remember me, logout button                    |
| **Health Checks**  | Basic + deep checks, database/FS/LLM/storage monitoring    |
| **Configuration**  | Env var schema, validation, .env.example template          |

### What's OUT (Future)

| Feature                | Deferred To             |
| ---------------------- | ----------------------- |
| PostgreSQL             | Production deployment   |
| Multi-user auth        | v2.0 (post-competition) |
| User registration      | v2.0                    |
| Cloud storage (GCS/S3) | Production scale        |
| OAuth/SSO              | v2.0                    |
| Password reset         | v2.0                    |
| Advanced monitoring    | Production ops          |
| Config encryption      | Security audit phase    |

---

## EFFORT ESTIMATION

| Task                | Complexity | Hours   | Developer           |
| ------------------- | ---------- | ------- | ------------------- |
| BACK-001 (Database) | L          | 20h     | Backend dev         |
| BACK-002 (Auth)     | M          | 12h     | Backend dev         |
| BACK-004 (Storage)  | S          | 8h      | Backend dev         |
| BACK-106 (Login UI) | S          | 6h      | Frontend dev        |
| BACK-107 (Health)   | S          | 4h      | Backend dev         |
| BACK-108 (Config)   | S          | 4h      | Backend dev         |
| **TOTAL**           |            | **54h** | ~1.5 weeks (2 devs) |

---

## IMPLEMENTATION ORDER

**Week 1**:

1. BACK-108 (Config) - 4h - Sets up .env structure for everything else
2. BACK-001 (Database) - 20h - Foundation for auth and storage
3. BACK-107 (Health) - 4h - Monitoring from day 1

**Week 2**: 4. BACK-002 (Auth) - 12h - Security layer 5. BACK-106 (Login UI) - 6h - User-facing auth 6. BACK-004 (Storage) - 8h - File handling ready

**Testing**: 10h (after all tasks complete)

---

## VALIDATION CHECKLIST

Before marking Phase 1 complete, verify:

- [ ] Database schema created with Prisma
- [ ] Materials database seeded (30+ materials)
- [ ] Standards database seeded (4 standards)
- [ ] Login page accessible at `/login`
- [ ] Valid credentials grant access
- [ ] Invalid credentials rejected
- [ ] All API endpoints require auth (except login and health)
- [ ] File storage quota enforced
- [ ] Old files cleaned up automatically
- [ ] Health check endpoints responding
- [ ] `.env.example` template complete
- [ ] All environment variables validated on startup
- [ ] Unit tests pass (80%+ coverage target)
- [ ] E2E test: Login → Access dashboard → Logout

---

**Document Status**: Draft - Ready for Review
**Next Steps**: Review with team, prioritize P0 items, assign developers
**Related Documents**:

- BACKEND_DEVELOPMENT_BACKLOG.md (parent)
- RTM_AUDIT_2025-12-11.md (requirements source)
- BACKEND_SPECIFICATION.md (architecture reference)

---

_Generated by ProSWARM Neural Orchestration - 2025-12-12_
