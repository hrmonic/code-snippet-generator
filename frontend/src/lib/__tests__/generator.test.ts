import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCode, getAvailableSnippets } from '../generator';

// Mock axios module
const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: mockPost,
      get: mockGet,
    })),
    isAxiosError: vi.fn((error: unknown) => {
      return (
        typeof error === 'object' &&
        error !== null &&
        'isAxiosError' in error &&
        (error as { isAxiosError?: boolean }).isAxiosError === true
      );
    }),
  },
  isAxiosError: vi.fn((error: unknown) => {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as { isAxiosError?: boolean }).isAxiosError === true
    );
  }),
}));

describe('generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockReset();
    mockGet.mockReset();
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

      mockPost.mockResolvedValue(mockResponse);

      const result = await generateCode({
        language: 'javascript',
        feature: 'api',
        options: {},
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockPost).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockPost.mockRejectedValue({
        isAxiosError: true,
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

      mockGet.mockResolvedValue(mockResponse);

      const result = await getAvailableSnippets();

      expect(result).toEqual(mockResponse.data);
      expect(mockGet).toHaveBeenCalled();
    });
  });
});
