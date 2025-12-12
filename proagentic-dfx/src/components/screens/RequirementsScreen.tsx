'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { parseRequirements, recommendTankType, startOptimization, createOptimizationStream, getOptimizationResults } from '@/lib/api/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { RequirementsChat } from '@/components/RequirementsChat';
import { RequirementsTable } from '@/components/requirements/RequirementsTable';
import { StandardsPanel } from '@/components/requirements/StandardsPanel';
import { TankTypeComparison } from '@/components/requirements/TankTypeComparison';
import { OptimizationConfig, type OptimizationConfiguration } from '@/components/requirements/OptimizationConfig';
import { EnhancedProgress } from '@/components/requirements/EnhancedProgress';
import { GuidedRequirementsWizard } from '@/components/requirements/GuidedRequirementsWizard';
import type { ParseRequirementsResponse, TankTypeRecommendation, ProgressEvent, ParetoDesign } from '@/lib/types';
import { CheckCircle, AlertCircle, MessageSquare, Wand2 } from 'lucide-react';

type Step = 'input' | 'parsing' | 'parsed' | 'recommending' | 'recommended' | 'optimizing' | 'complete';
type InputMode = 'text' | 'chat';

interface RequirementsScreenProps {
  exampleRequirements?: string;
}

export function RequirementsScreen({ exampleRequirements = '' }: RequirementsScreenProps) {
  const { setRequirements, setTankType, setParetoFront, setCurrentDesign, setScreen } = useAppStore();

  const [inputMode, setInputMode] = useState<InputMode>('chat');
  const [step, setStep] = useState<Step>('input');
  const [rawText, _setRawText] = useState(exampleRequirements);
  const [parsedResult, setParsedResult] = useState<ParseRequirementsResponse | null>(null);
  const [tankRecommendation, setTankRecommendation] = useState<TankTypeRecommendation | null>(null);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const _handleParse = useCallback(async () => {
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
  }, [rawText, setRequirements]);

  const handleRecommend = useCallback(async () => {
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
  }, [parsedResult, setTankType]);

  const handleOptimize = useCallback(async (config: OptimizationConfiguration) => {
    if (!parsedResult || !tankRecommendation) return;
    setStep('optimizing');
    setError(null);

    try {
      const optimizationConfig = {
        requirements: parsedResult.parsed_requirements,
        tank_type: tankRecommendation.recommended_type,
        materials: config.materials,
        objectives: config.objectives,
        constraints: config.constraints,
      };

      const job = await startOptimization(optimizationConfig) as { job_id: string; stream_url: string };

      // Connect to SSE stream
      const eventSource = createOptimizationStream(job.job_id);

      eventSource.addEventListener('progress', (e: MessageEvent) => {
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
  }, [parsedResult, tankRecommendation, setParetoFront, setCurrentDesign]);

  const handleViewResults = useCallback(() => {
    setScreen('pareto');
  }, [setScreen]);

  const handleChatComplete = useCallback(async (requirements: Record<string, unknown>) => {
    // Convert chat requirements to ParsedRequirements format
    const parsedReqs = {
      internal_volume_liters: requirements.internal_volume_liters as number || 150,
      working_pressure_bar: requirements.working_pressure_bar as number || 700,
      target_weight_kg: requirements.target_weight_kg as number || 80,
      target_cost_eur: requirements.target_cost_eur as number || 15000,
      min_burst_ratio: 2.25,
      max_permeation_rate: 46,
      operating_temp_min_c: requirements.operating_temp_min_c as number || -40,
      operating_temp_max_c: requirements.operating_temp_max_c as number || 85,
      fatigue_cycles: requirements.fatigue_cycles as number || 11000,
      certification_region: requirements.certification_region as string || 'EU',
    };

    setRequirements(parsedReqs);

    // Auto-proceed to tank type recommendation
    setStep('parsed');
    setParsedResult({
      success: true,
      parsed_requirements: parsedReqs,
      derived_requirements: {
        burst_pressure_bar: Math.round(parsedReqs.working_pressure_bar * parsedReqs.min_burst_ratio),
        test_pressure_bar: Math.round(parsedReqs.working_pressure_bar * 1.5),
        min_wall_thickness_mm: 2.5,
        applicable_standards: ['ISO 11119-3', 'UN R134'],
      },
      applicable_standards: [],
      confidence: 0.95,
      warnings: [],
      clarification_needed: [],
    });

    // Automatically get recommendation
    handleRecommend();
  }, [setRequirements, handleRecommend]);

  // Handle wizard completion - same logic as chat complete
  const handleWizardComplete = useCallback(async (requirements: Record<string, unknown>) => {
    const parsedReqs = {
      internal_volume_liters: requirements.internal_volume_liters as number || 150,
      working_pressure_bar: requirements.working_pressure_bar as number || 700,
      target_weight_kg: requirements.target_weight_kg as number || 80,
      target_cost_eur: requirements.target_cost_eur as number || 15000,
      min_burst_ratio: requirements.min_burst_ratio as number || 2.25,
      max_permeation_rate: requirements.max_permeation_rate as number || 46,
      operating_temp_min_c: requirements.operating_temp_min_c as number || -40,
      operating_temp_max_c: requirements.operating_temp_max_c as number || 85,
      fatigue_cycles: requirements.fatigue_cycles as number || 11000,
      certification_region: requirements.certification_region as string || 'EU',
    };

    setRequirements(parsedReqs);

    // Auto-proceed to tank type recommendation
    setStep('parsed');
    setParsedResult({
      success: true,
      parsed_requirements: parsedReqs,
      derived_requirements: {
        burst_pressure_bar: Math.round(parsedReqs.working_pressure_bar * parsedReqs.min_burst_ratio),
        test_pressure_bar: Math.round(parsedReqs.working_pressure_bar * 1.5),
        min_wall_thickness_mm: 2.5,
        applicable_standards: parsedReqs.certification_region === 'EU'
          ? ['ISO 11119-3', 'UN R134', 'EC 79/2009']
          : parsedReqs.certification_region === 'USA'
          ? ['ASME Section X', 'ANSI/CSA HGV']
          : ['ISO 11119-3', 'UN R134', 'ASME Section X'],
      },
      applicable_standards: [],
      confidence: 1.0, // Wizard provides explicit values, so high confidence
      warnings: [],
      clarification_needed: [],
    });

    // Automatically get recommendation
    handleRecommend();
  }, [setRequirements, handleRecommend]);

  const handleModeChange = useCallback((mode: InputMode) => {
    setInputMode(mode);
  }, []);

  return (
    <div className="space-y-6" role="main" aria-label="Requirements Input Screen">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Requirements</h1>
          <p className="text-gray-500 text-sm mt-1">Define tank specifications</p>
        </div>
        {/* Mode Toggle */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden" role="tablist" aria-label="Input mode">
          <button
            onClick={() => handleModeChange('chat')}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
              inputMode === 'chat'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            role="tab"
            aria-selected={inputMode === 'chat'}
          >
            <MessageSquare size={16} />
            Chat
          </button>
          <button
            onClick={() => handleModeChange('text')}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
              inputMode === 'text'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            role="tab"
            aria-selected={inputMode === 'text'}
          >
            <Wand2 size={16} />
            Wizard
          </button>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm">
          <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Chat Mode */}
      {inputMode === 'chat' && step === 'input' && (
        <RequirementsChat onComplete={handleChatComplete} />
      )}

      {/* Guided Wizard Mode */}
      {inputMode === 'text' && step === 'input' && (
        <GuidedRequirementsWizard onComplete={handleWizardComplete} />
      )}

      {/* Step 2: Parsed Results - Professional Display */}
      {parsedResult && step !== 'input' && step !== 'parsing' && (
        <section className="space-y-6" aria-label="Parsed requirements results">
          <Card padding="none">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg" aria-hidden="true">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Requirements Parsed Successfully</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Review extracted specifications and applicable standards
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <Tabs
                tabs={[
                  {
                    id: 'requirements',
                    label: 'Requirements',
                    content: (
                      <RequirementsTable
                        parsed={parsedResult.parsed_requirements}
                        derived={parsedResult.derived_requirements}
                        confidence={parsedResult.confidence}
                      />
                    ),
                  },
                  {
                    id: 'standards',
                    label: 'Standards',
                    content: (
                      <StandardsPanel
                        standards={parsedResult.applicable_standards}
                        certificationRegion={parsedResult.parsed_requirements.certification_region}
                      />
                    ),
                  },
                ]}
              />
            </div>
          </Card>

          {parsedResult.warnings.length > 0 && (
            <div role="alert" className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <div className="flex-shrink-0">
                <AlertCircle className="text-yellow-600" size={22} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">Warnings</h4>
                <ul className="space-y-1">
                  {parsedResult.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5" aria-hidden="true">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleRecommend}
              loading={step === 'recommending'}
              disabled={step !== 'parsed' && step !== 'recommending'}
              className="px-6"
              aria-label={step === 'recommending' ? 'Analyzing tank type recommendation' : 'Get AI-powered tank type recommendation based on requirements'}
            >
              {step === 'recommending' ? 'Analyzing...' : 'Get Tank Type Recommendation'}
            </Button>
          </div>
        </section>
      )}

      {/* Step 3: Tank Type Recommendation - Professional Display */}
      {tankRecommendation && (step === 'recommended' || step === 'optimizing' || step === 'complete') && (
        <section className="space-y-6" aria-label="Tank type recommendation results">
          <Card padding="none">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg" aria-hidden="true">
                  <span className="text-blue-600 font-bold text-lg">2</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Tank Type Recommendation</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    AI-powered analysis based on your requirements
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <TankTypeComparison recommendation={tankRecommendation} />
            </div>
          </Card>

          {parsedResult && (
            <Card padding="none">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg" aria-hidden="true">
                    <span className="text-purple-600 font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Optimization Configuration</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Configure materials, objectives, and constraints
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <OptimizationConfig
                  requirements={parsedResult.parsed_requirements}
                  tankType={tankRecommendation.recommended_type}
                  onStart={handleOptimize}
                />
              </div>
            </Card>
          )}
        </section>
      )}

      {/* Step 4: Enhanced Optimization Progress */}
      {step === 'optimizing' && progress && (
        <section aria-label="Optimization progress" role="status" aria-live="polite">
          <Card>
            <EnhancedProgress progress={progress} />
          </Card>
        </section>
      )}

      {/* Step 5: Completion - Professional Success Card */}
      {step === 'complete' && (
        <section
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border border-green-200 overflow-hidden"
          role="status"
          aria-label="Optimization completion status"
        >
          <div className="p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0" aria-hidden="true">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-green-900 mb-2">
                  Optimization Complete!
                </h2>
                <p className="text-green-700 text-base mb-6">
                  Successfully generated optimal tank designs. The Pareto front contains multiple
                  trade-off solutions optimizing weight, cost, and performance metrics.
                </p>
                <Button onClick={handleViewResults} className="px-8" aria-label="View Pareto front results and explore optimal designs">
                  View Pareto Front Results
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-green-100 bg-opacity-50 px-8 py-4 border-t border-green-200">
            <p className="text-sm text-green-700">
              Next: Review the Pareto front to select your optimal design based on your priorities.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
