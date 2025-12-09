'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { DataTable } from '@/components/ui/DataTable';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Weight,
  Shield,
  ChevronDown,
  ChevronRight,
  Star,
} from 'lucide-react';
import type { TankTypeRecommendation } from '@/lib/types';

interface TankTypeComparisonProps {
  recommendation: TankTypeRecommendation;
}

interface TankTypeDetail {
  type: string;
  name: string;
  structure: string;
  weightRange: string;
  costRange: string;
  performance: number;
  maturity: string;
  pros: string[];
  cons: string[];
  whyNot?: string;
  materials: {
    liner: string;
    reinforcement: string;
  };
}

const TANK_TYPE_DETAILS: Record<string, TankTypeDetail> = {
  I: {
    type: 'I',
    name: 'All Metal',
    structure: 'Seamless steel or aluminum',
    weightRange: '100-150 kg',
    costRange: '€2,000-€5,000',
    performance: 40,
    maturity: 'Mature (50+ years)',
    pros: ['Lowest cost', 'Proven technology', 'Simple manufacturing', 'No permeation'],
    cons: ['Heaviest option', 'Limited pressure (300 bar)', 'Poor gravimetric efficiency'],
    whyNot: 'Weight exceeds target by 2-3×. Only viable for stationary applications.',
    materials: {
      liner: 'None (monolithic)',
      reinforcement: 'Steel/Aluminum alloy',
    },
  },
  II: {
    type: 'II',
    name: 'Hoop-Wrapped',
    structure: 'Metal liner + hoop-wrapped composite',
    weightRange: '80-120 kg',
    costRange: '€5,000-€8,000',
    performance: 55,
    maturity: 'Mature (30+ years)',
    pros: ['Moderate weight', 'Good for 350 bar', 'Load-sharing liner'],
    cons: ['Limited to 350-450 bar', 'Still relatively heavy', 'Liner cost'],
    whyNot: 'Insufficient for 700 bar applications. Heavier than Type III/IV alternatives.',
    materials: {
      liner: 'Aluminum (load-sharing)',
      reinforcement: 'Carbon fiber (hoop only)',
    },
  },
  III: {
    type: 'III',
    name: 'Full-Wrapped Metal Liner',
    structure: 'Thin metal liner + full composite overwrap',
    weightRange: '60-85 kg',
    costRange: '€10,000-€18,000',
    performance: 75,
    maturity: 'Mature (20+ years)',
    pros: [
      'Proven for 700 bar',
      'Good reliability',
      'No permeation issues',
      'Damage tolerance',
    ],
    cons: ['Heavier than Type IV', 'Higher cost than Type IV', 'Liner adds weight'],
    whyNot: 'Type IV offers 15-20% weight savings with comparable cost and reliability.',
    materials: {
      liner: 'Aluminum (non-load-sharing)',
      reinforcement: 'Carbon fiber (full wrap)',
    },
  },
  IV: {
    type: 'IV',
    name: 'Full-Wrapped Polymer Liner',
    structure: 'Polymer liner + full composite overwrap',
    weightRange: '50-70 kg',
    costRange: '€12,000-€20,000',
    performance: 90,
    maturity: 'Mature (15+ years)',
    pros: [
      'Lightest option',
      'Excellent gravimetric efficiency',
      'Corrosion-free',
      'Cost-competitive',
    ],
    cons: [
      'Permeation requires barrier',
      'Temperature sensitivity',
      'Less damage tolerance',
    ],
    materials: {
      liner: 'HDPE with barrier layer',
      reinforcement: 'Carbon fiber (full wrap)',
    },
  },
  V: {
    type: 'V',
    name: 'Linerless',
    structure: 'All-composite (no liner)',
    weightRange: '40-60 kg',
    costRange: '€15,000-€30,000',
    performance: 95,
    maturity: 'Emerging (< 10 years)',
    pros: [
      'Absolute lightest',
      'Maximum efficiency',
      'No liner cost',
      'Corrosion-free',
    ],
    cons: [
      'Permeation challenges',
      'Limited production experience',
      'Higher development cost',
      'Certification barriers',
    ],
    whyNot:
      'Still in development. Limited suppliers and certification data. Higher risk for production.',
    materials: {
      liner: 'None (all-composite)',
      reinforcement: 'Carbon fiber with resin barrier',
    },
  },
};

export function TankTypeComparison({ recommendation }: TankTypeComparisonProps) {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set([recommendation.recommended_type]));

  const toggleType = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  const comparisonData = Object.values(TANK_TYPE_DETAILS).map((detail) => ({
    type: detail.type,
    name: detail.name,
    weightRange: detail.weightRange,
    costRange: detail.costRange,
    performance: detail.performance,
    maturity: detail.maturity,
    recommended: detail.type === recommendation.recommended_type,
  }));

  type ComparisonRow = typeof comparisonData[0];

  const columns = [
    {
      id: 'type',
      header: 'Type',
      accessor: 'type' as keyof ComparisonRow,
      width: '10%',
      format: (value: string, row?: ComparisonRow) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">Type {value}</span>
          {row?.recommended && <Star className="text-yellow-500 fill-yellow-500" size={18} />}
        </div>
      ),
    },
    {
      id: 'name',
      header: 'Name',
      accessor: 'name' as keyof ComparisonRow,
      width: '20%',
    },
    {
      id: 'weightRange',
      header: 'Weight Range',
      accessor: 'weightRange' as keyof ComparisonRow,
      width: '15%',
      format: (value: string) => (
        <span className="flex items-center gap-1 text-sm">
          <Weight size={14} className="text-gray-500" />
          {value}
        </span>
      ),
    },
    {
      id: 'costRange',
      header: 'Cost Range',
      accessor: 'costRange' as keyof ComparisonRow,
      width: '15%',
      format: (value: string) => (
        <span className="flex items-center gap-1 text-sm">
          <DollarSign size={14} className="text-gray-500" />
          {value}
        </span>
      ),
    },
    {
      id: 'performance',
      header: 'Performance Score',
      accessor: 'performance' as keyof ComparisonRow,
      width: '20%',
      format: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm font-medium">{value}/100</span>
        </div>
      ),
    },
    {
      id: 'maturity',
      header: 'Maturity',
      accessor: 'maturity' as keyof ComparisonRow,
      width: '20%',
      format: (value: string) => {
        const isMature = value.includes('Mature');
        return (
          <Badge variant={isMature ? 'success' : 'warning'}>
            {value}
          </Badge>
        );
      },
    },
  ];

  const radarChartTab = (
    <div className="py-4">
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-2">Weight/Cost/Performance Comparison</p>
        <div className="space-y-3">
          {comparisonData.map((data) => (
            <div key={data.type} className="flex items-center gap-3">
              <span className="font-medium w-20">Type {data.type}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className={`h-6 rounded-full flex items-center justify-end pr-2 ${
                    data.recommended ? 'bg-blue-600' : 'bg-gray-400'
                  }`}
                  style={{ width: `${data.performance}%` }}
                >
                  <span className="text-xs text-white font-medium">
                    {data.performance}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const detailsTab = (
    <div className="space-y-3 py-4">
      {Object.values(TANK_TYPE_DETAILS).map((detail) => {
        const isExpanded = expandedTypes.has(detail.type);
        const isRecommended = detail.type === recommendation.recommended_type;

        return (
          <div
            key={detail.type}
            className={`border-2 rounded-lg overflow-hidden ${
              isRecommended ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <button
              onClick={() => toggleType(detail.type)}
              className="w-full px-4 py-3 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">Type {detail.type}</span>
                  {isRecommended && (
                    <Badge variant="info">Recommended</Badge>
                  )}
                </div>
                <span className="text-gray-600">-</span>
                <span className="font-medium text-gray-900">{detail.name}</span>
              </div>
              {isExpanded ? (
                <ChevronDown size={18} className="text-gray-400" />
              ) : (
                <ChevronRight size={18} className="text-gray-400" />
              )}
            </button>

            {isExpanded && (
              <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Structure</h5>
                    <p className="text-sm text-gray-600">{detail.structure}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Materials</h5>
                    <dl className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Liner:</dt>
                        <dd className="text-gray-900">{detail.materials.liner}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Reinforcement:</dt>
                        <dd className="text-gray-900">{detail.materials.reinforcement}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={16} className="text-green-600" />
                      <h5 className="font-semibold text-green-900">Advantages</h5>
                    </div>
                    <ul className="space-y-1 text-sm text-green-800">
                      {detail.pros.map((pro, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span>•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown size={16} className="text-red-600" />
                      <h5 className="font-semibold text-red-900">Limitations</h5>
                    </div>
                    <ul className="space-y-1 text-sm text-red-800">
                      {detail.cons.map((con, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span>•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {!isRecommended && detail.whyNot && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h5 className="font-semibold text-yellow-900 mb-1">
                      Why not Type {detail.type}?
                    </h5>
                    <p className="text-sm text-yellow-800">{detail.whyNot}</p>
                  </div>
                )}

                {isRecommended && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={16} className="text-blue-600" />
                      <h5 className="font-semibold text-blue-900">Recommendation Reasoning</h5>
                    </div>
                    <p className="text-sm text-blue-800">{recommendation.reasoning}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tank Type Comparison & Recommendation</CardTitle>
          <Badge variant="info">
            Recommended: Type {recommendation.recommended_type}
          </Badge>
        </div>
      </CardHeader>

      <div className="px-4 pb-4">
        <Tabs
          tabs={[
            {
              id: 'comparison',
              label: 'Comparison Table',
              content: <DataTable columns={columns} data={comparisonData} />,
            },
            {
              id: 'chart',
              label: 'Performance Chart',
              content: radarChartTab,
            },
            {
              id: 'details',
              label: 'Detailed Analysis',
              content: detailsTab,
            },
          ]}
          defaultTab="comparison"
        />
      </div>
    </Card>
  );
}
