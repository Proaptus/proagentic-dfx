/**
 * Reliability Analysis
 * Monte Carlo simulation for probabilistic design
 *
 * Applicable to: Pressure Vessels, Aerospace Components, Safety-Critical Structures
 */

/**
 * Random variable definition for Monte Carlo
 */
export interface RandomVariable {
  name: string;
  distribution: 'normal' | 'lognormal' | 'weibull' | 'uniform';
  mean: number;
  stdDev?: number;     // For normal/lognormal
  shape?: number;      // For Weibull
  scale?: number;      // For Weibull
  min?: number;        // For uniform
  max?: number;        // For uniform
}

/**
 * Monte Carlo result
 */
export interface MonteCarloResult {
  samples: number;
  failures: number;
  pFailure: number;
  confidenceInterval: [number, number];
  mean: number;
  stdDev: number;
  percentiles: Record<number, number>;
}

/**
 * Generate random sample from specified distribution
 *
 * @param variable - Random variable definition
 * @returns Random sample value
 */
export function generateSample(variable: RandomVariable): number {
  switch (variable.distribution) {
    case 'normal':
      return generateNormal(variable.mean, variable.stdDev || 0);
    case 'lognormal':
      return generateLognormal(variable.mean, variable.stdDev || 0);
    case 'weibull':
      return generateWeibull(variable.shape || 1, variable.scale || variable.mean);
    case 'uniform':
      return generateUniform(variable.min || 0, variable.max || variable.mean * 2);
    default:
      return variable.mean;
  }
}

/**
 * Generate normal (Gaussian) random variable using Box-Muller transform
 */
function generateNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z;
}

/**
 * Generate lognormal random variable
 */
function generateLognormal(mean: number, stdDev: number): number {
  // Convert to log-space parameters
  const variance = stdDev * stdDev;
  const mu = Math.log(mean * mean / Math.sqrt(variance + mean * mean));
  const sigma = Math.sqrt(Math.log(variance / (mean * mean) + 1));
  return Math.exp(generateNormal(mu, sigma));
}

/**
 * Generate Weibull random variable
 */
function generateWeibull(shape: number, scale: number): number {
  const u = Math.random();
  return scale * Math.pow(-Math.log(1 - u), 1 / shape);
}

/**
 * Generate uniform random variable
 */
function generateUniform(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Calculate percentile from sorted array
 */
function percentile(sortedArray: number[], p: number): number {
  const index = (p / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

/**
 * Run Monte Carlo simulation for reliability analysis
 *
 * @param limitStateFunction - Function that returns < 0 for failure
 * @param variables - Array of random variables
 * @param samples - Number of Monte Carlo samples
 * @returns Monte Carlo result with failure probability
 */
export function runMonteCarlo(
  limitStateFunction: (values: Record<string, number>) => number,
  variables: RandomVariable[],
  samples: number = 10000
): MonteCarloResult {
  const results: number[] = [];
  let failures = 0;

  for (let i = 0; i < samples; i++) {
    // Generate random sample for each variable
    const values: Record<string, number> = {};
    for (const variable of variables) {
      values[variable.name] = generateSample(variable);
    }

    // Evaluate limit state function
    const g = limitStateFunction(values);
    results.push(g);

    if (g < 0) {
      failures++;
    }
  }

  // Sort for percentiles
  const sortedResults = [...results].sort((a, b) => a - b);

  // Calculate statistics
  const mean = results.reduce((a, b) => a + b, 0) / samples;
  const variance = results.reduce((a, b) => a + (b - mean) ** 2, 0) / samples;
  const stdDev = Math.sqrt(variance);

  // Calculate probability of failure
  const pFailure = failures / samples;

  // 95% confidence interval using normal approximation
  const se = Math.sqrt((pFailure * (1 - pFailure)) / samples);
  const confidenceInterval: [number, number] = [
    Math.max(0, pFailure - 1.96 * se),
    Math.min(1, pFailure + 1.96 * se),
  ];

  return {
    samples,
    failures,
    pFailure,
    confidenceInterval,
    mean,
    stdDev,
    percentiles: {
      1: percentile(sortedResults, 1),
      5: percentile(sortedResults, 5),
      50: percentile(sortedResults, 50),
      95: percentile(sortedResults, 95),
      99: percentile(sortedResults, 99),
    },
  };
}

/**
 * Create limit state function for pressure vessel burst
 *
 * @param burstPressureNominal - Nominal burst pressure (MPa)
 * @param workingPressure - Working pressure (MPa)
 * @param burstCOV - Coefficient of variation for burst pressure
 * @returns Limit state function for Monte Carlo
 */
export function createBurstLimitState(
  burstPressureNominal: number,
  workingPressure: number,
  burstCOV: number = 0.05
): {
  limitState: (values: Record<string, number>) => number;
  variables: RandomVariable[];
} {
  const variables: RandomVariable[] = [
    {
      name: 'burstPressure',
      distribution: 'lognormal',
      mean: burstPressureNominal,
      stdDev: burstPressureNominal * burstCOV,
    },
    {
      name: 'loadFactor',
      distribution: 'lognormal',
      mean: 1.0,
      stdDev: 0.05, // 5% load uncertainty
    },
  ];

  const limitState = (values: Record<string, number>) => {
    // g = burstPressure - loadFactor * workingPressure
    // g < 0 means failure
    return values.burstPressure - values.loadFactor * workingPressure;
  };

  return { limitState, variables };
}

/**
 * Create limit state function for fatigue failure
 *
 * @param predictedCycles - Predicted fatigue life (cycles)
 * @param requiredCycles - Required fatigue life (cycles)
 * @param lifeCOV - Coefficient of variation for fatigue life
 * @returns Limit state function for Monte Carlo
 */
export function createFatigueLimitState(
  predictedCycles: number,
  requiredCycles: number,
  _lifeCOV: number = 0.3 // Reserved for future COV-based distribution adjustment
): {
  limitState: (values: Record<string, number>) => number;
  variables: RandomVariable[];
} {
  const variables: RandomVariable[] = [
    {
      name: 'fatigueLife',
      distribution: 'weibull',
      mean: predictedCycles,
      shape: 2, // Typical for composites
      scale: predictedCycles / 0.886, // Scale to match mean
    },
    {
      name: 'usageFactor',
      distribution: 'lognormal',
      mean: 1.0,
      stdDev: 0.1, // 10% usage uncertainty
    },
  ];

  const limitState = (values: Record<string, number>) => {
    // g = fatigueLife - usageFactor * requiredCycles
    // g < 0 means failure
    return values.fatigueLife - values.usageFactor * requiredCycles;
  };

  return { limitState, variables };
}

/**
 * Calculate reliability index (beta) from probability of failure
 * β = -Φ⁻¹(Pf) where Φ⁻¹ is the inverse standard normal CDF
 *
 * @param pFailure - Probability of failure
 * @returns Reliability index
 */
export function calculateReliabilityIndex(pFailure: number): number {
  if (pFailure <= 0) return Infinity;
  if (pFailure >= 1) return -Infinity;

  // Approximation of inverse standard normal CDF
  const a = [
    -3.969683028665376e+01,
    2.209460984245205e+02,
    -2.759285104469687e+02,
    1.383577518672690e+02,
    -3.066479806614716e+01,
    2.506628277459239e+00,
  ];
  const b = [
    -5.447609879822406e+01,
    1.615858368580409e+02,
    -1.556989798598866e+02,
    6.680131188771972e+01,
    -1.328068155288572e+01,
  ];
  const c = [
    -7.784894002430293e-03,
    -3.223964580411365e-01,
    -2.400758277161838e+00,
    -2.549732539343734e+00,
    4.374664141464968e+00,
    2.938163982698783e+00,
  ];
  const d = [
    7.784695709041462e-03,
    3.224671290700398e-01,
    2.445134137142996e+00,
    3.754408661907416e+00,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;

  if (pFailure < pLow) {
    q = Math.sqrt(-2 * Math.log(pFailure));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
           ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (pFailure <= pHigh) {
    q = pFailure - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
           (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - pFailure));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
           ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}
