import { NextResponse } from 'next/server';

/**
 * GET /api/standards/library - Get complete standards library
 * Returns all available standards, policies, and requirements that can be applied to designs
 */
export async function GET() {
  const library = {
    // Regulatory Standards (mandatory for type approval)
    regulatory_standards: [
      {
        id: 'ISO_11119_3',
        code: 'ISO 11119-3:2022',
        title: 'Gas cylinders - Composite construction',
        full_title: 'Gas cylinders - Refillable composite gas cylinders and tubes - Design, construction and testing - Part 3: Fully wrapped fibre reinforced composite gas cylinders and tubes up to 450 L with non-load-sharing metallic or non-metallic liners',
        type: 'regulatory',
        version: '2022',
        release_date: '2022-06-01',
        scope: 'Type III and Type IV composite cylinders up to 450L',
        description: 'International standard for composite gas cylinders. Covers design requirements, materials, manufacturing, and testing procedures.',
        applicability: {
          tank_types: ['type_iii', 'type_iv'],
          pressure_range: { min: 0, max: 1000 },
          gas_types: ['hydrogen', 'cng', 'oxygen'],
          regions: ['EU', 'UK', 'International'],
          volume_max_liters: 450
        },
        is_mandatory: true,
        clauses_count: 47,
        status: 'active',
        key_requirements: [
          { clause: '6.2.1', summary: 'Burst ratio ≥ 2.25×NWP', criticality: 'critical' },
          { clause: '6.4.1', summary: 'Ambient cycling ≥ 11,000 cycles', criticality: 'critical' },
          { clause: '6.5.1', summary: 'Permeation ≤ 46 NmL/hr/L', criticality: 'high' },
          { clause: '6.6.1', summary: 'Fire test with PRD activation', criticality: 'critical' }
        ],
        certification_bodies: ['TÜV', 'DNV', 'Lloyd\'s', 'Bureau Veritas']
      },
      {
        id: 'UN_R134',
        code: 'UN ECE R134',
        title: 'Hydrogen vehicles - Safety requirements',
        full_title: 'Uniform provisions concerning the approval of motor vehicles and their components with regard to the safety-related performance of hydrogen-fuelled vehicles (HFCV)',
        type: 'regulatory',
        version: '2022',
        release_date: '2022-01-01',
        scope: 'Hydrogen-powered vehicles and fuel storage systems',
        description: 'UN regulation for hydrogen vehicle type approval. Mandatory for vehicles sold in UNECE contracting parties.',
        applicability: {
          tank_types: ['type_iii', 'type_iv'],
          pressure_range: { min: 0, max: 875 },
          gas_types: ['hydrogen'],
          regions: ['EU', 'UK', 'Japan', 'Korea', 'UNECE'],
          vehicle_types: ['M1', 'M2', 'M3', 'N1', 'N2', 'N3']
        },
        is_mandatory: true,
        clauses_count: 28,
        status: 'active',
        key_requirements: [
          { clause: '5.1.1', summary: 'Operating temp -40°C to +85°C', criticality: 'critical' },
          { clause: '5.2.1', summary: 'Bonfire test - PRD activation <20min', criticality: 'critical' },
          { clause: '5.3.1', summary: 'Gunshot penetration - no rupture', criticality: 'critical' }
        ],
        certification_bodies: ['TÜV', 'VCA', 'JASIC', 'KATRI']
      },
      {
        id: 'EC_79_2009',
        code: 'EC 79/2009',
        title: 'Type-approval of hydrogen vehicles',
        full_title: 'Regulation (EC) No 79/2009 on type-approval of hydrogen-powered motor vehicles',
        type: 'regulatory',
        version: '2009',
        release_date: '2009-01-14',
        scope: 'EU type-approval framework for hydrogen vehicles',
        description: 'European framework regulation for hydrogen vehicle approval. Being superseded by UN R134.',
        applicability: {
          tank_types: ['type_iii', 'type_iv'],
          pressure_range: { min: 0, max: 875 },
          gas_types: ['hydrogen'],
          regions: ['EU'],
          vehicle_types: ['M1', 'N1']
        },
        is_mandatory: false,
        clauses_count: 15,
        status: 'superseded',
        superseded_by: 'UN_R134',
        key_requirements: [
          { clause: '4.1', summary: 'Burst test ≥2.25×NWP', criticality: 'critical' },
          { clause: '4.2', summary: 'Pressure cycling ≥5,500 cycles', criticality: 'high' }
        ],
        certification_bodies: ['TÜV', 'VCA']
      },
      {
        id: 'SAE_J2579',
        code: 'SAE J2579:2018',
        title: 'Fuel Systems in Fuel Cell and Other Hydrogen Vehicles',
        full_title: 'Standard for Fuel Systems in Fuel Cell and Other Hydrogen Vehicles',
        type: 'regulatory',
        version: '2018',
        release_date: '2018-01-01',
        scope: 'Hydrogen fuel systems for road vehicles',
        description: 'SAE standard for hydrogen fuel systems. Primary standard for North American market.',
        applicability: {
          tank_types: ['type_iii', 'type_iv'],
          pressure_range: { min: 0, max: 875 },
          gas_types: ['hydrogen'],
          regions: ['USA', 'Canada', 'North America']
        },
        is_mandatory: true,
        clauses_count: 35,
        status: 'active',
        key_requirements: [
          { clause: '5.1', summary: 'Burst factor 2.25× at -40°C', criticality: 'critical' },
          { clause: '5.2', summary: 'Fatigue life 22,000 cycles', criticality: 'critical' },
          { clause: '5.4', summary: 'Fire resistance with PRD', criticality: 'critical' }
        ],
        certification_bodies: ['CSA Group', 'UL', 'TÜV America']
      }
    ],

    // Industry Standards (best practices)
    industry_standards: [
      {
        id: 'EN_12245',
        code: 'EN 12245:2009+A1:2011',
        title: 'Transportable gas cylinders - Fully wrapped composite cylinders',
        type: 'industry',
        version: '2011',
        scope: 'Transportable composite cylinders',
        description: 'European standard for transportable composite cylinders. Harmonized with ISO 11119-3.',
        applicability: {
          tank_types: ['type_iii', 'type_iv'],
          regions: ['EU', 'UK']
        },
        is_mandatory: false,
        clauses_count: 22,
        status: 'active'
      },
      {
        id: 'ASME_SEC_X',
        code: 'ASME Section X',
        title: 'Fiber-Reinforced Plastic Pressure Vessels',
        type: 'industry',
        version: '2021',
        scope: 'FRP pressure vessel design and fabrication',
        description: 'ASME Boiler and Pressure Vessel Code Section X for composite pressure vessels.',
        applicability: {
          tank_types: ['type_iii', 'type_iv'],
          regions: ['USA', 'International']
        },
        is_mandatory: false,
        clauses_count: 45,
        status: 'active'
      },
      {
        id: 'CGA_C6',
        code: 'CGA C-6.4',
        title: 'Methods for External Visual Inspection of Natural Gas Vehicle Fuel Containers',
        type: 'industry',
        version: '2017',
        scope: 'Visual inspection criteria',
        description: 'Compressed Gas Association standard for visual inspection of composite cylinders.',
        applicability: {
          tank_types: ['type_iii', 'type_iv'],
          regions: ['USA', 'North America']
        },
        is_mandatory: false,
        clauses_count: 12,
        status: 'active'
      }
    ],

    // Internal Policies
    internal_policies: [
      {
        id: 'INT_SAFETY_001',
        code: 'POL-SAFETY-001',
        title: 'Hydrogen Tank Safety Policy',
        type: 'internal',
        version: '2024.1',
        owner: 'Engineering Safety Committee',
        scope: 'All hydrogen storage products',
        description: 'Internal safety policy exceeding regulatory minimums for enhanced safety margins.',
        requirements: [
          { id: 'SR-001', summary: 'Minimum burst ratio 2.35× (vs 2.25× regulatory)', criticality: 'high' },
          { id: 'SR-002', summary: 'Fatigue life minimum 50,000 cycles (vs 11,000 regulatory)', criticality: 'high' },
          { id: 'SR-003', summary: 'Mandatory NDT inspection every batch', criticality: 'medium' }
        ],
        effective_date: '2024-01-01',
        review_date: '2025-01-01',
        status: 'active'
      },
      {
        id: 'INT_QUALITY_001',
        code: 'POL-QMS-001',
        title: 'Manufacturing Quality Standards',
        type: 'internal',
        version: '2024.2',
        owner: 'Quality Assurance',
        scope: 'Production processes',
        description: 'Quality management system requirements for composite tank manufacturing.',
        requirements: [
          { id: 'QR-001', summary: 'ISO 9001:2015 certification required', criticality: 'critical' },
          { id: 'QR-002', summary: 'Fiber tension monitoring ±2%', criticality: 'high' },
          { id: 'QR-003', summary: 'Cure cycle temperature ±3°C', criticality: 'high' },
          { id: 'QR-004', summary: '100% helium leak test', criticality: 'critical' }
        ],
        effective_date: '2024-03-01',
        review_date: '2025-03-01',
        status: 'active'
      },
      {
        id: 'INT_ENV_001',
        code: 'POL-ENV-001',
        title: 'Environmental Compliance Policy',
        type: 'internal',
        version: '2024.1',
        owner: 'Environmental Health & Safety',
        scope: 'Environmental impact requirements',
        description: 'Environmental requirements for materials and end-of-life considerations.',
        requirements: [
          { id: 'ER-001', summary: 'REACH compliance for all materials', criticality: 'critical' },
          { id: 'ER-002', summary: 'Recyclability assessment required', criticality: 'medium' },
          { id: 'ER-003', summary: 'Carbon footprint reporting', criticality: 'low' }
        ],
        effective_date: '2024-01-01',
        review_date: '2025-01-01',
        status: 'active'
      }
    ],

    // Customer/OEM Requirements
    customer_requirements: [
      {
        id: 'OEM_TOYOTA_001',
        code: 'TOYOTA-SPEC-H2-2024',
        title: 'Toyota Hydrogen Tank Specifications',
        type: 'customer',
        customer: 'Toyota Motor Corporation',
        version: '2024',
        scope: 'Mirai platform fuel tanks',
        description: 'OEM-specific requirements for Toyota hydrogen vehicle platforms.',
        requirements: [
          { id: 'TY-001', summary: 'Form factor constraints (max 650mm OD)', criticality: 'critical' },
          { id: 'TY-002', summary: 'Boss thread specification M18×1.5', criticality: 'critical' },
          { id: 'TY-003', summary: 'Mass target ≤47kg', criticality: 'high' }
        ],
        status: 'active'
      },
      {
        id: 'OEM_HYUNDAI_001',
        code: 'HYUNDAI-FCEV-REQ-2024',
        title: 'Hyundai FCEV Tank Requirements',
        type: 'customer',
        customer: 'Hyundai Motor Group',
        version: '2024',
        scope: 'NEXO and commercial vehicle platforms',
        description: 'Hyundai/Kia specific requirements for fuel cell vehicle tanks.',
        requirements: [
          { id: 'HY-001', summary: 'Korean certification (KATRI) required', criticality: 'critical' },
          { id: 'HY-002', summary: 'Sub-zero performance test -40°C', criticality: 'high' },
          { id: 'HY-003', summary: 'Extended cycling 45,000 cycles', criticality: 'medium' }
        ],
        status: 'active'
      }
    ],

    // Summary statistics
    summary: {
      total_regulatory: 4,
      total_industry: 3,
      total_internal_policies: 3,
      total_customer_requirements: 2,
      last_updated: '2024-12-09'
    }
  };

  return NextResponse.json(library, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
