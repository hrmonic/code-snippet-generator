import { useEffect, useState } from 'react';
import { getSnippetPath } from '../config/env';
import type { Language, FeatureType } from '../types';

/**
 * Loads previewMarkup from snippet JSON for CSS3 (design preview).
 * Returns undefined for other languages or when not available.
 */
export function usePreviewMarkup(
  language: Language | null,
  feature: FeatureType | null
): string | undefined {
  const [previewMarkup, setPreviewMarkup] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (language !== 'css3' || !feature) {
      setPreviewMarkup(undefined);
      return;
    }
    let cancelled = false;
    const snippetPath = getSnippetPath(language, feature);
    fetch(snippetPath)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { previewMarkup?: string } | null) => {
        if (!cancelled && data?.previewMarkup) setPreviewMarkup(data.previewMarkup);
        else if (!cancelled) setPreviewMarkup(undefined);
      })
      .catch(() => {
        if (!cancelled) setPreviewMarkup(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [language, feature]);

  return previewMarkup;
}
