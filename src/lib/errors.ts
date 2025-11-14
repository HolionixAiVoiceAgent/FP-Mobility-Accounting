/**
 * Centralized Error Handling
 * Provides standardized error classes and utilities for consistent error handling across the application
 */

// ============================================================================
// Error Classes
// ============================================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(message, 400, true, context);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class PermissionError extends AppError {
  constructor(
    message: string = 'Insufficient permissions',
    context?: Record<string, any>
  ) {
    super(message, 403, true, context);
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(
    resource: string,
    context?: Record<string, any>
  ) {
    super(`${resource} not found`, 404, true, context);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(message, 409, true, context);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(message, 500, false, context);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string,
    context?: Record<string, any>
  ) {
    super(`${service} error: ${message}`, 502, false, {
      service,
      ...context,
    });
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    // Supabase error format
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    // Generic object with error info
    return JSON.stringify(error);
  }

  return 'An unknown error occurred';
}

/**
 * Extract error status code
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as any).code;
    if (typeof code === 'number') {
      return code;
    }
  }

  return 500;
}

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context?: {
    operation?: string;
    userId?: string;
    resource?: string;
    [key: string]: any;
  }
): void {
  const message = getErrorMessage(error);
  const statusCode = getErrorStatusCode(error);
  const timestamp = new Date().toISOString();

  const errorLog = {
    timestamp,
    message,
    statusCode,
    context,
    error:
      error instanceof Error
        ? {
            name: error.name,
            stack: error.stack,
          }
        : error,
  };

  if (statusCode >= 500) {
    console.error('[ERROR - Server Error]', errorLog);
  } else if (statusCode >= 400) {
    console.warn('[WARN - Client Error]', errorLog);
  } else {
    console.log('[INFO]', errorLog);
  }

  // In production, send to error tracking service
  // if (import.meta.env.PROD) {
  //   sendToErrorTracker(errorLog);
  // }
}

/**
 * Handle async operation with error handling
 */
export async function handleAsync<T>(
  operation: () => Promise<T>,
  context?: {
    operation?: string;
    userId?: string;
    resource?: string;
    [key: string]: any;
  }
): Promise<[T | null, AppError | null]> {
  try {
    const result = await operation();
    return [result, null];
  } catch (error) {
    const appError =
      error instanceof AppError
        ? error
        : new AppError(getErrorMessage(error), 500, true, context);

    logError(appError, context);
    return [null, appError];
  }
}

/**
 * Check if error is operational (safe to return to client)
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Safe error handler for React components
 */
export function createErrorHandler(
  onError?: (message: string, error?: AppError) => void
) {
  return (error: unknown) => {
    const message = getErrorMessage(error);
    const appError =
      error instanceof AppError
        ? error
        : new AppError(message, 500, true);

    logError(appError);
    onError?.(message, appError);
  };
}
