import { NextRequest, NextResponse } from 'next/server';
import type { TankType } from '@/lib/types';

// Mock request type that supports both old and new field names
interface MockTankTypeRequest {
  requirements: {
    pressure_bar?: number;
    working_pressure_bar?: number;
    volume_liters?: number;
    internal_volume_liters?: number;
    weight_max_kg?: number;
    target_weight_kg?: number;
    environment?: string;
  };
}

// Mock response type that matches what we actually return
// TODO: Align with lib/types TankTypeResponse
interface MockTankTypeResponse {
  recommended_type: TankType;
  confidence: number;
  reasoning: string;
  alternatives: Array<{ type: TankType; pros: string[]; cons: string[] }>;
}

// Type weight estimates (kg/L)
const TYPE_WEIGHTS: Record<TankType, { liner: string; kg_per_l: number }> = {
  'I': { liner: 'Steel', kg_per_l: 5.0 },
  'II': { liner: 'Steel', kg_per_l: 3.0 },
  'III': { liner: 'Aluminum', kg_per_l: 1.0 },
  'IV': { liner: 'HDPE', kg_per_l: 0.8 },
  'V': { liner: 'None (linerless)', kg_per_l: 0.6 }
};

function calculateTankTypeRecommendation(
  pressure_bar: number,
  volume_liters: number,
  weight_max_kg?: number,
  environment?: string
): MockTankTypeResponse {
  const targetKgPerL = weight_max_kg ? weight_max_kg / volume_liters : 1.0;

  // Calculate feasibility for each type
  const type_comparison = (Object.entries(TYPE_WEIGHTS) as [TankType, { liner: string; kg_per_l: number }][]).map(
    ([type, { liner, kg_per_l }]) => ({
      type,
      liner,
      kg_per_l,
      est_weight: Math.round(volume_liters * kg_per_l),
      feasible: weight_max_kg ? (volume_liters * kg_per_l) <= weight_max_kg : true
    })
  );

  // Find recommended type
  let recommendedType: TankType = 'IV';
  let confidence = 0.92;
  let rationale = '';

  // Type selection logic
  if (targetKgPerL < 0.65) {
    recommendedType = 'V';
    confidence = 0.75;
    rationale = `Weight target (${targetKgPerL.toFixed(2)} kg/L) requires Type V (linerless). However, Type V is emerging technology with limited certification history.`;
  } else if (targetKgPerL < 0.9) {
    recommendedType = 'IV';
    confidence = 0.92;
    rationale = `Weight target (${targetKgPerL.toFixed(2)} kg/L) is achievable with Type IV. HDPE liner provides proven permeation barrier and certification path.`;
  } else if (targetKgPerL < 1.2) {
    recommendedType = 'IV';
    confidence = 0.88;
    rationale = `Type IV recommended for best weight/cost balance. Type III (aluminum) would also meet requirements but at higher weight.`;
  } else {
    recommendedType = 'III';
    confidence = 0.95;
    rationale = `Weight target allows Type III (aluminum liner). This provides cost savings and simpler manufacturing vs composite types.`;
  }

  // Adjust for environment
  if (environment === 'marine' && recommendedType === 'V') {
    recommendedType = 'IV';
    confidence = 0.90;
    rationale = `Weight target suggests Type V but marine environment requires Type IV for proven certification path. Type V is unproven for UN R134 marine applications.`;
  }

  // Build alternatives
  const alternatives = type_comparison
    .filter(t => t.type !== recommendedType)
    .map(t => {
      let reason = '';
      let risk: 'low' | 'medium' | 'high' | undefined;

      if (t.type === 'I' || t.type === 'II') {
        reason = `Would be ~${t.est_weight} kg - significantly exceeds typical weight targets`;
      } else if (t.type === 'III' && !t.feasible) {
        reason = `Would be ~${t.est_weight} kg - exceeds ${weight_max_kg} kg target`;
      } else if (t.type === 'III' && t.feasible) {
        reason = `Feasible at ~${t.est_weight} kg but heavier than optimal composite solutions`;
        risk = 'low';
      } else if (t.type === 'IV' && recommendedType === 'V') {
        reason = `Achievable at ~${t.est_weight} kg with proven certification - recommended fallback`;
        risk = 'low';
      } else if (t.type === 'V') {
        reason = `Lightest option at ~${t.est_weight} kg but emerging technology with unproven certification for this application`;
        risk = 'high';
      }

      return {
        type: t.type,
        feasible: t.feasible,
        estimated_weight_kg: t.est_weight,
        reason,
        risk
      };
    });

  // Format for frontend compatibility
  const formattedAlternatives = type_comparison
    .filter(t => t.feasible || ['III', 'IV', 'V'].includes(t.type))
    .map(t => {
      const pros: string[] = [];
      const cons: string[] = [];

      if (t.type === 'III') {
        pros.push('Proven technology', 'Lower cost', 'Simpler manufacturing');
        cons.push(`Heavier (~${t.est_weight} kg)`, 'Aluminum corrosion risk');
      } else if (t.type === 'IV') {
        pros.push('Excellent weight/performance', 'Proven certification', 'Good permeation barrier');
        cons.push('Higher cost than Type III', 'Liner aging concerns');
      } else if (t.type === 'V') {
        pros.push('Lightest option', 'No liner aging', 'Maximum weight savings');
        cons.push('Emerging technology', 'Limited certification history', 'Higher permeation risk');
      }

      return { type: t.type, pros, cons };
    });

  return {
    recommended_type: recommendedType,
    confidence,
    reasoning: rationale,
    alternatives: formattedAlternatives
  };
}

// POST /api/tank-type/recommend - Get tank type recommendation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as MockTankTypeRequest;
    const req = body.requirements;

    // Support both old and new field names
    const pressure_bar = req.working_pressure_bar || req.pressure_bar;
    const volume_liters = req.internal_volume_liters || req.volume_liters;
    const weight_max_kg = req.target_weight_kg || req.weight_max_kg;
    const environment = req.environment;

    if (!pressure_bar || !volume_liters) {
      return NextResponse.json(
        { error: 'Invalid input', message: 'pressure_bar and volume_liters are required' },
        { status: 400 }
      );
    }

    const response = calculateTankTypeRecommendation(
      pressure_bar,
      volume_liters,
      weight_max_kg,
      environment
    );

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error generating tank type recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation', message: String(error) },
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
