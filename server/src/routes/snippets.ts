import { Router } from 'express';
import { snippetLoader } from '../lib/snippetLoader.js';

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

export { router as snippetsRouter };

