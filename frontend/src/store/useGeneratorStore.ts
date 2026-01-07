import { create } from 'zustand';
import type { Language, FeatureType, GeneratorState } from '../types';

interface GeneratorStore extends GeneratorState {
  setLanguage: (language: Language | null) => void;
  setFeature: (feature: FeatureType | null) => void;
  setOptions: (options: Record<string, unknown>) => void;
  setGeneratedCode: (code: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: GeneratorState = {
  selectedLanguage: null,
  selectedFeature: null,
  options: {},
  generatedCode: null,
  isLoading: false,
  error: null,
};

export const useGeneratorStore = create<GeneratorStore>((set) => ({
  ...initialState,
  setLanguage: (language) =>
    set((state) => ({
      selectedLanguage: language,
      // Reset feature when language changes
      selectedFeature: state.selectedFeature && language ? state.selectedFeature : null,
      options: {},
      generatedCode: null,
      error: null,
    })),
  setFeature: (feature) =>
    set({
      selectedFeature: feature,
      options: {},
      generatedCode: null,
      error: null,
    }),
  setOptions: (options) =>
    set({
      options,
      generatedCode: null,
      error: null,
    }),
  setGeneratedCode: (code) =>
    set({
      generatedCode: code,
      error: null,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));

