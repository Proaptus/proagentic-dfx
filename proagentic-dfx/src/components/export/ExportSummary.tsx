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

import { CheckCircle, Download, FileArchive, Mail, Loader2 } from 'lucide-react';
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
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <FileArchive size={16} className="text-gray-500" />
            Summary
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Design</span>
              <span className="text-gray-900">Design {currentDesign}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Items</span>
              <span className="text-gray-900">{totalSelected} files</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Format</span>
              <span className="text-gray-900">ZIP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Units</span>
              <span className="text-gray-900">{units}</span>
            </div>
          </div>

          {/* Action Buttons - ISSUE-012: Enhanced progress indicator */}
          {!exportId && !exporting ? (
            <Button
              className="w-full"
              onClick={onExport}
              disabled={totalSelected === 0}
              aria-label={`Generate export package with ${totalSelected} files`}
            >
              <FileArchive className="mr-2" size={16} />
              Generate Export
            </Button>
          ) : !exportId && exporting ? (
            /* ISSUE-012: Show preparing state while API call is in progress */
            <div className="space-y-3">
              <div
                className="flex items-center justify-center gap-3 py-4 bg-blue-50 rounded-lg border border-blue-200"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="animate-spin text-blue-600" size={20} />
                <span className="text-sm font-medium text-blue-700">Preparing export package...</span>
              </div>
              <p className="text-xs text-center text-gray-500">Initializing export process</p>
            </div>
          ) : isReady ? (
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={onDownload}
                aria-label="Download export package"
              >
                <Download className="mr-2" size={16} />
                Download
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={onEmailDelivery}
                aria-label="Email export package to team"
              >
                <Mail className="mr-2" size={16} />
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
          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          role="status"
          aria-live="polite"
          aria-label="Export ready notification"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="text-gray-700" size={20} />
            <div>
              <p className="text-sm text-gray-900 font-medium">Export ready</p>
              <p className="text-xs text-gray-500">Package generated successfully</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
