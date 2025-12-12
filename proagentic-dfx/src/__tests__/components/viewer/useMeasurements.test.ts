'use client';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMeasurements } from '@/components/viewer/useMeasurements';

// Mock the MeasurementTools module
vi.mock('@/components/viewer/MeasurementTools', () => ({
  calculateDistance: vi.fn((p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }),
  calculateAngle: vi.fn(() => 45),
  calculateRadius: vi.fn((p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz) / 2;
  }),
}));

describe('useMeasurements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null measurement mode', () => {
    const { result } = renderHook(() => useMeasurements());

    expect(result.current.measurementMode).toBeNull();
    expect(result.current.measurements).toEqual([]);
    expect(result.current.pendingPoints).toEqual([]);
  });

  it('should set measurement mode', () => {
    const { result } = renderHook(() => useMeasurements());

    act(() => {
      result.current.setMeasurementMode('distance');
    });

    expect(result.current.measurementMode).toBe('distance');
  });

  it('should not add points when measurement mode is null', () => {
    const { result } = renderHook(() => useMeasurements());

    act(() => {
      result.current.handlePointClick({ x: 0, y: 0, z: 0 });
    });

    expect(result.current.pendingPoints).toEqual([]);
  });

  it('should add pending points when measurement mode is set', () => {
    const { result } = renderHook(() => useMeasurements());

    act(() => {
      result.current.setMeasurementMode('distance');
    });

    act(() => {
      result.current.handlePointClick({ x: 0, y: 0, z: 0 });
    });

    expect(result.current.pendingPoints).toHaveLength(1);
    expect(result.current.pendingPoints[0]).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('should create distance measurement when two points are collected', () => {
    const { result } = renderHook(() => useMeasurements());

    act(() => {
      result.current.setMeasurementMode('distance');
    });

    act(() => {
      result.current.handlePointClick({ x: 0, y: 0, z: 0 });
    });

    act(() => {
      result.current.handlePointClick({ x: 10, y: 0, z: 0 });
    });

    expect(result.current.measurements).toHaveLength(1);
    expect(result.current.measurements[0].type).toBe('distance');
    expect(result.current.measurements[0].value).toBe(10);
    expect(result.current.measurements[0].unit).toBe('mm');
    expect(result.current.pendingPoints).toEqual([]);
  });

  it('should create angle measurement when three points are collected', () => {
    const { result } = renderHook(() => useMeasurements());

    act(() => {
      result.current.setMeasurementMode('angle');
    });

    act(() => {
      result.current.handlePointClick({ x: 0, y: 0, z: 0 });
    });

    act(() => {
      result.current.handlePointClick({ x: 5, y: 5, z: 0 });
    });

    act(() => {
      result.current.handlePointClick({ x: 10, y: 0, z: 0 });
    });

    expect(result.current.measurements).toHaveLength(1);
    expect(result.current.measurements[0].type).toBe('angle');
    expect(result.current.measurements[0].value).toBe(45);
    expect(result.current.measurements[0].unit).toBe('°');
    expect(result.current.pendingPoints).toEqual([]);
  });

  it('should create radius measurement when two points are collected', () => {
    const { result } = renderHook(() => useMeasurements());

    act(() => {
      result.current.setMeasurementMode('radius');
    });

    act(() => {
      result.current.handlePointClick({ x: 0, y: 0, z: 0 });
    });

    act(() => {
      result.current.handlePointClick({ x: 10, y: 0, z: 0 });
    });

    expect(result.current.measurements).toHaveLength(1);
    expect(result.current.measurements[0].type).toBe('radius');
    expect(result.current.measurements[0].value).toBe(5);
    expect(result.current.measurements[0].unit).toBe('mm');
  });

  it('should clear all measurements', () => {
    const { result } = renderHook(() => useMeasurements());

    act(() => {
      result.current.setMeasurementMode('distance');
    });

    act(() => {
      result.current.handlePointClick({ x: 0, y: 0, z: 0 });
      result.current.handlePointClick({ x: 10, y: 0, z: 0 });
    });

    expect(result.current.measurements).toHaveLength(1);

    act(() => {
      result.current.clearMeasurements();
    });

    expect(result.current.measurements).toEqual([]);
    expect(result.current.pendingPoints).toEqual([]);
  });

  it('should delete a specific measurement', () => {
    const { result } = renderHook(() => useMeasurements());

    act(() => {
      result.current.setMeasurementMode('distance');
    });

    act(() => {
      result.current.handlePointClick({ x: 0, y: 0, z: 0 });
      result.current.handlePointClick({ x: 10, y: 0, z: 0 });
    });

    const measurementId = result.current.measurements[0].id;

    act(() => {
      result.current.deleteMeasurement(measurementId);
    });

    expect(result.current.measurements).toEqual([]);
  });

  it('should clear pending points', () => {
    const { result } = renderHook(() => useMeasurements());

    act(() => {
      result.current.setMeasurementMode('distance');
    });

    act(() => {
      result.current.handlePointClick({ x: 0, y: 0, z: 0 });
    });

    expect(result.current.pendingPoints).toHaveLength(1);

    act(() => {
      result.current.clearPendingPoints();
    });

    expect(result.current.pendingPoints).toEqual([]);
  });

  it('should store measurements with timestamp', () => {
    const { result } = renderHook(() => useMeasurements());

    act(() => {
      result.current.setMeasurementMode('distance');
    });

    act(() => {
      result.current.handlePointClick({ x: 0, y: 0, z: 0 });
      result.current.handlePointClick({ x: 10, y: 0, z: 0 });
    });

    expect(result.current.measurements[0].timestamp).toBeDefined();
    expect(typeof result.current.measurements[0].timestamp).toBe('number');
  });

  it('should prepend new measurements to the list', () => {
    const { result } = renderHook(() => useMeasurements());

    act(() => {
      result.current.setMeasurementMode('distance');
    });

    // First measurement
    act(() => {
      result.current.handlePointClick({ x: 0, y: 0, z: 0 });
      result.current.handlePointClick({ x: 10, y: 0, z: 0 });
    });

    const firstId = result.current.measurements[0].id;

    // Second measurement
    act(() => {
      result.current.handlePointClick({ x: 0, y: 0, z: 0 });
      result.current.handlePointClick({ x: 20, y: 0, z: 0 });
    });

    // Newest should be first
    expect(result.current.measurements).toHaveLength(2);
    expect(result.current.measurements[0].value).toBe(20);
    expect(result.current.measurements[1].id).toBe(firstId);
  });

  it('should store points with each measurement', () => {
    const { result } = renderHook(() => useMeasurements());

    act(() => {
      result.current.setMeasurementMode('distance');
    });

    const p1 = { x: 0, y: 0, z: 0 };
    const p2 = { x: 10, y: 0, z: 0 };

    act(() => {
      result.current.handlePointClick(p1);
      result.current.handlePointClick(p2);
    });

    expect(result.current.measurements[0].points).toEqual([p1, p2]);
  });
});
