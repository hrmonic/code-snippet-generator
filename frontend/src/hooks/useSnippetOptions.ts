import { useState, useEffect, useCallback } from 'react';
import { getOptions } from '../lib/api';
import type { Language, FeatureType, OptionConfig } from '../types';

export type { OptionConfig };

interface UseSnippetOptionsResult {
  options: OptionConfig[];
  isLoading: boolean;
  error: string | null;
  applyDefaults: (currentValues: Record<string, unknown>) => Record<string, unknown>;
}

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

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getOptions(language, feature)
      .then((data) => {
        if (!cancelled) {
          setOptions(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Erreur inconnue';
          const is404 = msg.includes('404') || msg.includes('Snippet non trouvé') || msg.includes('non disponible');
          setError(is404 ? null : msg);
          setOptions([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
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

