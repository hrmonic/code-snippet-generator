import { useState, useEffect, memo } from 'react';
import { DOM_IDS } from '../constants/dom';
import { CodeViewerContent } from './CodeViewerContent';
import { CodeViewerEmpty } from './CodeViewerEmpty';
import { CodeViewerError } from './CodeViewerError';
import { CodeViewerSkeleton } from './CodeViewerSkeleton';
import { usePreview } from '../hooks/usePreview';
import { usePreviewMarkup } from '../hooks/usePreviewMarkup';
import { useScrollToOptions } from '../hooks/useScrollToSection';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { useThemeStore } from '../store/useThemeStore';

function CodeViewerComponent() {
  const {
    generatedCode,
    previewCode,
    selectedLanguage,
    selectedFeature,
    options,
    error,
    isLoading,
    setPreviewCode,
    setError,
  } = useGeneratorStore();
  const theme = useThemeStore((s) => s.theme);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const scrollToOptions = useScrollToOptions();
  const previewMarkup = usePreviewMarkup(selectedLanguage, selectedFeature);

  const { previewCode: autoPreview, isGenerating: isGeneratingPreview, error: previewError } = usePreview(
    selectedLanguage,
    selectedFeature,
    options,
    !generatedCode
  );

  useEffect(() => {
    if (autoPreview && !generatedCode) {
      setPreviewCode(autoPreview);
    }
  }, [autoPreview, generatedCode, setPreviewCode]);

  const isMultipleFiles = Array.isArray(generatedCode);
  const files = isMultipleFiles ? generatedCode : generatedCode ? [generatedCode] : [];
  const displayCode = files[selectedFileIndex] || previewCode || null;
  const isPreview = !generatedCode && !!previewCode;

  useEffect(() => {
    if (isMultipleFiles && selectedFileIndex >= files.length) {
      setSelectedFileIndex(0);
    }
  }, [isMultipleFiles, files.length, selectedFileIndex]);

  if (isLoading || (isGeneratingPreview && !displayCode)) {
    const statusText = isLoading ? 'Génération en cours' : 'Prévisualisation en cours';
    return (
      <div className="card shadow-lg" role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">{statusText}</span>
        <CodeViewerSkeleton />
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">Cela peut prendre quelques secondes</p>
      </div>
    );
  }

  if (error) {
    return (
      <CodeViewerError
        error={error}
        onRetry={() => {
          setError(null);
          scrollToOptions();
        }}
        onScrollToOptions={scrollToOptions}
      />
    );
  }

  if (!displayCode) {
    return <CodeViewerEmpty onScrollToOptions={scrollToOptions} />;
  }

  return (
    <div
      id={DOM_IDS.generatedCode}
      className="card shadow-lg hover:shadow-xl transition-shadow duration-300"
      role="region"
      aria-label={isPreview ? 'Prévisualisation du code' : 'Code généré'}
    >
      <CodeViewerContent
        displayCode={displayCode}
        files={files}
        selectedFileIndex={selectedFileIndex}
        onSelectedFileIndexChange={setSelectedFileIndex}
        isMultipleFiles={isMultipleFiles}
        isPreview={isPreview}
        selectedLanguage={selectedLanguage}
        selectedFeature={selectedFeature || null}
        theme={theme}
        previewMarkup={previewMarkup}
        previewError={previewError}
        isGeneratingPreview={isGeneratingPreview}
      />
    </div>
  );
}

export const CodeViewer = memo(CodeViewerComponent);
