'use client';

/**
 * CAD Tank Viewer Component
 *
 * Pure WebGL-based 3D viewer for hydrogen tank visualization.
 * No Three.js dependency - uses raw WebGL for maximum control.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { WebGLRenderer } from './WebGLRenderer';
import { buildTankGeometry, applyStressColors, applyFEAStressColors, type TankGeometryResult } from '@/lib/cad/tank-geometry';
import type { DesignGeometry, StressNode, FEAMesh3D } from '@/lib/types';
import {
  createRay,
  raycastMesh,
  screenToNDC,
  invertMatrix4,
  multiplyMatrix4Vector4,
  type Ray
} from '@/lib/cad/raycasting';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

// Layer colors
const HELICAL_COLOR: [number, number, number] = [0.976, 0.451, 0.086]; // #F97316
const HOOP_COLOR: [number, number, number] = [0.055, 0.647, 0.914]; // #0EA5E9
const LINER_COLOR: [number, number, number] = [0.612, 0.639, 0.686]; // #9CA3AF
const BOSS_COLOR: [number, number, number] = [0.122, 0.161, 0.216]; // #1F2937

interface CADTankViewerProps {
  geometry: DesignGeometry;
  stressNodes?: StressNode[];
  feaMesh3D?: FEAMesh3D;  // Proper FEA mesh for stress visualization
  stressRange?: { min: number; max: number };  // Min/max stress values
  showStress: boolean;
  showWireframe: boolean;
  showCrossSection: boolean;
  sectionDirection?: 'x' | 'y' | 'z';
  sectionPosition?: number;  // -1 to 1
  autoRotate: boolean;
  visibleLayers?: Set<number>;
  showLiner?: boolean;
  layerOpacity?: number;
  onPointClick?: (point: { x: number; y: number; z: number }) => void;
}

export function CADTankViewer({
  geometry,
  stressNodes,
  feaMesh3D,
  stressRange,
  showStress,
  showWireframe,
  showCrossSection,
  sectionDirection = 'z',
  sectionPosition = 0,
  autoRotate,
  visibleLayers,
  showLiner = true,
  layerOpacity = 0.85,
  onPointClick,
}: CADTankViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef<[number, number]>([0.3, 0]);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geometryData, setGeometryData] = useState<TankGeometryResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [cameraPan, setCameraPan] = useState<[number, number, number]>([0, 0, 0]);

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

      // Apply stress colors if enabled - prefer FEA mesh over legacy stressNodes
      let mesh = layer.mesh;
      if (showStress) {
        if (feaMesh3D && feaMesh3D.nodes.length > 0) {
          // Use proper FEA 3D mesh data
          const minStress = stressRange?.min ?? Math.min(...feaMesh3D.nodes.map(n => n.stress));
          const maxStress = stressRange?.max ?? Math.max(...feaMesh3D.nodes.map(n => n.stress));
          mesh = applyFEAStressColors(mesh, feaMesh3D, minStress, maxStress);
        } else if (stressNodes && stressNodes.length > 0) {
          // Fallback to legacy stress nodes
          const minStress = Math.min(...stressNodes.map(n => n.value));
          const maxStress = Math.max(...stressNodes.map(n => n.value));
          mesh = applyStressColors(mesh, stressNodes, minStress, maxStress);
        }
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

    // Set clipping plane based on direction and position
    const clippingPlane = calculateClippingPlane(sectionDirection, sectionPosition);
    renderer.setClipping(showCrossSection, clippingPlane);

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
  }, [geometryData, showLiner, visibleLayers, showStress, stressNodes, feaMesh3D, stressRange, layerOpacity, geometry, autoRotate, showWireframe, showCrossSection, sectionDirection, sectionPosition]);

  // Update renderer settings when props change
  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.setWireframe(showWireframe);
  }, [showWireframe]);

  useEffect(() => {
    if (!rendererRef.current) return;
    const clippingPlane = calculateClippingPlane(sectionDirection, sectionPosition);
    rendererRef.current.setClipping(showCrossSection, clippingPlane);
  }, [showCrossSection, sectionDirection, sectionPosition]);

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
    startMouseRef.current = { x: e.clientX, y: e.clientY };
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

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Check if it was a click (small movement)
    const dist = Math.sqrt(
      Math.pow(e.clientX - startMouseRef.current.x, 2) +
      Math.pow(e.clientY - startMouseRef.current.y, 2)
    );

    if (dist < 5 && onPointClick && rendererRef.current && geometryData && canvasRef.current) {
      // Raycasting logic
      const { view, projection, model, cameraPosition } = rendererRef.current.getMatrices();
      const { x: ndcX, y: ndcY } = screenToNDC(e.clientX, e.clientY, canvasRef.current);
      const worldRay = createRay(ndcX, ndcY, cameraPosition, view, projection);

      // Transform ray to model space
      const invModel = invertMatrix4(model);
      const originLocal = multiplyMatrix4Vector4(invModel, [...worldRay.origin, 1]);
      const directionLocal = multiplyMatrix4Vector4(invModel, [...worldRay.direction, 0]);

      // Normalize local direction
      const len = Math.sqrt(
        directionLocal[0] * directionLocal[0] +
        directionLocal[1] * directionLocal[1] +
        directionLocal[2] * directionLocal[2]
      );
      
      const localRay: Ray = {
        origin: [originLocal[0], originLocal[1], originLocal[2]],
        direction: [
          directionLocal[0] / len,
          directionLocal[1] / len,
          directionLocal[2] / len
        ]
      };

      let closestDist = Infinity;
      let closestPointLocal: { x: number; y: number; z: number } | null = null;
      
      // Calculate scale factor used in renderer
      const totalLength = geometry.dimensions.total_length_mm;
      const maxRadius = geometry.dimensions.outer_radius_mm;
      const fitScale = 1.5 / Math.max(totalLength, maxRadius * 2);
      
      // Ray for centered objects (liner, layers) - transformed to Raw mm Space
      const rawRay: Ray = {
        origin: [localRay.origin[0]/fitScale, localRay.origin[1]/fitScale, localRay.origin[2]/fitScale],
        direction: localRay.direction
      };

      // Test Liner
      if (showLiner) {
        const hit = raycastMesh(rawRay, geometryData.inner.positions, geometryData.inner.indices);
        if (hit.hit && hit.distance !== undefined) {
          const distLocal = hit.distance * fitScale;
          if (distLocal < closestDist) {
            closestDist = distLocal;
            closestPointLocal = {
              x: hit.point!.x * fitScale,
              y: hit.point!.y * fitScale,
              z: hit.point!.z * fitScale
            };
          }
        }
      }

      // Test Layers
      geometryData.layers.forEach((layer, index) => {
        if (!visibleLayers || visibleLayers.has(index)) {
          const hit = raycastMesh(rawRay, layer.mesh.positions, layer.mesh.indices);
          if (hit.hit && hit.distance !== undefined) {
            const distLocal = hit.distance * fitScale;
            if (distLocal < closestDist) {
              closestDist = distLocal;
              closestPointLocal = {
                x: hit.point!.x * fitScale,
                y: hit.point!.y * fitScale,
                z: hit.point!.z * fitScale
              };
            }
          }
        }
      });

      // Test Bosses
      geometryData.bosses.forEach((boss, bossIdx) => {
         const zOffset = bossIdx === 0 
            ? -geometry.dome.parameters.depth_mm * fitScale 
            : (geometry.dimensions.total_length_mm + geometry.dome.parameters.depth_mm) * fitScale;
         
         const bossRay: Ray = {
            origin: [
                localRay.origin[0]/fitScale, 
                localRay.origin[1]/fitScale, 
                (localRay.origin[2] - zOffset)/fitScale
            ],
            direction: localRay.direction
         };
         
         const hit = raycastMesh(bossRay, boss.positions, boss.indices);
         if (hit.hit && hit.distance !== undefined) {
             const distLocal = hit.distance * fitScale;
             if (distLocal < closestDist) {
                 closestDist = distLocal;
                 closestPointLocal = {
                     x: hit.point!.x * fitScale,
                     y: hit.point!.y * fitScale,
                     z: hit.point!.z * fitScale + zOffset
                 };
             }
         }
      });

      if (closestPointLocal && onPointClick) {
        // Transform point back to World Space
        const pointLocalVec = [closestPointLocal.x, closestPointLocal.y, closestPointLocal.z, 1];
        const pointWorld = multiplyMatrix4Vector4(model, pointLocalVec);
        
        onPointClick({
            x: pointWorld[0],
            y: pointWorld[1],
            z: pointWorld[2]
        });
      }
    }
    
    isDraggingRef.current = false;
  }, [geometryData, onPointClick, showLiner, visibleLayers, geometry]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!rendererRef.current) return;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = currentZoom * delta;
    setCurrentZoom(newZoom);
    rendererRef.current.setZoom(newZoom);
  }, [currentZoom]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!rendererRef.current) return;

    const key = e.key.toLowerCase();

    // Camera preset views
    const viewPresets: Record<string, [number, number]> = {
      '1': [0, 0],              // Front
      'f': [0, 0],
      '2': [0, Math.PI],        // Back
      'b': [0, Math.PI],
      '3': [0, -Math.PI / 2],   // Left
      'l': [0, -Math.PI / 2],
      '4': [0, Math.PI / 2],    // Right
      'r': [0, Math.PI / 2],
      '5': [-Math.PI / 2, 0],   // Top
      't': [-Math.PI / 2, 0],
      '6': [Math.PI / 2, 0],    // Bottom
      'u': [Math.PI / 2, 0],
      '7': [0.5, 0.8],          // Isometric
      'i': [0.5, 0.8],
    };

    if (viewPresets[key]) {
      e.preventDefault();
      const [pitch, yaw] = viewPresets[key];
      rotationRef.current = [pitch, yaw];
      rendererRef.current.setRotation(pitch, yaw);
      return;
    }

    // Zoom controls
    if (key === '+' || key === '=') {
      e.preventDefault();
      const newZoom = Math.min(currentZoom * 1.1, 10);
      setCurrentZoom(newZoom);
      rendererRef.current.setZoom(newZoom);
      return;
    }

    if (key === '-') {
      e.preventDefault();
      const newZoom = Math.max(currentZoom * 0.9, 0.1);
      setCurrentZoom(newZoom);
      rendererRef.current.setZoom(newZoom);
      return;
    }

    if (key === '0') {
      e.preventDefault();
      setCurrentZoom(1);
      rendererRef.current.setZoom(1);
      setCameraPan([0, 0, 0]);
      rendererRef.current.setCameraPosition([0, 0, 2]);
      return;
    }

    // Pan camera with arrow keys
    const panSpeed = e.shiftKey ? 0.1 : 0.02;
    let newPan: [number, number, number] | null = null;

    if (key === 'arrowup') {
      e.preventDefault();
      newPan = [cameraPan[0], cameraPan[1] + panSpeed, cameraPan[2]];
    } else if (key === 'arrowdown') {
      e.preventDefault();
      newPan = [cameraPan[0], cameraPan[1] - panSpeed, cameraPan[2]];
    } else if (key === 'arrowleft') {
      e.preventDefault();
      newPan = [cameraPan[0] - panSpeed, cameraPan[1], cameraPan[2]];
    } else if (key === 'arrowright') {
      e.preventDefault();
      newPan = [cameraPan[0] + panSpeed, cameraPan[1], cameraPan[2]];
    }

    if (newPan) {
      setCameraPan(newPan);
      rendererRef.current.setCameraPosition([newPan[0], newPan[1], 2 + newPan[2]]);
      return;
    }

    // Help overlay
    if (key === '?' || (e.shiftKey && key === '/')) {
      e.preventDefault();
      setShowHelp(true);
      return;
    }

    if (key === 'escape') {
      e.preventDefault();
      if (showHelp) {
        setShowHelp(false);
      } else {
        // Reset view
        rotationRef.current = [0.3, 0];
        rendererRef.current.setRotation(0.3, 0);
        setCurrentZoom(1);
        rendererRef.current.setZoom(1);
        setCameraPan([0, 0, 0]);
        rendererRef.current.setCameraPosition([0, 0, 2]);
      }
      return;
    }

    // Note: Toggle features (Space/W/S/G) are controlled by parent component props
    // These would need to be exposed via callbacks if we want keyboard control
    // For now, showing the shortcuts in help but deferring implementation
  }, [currentZoom, cameraPan, showHelp]);

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
        tabIndex={0}
        className="w-full h-full rounded-lg cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        style={{ touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        aria-label="3D CAD tank viewer. Press ? for keyboard shortcuts. Use number keys 1-7 or F/B/L/R/T/U/I for camera views. Use +/- to zoom, arrow keys to pan."
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
        <div>Drag to rotate | Scroll to zoom</div>
        <div className="mt-1 text-blue-600">
          Press <kbd className="px-1 py-0.5 text-xs font-semibold bg-gray-100 border border-gray-300 rounded">?</kbd> for keyboard shortcuts
        </div>
      </div>

      {/* Camera Presets */}
      <div className="absolute bottom-4 right-4 flex gap-1">
        {[
          { label: 'Front', rotation: [0, 0] },
          { label: 'Back', rotation: [0, Math.PI] },
          { label: 'Left', rotation: [0, -Math.PI / 2] },
          { label: 'Right', rotation: [0, Math.PI / 2] },
          { label: 'Top', rotation: [-Math.PI / 2, 0] },
          { label: 'Bottom', rotation: [Math.PI / 2, 0] },
          { label: 'Iso', rotation: [0.5, 0.8] },
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              rotationRef.current = [preset.rotation[0], preset.rotation[1]];
              rendererRef.current?.setRotation(preset.rotation[0], preset.rotation[1]);
            }}
            className="px-2 py-1 text-xs bg-white/90 hover:bg-white rounded shadow-sm transition-colors"
            title={`${preset.label} view`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Keyboard Shortcuts Help Overlay */}
      <KeyboardShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

// Utility functions

/**
 * Calculate clipping plane based on direction and position
 * @param direction - 'x', 'y', or 'z' axis
 * @param position - Position along axis (-1 to 1)
 * @returns Clipping plane as [nx, ny, nz, d] where n is normal and d is offset
 */
function calculateClippingPlane(
  direction: 'x' | 'y' | 'z',
  position: number
): [number, number, number, number] {
  // Clipping plane equation: nx*x + ny*y + nz*z + d = 0
  // Positive side is kept, negative side is clipped

  switch (direction) {
    case 'x':
      // X-axis: clips perpendicular to X (YZ plane moving along X)
      // Normal points in +X direction
      return [1, 0, 0, -position];
    case 'y':
      // Y-axis: clips perpendicular to Y (XZ plane moving along Y)
      // Normal points in +Y direction
      return [0, 1, 0, -position];
    case 'z':
    default:
      // Z-axis: clips perpendicular to Z (XY plane moving along Z)
      // Normal points in +Z direction
      return [0, 0, 1, -position];
  }
}

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
