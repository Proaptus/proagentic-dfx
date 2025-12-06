---
name: h2-tank-builder
description: Systematic development skill for H2 Tank Designer frontend and mock server. Use when building, testing, or modifying the H2 Tank Designer project. Enforces TDD, RTM-driven development, and phased validation. Ensures agent stays on track with specifications, validates against 189 requirements, and follows best practices for Next.js, React, TypeScript, and Three.js development.
---

# H2 Tank Builder - RTM-Driven Development Skill

> Core goal: Build the H2 Tank Designer systematically with **TDD, continuous RTM validation, and phased checkpoints**.

## When This Skill Activates

- Building H2 Tank Designer frontend or mock server
- Implementing features from the frontend-implementation-plan.md
- Creating API endpoints per mock-server-specification.md
- Any development referencing requirements-traceability-matrix.csv
- Testing or validating H2 Tank Designer components

## Critical First Steps (Always Do This)

Before ANY coding task:

1. **Read the relevant specification**:
   ```bash
   # For frontend work
   cat /path/to/frontend-implementation-plan.md | head -200
   
   # For mock server work
   cat /path/to/mock-server-specification.md | head -200
   
   # For API contracts
   cat /path/to/openapi-h2-tank-api.yaml | head -100
   ```

2. **Identify RTM requirements**:
   ```bash
   # Find requirements for the feature
   grep "Screen 5" requirements-traceability-matrix.csv
   grep "stress" requirements-traceability-matrix.csv
   ```

3. **Check current status**:
   ```bash
   # What's already addressed?
   grep ",Addressed," requirements-traceability-matrix.csv | wc -l
   ```

## The RTM-TDD Loop (Mandatory for Every Feature)

### Step 1: Requirements First

Before writing any code, identify the RTM requirements:

```
TASK: Implement stress visualization
RTM LOOKUP: REQ-041 to REQ-048
SPECIFICATION: frontend-implementation-plan.md Screen 5 Tab 2
API CONTRACT: GET /api/designs/{id}/stress
```

### Step 2: Write Test First (TDD)

Create a failing test BEFORE implementation:

```typescript
// __tests__/components/StressTab.test.tsx
describe('StressTab', () => {
  // REQ-041: Stress contour plot (von Mises)
  it('should render von Mises stress contours on 3D model', async () => {
    render(<StressTab designId="C" />);
    await waitFor(() => {
      expect(screen.getByTestId('stress-contour')).toBeInTheDocument();
    });
  });

  // REQ-048: Load case selector
  it('should switch between test and burst load cases', async () => {
    render(<StressTab designId="C" />);
    fireEvent.click(screen.getByRole('button', { name: /burst/i }));
    await waitFor(() => {
      expect(screen.getByText(/1720 bar/)).toBeInTheDocument();
    });
  });
});
```

### Step 3: Implement Minimally

Write only enough code to pass the test:

```typescript
// components/screens/analysis/tabs/StressTab.tsx
export function StressTab({ designId }: { designId: string }) {
  const { data, isLoading } = useDesignStress(designId, 'vonMises');
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div data-testid="stress-contour">
      {/* Minimal implementation to pass test */}
    </div>
  );
}
```

### Step 4: Run Tests

```bash
npm test -- --watch StressTab
```

### Step 5: Refactor if Tests Pass

Improve code quality while keeping tests green.

### Step 6: Update RTM Status

After implementation, update tracking:

```csv
REQ-041,...,Addressed,Screen 5 Tab 2: Stress Analysis,GET /api/designs/{id}/stress,...
```

## Phase Gate Validation (Mandatory)

At each phase boundary, run the validation checklist:

### Phase 1 Gate (Mock Server Foundation)

```bash
# Must pass before proceeding to Phase 2
curl -s http://localhost:3001/api/standards | jq '.standards | length'
curl -s http://localhost:3001/api/materials | jq '.fibers | length'
curl -s http://localhost:3001/api/designs/C | jq '.summary.weight_kg'

# Expected: All return valid data
```

### Phase 2 Gate (Mock Server Complete)

```bash
# Must pass before proceeding to Phase 3
curl -N http://localhost:3001/api/optimization/test/stream | head -10
# Expected: SSE events stream

curl -s http://localhost:3001/api/designs/C/stress | jq '.max_stress_mpa'
curl -s http://localhost:3001/api/designs/C/reliability | jq '.p_failure'
# Expected: Valid analysis data
```

### Phase 3 Gate (Frontend Foundation)

```bash
# Start both servers, then verify:
npm run dev  # Frontend on 3000
# In another terminal:
npm run dev  # Mock server on 3001

# Manual checks:
# - Navigate to http://localhost:3000
# - Screens 1-4 render without errors
# - API calls succeed (check Network tab)
```

### Phase 4 Gate (Frontend Analysis)

```bash
# Navigate to http://localhost:3000/analysis/C
# Verify all 6 tabs:
# - Geometry: 3D model renders
# - Stress: Contours visible
# - Failure: Sequence displays
# - Thermal: Charts render
# - Reliability: Histogram shows
# - Physics & Cost: Pie chart works
```

### Phase 5 Gate (Complete)

Run end-to-end demo in under 60 seconds.

## File Naming Conventions

```
h2-tank-frontend/
├── src/
│   ├── app/
│   │   └── [screen-name]/
│   │       └── page.tsx           # Screen component
│   ├── components/
│   │   ├── screens/
│   │   │   └── [screen-name]/
│   │   │       ├── index.tsx      # Screen barrel export
│   │   │       └── [Component].tsx
│   │   ├── visualization/
│   │   │   └── [Viz].tsx          # Three.js, Recharts
│   │   └── ui/
│   │       └── [UI].tsx           # Reusable UI components
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts          # API client
│   │   ├── hooks/
│   │   │   └── use[Feature].ts    # React hooks
│   │   └── types/
│   │       └── index.ts           # TypeScript types
│   └── __tests__/
│       └── [mirror-src-structure]  # Test files
```

## Code Quality Rules

### TypeScript Strict Mode

```typescript
// ✅ Always type function parameters and returns
function calculateStress(pressure: number, radius: number): number {
  return (pressure * radius) / thickness;
}

// ❌ Never use 'any'
function badFunction(data: any) { } // FORBIDDEN
```

### React Best Practices

```typescript
// ✅ Use React Query for data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['design', designId, 'stress'],
  queryFn: () => apiClient(`/api/designs/${designId}/stress`)
});

// ✅ Handle loading and error states
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;

// ❌ Never fetch in useEffect without cleanup
useEffect(() => {
  fetch('/api/data'); // FORBIDDEN - use React Query
}, []);
```

### Component Structure

```typescript
// ✅ Correct component structure
interface StressTabProps {
  designId: string;
}

export function StressTab({ designId }: StressTabProps) {
  // 1. Hooks first
  const { data } = useDesignStress(designId);
  const [loadCase, setLoadCase] = useState<'test' | 'burst'>('test');
  
  // 2. Early returns for loading/error
  if (!data) return <Loading />;
  
  // 3. Render
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### API Client Pattern

```typescript
// ✅ Centralized API client with error handling
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  
  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }
  
  return response.json();
}
```

## RTM Coverage Tracking

After each coding session, verify coverage:

```bash
# Count requirements by status
echo "Addressed: $(grep -c ',Addressed,' requirements-traceability-matrix.csv)"
echo "Deferred: $(grep -c ',Deferred,' requirements-traceability-matrix.csv)"
echo "Pending: $(grep -c ',Pending,' requirements-traceability-matrix.csv)"

# Target: 169+ Addressed, 15 Deferred, 5 Pending
```

## Common Patterns

### SSE Streaming Hook

```typescript
// hooks/useOptimizationStream.ts - REQ-150 to REQ-153
export function useOptimizationStream(jobId: string | null) {
  const [progress, setProgress] = useState<OptimizationProgress | null>(null);
  const [status, setStatus] = useState<StreamStatus>('idle');

  useEffect(() => {
    if (!jobId) return;

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/optimization/${jobId}/stream`
    );

    eventSource.addEventListener('progress', (e) => {
      setStatus('streaming');
      setProgress(JSON.parse(e.data));
    });

    eventSource.addEventListener('complete', () => {
      setStatus('complete');
      eventSource.close();
    });

    return () => eventSource.close();
  }, [jobId]);

  return { progress, status };
}
```

### Three.js Tank Model

```typescript
// components/visualization/TankModel.tsx - REQ-031 to REQ-036
export function TankModel({ geometry, showSection }: TankModelProps) {
  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[5, 3, 5]} />
      <OrbitControls enableDamping />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <Tank geometry={geometry} showSection={showSection} />
    </Canvas>
  );
}
```

## Error Recovery

If tests fail:

1. Check RTM requirement - is the expected behavior correct?
2. Check API endpoint - is mock server returning expected data?
3. Check component props - are all required props passed?
4. Check async handling - is loading state handled?

If phase gate fails:

1. Do not proceed to next phase
2. Identify failing requirements
3. Fix and re-validate
4. Only proceed when all gate checks pass

## Summary: The Systematic Loop

```
┌─────────────────────────────────────────────────────────┐
│                    FOR EACH FEATURE                      │
├─────────────────────────────────────────────────────────┤
│  1. READ specification (frontend-plan / mock-server)     │
│  2. IDENTIFY RTM requirements (grep RTM)                 │
│  3. WRITE test first (TDD)                               │
│  4. IMPLEMENT minimally                                  │
│  5. RUN tests (npm test)                                 │
│  6. REFACTOR if green                                    │
│  7. UPDATE RTM status                                    │
│  8. VALIDATE at phase gates                              │
└─────────────────────────────────────────────────────────┘
```

**Never skip steps. Never proceed without validation.**
