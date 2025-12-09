'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import type { ParsedRequirements, DerivedRequirements } from '@/lib/types';

// Local types for the requirements table
type ConfidenceLevel = 'high' | 'medium' | 'low';
type ValidationStatus = 'pass' | 'warn' | 'fail';
interface Requirement {
  field: string;
  value: unknown;
}
interface RequirementRow {
  category: string;
  field: string;
  value: string | number;
  unit: string;
  confidence: ConfidenceLevel | 'high' | 'medium';
  validation: ValidationStatus;
  editable: boolean;
  helpText: string;
}

interface RequirementsTableProps {
  parsed: ParsedRequirements;
  derived: DerivedRequirements;
  confidence: number;
  onUpdate?: (id: string, updates: Partial<Requirement>) => void;
  onDelete?: (id: string) => void;
}

export function RequirementsTable({
  parsed,
  derived,
  confidence,
  onUpdate: _onUpdate,
  onDelete: _onDelete,
}: RequirementsTableProps) {
  const [_expandedCategory, _setExpandedCategory] = useState<string | null>(null);
  const [_filter, _setFilter] = useState<'all' | 'mandatory' | 'desirable'>('all');
  const [_editMode, _setEditMode] = useState(false);

  // Determine confidence level based on value
  const getConfidence = (baseConfidence: number): ConfidenceLevel => {
    if (baseConfidence > 0.85) return 'high';
    if (baseConfidence > 0.65) return 'medium';
    return 'low';
  };

  // Validate requirement values
  const validateField = (field: string, value: number): ValidationStatus => {
    switch (field) {
      case 'working_pressure_bar':
        return value >= 350 && value <= 1000 ? 'pass' : value > 1000 ? 'warn' : 'fail';
      case 'internal_volume_liters':
        return value >= 1 && value <= 500 ? 'pass' : 'warn';
      case 'target_weight_kg':
        return value > 0 ? 'pass' : 'fail';
      case 'min_burst_ratio':
        return value >= 2.25 ? 'pass' : 'fail';
      case 'burst_pressure_bar':
        return value >= parsed.working_pressure_bar * 2.25 ? 'pass' : 'fail';
      default:
        return 'pass';
    }
  };

  const primaryRequirements: RequirementRow[] = [
    {
      category: 'Volume',
      field: 'internal_volume_liters',
      value: parsed.internal_volume_liters,
      unit: 'L',
      confidence: getConfidence(confidence),
      validation: validateField('internal_volume_liters', parsed.internal_volume_liters),
      editable: true,
      helpText: 'Usable internal volume for hydrogen storage',
    },
    {
      category: 'Working Pressure',
      field: 'working_pressure_bar',
      value: parsed.working_pressure_bar,
      unit: 'bar',
      confidence: getConfidence(confidence),
      validation: validateField('working_pressure_bar', parsed.working_pressure_bar),
      editable: true,
      helpText: 'Normal operating pressure (NWP)',
    },
    {
      category: 'Target Weight',
      field: 'target_weight_kg',
      value: parsed.target_weight_kg,
      unit: 'kg',
      confidence: getConfidence(confidence),
      validation: validateField('target_weight_kg', parsed.target_weight_kg),
      editable: true,
      helpText: 'Maximum allowable total weight',
    },
    {
      category: 'Target Cost',
      field: 'target_cost_eur',
      value: parsed.target_cost_eur.toLocaleString(),
      unit: '€',
      confidence: getConfidence(confidence * 0.9),
      validation: 'pass',
      editable: true,
      helpText: 'Maximum production cost per unit',
    },
  ];

  const derivedRequirementsData: RequirementRow[] = [
    {
      category: 'Burst Pressure',
      field: 'burst_pressure_bar',
      value: derived.burst_pressure_bar,
      unit: 'bar',
      confidence: 'high',
      validation: validateField('burst_pressure_bar', derived.burst_pressure_bar),
      editable: false,
      helpText: `Minimum burst pressure = ${parsed.min_burst_ratio}× working pressure`,
    },
    {
      category: 'Test Pressure',
      field: 'test_pressure_bar',
      value: derived.test_pressure_bar,
      unit: 'bar',
      confidence: 'high',
      validation: 'pass',
      editable: false,
      helpText: 'Hydrostatic test pressure (1.5× working pressure)',
    },
    {
      category: 'Min Wall Thickness',
      field: 'min_wall_thickness_mm',
      value: derived.min_wall_thickness_mm.toFixed(2),
      unit: 'mm',
      confidence: 'medium',
      validation: 'pass',
      editable: false,
      helpText: 'Minimum composite wall thickness for structural integrity',
    },
  ];

  const operatingConditions: RequirementRow[] = [
    {
      category: 'Temp Range (Min)',
      field: 'operating_temp_min_c',
      value: parsed.operating_temp_min_c,
      unit: '°C',
      confidence: getConfidence(confidence),
      validation: parsed.operating_temp_min_c >= -40 ? 'pass' : 'warn',
      editable: true,
      helpText: 'Minimum operating temperature',
    },
    {
      category: 'Temp Range (Max)',
      field: 'operating_temp_max_c',
      value: parsed.operating_temp_max_c,
      unit: '°C',
      confidence: getConfidence(confidence),
      validation: parsed.operating_temp_max_c <= 85 ? 'pass' : 'warn',
      editable: true,
      helpText: 'Maximum operating temperature',
    },
    {
      category: 'Fatigue Cycles',
      field: 'fatigue_cycles',
      value: parsed.fatigue_cycles.toLocaleString(),
      unit: 'cycles',
      confidence: getConfidence(confidence),
      validation: parsed.fatigue_cycles >= 11000 ? 'pass' : 'warn',
      editable: true,
      helpText: 'Minimum pressure cycles before inspection',
    },
    {
      category: 'Max Permeation',
      field: 'max_permeation_rate',
      value: parsed.max_permeation_rate,
      unit: 'NmL/hr/L',
      confidence: 'medium',
      validation: parsed.max_permeation_rate <= 46 ? 'pass' : 'fail',
      editable: true,
      helpText: 'Maximum hydrogen permeation rate',
    },
  ];

  const confidenceIcon = (level: ConfidenceLevel) => {
    switch (level) {
      case 'high':
        return <Badge variant="success">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'low':
        return <Badge variant="error">Low</Badge>;
    }
  };

  const validationIcon = (status: ValidationStatus) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="text-green-600" size={18} />;
      case 'warn':
        return <AlertTriangle className="text-yellow-600" size={18} />;
      case 'fail':
        return <XCircle className="text-red-600" size={18} />;
    }
  };

  const columns = [
    {
      id: 'category',
      header: 'Parameter',
      accessor: 'category' as keyof RequirementRow,
      width: '25%',
      format: (value: unknown, row?: RequirementRow) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value as string}</span>
          {row && (
            <Tooltip content={row.helpText}>
              <HelpCircle size={14} className="text-gray-400 cursor-help" />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      id: 'value',
      header: 'Value',
      accessor: 'value' as keyof RequirementRow,
      width: '20%',
      format: (value: unknown) => <span className="font-mono">{value as string}</span>,
    },
    {
      id: 'unit',
      header: 'Unit',
      accessor: 'unit' as keyof RequirementRow,
      width: '10%',
    },
    {
      id: 'confidence',
      header: 'Confidence',
      accessor: 'confidence' as keyof RequirementRow,
      width: '15%',
      format: (value: unknown) => confidenceIcon(value as ConfidenceLevel),
    },
    {
      id: 'validation',
      header: 'Status',
      accessor: 'validation' as keyof RequirementRow,
      width: '10%',
      format: (value: unknown) => validationIcon(value as ValidationStatus),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Requirements Summary</CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Overall Confidence: {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 px-4">Primary Requirements</h4>
            <DataTable
              columns={columns}
              data={primaryRequirements}
              pageSize={10}
            />
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 px-4">Derived Requirements</h4>
            <DataTable columns={columns} data={derivedRequirementsData} pageSize={10} />
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 px-4">Operating Conditions</h4>
            <DataTable
              columns={columns}
              data={operatingConditions}
              pageSize={10}
            />
          </div>

          <div className="px-4 pb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Certification Region</h4>
              <div className="flex items-center justify-between">
                <span className="text-blue-700">{parsed.certification_region}</span>
                <Badge variant="info">{derived.applicable_standards.length} standards</Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
