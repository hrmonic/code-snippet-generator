# Template engine & placeholders

## Données : JSON vs const en TS

Pour éviter la duplication « questions / infos à la fois dans un JSON et en const dans un fichier TS » :

- **Descriptions des snippets** : source de vérité = champ `description` dans chaque snippet JSON (`server/src/data/snippets/`, `frontend/public/snippets/`). Le composant `FeatureInfo` charge le snippet JSON et utilise cette description (fallback const uniquement si absent).
- **Options / variables** : source de vérité = API `GET /api/snippets/:lang/:feature/options` et champ `variables` des snippets JSON. Le frontend utilise `OptionConfig` partagé et `transformVariablesToOptions` pour le fallback.
- **Icônes par feature** (`FEATURE_ICONS` dans `useSnippets.ts`) : purement UI, pas présent dans les JSON ; une évolution serait de les déplacer dans un seul fichier de config (ex. `frontend/src/config/featureIcons.json`) si on veut tout centraliser.
- **Code démo** (`DEMO_SNIPPETS` dans `generator.ts`) : fallback quand l’API est indisponible. Une évolution serait de déplacer ces snippets vers des JSON (ex. `public/demo/`) pour n’avoir qu’une source.

**Mélange JS/TS** : tout le code source est en TypeScript (`.ts`/`.tsx`). Les seuls `.js` sont des fichiers de config (eslint, tailwind, postcss, jest). Côté server, les imports avec extension `.js` sont dus à l’émission ESM (TypeScript produit des `.js`) ; c’est le comportement attendu avec Node ESM, pas un mélange de code JS et TS.

---

## Source de vérité (template)

La **source de vérité** pour le remplacement des placeholders et la génération de code est le **backend** :

- **Fichier** : [`server/src/lib/codeGenerator.ts`](../server/src/lib/codeGenerator.ts)
- **Fonction** : `replacePlaceholders()` (et stratégies par langage)

Le frontend utilise un fallback quand l’API est indisponible :

- **Fichier** : [`frontend/src/lib/clientCodeGenerator.ts`](../frontend/src/lib/clientCodeGenerator.ts)
- **Fonction** : `replacePlaceholders()` (copie à garder alignée)

## Règles des placeholders

- **Simple** : `{{key}}` → remplacé par la valeur (string, number, etc.).
- **Conditions** :
  - `{{#if key}}...{{/if}}` : affiché si la valeur est truthy.
  - `{{#unless key}}...{{/unless}}` : affiché si la valeur est falsy.
- **Arrays** (multiselect) : génération de lignes (ex. `<li><a href="#">...</a></li>`).
- **Objets** : sérialisation JSON (avec sanitization selon le langage).

## Checklist de synchronisation (clientCodeGenerator ↔ server)

Lors de toute modification de la logique template côté **server**, vérifier / mettre à jour le **frontend** :

- [ ] `replacePlaceholders()` : même gestion des types (string, boolean, array, object).
- [ ] Patterns regex : `{{#if}}`, `{{#unless}}`, `{{#each}}` et nettoyage des blocs non résolus.
- [ ] `linkMap` (navbar / arrays) : mêmes clés et libellés si utilisés côté client.
- [ ] Sanitization par langage : HTML (escapeHtml), PHP/SQL/Java (sanitizeInput), JS (escapeJs), etc.
- [ ] Cas spéciaux (ex. navbar `navLinks`, CRUD Java multi-fichiers) : reproduits dans le fallback client si nécessaire.

## Évolution possible

- Extraire la logique template dans un **package partagé** (ex. `shared/` ou `packages/template-engine`) utilisé par le server et le frontend en build pour supprimer la duplication.
