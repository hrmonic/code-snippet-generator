import { useState } from 'react';
import { CodeEditor } from '../editor/CodeEditor';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { copyToClipboard, downloadFile } from '../lib/utils';
import { CodeStats } from './CodeStats';

export function CodeViewer() {
  const { generatedCode, selectedLanguage, error, isLoading } = useGeneratorStore();

  if (isLoading) {
    return (
      <div className="card shadow-lg">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <span className="mt-6 text-gray-600 text-lg font-medium">Génération en cours...</span>
          <p className="mt-2 text-sm text-gray-500">Cela peut prendre quelques secondes</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-lg">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-red-800 text-lg mb-2">Erreur de génération</h3>
              <p className="text-red-700">{error}</p>
              <p className="text-sm text-red-600 mt-2">
                Vérifiez vos options et réessayez, ou contactez le support si le problème persiste.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!generatedCode) {
    return (
      <div className="card shadow-lg">
        <div className="text-center py-16 text-gray-500">
          <div className="text-7xl mb-6 animate-bounce">💻</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun code généré</h3>
          <p className="text-gray-600 mb-2 text-lg">Le code généré apparaîtra ici</p>
          <p className="text-sm text-gray-500">
            Configurez vos options ci-dessus et cliquez sur "Générer le code"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-indigo-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-900">Code généré</h2>
        </div>
        <div className="flex gap-3">
          <CopyButton code={generatedCode} />
          <DownloadButton code={generatedCode} language={selectedLanguage} />
        </div>
      </div>
      <div className="mb-4">
        <CodeStats code={generatedCode} />
      </div>
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
        <CodeEditor code={generatedCode} language={selectedLanguage || 'javascript'} />
      </div>
    </div>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2 hover:bg-gray-200 transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Copié !
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copier
        </>
      )}
    </button>
  );
}

function DownloadButton({ code, language }: { code: string; language: string | null }) {
  const getExtension = () => {
    const extensions: Record<string, string> = {
      html5: 'html',
      css3: 'css',
      javascript: 'js',
      java: 'java',
      php: 'php',
      sql: 'sql',
    };
    return extensions[language || 'javascript'] || 'txt';
  };

  const getMimeType = () => {
    const mimeTypes: Record<string, string> = {
      html5: 'text/html',
      css3: 'text/css',
      javascript: 'text/javascript',
      java: 'text/x-java-source',
      php: 'text/x-php',
      sql: 'text/x-sql',
    };
    return mimeTypes[language || 'javascript'] || 'text/plain';
  };

  const handleDownload = () => {
    const extension = getExtension();
    const filename = `code.${extension}`;
    downloadFile(code, filename, getMimeType());
  };

  return (
    <button
      onClick={handleDownload}
      className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2 hover:bg-gray-200 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Télécharger
    </button>
  );
}
