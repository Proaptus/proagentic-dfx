'use client';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGeometryLoader } from '@/components/viewer/useGeometryLoader';

// Mock the API functions
vi.mock('@/lib/api/client', () => ({
  getDesignGeometry: vi.fn(),
  getDesign: vi.fn(),
}));

import { getDesignGeometry, getDesign } from '@/lib/api/client';

const mockGeometry = {
  vertices: [0, 0, 0, 1, 1, 1],
  indices: [0, 1, 2],
  normals: [0, 1, 0],
};

const mockSummary = {
  id: 'design-1',
  name: 'Test Design',
  score: 0.85,
};

describe('useGeometryLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null geometry when no design is selected', () => {
    const { result } = renderHook(() => useGeometryLoader(null));

    expect(result.current.geometry).toBeNull();
    expect(result.current.summary).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.loadError).toBeNull();
  });

  it('should load geometry when design is selected', async () => {
    vi.mocked(getDesignGeometry).mockResolvedValue(mockGeometry);
    vi.mocked(getDesign).mockResolvedValue(mockSummary);

    const { result } = renderHook(() => useGeometryLoader('design-1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.geometry).toEqual(mockGeometry);
    expect(result.current.summary).toEqual(mockSummary);
    expect(result.current.loadError).toBeNull();
  });

  it('should handle load errors', async () => {
    vi.mocked(getDesignGeometry).mockRejectedValue(new Error('Network error'));
    vi.mocked(getDesign).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useGeometryLoader('design-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loadError).toBe('Network error');
    expect(result.current.geometry).toBeNull();
  });

  it('should handle generic error without message', async () => {
    vi.mocked(getDesignGeometry).mockRejectedValue('Unknown error');
    vi.mocked(getDesign).mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useGeometryLoader('design-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loadError).toBe('Failed to load geometry data. Check server connection.');
  });

  it('should not retry when no design is selected', () => {
    const { result } = renderHook(() => useGeometryLoader(null));

    result.current.retryLoadGeometry();

    expect(result.current.loading).toBe(false);
    expect(getDesignGeometry).not.toHaveBeenCalled();
  });

  it('should expose retryLoadGeometry function', () => {
    const { result } = renderHook(() => useGeometryLoader('design-1'));

    expect(typeof result.current.retryLoadGeometry).toBe('function');
  });

  it('should call APIs when retrying after error', async () => {
    vi.mocked(getDesignGeometry).mockRejectedValueOnce(new Error('First attempt'));
    vi.mocked(getDesign).mockRejectedValueOnce(new Error('First attempt'));

    const { result } = renderHook(() => useGeometryLoader('design-1'));

    await waitFor(() => {
      expect(result.current.loadError).toBe('First attempt');
    });

    // Clear mocks and setup successful response for retry
    vi.clearAllMocks();
    vi.mocked(getDesignGeometry).mockResolvedValueOnce(mockGeometry);
    vi.mocked(getDesign).mockResolvedValueOnce(mockSummary);

    result.current.retryLoadGeometry();

    // Verify APIs were called again
    expect(getDesignGeometry).toHaveBeenCalledWith('design-1');
    expect(getDesign).toHaveBeenCalledWith('design-1');
  });

  it('should clear error on successful retry', async () => {
    vi.mocked(getDesignGeometry).mockRejectedValueOnce(new Error('First attempt'));
    vi.mocked(getDesign).mockRejectedValueOnce(new Error('First attempt'));

    const { result } = renderHook(() => useGeometryLoader('design-1'));

    await waitFor(() => {
      expect(result.current.loadError).toBe('First attempt');
    });

    // Setup successful response for retry
    vi.mocked(getDesignGeometry).mockResolvedValueOnce(mockGeometry);
    vi.mocked(getDesign).mockResolvedValueOnce(mockSummary);

    result.current.retryLoadGeometry();

    await waitFor(() => {
      expect(result.current.geometry).toEqual(mockGeometry);
    });

    expect(result.current.loadError).toBeNull();
    expect(result.current.summary).toEqual(mockSummary);
  });
});
