/**
 * Pure WebGL Renderer for CAD Visualization
 * No Three.js dependency - raw WebGL implementation
 */

// Vertex shader with support for vertex colors and normals
const VERTEX_SHADER = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  attribute vec3 aColor;

  uniform mat4 uProjectionMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uModelMatrix;
  uniform mat3 uNormalMatrix;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vColor;

  void main() {
    vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
    vPosition = worldPosition.xyz;
    vNormal = uNormalMatrix * aNormal;
    vColor = aColor;
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
  }
`;

// Fragment shader with Phong lighting and stress coloring
const FRAGMENT_SHADER = `
  precision mediump float;

  uniform vec3 uLightPosition;
  uniform vec3 uCameraPosition;
  uniform vec3 uBaseColor;
  uniform float uUseVertexColors;
  uniform float uOpacity;
  uniform int uWireframe;
  uniform vec4 uClipPlane;
  uniform int uEnableClipping;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vColor;

  void main() {
    // Clipping plane
    if (uEnableClipping == 1) {
      if (dot(vPosition, uClipPlane.xyz) + uClipPlane.w < 0.0) {
        discard;
      }
    }

    vec3 color = uUseVertexColors > 0.5 ? vColor : uBaseColor;

    if (uWireframe == 1) {
      gl_FragColor = vec4(color, uOpacity);
      return;
    }

    // Phong lighting
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightPosition - vPosition);
    vec3 viewDir = normalize(uCameraPosition - vPosition);
    vec3 reflectDir = reflect(-lightDir, normal);

    // Ambient
    float ambient = 0.3;

    // Diffuse
    float diff = max(dot(normal, lightDir), 0.0);
    float diffuse = 0.6 * diff;

    // Specular
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    float specular = 0.2 * spec;

    vec3 result = color * (ambient + diffuse) + vec3(1.0) * specular;
    gl_FragColor = vec4(result, uOpacity);
  }
`;

export interface MeshBuffer {
  vertexBuffer: WebGLBuffer;
  normalBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  colorBuffer?: WebGLBuffer;
  indexCount: number;
  color: [number, number, number];
  opacity: number;
  visible: boolean;
}

export interface Camera {
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
  fov: number;
  near: number;
  far: number;
}

export class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private meshes: Map<string, MeshBuffer> = new Map();
  private camera: Camera;
  private rotation: [number, number] = [0, 0];
  private zoom: number = 1;
  private wireframe: boolean = false;
  private clipPlane: [number, number, number, number] = [0, 0, 1, 0];
  private enableClipping: boolean = false;

  // Uniform locations
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private attributes: Record<string, number> = {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
    if (!gl) throw new Error('WebGL not supported');
    this.gl = gl;

    // Initialize camera
    this.camera = {
      position: [0, 0, 3],
      target: [0, 0, 0],
      up: [0, 1, 0],
      fov: 45,
      near: 0.01,
      far: 100,
    };

    // Create shader program
    this.program = this.createProgram();
    gl.useProgram(this.program);

    // Get attribute and uniform locations
    this.attributes = {
      aPosition: gl.getAttribLocation(this.program, 'aPosition'),
      aNormal: gl.getAttribLocation(this.program, 'aNormal'),
      aColor: gl.getAttribLocation(this.program, 'aColor'),
    };

    this.uniforms = {
      uProjectionMatrix: gl.getUniformLocation(this.program, 'uProjectionMatrix'),
      uViewMatrix: gl.getUniformLocation(this.program, 'uViewMatrix'),
      uModelMatrix: gl.getUniformLocation(this.program, 'uModelMatrix'),
      uNormalMatrix: gl.getUniformLocation(this.program, 'uNormalMatrix'),
      uLightPosition: gl.getUniformLocation(this.program, 'uLightPosition'),
      uCameraPosition: gl.getUniformLocation(this.program, 'uCameraPosition'),
      uBaseColor: gl.getUniformLocation(this.program, 'uBaseColor'),
      uUseVertexColors: gl.getUniformLocation(this.program, 'uUseVertexColors'),
      uOpacity: gl.getUniformLocation(this.program, 'uOpacity'),
      uWireframe: gl.getUniformLocation(this.program, 'uWireframe'),
      uClipPlane: gl.getUniformLocation(this.program, 'uClipPlane'),
      uEnableClipping: gl.getUniformLocation(this.program, 'uEnableClipping'),
    };

    // Setup WebGL state
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.95, 0.95, 0.95, 1.0);

    // Handle resize
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compile error: ${info}`);
    }
    return shader;
  }

  private createProgram(): WebGLProgram {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    const program = this.gl.createProgram();
    if (!program) throw new Error('Failed to create program');

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      throw new Error(`Program link error: ${info}`);
    }

    return program;
  }

  handleResize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  addMesh(
    id: string,
    positions: Float32Array,
    normals: Float32Array,
    indices: Uint32Array,
    color: [number, number, number] = [0.5, 0.5, 0.5],
    opacity: number = 1.0,
    colors?: Float32Array
  ): void {
    const gl = this.gl;

    // Create vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Create normal buffer
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    // Create index buffer (convert Uint32 to Uint16 for WebGL 1)
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    const indices16 = new Uint16Array(indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices16, gl.STATIC_DRAW);

    // Create color buffer if vertex colors provided
    let colorBuffer: WebGLBuffer | undefined;
    if (colors) {
      colorBuffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    }

    this.meshes.set(id, {
      vertexBuffer: vertexBuffer!,
      normalBuffer: normalBuffer!,
      indexBuffer: indexBuffer!,
      colorBuffer,
      indexCount: indices.length,
      color,
      opacity,
      visible: true,
    });
  }

  removeMesh(id: string): void {
    const mesh = this.meshes.get(id);
    if (mesh) {
      this.gl.deleteBuffer(mesh.vertexBuffer);
      this.gl.deleteBuffer(mesh.normalBuffer);
      this.gl.deleteBuffer(mesh.indexBuffer);
      if (mesh.colorBuffer) this.gl.deleteBuffer(mesh.colorBuffer);
      this.meshes.delete(id);
    }
  }

  clearMeshes(): void {
    for (const id of this.meshes.keys()) {
      this.removeMesh(id);
    }
  }

  setMeshVisibility(id: string, visible: boolean): void {
    const mesh = this.meshes.get(id);
    if (mesh) mesh.visible = visible;
  }

  setMeshColor(id: string, color: [number, number, number]): void {
    const mesh = this.meshes.get(id);
    if (mesh) mesh.color = color;
  }

  setMeshOpacity(id: string, opacity: number): void {
    const mesh = this.meshes.get(id);
    if (mesh) mesh.opacity = opacity;
  }

  setWireframe(enabled: boolean): void {
    this.wireframe = enabled;
  }

  setClipping(enabled: boolean, plane?: [number, number, number, number]): void {
    this.enableClipping = enabled;
    if (plane) this.clipPlane = plane;
  }

  setRotation(rx: number, ry: number): void {
    this.rotation = [rx, ry];
  }

  setZoom(zoom: number): void {
    this.zoom = Math.max(0.1, Math.min(10, zoom));
  }

  setCameraPosition(position: [number, number, number]): void {
    this.camera.position = position;
  }

  render(): void {
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Calculate matrices
    const aspect = this.canvas.width / this.canvas.height;
    const projectionMatrix = this.perspective(this.camera.fov, aspect, this.camera.near, this.camera.far);
    const viewMatrix = this.lookAt(this.camera.position, this.camera.target, this.camera.up);

    // Apply rotation
    const rotationMatrix = this.multiply(
      this.rotateY(this.rotation[1]),
      this.rotateX(this.rotation[0])
    );

    // Scale for zoom
    const scaleMatrix = this.scale(this.zoom, this.zoom, this.zoom);
    const modelMatrix = this.multiply(scaleMatrix, rotationMatrix);

    // Normal matrix (inverse transpose of model matrix)
    const normalMatrix = this.normalMatrix(modelMatrix);

    // Set common uniforms
    gl.uniformMatrix4fv(this.uniforms.uProjectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(this.uniforms.uViewMatrix, false, viewMatrix);
    gl.uniform3fv(this.uniforms.uLightPosition, [5, 5, 5]);
    gl.uniform3fv(this.uniforms.uCameraPosition, this.camera.position);
    gl.uniform1i(this.uniforms.uWireframe, this.wireframe ? 1 : 0);
    gl.uniform4fv(this.uniforms.uClipPlane, this.clipPlane);
    gl.uniform1i(this.uniforms.uEnableClipping, this.enableClipping ? 1 : 0);

    // Sort meshes by opacity for correct blending
    const sortedMeshes = Array.from(this.meshes.entries())
      .filter(([, mesh]) => mesh.visible)
      .sort(([, a], [, b]) => b.opacity - a.opacity);

    // Render each mesh
    for (const [, mesh] of sortedMeshes) {
      gl.uniformMatrix4fv(this.uniforms.uModelMatrix, false, modelMatrix);
      gl.uniformMatrix3fv(this.uniforms.uNormalMatrix, false, normalMatrix);
      gl.uniform3fv(this.uniforms.uBaseColor, mesh.color);
      gl.uniform1f(this.uniforms.uOpacity, mesh.opacity);
      gl.uniform1f(this.uniforms.uUseVertexColors, mesh.colorBuffer ? 1.0 : 0.0);

      // Bind position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
      gl.enableVertexAttribArray(this.attributes.aPosition);
      gl.vertexAttribPointer(this.attributes.aPosition, 3, gl.FLOAT, false, 0, 0);

      // Bind normal buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
      gl.enableVertexAttribArray(this.attributes.aNormal);
      gl.vertexAttribPointer(this.attributes.aNormal, 3, gl.FLOAT, false, 0, 0);

      // Bind color buffer if available
      if (mesh.colorBuffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.colorBuffer);
        gl.enableVertexAttribArray(this.attributes.aColor);
        gl.vertexAttribPointer(this.attributes.aColor, 3, gl.FLOAT, false, 0, 0);
      } else {
        gl.disableVertexAttribArray(this.attributes.aColor);
      }

      // Draw
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
      const mode = this.wireframe ? gl.LINES : gl.TRIANGLES;
      gl.drawElements(mode, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
    }
  }

  // Matrix utilities
  private perspective(fov: number, aspect: number, near: number, far: number): Float32Array {
    const f = 1.0 / Math.tan((fov * Math.PI) / 360);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0,
    ]);
  }

  private lookAt(eye: number[], target: number[], up: number[]): Float32Array {
    const zAxis = this.normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
    const xAxis = this.normalize(this.cross(up, zAxis));
    const yAxis = this.cross(zAxis, xAxis);

    return new Float32Array([
      xAxis[0], yAxis[0], zAxis[0], 0,
      xAxis[1], yAxis[1], zAxis[1], 0,
      xAxis[2], yAxis[2], zAxis[2], 0,
      -this.dot(xAxis, eye), -this.dot(yAxis, eye), -this.dot(zAxis, eye), 1,
    ]);
  }

  private rotateX(angle: number): Float32Array {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Float32Array([
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ]);
  }

  private rotateY(angle: number): Float32Array {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Float32Array([
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ]);
  }

  private scale(x: number, y: number, z: number): Float32Array {
    return new Float32Array([
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1,
    ]);
  }

  private multiply(a: Float32Array, b: Float32Array): Float32Array {
    const result = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] =
          a[i * 4 + 0] * b[0 * 4 + j] +
          a[i * 4 + 1] * b[1 * 4 + j] +
          a[i * 4 + 2] * b[2 * 4 + j] +
          a[i * 4 + 3] * b[3 * 4 + j];
      }
    }
    return result;
  }

  private normalMatrix(m: Float32Array): Float32Array {
    // Extract 3x3 from 4x4 and transpose
    return new Float32Array([
      m[0], m[4], m[8],
      m[1], m[5], m[9],
      m[2], m[6], m[10],
    ]);
  }

  private normalize(v: number[]): number[] {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
  }

  private cross(a: number[], b: number[]): number[] {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }

  private dot(a: number[], b: number[]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  dispose(): void {
    this.clearMeshes();
    this.gl.deleteProgram(this.program);
  }
}
