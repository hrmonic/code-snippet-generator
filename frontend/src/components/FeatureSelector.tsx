import type { FeatureType } from '../types';
import { useGeneratorStore } from '../store/useGeneratorStore';

const features: Record<string, Array<{ value: FeatureType; label: string; description: string }>> = {
  html5: [
    { value: 'form', label: 'Formulaire', description: 'Formulaire HTML avec validation' },
    { value: 'input', label: 'Champs Input', description: 'Inputs HTML5 (email, date, etc.)' },
    { value: 'layout', label: 'Layout', description: 'Structure HTML responsive' },
  ],
  css3: [
    { value: 'layout', label: 'Layout', description: 'Grid, Flexbox, responsive' },
    { value: 'animation', label: 'Animation', description: 'Animations CSS3' },
  ],
  javascript: [
    { value: 'api', label: 'API Client', description: 'Client HTTP avec fetch/axios' },
    { value: 'validation', label: 'Validation', description: 'Validation de formulaire' },
    { value: 'animation', label: 'Animation', description: 'Animations JavaScript' },
  ],
  java: [
    { value: 'crud', label: 'CRUD', description: 'Controller + Model + Service' },
    { value: 'api', label: 'API REST', description: 'Endpoints REST avec Spring' },
  ],
  php: [
    { value: 'crud', label: 'CRUD', description: 'CRUD complet avec PDO' },
    { value: 'api', label: 'API REST', description: 'API REST avec validation' },
  ],
  sql: [
    { value: 'query', label: 'Requêtes', description: 'SELECT, INSERT, UPDATE, DELETE' },
  ],
};

export function FeatureSelector() {
  const { selectedLanguage, selectedFeature, setFeature } = useGeneratorStore();

  if (!selectedLanguage) {
    return (
      <div className="card">
        <p className="text-gray-500 text-center py-8">
          Veuillez d'abord sélectionner un langage
        </p>
      </div>
    );
  }

  const availableFeatures = features[selectedLanguage] || [];

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Sélectionner un besoin</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableFeatures.map((feature) => (
          <button
            key={feature.value}
            onClick={() => setFeature(feature.value)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all duration-200
              ${
                selectedFeature === feature.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="font-semibold mb-1">{feature.label}</div>
            <div className="text-sm text-gray-600">{feature.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

