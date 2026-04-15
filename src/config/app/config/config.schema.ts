import { z } from 'zod';

export const appSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  MODE: z.enum(['DEV', 'PROD']),
  APP_NAME: z.string().min(1),
  CLIENT_URL: z.string().url(),
});

export type AppEnv = z.infer<typeof appSchema>;
