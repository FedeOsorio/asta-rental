import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  details?: unknown;
  stack?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV !== 'production';

  // Log completo en consola del servidor
  console.error(`[ERROR] ${req.method} ${req.path}`, {
    message: err.message,
    code: err.code,
    stack: err.stack
  });

  // Zod validation errors → 400
  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      status: 400,
      error: 'VALIDATION_ERROR',
      message: 'Los datos enviados no son válidos.',
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }))
    };
    res.status(400).json(response);
    return;
  }

  // PostgreSQL syntax/query errors (code 42xxx) → 500
  if (err.code && err.code.startsWith('42')) {
    const response: ErrorResponse = {
      status: 500,
      error: 'DATABASE_ERROR',
      message: 'Error interno en la consulta a la base de datos.',
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    };
    if (isDev) {
      response.details = { pgCode: err.code, pgMessage: err.message };
      response.stack = err.stack;
    }
    res.status(500).json(response);
    return;
  }

  // PostgreSQL connection/constraint errors (code 23xxx, 08xxx) → 500
  if (err.code && /^(23|08|53)/.test(err.code)) {
    const response: ErrorResponse = {
      status: 500,
      error: 'DATABASE_ERROR',
      message: 'Error de conexión o restricción en la base de datos.',
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    };
    if (isDev) {
      response.details = { pgCode: err.code, pgMessage: err.message };
      response.stack = err.stack;
    }
    res.status(500).json(response);
    return;
  }

  // Errores de aplicación con statusCode explícito
  const statusCode = err.statusCode || 500;
  const response: ErrorResponse = {
    status: statusCode,
    error: statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'APPLICATION_ERROR',
    message: statusCode >= 500 && !isDev
      ? 'Ocurrió un error inesperado. Intente nuevamente.'
      : err.message || 'Internal Server Error',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  };

  if (isDev && statusCode >= 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
