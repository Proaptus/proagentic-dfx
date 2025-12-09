/**
 * Help Topics Data - Simplified version
 */

export interface HelpTopic {
  id: string;
  title: string;
  category: HelpCategory;
  content: string;
  relatedTopics?: string[];
  keywords: string[];
}

export type HelpCategory =
  | 'requirements'
  | 'tank-types'
  | 'analysis'
  | 'standards'
  | 'physics'
  | 'workflow'
  | 'troubleshooting';

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'working-pressure',
    title: 'Working Pressure vs Burst Pressure',
    category: 'requirements',
    keywords: ['pressure', 'working', 'burst', 'nominal'],
    content: `Working Pressure (NWP) is the maximum pressure for normal operation, typically 70 MPa for automotive hydrogen tanks.

Burst Pressure is the minimum pressure at which the tank must fail during testing. The burst ratio requirement is 2.25 times the working pressure.

For a 70 MPa system: Burst >= 157.5 MPa`,
    relatedTopics: ['burst-ratio'],
  },
  {
    id: 'burst-ratio',
    title: 'Burst Ratio: 2.25 Safety Factor',
    category: 'requirements',
    keywords: ['burst', 'ratio', 'safety', 'factor'],
    content: `The burst ratio of 2.25 is mandated by ISO 11119-3 and UN R134 for automotive hydrogen tanks.

This safety factor accounts for:
- Material degradation over 15+ year life
- Manufacturing variability
- Environmental effects
- Impact damage
- Stress concentrations

Testing verification requires hydraulic burst testing of production tanks.`,
    relatedTopics: ['working-pressure', 'iso-11119-3'],
  },
  {
    id: 'type-iv-advantages',
    title: 'Type IV Tank Advantages',
    category: 'tank-types',
    keywords: ['type', 'IV', 'polymer', 'automotive'],
    content: `Type IV tanks use a polymer liner (HDPE or PA6) with full carbon fiber wrap.

Advantages:
- 40% lighter than Type III (aluminum liner)
- 20-30% lower cost
- Better crash safety
- Design flexibility
- Excellent fatigue resistance

Disadvantages:
- Permeation (must meet 46 NmL/hr/L limit)
- Liner creep at high temperature
- Temperature sensitivity

Industry standard for automotive hydrogen storage.`,
    relatedTopics: ['liner-materials', 'permeation-rate'],
  },
  {
    id: 'liner-materials',
    title: 'Liner Material Selection',
    category: 'tank-types',
    keywords: ['liner', 'hdpe', 'pa6', 'polymer'],
    content: `HDPE (High-Density Polyethylene):
- Lower cost, easy processing
- Permeation: 30-40 NmL/hr/L
- Good impact resistance
- Moderate creep

PA6 (Nylon 6):
- Lower permeation: 20-30 NmL/hr/L
- Better high-temperature properties
- More expensive
- Hygroscopic

Both use rotomolding manufacturing process.`,
    relatedTopics: ['type-iv-advantages', 'permeation-rate'],
  },
  {
    id: 'permeation-rate',
    title: 'Permeation Rate Limits',
    category: 'requirements',
    keywords: ['permeation', 'hydrogen', 'leakage', 'liner'],
    content: `Regulatory limit: <= 46 NmL/hr/L

Permeation is molecular diffusion through the liner material, not a leak.

For a 150L tank:
- Maximum: 6,900 NmL/hr
- That is 165.6 L/day
- Or about 5.4 kg H2/year lost

Liner material performance:
- HDPE: 30-40 NmL/hr/L (passes)
- PA6: 20-30 NmL/hr/L (better)
- Aluminum: 0 (no permeation)`,
    relatedTopics: ['liner-materials', 'type-iv-advantages'],
  },
  {
    id: 'hoop-stress-formula',
    title: 'Hoop Stress Formula',
    category: 'physics',
    keywords: ['hoop', 'stress', 'formula', 'pressure'],
    content: `Formula: sigma_hoop = P * R / t

Where:
- sigma_hoop = hoop (circumferential) stress
- P = internal pressure
- R = radius to centerline of wall
- t = wall thickness

This is the primary stress in a cylindrical pressure vessel.

Axial stress is half of hoop stress: sigma_axial = P * R / (2*t)

This 2:1 ratio leads to the optimal fiber angle of 54.74 degrees.`,
    relatedTopics: ['netting-theory'],
  },
  {
    id: 'netting-theory',
    title: 'Netting Theory and 54.74° Angle',
    category: 'physics',
    keywords: ['netting', 'theory', 'angle', 'geodesic'],
    content: `Netting theory assumes only fibers carry load (resin ignored).

The optimal helical winding angle is 54.74 degrees because:
- Hoop stress / Axial stress = 2:1 in a cylinder
- Fiber at 54.74° contributes optimally to both directions
- This is also the natural geodesic path

Calculation: tan(alpha) = sqrt(2), alpha = 54.74°

Real tanks use mixed angles:
- 90° (hoop) for burst strength
- ±54° (helical) for efficiency
- ±15° (near-axial) for boss reinforcement`,
    relatedTopics: ['hoop-stress-formula'],
  },
  {
    id: 'tsai-wu-criterion',
    title: 'Tsai-Wu Failure Criterion',
    category: 'analysis',
    keywords: ['tsai', 'wu', 'failure', 'composite'],
    content: `Tsai-Wu is a failure criterion for composite materials that accounts for:
- Different fiber vs transverse strengths
- Different tensile vs compressive strengths
- Shear strength
- Interaction effects

Failure Index (FI):
- FI < 1.0: Safe
- FI = 1.0: First ply failure
- FI > 1.0: Failed

Design target: FI < 0.5 at burst pressure (SF = 2.0)

More accurate than Von Mises stress for composites.`,
    relatedTopics: ['first-ply-failure', 'von-mises-stress'],
  },
  {
    id: 'first-ply-failure',
    title: 'First Ply Failure vs Ultimate',
    category: 'analysis',
    keywords: ['first', 'ply', 'failure', 'progressive'],
    content: `First Ply Failure (FPF): When the first layer fails
Ultimate Failure (UF): Catastrophic failure of all plies

After FPF, load redistributes to other plies. Progressive failure continues until catastrophic burst.

Example sequence:
- 50 MPa: First matrix crack
- 80 MPa: Multiple matrix cracks
- 120 MPa: First fiber breakage
- 157.5 MPa: Catastrophic burst

Industry practice: Design for FPF > 2x working pressure, validate ultimate with testing.`,
    relatedTopics: ['tsai-wu-criterion'],
  },
  {
    id: 'monte-carlo-reliability',
    title: 'Monte Carlo Reliability Analysis',
    category: 'analysis',
    keywords: ['monte', 'carlo', 'reliability', 'probability'],
    content: `Monte Carlo simulation accounts for variability in:
- Material properties (±5-10%)
- Manufacturing tolerances (±0.5mm)
- Environmental factors
- Aging effects

Process:
1. Sample input variables from distributions
2. Run 10,000+ analyses
3. Get output distribution
4. Calculate failure probability

Target: 99.99% reliability (P_failure < 0.01%)

Sensitivity analysis shows fiber strength accounts for 70% of variance.`,
    relatedTopics: ['reliability-analysis'],
  },
  {
    id: 'iso-11119-3',
    title: 'ISO 11119-3 Standard',
    category: 'standards',
    keywords: ['iso', '11119', 'standard', 'composite'],
    content: `ISO 11119-3 covers composite gas cylinders with non-load-sharing liners (Type IV).

Key requirements:
- Burst pressure >= 2.25x working pressure
- Pressure cycling: 11,000 cycles minimum
- Environmental testing: -40°C to +65°C
- Fire test: Bonfire at 590°C
- Permeation: <= 46 NmL/hr/L for hydrogen

Testing requires 16+ prototype tanks destroyed.

Required for EC 79 type approval in Europe.`,
    relatedTopics: ['un-r134', 'burst-ratio'],
  },
  {
    id: 'un-r134',
    title: 'UN R134 Requirements',
    category: 'standards',
    keywords: ['un', 'r134', 'automotive', 'hydrogen'],
    content: `UN Regulation 134 covers hydrogen fuel systems for vehicles.

Additional requirements beyond ISO 11119-3:
- Crash safety testing
- Vibration testing
- System-level integration
- On-board leak detection
- Automatic shut-off valves

Vehicle installation:
- Mounting must survive 20g crash
- Protection from debris
- Garage ventilation requirements

Mandatory in Europe via EC 79.`,
    relatedTopics: ['iso-11119-3', 'ec-79'],
  },
  {
    id: 'design-workflow',
    title: 'Design Workflow Overview',
    category: 'workflow',
    keywords: ['workflow', 'process', 'design'],
    content: `Phase 1: Requirements (working pressure, volume, standards)
Phase 2: Preliminary design (geometry, materials)
Phase 3: Analytical calculations (netting theory)
Phase 4: FEA analysis (stress, failure prediction)
Phase 5: Optimization (minimize weight)
Phase 6: Monte Carlo reliability analysis
Phase 7: Prototype testing (16+ tanks)
Phase 8: Certification (TUV, BAM, CSA)
Phase 9: Production setup and QC
Phase 10: In-service monitoring

Timeline: Approximately 15 months from requirements to production.`,
    relatedTopics: [],
  },
];

export function searchHelpTopics(query: string): HelpTopic[] {
  const lowerQuery = query.toLowerCase();
  return HELP_TOPICS.filter(
    (topic) =>
      topic.title.toLowerCase().includes(lowerQuery) ||
      topic.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery)) ||
      topic.content.toLowerCase().includes(lowerQuery)
  );
}

export function getTopicById(id: string): HelpTopic | undefined {
  return HELP_TOPICS.find((topic) => topic.id === id);
}

export function getTopicsByCategory(category: HelpCategory): HelpTopic[] {
  return HELP_TOPICS.filter((topic) => topic.category === category);
}
