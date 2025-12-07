import type { DomainConfiguration } from './types';

export const pressureVesselDomain: DomainConfiguration = {
  id: 'pressure-vessel',
  name: 'Pressure Vessel',
  description: 'ASME Section VIII pressure vessels for process industries',
  icon: 'Container',

  requirements: {
    fields: [
      {
        key: 'design_pressure_bar',
        label: 'Design Pressure',
        type: 'number',
        unit: 'bar',
        required: true,
      },
      {
        key: 'design_temperature_c',
        label: 'Design Temperature',
        type: 'number',
        unit: '°C',
        required: true,
      },
      {
        key: 'inside_diameter_mm',
        label: 'Inside Diameter',
        type: 'number',
        unit: 'mm',
        required: true,
      },
      {
        key: 'length_mm',
        label: 'Tangent-to-Tangent Length',
        type: 'number',
        unit: 'mm',
        required: true,
      },
      {
        key: 'material',
        label: 'Material',
        type: 'select',
        required: true,
        options: [
          { value: 'SA-516-70', label: 'SA-516 Grade 70 (Carbon Steel)' },
          { value: 'SA-240-316L', label: 'SA-240 316L (Stainless)' },
          { value: 'SA-387-11', label: 'SA-387 Grade 11 (Cr-Mo)' },
        ],
      },
      {
        key: 'head_type',
        label: 'Head Type',
        type: 'select',
        required: true,
        options: [
          { value: '2:1-elliptical', label: '2:1 Semi-Elliptical' },
          { value: 'hemispherical', label: 'Hemispherical' },
          { value: 'torispherical', label: 'Torispherical (ASME F&D)' },
        ],
      },
      {
        key: 'code_year',
        label: 'ASME Code Year',
        type: 'select',
        required: true,
        options: [
          { value: '2023', label: 'ASME VIII Div.1 (2023)' },
          { value: '2021', label: 'ASME VIII Div.1 (2021)' },
        ],
      },
    ],
    defaults: {
      design_pressure_bar: 10,
      design_temperature_c: 150,
      inside_diameter_mm: 1000,
      length_mm: 3000,
      material: 'SA-516-70',
      head_type: '2:1-elliptical',
      code_year: '2023',
    },
    validations: {},
  },

  objectives: [
    { key: 'weight', label: 'Weight', type: 'minimize', unit: 'kg' },
    { key: 'cost', label: 'Cost', type: 'minimize', unit: '€' },
  ],

  analysisModules: [
    { id: 'shell', name: 'Shell Design', icon: 'Circle', endpoint: '/shell' },
    { id: 'heads', name: 'Head Design', icon: 'Disc', endpoint: '/heads' },
    { id: 'nozzles', name: 'Nozzle Reinforcement', icon: 'ArrowUpCircle', endpoint: '/nozzles' },
    { id: 'supports', name: 'Supports', icon: 'Anchor', endpoint: '/supports' },
  ],

  applicableStandards: [
    { code: 'ASME VIII-1', name: 'Pressure Vessels Div. 1', region: 'Global' },
    { code: 'PED 2014/68/EU', name: 'Pressure Equipment Directive', region: 'EU' },
  ],

  visualization: {
    type: 'cad',
    showLayers: false,
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
