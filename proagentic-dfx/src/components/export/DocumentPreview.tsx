'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Printer,
  Download,
  Maximize2,
} from 'lucide-react';

interface DocumentPreviewProps {
  documentType?: string;
  fileName?: string;
  pageCount?: number;
  previewUrl?: string;
}

export function DocumentPreview({
  documentType = 'Design Report',
  fileName = 'design_report.pdf',
  pageCount = 24,
  previewUrl,
}: DocumentPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Trigger download
    console.log('Downloading:', fileName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={20} />
          Document Preview
        </CardTitle>
      </CardHeader>

      <div className="p-4 space-y-4">
        {/* Document Info */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{documentType}</div>
              <div className="text-sm text-gray-500">{fileName}</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">{pageCount} pages</div>
        </div>

        {/* Preview Area */}
        <div className="border-2 border-gray-200 rounded-lg bg-gray-50 min-h-[500px] flex items-center justify-center">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-[500px] rounded-lg"
              title="Document Preview"
            />
          ) : (
            <div className="text-center space-y-4 p-8">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                <FileText size={32} className="text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Preview Available After Export</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generate the export package to preview documents
                </p>
              </div>
              <div className="space-y-2 text-sm text-gray-600 text-left max-w-md mx-auto">
                <h4 className="font-medium">Document will include:</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Design specification summary</li>
                  <li>Material selection and properties</li>
                  <li>Winding pattern and layup sequence</li>
                  <li>Stress analysis results</li>
                  <li>Compliance verification matrix</li>
                  <li>Manufacturing instructions</li>
                  <li>QC inspection checklist</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="text-sm text-gray-600 px-3">
              Page {currentPage} of {pageCount}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
              disabled={currentPage === pageCount}
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              disabled={zoom <= 50}
            >
              <ZoomOut size={16} />
            </Button>
            <div className="text-sm text-gray-600 px-2 min-w-[60px] text-center">
              {zoom}%
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              disabled={zoom >= 200}
            >
              <ZoomIn size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer size={16} className="mr-1" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download size={16} className="mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Maximize2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
