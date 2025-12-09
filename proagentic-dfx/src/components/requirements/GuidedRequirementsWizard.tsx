'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Car,
  Plane,
  Factory,
  Zap,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';

interface GuidedRequirementsWizardProps {
  onComplete: (requirements: Record<string, unknown>) => void;
}

type ApplicationType = 'automotive' | 'aviation' | 'stationary' | 'custom';

const STEPS = ['Application', 'Pressure', 'Capacity', 'Constraints', 'Environment', 'Certification', 'Review'];

const APPLICATION_PRESETS = {
  automotive: {
    label: 'Automotive',
    icon: Car,
    description: '700 bar Type IV for fuel cell vehicles',
    defaults: {
      working_pressure_bar: 700,
      internal_volume_liters: 150,
      target_weight_kg: 80,
      target_cost_eur: 15000,
      operating_temp_min_c: -40,
      operating_temp_max_c: 85,
      fatigue_cycles: 11000,
      certification_region: 'EU',
    },
  },
  aviation: {
    label: 'Aviation',
    icon: Plane,
    description: '350 bar lightweight for drones/aircraft',
    defaults: {
      working_pressure_bar: 350,
      internal_volume_liters: 50,
      target_weight_kg: 25,
      target_cost_eur: 20000,
      operating_temp_min_c: -55,
      operating_temp_max_c: 70,
      fatigue_cycles: 20000,
      certification_region: 'International',
    },
  },
  stationary: {
    label: 'Stationary',
    icon: Factory,
    description: '500 bar for energy storage',
    defaults: {
      working_pressure_bar: 500,
      internal_volume_liters: 500,
      target_weight_kg: 200,
      target_cost_eur: 8000,
      operating_temp_min_c: -10,
      operating_temp_max_c: 50,
      fatigue_cycles: 45000,
      certification_region: 'EU',
    },
  },
  custom: {
    label: 'Custom',
    icon: Zap,
    description: 'Define your own specs',
    defaults: {
      working_pressure_bar: 700,
      internal_volume_liters: 100,
      target_weight_kg: 50,
      target_cost_eur: 10000,
      operating_temp_min_c: -40,
      operating_temp_max_c: 85,
      fatigue_cycles: 11000,
      certification_region: 'EU',
    },
  },
};

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

  const handleApplicationSelect = useCallback((type: ApplicationType) => {
    setApplicationType(type);
    const preset = APPLICATION_PRESETS[type];
    setRequirements((prev) => ({ ...prev, ...preset.defaults }));
    setCurrentStep(1);
  }, []);

  const updateRequirement = useCallback((key: string, value: number | string) => {
    setRequirements((prev) => ({ ...prev, [key]: value }));
  }, []);

  const nextStep = () => currentStep < STEPS.length - 1 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);
  const handleComplete = () => onComplete(requirements);

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
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
              placeholder="Custom pressure"
            />
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
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
              />
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
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
              />
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
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Max temp (°C):</label>
                <input
                  type="number"
                  value={requirements.operating_temp_max_c}
                  onChange={(e) => updateRequirement('operating_temp_max_c', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Fatigue cycles:</label>
              <input
                type="number"
                value={requirements.fatigue_cycles}
                onChange={(e) => updateRequirement('fatigue_cycles', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
              />
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
      <div className="px-4 py-3 border-t border-gray-100 flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} size="sm">
          <ChevronLeft size={16} className="mr-1" /> Back
        </Button>
        {currentStep === STEPS.length - 1 ? (
          <Button onClick={handleComplete} size="sm">
            <Check size={16} className="mr-1" /> Complete
          </Button>
        ) : (
          <Button onClick={nextStep} disabled={currentStep === 0 && !applicationType} size="sm">
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
