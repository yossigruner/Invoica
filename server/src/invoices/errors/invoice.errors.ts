export enum InvoiceErrorCodes {
  CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',
  INVOICE_NOT_FOUND = 'INVOICE_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export class InvoiceOperationError extends Error {
  constructor(
    message: string,
    public code: InvoiceErrorCodes,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'InvoiceOperationError';
  }
} 