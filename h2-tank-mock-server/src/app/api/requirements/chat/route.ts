import { NextRequest, NextResponse } from 'next/server';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ExtractedRequirement {
  field: string;
  label: string;
  value: string | number | null;
  confidence: number;
  unit?: string;
  editable: boolean;
}

// Mock dialogue state tracking - exported for potential use by other modules
export const dialogueStates = new Map<string, {
  stage: number;
  requirements: Record<string, { value: unknown; confidence: number }>;
}>();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_history } = await request.json() as {
      message: string;
      conversation_history: ConversationMessage[];
    };

    // Determine conversation stage based on history length
    const stage = Math.floor(conversation_history.length / 2);

    // Extract requirements from conversation
    const requirements = extractRequirementsFromConversation(conversation_history, message);

    // Generate intelligent response based on stage and extracted info
    const response = generateIntelligentResponse(stage, message, requirements);

    return NextResponse.json({
      message: response.message,
      extracted_requirements: response.extracted_requirements,
      follow_up_question: response.follow_up_question,
      suggestions: response.suggestions,
      is_complete: response.is_complete,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500, headers: corsHeaders }
    );
  }
}

function extractRequirementsFromConversation(
  history: ConversationMessage[],
  latestMessage: string
): Record<string, { value: unknown; confidence: number }> {
  const requirements: Record<string, { value: unknown; confidence: number }> = {};

  const allUserMessages = [...history.filter((m) => m.role === 'user').map((m) => m.content), latestMessage].join(' ').toLowerCase();

  // Application type detection
  if (allUserMessages.includes('automotive') || allUserMessages.includes('car') || allUserMessages.includes('vehicle')) {
    requirements.application_type = { value: 'automotive', confidence: 0.95 };
    requirements.working_pressure_bar = { value: 700, confidence: 0.85 };
    requirements.operating_temp_min_c = { value: -40, confidence: 0.9 };
    requirements.operating_temp_max_c = { value: 85, confidence: 0.9 };
  } else if (allUserMessages.includes('aviation') || allUserMessages.includes('aircraft') || allUserMessages.includes('drone')) {
    requirements.application_type = { value: 'aviation', confidence: 0.95 };
    requirements.working_pressure_bar = { value: 350, confidence: 0.75 };
    requirements.target_weight_kg = { value: 50, confidence: 0.6 };
  } else if (allUserMessages.includes('stationary') || allUserMessages.includes('storage') || allUserMessages.includes('facility')) {
    requirements.application_type = { value: 'stationary', confidence: 0.95 };
    requirements.working_pressure_bar = { value: 500, confidence: 0.7 };
    requirements.target_cost_eur = { value: 8000, confidence: 0.6 };
  }

  // Pressure detection
  const pressureMatch = allUserMessages.match(/(\d+)\s*(bar|mpa)/i);
  if (pressureMatch) {
    const value = parseInt(pressureMatch[1], 10);
    requirements.working_pressure_bar = {
      value: pressureMatch[2].toLowerCase() === 'mpa' ? value * 10 : value,
      confidence: 0.95,
    };
  }

  // Capacity detection
  const capacityMatch = allUserMessages.match(/(\d+\.?\d*)\s*(kg|liters?|l)\s*(h2|hydrogen)?/i);
  if (capacityMatch) {
    const value = parseFloat(capacityMatch[1]);
    if (capacityMatch[2].toLowerCase().startsWith('kg')) {
      requirements.storage_capacity_kg = { value, confidence: 0.95 };
      // Estimate volume from mass (assuming 700 bar)
      requirements.internal_volume_liters = { value: Math.round(value * 30), confidence: 0.7 };
    } else {
      requirements.internal_volume_liters = { value, confidence: 0.95 };
    }
  }

  // Weight target detection
  const weightMatch = allUserMessages.match(/(?:weight|weigh).*?(\d+)\s*kg/i);
  if (weightMatch) {
    requirements.target_weight_kg = { value: parseInt(weightMatch[1], 10), confidence: 0.9 };
  }

  // Cost target detection
  const costMatch = allUserMessages.match(/(?:cost|budget|price).*?[€$]?\s*(\d+[,\d]*)/i);
  if (costMatch) {
    const value = parseInt(costMatch[1].replace(/,/g, ''), 10);
    requirements.target_cost_eur = { value, confidence: 0.85 };
  }

  // Temperature range detection
  const tempMatch = allUserMessages.match(/(-?\d+)\s*°?c\s*to\s*\+?(-?\d+)\s*°?c/i);
  if (tempMatch) {
    requirements.operating_temp_min_c = { value: parseInt(tempMatch[1], 10), confidence: 0.95 };
    requirements.operating_temp_max_c = { value: parseInt(tempMatch[2], 10), confidence: 0.95 };
  }

  // Standards detection
  if (allUserMessages.includes('iso') || allUserMessages.includes('11119')) {
    requirements.certification_region = { value: 'EU', confidence: 0.9 };
  } else if (allUserMessages.includes('un r134') || allUserMessages.includes('r134')) {
    requirements.certification_region = { value: 'EU', confidence: 0.95 };
  } else if (allUserMessages.includes('asme') || allUserMessages.includes('usa') || allUserMessages.includes('us market')) {
    requirements.certification_region = { value: 'USA', confidence: 0.9 };
  }

  // Fatigue cycles
  const fatigueMatch = allUserMessages.match(/(\d+[,\d]*)\s*cycles?/i);
  if (fatigueMatch) {
    requirements.fatigue_cycles = {
      value: parseInt(fatigueMatch[1].replace(/,/g, ''), 10),
      confidence: 0.9,
    };
  }

  return requirements;
}

function generateIntelligentResponse(
  stage: number,
  userMessage: string,
  extractedReqs: Record<string, { value: unknown; confidence: number }>
): {
  message: string;
  extracted_requirements: ExtractedRequirement[];
  follow_up_question?: string;
  suggestions?: string[];
  is_complete: boolean;
} {
  const allRequirements: ExtractedRequirement[] = [
    {
      field: 'application_type',
      label: 'Application Type',
      value: extractedReqs.application_type?.value as string || null,
      confidence: extractedReqs.application_type?.confidence || 0,
      editable: true,
    },
    {
      field: 'working_pressure_bar',
      label: 'Working Pressure',
      value: extractedReqs.working_pressure_bar?.value as number || null,
      confidence: extractedReqs.working_pressure_bar?.confidence || 0,
      unit: 'bar',
      editable: true,
    },
    {
      field: 'internal_volume_liters',
      label: 'Internal Volume',
      value: extractedReqs.internal_volume_liters?.value as number || null,
      confidence: extractedReqs.internal_volume_liters?.confidence || 0,
      unit: 'L',
      editable: true,
    },
    {
      field: 'storage_capacity_kg',
      label: 'H₂ Storage Capacity',
      value: extractedReqs.storage_capacity_kg?.value as number || null,
      confidence: extractedReqs.storage_capacity_kg?.confidence || 0,
      unit: 'kg H₂',
      editable: true,
    },
    {
      field: 'target_weight_kg',
      label: 'Target Weight',
      value: extractedReqs.target_weight_kg?.value as number || null,
      confidence: extractedReqs.target_weight_kg?.confidence || 0,
      unit: 'kg',
      editable: true,
    },
    {
      field: 'target_cost_eur',
      label: 'Target Cost',
      value: extractedReqs.target_cost_eur?.value as number || null,
      confidence: extractedReqs.target_cost_eur?.confidence || 0,
      unit: '€',
      editable: true,
    },
    {
      field: 'operating_temp_min_c',
      label: 'Min Operating Temperature',
      value: extractedReqs.operating_temp_min_c?.value as number || null,
      confidence: extractedReqs.operating_temp_min_c?.confidence || 0,
      unit: '°C',
      editable: true,
    },
    {
      field: 'operating_temp_max_c',
      label: 'Max Operating Temperature',
      value: extractedReqs.operating_temp_max_c?.value as number || null,
      confidence: extractedReqs.operating_temp_max_c?.confidence || 0,
      unit: '°C',
      editable: true,
    },
    {
      field: 'fatigue_cycles',
      label: 'Fatigue Life',
      value: extractedReqs.fatigue_cycles?.value as number || null,
      confidence: extractedReqs.fatigue_cycles?.confidence || 0,
      unit: 'cycles',
      editable: true,
    },
    {
      field: 'certification_region',
      label: 'Certification Region',
      value: extractedReqs.certification_region?.value as string || null,
      confidence: extractedReqs.certification_region?.confidence || 0,
      editable: true,
    },
  ];

  // Context-aware responses based on what was detected
  const lowerMessage = userMessage.toLowerCase();

  // Stage 0: Application type question
  if (stage === 0) {
    if (lowerMessage.includes('automotive')) {
      return {
        message: "Great! For automotive applications, I'll help you design a hydrogen fuel cell tank. The automotive industry typically uses 700 bar Type IV tanks for optimal gravimetric efficiency.\n\nNow, let's talk about capacity. How much hydrogen do you need to store? You can specify this as either:\n- Storage capacity in kg of H₂ (typical: 5-6 kg for 500-600 km range)\n- Internal volume in liters (typical: 150-180 L)",
        extracted_requirements: allRequirements,
        suggestions: ['5 kg H₂', '150 liters', '6 kg for 600 km range'],
        is_complete: false,
      };
    } else if (lowerMessage.includes('aviation')) {
      return {
        message: "Aviation applications - excellent choice! For aircraft and drones, weight is critical. Aviation typically uses 350 bar Type III or Type IV tanks to balance weight and volumetric efficiency.\n\nWhat's your target hydrogen storage capacity? Please specify in kg of H₂.",
        extracted_requirements: allRequirements,
        suggestions: ['2 kg H₂', '10 kg H₂', '50 kg H₂'],
        is_complete: false,
      };
    } else if (lowerMessage.includes('stationary')) {
      return {
        message: "Stationary storage - perfect for renewable energy integration! For stationary applications, we typically use 500 bar tanks where cost is often more important than weight.\n\nWhat storage capacity do you need? You can specify in kg of H₂ or volume in liters.",
        extracted_requirements: allRequirements,
        suggestions: ['100 kg H₂', '500 liters', '1000 liters'],
        is_complete: false,
      };
    }
  }

  // Stage 1: Capacity specified, ask about constraints
  if (stage === 1 && extractedReqs.internal_volume_liters) {
    return {
      message: `Perfect! I've noted ${extractedReqs.internal_volume_liters.value} liters internal volume.\n\nNow, let's talk about design constraints. Do you have specific targets for:\n- Maximum weight (typical automotive: 80-100 kg)\n- Maximum cost (typical automotive: €12,000-€18,000)\n\nPlease share any weight or cost constraints you have.`,
      extracted_requirements: allRequirements,
      suggestions: ['Maximum 80 kg', 'Budget €15,000', 'No specific constraints'],
      is_complete: false,
    };
  }

  // Stage 2: Constraints specified, ask about operating conditions
  if (stage >= 2 && !extractedReqs.operating_temp_min_c) {
    return {
      message: "Good! Let's define the operating environment.\n\nWhat temperature range will the tank experience?\n- Automotive standard: -40°C to +85°C\n- Aviation: -55°C to +70°C\n- Indoor stationary: -10°C to +50°C\n\nPlease specify your temperature range.",
      extracted_requirements: allRequirements,
      suggestions: ['-40°C to +85°C (automotive)', '-55°C to +70°C (aviation)', '-10°C to +50°C (indoor)'],
      is_complete: false,
    };
  }

  // Stage 3: Temperature specified, ask about standards
  if (stage >= 3 && !extractedReqs.certification_region) {
    return {
      message: "Excellent! Now for certification requirements.\n\nWhich market are you targeting?\n- EU: ISO 11119-3, UN R134\n- USA: ASME Section X, ANSI/CSA HGV\n- International: Both\n\nThis determines which safety standards we'll design for.",
      extracted_requirements: allRequirements,
      suggestions: ['EU market (UN R134)', 'USA market (ASME)', 'International (both)'],
      is_complete: false,
    };
  }

  // Stage 4: Standards specified, ask about fatigue
  if (stage >= 4 && !extractedReqs.fatigue_cycles) {
    return {
      message: "Great progress! One last important requirement.\n\nWhat fatigue life do you need?\n- Automotive standard: 11,000 cycles (UN R134)\n- Extended service: 20,000 cycles\n- Industrial: 45,000 cycles\n\nHigher cycle counts require thicker composite layers.",
      extracted_requirements: allRequirements,
      suggestions: ['11,000 cycles (standard)', '20,000 cycles', '45,000 cycles'],
      is_complete: false,
    };
  }

  // Stage 5+: All requirements gathered
  if (stage >= 5) {
    const filledCount = allRequirements.filter((r) => r.value !== null).length;
    if (filledCount >= 7) {
      return {
        message: `Perfect! I've gathered all the essential requirements for your ${extractedReqs.application_type?.value || 'hydrogen'} tank design:\n\n✓ Application: ${extractedReqs.application_type?.value || 'Specified'}\n✓ Pressure: ${extractedReqs.working_pressure_bar?.value || '?'} bar\n✓ Volume: ${extractedReqs.internal_volume_liters?.value || '?'} L\n✓ Temperature: ${extractedReqs.operating_temp_min_c?.value || '?'}°C to ${extractedReqs.operating_temp_max_c?.value || '?'}°C\n✓ Standards: ${extractedReqs.certification_region?.value || 'TBD'}\n✓ Fatigue: ${extractedReqs.fatigue_cycles?.value?.toLocaleString() || '?'} cycles\n\nYou can review and edit any values in the panel on the right, then click "Confirm Requirements" to proceed to optimization!`,
        extracted_requirements: allRequirements,
        is_complete: true,
      };
    }
  }

  // Fallback response
  return {
    message: "Thanks for that information! I'm processing your requirements. Could you provide more details about your tank specifications?",
    extracted_requirements: allRequirements,
    suggestions: ['Tell me more', 'What else do you need?'],
    is_complete: false,
  };
}
