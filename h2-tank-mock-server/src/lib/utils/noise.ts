// Add realistic variation to simulated data

export function addNoise(value: number, noiseLevel: number = 0.05): number {
  const noise = (Math.random() - 0.5) * 2 * noiseLevel;
  return value * (1 + noise);
}

export function gaussianRandom(mean: number, std: number): number {
  // Box-Muller transform for Gaussian distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * std;
}

export function seededRandom(seed: number): () => number {
  // Simple seeded PRNG for reproducible simulations
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}
