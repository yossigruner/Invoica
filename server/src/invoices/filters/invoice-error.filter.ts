import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { InvoiceOperationError, InvoiceErrorCodes } from '../errors/invoice.errors';

@Catch(InvoiceOperationError)
export class InvoiceErrorFilter implements ExceptionFilter {
  catch(exception: InvoiceOperationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Map error codes to HTTP status codes
    switch (exception.code) {
      case InvoiceErrorCodes.CUSTOMER_NOT_FOUND:
      case InvoiceErrorCodes.INVOICE_NOT_FOUND:
        status = HttpStatus.NOT_FOUND;
        break;
      case InvoiceErrorCodes.VALIDATION_ERROR:
        status = HttpStatus.BAD_REQUEST;
        break;
      case InvoiceErrorCodes.UNAUTHORIZED:
        status = HttpStatus.UNAUTHORIZED;
        break;
      case InvoiceErrorCodes.DATABASE_ERROR:
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        break;
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      code: exception.code,
      details: exception.details,
      timestamp: new Date().toISOString(),
    });
  }
} 