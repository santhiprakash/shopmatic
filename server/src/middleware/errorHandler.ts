import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }
  
  // PostgreSQL unique violation
  if ((err as any).code === '23505') {
    return res.status(409).json({
      error: 'A record with this value already exists',
    });
  }
  
  // PostgreSQL foreign key violation
  if ((err as any).code === '23503') {
    return res.status(400).json({
      error: 'Referenced record does not exist',
    });
  }
  
  // Default error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
}
