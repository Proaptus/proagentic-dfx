import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Screen,
  ParsedRequirements,
  ParetoDesign,
  OptimizationJob,
} from '@/lib/types';

// Snapshot type for history tracking
interface StateSnapshot {
  currentScreen: Screen;
  requirements: ParsedRequirements | null;
  tankType: 'IV' | 'III' | 'V' | null;
  paretoFront: ParetoDesign[];
  selectedDesigns: string[];
  currentDesign: string | null;
  analysisTab: 'stress' | 'failure' | 'thermal' | 'reliability' | 'cost' | 'physics';
}

interface AppState extends StateSnapshot {
  // Actions
  setScreen: (screen: Screen) => void;
  setRequirements: (req: ParsedRequirements | null) => void;
  setTankType: (type: 'IV' | 'III' | 'V' | null) => void;

  // Optimization
  optimizationJob: OptimizationJob | null;
  setOptimizationJob: (job: OptimizationJob | null) => void;
  optimizationProgress: number;
  setOptimizationProgress: (progress: number) => void;

  // Pareto Front
  setParetoFront: (designs: ParetoDesign[]) => void;

  // Design Selection
  setSelectedDesigns: (designs: string[]) => void;
  selectDesign: (id: string) => void;
  deselectDesign: (id: string) => void;
  toggleDesign: (id: string) => void;
  clearSelection: () => void;

  // Current Design
  setCurrentDesign: (id: string | null) => void;

  // Analysis Tab
  setAnalysisTab: (tab: 'stress' | 'failure' | 'thermal' | 'reliability' | 'cost' | 'physics') => void;

  // History (Undo/Redo)
  _history: StateSnapshot[];
  _historyIndex: number;
  _pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Reset
  reset: () => void;
}

// Valid design IDs from mock server
const VALID_DESIGN_IDS = ['A', 'B', 'C', 'D', 'E'];

const initialState: StateSnapshot = {
  currentScreen: 'requirements',
  requirements: null,
  tankType: null,
  paretoFront: [],
  selectedDesigns: [],
  currentDesign: null,
  analysisTab: 'stress',
};

// Validate design ID
const isValidDesignId = (id: string | null): boolean => {
  if (!id) return true; // null is valid
  return VALID_DESIGN_IDS.includes(id.toUpperCase());
};

// Helper to create snapshot from state
const createSnapshot = (state: AppState): StateSnapshot => ({
  currentScreen: state.currentScreen,
  requirements: state.requirements,
  tankType: state.tankType,
  paretoFront: state.paretoFront,
  selectedDesigns: state.selectedDesigns,
  currentDesign: state.currentDesign,
  analysisTab: state.analysisTab,
});

// Create store with persist (auto-save) and built-in undo/redo
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      optimizationJob: null,
      optimizationProgress: 0,
      _history: [],
      _historyIndex: -1,

      _pushHistory: () => {
        const state = get();
        const snapshot = createSnapshot(state);
        const newHistory = state._history.slice(0, state._historyIndex + 1);
        newHistory.push(snapshot);
        // Keep only last 50 states
        if (newHistory.length > 50) {
          newHistory.shift();
        }
        set({ _history: newHistory, _historyIndex: newHistory.length - 1 });
      },

      setScreen: (screen) => {
        get()._pushHistory();
        set({ currentScreen: screen });
      },

      setRequirements: (requirements) => {
        get()._pushHistory();
        set({ requirements });
      },

      setTankType: (tankType) => {
        get()._pushHistory();
        set({ tankType });
      },

      setOptimizationJob: (optimizationJob) => set({ optimizationJob }),
      setOptimizationProgress: (optimizationProgress) => set({ optimizationProgress }),

      setParetoFront: (paretoFront) => {
        get()._pushHistory();
        set({ paretoFront });
      },

      setSelectedDesigns: (selectedDesigns) => {
        get()._pushHistory();
        set({ selectedDesigns });
      },

      selectDesign: (id) => {
        get()._pushHistory();
        set((state) => ({
          selectedDesigns: state.selectedDesigns.includes(id)
            ? state.selectedDesigns
            : [...state.selectedDesigns, id],
        }));
      },

      deselectDesign: (id) => {
        get()._pushHistory();
        set((state) => ({
          selectedDesigns: state.selectedDesigns.filter((d) => d !== id),
        }));
      },

      toggleDesign: (id) => {
        get()._pushHistory();
        set((state) => ({
          selectedDesigns: state.selectedDesigns.includes(id)
            ? state.selectedDesigns.filter((d) => d !== id)
            : [...state.selectedDesigns, id],
        }));
      },

      clearSelection: () => {
        get()._pushHistory();
        set({ selectedDesigns: [] });
      },

      setCurrentDesign: (currentDesign) => {
        get()._pushHistory();
        set({ currentDesign });
      },

      setAnalysisTab: (analysisTab) => {
        get()._pushHistory();
        set({ analysisTab });
      },

      undo: () => {
        const state = get();
        if (state._historyIndex > 0) {
          const newIndex = state._historyIndex - 1;
          const snapshot = state._history[newIndex];
          set({ ...snapshot, _historyIndex: newIndex });
        }
      },

      redo: () => {
        const state = get();
        if (state._historyIndex < state._history.length - 1) {
          const newIndex = state._historyIndex + 1;
          const snapshot = state._history[newIndex];
          set({ ...snapshot, _historyIndex: newIndex });
        }
      },

      canUndo: () => get()._historyIndex > 0,
      canRedo: () => get()._historyIndex < get()._history.length - 1,

      reset: () => set({
        ...initialState,
        optimizationJob: null,
        optimizationProgress: 0,
        _history: [],
        _historyIndex: -1,
      }),
    }),
    {
      name: 'h2-tank-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist essential state, not transient values or history
        currentScreen: state.currentScreen,
        requirements: state.requirements,
        tankType: state.tankType,
        paretoFront: state.paretoFront,
        selectedDesigns: state.selectedDesigns,
        currentDesign: state.currentDesign,
        analysisTab: state.analysisTab,
      }),
      onRehydrateStorage: () => (state) => {
        // Validate persisted state after rehydration
        if (state) {
          // Validate currentDesign - reset to null if invalid
          if (state.currentDesign && !isValidDesignId(state.currentDesign)) {
            console.warn(`Invalid design ID "${state.currentDesign}" in localStorage, resetting to null`);
            state.setCurrentDesign(null);
          }
          // Validate selectedDesigns - filter out invalid IDs
          const validSelectedDesigns = state.selectedDesigns.filter(isValidDesignId);
          if (validSelectedDesigns.length !== state.selectedDesigns.length) {
            console.warn('Invalid design IDs in selectedDesigns, filtering');
            state.setSelectedDesigns(validSelectedDesigns);
          }
        }
      },
    }
  )
);
