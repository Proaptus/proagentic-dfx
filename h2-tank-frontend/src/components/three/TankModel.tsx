'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { DesignGeometry, StressNode } from '@/lib/types';

interface TankModelProps {
  geometry: DesignGeometry;
  stressNodes?: StressNode[];
  showStress: boolean;
  showWireframe: boolean;
  showCrossSection: boolean;
  autoRotate: boolean;
}

export function TankModel({
  geometry,
  stressNodes,
  showStress,
  showWireframe,
  showCrossSection,
  autoRotate,
}: TankModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Auto rotate
  useFrame(() => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  // Generate tank geometry
  const tankGeometry = useMemo(() => {
    const { dimensions, dome } = geometry;
    const r = dimensions.inner_radius_mm / 1000; // Convert to meters for scene
    const cylinderLength = dimensions.cylinder_length_mm / 1000;
    const domeDepth = dome.parameters.depth_mm / 1000;
    const wallThickness = dimensions.wall_thickness_mm / 1000;

    // Create composite geometry
    const points: THREE.Vector2[] = [];

    // Inner profile - dome
    dome.profile_points.forEach((p) => {
      points.push(new THREE.Vector2(p.r / 1000, p.z / 1000));
    });

    // Inner profile - cylinder
    points.push(new THREE.Vector2(r, 0));
    points.push(new THREE.Vector2(r, cylinderLength));

    // Inner profile - top dome (mirrored)
    [...dome.profile_points].reverse().forEach((p) => {
      points.push(new THREE.Vector2(p.r / 1000, cylinderLength + (domeDepth - p.z / 1000)));
    });

    const latheGeometry = new THREE.LatheGeometry(points, 64);
    return latheGeometry;
  }, [geometry]);

  // Generate stress colors
  const stressColors = useMemo(() => {
    if (!stressNodes || stressNodes.length === 0) return null;

    const colors: number[] = [];
    const positions = tankGeometry.attributes.position;
    const minStress = Math.min(...stressNodes.map((n) => n.value));
    const maxStress = Math.max(...stressNodes.map((n) => n.value));

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Find nearest stress node
      let nearestStress = minStress;
      let minDist = Infinity;

      stressNodes.forEach((node) => {
        const dx = x - node.x / 1000;
        const dy = y - node.y / 1000;
        const dz = z - node.z / 1000;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < minDist) {
          minDist = dist;
          nearestStress = node.value;
        }
      });

      // Map to color (jet colormap)
      const t = (nearestStress - minStress) / (maxStress - minStress);
      const color = jetColormap(t);
      colors.push(color.r, color.g, color.b);
    }

    return new THREE.Float32BufferAttribute(colors, 3);
  }, [stressNodes, tankGeometry]);

  // Apply colors to geometry
  if (stressColors && showStress) {
    tankGeometry.setAttribute('color', stressColors);
  }

  // Clipping plane for cross-section
  const clippingPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
    []
  );

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      {/* Main tank mesh */}
      <mesh geometry={tankGeometry}>
        <meshStandardMaterial
          color={showStress ? '#ffffff' : '#60A5FA'}
          vertexColors={showStress}
          wireframe={showWireframe}
          side={THREE.DoubleSide}
          clippingPlanes={showCrossSection ? [clippingPlane] : []}
          clipShadows={showCrossSection}
        />
      </mesh>

      {/* Cross-section cap */}
      {showCrossSection && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1, 2]} />
          <meshStandardMaterial
            color="#374151"
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Boss indicators */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 32]} />
        <meshStandardMaterial color="#1F2937" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, geometry.dimensions.total_length_mm / 1000, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 32]} />
        <meshStandardMaterial color="#1F2937" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Jet colormap (blue -> cyan -> green -> yellow -> red)
function jetColormap(t: number): { r: number; g: number; b: number } {
  let r = 0,
    g = 0,
    b = 0;

  if (t < 0.25) {
    r = 0;
    g = 4 * t;
    b = 1;
  } else if (t < 0.5) {
    r = 0;
    g = 1;
    b = 1 - 4 * (t - 0.25);
  } else if (t < 0.75) {
    r = 4 * (t - 0.5);
    g = 1;
    b = 0;
  } else {
    r = 1;
    g = 1 - 4 * (t - 0.75);
    b = 0;
  }

  return { r, g, b };
}
