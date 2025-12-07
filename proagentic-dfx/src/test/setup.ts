import '@testing-library/dom';
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// Mock WebGL context for Three.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HTMLCanvasElement.prototype as any).getContext = ((originalGetContext: typeof HTMLCanvasElement.prototype.getContext) =>
  function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
    if (type === 'webgl' || type === 'webgl2') {
      return {
        createShader: () => ({}),
        shaderSource: () => {},
        compileShader: () => {},
        getShaderParameter: () => true,
        createProgram: () => ({}),
        attachShader: () => {},
        linkProgram: () => {},
        getProgramParameter: () => true,
        useProgram: () => {},
        getAttribLocation: () => 0,
        getUniformLocation: () => ({}),
        uniformMatrix4fv: () => {},
        createBuffer: () => ({}),
        bindBuffer: () => {},
        bufferData: () => {},
        enableVertexAttribArray: () => {},
        vertexAttribPointer: () => {},
        drawArrays: () => {},
        canvas: { width: 800, height: 600 },
        getExtension: () => null,
        getParameter: () => '',
        createTexture: () => ({}),
        bindTexture: () => {},
        texParameteri: () => {},
        texImage2D: () => {},
        viewport: () => {},
        clearColor: () => {},
        clear: () => {},
        enable: () => {},
        disable: () => {},
        depthFunc: () => {},
        blendFunc: () => {},
        createFramebuffer: () => ({}),
        bindFramebuffer: () => {},
        framebufferTexture2D: () => {},
        createRenderbuffer: () => ({}),
        bindRenderbuffer: () => {},
        renderbufferStorage: () => {},
        framebufferRenderbuffer: () => {},
        checkFramebufferStatus: () => 36053,
        deleteFramebuffer: () => {},
        deleteRenderbuffer: () => {},
        deleteTexture: () => {},
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (originalGetContext as any).call(this, type, ...args);
  })(HTMLCanvasElement.prototype.getContext);
