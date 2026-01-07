import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelector } from '../LanguageSelector';
import { useGeneratorStore } from '../../store/useGeneratorStore';

// Mock the store
vi.mock('../../store/useGeneratorStore', () => ({
  useGeneratorStore: vi.fn(),
}));

describe('LanguageSelector', () => {
  const mockSetLanguage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useGeneratorStore as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedLanguage: null,
      setLanguage: mockSetLanguage,
    });
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
