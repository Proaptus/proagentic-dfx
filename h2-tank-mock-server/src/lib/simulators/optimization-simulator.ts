// Optimization progress simulator for SSE streaming

import { delay } from '../utils/delay';

export interface OptimizationProgress {
  progress_percent: number;
  generation: number;
  designs_evaluated: number;
  pareto_size: number;
  current_best: {
    lightest: { weight_kg: number; cost_eur: number };
    cheapest: { weight_kg: number; cost_eur: number };
    most_reliable: { weight_kg: number; p_failure: number };
  };
  elapsed_seconds: number;
  remaining_seconds: number;
}

export interface ProgressEvent {
  type: 'progress' | 'best_update' | 'complete';
  data: OptimizationProgress | { job_id: string; status: string; results_url: string };
}

export class OptimizationSimulator {
  private totalGenerations = 200;
  private populationSize = 500;
  private targetParetoSize = 50;
  private progressIntervalMs = 150;
  private jobId: string;

  constructor(jobId: string, config?: Partial<{
    totalGenerations: number;
    populationSize: number;
    targetParetoSize: number;
    progressIntervalMs: number;
  }>) {
    this.jobId = jobId;
    if (config) {
      this.totalGenerations = config.totalGenerations ?? this.totalGenerations;
      this.populationSize = config.populationSize ?? this.populationSize;
      this.targetParetoSize = config.targetParetoSize ?? this.targetParetoSize;
      this.progressIntervalMs = config.progressIntervalMs ?? this.progressIntervalMs;
    }
  }

  async *stream(): AsyncGenerator<ProgressEvent> {
    const startTime = Date.now();
    const totalTimeMs = this.totalGenerations * this.progressIntervalMs;

    for (let gen = 0; gen <= this.totalGenerations; gen++) {
      const progressPercent = (gen / this.totalGenerations) * 100;
      const designsEvaluated = gen * this.populationSize;

      // Pareto front grows logarithmically then stabilizes
      const paretoSize = Math.min(
        this.targetParetoSize,
        Math.floor(10 + 40 * Math.log10(gen + 1) / Math.log10(this.totalGenerations))
      );

      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, (totalTimeMs - (Date.now() - startTime)) / 1000);

      // Simulate improving best designs
      const improvementFactor = 1 - (gen / this.totalGenerations) * 0.15;

      const progress: OptimizationProgress = {
        progress_percent: Math.round(progressPercent * 10) / 10,
        generation: gen,
        designs_evaluated: designsEvaluated,
        pareto_size: paretoSize,
        current_best: {
          lightest: {
            weight_kg: Math.round((74.2 + (86 - 74.2) * improvementFactor) * 10) / 10,
            cost_eur: Math.round(14200 - (14200 - 12900) * (1 - improvementFactor))
          },
          cheapest: {
            weight_kg: Math.round((86 + (90 - 86) * improvementFactor) * 10) / 10,
            cost_eur: Math.round(12900 + 500 * improvementFactor)
          },
          most_reliable: {
            weight_kg: Math.round((82 + (88 - 82) * improvementFactor) * 10) / 10,
            p_failure: Number((6e-7 * (1 + improvementFactor * 10)).toExponential(1))
          }
        },
        elapsed_seconds: Math.round(elapsed * 10) / 10,
        remaining_seconds: Math.round(remaining * 10) / 10
      };

      yield { type: 'progress', data: progress };

      // Add realistic delay between updates
      if (gen < this.totalGenerations) {
        await delay(this.progressIntervalMs + Math.random() * 50);
      }
    }

    // Final complete event
    yield {
      type: 'complete',
      data: {
        job_id: this.jobId,
        status: 'completed',
        results_url: `/api/optimization/${this.jobId}/results`
      }
    };
  }
}

// Quick simulation for demo (5 seconds total)
export class QuickOptimizationSimulator extends OptimizationSimulator {
  constructor(jobId: string) {
    super(jobId, {
      totalGenerations: 50,
      populationSize: 500,
      targetParetoSize: 50,
      progressIntervalMs: 100
    });
  }
}
