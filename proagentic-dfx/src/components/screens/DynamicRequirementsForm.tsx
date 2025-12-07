'use client';

import { useState, useEffect } from 'react';
import { useDomainStore } from '@/lib/stores/domain-store';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { RequirementField } from '@/lib/domains/types';

interface DynamicRequirementsFormProps {
  onSubmit: (requirements: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function DynamicRequirementsForm({ onSubmit, disabled }: DynamicRequirementsFormProps) {
  const { currentDomain } = useDomainStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Initialize form with defaults when domain changes
  useEffect(() => {
    setFormData(currentDomain.requirements.defaults);
  }, [currentDomain]);

  const handleFieldChange = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const renderField = (field: RequirementField) => {
    const value = formData[field.key];

    switch (field.type) {
      case 'number':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={value as number || ''}
                onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
                min={field.min}
                max={field.max}
                step={field.step || 1}
                disabled={disabled}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={field.required}
              />
              {field.unit && (
                <span className="text-sm text-gray-500 min-w-[3rem]">{field.unit}</span>
              )}
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value as string || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'text':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value as string || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={field.required}
            />
          </div>
        );

      case 'range':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}: {value as number}
              {field.unit && ` ${field.unit}`}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="range"
              value={value as number || 0}
              onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step || 1}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{field.min}</span>
              <span>{field.max}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requirements - {currentDomain.name}</CardTitle>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentDomain.requirements.fields.map((field) => renderField(field))}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button type="submit" disabled={disabled}>
            Continue to Optimization
          </Button>
        </div>
      </form>

      {/* Show applicable standards */}
      {currentDomain.applicableStandards.length > 0 && (
        <div className="mt-6 p-4 bg-[rgb(var(--color-primary-50))] rounded-[var(--radius-lg)] border border-[rgb(var(--color-primary-200))]">
          <h4 className="text-sm font-medium text-[rgb(var(--color-primary-900))] mb-3">
            Applicable Standards for {currentDomain.name}
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentDomain.applicableStandards.map((standard) => (
              <div
                key={standard.code}
                className="inline-flex items-center px-3 py-1.5 bg-white rounded-[var(--radius-md)] border border-[rgb(var(--color-primary-300))] shadow-sm"
              >
                <span className="font-semibold text-[rgb(var(--color-primary-700))] text-xs">
                  {standard.code}
                </span>
                <span className="mx-1.5 text-[rgb(var(--color-gray-400))]">•</span>
                <span className="text-xs text-[rgb(var(--color-gray-700))]">
                  {standard.name}
                </span>
                <span className="ml-1.5 text-xs text-[rgb(var(--color-gray-500))]">
                  ({standard.region})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
