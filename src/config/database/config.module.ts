import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { DataBaseConfigService } from './config.service';
import configuration from './configuration';

const dbSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_USERNAME: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  SYNC: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .transform((v) => v === true || v === 'true'),
});

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validate: (env) => dbSchema.parse(env),
    }),
  ],
  providers: [ConfigService, DataBaseConfigService],
  exports: [ConfigService, DataBaseConfigService],
})
export class DataBaseConfigModule {}
