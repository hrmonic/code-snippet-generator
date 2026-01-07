import { type ReactNode, useState, memo } from 'react';
import type { OptionConfig } from '../hooks/useSnippetOptions';

interface OptionGroupProps {
  title: string;
  description?: string;
  options?: OptionConfig[];
  children: ReactNode;
  defaultOpen?: boolean;
}

function OptionGroupComponent({ title, description, children, defaultOpen = true }: OptionGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-expanded={isOpen}
        aria-controls={`option-group-${title}`}
      >
        <div className="text-left">
              <h3 id={`group-title-${title}`} className="font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div id={`option-group-${title}`} className="p-4 space-y-4" role="region" aria-labelledby={`group-title-${title}`}>
          {children}
        </div>
      )}
    </div>
  );
}

// Optimisation avec React.memo
export const OptionGroup = memo(OptionGroupComponent);

// Utilitaire pour grouper les options
export function groupOptionsByCategory(options: OptionConfig[]): Record<string, OptionConfig[]> {
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

// Noms de groupes traduits
export const GROUP_LABELS: Record<string, string> = {
  default: 'Options générales',
  basic: 'Options de base',
  style: 'Options de style',
  advanced: 'Options avancées',
  security: 'Options de sécurité',
  layout: 'Options de mise en page',
  behavior: 'Comportement',
};

