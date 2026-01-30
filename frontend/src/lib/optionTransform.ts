import type { OptionConfig } from '../types';

/**
 * Transforms snippet variables (from API or JSON) into OptionConfig for the UI.
 * Keeps fallback options format aligned with API contract.
 */
export function transformVariablesToOptions(variables: Array<Record<string, unknown>>): OptionConfig[] {
  return variables.map((variable) => {
    let type = variable.type as string;
    if (type === 'string') {
      type = 'text';
    }

    const option: OptionConfig = {
      key: String(variable.name),
      label: String(variable.label ?? variable.description ?? variable.name ?? ''),
      type: type as OptionConfig['type'],
      required: Boolean(variable.required),
      defaultValue: variable.defaultValue as OptionConfig['defaultValue'],
      description: variable.description as string | undefined,
    };

    const originalType = variable.type as string;
    if (originalType === 'select' || originalType === 'multiselect') {
      option.options = (variable.options as OptionConfig['options']) ?? [];
    }
    if (originalType === 'number' || originalType === 'range') {
      option.min = variable.min as number | undefined;
      option.max = variable.max as number | undefined;
    }
    if (variable.placeholder) {
      option.placeholder = String(variable.placeholder);
    }
    if (variable.dependsOn) {
      option.dependsOn = variable.dependsOn as OptionConfig['dependsOn'];
    }
    if (variable.group) {
      option.group = String(variable.group);
    }

    return option;
  });
}
