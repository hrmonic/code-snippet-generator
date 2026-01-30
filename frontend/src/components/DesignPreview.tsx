import { useMemo } from 'react';
import type { Language } from '../types';

interface DesignPreviewProps {
  code: string;
  language: Language | null;
  /** Hauteur de l'iframe en pixels */
  height?: number;
  /** Titre pour l'accessibilité */
  title?: string;
  /** Pour CSS3 : HTML de démo à utiliser comme body (sinon démo générique) */
  previewMarkup?: string;
}

/**
 * Construit un document HTML complet pour l'iframe.
 * Si le code est déjà un document complet (DOCTYPE ou <html), on l'utilise tel quel.
 * Sinon on enveloppe dans une structure minimale.
 */
function wrapHtmlFragment(html: string): string {
  const trimmed = html.trim();
  if (
    trimmed.toLowerCase().startsWith('<!doctype') ||
    trimmed.toLowerCase().startsWith('<html')
  ) {
    return trimmed;
  }
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aperçu</title>
</head>
<body>
${trimmed}
</body>
</html>`;
}

const DEFAULT_CSS_BODY = `
  <div class="preview-demo">
    <p>Texte de démonstration pour les styles</p>
    <button type="button">Bouton</button>
    <div class="card">Carte</div>
  </div>`;

/**
 * Pour CSS : document HTML avec le CSS injecté dans un <style>.
 * bodyMarkup optionnel : HTML du body (sinon démo générique).
 */
function buildDocumentWithCss(css: string, bodyMarkup?: string): string {
  const safeCss = css.replace(/<\/style>/gi, '</ style>');
  const body = (bodyMarkup && bodyMarkup.trim()) ? bodyMarkup.trim() : DEFAULT_CSS_BODY;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aperçu CSS</title>
  <style>${safeCss}</style>
</head>
<body>
${body}
</body>
</html>`;
}

/**
 * Aperçu design : rendu du snippet dans un iframe (HTML5, CSS3).
 * Pour les autres langages, affiche un message explicatif.
 */
export function DesignPreview({
  code,
  language,
  height = 400,
  title = 'Aperçu du rendu',
  previewMarkup,
}: DesignPreviewProps) {
  const srcdoc = useMemo(() => {
    if (!code.trim()) return '';
    switch (language) {
      case 'html5':
        return wrapHtmlFragment(code);
      case 'css3':
        return buildDocumentWithCss(code, previewMarkup);
      case 'javascript':
        // Tenter un aperçu : page minimale qui exécute le script (sandboxé)
        // Les snippets React/JSX ne tourneront pas ; on affiche au moins une page avec le code en préformaté
        return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aperçu JS</title>
</head>
<body>
  <p style="padding:1rem;color:#666;font-family:system-ui;">Aperçu design non disponible pour JavaScript (code à exécuter dans votre projet).</p>
  <pre style="margin:1rem;padding:1rem;background:#f5f5f5;overflow:auto;font-size:12px;">${code
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
      default:
        return '';
    }
  }, [code, language, previewMarkup]);

  if (!language || (language !== 'html5' && language !== 'css3' && language !== 'javascript')) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
        style={{ minHeight: height }}
        role="region"
        aria-label="Aperçu design"
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center px-4">
          Aperçu du rendu disponible pour HTML5 et CSS3 uniquement.
          <br />
          Pour {language || 'ce langage'}, consultez le code généré ci-dessus.
        </p>
      </div>
    );
  }

  if (!srcdoc) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
        style={{ minHeight: height, maxHeight: '70vh' }}
        role="region"
        aria-label="Aperçu design vide"
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun contenu à afficher.</p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-md"
      style={{ minHeight: 200, maxHeight: '70vh' }}
    >
      <iframe
        title={title}
        srcDoc={srcdoc}
        sandbox="allow-scripts"
        className="w-full rounded-xl border-0 bg-white dark:bg-gray-900"
        style={{ height: `${height}px`, minHeight: 200 }}
        aria-label={title}
      />
    </div>
  );
}
