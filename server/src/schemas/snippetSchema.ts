/**
 * Schéma de validation pour les snippets enrichis
 */

export interface SnippetVariableSchema {
  name: string;
  type: 'text' | 'select' | 'checkbox' | 'number' | 'textarea' | 'multiselect' | 'color' | 'range' | 'code' | 'string';
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  defaultValue?: string | boolean | number | string[];
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  dependsOn?: Record<string, (string | boolean | number)[]>;
  group?: string;
}

export interface SnippetSchema {
  id: string;
  name: string;
  description: string;
  code: string;
  language: string;
  feature: string;
  variables: SnippetVariableSchema[];
  security: {
    sqlInjection: boolean;
    xss: boolean;
    csrf?: boolean;
  };
  tests?: string;
}

/**
 * Valide qu'une variable de snippet est correctement formatée
 */
export function validateSnippetVariable(variable: unknown): variable is SnippetVariableSchema {
  if (typeof variable !== 'object' || variable === null) {
    return false;
  }

  const v = variable as Record<string, unknown>;

  // name et type sont requis
  if (typeof v.name !== 'string' || typeof v.type !== 'string') {
    return false;
  }

  // Type doit être valide
  const validTypes = ['text', 'select', 'checkbox', 'number', 'textarea', 'multiselect', 'color', 'range', 'code', 'string'];
  if (!validTypes.includes(v.type)) {
    return false;
  }

  // Si c'est un select ou multiselect, options doit être un tableau
  if ((v.type === 'select' || v.type === 'multiselect') && v.options) {
    if (!Array.isArray(v.options)) {
      return false;
    }
    // Vérifier que chaque option a value et label
    for (const option of v.options) {
      if (typeof option !== 'object' || option === null) {
        return false;
      }
      if (typeof (option as Record<string, unknown>).value !== 'string') {
        return false;
      }
      if (typeof (option as Record<string, unknown>).label !== 'string') {
        return false;
      }
    }
  }

  // Si c'est un number ou range, min et max doivent être des nombres
  if ((v.type === 'number' || v.type === 'range') && v.min !== undefined && typeof v.min !== 'number') {
    return false;
  }
  if ((v.type === 'number' || v.type === 'range') && v.max !== undefined && typeof v.max !== 'number') {
    return false;
  }

  return true;
}

/**
 * Valide qu'un snippet est correctement formaté
 */
export function validateSnippet(snippet: unknown): snippet is SnippetSchema {
  if (typeof snippet !== 'object' || snippet === null) {
    return false;
  }

  const s = snippet as Record<string, unknown>;

  // Champs requis
  if (typeof s.id !== 'string') return false;
  if (typeof s.name !== 'string') return false;
  if (typeof s.description !== 'string') return false;
  if (typeof s.code !== 'string') return false;
  if (typeof s.language !== 'string') return false;
  if (typeof s.feature !== 'string') return false;

  // Variables doit être un tableau
  if (!Array.isArray(s.variables)) {
    return false;
  }

  // Valider chaque variable
  for (const variable of s.variables) {
    if (!validateSnippetVariable(variable)) {
      return false;
    }
  }

  // Security doit être un objet
  if (typeof s.security !== 'object' || s.security === null) {
    return false;
  }

  const security = s.security as Record<string, unknown>;
  if (typeof security.sqlInjection !== 'boolean') return false;
  if (typeof security.xss !== 'boolean') return false;

  return true;
}

