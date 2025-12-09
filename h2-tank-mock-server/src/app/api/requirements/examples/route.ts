import { NextResponse } from 'next/server';

// GET /api/requirements/examples - Get example requirement strings
export async function GET() {
  try {
    const examples = [
      {
        id: 'ex1',
        category: 'Basic Requirements',
        name: 'Simple automotive tank',
        requirement_string: 'Design a 700 bar Type 4 hydrogen tank for automotive use, 150 liters capacity, minimize weight, comply with ISO 19881.',
        complexity: 'simple',
        estimated_parse_time_ms: 150,
        key_features: ['Pressure specified', 'Tank type', 'Application', 'Volume', 'Objective', 'Standard']
      },
      {
        id: 'ex2',
        category: 'Basic Requirements',
        name: 'Cost-optimized design',
        requirement_string: 'Type 3 tank, 350 bar working pressure, 100L, minimize manufacturing cost, meet UN R134.',
        complexity: 'simple',
        estimated_parse_time_ms: 140,
        key_features: ['Cost optimization', 'Metallic liner', 'Lower pressure']
      },
      {
        id: 'ex3',
        category: 'Intermediate Requirements',
        name: 'Multi-objective with constraints',
        requirement_string: 'Design 700 bar Type 4 tank, 200L usable volume, max weight 120kg, max cost 15000 EUR, target 50000 cycles, ISO 11119-3 and SAE J2579 compliance.',
        complexity: 'intermediate',
        estimated_parse_time_ms: 220,
        key_features: ['Multiple constraints', 'Multiple standards', 'Fatigue life target']
      },
      {
        id: 'ex4',
        category: 'Intermediate Requirements',
        name: 'Material and geometry constraints',
        requirement_string: 'Type 4, 700 bar, 150L, T700S carbon fiber required, HDPE liner, outer diameter limited to 400mm max, length under 1800mm, comply with ISO 19881.',
        complexity: 'intermediate',
        estimated_parse_time_ms: 250,
        key_features: ['Material specification', 'Geometry constraints', 'Packaging limits']
      },
      {
        id: 'ex5',
        category: 'Advanced Requirements',
        name: 'Heavy-duty bus application',
        requirement_string: 'Design hydrogen storage system for city bus: 700 bar Type 4, total capacity 300L (can use multiple tanks), max system weight 250kg, operating temp range -40C to +85C, fast-fill capable (3 minutes), 20000 cycle life minimum, ISO 19881 + UN R134 compliance, permeation under 0.3 NmL/h/L.',
        complexity: 'advanced',
        estimated_parse_time_ms: 380,
        key_features: ['System-level design', 'Multiple tanks', 'Extreme conditions', 'Performance requirements']
      },
      {
        id: 'ex6',
        category: 'Advanced Requirements',
        name: 'Aerospace application',
        requirement_string: 'Type 4 tank for UAV, 350 bar, 50L, max weight 18kg, T1000G fiber, operating altitude up to 15000m, temp range -60C to +70C, vibration resistant per MIL-STD-810, custom boss design for dual valve configuration, minimize permeation (target <0.2 NmL/h/L).',
        complexity: 'advanced',
        estimated_parse_time_ms: 420,
        key_features: ['High-performance fiber', 'Extreme environment', 'Custom fittings', 'Military spec']
      },
      {
        id: 'ex7',
        category: 'Advanced Requirements',
        name: 'Stationary storage with custom standard',
        requirement_string: 'Type 3 stationary storage tank, 250 bar, 1000L capacity, max cost per liter 80 EUR, aluminum liner (6061-T6), operate continuously at 50 bar with occasional fill to 250 bar, 100000 cycle life at working pressure, outdoor installation (-30C to +50C), comply with ASME Section X and local fire codes, integrated leak detection system.',
        complexity: 'advanced',
        estimated_parse_time_ms: 450,
        key_features: ['Large stationary tank', 'Dual pressure operation', 'High cycle life', 'Integrated safety']
      },
      {
        id: 'ex8',
        category: 'Edge Cases',
        name: 'Minimal specification',
        requirement_string: '700 bar, 150L',
        complexity: 'minimal',
        estimated_parse_time_ms: 80,
        key_features: ['Bare minimum input', 'System must infer defaults']
      },
      {
        id: 'ex9',
        category: 'Edge Cases',
        name: 'Conflicting requirements',
        requirement_string: 'Type 4 tank, 700 bar, 200L, max weight 50kg, max cost 5000 EUR, T1000G fiber, 100000 cycles.',
        complexity: 'challenging',
        estimated_parse_time_ms: 300,
        key_features: ['Likely infeasible', 'Conflicting constraints', 'System should flag issues']
      },
      {
        id: 'ex10',
        category: 'Research & Development',
        name: 'Novel material exploration',
        requirement_string: 'Explore novel fiber materials for Type 4 tank, 875 bar (H70 standard), 150L, target weight reduction of 20% vs T700S baseline, maintain or improve cycle life, evaluate T1100G, M55J, Dyneema hybrid options, cost increase acceptable up to 30%.',
        complexity: 'research',
        estimated_parse_time_ms: 500,
        key_features: ['Material study', 'Multiple candidates', 'Baseline comparison', 'Trade-off analysis']
      },
      {
        id: 'ex11',
        category: 'Multi-Tank Systems',
        name: 'Truck with multiple tanks',
        requirement_string: 'Heavy-duty truck system: total 600L capacity using 4x 150L Type 4 tanks, 700 bar, tanks must be identical for manufacturing efficiency, system weight budget 350kg total, space constraints: each tank max 450mm diameter and 1500mm length, ISO 19881 compliance.',
        complexity: 'system',
        estimated_parse_time_ms: 350,
        key_features: ['Identical tanks', 'System packaging', 'Shared constraints']
      },
      {
        id: 'ex12',
        category: 'Optimization Studies',
        name: 'Pareto frontier exploration',
        requirement_string: 'Generate Pareto front for Type 4, 700 bar, 150L tank exploring trade-offs between weight (minimize), cost (minimize), and cycle life (maximize). Constraints: ISO 19881 compliance, burst ratio min 2.25. Evaluate at least 50 design points.',
        complexity: 'optimization',
        estimated_parse_time_ms: 280,
        key_features: ['Multi-objective', 'Pareto analysis', 'Large design space']
      }
    ];

    // Group by category
    const byCategory = examples.reduce((acc, ex) => {
      if (!acc[ex.category]) {
        acc[ex.category] = [];
      }
      acc[ex.category].push(ex);
      return acc;
    }, {} as Record<string, typeof examples>);

    const response = {
      examples,
      grouped_by_category: byCategory,
      categories: Object.keys(byCategory).map(cat => ({
        name: cat,
        count: byCategory[cat].length,
        complexity_levels: [...new Set(byCategory[cat].map(ex => ex.complexity))]
      })),
      total_examples: examples.length,
      usage_tips: [
        'Start with Basic Requirements examples to understand the parser',
        'Use Intermediate examples for typical design projects',
        'Advanced examples show the full capability of the system',
        'Edge Cases help test system robustness',
        'Copy and modify examples to match your specific needs'
      ],
      parser_capabilities: {
        tank_types: ['Type 3', 'Type 4'],
        pressure_units: ['bar', 'MPa', 'psi'],
        volume_units: ['L', 'liters', 'gallons'],
        weight_units: ['kg', 'lbs'],
        temperature_units: ['C', 'F', 'K'],
        standards_recognized: ['ISO 11119-3', 'ISO 19881', 'UN R134', 'SAE J2579', 'ASME Section X', 'EC 79/2009'],
        materials_recognized: ['T700S', 'T800S', 'T1000G', 'M55J', 'IM7', 'HDPE', 'PA6', '6061-T6', '7075-T6'],
        objectives_supported: ['minimize weight', 'minimize cost', 'maximize life', 'minimize permeation']
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
