import { create } from 'zustand';
import type {
  Screen,
  ParsedRequirements,
  ParetoDesign,
  OptimizationJob,
} from '@/lib/types';

interface AppState {
  // Navigation
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;

  // Requirements
  requirements: ParsedRequirements | null;
  setRequirements: (req: ParsedRequirements | null) => void;

  // Tank Type
  tankType: 'IV' | 'III' | 'V' | null;
  setTankType: (type: 'IV' | 'III' | 'V' | null) => void;

  // Optimization
  optimizationJob: OptimizationJob | null;
  setOptimizationJob: (job: OptimizationJob | null) => void;
  optimizationProgress: number;
  setOptimizationProgress: (progress: number) => void;

  // Pareto Front
  paretoFront: ParetoDesign[];
  setParetoFront: (designs: ParetoDesign[]) => void;

  // Design Selection
  selectedDesigns: string[];
  selectDesign: (id: string) => void;
  deselectDesign: (id: string) => void;
  toggleDesign: (id: string) => void;
  clearSelection: () => void;

  // Current Design for Viewer/Analysis
  currentDesign: string | null;
  setCurrentDesign: (id: string | null) => void;

  // Analysis Tab
  analysisTab: 'stress' | 'failure' | 'thermal' | 'reliability' | 'cost';
  setAnalysisTab: (tab: 'stress' | 'failure' | 'thermal' | 'reliability' | 'cost') => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentScreen: 'requirements' as Screen,
  requirements: null,
  tankType: null,
  optimizationJob: null,
  optimizationProgress: 0,
  paretoFront: [],
  selectedDesigns: [],
  currentDesign: null,
  analysisTab: 'stress' as const,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setScreen: (screen) => set({ currentScreen: screen }),

  setRequirements: (requirements) => set({ requirements }),

  setTankType: (tankType) => set({ tankType }),

  setOptimizationJob: (optimizationJob) => set({ optimizationJob }),
  setOptimizationProgress: (optimizationProgress) => set({ optimizationProgress }),

  setParetoFront: (paretoFront) => set({ paretoFront }),

  selectDesign: (id) =>
    set((state) => ({
      selectedDesigns: state.selectedDesigns.includes(id)
        ? state.selectedDesigns
        : [...state.selectedDesigns, id],
    })),

  deselectDesign: (id) =>
    set((state) => ({
      selectedDesigns: state.selectedDesigns.filter((d) => d !== id),
    })),

  toggleDesign: (id) =>
    set((state) => ({
      selectedDesigns: state.selectedDesigns.includes(id)
        ? state.selectedDesigns.filter((d) => d !== id)
        : [...state.selectedDesigns, id],
    })),

  clearSelection: () => set({ selectedDesigns: [] }),

  setCurrentDesign: (currentDesign) => set({ currentDesign }),

  setAnalysisTab: (analysisTab) => set({ analysisTab }),

  reset: () => set(initialState),
}));
