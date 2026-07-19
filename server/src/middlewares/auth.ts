import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_coffee_key';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Доступ запрещен. Токен отсутствует' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    if (!token) {
      res.status(401).json({ error: 'Неверный формат токена' });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Невалидный или просроченный токен' });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      error: 'Доступ запрещен. Требуются права администратора',
    });
    return;
  }
  next();
};

export const optionalToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        role: string;
      };
      req.user = decoded;
    }
  } catch (e) {}
  next();
};
