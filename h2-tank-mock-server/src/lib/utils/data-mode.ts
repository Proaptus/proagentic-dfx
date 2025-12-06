// Data mode utility for switching between static/simulated/hybrid
export type DataMode = 'static' | 'simulated' | 'hybrid';

export function getDataMode(): DataMode {
  const mode = process.env.DATA_MODE || 'static';
  if (mode === 'static' || mode === 'simulated' || mode === 'hybrid') {
    return mode;
  }
  return 'static';
}

export function isSimulated(endpoint?: string): boolean {
  const mode = getDataMode();
  if (mode === 'static') return false;
  if (mode === 'simulated') return true;

  // Hybrid mode: simulate specific endpoints
  const SIMULATED_ENDPOINTS = [
    '/api/optimization/*/stream',
    '/api/designs/*/stress',
    '/api/designs/*/reliability',
    '/api/designs/*/thermal',
  ];

  if (endpoint) {
    return SIMULATED_ENDPOINTS.some(pattern => {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '[^/]+') + '$');
      return regex.test(endpoint);
    });
  }

  return false;
}
