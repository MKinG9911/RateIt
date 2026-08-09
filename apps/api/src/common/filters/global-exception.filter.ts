import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

/**
 * Global exception filter that prevents leaking Prisma errors or stack traces.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        const body = responseBody as Record<string, unknown>;
        message = (body.message as string) || (body.error as string) || message;
        details = body.details;
      }
    } else if (exception instanceof Error) {
      // Check for Prisma unique constraint violations
      if (exception.constructor.name === 'PrismaClientKnownRequestError') {
        const prismaError = exception as Error & { code: string };
        if (prismaError.code === 'P2002') {
          status = HttpStatus.CONFLICT;
          message = 'A record with this information already exists';
        } else if (prismaError.code === 'P2025') {
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
        }
      }

      // Log the full error server-side
      console.error('Unhandled exception:', exception);
    }

    response.status(status).json({
      success: false,
      error: message,
      ...(details ? { details } : {}),
      statusCode: status,
    });
  }
}
