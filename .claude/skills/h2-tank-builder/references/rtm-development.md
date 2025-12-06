# RTM-Driven Development Reference

## What is RTM-Driven Development?

Requirements Traceability Matrix (RTM) driven development ensures every line of code traces back to a documented requirement. This prevents scope creep, ensures completeness, and provides audit trail.

## The RTM Structure

```csv
Req_ID,Category,Source_Doc,Requirement_Description,...,API_Endpoint,Mock_Server_Status,Data_Mode
REQ-041,FEA-Results,Doc-08,Stress contour plot (von Mises),...,GET /api/designs/{id}/stress,Addressed,Simulated
```

### Key Columns

| Column | Purpose | Example |
|--------|---------|---------|
| Req_ID | Unique identifier | REQ-041 |
| Category | Functional area | FEA-Results |
| Source_Doc | Origin document | Doc-08 |
| Requirement_Description | What must be built | Stress contour plot |
| Screen_Location | Where in UI | Screen 5 Tab 2 |
| API_Endpoint | Backend route | GET /api/designs/{id}/stress |
| Mock_Server_Status | Build status | Addressed / Deferred / Pending |
| Data_Mode | Data source | Static / Simulated / Both |

## Requirement Categories

### Input Requirements (REQ-001 to REQ-006)
Natural language parsing, standards lookup, derived calculations.
**Screen:** 1 - Requirements Input

### Concept Requirements (REQ-007 to REQ-015)
Tank type selection, material selection.
**Screen:** 2 - Configuration

### Geometry Requirements (REQ-016 to REQ-036)
Dome profile, layup, 3D visualization.
**Screen:** 5 Tab 1 - Geometry

### FEA Results (REQ-041 to REQ-057)
Stress analysis, failure modes, thermal analysis.
**Screen:** 5 Tabs 2-4

### Optimization Requirements (REQ-058 to REQ-070)
Pareto optimization, streaming progress.
**Screens:** 3 - Optimization, 4 - Results

### Reliability Requirements (REQ-076 to REQ-089)
Monte Carlo, uncertainty quantification.
**Screen:** 5 Tab 5 - Reliability

### Validation Requirements (REQ-090 to REQ-102)
Surrogate confidence, test planning, Sentry.
**Screen:** 7 - Validation

### Export Requirements (REQ-103 to REQ-120)
Document generation, manufacturing specs.
**Screen:** 8 - Export

### Mock Server Requirements (REQ-143 to REQ-189)
API contract, simulators, data schemas.
**Component:** h2-tank-mock-server

## RTM Queries

### Find requirements for a screen

```bash
grep "Screen 5" requirements-traceability-matrix.csv
```

### Find requirements for an API endpoint

```bash
grep "/api/designs" requirements-traceability-matrix.csv
```

### Count coverage by status

```bash
echo "Addressed: $(grep -c ',Addressed,' rtm.csv)"
echo "Deferred: $(grep -c ',Deferred,' rtm.csv)"
echo "Pending: $(grep -c ',Pending,' rtm.csv)"
```

### Find unaddressed P1 requirements

```bash
grep ",P1," rtm.csv | grep -v ",Addressed,"
```

## Mapping Code to Requirements

### In Test Files

```typescript
describe('StressTab', () => {
  // REQ-041: Stress contour plot (von Mises)
  it('should render von Mises stress contours', () => {
    // ...
  });

  // REQ-048: Load case selector
  it('should switch load cases', () => {
    // ...
  });
});
```

### In Component Files

```typescript
/**
 * StressTab Component
 * 
 * RTM Coverage:
 * - REQ-041: Stress contour plot (von Mises)
 * - REQ-042: Hoop stress distribution
 * - REQ-043: Axial stress distribution
 * - REQ-044: Maximum stress location identification
 * - REQ-045: Stress margin calculation display
 * - REQ-046: Per-layer stress breakdown
 * - REQ-048: Load case selector
 */
export function StressTab({ designId }: StressTabProps) {
  // Implementation
}
```

### In API Routes

```typescript
/**
 * GET /api/designs/[id]/stress
 * 
 * RTM Coverage:
 * - REQ-041: Von Mises stress field
 * - REQ-042: Hoop stress field
 * - REQ-043: Axial stress field
 * - REQ-044: Max stress location
 * - REQ-046: Per-layer stress
 * 
 * Mock Server Status: Addressed
 * Data Mode: Simulated (StressSimulator)
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Implementation
}
```

## Coverage Verification

### Before Each Commit

```bash
# Verify no P1 requirements are unaddressed
P1_UNADDRESSED=$(grep ",P1," rtm.csv | grep -v ",Addressed," | wc -l)
if [ $P1_UNADDRESSED -gt 15 ]; then
  echo "ERROR: $P1_UNADDRESSED P1 requirements not addressed"
  exit 1
fi
```

### At Phase Gates

| Phase | Required Coverage |
|-------|-------------------|
| Phase 1 | REQ-001 to REQ-015 static data |
| Phase 2 | REQ-143 to REQ-189 mock server |
| Phase 3 | REQ-001 to REQ-070 basic screens |
| Phase 4 | REQ-016 to REQ-057 analysis tabs |
| Phase 5 | All 189 requirements addressed/deferred |

## Handling Deferred Requirements

Some requirements are intentionally deferred (P2/P3 priority):

```csv
REQ-019,Geometry,Doc-08,Geodesic path visualization,...,Deferred,Future enhancement - P2
```

**Valid reasons to defer:**
- Not critical for demo
- Requires external tool integration
- Time constraints (P2/P3 priority)

**Never defer:**
- P1 requirements
- Requirements needed for demo flow
- Core functionality

## RTM Update Process

After implementing a feature:

1. **Verify implementation matches requirement**
2. **Run tests to confirm functionality**
3. **Update RTM status column**
4. **Commit RTM changes with code changes**

```bash
git add requirements-traceability-matrix.csv
git commit -m "feat(stress): implement REQ-041 to REQ-048 stress visualization"
```
