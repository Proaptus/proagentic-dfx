'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { getOptimizationResults } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import type { ParetoDesign } from '@/lib/types';
import { CheckCircle, ArrowRight, Info, Filter, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { ParetoChart } from '@/components/charts/ParetoChart';
import {
  type ParetoXMetric,
  type ParetoYMetric,
  X_AXIS_OPTIONS,
  Y_AXIS_OPTIONS,
  LEGEND_ITEMS,
  getCategoryColors,
  formatCategoryLabel,
  extractHighlightedDesigns,
  findRecommendedDesign,
} from '@/lib/charts/pareto-config';

const MAX_SELECTIONS = 3;
const MIN_COMPARE_DESIGNS = 2;

// ISSUE-014: Category filter options
type CategoryFilter = 'all' | 'lightweight' | 'economical' | 'balanced' | 'conservative' | 'max_margin';
const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'lightweight', label: 'Lightweight' },
  { value: 'economical', label: 'Economical' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'conservative', label: 'Conservative' },
  { value: 'max_margin', label: 'Max Margin' },
];

// ISSUE-015: Sorting options
type SortField = 'id' | 'weight_kg' | 'cost_eur' | 'burst_pressure_bar' | 'p_failure';
type SortDirection = 'asc' | 'desc';
const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'id', label: 'Design ID' },
  { value: 'weight_kg', label: 'Weight' },
  { value: 'cost_eur', label: 'Cost' },
  { value: 'burst_pressure_bar', label: 'Burst Pressure' },
  { value: 'p_failure', label: 'Reliability' },
];

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

  const [xMetric, setXMetric] = useState<ParetoXMetric>('weight_kg');
  const [yMetric, setYMetric] = useState<ParetoYMetric>('cost_eur');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ISSUE-014: Category filter state
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // ISSUE-015: Sorting state
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // ISSUE-018: Expandable cards state
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Load Pareto data if not already loaded
  useEffect(() => {
    if (paretoFront.length === 0) {
      setLoading(true);
      setError(null);
      // Use optimization job ID from state, fallback to 'demo' for development
      const jobId = optimizationJob?.job_id || 'demo';
      getOptimizationResults(jobId)
        .then((results) => {
          const data = results as { pareto_front: ParetoDesign[] };
          setParetoFront(data.pareto_front);
        })
        .catch((err) => {
          console.error('Failed to load Pareto data:', err);
          setError('Failed to load optimization results. Please try again.');
        })
        .finally(() => setLoading(false));
    }
  }, [paretoFront.length, setParetoFront, optimizationJob]);

  const handleDotClick = useCallback((id: string) => {
    // Limit to 3 selections
    if (!selectedDesigns.includes(id) && selectedDesigns.length >= MAX_SELECTIONS) {
      return; // Don't add more than 3
    }
    toggleDesign(id);
  }, [selectedDesigns, toggleDesign]);

  const handleViewDesign = useCallback((id: string) => {
    setCurrentDesign(id);
    setScreen('viewer');
  }, [setCurrentDesign, setScreen]);

  const handleCompare = useCallback(() => {
    if (selectedDesigns.length >= MIN_COMPARE_DESIGNS) {
      setScreen('compare');
    }
  }, [selectedDesigns.length, setScreen]);

  // ISSUE-014 & ISSUE-015: Filter and sort designs for cards
  const filteredAndSortedDesigns = useMemo(() => {
    let designs = [...paretoFront];

    // Apply category filter
    if (categoryFilter !== 'all') {
      designs = designs.filter(d => d.trade_off_category === categoryFilter);
    }

    // Apply sorting
    designs.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      if (sortField === 'id') {
        aVal = a.id;
        bVal = b.id;
      } else {
        aVal = a[sortField] as number;
        bVal = b[sortField] as number;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return designs;
  }, [paretoFront, categoryFilter, sortField, sortDirection]);

  // Memoized computed values
  const highlights = useMemo(() => extractHighlightedDesigns(paretoFront), [paretoFront]);
  const recommendedDesign = useMemo(() => findRecommendedDesign(paretoFront), [paretoFront]);
  const remainingSelections = useMemo(
    () => MIN_COMPARE_DESIGNS - selectedDesigns.length,
    [selectedDesigns.length]
  );
  const canCompare = useMemo(
    () => selectedDesigns.length >= MIN_COMPARE_DESIGNS,
    [selectedDesigns.length]
  );

  return (
    <div className="space-y-6">
      {/* Enterprise Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pareto Explorer</h1>
              <p className="text-gray-600 mt-2 max-w-3xl">
                Explore multi-objective trade-offs between weight, cost, and reliability.
                Visualize the Pareto frontier and select up to 3 optimal designs for detailed comparison.
              </p>
            </div>
            <div className="flex gap-3">
              {selectedDesigns.length > 0 && !canCompare && (
                <div
                  className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2.5 rounded-lg border border-blue-100"
                  role="status"
                  aria-live="polite"
                >
                  <Info size={16} aria-hidden="true" />
                  <span className="font-medium">
                    Select {remainingSelections} more design{remainingSelections > 1 ? 's' : ''} to enable comparison
                  </span>
                </div>
              )}
              <Button
                onClick={handleCompare}
                disabled={!canCompare}
                variant={canCompare ? "primary" : "secondary"}
                className="whitespace-nowrap"
                aria-label={`Compare ${selectedDesigns.length} selected designs`}
              >
                Compare Designs {selectedDesigns.length > 0 ? `(${selectedDesigns.length})` : ''}
                <ArrowRight className="ml-2" size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {/* Axis Controls Panel */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <label htmlFor="x-axis-select" className="text-sm font-semibold text-gray-700 min-w-[60px]">
                X-Axis:
              </label>
              <select
                id="x-axis-select"
                value={xMetric}
                onChange={(e) => setXMetric(e.target.value as ParetoXMetric)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                aria-label="Select X-axis metric"
              >
                {X_AXIS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="y-axis-select" className="text-sm font-semibold text-gray-700 min-w-[60px]">
                Y-Axis:
              </label>
              <select
                id="y-axis-select"
                value={yMetric}
                onChange={(e) => setYMetric(e.target.value as ParetoYMetric)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                aria-label="Select Y-axis metric"
              >
                {Y_AXIS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1" />
            {selectedDesigns.length > 0 && (
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200">
                {selectedDesigns.length} / 3 selected
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-6 text-sm flex-wrap" role="list" aria-label="Chart legend">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Legend:</span>
            {LEGEND_ITEMS.map((item) => (
              <span
                key={item.category}
                className={`flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border ${
                  item.category === 'selected' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
                role="listitem"
              >
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span className={`font-medium ${item.category === 'selected' ? 'text-blue-700' : 'text-gray-700'}`}>
                  {item.label}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Enterprise Chart Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-900">Pareto Frontier Visualization</h3>
          <p className="text-sm text-gray-600 mt-1">
            Interactive scatter plot showing optimal design trade-offs. Click any point to select for comparison.
          </p>
        </div>
        <div className="p-8 bg-gray-50" style={{ height: '640px' }}>
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" aria-hidden="true"></div>
              <p className="text-lg font-medium">Loading Pareto data...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-red-600" role="alert">
              <p className="text-lg font-medium mb-2">Error Loading Data</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          ) : (
            <div className="h-full w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
        </div>
      </div>

      {/* Enterprise Design Selection Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">All Pareto Designs</h3>
              <p className="text-sm text-gray-600 mt-1">
                Browse {filteredAndSortedDesigns.length} designs. Click to select or view in 3D.
              </p>
            </div>
            {/* ISSUE-014 & ISSUE-015: Filter and Sort Controls */}
            <div className="flex items-center gap-4">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" aria-hidden="true" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Filter by category"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <ArrowUpDown size={16} className="text-gray-500" aria-hidden="true" />
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Sort by field"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
                  aria-label={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
                >
                  {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-4 gap-4">
            {filteredAndSortedDesigns.map((design) => {
              const isSelected = selectedDesigns.includes(design.id);
              const colors = getCategoryColors(design.trade_off_category);

              return (
                <div
                  key={design.id}
                  className={`bg-white rounded-lg shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleDesign(design.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleDesign(design.id);
                    }
                  }}
                  aria-pressed={isSelected}
                  aria-label={`Select ${formatCategoryLabel(design.trade_off_category)} design ${design.id}`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                        }}
                      >
                        {formatCategoryLabel(design.trade_off_category)}
                      </span>
                    {isSelected && (
                      <CheckCircle className="text-blue-500" size={20} aria-hidden="true" />
                    )}
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-3">Design {design.id}</div>
                  <dl className="text-sm space-y-2 mb-3">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <dt className="text-gray-600 font-medium">Weight:</dt>
                      <dd className="font-semibold text-gray-900">{design.weight_kg} kg</dd>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <dt className="text-gray-600 font-medium">Cost:</dt>
                      <dd className="font-semibold text-gray-900">€{design.cost_eur.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <dt className="text-gray-600 font-medium">Burst:</dt>
                      <dd className="font-semibold text-gray-900">{design.burst_pressure_bar} bar</dd>
                    </div>
                  </dl>
                  {/* ISSUE-018: Expandable metrics section */}
                  {expandedCard === design.id && (
                    <dl className="text-sm space-y-2 mb-3 pt-2 border-t border-gray-200 bg-gray-50 -mx-4 px-4 pb-2">
                      <div className="flex justify-between items-center py-1">
                        <dt className="text-gray-600 text-xs">Burst Ratio:</dt>
                        <dd className="font-semibold text-gray-900 text-xs">{design.burst_ratio?.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <dt className="text-gray-600 text-xs">P(failure):</dt>
                        <dd className="font-mono font-semibold text-green-600 text-xs">{design.p_failure?.toExponential(1)}</dd>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <dt className="text-gray-600 text-xs">Fatigue Life:</dt>
                        <dd className="font-semibold text-gray-900 text-xs">{design.fatigue_life_cycles?.toLocaleString()} cyc</dd>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <dt className="text-gray-600 text-xs">Vol. Efficiency:</dt>
                        <dd className="font-semibold text-gray-900 text-xs">{(design.volumetric_efficiency * 100).toFixed(1)}%</dd>
                      </div>
                    </dl>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCard(expandedCard === design.id ? null : design.id);
                    }}
                    className="w-full text-xs text-blue-600 hover:text-blue-800 py-1 mb-2"
                    aria-expanded={expandedCard === design.id}
                  >
                    {expandedCard === design.id ? '▲ Less details' : '▼ More details'}
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDesign(design.id);
                    }}
                    aria-label={`View design ${design.id} in 3D viewer`}
                  >
                    View in 3D
                  </Button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
