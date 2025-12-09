'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface EquationDisplayProps {
  title: string;
  equation: string;
  variables?: Array<{ symbol: string; description: string; value?: string | number }>;
  explanation?: string;
  expandable?: boolean;
  defaultExpanded?: boolean;
}

export function EquationDisplay({
  title,
  equation,
  variables,
  explanation,
  expandable = true,
  defaultExpanded = false,
}: EquationDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="border-l-4 border-blue-500">
      <div
        className={`p-4 ${expandable ? 'cursor-pointer' : ''}`}
        onClick={() => expandable && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            {expandable &&
              (isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />)}
            {title}
          </h4>
          {explanation && !isExpanded && (
            <div className="group relative">
              <Info size={16} className="text-gray-400 hover:text-gray-600" />
              <div className="absolute right-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {explanation}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 bg-gray-50 p-4 rounded-lg overflow-x-auto">
          <div
            className="font-mono text-sm text-gray-800"
            dangerouslySetInnerHTML={{ __html: formatEquation(equation) }}
          />
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            {explanation && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                {explanation}
              </div>
            )}

            {variables && variables.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-700">Where:</div>
                {variables.map((v, i) => (
                  <div key={i} className="text-sm flex items-start gap-2 ml-4">
                    <span className="font-mono font-semibold text-gray-900 min-w-[40px]">
                      {v.symbol}
                    </span>
                    <span className="text-gray-600">= {v.description}</span>
                    {v.value !== undefined && (
                      <span className="text-blue-600 font-medium ml-auto">
                        {v.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Format equation string with basic LaTeX-like formatting
 * Converts: σ_h, ^2, √, etc.
 */
function formatEquation(eq: string): string {
  return eq
    // Subscripts: σ_h -> σ<sub>h</sub>
    .replace(/([a-zA-Zα-ωΑ-Ω])_\{([^}]+)\}/g, '$1<sub>$2</sub>')
    .replace(/([a-zA-Zα-ωΑ-Ω])_([a-zA-Z0-9])/g, '$1<sub>$2</sub>')
    // Superscripts: ^2 -> <sup>2</sup>
    .replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
    .replace(/\^([0-9])/g, '<sup>$1</sup>')
    // Square root
    .replace(/√\{([^}]+)\}/g, '√(<i>$1</i>)')
    .replace(/sqrt\(([^)]+)\)/g, '√($1)')
    // Division as fraction bar (simple)
    .replace(/\/ /g, ' / ')
    // Bold Greek letters and symbols
    .replace(/(σ|τ|ε|α|β|γ|Δ|Σ|π)/g, '<strong>$1</strong>')
    // Highlight operators
    .replace(/ = /g, ' <strong>=</strong> ')
    .replace(/ \+ /g, ' + ')
    .replace(/ - /g, ' − ');
}
