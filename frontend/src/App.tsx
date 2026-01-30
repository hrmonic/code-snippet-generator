import { useEffect, lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { LanguageSelector } from './components/LanguageSelector';
import { FeatureSelector } from './components/FeatureSelector';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SnippetOptions } from './components/SnippetOptions';
import { Toast } from './components/Toast';
import { useGeneratorToasts } from './hooks/useGeneratorToasts';
import { useThemeStore } from './store/useThemeStore';

const CodeViewer = lazy(() => import('./components/CodeViewer').then((m) => ({ default: m.CodeViewer })));

function App() {
  const theme = useThemeStore((s) => s.theme);
  const { toast, dismiss } = useGeneratorToasts();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" tabIndex={-1}>
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Créez du code professionnel en quelques clics
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Code propre, sécurisé et prêt à l&apos;emploi. Sélectionnez un langage, une fonctionnalité, configurez et générez.
              </p>
              <nav aria-label="Étapes de génération" className="flex flex-wrap justify-center gap-2 text-sm">
                <span className="px-3 py-1.5 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200 font-medium">1. Langage</span>
                <span className="text-gray-400 dark:text-gray-500">→</span>
                <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-medium">2. Fonctionnalité</span>
                <span className="text-gray-400 dark:text-gray-500">→</span>
                <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-medium">3. Options</span>
                <span className="text-gray-400 dark:text-gray-500">→</span>
                <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-medium">4. Générer</span>
              </nav>
            </div>
            <LanguageSelector />
            <FeatureSelector />
            <SnippetOptions />
            <Suspense fallback={<div className="card shadow-lg"><LoadingSpinner size="lg" text="Chargement de l'éditeur..." /></div>}>
              <CodeViewer />
            </Suspense>
          </div>
        </main>
        <Footer />
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={dismiss} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
