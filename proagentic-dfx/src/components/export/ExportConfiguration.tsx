'use client';

/**
 * ExportConfiguration Component
 * Manages export settings and configuration options
 *
 * Features:
 * - Units system selection
 * - Quality settings
 * - Additional options
 * - Accessible form controls
 */

import { Settings } from 'lucide-react';
import { memo } from 'react';

export interface ExportConfigOptions {
  units: string;
  quality: string;
  includeComments: boolean;
}

interface ExportConfigurationProps {
  config: ExportConfigOptions;
  onConfigChange: (config: ExportConfigOptions) => void;
}

export const ExportConfiguration = memo(function ExportConfiguration({
  config,
  onConfigChange,
}: ExportConfigurationProps) {
  const handleUnitsChange = (units: string) => {
    onConfigChange({ ...config, units });
  };

  const handleQualityChange = (quality: string) => {
    onConfigChange({ ...config, quality });
  };

  const handleCommentsChange = (includeComments: boolean) => {
    onConfigChange({ ...config, includeComments });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Settings size={16} className="text-gray-500" />
          Configuration
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label htmlFor="units-system" className="block text-sm text-gray-700 mb-1">
            Units System
          </label>
          <select
            id="units-system"
            value={config.units}
            onChange={(e) => handleUnitsChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white text-gray-900"
            aria-describedby="units-description"
          >
            <option value="SI">SI (mm, MPa, kg)</option>
            <option value="Imperial">Imperial (in, psi, lb)</option>
          </select>
        </div>

        <div>
          <label htmlFor="output-quality" className="block text-sm text-gray-700 mb-1">
            Output Quality
          </label>
          <select
            id="output-quality"
            value={config.quality}
            onChange={(e) => handleQualityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white text-gray-900"
            aria-describedby="quality-description"
          >
            <option value="draft">Draft (Fast)</option>
            <option value="standard">Standard</option>
            <option value="high">High Resolution</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="include-comments"
            checked={config.includeComments}
            onChange={(e) => handleCommentsChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <label htmlFor="include-comments" className="text-sm text-gray-700 cursor-pointer">
            Include design comments
          </label>
        </div>
      </div>
    </div>
  );
});
