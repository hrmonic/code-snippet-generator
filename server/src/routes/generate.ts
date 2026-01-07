import { Router } from 'express';
import { z } from 'zod';
import { codeGenerator } from '../lib/codeGenerator.js';
import { generateRequestSchema } from '../schemas/requestSchema.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    // Validation avec Zod
    const validatedData = generateRequestSchema.parse(req.body);
    const isPreview = req.body.preview === true;

    // Génération du code
    const result = await codeGenerator.generate(validatedData);

    // Gérer les résultats multiples (tableaux) ou un seul résultat
    const isMultiple = Array.isArray(result);
    const results = isMultiple ? result : [result];

    // En mode preview, on peut retourner plus rapidement sans validation complète
    if (isPreview) {
      // Pour la prévisualisation, on peut retourner le code même si certaines validations échouent
      if (isMultiple) {
        // Retourner le premier fichier pour la prévisualisation
        res.json({
          code: results[0]?.code || '',
          filename: results[0]?.filename,
          language: validatedData.language,
          preview: true,
          isMultiple: true,
          fileCount: results.length,
        });
      } else {
        res.json({
          code: result.code,
          filename: result.filename,
          language: validatedData.language,
          preview: true,
        });
      }
    } else {
      // Mode normal avec tous les détails
      if (isMultiple) {
        // Retourner tous les fichiers
        res.json({
          files: results.map((r) => ({
            code: r.code,
            filename: r.filename,
            tests: r.tests,
          })),
          language: validatedData.language,
          isMultiple: true,
        });
      } else {
        res.json({
          code: result.code,
          filename: result.filename,
          language: validatedData.language,
          tests: result.tests,
        });
      }
    }
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

