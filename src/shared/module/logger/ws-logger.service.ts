import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable({ scope: Scope.TRANSIENT })
export class WsLoggerService {
  private _context: string;

  constructor(private readonly logger: PinoLogger) {}

  setContext(context: string) {
    this._context = context;
    this.logger.setContext(context);
  }

  debug(message: string, meta?: unknown, userId?: string) {
    this.logger.debug({ meta, context: this._context, userId }, message);
  }

  error(message: string, meta?: unknown, userId?: string) {
    if (meta) {
      this.logger.error({ meta, context: this._context, userId }, message);
    }
  }
}
