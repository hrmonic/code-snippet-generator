import { useState, useEffect } from 'react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { generateCode } from '../lib/generator';
import { FeatureInfo } from './FeatureInfo';

export function SnippetOptions() {
  const { selectedLanguage, selectedFeature, options, setOptions, setGeneratedCode, setLoading, setError } =
    useGeneratorStore();
  const [localOptions, setLocalOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    // Reset options when language or feature changes
    setLocalOptions({});
    setOptions({});
  }, [selectedLanguage, selectedFeature, setOptions]);

  if (!selectedLanguage || !selectedFeature) {
    return null;
  }

  const handleOptionChange = (key: string, value: string) => {
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
      setGeneratedCode(response.code);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Options dynamiques selon le langage et feature
  const getOptionsForFeature = () => {
    if (selectedFeature === 'crud' && (selectedLanguage === 'php' || selectedLanguage === 'java')) {
      return [
        { key: 'tableName', label: 'Nom de la table', placeholder: 'users', required: true },
        { key: 'entityName', label: 'Nom de l\'entité', placeholder: 'User', required: true },
        {
          key: 'fields',
          label: 'Champs (séparés par des virgules)',
          placeholder: 'id,name,email,created_at',
          required: true,
        },
      ];
    }
    if (selectedFeature === 'form' && selectedLanguage === 'html5') {
      return [
        { key: 'formName', label: 'Nom du formulaire', placeholder: 'contact', required: true },
        { key: 'action', label: 'Action (URL)', placeholder: '/submit', required: false },
        { key: 'method', label: 'Méthode HTTP', placeholder: 'POST', required: false },
      ];
    }
    if (selectedFeature === 'query' && selectedLanguage === 'sql') {
      return [
        { key: 'tableName', label: 'Nom de la table', placeholder: 'users', required: true },
        { key: 'operation', label: 'Opération', placeholder: 'SELECT', required: false },
        { key: 'columns', label: 'Colonnes', placeholder: 'id,name,email', required: false },
      ];
    }
    if (selectedFeature === 'api' && selectedLanguage === 'javascript') {
      return [
        { key: 'baseURL', label: 'URL de base', placeholder: 'http://localhost:3000/api', required: false },
        { key: 'endpoint', label: 'Endpoint', placeholder: '/api/users', required: true },
      ];
    }
    if (selectedFeature === 'api' && selectedLanguage === 'java') {
      return [
        { key: 'entityName', label: 'Nom de l\'entité', placeholder: 'User', required: true },
        { key: 'endpoint', label: 'Endpoint', placeholder: '/api/users', required: true },
      ];
    }
    if (selectedFeature === 'api' && selectedLanguage === 'php') {
      return [
        { key: 'endpoint', label: 'Endpoint', placeholder: 'users', required: true },
      ];
    }
    if (selectedFeature === 'layout' && selectedLanguage === 'html5') {
      return [
        { key: 'title', label: 'Titre de la page', placeholder: 'Ma Page', required: true },
        { key: 'companyName', label: 'Nom de l\'entreprise', placeholder: 'Mon Entreprise', required: false },
      ];
    }
    if (selectedFeature === 'animation' && selectedLanguage === 'css3') {
      return [];
    }
    if (selectedFeature === 'animation' && selectedLanguage === 'javascript') {
      return [];
    }
    if (selectedFeature === 'validation' && selectedLanguage === 'javascript') {
      return [];
    }
    if (selectedFeature === 'input' && selectedLanguage === 'html5') {
      return [];
    }
    if (selectedFeature === 'layout' && selectedLanguage === 'css3') {
      return [];
    }
    return [];
  };

  const featureOptions = getOptionsForFeature();
  const canGenerate = featureOptions.every(
    (opt) => !opt.required || localOptions[opt.key]?.trim()
  );

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Options de configuration</h2>
      <FeatureInfo language={selectedLanguage} feature={selectedFeature} />
      {featureOptions.length === 0 ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Aucune option requise pour cette combinaison. Cliquez sur Générer pour créer le code.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {featureOptions.map((opt) => (
            <div key={opt.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {opt.label}
                {opt.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="text"
                value={localOptions[opt.key] || ''}
                onChange={(e) => handleOptionChange(opt.key, e.target.value)}
                placeholder={opt.placeholder}
                className="input"
                required={opt.required}
              />
            </div>
          ))}
        </div>
      )}
      <div className="mt-6">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="btn-primary w-full md:w-auto"
        >
          Générer le code
        </button>
      </div>
    </div>
  );
}

