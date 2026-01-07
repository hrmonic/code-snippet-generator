import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCode, getAvailableSnippets } from '../generator';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCode', () => {
    it('should generate code successfully', async () => {
      const mockResponse = {
        data: {
          code: 'console.log("test");',
          filename: 'test.js',
          language: 'javascript',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await generateCode({
        language: 'javascript',
        feature: 'api',
        options: {},
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/generate',
        {
          language: 'javascript',
          feature: 'api',
          options: {},
        },
        expect.any(Object)
      );
    });

    it('should handle errors', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          data: { message: 'Error message' },
        },
      });

      await expect(
        generateCode({
          language: 'javascript',
          feature: 'api',
          options: {},
        })
      ).rejects.toThrow('Error message');
    });
  });

  describe('getAvailableSnippets', () => {
    it('should fetch available snippets', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Test' }],
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getAvailableSnippets();

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/snippets');
    });
  });
});

