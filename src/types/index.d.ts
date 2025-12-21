// src/types/index.d.ts
import type * as express from 'express';
import type * as multer from 'multer';

declare global {
  namespace Express {
    interface UserPayload {
      id: string | number;
      role?: string;  // optional - matches your user without role
    }

    interface Request {
      user?: UserPayload;
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined;
    }
  }
}

export {};
