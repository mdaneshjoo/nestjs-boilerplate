import {
  ConsoleLogger,
  Inject,
  Injectable,
  LoggerService,
  Scope,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';
// Types
type ErrorType = 'Internal' | 'HttpException';
@Injectable()
export class HttpLoggerService extends ConsoleLogger implements LoggerService {
  private _path: string;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly winstonLogger: WinstonLogger,
  ) {
    super();
  }

  debug(message: string, meta?: any, context?: string) {
    this.winstonLogger.debug(message, {
      meta,
      context: this._path,
    });
  }

  /**
   * @description log errors
   *
   * */
  error(errorType: ErrorType, message: string, meta?: any) {
    if (message) {
      this.winstonLogger.error(message, {
        meta: { type: errorType, path: this._path, MetaData: meta },
      });
    }
  }

  set path(path: string) {
    this._path = path;
  }
}
