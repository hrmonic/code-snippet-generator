import { snippetLoader } from './snippetLoader.js';
import type { Language, FeatureType } from '../types/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { security } from './security/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

interface EnrichedVariable {
  name: string;
  type: string;
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

class OptionTransformer {
  /**
   * Transforme les variables d'un snippet en options pour le frontend
   */
  async transformSnippetVariables(
    language: Language,
    feature: FeatureType
  ): Promise<OptionConfig[]> {
    // Charger le snippet
    const snippet = await snippetLoader.getSnippet(language, feature);
    if (!snippet || !snippet.variables) {
      return [];
    }

    // Transformer les variables
    const options: OptionConfig[] = snippet.variables.map((variable: EnrichedVariable) => {
      return this.transformVariable(variable);
    });

    // Charger les options enrichies si elles existent
    const enrichedOptions = await this.loadEnrichedOptions(language, feature);
    if (enrichedOptions && enrichedOptions.length > 0) {
      // Fusionner les options enrichies avec les options de base
      return this.mergeOptions(options, enrichedOptions);
    }

    return options;
  }

  /**
   * Transforme une variable en OptionConfig
   */
  private transformVariable(variable: EnrichedVariable): OptionConfig {
    const option: OptionConfig = {
      key: variable.name,
      label: variable.label || variable.name,
      type: this.mapType(variable.type),
      required: variable.required || false,
      description: variable.description,
      placeholder: variable.placeholder,
      defaultValue: variable.defaultValue,
      group: variable.group,
    };

    // Ajouter les options pour les types select et multiselect
    if (variable.options && Array.isArray(variable.options)) {
      option.options = variable.options;
    }

    // Ajouter min/max pour les types number et range
    if (variable.min !== undefined) {
      option.min = variable.min;
    }
    if (variable.max !== undefined) {
      option.max = variable.max;
    }

    // Ajouter les dépendances
    if (variable.dependsOn) {
      option.dependsOn = variable.dependsOn;
    }

    return option;
  }

  /**
   * Mappe le type de variable vers le type d'option frontend
   */
  private mapType(variableType: string): OptionConfig['type'] {
    const typeMap: Record<string, OptionConfig['type']> = {
      string: 'text',
      text: 'text',
      select: 'select',
      checkbox: 'checkbox',
      number: 'number',
      textarea: 'textarea',
      multiselect: 'multiselect',
      color: 'color',
      range: 'range',
      code: 'code',
    };

    return typeMap[variableType.toLowerCase()] || 'text';
  }

  /**
   * Charge les options enrichies depuis un fichier de configuration
   */
  private async loadEnrichedOptions(
    language: Language,
    feature: FeatureType
  ): Promise<OptionConfig[] | null> {
    try {
      // Valider et sanitizer les paramètres pour éviter path traversal
      const sanitizedLanguage = security.sanitizePathSegment(language);
      const sanitizedFeature = security.sanitizePathSegment(feature);
      
      if (!security.isValidPathSegment(sanitizedLanguage) || !security.isValidPathSegment(sanitizedFeature)) {
        return null;
      }
      
      const baseDir = path.resolve(__dirname, '..', 'data', 'options');
      const optionsPath = path.resolve(baseDir, sanitizedLanguage, `${sanitizedFeature}.options.json`);
      
      // Vérifier que le chemin résolu reste dans le répertoire de base
      if (!security.isPathSafe(optionsPath, baseDir)) {
        return null;
      }

      const fileContent = await fs.readFile(optionsPath, 'utf-8');
      const enrichedOptions = JSON.parse(fileContent) as OptionConfig[];

      return enrichedOptions;
    } catch (error) {
      // Le fichier n'existe pas, ce n'est pas une erreur
      return null;
    }
  }

  /**
   * Fusionne les options de base avec les options enrichies
   * Les options enrichies peuvent remplacer ou compléter les options de base
   */
  private mergeOptions(baseOptions: OptionConfig[], enrichedOptions: OptionConfig[]): OptionConfig[] {
    const merged: OptionConfig[] = [...baseOptions];
    const baseKeys = new Set(baseOptions.map((opt) => opt.key));

    for (const enriched of enrichedOptions) {
      const existingIndex = merged.findIndex((opt) => opt.key === enriched.key);

      if (existingIndex >= 0) {
        // Fusionner avec l'option existante
        merged[existingIndex] = {
          ...merged[existingIndex],
          ...enriched,
          // Préserver les valeurs par défaut de base si enrichi n'en a pas
          defaultValue: enriched.defaultValue ?? merged[existingIndex].defaultValue,
        };
      } else {
        // Ajouter une nouvelle option
        merged.push(enriched);
      }
    }

    return merged;
  }

  /**
   * Filtre les options selon les dépendances et les valeurs actuelles
   */
  filterOptionsByDependencies(
    options: OptionConfig[],
    currentValues: Record<string, unknown>
  ): OptionConfig[] {
    return options.filter((option) => {
      if (!option.dependsOn) {
        return true;
      }

      // Vérifier toutes les dépendances
      for (const [depKey, depValues] of Object.entries(option.dependsOn)) {
        const currentValue = currentValues[depKey];

        // Si la valeur actuelle n'est pas dans les valeurs autorisées, masquer l'option
        if (!depValues.includes(currentValue as string | boolean | number)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Organise les options par groupes
   */
  groupOptions(options: OptionConfig[]): Record<string, OptionConfig[]> {
    const groups: Record<string, OptionConfig[]> = {
      default: [],
    };

    for (const option of options) {
      const group = option.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(option);
    }

    return groups;
  }
}

export const optionTransformer = new OptionTransformer();

