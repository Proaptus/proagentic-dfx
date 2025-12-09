'use client';

/**
 * TankModel3D Component
 *
 * High-level React component for rendering 3D hydrogen tank models
 * using the existing WebGL renderer infrastructure.
 *
 * Features:
 * - Tank type selection (Type I-V)
 * - Dome profile customization
 * - Boss/port configuration
 * - Material visualization
 * - Interactive controls (rotation, zoom, pan)
 * - Cross-section view
 * - Region highlighting
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { WebGLRenderer } from '@/components/cad/WebGLRenderer';
import { TankType, getTankTypeSpec } from './tank-types';
import { DomeProfileType, generateDomeProfile } from './dome-profiles';
import { BossType, getBossGeometry } from './boss-components';
import { getMaterialVisual, applyMaterialColor } from './liner-materials';

export interface TankModel3DProps {
  // Geometry
  tankType: TankType;
  domeProfile: DomeProfileType;
  cylinderRadius: number; // mm
  cylinderLength: number; // mm
  bossConfig?: {
    type: BossType;
    innerDiameter: number;
    outerDiameter: number;
    length: number;
  };

  // Visual options
  showCrossSection?: boolean;
  autoRotate?: boolean;
  highlightRegion?: 'boss' | 'dome' | 'cylinder' | 'transition' | null;
  layerOpacity?: number;

  // Callbacks
  onRegionClick?: (region: string, point: { x: number; y: number; z: number }) => void;
}

interface Region {
  name: string;
  zMin: number;
  zMax: number;
  color: [number, number, number];
}

export function TankModel3D({
  tankType,
  domeProfile,
  cylinderRadius,
  cylinderLength,
  bossConfig,
  showCrossSection = false,
  autoRotate = false,
  highlightRegion = null,
  layerOpacity = 0.85,
  onRegionClick,
}: TankModel3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef<[number, number]>([0.3, 0]);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate tank geometry
  const buildTankModel = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      // Get tank type specification
      const typeSpec = getTankTypeSpec(tankType);

      // Generate dome profile
      const dome = generateDomeProfile(domeProfile, {
        cylinderRadius,
        bossRadius: bossConfig?.innerDiameter ? bossConfig.innerDiameter / 2 : 15,
        numPoints: 50,
      });

      // Generate boss geometry
      const boss = bossConfig
        ? getBossGeometry(bossConfig.type, {
            innerDiameter: bossConfig.innerDiameter,
            outerDiameter: bossConfig.outerDiameter,
            length: bossConfig.length,
          })
        : getBossGeometry(BossType.STANDARD_CYLINDRICAL, {
            innerDiameter: 20,
            outerDiameter: 40,
            length: 60,
          });

      // Build lathe mesh from dome profile
      const fullProfile: { r: number; z: number }[] = [];

      // Bottom dome (reversed)
      for (let i = dome.points.length - 1; i >= 0; i--) {
        fullProfile.push({ r: dome.points[i].r, z: -dome.points[i].z });
      }

      // Cylinder section
      fullProfile.push({ r: cylinderRadius, z: 0 });
      fullProfile.push({ r: cylinderRadius, z: cylinderLength });

      // Top dome
      for (const pt of dome.points) {
        fullProfile.push({ r: pt.r, z: cylinderLength + pt.z });
      }

      // Create layers based on tank type
      const layers: Array<{
        mesh: { positions: Float32Array; normals: Float32Array; indices: Uint32Array };
        color: [number, number, number];
        opacity: number;
        name: string;
      }> = [];

      let cumulativeRadius = cylinderRadius;

      for (let layerIdx = 0; layerIdx < typeSpec.materialLayers.length; layerIdx++) {
        const layer = typeSpec.materialLayers[layerIdx];
        const layerRadius = cumulativeRadius + layer.thickness;

        // Scale profile for this layer
        const layerProfile = fullProfile.map((pt) => ({
          r: (pt.r / cylinderRadius) * layerRadius,
          z: pt.z,
        }));

        const layerMesh = createLatheMesh(layerProfile, 64);

        // Get material visual
        const material = getMaterialVisual(layer.name);

        layers.push({
          mesh: layerMesh,
          color: material.color,
          opacity: layer.opacity * layerOpacity,
          name: layer.name,
        });

        cumulativeRadius = layerRadius;
      }

      return {
        layers,
        boss,
        dome,
        totalLength: cylinderLength + dome.depth * 2,
        maxRadius: cumulativeRadius,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to build tank model');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [tankType, domeProfile, cylinderRadius, cylinderLength, bossConfig, layerOpacity]);

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    const tankModel = buildTankModel();
    if (!tankModel) return;

    const renderer = new WebGLRenderer(canvasRef.current);
    rendererRef.current = renderer;

    // Calculate scale to fit
    const scale = 1.5 / Math.max(tankModel.totalLength, tankModel.maxRadius * 2);

    // Add layer meshes
    tankModel.layers.forEach((layer, idx) => {
      const scaledPositions = scalePositions(layer.mesh.positions, scale);
      renderer.addMesh(
        `layer-${idx}`,
        scaledPositions,
        layer.mesh.normals,
        layer.mesh.indices,
        layer.color,
        layer.opacity
      );
    });

    // Add bosses at both ends
    const bossZOffset = tankModel.dome.depth * scale;
    const scaledBoss = scalePositions(tankModel.boss.positions, scale);

    // Bottom boss
    const bottomBoss = offsetMeshZ(scaledBoss, -bossZOffset);
    renderer.addMesh('boss-bottom', bottomBoss, tankModel.boss.normals, tankModel.boss.indices, tankModel.boss.color, 1.0);

    // Top boss
    const topBoss = offsetMeshZ(scaledBoss, (cylinderLength + tankModel.dome.depth) * scale);
    renderer.addMesh('boss-top', topBoss, tankModel.boss.normals, tankModel.boss.indices, tankModel.boss.color, 1.0);

    // Set camera
    renderer.setCameraPosition([0, 0, 2]);
    renderer.setRotation(rotationRef.current[0], rotationRef.current[1]);
    renderer.setClipping(showCrossSection, [0, 0, -1, 0]);

    // Animation loop
    const animate = () => {
      if (autoRotate) {
        rotationRef.current[1] += 0.01;
        renderer.setRotation(rotationRef.current[0], rotationRef.current[1]);
      }
      renderer.render();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [buildTankModel, cylinderLength, autoRotate, showCrossSection]);

  // Update cross-section when prop changes
  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.setClipping(showCrossSection, [0, 0, -1, 0]);
  }, [showCrossSection]);

  // Mouse interaction handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current || !rendererRef.current) return;

    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;

    rotationRef.current[0] += dy * 0.01;
    rotationRef.current[1] += dx * 0.01;

    rendererRef.current.setRotation(rotationRef.current[0], rotationRef.current[1]);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!rendererRef.current) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    rendererRef.current.setZoom(delta);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Building tank model...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg">
        <div className="text-center text-red-600">
          <p className="font-medium">Model Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Tank info overlay */}
      <div className="absolute top-4 left-4 bg-white/90 rounded-lg px-3 py-2 text-xs">
        <div className="font-medium text-gray-700">{getTankTypeSpec(tankType).name}</div>
        <div className="text-gray-500">{domeProfile} dome</div>
        <div className="text-gray-500 mt-1">
          {cylinderRadius * 2}mm × {cylinderLength}mm
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg px-3 py-2 text-xs text-gray-500">
        Drag to rotate | Scroll to zoom
      </div>

      {/* Region legend */}
      {highlightRegion && (
        <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Highlighted Region</div>
          <div className="text-xs text-blue-600 capitalize">{highlightRegion}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Create lathe mesh from profile curve
 */
function createLatheMesh(
  profile: { r: number; z: number }[],
  segments: number
): { positions: Float32Array; normals: Float32Array; indices: Uint32Array } {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  // Generate vertices by revolving profile
  for (let i = 0; i < profile.length; i++) {
    const { r, z } = profile[i];
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      positions.push(r * Math.cos(theta), z, r * Math.sin(theta));

      // Compute normal
      const prev = profile[Math.max(0, i - 1)];
      const next = profile[Math.min(profile.length - 1, i + 1)];
      const dr = next.r - prev.r;
      const dz = next.z - prev.z;
      const len = Math.sqrt(dr * dr + dz * dz) || 1;
      const nr = dz / len;
      const nz = -dr / len;
      normals.push(nr * Math.cos(theta), nz, nr * Math.sin(theta));
    }
  }

  // Generate indices
  for (let i = 0; i < profile.length - 1; i++) {
    for (let j = 0; j < segments; j++) {
      const curr = i * (segments + 1) + j;
      const next = curr + segments + 1;
      indices.push(curr, next, curr + 1);
      indices.push(curr + 1, next, next + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint32Array(indices),
  };
}

/**
 * Scale mesh positions uniformly
 */
function scalePositions(positions: Float32Array, scale: number): Float32Array {
  const scaled = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i++) {
    scaled[i] = positions[i] * scale;
  }
  return scaled;
}

/**
 * Offset mesh along Z axis
 */
function offsetMeshZ(positions: Float32Array, zOffset: number): Float32Array {
  const offset = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    offset[i] = positions[i];
    offset[i + 1] = positions[i + 1] + zOffset;
    offset[i + 2] = positions[i + 2];
  }
  return offset;
}

export default TankModel3D;
