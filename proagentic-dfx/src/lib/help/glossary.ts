/**
 * Engineering Glossary
 * A-Z terms for H2 Tank Design
 */

export interface GlossaryTerm {
  term: string;
  definition: string;
  formula?: string;
  units?: string;
  relatedTerms?: string[];
  category: 'material' | 'physics' | 'standard' | 'manufacturing' | 'testing';
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Anisotropic',
    category: 'material',
    definition:
      'Material with properties that vary with direction. Composites are highly anisotropic - strong in fiber direction, weak transverse to fibers.',
    relatedTerms: ['Isotropic', 'Orthotropic', 'Composite'],
  },
  {
    term: 'Autoclave',
    category: 'manufacturing',
    definition:
      'Pressurized oven used to cure composite parts. Applies heat (120-180°C) and pressure (4-7 bar) to consolidate layers and remove voids.',
    relatedTerms: ['Cure', 'Composite', 'Resin'],
  },
  {
    term: 'Boss',
    category: 'manufacturing',
    definition:
      'Metal or composite fitting at tank ends where valves attach. Creates stress concentration - critical design area.',
    relatedTerms: ['Stress Concentration', 'Dome', 'Port'],
  },
  {
    term: 'Burst Pressure',
    category: 'testing',
    definition:
      'Minimum pressure at which tank must catastrophically fail. For automotive H₂: ≥ 2.25× working pressure.',
    formula: 'P_burst ≥ 2.25 × P_working',
    units: 'MPa',
    relatedTerms: ['Working Pressure', 'Burst Ratio', 'Safety Factor'],
  },
  {
    term: 'Burst Ratio',
    category: 'physics',
    definition: 'Ratio of burst pressure to working pressure. Automotive standard: 2.25',
    formula: 'BR = P_burst / P_working',
    units: 'dimensionless',
    relatedTerms: ['Burst Pressure', 'Safety Factor'],
  },
  {
    term: 'Carbon Fiber',
    category: 'material',
    definition:
      'High-strength fiber made from carbonized polyacrylonitrile (PAN). T700 grade typical for H₂ tanks: 4900 MPa tensile strength.',
    relatedTerms: ['T700', 'T800', 'Composite', 'Modulus'],
  },
  {
    term: 'Classical Lamination Theory (CLT)',
    category: 'physics',
    definition:
      'Mathematical framework to predict composite laminate behavior from individual ply properties and stacking sequence.',
    relatedTerms: ['Composite', 'Laminate', 'ABD Matrix'],
  },
  {
    term: 'Composite',
    category: 'material',
    definition:
      'Material combining fibers (carbon, glass) in polymer matrix (epoxy). Properties depend on fiber type, orientation, and volume fraction.',
    relatedTerms: ['Carbon Fiber', 'Epoxy', 'Laminate'],
  },
  {
    term: 'Creep',
    category: 'physics',
    definition:
      'Time-dependent deformation under constant stress. HDPE liners creep at high temperature, redistributing stress to composite.',
    relatedTerms: ['HDPE', 'Liner', 'Polymer'],
  },
  {
    term: 'Cure',
    category: 'manufacturing',
    definition:
      'Chemical cross-linking of thermoset resin (epoxy) during heating. Typical: 120°C for 2 hours, then slow cool.',
    relatedTerms: ['Epoxy', 'Autoclave', 'Glass Transition Temperature'],
  },
  {
    term: 'Dome',
    category: 'manufacturing',
    definition:
      'Curved end closure of pressure vessel. Isotensoid profile optimizes fiber stress distribution.',
    relatedTerms: ['Isotensoid', 'Boss', 'Cylinder'],
  },
  {
    term: 'Epoxy',
    category: 'material',
    definition:
      'Thermoset resin matrix for composites. Typical properties: E = 3.5 GPa, Tg = 120-150°C. Holds fibers in place and transfers load.',
    relatedTerms: ['Resin', 'Composite', 'Cure'],
  },
  {
    term: 'Failure Index (FI)',
    category: 'physics',
    definition:
      'Ratio of applied stress to allowable stress in failure criterion. FI < 1.0 = safe, FI = 1.0 = failure, FI > 1.0 = failed.',
    formula: 'FI = f(σ) / f(σ_allowable)',
    units: 'dimensionless',
    relatedTerms: ['Tsai-Wu', 'First Ply Failure', 'Safety Factor'],
  },
  {
    term: 'Fatigue',
    category: 'physics',
    definition:
      'Progressive damage from repeated loading cycles. H₂ tanks must survive 11,000 pressure cycles without failure.',
    relatedTerms: ['Pressure Cycling', 'S-N Curve', 'Fatigue Life'],
  },
  {
    term: 'Fiber Volume Fraction (Vf)',
    category: 'material',
    definition:
      'Percentage of composite volume occupied by fibers (vs resin). Typical: 60% fiber, 40% resin. Higher Vf = stronger but harder to manufacture.',
    formula: 'V_f = V_fiber / (V_fiber + V_resin)',
    units: 'dimensionless (0-1)',
    relatedTerms: ['Composite', 'Carbon Fiber', 'Resin'],
  },
  {
    term: 'Filament Winding',
    category: 'manufacturing',
    definition:
      'Manufacturing process: fiber tows wound onto rotating mandrel in programmed pattern, then cured.',
    relatedTerms: ['Geodesic', 'Mandrel', 'Composite'],
  },
  {
    term: 'First Ply Failure (FPF)',
    category: 'physics',
    definition:
      'Load at which first layer in laminate reaches failure criterion. Conservative design target; actual burst is higher due to progressive failure.',
    relatedTerms: ['Failure Index', 'Progressive Failure', 'Ultimate Failure'],
  },
  {
    term: 'Geodesic',
    category: 'physics',
    definition:
      'Shortest path on a curved surface. On cylinder, geodesic angle is ±54.74° - also optimal for 2:1 hoop:axial stress.',
    formula: 'α_geodesic = arctan(√2) = 54.74°',
    units: 'degrees',
    relatedTerms: ['Netting Theory', 'Helical', 'Winding Angle'],
  },
  {
    term: 'Glass Transition Temperature (Tg)',
    category: 'material',
    definition:
      'Temperature where polymer changes from glassy (stiff) to rubbery (soft). Epoxy Tg = 120-150°C. Tank max temp must stay below Tg.',
    units: '°C',
    relatedTerms: ['Epoxy', 'Resin', 'Cure'],
  },
  {
    term: 'Gravimetric Efficiency',
    category: 'physics',
    definition:
      'Ratio of stored hydrogen mass to total tank system mass. Type IV automotive tanks: 6-7%.',
    formula: 'η_grav = m_H2 / m_tank_total × 100%',
    units: 'percent',
    relatedTerms: ['Type IV', 'Weight', 'Hydrogen Storage'],
  },
  {
    term: 'HDPE',
    category: 'material',
    definition:
      'High-Density Polyethylene. Common Type IV liner material. Pros: cheap, easy processing. Cons: moderate permeation, creep at high temp.',
    relatedTerms: ['Liner', 'PA6', 'Type IV'],
  },
  {
    term: 'Helical Winding',
    category: 'manufacturing',
    definition:
      'Fiber winding at angle to cylinder axis (not 90° hoop). Typical angles: ±15°, ±54.74°. Provides both hoop and axial strength.',
    relatedTerms: ['Geodesic', 'Filament Winding', 'Hoop Winding'],
  },
  {
    term: 'Hoop Stress',
    category: 'physics',
    definition:
      'Circumferential tensile stress in cylindrical pressure vessel. Largest stress component in thin-wall tanks.',
    formula: 'σ_hoop = P × R / t',
    units: 'MPa',
    relatedTerms: ['Axial Stress', 'Thin-Wall', 'Pressure Vessel'],
  },
  {
    term: 'Hoop Winding',
    category: 'manufacturing',
    definition:
      'Fiber wound at 90° to cylinder axis (purely circumferential). Maximizes hoop strength but provides no axial support.',
    relatedTerms: ['Helical Winding', 'Fiber Angle', 'Filament Winding'],
  },
  {
    term: 'Isotropic',
    category: 'material',
    definition:
      'Material with same properties in all directions. Metals are isotropic; composites are not.',
    relatedTerms: ['Anisotropic', 'Metal', 'Aluminum'],
  },
  {
    term: 'Isotensoid',
    category: 'physics',
    definition:
      'Dome profile shape where fiber stress is constant along fiber path. Optimizes weight for given burst strength.',
    relatedTerms: ['Dome', 'Geodesic', 'Netting Theory'],
  },
  {
    term: 'Laminate',
    category: 'material',
    definition:
      'Multiple plies (layers) of composite stacked at different angles. Typical H₂ tank: [±15 / ±54 / 90]s.',
    relatedTerms: ['Ply', 'Composite', 'Stacking Sequence'],
  },
  {
    term: 'Liner',
    category: 'material',
    definition:
      'Inner polymer (Type IV) or metal (Type III) layer that prevents gas permeation. Non-load-bearing in Type IV.',
    relatedTerms: ['HDPE', 'PA6', 'Type IV', 'Permeation'],
  },
  {
    term: 'Mandrel',
    category: 'manufacturing',
    definition:
      'Rotating tool onto which composite is wound. Typically aluminum; removed after cure (or liner stays on mandrel).',
    relatedTerms: ['Filament Winding', 'Dome', 'Cylinder'],
  },
  {
    term: 'Monte Carlo Simulation',
    category: 'physics',
    definition:
      'Statistical method: run analysis thousands of times with random input variations to predict output distribution and reliability.',
    relatedTerms: ['Reliability', 'Probability', 'Uncertainty'],
  },
  {
    term: 'Netting Theory',
    category: 'physics',
    definition:
      'Simplified composite analysis assuming only fibers carry load (resin ignored). Predicts 54.74° optimal angle for cylinder.',
    relatedTerms: ['Geodesic', 'Helical', 'Fiber Angle'],
  },
  {
    term: 'NWP (Nominal Working Pressure)',
    category: 'physics',
    definition:
      'Maximum pressure for normal service. Automotive H₂: 70 MPa (700 bar). Also called "rated pressure" or "service pressure".',
    units: 'MPa or bar',
    relatedTerms: ['Working Pressure', 'Burst Pressure', '70 MPa'],
  },
  {
    term: 'PA6 (Nylon 6)',
    category: 'material',
    definition:
      'Polyamide polymer used for Type IV liners. Better permeation resistance than HDPE, but hygroscopic and more expensive.',
    relatedTerms: ['Liner', 'HDPE', 'Type IV', 'Permeation'],
  },
  {
    term: 'Permeation',
    category: 'physics',
    definition:
      'Hydrogen diffusion through polymer liner at molecular level (not a leak). Limit: 46 NmL/hr/L.',
    formula: 'Q = A × P × t (Fick\'s Law)',
    units: 'NmL/hr/L',
    relatedTerms: ['Liner', 'HDPE', 'PA6', 'Hydrogen'],
  },
  {
    term: 'Ply',
    category: 'material',
    definition:
      'Single layer of unidirectional fibers in resin. Typical thickness: 0.125-0.25 mm. Multiple plies = laminate.',
    relatedTerms: ['Laminate', 'Composite', 'Stacking Sequence'],
  },
  {
    term: 'PRD (Pressure Relief Device)',
    category: 'manufacturing',
    definition:
      'Thermally-activated valve that vents hydrogen during fire (bonfire test). Activates at 110-130°C to prevent burst.',
    relatedTerms: ['Fire Test', 'Safety', 'Boss'],
  },
  {
    term: 'Progressive Failure',
    category: 'physics',
    definition:
      'Gradual damage accumulation: first ply fails, load redistributes, next ply fails, etc. Realistic model for burst prediction.',
    relatedTerms: ['First Ply Failure', 'Ultimate Failure', 'Tsai-Wu'],
  },
  {
    term: 'Resin',
    category: 'material',
    definition:
      'Polymer matrix in composite. Epoxy most common for H₂ tanks. Holds fibers, transfers shear, protects from environment.',
    relatedTerms: ['Epoxy', 'Composite', 'Matrix'],
  },
  {
    term: 'Rotomolding',
    category: 'manufacturing',
    definition:
      'Rotational molding process for liners. Powder resin melted in rotating mold to create uniform hollow shape.',
    relatedTerms: ['Liner', 'HDPE', 'PA6'],
  },
  {
    term: 'Safety Factor',
    category: 'physics',
    definition:
      'Ratio of failure strength to applied stress. Burst ratio (2.25) is one type of safety factor.',
    formula: 'SF = σ_ultimate / σ_applied',
    units: 'dimensionless',
    relatedTerms: ['Burst Ratio', 'Margin of Safety'],
  },
  {
    term: 'Stress Concentration Factor (SCF)',
    category: 'physics',
    definition:
      'Ratio of maximum stress (at notch, hole, boss) to nominal stress. Boss typically has SCF = 2.5-3.5.',
    formula: 'K_t = σ_max / σ_nominal',
    units: 'dimensionless',
    relatedTerms: ['Boss', 'Notch', 'Fillet'],
  },
  {
    term: 'T700',
    category: 'material',
    definition:
      'Toray carbon fiber grade. Tensile strength: 4900 MPa, modulus: 230 GPa. Standard for automotive H₂ tanks.',
    units: 'MPa (strength)',
    relatedTerms: ['Carbon Fiber', 'T800', 'Composite'],
  },
  {
    term: 'T800',
    category: 'material',
    definition:
      'Higher-performance carbon fiber: 5500 MPa strength, 294 GPa modulus. More expensive than T700; used for weight-critical applications.',
    units: 'MPa (strength)',
    relatedTerms: ['Carbon Fiber', 'T700', 'Composite'],
  },
  {
    term: 'Thin-Wall Theory',
    category: 'physics',
    definition:
      'Simplified pressure vessel analysis for t/R < 0.1. Assumes uniform stress through thickness. Hoop stress = PR/t.',
    relatedTerms: ['Hoop Stress', 'Thick Wall', 'Lamé Equations'],
  },
  {
    term: 'Tsai-Wu Criterion',
    category: 'physics',
    definition:
      'Composite failure theory accounting for fiber anisotropy and different tensile/compressive strengths. More accurate than Von Mises for composites.',
    relatedTerms: ['Failure Index', 'Composite', 'First Ply Failure'],
  },
  {
    term: 'Type I',
    category: 'manufacturing',
    definition: 'All-metal pressure vessel (steel or aluminum). Heavy; not used for automotive H₂.',
    relatedTerms: ['Type II', 'Type III', 'Type IV'],
  },
  {
    term: 'Type II',
    category: 'manufacturing',
    definition:
      'Metal liner with hoop-wrapped composite. Used for CNG (low pressure), not H₂ (too heavy).',
    relatedTerms: ['Type I', 'Type III', 'Type IV'],
  },
  {
    term: 'Type III',
    category: 'manufacturing',
    definition:
      'Aluminum liner, full composite wrap. Zero permeation but heavy. Less common for automotive H₂ (Type IV preferred).',
    relatedTerms: ['Type II', 'Type IV', 'Aluminum'],
  },
  {
    term: 'Type IV',
    category: 'manufacturing',
    definition:
      'Polymer liner (HDPE/PA6), full composite wrap. Industry standard for automotive H₂: lightest practical option.',
    relatedTerms: ['Type III', 'Type V', 'HDPE', 'PA6'],
  },
  {
    term: 'Type V',
    category: 'manufacturing',
    definition:
      'Linerless composite (no polymer or metal liner). Future technology; permeation barrier challenge. ~7-10% gravimetric potential.',
    relatedTerms: ['Type IV', 'Linerless', 'Future'],
  },
  {
    term: 'Von Mises Stress',
    category: 'physics',
    definition:
      'Equivalent stress combining all stress components. Used for ductile metals (liners), NOT for composites (use Tsai-Wu instead).',
    formula: 'σ_vm = √[(σ₁-σ₂)² + (σ₂-σ₃)² + (σ₃-σ₁)²]/√2',
    units: 'MPa',
    relatedTerms: ['Metal', 'Liner', 'Yield'],
  },
  {
    term: 'Working Pressure',
    category: 'physics',
    definition: 'Maximum pressure during normal service. Automotive H₂: 70 MPa (700 bar) or 35 MPa.',
    units: 'MPa',
    relatedTerms: ['NWP', 'Burst Pressure', '70 MPa'],
  },
];

/**
 * Search glossary terms
 */
export function searchGlossary(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();

  return GLOSSARY_TERMS.filter(
    (term) =>
      term.term.toLowerCase().includes(lowerQuery) ||
      term.definition.toLowerCase().includes(lowerQuery) ||
      term.relatedTerms?.some((rt) => rt.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get term by exact match
 */
export function getGlossaryTerm(term: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.term.toLowerCase() === term.toLowerCase());
}

/**
 * Group terms by first letter for A-Z navigation
 */
export function getTermsByLetter(): Map<string, GlossaryTerm[]> {
  const grouped = new Map<string, GlossaryTerm[]>();

  for (const term of GLOSSARY_TERMS) {
    const letter = term.term[0].toUpperCase();
    if (!grouped.has(letter)) {
      grouped.set(letter, []);
    }
    grouped.get(letter)!.push(term);
  }

  // Sort terms within each letter
  Array.from(grouped.values()).forEach(terms => {
    terms.sort((a, b) => a.term.localeCompare(b.term));
  });

  return grouped;
}

/**
 * Get all available letters (for navigation)
 */
export function getAvailableLetters(): string[] {
  const letters = new Set<string>();
  for (const term of GLOSSARY_TERMS) {
    letters.add(term.term[0].toUpperCase());
  }
  return Array.from(letters).sort();
}
