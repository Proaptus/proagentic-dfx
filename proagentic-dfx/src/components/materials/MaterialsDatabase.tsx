/**
 * MaterialsDatabase Component
 * REQ-011 to REQ-015: Full materials database interface
 * REQ-272: Component library with consistent styling
 */

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Search, SortAsc, SortDesc, Plus, X, Loader2 } from 'lucide-react';
import {
  fetchAllMaterials,
  type MaterialProperties,
} from '@/lib/data/materials';
import { MaterialPropertyCard } from './MaterialPropertyCard';
import { MaterialComparisonTable } from './MaterialComparisonTable';

type TabId = 'fibers' | 'matrices' | 'liners' | 'bosses';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export function MaterialsDatabase() {
  const [activeTab, setActiveTab] = useState<TabId>('fibers');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialProperties[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'comparison'>('grid');
  const [allMaterials, setAllMaterials] = useState<MaterialProperties[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch materials from API on mount
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const materials = await fetchAllMaterials();
        setAllMaterials(materials);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load materials');
        console.error('Error loading materials:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMaterials();
  }, []);

  const getMaterialsForTab = useCallback((tab: TabId) => {
    switch (tab) {
      case 'fibers':
        return allMaterials.filter((m) => m.category === 'fiber');
      case 'matrices':
        return allMaterials.filter((m) => m.category === 'matrix');
      case 'liners':
        return allMaterials.filter((m) => m.category === 'liner');
      case 'bosses':
        return allMaterials.filter((m) => m.category === 'boss');
    }
  }, [allMaterials]);

  const filteredAndSortedMaterials = useMemo(() => {
    let materials: MaterialProperties[] = getMaterialsForTab(activeTab) ?? [];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      materials = materials.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          ('manufacturer' in m && (m as { manufacturer?: string }).manufacturer?.toLowerCase().includes(query)) ||
          m.id.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortConfig) {
      materials = [...materials].sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aValue = (a as any)[sortConfig.key];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bValue = (b as any)[sortConfig.key];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return 0;
      });
    }

    return materials;
  }, [activeTab, searchQuery, sortConfig, getMaterialsForTab]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'desc' };
      }
      if (current.direction === 'desc') {
        return { key, direction: 'asc' };
      }
      return null;
    });
  };

  const toggleMaterialSelection = (material: MaterialProperties) => {
    setSelectedMaterials((current) => {
      const exists = current.find((m) => m.id === material.id);
      if (exists) {
        return current.filter((m) => m.id !== material.id);
      }
      return [...current, material];
    });
  };

  const clearSelection = () => {
    setSelectedMaterials([]);
  };

  const tabs = [
    { id: 'fibers' as TabId, label: 'Fibers', count: allMaterials.filter((m) => m.category === 'fiber').length },
    { id: 'matrices' as TabId, label: 'Matrices', count: allMaterials.filter((m) => m.category === 'matrix').length },
    { id: 'liners' as TabId, label: 'Liners', count: allMaterials.filter((m) => m.category === 'liner').length },
    { id: 'bosses' as TabId, label: 'Bosses', count: allMaterials.filter((m) => m.category === 'boss').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Materials Database</h2>
        <p className="text-gray-600 mt-1">
          Comprehensive material properties for Type 4 hydrogen tank design
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
            <span className="text-gray-600">Loading materials database...</span>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 font-medium">Error loading materials</p>
            <p className="text-gray-600 mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery('');
              setSortConfig(null);
              clearSelection();
            }}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('comparison')}
            disabled={selectedMaterials.length === 0}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'comparison'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            Comparison ({selectedMaterials.length})
          </button>
        </div>
      </div>

      {/* Selected Materials Bar */}
      {selectedMaterials.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">
                Selected for comparison:
              </span>
              {selectedMaterials.map((material) => (
                <span
                  key={material.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {material.name}
                  <button
                    onClick={() => toggleMaterialSelection(material)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={clearSelection}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all
            </button>
          </div>
        </Card>
      )}

      {/* Sort Controls */}
      {viewMode === 'grid' && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-gray-600 py-2">Sort by:</span>
          {activeTab === 'fibers' && (
            <>
              <SortButton
                label="E₁"
                sortKey="E1"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortButton
                label="Strength"
                sortKey="Xt"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortButton
                label="Density"
                sortKey="density"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortButton
                label="Cost"
                sortKey="cost_per_kg"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </>
          )}
          {activeTab === 'matrices' && (
            <>
              <SortButton
                label="Modulus"
                sortKey="E"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortButton
                label="Tg"
                sortKey="glass_transition_temp"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortButton
                label="Cost"
                sortKey="cost_per_kg"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </>
          )}
          {activeTab === 'liners' && (
            <>
              <SortButton
                label="Permeation"
                sortKey="h2_permeation"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortButton
                label="Strength"
                sortKey="tensile_strength"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortButton
                label="Cost"
                sortKey="cost_per_kg"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </>
          )}
          {activeTab === 'bosses' && (
            <>
              <SortButton
                label="Yield Strength"
                sortKey="yield_strength"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortButton
                label="Density"
                sortKey="density"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortButton
                label="Cost"
                sortKey="cost_per_kg"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </>
          )}
        </div>
      )}

      {/* Content */}
      {viewMode === 'grid' ? (
        <>
          {filteredAndSortedMaterials.length === 0 ? (
            <Card>
              <div className="text-center py-12 text-gray-500">
                No materials found matching &quot;{searchQuery}&quot;
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedMaterials.map((material) => (
                <div key={material.id} className="relative">
                  <button
                    onClick={() => toggleMaterialSelection(material)}
                    className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all ${
                      selectedMaterials.find((m) => m.id === material.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title={
                      selectedMaterials.find((m) => m.id === material.id)
                        ? 'Remove from comparison'
                        : 'Add to comparison'
                    }
                  >
                    {selectedMaterials.find((m) => m.id === material.id) ? (
                      <X size={16} />
                    ) : (
                      <Plus size={16} />
                    )}
                  </button>
                  <MaterialPropertyCard material={material} />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <MaterialComparisonTable materials={selectedMaterials} />
      )}

      {/* Summary Stats */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-500">Total Materials</div>
            <div className="text-2xl font-bold text-gray-900">
              {allMaterials.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Fibers</div>
            <div className="text-2xl font-bold text-blue-600">
              {allMaterials.filter((m) => m.category === 'fiber').length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Matrix Resins</div>
            <div className="text-2xl font-bold text-green-600">
              {allMaterials.filter((m) => m.category === 'matrix').length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Liner Materials</div>
            <div className="text-2xl font-bold text-purple-600">
              {allMaterials.filter((m) => m.category === 'liner').length}
            </div>
          </div>
        </div>
      </Card>
        </>
      )}
    </div>
  );
}

function SortButton({
  label,
  sortKey,
  sortConfig,
  onSort,
}: {
  label: string;
  sortKey: string;
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
}) {
  const isActive = sortConfig?.key === sortKey;
  const direction = sortConfig?.direction;

  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
      {isActive &&
        (direction === 'desc' ? (
          <SortDesc size={14} />
        ) : (
          <SortAsc size={14} />
        ))}
    </button>
  );
}
