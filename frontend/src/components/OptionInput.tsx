import { useState } from 'react';

export type OptionInputType = 'text' | 'select' | 'checkbox' | 'number' | 'textarea' | 'multiselect';

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
}

export function OptionInput({
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
}: OptionInputProps) {
  const [isOpen, setIsOpen] = useState(false);

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
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectChange(option.value)}
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
            <div className="border-2 border-gray-300 rounded-lg p-3 min-h-[100px] max-h-48 overflow-y-auto">
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
                        onChange={() => handleMultiselectToggle(option.value)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  );
                })
              )}
            </div>
            {Array.isArray(value) && value.length > 0 && (
              <div className="text-xs text-gray-500">
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
              onChange={(e) => onChange(e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">{description || 'Activer cette option'}</span>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder}
            min={min}
            max={max}
            className="input"
            required={required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="input resize-none"
            required={required}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="input"
            required={required}
          />
        );
    }
  };

  return (
    <div className="animate-fade-in">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && type !== 'checkbox' && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      {renderInput()}
    </div>
  );
}

