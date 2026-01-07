import { Router } from 'express';
import { snippetLoader } from '../lib/snippetLoader.js';
import { optionTransformer } from '../lib/optionTransformer.js';
import type { Language, FeatureType } from '../types/index.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const snippets = await snippetLoader.getAllSnippets();
    res.json(snippets);
  } catch (error) {
    console.error('Erreur lors de la récupération des snippets:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Erreur interne du serveur',
    });
  }
});

router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const snippets = await snippetLoader.getSnippetsByLanguage(language);
    res.json(snippets);
  } catch (error) {
    console.error('Erreur lors de la récupération des snippets:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Erreur interne du serveur',
    });
  }
});

router.get('/:language/:feature/options', async (req, res) => {
  try {
    const { language, feature } = req.params;

    // Valider que language et feature sont valides
    const validLanguages: Language[] = ['html5', 'css3', 'javascript', 'java', 'php', 'sql'];
    if (!validLanguages.includes(language as Language)) {
      return res.status(400).json({
        message: `Langage invalide: ${language}`,
      });
    }

    const options = await optionTransformer.transformSnippetVariables(
      language as Language,
      feature as FeatureType
    );

    res.json(options);
  } catch (error) {
    console.error('Erreur lors de la récupération des options:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Erreur interne du serveur',
    });
  }
});

export { router as snippetsRouter };

