import { useState, useEffect, memo } from 'react';
import { OptionHelp } from './OptionHelp';

export type OptionInputType = 'text' | 'select' | 'checkbox' | 'number' | 'textarea' | 'multiselect' | 'color' | 'range' | 'code';

export interface OptionInputProps {
  type: OptionInputType;
  label: string;
  value: string | string[] | boolean | number;
  onChange: (value: string | string[] | boolean | number) => void;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  description?: string;
  min?: number;
  max?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

function OptionInputComponent({
  type,
  label,
  value,
  onChange,
  placeholder,
  required,
  options = [],
  description,
  min,
  max,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: OptionInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  // Validation en temps réel
  useEffect(() => {
    if (!isTouched) return;

    let error: string | null = null;

    if (required) {
      if (type === 'checkbox') {
        if (value !== true) {
          error = 'Ce champ est requis';
        }
      } else if (type === 'multiselect') {
        if (!Array.isArray(value) || value.length === 0) {
          error = 'Au moins une option doit être sélectionnée';
        }
      } else if (type === 'number') {
        if (value === undefined || value === null || value === '') {
          error = 'Ce champ est requis';
        } else if (min !== undefined && Number(value) < min) {
          error = `La valeur doit être au moins ${min}`;
        } else if (max !== undefined && Number(value) > max) {
          error = `La valeur doit être au plus ${max}`;
        }
      } else {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          error = 'Ce champ est requis';
        }
      }
    } else if (type === 'number' && value !== undefined && value !== null && value !== '') {
      if (min !== undefined && Number(value) < min) {
        error = `La valeur doit être au moins ${min}`;
      } else if (max !== undefined && Number(value) > max) {
        error = `La valeur doit être au plus ${max}`;
      }
    }

    setValidationError(error);
  }, [value, required, type, min, max, isTouched]);

  const handleSelectChange = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const handleMultiselectToggle = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue];
    onChange(newValues);
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="input w-full text-left flex items-center justify-between cursor-pointer"
              aria-label={ariaLabel || label}
              aria-expanded={isOpen}
              aria-haspopup="listbox"
            >
              <span className={value ? 'text-gray-900' : 'text-gray-400'}>
                {value
                  ? options.find((opt) => opt.value === value)?.label || value
                  : placeholder || 'Sélectionner...'}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsOpen(false)}
                ></div>
                <div
                  className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                  role="listbox"
                  aria-label={label}
                >
                  {options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectChange(option.value)}
                      role="option"
                      aria-selected={value === option.value}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                        value === option.value ? 'bg-primary-50 text-primary-700' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            <div
              className="border-2 border-gray-300 rounded-lg p-3 min-h-[100px] max-h-48 overflow-y-auto"
              role="group"
              aria-label={label}
            >
              {options.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucune option disponible</p>
              ) : (
                options.map((option) => {
                  const isSelected = Array.isArray(value) && value.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          handleMultiselectToggle(option.value);
                          setIsTouched(true);
                        }}
                        onBlur={() => setIsTouched(true)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        aria-label={option.label}
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  );
                })
              )}
            </div>
            {Array.isArray(value) && value.length > 0 && (
              <div className="text-xs text-gray-500" aria-live="polite">
                {value.length} option{value.length > 1 ? 's' : ''} sélectionnée{value.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => {
                onChange(e.target.checked);
                setIsTouched(true);
              }}
              onBlur={() => setIsTouched(true)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              aria-label={ariaLabel || label}
              aria-describedby={ariaDescribedBy}
            />
            <span className="text-sm text-gray-700">{description || 'Activer cette option'}</span>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value as number || ''}
            onChange={(e) => {
              onChange(Number(e.target.value));
              setIsTouched(true);
            }}
            onBlur={() => setIsTouched(true)}
            placeholder={placeholder}
            min={min}
            max={max}
            className={`input ${validationError && isTouched ? 'border-red-500' : ''}`}
            required={required}
            aria-label={ariaLabel || label}
            aria-describedby={ariaDescribedBy}
            aria-invalid={validationError && isTouched ? 'true' : 'false'}
            aria-required={required ? 'true' : 'false'}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => {
              onChange(e.target.value);
              setIsTouched(true);
            }}
            onBlur={() => setIsTouched(true)}
            placeholder={placeholder}
            rows={4}
            className={`input resize-none ${validationError && isTouched ? 'border-red-500' : ''}`}
            required={required}
            aria-label={ariaLabel || label}
            aria-describedby={ariaDescribedBy}
            aria-invalid={validationError && isTouched ? 'true' : 'false'}
            aria-required={required ? 'true' : 'false'}
          />
        );

      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value as string || '#000000'}
              onChange={(e) => {
                onChange(e.target.value);
                setIsTouched(true);
              }}
              onBlur={() => setIsTouched(true)}
              className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              aria-label={`${label} - Sélecteur de couleur`}
            />
            <input
              type="text"
              value={value as string || ''}
              onChange={(e) => {
                onChange(e.target.value);
                setIsTouched(true);
              }}
              onBlur={() => setIsTouched(true)}
              placeholder="#000000"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              className={`input flex-1 ${validationError && isTouched ? 'border-red-500' : ''}`}
              required={required}
              aria-label={ariaLabel || label}
              aria-describedby={ariaDescribedBy}
              aria-invalid={validationError && isTouched ? 'true' : 'false'}
            />
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="range"
                value={value as number || min || 0}
                onChange={(e) => {
                  onChange(Number(e.target.value));
                  setIsTouched(true);
                }}
                onBlur={() => setIsTouched(true)}
                min={min}
                max={max}
                className="flex-1"
                required={required}
                aria-label={ariaLabel || label}
                aria-describedby={ariaDescribedBy}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={value as number || min || 0}
              />
              <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right" aria-live="polite">
                {value as number || min || 0}
              </span>
            </div>
            {min !== undefined && max !== undefined && (
              <div className="flex justify-between text-xs text-gray-500" role="presentation">
                <span>{min}</span>
                <span>{max}</span>
              </div>
            )}
          </div>
        );

      case 'code':
        return (
          <div className="space-y-2">
            <textarea
              value={value as string || ''}
              onChange={(e) => {
                onChange(e.target.value);
                setIsTouched(true);
              }}
              onBlur={() => setIsTouched(true)}
              placeholder={placeholder || 'Entrez votre code...'}
              rows={8}
              className={`input resize-none font-mono text-sm ${validationError && isTouched ? 'border-red-500' : ''}`}
              required={required}
              aria-label={ariaLabel || label}
              aria-describedby={ariaDescribedBy}
              aria-invalid={validationError && isTouched ? 'true' : 'false'}
            />
            <p className="text-xs text-gray-500" id={ariaDescribedBy}>
              Utilisez un éditeur de code pour des fonctionnalités avancées
            </p>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value as string || ''}
            onChange={(e) => {
              onChange(e.target.value);
              setIsTouched(true);
            }}
            onBlur={() => setIsTouched(true)}
            placeholder={placeholder}
            className={`input ${validationError && isTouched ? 'border-red-500' : ''}`}
            required={required}
            aria-label={ariaLabel || label}
            aria-describedby={ariaDescribedBy}
            aria-invalid={validationError && isTouched ? 'true' : 'false'}
            aria-required={required ? 'true' : 'false'}
          />
        );
    }
  };

  // Générer des exemples basés sur le type
  const getExamples = (): string[] | undefined => {
    if (type === 'text' && placeholder) {
      return [placeholder];
    }
    if (type === 'number' && min !== undefined && max !== undefined) {
      return [`Entre ${min} et ${max}`];
    }
    return undefined;
  };

  // Générer des valeurs recommandées basées sur les options
  const getRecommendedValues = () => {
    if (options && options.length > 0 && options.length <= 5) {
      return options;
    }
    return undefined;
  };

  return (
    <div className="animate-fade-in">
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
        <span>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        <OptionHelp
          description={description}
          examples={getExamples()}
          recommendedValues={getRecommendedValues()}
        />
      </label>
      {description && type !== 'checkbox' && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      {renderInput()}
      {validationError && isTouched && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1" role="alert">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {validationError}
        </p>
      )}
    </div>
  );
}

// Optimisation avec React.memo pour éviter les re-renders inutiles
export const OptionInput = memo(OptionInputComponent, (prevProps, nextProps) => {
  // Re-render seulement si les props importantes changent
  return (
    prevProps.type === nextProps.type &&
    prevProps.value === nextProps.value &&
    prevProps.required === nextProps.required &&
    prevProps.label === nextProps.label &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.description === nextProps.description &&
    prevProps.min === nextProps.min &&
    prevProps.max === nextProps.max &&
    JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options)
  );
});

