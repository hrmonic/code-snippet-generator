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

/**
 * Transforme les variables d'un snippet en OptionConfig
 */
function transformVariablesToOptions(variables: any[]): OptionConfig[] {
  return variables.map((variable) => {
    // Mapper les types : 'string' -> 'text'
    let type = variable.type;
    if (type === 'string') {
      type = 'text';
    }

    const option: OptionConfig = {
      key: variable.name,
      label: variable.label || variable.description || variable.name,
      type: type as OptionConfig['type'],
      required: variable.required,
      defaultValue: variable.defaultValue,
      description: variable.description,
    };

    // Ajouter les propriétés spécifiques au type (utiliser variable.type original)
    const originalType = variable.type;
    if (originalType === 'select' || originalType === 'multiselect') {
      option.options = variable.options || [];
    }
    if (originalType === 'number' || originalType === 'range') {
      option.min = variable.min;
      option.max = variable.max;
    }
    if (variable.placeholder) {
      option.placeholder = variable.placeholder;
    }
    if (variable.dependsOn) {
      option.dependsOn = variable.dependsOn;
    }
    if (variable.group) {
      option.group = variable.group;
    }

    return option;
  });
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

    const fetchOptions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Essayer d'abord l'API avec timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${API_BASE_URL}/api/snippets/${language}/${feature}/options`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        setOptions(data);
      } catch (err) {
        // Ignorer silencieusement les erreurs d'abort (timeout) et de connexion refusée
        if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED'))) {
          // Erreur réseau normale, continuer avec le fallback sans log
        } else {
          // Autres erreurs, continuer avec le fallback
        }
        // Si l'API échoue, essayer de charger depuis les fichiers JSON statiques
        try {
          // Utiliser le base path de Vite (important pour GitHub Pages)
          const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '';
          const snippetPath = `${basePath}/snippets/${language}/${feature}.json`;
          
          const snippetResponse = await fetch(snippetPath);
          
          if (!snippetResponse.ok) {
            // Si 404, le snippet n'existe simplement pas - pas d'erreur à afficher
            if (snippetResponse.status === 404) {
              setOptions([]);
              setError(null);
              return;
            }
            throw new Error(`Snippet non trouvé: ${snippetResponse.status}`);
          }

          const snippetData = await snippetResponse.json();
          
          if (snippetData.variables && Array.isArray(snippetData.variables)) {
            const transformedOptions = transformVariablesToOptions(snippetData.variables);
            setOptions(transformedOptions);
            setError(null); // Pas d'erreur si on a réussi à charger depuis les fichiers statiques
          } else {
            throw new Error('Format de snippet invalide');
          }
        } catch (fallbackErr) {
          // Si même le fallback échoue, vérifier si c'est une 404 (snippet n'existe pas)
          const is404Error = fallbackErr instanceof Error && (
            fallbackErr.message.includes('404') || 
            fallbackErr.message.includes('Snippet non trouvé') ||
            fallbackErr.message.includes('non disponible')
          );
          
          if (is404Error) {
            setOptions([]);
            setError(null);
            return;
          }
          
          // Pour les autres erreurs, seulement afficher si ce n'est pas une erreur réseau normale
          const isNetworkError = err instanceof Error && (
            err.name === 'AbortError' || 
            err.message.includes('Failed to fetch') || 
            err.message.includes('ERR_CONNECTION_REFUSED') ||
            err.message.includes('aborted')
          );
          
          if (!isNetworkError && fallbackErr instanceof Error && !is404Error) {
            const errorMessage = fallbackErr.message || (err instanceof Error ? err.message : 'Erreur inconnue');
            setError(errorMessage);
          } else {
            // Erreur réseau normale (API indisponible) ou snippet n'existe pas, pas besoin d'afficher d'erreur
            setError(null);
          }
          setOptions([]);
        }
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

