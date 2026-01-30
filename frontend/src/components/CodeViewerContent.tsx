import { useState } from 'react';
import { CodeEditor } from '../editor/CodeEditor';
import { CodeStats } from './CodeStats';
import { DesignPreview } from './DesignPreview';
import { ExportMenu } from './ExportMenu';
import type { Language } from '../types';

type ViewTab = 'code' | 'design';

interface CodeViewerContentProps {
  displayCode: string | null;
  files: string[];
  selectedFileIndex: number;
  onSelectedFileIndexChange: (index: number) => void;
  isMultipleFiles: boolean;
  isPreview: boolean;
  selectedLanguage: Language | null;
  selectedFeature: string | null;
  theme: string;
  previewMarkup: string | undefined;
  previewError: string | null;
  isGeneratingPreview: boolean;
}

export function CodeViewerContent({
  displayCode,
  files,
  selectedFileIndex,
  onSelectedFileIndexChange,
  isMultipleFiles,
  isPreview,
  selectedLanguage,
  selectedFeature,
  theme,
  previewMarkup,
  previewError,
  isGeneratingPreview,
}: CodeViewerContentProps) {
  const [viewTab, setViewTab] = useState<ViewTab>('code');

  return (
    <>
      <div className="sr-only" aria-live="polite">
        {isPreview ? 'Prévisualisation affichée' : 'Code généré avec succès'}
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-indigo-600 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isPreview ? 'Prévisualisation' : 'Code généré'}
          </h2>
          {isPreview && (
            <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/40 dark:text-blue-200">
              Aperçu
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 flex-wrap">
            <ExportMenu
              code={isMultipleFiles ? files : displayCode}
              language={selectedLanguage ?? null}
              feature={selectedFeature}
              isPreview={isPreview}
            />
          </div>
          {isMultipleFiles && files.length > 1 && (
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Fichiers générés :</span>
              {files.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onSelectedFileIndexChange(index)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                    selectedFileIndex === index
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Afficher le fichier ${index + 1}`}
                  aria-pressed={selectedFileIndex === index}
                >
                  Fichier {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {isPreview && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-blue-900/30 dark:border-blue-700">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Prévisualisation en temps réel</strong> - Le code est généré automatiquement lorsque vous modifiez les options.
            Cliquez sur &quot;Générer le code&quot; pour obtenir la version finale.
          </p>
        </div>
      )}
      <div className="mb-4">
        <CodeStats code={displayCode ?? ''} />
      </div>
      <div className="flex gap-2 mb-3" role="tablist" aria-label="Vue code ou aperçu design">
        <button
          type="button"
          role="tab"
          aria-selected={viewTab === 'code'}
          aria-controls="code-panel"
          id="tab-code"
          onClick={() => setViewTab('code')}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            viewTab === 'code'
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
          }`}
        >
          Code
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewTab === 'design'}
          aria-controls="design-panel"
          id="tab-design"
          onClick={() => setViewTab('design')}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            viewTab === 'design'
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
          }`}
        >
          Aperçu design
        </button>
      </div>
      <div id="code-panel" role="tabpanel" aria-labelledby="tab-code" hidden={viewTab !== 'code'}>
        <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
          <CodeEditor code={displayCode ?? ''} language={selectedLanguage ?? 'javascript'} theme={theme as 'light' | 'dark'} />
        </div>
      </div>
      <div
        id="design-panel"
        role="tabpanel"
        aria-labelledby="tab-design"
        hidden={viewTab !== 'design'}
        className="relative"
      >
        {viewTab === 'design' && (
          <>
            {previewError && isPreview && (
              <div
                className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                role="alert"
              >
                Impossible de générer l&apos;aperçu. Consultez l&apos;onglet Code.
              </div>
            )}
            {isGeneratingPreview && (
              <div
                className="absolute top-2 right-2 z-10 px-2.5 py-1 text-xs font-medium bg-primary-600 text-white rounded-lg shadow animate-pulse"
                role="status"
                aria-live="polite"
              >
                Mise à jour…
              </div>
            )}
            <DesignPreview
              code={displayCode ?? ''}
              language={selectedLanguage ?? 'javascript'}
              height={420}
              title="Aperçu du rendu du snippet"
              previewMarkup={selectedLanguage === 'css3' ? previewMarkup : undefined}
            />
          </>
        )}
      </div>
    </>
  );
}
