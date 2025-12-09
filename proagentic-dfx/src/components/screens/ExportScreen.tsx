'use client';

/**
 * ExportScreen Component
 * REQ-258: Export complete design packages
 * REQ-259: Multiple format support (STEP, DXF, PDF, etc.)
 * REQ-260: Manufacturing data export
 *
 * Features:
 * - Multi-category export selection
 * - Real-time progress tracking
 * - Document preview
 * - Manufacturing specifications
 * - Accessibility compliant
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { startExport, getExportStatus, getExportDownloadUrl } from '@/lib/api/client';
import { ExportCategoryCard } from '@/components/export/ExportCategoryCard';
import { DocumentPreview } from '@/components/export/DocumentPreview';
import { ManufacturingPreview } from '@/components/export/ManufacturingPreview';
import { ExportConfiguration, type ExportConfigOptions } from '@/components/export/ExportConfiguration';
import { ExportSummary, type ExportStatus } from '@/components/export/ExportSummary';
import {
  FileArchive,
  Box,
  Settings,
  FileText,
  Shield,
} from 'lucide-react';

export interface ExportOption {
  id: string;
  label: string;
  description?: string;
  format?: string[];
}

export interface ExportCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  options: ExportOption[];
}

interface ExportScreenProps {
  exportCategories?: ExportCategory[];
}

type ActiveTab = 'selection' | 'preview' | 'manufacturing';

// Default categories for backward compatibility
const DEFAULT_EXPORT_CATEGORIES: ExportCategory[] = [
  {
    id: 'geometry',
    title: 'Geometry Files',
    icon: <Box size={18} />,
    options: [
      { id: 'step', label: 'STEP CAD Model', description: '3D solid model', format: ['step', 'stp'] },
      { id: 'dxf', label: 'DXF Drawing', description: '2D technical drawing', format: ['dxf'] },
      { id: 'dome_csv', label: 'Dome Profile CSV', description: 'Dome contour points', format: ['csv'] },
      { id: 'layup_csv', label: 'Layup Sequence CSV', description: 'Layer-by-layer data', format: ['csv'] },
    ],
  },
  {
    id: 'manufacturing',
    title: 'Manufacturing Data',
    icon: <Settings size={18} />,
    options: [
      { id: 'nc_code', label: 'NC Winding Code', description: 'CNC winding program', format: ['nc', 'gcode'] },
      { id: 'winding_seq', label: 'Winding Sequence', description: 'Step-by-step instructions', format: ['pdf', 'xlsx'] },
      { id: 'cure_cycle', label: 'Cure Cycle Profile', description: 'Temperature/pressure schedule', format: ['pdf', 'csv'] },
      { id: 'qc_checklist', label: 'QC Checklist', description: 'Inspection procedures', format: ['pdf', 'xlsx'] },
    ],
  },
  {
    id: 'analysis',
    title: 'Analysis Reports',
    icon: <FileText size={18} />,
    options: [
      { id: 'design_report', label: 'Design Report PDF', description: 'Complete design documentation', format: ['pdf'] },
      { id: 'stress_report', label: 'Stress Analysis Report', description: 'FEA results and margins', format: ['pdf'] },
      { id: 'reliability_report', label: 'Reliability Report', description: 'Probability of failure analysis', format: ['pdf'] },
      { id: 'cert_package', label: 'Certification Package', description: 'ISO/UN compliance evidence', format: ['pdf'] },
    ],
  },
  {
    id: 'supporting',
    title: 'Supporting Documents',
    icon: <Shield size={18} />,
    options: [
      { id: 'material_certs', label: 'Material Certificates Template', description: 'Required certifications', format: ['pdf', 'xlsx'] },
      { id: 'traceability', label: 'Traceability Matrix', description: 'Requirements tracking', format: ['xlsx', 'csv'] },
      { id: 'bom', label: 'Bill of Materials', description: 'Complete parts list', format: ['xlsx', 'csv'] },
      { id: 'test_plan', label: 'Test Plan', description: 'Certification testing requirements', format: ['pdf', 'xlsx'] },
    ],
  },
];

export function ExportScreen({ exportCategories = DEFAULT_EXPORT_CATEGORIES }: ExportScreenProps) {
  const { currentDesign, setCurrentDesign } = useAppStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('selection');
  const [selections, setSelections] = useState<Record<string, string[]>>({
    geometry: ['step', 'dome_csv'],
    manufacturing: ['winding_seq', 'cure_cycle'],
    analysis: ['design_report', 'stress_report'],
    supporting: ['material_certs', 'traceability'],
  });
  const [formatSelection, setFormatSelection] = useState<Record<string, string>>({});
  const [exportConfig, setExportConfig] = useState<ExportConfigOptions>({
    units: 'SI',
    quality: 'high',
    includeComments: true,
  });

  const [exportId, setExportId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  // Default to design C if none selected
  useEffect(() => {
    if (!currentDesign) {
      setCurrentDesign('C');
    }
  }, [currentDesign, setCurrentDesign]);

  // Poll export status
  useEffect(() => {
    if (!exportId || exportStatus?.status === 'ready') return;

    const interval = setInterval(async () => {
      try {
        const status = await getExportStatus(exportId) as ExportStatus;
        setExportStatus(status);
        if (status.status === 'ready') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Export status polling error:', error);
        // Could add error state here for user notification
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [exportId, exportStatus?.status]);

  // Memoized callbacks for performance
  const toggleOption = useCallback((category: string, optionId: string) => {
    setSelections((prev) => {
      const current = prev[category] || [];
      if (current.includes(optionId)) {
        return { ...prev, [category]: current.filter((o) => o !== optionId) };
      }
      return { ...prev, [category]: [...current, optionId] };
    });
  }, []);

  const handleFormatChange = useCallback((optionId: string, format: string) => {
    setFormatSelection((prev) => ({ ...prev, [optionId]: format }));
  }, []);

  const handleExport = useCallback(async () => {
    if (!currentDesign) return;

    setExporting(true);
    try {
      const result = await startExport({
        design_id: currentDesign,
        include: selections,
        format: 'zip',
      }) as { export_id: string };

      setExportId(result.export_id);
      setExportStatus({ status: 'generating', progress_percent: 0 });
    } catch (error) {
      console.error('Export error:', error);
      // Could add error state here for user notification
    } finally {
      setExporting(false);
    }
  }, [currentDesign, selections]);

  const handleDownload = useCallback(() => {
    if (!exportId) return;
    window.open(getExportDownloadUrl(exportId), '_blank');
  }, [exportId]);

  const handleEmailDelivery = useCallback(() => {
    console.log('Email delivery requested');
    // TODO: Implement email delivery functionality
  }, []);

  // Memoized calculations
  const totalSelected = useMemo(() => {
    return Object.values(selections).flat().length;
  }, [selections]);

  return (
    <div className="space-y-8">
      {/* Enterprise Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Export Center</h1>
            <p className="text-blue-100 text-lg max-w-3xl">
              Generate comprehensive export packages with CAD files, manufacturing data, analysis reports, and compliance documentation for Design {currentDesign}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
            <div className="text-sm text-blue-100 mb-1">Selected Items</div>
            <div className="text-3xl font-bold">{totalSelected}</div>
          </div>
        </div>
      </div>

      {/* Enterprise Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <nav className="flex gap-1 p-1" aria-label="Export tabs">
          <button
            onClick={() => setActiveTab('selection')}
            className={`flex-1 px-6 py-3 font-medium rounded-lg transition-all ${
              activeTab === 'selection'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <FileArchive className="inline-block mr-2" size={18} />
            Export Selection
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-6 py-3 font-medium rounded-lg transition-all ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <FileText className="inline-block mr-2" size={18} />
            Document Preview
          </button>
          <button
            onClick={() => setActiveTab('manufacturing')}
            className={`flex-1 px-6 py-3 font-medium rounded-lg transition-all ${
              activeTab === 'manufacturing'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings className="inline-block mr-2" size={18} />
            Manufacturing Spec
          </button>
        </nav>
      </div>

      {/* Selection Tab */}
      {activeTab === 'selection' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Export Categories */}
          <div className="space-y-4">
            {exportCategories.map((category) => (
              <ExportCategoryCard
                key={category.id}
                title={category.title}
                icon={category.icon}
                options={category.options}
                selectedOptions={selections[category.id] || []}
                onToggleOption={(optionId) => toggleOption(category.id, optionId)}
                formatSelection={formatSelection}
                onFormatChange={handleFormatChange}
              />
            ))}
          </div>

          {/* Export Configuration & Status */}
          <div className="space-y-4">
            <ExportConfiguration config={exportConfig} onConfigChange={setExportConfig} />
            <ExportSummary
              currentDesign={currentDesign}
              totalSelected={totalSelected}
              units={exportConfig.units}
              exportId={exportId}
              exportStatus={exportStatus}
              exporting={exporting}
              selections={selections}
              onExport={handleExport}
              onDownload={handleDownload}
              onEmailDelivery={handleEmailDelivery}
            />
          </div>
        </div>
      )}

      {/* Document Preview Tab */}
      {activeTab === 'preview' && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Document Preview
            </h3>
            <p className="text-gray-700">
              Preview key documents before exporting. Full reports will be generated in the export package.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <DocumentPreview documentType="Design Report" fileName="design_report.pdf" pageCount={24} />
            <DocumentPreview documentType="Stress Analysis" fileName="stress_analysis.pdf" pageCount={18} />
          </div>
        </div>
      )}

      {/* Manufacturing Preview Tab */}
      {activeTab === 'manufacturing' && (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Settings size={20} className="text-amber-600" />
              Manufacturing Specifications
            </h3>
            <p className="text-gray-700">
              Review manufacturing specifications and process parameters for production planning.
            </p>
          </div>
          <ManufacturingPreview />
        </div>
      )}
    </div>
  );
}
