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
}

export const useAppStore = create<AppState>((set) => ({
    includedNumbers: [],
    setIncludedNumbers: (numbers) => set({ includedNumbers: numbers }),

    hoveredIndex: null,
    setHoveredIndex: (index) => set({ hoveredIndex: index }),

    generatedCombination: null,
    setGeneratedCombination: (combo) => set({ generatedCombination: combo }),

    searchedIndex: null,
    setSearchedIndex: (index) => set({ searchedIndex: index }),
}));
