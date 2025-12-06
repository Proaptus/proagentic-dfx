'use client';

import { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import { useAppStore } from '@/lib/stores/app-store';
import { getDesignSentry, getDesignGeometry } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import type { DesignGeometry } from '@/lib/types';
import { TankModel } from '@/components/three/TankModel';
import { Eye, Radio, AlertTriangle, Calendar } from 'lucide-react';

interface SentryData {
  design_id: string;
  critical_monitoring_points: Array<{
    id: number;
    location: { r: number; z: number; theta: number };
    region: string;
    reason: string;
    recommended_sensor: string;
    inspection_interval_months: number;
  }>;
  recommended_sensors: Array<{
    type: string;
    count: number;
    purpose: string;
  }>;
  inspection_schedule: {
    visual: string;
    acoustic_monitoring: string;
    full_inspection: string;
    replacement_trigger: string;
  };
}

function MonitoringPoint({
  point,
  selected,
  onSelect,
}: {
  point: SentryData['critical_monitoring_points'][0];
  selected: boolean;
  onSelect: () => void;
}) {
  const y = point.location.z / 1000;

  return (
    <group position={[0.2, y, 0]}>
      <mesh onClick={onSelect}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial
          color={selected ? '#3B82F6' : '#EF4444'}
          emissive={selected ? '#3B82F6' : '#EF4444'}
          emissiveIntensity={0.5}
        />
      </mesh>
      {selected && (
        <Html distanceFactor={3} position={[0.15, 0, 0]}>
          <div className="bg-white p-2 rounded-lg shadow-lg text-xs w-48 border border-gray-200">
            <div className="font-bold text-gray-900">Point {point.id}</div>
            <div className="text-gray-600">{point.region.replace(/_/g, ' ')}</div>
            <div className="text-gray-500 mt-1">{point.reason}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export function SentryScreen() {
  const { currentDesign, setCurrentDesign } = useAppStore();

  const [sentry, setSentry] = useState<SentryData | null>(null);
  const [geometry, setGeometry] = useState<DesignGeometry | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(1);

  // Default to design C if none selected
  useEffect(() => {
    if (!currentDesign) {
      setCurrentDesign('C');
    }
  }, [currentDesign, setCurrentDesign]);

  useEffect(() => {
    if (!currentDesign) return;

    setLoading(true);
    Promise.all([
      getDesignSentry(currentDesign),
      getDesignGeometry(currentDesign),
    ])
      .then(([sentryData, geo]) => {
        setSentry(sentryData as SentryData);
        setGeometry(geo as DesignGeometry);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentDesign]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Loading Sentry data...
      </div>
    );
  }

  const selectedPointData = sentry?.critical_monitoring_points.find(
    (p) => p.id === selectedPoint
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sentry Mode</h2>
        <p className="text-gray-600 mt-1">
          In-service monitoring specification for Design {currentDesign}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 3D View with monitoring points */}
        <div className="col-span-2">
          <Card padding="none" className="h-[500px] overflow-hidden">
            {geometry && sentry ? (
              <Canvas camera={{ position: [0.6, 0.6, 0.8], fov: 50 }}>
                <Suspense fallback={null}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <TankModel
                    geometry={geometry}
                    showStress={false}
                    showWireframe={false}
                    showCrossSection={false}
                    autoRotate={false}
                  />
                  {sentry.critical_monitoring_points.map((point) => (
                    <MonitoringPoint
                      key={point.id}
                      point={point}
                      selected={selectedPoint === point.id}
                      onSelect={() => setSelectedPoint(point.id)}
                    />
                  ))}
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
        </div>

        {/* Monitoring Points List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Monitoring Points</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {sentry?.critical_monitoring_points.map((point) => (
                <button
                  key={point.id}
                  onClick={() => setSelectedPoint(point.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedPoint === point.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Eye size={16} className="text-red-500" />
                    Point {point.id}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {point.region.replace(/_/g, ' ')}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {selectedPointData && (
            <Card>
              <CardHeader>
                <CardTitle>Point {selectedPointData.id} Details</CardTitle>
              </CardHeader>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Region</dt>
                  <dd className="font-medium">{selectedPointData.region.replace(/_/g, ' ')}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Reason</dt>
                  <dd className="font-medium">{selectedPointData.reason}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Recommended Sensor</dt>
                  <dd className="font-medium capitalize">
                    {selectedPointData.recommended_sensor.replace(/_/g, ' ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Inspection Interval</dt>
                  <dd className="font-medium">{selectedPointData.inspection_interval_months} months</dd>
                </div>
              </dl>
            </Card>
          )}
        </div>
      </div>

      {/* Sensors and Schedule */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio size={20} />
              Recommended Sensors
            </CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {sentry?.recommended_sensors.map((sensor) => (
              <div
                key={sensor.type}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium capitalize">{sensor.type.replace(/_/g, ' ')}</div>
                  <div className="text-sm text-gray-500">{sensor.purpose}</div>
                </div>
                <div className="text-lg font-bold text-blue-600">×{sensor.count}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Inspection Schedule
            </CardTitle>
          </CardHeader>
          <dl className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <dt className="text-gray-600">Visual Inspection</dt>
              <dd className="font-medium">{sentry?.inspection_schedule.visual}</dd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <dt className="text-gray-600">Acoustic Monitoring</dt>
              <dd className="font-medium">{sentry?.inspection_schedule.acoustic_monitoring}</dd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <dt className="text-gray-600">Full Inspection</dt>
              <dd className="font-medium">{sentry?.inspection_schedule.full_inspection}</dd>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <dt className="text-yellow-700 flex items-center gap-2">
                <AlertTriangle size={16} />
                Replacement Trigger
              </dt>
              <dd className="font-medium text-yellow-700 text-sm">
                {sentry?.inspection_schedule.replacement_trigger}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
