import { useState, useEffect } from 'react';
import { useGeneratorStore } from '../store/useGeneratorStore';

export type ToastType = 'success' | 'error' | 'info';

export type ToastState = { message: string; type: ToastType } | null;

/**
 * Observe le store (error, generatedCode) et expose le toast à afficher + dismiss.
 * Un seul endroit pour la logique toast → App reste simple.
 */
export function useGeneratorToasts(): { toast: ToastState; dismiss: () => void } {
  const error = useGeneratorStore((s) => s.error);
  const generatedCode = useGeneratorStore((s) => s.generatedCode);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (error) setToast({ message: error, type: 'error' });
    else if (generatedCode) setToast({ message: 'Code généré avec succès !', type: 'success' });
  }, [error, generatedCode]);

  return { toast, dismiss: () => setToast(null) };
}
