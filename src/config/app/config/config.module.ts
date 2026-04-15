import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { AppConfigService } from './config.service';
import configuration from './configuration';

const appSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  MODE: z.enum(['DEV', 'PROD']),
  APP_NAME: z.string().min(1),
  CLIENT_URL: z.string().url(),
});

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validate: (env) => appSchema.parse(env),
    }),
  ],
  providers: [ConfigService, AppConfigService],
  exports: [ConfigService, AppConfigService],
})
export class AppConfigModule {}
