'use client';

/**
 * AnalysisScreen Component
 * REQ-120 to REQ-160: Comprehensive engineering analysis and validation
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import {
  getDesignStress,
  getDesignFailure,
  getDesignThermal,
  getDesignReliability,
  getDesignCost,
} from '@/lib/api/client';
import type {
  DesignStress,
  DesignFailure,
  DesignThermal,
  DesignReliability,
  DesignCost,
} from '@/lib/types';
import { Activity, AlertTriangle, Thermometer, BarChart3, DollarSign, BookOpen } from 'lucide-react';
import {
  StressAnalysisPanel,
  FailureAnalysisPanel,
  ThermalAnalysisPanel,
  ReliabilityPanel,
  CostAnalysisPanel,
  PhysicsEquationsPanel,
} from '@/components/analysis';
import { StatCard } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';

type Tab = 'stress' | 'failure' | 'thermal' | 'reliability' | 'cost' | 'physics';

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ReactNode;
}

interface KeyMetrics {
  maxStress: number;
  safetyMargin: number;
  reliability: string;
  totalCost: string;
  thermalStatus: 'Pass' | 'Fail' | 'N/A';
  maxTemperature: number;
}

export function AnalysisScreen() {
  const { currentDesign, setCurrentDesign, analysisTab, setAnalysisTab, paretoFront } = useAppStore();

  const [stress, setStress] = useState<DesignStress | null>(null);
  const [failure, setFailure] = useState<DesignFailure | null>(null);
  const [thermal, setThermal] = useState<DesignThermal | null>(null);
  const [reliability, setReliability] = useState<DesignReliability | null>(null);
  const [cost, setCost] = useState<DesignCost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to recommended design from Pareto front, or first available
  useEffect(() => {
    if (!currentDesign && paretoFront.length > 0) {
      const recommended = paretoFront.find(d => d.trade_off_category === 'recommended');
      const defaultId = recommended?.id || paretoFront[0]?.id;
      if (defaultId) setCurrentDesign(defaultId);
    } else if (!currentDesign) {
      // Fallback if Pareto not loaded yet
      setCurrentDesign('C');
    }
  }, [currentDesign, setCurrentDesign, paretoFront]);

  // Load data based on active tab
  useEffect(() => {
    if (!currentDesign) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        switch (analysisTab) {
          case 'stress': {
            const data = await getDesignStress(currentDesign);
            setStress(data as DesignStress);
            break;
          }
          case 'failure': {
            const data = await getDesignFailure(currentDesign);
            setFailure(data as DesignFailure);
            break;
          }
          case 'thermal': {
            const data = await getDesignThermal(currentDesign);
            setThermal(data as DesignThermal);
            break;
          }
          case 'reliability': {
            const data = await getDesignReliability(currentDesign);
            setReliability(data as DesignReliability);
            break;
          }
          case 'cost': {
            const data = await getDesignCost(currentDesign);
            setCost(data as DesignCost);
            break;
          }
          case 'physics':
            // Physics panel doesn't require data loading
            break;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load analysis data';
        setError(errorMessage);
        console.error('Analysis data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentDesign, analysisTab]);

  // Memoized tab configuration
  const tabs = useMemo<TabConfig[]>(
    () => [
      { id: 'stress', label: 'Stress', icon: <Activity size={18} aria-hidden="true" /> },
      { id: 'failure', label: 'Failure', icon: <AlertTriangle size={18} aria-hidden="true" /> },
      { id: 'thermal', label: 'Thermal', icon: <Thermometer size={18} aria-hidden="true" /> },
      { id: 'reliability', label: 'Reliability', icon: <BarChart3 size={18} aria-hidden="true" /> },
      { id: 'cost', label: 'Cost', icon: <DollarSign size={18} aria-hidden="true" /> },
      { id: 'physics', label: 'Physics & Equations', icon: <BookOpen size={18} aria-hidden="true" /> },
    ],
    []
  );

  // Memoized tab change handler
  const handleTabChange = useCallback(
    (tabId: Tab) => {
      setAnalysisTab(tabId);
    },
    [setAnalysisTab]
  );

  // Render tab content based on active tab
  const renderTabContent = useCallback(() => {
    if (loading) {
      return (
        <div
          className="h-96 flex items-center justify-center text-gray-500"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            <span>Loading analysis data...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className="h-96 flex items-center justify-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Data</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      );
    }

    switch (analysisTab) {
      case 'stress':
        return stress ? <StressAnalysisPanel data={stress} /> : null;
      case 'failure':
        return failure ? <FailureAnalysisPanel data={failure} /> : null;
      case 'thermal':
        return thermal ? <ThermalAnalysisPanel data={thermal} /> : null;
      case 'reliability':
        return reliability ? <ReliabilityPanel data={reliability} /> : null;
      case 'cost':
        return cost ? <CostAnalysisPanel data={cost} /> : null;
      case 'physics':
        return <PhysicsEquationsPanel />;
      default:
        return null;
    }
  }, [loading, error, analysisTab, stress, failure, thermal, reliability, cost]);

  // Calculate key metrics for stat cards - memoized to prevent unnecessary recalculations
  const keyMetrics = useMemo<KeyMetrics>(() => {
    const maxStress = stress?.max_stress.value_mpa ?? 0;
    const safetyMargin = stress?.max_stress.margin_percent ?? 0;

    // Calculate MTBF in years from p_failure
    // MTBF (hours) ≈ 1 / (p_failure * cycles_per_year)
    // Assuming ~100 cycles per year for hydrogen refueling
    const pFailure = reliability?.monte_carlo.p_failure;
    const reliabilityYears = pFailure && pFailure > 0
      ? `${(1 / (pFailure * 100) / 8760).toFixed(1)} years`
      : 'N/A';

    const totalCost = cost?.unit_cost_eur
      ? `€${cost.unit_cost_eur.toLocaleString()}`
      : 'N/A';

    const thermalStatus: 'Pass' | 'Fail' | 'N/A' = thermal?.fast_fill.status
      ? thermal.fast_fill.status === 'pass'
        ? 'Pass'
        : 'Fail'
      : 'N/A';

    const maxTemperature = thermal?.fast_fill.peak_wall_temp_c ?? 0;

    return {
      maxStress,
      safetyMargin,
      reliability: reliabilityYears,
      totalCost,
      thermalStatus,
      maxTemperature,
    };
  }, [stress, thermal, reliability, cost]);

  // Determine safety margin badge variant
  const getSafetyMarginBadge = useCallback(() => {
    const { safetyMargin } = keyMetrics;
    if (safetyMargin <= 0) return null;

    const variant = safetyMargin > 20 ? 'success' : safetyMargin > 10 ? 'warning' : 'error';
    return (
      <Badge variant={variant} size="sm">
        +{safetyMargin}%
      </Badge>
    );
  }, [keyMetrics]);

  // Determine thermal status badge
  const getThermalStatusBadge = useCallback(() => {
    const { thermalStatus } = keyMetrics;
    if (thermalStatus === 'N/A') return null;

    const variant = thermalStatus === 'Pass' ? 'success' : 'error';
    return (
      <Badge variant={variant} size="sm">
        {thermalStatus}
      </Badge>
    );
  }, [keyMetrics]);

  return (
    <div className="space-y-6">
      {/* Professional Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analysis Dashboard</h1>
            <p className="text-gray-500 text-sm mt-2">
              Comprehensive engineering analysis and validation for Design {currentDesign}
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200"
            role="status"
            aria-label={`Currently analyzing design ${currentDesign}`}
          >
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" aria-hidden="true" />
            <span className="text-sm font-medium text-blue-700">Active Design: {currentDesign}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          iconColor="blue"
          value={keyMetrics.maxStress > 0 ? keyMetrics.maxStress : '--'}
          unit="MPa"
          label="Maximum Stress"
          badge={getSafetyMarginBadge()}
        />

        <StatCard
          icon={BarChart3}
          iconColor="green"
          value={keyMetrics.reliability}
          label="MTBF (Mean Time Before Failure)"
        />

        <StatCard
          icon={Thermometer}
          iconColor="orange"
          value={keyMetrics.maxTemperature || '--'}
          unit="°C"
          label="Maximum Temperature"
          badge={getThermalStatusBadge()}
        />

        <StatCard
          icon={DollarSign}
          iconColor="purple"
          value={keyMetrics.totalCost}
          label="Total Manufacturing Cost"
        />
      </div>

      {/* Professional Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
          <h3 className="text-sm font-semibold text-gray-700">Analysis Modules</h3>
        </div>
        <div className="border-b border-gray-200">
          <nav
            className="flex gap-2 px-4 py-2"
            role="tablist"
            aria-label="Analysis module tabs"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  analysisTab === tab.id
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                role="tab"
                aria-selected={analysisTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                tabIndex={analysisTab === tab.id ? 0 : -1}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content in Elevated Card */}
        <div className="p-6 bg-gray-50">
          <div
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            role="tabpanel"
            id={`${analysisTab}-panel`}
            aria-labelledby={`${analysisTab}-tab`}
          >
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
