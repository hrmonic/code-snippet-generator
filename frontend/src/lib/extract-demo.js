const fs = require('fs');
const gen = fs.readFileSync(__dirname + '/generator.ts', 'utf8');
const start = gen.indexOf('const DEMO_SNIPPETS');
const braceStart = gen.indexOf('{', start);
let depth = 0;
let i = braceStart;
while (i < gen.length) {
  const ch = gen[i];
  if (ch === '{') depth++;
  else if (ch === '}') {
    depth--;
    if (depth === 0) {
      i++;
      if (gen[i] === ';') i++;
      break;
    }
  }
  i++;
}
const block = gen.slice(start, i);

const header = `import type { GenerateRequest, GenerateResponse } from '../types';

`;
const footer = `

function applyTemplateVariables(code: string, options: Record<string, unknown>): string {
  let result = code;
  for (const [key, value] of Object.entries(options)) {
    const placeholder = new RegExp(\`{{\${key}}}\`, 'g');
    result = result.replace(placeholder, String(value));
  }
  return result;
}

export function generateCodeDemo(request: GenerateRequest): Promise<GenerateResponse> {
  const demoCode = DEMO_SNIPPETS[request.language]?.[request.feature];
  if (!demoCode) {
    return Promise.reject(new Error(\`Snippet démo non disponible pour \${request.language} / \${request.feature}\`));
  }
  const code = applyTemplateVariables(demoCode, request.options);
  const extensions: Record<string, string> = {
    html5: 'html', css3: 'css', javascript: 'js', java: 'java', php: 'php', sql: 'sql',
  };
  return Promise.resolve({
    code,
    filename: \`code.\${extensions[request.language] || 'txt'}\`,
    language: request.language,
  });
}

export function getDemoSnippetList(): Array<{ id: string; language: string; feature: string }> {
  const list: Array<{ id: string; language: string; feature: string }> = [];
  for (const [lang, features] of Object.entries(DEMO_SNIPPETS)) {
    for (const feature of Object.keys(features)) {
      list.push({ id: \`\${lang}-\${feature}\`, language: lang, feature });
    }
  }
  return list;
}
`;

fs.writeFileSync(__dirname + '/demoSnippets.ts', header + block + footer, 'utf8');
console.log('demoSnippets.ts written');
