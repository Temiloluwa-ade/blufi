import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { config } from './config';

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const isProduction = config.environment === 'production';
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    this.logger.error(exception);

    response.status(status).json({
      statusCode: status,
      message: exception.message || 'Internal Server Error',
      error: exception.name,
      ...(isProduction
        ? {}
        : {
            stack: exception.stack,
          }),
    });
  }
}
