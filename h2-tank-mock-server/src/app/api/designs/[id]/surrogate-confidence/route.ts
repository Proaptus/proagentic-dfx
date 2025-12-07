import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// REQ-090: Surrogate model confidence display
// REQ-091: Prediction confidence intervals
// REQ-092: Validation FEA recommendation
// REQ-093: Model accuracy by output

// GET /api/designs/[id]/surrogate-confidence - Get surrogate model confidence data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const designId = id.toUpperCase();

    const validDesigns = ['A', 'B', 'C', 'D', 'E'];
    if (!validDesigns.includes(designId)) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'data', 'static', 'designs', `design-${designId.toLowerCase()}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const design = JSON.parse(fileContent);

    // REQ-090: R² scores for surrogate model outputs
    const modelAccuracy = {
      overall_r2: 0.982,
      training_samples: 2500,
      validation_samples: 500,
      cross_validation_folds: 5,
      outputs: [
        // REQ-093: Per-output accuracy breakdown
        { output: 'Weight', r2: 0.996, rmse: 0.42, units: 'kg', description: 'Tank total mass' },
        { output: 'Burst Pressure', r2: 0.991, rmse: 12.3, units: 'bar', description: 'Ultimate failure pressure' },
        { output: 'Cost', r2: 0.988, rmse: 89, units: 'EUR', description: 'Manufacturing cost estimate' },
        { output: 'Max Stress', r2: 0.978, rmse: 8.7, units: 'MPa', description: 'Peak fiber direction stress' },
        { output: 'Fatigue Life', r2: 0.964, rmse: 0.08, units: 'log10(cycles)', description: 'Cycles to failure at service pressure' },
        { output: 'Permeation Rate', r2: 0.952, rmse: 0.003, units: 'cc/hr/L', description: 'Hydrogen permeation through liner' }
      ]
    };

    // REQ-091: Prediction confidence intervals for this specific design
    const predictionConfidence = {
      design_id: designId,
      predictions: [
        {
          output: 'Weight',
          predicted: design.summary?.weight_kg || 85.2,
          lower_95: (design.summary?.weight_kg || 85.2) - 1.2,
          upper_95: (design.summary?.weight_kg || 85.2) + 1.2,
          confidence_width_pct: 2.8
        },
        {
          output: 'Burst Pressure',
          predicted: design.summary?.burst_pressure_bar || 1247,
          lower_95: (design.summary?.burst_pressure_bar || 1247) - 35,
          upper_95: (design.summary?.burst_pressure_bar || 1247) + 35,
          confidence_width_pct: 5.6
        },
        {
          output: 'Cost',
          predicted: design.summary?.cost_eur || 12500,
          lower_95: (design.summary?.cost_eur || 12500) - 450,
          upper_95: (design.summary?.cost_eur || 12500) + 450,
          confidence_width_pct: 7.2
        },
        {
          output: 'Max Stress',
          predicted: 892,
          lower_95: 865,
          upper_95: 919,
          confidence_width_pct: 6.1
        },
        {
          output: 'Fatigue Life',
          predicted: 5.2,
          lower_95: 5.0,
          upper_95: 5.4,
          confidence_width_pct: 7.7,
          note: 'log10(cycles), higher is better'
        }
      ]
    };

    // REQ-092: Validation FEA recommendation
    const validationRecommendation = {
      fea_validation_recommended: determineFeaRecommendation(designId, modelAccuracy),
      recommendation_reasons: getRecommendationReasons(designId, modelAccuracy),
      priority: designId === 'C' ? 'high' : designId === 'A' ? 'medium' : 'low',
      estimated_fea_time_hours: 4,
      key_outputs_to_validate: ['Burst Pressure', 'Max Stress', 'Fatigue Life'],
      trigger_conditions: [
        'Novel geometry outside training envelope',
        'CI width > 10% for critical output',
        'Design selected for manufacturing',
        'Regulatory submission required'
      ]
    };

    const response = {
      design_id: designId,
      model_accuracy: modelAccuracy,
      prediction_confidence: predictionConfidence,
      validation_recommendation: validationRecommendation,
      model_metadata: {
        model_type: 'Gaussian Process with RBF kernel',
        feature_count: 12,
        training_date: '2024-11-15',
        input_parameters: [
          'Inner radius (mm)',
          'Cylinder length (mm)',
          'Dome shape factor',
          'Liner material',
          'Liner thickness (mm)',
          'Helical angle (deg)',
          'Helical layers',
          'Hoop layers',
          'Fiber material',
          'Operating pressure (bar)',
          'Burst factor',
          'Ambient temperature (°C)'
        ]
      }
    };

    return NextResponse.json(response, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function determineFeaRecommendation(designId: string, accuracy: { overall_r2: number }): boolean {
  // Recommend FEA validation for selected designs or if accuracy is borderline
  if (designId === 'C') return true; // Selected design always validate
  if (accuracy.overall_r2 < 0.95) return true; // Low confidence
  return false;
}

function getRecommendationReasons(designId: string, accuracy: { overall_r2: number; outputs: Array<{ output: string; r2: number }> }): string[] {
  const reasons: string[] = [];

  if (designId === 'C') {
    reasons.push('Design C is the recommended candidate for manufacturing');
    reasons.push('Full FEA validation required before prototype production');
  }

  const lowAccuracyOutputs = accuracy.outputs.filter(o => o.r2 < 0.97);
  if (lowAccuracyOutputs.length > 0) {
    reasons.push(`Lower surrogate accuracy for: ${lowAccuracyOutputs.map(o => o.output).join(', ')}`);
  }

  if (reasons.length === 0) {
    reasons.push('Surrogate predictions within acceptable confidence bounds');
    reasons.push('FEA validation optional for initial assessment');
  }

  return reasons;
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
