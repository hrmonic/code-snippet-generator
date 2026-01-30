interface CodeViewerErrorProps {
  error: string;
  onRetry: () => void;
  onScrollToOptions: () => void;
}

export function CodeViewerError({ error, onRetry, onScrollToOptions }: CodeViewerErrorProps) {
  return (
    <div className="card shadow-lg" role="alert">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 dark:from-red-900/20 dark:to-orange-900/20 dark:border-red-800">
        <div className="flex items-start gap-4">
          <div className="text-4xl" aria-hidden="true">
            ⚠️
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-red-800 dark:text-red-200 text-lg mb-2">Erreur de génération</h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              Vérifiez vos options et réessayez, ou contactez le support si le problème persiste.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onRetry}
                className="btn-primary text-sm px-4 py-2.5"
                aria-label="Réessayer la génération"
              >
                Réessayer
              </button>
              <button
                type="button"
                onClick={onScrollToOptions}
                className="btn-secondary text-sm px-4 py-2.5"
                aria-label="Aller aux options pour modifier"
              >
                Modifier les options
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
