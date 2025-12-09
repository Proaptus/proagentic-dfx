/**
 * MaterialPropertyCard Component
 * REQ-011 to REQ-015: Display individual material properties
 * REQ-272: Component library with consistent styling
 */

'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import type { MaterialProperties } from '@/lib/data/materials';

interface MaterialPropertyCardProps {
  material: MaterialProperties;
  compact?: boolean;
}

export function MaterialPropertyCard({
  material,
  compact = false,
}: MaterialPropertyCardProps) {
  const getCategoryBadge = (category: string) => {
    const colors = {
      fiber: 'bg-blue-100 text-blue-700',
      matrix: 'bg-green-100 text-green-700',
      liner: 'bg-purple-100 text-purple-700',
      boss: 'bg-orange-100 text-orange-700',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const renderFiberProperties = (mat: MaterialProperties) => {
    if (mat.category !== 'fiber') return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <PropertyRow label="E₁ (Longitudinal)" value={`${mat.E1} GPa`} highlight />
          <PropertyRow label="E₂ (Transverse)" value={`${mat.E2} GPa`} />
          <PropertyRow label="G₁₂ (Shear)" value={`${mat.G12} GPa`} />
          <PropertyRow label="ν₁₂ (Poisson)" value={mat.nu12.toFixed(2)} />
          <PropertyRow label="Xₜ (Tensile)" value={`${mat.Xt} MPa`} highlight />
          <PropertyRow label="Xc (Compressive)" value={`${mat.Xc} MPa`} />
          <PropertyRow label="Density" value={`${mat.density} g/cm³`} />
          <PropertyRow label="Fiber Ø" value={`${mat.fiber_diameter} μm`} />
        </div>

        {!compact && (
          <>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Strength Properties</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <PropertyRow label="Yₜ (Trans. Tensile)" value={`${mat.Yt} MPa`} small />
                <PropertyRow label="Yc (Trans. Comp.)" value={`${mat.Yc} MPa`} small />
                <PropertyRow label="S (Shear)" value={`${mat.S} MPa`} small />
                <PropertyRow label="Max Temp" value={`${mat.max_service_temp}°C`} small />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Applications</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {mat.typical_applications.map((app, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {app}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Cost: ${mat.cost_per_kg}/kg</span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              mat.availability === 'excellent'
                ? 'bg-green-100 text-green-700'
                : mat.availability === 'good'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {mat.availability}
          </span>
        </div>
      </div>
    );
  };

  const renderMatrixProperties = (mat: MaterialProperties) => {
    if (mat.category !== 'matrix') return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <PropertyRow label="Modulus (E)" value={`${mat.E} GPa`} highlight />
          <PropertyRow label="Tensile Strength" value={`${mat.tensile_strength} MPa`} highlight />
          <PropertyRow label="Elongation at Break" value={`${mat.elongation_at_break}%`} />
          <PropertyRow label="Density" value={`${mat.density} g/cm³`} />
          <PropertyRow label="Tg (Glass Trans.)" value={`${mat.glass_transition_temp}°C`} />
          <PropertyRow label="Cure Temp" value={`${mat.cure_temp}°C`} />
          <PropertyRow label="Cure Time" value={`${mat.cure_time} hrs`} />
          <PropertyRow label="Moisture Abs." value={`${mat.moisture_absorption}%`} />
        </div>

        {!compact && (
          <>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Compatibility</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">H₂ Compatibility:</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    mat.hydrogen_compatibility === 'excellent'
                      ? 'bg-green-100 text-green-700'
                      : mat.hydrogen_compatibility === 'good'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {mat.hydrogen_compatibility}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Applications</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {mat.typical_applications.map((app, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {app}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Cost: ${mat.cost_per_kg}/kg</span>
        </div>
      </div>
    );
  };

  const renderLinerProperties = (mat: MaterialProperties) => {
    if (mat.category !== 'liner') return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <PropertyRow label="Tensile Strength" value={`${mat.tensile_strength} MPa`} />
          <PropertyRow label="Elongation" value={`${mat.elongation_at_break}%`} />
          <PropertyRow label="Flexural Modulus" value={`${mat.flexural_modulus} GPa`} />
          <PropertyRow label="Density" value={`${mat.density} g/cm³`} />
          <PropertyRow label="Melting Point" value={`${mat.melting_point}°C`} />
          <PropertyRow label="Tg" value={`${mat.glass_transition_temp}°C`} />
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            H₂ Permeation (Critical)
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <PropertyRow
              label="@ 20°C"
              value={`${mat.h2_permeation} cm³/(m²·d·bar)`}
              highlight
            />
            <PropertyRow
              label="@ 55°C"
              value={`${mat.h2_permeation_at_55C} cm³/(m²·d·bar)`}
              highlight
            />
          </div>
        </div>

        {!compact && (
          <>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Processing</h4>
              <div className="flex gap-2 flex-wrap">
                {mat.rotomolding_capable && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    Rotomolding
                  </span>
                )}
                {mat.blow_molding_capable && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    Blow Molding
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Applications</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {mat.typical_applications.map((app, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    {app}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Cost: ${mat.cost_per_kg}/kg</span>
        </div>
      </div>
    );
  };

  const renderBossProperties = (mat: MaterialProperties) => {
    if (mat.category !== 'boss') return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <PropertyRow label="Yield Strength" value={`${mat.yield_strength} MPa`} highlight />
          <PropertyRow label="Ultimate Strength" value={`${mat.ultimate_strength} MPa`} highlight />
          <PropertyRow label="Modulus (E)" value={`${mat.E} GPa`} />
          <PropertyRow label="Elongation" value={`${mat.elongation}%`} />
          <PropertyRow label="Hardness" value={mat.hardness} />
          <PropertyRow label="Density" value={`${mat.density} g/cm³`} />
          <PropertyRow label="Fatigue Strength" value={`${mat.fatigue_strength} MPa`} />
          <PropertyRow label="Machinability" value={`${mat.machinability_rating}/10`} />
        </div>

        {!compact && (
          <>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">H₂ Embrittlement</h4>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  mat.hydrogen_embrittlement_resistance === 'excellent'
                    ? 'bg-green-100 text-green-700'
                    : mat.hydrogen_embrittlement_resistance === 'good'
                      ? 'bg-yellow-100 text-yellow-700'
                      : mat.hydrogen_embrittlement_resistance === 'fair'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                }`}
              >
                {mat.hydrogen_embrittlement_resistance}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Applications</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {mat.typical_applications.map((app, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    {app}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Cost: ${mat.cost_per_kg}/kg</span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{material.name}</CardTitle>
            {'manufacturer' in material && (
              <p className="text-sm text-gray-500 mt-1">{(material as { manufacturer?: string }).manufacturer}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadge(material.category)}`}>
            {material.category.toUpperCase()}
          </span>
        </div>
      </CardHeader>

      {material.category === 'fiber' && renderFiberProperties(material)}
      {material.category === 'matrix' && renderMatrixProperties(material)}
      {material.category === 'liner' && renderLinerProperties(material)}
      {material.category === 'boss' && renderBossProperties(material)}
    </Card>
  );
}

// Helper component for property rows
function PropertyRow({
  label,
  value,
  highlight = false,
  small = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  small?: boolean;
}) {
  return (
    <div className={small ? 'text-xs' : ''}>
      <div className="text-gray-500 text-xs">{label}</div>
      <div
        className={`font-medium ${highlight ? 'text-blue-600' : 'text-gray-900'} ${small ? 'text-xs' : 'text-sm'}`}
      >
        {value}
      </div>
    </div>
  );
}
