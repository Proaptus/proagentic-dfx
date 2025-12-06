# TDD Patterns for H2 Tank Designer

## The TDD Cycle

```
┌─────────┐
│  RED    │ ← Write failing test
└────┬────┘
     │
     ▼
┌─────────┐
│  GREEN  │ ← Write minimal code to pass
└────┬────┘
     │
     ▼
┌─────────┐
│ REFACTOR│ ← Improve while keeping green
└────┬────┘
     │
     └──────► Back to RED for next feature
```

## Test File Organization

```
h2-tank-frontend/
├── src/
│   └── __tests__/
│       ├── components/
│       │   ├── screens/
│       │   │   ├── requirements/
│       │   │   │   └── RequirementsInput.test.tsx
│       │   │   └── analysis/
│       │   │       └── StressTab.test.tsx
│       │   └── visualization/
│       │       └── TankModel.test.tsx
│       ├── hooks/
│       │   ├── useOptimizationStream.test.ts
│       │   └── useDesignStress.test.ts
│       └── lib/
│           └── api-client.test.ts
```

## Testing Patterns by Component Type

### 1. Screen Components

```typescript
// __tests__/components/screens/requirements/RequirementsInput.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RequirementsInput } from '@/components/screens/requirements';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('RequirementsInput', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  // REQ-001: Parse natural language requirements
  it('should parse natural language input', async () => {
    render(<RequirementsInput />, { wrapper });
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '700 bar 150L tank' } });
    fireEvent.click(screen.getByRole('button', { name: /parse/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/700 bar/)).toBeInTheDocument();
      expect(screen.getByText(/150 L/)).toBeInTheDocument();
    });
  });

  // REQ-003: Standards lookup
  it('should display applicable standards', async () => {
    render(<RequirementsInput />, { wrapper });
    
    fireEvent.click(screen.getByRole('button', { name: /parse/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/ISO 11119/)).toBeInTheDocument();
      expect(screen.getByText(/UN R134/)).toBeInTheDocument();
    });
  });

  // REQ-004: Derived requirements
  it('should calculate and display derived requirements', async () => {
    render(<RequirementsInput />, { wrapper });
    
    fireEvent.click(screen.getByRole('button', { name: /parse/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/1050 bar/)).toBeInTheDocument(); // Test pressure
      expect(screen.getByText(/1575 bar/)).toBeInTheDocument(); // Min burst
    });
  });
});
```

### 2. Visualization Components

```typescript
// __tests__/components/visualization/TankModel.test.tsx
import { render, screen } from '@testing-library/react';
import { TankModel } from '@/components/visualization';

// Mock Three.js canvas
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="three-canvas">{children}</div>,
}));

describe('TankModel', () => {
  const mockGeometry = {
    inner_radius_mm: 175,
    cylinder_length_mm: 1200,
    wall_thickness_mm: 28.1,
    dome: {
      depth_mm: 180,
      profile_points: [{ r: 40, z: 180 }]
    }
  };

  // REQ-031: 3D tank model (rotatable)
  it('should render Three.js canvas', () => {
    render(<TankModel geometry={mockGeometry} />);
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });

  // REQ-034: Section view (cut-away)
  it('should toggle section view', () => {
    const { rerender } = render(
      <TankModel geometry={mockGeometry} showSection={false} />
    );
    
    rerender(<TankModel geometry={mockGeometry} showSection={true} />);
    // Verify section plane is applied
    expect(screen.getByTestId('section-indicator')).toBeInTheDocument();
  });
});
```

### 3. Custom Hooks

```typescript
// __tests__/hooks/useOptimizationStream.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimizationStream } from '@/lib/hooks/useOptimizationStream';

// Mock EventSource
class MockEventSource {
  url: string;
  listeners: Record<string, Function[]> = {};
  
  constructor(url: string) {
    this.url = url;
  }
  
  addEventListener(event: string, callback: Function) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(callback);
  }
  
  emit(event: string, data: any) {
    this.listeners[event]?.forEach(cb => cb({ data: JSON.stringify(data) }));
  }
  
  close() {}
}

global.EventSource = MockEventSource as any;

describe('useOptimizationStream', () => {
  // REQ-150: Server-Sent Events for optimization progress
  it('should connect to SSE endpoint', () => {
    const { result } = renderHook(() => useOptimizationStream('job-123'));
    expect(result.current.status).toBe('connecting');
  });

  // REQ-151: Real-time progress events
  it('should update progress on events', async () => {
    const { result } = renderHook(() => useOptimizationStream('job-123'));
    
    const eventSource = new MockEventSource('');
    act(() => {
      eventSource.emit('progress', { progress_percent: 50, generation: 100 });
    });
    
    await waitFor(() => {
      expect(result.current.progress?.progress_percent).toBe(50);
    });
  });

  // REQ-153: Completion event
  it('should set status to complete on complete event', async () => {
    const { result } = renderHook(() => useOptimizationStream('job-123'));
    
    const eventSource = new MockEventSource('');
    act(() => {
      eventSource.emit('complete', { status: 'completed' });
    });
    
    await waitFor(() => {
      expect(result.current.status).toBe('complete');
    });
  });
});
```

### 4. API Client

```typescript
// __tests__/lib/api-client.test.ts
import { apiClient, ApiError } from '@/lib/api/client';

global.fetch = jest.fn();

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make GET requests', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'test' })
    });
    
    const result = await apiClient('/api/test');
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/test'),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' }
      })
    );
    expect(result).toEqual({ data: 'test' });
  });

  it('should throw ApiError on non-ok response', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not found')
    });
    
    await expect(apiClient('/api/missing')).rejects.toThrow(ApiError);
  });

  it('should make POST requests with body', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
    
    await apiClient('/api/test', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' })
    });
    
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ data: 'test' })
      })
    );
  });
});
```

### 5. Mock Server Endpoints

```typescript
// h2-tank-mock-server/__tests__/api/designs/stress.test.ts
import { GET } from '@/app/api/designs/[id]/stress/route';
import { NextRequest } from 'next/server';

describe('GET /api/designs/[id]/stress', () => {
  // REQ-041: Von Mises stress field
  it('should return von Mises stress data', async () => {
    const request = new NextRequest('http://localhost:3001/api/designs/C/stress?type=vonMises');
    const response = await GET(request, { params: { id: 'C' } });
    const data = await response.json();
    
    expect(data.stress_type).toBe('vonMises');
    expect(data.max_stress_mpa).toBeGreaterThan(0);
    expect(data.nodes).toBeInstanceOf(Array);
  });

  // REQ-048: Load case selector
  it('should return different data for test vs burst load case', async () => {
    const testRequest = new NextRequest('http://localhost:3001/api/designs/C/stress?load_case=test');
    const burstRequest = new NextRequest('http://localhost:3001/api/designs/C/stress?load_case=burst');
    
    const testResponse = await GET(testRequest, { params: { id: 'C' } });
    const burstResponse = await GET(burstRequest, { params: { id: 'C' } });
    
    const testData = await testResponse.json();
    const burstData = await burstResponse.json();
    
    expect(burstData.max_stress_mpa).toBeGreaterThan(testData.max_stress_mpa);
  });
});
```

## Mocking Strategies

### Mock API Responses

```typescript
// __mocks__/api-client.ts
export const mockApiClient = jest.fn();

// In test file
jest.mock('@/lib/api/client', () => ({
  apiClient: jest.fn().mockResolvedValue({
    standards: [{ id: 'ISO_11119_3', name: 'Gas cylinders' }]
  })
}));
```

### Mock React Query

```typescript
// In test file
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);
```

### Mock Three.js

```typescript
// __mocks__/@react-three/fiber.tsx
export const Canvas = ({ children }) => (
  <div data-testid="three-canvas">{children}</div>
);

export const useFrame = jest.fn();
export const useThree = jest.fn(() => ({
  camera: {},
  scene: {},
  gl: {}
}));
```

## Test Coverage Requirements

| Component Type | Min Coverage |
|----------------|--------------|
| Screen Components | 80% |
| Hooks | 90% |
| API Client | 95% |
| Visualization | 70% |
| Mock Server Endpoints | 90% |

```bash
# Run coverage report
npm test -- --coverage

# Verify thresholds
npm test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80}}'
```

## Integration Tests

```typescript
// __tests__/integration/optimization-flow.test.tsx
describe('Optimization Flow Integration', () => {
  it('should complete optimization and show results', async () => {
    render(<App />);
    
    // Screen 1: Enter requirements
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '700 bar 150L tank' }
    });
    fireEvent.click(screen.getByText(/parse/i));
    await waitFor(() => screen.getByText(/continue/i));
    fireEvent.click(screen.getByText(/continue/i));
    
    // Screen 2: Configuration
    await waitFor(() => screen.getByText(/type iv/i));
    fireEvent.click(screen.getByText(/continue/i));
    
    // Screen 3: Optimization
    await waitFor(() => screen.getByText(/start/i));
    fireEvent.click(screen.getByText(/start/i));
    
    // Wait for SSE to complete
    await waitFor(() => screen.getByText(/complete/i), { timeout: 60000 });
    
    // Screen 4: Results
    await waitFor(() => screen.getByText(/design c/i));
    expect(screen.getByText(/79.3 kg/)).toBeInTheDocument();
  });
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- StressTab

# Run with coverage
npm test -- --coverage

# Run only changed files
npm test -- --onlyChanged
```
