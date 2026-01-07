export type Language = 'html5' | 'css3' | 'javascript' | 'java' | 'php' | 'sql';

export type FeatureType =
  | 'form'
  | 'api'
  | 'crud'
  | 'animation'
  | 'query'
  | 'validation'
  | 'layout'
  | 'input';

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
  code: string;
  filename?: string;
  language: Language;
  tests?: string;
}

export interface GeneratorState {
  selectedLanguage: Language | null;
  selectedFeature: FeatureType | null;
  options: Record<string, unknown>;
  generatedCode: string | null;
  isLoading: boolean;
  error: string | null;
}

