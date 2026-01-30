import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <span className="text-red-600 dark:text-red-400 text-3xl mr-3">⚠️</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Une erreur est survenue</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Désolé, une erreur inattendue s'est produite. Veuillez rafraîchir la page.
            </p>
            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Détails de l'erreur
                </summary>
                <pre className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 p-3 rounded text-xs overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
              aria-label="Recharger la page pour réessayer"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

