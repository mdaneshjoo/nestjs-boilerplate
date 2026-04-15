import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { AuthConfigService } from './config.service';
import configuration from './configuration';

const authSchema = z.object({
  EXPIRE: z.string().min(1),
  SECRET: z.string().min(1),
});

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validate: (env) => authSchema.parse(env),
    }),
  ],
  providers: [ConfigService, AuthConfigService],
  exports: [ConfigService, AuthConfigService],
})
export class AuthConfigModule {}
