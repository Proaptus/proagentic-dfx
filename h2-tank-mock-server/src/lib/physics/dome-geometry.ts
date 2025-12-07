/**
 * Dome Geometry - Isotensoid Dome Profile
 * REQ-233: Implement isotensoid dome geometry generation
 *
 * Isotensoid dome: A dome shape where fiber stress is constant
 * governed by the differential equation:
 * dz/dr = -tan(α) × √(1 - (r/(r₀·sin(α₀)))²)
 *
 * Where:
 * - r = radial position
 * - z = axial position
 * - α₀ = initial winding angle at equator
 * - r₀ = cylinder radius
 */

/**
 * Point on dome profile
 */
export interface DomePoint {
  r: number; // Radial coordinate (mm)
  z: number; // Axial coordinate (mm)
}

/**
 * Generate isotensoid dome profile using ODE integration
 *
 * The isotensoid shape ensures constant fiber stress throughout the dome,
 * which is optimal for composite pressure vessels.
 *
 * @param r0 - Cylinder radius at equator (mm)
 * @param alpha0 - Initial winding angle at equator (degrees), typically 54.74°
 * @param bossRadius - Boss opening radius (mm)
 * @param numPoints - Number of points to generate (default 50)
 * @returns Array of dome profile points from equator to boss
 *
 * Example:
 * r0 = 175 mm
 * alpha0 = 54.74° (netting theory angle)
 * bossRadius = 25 mm
 */
export function generateIsotensoidDome(
  r0: number,
  alpha0: number,
  bossRadius: number,
  numPoints: number = 50
): DomePoint[] {
  if (r0 <= bossRadius) {
    throw new Error('Cylinder radius must be greater than boss radius');
  }
  if (alpha0 <= 0 || alpha0 >= 90) {
    throw new Error('Initial angle must be between 0 and 90 degrees');
  }
  if (numPoints < 10) {
    throw new Error('Number of points must be at least 10');
  }

  const points: DomePoint[] = [];
  const alpha0Rad = (alpha0 * Math.PI) / 180;
  const sinAlpha0 = Math.sin(alpha0Rad);
  const tanAlpha0 = Math.tan(alpha0Rad);

  // Start at cylinder-dome junction (equator)
  let z = 0;
  const dr = -(r0 - bossRadius) / numPoints; // Negative step (moving inward)

  for (let i = 0; i <= numPoints; i++) {
    const r = r0 + i * dr; // r decreases from r0 to bossRadius

    points.push({ r, z });

    if (i < numPoints) {
      // Calculate dz/dr using isotensoid ODE
      // dz/dr = -tan(α) × √(1 - (r/(r₀·sin α₀))²)
      const ratio = r / (r0 * sinAlpha0);

      if (ratio < 1) {
        // Valid geodesic path
        const dzdr = -tanAlpha0 * Math.sqrt(1 - ratio * ratio);
        z += dzdr * dr; // z increases as r decreases
      } else {
        // Beyond geodesic limit, use hemispherical approximation
        const dzdr = -Math.sqrt(r0 * r0 - r * r) / r;
        z += dzdr * dr;
      }
    }
  }

  return points;
}

/**
 * Calculate dome depth (apex height above equator)
 *
 * @param domePoints - Array of dome profile points
 * @returns Dome depth (mm)
 */
export function calculateDomeDepth(domePoints: DomePoint[]): number {
  if (domePoints.length === 0) {
    return 0;
  }
  const maxZ = Math.max(...domePoints.map(p => p.z));
  const minZ = Math.min(...domePoints.map(p => p.z));
  return maxZ - minZ;
}

/**
 * Generate hemispherical dome (simpler alternative to isotensoid)
 *
 * @param radius - Sphere radius (mm)
 * @param bossRadius - Boss opening radius (mm)
 * @param numPoints - Number of points to generate
 * @returns Array of dome profile points
 */
export function generateHemisphericalDome(
  radius: number,
  bossRadius: number,
  numPoints: number = 50
): DomePoint[] {
  const points: DomePoint[] = [];
  const dr = (radius - bossRadius) / numPoints;

  for (let i = 0; i <= numPoints; i++) {
    const r = radius - i * dr;
    // Sphere equation: z² + r² = R²
    const z = Math.sqrt(radius * radius - r * r);
    points.push({ r, z });
  }

  return points;
}

/**
 * Generate elliptical dome
 *
 * @param majorAxis - Major axis radius (mm)
 * @param minorAxis - Minor axis radius (mm)
 * @param bossRadius - Boss opening radius (mm)
 * @param numPoints - Number of points to generate
 * @returns Array of dome profile points
 */
export function generateEllipticalDome(
  majorAxis: number,
  minorAxis: number,
  bossRadius: number,
  numPoints: number = 50
): DomePoint[] {
  const points: DomePoint[] = [];
  const dr = (majorAxis - bossRadius) / numPoints;

  for (let i = 0; i <= numPoints; i++) {
    const r = majorAxis - i * dr;
    // Ellipse equation: (r/a)² + (z/b)² = 1
    const z = minorAxis * Math.sqrt(1 - (r / majorAxis) ** 2);
    points.push({ r, z });
  }

  return points;
}

/**
 * Calculate surface area of dome from profile points
 * Uses surface of revolution formula: A = 2π ∫ r ds
 *
 * @param domePoints - Array of dome profile points
 * @returns Surface area (mm²)
 */
export function calculateDomeSurfaceArea(domePoints: DomePoint[]): number {
  if (domePoints.length < 2) {
    return 0;
  }

  let area = 0;
  for (let i = 0; i < domePoints.length - 1; i++) {
    const p1 = domePoints[i];
    const p2 = domePoints[i + 1];

    // Average radius
    const rAvg = (p1.r + p2.r) / 2;

    // Arc length ds = √(dr² + dz²)
    const dr = p2.r - p1.r;
    const dz = p2.z - p1.z;
    const ds = Math.sqrt(dr * dr + dz * dz);

    // dA = 2π r ds
    area += 2 * Math.PI * rAvg * ds;
  }

  return area;
}

/**
 * Calculate volume enclosed by dome
 * Uses disk method: V = π ∫ r² dz
 *
 * @param domePoints - Array of dome profile points
 * @returns Volume (mm³)
 */
export function calculateDomeVolume(domePoints: DomePoint[]): number {
  if (domePoints.length < 2) {
    return 0;
  }

  let volume = 0;
  for (let i = 0; i < domePoints.length - 1; i++) {
    const p1 = domePoints[i];
    const p2 = domePoints[i + 1];

    // Average radius squared
    const r2Avg = (p1.r * p1.r + p2.r * p2.r) / 2;

    // Height increment
    const dz = p2.z - p1.z;

    // dV = π r² dz
    volume += Math.PI * r2Avg * dz;
  }

  return volume;
}

/**
 * Calculate fiber angle at any point on isotensoid dome
 * Based on geodesic winding condition
 *
 * @param r - Radial position (mm)
 * @param r0 - Cylinder radius (mm)
 * @param alpha0 - Initial angle at equator (degrees)
 * @returns Fiber angle at position r (degrees)
 */
export function calculateFiberAngle(
  r: number,
  r0: number,
  alpha0: number
): number {
  const alpha0Rad = (alpha0 * Math.PI) / 180;
  const sinAlpha0 = Math.sin(alpha0Rad);

  // Geodesic condition: r sin(α) = r₀ sin(α₀) = constant
  const sinAlpha = (r0 * sinAlpha0) / r;

  // Clamp to valid range [-1, 1]
  const sinAlphaClamped = Math.max(-1, Math.min(1, sinAlpha));

  const alphaRad = Math.asin(sinAlphaClamped);
  const alphaDeg = (alphaRad * 180) / Math.PI;

  return alphaDeg;
}

/**
 * Calculate thickness variation in dome
 * For isotensoid dome, thickness varies as: t(r) = t₀ × (r₀/r) × sin(α₀)/sin(α)
 *
 * @param r - Radial position (mm)
 * @param r0 - Cylinder radius (mm)
 * @param t0 - Cylinder thickness (mm)
 * @param alpha0 - Initial angle at equator (degrees)
 * @returns Thickness at position r (mm)
 */
export function calculateDomeThickness(
  r: number,
  r0: number,
  t0: number,
  alpha0: number
): number {
  const alpha0Rad = (alpha0 * Math.PI) / 180;
  const sinAlpha0 = Math.sin(alpha0Rad);

  // Calculate local fiber angle
  const alphaRad = Math.asin(Math.min(1, (r0 * sinAlpha0) / r));
  const sinAlpha = Math.sin(alphaRad);

  // Thickness variation
  const thickness = t0 * (r0 / r) * (sinAlpha0 / sinAlpha);

  return thickness;
}
