/**
 * Types and constants for Standards Library Panel
 */

import { CheckCircle2, Clock, AlertCircle, type LucideIcon } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type LibraryCategory = 'all' | 'regulatory' | 'industry' | 'internal' | 'customer';
export type StandardStatusFilter = 'all' | 'active' | 'superseded' | 'draft';

export type StandardStatus = 'active' | 'superseded' | 'draft' | 'archived' | 'inactive';
export type CriticalityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface StatusBadgeConfig {
  color: string;
  icon: LucideIcon;
}

// ============================================================================
// Constants
// ============================================================================

export const CRITICALITY_COLORS: Record<CriticalityLevel, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

export const STATUS_BADGES: Record<StandardStatus, StatusBadgeConfig> = {
  active: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  superseded: { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
  draft: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
  archived: { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: Clock },
  inactive: { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: Clock },
};
