'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronRight, ChevronLeft, Check, AlertTriangle } from 'lucide-react';
import {
  type ApplicationType,
  type ValidationErrors,
  VALIDATION_RULES,
  STEPS,
  APPLICATION_PRESETS,
} from './wizard-constants';

interface GuidedRequirementsWizardProps {
  onComplete: (requirements: Record<string, unknown>) => void;
}

export function GuidedRequirementsWizard({ onComplete }: GuidedRequirementsWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [applicationType, setApplicationType] = useState<ApplicationType | null>(null);
  const [requirements, setRequirements] = useState({
    working_pressure_bar: 700,
    internal_volume_liters: 150,
    target_weight_kg: 80,
    target_cost_eur: 15000,
    operating_temp_min_c: -40,
    operating_temp_max_c: 85,
    fatigue_cycles: 11000,
    certification_region: 'EU',
  });

  // Validation logic (ISSUE-005, ISSUE-006, ISSUE-007)
  const validationErrors = useMemo((): ValidationErrors => {
    const errors: ValidationErrors = {};

    // ISSUE-005: Pressure validation (200-1000 bar)
    if (requirements.working_pressure_bar < VALIDATION_RULES.pressure.min) {
      errors.working_pressure_bar = `Pressure must be at least ${VALIDATION_RULES.pressure.min} bar`;
    } else if (requirements.working_pressure_bar > VALIDATION_RULES.pressure.max) {
      errors.working_pressure_bar = `Pressure cannot exceed ${VALIDATION_RULES.pressure.max} bar (max for H2 tanks)`;
    }

    // ISSUE-006: Weight validation (must be positive)
    if (requirements.target_weight_kg <= 0) {
      errors.target_weight_kg = 'Weight must be greater than 0 kg';
    }

    // ISSUE-007: Temperature range validation (max > min)
    if (requirements.operating_temp_max_c <= requirements.operating_temp_min_c) {
      errors.operating_temp = 'Maximum temperature must be greater than minimum temperature';
    }

    // Volume validation
    if (requirements.internal_volume_liters < VALIDATION_RULES.volume.min) {
      errors.internal_volume_liters = `Volume must be at least ${VALIDATION_RULES.volume.min} liters`;
    } else if (requirements.internal_volume_liters > VALIDATION_RULES.volume.max) {
      errors.internal_volume_liters = `Volume cannot exceed ${VALIDATION_RULES.volume.max} liters`;
    }

    // Cost validation
    if (requirements.target_cost_eur <= 0) {
      errors.target_cost_eur = 'Cost must be greater than 0';
    }

    // Fatigue cycles validation
    if (requirements.fatigue_cycles < VALIDATION_RULES.fatigueCycles.min) {
      errors.fatigue_cycles = `Fatigue cycles must be at least ${VALIDATION_RULES.fatigueCycles.min.toLocaleString()}`;
    }

    return errors;
  }, [requirements]);

  // Check if current step has validation errors
  const currentStepHasErrors = useMemo(() => {
    switch (currentStep) {
      case 1: return !!validationErrors.working_pressure_bar;
      case 2: return !!validationErrors.internal_volume_liters;
      case 3: return !!validationErrors.target_weight_kg || !!validationErrors.target_cost_eur;
      case 4: return !!validationErrors.operating_temp || !!validationErrors.fatigue_cycles;
      default: return false;
    }
  }, [currentStep, validationErrors]);

  const hasAnyErrors = Object.keys(validationErrors).length > 0;

  const handleApplicationSelect = useCallback((type: ApplicationType) => {
    setApplicationType(type);
    const preset = APPLICATION_PRESETS[type];
    setRequirements((prev) => ({ ...prev, ...preset.defaults }));
    setCurrentStep(1);
  }, []);

  const updateRequirement = useCallback((key: string, value: number | string) => {
    setRequirements((prev) => ({ ...prev, [key]: value }));
  }, []);

  const nextStep = () => {
    if (!currentStepHasErrors && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  const prevStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);
  const handleComplete = () => {
    if (!hasAnyErrors) {
      onComplete(requirements);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">Select application type:</p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(APPLICATION_PRESETS) as [ApplicationType, typeof APPLICATION_PRESETS.automotive][]).map(
                ([type, preset]) => {
                  const Icon = preset.icon;
                  const selected = applicationType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => handleApplicationSelect(type)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        selected ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={20} className="text-gray-600 mb-2" />
                      <div className="font-medium text-gray-900">{preset.label}</div>
                      <div className="text-xs text-gray-500">{preset.description}</div>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Working pressure (bar):</p>
            <div className="flex gap-2 flex-wrap">
              {[350, 500, 700, 875].map((p) => (
                <button
                  key={p}
                  onClick={() => updateRequirement('working_pressure_bar', p)}
                  className={`px-4 py-2 rounded border text-sm ${
                    requirements.working_pressure_bar === p
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {p} bar
                </button>
              ))}
            </div>
            <input
              type="number"
              value={requirements.working_pressure_bar}
              onChange={(e) => updateRequirement('working_pressure_bar', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded text-sm ${
                validationErrors.working_pressure_bar ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Custom pressure"
              min={VALIDATION_RULES.pressure.min}
              max={VALIDATION_RULES.pressure.max}
            />
            {validationErrors.working_pressure_bar && (
              <div className="flex items-center gap-2 text-red-600 text-sm" role="alert">
                <AlertTriangle size={16} />
                <span>{validationErrors.working_pressure_bar}</span>
              </div>
            )}
            <p className="text-xs text-gray-500">Valid range: {VALIDATION_RULES.pressure.min}-{VALIDATION_RULES.pressure.max} bar</p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Storage volume (liters):</p>
            <div className="flex gap-2 flex-wrap">
              {[50, 100, 150, 250, 500].map((v) => (
                <button
                  key={v}
                  onClick={() => updateRequirement('internal_volume_liters', v)}
                  className={`px-4 py-2 rounded border text-sm ${
                    requirements.internal_volume_liters === v
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {v} L
                </button>
              ))}
            </div>
            <input
              type="number"
              value={requirements.internal_volume_liters}
              onChange={(e) => updateRequirement('internal_volume_liters', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
              placeholder="Custom volume"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Target weight (kg):</label>
              <input
                type="number"
                value={requirements.target_weight_kg}
                onChange={(e) => updateRequirement('target_weight_kg', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded text-sm ${
                  validationErrors.target_weight_kg ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
                min={1}
              />
              {validationErrors.target_weight_kg && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-1" role="alert">
                  <AlertTriangle size={16} />
                  <span>{validationErrors.target_weight_kg}</span>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                {[50, 80, 100, 150].map((w) => (
                  <button
                    key={w}
                    onClick={() => updateRequirement('target_weight_kg', w)}
                    className={`px-3 py-1 rounded text-xs ${
                      requirements.target_weight_kg === w ? 'bg-gray-900 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {w} kg
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Target cost (€):</label>
              <input
                type="number"
                value={requirements.target_cost_eur}
                onChange={(e) => updateRequirement('target_cost_eur', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded text-sm ${
                  validationErrors.target_cost_eur ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
                min={100}
              />
              {validationErrors.target_cost_eur && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-1" role="alert">
                  <AlertTriangle size={16} />
                  <span>{validationErrors.target_cost_eur}</span>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                {[8000, 12000, 15000, 20000].map((c) => (
                  <button
                    key={c}
                    onClick={() => updateRequirement('target_cost_eur', c)}
                    className={`px-3 py-1 rounded text-xs ${
                      requirements.target_cost_eur === c ? 'bg-gray-900 text-white' : 'bg-gray-100'
                    }`}
                  >
                    €{c / 1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Min temp (°C):</label>
                <input
                  type="number"
                  value={requirements.operating_temp_min_c}
                  onChange={(e) => updateRequirement('operating_temp_min_c', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded text-sm ${
                    validationErrors.operating_temp ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Max temp (°C):</label>
                <input
                  type="number"
                  value={requirements.operating_temp_max_c}
                  onChange={(e) => updateRequirement('operating_temp_max_c', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded text-sm ${
                    validationErrors.operating_temp ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
              </div>
            </div>
            {validationErrors.operating_temp && (
              <div className="flex items-center gap-2 text-red-600 text-sm" role="alert">
                <AlertTriangle size={16} />
                <span>{validationErrors.operating_temp}</span>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-600 block mb-1">Fatigue cycles:</label>
              <input
                type="number"
                value={requirements.fatigue_cycles}
                onChange={(e) => updateRequirement('fatigue_cycles', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded text-sm ${
                  validationErrors.fatigue_cycles ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
                min={VALIDATION_RULES.fatigueCycles.min}
              />
              {validationErrors.fatigue_cycles && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-1" role="alert">
                  <AlertTriangle size={16} />
                  <span>{validationErrors.fatigue_cycles}</span>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                {[11000, 20000, 45000].map((c) => (
                  <button
                    key={c}
                    onClick={() => updateRequirement('fatigue_cycles', c)}
                    className={`px-3 py-1 rounded text-xs ${
                      requirements.fatigue_cycles === c ? 'bg-gray-900 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {c.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Certification region:</p>
            {[
              { value: 'EU', label: 'EU', desc: 'ISO 11119-3, UN R134' },
              { value: 'USA', label: 'USA', desc: 'ASME, ANSI/CSA' },
              { value: 'International', label: 'International', desc: 'Both EU and USA' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateRequirement('certification_region', opt.value)}
                className={`w-full p-3 rounded border text-left ${
                  requirements.certification_region === opt.value
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </button>
            ))}
          </div>
        );

      case 6:
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-3">Review specifications:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Application:</span>
                <span className="ml-2 font-medium">{applicationType || 'Custom'}</span>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Pressure:</span>
                <span className="ml-2 font-medium">{requirements.working_pressure_bar} bar</span>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Volume:</span>
                <span className="ml-2 font-medium">{requirements.internal_volume_liters} L</span>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Weight:</span>
                <span className="ml-2 font-medium">{requirements.target_weight_kg} kg</span>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Cost:</span>
                <span className="ml-2 font-medium">€{requirements.target_cost_eur.toLocaleString()}</span>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Temp:</span>
                <span className="ml-2 font-medium">{requirements.operating_temp_min_c}° to {requirements.operating_temp_max_c}°C</span>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Cycles:</span>
                <span className="ml-2 font-medium">{requirements.fatigue_cycles.toLocaleString()}</span>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Cert:</span>
                <span className="ml-2 font-medium">{requirements.certification_region}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            Step {currentStep + 1}: {STEPS[currentStep]}
          </span>
          <span className="text-xs text-gray-500">{currentStep + 1} / {STEPS.length}</span>
        </div>
        {/* Progress */}
        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 transition-all"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">{renderContent()}</div>

      {/* Navigation */}
      <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} size="sm">
          <ChevronLeft size={16} className="mr-1" /> Back
        </Button>
        {currentStepHasErrors && (
          <span className="text-xs text-red-600 flex items-center gap-1">
            <AlertTriangle size={14} />
            Fix errors to continue
          </span>
        )}
        {currentStep === STEPS.length - 1 ? (
          <Button onClick={handleComplete} disabled={hasAnyErrors} size="sm">
            <Check size={16} className="mr-1" /> Complete
          </Button>
        ) : (
          <Button
            onClick={nextStep}
            disabled={(currentStep === 0 && !applicationType) || currentStepHasErrors}
            size="sm"
          >
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
