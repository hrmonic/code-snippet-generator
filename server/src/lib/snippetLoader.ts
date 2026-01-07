import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve, normalize } from 'path';
import { fileURLToPath } from 'url';
import type { Snippet } from '../types/index.js';
import { security } from './security/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SnippetLoader {
  private snippetsCache: Map<string, Snippet[]> = new Map();

  private getSnippetsDirectory(): string {
    return join(__dirname, '../data/snippets');
  }

  async getAllSnippets(): Promise<Snippet[]> {
    const allSnippets: Snippet[] = [];
    const snippetsDir = this.getSnippetsDirectory();

    const languages = readdirSync(snippetsDir).filter((item) => {
      // Valider que le nom du dossier est sûr
      if (!security.isValidPathSegment(item)) {
        return false;
      }
      const itemPath = resolve(snippetsDir, item);
      // Vérifier que le chemin reste dans le répertoire de base
      if (!security.isPathSafe(itemPath, snippetsDir)) {
        return false;
      }
      return statSync(itemPath).isDirectory();
    });

    for (const language of languages) {
      const languageSnippets = await this.getSnippetsByLanguage(language);
      allSnippets.push(...languageSnippets);
    }

    return allSnippets;
  }

  async getSnippetsByLanguage(language: string): Promise<Snippet[]> {
    // Valider et sanitizer le paramètre language pour éviter path traversal
    if (!security.isValidPathSegment(language)) {
      throw new Error(`Invalid language parameter: ${language}`);
    }
    
    const sanitizedLanguage = security.sanitizePathSegment(language);
    if (this.snippetsCache.has(sanitizedLanguage)) {
      return this.snippetsCache.get(sanitizedLanguage)!;
    }

    const baseDir = this.getSnippetsDirectory();
    const snippetsDir = resolve(baseDir, sanitizedLanguage);
    
    // Vérifier que le chemin résolu reste dans le répertoire de base
    if (!security.isPathSafe(snippetsDir, baseDir)) {
      throw new Error(`Path traversal detected for language: ${language}`);
    }
    
    const snippets: Snippet[] = [];

    try {
      const files = readdirSync(snippetsDir).filter((file) => {
        // Valider chaque nom de fichier
        return file.endsWith('.json') && security.isValidPathSegment(file.replace('.json', ''));
      });

      for (const file of files) {
        const filePath = resolve(snippetsDir, file);
        
        // Vérifier à nouveau que le chemin est sûr
        if (!security.isPathSafe(filePath, baseDir)) {
          continue; // Ignorer les fichiers suspects
        }
        
        const content = readFileSync(filePath, 'utf-8');
        const snippet = JSON.parse(content) as Snippet;
        snippets.push(snippet);
      }

      this.snippetsCache.set(sanitizedLanguage, snippets);
      return snippets;
    } catch (error) {
      // Utiliser un message d'erreur sécurisé sans interpolation de variables utilisateur
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Erreur lors du chargement des snippets:', errorMessage);
      return [];
    }
  }

  async getSnippet(language: string, feature: string): Promise<Snippet | null> {
    // Valider les paramètres
    if (!security.isValidPathSegment(language) || !security.isValidPathSegment(feature)) {
      return null;
    }
    
    const snippets = await this.getSnippetsByLanguage(language);
    return snippets.find((s) => s.feature === feature) || null;
  }

  clearCache(): void {
    this.snippetsCache.clear();
  }
}

export const snippetLoader = new SnippetLoader();

