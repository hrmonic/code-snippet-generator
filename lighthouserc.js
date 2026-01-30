/**
 * Configuration Lighthouse / Lighthouse CI
 * Objectif : Performance, Accessibility, Best Practices, SEO ≥ 95
 * @see https://github.com/GoogleChrome/lighthouse-ci
 * Usage avec lhci : npx lhci autorun
 */
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173/'],
      numberOfRuns: 1,
      startServerCommand: 'npx serve frontend/dist -s -l 4173',
      startServerReadyPattern: 'Serving',
      startServerReadyTimeout: 10000,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
