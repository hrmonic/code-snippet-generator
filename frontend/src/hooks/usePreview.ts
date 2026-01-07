import { useEffect, useState, useCallback, useRef } from 'react';
import type { Language, FeatureType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const PREVIEW_DEBOUNCE_MS = 500;

interface UsePreviewResult {
  previewCode: string | null;
  isGenerating: boolean;
  error: string | null;
}

export function usePreview(
  language: Language | null,
  feature: FeatureType | null,
  options: Record<string, unknown>,
  enabled: boolean = true
): UsePreviewResult {
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef<Record<string, unknown>>(options);

  // Mettre à jour la ref des options
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const generatePreview = useCallback(async () => {
    if (!language || !feature || !enabled) {
      setPreviewCode(null);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          feature,
          options: optionsRef.current,
          preview: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setPreviewCode(data.code || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la prévisualisation';
      setError(errorMessage);
      setPreviewCode(null);
      console.error('Erreur lors de la génération de la prévisualisation:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [language, feature, enabled]);

  useEffect(() => {
    // Nettoyer le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Ne pas générer de prévisualisation si les options sont vides
    if (!enabled || !language || !feature || Object.keys(options).length === 0) {
      setPreviewCode(null);
      return;
    }

    // Débouncer la génération de prévisualisation
    const timer = setTimeout(() => {
      generatePreview();
    }, PREVIEW_DEBOUNCE_MS);

    debounceTimerRef.current = timer;

    // Cleanup
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      if (debounceTimerRef.current === timer) {
        debounceTimerRef.current = null;
      }
    };
  }, [language, feature, enabled, generatePreview, options]);

  // Cleanup du timer au démontage
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  return {
    previewCode,
    isGenerating,
    error,
  };
}

