import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCode, getSnippets } from '../api';

const mockFetch = vi.fn();

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  describe('generateCode', () => {
    it('returns generated code when API succeeds', async () => {
      const payload = { code: 'console.log("test");', filename: 'test.js', language: 'javascript' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(payload),
      });

      const result = await generateCode({
        language: 'javascript',
        feature: 'api',
        options: {},
      });

      expect(result).toEqual(payload);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('uses fallback when API request fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 'fallback code', variables: [] }),
      });

      const result = await generateCode({
        language: 'javascript',
        feature: 'api',
        options: {},
      });

      expect(result).toHaveProperty('code');
      expect(result.language).toBe('javascript');
    });
  });

  describe('getSnippets', () => {
    it('returns snippets when API succeeds', async () => {
      const data = [{ id: '1', language: 'html5', feature: 'form' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(data),
      });

      const result = await getSnippets();

      expect(result).toEqual(data);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/snippets'),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it('returns demo list when API fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getSnippets();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('language');
      expect(result[0]).toHaveProperty('feature');
    });
  });
});
