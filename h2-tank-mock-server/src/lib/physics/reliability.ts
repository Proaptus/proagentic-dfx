/**
 * Reliability Analysis - Monte Carlo Simulation
 * REQ-234: Implement Monte Carlo reliability estimation
 *
 * Monte Carlo method for reliability:
 * P(failure) = (1/N) × Σᵢ I(design fails under sample i)
 *
 * Where I() is an indicator function (1 if failure, 0 if safe)
 */

/**
 * Generate standard normal random variable (Box-Muller transform)
 * Returns a value from N(0,1) distribution
 */
export function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Inverse standard normal CDF (approximation)
 * Used for calculating reliability index
 *
 * @param p - Probability (0 to 1)
 * @returns z-score corresponding to probability p
 */
export function normalInverse(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error('Probability must be between 0 and 1');
  }

  // Beasley-Springer-Moro algorithm (approximation)
  const a0 = 2.50662823884;
  const a1 = -18.61500062529;
  const a2 = 41.39119773534;
  const a3 = -25.44106049637;

  const b0 = -8.47351093090;
  const b1 = 23.08336743743;
  const b2 = -21.06224101826;
  const b3 = 3.13082909833;

  const c0 = 0.3374754822726147;
  const c1 = 0.9761690190917186;
  const c2 = 0.1607979714918209;
  const c3 = 0.0276438810333863;
  const c4 = 0.0038405729373609;
  const c5 = 0.0003951896511919;
  const c6 = 0.0000321767881768;
  const c7 = 0.0000002888167364;
  const c8 = 0.0000003960315187;

  const y = p - 0.5;

  if (Math.abs(y) < 0.42) {
    const r = y * y;
    return y * (((a3 * r + a2) * r + a1) * r + a0) /
           ((((b3 * r + b2) * r + b1) * r + b0) * r + 1);
  }

  let r = p;
  if (y > 0) r = 1 - p;
  r = Math.log(-Math.log(r));

  const x = c0 + r * (c1 + r * (c2 + r * (c3 + r * (c4 + r * (c5 + r * (c6 + r * (c7 + r * c8)))))));

  return y < 0 ? -x : x;
}

/**
 * Monte Carlo reliability result
 */
export interface MonteCarloResult {
  pFailure: number;          // Probability of failure
  reliabilityIndex: number;  // β (beta) value
  samplesRun: number;        // Number of samples executed
  failureCount: number;      // Number of failures observed
}

/**
 * Calculate reliability using Monte Carlo simulation
 *
 * Samples material strength and design stress from normal distributions
 * and counts failures where stress exceeds strength.
 *
 * @param designStress - Mean design stress (MPa)
 * @param materialStrength - Mean material strength (MPa)
 * @param strengthCOV - Coefficient of variation for strength (e.g., 0.05 = 5%)
 * @param stressCOV - Coefficient of variation for stress (e.g., 0.10 = 10%)
 * @param numSamples - Number of Monte Carlo samples (default 10,000)
 * @returns Monte Carlo reliability result
 *
 * Example:
 * designStress = 490 MPa (hoop stress at 700 bar)
 * materialStrength = 2500 MPa (carbon fiber)
 * strengthCOV = 0.05 (5% variation)
 * stressCOV = 0.10 (10% variation)
 */
export function calculateReliability(
  designStress: number,
  materialStrength: number,
  strengthCOV: number,
  stressCOV: number,
  numSamples: number = 10000
): MonteCarloResult {
  if (numSamples < 100) {
    throw new Error('Number of samples must be at least 100');
  }
  if (strengthCOV < 0 || stressCOV < 0) {
    throw new Error('Coefficient of variation must be non-negative');
  }

  let failures = 0;

  for (let i = 0; i < numSamples; i++) {
    // Sample material strength from normal distribution
    // Strength = Mean × (1 + COV × Z)
    const sampleStrength = materialStrength * (1 + strengthCOV * gaussianRandom());

    // Sample design stress from normal distribution
    const sampleStress = designStress * (1 + stressCOV * gaussianRandom());

    // Check for failure (stress > strength)
    if (sampleStress > sampleStrength) {
      failures++;
    }
  }

  const pFailure = failures / numSamples;

  // Calculate reliability index β
  // β = -Φ⁻¹(P_f) where Φ is standard normal CDF
  let reliabilityIndex: number;
  if (pFailure === 0) {
    // No failures observed, estimate lower bound
    reliabilityIndex = normalInverse(1 - 1 / numSamples);
  } else if (pFailure === 1) {
    reliabilityIndex = 0; // All samples failed
  } else {
    reliabilityIndex = -normalInverse(pFailure);
  }

  return {
    pFailure,
    reliabilityIndex,
    samplesRun: numSamples,
    failureCount: failures,
  };
}

/**
 * Calculate probability of failure from reliability index
 *
 * @param beta - Reliability index
 * @returns Probability of failure
 */
export function reliabilityIndexToProbability(beta: number): number {
  // P_f = Φ(-β) where Φ is standard normal CDF
  // Using approximation for standard normal CDF
  const z = -beta;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  return z > 0 ? 1 - p : p;
}

/**
 * Calculate required reliability index for target probability
 * Common targets:
 * - P_f = 1e-3 (0.1%): β = 3.09
 * - P_f = 1e-4 (0.01%): β = 3.72
 * - P_f = 1e-5 (0.001%): β = 4.27
 * - P_f = 1e-6 (0.0001%): β = 4.75
 *
 * @param targetProbability - Target probability of failure
 * @returns Required reliability index
 */
export function calculateRequiredBeta(targetProbability: number): number {
  if (targetProbability <= 0 || targetProbability >= 1) {
    throw new Error('Target probability must be between 0 and 1');
  }
  return -normalInverse(targetProbability);
}

/**
 * Perform sensitivity analysis - calculate first-order sensitivity
 *
 * @param designStress - Design stress (MPa)
 * @param materialStrength - Material strength (MPa)
 * @param strengthCOV - Strength coefficient of variation
 * @param stressCOV - Stress coefficient of variation
 * @param parameter - Parameter to vary ('strength' or 'stress')
 * @param delta - Percentage change (e.g., 0.01 = 1%)
 * @returns Change in probability of failure per unit change in parameter
 */
export function calculateSensitivity(
  designStress: number,
  materialStrength: number,
  strengthCOV: number,
  stressCOV: number,
  parameter: 'strength' | 'stress' | 'strengthCOV' | 'stressCOV',
  delta: number = 0.01
): number {
  // Baseline reliability
  const baseline = calculateReliability(
    designStress,
    materialStrength,
    strengthCOV,
    stressCOV
  );

  // Perturbed reliability
  let perturbed: MonteCarloResult;
  if (parameter === 'strength') {
    perturbed = calculateReliability(
      designStress,
      materialStrength * (1 + delta),
      strengthCOV,
      stressCOV
    );
  } else if (parameter === 'stress') {
    perturbed = calculateReliability(
      designStress * (1 + delta),
      materialStrength,
      strengthCOV,
      stressCOV
    );
  } else if (parameter === 'strengthCOV') {
    perturbed = calculateReliability(
      designStress,
      materialStrength,
      strengthCOV * (1 + delta),
      stressCOV
    );
  } else {
    perturbed = calculateReliability(
      designStress,
      materialStrength,
      strengthCOV,
      stressCOV * (1 + delta)
    );
  }

  // Sensitivity = ΔP_f / Δparameter
  const sensitivity = (perturbed.pFailure - baseline.pFailure) / delta;
  return sensitivity;
}

/**
 * Calculate burst pressure distribution from Monte Carlo
 *
 * @param nominalBurstPressure - Nominal burst pressure (bar)
 * @param burstCOV - Coefficient of variation for burst pressure
 * @param numSamples - Number of samples
 * @returns Array of sampled burst pressures
 */
export function generateBurstDistribution(
  nominalBurstPressure: number,
  burstCOV: number,
  numSamples: number = 10000
): number[] {
  const samples: number[] = [];

  for (let i = 0; i < numSamples; i++) {
    const sample = nominalBurstPressure * (1 + burstCOV * gaussianRandom());
    samples.push(Math.max(0, sample)); // Ensure non-negative
  }

  return samples;
}

/**
 * Calculate statistics from sample distribution
 *
 * @param samples - Array of sample values
 * @returns Distribution statistics
 */
export function calculateDistributionStats(samples: number[]): {
  mean: number;
  std: number;
  cov: number;
  min: number;
  max: number;
  percentile5: number;
  percentile95: number;
} {
  if (samples.length === 0) {
    throw new Error('Sample array cannot be empty');
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;

  const mean = samples.reduce((sum, val) => sum + val, 0) / n;
  const variance = samples.reduce((sum, val) => sum + (val - mean) ** 2, 0) / (n - 1);
  const std = Math.sqrt(variance);
  const cov = std / mean;

  const percentile5 = sorted[Math.floor(0.05 * n)];
  const percentile95 = sorted[Math.floor(0.95 * n)];

  return {
    mean,
    std,
    cov,
    min: sorted[0],
    max: sorted[n - 1],
    percentile5,
    percentile95,
  };
}
