/**
 * MaterialSelector Component
 * REQ-011 to REQ-015: Material selection interface
 * REQ-272: Component library with consistent styling
 */

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type {
  MaterialProperties,
  MaterialCategory,
} from '@/lib/data/materials';

interface MaterialSelectorProps {
  materials: MaterialProperties[];
  category: MaterialCategory;
  selectedId?: string;
  onSelect: (material: MaterialProperties) => void;
  label?: string;
}

export function MaterialSelector({
  materials,
  category,
  selectedId,
  onSelect,
  label,
}: MaterialSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = materials.find((m) => m.id === selectedId);

  const getCategoryColor = () => {
    const colors = {
      fiber: 'border-blue-300 bg-blue-50',
      matrix: 'border-green-300 bg-green-50',
      liner: 'border-purple-300 bg-purple-50',
      boss: 'border-orange-300 bg-orange-50',
    };
    return colors[category];
  };

  const getPerformanceRating = (material: MaterialProperties): number => {
    if (material.category === 'fiber') {
      return Math.round((material.E1 / 350) * 100);
    }
    if (material.category === 'matrix') {
      return material.hydrogen_compatibility === 'excellent' ? 95 : 75;
    }
    if (material.category === 'liner') {
      return Math.round(100 - (material.h2_permeation / 10));
    }
    if (material.category === 'boss') {
      return Math.round((material.yield_strength / 600) * 100);
    }
    return 50;
  };

  const getCostRating = (material: MaterialProperties): 'low' | 'medium' | 'high' => {
    const cost = material.cost_per_kg;
    if (category === 'fiber') {
      return cost < 40 ? 'low' : cost < 70 ? 'medium' : 'high';
    }
    if (category === 'matrix') {
      return cost < 20 ? 'low' : cost < 25 ? 'medium' : 'high';
    }
    if (category === 'liner') {
      return cost < 4 ? 'low' : cost < 7 ? 'medium' : 'high';
    }
    if (category === 'boss') {
      return cost < 5 ? 'low' : cost < 7 ? 'medium' : 'high';
    }
    return 'medium';
  };

  const renderMaterialPreview = (material: MaterialProperties) => {
    if (material.category === 'fiber') {
      return (
        <div className="grid grid-cols-3 gap-2 text-xs mt-2">
          <div>
            <span className="text-gray-500">E₁:</span>{' '}
            <span className="font-medium">{material.E1} GPa</span>
          </div>
          <div>
            <span className="text-gray-500">Xₜ:</span>{' '}
            <span className="font-medium">{material.Xt} MPa</span>
          </div>
          <div>
            <span className="text-gray-500">ρ:</span>{' '}
            <span className="font-medium">{material.density} g/cm³</span>
          </div>
        </div>
      );
    }

    if (material.category === 'matrix') {
      return (
        <div className="grid grid-cols-3 gap-2 text-xs mt-2">
          <div>
            <span className="text-gray-500">E:</span>{' '}
            <span className="font-medium">{material.E} GPa</span>
          </div>
          <div>
            <span className="text-gray-500">Tg:</span>{' '}
            <span className="font-medium">{material.glass_transition_temp}°C</span>
          </div>
          <div>
            <span className="text-gray-500">H₂:</span>{' '}
            <span className="font-medium">{material.hydrogen_compatibility}</span>
          </div>
        </div>
      );
    }

    if (material.category === 'liner') {
      return (
        <div className="grid grid-cols-3 gap-2 text-xs mt-2">
          <div>
            <span className="text-gray-500">Perm@20°C:</span>{' '}
            <span className="font-medium">{material.h2_permeation}</span>
          </div>
          <div>
            <span className="text-gray-500">Perm@55°C:</span>{' '}
            <span className="font-medium">{material.h2_permeation_at_55C}</span>
          </div>
          <div>
            <span className="text-gray-500">Type:</span>{' '}
            <span className="font-medium">{material.material_type}</span>
          </div>
        </div>
      );
    }

    if (material.category === 'boss') {
      return (
        <div className="grid grid-cols-3 gap-2 text-xs mt-2">
          <div>
            <span className="text-gray-500">Yield:</span>{' '}
            <span className="font-medium">{material.yield_strength} MPa</span>
          </div>
          <div>
            <span className="text-gray-500">UTS:</span>{' '}
            <span className="font-medium">{material.ultimate_strength} MPa</span>
          </div>
          <div>
            <span className="text-gray-500">H₂ Embr.:</span>{' '}
            <span className="font-medium">{material.hydrogen_embrittlement_resistance}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border-2 rounded-lg p-4 text-left transition-all hover:shadow-md ${
          isOpen ? 'ring-2 ring-blue-500' : ''
        } ${getCategoryColor()}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {selected ? (
              <div>
                <div className="font-medium text-gray-900">{selected.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {'manufacturer' in selected && selected.manufacturer}
                </div>
                {renderMaterialPreview(selected)}
              </div>
            ) : (
              <div className="text-gray-500">Select {category}...</div>
            )}
          </div>
          <ChevronDown
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            size={20}
          />
        </div>

        {selected && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Performance:</span>
              <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${getPerformanceRating(selected)}%` }}
                />
              </div>
              <span className="text-xs font-medium">{getPerformanceRating(selected)}%</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Cost:</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  getCostRating(selected) === 'low'
                    ? 'bg-green-100 text-green-700'
                    : getCostRating(selected) === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {getCostRating(selected)}
              </span>
            </div>
          </div>
        )}
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {materials.map((material) => (
            <button
              key={material.id}
              onClick={() => {
                onSelect(material);
                setIsOpen(false);
              }}
              className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-200 last:border-b-0 transition-colors ${
                material.id === selectedId ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-medium text-gray-900">{material.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {'manufacturer' in material && material.manufacturer} • ${material.cost_per_kg}/kg
              </div>
              {renderMaterialPreview(material)}

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Perf:</span>
                  <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${getPerformanceRating(material)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Cost:</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      getCostRating(material) === 'low'
                        ? 'bg-green-100 text-green-700'
                        : getCostRating(material) === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {getCostRating(material)}
                  </span>
                </div>

                {material.category === 'fiber' &&
                  'availability' in material && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        material.availability === 'excellent'
                          ? 'bg-green-100 text-green-700'
                          : material.availability === 'good'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {material.availability}
                    </span>
                  )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
