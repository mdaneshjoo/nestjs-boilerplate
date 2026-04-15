import { z } from 'zod';

export const authSchema = z.object({
  EXPIRE: z.string().min(1),
  SECRET: z.string().min(1),
});

export type AuthEnv = z.infer<typeof authSchema>;
