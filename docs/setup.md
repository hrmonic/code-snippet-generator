# Setup – Environnement de développement

Guide pour installer et lancer le projet en local.

---

## Prérequis

- **Node.js** ≥ 20
- **npm** ≥ 10

Vérification :

```bash
node -v   # v20.x ou plus
npm -v    # 10.x ou plus
```

---

## Installation

À la racine du projet (monorepo npm workspaces) :

```bash
git clone https://github.com/hrmonic/code-snippet-generator.git
cd code-snippet-generator
npm install
```

Cela installe les dépendances du **frontend** et du **server**.

---

## Scripts disponibles (racine)

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur et le frontend en parallèle |
| `npm run dev:frontend` | Frontend seul (Vite, par défaut http://localhost:5173) |
| `npm run dev:server` | Serveur seul (Express, par défaut http://localhost:3000) |
| `npm run build` | Build production frontend + compilation TypeScript server |
| `npm run test` | Tests frontend + server |
| `npm run lint` | Lint frontend + server |
| `npm run type-check` | Vérification TypeScript frontend + server |
| `npm run format` | Formatage Prettier sur le repo |
| `npm run lighthouse` | Build puis instructions pour lancer Lighthouse |

---

## Variables d’environnement

### Frontend

- **`VITE_API_URL`** (optionnel) : URL de l’API. Par défaut en dev : `http://localhost:3000`. En production, définir l’URL du backend déployé.

### Server

- **`PORT`** (optionnel) : Port du serveur. Défaut : `3000`.

Copier `.env.example` en `.env` à la racine (ou dans `frontend/` pour Vite) et adapter. Exemple :

```
VITE_API_URL=http://localhost:3000
PORT=3000
```

---

## Lancer l’application en dev

1. **Tout en un** (recommandé) :

   ```bash
   npm run dev
   ```

   - Frontend : http://localhost:5173  
   - API : http://localhost:3000  

2. **Séparé** : un terminal pour `npm run dev:server`, un autre pour `npm run dev:frontend`. S’assurer que le frontend pointe vers la bonne API (`VITE_API_URL` si besoin).

---

## Build production

```bash
npm run build
```

- Frontend : sortie dans `frontend/dist/`
- Server : sortie dans `server/dist/` (ou selon `tsconfig.json`)

Pour servir le frontend en local après build :

```bash
npx serve frontend/dist -s -l 4173
```

Puis lancer un audit Lighthouse sur http://localhost:4173 (voir [lighthouse.md](lighthouse.md)).

---

## Tests et qualité

- **Tests** : `npm run test` (Jest côté server, config frontend selon le projet).
- **Validation des snippets** (server) : `npm run validate:snippets --workspace=server` pour vérifier placeholders vs variables.
- **Lighthouse** : objectif 95+ sur Performance, Accessibility, Best Practices, SEO (voir [lighthouse.md](lighthouse.md)).

---

## Structure des workspaces

- **frontend/** : React 18, Vite 5, TypeScript, Zustand, Monaco Editor, Tailwind.
- **server/** : Express, TypeScript, Zod, stratégies de génération par langage.

---

## PWA et déploiement

- **manifest** : `frontend/public/manifest.json` (nom, icônes, theme_color, display standalone). Lié dans `index.html`.
- **robots.txt** : `frontend/public/robots.txt` (Allow: /) ; copié dans `dist/` au build.
- Pour un score PWA complet, un service worker (ex. Workbox via Vite) peut être ajouté pour la mise en cache et l’usage hors ligne.

Documentation détaillée : [architecture.md](architecture.md).
