/**
 * Raycasting Module for 3D CAD Viewer
 *
 * Provides ray-mesh intersection detection for measurement tools.
 * Converts mouse coordinates to 3D world space and detects intersections with tank geometry.
 */

export interface RaycastResult {
  hit: boolean;
  point?: { x: number; y: number; z: number };
  distance?: number;
  meshId?: string;
}

export interface Ray {
  origin: [number, number, number];
  direction: [number, number, number];
}

/**
 * Convert screen coordinates to Normalized Device Coordinates (NDC)
 * NDC range: x and y are in [-1, 1]
 */
export function screenToNDC(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();

  // Convert to canvas-relative coordinates
  const canvasX = clientX - rect.left;
  const canvasY = clientY - rect.top;

  // Convert to NDC (-1 to 1)
  const ndcX = (canvasX / canvas.width) * 2 - 1;
  const ndcY = -(canvasY / canvas.height) * 2 + 1; // Y is inverted in screen space

  return { x: ndcX, y: ndcY };
}

/**
 * Create a ray from camera through mouse position
 * Ray originates at camera and points into the scene
 */
export function createRay(
  ndcX: number,
  ndcY: number,
  cameraPosition: [number, number, number],
  viewMatrix: Float32Array,
  projectionMatrix: Float32Array
): Ray {
  // Create clip space point (NDC with z=-1 for near plane)
  const clipCoords = [ndcX, ndcY, -1.0, 1.0];

  // Invert projection matrix
  const invProjection = invertMatrix4(projectionMatrix);

  // Transform to eye/camera space
  const eyeCoords = multiplyMatrix4Vector4(invProjection, clipCoords);
  eyeCoords[2] = -1.0; // Forward direction in camera space
  eyeCoords[3] = 0.0;  // Direction vector (w=0)

  // Invert view matrix
  const invView = invertMatrix4(viewMatrix);

  // Transform to world space
  const worldCoords = multiplyMatrix4Vector4(invView, eyeCoords);

  // Normalize direction
  const direction: [number, number, number] = [
    worldCoords[0],
    worldCoords[1],
    worldCoords[2],
  ];

  const length = Math.sqrt(
    direction[0] * direction[0] +
    direction[1] * direction[1] +
    direction[2] * direction[2]
  );

  direction[0] /= length;
  direction[1] /= length;
  direction[2] /= length;

  return {
    origin: cameraPosition,
    direction,
  };
}

/**
 * Test ray against mesh using bounding sphere first, then triangle intersection
 * Uses Möller-Trumbore algorithm for triangle intersection
 */
export function raycastMesh(
  ray: Ray,
  positions: Float32Array,
  indices: Uint16Array | Uint32Array
): RaycastResult {
  // First check: Bounding sphere
  const boundingSphere = calculateBoundingSphere(positions);

  if (!intersectsSphere(ray, boundingSphere)) {
    return { hit: false };
  }

  // Second check: Triangle intersection
  let closestDistance = Infinity;
  let closestPoint: { x: number; y: number; z: number } | undefined;

  // Test each triangle
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i] * 3;
    const i1 = indices[i + 1] * 3;
    const i2 = indices[i + 2] * 3;

    const v0: [number, number, number] = [positions[i0], positions[i0 + 1], positions[i0 + 2]];
    const v1: [number, number, number] = [positions[i1], positions[i1 + 1], positions[i1 + 2]];
    const v2: [number, number, number] = [positions[i2], positions[i2 + 1], positions[i2 + 2]];

    const intersection = intersectTriangle(ray, v0, v1, v2);

    if (intersection && intersection.distance < closestDistance) {
      closestDistance = intersection.distance;
      closestPoint = intersection.point;
    }
  }

  if (closestPoint) {
    return {
      hit: true,
      point: closestPoint,
      distance: closestDistance,
    };
  }

  return { hit: false };
}

/**
 * Calculate bounding sphere for mesh
 */
function calculateBoundingSphere(positions: Float32Array): {
  center: [number, number, number];
  radius: number;
} {
  // Calculate center (average of all vertices)
  let cx = 0, cy = 0, cz = 0;
  const vertexCount = positions.length / 3;

  for (let i = 0; i < positions.length; i += 3) {
    cx += positions[i];
    cy += positions[i + 1];
    cz += positions[i + 2];
  }

  cx /= vertexCount;
  cy /= vertexCount;
  cz /= vertexCount;

  const center: [number, number, number] = [cx, cy, cz];

  // Calculate radius (max distance from center)
  let maxDistSq = 0;

  for (let i = 0; i < positions.length; i += 3) {
    const dx = positions[i] - cx;
    const dy = positions[i + 1] - cy;
    const dz = positions[i + 2] - cz;
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq > maxDistSq) {
      maxDistSq = distSq;
    }
  }

  return {
    center,
    radius: Math.sqrt(maxDistSq),
  };
}

/**
 * Test ray-sphere intersection
 */
function intersectsSphere(
  ray: Ray,
  sphere: { center: [number, number, number]; radius: number }
): boolean {
  const oc: [number, number, number] = [
    ray.origin[0] - sphere.center[0],
    ray.origin[1] - sphere.center[1],
    ray.origin[2] - sphere.center[2],
  ];

  const a = dot3(ray.direction, ray.direction);
  const b = 2.0 * dot3(oc, ray.direction);
  const c = dot3(oc, oc) - sphere.radius * sphere.radius;

  const discriminant = b * b - 4 * a * c;

  return discriminant >= 0;
}

/**
 * Möller-Trumbore ray-triangle intersection algorithm
 */
function intersectTriangle(
  ray: Ray,
  v0: [number, number, number],
  v1: [number, number, number],
  v2: [number, number, number]
): { point: { x: number; y: number; z: number }; distance: number } | null {
  const EPSILON = 0.0000001;

  // Edge vectors
  const edge1: [number, number, number] = [
    v1[0] - v0[0],
    v1[1] - v0[1],
    v1[2] - v0[2],
  ];

  const edge2: [number, number, number] = [
    v2[0] - v0[0],
    v2[1] - v0[1],
    v2[2] - v0[2],
  ];

  // Calculate determinant
  const h = cross3(ray.direction, edge2);
  const a = dot3(edge1, h);

  // Ray is parallel to triangle
  if (a > -EPSILON && a < EPSILON) {
    return null;
  }

  const f = 1.0 / a;
  const s: [number, number, number] = [
    ray.origin[0] - v0[0],
    ray.origin[1] - v0[1],
    ray.origin[2] - v0[2],
  ];

  const u = f * dot3(s, h);

  // Intersection outside triangle
  if (u < 0.0 || u > 1.0) {
    return null;
  }

  const q = cross3(s, edge1);
  const v = f * dot3(ray.direction, q);

  // Intersection outside triangle
  if (v < 0.0 || u + v > 1.0) {
    return null;
  }

  // Calculate distance along ray
  const t = f * dot3(edge2, q);

  // Intersection is behind ray origin
  if (t < EPSILON) {
    return null;
  }

  // Calculate intersection point
  const point = {
    x: ray.origin[0] + ray.direction[0] * t,
    y: ray.origin[1] + ray.direction[1] * t,
    z: ray.origin[2] + ray.direction[2] * t,
  };

  return { point, distance: t };
}

/**
 * Vector math utilities
 */
function dot3(a: [number, number, number], b: [number, number, number]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross3(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * Matrix math utilities
 */
export function invertMatrix4(m: Float32Array): Float32Array {
  const inv = new Float32Array(16);

  inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] +
           m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
  inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] -
           m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
  inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] +
           m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
  inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] -
            m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];

  inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] -
           m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
  inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] +
           m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
  inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] -
           m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
  inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] +
            m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];

  inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] +
           m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
  inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] -
           m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
  inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] +
            m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
  inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] -
            m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];

  inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] -
           m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
  inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] +
           m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
  inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] -
            m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
  inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] +
            m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

  const det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

  if (det === 0) {
    return new Float32Array(16); // Return identity matrix
  }

  const detInv = 1.0 / det;

  for (let i = 0; i < 16; i++) {
    inv[i] *= detInv;
  }

  return inv;
}

export function multiplyMatrix4Vector4(m: Float32Array, v: number[]): number[] {
  return [
    m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
    m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
    m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
    m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],
  ];
}
