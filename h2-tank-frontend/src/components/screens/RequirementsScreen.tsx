'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { parseRequirements, recommendTankType, startOptimization, createOptimizationStream, getOptimizationResults } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ParseRequirementsResponse, TankTypeRecommendation, ProgressEvent, ParetoDesign } from '@/lib/types';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const EXAMPLE_REQUIREMENTS = `Design a Type IV hydrogen tank for automotive fuel cell applications:
- Internal volume: 150 liters
- Working pressure: 700 bar
- Target weight: 80 kg maximum
- Target cost: €15,000 maximum
- Operating temperature: -40°C to +85°C
- Minimum burst ratio: 2.25
- Maximum permeation: 46 NmL/hr/L
- Fatigue life: minimum 11,000 cycles
- Certification: EU market (UN R134, ISO 11119-3)`;

type Step = 'input' | 'parsing' | 'parsed' | 'recommending' | 'recommended' | 'optimizing' | 'complete';

export function RequirementsScreen() {
  const { setRequirements, setTankType, setParetoFront, setCurrentDesign, setScreen } = useAppStore();

  const [step, setStep] = useState<Step>('input');
  const [rawText, setRawText] = useState(EXAMPLE_REQUIREMENTS);
  const [parsedResult, setParsedResult] = useState<ParseRequirementsResponse | null>(null);
  const [tankRecommendation, setTankRecommendation] = useState<TankTypeRecommendation | null>(null);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    setStep('parsing');
    setError(null);
    try {
      const result = await parseRequirements(rawText) as ParseRequirementsResponse;
      setParsedResult(result);
      setRequirements(result.parsed_requirements);
      setStep('parsed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse requirements');
      setStep('input');
    }
  };

  const handleRecommend = async () => {
    if (!parsedResult) return;
    setStep('recommending');
    setError(null);
    try {
      const result = await recommendTankType(parsedResult.parsed_requirements) as TankTypeRecommendation;
      setTankRecommendation(result);
      setTankType(result.recommended_type);
      setStep('recommended');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendation');
      setStep('parsed');
    }
  };

  const handleOptimize = async () => {
    if (!parsedResult || !tankRecommendation) return;
    setStep('optimizing');
    setError(null);

    try {
      const config = {
        requirements: parsedResult.parsed_requirements,
        tank_type: tankRecommendation.recommended_type,
        materials: {
          fiber: 'T700S',
          matrix: 'EP_TOUGHENED',
          liner: 'HDPE_BARRIER',
        },
        objectives: ['minimize_weight', 'minimize_cost', 'maximize_reliability'],
        constraints: {
          max_weight_kg: parsedResult.parsed_requirements.target_weight_kg,
          max_cost_eur: parsedResult.parsed_requirements.target_cost_eur,
          min_burst_ratio: parsedResult.parsed_requirements.min_burst_ratio,
        },
      };

      const job = await startOptimization(config) as { job_id: string; stream_url: string };

      // Connect to SSE stream
      const eventSource = createOptimizationStream(job.job_id);

      eventSource.addEventListener('progress', (e) => {
        const data = JSON.parse(e.data) as ProgressEvent;
        setProgress(data);
      });

      eventSource.addEventListener('complete', async () => {
        eventSource.close();

        // Fetch results
        const results = await getOptimizationResults(job.job_id) as { pareto_front: ParetoDesign[]; recommended: ParetoDesign };
        setParetoFront(results.pareto_front);
        setCurrentDesign(results.recommended.id);
        setStep('complete');
      });

      eventSource.addEventListener('error', () => {
        eventSource.close();
        setError('Optimization stream error');
        setStep('recommended');
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start optimization');
      setStep('recommended');
    }
  };

  const handleViewResults = () => {
    setScreen('pareto');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Requirements Input</h2>
        <p className="text-gray-600 mt-1">
          Enter your hydrogen tank requirements in natural language. Our AI will parse and validate them.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Step 1: Input */}
      <Card>
        <CardHeader>
          <CardTitle>1. Enter Requirements</CardTitle>
        </CardHeader>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={10}
          className="w-full border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your requirements here..."
          disabled={step !== 'input'}
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleParse} loading={step === 'parsing'} disabled={step !== 'input' && step !== 'parsing'}>
            Parse Requirements
          </Button>
        </div>
      </Card>

      {/* Step 2: Parsed Results */}
      {parsedResult && step !== 'input' && step !== 'parsing' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>2. Parsed Requirements</CardTitle>
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle size={18} />
                {Math.round(parsedResult.confidence * 100)}% confidence
              </span>
            </div>
          </CardHeader>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Primary Requirements</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Volume:</dt>
                  <dd className="font-medium">{parsedResult.parsed_requirements.internal_volume_liters} L</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Pressure:</dt>
                  <dd className="font-medium">{parsedResult.parsed_requirements.working_pressure_bar} bar</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Target Weight:</dt>
                  <dd className="font-medium">{parsedResult.parsed_requirements.target_weight_kg} kg</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Target Cost:</dt>
                  <dd className="font-medium">€{parsedResult.parsed_requirements.target_cost_eur.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Derived Requirements</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Burst Pressure:</dt>
                  <dd className="font-medium">{parsedResult.derived_requirements.burst_pressure_bar} bar</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Test Pressure:</dt>
                  <dd className="font-medium">{parsedResult.derived_requirements.test_pressure_bar} bar</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Min Wall:</dt>
                  <dd className="font-medium">{parsedResult.derived_requirements.min_wall_thickness_mm} mm</dd>
                </div>
              </dl>
            </div>
          </div>

          {parsedResult.warnings.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-1">Warnings</h4>
              <ul className="list-disc list-inside text-sm text-yellow-700">
                {parsedResult.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button onClick={handleRecommend} loading={step === 'recommending'} disabled={step !== 'parsed' && step !== 'recommending'}>
              Get Tank Type Recommendation
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Tank Type Recommendation */}
      {tankRecommendation && (step === 'recommended' || step === 'optimizing' || step === 'complete') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>3. Tank Type Recommendation</CardTitle>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Type {tankRecommendation.recommended_type}
              </span>
            </div>
          </CardHeader>

          <p className="text-gray-700 mb-4">{tankRecommendation.reasoning}</p>

          <div className="space-y-3">
            {tankRecommendation.alternatives.map((alt) => (
              <div key={alt.type} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">Type {alt.type}</div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-green-600">+</span> {alt.pros.slice(0, 2).join(', ')}
                  </div>
                  <div>
                    <span className="text-red-600">-</span> {alt.cons.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleOptimize} loading={step === 'optimizing'} disabled={step !== 'recommended' && step !== 'optimizing'}>
              Run Optimization
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Optimization Progress */}
      {step === 'optimizing' && progress && (
        <Card>
          <CardHeader>
            <CardTitle>4. Optimization Progress</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Generation {progress.generation}/50</span>
                <span>{progress.progress_percent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress_percent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Designs Evaluated</div>
                <div className="text-xl font-bold text-gray-900">
                  {progress.designs_evaluated.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Pareto Size</div>
                <div className="text-xl font-bold text-gray-900">{progress.pareto_size}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Time Remaining</div>
                <div className="text-xl font-bold text-gray-900">
                  {Math.round(progress.remaining_seconds)}s
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader2 className="animate-spin" size={20} />
              <span>Optimizing...</span>
            </div>
          </div>
        </Card>
      )}

      {/* Step 5: Complete */}
      {step === 'complete' && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-4">
            <CheckCircle className="text-green-600" size={40} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900">Optimization Complete!</h3>
              <p className="text-green-700">
                Found optimal designs. Click below to explore the Pareto front.
              </p>
            </div>
            <Button onClick={handleViewResults}>View Results</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
