import { useEffect, useState, useCallback, useRef } from 'react';
import { generatePreview as apiGeneratePreview } from '../lib/api';
import type { Language, FeatureType } from '../types';

const PREVIEW_DEBOUNCE_MS = 280;

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
      const result = await apiGeneratePreview({
        language,
        feature,
        options: optionsRef.current,
      });
      setPreviewCode(result.code ?? null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la prévisualisation';
      if (msg.includes('non disponible')) {
        setPreviewCode(null);
        setError(null);
      } else {
        setError(msg);
        setPreviewCode(null);
      }
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

    // Autoriser la préview dès que language + feature sont définis (options peut être vide)
    if (!enabled || !language || !feature) {
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

