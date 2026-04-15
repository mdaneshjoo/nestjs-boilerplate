import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from '../validate-env';
import { mailSchema } from './config.schema';
import configuration from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validate: validateEnv(mailSchema),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class MailmanConfigModule {}
