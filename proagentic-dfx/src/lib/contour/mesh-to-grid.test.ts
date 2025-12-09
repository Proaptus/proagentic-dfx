/**
 * Unit tests for mesh-to-grid interpolation module
 */

import { describe, it, expect } from 'vitest';
import {
  meshToGrid,
  getGridValue,
  gridToPhysical,
  physicalToGrid,
  computeGridStats,
  type GridData,
} from './mesh-to-grid';
import type { FEAMesh } from '../types';

describe('meshToGrid', () => {
  // Create a simple test mesh: single triangle
  const createSimpleTriangleMesh = (): FEAMesh => ({
    nodes: [
      { id: 1, r: 0, z: 0, stress: 100 },
      { id: 2, r: 10, z: 0, stress: 200 },
      { id: 3, r: 5, z: 10, stress: 150 },
    ],
    elements: [
      {
        id: 1,
        nodes: [1, 2, 3],
        region: 'cylinder',
        centroid_stress: 150,
      },
    ],
    bounds: {
      r_min: 0,
      r_max: 10,
      z_min: 0,
      z_max: 10,
    },
  });

  it('should create grid with correct dimensions', () => {
    const mesh = createSimpleTriangleMesh();
    const grid = meshToGrid(mesh, 50, 50);

    expect(grid.width).toBe(50);
    expect(grid.height).toBe(50);
    expect(grid.values).toBeInstanceOf(Float32Array);
    expect(grid.values.length).toBe(2500);
    expect(grid.mask.length).toBe(2500);
  });

  it('should preserve mesh bounds', () => {
    const mesh = createSimpleTriangleMesh();
    const grid = meshToGrid(mesh, 50, 50);

    expect(grid.bounds).toEqual({
      r_min: 0,
      r_max: 10,
      z_min: 0,
      z_max: 10,
    });
  });

  it('should interpolate stress at triangle vertices correctly', () => {
    const mesh = createSimpleTriangleMesh();
    const grid = meshToGrid(mesh, 50, 50);

    // Check corners (should be close to vertex stress values)
    const bottomLeft = grid.values[0]; // r=0, z=0 -> stress=100
    const bottomRight = grid.values[49]; // r=10, z=0 -> stress=200

    // Allow some tolerance for grid discretization
    expect(bottomLeft).toBeCloseTo(100, 0);
    expect(bottomRight).toBeCloseTo(200, 0);
  });

  it('should mark points outside mesh in mask', () => {
    const mesh = createSimpleTriangleMesh();
    const grid = meshToGrid(mesh, 20, 20);

    // Count valid points (inside triangle)
    const validPoints = grid.mask.filter((m) => m).length;

    // Triangle should cover roughly half the bounding box
    // (exact count depends on grid resolution and triangle edges)
    expect(validPoints).toBeGreaterThan(0);
    expect(validPoints).toBeLessThan(grid.mask.length);
  });

  it('should handle auto-scaling for aspect ratio', () => {
    const mesh: FEAMesh = {
      nodes: [
        { id: 1, r: 0, z: 0, stress: 100 },
        { id: 2, r: 20, z: 0, stress: 200 },
        { id: 3, r: 10, z: 5, stress: 150 },
      ],
      elements: [
        {
          id: 1,
          nodes: [1, 2, 3],
          region: 'cylinder',
          centroid_stress: 150,
        },
      ],
      bounds: {
        r_min: 0,
        r_max: 20,
        z_min: 0,
        z_max: 5,
      },
    };

    const grid = meshToGrid(mesh); // Auto-scale

    // Aspect ratio = 20/5 = 4, so width should be ~4x height
    const aspectRatio = grid.width / grid.height;
    expect(aspectRatio).toBeCloseTo(4, 0);
  });
});

describe('getGridValue', () => {
  const createTestGrid = (): GridData => ({
    values: new Float32Array([1, 2, 3, 4, 5, 6]),
    width: 3,
    height: 2,
    bounds: { r_min: 0, r_max: 10, z_min: 0, z_max: 10 },
    mask: [true, true, true, true, false, true],
  });

  it('should return correct value for valid coordinates', () => {
    const grid = createTestGrid();
    expect(getGridValue(grid, 0, 0)).toBe(1);
    expect(getGridValue(grid, 2, 0)).toBe(3);
    expect(getGridValue(grid, 2, 1)).toBe(6); // Last element is valid
  });

  it('should return null for masked points', () => {
    const grid = createTestGrid();
    expect(getGridValue(grid, 1, 1)).toBeNull();
  });

  it('should return null for out-of-bounds coordinates', () => {
    const grid = createTestGrid();
    expect(getGridValue(grid, -1, 0)).toBeNull();
    expect(getGridValue(grid, 3, 0)).toBeNull();
    expect(getGridValue(grid, 0, 2)).toBeNull();
  });
});

describe('gridToPhysical', () => {
  const grid: GridData = {
    values: new Float32Array(9),
    width: 3,
    height: 3,
    bounds: { r_min: 0, r_max: 10, z_min: 0, z_max: 20 },
    mask: Array(9).fill(true),
  };

  it('should convert grid corners correctly', () => {
    expect(gridToPhysical(grid, 0, 0)).toEqual([0, 0]);
    expect(gridToPhysical(grid, 2, 0)).toEqual([10, 0]);
    expect(gridToPhysical(grid, 0, 2)).toEqual([0, 20]);
    expect(gridToPhysical(grid, 2, 2)).toEqual([10, 20]);
  });

  it('should convert grid center correctly', () => {
    const result = gridToPhysical(grid, 1, 1);
    expect(result).toBeTruthy();
    expect(result![0]).toBeCloseTo(5, 1);
    expect(result![1]).toBeCloseTo(10, 1);
  });

  it('should return null for out-of-bounds', () => {
    expect(gridToPhysical(grid, -1, 0)).toBeNull();
    expect(gridToPhysical(grid, 3, 0)).toBeNull();
  });
});

describe('physicalToGrid', () => {
  const grid: GridData = {
    values: new Float32Array(9),
    width: 3,
    height: 3,
    bounds: { r_min: 0, r_max: 10, z_min: 0, z_max: 20 },
    mask: Array(9).fill(true),
  };

  it('should convert physical corners correctly', () => {
    expect(physicalToGrid(grid, 0, 0)).toEqual([0, 0]);
    expect(physicalToGrid(grid, 10, 0)).toEqual([2, 0]);
    expect(physicalToGrid(grid, 0, 20)).toEqual([0, 2]);
    expect(physicalToGrid(grid, 10, 20)).toEqual([2, 2]);
  });

  it('should round to nearest grid point', () => {
    const result = physicalToGrid(grid, 5.2, 10.3);
    expect(result).toBeTruthy();
    expect(result![0]).toBe(1);
    expect(result![1]).toBe(1);
  });

  it('should return null for out-of-bounds', () => {
    expect(physicalToGrid(grid, -1, 0)).toBeNull();
    expect(physicalToGrid(grid, 11, 0)).toBeNull();
    expect(physicalToGrid(grid, 0, 21)).toBeNull();
  });
});

describe('computeGridStats', () => {
  it('should compute correct statistics', () => {
    const grid: GridData = {
      values: new Float32Array([10, 20, 30, 40, 50, NaN]),
      width: 3,
      height: 2,
      bounds: { r_min: 0, r_max: 10, z_min: 0, z_max: 10 },
      mask: [true, true, true, true, true, false],
    };

    const stats = computeGridStats(grid);

    expect(stats.min).toBe(10);
    expect(stats.max).toBe(50);
    expect(stats.mean).toBe(30); // (10+20+30+40+50)/5
    expect(stats.count).toBe(5);
  });

  it('should handle empty grid', () => {
    const grid: GridData = {
      values: new Float32Array([NaN, NaN, NaN]),
      width: 3,
      height: 1,
      bounds: { r_min: 0, r_max: 10, z_min: 0, z_max: 10 },
      mask: [false, false, false],
    };

    const stats = computeGridStats(grid);

    expect(stats.min).toBe(0);
    expect(stats.max).toBe(0);
    expect(stats.mean).toBe(0);
    expect(stats.count).toBe(0);
  });
});

describe('barycentric interpolation', () => {
  it('should interpolate linearly across triangle', () => {
    // Create a triangle with linear stress gradient
    const mesh: FEAMesh = {
      nodes: [
        { id: 1, r: 0, z: 0, stress: 0 },
        { id: 2, r: 100, z: 0, stress: 100 },
        { id: 3, r: 50, z: 100, stress: 50 },
      ],
      elements: [
        {
          id: 1,
          nodes: [1, 2, 3],
          region: 'cylinder',
          centroid_stress: 50,
        },
      ],
      bounds: {
        r_min: 0,
        r_max: 100,
        z_min: 0,
        z_max: 100,
      },
    };

    const grid = meshToGrid(mesh, 101, 101);

    // Check interpolation at centroid (should be ~50)
    const centroidValue = getGridValue(grid, 50, 33);
    expect(centroidValue).toBeCloseTo(50, 0);

    // Check interpolation along edges
    const edge1Midpoint = getGridValue(grid, 50, 0); // between (0,0) and (100,0)
    expect(edge1Midpoint).toBeCloseTo(50, 0);
  });
});
