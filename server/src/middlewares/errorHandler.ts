import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,

  next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Внутренняя ошибка сервера. Попробуйте позже.';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (err.message && err.message.includes('PrismaClientKnownRequestError')) {
    if (err.message.includes('P2002')) {
      statusCode = 400;
      message = 'Такая запись уже существует в базе данных (дублирование уникального поля).';
    }
    if (err.message.includes('P2003')) {
      statusCode = 400;
      message = 'Ошибка целостности данных: связанная запись в родительской таблице не найдена.';
    }
  }

  console.error(`[ERROR] [${req.method} ${req.url}]:`, err);

  res.status(statusCode).json({
    status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
    error: message,

    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
