/**
 * MaterialComparisonTable Component
 * REQ-011 to REQ-015: Side-by-side material comparison
 * REQ-272: Component library with consistent styling
 */

'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import type { MaterialProperties } from '@/lib/data/materials';

interface MaterialComparisonTableProps {
  materials: MaterialProperties[];
  onExportCSV?: () => void;
}

export function MaterialComparisonTable({
  materials,
  onExportCSV,
}: MaterialComparisonTableProps) {
  if (materials.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 text-gray-500">
          Select materials to compare
        </div>
      </Card>
    );
  }

  const category = materials[0].category;
  const allSameCategory = materials.every((m) => m.category === category);

  if (!allSameCategory) {
    return (
      <Card>
        <div className="text-center py-12 text-gray-500">
          Please select materials from the same category to compare
        </div>
      </Card>
    );
  }

  const handleExport = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }

    // Default CSV export
    const rows: string[][] = [];

    // Header
    rows.push(['Property', ...materials.map((m) => m.name)]);

    // Manufacturer
    rows.push(['Manufacturer', ...materials.map((m) => 'manufacturer' in m ? m.manufacturer : '')]);

    // Category-specific properties
    if (category === 'fiber') {
      const props = [
        ['E₁ (GPa)', 'E1'],
        ['E₂ (GPa)', 'E2'],
        ['G₁₂ (GPa)', 'G12'],
        ['ν₁₂', 'nu12'],
        ['Xₜ (MPa)', 'Xt'],
        ['Xc (MPa)', 'Xc'],
        ['Yₜ (MPa)', 'Yt'],
        ['Yc (MPa)', 'Yc'],
        ['S (MPa)', 'S'],
        ['Density (g/cm³)', 'density'],
        ['Fiber Ø (μm)', 'fiber_diameter'],
        ['Max Temp (°C)', 'max_service_temp'],
        ['Cost ($/kg)', 'cost_per_kg'],
      ];

      props.forEach(([label, key]) => {
        rows.push([
          label,
          ...materials.map((m) => String((m as any)[key] ?? '')),
        ]);
      });
    } else if (category === 'matrix') {
      const props = [
        ['E (GPa)', 'E'],
        ['Tensile Strength (MPa)', 'tensile_strength'],
        ['Elongation at Break (%)', 'elongation_at_break'],
        ['Density (g/cm³)', 'density'],
        ['Tg (°C)', 'glass_transition_temp'],
        ['Cure Temp (°C)', 'cure_temp'],
        ['Cure Time (hrs)', 'cure_time'],
        ['H₂ Compatibility', 'hydrogen_compatibility'],
        ['Moisture Abs. (%)', 'moisture_absorption'],
        ['Cost ($/kg)', 'cost_per_kg'],
      ];

      props.forEach(([label, key]) => {
        rows.push([
          label,
          ...materials.map((m) => String((m as any)[key] ?? '')),
        ]);
      });
    } else if (category === 'liner') {
      const props = [
        ['Material Type', 'material_type'],
        ['Tensile Strength (MPa)', 'tensile_strength'],
        ['Elongation (%)', 'elongation_at_break'],
        ['Flexural Modulus (GPa)', 'flexural_modulus'],
        ['H₂ Perm @ 20°C', 'h2_permeation'],
        ['H₂ Perm @ 55°C', 'h2_permeation_at_55C'],
        ['Density (g/cm³)', 'density'],
        ['Melting Point (°C)', 'melting_point'],
        ['Tg (°C)', 'glass_transition_temp'],
        ['Cost ($/kg)', 'cost_per_kg'],
      ];

      props.forEach(([label, key]) => {
        rows.push([
          label,
          ...materials.map((m) => String((m as any)[key] ?? '')),
        ]);
      });
    } else if (category === 'boss') {
      const props = [
        ['Alloy', 'alloy'],
        ['Yield Strength (MPa)', 'yield_strength'],
        ['Ultimate Strength (MPa)', 'ultimate_strength'],
        ['E (GPa)', 'E'],
        ['Elongation (%)', 'elongation'],
        ['Hardness', 'hardness'],
        ['Density (g/cm³)', 'density'],
        ['Fatigue Strength (MPa)', 'fatigue_strength'],
        ['H₂ Embrittlement Res.', 'hydrogen_embrittlement_resistance'],
        ['Machinability (1-10)', 'machinability_rating'],
        ['Cost ($/kg)', 'cost_per_kg'],
      ];

      props.forEach(([label, key]) => {
        rows.push([
          label,
          ...materials.map((m) => String((m as any)[key] ?? '')),
        ]);
      });
    }

    // Convert to CSV
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `material-comparison-${category}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ComparisonIndicator = ({
    values,
    index,
    higherIsBetter = true,
  }: {
    values: number[];
    index: number;
    higherIsBetter?: boolean;
  }) => {
    const value = values[index];
    const max = Math.max(...values);
    const min = Math.min(...values);

    if (values.length === 1 || max === min) return null;

    const isBest = higherIsBetter ? value === max : value === min;
    const isWorst = higherIsBetter ? value === min : value === max;

    if (isBest) {
      return <TrendingUp className="inline ml-2 text-green-500" size={16} />;
    }
    if (isWorst) {
      return <TrendingDown className="inline ml-2 text-red-500" size={16} />;
    }
    return null;
  };

  return (
    <Card padding="none">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Material Comparison</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {materials.length} {category}(s) selected
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-t border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 font-medium text-gray-700 sticky left-0 bg-gray-50 z-10">
                Property
              </th>
              {materials.map((material) => (
                <th
                  key={material.id}
                  className="text-left py-3 px-6 font-medium text-gray-700 min-w-[200px]"
                >
                  <div>{material.name}</div>
                  {'manufacturer' in material && (
                    <div className="text-xs font-normal text-gray-500 mt-1">
                      {(material as { manufacturer?: string }).manufacturer}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {category === 'fiber' &&
              renderFiberComparison(materials as any[], ComparisonIndicator)}
            {category === 'matrix' &&
              renderMatrixComparison(materials as any[], ComparisonIndicator)}
            {category === 'liner' &&
              renderLinerComparison(materials as any[], ComparisonIndicator)}
            {category === 'boss' &&
              renderBossComparison(materials as any[], ComparisonIndicator)}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function renderFiberComparison(materials: any[], ComparisonIndicator: any) {
  const properties = [
    { label: 'E₁ (Longitudinal)', key: 'E1', unit: 'GPa', higherBetter: true },
    { label: 'E₂ (Transverse)', key: 'E2', unit: 'GPa', higherBetter: true },
    { label: 'G₁₂ (Shear)', key: 'G12', unit: 'GPa', higherBetter: true },
    { label: 'ν₁₂ (Poisson)', key: 'nu12', unit: '', higherBetter: false },
    { label: 'Xₜ (Tensile)', key: 'Xt', unit: 'MPa', higherBetter: true },
    { label: 'Xc (Compressive)', key: 'Xc', unit: 'MPa', higherBetter: true },
    { label: 'Yₜ (Trans. Tensile)', key: 'Yt', unit: 'MPa', higherBetter: true },
    { label: 'Yc (Trans. Comp.)', key: 'Yc', unit: 'MPa', higherBetter: true },
    { label: 'S (Shear Strength)', key: 'S', unit: 'MPa', higherBetter: true },
    { label: 'Density', key: 'density', unit: 'g/cm³', higherBetter: false },
    { label: 'Fiber Diameter', key: 'fiber_diameter', unit: 'μm', higherBetter: false },
    { label: 'Max Service Temp', key: 'max_service_temp', unit: '°C', higherBetter: true },
    { label: 'Cost', key: 'cost_per_kg', unit: '$/kg', higherBetter: false },
  ];

  return properties.map((prop, rowIdx) => (
    <tr key={prop.key} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      <td className="py-3 px-6 font-medium text-gray-700 sticky left-0 bg-inherit border-r border-gray-200">
        {prop.label}
      </td>
      {materials.map((material, idx) => {
        const value = material[prop.key];
        const values = materials.map((m) => m[prop.key]);
        return (
          <td key={material.id} className="py-3 px-6">
            <span className="font-medium">
              {value} {prop.unit}
            </span>
            <ComparisonIndicator
              values={values}
              index={idx}
              higherIsBetter={prop.higherBetter}
            />
          </td>
        );
      })}
    </tr>
  ));
}

function renderMatrixComparison(materials: any[], ComparisonIndicator: any) {
  const properties = [
    { label: 'Type', key: 'type', unit: '', higherBetter: false, isString: true },
    { label: 'Modulus (E)', key: 'E', unit: 'GPa', higherBetter: true },
    { label: 'Tensile Strength', key: 'tensile_strength', unit: 'MPa', higherBetter: true },
    { label: 'Elongation at Break', key: 'elongation_at_break', unit: '%', higherBetter: true },
    { label: 'Density', key: 'density', unit: 'g/cm³', higherBetter: false },
    { label: 'Tg (Glass Transition)', key: 'glass_transition_temp', unit: '°C', higherBetter: true },
    { label: 'Cure Temperature', key: 'cure_temp', unit: '°C', higherBetter: false },
    { label: 'Cure Time', key: 'cure_time', unit: 'hrs', higherBetter: false },
    { label: 'H₂ Compatibility', key: 'hydrogen_compatibility', unit: '', higherBetter: false, isString: true },
    { label: 'Moisture Absorption', key: 'moisture_absorption', unit: '%', higherBetter: false },
    { label: 'Cost', key: 'cost_per_kg', unit: '$/kg', higherBetter: false },
  ];

  return properties.map((prop, rowIdx) => (
    <tr key={prop.key} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      <td className="py-3 px-6 font-medium text-gray-700 sticky left-0 bg-inherit border-r border-gray-200">
        {prop.label}
      </td>
      {materials.map((material, idx) => {
        const value = material[prop.key];
        const values = prop.isString ? [] : materials.map((m) => m[prop.key]);
        return (
          <td key={material.id} className="py-3 px-6">
            <span className="font-medium">
              {value} {prop.unit}
            </span>
            {!prop.isString && (
              <ComparisonIndicator
                values={values}
                index={idx}
                higherIsBetter={prop.higherBetter}
              />
            )}
          </td>
        );
      })}
    </tr>
  ));
}

function renderLinerComparison(materials: any[], ComparisonIndicator: any) {
  const properties = [
    { label: 'Material Type', key: 'material_type', unit: '', higherBetter: false, isString: true },
    { label: 'Tensile Strength', key: 'tensile_strength', unit: 'MPa', higherBetter: true },
    { label: 'Elongation at Break', key: 'elongation_at_break', unit: '%', higherBetter: true },
    { label: 'Flexural Modulus', key: 'flexural_modulus', unit: 'GPa', higherBetter: true },
    { label: 'H₂ Perm @ 20°C', key: 'h2_permeation', unit: 'cm³/(m²·d·bar)', higherBetter: false },
    { label: 'H₂ Perm @ 55°C', key: 'h2_permeation_at_55C', unit: 'cm³/(m²·d·bar)', higherBetter: false },
    { label: 'Density', key: 'density', unit: 'g/cm³', higherBetter: false },
    { label: 'Melting Point', key: 'melting_point', unit: '°C', higherBetter: true },
    { label: 'Tg', key: 'glass_transition_temp', unit: '°C', higherBetter: false },
    { label: 'Cost', key: 'cost_per_kg', unit: '$/kg', higherBetter: false },
  ];

  return properties.map((prop, rowIdx) => (
    <tr key={prop.key} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      <td className="py-3 px-6 font-medium text-gray-700 sticky left-0 bg-inherit border-r border-gray-200">
        {prop.label}
      </td>
      {materials.map((material, idx) => {
        const value = material[prop.key];
        const values = prop.isString ? [] : materials.map((m) => m[prop.key]);
        return (
          <td key={material.id} className="py-3 px-6">
            <span className="font-medium">
              {value} {prop.unit}
            </span>
            {!prop.isString && (
              <ComparisonIndicator
                values={values}
                index={idx}
                higherIsBetter={prop.higherBetter}
              />
            )}
          </td>
        );
      })}
    </tr>
  ));
}

function renderBossComparison(materials: any[], ComparisonIndicator: any) {
  const properties = [
    { label: 'Alloy', key: 'alloy', unit: '', higherBetter: false, isString: true },
    { label: 'Yield Strength', key: 'yield_strength', unit: 'MPa', higherBetter: true },
    { label: 'Ultimate Strength', key: 'ultimate_strength', unit: 'MPa', higherBetter: true },
    { label: 'Modulus (E)', key: 'E', unit: 'GPa', higherBetter: true },
    { label: 'Elongation', key: 'elongation', unit: '%', higherBetter: true },
    { label: 'Hardness', key: 'hardness', unit: '', higherBetter: false, isString: true },
    { label: 'Density', key: 'density', unit: 'g/cm³', higherBetter: false },
    { label: 'Fatigue Strength', key: 'fatigue_strength', unit: 'MPa', higherBetter: true },
    { label: 'H₂ Embrittlement Res.', key: 'hydrogen_embrittlement_resistance', unit: '', higherBetter: false, isString: true },
    { label: 'Machinability', key: 'machinability_rating', unit: '/10', higherBetter: true },
    { label: 'Cost', key: 'cost_per_kg', unit: '$/kg', higherBetter: false },
  ];

  return properties.map((prop, rowIdx) => (
    <tr key={prop.key} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      <td className="py-3 px-6 font-medium text-gray-700 sticky left-0 bg-inherit border-r border-gray-200">
        {prop.label}
      </td>
      {materials.map((material, idx) => {
        const value = material[prop.key];
        const values = prop.isString ? [] : materials.map((m) => m[prop.key]);
        return (
          <td key={material.id} className="py-3 px-6">
            <span className="font-medium">
              {value} {prop.unit}
            </span>
            {!prop.isString && (
              <ComparisonIndicator
                values={values}
                index={idx}
                higherIsBetter={prop.higherBetter}
              />
            )}
          </td>
        );
      })}
    </tr>
  ));
}
