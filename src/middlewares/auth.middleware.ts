// src/middlewares/auth.middleware.ts
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthError } from '../common/errors';

export interface AuthUser {
  id: string | number;  // can be string or number from JWT
  role?: string;        // optional to match UserPayload.role
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  let token: string | undefined;

  // Check header
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    token = header.slice('Bearer '.length);
  }

  // Check cookie if no header token
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new AuthError('Missing token');
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthUser;
    req.user = payload;
    next();
  } catch {
    throw new AuthError('Invalid token');
  }
}

export const authMiddleware = requireAuth;
