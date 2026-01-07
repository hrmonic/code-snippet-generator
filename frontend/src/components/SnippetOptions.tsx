import { useState, useEffect } from 'react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { generateCode } from '../lib/generator';
import { FeatureInfo } from './FeatureInfo';
import { OptionInput, type OptionInputType } from './OptionInput';

interface OptionConfig {
  key: string;
  label: string;
  type: OptionInputType;
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string | boolean | number | string[];
  min?: number;
  max?: number;
}

export function SnippetOptions() {
  const { selectedLanguage, selectedFeature, setOptions, setGeneratedCode, setLoading, setError } =
    useGeneratorStore();
  const [localOptions, setLocalOptions] = useState<Record<string, any>>({});

  useEffect(() => {
    // Reset options when language or feature changes
    setLocalOptions({});
    setOptions({});
  }, [selectedLanguage, selectedFeature, setOptions]);

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
      setGeneratedCode(response.code);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Configuration complète des options avec types
  const getOptionsForFeature = (): OptionConfig[] => {
    // Navbar HTML5 - Enrichi
    if (selectedFeature === 'navbar' && selectedLanguage === 'html5') {
      return [
        {
          key: 'siteName',
          label: 'Nom du site',
          type: 'text',
          placeholder: 'Mon Site',
          required: true,
        },
        {
          key: 'language',
          label: 'Langue de la page',
          type: 'select',
          required: false,
          defaultValue: 'fr',
          options: [
            { value: 'fr', label: 'Français' },
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'de', label: 'Deutsch' },
            { value: 'it', label: 'Italiano' },
          ],
        },
        {
          key: 'backgroundColor',
          label: 'Couleur de fond',
          type: 'select',
          required: false,
          defaultValue: '#333',
          options: [
            { value: '#333', label: 'Gris foncé' },
            { value: '#1a1a1a', label: 'Noir' },
            { value: '#667eea', label: 'Bleu' },
            { value: '#764ba2', label: 'Violet' },
            { value: '#f093fb', label: 'Rose' },
            { value: '#4facfe', label: 'Bleu clair' },
            { value: '#ffffff', label: 'Blanc' },
          ],
        },
        {
          key: 'textColor',
          label: 'Couleur du texte',
          type: 'select',
          required: false,
          defaultValue: 'white',
          options: [
            { value: 'white', label: 'Blanc' },
            { value: '#333', label: 'Gris foncé' },
            { value: '#000', label: 'Noir' },
          ],
        },
        {
          key: 'sticky',
          label: 'Navbar fixe',
          type: 'checkbox',
          required: false,
          defaultValue: false,
          description: 'Navbar reste fixe en haut lors du scroll',
        },
        {
          key: 'shadow',
          label: 'Ombre',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          description: 'Ajouter une ombre à la navbar',
        },
        {
          key: 'hoverEffect',
          label: 'Effet hover',
          type: 'checkbox',
          required: false,
          defaultValue: false,
          description: 'Effet hover avec fond sur les liens',
        },
        {
          key: 'padding',
          label: 'Espacement interne',
          type: 'select',
          required: false,
          defaultValue: '1rem 2rem',
          options: [
            { value: '0.5rem 1rem', label: 'Petit' },
            { value: '1rem 2rem', label: 'Moyen' },
            { value: '1.5rem 3rem', label: 'Grand' },
          ],
        },
        {
          key: 'logoSize',
          label: 'Taille du logo',
          type: 'select',
          required: false,
          defaultValue: '1.5rem',
          options: [
            { value: '1.25rem', label: 'Petit' },
            { value: '1.5rem', label: 'Moyen' },
            { value: '2rem', label: 'Grand' },
          ],
        },
        {
          key: 'linkGap',
          label: 'Espacement entre les liens',
          type: 'select',
          required: false,
          defaultValue: '2rem',
          options: [
            { value: '1rem', label: 'Petit' },
            { value: '2rem', label: 'Moyen' },
            { value: '3rem', label: 'Grand' },
          ],
        },
        {
          key: 'breakpoint',
          label: 'Point de rupture mobile',
          type: 'select',
          required: false,
          defaultValue: '768',
          options: [
            { value: '640', label: '640px (sm)' },
            { value: '768', label: '768px (md)' },
            { value: '1024', label: '1024px (lg)' },
          ],
        },
        {
          key: 'navbarHeight',
          label: 'Hauteur de la navbar',
          type: 'select',
          required: false,
          defaultValue: '70px',
          options: [
            { value: '60px', label: '60px' },
            { value: '70px', label: '70px' },
            { value: '80px', label: '80px' },
          ],
        },
        {
          key: 'navLinks',
          label: 'Liens de navigation',
          type: 'multiselect',
          required: true,
          description: 'Sélectionnez les liens à afficher dans la navbar',
          options: [
            { value: 'home', label: 'Accueil' },
            { value: 'about', label: 'À propos' },
            { value: 'services', label: 'Services' },
            { value: 'portfolio', label: 'Portfolio' },
            { value: 'blog', label: 'Blog' },
            { value: 'contact', label: 'Contact' },
          ],
        },
      ];
    }

    // Form HTML5 - Enrichi
    if (selectedFeature === 'form' && selectedLanguage === 'html5') {
      return [
        {
          key: 'formName',
          label: 'Nom du formulaire',
          type: 'text',
          placeholder: 'Formulaire de contact',
          required: true,
        },
        {
          key: 'action',
          label: 'URL de soumission',
          type: 'text',
          placeholder: '/submit',
          required: false,
          defaultValue: '/submit',
        },
        {
          key: 'method',
          label: 'Méthode HTTP',
          type: 'select',
          required: false,
          defaultValue: 'POST',
          options: [
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
          ],
        },
        {
          key: 'includeName',
          label: 'Champ Nom',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          description: 'Inclure un champ nom',
        },
        {
          key: 'includeEmail',
          label: 'Champ Email',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          description: 'Inclure un champ email',
        },
        {
          key: 'includePhone',
          label: 'Champ Téléphone',
          type: 'checkbox',
          required: false,
          defaultValue: false,
          description: 'Inclure un champ téléphone',
        },
        {
          key: 'includeMessage',
          label: 'Champ Message',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          description: 'Inclure un champ message',
        },
        {
          key: 'includeSubject',
          label: 'Champ Sujet',
          type: 'checkbox',
          required: false,
          defaultValue: false,
          description: 'Inclure un champ sujet',
        },
        {
          key: 'buttonText',
          label: 'Texte du bouton',
          type: 'select',
          required: false,
          defaultValue: 'Envoyer',
          options: [
            { value: 'Envoyer', label: 'Envoyer' },
            { value: 'Soumettre', label: 'Soumettre' },
            { value: 'Valider', label: 'Valider' },
            { value: 'Confirmer', label: 'Confirmer' },
          ],
        },
      ];
    }

    // Modal HTML5 - Enrichi
    if (selectedFeature === 'modal' && selectedLanguage === 'html5') {
      return [
        {
          key: 'modalTitle',
          label: 'Titre de la modal',
          type: 'text',
          placeholder: 'Confirmation',
          required: true,
        },
        {
          key: 'modalContent',
          label: 'Contenu de la modal',
          type: 'textarea',
          placeholder: 'Êtes-vous sûr de vouloir continuer ?',
          required: true,
          description: 'Le texte qui sera affiché dans le corps de la modal',
        },
        {
          key: 'modalWidth',
          label: 'Largeur de la modal',
          type: 'select',
          required: false,
          defaultValue: '500px',
          options: [
            { value: '400px', label: 'Petite (400px)' },
            { value: '500px', label: 'Moyenne (500px)' },
            { value: '700px', label: 'Grande (700px)' },
            { value: '90%', label: 'Pleine largeur' },
          ],
        },
        {
          key: 'borderRadius',
          label: 'Rayon des bordures',
          type: 'select',
          required: false,
          defaultValue: '8px',
          options: [
            { value: '0px', label: 'Aucun' },
            { value: '4px', label: 'Petit' },
            { value: '8px', label: 'Moyen' },
            { value: '12px', label: 'Grand' },
            { value: '20px', label: 'Très grand' },
          ],
        },
        {
          key: 'shadow',
          label: 'Ombre',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          description: 'Ajouter une ombre à la modal',
        },
        {
          key: 'closeButton',
          label: 'Bouton de fermeture',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          description: 'Afficher le bouton X pour fermer',
        },
        {
          key: 'closeOnOverlay',
          label: 'Fermer au clic sur overlay',
          type: 'checkbox',
          required: false,
          defaultValue: true,
          description: 'Fermer la modal en cliquant en dehors',
        },
        {
          key: 'buttonText',
          label: 'Texte du bouton',
          type: 'select',
          required: false,
          defaultValue: 'Fermer',
          options: [
            { value: 'Fermer', label: 'Fermer' },
            { value: 'Annuler', label: 'Annuler' },
            { value: 'OK', label: 'OK' },
            { value: 'Confirmer', label: 'Confirmer' },
          ],
        },
      ];
    }

    // CRUD PHP/Java
    if (selectedFeature === 'crud' && (selectedLanguage === 'php' || selectedLanguage === 'java')) {
      return [
        {
          key: 'tableName',
          label: 'Nom de la table',
          type: 'text',
          placeholder: 'users',
          required: true,
        },
        {
          key: 'entityName',
          label: 'Nom de l\'entité',
          type: 'text',
          placeholder: 'User',
          required: true,
        },
        {
          key: 'fields',
          label: 'Champs',
          type: 'text',
          placeholder: 'id,name,email,created_at',
          required: true,
          description: 'Séparés par des virgules',
        },
      ];
    }

    // SQL Query
    if (selectedFeature === 'query' && selectedLanguage === 'sql') {
      return [
        {
          key: 'tableName',
          label: 'Nom de la table',
          type: 'text',
          placeholder: 'users',
          required: true,
        },
        {
          key: 'operation',
          label: 'Type d\'opération',
          type: 'select',
          required: false,
          defaultValue: 'SELECT',
          options: [
            { value: 'SELECT', label: 'SELECT' },
            { value: 'INSERT', label: 'INSERT' },
            { value: 'UPDATE', label: 'UPDATE' },
            { value: 'DELETE', label: 'DELETE' },
          ],
        },
        {
          key: 'columns',
          label: 'Colonnes',
          type: 'text',
          placeholder: 'id,name,email',
          required: false,
        },
      ];
    }

    // API JavaScript
    if (selectedFeature === 'api' && selectedLanguage === 'javascript') {
      return [
        {
          key: 'baseURL',
          label: 'URL de base',
          type: 'text',
          placeholder: 'http://localhost:3000/api',
          required: false,
          defaultValue: 'http://localhost:3000/api',
        },
        {
          key: 'endpoint',
          label: 'Endpoint',
          type: 'text',
          placeholder: '/api/users',
          required: true,
        },
        {
          key: 'includeAuth',
          label: 'Authentification',
          type: 'checkbox',
          required: false,
          defaultValue: false,
          description: 'Inclure les headers d\'authentification',
        },
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
      (selectedFeature === 'transforms' && selectedLanguage === 'css3') ||
      (selectedFeature === 'storage' && selectedLanguage === 'javascript') ||
      (selectedFeature === 'debounce' && selectedLanguage === 'javascript') ||
      (selectedFeature === 'promise' && selectedLanguage === 'javascript') ||
      (selectedFeature === 'observer' && selectedLanguage === 'javascript') ||
      (selectedFeature === 'event' && selectedLanguage === 'javascript') ||
      (selectedFeature === 'class' && selectedLanguage === 'javascript') ||
      (selectedFeature === 'router' && selectedLanguage === 'php') ||
      (selectedFeature === 'middleware' && selectedLanguage === 'php') ||
      (selectedFeature === 'auth' && selectedLanguage === 'php')
    ) {
      return [];
    }

    return [];
  };

  const featureOptions = getOptionsForFeature();
  
  // Appliquer les valeurs par défaut
  useEffect(() => {
    const defaults: Record<string, any> = {};
    featureOptions.forEach((opt) => {
      if (opt.defaultValue !== undefined && localOptions[opt.key] === undefined) {
        defaults[opt.key] = opt.defaultValue;
      }
    });
    if (Object.keys(defaults).length > 0) {
      const newLocalOptions = { ...localOptions, ...defaults };
      setLocalOptions(newLocalOptions);
      setOptions(newLocalOptions);
    }
  }, [selectedLanguage, selectedFeature, featureOptions.length]);

  const canGenerate = featureOptions.every(
    (opt) => !opt.required || (localOptions[opt.key] !== undefined && localOptions[opt.key] !== '')
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
