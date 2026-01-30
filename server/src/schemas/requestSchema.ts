import { z } from 'zod';
import { FEATURES } from '../constants/features.js';

const LANGUAGES = ['html5', 'css3', 'javascript', 'java', 'php', 'sql'] as const;

export const generateRequestSchema = z.object({
  language: z.enum(LANGUAGES),
  feature: z.enum(FEATURES),
  options: z.record(z.unknown()),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;
