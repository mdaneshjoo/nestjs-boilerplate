import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';
import { HttpLoggerService } from './http-logger.service';
import { WsLoggerService } from './ws-logger.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.printf((info) => {
          return `${info.timestamp} level="${info.level}" message="${
            info.message
          }" ${info.context ? `context="${info.context}"` : ''} ${
            info.meta ? `meta=${JSON.stringify(info.meta)}` : ''
          } ${info.userId ? `userid="${info.userId}"` : ''}`;
        }),
      ),
      transports: [
        new transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          level: 'error',
          handleExceptions: true,
          json: true,
          zippedArchive: true,
          maxSize: '30m',
          maxFiles: '30d',
        }),
        new transports.DailyRotateFile({
          filename: 'logs/debug-%DATE%.log',
          level: 'debug',
          handleExceptions: true,
          json: false,
          zippedArchive: true,
          maxSize: '30m',
          maxFiles: '30d',
        }),
      ],
    }),
  ],
  providers: [HttpLoggerService, WsLoggerService],
  exports: [HttpLoggerService, WsLoggerService],
})
export class CustomLoggerModule {}
