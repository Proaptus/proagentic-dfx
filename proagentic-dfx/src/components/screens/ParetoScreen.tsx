'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { getOptimizationResults } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ParetoDesign } from '@/lib/types';
import { CheckCircle, ArrowRight, Info } from 'lucide-react';
import { ParetoChart } from '@/components/charts/ParetoChart';

type XMetric = 'weight_kg' | 'cost_eur' | 'p_failure' | 'fatigue_life_cycles' | 'permeation_rate';
type YMetric = 'weight_kg' | 'cost_eur' | 'p_failure' | 'burst_pressure_bar' | 'burst_ratio' | 'volumetric_efficiency';

export function ParetoScreen() {
  const {
    paretoFront,
    setParetoFront,
    selectedDesigns,
    toggleDesign,
    setCurrentDesign,
    setScreen,
    optimizationJob,
  } = useAppStore();

  const [xMetric, setXMetric] = useState<XMetric>('weight_kg');
  const [yMetric, setYMetric] = useState<YMetric>('cost_eur');
  const [loading, setLoading] = useState(false);

  // Load Pareto data if not already loaded
  useEffect(() => {
    if (paretoFront.length === 0) {
      setLoading(true);
      // Use optimization job ID from state, fallback to 'demo' for development
      const jobId = optimizationJob?.job_id || 'demo';
      getOptimizationResults(jobId)
        .then((results) => {
          const data = results as { pareto_front: ParetoDesign[] };
          setParetoFront(data.pareto_front);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [paretoFront.length, setParetoFront, optimizationJob]);

  const handleDotClick = (id: string) => {
    // Limit to 3 selections
    if (!selectedDesigns.includes(id) && selectedDesigns.length >= 3) {
      return; // Don't add more than 3
    }
    toggleDesign(id);
  };

  const handleViewDesign = (id: string) => {
    setCurrentDesign(id);
    setScreen('viewer');
  };

  const handleCompare = () => {
    if (selectedDesigns.length >= 2) {
      setScreen('compare');
    }
  };

  // Highlighted designs (categories)
  const highlights = paretoFront.filter((d) => d.trade_off_category);

  // Find recommended design
  const recommendedDesign = paretoFront.find(d => d.trade_off_category === 'recommended');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pareto Explorer</h2>
          <p className="text-gray-600 mt-1">
            Explore trade-offs between weight, cost, and reliability. Click points to select up to 3 designs for comparison.
          </p>
        </div>
        <div className="flex gap-2">
          {selectedDesigns.length > 0 && selectedDesigns.length < 2 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
              <Info size={16} />
              Select {2 - selectedDesigns.length} more design{2 - selectedDesigns.length > 1 ? 's' : ''} to compare
            </div>
          )}
          <Button onClick={handleCompare} disabled={selectedDesigns.length < 2}>
            Compare {selectedDesigns.length > 0 ? `(${selectedDesigns.length})` : ''} <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>

      {/* Axis Controls */}
      <Card padding="sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">X-Axis:</label>
            <select
              value={xMetric}
              onChange={(e) => setXMetric(e.target.value as XMetric)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="weight_kg">Weight (kg)</option>
              <option value="cost_eur">Cost (€)</option>
              <option value="p_failure">P(Failure)</option>
              <option value="fatigue_life_cycles">Fatigue Life (cycles)</option>
              <option value="permeation_rate">Permeation Rate</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Y-Axis:</label>
            <select
              value={yMetric}
              onChange={(e) => setYMetric(e.target.value as YMetric)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="cost_eur">Cost (€)</option>
              <option value="weight_kg">Weight (kg)</option>
              <option value="burst_pressure_bar">Burst Pressure (bar)</option>
              <option value="burst_ratio">Burst Ratio</option>
              <option value="p_failure">P(Failure)</option>
              <option value="volumetric_efficiency">Vol. Efficiency</option>
            </select>
          </div>
          <div className="flex-1" />
          {selectedDesigns.length > 0 && (
            <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              {selectedDesigns.length} / 3 selected
            </div>
          )}
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }} /> Lightest
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#06B6D4' }} /> Balanced
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B5CF6' }} /> Recommended
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#64748B' }} /> Conservative
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#A855F7' }} /> Max Margin
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }} /> Selected
            </span>
          </div>
        </div>
      </Card>

      {/* Chart - Full height visualization */}
      <Card padding="none" className="h-[600px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Loading Pareto data...
          </div>
        ) : (
          <div className="h-full w-full p-6">
            <ParetoChart
              designs={paretoFront}
              xAxis={xMetric}
              yAxis={yMetric}
              selectedIds={selectedDesigns}
              onSelect={handleDotClick}
              recommendedId={recommendedDesign?.id}
            />
          </div>
        )}
      </Card>

      {/* Highlighted Designs */}
      <div className="grid grid-cols-4 gap-4">
        {highlights.map((design) => (
          <Card
            key={design.id}
            className={`cursor-pointer transition-all ${
              selectedDesigns.includes(design.id)
                ? 'ring-2 ring-blue-500'
                : 'hover:shadow-md'
            }`}
            onClick={() => toggleDesign(design.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm font-medium px-2 py-0.5 rounded-full capitalize"
                style={{
                  backgroundColor:
                    design.trade_off_category === 'lightest'
                      ? '#D1FAE5'       // green-100
                      : design.trade_off_category === 'balanced'
                      ? '#CFFAFE'       // cyan-100
                      : design.trade_off_category === 'recommended'
                      ? '#EDE9FE'       // violet-100
                      : design.trade_off_category === 'conservative'
                      ? '#F1F5F9'       // slate-100
                      : design.trade_off_category === 'max_margin'
                      ? '#F3E8FF'       // purple-100
                      : '#F3F4F6',      // gray-100
                  color:
                    design.trade_off_category === 'lightest'
                      ? '#065F46'       // green-800
                      : design.trade_off_category === 'balanced'
                      ? '#155E75'       // cyan-800
                      : design.trade_off_category === 'recommended'
                      ? '#5B21B6'       // violet-800
                      : design.trade_off_category === 'conservative'
                      ? '#334155'       // slate-700
                      : design.trade_off_category === 'max_margin'
                      ? '#6B21A8'       // purple-800
                      : '#374151',      // gray-700
                }}
              >
                {design.trade_off_category?.replace(/_/g, ' ')}
              </span>
              {selectedDesigns.includes(design.id) && (
                <CheckCircle className="text-blue-500" size={18} />
              )}
            </div>
            <div className="text-lg font-bold mb-2">Design {design.id}</div>
            <dl className="text-sm space-y-1">
              <div className="flex justify-between">
                <dt className="text-gray-500">Weight:</dt>
                <dd className="font-medium">{design.weight_kg} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Cost:</dt>
                <dd className="font-medium">€{design.cost_eur.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Burst:</dt>
                <dd className="font-medium">{design.burst_pressure_bar} bar</dd>
              </div>
            </dl>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDesign(design.id);
              }}
            >
              View in 3D
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
