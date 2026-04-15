import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { z } from 'zod';
import configuration from './configuration';

const mailSchema = z.object({
  MAIL_HOST: z.string().min(1),
  MAIL_PORT: z.coerce.number().int().positive(),
  MAIL_USERNAME: z.string().min(1),
  MAIL_PASSWORD: z.string().min(1),
  MAIL_FROM: z.string().min(1),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validate: (env) => mailSchema.parse(env),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class MailmanConfigModule {}
