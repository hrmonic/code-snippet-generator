import { useState, useEffect, memo } from 'react';
import { CodeEditor } from '../editor/CodeEditor';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { CodeStats } from './CodeStats';
import { usePreview } from '../hooks/usePreview';
import { ExportMenu } from './ExportMenu';
import { LoadingSpinner } from './LoadingSpinner';

function CodeViewerComponent() {
  const { generatedCode, previewCode, selectedLanguage, selectedFeature, options, error, isLoading, setPreviewCode } = useGeneratorStore();
  const [showPreview, setShowPreview] = useState(true);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  // Utiliser le hook de prévisualisation
  const { previewCode: autoPreview, isGenerating: isGeneratingPreview } = usePreview(
    selectedLanguage,
    selectedFeature,
    options,
    showPreview && !generatedCode // Activer seulement si pas de code généré
  );

  // Mettre à jour le store avec la prévisualisation automatique
  useEffect(() => {
    if (autoPreview && !generatedCode) {
      setPreviewCode(autoPreview);
    }
  }, [autoPreview, generatedCode, setPreviewCode]);

  // Gérer les fichiers multiples (pour CRUD Java par exemple)
  const isMultipleFiles = Array.isArray(generatedCode);
  const files = isMultipleFiles ? generatedCode : generatedCode ? [generatedCode] : [];
  const displayCode = files[selectedFileIndex] || previewCode || null;
  const isPreview = !generatedCode && !!previewCode;
  
  // Réinitialiser l'index si nécessaire
  useEffect(() => {
    if (isMultipleFiles && selectedFileIndex >= files.length) {
      setSelectedFileIndex(0);
    }
  }, [isMultipleFiles, files.length, selectedFileIndex]);

  if (isLoading || (isGeneratingPreview && !displayCode)) {
    return (
      <div className="card shadow-lg">
        <LoadingSpinner size="lg" text={isLoading ? 'Génération en cours...' : 'Prévisualisation en cours...'} />
        <p className="text-center text-sm text-gray-500 mt-2">Cela peut prendre quelques secondes</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-lg">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-red-800 text-lg mb-2">Erreur de génération</h3>
              <p className="text-red-700">{error}</p>
              <p className="text-sm text-red-600 mt-2">
                Vérifiez vos options et réessayez, ou contactez le support si le problème persiste.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!displayCode) {
    return (
      <div className="card shadow-lg">
        <div className="text-center py-16 text-gray-500">
          <div className="text-7xl mb-6 animate-bounce">💻</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun code généré</h3>
          <p className="text-gray-600 mb-2 text-lg">Le code généré apparaîtra ici</p>
          <p className="text-sm text-gray-500">
            Configurez vos options ci-dessus et cliquez sur "Générer le code"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-indigo-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isPreview ? 'Prévisualisation' : 'Code généré'}
          </h2>
          {isPreview && (
            <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              Aperçu
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 flex-wrap">
            {isPreview && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2"
                aria-label={showPreview ? 'Masquer la prévisualisation' : 'Afficher la prévisualisation'}
                aria-pressed={showPreview}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {showPreview ? 'Masquer' : 'Afficher'} prévisualisation
              </button>
            )}
            <ExportMenu
              code={isMultipleFiles ? files : displayCode}
              language={selectedLanguage}
              feature={selectedFeature || null}
              isPreview={isPreview}
            />
          </div>
          {isMultipleFiles && files.length > 1 && (
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm text-gray-600 font-medium">Fichiers générés :</span>
              {files.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedFileIndex(index)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    selectedFileIndex === index
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  aria-label={`Afficher le fichier ${index + 1}`}
                  aria-pressed={selectedFileIndex === index}
                >
                  Fichier {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {isPreview && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Prévisualisation en temps réel</strong> - Le code est généré automatiquement lorsque vous modifiez les options.
            Cliquez sur "Générer le code" pour obtenir la version finale.
          </p>
        </div>
      )}
      <div className="mb-4">
        <CodeStats code={displayCode} />
      </div>
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
        <CodeEditor code={displayCode} language={selectedLanguage || 'javascript'} />
      </div>
    </div>
  );
}

// Optimisation avec React.memo
export const CodeViewer = memo(CodeViewerComponent);

