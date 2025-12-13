/**
 * Search Index Builder
 * Creates searchable index from app state for Global Search
 *
 * Indexes:
 * - Requirements fields (volume, pressure, weight, cost, etc.)
 * - Materials (from mock server response)
 * - Designs (Pareto front designs)
 * - Screens (navigation)
 */

import type { ParsedRequirements, ParetoDesign, Screen } from '@/lib/types';

export interface SearchResult {
  id: string;
  type: 'requirement' | 'material' | 'design' | 'screen' | 'action';
  title: string;
  description?: string;
  category: string;
  keywords: string[];
  action: () => void;
  icon?: string;
}

// Screen metadata for search
const SCREEN_METADATA: Record<Screen, { title: string; description: string; keywords: string[] }> = {
  requirements: {
    title: 'Requirements',
    description: 'Define project requirements and constraints',
    keywords: ['requirements', 'specs', 'input', 'constraints', 'volume', 'pressure'],
  },
  pareto: {
    title: 'Pareto Explorer',
    description: 'Explore optimization results and trade-offs',
    keywords: ['pareto', 'optimization', 'trade-off', 'results', 'designs'],
  },
  viewer: {
    title: '3D Viewer',
    description: 'Visualize tank geometry and layers',
    keywords: ['3d', 'viewer', 'visualization', 'geometry', 'cad', 'model'],
  },
  compare: {
    title: 'Compare Designs',
    description: 'Side-by-side design comparison',
    keywords: ['compare', 'comparison', 'designs', 'radar', 'metrics'],
  },
  analysis: {
    title: 'Analysis',
    description: 'Detailed stress, failure, and thermal analysis',
    keywords: ['analysis', 'stress', 'failure', 'thermal', 'reliability', 'cost'],
  },
  compliance: {
    title: 'Compliance',
    description: 'Standards compliance verification',
    keywords: ['compliance', 'standards', 'certification', 'regulations'],
  },
  validation: {
    title: 'Validation',
    description: 'Design validation and verification',
    keywords: ['validation', 'verification', 'testing', 'v&v'],
  },
  export: {
    title: 'Export',
    description: 'Export designs and reports',
    keywords: ['export', 'download', 'report', 'cad', 'pdf'],
  },
  sentry: {
    title: 'Sentry Mode',
    description: 'Real-time monitoring dashboard',
    keywords: ['sentry', 'monitoring', 'dashboard', 'live'],
  },
};

/**
 * Build search index from requirements
 */
export function indexRequirements(
  requirements: ParsedRequirements | null,
  navigateToRequirements: () => void
): SearchResult[] {
  if (!requirements) return [];

  const results: SearchResult[] = [];

  // Index each requirement field
  const fields: Array<{ key: keyof ParsedRequirements; label: string; unit: string }> = [
    { key: 'internal_volume_liters', label: 'Internal Volume', unit: 'L' },
    { key: 'working_pressure_bar', label: 'Working Pressure', unit: 'bar' },
    { key: 'target_weight_kg', label: 'Target Weight', unit: 'kg' },
    { key: 'target_cost_eur', label: 'Target Cost', unit: '€' },
    { key: 'min_burst_ratio', label: 'Min Burst Ratio', unit: '' },
    { key: 'max_permeation_rate', label: 'Max Permeation Rate', unit: 'NmL/h/L' },
    { key: 'operating_temp_min_c', label: 'Min Operating Temp', unit: '°C' },
    { key: 'operating_temp_max_c', label: 'Max Operating Temp', unit: '°C' },
    { key: 'fatigue_cycles', label: 'Fatigue Cycles', unit: '' },
    { key: 'certification_region', label: 'Certification Region', unit: '' },
  ];

  fields.forEach(({ key, label, unit }) => {
    const value = requirements[key];
    if (value !== null && value !== undefined) {
      results.push({
        id: `req-${key}`,
        type: 'requirement',
        title: label,
        description: `${value}${unit ? ' ' + unit : ''}`,
        category: 'Requirements',
        keywords: [label.toLowerCase(), key, String(value)],
        action: navigateToRequirements,
        icon: '📋',
      });
    }
  });

  return results;
}

/**
 * Build search index from Pareto designs
 */
export function indexDesigns(
  designs: ParetoDesign[],
  setCurrentDesign: (id: string) => void,
  navigateToViewer: () => void
): SearchResult[] {
  return designs.map((design) => ({
    id: `design-${design.id}`,
    type: 'design' as const,
    title: `Design ${design.id}`,
    description: `${design.weight_kg.toFixed(1)}kg, €${design.cost_eur.toFixed(0)}${
      design.trade_off_category ? ` (${design.trade_off_category})` : ''
    }`,
    category: 'Designs',
    keywords: [
      design.id,
      design.trade_off_category || '',
      'weight',
      'cost',
      'design',
      String(design.weight_kg),
      String(design.cost_eur),
    ],
    action: () => {
      setCurrentDesign(design.id);
      navigateToViewer();
    },
    icon: '🎯',
  }));
}

/**
 * Build search index from screens
 */
export function indexScreens(
  navigateToScreen: (screen: Screen) => void,
  canNavigate: (screen: Screen) => boolean
): SearchResult[] {
  return Object.entries(SCREEN_METADATA)
    .filter(([screen]) => canNavigate(screen as Screen))
    .map(([screen, metadata]) => ({
      id: `screen-${screen}`,
      type: 'screen' as const,
      title: metadata.title,
      description: metadata.description,
      category: 'Navigation',
      keywords: [...metadata.keywords, screen],
      action: () => navigateToScreen(screen as Screen),
      icon: '🔍',
    }));
}

/**
 * Common material categories for reference
 */
export const MATERIAL_CATEGORIES = {
  fiber: ['T700', 'T800', 'T1000', 'IM7', 'AS4', 'Glass Fiber'],
  matrix: ['Epoxy', 'Vinyl Ester', 'Polyester', 'Thermoplastic'],
  liner: ['HDPE', 'PA6', 'PA66', 'Aluminum 6061', 'Steel'],
};

/**
 * Build search index for materials
 */
export function indexMaterials(navigateToRequirements: () => void): SearchResult[] {
  const results: SearchResult[] = [];

  Object.entries(MATERIAL_CATEGORIES).forEach(([category, materials]) => {
    materials.forEach((material) => {
      results.push({
        id: `material-${category}-${material.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'material',
        title: material,
        description: `${category.charAt(0).toUpperCase() + category.slice(1)} material`,
        category: 'Materials',
        keywords: [material.toLowerCase(), category, 'material'],
        action: navigateToRequirements,
        icon: '🧪',
      });
    });
  });

  return results;
}

/**
 * Search through all indexed items
 */
export function searchIndex(query: string, index: SearchResult[]): SearchResult[] {
  if (!query.trim()) return [];

  const searchTerms = query.toLowerCase().trim().split(/\s+/);

  return index
    .map((item) => {
      const searchableText = [
        item.title,
        item.description || '',
        item.category,
        ...item.keywords,
      ]
        .join(' ')
        .toLowerCase();

      // Calculate relevance score
      let score = 0;

      searchTerms.forEach((term) => {
        // Exact title match (highest priority)
        if (item.title.toLowerCase() === term) {
          score += 100;
        }
        // Title starts with term
        else if (item.title.toLowerCase().startsWith(term)) {
          score += 50;
        }
        // Title contains term
        else if (item.title.toLowerCase().includes(term)) {
          score += 25;
        }
        // Description contains term
        else if (item.description?.toLowerCase().includes(term)) {
          score += 15;
        }
        // Keywords match
        else if (item.keywords.some((kw) => kw.includes(term))) {
          score += 10;
        }
        // General searchable text match
        else if (searchableText.includes(term)) {
          score += 5;
        }
      });

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

/**
 * Group results by category
 */
export function groupByCategory(results: SearchResult[]): Record<string, SearchResult[]> {
  return results.reduce(
    (acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlight matching text in search results
 */
export function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;

  const searchTerms = query.trim().split(/\s+/);
  let highlighted = text;

  searchTerms.forEach((term) => {
    const escapedTerm = escapeRegExp(term);
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });

  return highlighted;
}
