import { useState, useEffect, useCallback } from 'react';
import type { Language, FeatureType } from '../types';

export interface OptionConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'number' | 'textarea' | 'multiselect' | 'color' | 'range' | 'code';
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string | boolean | number | string[];
  min?: number;
  max?: number;
  dependsOn?: Record<string, (string | boolean | number)[]>;
  group?: string;
}

interface UseSnippetOptionsResult {
  options: OptionConfig[];
  isLoading: boolean;
  error: string | null;
  applyDefaults: (currentValues: Record<string, unknown>) => Record<string, unknown>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useSnippetOptions(
  language: Language | null,
  feature: FeatureType | null
): UseSnippetOptionsResult {
  const [options, setOptions] = useState<OptionConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!language || !feature) {
      setOptions([]);
      setError(null);
      return;
    }

    const fetchOptions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/snippets/${language}/${feature}/options`);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        setOptions(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
        console.error('Erreur lors du chargement des options:', err);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [language, feature]);

  /**
   * Applique les valeurs par défaut aux options (mémorisé)
   */
  const applyDefaults = useCallback((currentValues: Record<string, unknown>): Record<string, unknown> => {
    const valuesWithDefaults = { ...currentValues };

    for (const option of options) {
      // Si la valeur n'existe pas et qu'il y a une valeur par défaut, l'appliquer
      if (option.defaultValue !== undefined && valuesWithDefaults[option.key] === undefined) {
        valuesWithDefaults[option.key] = option.defaultValue;
      }
    }

    return valuesWithDefaults;
  }, [options]);

  return {
    options,
    isLoading,
    error,
    applyDefaults,
  };
}

