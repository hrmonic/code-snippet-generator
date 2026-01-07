import { useState, useEffect, useMemo, memo } from 'react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { generateCode } from '../lib/generator';
import { FeatureInfo } from './FeatureInfo';
import { OptionInput } from './OptionInput';
import { useSnippetOptions } from '../hooks/useSnippetOptions';
import { LoadingSpinner } from './LoadingSpinner';
import { OptionGroup, groupOptionsByCategory, GROUP_LABELS } from './OptionGroup';

function SnippetOptionsComponent() {
  const { selectedLanguage, selectedFeature, setOptions, setGeneratedCode, setLoading, setError } =
    useGeneratorStore();
  const [localOptions, setLocalOptions] = useState<Record<string, any>>({});

  // Charger les options dynamiquement depuis l'API
  const { options: featureOptions, isLoading: isLoadingOptions, error: optionsError, applyDefaults } =
    useSnippetOptions(selectedLanguage, selectedFeature);

  useEffect(() => {
    // Reset options when language or feature changes
    setLocalOptions({});
    setOptions({});
  }, [selectedLanguage, selectedFeature, setOptions]);

  // Appliquer les valeurs par défaut quand les options sont chargées
  useEffect(() => {
    if (featureOptions.length > 0 && Object.keys(localOptions).length === 0) {
      const defaults = applyDefaults({});
      setLocalOptions(defaults);
      setOptions(defaults);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Grouper les options par catégorie (DOIT être avant le return conditionnel)
  const groupedOptions = useMemo(() => {
    return groupOptionsByCategory(visibleOptions);
  }, [visibleOptions]);

  if (!selectedLanguage || !selectedFeature) {
    return null;
  }

  const handleOptionChange = (key: string, value: any) => {
    const newOptions = { ...localOptions, [key]: value };
    setLocalOptions(newOptions);
    setOptions(newOptions);
  };

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
      
      // Gérer les fichiers multiples (pour CRUD Java par exemple)
      if (response.files && Array.isArray(response.files) && response.files.length > 0) {
        // Stocker tous les codes comme un tableau
        const codes = response.files.map((f) => f.code);
        setGeneratedCode(codes);
      } else if (response.code) {
        setGeneratedCode(response.code);
      } else {
        setGeneratedCode(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };


  const canGenerate = visibleOptions.every(
    (opt) => !opt.required || (localOptions[opt.key] !== undefined && localOptions[opt.key] !== '')
  );

  return (
    <div className="card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-indigo-600 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-900">Options de configuration</h2>
      </div>
      <FeatureInfo language={selectedLanguage} feature={selectedFeature} />
      
      {isLoadingOptions ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : optionsError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Erreur lors du chargement des options</p>
          <p className="text-red-600 text-sm mt-1">{optionsError}</p>
        </div>
      ) : visibleOptions.length === 0 ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <p className="text-blue-800 font-medium mb-1">Aucune option requise</p>
                <p className="text-blue-600 text-sm">
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
                  key={opt.key}
                  type={opt.type}
                  label={opt.label}
                  value={localOptions[opt.key] ?? opt.defaultValue ?? (opt.type === 'checkbox' ? false : opt.type === 'multiselect' ? [] : '')}
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
              value={localOptions[opt.key] ?? opt.defaultValue ?? (opt.type === 'checkbox' ? false : opt.type === 'multiselect' ? [] : '')}
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
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Générer le code
        </button>
      </div>
    </div>
  );
}

// Optimisation avec React.memo
export const SnippetOptions = memo(SnippetOptionsComponent);
