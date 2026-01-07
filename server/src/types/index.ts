export type Language = 'html5' | 'css3' | 'javascript' | 'java' | 'php' | 'sql';

export type FeatureType =
  | 'form'
  | 'api'
  | 'crud'
  | 'animation'
  | 'query'
  | 'validation'
  | 'layout'
  | 'input'
  | 'modal'
  | 'navbar'
  | 'responsive'
  | 'flexbox'
  | 'fetch'
  | 'model'
  | 'joins'
  | 'card'
  | 'table'
  | 'grid'
  | 'buttons'
  | 'storage'
  | 'debounce'
  | 'service'
  | 'router'
  | 'transactions'
  | 'slider'
  | 'variables'
  | 'promise'
  | 'observer'
  | 'repository'
  | 'middleware'
  | 'indexes';

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

export interface GenerateResult {
  code: string;
  filename?: string;
  tests?: string;
}
