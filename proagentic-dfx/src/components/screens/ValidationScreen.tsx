'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { LinearProgress } from '@/components/ui/Progress';
import { SurrogateConfidencePanel } from '@/components/validation/SurrogateConfidencePanel';
import { TestPlanPanel } from '@/components/validation/TestPlanPanel';
import { VerificationChecklist } from '@/components/validation/VerificationChecklist';
import { ValidationStatCard } from '@/components/validation/ValidationStatCard';
import { getDesignSentry } from '@/lib/api/client';
import { useAppStore } from '@/lib/stores/app-store';
import {
  Eye,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  BarChart3,
  TrendingUp,
  FlaskConical,
  Radio,
  ClipboardCheck,
  Calendar,
} from 'lucide-react';

interface SensorLocation {
  id: string;
  position: string;
  x: number;
  y: number;
  z: number;
  type: 'strain' | 'temperature' | 'acoustic';
  critical: boolean;
  inspection_interval_hours: number;
  rationale: string;
}

interface TestType {
  id: string;
  name: string;
  standard: string;
  articles: number;
  cycles?: number;
  pressure_range?: string;
  temp_range?: string;
  duration_days: number;
  cost_eur: number;
  critical: boolean;
}

// Mock test plan data for certification
const DEFAULT_TEST_PLAN: TestType[] = [
  {
    id: 'burst',
    name: 'Burst Test',
    standard: 'UN R134 / ISO 19881',
    articles: 3,
    pressure_range: '1575-2100 bar',
    duration_days: 5,
    cost_eur: 25000,
    critical: true,
  },
  {
    id: 'cycle',
    name: 'Pressure Cycling',
    standard: 'UN R134 §6.2.4',
    articles: 3,
    cycles: 22000,
    pressure_range: '2-700 bar',
    duration_days: 45,
    cost_eur: 35000,
    critical: true,
  },
  {
    id: 'permeation',
    name: 'Permeation Test',
    standard: 'ISO 19881 Annex B',
    articles: 2,
    temp_range: '15-85°C',
    duration_days: 14,
    cost_eur: 18000,
    critical: true,
  },
  {
    id: 'thermal',
    name: 'Extreme Temperature',
    standard: 'UN R134 §6.2.6',
    articles: 2,
    temp_range: '-40 to +85°C',
    duration_days: 7,
    cost_eur: 12000,
    critical: true,
  },
  {
    id: 'fire',
    name: 'Bonfire Test',
    standard: 'UN R134 §6.2.8',
    articles: 1,
    duration_days: 1,
    cost_eur: 20000,
    critical: true,
  },
  {
    id: 'drop',
    name: 'Drop Test',
    standard: 'UN R134 §6.2.9',
    articles: 2,
    duration_days: 3,
    cost_eur: 8000,
    critical: false,
  },
  {
    id: 'fatigue',
    name: 'Accelerated Stress Rupture',
    standard: 'ISO 11119-3',
    articles: 3,
    temp_range: '65°C sustained',
    duration_days: 1000,
    cost_eur: 45000,
    critical: true,
  },
  {
    id: 'impact',
    name: 'Ballistic Impact',
    standard: 'UN R134 §6.2.10',
    articles: 1,
    duration_days: 2,
    cost_eur: 15000,
    critical: false,
  },
];

interface InspectionScheduleItem {
  interval: string;
  checks: string;
  duration_min: number;
}

interface ValidationStats {
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  completionRate: number;
  lastRun: string;
}

type ValidationTab = 'surrogate' | 'testing' | 'sentry' | 'verification';

interface ValidationScreenProps {
  sensorLocations?: SensorLocation[];
  inspectionSchedule?: InspectionScheduleItem[];
  validationStats?: ValidationStats;
  onRunTests?: () => void;
}

export function ValidationScreen({
  sensorLocations: propSensorLocations = [],
  inspectionSchedule: propInspectionSchedule = [],
  validationStats: propValidationStats,
  onRunTests,
}: ValidationScreenProps) {
  const [activeTab, setActiveTab] = useState<ValidationTab>('surrogate');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const { currentDesign } = useAppStore();

  // State for fetched sentry data
  const [fetchedSensorLocations, setFetchedSensorLocations] = useState<SensorLocation[]>([]);
  const [fetchedInspectionSchedule, setFetchedInspectionSchedule] = useState<InspectionScheduleItem[]>([]);

  // Fetch sentry data when component mounts or design changes
  useEffect(() => {
    const fetchSentryData = async () => {
      const designId = currentDesign || 'C';
      try {
        const data = await getDesignSentry(designId) as {
          sensor_locations?: SensorLocation[];
          inspection_schedule?: InspectionScheduleItem[];
        };
        if (data.sensor_locations) {
          setFetchedSensorLocations(data.sensor_locations);
        }
        if (data.inspection_schedule) {
          setFetchedInspectionSchedule(data.inspection_schedule);
        }
      } catch (error) {
        console.error('Failed to fetch sentry data:', error);
      }
    };

    fetchSentryData();
  }, [currentDesign]);

  // Use prop data if provided, otherwise use fetched data
  const sensorLocations = propSensorLocations.length > 0 ? propSensorLocations : fetchedSensorLocations;
  const inspectionSchedule = propInspectionSchedule.length > 0 ? propInspectionSchedule : fetchedInspectionSchedule;

  // Use provided stats or fallback to defaults
  // TODO: Remove default mock data once API integration is complete
  const validationStats: ValidationStats = propValidationStats ?? {
    totalTests: 42,
    passed: 38,
    failed: 2,
    warnings: 2,
    completionRate: 90,
    lastRun: '2025-01-15 14:32:00',
  };

  const handleRunTests = useCallback(() => {
    if (onRunTests) {
      onRunTests();
    }
    setIsRunningTests(true);
    // Simulate test execution
    setTimeout(() => setIsRunningTests(false), 2000);
  }, [onRunTests]);

  // Memoize progress status calculation
  const progressStatus = useMemo(() => {
    const rate = validationStats.completionRate;
    if (rate === 100) return { variant: 'success' as const, badge: 'pass' as const };
    if (rate >= 80) return { variant: 'warning' as const, badge: 'warning' as const };
    return { variant: 'error' as const, badge: 'fail' as const };
  }, [validationStats.completionRate]);

  // Memoize formatted date
  const formattedDate = useMemo(() => {
    const date = new Date(validationStats.lastRun);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  }, [validationStats.lastRun]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Design Validation</h1>
          <p className="text-gray-500 mt-1">Design {currentDesign || 'C'}</p>
        </div>
        <Button
          onClick={handleRunTests}
          disabled={isRunningTests}
          variant="outline"
        >
          <Play size={16} className="mr-2" />
          {isRunningTests ? 'Running...' : 'Run Tests'}
        </Button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ValidationStatCard
          label="Total Tests"
          value={validationStats.totalTests}
          icon={BarChart3}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <ValidationStatCard
          label="Passed"
          value={validationStats.passed}
          icon={CheckCircle2}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          valueColor="text-green-600"
        />
        <ValidationStatCard
          label="Failed"
          value={validationStats.failed}
          icon={XCircle}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          valueColor="text-red-600"
        />
        <ValidationStatCard
          label="Warnings"
          value={validationStats.warnings}
          icon={AlertTriangle}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          valueColor="text-yellow-600"
        />
        <ValidationStatCard
          label="Last Run"
          value={formattedDate.date}
          sublabel={formattedDate.time}
          icon={Clock}
          iconBgColor="bg-gray-100"
          iconColor="text-gray-600"
        />
      </div>

      {/* Overall Progress */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Validation Progress</h3>
            <StatusBadge status={progressStatus.badge}>
              {validationStats.completionRate}% Complete
            </StatusBadge>
          </div>
          <LinearProgress
            value={validationStats.completionRate}
            variant={progressStatus.variant}
            size="lg"
          />
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-gray-600">
                {validationStats.passed} Passed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-gray-600">
                {validationStats.failed} Failed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              <span className="text-gray-600">
                {validationStats.warnings} Warnings
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6" role="tablist" aria-label="Validation tabs">
          <button
            role="tab"
            aria-selected={activeTab === 'surrogate'}
            aria-controls="surrogate-panel"
            id="surrogate-tab"
            onClick={() => setActiveTab('surrogate')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'surrogate'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Surrogate Confidence
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'testing'}
            aria-controls="testing-panel"
            id="testing-tab"
            onClick={() => setActiveTab('testing')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'testing'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Test Plan
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'sentry'}
            aria-controls="sentry-panel"
            id="sentry-tab"
            onClick={() => setActiveTab('sentry')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'sentry'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sentry Monitoring
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'verification'}
            aria-controls="verification-panel"
            id="verification-tab"
            onClick={() => setActiveTab('verification')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'verification'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Verification Checklist
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div
        role="tabpanel"
        id="surrogate-panel"
        aria-labelledby="surrogate-tab"
        hidden={activeTab !== 'surrogate'}
      >
        {activeTab === 'surrogate' && <SurrogateConfidencePanel />}
      </div>

      <div
        role="tabpanel"
        id="testing-panel"
        aria-labelledby="testing-tab"
        hidden={activeTab !== 'testing'}
      >
        {activeTab === 'testing' && <TestPlanPanel testPlan={DEFAULT_TEST_PLAN} />}
      </div>

      <div
        role="tabpanel"
        id="sentry-panel"
        aria-labelledby="sentry-tab"
        hidden={activeTab !== 'sentry'}
      >
        {activeTab === 'sentry' && (
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
        )}
      </div>

      <div
        role="tabpanel"
        id="verification-panel"
        aria-labelledby="verification-tab"
        hidden={activeTab !== 'verification'}
      >
        {activeTab === 'verification' && <VerificationChecklist />}
      </div>
    </div>
  );
}
