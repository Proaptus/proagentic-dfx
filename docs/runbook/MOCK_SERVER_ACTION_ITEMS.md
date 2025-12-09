---
doc_type: runbook
title: "Mock Server Gap Analysis - Action Items"
version: 1.0.0
date: 2025-12-09
owner: "@h2-tank-team"
status: accepted
last_verified_at: 2025-12-09
---
# Mock Server Gap Analysis - Action Items

## ðŸ”´ CRITICAL (Week 1) - 20 hours

### 1. Create OpenAPI Specification (16 hours)
**Priority:** P1 | **Impact:** HIGH | **Blocker:** None

**File to create:** `h2-tank-mock-server/openapi-h2-tank-api.yaml`

**What to document:**
- [ ] All 32 endpoint paths
- [ ] Request schemas (POST bodies)
- [ ] Response schemas (all endpoints)
- [ ] Error response format
- [ ] SSE event structure for `/api/optimization/[id]/stream`
- [ ] Query parameter specs
- [ ] CORS headers documentation

**Tools:** Use existing TypeScript types as reference
**Validation:** Validate with Swagger Editor (editor.swagger.io)

---

### 2. Add Health Endpoint (2 hours)
**Priority:** P1 | **Impact:** MEDIUM | **Blocker:** None

**File to create:** `h2-tank-mock-server/src/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    endpoints: 32
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}
```

**Testing:** `curl http://localhost:3001/api/health`

---

### 3. Document Environment Configuration (2 hours)
**Priority:** P1 | **Impact:** LOW | **Blocker:** None

**Files to create/update:**
1. `h2-tank-mock-server/.env.example`
2. `h2-tank-mock-server/README.md`

**`.env.example` template:**
```bash
# Mock Server Configuration
PORT=3001
NODE_ENV=development

# Data Mode: static | simulated | hybrid
DATA_MODE=simulated

# CORS (for development)
ALLOW_ORIGIN=*
```

**README.md should include:**
- [ ] Quick start instructions
- [ ] Available endpoints list
- [ ] Environment variables
- [ ] Data modes explanation
- [ ] Testing instructions
- [ ] Port configuration

---

## ðŸŸ¡ HIGH PRIORITY (Week 2-3) - 40 hours

### 4. Unit Tests for Endpoints (24 hours)
**Priority:** P1 | **Impact:** HIGH | **Blocker:** None

**Test files to create:**
```
h2-tank-mock-server/src/app/api/__tests__/
â”œâ”€â”€ materials.test.ts          # 2h
â”œâ”€â”€ designs.test.ts            # 3h
â”œâ”€â”€ stress.test.ts             # 3h
â”œâ”€â”€ failure.test.ts            # 3h
â”œâ”€â”€ thermal.test.ts            # 2h
â”œâ”€â”€ sentry.test.ts             # 2h
â”œâ”€â”€ compliance.test.ts         # 2h
â”œâ”€â”€ requirements.test.ts       # 2h
â”œâ”€â”€ tank-type.test.ts          # 2h
â”œâ”€â”€ optimization.test.ts       # 2h
â””â”€â”€ compare.test.ts            # 1h
```

**Testing framework:** Already has Vitest in package.json

**Test template:**
```typescript
import { describe, it, expect } from 'vitest';
import { GET } from '../materials/route';

describe('GET /api/materials', () => {
  it('returns all materials by default', async () => {
    const request = new Request('http://localhost:3001/api/materials');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('filters by type=carbon_fiber', async () => {
    const request = new Request('http://localhost:3001/api/materials?type=carbon_fiber');
    const response = await GET(request);
    const data = await response.json();

    expect(data.every(m => m.category === 'fiber')).toBe(true);
  });

  // ... more tests
});
```

**Run tests:** `npm test` in h2-tank-mock-server directory

---

### 5. Requirements Chat Endpoint (16 hours)
**Priority:** P1 | **Impact:** HIGH | **Blocker:** LLM integration decision

**File to create:** `h2-tank-mock-server/src/app/api/requirements/chat/route.ts`

**Implementation steps:**
1. [ ] Design conversation state management (2h)
2. [ ] Implement multi-turn context window (3h)
3. [ ] Add proactive clarification logic (3h)
4. [ ] Real-time structured extraction (4h)
5. [ ] Confidence scoring per field (2h)
6. [ ] Test with example conversations (2h)

**Mock conversation flow:**
```typescript
// Request
{
  "messages": [
    { "role": "user", "content": "I need a hydrogen tank" },
    { "role": "assistant", "content": "What pressure?" },
    { "role": "user", "content": "700 bar" }
  ]
}

// Response
{
  "next_question": "What volume do you need?",
  "extracted_so_far": {
    "working_pressure_bar": 700,
    "confidence": 0.95
  },
  "conversation_complete": false
}
```

**Note:** Can use simple rule-based system for mock, or integrate real LLM later.

---

## ðŸŸ¢ MEDIUM PRIORITY (Month 2) - 28 hours

### 6. Export System with Real ZIP (12 hours)
**Priority:** P2 | **Impact:** MEDIUM | **Blocker:** None

**Files to update:**
- `h2-tank-mock-server/src/app/api/export/[id]/download/route.ts`

**Add dependency:**
```bash
npm install archiver @types/archiver
```

**Implementation:**
```typescript
import archiver from 'archiver';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Create ZIP archive
  const archive = archiver('zip', { zlib: { level: 9 } });

  // Add design JSON
  archive.file(`designs/design-${id}.json`, { name: 'design.json' });

  // Add analysis results
  archive.append(JSON.stringify(stressData), { name: 'analysis/stress.json' });
  archive.append(JSON.stringify(failureData), { name: 'analysis/failure.json' });

  // ... add more files

  archive.finalize();

  return new Response(archive, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="design-${id}.zip"`,
    },
  });
}
```

---

### 7. Request Validation with Zod (8 hours)
**Priority:** P2 | **Impact:** MEDIUM | **Blocker:** OpenAPI spec complete

**Add dependency:**
```bash
npm install zod
```

**Create schema file:** `h2-tank-mock-server/src/lib/schemas/api-schemas.ts`

**Example validation:**
```typescript
import { z } from 'zod';

export const RequirementsInputSchema = z.object({
  input_mode: z.enum(['natural_language', 'structured']),
  raw_text: z.string().optional(),
  structured: z.object({
    pressure_bar: z.number().positive(),
    volume_liters: z.number().positive(),
  }).optional(),
});

// Use in endpoint
export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = RequirementsInputSchema.parse(body); // Throws on invalid
  // ... rest of handler
}
```

---

### 8. Structured Logging (4 hours)
**Priority:** P2 | **Impact:** LOW | **Blocker:** None

**Add dependency:**
```bash
npm install winston
```

**Create logger:** `h2-tank-mock-server/src/lib/logger.ts`

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

**Usage in routes:**
```typescript
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Fetching materials', { query: request.nextUrl.searchParams });
    // ...
  } catch (error) {
    logger.error('Failed to fetch materials', { error, stack: error.stack });
    // ...
  }
}
```

---

### 9. Integration Tests (16 hours)
**Priority:** P2 | **Impact:** MEDIUM | **Blocker:** Unit tests complete

**Test file:** `h2-tank-mock-server/src/__tests__/integration/optimization-flow.test.ts`

**Test scenarios:**
1. [ ] Full optimization flow (start â†’ stream â†’ results)
2. [ ] Design analysis flow (get design â†’ stress â†’ failure â†’ thermal)
3. [ ] Requirements flow (parse â†’ tank-type â†’ materials)
4. [ ] Export flow (create export â†’ check status â†’ download)
5. [ ] Compare flow (get designs â†’ compare)

**Example test:**
```typescript
import { describe, it, expect } from 'vitest';

describe('Optimization Flow Integration', () => {
  it('completes full optimization workflow', async () => {
    // 1. Start optimization
    const startRes = await fetch('http://localhost:3001/api/optimization', {
      method: 'POST',
      body: JSON.stringify({ requirements: {...} }),
    });
    const { job_id } = await startRes.json();

    // 2. Listen to stream
    const eventSource = new EventSource(
      `http://localhost:3001/api/optimization/${job_id}/stream`
    );

    const events = [];
    eventSource.onmessage = (e) => events.push(JSON.parse(e.data));

    // Wait for completion
    await new Promise(resolve => {
      eventSource.addEventListener('complete', resolve);
    });

    // 3. Verify events
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'progress' })
    );
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'best_update' })
    );
  });
});
```

---

## ðŸ“‹ Checklist Summary

### Week 1 (20 hours)
- [ ] OpenAPI spec (16h)
- [ ] Health endpoint (2h)
- [ ] Environment docs (2h)

### Week 2-3 (40 hours)
- [ ] Unit tests for all endpoints (24h)
- [ ] Requirements chat endpoint (16h)

### Month 2 (28 hours)
- [ ] Export ZIP generation (12h)
- [ ] Zod validation (8h)
- [ ] Winston logging (4h)
- [ ] Integration tests (16h)

### Total Effort: 88 hours (~2-3 weeks)

---

## ðŸŽ¯ Success Criteria

**After completing all items:**

âœ… **Documentation**
- OpenAPI spec validates without errors
- README explains setup and usage
- Environment variables documented

âœ… **Testing**
- >80% code coverage on endpoints
- All integration scenarios pass
- Physics tests remain passing

âœ… **Quality**
- Request validation on all POST endpoints
- Structured logging in all routes
- Health endpoint returns 200 OK

âœ… **Features**
- Export downloads real ZIP file
- Chat endpoint handles multi-turn dialogue
- All existing endpoints still work

**Grade improves from A- to A+**

---

## ðŸ“ž Questions or Blockers?

**OpenAPI spec structure?**
- Use Swagger Editor to validate
- Reference existing Next.js API route types
- See example OpenAPI 3.0 specs online

**Which LLM for chat endpoint?**
- Start with rule-based mock for v1.0
- Plan for OpenAI/Anthropic integration in v2.0
- Keep interface generic for future swap

**Testing setup unclear?**
- Vitest already in package.json
- Run `npm test` to execute
- See existing physics test as example

**Need help?**
- Refer to full gap analysis reports
- Check existing working endpoints as examples
- All code is in `/h2-tank-mock-server/src/`

---

*Action items generated from gap analysis on December 9, 2024*

