import { useState, useEffect, useMemo } from 'react';
import { getFeatureIcon } from '../config/featureIcons';
import { getSnippets } from '../lib/api';
import type { Language } from '../types';

export interface SnippetOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

interface SnippetFromApi {
  id: string;
  name?: string;
  description?: string;
  language: string;
  feature: string;
}

export function useSnippets(): {
  snippetsByLanguage: Record<Language, SnippetOption[]>;
  isLoading: boolean;
  error: string | null;
} {
  const [rawSnippets, setRawSnippets] = useState<SnippetFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSnippets() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSnippets();
        if (!cancelled && Array.isArray(data)) {
          setRawSnippets(
            data.map((s) => ({
              id: s.id,
              language: s.language,
              feature: s.feature,
              name: (s as SnippetFromApi).name,
              description: (s as SnippetFromApi).description,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement des snippets');
          setRawSnippets([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchSnippets();
    return () => {
      cancelled = true;
    };
  }, []);

  const snippetsByLanguage = useMemo(() => {
    const byLang: Record<string, SnippetOption[]> = {};
    for (const s of rawSnippets) {
      const lang = s.language as Language;
      if (!byLang[lang]) {
        byLang[lang] = [];
      }
      byLang[lang].push({
        value: s.feature,
        label: s.name ?? s.feature,
        description: s.description ?? '',
        icon: getFeatureIcon(s.feature),
      });
    }
    return byLang as Record<Language, SnippetOption[]>;
  }, [rawSnippets]);

  return {
    snippetsByLanguage,
    isLoading,
    error,
  };
}
