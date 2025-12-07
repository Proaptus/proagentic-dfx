/**
 * H2 Tank Physics Library
 * First-principles physics calculations for hydrogen pressure vessel design
 *
 * Modules:
 * - pressure-vessel: Thin-wall pressure vessel mechanics
 * - composite-analysis: Tsai-Wu and Hashin failure criteria
 * - dome-geometry: Isotensoid dome profile generation
 * - reliability: Monte Carlo reliability analysis
 * - fatigue: S-N curve fatigue life prediction
 * - permeation: Hydrogen permeation calculations
 */

// Pressure vessel mechanics
export * from './pressure-vessel';

// Composite failure analysis
export * from './composite-analysis';

// Dome geometry
export * from './dome-geometry';

// Reliability analysis
export * from './reliability';

// Fatigue analysis
export * from './fatigue';

// Permeation analysis
export * from './permeation';
