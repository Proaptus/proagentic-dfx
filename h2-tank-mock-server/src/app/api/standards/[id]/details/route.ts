import { NextRequest, NextResponse } from 'next/server';
import standardsData from '../../../../../../data/static/standards/h2-standards.json';

// GET /api/standards/[id]/details - Get detailed standard info with key clauses
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const standardId = id.toUpperCase();

    // Find the standard
    const standard = standardsData.standards.find(s => s.id === standardId);
    if (!standard) {
      return NextResponse.json({ error: 'Standard not found' }, { status: 404 });
    }

    // Define detailed information for each standard
    const standardDetails: Record<string, unknown> = {
      ISO_11119_3: {
        full_title: 'Gas cylinders - Refillable composite gas cylinders and tubes - Design, construction and testing - Part 3: Fully wrapped fibre reinforced composite gas cylinders and tubes up to 450 l with load-sharing metal liners',
        scope: 'This standard specifies requirements for composite cylinders with metallic liners that share load with the composite overwrap.',
        key_clauses: [
          {
            clause: '5.2',
            title: 'Burst pressure requirements',
            summary: 'Minimum burst pressure ratio of 2.25 times the working pressure',
            critical: true
          },
          {
            clause: '6.3',
            title: 'Hydraulic cycling test',
            summary: 'Minimum 11,000 cycles without failure or leakage',
            critical: true
          },
          {
            clause: '7.4',
            title: 'Permeation testing',
            summary: 'Hydrogen permeation must be measured and documented',
            critical: true
          },
          {
            clause: '8.2',
            title: 'Fire resistance test',
            summary: 'Cylinder must not fragment when exposed to bonfire conditions',
            critical: true
          },
          {
            clause: '9.1',
            title: 'Ambient temperature cycle test',
            summary: 'Test at 15°C ± 5°C for specified number of cycles',
            critical: false
          },
          {
            clause: '10.5',
            title: 'Extreme temperature testing',
            summary: 'Verify performance at -40°C and +65°C',
            critical: false
          }
        ],
        test_requirements: [
          'Hydraulic burst test',
          'Pressure cycling (ambient)',
          'Pressure cycling (extreme temps)',
          'Boss torque test',
          'Permeation test',
          'Bonfire test',
          'Flaw tolerance test',
          'Drop test'
        ],
        applicability: {
          tank_types: ['Type 3 (metallic liner)'],
          pressure_range_bar: [200, 450],
          gas_types: ['Hydrogen', 'CNG', 'Other compressed gases']
        }
      },
      UN_R134: {
        full_title: 'United Nations Regulation No. 134 - Uniform provisions concerning the approval of motor vehicles and their components with regard to the safety-related performance of hydrogen-fuelled vehicles (HFCV)',
        scope: 'This regulation establishes safety requirements for hydrogen fuel systems in vehicles, including fuel containers.',
        key_clauses: [
          {
            clause: '3.1',
            title: 'Container definitions',
            summary: 'Defines Type 3 and Type 4 containers for hydrogen storage',
            critical: false
          },
          {
            clause: '5.2.3',
            title: 'Burst pressure ratio',
            summary: 'Minimum 2.25 × nominal working pressure',
            critical: true
          },
          {
            clause: '5.3.1',
            title: 'Pressure cycling',
            summary: 'Type 4 containers: minimum 5,500 cycles at extreme temperatures',
            critical: true
          },
          {
            clause: '6.2.1',
            title: 'Bonfire test requirements',
            summary: 'Container must vent through PRD without rupture',
            critical: true
          },
          {
            clause: '6.3.1',
            title: 'Gunfire test',
            summary: 'Container must not fragment when penetrated by projectile',
            critical: true
          },
          {
            clause: '7.1',
            title: 'Temperature extremes',
            summary: 'Containers must operate from -40°C to +85°C',
            critical: true
          },
          {
            clause: '8.2',
            title: 'Drop test',
            summary: 'Containers must survive specified drop heights',
            critical: false
          }
        ],
        test_requirements: [
          'Hydraulic burst',
          'Pressure cycling at extremes',
          'Leak tightness',
          'Permeation',
          'Bonfire test',
          'Gunfire test',
          'Drop test',
          'Chemical exposure',
          'Boss torque',
          'Flaw tolerance'
        ],
        applicability: {
          tank_types: ['Type 3', 'Type 4'],
          pressure_range_bar: [350, 700],
          gas_types: ['Hydrogen only']
        }
      },
      EC_79_2009: {
        full_title: 'EC Regulation 79/2009 - Type-approval of hydrogen-powered motor vehicles (Superseded by UN R134)',
        scope: 'This regulation covered hydrogen vehicle safety requirements before being replaced by UN R134.',
        key_clauses: [
          {
            clause: '4.1',
            title: 'Burst ratio requirement',
            summary: 'Minimum 2.25 × working pressure',
            critical: true
          },
          {
            clause: '4.2',
            title: 'Cycle life',
            summary: 'Minimum 5,500 cycles for Type 4 containers',
            critical: true
          },
          {
            clause: '5.1',
            title: 'Permeation limits',
            summary: 'Maximum allowable hydrogen permeation rates',
            critical: true
          }
        ],
        test_requirements: [
          'Burst test',
          'Pressure cycling',
          'Permeation test',
          'Fire resistance',
          'Environmental tests'
        ],
        applicability: {
          tank_types: ['Type 3', 'Type 4'],
          pressure_range_bar: [350, 700],
          gas_types: ['Hydrogen']
        },
        superseded_by: 'UN_R134',
        superseded_date: '2016-06-25'
      },
      SAE_J2579: {
        full_title: 'SAE J2579 - Standard for Fuel Systems in Fuel Cell and Other Hydrogen Vehicles',
        scope: 'Technical information report providing recommended practices for hydrogen fuel systems in vehicles.',
        key_clauses: [
          {
            clause: '4.3',
            title: 'Container requirements',
            summary: 'References applicable DOT and ISO standards for containers',
            critical: false
          },
          {
            clause: '5.1',
            title: 'System safety requirements',
            summary: 'Hydrogen detection and ventilation requirements',
            critical: true
          },
          {
            clause: '6.2',
            title: 'Pressure relief devices',
            summary: 'PRD activation pressure and venting requirements',
            critical: true
          },
          {
            clause: '7.4',
            title: 'Material compatibility',
            summary: 'Requirements for materials in contact with hydrogen',
            critical: true
          }
        ],
        test_requirements: [
          'Leak test',
          'PRD functional test',
          'Hydrogen sensor calibration',
          'Material compatibility testing',
          'System integrity test'
        ],
        applicability: {
          tank_types: ['All types (system level)'],
          pressure_range_bar: [350, 875],
          gas_types: ['Hydrogen']
        }
      },
      ISO_19881: {
        full_title: 'ISO 19881 - Gaseous hydrogen - Land vehicle fuel containers',
        scope: 'Comprehensive standard specifically for hydrogen fuel containers used in land vehicles.',
        key_clauses: [
          {
            clause: '5.1.1',
            title: 'Burst pressure',
            summary: 'Minimum burst ratio 2.25 for Type 4 containers',
            critical: true
          },
          {
            clause: '5.2.3',
            title: 'Pressure cycling requirements',
            summary: '11,000 cycles minimum for 70 MPa containers',
            critical: true
          },
          {
            clause: '6.1',
            title: 'Permeation requirements',
            summary: 'Maximum H2 permeation: 0.5 NmL/h/L at NWP',
            critical: true
          },
          {
            clause: '7.3',
            title: 'Fire resistance',
            summary: 'Bonfire test with PRD activation required',
            critical: true
          },
          {
            clause: '8.1',
            title: 'Drop test specification',
            summary: 'Filled container dropped from specified height',
            critical: true
          },
          {
            clause: '9.2',
            title: 'Environmental conditioning',
            summary: 'Tests at temperature extremes: -40°C to +85°C',
            critical: false
          },
          {
            clause: '10.4',
            title: 'Flaw tolerance',
            summary: 'Container must tolerate specified flaw sizes',
            critical: false
          }
        ],
        test_requirements: [
          'Burst test',
          'Ambient pressure cycling (11,000)',
          'Extreme temperature cycling (5,500)',
          'Permeation test',
          'Bonfire test',
          'Drop test',
          'Penetration test',
          'Boss torque test',
          'Accelerated stress rupture',
          'Flaw tolerance'
        ],
        applicability: {
          tank_types: ['Type 3', 'Type 4'],
          pressure_range_bar: [350, 700, 875],
          gas_types: ['Hydrogen only']
        }
      }
    };

    const details = standardDetails[standardId];
    if (!details) {
      return NextResponse.json({
        error: 'Detailed information not available for this standard'
      }, { status: 404 });
    }

    const response = {
      ...standard,
      ...details,
      certification_bodies: [
        'TÜV SÜD',
        'DNV GL',
        'BAM Federal Institute',
        'CSA Group',
        'Intertek'
      ],
      related_standards: standardId === 'EC_79_2009'
        ? ['UN_R134']
        : standardId === 'UN_R134'
        ? ['ISO_19881', 'SAE_J2579']
        : ['ISO_11119_3', 'UN_R134'],
      document_access: {
        purchase_url: `https://www.iso.org/standard/${standardId}`,
        price_usd: standardId.startsWith('ISO') ? 150 : standardId.startsWith('UN') ? 0 : 75,
        pages: standardId === 'ISO_19881' ? 82 : standardId === 'ISO_11119_3' ? 64 : 45
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
