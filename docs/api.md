# API – Code Snippet Generator

Vue d’ensemble des endpoints du serveur (Express). Base URL par défaut : `http://localhost:3000`.

**Frontend** : une seule couche d'appel, `frontend/src/lib/api.ts` — getSnippets, getOptions, generateCode, generatePreview (timeout + fallbacks centralisés).

---

## Santé

### `GET /health`

Vérification que le serveur répond.

**Réponse** (200) :

```json
{
  "status": "ok",
  "timestamp": "2025-01-30T12:00:00.000Z"
}
```

---

## Snippets

### `GET /api/snippets`

Liste tous les snippets disponibles (tous langages).

**En-têtes** : `Cache-Control: public, max-age=300, stale-while-revalidate=60`

**Réponse** (200) : tableau d’objets `{ id, name, description, language, feature }`.

**Exemple** :

```json
[
  {
    "id": "html5-card",
    "name": "Card Component HTML5",
    "description": "Composant card responsive avec ombre et hover",
    "language": "html5",
    "feature": "card"
  }
]
```

---

### `GET /api/snippets/:language`

Liste les snippets d’un langage (`html5`, `css3`, `javascript`, `java`, `php`, `sql`).

**Paramètres** : `language` (path).

**Réponse** (200) : même structure que `GET /api/snippets`, filtrée par `language`.

---

### `GET /api/snippets/:language/:feature/options`

Retourne les options (variables) configurables pour un snippet.

**Paramètres** : `language`, `feature` (path).

**Réponse** (200) : tableau d’objets **OptionConfig** (source de vérité côté server : `server/src/lib/optionTransformer.ts`). Champs : `key`, `label`, `type`, `required`, `defaultValue`, `options`, `dependsOn`, `group`, `placeholder`, `description`, `min`, `max`. Le fallback frontend (fetch snippet JSON + `transformVariablesToOptions`) doit produire le même format (voir `frontend/src/types/index.ts` et `frontend/src/lib/optionTransform.ts`).

**Erreurs** : 400 si langage invalide, 500 en cas d’erreur interne.

---

## Génération

### `POST /api/generate`

Génère du code à partir d’un langage, d’une feature et d’options.

**Corps** (JSON) :

| Champ     | Type   | Obligatoire | Description                          |
|----------|--------|-------------|--------------------------------------|
| language | string | oui         | `html5` \| `css3` \| `javascript` \| `java` \| `php` \| `sql` |
| feature  | string | oui         | Identifiant de la feature (ex. `card`, `navbar`) |
| options  | object | oui         | Clé/valeur des options (noms des variables du snippet) |
| preview  | boolean| non         | Si `true`, réponse simplifiée pour la prévisualisation |

**Réponse** (200) :

- **Un seul fichier** : `{ code, filename, language?, tests? }`
- **Plusieurs fichiers** (ex. CRUD Java) : `{ files: [{ code, filename, tests? }, ...], language, isMultiple: true }`
- **Mode preview** : `{ code, filename?, language, preview: true }`

**Erreurs** : 400 si validation Zod échoue (langage/feature invalide, options manquantes), 500 en cas d’erreur serveur.

**Exemple** :

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"language":"html5","feature":"card","options":{"cardTitle":"Ma carte","cardContent":"Contenu"}}'
```

**Rate limiting** : 100 requêtes par minute sur `/api/*`. Au-delà : 429 avec message en français.
