/**
 * Couche API frontend unique : snippets, options, génération, prévisualisation.
 * Timeout et fallbacks (client / démo) centralisés.
 */

import { apiBaseUrl, getSnippetPath } from '../config/env';
import { transformVariablesToOptions } from './optionTransform';
import type { GenerateRequest, GenerateResponse, Language, OptionConfig } from '../types';
import { generateCodeFromSnippet } from './clientCodeGenerator';
import { generateCodeDemo, getDemoSnippetList } from './demoSnippets';

const TIMEOUT_MS = 3000;

export interface SnippetListItem {
  id: string;
  language: string;
  feature: string;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = TIMEOUT_MS, ...init } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function getSnippets(): Promise<SnippetListItem[]> {
  try {
    const res = await fetchWithTimeout(`${apiBaseUrl}/api/snippets`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return getDemoSnippetList();
  }
}

export async function getOptions(language: Language, feature: string): Promise<OptionConfig[]> {
  try {
    const res = await fetchWithTimeout(`${apiBaseUrl}/api/snippets/${language}/${feature}/options`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    const res = await fetch(getSnippetPath(language, feature));
    if (!res.ok) return [];
    const snippet = await res.json();
    if (!snippet.variables?.length) return [];
    return transformVariablesToOptions(snippet.variables);
  }
}

export async function generateCode(request: GenerateRequest): Promise<GenerateResponse> {
  try {
    const res = await fetchWithTimeout(`${apiBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || `HTTP ${res.status}`);
    }
    return res.json();
  } catch {
    try {
      return await generateCodeFromSnippet(request);
    } catch {
      return generateCodeDemo(request);
    }
  }
}

export async function generatePreview(request: GenerateRequest): Promise<GenerateResponse> {
  try {
    const res = await fetchWithTimeout(`${apiBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, preview: true }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return generateCodeFromSnippet(request);
  }
}
