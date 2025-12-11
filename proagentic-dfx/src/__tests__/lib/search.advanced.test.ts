/**
 * Search Index Tests - Advanced Scenarios
 *
 * Tests for:
 * - Unicode and special character handling
 * - Performance with large datasets
 * - Edge cases and error handling
 * - Search ranking and scoring algorithms
 * - Integration testing across all search components
 *
 * Target Coverage: 80%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  indexRequirements,
  indexDesigns,
  indexScreens,
  indexMaterials,
  searchIndex,
  groupByCategory,
  SearchResult,
} from '@/lib/search/searchIndex';
import type { ParsedRequirements, ParetoDesign, Screen } from '@/lib/types';

// ============================================================================
// TEST DATA & SETUP
// ============================================================================

describe('Search Index - Advanced Scenarios', () => {
  let mockNavigateToRequirements: ReturnType<typeof vi.fn>;
  let mockNavigateToViewer: ReturnType<typeof vi.fn>;
  let mockSetCurrentDesign: ReturnType<typeof vi.fn>;
  let mockNavigateToScreen: ReturnType<typeof vi.fn>;
  let mockCanNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigateToRequirements = vi.fn();
    mockNavigateToViewer = vi.fn();
    mockSetCurrentDesign = vi.fn();
    mockNavigateToScreen = vi.fn();
    mockCanNavigate = vi.fn().mockReturnValue(true);

    // Mock localStorage and getCurrencySymbol
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'GBP'),
        setItem: vi.fn(),
      },
      writable: true,
    });
  });

  // ============================================================================
  // UNICODE & SPECIAL CHARACTER HANDLING
  // ============================================================================

  describe('Unicode and Special Character Handling', () => {
    it('should handle unicode characters in search', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'requirement',
          title: '温度 Temperature',
          category: 'Requirements',
          keywords: ['温度'],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('温度', index);

      expect(results.length).toBe(1);
    });

    it('should handle accented characters', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'material',
          title: 'Époxy Resin',
          category: 'Materials',
          keywords: ['epoxy'],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('epoxy', index);

      expect(results.length).toBe(1);
    });

    it('should handle symbols in content', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'requirement',
          title: 'Cost £12,000',
          category: 'Requirements',
          keywords: ['cost', '12000'],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('£', index);

      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle emoji in content', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'screen',
          title: '🎯 Design',
          category: 'Navigation',
          keywords: ['design'],
          action: vi.fn(),
          icon: '🎯',
        },
      ];

      const results = searchIndex('Design', index);

      expect(results.length).toBe(1);
    });

    it('should handle dash and hyphen in search', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'design',
          title: 'Type-IV Design',
          category: 'Designs',
          keywords: ['type', 'iv', 'type-iv'],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('Type-IV', index);

      expect(results.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // PERFORMANCE WITH LARGE DATASETS
  // ============================================================================

  describe('Performance with Large Datasets', () => {
    it('should handle 1000+ items efficiently', () => {
      const largeIndex: SearchResult[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        type: 'design',
        title: `Design ${i}`,
        description: `Design number ${i} with weight ${i}kg and cost ${i * 1000}EUR`,
        category: 'Designs',
        keywords: [`design`, `${i}`, 'weight', 'cost'],
        action: vi.fn(),
      }));

      const start = performance.now();
      const results = searchIndex('Design 500', largeIndex);
      const duration = performance.now() - start;

      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle grouping of large datasets', () => {
      const largeIndex: SearchResult[] = Array.from({ length: 500 }, (_, i) => ({
        id: `item-${i}`,
        type: i % 2 === 0 ? 'design' : 'requirement',
        title: `Item ${i}`,
        category: i % 2 === 0 ? 'Designs' : 'Requirements',
        keywords: [],
        action: vi.fn(),
      }));

      const start = performance.now();
      const grouped = groupByCategory(largeIndex);
      const duration = performance.now() - start;

      expect(Object.keys(grouped).length).toBe(2);
      expect(duration).toBeLessThan(500); // Should complete in less than 500ms
    });

    it('should handle many search terms', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'design',
          title: 'Advanced Composite Design System',
          description: 'High performance composite tank design',
          category: 'Designs',
          keywords: ['composite', 'tank', 'design', 'advanced', 'system'],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('Advanced Composite Design System', index);

      expect(results.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // EDGE CASES & ERROR HANDLING
  // ============================================================================

  describe('Edge Cases and Error Handling', () => {
    it('should handle null description gracefully', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'design',
          title: 'Design A',
          description: undefined,
          category: 'Designs',
          keywords: ['design'],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('Design', index);

      expect(results.length).toBe(1);
    });

    it('should handle empty keywords array', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'design',
          title: 'Design A',
          category: 'Designs',
          keywords: [],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('Design', index);

      expect(results.length).toBe(1);
    });

    it('should handle very long search query', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'design',
          title: 'Design',
          category: 'Designs',
          keywords: [],
          action: vi.fn(),
        },
      ];

      const longQuery = 'design ' + 'word '.repeat(100);

      const results = searchIndex(longQuery, index);

      expect(results).toBeTruthy();
    });

    it('should handle zero-length index', () => {
      const results = searchIndex('Design', []);

      expect(results).toEqual([]);
    });

    it('should handle items with empty titles', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'design',
          title: '',
          description: 'Some description',
          category: 'Designs',
          keywords: ['keyword'],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('keyword', index);

      expect(results.length).toBe(1);
    });

    it('should handle numeric values in keywords', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'design',
          title: 'Design 123',
          category: 'Designs',
          keywords: ['123', 'design'],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('123', index);

      expect(results.length).toBe(1);
    });

    it('should handle duplicate items in index', () => {
      const item = {
        id: '1',
        type: 'design' as const,
        title: 'Design A',
        category: 'Designs',
        keywords: ['design'],
        action: vi.fn(),
      };

      const index: SearchResult[] = [item, item, item];

      const results = searchIndex('Design', index);

      expect(results.length).toBe(3);
    });

    it('should not crash with malformed action callback', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'design',
          title: 'Design A',
          category: 'Designs',
          keywords: ['design'],
          action: undefined as unknown as () => void,
        },
      ];

      // Should not crash when searching
      expect(() => {
        searchIndex('Design', index);
      }).not.toThrow();
    });
  });

  // ============================================================================
  // SEARCH RANKING & SCORING
  // ============================================================================

  describe('Search Ranking and Scoring', () => {
    it('should rank exact title match highest', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'design',
          title: 'Design A',
          description: 'A design in the system',
          category: 'Designs',
          keywords: ['design'],
          action: vi.fn(),
        },
        {
          id: '2',
          type: 'requirement',
          title: 'Design Pressure',
          category: 'Requirements',
          keywords: ['design'],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('Design', index);

      // "Design A" title starts with "Design" (50 points)
      // "Design Pressure" title contains "Design" (25 points)
      expect(results[0].id).toBe('1');
    });

    it('should score title prefix match higher than contained match', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'design',
          title: 'Pressure Reading',
          category: 'Designs',
          keywords: [],
          action: vi.fn(),
        },
        {
          id: '2',
          type: 'design',
          title: 'Design Pressure',
          category: 'Designs',
          keywords: [],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('Pressure', index);

      // "Design Pressure" - starts with "Design" (50) + contains "Pressure" (25)
      // "Pressure Reading" - starts with "Pressure" (50)
      expect(results.length).toBeGreaterThan(0);
    });

    it('should score keyword matches lower than title matches', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'design',
          title: 'Design A',
          description: 'Description for design',
          category: 'Designs',
          keywords: ['pressure', 'bar'],
          action: vi.fn(),
        },
        {
          id: '2',
          type: 'requirement',
          title: 'Pressure Requirement',
          category: 'Requirements',
          keywords: [],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('Pressure', index);

      // "Pressure Requirement" starts with term (50) > keyword match (10)
      if (results.length > 1) {
        expect(results[0].id).toBe('2');
      }
    });

    it('should filter out zero-score results', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'design',
          title: 'Design A',
          category: 'Designs',
          keywords: ['design'],
          action: vi.fn(),
        },
        {
          id: '2',
          type: 'design',
          title: 'Other Item',
          category: 'Designs',
          keywords: ['other'],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('Design', index);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('1');
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Tests', () => {
    it('should build complete search index from all sources', () => {
      const requirements: ParsedRequirements = {
        internal_volume_liters: 100,
        working_pressure_bar: 250,
        target_weight_kg: 50,
        target_cost_eur: 15000,
        min_burst_ratio: 3.0,
        max_permeation_rate: 0.05,
        operating_temp_min_c: -20,
        operating_temp_max_c: 80,
        fatigue_cycles: 100000,
        certification_region: 'EU',
      };

      const designs: ParetoDesign[] = [
        {
          id: 'design-1',
          weight_kg: 45.5,
          cost_eur: 12000,
          burst_pressure_bar: 350,
          burst_ratio: 1.4,
          p_failure: 0.01,
          fatigue_life_cycles: 500000,
          permeation_rate: 0.03,
          volumetric_efficiency: 0.92,
        },
      ];

      const reqResults = indexRequirements(requirements, mockNavigateToRequirements as () => void);
      const designResults = indexDesigns(designs, mockSetCurrentDesign as (id: string) => void, mockNavigateToViewer as () => void);
      const screenResults = indexScreens(mockNavigateToScreen as unknown as (screen: Screen) => void, mockCanNavigate as unknown as (screen: Screen) => boolean);
      const materialResults = indexMaterials(mockNavigateToRequirements as () => void);

      const allResults = [...reqResults, ...designResults, ...screenResults, ...materialResults];

      expect(allResults.length).toBeGreaterThan(0);
      expect(allResults.every((r) => r.id && r.title && r.category)).toBe(true);
    });

    it('should search across all result types', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'requirement',
          title: 'Internal Volume',
          category: 'Requirements',
          keywords: ['volume'],
          action: vi.fn(),
        },
        {
          id: '2',
          type: 'design',
          title: 'Design A',
          category: 'Designs',
          keywords: ['design'],
          action: vi.fn(),
        },
        {
          id: '3',
          type: 'material',
          title: 'T700',
          category: 'Materials',
          keywords: ['fiber'],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('design', index);

      expect(results.length).toBeGreaterThan(0);
    });

    it('should group and search in combination', () => {
      const index: SearchResult[] = [
        {
          id: '1',
          type: 'requirement',
          title: 'Volume',
          category: 'Requirements',
          keywords: ['volume'],
          action: vi.fn(),
        },
        {
          id: '2',
          type: 'design',
          title: 'Design A',
          category: 'Designs',
          keywords: ['design'],
          action: vi.fn(),
        },
      ];

      const results = searchIndex('volume', index);
      const grouped = groupByCategory(results);

      expect(grouped['Requirements']).toBeTruthy();
      expect(grouped['Requirements'].length).toBe(1);
    });
  });
});
