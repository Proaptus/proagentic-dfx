'use client';

import { Card } from '@/components/ui/Card';
import { Check, Settings2 } from 'lucide-react';

interface ExportOption {
  id: string;
  label: string;
  description?: string;
  format?: string[];
}

interface ExportCategoryCardProps {
  title: string;
  icon?: React.ReactNode;
  options: ExportOption[];
  selectedOptions: string[];
  onToggleOption: (optionId: string) => void;
  formatSelection?: Record<string, string>;
  onFormatChange?: (optionId: string, format: string) => void;
}

export function ExportCategoryCard({
  title,
  icon,
  options,
  selectedOptions,
  onToggleOption,
  formatSelection,
  onFormatChange,
}: ExportCategoryCardProps) {
  return (
    <Card>
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <span className="text-gray-500">{icon}</span>
          {title}
        </h3>
      </div>
      <div className="p-2">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          return (
            <div key={option.id}>
              <button
                onClick={() => onToggleOption(option.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors ${
                  isSelected
                    ? 'bg-gray-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="text-sm text-gray-900">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500">{option.description}</div>
                  )}
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  isSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-300'
                }`}>
                  {isSelected && <Check size={12} className="text-white" />}
                </div>
              </button>

              {isSelected && option.format && option.format.length > 1 && onFormatChange && (
                <div className="ml-3 pl-3 border-l border-gray-200 flex items-center gap-2 text-xs py-1 mb-1">
                  <Settings2 size={12} className="text-gray-400" />
                  <span className="text-gray-500">Format:</span>
                  <select
                    value={formatSelection?.[option.id] || option.format[0]}
                    onChange={(e) => onFormatChange(option.id, e.target.value)}
                    className="px-2 py-0.5 border border-gray-200 rounded text-gray-700 bg-white text-xs"
                  >
                    {option.format.map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {fmt.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
