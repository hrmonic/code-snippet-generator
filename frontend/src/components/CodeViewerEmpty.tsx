interface CodeViewerEmptyProps {
  onScrollToOptions: () => void;
}

export function CodeViewerEmpty({ onScrollToOptions }: CodeViewerEmptyProps) {
  return (
    <div className="card shadow-lg">
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        <div className="text-7xl mb-6 animate-bounce" aria-hidden="true">
          💻
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Aucun code généré</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2 text-lg">Le code généré apparaîtra ici</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Configurez vos options ci-dessus et cliquez sur &quot;Générer le code&quot;
        </p>
        <button
          type="button"
          onClick={onScrollToOptions}
          className="btn-primary inline-flex items-center gap-2 px-6 py-3"
          aria-label="Aller aux options pour configurer et générer le code"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Aller aux options
        </button>
      </div>
    </div>
  );
}
