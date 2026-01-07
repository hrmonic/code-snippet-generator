import { useState } from 'react';
import { copyToClipboard } from '../lib/clipboard';
import { downloadFile, downloadMultipleFiles, generateFilename, getFileExtension, getMimeType, type FileToDownload } from '../lib/download';
import type { Language } from '../types';

interface ExportMenuProps {
  code: string | string[] | null;
  language: Language | null;
  feature: string | null;
  filename?: string;
  isPreview?: boolean;
}

export function ExportMenu({ code, language, feature, filename, isPreview = false }: ExportMenuProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!code || !language) {
    return null;
  }

  const isMultipleFiles = Array.isArray(code);
  const files: FileToDownload[] = isMultipleFiles
    ? code.map((c, index) => ({
        content: c,
        filename: filename || `file-${index + 1}.${getFileExtension(language)}`,
        mimeType: getMimeType(language),
      }))
    : [
        {
          content: code,
          filename: filename || generateFilename(language, feature || 'code', getFileExtension(language)),
          mimeType: getMimeType(language),
        },
      ];

  const handleCopy = async () => {
    try {
      const textToCopy = isMultipleFiles ? code.join('\n\n// ===== FILE SEPARATOR =====\n\n') : code;
      await copyToClipboard(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const handleDownloadSingle = () => {
    if (!isMultipleFiles && code) {
      downloadFile(code, files[0].filename, files[0].mimeType);
    }
  };

  const handleDownloadAll = async () => {
    if (isMultipleFiles) {
      try {
        await downloadMultipleFiles(files, `code-${feature || 'generated'}.zip`);
      } catch (error) {
        console.error('Erreur lors du téléchargement ZIP:', error);
      }
    } else {
      handleDownloadSingle();
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2 hover:bg-gray-200 transition-colors"
          title="Copier dans le presse-papiers"
          aria-label="Copier le code dans le presse-papiers"
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

        {isMultipleFiles ? (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2 hover:bg-gray-200 transition-colors"
              aria-label="Menu de téléchargement"
              aria-expanded={showMenu}
              aria-haspopup="menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                ></div>
                <div
                  className="absolute z-20 right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg"
                  role="menu"
                  aria-label="Options de téléchargement"
                >
                  <button
                    onClick={handleDownloadAll}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Télécharger tout (ZIP)
                  </button>
                  {files.map((file, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        downloadFile(file.content, file.filename, file.mimeType);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm"
                      role="menuitem"
                      aria-label={`Télécharger ${file.filename}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {file.filename}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={handleDownloadSingle}
            className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2 hover:bg-gray-200 transition-colors"
            title="Télécharger le fichier"
            aria-label="Télécharger le fichier"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Télécharger
          </button>
        )}
      </div>
      {isPreview && (
        <p className="text-xs text-gray-500 mt-2">
          Note: La prévisualisation peut différer légèrement du code final généré
        </p>
      )}
    </div>
  );
}

