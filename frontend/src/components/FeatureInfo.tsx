import { useEffect, useState } from 'react';
import { getSnippetPath } from '../config/env';
import type { Language, FeatureType } from '../types';

interface FeatureInfoProps {
  language: Language;
  feature: FeatureType;
}

/** Fallback when snippet JSON has no description (e.g. demo or legacy). */
const FALLBACK_DESCRIPTIONS: Record<string, Record<string, string>> = {
  html5: {
    form: 'Formulaire HTML5 avec validation native, champs sécurisés et accessibilité',
    input: 'Collection de champs input HTML5 modernes (email, date, color, range, etc.)',
    layout: 'Structure HTML5 sémantique responsive avec header, main, aside, footer',
  },
  css3: {
    layout: 'Layouts CSS3 avec Grid et Flexbox, responsive et moderne',
    animation: 'Animations CSS3 avec keyframes (fadeIn, slideIn, pulse, etc.)',
  },
  javascript: {
    api: "Client API JavaScript avec fetch, gestion d'erreurs et interceptors",
    validation: 'Validation de formulaire côté client avec messages d\'erreur',
    animation: 'Animations JavaScript avec requestAnimationFrame pour performance',
  },
  java: {
    crud: 'CRUD complet avec Spring Boot : Controller, Model, Service et Repository',
    api: 'API REST avec Spring, endpoints complets et gestion des erreurs',
  },
  php: {
    crud: 'CRUD PHP avec PDO, protection SQL injection et méthodes complètes',
    api: 'API REST PHP avec validation, réponses JSON et gestion des erreurs',
  },
  sql: {
    query: 'Requêtes SQL sécurisées avec prepared statements et exemples',
  },
};

export function FeatureInfo({ language, feature }: FeatureInfoProps) {
  const [description, setDescription] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const path = getSnippetPath(language, feature);
    fetch(path)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { description?: string } | null) => {
        if (cancelled) return;
        const fromJson = data?.description?.trim();
        setDescription(
          fromJson || FALLBACK_DESCRIPTIONS[language]?.[feature] || null
        );
      })
      .catch(() => {
        if (!cancelled) {
          setDescription(FALLBACK_DESCRIPTIONS[language]?.[feature] ?? null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [language, feature]);

  if (!description) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 dark:bg-blue-900/30 dark:border-blue-700">
      <div className="flex items-start gap-3">
        <span className="text-blue-600 dark:text-blue-400 text-xl">ℹ️</span>
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">À propos de ce snippet</h3>
          <p className="text-blue-800 dark:text-blue-300 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}
