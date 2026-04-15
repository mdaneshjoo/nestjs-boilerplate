import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from '../validate-env';
import { DataBaseConfigService } from './config.service';
import { dbSchema } from './config.schema';
import configuration from './configuration';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validate: validateEnv(dbSchema),
    }),
  ],
  providers: [ConfigService, DataBaseConfigService],
  exports: [ConfigService, DataBaseConfigService],
})
export class DataBaseConfigModule {}
