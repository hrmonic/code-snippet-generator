import { z } from 'zod';

export const generateRequestSchema = z.object({
  language: z.enum(['html5', 'css3', 'javascript', 'java', 'php', 'sql']),
  feature: z.enum(['form', 'api', 'crud', 'animation', 'query', 'validation', 'layout', 'input']),
  options: z.record(z.unknown()),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

