import { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { DOM_IDS } from '../constants/dom';
import { useScrollToGeneratedCode } from '../hooks/useScrollToSection';
import { useSnippetOptions } from '../hooks/useSnippetOptions';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { generateCode } from '../lib/api';
import { FeatureInfo } from './FeatureInfo';
import { LoadingSpinner } from './LoadingSpinner';
import { GROUP_LABELS } from '../constants/options';
import { OptionGroup, groupOptionsByCategory } from './OptionGroup';
import { OptionInput } from './OptionInput';
import type { OptionConfig } from '../types';

function optionValue(
  opt: OptionConfig,
  local: Record<string, unknown>
): string | number | boolean | string[] {
  const raw = local[opt.key] ?? opt.defaultValue ?? (opt.type === 'checkbox' ? false : opt.type === 'multiselect' ? [] : '');
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') return raw;
  if (Array.isArray(raw)) return raw;
  return opt.type === 'checkbox' ? false : opt.type === 'multiselect' ? [] : '';
}

function SnippetOptionsComponent() {
  const { selectedLanguage, selectedFeature, setOptions, setGeneratedCode, setLoading, setError, isLoading } =
    useGeneratorStore();
  const [localOptions, setLocalOptions] = useState<Record<string, unknown>>({});
  const scrollToGeneratedCode = useScrollToGeneratedCode();
  const appliedDefaultsRef = useRef(false);

  const { options: featureOptions, isLoading: isLoadingOptions, error: optionsError, applyDefaults } =
    useSnippetOptions(selectedLanguage, selectedFeature);

  useEffect(() => {
    appliedDefaultsRef.current = false;
    setLocalOptions({});
    setOptions({});
  }, [selectedLanguage, selectedFeature, setOptions]);

  // Appliquer les valeurs par défaut une seule fois au chargement des options (évite d’écraser la saisie)
  useEffect(() => {
    if (featureOptions.length === 0 || appliedDefaultsRef.current) return;
    appliedDefaultsRef.current = true;
    const defaults = applyDefaults({});
    setLocalOptions(defaults);
    setOptions(defaults);
  }, [featureOptions.length, applyDefaults, setOptions]);

  // Filtrer les options selon les dépendances (DOIT être avant le return conditionnel)
  const visibleOptions = useMemo(() => {
    if (!selectedLanguage || !selectedFeature) {
      return [];
    }
    return featureOptions.filter((option) => {
      if (!option.dependsOn) {
        return true;
      }

      // Vérifier toutes les dépendances
      for (const [depKey, depValues] of Object.entries(option.dependsOn)) {
        const currentValue = localOptions[depKey];
        if (!depValues.includes(currentValue as string | boolean | number)) {
          return false;
        }
      }

      return true;
    });
  }, [featureOptions, localOptions, selectedLanguage, selectedFeature]);

  // Grouper les options par catégorie
  const groupedOptions = useMemo(() => {
    return groupOptionsByCategory(visibleOptions);
  }, [visibleOptions]);

  const canGenerate = visibleOptions.every(
    (opt) => !opt.required || (localOptions[opt.key] !== undefined && localOptions[opt.key] !== '')
  );

  const handleOptionChange = useCallback((key: string, value: unknown) => {
    setLocalOptions((prev) => {
      const next = { ...prev, [key]: value };
      setOptions(next);
      return next;
    });
  }, [setOptions]);

  const handleGenerate = async () => {
    if (!selectedLanguage || !selectedFeature) return;
    setLoading(true);
    setError(null);
    try {
      const response = await generateCode({
        language: selectedLanguage,
        feature: selectedFeature,
        options: localOptions,
      });
      if (response.files?.length) {
        setGeneratedCode(response.files.map((f) => f.code));
      } else if (response.code) {
        setGeneratedCode(response.code);
      } else {
        setGeneratedCode(null);
      }
      setTimeout(() => scrollToGeneratedCode(), 150);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const generateRef = useRef(handleGenerate);
  generateRef.current = handleGenerate;
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!canGenerate || isLoading) return;
        e.preventDefault();
        generateRef.current();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [canGenerate, isLoading]);

  if (!selectedLanguage || !selectedFeature) {
    return null;
  }

  return (
    <div id={DOM_IDS.optionsSection} className="card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-indigo-600 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Options de configuration</h2>
      </div>
      <FeatureInfo language={selectedLanguage} feature={selectedFeature} />
      
      {isLoadingOptions ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : optionsError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200 font-medium">Erreur lors du chargement des options</p>
          <p className="text-red-600 dark:text-red-300 text-sm mt-1">{optionsError}</p>
        </div>
      ) : visibleOptions.length === 0 ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/30 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">Aucune option requise</p>
                <p className="text-blue-600 dark:text-blue-300 text-sm">
                  Cliquez sur "Générer le code" pour créer le code avec les paramètres par défaut.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : Object.keys(groupedOptions).length > 1 ? (
        <div className="space-y-4">
          {Object.entries(groupedOptions).map(([groupKey, groupOptions]) => (
            <OptionGroup
              key={groupKey}
              title={GROUP_LABELS[groupKey] || groupKey}
              defaultOpen={groupKey === 'default' || groupKey === 'basic'}
            >
              {groupOptions.map((opt) => (
                <OptionInput
                  key={`${groupKey}-${opt.key}`}
                  type={opt.type}
                  label={opt.label}
                  value={optionValue(opt, localOptions)}
                  onChange={(value) => handleOptionChange(opt.key, value)}
                  placeholder={opt.placeholder}
                  required={opt.required}
                  options={opt.options}
                  description={opt.description}
                  min={opt.min}
                  max={opt.max}
                />
              ))}
            </OptionGroup>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {visibleOptions.map((opt) => (
            <OptionInput
              key={opt.key}
              type={opt.type}
              label={opt.label}
              value={optionValue(opt, localOptions)}
              onChange={(value) => handleOptionChange(opt.key, value)}
              placeholder={opt.placeholder}
              required={opt.required}
              options={opt.options}
              description={opt.description}
              min={opt.min}
              max={opt.max}
            />
          ))}
        </div>
      )}
      <div className="mt-8 flex justify-end">
        <button
          id={DOM_IDS.generateCodeBtn}
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate || isLoading}
          aria-busy={isLoading}
          aria-disabled={!canGenerate || isLoading}
          aria-label={isLoading ? 'Génération en cours...' : 'Générer le code'}
          className="btn-primary flex items-center gap-2 text-lg px-8 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {isLoading ? 'Génération...' : 'Générer le code'}
          <span className="hidden sm:inline text-sm font-normal opacity-90">(Ctrl+Entrée)</span>
        </button>
      </div>
    </div>
  );
}

// Optimisation avec React.memo
export const SnippetOptions = memo(SnippetOptionsComponent);
