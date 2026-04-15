import { Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigModule } from '../../../config/app/config/config.module';
import { AppConfigService } from '../../../config/app/config/config.service';
import { HttpLoggerService } from './http-logger.service';
import { WsLoggerService } from './ws-logger.service';

@Global()
@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (appConfig: AppConfigService) => ({
        pinoHttp: {
          level: appConfig.MODE === 'DEV' ? 'debug' : 'info',
          transport: {
            targets: [
              {
                target: 'pino-pretty',
                level: 'debug',
                options: { singleLine: true, colorize: true },
              },
              {
                target: 'pino-roll',
                level: 'error',
                options: {
                  file: 'logs/error',
                  extension: '.log',
                  frequency: 'daily',
                  size: '30m',
                  mkdir: true,
                },
              },
              {
                target: 'pino-roll',
                level: 'debug',
                options: {
                  file: 'logs/debug',
                  extension: '.log',
                  frequency: 'daily',
                  size: '30m',
                  mkdir: true,
                },
              },
            ],
          },
          redact: ['req.body.password', 'req.headers.authorization'],
        },
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [HttpLoggerService, WsLoggerService],
  exports: [HttpLoggerService, WsLoggerService],
})
export class CustomLoggerModule {}
