'use client';

/**
 * Reliability Equations Section Component
 * Displays engineering equations for reliability analysis
 */

import { EquationDisplay } from './EquationDisplay';
import { formatLargeNumber } from './reliability-panel.types';

interface ReliabilityEquationsSectionProps {
  pFailure: number;
  samples: number;
  covPercent: string;
  stdBar: number;
  meanBar: number;
  mtbfYears: number;
  mtbfCycles: number;
}

export function ReliabilityEquationsSection({
  pFailure,
  samples,
  covPercent,
  stdBar,
  meanBar,
  mtbfYears,
  mtbfCycles,
}: ReliabilityEquationsSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-top-2">
      <h3 className="text-lg font-semibold text-gray-900">Reliability Engineering Equations</h3>

      <EquationDisplay
        title="Monte Carlo Failure Probability"
        equation="P_failure = (Number of failures) / (Total samples)"
        variables={[
          { symbol: 'P_failure', description: 'Probability of failure', value: pFailure.toExponential(2) },
          { symbol: 'Failures', description: 'Simulations where burst < test pressure', value: '0' },
          { symbol: 'Samples', description: 'Total Monte Carlo runs', value: samples.toLocaleString() },
        ]}
        explanation="Monte Carlo simulation randomly samples input parameters from their statistical distributions, runs FEA for each sample, and counts failures. Converges to true probability with large sample size."
      />

      <EquationDisplay
        title="Coefficient of Variation (CoV)"
        equation="CoV = σ / μ"
        variables={[
          { symbol: 'CoV', description: 'Coefficient of variation', value: covPercent },
          { symbol: 'σ', description: 'Standard deviation of burst pressure', value: `${stdBar} bar` },
          { symbol: 'μ', description: 'Mean burst pressure', value: `${meanBar} bar` },
        ]}
        explanation="CoV normalizes variability relative to the mean. Lower CoV indicates tighter control. Typical CoV for Type IV tanks: 3-5%."
      />

      <EquationDisplay
        title="Reliability Index (β)"
        equation="β = Φ^(-1)(1 - P_failure)"
        variables={[
          { symbol: 'β', description: 'Reliability index (sigma level)', value: '5.2' },
          { symbol: 'Φ^(-1)', description: 'Inverse standard normal CDF' },
          { symbol: 'P_failure', description: 'Probability of failure', value: pFailure.toExponential(2) },
        ]}
        explanation="Beta (β) is a measure of reliability in standard deviations. β = 3 corresponds to 99.87% reliability (3-sigma), β = 6 is six-sigma (99.99966%)."
        defaultExpanded={false}
      />

      <EquationDisplay
        title="Weibull Reliability Function"
        equation="R(t) = exp(-(t/η)^β)"
        variables={[
          { symbol: 'R(t)', description: 'Reliability at time t' },
          { symbol: 't', description: 'Service time (hours)' },
          { symbol: 'β', description: 'Shape parameter (Weibull modulus)', value: '2.5' },
          { symbol: 'η', description: 'Scale parameter (characteristic life)', value: '50,000 hours' },
        ]}
        explanation="Weibull distribution models time-to-failure. β < 1 indicates infant mortality, β = 1 random failures, β > 1 wear-out. Characteristic life η is time when 63.2% have failed."
        defaultExpanded={false}
      />

      <EquationDisplay
        title="Mean Time Between Failures (MTBF)"
        equation="MTBF = η × Γ(1 + 1/β)"
        variables={[
          { symbol: 'MTBF', description: 'Mean time between failures', value: `${mtbfYears.toFixed(0)} years (${formatLargeNumber(mtbfCycles)} cycles)` },
          { symbol: 'η', description: 'Scale parameter', value: '50,000 hours' },
          { symbol: 'β', description: 'Shape parameter', value: '2.5' },
          { symbol: 'Γ', description: 'Gamma function' },
        ]}
        explanation="MTBF is the expected value of the Weibull distribution. For β = 2.5, MTBF ≈ 0.887 × η."
        defaultExpanded={false}
      />
    </div>
  );
}
