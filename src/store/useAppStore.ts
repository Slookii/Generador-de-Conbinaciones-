import { create } from 'zustand';

interface AppState {
  // Filters
  includedNumbers: number[];
  setIncludedNumbers: (numbers: number[]) => void;

  // Selection
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;

  // Random Generator
  generatedCombination: number[] | null;
  setGeneratedCombination: (combo: number[] | null) => void;

  // Search
  searchedIndex: number | null;
  setSearchedIndex: (index: number | null) => void;

  // Saved Combinations
  savedCombinations: number[][];
  addSavedCombination: (combo: number[]) => void;
  removeSavedCombination: (index: number) => void;
}

const loadSaved = (): number[][] => {
  try {
    const item = localStorage.getItem('qini6_saved');
    return item ? JSON.parse(item) : [];
  } catch { return []; }
};

export const useAppStore = create<AppState>((set) => ({
  includedNumbers: [],
  setIncludedNumbers: (numbers: number[]) => set({ includedNumbers: numbers }),

  hoveredIndex: null,
  setHoveredIndex: (index: number | null) => set({ hoveredIndex: index }),

  generatedCombination: null,
  setGeneratedCombination: (combo: number[] | null) => set({ generatedCombination: combo }),

  searchedIndex: null,
  setSearchedIndex: (index: number | null) => set({ searchedIndex: index }),

  savedCombinations: loadSaved(),
  addSavedCombination: (combo: number[]) => set((state: AppState) => {
    const exists = state.savedCombinations.some(c => JSON.stringify(c) === JSON.stringify(combo));
    if (exists) return {}; // No change if exists, avoiding state update or return partial?
    // Zustand merge: returning {} merges nothing? actually better to check before calling set or return state.
    // Zustand convention: return partial state.

    const newSaved = [combo, ...state.savedCombinations];
    localStorage.setItem('qini6_saved', JSON.stringify(newSaved));
    return { savedCombinations: newSaved };
  }),
  removeSavedCombination: (indexToRemove: number) => set((state: AppState) => {
    const newSaved = state.savedCombinations.filter((_, i) => i !== indexToRemove);
    localStorage.setItem('qini6_saved', JSON.stringify(newSaved));
    return { savedCombinations: newSaved };
  }),
}));
