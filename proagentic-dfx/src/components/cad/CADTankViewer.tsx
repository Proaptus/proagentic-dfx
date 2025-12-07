'use client';

/**
 * CAD Tank Viewer Component
 *
 * Pure WebGL-based 3D viewer for hydrogen tank visualization.
 * No Three.js dependency - uses raw WebGL for maximum control.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { WebGLRenderer } from './WebGLRenderer';
import { buildTankGeometry, applyStressColors, type TankGeometryResult } from '@/lib/cad/tank-geometry';
import type { DesignGeometry, StressNode } from '@/lib/types';

// Layer colors
const HELICAL_COLOR: [number, number, number] = [0.976, 0.451, 0.086]; // #F97316
const HOOP_COLOR: [number, number, number] = [0.055, 0.647, 0.914]; // #0EA5E9
const LINER_COLOR: [number, number, number] = [0.612, 0.639, 0.686]; // #9CA3AF
const BOSS_COLOR: [number, number, number] = [0.122, 0.161, 0.216]; // #1F2937

interface CADTankViewerProps {
  geometry: DesignGeometry;
  stressNodes?: StressNode[];
  showStress: boolean;
  showWireframe: boolean;
  showCrossSection: boolean;
  autoRotate: boolean;
  visibleLayers?: Set<number>;
  showLiner?: boolean;
  layerOpacity?: number;
}

export function CADTankViewer({
  geometry,
  stressNodes,
  showStress,
  showWireframe,
  showCrossSection,
  autoRotate,
  visibleLayers,
  showLiner = true,
  layerOpacity = 0.85,
}: CADTankViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef<[number, number]>([0.3, 0]);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geometryData, setGeometryData] = useState<TankGeometryResult | null>(null);

  // Build geometry when design changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const result = buildTankGeometry(geometry);
      if (result) {
        setGeometryData(result);
      } else {
        setError('Failed to build tank geometry');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [geometry]);

  // Initialize renderer and setup meshes
  useEffect(() => {
    if (!canvasRef.current || !geometryData) return;

    // Create renderer
    const renderer = new WebGLRenderer(canvasRef.current);
    rendererRef.current = renderer;

    // Calculate scale to fit tank in view
    const totalLength = geometry.dimensions.total_length_mm;
    const maxRadius = geometry.dimensions.outer_radius_mm;
    const scale = 1.5 / Math.max(totalLength, maxRadius * 2);

    // Add inner tank mesh (liner)
    if (showLiner) {
      const innerMesh = geometryData.inner;
      const scaledPositions = scalePositions(innerMesh.positions, scale);
      renderer.addMesh('liner', scaledPositions, innerMesh.normals, innerMesh.indices, LINER_COLOR, 0.6);
    }

    // Add layer meshes
    geometryData.layers.forEach((layer, index) => {
      const isVisible = !visibleLayers || visibleLayers.has(index);
      const color = layer.layer.type === 'helical' ? HELICAL_COLOR : HOOP_COLOR;
      const scaledPositions = scalePositions(layer.mesh.positions, scale);

      // Apply stress colors if enabled
      let mesh = layer.mesh;
      if (showStress && stressNodes && stressNodes.length > 0) {
        const minStress = Math.min(...stressNodes.map(n => n.value));
        const maxStress = Math.max(...stressNodes.map(n => n.value));
        mesh = applyStressColors(mesh, stressNodes, minStress, maxStress);
      }

      renderer.addMesh(
        `layer-${index}`,
        scaledPositions,
        mesh.normals,
        mesh.indices,
        showStress ? [1, 1, 1] : color,
        layerOpacity,
        mesh.colors
      );
      renderer.setMeshVisibility(`layer-${index}`, isVisible);
    });

    // Add outer surface mesh
    const outerMesh = geometryData.outer;
    const scaledOuter = scalePositions(outerMesh.positions, scale);
    renderer.addMesh('outer', scaledOuter, outerMesh.normals, outerMesh.indices, [0.3, 0.5, 0.7], 0.3);
    renderer.setMeshVisibility('outer', false); // Hidden by default

    // Add boss meshes
    geometryData.bosses.forEach((boss, index) => {
      const scaledBoss = scalePositions(boss.positions, scale);
      const zOffset = index === 0 ? -geometry.dome.parameters.depth_mm * scale : (geometry.dimensions.total_length_mm + geometry.dome.parameters.depth_mm) * scale;
      const offsetPositions = offsetMeshZ(scaledBoss, zOffset);
      renderer.addMesh(`boss-${index}`, offsetPositions, boss.normals, boss.indices, BOSS_COLOR, 1.0);
    });

    // Set initial camera position
    renderer.setCameraPosition([0, 0, 2]);
    renderer.setRotation(rotationRef.current[0], rotationRef.current[1]);
    renderer.setWireframe(showWireframe);
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
  }, [geometryData, showLiner, visibleLayers, showStress, stressNodes, layerOpacity]);

  // Update renderer settings when props change
  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.setWireframe(showWireframe);
  }, [showWireframe]);

  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.setClipping(showCrossSection, [0, 0, -1, 0]);
  }, [showCrossSection]);

  // Update layer opacity
  useEffect(() => {
    if (!rendererRef.current || !geometryData) return;
    geometryData.layers.forEach((_, index) => {
      rendererRef.current?.setMeshOpacity(`layer-${index}`, layerOpacity);
    });
  }, [layerOpacity, geometryData]);

  // Update layer visibility
  useEffect(() => {
    if (!rendererRef.current || !geometryData) return;
    geometryData.layers.forEach((_, index) => {
      const isVisible = !visibleLayers || visibleLayers.has(index);
      rendererRef.current?.setMeshVisibility(`layer-${index}`, isVisible);
    });
  }, [visibleLayers, geometryData]);

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
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const currentZoom = 1; // Would need to track this
    rendererRef.current.setZoom(currentZoom * delta);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Building CAD geometry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg">
        <div className="text-center text-red-600">
          <p className="font-medium">Geometry Error</p>
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

      {/* Overlay info */}
      <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg px-3 py-2 text-xs text-gray-600">
        <div>Layers: {geometryData?.layers.length || 0}</div>
        <div>Stress: {showStress ? 'ON' : 'OFF'}</div>
        {showCrossSection && <div className="text-blue-600">Cross-Section Active</div>}
      </div>

      {/* Color legend for stress view */}
      {showStress && (
        <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Stress (MPa)</div>
          <div className="flex items-center gap-2">
            <div
              className="w-20 h-3 rounded"
              style={{
                background: 'linear-gradient(to right, blue, cyan, green, yellow, red)',
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white/90 rounded-lg px-3 py-2 text-xs text-gray-500">
        Drag to rotate | Scroll to zoom
      </div>
    </div>
  );
}

// Utility functions
function scalePositions(positions: Float32Array, scale: number): Float32Array {
  const scaled = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i++) {
    scaled[i] = positions[i] * scale;
  }
  return scaled;
}

function offsetMeshZ(positions: Float32Array, zOffset: number): Float32Array {
  const offset = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    offset[i] = positions[i];
    offset[i + 1] = positions[i + 1] + zOffset;
    offset[i + 2] = positions[i + 2];
  }
  return offset;
}

export default CADTankViewer;
