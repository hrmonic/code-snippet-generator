/**
 * Fonctions de sécurisation pour éviter les injections et attaques XSS
 */

import path from 'path';

export const security = {
  /**
   * Échappe les caractères HTML pour prévenir XSS
   */
  escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  },

  /**
   * Échappe les caractères JavaScript
   */
  escapeJs(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  },

  /**
   * Sanitise une entrée générique
   */
  sanitizeInput(input: string): string {
    // Supprime les caractères dangereux
    return input.replace(/[<>'"\\]/g, '');
  },

  /**
   * Sanitise un identifiant SQL (nom de table, colonne)
   * Autorise uniquement lettres, chiffres et underscore
   */
  sanitizeSqlIdentifier(identifier: string): string {
    // Autorise uniquement alphanumérique et underscore
    return identifier.replace(/[^a-zA-Z0-9_]/g, '');
  },

  /**
   * Valide qu'un nom de table/colonne est sûr
   */
  isValidSqlIdentifier(identifier: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier);
  },

  /**
   * Valide et sanitise un identifiant de langage ou feature
   * Autorise uniquement lettres minuscules, chiffres et tirets
   */
  sanitizePathSegment(segment: string): string {
    // Supprime tous les caractères non autorisés (lettres, chiffres, tirets, underscores)
    return segment.replace(/[^a-z0-9_-]/g, '');
  },

  /**
   * Valide qu'un segment de chemin est sûr (pas de path traversal)
   */
  isValidPathSegment(segment: string): boolean {
    // Vérifie qu'il n'y a pas de caractères de path traversal
    if (segment.includes('..') || segment.includes('/') || segment.includes('\\')) {
      return false;
    }
    // Vérifie le format (lettres, chiffres, tirets, underscores uniquement)
    return /^[a-z0-9_-]+$/.test(segment);
  },

  /**
   * Valide qu'un chemin résolu reste dans le répertoire de base
   */
  isPathSafe(resolvedPath: string, baseDir: string): boolean {
    const normalizedResolved = path.normalize(resolvedPath);
    const normalizedBase = path.normalize(baseDir);
    return normalizedResolved.startsWith(normalizedBase);
  },
};

