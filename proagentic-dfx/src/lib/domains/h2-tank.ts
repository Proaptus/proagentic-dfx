import type { DomainConfiguration } from './types';

export const h2TankDomain: DomainConfiguration = {
  id: 'h2-tank',
  name: 'Hydrogen Storage Tank',
  description: 'Type I-V hydrogen storage tanks for automotive and stationary applications',
  icon: 'Cylinder',

  requirements: {
    fields: [
      {
        key: 'internal_volume_liters',
        label: 'Internal Volume',
        type: 'number',
        unit: 'L',
        required: true,
        min: 10,
        max: 1000,
      },
      {
        key: 'working_pressure_bar',
        label: 'Working Pressure',
        type: 'number',
        unit: 'bar',
        required: true,
        min: 100,
        max: 1000,
      },
      {
        key: 'target_weight_kg',
        label: 'Target Weight',
        type: 'number',
        unit: 'kg',
        required: true,
      },
      {
        key: 'target_cost_eur',
        label: 'Target Cost',
        type: 'number',
        unit: '€',
        required: true,
      },
      {
        key: 'min_burst_ratio',
        label: 'Min Burst Ratio',
        type: 'number',
        required: true,
        min: 1.5,
        max: 4.0,
      },
      {
        key: 'fatigue_cycles',
        label: 'Fatigue Life',
        type: 'number',
        unit: 'cycles',
        required: true,
      },
      {
        key: 'certification_region',
        label: 'Certification',
        type: 'select',
        required: true,
        options: [
          { value: 'EU', label: 'EU (UN R134, ISO 11119)' },
          { value: 'US', label: 'US (DOT, SAE J2579)' },
          { value: 'GLOBAL', label: 'Global (GTR 13)' },
        ],
      },
    ],
    defaults: {
      internal_volume_liters: 150,
      working_pressure_bar: 700,
      target_weight_kg: 80,
      min_burst_ratio: 2.25,
      fatigue_cycles: 11000,
      certification_region: 'EU',
    },
    validations: {},
  },

  objectives: [
    { key: 'weight', label: 'Weight', type: 'minimize', unit: 'kg' },
    { key: 'cost', label: 'Cost', type: 'minimize', unit: '€' },
    { key: 'reliability', label: 'Reliability', type: 'maximize', unit: '' },
  ],

  analysisModules: [
    { id: 'geometry', name: 'Geometry', icon: 'Box', endpoint: '/geometry' },
    { id: 'stress', name: 'Stress Analysis', icon: 'Activity', endpoint: '/stress' },
    { id: 'failure', name: 'Failure Analysis', icon: 'AlertTriangle', endpoint: '/failure' },
    { id: 'thermal', name: 'Thermal', icon: 'Thermometer', endpoint: '/thermal' },
    { id: 'reliability', name: 'Reliability', icon: 'Shield', endpoint: '/reliability' },
    { id: 'cost', name: 'Cost Breakdown', icon: 'DollarSign', endpoint: '/cost' },
  ],

  applicableStandards: [
    { code: 'ISO 11119-3', name: 'Composite Gas Cylinders', region: 'Global' },
    { code: 'UN R134', name: 'H2 Vehicles Type Approval', region: 'EU' },
    { code: 'SAE J2579', name: 'Fuel System Safety', region: 'US' },
  ],

  visualization: {
    type: 'cad',
    showLayers: true,
    showStress: true,
    showCutaway: true,
  },

  endpoints: {
    requirements: '/api/requirements',
    optimize: '/api/optimization',
    designs: '/api/designs',
    export: '/api/export',
  },
};
