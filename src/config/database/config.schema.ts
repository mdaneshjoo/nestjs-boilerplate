import { z } from 'zod';

export const dbSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_USERNAME: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  SYNC: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .transform((v) => v === true || v === 'true'),
});

export type DbEnv = z.infer<typeof dbSchema>;
