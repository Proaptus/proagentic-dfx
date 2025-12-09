'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Edit2, AlertCircle } from 'lucide-react';
import type { ExtractedRequirement } from '@/lib/types';

interface LiveExtractionPanelProps {
  requirements: ExtractedRequirement[];
  onConfirm: (field: string) => void;
  onEdit: (field: string, value: string | number) => void;
}

export function LiveExtractionPanel({
  requirements,
  onConfirm,
  onEdit,
}: LiveExtractionPanelProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'success';
    if (confidence >= 0.65) return 'warning';
    return 'error';
  };

  const confirmedFields = requirements.filter((r) => r.confidence >= 0.85 && r.value !== null);
  const missingFields = requirements.filter((r) => r.value === null);
  const lowConfidenceFields = requirements.filter(
    (r) => r.value !== null && r.confidence < 0.85
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live Requirement Extraction</CardTitle>
          <div className="flex gap-2">
            <Badge variant="success">{confirmedFields.length} Confirmed</Badge>
            {missingFields.length > 0 && (
              <Badge variant="warning">{missingFields.length} Missing</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <div className="px-4 pb-4 space-y-4">
        {/* Confirmed Requirements */}
        {confirmedFields.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Confirmed Requirements</h4>
            <div className="space-y-2">
              {confirmedFields.map((req) => (
                <div
                  key={req.field}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{req.label}</div>
                    <div className="text-sm text-gray-600 font-mono">
                      {req.value} {req.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getConfidenceColor(req.confidence)}>
                      {Math.round(req.confidence * 100)}%
                    </Badge>
                    <CheckCircle size={18} className="text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Confidence Requirements */}
        {lowConfidenceFields.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Please Confirm or Edit
            </h4>
            <div className="space-y-2">
              {lowConfidenceFields.map((req) => (
                <div
                  key={req.field}
                  className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{req.label}</div>
                    <Badge variant={getConfidenceColor(req.confidence)}>
                      {Math.round(req.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {req.editable ? (
                      <input
                        type="text"
                        value={req.value ?? ''}
                        onChange={(e) => onEdit(req.field, e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span className="flex-1 font-mono text-sm">
                        {req.value} {req.unit}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onConfirm(req.field)}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Confirm
                    </Button>
                    {req.editable && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(req.field, req.value ?? '')}
                      >
                        <Edit2 size={14} className="mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Requirements */}
        {missingFields.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Still Needed</h4>
            <div className="space-y-2">
              {missingFields.map((req) => (
                <div
                  key={req.field}
                  className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-600" />
                    <span className="font-medium text-gray-900">{req.label}</span>
                  </div>
                  <Badge variant="error">Missing</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Extraction Progress</span>
            <span className="font-medium text-gray-900">
              {confirmedFields.length} / {requirements.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(confirmedFields.length / requirements.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
