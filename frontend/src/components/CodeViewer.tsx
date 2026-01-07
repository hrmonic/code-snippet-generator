import { useState } from 'react';
import { CodeEditor } from '../editor/CodeEditor';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { copyToClipboard, downloadFile } from '../lib/utils';
import { CodeStats } from './CodeStats';

export function CodeViewer() {
  const { generatedCode, selectedLanguage, error, isLoading } = useGeneratorStore();

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-4 text-gray-600">Génération en cours...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 text-xl mr-2">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-800">Erreur</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!generatedCode) {
    return (
      <div className="card">
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">💻</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun code généré</h3>
          <p className="text-gray-600 mb-2">Le code généré apparaîtra ici</p>
          <p className="text-sm text-gray-500">
            Configurez vos options et cliquez sur "Générer le code"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Code généré</h2>
          <CodeStats code={generatedCode} />
        </div>
        <div className="flex gap-2">
          <CopyButton code={generatedCode} />
          <DownloadButton code={generatedCode} language={selectedLanguage} />
        </div>
      </div>
      <CodeEditor code={generatedCode} language={selectedLanguage || 'javascript'} />
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
      className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-2"
    >
      {copied ? '✓ Copié' : '📋 Copier'}
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
      className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-2"
    >
      💾 Télécharger
    </button>
  );
}

