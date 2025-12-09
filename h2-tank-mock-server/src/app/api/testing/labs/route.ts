import { NextResponse } from 'next/server';

// GET /api/testing/labs - Get list of testing laboratories
export async function GET() {
  try {
    const laboratories = [
      {
        id: 'lab_tuv_sud',
        name: 'TÜV SÜD',
        full_name: 'TÜV SÜD Product Service GmbH',
        location: {
          city: 'Munich',
          country: 'Germany',
          region: 'Europe'
        },
        accreditations: [
          'ISO/IEC 17025',
          'DAkkS (German Accreditation Body)',
          'ILAC MRA',
          'Notified Body for EU regulations'
        ],
        capabilities: {
          max_test_pressure_bar: 1000,
          max_vessel_volume_liters: 500,
          max_vessel_length_mm: 3000,
          temperature_range_c: [-60, 200],
          test_types: [
            'Hydraulic burst',
            'Pressure cycling (ambient)',
            'Pressure cycling (extreme temps)',
            'Permeation testing',
            'Bonfire test',
            'Drop test',
            'Gunfire test',
            'Flaw tolerance',
            'Boss torque',
            'Leak detection',
            'NDT (UT, X-ray, CT)',
            'Accelerated stress rupture'
          ],
          certifications_issued: [
            'ISO 11119-3',
            'ISO 19881',
            'UN R134',
            'EC 79/2009'
          ]
        },
        typical_lead_time_weeks: 12,
        cost_estimate: {
          full_qualification_eur: 85000,
          burst_test_only_eur: 8500,
          cycling_test_per_1000_cycles_eur: 2200,
          permeation_test_eur: 12000
        },
        contact: {
          email: 'hydrogen.testing@tuvsud.com',
          phone: '+49-89-5791-2345',
          website: 'https://www.tuvsud.com'
        },
        notes: 'Leading certification body in Europe, extensive experience with Type 4 tanks'
      },
      {
        id: 'lab_dnv',
        name: 'DNV GL',
        full_name: 'DNV GL - Energy',
        location: {
          city: 'Høvik',
          country: 'Norway',
          region: 'Europe'
        },
        accreditations: [
          'ISO/IEC 17025',
          'Norsk Akkreditering',
          'Notified Body for EU regulations',
          'ILAC MRA'
        ],
        capabilities: {
          max_test_pressure_bar: 1200,
          max_vessel_volume_liters: 1000,
          max_vessel_length_mm: 4000,
          temperature_range_c: [-80, 150],
          test_types: [
            'Hydraulic burst',
            'Pressure cycling (ambient)',
            'Pressure cycling (extreme temps)',
            'Permeation testing',
            'Bonfire test',
            'Drop test',
            'Environmental conditioning',
            'Leak detection',
            'NDT (UT, AE, thermography)',
            'Hydrogen embrittlement studies',
            'Long-term aging'
          ],
          certifications_issued: [
            'ISO 11119-3',
            'ISO 19881',
            'UN R134',
            'EN 12245'
          ]
        },
        typical_lead_time_weeks: 14,
        cost_estimate: {
          full_qualification_eur: 92000,
          burst_test_only_eur: 9200,
          cycling_test_per_1000_cycles_eur: 2400,
          permeation_test_eur: 13500
        },
        contact: {
          email: 'hydrogen@dnv.com',
          phone: '+47-67-57-9900',
          website: 'https://www.dnv.com'
        },
        notes: 'Strong expertise in hydrogen safety, focus on maritime and energy applications'
      },
      {
        id: 'lab_bam',
        name: 'BAM',
        full_name: 'Bundesanstalt für Materialforschung und -prüfung',
        location: {
          city: 'Berlin',
          country: 'Germany',
          region: 'Europe'
        },
        accreditations: [
          'ISO/IEC 17025',
          'DAkkS',
          'Federal research institute',
          'Notified Body'
        ],
        capabilities: {
          max_test_pressure_bar: 1400,
          max_vessel_volume_liters: 800,
          max_vessel_length_mm: 3500,
          temperature_range_c: [-80, 300],
          test_types: [
            'Hydraulic burst',
            'Pneumatic burst',
            'Pressure cycling (all conditions)',
            'Permeation testing (highly accurate)',
            'Bonfire test',
            'Gunfire test',
            'Extreme environment testing',
            'Material compatibility',
            'Hydrogen embrittlement',
            'Advanced NDT (neutron imaging, CT)',
            'Fatigue crack growth'
          ],
          certifications_issued: [
            'ISO 11119-3',
            'ISO 19881',
            'UN R134',
            'Research certifications'
          ]
        },
        typical_lead_time_weeks: 16,
        cost_estimate: {
          full_qualification_eur: 95000,
          burst_test_only_eur: 10000,
          cycling_test_per_1000_cycles_eur: 2600,
          permeation_test_eur: 15000
        },
        contact: {
          email: 'info@bam.de',
          phone: '+49-30-8104-0',
          website: 'https://www.bam.de'
        },
        notes: 'Government research institute, highly accurate permeation testing, cutting-edge NDT'
      },
      {
        id: 'lab_csa',
        name: 'CSA Group',
        full_name: 'CSA Group Testing and Certification',
        location: {
          city: 'Cleveland, OH',
          country: 'USA',
          region: 'North America'
        },
        accreditations: [
          'ISO/IEC 17025',
          'ANAB (ANSI-ASQ)',
          'SCC (Standards Council of Canada)',
          'ILAC MRA'
        ],
        capabilities: {
          max_test_pressure_bar: 1050,
          max_vessel_volume_liters: 600,
          max_vessel_length_mm: 3200,
          temperature_range_c: [-60, 180],
          test_types: [
            'Hydraulic burst',
            'Pressure cycling',
            'Permeation testing',
            'Bonfire test',
            'Drop test',
            'Gunfire test',
            'Leak testing',
            'NDT (UT, radiography)',
            'Environmental testing',
            'Boss torque'
          ],
          certifications_issued: [
            'CSA B51',
            'ASME BPVC Section X',
            'SAE J2579',
            'ISO 11119-3',
            'ISO 19881'
          ]
        },
        typical_lead_time_weeks: 10,
        cost_estimate: {
          full_qualification_usd: 95000,
          burst_test_only_usd: 9500,
          cycling_test_per_1000_cycles_usd: 2500,
          permeation_test_usd: 14000
        },
        contact: {
          email: 'hydrogen@csagroup.org',
          phone: '+1-216-524-4990',
          website: 'https://www.csagroup.org'
        },
        notes: 'North American focus, ASME expertise, fast turnaround'
      },
      {
        id: 'lab_intertek',
        name: 'Intertek',
        full_name: 'Intertek Testing Services',
        location: {
          city: 'Shanghai',
          country: 'China',
          region: 'Asia'
        },
        accreditations: [
          'ISO/IEC 17025',
          'CNAS (China National Accreditation)',
          'ILAC MRA',
          'Multiple regional accreditations'
        ],
        capabilities: {
          max_test_pressure_bar: 900,
          max_vessel_volume_liters: 500,
          max_vessel_length_mm: 2800,
          temperature_range_c: [-50, 150],
          test_types: [
            'Hydraulic burst',
            'Pressure cycling (ambient)',
            'Pressure cycling (extreme temps)',
            'Permeation testing',
            'Bonfire test',
            'Drop test',
            'Leak testing',
            'NDT (UT, X-ray)',
            'Environmental testing'
          ],
          certifications_issued: [
            'GB/T 35544 (China national standard)',
            'ISO 11119-3',
            'ISO 19881',
            'UN R134'
          ]
        },
        typical_lead_time_weeks: 8,
        cost_estimate: {
          full_qualification_usd: 72000,
          burst_test_only_usd: 7200,
          cycling_test_per_1000_cycles_usd: 1800,
          permeation_test_usd: 10500
        },
        contact: {
          email: 'hydrogen.china@intertek.com',
          phone: '+86-21-6853-9988',
          website: 'https://www.intertek.com'
        },
        notes: 'Cost-effective option, expertise in Chinese market requirements, growing hydrogen capabilities'
      },
      {
        id: 'lab_swri',
        name: 'SwRI',
        full_name: 'Southwest Research Institute',
        location: {
          city: 'San Antonio, TX',
          country: 'USA',
          region: 'North America'
        },
        accreditations: [
          'ISO/IEC 17025',
          'A2LA',
          'Independent research institute'
        ],
        capabilities: {
          max_test_pressure_bar: 1500,
          max_vessel_volume_liters: 1200,
          max_vessel_length_mm: 5000,
          temperature_range_c: [-100, 200],
          test_types: [
            'Hydraulic burst',
            'Pneumatic burst',
            'Pressure cycling (all conditions)',
            'Permeation testing',
            'Bonfire test',
            'Gunfire test',
            'Ballistic impact',
            'Extreme environment',
            'Hydrogen embrittlement research',
            'Material characterization',
            'Advanced NDT (all methods)',
            'Failure analysis'
          ],
          certifications_issued: [
            'Research reports',
            'DOT certifications',
            'ISO 11119-3',
            'Custom test protocols'
          ]
        },
        typical_lead_time_weeks: 18,
        cost_estimate: {
          full_qualification_usd: 125000,
          burst_test_only_usd: 12000,
          cycling_test_per_1000_cycles_usd: 3000,
          permeation_test_usd: 18000,
          custom_research_per_day_usd: 5500
        },
        contact: {
          email: 'hydrogen@swri.org',
          phone: '+1-210-684-5111',
          website: 'https://www.swri.org'
        },
        notes: 'Research-focused, custom test development, failure analysis expertise, highest capacity'
      },
      {
        id: 'lab_jrc',
        name: 'JRC',
        full_name: 'Joint Research Centre - European Commission',
        location: {
          city: 'Petten',
          country: 'Netherlands',
          region: 'Europe'
        },
        accreditations: [
          'ISO/IEC 17025',
          'EU research institution',
          'RvA (Dutch Accreditation Council)'
        ],
        capabilities: {
          max_test_pressure_bar: 1000,
          max_vessel_volume_liters: 400,
          max_vessel_length_mm: 2500,
          temperature_range_c: [-60, 180],
          test_types: [
            'Hydraulic burst',
            'Pressure cycling',
            'Permeation testing',
            'Hydrogen materials compatibility',
            'Long-term degradation studies',
            'Environmental testing',
            'Advanced NDT',
            'Hydrogen embrittlement'
          ],
          certifications_issued: [
            'Research certifications',
            'EU regulatory support',
            'ISO compliance verification'
          ]
        },
        typical_lead_time_weeks: 20,
        cost_estimate: {
          full_qualification_eur: 110000,
          burst_test_only_eur: 11000,
          cycling_test_per_1000_cycles_eur: 2800,
          permeation_test_eur: 16000,
          research_collaboration: 'Negotiable'
        },
        contact: {
          email: 'jrc-petten-info@ec.europa.eu',
          phone: '+31-224-565-656',
          website: 'https://ec.europa.eu/jrc'
        },
        notes: 'Research-oriented, EU policy support, long-term studies, collaborative projects'
      }
    ];

    // Statistics
    const regions = [...new Set(laboratories.map(lab => lab.location.region))];
    const avgLeadTime = laboratories.reduce((sum, lab) => sum + lab.typical_lead_time_weeks, 0) / laboratories.length;

    const response = {
      laboratories,
      total_labs: laboratories.length,
      regions_covered: regions,
      statistics: {
        average_lead_time_weeks: Math.round(avgLeadTime),
        max_pressure_capability_bar: Math.max(...laboratories.map(lab => lab.capabilities.max_test_pressure_bar)),
        max_volume_capability_liters: Math.max(...laboratories.map(lab => lab.capabilities.max_vessel_volume_liters)),
        all_test_types: [...new Set(laboratories.flatMap(lab => lab.capabilities.test_types))].sort()
      },
      selection_tips: [
        'Consider region for shipping logistics and cost',
        'Check max pressure and volume capabilities match your design',
        'Verify the lab can issue certifications for your target markets',
        'Factor in lead time for project planning',
        'Research labs (SwRI, JRC, BAM) offer custom test development',
        'European labs (TÜV, DNV, BAM) are preferred for EU certification',
        'CSA and SwRI are strong choices for North American markets',
        'Intertek offers cost advantages for Asian markets'
      ],
      certification_pathways: {
        'ISO 11119-3': ['TÜV SÜD', 'DNV GL', 'BAM', 'CSA Group', 'Intertek', 'SwRI'],
        'ISO 19881': ['TÜV SÜD', 'DNV GL', 'BAM', 'CSA Group', 'Intertek'],
        'UN R134': ['TÜV SÜD', 'DNV GL', 'BAM', 'Intertek'],
        'ASME BPVC Section X': ['CSA Group', 'SwRI'],
        'GB/T 35544 (China)': ['Intertek']
      }
    };

    return NextResponse.json(response, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
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
