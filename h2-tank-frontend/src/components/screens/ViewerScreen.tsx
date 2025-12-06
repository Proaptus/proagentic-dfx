'use client';

import { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { useAppStore } from '@/lib/stores/app-store';
import { getDesignGeometry, getDesignStress, getDesign } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TankModel } from '@/components/three/TankModel';
import type { DesignGeometry, DesignStress, DesignSummary } from '@/lib/types';
import { Eye, Layers, Activity, RotateCw, ArrowRight } from 'lucide-react';

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

  const handleAnalyze = () => {
    setScreen('analysis');
  };

  // Available designs
  const designs = paretoFront.length > 0
    ? paretoFront.slice(0, 5).map((d) => d.id)
    : ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">3D Tank Viewer</h2>
          <p className="text-gray-600 mt-1">
            Interactive visualization of the hydrogen tank design geometry.
          </p>
        </div>
        <Button onClick={handleAnalyze}>
          Analyze Design <ArrowRight className="ml-2" size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* 3D Viewer */}
        <div className="col-span-3">
          <Card padding="none" className="h-[600px] overflow-hidden">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                Loading geometry...
              </div>
            ) : geometry ? (
              <Canvas camera={{ position: [0.5, 0.5, 1], fov: 50 }}>
                <Suspense fallback={null}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <TankModel
                    geometry={geometry}
                    stressNodes={stress?.contour_data?.nodes}
                    showStress={showStress}
                    showWireframe={showWireframe}
                    showCrossSection={showCrossSection}
                    autoRotate={autoRotate}
                  />
                  <Grid
                    infiniteGrid
                    fadeDistance={10}
                    fadeStrength={5}
                    cellSize={0.1}
                    sectionSize={0.5}
                    cellColor="#6B7280"
                    sectionColor="#374151"
                  />
                  <OrbitControls enableDamping dampingFactor={0.05} />
                  <Environment preset="city" />
                </Suspense>
              </Canvas>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No geometry data
              </div>
            )}
          </Card>

          {/* View Controls */}
          <Card className="mt-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">View Options:</span>
              <button
                onClick={() => setShowStress(!showStress)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  showStress ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Activity size={16} />
                Stress
              </button>
              <button
                onClick={() => setShowWireframe(!showWireframe)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  showWireframe ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Layers size={16} />
                Wireframe
              </button>
              <button
                onClick={() => setShowCrossSection(!showCrossSection)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  showCrossSection ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Eye size={16} />
                Cross-Section
              </button>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  autoRotate ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <RotateCw size={16} />
                Auto-Rotate
              </button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
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

          {/* Geometry Summary */}
          {geometry && (
            <Card>
              <CardHeader>
                <CardTitle>Geometry</CardTitle>
              </CardHeader>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Inner Radius:</dt>
                  <dd className="font-medium">{geometry.dimensions.inner_radius_mm} mm</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Total Length:</dt>
                  <dd className="font-medium">{geometry.dimensions.total_length_mm} mm</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Wall Thickness:</dt>
                  <dd className="font-medium">{geometry.dimensions.wall_thickness_mm} mm</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Volume:</dt>
                  <dd className="font-medium">{geometry.dimensions.internal_volume_liters} L</dd>
                </div>
              </dl>
            </Card>
          )}

          {/* Performance Summary */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Weight:</dt>
                  <dd className="font-medium">{summary.summary.weight_kg} kg</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Cost:</dt>
                  <dd className="font-medium">€{summary.summary.cost_eur.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Burst Pressure:</dt>
                  <dd className="font-medium">{summary.summary.burst_pressure_bar} bar</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">P(Failure):</dt>
                  <dd className="font-medium">{summary.summary.p_failure.toExponential(0)}</dd>
                </div>
              </dl>
            </Card>
          )}

          {/* Stress Summary */}
          {stress && (
            <Card>
              <CardHeader>
                <CardTitle>Stress Analysis</CardTitle>
              </CardHeader>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Max Stress:</dt>
                  <dd className="font-medium">{stress.max_stress.value_mpa} MPa</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Allowable:</dt>
                  <dd className="font-medium">{stress.max_stress.allowable_mpa} MPa</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Margin:</dt>
                  <dd className="font-medium text-green-600">+{stress.max_stress.margin_percent}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Location:</dt>
                  <dd className="font-medium text-xs">{stress.max_stress.region}</dd>
                </div>
              </dl>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
