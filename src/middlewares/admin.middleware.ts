// src/middlewares/admin.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../common/errors';

export async function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await prisma.users.findUnique({
      where: { userID: BigInt(req.user.id) },
      select: { isSuperAdmin: true, isActive: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.isActive) {
      throw new AppError('User account is deactivated', 403);
    }

    if (!user.isSuperAdmin) {
      throw new AppError('Access denied. Super admin privileges required.', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAdminOrSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await prisma.users.findUnique({
      where: { userID: BigInt(req.user.id) },
      select: { role: true, isSuperAdmin: true, isActive: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.isActive) {
      throw new AppError('User account is deactivated', 403);
    }

    if (!(user.isSuperAdmin || user.role === 'admin')) {
      throw new AppError('Access denied. Admin privileges required.', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
}
