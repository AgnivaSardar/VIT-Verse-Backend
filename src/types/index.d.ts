// src/types/index.d.ts
import type * as express from 'express';
import type * as multer from 'multer';
// import type { File as MulterFile } from 'multer';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role?: string;
    }

    interface Request {
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined;
    }
  }
}

export {};
