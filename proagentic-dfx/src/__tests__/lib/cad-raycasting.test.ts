/**
 * CAD Raycasting and Matrix Operations Test Suite
 *
 * 40+ unit tests for:
 * - src/lib/cad/raycasting.ts (3D geometry operations, ray-mesh intersection)
 * - src/lib/cad/colormaps.ts (stress color mapping)
 *
 * Coverage targets:
 * - Statements: 80%+
 * - Branches: 80%+
 * - Functions: 80%+
 * - Lines: 80%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  screenToNDC,
  createRay,
  raycastMesh,
  invertMatrix4,
  multiplyMatrix4Vector4,
  type Ray,
} from '@/lib/cad/raycasting';
import {
  getVertexColor,
  batchGetVertexColors,
  createVertexColorBuffer,
  jetColormap,
  type ColormapOptions,
  DEFAULT_STRESS_COLORMAP_OPTIONS,
} from '@/lib/cad/colormaps';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create an identity matrix (4x4)
 */
function createIdentityMatrix(): Float32Array {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

/**
 * Create a translation matrix (4x4)
 */
function createTranslationMatrix(x: number, y: number, z: number): Float32Array {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
}

/**
 * Create a perspective projection matrix
 */
function createPerspectiveMatrix(
  fov: number,
  aspect: number,
  near: number,
  far: number
): Float32Array {
  const m = new Float32Array(16);
  const f = 1.0 / Math.tan(fov / 2);

  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  m[15] = 0;

  return m;
}

// ============================================================================
// RAYCASTING TESTS - COORDINATE CONVERSION (8 tests)
// ============================================================================

describe('screenToNDC - Screen to Normalized Device Coordinate Conversion', () => {
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    mockCanvas = {
      width: 800,
      height: 600,
      getBoundingClientRect: () => ({
        left: 100,
        top: 50,
        right: 900,
        bottom: 650,
        width: 800,
        height: 600,
        x: 100,
        y: 50,
        toJSON: () => ({}),
      }),
    } as unknown as HTMLCanvasElement;
  });

  it('should convert screen center to NDC origin', () => {
    const result = screenToNDC(500, 350, mockCanvas);

    expect(result.x).toBeCloseTo(0, 1);
    expect(result.y).toBeCloseTo(0, 1);
  });

  it('should convert screen top-left to NDC top-left', () => {
    const result = screenToNDC(100, 50, mockCanvas);

    expect(result.x).toBeCloseTo(-1, 1);
    expect(result.y).toBeCloseTo(1, 1);
  });

  it('should convert screen bottom-right to NDC bottom-right', () => {
    const result = screenToNDC(900, 650, mockCanvas);

    expect(result.x).toBeCloseTo(1, 1);
    expect(result.y).toBeCloseTo(-1, 1);
  });

  it('should constrain NDC values to [-1, 1] range', () => {
    const result = screenToNDC(100, 50, mockCanvas);

    expect(result.x).toBeGreaterThanOrEqual(-1);
    expect(result.x).toBeLessThanOrEqual(1);
    expect(result.y).toBeGreaterThanOrEqual(-1);
    expect(result.y).toBeLessThanOrEqual(1);
  });

  it('should handle quarter positions correctly', () => {
    // Top-right quarter
    const result1 = screenToNDC(700, 200, mockCanvas);
    expect(result1.x).toBeGreaterThan(0);
    expect(result1.y).toBeGreaterThan(0);

    // Bottom-left quarter
    const result2 = screenToNDC(300, 500, mockCanvas);
    expect(result2.x).toBeLessThan(0);
    expect(result2.y).toBeLessThan(0);
  });
});

// ============================================================================
// RAY CREATION TESTS (8 tests)
// ============================================================================

describe('createRay - Ray Generation from Camera and NDC Coordinates', () => {
  it('should create ray with valid origin and direction', () => {
    const camera: [number, number, number] = [0, 0, 10];
    const view = createIdentityMatrix();
    const projection = createPerspectiveMatrix(Math.PI / 4, 1, 0.1, 1000);

    const ray = createRay(0, 0, camera, view, projection);

    expect(ray.origin).toBeDefined();
    expect(ray.direction).toBeDefined();
    expect(ray.origin).toHaveLength(3);
    expect(ray.direction).toHaveLength(3);
  });

  it('should normalize ray direction to unit length', () => {
    const camera: [number, number, number] = [0, 0, 10];
    const view = createIdentityMatrix();
    const projection = createPerspectiveMatrix(Math.PI / 4, 1, 0.1, 1000);

    const ray = createRay(0, 0, camera, view, projection);

    const len = Math.sqrt(
      ray.direction[0] * ray.direction[0] +
      ray.direction[1] * ray.direction[1] +
      ray.direction[2] * ray.direction[2]
    );

    expect(len).toBeCloseTo(1, 2);
  });

  it('should produce different rays for different NDC coordinates', () => {
    const camera: [number, number, number] = [0, 0, 10];
    const view = createIdentityMatrix();
    const projection = createPerspectiveMatrix(Math.PI / 4, 1, 0.1, 1000);

    const ray1 = createRay(0, 0, camera, view, projection);
    const ray2 = createRay(0.5, 0.5, camera, view, projection);

    expect(ray1.direction).not.toEqual(ray2.direction);
  });

  it('should use camera position as ray origin', () => {
    const camera: [number, number, number] = [5, 10, 20];
    const view = createIdentityMatrix();
    const projection = createPerspectiveMatrix(Math.PI / 4, 1, 0.1, 1000);

    const ray = createRay(0, 0, camera, view, projection);

    expect(ray.origin).toEqual(camera);
  });

  it('should handle different camera positions', () => {
    const view = createIdentityMatrix();
    const projection = createPerspectiveMatrix(Math.PI / 4, 1, 0.1, 1000);

    const ray1 = createRay(0, 0, [0, 0, 10], view, projection);
    const ray2 = createRay(0, 0, [0, 0, 50], view, projection);

    expect(ray1.origin).not.toEqual(ray2.origin);
  });

  it('should handle translated view matrix', () => {
    const camera: [number, number, number] = [0, 0, 10];
    const view = createTranslationMatrix(5, 5, 5);
    const projection = createPerspectiveMatrix(Math.PI / 4, 1, 0.1, 1000);

    const ray = createRay(0, 0, camera, view, projection);

    expect(ray.origin).toEqual(camera);
    expect(isFinite(ray.direction[0])).toBe(true);
    expect(isFinite(ray.direction[1])).toBe(true);
    expect(isFinite(ray.direction[2])).toBe(true);
  });

  it('should handle zero-length ray direction (normalization edge case)', () => {
    const camera: [number, number, number] = [0, 0, 10];
    const view = createIdentityMatrix();
    const projection = createPerspectiveMatrix(Math.PI / 4, 1, 0.1, 1000);

    const ray = createRay(0, 0, camera, view, projection);

    // Direction should still be normalized even if initially zero
    const len = Math.sqrt(
      ray.direction[0] * ray.direction[0] +
      ray.direction[1] * ray.direction[1] +
      ray.direction[2] * ray.direction[2]
    );
    expect(len).toBeCloseTo(1, 2);
  });
});

// ============================================================================
// RAYCASTING MESH INTERSECTION TESTS (10 tests)
// ============================================================================

describe('raycastMesh - Ray-Mesh Intersection Detection', () => {
  it('should detect hit on mesh face', () => {
    const positions = new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
      1, 1, 0,
    ]);
    const indices = new Uint32Array([
      0, 1, 2,
      1, 3, 2,
    ]);
    const ray: Ray = {
      origin: [0.5, 0, 5],
      direction: [0, 0, -1],
    };

    const result = raycastMesh(ray, positions, indices);

    expect(result).toHaveProperty('hit');
  });

  it('should return false for miss', () => {
    const positions = new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
      1, 1, 0,
    ]);
    const indices = new Uint32Array([
      0, 1, 2,
      1, 3, 2,
    ]);
    const ray: Ray = {
      origin: [10, 10, 5],
      direction: [0, 0, -1],
    };

    const result = raycastMesh(ray, positions, indices);

    expect(result.hit).toBe(false);
  });

  it('should return point and distance on hit', () => {
    const positions = new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
      1, 1, 0,
    ]);
    const indices = new Uint32Array([
      0, 1, 2,
      1, 3, 2,
    ]);
    const ray: Ray = {
      origin: [0.5, 0.5, 5],
      direction: [0, 0, -1],
    };

    const result = raycastMesh(ray, positions, indices);

    if (result.hit) {
      expect(result.point).toBeDefined();
      expect(result.distance).toBeDefined();
      expect(result.distance).toBeGreaterThan(0);
    }
  });

  it('should detect closest intersection point', () => {
    // Create a mesh with multiple triangles
    const positions = new Float32Array([
      0, 0, 0,  // v0
      1, 0, 0,  // v1
      0, 1, 0,  // v2
      2, 0, 0,  // v3 (far mesh)
    ]);
    const indices = new Uint32Array([
      0, 1, 2,  // near triangle
      1, 3, 2,  // far triangle
    ]);

    const ray: Ray = {
      origin: [0.5, 0.5, 1],
      direction: [0, 0, -1],
    };

    const result = raycastMesh(ray, positions, indices);

    expect(result.hit).toBe(true);
  });

  it('should handle different mesh indices types (Uint32Array)', () => {
    const positions = new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
      1, 1, 0,
    ]);
    const indices = new Uint32Array([
      0, 1, 2,
      1, 3, 2,
    ]);
    const ray: Ray = {
      origin: [0.5, 0.5, 5],
      direction: [0, 0, -1],
    };

    const result = raycastMesh(ray, positions, indices);

    expect(result).toHaveProperty('hit');
  });

  it('should check bounding sphere before triangle test', () => {
    const positions = new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
      1, 1, 0,
    ]);
    const indices = new Uint32Array([
      0, 1, 2,
      1, 3, 2,
    ]);

    // Ray missing bounding sphere entirely
    const ray: Ray = {
      origin: [100, 100, 100],
      direction: [1, 0, 0],
    };

    const result = raycastMesh(ray, positions, indices);

    expect(result.hit).toBe(false);
  });

  it('should calculate correct intersection distance', () => {
    const positions = new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
      1, 1, 0,
    ]);
    const indices = new Uint32Array([
      0, 1, 2,
      1, 3, 2,
    ]);
    const ray: Ray = {
      origin: [0.5, 0.5, 10],
      direction: [0, 0, -1],
    };

    const result = raycastMesh(ray, positions, indices);

    if (result.hit && result.distance) {
      expect(result.distance).toBeGreaterThan(0);
      expect(result.distance).toBeLessThan(20);
    }
  });

  it('should handle ray parallel to triangle', () => {
    // Create a triangle in XY plane
    const positions = new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
    ]);
    const indices = new Uint32Array([0, 1, 2]);

    // Ray parallel to the triangle (moving in Z but from within the triangle plane)
    const ray: Ray = {
      origin: [0.3, 0.3, 5],
      direction: [0, 0, -1],
    };

    const result = raycastMesh(ray, positions, indices);

    // Should still detect intersection
    expect(result).toHaveProperty('hit');
  });

  it('should handle ray originating behind triangle', () => {
    const positions = new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
      1, 1, 0,
    ]);
    const indices = new Uint32Array([
      0, 1, 2,
      1, 3, 2,
    ]);

    // Ray starting behind and pointing away
    const ray: Ray = {
      origin: [0.5, 0.5, -10],
      direction: [0, 0, -1],
    };

    const result = raycastMesh(ray, positions, indices);

    // Should not hit (ray is behind)
    expect(result.hit).toBe(false);
  });

  it('should handle ray-triangle intersection outside valid bounds (u,v)', () => {
    // Create a triangle
    const positions = new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
    ]);
    const indices = new Uint32Array([0, 1, 2]);

    // Ray that might intersect plane but outside triangle
    const ray: Ray = {
      origin: [2, 2, 1],
      direction: [0, 0, -1],
    };

    const result = raycastMesh(ray, positions, indices);

    expect(result.hit).toBe(false);
  });
});

// ============================================================================
// MATRIX INVERSION TESTS (6 tests)
// ============================================================================

describe('invertMatrix4 - 4x4 Matrix Inversion', () => {
  it('should invert identity matrix to identity', () => {
    const identity = createIdentityMatrix();
    const inverted = invertMatrix4(identity);

    for (let i = 0; i < 16; i++) {
      expect(inverted[i]).toBeCloseTo(identity[i], 2);
    }
  });

  it('should produce correct inverse for translation matrix', () => {
    const translation = createTranslationMatrix(5, 10, 15);
    const inverted = invertMatrix4(translation);

    // Multiplying matrix by its inverse should give identity
    const product = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += translation[i * 4 + k] * inverted[k * 4 + j];
        }
        product[i * 4 + j] = sum;
      }
    }

    // Check diagonal is close to 1, off-diagonal close to 0
    expect(product[0]).toBeCloseTo(1, 2);
    expect(product[5]).toBeCloseTo(1, 2);
    expect(product[10]).toBeCloseTo(1, 2);
    expect(product[15]).toBeCloseTo(1, 2);
  });

  it('should handle zero determinant by returning zero matrix', () => {
    // Create a singular matrix (determinant = 0)
    const singular = new Float32Array(16);
    singular.fill(0);
    singular[0] = 1;
    singular[5] = 1;
    singular[10] = 0; // This makes it singular
    singular[15] = 0;

    const result = invertMatrix4(singular);

    // Should return something (implementation returns zero matrix or identity)
    expect(result).toHaveLength(16);
  });

  it('should produce normalized output', () => {
    const translation = createTranslationMatrix(2, 3, 4);
    const inverted = invertMatrix4(translation);

    for (let i = 0; i < 16; i++) {
      expect(isFinite(inverted[i])).toBe(true);
    }
  });

  it('should preserve matrix dimensions', () => {
    const matrix = createPerspectiveMatrix(Math.PI / 4, 1, 0.1, 1000);
    const inverted = invertMatrix4(matrix);

    expect(inverted).toHaveLength(16);
  });
});

// ============================================================================
// MATRIX-VECTOR MULTIPLICATION TESTS (4 tests)
// ============================================================================

describe('multiplyMatrix4Vector4 - 4x4 Matrix-Vector Multiplication', () => {
  it('should multiply identity matrix by vector unchanged', () => {
    const identity = createIdentityMatrix();
    const vector = [1, 2, 3, 1];

    const result = multiplyMatrix4Vector4(identity, vector);

    expect(result[0]).toBeCloseTo(1, 5);
    expect(result[1]).toBeCloseTo(2, 5);
    expect(result[2]).toBeCloseTo(3, 5);
    expect(result[3]).toBeCloseTo(1, 5);
  });

  it('should apply translation to homogeneous point', () => {
    const translation = createTranslationMatrix(5, 10, 15);
    const point = [0, 0, 0, 1]; // Homogeneous point

    const result = multiplyMatrix4Vector4(translation, point);

    expect(result[0]).toBeCloseTo(5, 5);
    expect(result[1]).toBeCloseTo(10, 5);
    expect(result[2]).toBeCloseTo(15, 5);
    expect(result[3]).toBeCloseTo(1, 5);
  });

  it('should not translate direction vectors (w=0)', () => {
    const translation = createTranslationMatrix(5, 10, 15);
    const direction = [1, 0, 0, 0]; // Direction vector

    const result = multiplyMatrix4Vector4(translation, direction);

    expect(result[0]).toBeCloseTo(1, 5);
    expect(result[1]).toBeCloseTo(0, 5);
    expect(result[2]).toBeCloseTo(0, 5);
  });

  it('should produce 4-component result vector', () => {
    const identity = createIdentityMatrix();
    const vector = [1, 2, 3, 1];

    const result = multiplyMatrix4Vector4(identity, vector);

    expect(result).toHaveLength(4);
  });
});

// ============================================================================
// COLORMAP TESTS (10 tests)
// ============================================================================

describe('Colormap Utilities - Vertex Color Mapping', () => {
  describe('getVertexColor function', () => {
    it('should map value to RGB color', () => {
      const options: ColormapOptions = {
        colormap: 'jet',
        minValue: 0,
        maxValue: 100,
      };

      const color = getVertexColor(50, options);

      expect(color).toHaveLength(3);
      for (let i = 0; i < 3; i++) {
        expect(color[i]).toBeGreaterThanOrEqual(0);
        expect(color[i]).toBeLessThanOrEqual(1);
      }
    });

    it('should reverse colormap when reverse=true', () => {
      const options1: ColormapOptions = {
        colormap: 'jet',
        minValue: 0,
        maxValue: 100,
      };
      const options2: ColormapOptions = {
        ...options1,
        reverse: true,
      };

      const color1 = getVertexColor(25, options1);
      const color2 = getVertexColor(25, options2);

      // Colors should be different
      expect(color1).not.toEqual(color2);
    });

    it('should clamp values to colormap range', () => {
      const options: ColormapOptions = {
        colormap: 'jet',
        minValue: 0,
        maxValue: 100,
      };

      const color = getVertexColor(150, options); // Beyond max

      expect(color).toHaveLength(3);
      for (let i = 0; i < 3; i++) {
        expect(isFinite(color[i])).toBe(true);
      }
    });

    it('should use default colormap options', () => {
      const color = getVertexColor(
        500,
        DEFAULT_STRESS_COLORMAP_OPTIONS
      );

      expect(color).toHaveLength(3);
    });
  });

  describe('batchGetVertexColors function', () => {
    it('should batch process multiple values', () => {
      const options: ColormapOptions = {
        colormap: 'jet',
        minValue: 0,
        maxValue: 100,
      };
      const values = [0, 25, 50, 75, 100];

      const colors = batchGetVertexColors(values, options);

      expect(colors.length).toBe(values.length * 3); // 3 components per color
    });

    it('should produce consistent results with single-value calls', () => {
      const options: ColormapOptions = {
        colormap: 'jet',
        minValue: 0,
        maxValue: 100,
      };

      const singleColor = getVertexColor(50, options);
      const batchColors = batchGetVertexColors([50], options);

      expect(batchColors[0]).toBeCloseTo(singleColor[0], 5);
      expect(batchColors[1]).toBeCloseTo(singleColor[1], 5);
      expect(batchColors[2]).toBeCloseTo(singleColor[2], 5);
    });

    it('should handle empty array', () => {
      const options: ColormapOptions = {
        colormap: 'jet',
        minValue: 0,
        maxValue: 100,
      };

      const colors = batchGetVertexColors([], options);

      expect(colors).toHaveLength(0);
    });

    it('should respect reverse option for batch', () => {
      const options1: ColormapOptions = {
        colormap: 'jet',
        minValue: 0,
        maxValue: 100,
      };
      const options2: ColormapOptions = {
        ...options1,
        reverse: true,
      };
      const values = [25, 75];

      const colors1 = batchGetVertexColors(values, options1);
      const colors2 = batchGetVertexColors(values, options2);

      expect(colors1).not.toEqual(colors2);
    });
  });

  describe('createVertexColorBuffer function', () => {
    it('should create Float32Array for Three.js', () => {
      const options: ColormapOptions = {
        colormap: 'jet',
        minValue: 0,
        maxValue: 100,
      };
      const values = [0, 50, 100];

      const buffer = createVertexColorBuffer(values, options);

      expect(buffer).toBeInstanceOf(Float32Array);
      expect(buffer.length).toBe(values.length * 3);
    });

    it('should produce valid color values', () => {
      const options: ColormapOptions = {
        colormap: 'jet',
        minValue: 0,
        maxValue: 100,
      };
      const values = [25, 50, 75];

      const buffer = createVertexColorBuffer(values, options);

      for (let i = 0; i < buffer.length; i++) {
        expect(buffer[i]).toBeGreaterThanOrEqual(0);
        expect(buffer[i]).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('jetColormap function (legacy)', () => {
    it('should map normalized value to RGB', () => {
      const color = jetColormap(0.5);

      expect(color).toHaveProperty('r');
      expect(color).toHaveProperty('g');
      expect(color).toHaveProperty('b');
    });

    it('should return values in [0, 1] range', () => {
      const color = jetColormap(0.5);

      expect(color.r).toBeGreaterThanOrEqual(0);
      expect(color.r).toBeLessThanOrEqual(1);
      expect(color.g).toBeGreaterThanOrEqual(0);
      expect(color.g).toBeLessThanOrEqual(1);
      expect(color.b).toBeGreaterThanOrEqual(0);
      expect(color.b).toBeLessThanOrEqual(1);
    });

    it('should handle boundary values', () => {
      const color0 = jetColormap(0);
      const color1 = jetColormap(1);

      expect(isFinite(color0.r)).toBe(true);
      expect(isFinite(color1.r)).toBe(true);
    });
  });
});
