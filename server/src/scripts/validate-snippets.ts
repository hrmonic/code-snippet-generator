/**
 * Script de cohérence snippets : vérifie que chaque placeholder dans le code
 * correspond à une variable du snippet (et inversement).
 * Usage: depuis server/ : npx tsx src/scripts/validate-snippets.ts
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { validateSnippet } from '../schemas/snippetSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SNIPPETS_DIR = resolve(__dirname, '..', 'data', 'snippets');
const ALLOWLIST_PATH = join(__dirname, 'validate-snippets.allowlist.json');

/** Charge l'allowlist des placeholders dérivés/optionnels (réduire au fil du temps en ajoutant les variables aux snippets). */
function loadAllowlist(): Record<string, string[]> {
  try {
    const content = readFileSync(ALLOWLIST_PATH, 'utf-8');
    const data = JSON.parse(content) as Record<string, string[]>;
    return data;
  } catch {
    return {};
  }
}

/** Mots-clés Handlebars à ne pas traiter comme variables (ex. {{else}}) */
const RESERVED_PLACEHOLDERS = new Set(['else']);

/** Placeholders utilisés dans le template : {{key}} ou {{#if key}} / {{#unless key}} / {{#each key}} */
function extractPlaceholdersFromCode(code: string): Set<string> {
  const keys = new Set<string>();
  // {{#if key}} ... {{/if}}
  const ifMatches = code.matchAll(/\{\{#if\s+(\w+)\}\}/g);
  for (const m of ifMatches) keys.add(m[1]);
  // {{#unless key}}
  const unlessMatches = code.matchAll(/\{\{#unless\s+(\w+)\}\}/g);
  for (const m of unlessMatches) keys.add(m[1]);
  // {{#each key}}
  const eachMatches = code.matchAll(/\{\{#each\s+(\w+)\}\}/g);
  for (const m of eachMatches) keys.add(m[1]);
  // {{key}} (simple substitution)
  const simpleMatches = code.matchAll(/\{\{(\w+)\}\}/g);
  for (const m of simpleMatches) keys.add(m[1]);
  // Exclure les mots-clés réservés (ex. else)
  for (const r of RESERVED_PLACEHOLDERS) keys.delete(r);
  return keys;
}

function getVariableNames(variables: Array<{ name: string }>): Set<string> {
  return new Set(variables.map((v) => v.name));
}

interface ValidationResult {
  path: string;
  id: string;
  orphanPlaceholders: string[];
  unusedVariables: string[];
  schemaValid: boolean;
}

function validateSnippetFile(
  filePath: string,
  content: string,
  allowlist: Record<string, string[]>
): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return {
      path: filePath,
      id: '<parse error>',
      orphanPlaceholders: [],
      unusedVariables: [],
      schemaValid: false,
    };
  }

  const schemaValid = validateSnippet(parsed);
  const s = parsed as { id: string; code: string; variables: Array<{ name: string }> };
  const snippetId = s.id || filePath;
  const placeholders = extractPlaceholdersFromCode(s.code || '');
  const variableNames = getVariableNames(s.variables || []);
  const allowed = new Set(allowlist[snippetId] ?? []);

  const orphanPlaceholders = [...placeholders].filter(
    (k) => !variableNames.has(k) && !allowed.has(k)
  );
  const unusedVariables = [...variableNames].filter((k) => !placeholders.has(k));

  return {
    path: filePath,
    id: snippetId,
    orphanPlaceholders,
    unusedVariables,
    schemaValid,
  };
}

function discoverSnippetFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...discoverSnippetFiles(full));
    } else if (e.isFile() && e.name.endsWith('.json')) {
      files.push(full);
    }
  }
  return files;
}

function main(): number {
  if (!statSync(SNIPPETS_DIR, { throwIfNoEntry: false })?.isDirectory()) {
    console.error('Snippets directory not found:', SNIPPETS_DIR);
    return 1;
  }

  const allowlist = loadAllowlist();
  const files = discoverSnippetFiles(SNIPPETS_DIR);
  const results: ValidationResult[] = [];

  for (const filePath of files) {
    const content = readFileSync(filePath, 'utf-8');
    results.push(validateSnippetFile(filePath, content, allowlist));
  }

  let hasError = false;
  for (const r of results) {
    if (!r.schemaValid) {
      console.error(`[SCHEMA] ${r.path}: invalid snippet schema`);
      hasError = true;
    }
    if (r.orphanPlaceholders.length > 0) {
      console.error(
        `[ORPHAN] ${r.path} (${r.id}): placeholders in code but not in variables: ${r.orphanPlaceholders.join(', ')}`
      );
      hasError = true;
    }
    if (r.unusedVariables.length > 0) {
      console.warn(
        `[UNUSED] ${r.path} (${r.id}): variables declared but not used in code: ${r.unusedVariables.join(', ')}`
      );
      // Unused variables are warning only; they don't break generation but clutter the form
    }
  }

  if (!hasError) {
    console.log(`OK: ${files.length} snippet(s) validated (placeholders ↔ variables).`);
  }
  return hasError ? 1 : 0;
}

const exitCode = main();
process.exit(exitCode);
