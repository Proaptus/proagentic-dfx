'use client';

import { useEffect, useState, useMemo, lazy, Suspense, useCallback } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { getDesignGeometry, getDesignStress, getDesign } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DesignGeometry, DesignStress, DesignSummary, CompositeLayer } from '@/lib/types';
import { ArrowRight, Info } from 'lucide-react';

// Dynamic import for CAD viewer (client-side only)
const CADTankViewer = lazy(() => import('@/components/cad/CADTankViewer'));

// Enhanced viewer components
import { ViewerControls, type CameraState, type ViewPreset } from '@/components/viewer/ViewerControls';
import { LayerControls } from '@/components/viewer/LayerControls';
import { SectionControls, type SectionDirection } from '@/components/viewer/SectionControls';
import { MeasurementTools, type MeasurementMode, type Measurement } from '@/components/viewer/MeasurementTools';
import { AnnotationPanel, type AnnotationMode, type Annotation } from '@/components/viewer/AnnotationPanel';
import { GeometryDetails } from '@/components/viewer/GeometryDetails';

export function ViewerScreen() {
  const { currentDesign, setCurrentDesign, setScreen, paretoFront } = useAppStore();

  const [geometry, setGeometry] = useState<DesignGeometry | null>(null);
  const [stress, setStress] = useState<DesignStress | null>(null);
  const [summary, setSummary] = useState<DesignSummary | null>(null);
  const [loading, setLoading] = useState(false);

  // Camera and view controls
  const [cameraState, setCameraState] = useState<CameraState>({
    position: [0, 0, 2],
    rotation: [0.3, 0],
    zoom: 1,
  });
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Display controls
  const [showStress, _setShowStress] = useState(false);
  const [showWireframe, _setShowWireframe] = useState(false);
  const [showLiner, _setShowLiner] = useState(true);

  // Section controls
  const [showCrossSection, setShowCrossSection] = useState(false);
  const [sectionPosition, setSectionPosition] = useState(0);
  const [sectionDirection, setSectionDirection] = useState<SectionDirection>('z');
  const [showInterior, setShowInterior] = useState(false);

  // Layer controls
  const [visibleLayers, setVisibleLayers] = useState<Set<number>>(new Set());
  const [layerOpacity, setLayerOpacity] = useState(0.85);

  // Measurement tools
  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  // Annotations
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // UI state
  const [showDesignInfo, setShowDesignInfo] = useState(true);

  // Get layers from geometry
  const layers: CompositeLayer[] = useMemo(() => {
    if (geometry?.layup?.layers) {
      return geometry.layup.layers;
    }
    return [];
  }, [geometry]);

  // Initialize visible layers when geometry loads
  useEffect(() => {
    if (layers.length > 0 && visibleLayers.size === 0) {
      setVisibleLayers(new Set(layers.map((_, i) => i)));
    }
  }, [layers, visibleLayers]);

  // Default to design C if none selected
  useEffect(() => {
    if (!currentDesign) {
      setCurrentDesign('C');
    }
  }, [currentDesign, setCurrentDesign]);

  // Load data
  useEffect(() => {
    if (!currentDesign) return;

    setLoading(true);
    Promise.all([
      getDesignGeometry(currentDesign),
      getDesignStress(currentDesign),
      getDesign(currentDesign),
    ])
      .then(([geo, str, sum]) => {
        setGeometry(geo as DesignGeometry);
        setStress(str as DesignStress);
        setSummary(sum as DesignSummary);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentDesign]);

  // Available designs
  const designs = paretoFront.length > 0
    ? paretoFront.slice(0, 5).map((d) => d.id)
    : ['A', 'B', 'C', 'D', 'E'];

  // Handlers
  const handleViewPreset = useCallback((preset: ViewPreset) => {
    // Implement view preset logic
    const presets: Record<ViewPreset, Partial<CameraState>> = {
      front: { position: [0, 0, 2], rotation: [0, 0] },
      side: { position: [2, 0, 0], rotation: [0, Math.PI / 2] },
      top: { position: [0, 2, 0], rotation: [Math.PI / 2, 0] },
      isometric: { position: [1.5, 1.5, 1.5], rotation: [Math.PI / 4, Math.PI / 4] },
      section: { position: [0, 0, 2], rotation: [0, 0] },
    };

    const newState = { ...cameraState, ...presets[preset] };
    setCameraState(newState);

    if (preset === 'section') {
      setShowCrossSection(true);
    }
  }, [cameraState]);

  const handleResetView = useCallback(() => {
    setCameraState({ position: [0, 0, 2], rotation: [0.3, 0], zoom: 1 });
    setZoom(1);
    setAutoRotate(false);
  }, []);

  const handleScreenshot = useCallback(() => {
    // TODO: Implement screenshot capture
    console.log('Screenshot captured');
  }, []);

  const handleLayerToggle = useCallback((layerIndex: number) => {
    setVisibleLayers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(layerIndex)) {
        newSet.delete(layerIndex);
      } else {
        newSet.add(layerIndex);
      }
      return newSet;
    });
  }, []);

  const handleShowAllLayers = useCallback(() => {
    setVisibleLayers(new Set(layers.map((_, i) => i)));
  }, [layers]);

  const handleHideAllLayers = useCallback(() => {
    setVisibleLayers(new Set());
  }, []);

  const handleClearMeasurement = useCallback((id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleClearAllMeasurements = useCallback(() => {
    setMeasurements([]);
  }, []);

  const handleAddAnnotation = useCallback((annotation: Omit<Annotation, 'id' | 'timestamp'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `ann-${Date.now()}`,
      timestamp: Date.now(),
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
  }, []);

  const handleEditAnnotation = useCallback((id: string, text: string) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, text } : a))
    );
  }, []);

  const handleDeleteAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleToggleAnnotation = useCallback((id: string) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, visible: !a.visible } : a))
    );
  }, []);

  const handleToggleAllAnnotations = useCallback((visible: boolean) => {
    setAnnotations((prev) => prev.map((a) => ({ ...a, visible })));
  }, []);

  const handleAnalyze = () => {
    setScreen('analysis');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">3D Tank Viewer</h2>
          <p className="text-gray-600 mt-1">
            Interactive visualization of the hydrogen tank design geometry.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setScreen('compare')}>
            Compare Designs
          </Button>
          <Button onClick={handleAnalyze}>
            Analyze Design <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main 3D Viewer */}
        <div className="col-span-8">
          <Card padding="none" className="h-[700px] overflow-hidden relative">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                Loading geometry...
              </div>
            ) : geometry ? (
              <Suspense
                fallback={
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Loading CAD viewer...
                  </div>
                }
              >
                <CADTankViewer
                  geometry={geometry}
                  stressNodes={stress?.contour_data?.nodes}
                  showStress={showStress}
                  showWireframe={showWireframe}
                  showCrossSection={showCrossSection}
                  autoRotate={autoRotate}
                  visibleLayers={visibleLayers}
                  showLiner={showLiner}
                  layerOpacity={layerOpacity}
                />
              </Suspense>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No geometry data
              </div>
            )}

            {/* Design Info Overlay */}
            {showDesignInfo && summary && geometry && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">Design {currentDesign}</h3>
                  <button
                    onClick={() => setShowDesignInfo(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Weight:</dt>
                    <dd className="font-semibold text-gray-900">{summary.summary.weight_kg} kg</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Cost:</dt>
                    <dd className="font-semibold text-gray-900">€{summary.summary.cost_eur.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Burst:</dt>
                    <dd className="font-semibold text-gray-900">{summary.summary.burst_pressure_bar} bar</dd>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Compliance:</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Passed
                      </span>
                    </div>
                  </div>
                </dl>
              </div>
            )}

            {!showDesignInfo && (
              <button
                onClick={() => setShowDesignInfo(true)}
                className="absolute top-4 left-4 p-2 bg-white/80 rounded-lg hover:bg-white transition-colors"
                title="Show design info"
              >
                <Info size={16} className="text-gray-600" />
              </button>
            )}
          </Card>
        </div>

        {/* Right Sidebar - Controls */}
        <div className="col-span-4 space-y-4 max-h-[700px] overflow-y-auto">
          {/* Design Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Design</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {designs.map((id) => (
                <button
                  key={id}
                  onClick={() => setCurrentDesign(id)}
                  className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                    currentDesign === id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  Design {id}
                </button>
              ))}
            </div>
          </Card>

          {/* Viewer Controls */}
          <ViewerControls
            onViewPreset={handleViewPreset}
            onResetView={handleResetView}
            onZoomChange={setZoom}
            onAutoRotateToggle={setAutoRotate}
            onScreenshot={handleScreenshot}
            cameraState={cameraState}
            autoRotate={autoRotate}
            zoom={zoom}
          />

          {/* Layer Controls */}
          {layers.length > 0 && (
            <LayerControls
              layers={layers}
              visibleLayers={visibleLayers}
              onLayerToggle={handleLayerToggle}
              onShowAll={handleShowAllLayers}
              onHideAll={handleHideAllLayers}
              layerOpacity={layerOpacity}
              onOpacityChange={setLayerOpacity}
              linerThickness={geometry?.layup?.liner_thickness_mm}
              fiberVolumeFraction={geometry?.layup?.fiber_volume_fraction}
            />
          )}

          {/* Section Controls */}
          <SectionControls
            enabled={showCrossSection}
            onToggle={setShowCrossSection}
            position={sectionPosition}
            onPositionChange={setSectionPosition}
            direction={sectionDirection}
            onDirectionChange={setSectionDirection}
            showInterior={showInterior}
            onShowInteriorToggle={setShowInterior}
          />

          {/* Measurement Tools */}
          <MeasurementTools
            mode={measurementMode}
            onModeChange={setMeasurementMode}
            measurements={measurements}
            onClearMeasurement={handleClearMeasurement}
            onClearAll={handleClearAllMeasurements}
          />

          {/* Annotation Panel */}
          <AnnotationPanel
            mode={annotationMode}
            onModeChange={setAnnotationMode}
            annotations={annotations}
            onAddAnnotation={handleAddAnnotation}
            onEditAnnotation={handleEditAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
            onToggleAnnotation={handleToggleAnnotation}
            onToggleAll={handleToggleAllAnnotations}
          />

          {/* Geometry Details */}
          {geometry && <GeometryDetails geometry={geometry} />}
        </div>
      </div>
    </div>
  );
}
