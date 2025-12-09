'use client';

import { useState } from 'react';
import { MessageSquare, MapPin, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export type AnnotationMode = 'text' | 'point' | null;

export interface Annotation {
  id: string;
  type: 'text' | 'point';
  position: { x: number; y: number; z: number };
  text: string;
  color?: string;
  visible: boolean;
  timestamp: number;
}

export interface AnnotationPanelProps {
  mode: AnnotationMode;
  onModeChange: (mode: AnnotationMode) => void;
  annotations: Annotation[];
  onAddAnnotation: (annotation: Omit<Annotation, 'id' | 'timestamp'>) => void;
  onEditAnnotation: (id: string, text: string) => void;
  onDeleteAnnotation: (id: string) => void;
  onToggleAnnotation: (id: string) => void;
  onToggleAll: (visible: boolean) => void;
}

export function AnnotationPanel({
  mode,
  onModeChange,
  annotations,
  onAddAnnotation: _onAddAnnotation,
  onEditAnnotation,
  onDeleteAnnotation,
  onToggleAnnotation,
  onToggleAll,
}: AnnotationPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleEditStart = (annotation: Annotation) => {
    setEditingId(annotation.id);
    setEditText(annotation.text);
  };

  const handleEditSave = () => {
    if (editingId && editText.trim()) {
      onEditAnnotation(editingId, editText);
      setEditingId(null);
      setEditText('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const visibleCount = annotations.filter((a) => a.visible).length;
  const allVisible = annotations.length > 0 && visibleCount === annotations.length;

  return (
    <Card className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MessageSquare size={16} />
          Annotations
        </h3>
        {annotations.length > 0 && (
          <button
            onClick={() => onToggleAll(!allVisible)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            {allVisible ? (
              <>
                <EyeOff size={12} />
                Hide All
              </>
            ) : (
              <>
                <Eye size={12} />
                Show All
              </>
            )}
          </button>
        )}
      </div>

      {/* Annotation Mode Selection */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onModeChange(mode === 'text' ? null : 'text')}
          className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
            mode === 'text'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MessageSquare size={14} />
          Text Note
        </button>
        <button
          onClick={() => onModeChange(mode === 'point' ? null : 'point')}
          className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
            mode === 'point'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MapPin size={14} />
          Point
        </button>
      </div>

      {/* Active Mode Indicator */}
      {mode && (
        <div className="bg-blue-50 rounded-lg p-2 text-xs text-blue-700">
          <strong>
            {mode === 'text' ? 'Text Annotation Mode' : 'Point Annotation Mode'}
          </strong>
          <div className="mt-1 text-blue-600">
            Click on the model to place annotation
          </div>
        </div>
      )}

      {/* Annotations List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">
            Annotations ({annotations.length})
          </span>
          <span className="text-xs text-gray-500">
            {visibleCount} visible
          </span>
        </div>

        {annotations.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 text-center">
            No annotations yet. Select a mode above to add annotations.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {annotations.map((annotation) => {
              const isEditing = editingId === annotation.id;

              return (
                <div
                  key={annotation.id}
                  className={`rounded-lg p-2 transition-colors ${
                    annotation.visible ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {/* Icon */}
                    <div className="mt-0.5">
                      {annotation.type === 'text' ? (
                        <MessageSquare size={14} className="text-blue-600" />
                      ) : (
                        <MapPin size={14} className="text-green-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            placeholder="Enter annotation text"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleEditSave}
                              className="flex-1"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleEditCancel}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs font-medium text-gray-900 mb-1">
                            {annotation.text || 'No text'}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            ({annotation.position.x.toFixed(1)}, {annotation.position.y.toFixed(1)}, {annotation.position.z.toFixed(1)})
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onToggleAnnotation(annotation.id)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-600"
                          title={annotation.visible ? 'Hide' : 'Show'}
                        >
                          {annotation.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <button
                          onClick={() => handleEditStart(annotation)}
                          className="p-1 rounded hover:bg-blue-100 text-blue-600"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => onDeleteAnnotation(annotation.id)}
                          className="p-1 rounded hover:bg-red-100 text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Instructions */}
      {!mode && annotations.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-2">
          <div className="font-medium">How to use:</div>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>Select Text Note or Point mode</li>
            <li>Click on the 3D model to place</li>
            <li>Edit annotations inline</li>
            <li>Show/hide with eye icon</li>
          </ul>
        </div>
      )}
    </Card>
  );
}
