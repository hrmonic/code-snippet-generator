import { Editor } from '@monaco-editor/react';
import type { Language } from '../types';

interface CodeEditorProps {
  code: string;
  language: Language | string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
}

const languageMap: Record<string, string> = {
  html5: 'html',
  css3: 'css',
  javascript: 'javascript',
  java: 'java',
  php: 'php',
  sql: 'sql',
};

export function CodeEditor({ code, language, onChange, readOnly = false }: CodeEditorProps) {
  const monacoLanguage = languageMap[language] || 'javascript';

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <Editor
        height="500px"
        language={monacoLanguage}
        value={code}
        onChange={onChange}
        theme="vs-light"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}

