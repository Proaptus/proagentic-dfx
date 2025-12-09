/**
 * Dome Profile Generators
 *
 * Generate various dome shape profiles for hydrogen pressure vessels.
 * Each profile type has different structural and manufacturing characteristics.
 */

export enum DomeProfileType {
  HEMISPHERICAL = 'HEMISPHERICAL',
  ISOTENSOID = 'ISOTENSOID',
  GEODESIC = 'GEODESIC',
  ELLIPTICAL = 'ELLIPTICAL',
  TORISPHERICAL = 'TORISPHERICAL',
}

export interface DomeProfile {
  type: DomeProfileType;
  points: { r: number; z: number }[]; // Radial and axial coordinates
  depth: number; // Total dome depth (mm)
  volume: number; // Dome volume (mm³)
  surfaceArea: number; // Dome surface area (mm²)
}

export interface DomeProfileParams {
  cylinderRadius: number; // mm
  bossRadius: number; // mm (opening at apex)
  targetDepth?: number; // mm (optional, computed if not provided)
  numPoints?: number; // Resolution
}

/**
 * Hemispherical Dome - Perfect half-sphere
 *
 * Pros: Optimal stress distribution, simple geometry
 * Cons: Large depth, difficult composite winding at apex
 * Best for: Type I/II all-metal tanks
 */
export function generateHemisphericalProfile(
  params: DomeProfileParams
): DomeProfile {
  const { cylinderRadius, bossRadius, numPoints = 50 } = params;
  const depth = cylinderRadius; // Hemisphere depth = radius
  const points: { r: number; z: number }[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints; // 0 at apex, 1 at cylinder
    const angle = (Math.PI / 2) * t; // 0 to 90 degrees

    let r = cylinderRadius * Math.sin(angle);
    const z = depth * (1 - Math.cos(angle));

    // Clamp to boss radius at apex
    r = Math.max(r, bossRadius);

    points.push({ r, z });
  }

  // Calculate volume (hemisphere minus boss cone)
  const volume = (2 / 3) * Math.PI * Math.pow(cylinderRadius, 3) -
    (1 / 3) * Math.PI * Math.pow(bossRadius, 2) * depth;

  // Calculate surface area
  const surfaceArea = 2 * Math.PI * Math.pow(cylinderRadius, 2);

  return {
    type: DomeProfileType.HEMISPHERICAL,
    points,
    depth,
    volume,
    surfaceArea,
  };
}

/**
 * Isotensoid Dome - Netting theory optimal shape
 *
 * Based on: r = R₀ × sin(α₀) / sin(α)
 * Where α varies from 90° at apex to α₀ at cylinder (typically 54.74°)
 *
 * Pros: Optimal for filament winding, uniform fiber stress
 * Cons: Shallower than hemisphere, requires precise winding
 * Best for: Type III/IV composite tanks
 */
export function generateIsotensoidProfile(
  params: DomeProfileParams & { windingAngle?: number }
): DomeProfile {
  const {
    cylinderRadius,
    bossRadius,
    targetDepth,
    numPoints = 50,
    windingAngle = 54.74, // Geodesic angle from netting theory
  } = params;

  const R0 = cylinderRadius;
  const alpha0 = (windingAngle * Math.PI) / 180;
  const points: { r: number; z: number }[] = [];

  // Compute depth if not provided
  const computedDepth = targetDepth || R0 * (1 - Math.sin(alpha0));

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints; // 0 at apex, 1 at cylinder

    // Alpha varies from 90° at apex to alpha0 at cylinder
    const alpha = alpha0 + (Math.PI / 2 - alpha0) * (1 - t);

    // Isotensoid equation
    let r = R0 * Math.sin(alpha0) / Math.sin(alpha);

    // Clamp to boss radius
    r = Math.max(r, bossRadius);

    // Z position scales with t
    const z = computedDepth * (1 - t);

    points.push({ r, z });
  }

  // Approximate volume using trapezoidal rule
  const volume = calculateProfileVolume(points);
  const surfaceArea = calculateProfileSurfaceArea(points);

  return {
    type: DomeProfileType.ISOTENSOID,
    points,
    depth: computedDepth,
    volume,
    surfaceArea,
  };
}

/**
 * Geodesic Dome - Icosahedron-based tessellation
 *
 * Pros: Excellent structural strength, minimal material
 * Cons: Complex manufacturing, not ideal for pressure vessels
 * Best for: Research/experimental tanks
 */
export function generateGeodesicProfile(
  params: DomeProfileParams & { frequency?: number }
): DomeProfile {
  const { cylinderRadius, bossRadius, numPoints = 50, frequency = 3 } = params;

  // Geodesic domes are typically 5/8 sphere for optimal structure
  const depth = cylinderRadius * 0.625;
  const points: { r: number; z: number }[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const angle = (Math.PI / 2) * Math.pow(t, 1.2); // Slight curve adjustment

    let r = cylinderRadius * Math.sin(angle);
    const z = depth * (1 - Math.cos(angle) / 0.625);

    r = Math.max(r, bossRadius);

    // Add slight geodesic faceting (simplified)
    const facetPhase = Math.sin(t * Math.PI * frequency) * 0.02 * cylinderRadius;
    r += facetPhase;

    points.push({ r, z });
  }

  const volume = calculateProfileVolume(points);
  const surfaceArea = calculateProfileSurfaceArea(points);

  return {
    type: DomeProfileType.GEODESIC,
    points,
    depth,
    volume,
    surfaceArea,
  };
}

/**
 * Elliptical Dome - Semi-ellipsoid
 *
 * Pros: Adjustable aspect ratio, smooth manufacturing
 * Cons: Non-uniform stress, requires thickness variation
 * Best for: Low-pressure tanks, specific packaging constraints
 */
export function generateEllipticalProfile(
  params: DomeProfileParams & { aspectRatio?: number }
): DomeProfile {
  const {
    cylinderRadius,
    bossRadius,
    numPoints = 50,
    aspectRatio = 0.6, // depth/radius ratio
  } = params;

  const depth = cylinderRadius * aspectRatio;
  const points: { r: number; z: number }[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;

    // Ellipse equation: (r/a)² + (z/b)² = 1
    // Solve for r given z
    const zNorm = 1 - t; // 1 at apex, 0 at cylinder
    const rNorm = Math.sqrt(1 - Math.pow(zNorm, 2));

    let r = cylinderRadius * rNorm;
    const z = depth * (1 - zNorm);

    r = Math.max(r, bossRadius);

    points.push({ r, z });
  }

  const volume = calculateProfileVolume(points);
  const surfaceArea = calculateProfileSurfaceArea(points);

  return {
    type: DomeProfileType.ELLIPTICAL,
    points,
    depth,
    volume,
    surfaceArea,
  };
}

/**
 * Torispherical Dome - ASME flanged & dished head
 *
 * Composed of:
 * - Crown radius (large spherical section)
 * - Knuckle radius (toroidal transition to cylinder)
 *
 * Pros: Standard for industrial pressure vessels, good manufacturability
 * Cons: Stress concentration at knuckle, heavier than optimized shapes
 * Best for: Type I/II industrial tanks
 */
export function generateTorisphericalProfile(
  params: DomeProfileParams & { crownRatio?: number; knuckleRatio?: number }
): DomeProfile {
  const {
    cylinderRadius,
    bossRadius,
    numPoints = 50,
    crownRatio = 1.0, // Crown radius / cylinder radius (ASME std: 1.0)
    knuckleRatio = 0.06, // Knuckle radius / cylinder radius (ASME std: 0.06)
  } = params;

  const R = cylinderRadius;
  const Rc = R * crownRatio; // Crown radius
  const rk = R * knuckleRatio; // Knuckle radius

  // Calculate depth
  const depth = Rc - Math.sqrt(Math.pow(Rc, 2) - Math.pow(R - rk, 2)) + rk;

  const points: { r: number; z: number }[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;

    let r: number, z: number;

    // Transition point between crown and knuckle
    const transitionR = R - rk;
    const transitionT = transitionR / R;

    if (t > transitionT) {
      // Knuckle region (toroidal)
      const angle = ((t - transitionT) / (1 - transitionT)) * (Math.PI / 2);
      r = transitionR + rk * Math.sin(angle);
      z = rk * (1 - Math.cos(angle));
    } else {
      // Crown region (spherical)
      const angle = Math.asin((t * R) / Rc);
      r = Rc * Math.sin(angle);
      z = depth - (Rc - Rc * Math.cos(angle));
    }

    r = Math.max(r, bossRadius);
    points.push({ r, z });
  }

  const volume = calculateProfileVolume(points);
  const surfaceArea = calculateProfileSurfaceArea(points);

  return {
    type: DomeProfileType.TORISPHERICAL,
    points,
    depth,
    volume,
    surfaceArea,
  };
}

/**
 * Calculate volume of revolution using trapezoidal rule
 */
function calculateProfileVolume(points: { r: number; z: number }[]): number {
  let volume = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const r1 = points[i].r;
    const r2 = points[i + 1].r;
    const dz = points[i + 1].z - points[i].z;

    // Volume of frustum
    volume += (Math.PI / 3) * dz * (r1 * r1 + r1 * r2 + r2 * r2);
  }
  return volume;
}

/**
 * Calculate surface area of revolution
 */
function calculateProfileSurfaceArea(points: { r: number; z: number }[]): number {
  let area = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const r1 = points[i].r;
    const r2 = points[i + 1].r;
    const z1 = points[i].z;
    const z2 = points[i + 1].z;

    const dr = r2 - r1;
    const dz = z2 - z1;
    const ds = Math.sqrt(dr * dr + dz * dz); // Arc length

    // Surface area of frustum
    area += Math.PI * (r1 + r2) * ds;
  }
  return area;
}

/**
 * Get dome profile by type
 */
export function generateDomeProfile(
  type: DomeProfileType,
  params: DomeProfileParams & Record<string, unknown>
): DomeProfile {
  switch (type) {
    case DomeProfileType.HEMISPHERICAL:
      return generateHemisphericalProfile(params);
    case DomeProfileType.ISOTENSOID:
      return generateIsotensoidProfile(params);
    case DomeProfileType.GEODESIC:
      return generateGeodesicProfile(params);
    case DomeProfileType.ELLIPTICAL:
      return generateEllipticalProfile(params);
    case DomeProfileType.TORISPHERICAL:
      return generateTorisphericalProfile(params);
    default:
      return generateIsotensoidProfile(params); // Default
  }
}
