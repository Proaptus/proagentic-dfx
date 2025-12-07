'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { getDesignSentry, getDesignGeometry } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import type { DesignGeometry } from '@/lib/types';
import { Eye, Radio, AlertTriangle, Calendar, MapPin } from 'lucide-react';

// Dynamic import for CAD viewer (client-side only)
const CADTankViewer = lazy(() => import('@/components/cad/CADTankViewer'));

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
        {/* 3D View with CAD viewer */}
        <div className="col-span-2">
          <Card padding="none" className="h-[500px] overflow-hidden">
            {geometry ? (
              <Suspense fallback={
                <div className="h-full flex items-center justify-center text-gray-500">
                  Loading CAD viewer...
                </div>
              }>
                <CADTankViewer
                  geometry={geometry}
                  showStress={false}
                  showWireframe={false}
                  showCrossSection={false}
                  autoRotate={false}
                  showLiner={true}
                  layerOpacity={0.8}
                />
              </Suspense>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No geometry data
              </div>
            )}
          </Card>

          {/* Monitoring Points List */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={18} />
                Critical Monitoring Points
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-3 gap-3">
              {sentry?.critical_monitoring_points.map((point) => (
                <button
                  key={point.id}
                  onClick={() => setSelectedPoint(point.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedPoint === point.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedPoint === point.id ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium text-gray-900">Point {point.id}</span>
                  </div>
                  <div className="text-xs text-gray-600 capitalize">
                    {point.region.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Z: {point.location.z}mm
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Point Details */}
          {selectedPointData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye size={18} />
                  Point {selectedPointData.id} Details
                </CardTitle>
              </CardHeader>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Location</dt>
                  <dd className="font-medium capitalize">
                    {selectedPointData.region.replace(/_/g, ' ')}
                  </dd>
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
                  <dd className="font-medium">
                    {selectedPointData.inspection_interval_months} months
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Coordinates</dt>
                  <dd className="font-mono text-xs">
                    R: {selectedPointData.location.r}mm, Z: {selectedPointData.location.z}mm
                  </dd>
                </div>
              </dl>
            </Card>
          )}

          {/* Recommended Sensors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio size={18} />
                Recommended Sensors
              </CardTitle>
            </CardHeader>
            <ul className="space-y-3">
              {sentry?.recommended_sensors.map((sensor, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium flex-shrink-0">
                    {sensor.count}
                  </div>
                  <div>
                    <div className="font-medium capitalize">
                      {sensor.type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-gray-500 text-xs">{sensor.purpose}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Inspection Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={18} />
                Inspection Schedule
              </CardTitle>
            </CardHeader>
            {sentry?.inspection_schedule && (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Visual</dt>
                  <dd className="font-medium">{sentry.inspection_schedule.visual}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Acoustic</dt>
                  <dd className="font-medium">
                    {sentry.inspection_schedule.acoustic_monitoring}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Full Inspection</dt>
                  <dd className="font-medium">
                    {sentry.inspection_schedule.full_inspection}
                  </dd>
                </div>
              </dl>
            )}
          </Card>

          {/* Warning */}
          <Card className="bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
              <div className="text-sm">
                <div className="font-medium text-amber-800">Replacement Trigger</div>
                <div className="text-amber-700 mt-1">
                  {sentry?.inspection_schedule?.replacement_trigger || 'As per manufacturer guidelines'}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
