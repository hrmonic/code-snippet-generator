import { create } from 'zustand';
import type { Language, FeatureType } from '../types';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  language: Language;
  feature: FeatureType;
  options: Record<string, unknown>;
  code?: string;
  isFavorite?: boolean;
}

interface HistoryStore {
  entries: HistoryEntry[];
  favorites: string[]; // IDs des entrées favorites
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  removeEntry: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
  getRecentEntries: (limit?: number) => HistoryEntry[];
  getFavorites: () => HistoryEntry[];
  getEntry: (id: string) => HistoryEntry | undefined;
}

// Fonction de persistance simple avec localStorage
const loadFromStorage = (): { entries: HistoryEntry[]; favorites: string[] } => {
  try {
    const stored = localStorage.getItem('code-generator-history');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error);
  }
  return { entries: [], favorites: [] };
};

const saveToStorage = (entries: HistoryEntry[], favorites: string[]) => {
  try {
    localStorage.setItem('code-generator-history', JSON.stringify({ entries, favorites }));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'historique:', error);
  }
};

const initialState = loadFromStorage();

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  entries: initialState.entries,
  favorites: initialState.favorites,

  addEntry: (entry) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      isFavorite: false,
    };

    set((state) => {
      const newEntries = [newEntry, ...state.entries].slice(0, 50); // Garder max 50 entrées
      saveToStorage(newEntries, state.favorites);
      return { entries: newEntries };
    });
  },

  removeEntry: (id) => {
    set((state) => {
      const newEntries = state.entries.filter((entry) => entry.id !== id);
      const newFavorites = state.favorites.filter((favId) => favId !== id);
      saveToStorage(newEntries, newFavorites);
      return {
        entries: newEntries,
        favorites: newFavorites,
      };
    });
  },

  toggleFavorite: (id) => {
    set((state) => {
      const isFavorite = state.favorites.includes(id);
      const newFavorites = isFavorite
        ? state.favorites.filter((favId) => favId !== id)
        : [...state.favorites, id];

      const newEntries = state.entries.map((entry) =>
        entry.id === id ? { ...entry, isFavorite: !isFavorite } : entry
      );

      saveToStorage(newEntries, newFavorites);
      return {
        favorites: newFavorites,
        entries: newEntries,
      };
    });
  },

  clearHistory: () => {
    saveToStorage([], []);
    set({
      entries: [],
      favorites: [],
    });
  },

  getRecentEntries: (limit = 10) => {
    const { entries } = get();
    return entries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },

  getFavorites: () => {
    const { entries, favorites } = get();
    return entries.filter((entry) => favorites.includes(entry.id));
  },

  getEntry: (id) => {
    const { entries } = get();
    return entries.find((entry) => entry.id === id);
  },
}));

