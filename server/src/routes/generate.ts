import { Router } from 'express';
import { z } from 'zod';
import { codeGenerator } from '../lib/codeGenerator.js';
import { generateRequestSchema } from '../schemas/requestSchema.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    // Validation avec Zod
    const validatedData = generateRequestSchema.parse(req.body);

    // Génération du code
    const result = await codeGenerator.generate(validatedData);

    res.json({
      code: result.code,
      filename: result.filename,
      language: validatedData.language,
      tests: result.tests,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.errors,
      });
    }

    console.error('Erreur lors de la génération:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Erreur interne du serveur',
    });
  }
});

export { router as generateRouter };

