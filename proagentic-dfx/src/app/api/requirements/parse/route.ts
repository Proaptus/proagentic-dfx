import { NextRequest, NextResponse } from 'next/server';
import { getDataMode } from '@/lib/utils/data-mode';

// Request input type
interface RequirementsInput {
  raw_text?: string;
  input_mode?: 'natural_language' | 'structured';
  structured?: {
    pressure_bar?: number;
    volume_liters?: number;
    weight_max_kg?: number;
    cost_target_eur?: number;
    region?: string;
  };
}

// Mock response type that matches what we actually return
// TODO: Align with lib/types ParsedRequirementsResponse
interface MockParsedResponse {
  success: boolean;
  parsed_requirements: Record<string, unknown>;
  derived_requirements: Record<string, unknown>;
  applicable_standards: Array<Record<string, unknown>>;
  confidence: number;
  warnings: string[];
  clarification_needed: string[];
}

// Response data for requirements parsing - field names match frontend types exactly
const PARSE_RESPONSE_DATA = {
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

// ISSUE-008: Helper to parse numbers with SI prefixes (k=1000, M=1000000)
function parseNumberWithSuffix(value: string): number {
  const cleanValue = value.replace(/[,\s]/g, '').toLowerCase();
  const match = cleanValue.match(/^([\d.]+)([km])?$/i);
  if (!match) return parseFloat(cleanValue) || 0;

  const num = parseFloat(match[1]);
  const suffix = match[2]?.toLowerCase();

  if (suffix === 'k') return num * 1000;
  if (suffix === 'm') return num * 1000000;
  return num;
}

// Simple NL parsing logic for simulated mode
function parseNaturalLanguage(text: string) {
  const result = JSON.parse(JSON.stringify(PARSE_RESPONSE_DATA));
  const lowerText = text.toLowerCase();

  // Parse pressure
  const pressureMatch = lowerText.match(/(\d+)\s*bar/);
  if (pressureMatch) {
    result.parsed_requirements.working_pressure_bar = parseInt(pressureMatch[1]);
    result.derived_requirements.test_pressure_bar = result.parsed_requirements.working_pressure_bar * 1.5;
    result.derived_requirements.burst_pressure_bar = result.parsed_requirements.working_pressure_bar * 2.25;
  }

  // ISSUE-008: Parse volume with k/M suffix support (e.g., "50k liters")
  const volumeMatch = lowerText.match(/([\d.]+[km]?)\s*l(?:iter)?s?/i);
  if (volumeMatch) {
    result.parsed_requirements.internal_volume_liters = parseNumberWithSuffix(volumeMatch[1]);
  }

  // ISSUE-009: Context-aware parsing for weight vs hydrogen capacity
  // First check for hydrogen capacity patterns (e.g., "5 kg capacity", "hydrogen capacity 5 kg", "store 5 kg")
  const hydrogenCapacityPatterns = [
    /hydrogen\s*(?:storage\s*)?capacity[:\s]*([\d.]+[km]?)\s*kg/i,
    /([\d.]+[km]?)\s*kg\s*(?:of\s*)?(?:hydrogen\s*)?(?:storage\s*)?capacity/i,
    /store\s*([\d.]+[km]?)\s*kg\s*(?:of\s*)?hydrogen/i,
    /(?:hold|store|contain)\s*([\d.]+[km]?)\s*kg/i,
    /([\d.]+[km]?)\s*kg\s*(?:h2|hydrogen)\s*(?:storage)?/i,
  ];

  let hydrogenCapacityFound = false;
  for (const pattern of hydrogenCapacityPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      result.parsed_requirements.hydrogen_capacity_kg = parseNumberWithSuffix(match[1]);
      hydrogenCapacityFound = true;
      break;
    }
  }

  // ISSUE-008/009: Parse tank weight with context awareness
  // Look for explicit weight patterns (e.g., "target weight 80 kg", "weight limit", "tank weight", "max weight")
  const tankWeightPatterns = [
    /(?:target|tank|maximum|max|total)\s*weight[:\s]*([\d.]+[km]?)\s*kg/i,
    /weight\s*(?:limit|target|max)[:\s]*([\d.]+[km]?)\s*kg/i,
    /weigh(?:s|ing)?\s*(?:less\s*than\s*)?([\d.]+[km]?)\s*kg/i,
    /([\d.]+[km]?)\s*kg\s*(?:max(?:imum)?\s*)?weight/i,
  ];

  let tankWeightFound = false;
  for (const pattern of tankWeightPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      result.parsed_requirements.target_weight_kg = parseNumberWithSuffix(match[1]);
      tankWeightFound = true;
      break;
    }
  }

  // Fallback: If no specific context found, use generic "X kg" pattern for weight
  // but only if hydrogen capacity wasn't already captured with this value
  if (!tankWeightFound) {
    const genericWeightMatch = lowerText.match(/([\d.]+[km]?)\s*kg/i);
    if (genericWeightMatch) {
      const value = parseNumberWithSuffix(genericWeightMatch[1]);
      // Only assign to weight if this value wasn't already assigned to hydrogen capacity
      if (!hydrogenCapacityFound || result.parsed_requirements.hydrogen_capacity_kg !== value) {
        result.parsed_requirements.target_weight_kg = value;
      }
    }
  }

  // ISSUE-008: Parse cost with k/M suffix support (e.g., "€15k", "$50k")
  const costMatch = lowerText.match(/[€$£]?\s*([\d,.]+[km]?)\s*(?:maximum|max)?/i);
  if (costMatch && lowerText.includes('cost')) {
    result.parsed_requirements.target_cost_eur = parseNumberWithSuffix(costMatch[1]);
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

  // ISSUE-008: Parse fatigue cycles with k/M suffix support (e.g., "50k cycles")
  const fatigueMatch = lowerText.match(/([\d,.]+[km]?)\s*cycles/i);
  if (fatigueMatch) {
    result.parsed_requirements.fatigue_cycles = parseNumberWithSuffix(fatigueMatch[1]);
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
  if (tankWeightFound || hydrogenCapacityFound) confidence += 0.05;
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

    let response: MockParsedResponse;

    if (getDataMode() === 'static') {
      // Return static demo data
      response = PARSE_RESPONSE_DATA;
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
          applicable_standards: PARSE_RESPONSE_DATA.applicable_standards,
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
