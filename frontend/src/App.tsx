import { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageSelector } from './components/LanguageSelector';
import { FeatureSelector } from './components/FeatureSelector';
import { SnippetOptions } from './components/SnippetOptions';
import { CodeViewer } from './components/CodeViewer';
import { Toast } from './components/Toast';
import { useGeneratorStore } from './store/useGeneratorStore';

function App() {
  const { error, generatedCode } = useGeneratorStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Afficher un toast quand il y a une erreur
  useEffect(() => {
    if (error) {
      setToast({ message: error, type: 'error' });
    }
  }, [error]);

  // Afficher un toast de succès quand le code est généré
  useEffect(() => {
    if (generatedCode && !error) {
      setToast({ message: 'Code généré avec succès !', type: 'success' });
    }
  }, [generatedCode, error]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                  Code Snippet Generator
                </h1>
                <p className="text-gray-600 mt-1 text-sm">Générateur de code intelligent pour développeurs</p>
              </div>
              <a
                href="https://github.com/hrmonic/code-snippet-generator"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="font-medium">GitHub</span>
              </a>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Créez du code professionnel en quelques clics
              </h2>
              <p className="text-gray-600">
                Sélectionnez un langage, choisissez une fonctionnalité, configurez et générez !
              </p>
            </div>
            <LanguageSelector />
            <FeatureSelector />
            <SnippetOptions />
            <CodeViewer />
          </div>
        </main>

        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-center md:text-left text-gray-600 text-sm">
                Fait avec ❤️ par{' '}
                <a
                  href="https://github.com/hrmonic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  @hrmonic
                </a>
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <a
                  href="https://github.com/hrmonic/code-snippet-generator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 transition-colors"
                >
                  Documentation
                </a>
                <a
                  href="https://github.com/hrmonic/code-snippet-generator/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 transition-colors"
                >
                  Signaler un bug
                </a>
                <span>MIT License</span>
              </div>
            </div>
          </div>
        </footer>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
