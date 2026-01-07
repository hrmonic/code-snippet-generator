/**
 * Utilitaires pour télécharger des fichiers
 */

export interface FileToDownload {
  content: string;
  filename: string;
  mimeType?: string;
}

/**
 * Télécharge un fichier unique
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Télécharge plusieurs fichiers en ZIP
 * Note: Nécessite une bibliothèque JSZip (à installer)
 */
export async function downloadMultipleFiles(
  files: FileToDownload[],
  zipFilename: string = 'code.zip'
): Promise<void> {
  try {
    // Vérifier si JSZip est disponible
    if (typeof window !== 'undefined' && (window as any).JSZip) {
      const JSZip = (window as any).JSZip;
      const zip = new JSZip();

      for (const file of files) {
        zip.file(file.filename, file.content);
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = zipFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Fallback: télécharger le premier fichier
      console.warn('JSZip non disponible, téléchargement du premier fichier uniquement');
      if (files.length > 0) {
        downloadFile(files[0].content, files[0].filename, files[0].mimeType);
      }
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement ZIP:', error);
    throw new Error('Impossible de créer le fichier ZIP');
  }
}

/**
 * Génère un nom de fichier basé sur le langage et la feature
 */
export function generateFilename(
  language: string,
  feature: string,
  extension: string,
  customName?: string
): string {
  if (customName) {
    return `${customName}.${extension}`;
  }
  return `${feature}-${language}.${extension}`;
}

/**
 * Obtient l'extension de fichier pour un langage
 */
export function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    html5: 'html',
    css3: 'css',
    javascript: 'js',
    java: 'java',
    php: 'php',
    sql: 'sql',
  };
  return extensions[language] || 'txt';
}

/**
 * Obtient le type MIME pour un langage
 */
export function getMimeType(language: string): string {
  const mimeTypes: Record<string, string> = {
    html5: 'text/html',
    css3: 'text/css',
    javascript: 'text/javascript',
    java: 'text/x-java-source',
    php: 'text/x-php',
    sql: 'text/x-sql',
  };
  return mimeTypes[language] || 'text/plain';
}

