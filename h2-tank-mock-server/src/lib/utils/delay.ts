// Add realistic delays to simulate backend processing

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return delay(ms);
}

// Simulate network latency based on data mode
export async function simulateLatency(baseMs: number = 50): Promise<void> {
  const mode = process.env.DATA_MODE || 'static';
  if (mode === 'static') {
    // Minimal delay for static mode
    await delay(10);
  } else {
    // Realistic delay for simulated/hybrid
    await randomDelay(baseMs, baseMs * 2);
  }
}
