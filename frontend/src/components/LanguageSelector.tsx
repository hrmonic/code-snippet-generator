import type { Language } from '../types';
import { useGeneratorStore } from '../store/useGeneratorStore';

const languages: Array<{ value: Language; label: string; icon: string; color: string }> = [
  { value: 'html5', label: 'HTML5', icon: '🌐', color: 'from-orange-500 to-red-500' },
  { value: 'css3', label: 'CSS3', icon: '🎨', color: 'from-blue-500 to-cyan-500' },
  { value: 'javascript', label: 'JavaScript', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  { value: 'java', label: 'Java', icon: '☕', color: 'from-red-600 to-orange-600' },
  { value: 'php', label: 'PHP', icon: '🐘', color: 'from-indigo-500 to-purple-500' },
  { value: 'sql', label: 'SQL', icon: '🗄️', color: 'from-gray-600 to-gray-800' },
];

export function LanguageSelector() {
  const { selectedLanguage, setLanguage } = useGeneratorStore();

  return (
    <div className="card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-indigo-600 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sélectionner un langage</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {languages.map((lang) => (
          <button
            type="button"
            key={lang.value}
            onClick={() => setLanguage(lang.value)}
            aria-pressed={selectedLanguage === lang.value}
            aria-label={`Sélectionner ${lang.label}`}
            className={`
              group relative p-6 rounded-xl border-2 transition-all duration-300 transform
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
              ${
                selectedLanguage === lang.value
                  ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-indigo-50 scale-105 shadow-lg dark:from-primary-900/30 dark:to-indigo-900/30 dark:border-primary-400'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 hover:scale-105 hover:shadow-md dark:border-gray-600 dark:hover:border-primary-500 dark:hover:bg-gray-700'
              }
            `}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`text-4xl transform transition-transform duration-300 ${selectedLanguage === lang.value ? 'scale-110' : 'group-hover:scale-110'}`}>
                {lang.icon}
              </div>
              <div className={`font-semibold text-sm ${selectedLanguage === lang.value ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {lang.label}
              </div>
              {selectedLanguage === lang.value && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
