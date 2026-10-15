<p align="center"><img src="docs/assets/project-hero.svg" alt="Code Snippet Generator: génération de code, éditeur Monaco et templates multilangages" width="100%"></p>

<h1 align="center">Code Snippet Generator</h1>

<p align="center"><strong>Un générateur de modèles de code pour HTML, CSS, JavaScript, Java, PHP et SQL, avec éditeur Monaco et API Node.js.</strong></p>

<p align="center"><a href="README.md">Read in English</a> · <a href="#overview">Présentation</a> · <a href="#features">Fonctionnalités</a> · <a href="#architecture">Architecture</a> · <a href="#start">Démarrage</a> · <a href="#quality">Qualité</a> · <a href="#faq">FAQ</a> · <a href="#license">Licence</a></p>

<p align="center"><a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-475569"></a> <img alt="Technology" src="https://img.shields.io/badge/stack-React%20%2F%20Node.js-475569"></p>

<a id="overview"></a>
## Présentation du projet

Code Snippet Generator permet de configurer, inspecter et exporter des modèles de code fréquemment utilisés. Il combine une interface React et un backend TypeScript/Express pour la sélection des modèles, la validation des options et la génération. Le système décrit ici est **fondé sur des templates**, et non sur une génération de code par IA annoncée sans preuve.

**Pour qui ?** Développeurs, apprenants et Product Builders cherchant à accélérer la création de structures de code répétitives.

**Cas d'usage :** choisir un langage et un modèle, configurer ses options, examiner le résultat dans Monaco puis copier ou exporter le code comme point de départ.

<a id="features"></a>
## Fonctionnalités principales

| Fonction | Bénéfice |
| --- | --- |

| **Six langages** | Catégories de modèles HTML5, CSS3, JavaScript, Java, PHP et SQL. |
| **Templates configurables** | Paramètres et groupes d'options transmis au service de génération. |
| **Éditeur Monaco** | Espace de lecture et d'édition de code basé sur Monaco Editor. |
| **Frontend et API séparés** | Client React, routes Express et logique de génération côté serveur. |
| **Validation** | Zod et utilitaires de contrôle des modèles dans le pipeline. |
| **Qualité documentaire** | Guides techniques, tests et plusieurs workflows GitHub Actions. |

<a id="architecture"></a>
## Architecture et choix techniques

Le dépôt est organisé en npm workspaces : frontend/ contient le client React/TypeScript ; server/ regroupe les endpoints Express, les données de templates et le moteur de génération. Le frontend communique avec cette API : la compilation statique seule ne reproduit pas nécessairement tout le fonctionnement.

**Technologies :** React, TypeScript, Vite, Zustand, Monaco Editor, Node.js, Express et Zod. Les tests frontend utilisent Vitest et ceux du backend utilisent Jest. Le code généré doit être relu, testé et adapté avant toute utilisation en production.

<a id="start"></a>
## Installation et utilisation

**Prérequis :** Node.js 20 ou supérieur et npm 10 ou supérieur, conformément aux exigences déclarées. Démarrer les deux workspaces pour utiliser le service complet.

```bash
git clone https://github.com/hrmonic/code-snippet-generator.git
cd code-snippet-generator
npm ci
npm run dev
```

Commandes complémentaires : npm run build, npm run test, npm run lint et npm run type-check. Il est également possible de démarrer séparément les workspaces frontend et server.

<a id="quality"></a>
## Qualité, sécurité et limites

Le dépôt comporte des tests frontend/backend, des contrôles de templates, du lint, des contrôles TypeScript et des workflows CI. Cela ne signifie pas que chaque snippet généré est automatiquement sécurisé ou utilisable en production.

### Limites connues et précautions

- Le workflow GitHub Pages publie uniquement le frontend ; l'API Express doit être accessible séparément pour la génération.
- Le système documenté utilise des templates, et non un modèle d'IA obligatoire.
- Le code généré nécessite des vérifications de sécurité, d'intégration et de compatibilité.
- Les anciennes mentions de version du README n'étaient pas alignées sur le package principal ; cette présentation évite ces affirmations. 

### Pistes d'amélioration

- Déployer une démonstration réellement fonctionnelle avec son API.
- Ajouter des captures et des exemples d'exports vérifiables.
- Documenter la compatibilité et les tests propres à chaque famille de templates.

### Documentation complémentaire

- [Installation](docs/setup.md)
- [Architecture](docs/architecture.md)
- [API](docs/api.md)
- [Moteur de templates](docs/template-engine.md)
- [Contribuer](CONTRIBUTING.md)

<a id="faq"></a>
## Questions fréquentes

### Cet outil utilise-t-il un modèle IA pour générer le code ?

Non, le parcours décrit est basé sur des modèles structurés et des options configurables.

### Quels langages sont disponibles ?

Les catégories documentées sont HTML5, CSS3, JavaScript, Java, PHP et SQL.

### La version GitHub Pages fonctionne-t-elle seule ?

La génération complète nécessite également l'API Express.

### Le code généré est-il prêt pour la production ?

Pas automatiquement. Chaque résultat doit être relu, testé et adapté.

<a id="license"></a>
## Licence et auteur

Projet distribué sous **[licence MIT](LICENSE)**. Les modalités de contribution sont documentées dans [CONTRIBUTING.md](CONTRIBUTING.md).

**Auteur et maintenance :** [Réda Touzani (@hrmonic)](https://github.com/hrmonic).

---

*Accélérer les tâches de développement répétitives tout en conservant un code compréhensible et modifiable.*
