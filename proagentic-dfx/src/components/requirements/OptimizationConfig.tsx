'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { ChevronDown, ChevronRight, HelpCircle, Settings, Target, Layers } from 'lucide-react';
import type { ParsedRequirements } from '@/lib/types';

interface OptimizationConfigProps {
  requirements: ParsedRequirements;
  tankType: 'IV' | 'III' | 'V';
  onStart: (config: OptimizationConfiguration) => void;
}

export interface OptimizationConfiguration {
  objectives: string[];
  constraints: Record<string, number>;
  materials: {
    fiber: string;
    matrix: string;
    liner: string;
  };
  advanced: {
    generations: number;
    population_size: number;
    mutation_rate: number;
  };
}

const FIBER_OPTIONS = [
  { value: 'T700S', label: 'T700S (Standard Modulus)', cost: 'Medium', strength: 'High' },
  { value: 'T800', label: 'T800 (Intermediate Modulus)', cost: 'High', strength: 'Very High' },
  { value: 'T1000', label: 'T1000 (High Modulus)', cost: 'Very High', strength: 'Extreme' },
  { value: 'IM7', label: 'IM7 (Intermediate Modulus)', cost: 'High', strength: 'Very High' },
];

const MATRIX_OPTIONS = [
  { value: 'EP_TOUGHENED', label: 'Epoxy (Toughened)', performance: 'Balanced', cost: 'Medium' },
  { value: 'EP_HIGH_TEMP', label: 'Epoxy (High Temp)', performance: 'High Temp', cost: 'High' },
  { value: 'VINYL_ESTER', label: 'Vinyl Ester', performance: 'Good', cost: 'Low' },
];

const LINER_OPTIONS_TYPE_IV = [
  { value: 'HDPE_BARRIER', label: 'HDPE with Barrier Layer', permeation: 'Excellent', cost: 'Medium' },
  { value: 'PA6_BARRIER', label: 'PA6 with Barrier Layer', permeation: 'Good', cost: 'Medium-High' },
  { value: 'HDPE', label: 'HDPE (Standard)', permeation: 'Fair', cost: 'Low' },
];

const LINER_OPTIONS_TYPE_III = [
  { value: 'AL_6061_T6', label: 'Aluminum 6061-T6', weight: 'Light', cost: 'Medium' },
  { value: 'AL_7075_T6', label: 'Aluminum 7075-T6', weight: 'Medium', cost: 'High' },
  { value: 'TITANIUM', label: 'Titanium Alloy', weight: 'Very Light', cost: 'Very High' },
];

export function OptimizationConfig({ requirements, tankType, onStart }: OptimizationConfigProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [objectives, setObjectives] = useState<string[]>([
    'minimize_weight',
    'minimize_cost',
    'maximize_reliability',
  ]);

  const [constraints, setConstraints] = useState({
    max_weight_kg: requirements.target_weight_kg,
    max_cost_eur: requirements.target_cost_eur,
    min_burst_ratio: requirements.min_burst_ratio,
  });

  const [materials, setMaterials] = useState({
    fiber: 'T700S',
    matrix: 'EP_TOUGHENED',
    liner: tankType === 'IV' ? 'HDPE_BARRIER' : 'AL_6061_T6',
  });

  const [advanced, setAdvanced] = useState({
    generations: 50,
    population_size: 100,
    mutation_rate: 0.1,
  });

  const objectiveOptions = [
    {
      id: 'minimize_weight',
      label: 'Minimize Weight',
      description: 'Optimize for lightest possible design',
      icon: '⚖️',
    },
    {
      id: 'minimize_cost',
      label: 'Minimize Cost',
      description: 'Optimize for lowest production cost',
      icon: '💰',
    },
    {
      id: 'maximize_reliability',
      label: 'Maximize Reliability',
      description: 'Optimize for highest safety margins',
      icon: '🛡️',
    },
  ];

  const toggleObjective = (objectiveId: string) => {
    setObjectives((prev) => {
      if (prev.includes(objectiveId)) {
        // Must have at least one objective
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== objectiveId);
      }
      return [...prev, objectiveId];
    });
  };

  const handleStart = () => {
    onStart({
      objectives,
      constraints,
      materials,
      advanced,
    });
  };

  const linerOptions = tankType === 'IV' ? LINER_OPTIONS_TYPE_IV : LINER_OPTIONS_TYPE_III;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Configuration</CardTitle>
      </CardHeader>

      <div className="px-4 pb-4 space-y-6">
        {/* Objectives Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-blue-600" />
            <h4 className="font-semibold text-gray-900">Optimization Objectives</h4>
            <Tooltip content="Select one or more objectives to optimize for. Multi-objective optimization will find Pareto-optimal designs.">
              <HelpCircle size={14} className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>

          <div className="space-y-2">
            {objectiveOptions.map((option) => {
              const isSelected = objectives.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleObjective(option.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.description}</div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Constraints Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Settings size={18} className="text-blue-600" />
            <h4 className="font-semibold text-gray-900">Design Constraints</h4>
            <Tooltip content="Hard constraints that all designs must satisfy. These are derived from your requirements.">
              <HelpCircle size={14} className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Weight (kg)
              </label>
              <input
                type="number"
                value={constraints.max_weight_kg}
                onChange={(e) =>
                  setConstraints({ ...constraints, max_weight_kg: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Cost (€)
              </label>
              <input
                type="number"
                value={constraints.max_cost_eur}
                onChange={(e) =>
                  setConstraints({ ...constraints, max_cost_eur: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Burst Ratio
              </label>
              <input
                type="number"
                step="0.1"
                value={constraints.min_burst_ratio}
                onChange={(e) =>
                  setConstraints({ ...constraints, min_burst_ratio: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Typical: 2.25 (ISO 11119-3), Minimum: 2.0
              </p>
            </div>
          </div>
        </div>

        {/* Materials Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layers size={18} className="text-blue-600" />
            <h4 className="font-semibold text-gray-900">Material Selection</h4>
            <Tooltip content="Choose materials for composite construction. These affect weight, cost, and performance.">
              <HelpCircle size={14} className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carbon Fiber
              </label>
              <select
                value={materials.fiber}
                onChange={(e) => setMaterials({ ...materials, fiber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {FIBER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.strength} strength, {option.cost} cost
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matrix Resin
              </label>
              <select
                value={materials.matrix}
                onChange={(e) => setMaterials({ ...materials, matrix: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {MATRIX_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.performance}, {option.cost} cost
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liner Material (Type {tankType})
              </label>
              <select
                value={materials.liner}
                onChange={(e) => setMaterials({ ...materials, liner: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {linerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} -{' '}
                    {'permeation' in option
                      ? `${option.permeation} permeation`
                      : `${option.weight} weight`}
                    , {option.cost} cost
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            {showAdvanced ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            Advanced Options
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 pl-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Generations
                  <Tooltip content="Number of optimization iterations. More generations = better results but longer time.">
                    <HelpCircle size={12} className="inline ml-1 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={advanced.generations}
                  onChange={(e) =>
                    setAdvanced({ ...advanced, generations: Number(e.target.value) })
                  }
                  min={10}
                  max={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 50-100</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Population Size
                  <Tooltip content="Number of designs evaluated per generation. Larger = more diversity.">
                    <HelpCircle size={12} className="inline ml-1 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={advanced.population_size}
                  onChange={(e) =>
                    setAdvanced({ ...advanced, population_size: Number(e.target.value) })
                  }
                  min={20}
                  max={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 100-200</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mutation Rate
                  <Tooltip content="Probability of random design variations. Higher = more exploration.">
                    <HelpCircle size={12} className="inline ml-1 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={advanced.mutation_rate}
                  onChange={(e) =>
                    setAdvanced({ ...advanced, mutation_rate: Number(e.target.value) })
                  }
                  min={0.01}
                  max={0.5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 0.05-0.15</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary & Start Button */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">Configuration Summary</h5>
          <div className="space-y-1 text-sm text-gray-700 mb-4">
            <div className="flex justify-between">
              <span>Objectives:</span>
              <span className="font-medium">{objectives.length} selected</span>
            </div>
            <div className="flex justify-between">
              <span>Materials:</span>
              <span className="font-medium">
                {materials.fiber} / {materials.matrix} / {materials.liner}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Time:</span>
              <Badge variant="info">{Math.round((advanced.generations * advanced.population_size) / 100)} seconds</Badge>
            </div>
          </div>

          <Button onClick={handleStart} className="w-full">
            Start Optimization
          </Button>
        </div>
      </div>
    </Card>
  );
}
