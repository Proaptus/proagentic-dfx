import { NextRequest, NextResponse } from 'next/server';
import { getDataMode } from '@/lib/utils/data-mode';
import type {
  RequirementsInput,
  ParsedRequirementsResponse,
  ApplicationType,
  EnvironmentType,
  RegionType
} from '@/lib/types';

// Static response for demo purposes
const STATIC_RESPONSE: ParsedRequirementsResponse = {
  success: true,
  parsed_requirements: {
    pressure_bar: 700,
    pressure_type: 'working',
    volume_liters: 150,
    weight_max_kg: 80,
    cost_target_eur: null,
    application: 'automotive_hdt',
    environment: 'marine',
    service_life_years: 15,
    region: 'EU'
  },
  derived_requirements: {
    test_pressure_bar: 1050,
    burst_pressure_min_bar: 1575,
    burst_ratio_min: 2.25,
    cycle_life_min: 11000,
    permeation_max_nml_hr_l: 46,
    temp_range_c: [-40, 85],
    fire_test_required: true,
    fire_test_type: 'bonfire'
  },
  applicable_standards: [
    { id: 'ISO_11119_3', name: 'Gas cylinders - Composite construction', selected: true },
    { id: 'UN_R134', name: 'Hydrogen vehicles - Safety requirements', selected: true },
    { id: 'EC_79_2009', name: 'Type-approval (superseded)', selected: true },
    { id: 'SAE_J2579', name: 'US standard', selected: false }
  ],
  confidence: 0.94,
  warnings: ['Cost target not specified - will optimize for weight/reliability'],
  clarification_needed: []
};

// Simple NL parsing logic for simulated mode
function parseNaturalLanguage(text: string): ParsedRequirementsResponse {
  const result = JSON.parse(JSON.stringify(STATIC_RESPONSE)) as ParsedRequirementsResponse;
  const lowerText = text.toLowerCase();

  // Parse pressure
  const pressureMatch = lowerText.match(/(\d+)\s*bar/);
  if (pressureMatch) {
    result.parsed_requirements.pressure_bar = parseInt(pressureMatch[1]);
    result.derived_requirements.test_pressure_bar = result.parsed_requirements.pressure_bar * 1.5;
    result.derived_requirements.burst_pressure_min_bar = result.parsed_requirements.pressure_bar * 2.25;
  }

  // Parse volume
  const volumeMatch = lowerText.match(/(\d+)\s*l(?:iter)?s?/);
  if (volumeMatch) {
    result.parsed_requirements.volume_liters = parseInt(volumeMatch[1]);
  }

  // Parse weight
  const weightMatch = lowerText.match(/(?:max(?:imum)?|≤|<)\s*(\d+)\s*kg/);
  if (weightMatch) {
    result.parsed_requirements.weight_max_kg = parseInt(weightMatch[1]);
  }

  // Parse application type
  if (lowerText.includes('truck') || lowerText.includes('heavy-duty') || lowerText.includes('hdt')) {
    result.parsed_requirements.application = 'automotive_hdt';
  } else if (lowerText.includes('car') || lowerText.includes('passenger')) {
    result.parsed_requirements.application = 'automotive_passenger';
  } else if (lowerText.includes('aerospace') || lowerText.includes('aircraft')) {
    result.parsed_requirements.application = 'aerospace';
  } else if (lowerText.includes('marine') || lowerText.includes('ship') || lowerText.includes('boat')) {
    result.parsed_requirements.application = 'marine';
  }

  // Parse environment
  if (lowerText.includes('marine')) {
    result.parsed_requirements.environment = 'marine';
  } else if (lowerText.includes('arctic') || lowerText.includes('cold')) {
    result.parsed_requirements.environment = 'arctic';
  } else if (lowerText.includes('desert') || lowerText.includes('hot')) {
    result.parsed_requirements.environment = 'desert';
  } else if (lowerText.includes('corrosive')) {
    result.parsed_requirements.environment = 'corrosive';
  }

  // Parse service life
  const lifeMatch = lowerText.match(/(\d+)\s*year/);
  if (lifeMatch) {
    result.parsed_requirements.service_life_years = parseInt(lifeMatch[1]);
  }

  // Parse region
  if (lowerText.includes('eu') || lowerText.includes('europe')) {
    result.parsed_requirements.region = 'EU';
    result.applicable_standards[3].selected = false; // SAE not selected for EU
  } else if (lowerText.includes('us') || lowerText.includes('america')) {
    result.parsed_requirements.region = 'US';
    result.applicable_standards[3].selected = true; // SAE selected for US
  }

  // Calculate confidence based on how much was parsed
  let confidence = 0.70;
  if (pressureMatch) confidence += 0.08;
  if (volumeMatch) confidence += 0.06;
  if (weightMatch) confidence += 0.05;
  if (lifeMatch) confidence += 0.04;
  result.confidence = Math.min(confidence + Math.random() * 0.07, 0.99);

  // Update warnings
  result.warnings = [];
  if (!result.parsed_requirements.weight_max_kg) {
    result.warnings.push('Weight target not specified - will optimize for cost/reliability');
  }
  if (!result.parsed_requirements.cost_target_eur) {
    result.warnings.push('Cost target not specified - will include in multi-objective optimization');
  }

  return result;
}

// POST /api/requirements/parse - Parse natural language requirements
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RequirementsInput;

    let response: ParsedRequirementsResponse;

    if (getDataMode() === 'static') {
      // Return static demo data
      response = STATIC_RESPONSE;
    } else {
      // Parse the natural language input
      if (body.input_mode === 'natural_language' && body.raw_text) {
        response = parseNaturalLanguage(body.raw_text);
      } else if (body.input_mode === 'structured' && body.structured) {
        // For structured input, derive requirements
        response = {
          success: true,
          parsed_requirements: {
            pressure_bar: body.structured.pressure_bar,
            pressure_type: body.structured.pressure_type || 'working',
            volume_liters: body.structured.volume_liters,
            weight_max_kg: body.structured.weight_max_kg || null,
            cost_target_eur: body.structured.cost_target_eur || null,
            application: body.structured.application || 'automotive_hdt',
            environment: body.structured.environment || 'standard',
            service_life_years: body.structured.service_life_years || 15,
            region: body.structured.region || 'EU'
          },
          derived_requirements: {
            test_pressure_bar: body.structured.pressure_bar * 1.5,
            burst_pressure_min_bar: body.structured.pressure_bar * 2.25,
            burst_ratio_min: 2.25,
            cycle_life_min: 11000,
            permeation_max_nml_hr_l: 46,
            temp_range_c: [-40, 85],
            fire_test_required: true,
            fire_test_type: 'bonfire'
          },
          applicable_standards: STATIC_RESPONSE.applicable_standards,
          confidence: 0.99,
          warnings: [],
          clarification_needed: []
        };
      } else {
        return NextResponse.json(
          { error: 'Invalid input', message: 'Either raw_text or structured input is required' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error parsing requirements:', error);
    return NextResponse.json(
      { error: 'Failed to parse requirements', message: String(error) },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
