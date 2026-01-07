/**
 * Utilitaires pour copier du texte dans le presse-papiers
 */

export async function copyToClipboard(text: string): Promise<void> {
  try {
    // Utiliser l'API Clipboard moderne si disponible
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Fallback pour les navigateurs plus anciens
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (!successful) {
        throw new Error('La commande de copie a échoué');
      }
    } finally {
      document.body.removeChild(textArea);
    }
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    throw new Error('Impossible de copier dans le presse-papiers');
  }
}

export function canCopyToClipboard(): boolean {
  return !!(navigator.clipboard || document.execCommand);
}

