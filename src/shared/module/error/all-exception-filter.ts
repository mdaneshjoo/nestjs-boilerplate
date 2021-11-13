import { EyeService } from '@emdjoo/eye';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request } from 'express';
import { AppConfigService } from '../../../config/app/config/config.service';
import { HttpLoggerService } from '../logger/http-logger.service';

@Catch()
export class AllExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  constructor(
    private loggerService: HttpLoggerService,
    private appConfigService: AppConfigService,
    private eye: EyeService,
  ) {
    super();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public catch(exception: any, host: ArgumentsHost): void {
    this.eye.watchErrors(exception, host);
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>(),
      response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.loggerService.path = request.url;
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.loggerService.error('Internal', exception.message);
      return response.status(status).json({
        statusCode: status,
        message:
          this.appConfigService.MODE === 'DEV'
            ? exception.message
            : 'Something went wrong please try again or report this message to us ',
      });
    }
    const exceptionData = exception.getResponse();
    if (request?.body['password']) delete request?.body['password'];
    this.loggerService.error('HttpException', exceptionData.message, {
      body: request?.body,
      user: request.user?.id,
    });

    response.status(status).json({
      errorCode: exceptionData.error
        ? exceptionData.error
        : exceptionData.message,
      errorMessage: exceptionData.message,
    });
  }
}
