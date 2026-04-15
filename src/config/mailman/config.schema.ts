import { z } from 'zod';

export const mailSchema = z.object({
  MAIL_HOST: z.string().min(1),
  MAIL_PORT: z.coerce.number().int().positive(),
  MAIL_USERNAME: z.string().min(1),
  MAIL_PASSWORD: z.string().min(1),
  MAIL_FROM: z.string().min(1),
});

export type MailEnv = z.infer<typeof mailSchema>;
