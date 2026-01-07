import { useState } from 'react';

interface OptionHelpProps {
  description?: string;
  examples?: string[];
  recommendedValues?: Array<{ value: string; label: string }>;
}

export function OptionHelp({ description, examples, recommendedValues }: OptionHelpProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!description && !examples && !recommendedValues) {
    return null;
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Aide"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>

      {showTooltip && (
        <div
          className="absolute z-50 w-64 p-3 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg text-sm"
          role="tooltip"
        >
          {description && (
            <p className="text-gray-700 mb-2">{description}</p>
          )}
          {examples && examples.length > 0 && (
            <div className="mb-2">
              <p className="font-semibold text-gray-900 mb-1">Exemples :</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {examples.map((example, index) => (
                  <li key={index} className="font-mono text-xs">{example}</li>
                ))}
              </ul>
            </div>
          )}
          {recommendedValues && recommendedValues.length > 0 && (
            <div>
              <p className="font-semibold text-gray-900 mb-1">Valeurs recommandées :</p>
              <div className="flex flex-wrap gap-1">
                {recommendedValues.map((rec, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    {rec.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

