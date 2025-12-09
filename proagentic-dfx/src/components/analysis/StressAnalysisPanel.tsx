'use client';

import { useState, useEffect } from 'react';
import { StressContourChart } from '@/components/charts';
import { EquationDisplay } from './EquationDisplay';
import type { DesignStress } from '@/lib/types';

interface StressAnalysisPanelProps {
  data: DesignStress;
  designId?: string;
  onStressDataChange?: (data: DesignStress) => void;
}

type StressType = 'von_mises' | 'hoop' | 'axial' | 'shear';
type LoadCase = 'test_pressure' | 'burst_pressure' | 'operating_pressure';

const STRESS_TYPES: Record<StressType, string> = {
  von_mises: 'von Mises',
  hoop: 'Hoop Stress',
  axial: 'Axial Stress',
  shear: 'Shear Stress',
};

const LOAD_CASES: Record<LoadCase, string> = {
  test_pressure: 'Test Pressure (1.5×)',
  burst_pressure: 'Burst Pressure (2.25×)',
  operating_pressure: 'Operating Pressure (1.0×)',
};

const getTypeParam = (type: StressType): string => {
  const typeMap: Record<StressType, string> = {
    von_mises: 'vonMises',
    hoop: 'hoop',
    axial: 'axial',
    shear: 'shear',
  };
  return typeMap[type];
};

const getLoadCaseParam = (loadCase: LoadCase): string => {
  const loadMap: Record<LoadCase, string> = {
    test_pressure: 'test',
    burst_pressure: 'burst',
    operating_pressure: 'operating',
  };
  return loadMap[loadCase];
};

export function StressAnalysisPanel({ data: initialData, designId = 'C', onStressDataChange }: StressAnalysisPanelProps) {
  const [stressData, setStressData] = useState<DesignStress>(initialData);
  const [selectedStressType, setSelectedStressType] = useState<StressType>('von_mises');
  const [selectedLoadCase, setSelectedLoadCase] = useState<LoadCase>('test_pressure');
  const [isLoading, setIsLoading] = useState(false);
  const [showEquations, setShowEquations] = useState(false);

  useEffect(() => {
    const fetchStressData = async () => {
      setIsLoading(true);
      try {
        const typeParam = getTypeParam(selectedStressType);
        const loadCaseParam = getLoadCaseParam(selectedLoadCase);
        const response = await fetch(
          `/api/designs/${designId}/stress?type=${typeParam}&load_case=${loadCaseParam}`
        );
        if (response.ok) {
          const newData = await response.json();
          setStressData(newData);
          // Notify parent of data change so stats can update
          onStressDataChange?.(newData);
        }
      } catch (error) {
        console.error('Failed to fetch stress data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStressData();
  }, [selectedStressType, selectedLoadCase, designId, onStressDataChange]);

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Load Case
          </label>
          <select
            value={selectedLoadCase}
            onChange={(e) => setSelectedLoadCase(e.target.value as LoadCase)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {Object.entries(LOAD_CASES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stress Type
          </label>
          <select
            value={selectedStressType}
            onChange={(e) => setSelectedStressType(e.target.value as StressType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {Object.entries(STRESS_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowEquations(!showEquations)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showEquations
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          {showEquations ? 'Hide Equations' : 'Show Equations'}
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-sm text-gray-500 text-center py-2">
          Loading {STRESS_TYPES[selectedStressType]} analysis...
        </div>
      )}

      {/* Main Stress Chart - Full featured with all views */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[700px]">
        <StressContourChart
          stressData={stressData}
          onExport={(format) => console.log(`Exporting stress contour as ${format}`)}
        />
      </div>

      {/* Collapsible Equations Section */}
      {showEquations && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold text-gray-900">Engineering Equations</h3>

          <EquationDisplay
            title="Hoop Stress (Thin-Wall Approximation)"
            equation="σ_h = (P × r) / t"
            variables={[
              { symbol: 'σ_h', description: 'Hoop stress (circumferential)', value: `${Math.round(stressData.max_stress.value_mpa)} MPa` },
              { symbol: 'P', description: 'Internal pressure', value: `${stressData.load_pressure_bar} bar` },
              { symbol: 'r', description: 'Mean radius', value: '140 mm' },
              { symbol: 't', description: 'Wall thickness', value: '12 mm' },
            ]}
            explanation="For cylindrical pressure vessels, hoop stress is the primary stress component and is twice the axial stress in thin-wall approximation."
          />

          <EquationDisplay
            title="Axial Stress"
            equation="σ_a = (P × r) / (2t)"
            variables={[
              { symbol: 'σ_a', description: 'Axial stress (longitudinal)', value: `${Math.round(stressData.max_stress.value_mpa / 2)} MPa` },
            ]}
            explanation="Axial stress acts along the length of the cylinder and is half the hoop stress for thin-wall cylinders."
          />

          <EquationDisplay
            title="Von Mises Stress"
            equation="σ_vm = √(σ_h² + σ_a² - σ_h·σ_a)"
            variables={[
              { symbol: 'σ_vm', description: 'Von Mises equivalent stress', value: `${Math.round(stressData.max_stress.value_mpa)} MPa` },
              { symbol: 'σ_h', description: 'Hoop stress', value: 'From above' },
              { symbol: 'σ_a', description: 'Axial stress', value: 'From above' },
            ]}
            explanation="Von Mises stress combines all stress components into a single equivalent stress metric for comparing against material yield strength."
          />

          <EquationDisplay
            title="Safety Margin Calculation"
            equation="Margin = ((σ_allowable - σ_max) / σ_max) × 100%"
            variables={[
              { symbol: 'σ_allowable', description: 'Allowable stress (with safety factor)', value: `${stressData.max_stress.allowable_mpa} MPa` },
              { symbol: 'σ_max', description: 'Maximum stress (FEA)', value: `${stressData.max_stress.value_mpa} MPa` },
              { symbol: 'Margin', description: 'Safety margin', value: `${stressData.max_stress.margin_percent}%` },
            ]}
            explanation="Positive margin indicates design is safe. Typical aerospace requirement: ≥10% margin."
          />
        </div>
      )}
    </div>
  );
}
