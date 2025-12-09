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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings size={20} className="text-blue-600" />
          Export Configuration
        </h3>
      </div>
      <div className="p-6 space-y-5">
        <div>
          <label
            htmlFor="units-system"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Units System
          </label>
          <select
            id="units-system"
            value={config.units}
            onChange={(e) => handleUnitsChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium"
            aria-describedby="units-description"
          >
            <option value="SI">SI (mm, MPa, kg)</option>
            <option value="Imperial">Imperial (in, psi, lb)</option>
          </select>
          <p id="units-description" className="text-xs text-gray-500 mt-1">
            Select the measurement system for all exported files
          </p>
        </div>

        <div>
          <label
            htmlFor="output-quality"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Output Quality
          </label>
          <select
            id="output-quality"
            value={config.quality}
            onChange={(e) => handleQualityChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium"
            aria-describedby="quality-description"
          >
            <option value="draft">Draft (Fast)</option>
            <option value="standard">Standard</option>
            <option value="high">High Resolution</option>
          </select>
          <p id="quality-description" className="text-xs text-gray-500 mt-1">
            Higher quality increases file size and generation time
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="include-comments"
              checked={config.includeComments}
              onChange={(e) => handleCommentsChange(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 mt-0.5"
            />
            <div>
              <label
                htmlFor="include-comments"
                className="text-sm font-medium text-gray-900 cursor-pointer"
              >
                Include design comments and notes
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Add annotations and design rationale to exported documents
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
