/**
 * Types and constants for RequirementsChat component
 */

import type { ChatMessage } from '@/lib/types';
import { Car, Plane, Factory, Zap } from 'lucide-react';

// ============================================================================
// Constants
// ============================================================================

export const MIN_REQUIREMENTS_COUNT = 5;

export const INITIAL_MESSAGE: ChatMessage = {
  id: '1',
  role: 'assistant',
  content: "Hello! I'm your hydrogen tank engineering assistant. Select an application type below to get started quickly, or type your specific requirements.",
  timestamp: Date.now(),
};

// Quick-start application presets for demo/testing
export const APPLICATION_PRESETS = [
  {
    id: 'automotive',
    label: 'Automotive',
    icon: Car,
    description: '700 bar Type IV for fuel cell vehicles',
    color: 'blue' as const,
    quickMessage: 'I need a hydrogen tank for automotive fuel cell application. 700 bar, 150 liters, target weight 80 kg, budget €15,000, -40°C to +85°C, EU certification, 11,000 cycles.',
  },
  {
    id: 'aviation',
    label: 'Aviation',
    icon: Plane,
    description: '350 bar lightweight for drones/aircraft',
    color: 'purple' as const,
    quickMessage: 'I need a hydrogen tank for aviation application. 350 bar, 50 liters, maximum weight 25 kg, budget €20,000, -55°C to +70°C, international certification, 20,000 cycles.',
  },
  {
    id: 'stationary',
    label: 'Stationary',
    icon: Factory,
    description: '500 bar for energy storage',
    color: 'green' as const,
    quickMessage: 'I need a hydrogen tank for stationary storage application. 500 bar, 500 liters, weight not critical, budget €8,000, -10°C to +50°C, EU certification, 45,000 cycles.',
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: Zap,
    description: 'Define your own specifications',
    color: 'amber' as const,
    quickMessage: null, // Will open chat input
  },
] as const;

export type ApplicationPreset = (typeof APPLICATION_PRESETS)[number];
export type PresetColor = ApplicationPreset['color'];

// ============================================================================
// UI Styles
// ============================================================================

export const PRESET_COLOR_CLASSES: Record<PresetColor, string> = {
  blue: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700',
  purple: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700',
  green: 'border-green-200 hover:border-green-400 hover:bg-green-50 text-green-700',
  amber: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-amber-700',
};

export const PRESET_ICON_BG_CLASSES: Record<PresetColor, string> = {
  blue: 'bg-blue-100',
  purple: 'bg-purple-100',
  green: 'bg-green-100',
  amber: 'bg-amber-100',
};
