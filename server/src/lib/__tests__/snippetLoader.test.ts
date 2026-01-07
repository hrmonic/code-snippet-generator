import { snippetLoader } from '../snippetLoader.js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Mock fs module
jest.mock('fs');
jest.mock('path');

describe('SnippetLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    snippetLoader.clearCache();
  });

  it('should load snippets by language', async () => {
    const mockSnippets = [
      { id: '1', name: 'Test', language: 'html5', feature: 'form' },
    ];

    (readdirSync as jest.Mock).mockReturnValue(['form.json']);
    (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockSnippets[0]));

    const snippets = await snippetLoader.getSnippetsByLanguage('html5');

    expect(snippets).toHaveLength(1);
    expect(snippets[0].id).toBe('1');
  });

  it('should return empty array if directory does not exist', async () => {
    (readdirSync as jest.Mock).mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const snippets = await snippetLoader.getSnippetsByLanguage('unknown');
    expect(snippets).toEqual([]);
  });

  it('should cache snippets', async () => {
    const mockSnippet = { id: '1', name: 'Test', language: 'html5', feature: 'form' };

    (readdirSync as jest.Mock).mockReturnValue(['form.json']);
    (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockSnippet));

    await snippetLoader.getSnippetsByLanguage('html5');
    await snippetLoader.getSnippetsByLanguage('html5');

    // readFileSync should be called only once due to caching
    expect(readFileSync).toHaveBeenCalledTimes(1);
  });
});

