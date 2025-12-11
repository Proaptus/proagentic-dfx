export { EquationDisplay } from './EquationDisplay';
export { StressAnalysisPanel } from './StressAnalysisPanel';
export { FailureAnalysisPanel } from './FailureAnalysisPanel';
export { ThermalAnalysisPanel } from './ThermalAnalysisPanel';
export { ReliabilityPanel } from './ReliabilityPanel';
export { CostAnalysisPanel } from './CostAnalysisPanel';
export { PhysicsEquationsPanel } from './PhysicsEquationsPanel';

// Cost Analysis Components
export { KeyMetricsRow, UnitCostSummary } from './CostMetricsCards';
export {
  CostBreakdownChart,
  VolumeSensitivityChart,
  WeightCostTradeoffChart,
  MaterialComparisonTable,
} from './CostVisualizationCharts';
export { ManufacturingProcessChart, LearningCurveChart } from './CostChartsSection';
export { CostEquationsSection } from './CostEquationsSection';

// Cost Analysis Types
export type {
  CostAnalysisPanelProps,
  ProductionVolume,
  ManufacturingProcess,
} from './cost-analysis.types';
export {
  COST_COLORS,
  PRODUCTION_VOLUMES,
  getVolumeReductionPct,
  generateManufacturingProcesses,
} from './cost-analysis.types';
