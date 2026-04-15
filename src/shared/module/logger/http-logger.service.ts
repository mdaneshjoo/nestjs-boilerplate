import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

type ErrorType = 'Internal' | 'HttpException';

@Injectable({ scope: Scope.TRANSIENT })
export class HttpLoggerService {
  private _path: string;

  constructor(private readonly logger: PinoLogger) {}

  debug(message: string, meta?: unknown) {
    this.logger.debug({ meta, context: this._path }, message);
  }

  error(errorType: ErrorType, message: string, meta?: unknown) {
    if (!message) return;
    this.logger.error(
      { type: errorType, path: this._path, MetaData: meta },
      message,
    );
  }

  set path(path: string) {
    this._path = path;
  }
}
