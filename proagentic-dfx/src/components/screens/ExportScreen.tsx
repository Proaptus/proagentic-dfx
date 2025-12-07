'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { startExport, getExportStatus, getExportDownloadUrl } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Download, FileArchive, Loader2 } from 'lucide-react';

interface ExportCategory {
  id: string;
  label: string;
  options: { id: string; label: string }[];
}

const exportCategories: ExportCategory[] = [
  {
    id: 'geometry',
    label: 'Geometry Files',
    options: [
      { id: 'step', label: 'STEP (CAD)' },
      { id: 'stl', label: 'STL (Mesh)' },
      { id: 'iges', label: 'IGES' },
    ],
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing Data',
    options: [
      { id: 'winding', label: 'Winding Program' },
      { id: 'qc', label: 'QC Specification' },
      { id: 'bom', label: 'Bill of Materials' },
    ],
  },
  {
    id: 'analysis',
    label: 'Analysis Reports',
    options: [
      { id: 'stress', label: 'Stress Report' },
      { id: 'failure', label: 'Failure Analysis' },
      { id: 'thermal', label: 'Thermal Report' },
      { id: 'reliability', label: 'Reliability Report' },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance Documents',
    options: [
      { id: 'iso', label: 'ISO 11119-3 Evidence' },
      { id: 'un', label: 'UN R134 Documentation' },
      { id: 'test_plan', label: 'Test Plan' },
    ],
  },
  {
    id: 'sentry',
    label: 'Monitoring Specifications',
    options: [
      { id: 'sensor_spec', label: 'Sensor Specifications' },
      { id: 'inspection', label: 'Inspection Schedule' },
    ],
  },
];

export function ExportScreen() {
  const { currentDesign, setCurrentDesign } = useAppStore();

  const [selections, setSelections] = useState<Record<string, string[]>>({
    geometry: ['step'],
    manufacturing: ['winding', 'qc'],
    analysis: ['stress', 'reliability'],
    compliance: ['iso', 'un'],
    sentry: ['sensor_spec'],
  });

  const [exportId, setExportId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<{
    status: string;
    progress_percent: number;
    download_url?: string;
  } | null>(null);
  const [exporting, setExporting] = useState(false);

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
        const status = (await getExportStatus(exportId)) as {
          status: string;
          progress_percent: number;
          download_url?: string;
        };
        setExportStatus(status);
        if (status.status === 'ready') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [exportId, exportStatus?.status]);

  const toggleOption = (category: string, option: string) => {
    setSelections((prev) => {
      const current = prev[category] || [];
      if (current.includes(option)) {
        return { ...prev, [category]: current.filter((o) => o !== option) };
      }
      return { ...prev, [category]: [...current, option] };
    });
  };

  const handleExport = async () => {
    if (!currentDesign) return;

    setExporting(true);
    try {
      const result = (await startExport({
        design_id: currentDesign,
        include: selections,
        format: 'zip',
      })) as { export_id: string };

      setExportId(result.export_id);
      setExportStatus({ status: 'generating', progress_percent: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = () => {
    if (!exportId) return;
    window.open(getExportDownloadUrl(exportId), '_blank');
  };

  const totalSelected = Object.values(selections).flat().length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Export Package</h2>
        <p className="text-gray-600 mt-1">
          Generate a complete export package for Design {currentDesign}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Selection */}
        <div className="space-y-4">
          {exportCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle>{category.label}</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {category.options.map((option) => {
                  const isSelected = selections[category.id]?.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleOption(category.id, option.id)}
                      className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && <CheckCircle size={18} />}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        {/* Export Status */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Summary</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Design</span>
                <span className="font-medium">Design {currentDesign}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Selected Items</span>
                <span className="font-medium">{totalSelected} files</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Format</span>
                <span className="font-medium">ZIP Archive</span>
              </div>

              {!exportId ? (
                <Button
                  className="w-full"
                  onClick={handleExport}
                  loading={exporting}
                  disabled={totalSelected === 0}
                >
                  <FileArchive className="mr-2" size={18} />
                  Generate Export Package
                </Button>
              ) : exportStatus?.status === 'ready' ? (
                <Button className="w-full" onClick={handleDownload}>
                  <Download className="mr-2" size={18} />
                  Download Package
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating...</span>
                    <span>{exportStatus?.progress_percent || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportStatus?.progress_percent || 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {exportStatus?.status === 'ready' && (
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-center gap-4">
                <CheckCircle className="text-green-600" size={40} />
                <div>
                  <h3 className="font-semibold text-green-900">Export Ready!</h3>
                  <p className="text-green-700 text-sm">
                    Your export package is ready for download.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Included in Export</CardTitle>
            </CardHeader>
            <ul className="space-y-1 text-sm">
              {Object.entries(selections).map(([category, options]) =>
                options.map((option) => {
                  const cat = exportCategories.find((c) => c.id === category);
                  const opt = cat?.options.find((o) => o.id === option);
                  return (
                    <li key={`${category}-${option}`} className="flex items-center gap-2 py-1">
                      <CheckCircle size={14} className="text-green-500" />
                      <span className="text-gray-600">{cat?.label}:</span>
                      <span className="font-medium">{opt?.label}</span>
                    </li>
                  );
                })
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
