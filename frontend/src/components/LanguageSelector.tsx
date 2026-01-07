import type { Language } from '../types';
import { useGeneratorStore } from '../store/useGeneratorStore';

const languages: Array<{ value: Language; label: string; icon: string }> = [
  { value: 'html5', label: 'HTML5', icon: '🌐' },
  { value: 'css3', label: 'CSS3', icon: '🎨' },
  { value: 'javascript', label: 'JavaScript', icon: '⚡' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'sql', label: 'SQL', icon: '🗄️' },
];

export function LanguageSelector() {
  const { selectedLanguage, setLanguage } = useGeneratorStore();

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Sélectionner un langage</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {languages.map((lang) => (
          <button
            key={lang.value}
            onClick={() => setLanguage(lang.value)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              ${
                selectedLanguage === lang.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="text-3xl mb-2">{lang.icon}</div>
            <div className="font-medium">{lang.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

