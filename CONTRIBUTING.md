# Guide de Contribution

Merci de votre intérêt pour contribuer à Code Snippet Generator ! 🎉

## Documentation

- [**Setup**](docs/setup.md) – Installation, scripts npm, variables d'environnement
- [**Architecture**](docs/architecture.md) – Flux de données, rôles experts, objectifs qualité
- [**API**](docs/api.md) – Endpoints et contrats du serveur

## Processus de Contribution

1. **Fork** le repository
2. **Clone** votre fork localement
3. **Créez** une branche pour votre feature
4. **Développez** votre feature avec des tests
5. **Soumettez** une Pull Request

## Standards de Code

### TypeScript
- Utilisez le mode strict
- Évitez `any`, utilisez des types explicites
- Documentez les fonctions complexes avec JSDoc

### Tests
- Écrivez des tests pour chaque nouvelle fonctionnalité
- Maintenez une couverture > 90%
- Utilisez des noms de tests descriptifs

### Commits
- Utilisez des messages de commit clairs
- Format : `type: description`
- Types : `feat`, `fix`, `docs`, `test`, `refactor`, `style`

## Structure des Snippets

Lors de l'ajout d'un nouveau snippet, respectez cette structure :

```json
{
  "id": "langage-feature",
  "name": "Nom descriptif",
  "description": "Description détaillée",
  "language": "html5|css3|javascript|java|php|sql",
  "feature": "form|api|crud|animation|query|validation|layout|input",
  "previewMarkup": "HTML optionnel pour l'aperçu CSS3 (body de la démo)",
  "code": "Code avec {{placeholders}}",
  "variables": [
    {
      "name": "variableName",
      "type": "string|number|boolean",
      "required": true,
      "description": "Description",
      "defaultValue": "valeur par défaut"
    }
  ],
  "security": {
    "sqlInjection": true|false,
    "xss": true|false,
    "csrf": true|false
  },
  "tests": "Code de test optionnel"
}
```

## Tests Locaux

Avant de soumettre une PR, assurez-vous que :

```bash
npm run lint      # Pas d'erreurs ESLint
npm test          # Tous les tests passent
npm run build     # Build réussi
```

## Questions ?

N'hésitez pas à ouvrir une issue pour discuter de votre contribution !

