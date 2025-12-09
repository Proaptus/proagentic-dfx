'use client';

import { useEffect, useState, useMemo, lazy, Suspense, useCallback } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { getDesignGeometry, getDesignStress, getDesign } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import type { DesignGeometry, DesignStress, DesignSummary, CompositeLayer } from '@/lib/types';
import { Eye, Activity, ArrowRight } from 'lucide-react';
import {
  MeasurementTools,
  type MeasurementMode,
  type Measurement,
  calculateDistance,
  calculateAngle,
  calculateRadius
} from '@/components/viewer/MeasurementTools';
import { ViewModeControls } from '@/components/viewer/ViewModeControls';
import { LayerControls } from '@/components/viewer/LayerControls';

// Dynamic import for CAD viewer (client-side only)
const CADTankViewer = lazy(() => import('@/components/cad/CADTankViewer'));

export function ViewerScreen() {
  const { currentDesign, setCurrentDesign, setScreen, paretoFront } = useAppStore();

  const [geometry, setGeometry] = useState<DesignGeometry | null>(null);
  const [stress, setStress] = useState<DesignStress | null>(null);
  const [summary, setSummary] = useState<DesignSummary | null>(null);
  const [loading, setLoading] = useState(false);

  // View controls
  const [showStress, setShowStress] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showCrossSection, setShowCrossSection] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showLiner, setShowLiner] = useState(true);
  const [layerOpacity, setLayerOpacity] = useState(0.85);

  // Layer visibility controls
  const [visibleLayers, setVisibleLayers] = useState<Set<number> | undefined>(undefined);

  // Measurement state
  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [pendingPoints, setPendingPoints] = useState<Array<{ x: number; y: number; z: number }>>([]);

  // Auto-disable auto-rotate when measuring
  useEffect(() => {
    if (measurementMode) {
      setAutoRotate(false);
    }
  }, [measurementMode]);

  // Handle point selection with useCallback for performance
  const handlePointClick = useCallback((point: { x: number; y: number; z: number }) => {
    if (!measurementMode) return;
    setPendingPoints((prev) => [...prev, point]);
  }, [measurementMode]);

  // Auto-create measurements
  useEffect(() => {
    if (!measurementMode || pendingPoints.length === 0) return;

    let value = 0;
    let unit = '';
    let complete = false;

    if (measurementMode === 'distance' && pendingPoints.length === 2) {
      value = calculateDistance(pendingPoints[0], pendingPoints[1]);
      unit = 'mm';
      complete = true;
    } else if (measurementMode === 'angle' && pendingPoints.length === 3) {
      value = calculateAngle(pendingPoints[0], pendingPoints[1], pendingPoints[2]);
      unit = '°';
      complete = true;
    } else if (measurementMode === 'radius' && pendingPoints.length === 2) {
      value = calculateRadius(pendingPoints[0], pendingPoints[1]);
      unit = 'mm';
      complete = true;
    }

    if (complete) {
      const newMeasurement: Measurement = {
        id: Math.random().toString(36).substr(2, 9),
        type: measurementMode,
        value,
        unit,
        points: [...pendingPoints],
        timestamp: Date.now(),
      };
      setMeasurements((prev) => [newMeasurement, ...prev]);
      setPendingPoints([]);
      // Optional: Exit mode after one measurement? No, let user continue.
    }
  }, [pendingPoints, measurementMode]);

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

  const handleAnalyze = useCallback(() => {
    setScreen('analysis');
  }, [setScreen]);

  // Available designs - memoized for performance
  const designs = useMemo(() => {
    return paretoFront.length > 0
      ? paretoFront.slice(0, 5).map((d) => d.id)
      : ['A', 'B', 'C', 'D', 'E'];
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
                <div className="flex items-center gap-2 text-xs text-gray-500" role="status" aria-live="polite">
                  <span>Design {currentDesign}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-400" aria-hidden="true" />
                  <span>{geometry ? 'Geometry Loaded' : 'No Data'}</span>
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
            />

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
              setPendingPoints([]); // Clear pending on mode change
            }}
            measurements={measurements}
            onClearMeasurement={(id) => setMeasurements(prev => prev.filter(m => m.id !== id))}
            onClearAll={() => setMeasurements([])}
            pendingPoints={pendingPoints}
          />

          {/* Professional Design Selector */}
          <nav
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            aria-label="Design selection"
          >
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Design Selection
              </h2>
            </div>
            <div className="p-4 space-y-2" role="group" aria-label="Available designs">
              {designs.map((id) => (
                <button
                  key={id}
                  onClick={() => setCurrentDesign(id)}
                  className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all duration-200 ${
                    currentDesign === id
                      ? 'bg-blue-600 text-white shadow-md transform scale-105'
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
                </h3>
              </div>
              <dl className="p-4 space-y-3 text-sm">
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
                  <dd className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                    +{stress.max_stress.margin_percent}%
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
    </div>
  );
}
