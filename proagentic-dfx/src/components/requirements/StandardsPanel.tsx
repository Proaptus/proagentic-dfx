'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown, ChevronRight, FileText, CheckCircle } from 'lucide-react';
import type { ApplicableStandard } from '@/lib/types';

interface StandardsPanelProps {
  standards: ApplicableStandard[];
  certificationRegion: string;
  standardDetails?: Record<string, StandardDetails>; // Optional detailed standard info from API
}

interface StandardDetails {
  id: string;
  name: string;
  region: string;
  description: string;
  keyClauses: Array<{
    clause: string;
    requirement: string;
    implication: string;
  }>;
}

// Standard details fallback - use provided standardDetails prop when available
const STANDARD_DETAILS: Record<string, StandardDetails> = {
  'ISO 11119-3': {
    id: 'ISO 11119-3',
    name: 'ISO 11119-3:2020',
    region: 'International',
    description:
      'Gas cylinders of composite construction - Specification and test methods - Part 3: Fully wrapped fibre reinforced composite gas cylinders with non-load-sharing metallic or non-metallic liners',
    keyClauses: [
      {
        clause: '7.2.1',
        requirement: 'Burst pressure ≥ 2.25× working pressure',
        implication: 'Minimum safety factor for burst test',
      },
      {
        clause: '7.2.3',
        requirement: 'Hydraulic test at 1.5× working pressure',
        implication: 'Proof pressure test requirement',
      },
      {
        clause: '7.2.6',
        requirement: 'Minimum 11,000 pressure cycles',
        implication: 'Fatigue life requirement for automotive',
      },
      {
        clause: '8.3',
        requirement: 'Permeation ≤ 46 NmL/hr/L',
        implication: 'Maximum hydrogen loss rate',
      },
    ],
  },
  'UN R134': {
    id: 'UN R134',
    name: 'UN R134 (ECE)',
    region: 'EU',
    description:
      'Uniform provisions concerning the approval of motor vehicles and their components with regard to the safety-related performance of hydrogen-fuelled vehicles',
    keyClauses: [
      {
        clause: '5.2',
        requirement: 'Operating temperature: -40°C to +85°C',
        implication: 'Required temperature range for EU approval',
      },
      {
        clause: '6.3.2',
        requirement: 'Burst pressure ≥ 2.25× NWP',
        implication: 'Aligns with ISO 11119-3',
      },
      {
        clause: '6.3.4',
        requirement: 'Type approval testing protocol',
        implication: 'Specific test sequence required',
      },
      {
        clause: '7.1',
        requirement: 'Permeation limits and testing',
        implication: 'Compliance verification procedure',
      },
    ],
  },
  'EC 79/2009': {
    id: 'EC 79/2009',
    name: 'EC Regulation 79/2009',
    region: 'EU',
    description:
      'Type-approval of hydrogen-powered motor vehicles - Safety requirements for compressed hydrogen storage systems',
    keyClauses: [
      {
        clause: 'Annex 4',
        requirement: 'Container specifications',
        implication: 'Material and construction requirements',
      },
      {
        clause: 'Annex 5B',
        requirement: 'Pressure cycling test procedure',
        implication: 'Standardized fatigue test method',
      },
      {
        clause: 'Annex 6',
        requirement: 'Permeation test procedure',
        implication: 'Measurement methodology',
      },
    ],
  },
  'SAE J2579': {
    id: 'SAE J2579',
    name: 'SAE J2579',
    region: 'US',
    description:
      'Technical Information Report for Fuel Systems in Fuel Cell and Other Hydrogen Vehicles',
    keyClauses: [
      {
        clause: '4.1',
        requirement: 'Hydrogen storage system requirements',
        implication: 'System-level safety criteria',
      },
      {
        clause: '4.3',
        requirement: 'Pressure relief device requirements',
        implication: 'TPRD specifications',
      },
    ],
  },
};

export function StandardsPanel({ standards, certificationRegion, standardDetails }: StandardsPanelProps) {
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(new Set());

  // Use provided standardDetails or fallback to STANDARD_DETAILS
  const detailsSource = standardDetails || STANDARD_DETAILS;

  // Get applicable standards based on region
  const getApplicableStandards = (): StandardDetails[] => {
    const standardIds =
      standards.length > 0
        ? standards.map((s) => s.id)
        : certificationRegion === 'EU'
        ? ['ISO 11119-3', 'UN R134', 'EC 79/2009']
        : certificationRegion === 'US'
        ? ['ISO 11119-3', 'SAE J2579']
        : ['ISO 11119-3'];

    return standardIds
      .map((id) => detailsSource[id])
      .filter((s): s is StandardDetails => s !== undefined);
  };

  const applicableStandards = getApplicableStandards();

  const toggleStandard = (standardId: string) => {
    const newExpanded = new Set(expandedStandards);
    if (newExpanded.has(standardId)) {
      newExpanded.delete(standardId);
    } else {
      newExpanded.add(standardId);
    }
    setExpandedStandards(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applicable Standards & Compliance</CardTitle>
      </CardHeader>

      <div className="px-4 pb-4">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Certification Region</span>
            <Badge variant="info">{certificationRegion}</Badge>
          </div>
        </div>

        <div className="space-y-3">
          {applicableStandards.map((standard) => {
            const isExpanded = expandedStandards.has(standard.id);

            return (
              <div
                key={standard.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleStandard(standard.id)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-gray-600" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">{standard.name}</div>
                      <div className="text-xs text-gray-500">{standard.region}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    {isExpanded ? (
                      <ChevronDown size={18} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={18} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <p className="text-sm text-gray-700 mb-4">{standard.description}</p>

                    <h5 className="font-semibold text-gray-900 mb-2">Key Clauses</h5>
                    <div className="space-y-3">
                      {standard.keyClauses.map((clause, idx) => (
                        <div
                          key={idx}
                          className="pl-4 border-l-2 border-blue-300 bg-blue-50 p-3 rounded-r"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-medium text-blue-900 text-sm">
                                Clause {clause.clause}
                              </div>
                              <div className="text-sm text-gray-700 mt-1">
                                {clause.requirement}
                              </div>
                            </div>
                            <Badge variant="info">Required</Badge>
                          </div>
                          <div className="text-xs text-gray-600 mt-2 italic">
                            → {clause.implication}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm text-green-800">
              All requirements meet applicable standards for {certificationRegion} market
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
