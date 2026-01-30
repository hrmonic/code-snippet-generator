/**
 * Skeleton d’attente pour la zone Code / Aperçu.
 * Affiche des barres animées qui imitent l’éditeur et l’iframe.
 */
export function CodeViewerSkeleton() {
  return (
    <div className="card shadow-lg animate-pulse" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Chargement du code en cours</span>
      <div className="flex gap-2 mb-4">
        <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="space-y-2 mb-4">
        {[90, 70, 85, 60, 95, 75].map((w, i) => (
          <div
            key={i}
            className="h-4 rounded bg-gray-200 dark:bg-gray-700"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}
