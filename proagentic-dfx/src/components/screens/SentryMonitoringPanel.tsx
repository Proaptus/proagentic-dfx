'use client';

/**
 * Sentry Monitoring Panel Component
 * Displays sensor locations and inspection schedule
 */

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import {
  Eye,
  MapPin,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import type { SensorLocation, InspectionScheduleItem } from './validation-screen.types';

interface SentryMonitoringPanelProps {
  sensorLocations: SensorLocation[];
  inspectionSchedule: InspectionScheduleItem[];
}

export function SentryMonitoringPanel({
  sensorLocations,
  inspectionSchedule,
}: SentryMonitoringPanelProps) {
  return (
    <div className="space-y-6">
      {/* Sensor Locations */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin size={20} className="text-red-600" />
            Recommended Sensor Locations
          </CardTitle>
        </CardHeader>
        <div className="p-6 space-y-6">
          {/* 3D Visualization Placeholder */}
          <div className="border-2 border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <Eye size={48} className="mx-auto text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-700">3D Tank Model with Sensor Markers</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Interactive 3D view showing recommended sensor placement locations
                </p>
              </div>
              <div className="flex gap-4 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">Critical Sensors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">Standard Sensors</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Sensor Specifications</h4>
              <StatusBadge status="pass">
                {sensorLocations.length} Sensors Configured
              </StatusBadge>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Location</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">Coordinates</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Inspection Interval</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sensorLocations.map((sensor) => (
                    <tr key={sensor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {sensor.critical && (
                            <AlertTriangle size={16} className="text-red-600" />
                          )}
                          <span className={sensor.critical ? 'font-semibold text-gray-900' : 'text-gray-700'}>
                            {sensor.position}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            sensor.type === 'strain'
                              ? 'pass'
                              : sensor.type === 'temperature'
                              ? 'warning'
                              : 'pending'
                          }
                        >
                          {sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700">
                          ({sensor.x}, {sensor.y}, {sensor.z})
                        </code>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {sensor.inspection_interval_hours}h
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm max-w-md">
                        {sensor.rationale}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

      {/* Inspection Schedule */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} className="text-green-600" />
            Inspection Schedule
          </CardTitle>
        </CardHeader>
        <div className="p-6">
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Interval</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Required Checks</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inspectionSchedule.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{item.interval}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.checks}</td>
                    <td className="px-6 py-4 text-right">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">
                        {item.duration_min} min
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 p-2 rounded-lg mt-0.5">
                <CheckCircle2 className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-3">Damage Tolerance Considerations</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <span>Tank designed with leak-before-burst failure mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <span>Acoustic emission sensors detect crack propagation early</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <span>Strain gauges provide real-time structural health monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <span>Conservative inspection intervals account for harsh operating environment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <span>Pressure vessel remains safe with single sensor failure (redundancy)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
