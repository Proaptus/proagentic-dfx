'use client';

import { useEffect, useState, useMemo, lazy, Suspense, useCallback } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { getDesignStress } from '@/lib/api/client';
import type { StressType, LoadCase } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import type { DesignGeometry, DesignStress, DesignSummary, CompositeLayer } from '@/lib/types';
import { Eye, Activity, ArrowRight, Camera, RefreshCw, AlertCircle } from 'lucide-react';
import { MeasurementTools, type Measurement } from '@/components/viewer/MeasurementTools';
import { ViewModeControls } from '@/components/viewer/ViewModeControls';
import { LayerControls } from '@/components/viewer/LayerControls';
import { ExportDialog } from '@/components/viewer/ExportDialog';
import { captureAndDownloadScreenshot, type ScreenshotOptions } from '@/lib/export/screenshot-utils';
import { useViewerKeyboardShortcuts } from '@/components/viewer/useViewerKeyboardShortcuts';
import { useGeometryLoader } from '@/components/viewer/useGeometryLoader';
import { useMeasurements } from '@/components/viewer/useMeasurements';

// Dynamic import for CAD viewer (client-side only)
const CADTankViewer = lazy(() => import('@/components/cad/CADTankViewer'));

export function ViewerScreen() {
  const { currentDesign, setCurrentDesign, setScreen, paretoFront } = useAppStore();

  // ISSUE-011: Geometry loading with timeout and retry (extracted to hook)
  const { geometry, summary, loading, loadError, retryLoadGeometry } = useGeometryLoader(currentDesign);

  const [stress, setStress] = useState<DesignStress | null>(null);

  // Stress type selection state
  const [selectedStressType, setSelectedStressType] = useState<StressType>('vonMises');
  const [selectedLoadCase, setSelectedLoadCase] = useState<LoadCase>('test');
  const [isLoadingStress, setIsLoadingStress] = useState(false);
  const [stressError, setStressError] = useState<string | null>(null);

  // View controls
  const [showStress, setShowStress] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showCrossSection, setShowCrossSection] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showLiner, setShowLiner] = useState(true);
  const [layerOpacity, setLayerOpacity] = useState(0.85);

  // Layer visibility controls
  const [visibleLayers, setVisibleLayers] = useState<Set<number> | undefined>(undefined);

  // Measurement state (extracted to hook)
  const {
    measurementMode,
    measurements,
    pendingPoints,
    setMeasurementMode,
    handlePointClick,
    clearMeasurements,
    deleteMeasurement,
    clearPendingPoints,
  } = useMeasurements();

  // Export state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportPreview, setExportPreview] = useState<string>('');

  // ISSUE-020: Keyboard shortcuts for view mode toggles (extracted to hook)
  useViewerKeyboardShortcuts(useMemo(() => ({
    onToggleStress: () => setShowStress((prev) => !prev),
    onToggleWireframe: () => setShowWireframe((prev) => !prev),
    onToggleCrossSection: () => setShowCrossSection((prev) => !prev),
    onToggleAutoRotate: () => setAutoRotate((prev) => !prev),
    onToggleLiner: () => setShowLiner((prev) => !prev),
  }), []));

  // Auto-disable auto-rotate when measuring
  useEffect(() => {
    if (measurementMode) {
      setAutoRotate(false);
    }
  }, [measurementMode]);

  // Get layers from geometry with useMemo for performance
  const layers: CompositeLayer[] = useMemo(() => {
    if (geometry?.layup?.layers) {
      return geometry.layup.layers;
    }
    return [];
  }, [geometry]);

  // Default to design C if none selected
  useEffect(() => {
    if (!currentDesign) {
      setCurrentDesign('C');
    }
  }, [currentDesign, setCurrentDesign]);

  // Load stress data when design, stress type, or load case changes
  useEffect(() => {
    if (!currentDesign) return;

    // Reset stress data and error on new fetch
    setIsLoadingStress(true);
    setStressError(null);

    getDesignStress(currentDesign, selectedStressType, selectedLoadCase)
      .then((str) => {
        setStress(str as DesignStress);
      })
      .catch((error) => {
        console.error('Failed to fetch stress data:', error);
        setStressError(error.message || 'Failed to load stress data');
        // Keep previous stress data on error for better UX
      })
      .finally(() => setIsLoadingStress(false));
  }, [currentDesign, selectedStressType, selectedLoadCase]);

  const handleAnalyze = useCallback(() => {
    setScreen('analysis');
  }, [setScreen]);

  // Export screenshot handler
  const handleExportClick = useCallback(() => {
    // Get the canvas element from the CADTankViewer
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      // Generate preview
      try {
        const previewUrl = canvas.toDataURL('image/png', 0.5);
        setExportPreview(previewUrl);
      } catch (error) {
        console.warn('Failed to generate preview:', error);
      }
    }
    setShowExportDialog(true);
  }, []);

  const handleExport = useCallback((options: ScreenshotOptions) => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas not found for export');
      return;
    }

    try {
      captureAndDownloadScreenshot(canvas, options);
    } catch (error) {
      console.error('Failed to export screenshot:', error);
      alert('Failed to export screenshot. Please try again.');
    }
  }, []);

  // ISSUE-002: Available designs - show all Pareto designs + featured designs (A-E)
  const designs = useMemo(() => {
    const featuredDesigns = ['A', 'B', 'C', 'D', 'E'];
    const paretoIds = paretoFront.map((d) => d.id);
    // Combine: Pareto designs first, then featured designs (deduped)
    return [...paretoIds, ...featuredDesigns.filter(id => !paretoIds.includes(id))];
  }, [paretoFront]);

  return (
    <div className="space-y-6" role="main" aria-label="3D Tank Viewer">
      {/* Enterprise Page Header */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">3D Tank Viewer</h1>
          <p className="text-gray-600 text-base max-w-3xl">
            Interactive 3D visualization of hydrogen tank design geometry with advanced measurement tools,
            stress analysis overlays, and composite layer visualization. Rotate, zoom, and inspect your design
            from every angle.
          </p>
        </div>
        <Button
          onClick={handleAnalyze}
          className="shrink-0"
          aria-label="Navigate to analysis screen"
        >
          Analyze Design <ArrowRight className="ml-2" size={16} aria-hidden="true" />
        </Button>
      </header>

      <div className="grid grid-cols-4 gap-6">
        {/* 3D Viewer - Enterprise Elevated Card */}
        <section className="col-span-3" aria-label="3D viewport and controls">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Professional Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  3D Viewport
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500" role="status" aria-live="polite">
                    <span>Design {currentDesign}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-400" aria-hidden="true" />
                    <span>{geometry ? 'Geometry Loaded' : 'No Data'}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleExportClick}
                    disabled={!geometry}
                    icon={<Camera size={14} />}
                    aria-label="Export screenshot"
                  >
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Main 3D Viewport */}
            <div className="h-[600px] bg-gradient-to-br from-gray-50 to-gray-100" role="region" aria-label="3D tank visualization">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500" role="status" aria-live="polite">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" aria-hidden="true"></div>
                  <p className="text-sm font-medium">Loading geometry...</p>
                </div>
              ) : loadError ? (
                /* ISSUE-011: Error state with retry button */
                <div className="h-full flex flex-col items-center justify-center text-red-500" role="alert" aria-live="assertive">
                  <AlertCircle size={48} className="mb-4" aria-hidden="true" />
                  <p className="text-sm font-semibold mb-2">Failed to Load Geometry</p>
                  <p className="text-xs text-gray-500 mb-4 max-w-xs text-center">{loadError}</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={retryLoadGeometry}
                    icon={<RefreshCw size={14} />}
                  >
                    Retry
                  </Button>
                </div>
              ) : geometry ? (
                <Suspense fallback={
                  <div className="h-full flex flex-col items-center justify-center text-gray-500" role="status" aria-live="polite">
                    <div className="animate-pulse rounded-full h-12 w-12 bg-blue-200 mb-4" aria-hidden="true"></div>
                    <p className="text-sm font-medium">Loading CAD viewer...</p>
                  </div>
                }>
                  <CADTankViewer
                    geometry={geometry}
                    stressNodes={stress?.contour_data?.nodes}
                    feaMesh3D={stress?.contour_data?.mesh3D}
                    stressRange={stress?.contour_data ? {
                      min: stress.contour_data.min_value,
                      max: stress.contour_data.max_value
                    } : undefined}
                    showStress={showStress}
                    showWireframe={showWireframe}
                    showCrossSection={showCrossSection}
                    autoRotate={autoRotate}
                    visibleLayers={visibleLayers}
                    showLiner={showLiner}
                    layerOpacity={layerOpacity}
                    onPointClick={handlePointClick}
                  />
                </Suspense>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400" role="status">
                  <Eye size={48} className="mb-4 opacity-50" aria-hidden="true" />
                  <p className="text-sm font-medium">No geometry data available</p>
                  <p className="text-xs mt-1">Select a design to begin</p>
                </div>
              )}
            </div>
          </div>

          {/* Enterprise Control Panel */}
          <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            {/* View Mode Controls - Extracted Component */}
            <ViewModeControls
              showStress={showStress}
              showWireframe={showWireframe}
              showCrossSection={showCrossSection}
              autoRotate={autoRotate}
              showLiner={showLiner}
              onToggleStress={() => setShowStress(!showStress)}
              onToggleWireframe={() => setShowWireframe(!showWireframe)}
              onToggleCrossSection={() => setShowCrossSection(!showCrossSection)}
              onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
              onToggleLiner={() => setShowLiner(!showLiner)}
              selectedStressType={selectedStressType}
              selectedLoadCase={selectedLoadCase}
              onStressTypeChange={setSelectedStressType}
              onLoadCaseChange={setSelectedLoadCase}
              isLoadingStress={isLoadingStress}
            />

            {/* Stress Error Alert */}
            {stressError && showStress && (
              <div
                className="mt-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                <strong className="font-medium">Error loading stress data: </strong>
                {stressError}
              </div>
            )}

            {/* Layer Controls Section - Extracted Component */}
            {layers.length > 0 && (
              <LayerControls
                layers={layers}
                visibleLayers={visibleLayers || new Set(layers.map((_, i) => i))}
                onLayerToggle={(index) => {
                  const newVisible = new Set(visibleLayers || layers.map((_, i) => i));
                  if (newVisible.has(index)) {
                    newVisible.delete(index);
                  } else {
                    newVisible.add(index);
                  }
                  setVisibleLayers(newVisible.size === layers.length ? undefined : newVisible);
                }}
                onShowAll={() => setVisibleLayers(undefined)}
                onHideAll={() => setVisibleLayers(new Set())}
                layerOpacity={layerOpacity}
                onOpacityChange={setLayerOpacity}
                linerThickness={geometry?.layup?.liner_thickness_mm}
                fiberVolumeFraction={geometry?.layup?.fiber_volume_fraction}
              />
            )}
          </div>
        </section>

        {/* Enterprise Properties Sidebar */}
        <aside className="space-y-4" aria-label="Design properties and tools">
          {/* Measurement Tools */}
          <MeasurementTools
            mode={measurementMode}
            onModeChange={(mode) => {
              setMeasurementMode(mode);
              clearPendingPoints(); // Clear pending on mode change
            }}
            measurements={measurements}
            onClearMeasurement={deleteMeasurement}
            onClearAll={clearMeasurements}
            pendingPoints={pendingPoints}
          />

          {/* Professional Design Selector - ISSUE-002: Updated to show all Pareto designs */}
          <nav
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            aria-label="Design selection"
          >
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Design Selection
              </h2>
              <span className="text-xs text-gray-500">{designs.length} designs</span>
            </div>
            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto" role="group" aria-label="Available designs">
              {designs.map((id) => (
                <button
                  key={id}
                  onClick={() => setCurrentDesign(id)}
                  className={`w-full px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-all duration-200 ${
                    currentDesign === id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                  aria-pressed={currentDesign === id}
                  aria-label={`Select Design ${id}${currentDesign === id ? ' (currently active)' : ''}`}
                >
                  Design {id}
                  {currentDesign === id && (
                    <span className="ml-2 text-xs opacity-75" aria-hidden="true">• Active</span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Professional Geometry Summary */}
          {geometry && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Geometry Specifications
                </h3>
              </div>
              <dl className="p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <dt className="text-gray-600">Inner Radius:</dt>
                  <dd className="font-semibold text-gray-900">{geometry.dimensions.inner_radius_mm} mm</dd>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <dt className="text-gray-600">Total Length:</dt>
                  <dd className="font-semibold text-gray-900">{geometry.dimensions.total_length_mm} mm</dd>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <dt className="text-gray-600">Wall Thickness:</dt>
                  <dd className="font-semibold text-gray-900">{geometry.dimensions.wall_thickness_mm} mm</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-600">Internal Volume:</dt>
                  <dd className="font-semibold text-gray-900">{geometry.dimensions.internal_volume_liters} L</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Professional Performance Summary */}
          {summary && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Performance Metrics
                </h3>
              </div>
              <dl className="p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <dt className="text-gray-600">Weight:</dt>
                  <dd className="font-semibold text-gray-900">{summary.summary.weight_kg} kg</dd>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <dt className="text-gray-600">Estimated Cost:</dt>
                  <dd className="font-semibold text-gray-900">€{summary.summary.cost_eur.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <dt className="text-gray-600">Burst Pressure:</dt>
                  <dd className="font-semibold text-gray-900">{summary.summary.burst_pressure_bar} bar</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-600">Failure Probability:</dt>
                  <dd className="font-semibold text-gray-900">{summary.summary.p_failure.toExponential(0)}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Professional Stress Summary */}
          {stress && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                  <Activity size={16} />
                  Stress Analysis
                  {isLoadingStress && (
                    <span className="ml-auto text-xs text-blue-600 animate-pulse">Loading...</span>
                  )}
                </h3>
              </div>
              <dl className="p-4 space-y-3 text-sm">
                {/* Current stress type and load case info */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <dt className="text-gray-600">Stress Type:</dt>
                  <dd className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                    {stress.stress_type || selectedStressType}
                  </dd>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <dt className="text-gray-600">Load Case:</dt>
                  <dd className="font-semibold text-gray-900 text-xs">
                    {stress.load_case} @ {stress.load_pressure_bar} bar
                  </dd>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <dt className="text-gray-600">Maximum Stress:</dt>
                  <dd className="font-semibold text-gray-900">{stress.max_stress.value_mpa} MPa</dd>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <dt className="text-gray-600">Allowable Stress:</dt>
                  <dd className="font-semibold text-gray-900">{stress.max_stress.allowable_mpa} MPa</dd>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <dt className="text-gray-600">Safety Margin:</dt>
                  <dd className={`font-semibold px-2 py-1 rounded ${
                    stress.max_stress.margin_percent >= 0
                      ? 'text-green-600 bg-green-50'
                      : 'text-red-600 bg-red-50'
                  }`}>
                    {stress.max_stress.margin_percent >= 0 ? '+' : ''}{stress.max_stress.margin_percent}%
                  </dd>
                </div>
                <div className="flex justify-between items-start">
                  <dt className="text-gray-600">Critical Location:</dt>
                  <dd className="font-medium text-gray-900 text-xs text-right max-w-[150px]">
                    {stress.max_stress.region}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </aside>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        currentDesignId={currentDesign || undefined}
        previewDataUrl={exportPreview}
      />
    </div>
  );
}
