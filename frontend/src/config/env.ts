/**
 * Centralized frontend configuration: API base URL, public path, and snippet paths.
 * Single source of truth to avoid duplication across lib, hooks, and components.
 */

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * Base path for static assets (no trailing slash). Important for GitHub Pages / subpaths.
 */
export function getPublicPath(): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return base.replace(/\/$/, '') || '';
}

/**
 * URL path to a snippet JSON file for a given language and feature.
 */
export function getSnippetPath(language: string, feature: string): string {
  const base = getPublicPath();
  return `${base}/snippets/${language}/${feature}.json`;
}
