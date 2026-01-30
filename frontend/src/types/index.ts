export type Language = 'html5' | 'css3' | 'javascript' | 'java' | 'php' | 'sql';

/**
 * Feature identifier from API/snippets. Accepts any string returned by the snippets API.
 */
export type FeatureType = string;

export interface SnippetVariable {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

export interface SnippetSecurity {
  sqlInjection: boolean;
  xss: boolean;
  csrf?: boolean;
}

export interface Snippet {
  id: string;
  name: string;
  description: string;
  code: string;
  variables: SnippetVariable[];
  security: SnippetSecurity;
  tests?: string;
  language: Language;
  feature: FeatureType;
}

export interface GenerateRequest {
  language: Language;
  feature: FeatureType;
  options: Record<string, unknown>;
}

export interface GenerateResponse {
  code?: string;
  filename?: string;
  language: Language;
  tests?: string;
  files?: Array<{
    code: string;
    filename?: string;
    tests?: string;
  }>;
  isMultiple?: boolean;
  fileCount?: number;
  preview?: boolean;
}

export interface GeneratorState {
  selectedLanguage: Language | null;
  selectedFeature: FeatureType | null;
  options: Record<string, unknown>;
  generatedCode: string | string[] | null;
  isLoading: boolean;
  error: string | null;
}

/** Option config for snippet variables (aligned with API /api/snippets/:lang/:feature/options). */
export interface OptionConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'number' | 'textarea' | 'multiselect' | 'color' | 'range' | 'code';
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string | boolean | number | string[];
  min?: number;
  max?: number;
  dependsOn?: Record<string, (string | boolean | number)[]>;
  group?: string;
}
