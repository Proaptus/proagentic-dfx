'use client';

/**
 * ExportSummary Component
 * Displays export summary and action buttons
 *
 * Features:
 * - Summary statistics
 * - Export/download actions
 * - Progress indicator integration
 * - Accessible status announcements
 */

import { CheckCircle, Download, FileArchive, Mail } from 'lucide-react';
import { memo } from 'react';
import { Button } from '@/components/ui/Button';
import { ExportProgressIndicator } from './ExportProgressIndicator';

export interface ExportStatus {
  status: 'idle' | 'generating' | 'ready';
  progress_percent: number;
  download_url?: string;
}

interface ExportSummaryProps {
  currentDesign: string | null;
  totalSelected: number;
  units: string;
  exportId: string | null;
  exportStatus: ExportStatus | null;
  exporting: boolean;
  selections: Record<string, string[]>;
  onExport: () => void;
  onDownload: () => void;
  onEmailDelivery: () => void;
}

export const ExportSummary = memo(function ExportSummary({
  currentDesign,
  totalSelected,
  units,
  exportId,
  exportStatus,
  exporting,
  selections,
  onExport,
  onDownload,
  onEmailDelivery,
}: ExportSummaryProps) {
  const isReady = exportStatus?.status === 'ready';

  return (
    <div className="space-y-4">
      {/* Export Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileArchive size={20} className="text-blue-600" />
            Export Summary
          </h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 font-medium">Design</span>
              <span className="font-semibold text-gray-900">Design {currentDesign}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 font-medium">Selected Items</span>
              <span className="font-semibold text-blue-600">{totalSelected} files</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 font-medium">Format</span>
              <span className="font-semibold text-gray-900">ZIP Archive</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 font-medium">Units</span>
              <span className="font-semibold text-gray-900">{units}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {!exportId ? (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
              onClick={onExport}
              loading={exporting}
              disabled={totalSelected === 0}
              aria-label={`Generate export package with ${totalSelected} files`}
            >
              <FileArchive className="mr-2" size={20} />
              Generate Export Package
            </Button>
          ) : isReady ? (
            <div className="space-y-3">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
                onClick={onDownload}
                aria-label="Download export package"
              >
                <Download className="mr-2" size={20} />
                Download Package
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-all"
                onClick={onEmailDelivery}
                aria-label="Email export package to team"
              >
                <Mail className="mr-2" size={18} />
                Email to Team
              </Button>
            </div>
          ) : (
            <ExportProgressIndicator
              progressPercent={exportStatus?.progress_percent || 0}
              selections={selections}
              status={exportStatus?.status || 'generating'}
            />
          )}
        </div>
      </div>

      {/* Success Banner */}
      {isReady && (
        <div
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg overflow-hidden"
          role="status"
          aria-live="polite"
          aria-label="Export ready notification"
        >
          <div className="p-6 flex items-center gap-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-green-900 text-lg">Export Ready!</h3>
              <p className="text-green-700 text-sm mt-1">
                Your export package has been generated successfully and is ready for download.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
