import { useGeneratorStore } from '../store/useGeneratorStore';
import { useSnippets } from '../hooks/useSnippets';
import { LoadingSpinner } from './LoadingSpinner';

export function FeatureSelector() {
  const { selectedLanguage, selectedFeature, setFeature } = useGeneratorStore();
  const { snippetsByLanguage, isLoading, error } = useSnippets();

  if (!selectedLanguage) {
    return (
      <div className="card shadow-lg">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👈</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            Veuillez d'abord sélectionner un langage
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card shadow-lg">
        <LoadingSpinner size="md" text="Chargement des fonctionnalités..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-lg">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-300 mb-2">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Vérifiez la connexion ou réessayez plus tard.</p>
        </div>
      </div>
    );
  }

  const availableFeatures = snippetsByLanguage[selectedLanguage] ?? [];

  if (availableFeatures.length === 0) {
    return (
      <div className="card shadow-lg">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Aucune fonctionnalité disponible pour ce langage.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-indigo-600 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sélectionner un besoin</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableFeatures.map((feature) => (
          <button
            type="button"
            key={feature.value}
            onClick={() => setFeature(feature.value)}
            aria-pressed={selectedFeature === feature.value}
            aria-label={`Sélectionner ${feature.label}`}
            className={`
              group relative p-5 rounded-xl border-2 text-left transition-all duration-300 transform
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
              ${
                selectedFeature === feature.value
                  ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-indigo-50 shadow-lg scale-105 dark:from-primary-900/30 dark:to-indigo-900/30 dark:border-primary-400'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 hover:shadow-md hover:scale-105 dark:border-gray-600 dark:hover:border-primary-500 dark:hover:bg-gray-700'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{feature.icon}</div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold mb-1 truncate ${selectedFeature === feature.value ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100'}`}>
                  {feature.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{feature.description}</div>
              </div>
              {selectedFeature === feature.value && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
