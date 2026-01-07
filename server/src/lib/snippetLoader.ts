import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Snippet } from '../types/index.js';

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
      const itemPath = join(snippetsDir, item);
      return statSync(itemPath).isDirectory();
    });

    for (const language of languages) {
      const languageSnippets = await this.getSnippetsByLanguage(language);
      allSnippets.push(...languageSnippets);
    }

    return allSnippets;
  }

  async getSnippetsByLanguage(language: string): Promise<Snippet[]> {
    if (this.snippetsCache.has(language)) {
      return this.snippetsCache.get(language)!;
    }

    const snippetsDir = join(this.getSnippetsDirectory(), language);
    const snippets: Snippet[] = [];

    try {
      const files = readdirSync(snippetsDir).filter((file) => file.endsWith('.json'));

      for (const file of files) {
        const filePath = join(snippetsDir, file);
        const content = readFileSync(filePath, 'utf-8');
        const snippet = JSON.parse(content) as Snippet;
        snippets.push(snippet);
      }

      this.snippetsCache.set(language, snippets);
      return snippets;
    } catch (error) {
      console.error(`Erreur lors du chargement des snippets pour ${language}:`, error);
      return [];
    }
  }

  async getSnippet(language: string, feature: string): Promise<Snippet | null> {
    const snippets = await this.getSnippetsByLanguage(language);
    return snippets.find((s) => s.feature === feature) || null;
  }

  clearCache(): void {
    this.snippetsCache.clear();
  }
}

export const snippetLoader = new SnippetLoader();

