import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCode, getAvailableSnippets } from '../generator';

// Create mock functions
const mockPost = vi.fn();
const mockGet = vi.fn();

// Mock axios module
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      create: vi.fn(() => ({
        post: mockPost,
        get: mockGet,
      })),
      isAxiosError: (error: unknown) => {
        return (
          typeof error === 'object' &&
          error !== null &&
          'isAxiosError' in error &&
          (error as { isAxiosError?: boolean }).isAxiosError === true
        );
      },
    },
    isAxiosError: (error: unknown) => {
      return (
        typeof error === 'object' &&
        error !== null &&
        'isAxiosError' in error &&
        (error as { isAxiosError?: boolean }).isAxiosError === true
      );
    },
  };
});

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
      const error = {
        isAxiosError: true,
        response: {
          data: { message: 'Error message' },
        },
      };
      mockPost.mockRejectedValue(error);

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
