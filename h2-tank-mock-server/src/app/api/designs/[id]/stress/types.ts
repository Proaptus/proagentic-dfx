/**
 * Type definitions for stress analysis API
 */

export interface LayerData {
  layer: number;
  type: 'helical' | 'hoop';
  angle_deg: number;
  thickness_mm: number;
  coverage: 'full' | 'cylinder';
}

export interface LayerStress {
  layer: number;
  type: string;
  angle_deg: number;
  sigma1_mpa: number;
  sigma2_mpa: number;
  tau12_mpa: number;
  tsai_wu: number;
  margin_percent: number;
}

export interface StressConcentration {
  location: { z_mm?: number; r_mm?: number; theta_deg?: number };
  scf: number;
  peak_stress_mpa: number;
  type: string;
}

export interface CriticalLocation {
  name: string;
  z: number;
  r: number;
  stress: number;
  is_max: boolean;
}

export interface StressPathPoint {
  z: number;
  stress: number;
}

export interface MeshNode {
  id: number;
  r: number;
  z: number;
  stress: number;
}

export interface MeshElement {
  id: number;
  nodes: [number, number, number];
  region: 'boss' | 'dome' | 'transition' | 'cylinder';
  centroid_stress: number;
}

export interface FEAMesh {
  nodes: MeshNode[];
  elements: MeshElement[];
  bounds: { r_min: number; r_max: number; z_min: number; z_max: number };
}

export interface Mesh3DNode {
  id: number;
  x: number;
  y: number;
  z: number;
  stress: number;
}

export interface FEAMesh3D {
  nodes: Mesh3DNode[];
  elements: MeshElement[];
  bounds: { x_min: number; x_max: number; y_min: number; y_max: number; z_min: number; z_max: number };
}

export interface DomeProfilePoint {
  r: number;
  z: number;
}
