import type { GenerateRequest, GenerateResponse } from '../types';

/**
 * Fonction helper pour remplacer les placeholders dans le code
 * Supporte les conditions Handlebars-like: {{#if}}, {{#unless}}, {{#each}}
 */
function replacePlaceholders(
  code: string,
  options: Record<string, unknown>,
  sanitizeFn: (value: string) => string = (v) => v
): string {
  let result = code;

  for (const [key, value] of Object.entries(options)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    
    // Gérer les arrays (pour multiselect)
    if (Array.isArray(value)) {
      const arrayCode = value
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            // Objet avec label et value
            return `            <li><a href="#${item.value || item}">${item.label || item}</a></li>`;
          }
          // String simple
          const linkMap: Record<string, string> = {
            home: 'Accueil',
            about: 'À propos',
            services: 'Services',
            portfolio: 'Portfolio',
            blog: 'Blog',
            contact: 'Contact',
          };
          return `            <li><a href="#${item}">${linkMap[item as string] || item}</a></li>`;
        })
        .join('\n');
      result = result.replace(placeholder, arrayCode);
      continue;
    }

    // Gérer les booleans (pour checkboxes)
    if (typeof value === 'boolean') {
      // Pattern: {{#if key}}...{{/if}}
      const ifPattern = new RegExp(`{{#if ${key}}}([\\s\\S]*?){{/if}}`, 'g');
      // Pattern: {{#unless key}}...{{/unless}}
      const unlessPattern = new RegExp(`{{#unless ${key}}}([\\s\\S]*?){{/unless}}`, 'g');
      
      if (value) {
        // Si true: garder le contenu de {{#if}}, supprimer {{#unless}}
        result = result.replace(ifPattern, '$1');
        result = result.replace(unlessPattern, '');
      } else {
        // Si false: supprimer {{#if}}, garder le contenu de {{#unless}}
        result = result.replace(ifPattern, '');
        result = result.replace(unlessPattern, '$1');
      }
      // Retirer aussi les placeholders simples
      result = result.replace(placeholder, '');
      continue;
    }

    // Gérer les objets (pour les options complexes)
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const objStr = JSON.stringify(value);
      result = result.replace(placeholder, sanitizeFn(objStr));
      continue;
    }

    // Valeur simple
    result = result.replace(placeholder, sanitizeFn(String(value)));
  }

  // Nettoyer les conditions non résolues (après tous les remplacements)
  result = result.replace(/{{#if\s+\w+}}[\s\S]*?{{\/if}}/g, '');
  result = result.replace(/{{#unless\s+\w+}}[\s\S]*?{{\/unless}}/g, '');
  result = result.replace(/{{#each\s+\w+}}[\s\S]*?{{\/each}}/g, '');
  
  // Nettoyer les placeholders restants (optionnels)
  result = result.replace(/{{[^}]+}}/g, '');

  return result;
}

/**
 * Fonction de sanitization simple côté client
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function sanitizeInput(text: string): string {
  return text.replace(/[<>"']/g, '');
}

/**
 * Génère le code depuis un snippet JSON chargé côté client
 */
export async function generateCodeFromSnippet(
  request: GenerateRequest
): Promise<GenerateResponse> {
  // Charger le snippet JSON
  const snippetResponse = await fetch(`/snippets/${request.language}/${request.feature}.json`);
  
  if (!snippetResponse.ok) {
    throw new Error(`Snippet non trouvé: ${request.language}/${request.feature}`);
  }

  const snippet = await snippetResponse.json();

  if (!snippet.code) {
    throw new Error('Snippet invalide: code manquant');
  }

  let code = snippet.code;

  // Traitement spécial selon le langage
  switch (request.language) {
    case 'html5':
      // Traitement spécial pour navbar avec navLinks
      if (request.feature === 'navbar' && request.options.navLinks && Array.isArray(request.options.navLinks)) {
        const navLinks = request.options.navLinks as string[];
        const linkMap: Record<string, { href: string; label: string }> = {
          home: { href: '#home', label: 'Accueil' },
          about: { href: '#about', label: 'À propos' },
          services: { href: '#services', label: 'Services' },
          portfolio: { href: '#portfolio', label: 'Portfolio' },
          blog: { href: '#blog', label: 'Blog' },
          contact: { href: '#contact', label: 'Contact' },
        };
        
        const linksHtml = navLinks
          .map((link) => {
            const linkData = linkMap[link] || { href: `#${link}`, label: link };
            return `            <li><a href="${linkData.href}">${linkData.label}</a></li>`;
          })
          .join('\n');
        
        code = code.replace(/{{navLinks}}/g, linksHtml);
      }
      code = replacePlaceholders(code, request.options, escapeHtml);
      break;

    case 'css3':
    case 'javascript':
      code = replacePlaceholders(code, request.options);
      break;

    case 'php':
    case 'sql':
      code = replacePlaceholders(code, request.options, sanitizeInput);
      break;

    case 'java':
      // Pour CRUD Java, on peut générer plusieurs fichiers
      if (request.feature === 'crud' && request.options.entityName) {
        return generateJavaCrudFiles(snippet, request.options);
      }
      code = replacePlaceholders(code, request.options, sanitizeInput);
      break;

    default:
      code = replacePlaceholders(code, request.options);
  }

  const extensions: Record<string, string> = {
    html5: 'html',
    css3: 'css',
    javascript: 'js',
    java: 'java',
    php: 'php',
    sql: 'sql',
  };

  return {
    code,
    filename: `code.${extensions[request.language] || 'txt'}`,
    language: request.language,
    tests: snippet.tests,
  };
}

/**
 * Génère les fichiers CRUD Java (Controller, Model, Service)
 */
function generateJavaCrudFiles(snippet: any, options: Record<string, unknown>): GenerateResponse {
  const entityName = String(options.entityName || 'Entity');
  const tableName = String(options.tableName || 'entities');
  const packageName = String(options.packageName || 'com.example');

  // Templates simplifiés pour les fichiers Java
  const controllerCode = snippet.code.replace(/{{entityName}}/g, entityName)
    .replace(/{{tableName}}/g, tableName)
    .replace(/{{packageName}}/g, packageName);

  // Pour l'instant, on retourne juste le controller
  // Dans une version complète, on générerait aussi Model et Service
  return {
    code: controllerCode,
    filename: `${entityName}Controller.java`,
    language: 'java',
    tests: snippet.tests,
  };
}

