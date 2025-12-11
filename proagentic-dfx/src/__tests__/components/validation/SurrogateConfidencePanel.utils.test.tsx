/**
 * Helper Function Tests for SurrogateConfidencePanel
 * Tests for exported utility functions to ensure full branch coverage
 */

import { describe, it, expect } from 'vitest';
import { getStatusColor, getStatusIcon } from '@/components/validation/SurrogateConfidencePanel';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

describe('SurrogateConfidencePanel - Helper Functions', () => {
  describe('getStatusColor function', () => {
    it('should return green color for excellent status', () => {
      const color = getStatusColor('excellent');
      expect(color).toBe('#22c55e');
    });

    it('should return blue color for good status', () => {
      const color = getStatusColor('good');
      expect(color).toBe('#3b82f6');
    });

    it('should return yellow color for acceptable status', () => {
      const color = getStatusColor('acceptable');
      expect(color).toBe('#f59e0b');
    });

    it('should return red color for poor status', () => {
      const color = getStatusColor('poor');
      expect(color).toBe('#ef4444');
    });

    it('should return default gray color for unknown status', () => {
      const color = getStatusColor('unknown');
      expect(color).toBe('#94a3b8');
    });

    it('should return default gray color for empty string', () => {
      const color = getStatusColor('');
      expect(color).toBe('#94a3b8');
    });

    it('should be case-sensitive for status matching', () => {
      const color = getStatusColor('EXCELLENT');
      expect(color).toBe('#94a3b8');
    });

    it('should return correct color for each valid status in sequence', () => {
      const statuses = ['excellent', 'good', 'acceptable', 'poor'];
      const expectedColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];
      
      statuses.forEach((status, index) => {
        expect(getStatusColor(status)).toBe(expectedColors[index]);
      });
    });
  });

  describe('getStatusIcon function', () => {
    it('should return CheckCircle2 icon for excellent status', () => {
      const icon = getStatusIcon('excellent');
      expect(icon?.type).toBe(CheckCircle2);
    });

    it('should return CheckCircle2 icon for good status', () => {
      const icon = getStatusIcon('good');
      expect(icon?.type).toBe(CheckCircle2);
    });

    it('should return AlertTriangle icon for acceptable status', () => {
      const icon = getStatusIcon('acceptable');
      expect(icon?.type).toBe(AlertTriangle);
    });

    it('should return AlertTriangle icon for poor status', () => {
      const icon = getStatusIcon('poor');
      expect(icon?.type).toBe(AlertTriangle);
    });

    it('should return null for unknown status', () => {
      const icon = getStatusIcon('unknown');
      expect(icon).toBeNull();
    });

    it('should return null for empty string', () => {
      const icon = getStatusIcon('');
      expect(icon).toBeNull();
    });

    it('should have correct className for excellent status icon', () => {
      const icon = getStatusIcon('excellent');
      expect(icon?.props.className).toContain('text-green-600');
    });

    it('should have correct className for good status icon', () => {
      const icon = getStatusIcon('good');
      expect(icon?.props.className).toContain('text-green-600');
    });

    it('should have correct className for acceptable status icon', () => {
      const icon = getStatusIcon('acceptable');
      expect(icon?.props.className).toContain('text-yellow-600');
    });

    it('should have correct className for poor status icon', () => {
      const icon = getStatusIcon('poor');
      expect(icon?.props.className).toContain('text-red-600');
    });

    it('should have size 16 for all icons', () => {
      const statuses = ['excellent', 'good', 'acceptable', 'poor'];
      
      statuses.forEach((status) => {
        const icon = getStatusIcon(status);
        expect(icon?.props.size).toBe(16);
      });
    });
  });

  describe('getStatusColor and getStatusIcon Integration', () => {
    it('should have matching color schemes for excellent status', () => {
      const color = getStatusColor('excellent');
      const icon = getStatusIcon('excellent');
      
      expect(color).toBe('#22c55e');
      expect(icon?.type).toBe(CheckCircle2);
      expect(icon?.props.className).toContain('text-green-600');
    });

    it('should have matching color schemes for good status', () => {
      const color = getStatusColor('good');
      const icon = getStatusIcon('good');
      
      expect(color).toBe('#3b82f6');
      expect(icon?.type).toBe(CheckCircle2);
      expect(icon?.props.className).toContain('text-green-600');
    });

    it('should have matching color schemes for acceptable status', () => {
      const color = getStatusColor('acceptable');
      const icon = getStatusIcon('acceptable');
      
      expect(color).toBe('#f59e0b');
      expect(icon?.type).toBe(AlertTriangle);
      expect(icon?.props.className).toContain('text-yellow-600');
    });

    it('should have matching color schemes for poor status', () => {
      const color = getStatusColor('poor');
      const icon = getStatusIcon('poor');
      
      expect(color).toBe('#ef4444');
      expect(icon?.type).toBe(AlertTriangle);
      expect(icon?.props.className).toContain('text-red-600');
    });

    it('should handle all statuses without throwing errors', () => {
      const statuses = ['excellent', 'good', 'acceptable', 'poor', 'unknown'];
      
      expect(() => {
        statuses.forEach((status) => {
          getStatusColor(status);
          getStatusIcon(status);
        });
      }).not.toThrow();
    });
  });

  describe('Branch Coverage Verification', () => {
    it('should cover excellent branch in getStatusColor', () => {
      expect(getStatusColor('excellent')).toBe('#22c55e');
    });

    it('should cover good branch in getStatusColor', () => {
      expect(getStatusColor('good')).toBe('#3b82f6');
    });

    it('should cover acceptable branch in getStatusColor', () => {
      expect(getStatusColor('acceptable')).toBe('#f59e0b');
    });

    it('should cover poor branch in getStatusColor', () => {
      expect(getStatusColor('poor')).toBe('#ef4444');
    });

    it('should cover default branch in getStatusColor', () => {
      expect(getStatusColor('invalid')).toBe('#94a3b8');
    });

    it('should cover excellent/good branch in getStatusIcon', () => {
      const excellentIcon = getStatusIcon('excellent');
      const goodIcon = getStatusIcon('good');
      
      expect(excellentIcon?.type).toBe(CheckCircle2);
      expect(goodIcon?.type).toBe(CheckCircle2);
    });

    it('should cover acceptable branch in getStatusIcon', () => {
      const icon = getStatusIcon('acceptable');
      expect(icon?.type).toBe(AlertTriangle);
    });

    it('should cover poor branch in getStatusIcon', () => {
      const icon = getStatusIcon('poor');
      expect(icon?.type).toBe(AlertTriangle);
    });

    it('should cover default branch in getStatusIcon', () => {
      const icon = getStatusIcon('invalid');
      expect(icon).toBeNull();
    });
  });
});
