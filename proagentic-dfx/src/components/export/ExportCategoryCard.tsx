'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle, FileText, Settings2 } from 'lucide-react';

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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <div className="space-y-2 p-4">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          return (
            <div key={option.id} className="space-y-2">
              <button
                onClick={() => onToggleOption(option.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                    )}
                  </div>
                </div>
                {isSelected && <CheckCircle size={18} className="text-blue-600" />}
              </button>

              {isSelected && option.format && option.format.length > 1 && onFormatChange && (
                <div className="ml-10 flex items-center gap-2 text-sm">
                  <Settings2 size={14} className="text-gray-400" />
                  <span className="text-gray-600">Format:</span>
                  <select
                    value={formatSelection?.[option.id] || option.format[0]}
                    onChange={(e) => onFormatChange(option.id, e.target.value)}
                    className="px-2 py-1 border border-gray-200 rounded text-gray-700 bg-white"
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
