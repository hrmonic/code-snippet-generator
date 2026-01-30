import { useCallback } from 'react';
import { DOM_IDS } from '../constants/dom';

/**
 * Returns a stable callback that scrolls to the options section and optionally
 * focuses the generate button after a short delay (for accessibility).
 */
export function useScrollToOptions(): () => void {
  return useCallback(() => {
    document.getElementById(DOM_IDS.optionsSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      document.getElementById(DOM_IDS.generateCodeBtn)?.focus({ preventScroll: true });
    }, 400);
  }, []);
}

/**
 * Returns a stable callback that scrolls to the generated code section.
 */
export function useScrollToGeneratedCode(): () => void {
  return useCallback(() => {
    document.getElementById(DOM_IDS.generatedCode)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
}
