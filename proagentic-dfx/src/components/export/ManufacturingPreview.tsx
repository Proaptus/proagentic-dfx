'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Settings, CheckSquare, Layers, AlertCircle } from 'lucide-react';
import { CureCycleChart } from './CureCycleChart';

interface WindingSequenceRow {
  step: number;
  layer_type: string;
  angle_deg: number;
  passes: number;
  tension_n: number;
  feed_rate_mm_s: number;
}

interface ToleranceRow {
  parameter: string;
  nominal: string;
  tolerance: string;
  critical: boolean;
}

interface QCChecklistItem {
  id: number;
  item: string;
  critical: boolean;
}

interface ManufacturingPreviewProps {
  windingSequence?: WindingSequenceRow[];
  qcChecklist?: QCChecklistItem[];
  tolerances?: ToleranceRow[];
}

export function ManufacturingPreview({
  windingSequence = [],
  qcChecklist = [],
  tolerances = []
}: ManufacturingPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Winding Sequence Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers size={20} className="text-blue-600" />
            Winding Sequence
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Step</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Layer Type</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Angle (°)</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Passes</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Tension (N)</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Feed Rate (mm/s)</th>
                </tr>
              </thead>
              <tbody>
                {windingSequence.map((row) => (
                  <tr key={row.step} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{row.step}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          row.layer_type === 'Hoop'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {row.layer_type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">{row.angle_deg}°</td>
                    <td className="px-4 py-2 text-right">{row.passes}</td>
                    <td className="px-4 py-2 text-right">{row.tension_n} N</td>
                    <td className="px-4 py-2 text-right">{row.feed_rate_mm_s} mm/s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 p-3 bg-blue-50 rounded-lg text-sm">
            <div>
              <div className="text-gray-600">Total Layers</div>
              <div className="font-medium text-gray-900">20</div>
            </div>
            <div>
              <div className="text-gray-600">Estimated Winding Time</div>
              <div className="font-medium text-gray-900">4h 35m</div>
            </div>
            <div>
              <div className="text-gray-600">Fiber Length Required</div>
              <div className="font-medium text-gray-900">2,840 m</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Cure Cycle Chart */}
      <CureCycleChart />

      {/* QC Inspection Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare size={20} className="text-green-600" />
            QC Inspection Checklist
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="space-y-2">
            {qcChecklist.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  item.critical
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 border-2 border-gray-400 rounded"></div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.item}</div>
                </div>
                {item.critical && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-200 text-orange-900 text-xs font-medium rounded">
                      <AlertCircle size={12} />
                      Critical
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Dimensional Tolerances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} className="text-gray-600" />
            Dimensional Tolerances
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Parameter</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Nominal</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Tolerance</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {tolerances.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {row.critical && (
                          <AlertCircle size={14} className="text-orange-600" />
                        )}
                        <span className={row.critical ? 'font-medium' : ''}>
                          {row.parameter}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right font-mono">{row.nominal}</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-600">
                      {row.tolerance}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="inline-flex px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                        TBD
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
