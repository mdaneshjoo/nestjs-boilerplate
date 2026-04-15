import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AppConfigService } from '../../../config/app/config/config.service';

/**
 * Global exception filter. Every unhandled error lands here.
 *
 * How it works:
 *   - For `HttpException` subclasses: returns the Nest-shaped error body and
 *     logs it via pino with the request path in the log record.
 *   - For anything else: treats as 500, logs `exception.message`, and hides
 *     raw details in PROD (returns a generic message).
 *   - Sensitive fields on the request body are redacted twice: once by pino
 *     redact paths before serialisation, and once here as a belt-and-braces
 *     deletion of `req.body.password` in case the redact list drifts.
 */
@Catch()
export class AllExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  constructor(
    @InjectPinoLogger(AllExceptionFilter.name)
    private readonly logger: PinoLogger,
    private readonly appConfigService: AppConfigService,
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        { path: request.url, err: exception },
        exception?.message ?? 'Internal error',
      );
      return response.status(status).json({
        statusCode: status,
        message:
          this.appConfigService.MODE === 'DEV'
            ? exception.message
            : 'Something went wrong. Please try again or report this message to us.',
      });
    }

    const exceptionData = exception.getResponse();
    if (request?.body?.['password']) delete request.body['password'];
    const user = request['user'] as { id?: number } | undefined;
    this.logger.warn(
      {
        path: request.url,
        body: request?.body,
        user: user?.id,
      },
      exceptionData?.message ?? 'HttpException',
    );

    response.status(status).json({
      errorCode: exceptionData.error
        ? exceptionData.error
        : exceptionData.message,
      errorMessage: exceptionData.message,
    });
  }
}
