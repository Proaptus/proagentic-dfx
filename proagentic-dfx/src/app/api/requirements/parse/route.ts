import { NextRequest, NextResponse } from 'next/server';
import { getDataMode } from '@/lib/utils/data-mode';

// Local type definitions for API route
type ApplicationType = 'automotive_passenger' | 'automotive_hdt' | 'aerospace' | 'marine' | 'stationary' | 'portable';
type EnvironmentType = 'standard' | 'marine' | 'arctic' | 'desert' | 'corrosive';
type RegionType = 'EU' | 'US' | 'Asia' | 'International';

interface RequirementsInput {
  input_mode?: 'natural_language' | 'structured';
  raw_text?: string;
  structured?: {
    pressure_bar?: number;
    volume_liters?: number;
    weight_max_kg?: number;
    cost_target_eur?: number;
    application?: string;
    environment?: string;
    service_life_years?: number;
    region?: string;
  };
}

interface ParsedRequirementsResponse {
  success: boolean;
  parsed_requirements: Record<string, unknown>;
  derived_requirements: Record<string, unknown>;
  applicable_standards: Array<{ id: string; name: string; region: string; relevance: string; key_requirements: string[] }>;
  confidence: number;
  warnings: string[];
  clarification_needed: string[];
}

// Static response for demo purposes - field names match frontend types exactly
const STATIC_RESPONSE = {
  success: true,
  parsed_requirements: {
    internal_volume_liters: 150,
    working_pressure_bar: 700,
    target_weight_kg: 80,
    target_cost_eur: 15000,
    min_burst_ratio: 2.25,
    max_permeation_rate: 46,
    operating_temp_min_c: -40,
    operating_temp_max_c: 85,
    fatigue_cycles: 11000,
    certification_region: 'EU'
  },
  derived_requirements: {
    burst_pressure_bar: 1575,
    test_pressure_bar: 1050,
    min_wall_thickness_mm: 24.5,
    applicable_standards: ['ISO_11119_3', 'UN_R134', 'EC_79_2009']
  },
  applicable_standards: [
    { id: 'ISO_11119_3', name: 'Gas cylinders - Composite construction', region: 'International', relevance: 'Primary', key_requirements: ['Burst ratio ≥2.25', 'Permeation ≤46 NmL/hr/L'] },
    { id: 'UN_R134', name: 'Hydrogen vehicles - Safety requirements', region: 'EU', relevance: 'Primary', key_requirements: ['Temperature -40°C to +85°C', 'Fire test'] },
    { id: 'EC_79_2009', name: 'Type-approval (superseded)', region: 'EU', relevance: 'Legacy', key_requirements: ['Burst test', 'Pressure cycling'] }
  ],
  confidence: 0.94,
  warnings: [],
  clarification_needed: []
};

// Simple NL parsing logic for simulated mode
function parseNaturalLanguage(text: string) {
  const result = JSON.parse(JSON.stringify(STATIC_RESPONSE));
  const lowerText = text.toLowerCase();

  // Parse pressure
  const pressureMatch = lowerText.match(/(\d+)\s*bar/);
  if (pressureMatch) {
    result.parsed_requirements.working_pressure_bar = parseInt(pressureMatch[1]);
    result.derived_requirements.test_pressure_bar = result.parsed_requirements.working_pressure_bar * 1.5;
    result.derived_requirements.burst_pressure_bar = result.parsed_requirements.working_pressure_bar * 2.25;
  }

  // Parse volume
  const volumeMatch = lowerText.match(/(\d+)\s*l(?:iter)?s?/);
  if (volumeMatch) {
    result.parsed_requirements.internal_volume_liters = parseInt(volumeMatch[1]);
  }

  // Parse weight
  const weightMatch = lowerText.match(/(\d+)\s*kg/);
  if (weightMatch) {
    result.parsed_requirements.target_weight_kg = parseInt(weightMatch[1]);
  }

  // Parse cost
  const costMatch = lowerText.match(/[€$]?\s*(\d+[,.]?\d*)\s*(?:maximum|max)?/);
  if (costMatch && lowerText.includes('cost')) {
    result.parsed_requirements.target_cost_eur = parseInt(costMatch[1].replace(/[,\.]/g, ''));
  }

  // Parse temperature range
  const tempMatch = lowerText.match(/-(\d+)°?c?\s*to\s*\+?(\d+)°?c?/);
  if (tempMatch) {
    result.parsed_requirements.operating_temp_min_c = -parseInt(tempMatch[1]);
    result.parsed_requirements.operating_temp_max_c = parseInt(tempMatch[2]);
  }

  // Parse burst ratio
  const burstMatch = lowerText.match(/burst\s*ratio[:\s]*(\d+\.?\d*)/);
  if (burstMatch) {
    result.parsed_requirements.min_burst_ratio = parseFloat(burstMatch[1]);
  }

  // Parse permeation
  const permMatch = lowerText.match(/permeation[:\s]*(\d+)/);
  if (permMatch) {
    result.parsed_requirements.max_permeation_rate = parseInt(permMatch[1]);
  }

  // Parse fatigue cycles
  const fatigueMatch = lowerText.match(/(\d+[,.]?\d*)\s*cycles/);
  if (fatigueMatch) {
    result.parsed_requirements.fatigue_cycles = parseInt(fatigueMatch[1].replace(/[,\.]/g, ''));
  }

  // Parse region
  if (lowerText.includes('eu') || lowerText.includes('europe')) {
    result.parsed_requirements.certification_region = 'EU';
  } else if (lowerText.includes('us') || lowerText.includes('america')) {
    result.parsed_requirements.certification_region = 'US';
  }

  // Calculate confidence based on how much was parsed
  let confidence = 0.70;
  if (pressureMatch) confidence += 0.08;
  if (volumeMatch) confidence += 0.06;
  if (weightMatch) confidence += 0.05;
  if (costMatch) confidence += 0.05;
  result.confidence = Math.min(confidence + Math.random() * 0.07, 0.99);

  // Update warnings
  result.warnings = [];

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
      // Parse the natural language input - support both input_mode and direct raw_text
      if (body.raw_text || (body.input_mode === 'natural_language' && body.raw_text)) {
        response = parseNaturalLanguage(body.raw_text);
      } else if (body.input_mode === 'structured' && body.structured) {
        // For structured input, derive requirements (matching frontend types)
        const pressure = body.structured.pressure_bar || 700;
        response = {
          success: true,
          parsed_requirements: {
            internal_volume_liters: body.structured.volume_liters || 150,
            working_pressure_bar: pressure,
            target_weight_kg: body.structured.weight_max_kg || 80,
            target_cost_eur: body.structured.cost_target_eur || 15000,
            min_burst_ratio: 2.25,
            max_permeation_rate: 46,
            operating_temp_min_c: -40,
            operating_temp_max_c: 85,
            fatigue_cycles: 11000,
            certification_region: body.structured.region || 'EU'
          },
          derived_requirements: {
            burst_pressure_bar: pressure * 2.25,
            test_pressure_bar: pressure * 1.5,
            min_wall_thickness_mm: 24.5,
            applicable_standards: ['ISO_11119_3', 'UN_R134', 'EC_79_2009']
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
