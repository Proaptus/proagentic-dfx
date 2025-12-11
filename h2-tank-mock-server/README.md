---
id: REF-h2-mock-server
doc_type: reference
title: "H2 Tank Mock Server"
status: accepted
last_verified_at: 2025-12-11
owner: "@ProAgentic/backend-team"
code_refs:
  - path: "h2-tank-mock-server/src/app/api"
test_refs:
  - path: "h2-tank-mock-server/tests/api.test.ts"
keywords: ["mock", "api", "backend", "physics", "h2", "tank"]
---

# H2 Tank Mock Server

Mock API server for the H2 Tank Designer frontend, providing realistic engineering data based on first-principles physics calculations.

## Overview

This server provides mock API endpoints that simulate a real backend for the H2 Tank Designer application. It uses first-principles physics equations for pressure vessel analysis, composite mechanics, and reliability calculations.

## Running the Server

```bash
# Development mode (port 3001)
npm run dev

# Production build
npm run build
npm start
```

The server runs on **http://localhost:3001** by default.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/designs` | GET | List all tank designs |
| `/api/designs` | POST | Create a new design |
| `/api/designs/:id` | GET | Get design details |
| `/api/designs/:id/stress` | GET | Get stress analysis |
| `/api/pareto` | GET | Get Pareto front data |
| `/api/optimization` | POST | Run optimization |
| `/api/materials` | GET | Get materials database |
| `/api/compliance` | GET | Get compliance standards |
| `/api/validation` | POST | Run validation tests |

## Physics Implementation

The server implements real engineering calculations:

- **Pressure Vessel Theory**: Hoop stress, axial stress, burst pressure
- **Composite Analysis**: Tsai-Wu criterion, Hashin failure modes
- **Dome Geometry**: Geodesic paths, isotensoid profiles
- **Reliability**: Weibull statistics, fatigue life prediction
- **Thermal Analysis**: Heat transfer, operating temperature limits

See [PHYSICS_IMPLEMENTATION.md](../docs/explanation/PHYSICS_IMPLEMENTATION.md) for details.

## Data Files

Static data is stored in `/data/`:
- `materials.json` - Material properties database
- `standards.json` - Compliance standards (ISO, ASME, etc.)

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Testing**: Vitest

## Related Documentation

- [Main App](../proagentic-dfx/README.md)
- [Physics Implementation](../docs/explanation/PHYSICS_IMPLEMENTATION.md)
- [API Reference](../docs/reference/API_ENDPOINT_MAPPING.md)
