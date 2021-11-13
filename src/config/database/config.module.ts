import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { DataBaseConfigService } from './config.service';
import configuration from './configuration';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        SYNC: Joi.boolean().required(),
      }),
    }),
  ],
  providers: [ConfigService, DataBaseConfigService],
  exports: [ConfigService, DataBaseConfigService],
})
export class DataBaseConfigModule {}
