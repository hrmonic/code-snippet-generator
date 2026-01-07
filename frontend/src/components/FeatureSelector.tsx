import type { FeatureType } from '../types';
import { useGeneratorStore } from '../store/useGeneratorStore';

const features: Record<string, Array<{ value: FeatureType; label: string; description: string; icon: string }>> = {
  html5: [
    { value: 'form', label: 'Formulaire', description: 'Formulaire HTML avec validation', icon: '📝' },
    { value: 'input', label: 'Champs Input', description: 'Inputs HTML5 (email, date, etc.)', icon: '📥' },
    { value: 'layout', label: 'Layout', description: 'Structure HTML responsive', icon: '📐' },
  ],
  css3: [
    { value: 'layout', label: 'Layout', description: 'Grid, Flexbox, responsive', icon: '📐' },
    { value: 'animation', label: 'Animation', description: 'Animations CSS3', icon: '🎬' },
  ],
  javascript: [
    { value: 'api', label: 'API Client', description: 'Client HTTP avec fetch/axios', icon: '🌐' },
    { value: 'validation', label: 'Validation', description: 'Validation de formulaire', icon: '✅' },
    { value: 'animation', label: 'Animation', description: 'Animations JavaScript', icon: '🎬' },
  ],
  java: [
    { value: 'crud', label: 'CRUD', description: 'Controller + Model + Service', icon: '🏗️' },
    { value: 'api', label: 'API REST', description: 'Endpoints REST avec Spring', icon: '🌐' },
  ],
  php: [
    { value: 'crud', label: 'CRUD', description: 'CRUD complet avec PDO', icon: '🏗️' },
    { value: 'api', label: 'API REST', description: 'API REST avec validation', icon: '🌐' },
  ],
  sql: [
    { value: 'query', label: 'Requêtes', description: 'SELECT, INSERT, UPDATE, DELETE', icon: '📊' },
  ],
};

export function FeatureSelector() {
  const { selectedLanguage, selectedFeature, setFeature } = useGeneratorStore();

  if (!selectedLanguage) {
    return (
      <div className="card shadow-lg">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👈</div>
          <p className="text-gray-500 text-lg font-medium">
            Veuillez d'abord sélectionner un langage
          </p>
        </div>
      </div>
    );
  }

  const availableFeatures = features[selectedLanguage] || [];

  return (
    <div className="card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-indigo-600 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-900">Sélectionner un besoin</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableFeatures.map((feature) => (
          <button
            key={feature.value}
            onClick={() => setFeature(feature.value)}
            className={`
              group relative p-5 rounded-xl border-2 text-left transition-all duration-300 transform
              ${
                selectedFeature === feature.value
                  ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-indigo-50 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 hover:shadow-md hover:scale-105'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{feature.icon}</div>
              <div className="flex-1">
                <div className={`font-semibold mb-1 ${selectedFeature === feature.value ? 'text-primary-700' : 'text-gray-900'}`}>
                  {feature.label}
                </div>
                <div className="text-sm text-gray-600">{feature.description}</div>
              </div>
              {selectedFeature === feature.value && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
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
