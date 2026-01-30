/**
 * Shared DOM element IDs used for scroll/focus navigation between sections.
 * Single source of truth to avoid magic strings and coupling by ID.
 */

export const DOM_IDS = {
  optionsSection: 'options-section',
  generateCodeBtn: 'generate-code-btn',
  generatedCode: 'generated-code',
} as const;

export type DomId = (typeof DOM_IDS)[keyof typeof DOM_IDS];
