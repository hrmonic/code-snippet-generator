# Architecture et rôles experts

- **API** : [docs/api.md](api.md) – endpoints, contrats, exemples.
- **Setup** : [docs/setup.md](setup.md) – installation, scripts, variables d’environnement.
- **Template / placeholders** : [docs/template-engine.md](template-engine.md) – source de vérité (server), checklist de sync avec le fallback client.

## Vue d'ensemble

Ce document décrit l'architecture du projet **Code Snippet Generator** et la manière dont les rôles experts (agents) sont invoqués pour les décisions stratégie, UX, design, performance et tests.

## Stack technique

- **Frontend** : React 18, Vite 5, TypeScript, Zustand, Monaco Editor, Tailwind CSS
- **Backend** : Node.js, Express, TypeScript, Zod
- **Données** : Snippets JSON par langage dans `server/src/data/snippets/`

## Flux de données

1. L'utilisateur sélectionne un langage et une feature (depuis l'API `/api/snippets` ou fallback statique).
2. Les options sont chargées via `GET /api/snippets/:language/:feature/options`.
3. La prévisualisation en temps réel appelle `POST /api/generate` avec `preview: true` (debounce 500 ms).
4. La génération finale appelle `POST /api/generate` sans preview ; le code (ou les fichiers) est affiché dans Monaco Editor.
5. Export : copie presse-papiers, téléchargement fichier unique ou ZIP.

## Rôles experts (agents/)

Les rôles peuvent être stockés dans un dossier **`agents/`** à la racine du projet (voir `system.md` pour l’orchestration). Si ce dossier n’existe pas, les rôles sont considérés **externes ou optionnels** : l’orchestration (ex. Cursor, autre outil) peut les résoudre ailleurs. Les noms de rôles ci‑dessous servent de référence pour priorisation et critères. Ils sont invoqués selon la tâche :

| Phase / domaine | Rôles activés | Usage |
|-----------------|---------------|--------|
| Stratégie produit | product-strategist | Priorisation, CTA, critères de succès |
| UX | ux-researcher, delight-designer | Parcours utilisateur, accessibilité, états vides/erreur |
| Design UI | ui-designer, visual-storyteller | Tokens, thèmes, hiérarchie visuelle |
| Ingénierie frontend | frontend-optimizer | Lazy-loading, debounce, cache, performances |
| Qualité et perf | performance-benchmarker | Lighthouse 95+, Core Web Vitals |
| Conversion / clarté | conversion-optimizer | Récupération d’erreur, scroll vers résultat, indicateur d’étapes |

### Ordre d'activation recommandé

Pour une évolution (feature ou refactor) : **Strategy → Product → UX → Design → Engineering → Testing → Metrics**. Les conflits sont résolus en priorisant les rôles en amont (ex. UX avant design détaillé).

### Utilisation concrète

- Avant d'implémenter une phase du plan (ex. mode sombre, skip link), les rôles concernés sont lus pour valider les critères (ex. WCAG AA, score Lighthouse 95+).
- Les outputs sont synthétisés en une seule réponse actionable ; les noms de fichiers ou chemins des rôles ne sont pas exposés à l'utilisateur final.

## Sécurité

- Validation Zod côté backend pour toutes les entrées (`requestSchema`).
- Module `server/src/lib/security/` : échappement XSS, sanitization SQL, validation path (snippetLoader).
- Pas de secrets dans le code ; variables d'environnement pour `VITE_API_URL`, `PORT`.

## Qualité des snippets et code généré

- **Validation variables ↔ placeholders** : Le script `server/src/scripts/validate-snippets.ts` (CI : `npm run validate:snippets --workspace=server`) vérifie que chaque placeholder dans le `code` d’un snippet correspond à une variable déclarée (ou à une entrée allowlist documentée). Réduire progressivement `validate-snippets.allowlist.json` en ajoutant les variables manquantes aux snippets.
- **Schéma** : `server/src/schemas/snippetSchema.ts` valide la structure des snippets ; le chargement (snippetLoader) log un avertissement si le schéma est invalide.
- **Sécurité du code généré** : Les stratégies du générateur appliquent `security.sanitizeInput` (PHP), `security.escapeHtml` (HTML), `security.escapeJs` (JS), `security.sanitizeSqlIdentifier` (SQL) sur les valeurs injectées dans les templates.

## Objectifs qualité

- **Fonctionnel** : Toute combinaison (langage, feature) présente dans les snippets est sélectionnable et génère du code sans erreur 400.
- **Score Lighthouse** : Performance, Accessibility, Best Practices, SEO ≥ 95.
- **Ergonomie** : Navigation clavier, skip link, mode sombre, feedback visuel clair.
- **Tests** : Couverture élevée ; CI (lint, test, build, validate:snippets) sur chaque push/PR.
