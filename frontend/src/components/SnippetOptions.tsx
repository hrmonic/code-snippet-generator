import { useState, useEffect } from 'react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { generateCode } from '../lib/generator';
import { FeatureInfo } from './FeatureInfo';

export function SnippetOptions() {
  const { selectedLanguage, selectedFeature, setOptions, setGeneratedCode, setLoading, setError } =
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
    if (selectedFeature === 'joins' && selectedLanguage === 'sql') {
      return [
        { key: 'tableName1', label: 'Première table', placeholder: 'users', required: true },
        { key: 'tableName2', label: 'Deuxième table', placeholder: 'posts', required: true },
      ];
    }
    if (selectedFeature === 'transactions' && selectedLanguage === 'sql') {
      return [
        { key: 'tableName1', label: 'Première table', placeholder: 'users', required: true },
        { key: 'tableName2', label: 'Deuxième table', placeholder: 'accounts', required: false },
      ];
    }
    if (selectedFeature === 'indexes' && selectedLanguage === 'sql') {
      return [
        { key: 'tableName', label: 'Nom de la table', placeholder: 'users', required: true },
        { key: 'columnName', label: 'Nom de la colonne', placeholder: 'email', required: true },
      ];
    }
    if (selectedFeature === 'api' && selectedLanguage === 'javascript') {
      return [
        { key: 'baseURL', label: 'URL de base', placeholder: 'http://localhost:3000/api', required: false },
        { key: 'endpoint', label: 'Endpoint', placeholder: '/api/users', required: true },
      ];
    }
    if (selectedFeature === 'fetch' && selectedLanguage === 'javascript') {
      return [
        { key: 'baseURL', label: 'URL de base', placeholder: 'http://localhost:3000/api', required: true },
        { key: 'endpoint', label: 'Endpoint', placeholder: '/api/users', required: true },
      ];
    }
    if (selectedFeature === 'api' && selectedLanguage === 'java') {
      return [
        { key: 'entityName', label: 'Nom de l\'entité', placeholder: 'User', required: true },
        { key: 'endpoint', label: 'Endpoint', placeholder: '/api/users', required: true },
      ];
    }
    if (selectedFeature === 'model' && selectedLanguage === 'java') {
      return [
        { key: 'entityName', label: 'Nom de l\'entité', placeholder: 'User', required: true },
        { key: 'tableName', label: 'Nom de la table', placeholder: 'users', required: true },
      ];
    }
    if (selectedFeature === 'service' && selectedLanguage === 'java') {
      return [
        { key: 'entityName', label: 'Nom de l\'entité', placeholder: 'User', required: true },
        { key: 'tableName', label: 'Nom de la table', placeholder: 'users', required: true },
      ];
    }
    if (selectedFeature === 'repository' && selectedLanguage === 'java') {
      return [
        { key: 'entityName', label: 'Nom de l\'entité', placeholder: 'User', required: true },
        { key: 'tableName', label: 'Nom de la table', placeholder: 'users', required: true },
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
    if (selectedFeature === 'modal' && selectedLanguage === 'html5') {
      return [
        { key: 'modalTitle', label: 'Titre de la modal', placeholder: 'Confirmation', required: true },
        { key: 'modalContent', label: 'Contenu de la modal', placeholder: 'Êtes-vous sûr ?', required: true },
      ];
    }
    if (selectedFeature === 'navbar' && selectedLanguage === 'html5') {
      return [
        { key: 'siteName', label: 'Nom du site', placeholder: 'Mon Site', required: true },
      ];
    }
    if (selectedFeature === 'card' && selectedLanguage === 'html5') {
      return [
        { key: 'cardTitle', label: 'Titre de la card', placeholder: 'Titre', required: true },
        { key: 'cardContent', label: 'Contenu de la card', placeholder: 'Contenu de la card', required: true },
        { key: 'buttonText', label: 'Texte du bouton', placeholder: 'En savoir plus', required: false },
      ];
    }
    if (selectedFeature === 'table' && selectedLanguage === 'html5') {
      return [
        { key: 'tableTitle', label: 'Titre du tableau', placeholder: 'Liste des utilisateurs', required: true },
        { key: 'column1', label: 'Colonne 1', placeholder: 'Nom', required: true },
        { key: 'column2', label: 'Colonne 2', placeholder: 'Email', required: true },
        { key: 'column3', label: 'Colonne 3', placeholder: 'Rôle', required: true },
      ];
    }
    if (selectedFeature === 'slider' && selectedLanguage === 'html5') {
      return [
        { key: 'sliderTitle', label: 'Titre du slider', placeholder: 'Carousel', required: true },
      ];
    }
    // Features sans options requises
    if (
      (selectedFeature === 'animation' && (selectedLanguage === 'css3' || selectedLanguage === 'javascript')) ||
      (selectedFeature === 'validation' && (selectedLanguage === 'javascript' || selectedLanguage === 'php')) ||
      (selectedFeature === 'input' && selectedLanguage === 'html5') ||
      (selectedFeature === 'layout' && selectedLanguage === 'css3') ||
      (selectedFeature === 'responsive' && selectedLanguage === 'css3') ||
      (selectedFeature === 'flexbox' && selectedLanguage === 'css3') ||
      (selectedFeature === 'grid' && selectedLanguage === 'css3') ||
      (selectedFeature === 'buttons' && selectedLanguage === 'css3') ||
      (selectedFeature === 'variables' && selectedLanguage === 'css3') ||
      (selectedFeature === 'storage' && selectedLanguage === 'javascript') ||
      (selectedFeature === 'debounce' && selectedLanguage === 'javascript') ||
      (selectedFeature === 'promise' && selectedLanguage === 'javascript') ||
      (selectedFeature === 'observer' && selectedLanguage === 'javascript') ||
      (selectedFeature === 'router' && selectedLanguage === 'php') ||
      (selectedFeature === 'middleware' && selectedLanguage === 'php')
    ) {
      return [];
    }
    return [];
  };

  const featureOptions = getOptionsForFeature();
  const canGenerate = featureOptions.every(
    (opt) => !opt.required || localOptions[opt.key]?.trim()
  );

  return (
    <div className="card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-indigo-600 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-900">Options de configuration</h2>
      </div>
      <FeatureInfo language={selectedLanguage} feature={selectedFeature} />
      {featureOptions.length === 0 ? (
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
      ) : (
        <div className="space-y-5">
          {featureOptions.map((opt) => (
            <div key={opt.key} className="animate-fade-in">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
