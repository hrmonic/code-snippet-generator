# Lighthouse – objectif 95/100

## Objectif

Chaque catégorie Lighthouse (Performance, Accessibility, Best Practices, SEO) doit atteindre **au moins 95/100** pour valider la qualité de l’application.

## Configuration CI (lighthouserc.js)

À la racine du projet, `lighthouserc.js` définit les seuils 95 pour les 4 catégories. Avec [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) :

```bash
npm run build
npx lhci autorun
```

(Installer si besoin : `npm install -g @lhci/cli`.)

## Exécution manuelle

1. **Build de production**  
   À la racine du projet :
   ```bash
   npm run build
   ```

2. **Servir le frontend**  
   Depuis le dossier frontend :
   ```bash
   cd frontend && npx serve dist -s -l 4173
   ```
   Ou depuis la racine :
   ```bash
   npx serve frontend/dist -s -l 4173
   ```

3. **Lancer Lighthouse**  
   Avec Lighthouse CLI (à installer globalement : `npm install -g lighthouse`) :
   ```bash
   lighthouse http://localhost:4173 --view --output=html --output-path=./lighthouse-report.html
   ```
   Ou avec Chrome DevTools : onglet **Lighthouse**, lancer l’audit sur l’URL du serveur local.

4. **Vérifier les scores**  
   Performance, Accessibility, Best Practices et SEO doivent être ≥ 95.

## CI (optionnel)

Pour intégrer Lighthouse en CI avec seuil 95 :

- Utiliser [lhci](https://github.com/GoogleChrome/lighthouse-ci) ou une GitHub Action (ex. `treosh/lighthouse-ci-action`).
- Définir les seuils dans un fichier `lighthouserc.js` à la racine, par exemple :
  ```js
  module.exports = {
    ci: {
      assert: {
        assertions: {
          'categories:performance': ['error', { minScore: 0.95 }],
          'categories:accessibility': ['error', { minScore: 0.95 }],
          'categories:best-practices': ['error', { minScore: 0.95 }],
          'categories:seo': ['error', { minScore: 0.95 }],
        },
      },
    },
  };
  ```

## Bonnes pratiques déjà en place

- Lazy-loading de l’éditeur (CodeViewer / Monaco) pour réduire le bundle initial.
- Cache HTTP sur les routes `/api/snippets` et options (max-age 5 min).
- Accessibilité : skip link « Aller au contenu principal », ARIA (aria-label, aria-pressed, aria-busy, aria-expanded, role="alert"), focus visible (focus:ring-2 focus:ring-primary-500) sur boutons et champs, structure sémantique (h1, h2, main#main-content). Contraste et états disabled gérés (disabled:opacity-60, focus:ring-offset).
- **LCP** : contenu principal (titre, hero, étapes) rendu immédiatement au-dessus de la ligne de flottaison ; pas de police externe bloquante ; Vite injecte les scripts en module (chargement asynchrone).
