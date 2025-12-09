'use client';

/**
 * TankTypeShowcase Component
 *
 * Interactive gallery of hydrogen tank types (Type I - Type V)
 * with visual representation and key specifications.
 */

import { useState, useMemo } from 'react';
import {
  TankType,
  getTankTypeSpec,
  TYPE_I_SPEC,
  TYPE_II_SPEC,
  TYPE_III_SPEC,
  TYPE_IV_SPEC,
  TYPE_V_SPEC,
} from '@/lib/tank-models';
import { Check, Info, Layers, Gauge, Scale, DollarSign } from 'lucide-react';

interface TankTypeShowcaseProps {
  selectedType?: TankType;
  onSelect?: (type: TankType) => void;
  showDetails?: boolean;
  compact?: boolean;
}

const ALL_TANK_TYPES = [
  TYPE_I_SPEC,
  TYPE_II_SPEC,
  TYPE_III_SPEC,
  TYPE_IV_SPEC,
  TYPE_V_SPEC,
];

// Tank SVG visual representation
function TankSVG({
  type,
  layers,
  isSelected,
  animate = false
}: {
  type: TankType;
  layers: { color: [number, number, number]; thickness: number; name: string }[];
  isSelected: boolean;
  animate?: boolean;
}) {
  // Calculate layer radii based on thickness
  const baseRadius = 30;
  const maxThickness = 20;

  // Normalize thicknesses
  const totalThickness = layers.reduce((sum, l) => sum + l.thickness, 0);
  const scale = maxThickness / totalThickness;

  let currentRadius = baseRadius;
  const layerPaths = layers.map((layer, idx) => {
    const scaledThickness = layer.thickness * scale;
    const outerRadius = currentRadius + scaledThickness;
    const path = `
      M ${60 - outerRadius} 50
      Q ${60 - outerRadius} ${50 - outerRadius * 0.5} ${60} ${50 - outerRadius * 0.4}
      Q ${60 + outerRadius} ${50 - outerRadius * 0.5} ${60 + outerRadius} 50
      L ${60 + outerRadius} 100
      Q ${60 + outerRadius} ${100 + outerRadius * 0.5} ${60} ${100 + outerRadius * 0.4}
      Q ${60 - outerRadius} ${100 + outerRadius * 0.5} ${60 - outerRadius} 100
      Z
    `;
    currentRadius = outerRadius;

    const color = `rgb(${Math.round(layer.color[0] * 255)}, ${Math.round(layer.color[1] * 255)}, ${Math.round(layer.color[2] * 255)})`;

    return { path, color, name: layer.name, idx };
  });

  // Reverse so inner layers render on top
  const reversedPaths = [...layerPaths].reverse();

  return (
    <svg
      viewBox="0 0 120 150"
      className={`w-full h-full transition-transform duration-300 ${animate ? 'animate-pulse' : ''} ${isSelected ? 'scale-105' : ''}`}
    >
      <defs>
        <linearGradient id={`tankGradient-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
        <filter id="tankShadow">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Tank body layers */}
      <g filter="url(#tankShadow)">
        {reversedPaths.map(({ path, color, idx }) => (
          <path
            key={idx}
            d={path}
            fill={color}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="0.5"
          />
        ))}

        {/* Shine overlay */}
        <path
          d={layerPaths[layerPaths.length - 1].path}
          fill={`url(#tankGradient-${type})`}
        />
      </g>

      {/* Boss ports */}
      <ellipse cx="60" cy="45" rx="8" ry="3" fill="#555" />
      <rect x="56" y="38" width="8" height="8" fill="#666" rx="1" />
      <ellipse cx="60" cy="105" rx="8" ry="3" fill="#555" />
      <rect x="56" y="105" width="8" height="8" fill="#666" rx="1" />

      {/* Type label */}
      <text
        x="60"
        y="140"
        textAnchor="middle"
        className="fill-gray-600 text-[8px] font-semibold"
      >
        {type.replace('_', ' ')}
      </text>
    </svg>
  );
}

// Spec comparison bar
function SpecBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = (value / max) * 100;
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}

export function TankTypeShowcase({
  selectedType,
  onSelect,
  showDetails = true,
  compact = false
}: TankTypeShowcaseProps) {
  const [hoveredType, setHoveredType] = useState<TankType | null>(null);
  const [detailType, setDetailType] = useState<TankType | null>(null);

  const activeSpec = useMemo(() => {
    const type = detailType || hoveredType || selectedType;
    return type ? getTankTypeSpec(type) : null;
  }, [detailType, hoveredType, selectedType]);

  if (compact) {
    return (
      <div className="flex gap-2">
        {ALL_TANK_TYPES.map((spec) => (
          <button
            key={spec.type}
            onClick={() => onSelect?.(spec.type)}
            className={`p-2 rounded-lg border-2 transition-all ${
              selectedType === spec.type
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="w-12 h-16">
              <TankSVG
                type={spec.type}
                layers={spec.materialLayers}
                isSelected={selectedType === spec.type}
              />
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers size={20} />
          Hydrogen Tank Types
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          Select a tank construction type for your application
        </p>
      </div>

      {/* Tank Type Grid */}
      <div className="grid grid-cols-5 gap-4 p-4">
        {ALL_TANK_TYPES.map((spec) => {
          const isSelected = selectedType === spec.type;
          const isHovered = hoveredType === spec.type;

          return (
            <button
              key={spec.type}
              onClick={() => {
                onSelect?.(spec.type);
                setDetailType(spec.type);
              }}
              onMouseEnter={() => setHoveredType(spec.type)}
              onMouseLeave={() => setHoveredType(null)}
              className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : isHovered
                  ? 'border-blue-300 bg-gray-50 shadow-md'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}

              {/* Tank Visual */}
              <div className="h-24 mb-2">
                <TankSVG
                  type={spec.type}
                  layers={spec.materialLayers}
                  isSelected={isSelected}
                  animate={isHovered}
                />
              </div>

              {/* Type Name */}
              <div className="text-xs font-bold text-gray-900 text-center">
                {spec.name.split('(')[0].trim()}
              </div>
              <div className="text-[10px] text-gray-500 text-center mt-0.5">
                {spec.name.includes('(') ? spec.name.split('(')[1].replace(')', '') : ''}
              </div>

              {/* Quick Stats */}
              <div className="mt-2 flex justify-center gap-2 text-[9px]">
                <span className={`px-1.5 py-0.5 rounded ${
                  spec.costRatio < 0.6 ? 'bg-green-100 text-green-700' :
                  spec.costRatio < 1.0 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  ${spec.costRatio < 0.6 ? '$' : spec.costRatio < 1.0 ? '$$' : '$$$'}
                </span>
                <span className={`px-1.5 py-0.5 rounded ${
                  spec.weightRatio < 1.5 ? 'bg-green-100 text-green-700' :
                  spec.weightRatio < 2.5 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {spec.weightRatio < 1.5 ? 'Light' : spec.weightRatio < 2.5 ? 'Medium' : 'Heavy'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Panel */}
      {showDetails && activeSpec && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex gap-6">
            {/* Large Tank Preview */}
            <div className="w-32 h-40 flex-shrink-0">
              <TankSVG
                type={activeSpec.type}
                layers={activeSpec.materialLayers}
                isSelected={true}
              />
            </div>

            {/* Specs */}
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="text-base font-bold text-gray-900">{activeSpec.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{activeSpec.description}</p>
              </div>

              {/* Pressure Range */}
              <div className="flex items-center gap-3">
                <Gauge size={16} className="text-blue-500" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Operating Pressure</div>
                  <div className="text-sm font-semibold">
                    {activeSpec.typicalPressure.min} - {activeSpec.typicalPressure.max} bar
                  </div>
                </div>
              </div>

              {/* Weight & Cost Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <Scale size={12} />
                    Weight (relative)
                  </div>
                  <SpecBar value={activeSpec.weightRatio} max={4} color="bg-orange-500" />
                  <div className="text-xs text-gray-600 mt-1">{activeSpec.weightRatio}x vs Type IV</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <DollarSign size={12} />
                    Cost (relative)
                  </div>
                  <SpecBar value={activeSpec.costRatio} max={2} color="bg-green-500" />
                  <div className="text-xs text-gray-600 mt-1">{activeSpec.costRatio}x vs Type IV</div>
                </div>
              </div>

              {/* Material Layers */}
              <div>
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Layers size={12} />
                  Material Layers
                </div>
                <div className="flex gap-2 flex-wrap">
                  {activeSpec.materialLayers.map((layer, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-white border border-gray-200"
                    >
                      <div
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{
                          backgroundColor: `rgb(${Math.round(layer.color[0] * 255)}, ${Math.round(layer.color[1] * 255)}, ${Math.round(layer.color[2] * 255)})`
                        }}
                      />
                      <span className="font-medium">{layer.name}</span>
                      <span className="text-gray-400">({layer.thickness}mm)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="flex gap-2">
                {activeSpec.hasMetal && (
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">Metal Liner</span>
                )}
                {activeSpec.hasPolymer && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Polymer Liner</span>
                )}
                {activeSpec.hasComposite && (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                    {activeSpec.compositePattern === 'hoop' ? 'Hoop Wrap' :
                     activeSpec.compositePattern === 'full' ? 'Full Wrap' :
                     activeSpec.compositePattern === 'advanced' ? 'Advanced Composite' : 'Composite'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TankTypeShowcase;
