import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelector } from '../LanguageSelector';

// Mock the store
const mockSetLanguage = vi.fn();

vi.mock('../../store/useGeneratorStore', () => ({
  useGeneratorStore: vi.fn(() => ({
    selectedLanguage: null,
    setLanguage: mockSetLanguage,
  })),
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetLanguage.mockReset();
  });

  it('should render all languages', () => {
    render(<LanguageSelector />);
    expect(screen.getByText('HTML5')).toBeInTheDocument();
    expect(screen.getByText('CSS3')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.getByText('PHP')).toBeInTheDocument();
    expect(screen.getByText('SQL')).toBeInTheDocument();
  });

  it('should call setLanguage when a language is clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const html5Button = screen.getByText('HTML5').closest('button');
    if (html5Button) {
      await user.click(html5Button);
      expect(mockSetLanguage).toHaveBeenCalledWith('html5');
    }
  });
});
