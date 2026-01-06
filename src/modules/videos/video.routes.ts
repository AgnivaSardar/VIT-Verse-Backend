// src/modules/videos/video.routes.ts
import { Router } from 'express';
import type { Request, RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadVideoHandler,
  getVideoHandler,
  listVideosHandler,
  updateVideoHandler,
  getMyVideosHandler,
  getVideoStreamUrlHandler,
  searchVideosByTitleHandler,
  deleteVideoHandler,
} from './video.controller.js';
import { getVideoUploadProgressHandler } from './video.progress.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { cacheResponse } from '../../common/cache.js';

const router = Router();

// Create uploads directory if needed
const uploadDir = path.join(process.cwd(), 'uploads');
const thumbDir = path.join(uploadDir, 'thumbnails');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(thumbDir)) {
  fs.mkdirSync(thumbDir, { recursive: true });
}

type UploadRequest = Request & { uploadCleanupPaths?: string[] };

// Collect target file paths so we can delete them if the client aborts the upload.
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      return cb(null, thumbDir);
    }
    return cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const finalName = `${unique}${path.extname(file.originalname)}`;
    const targetPath = path.join(file.fieldname === 'thumbnail' ? thumbDir : uploadDir, finalName);
    const uploadReq = req as UploadRequest;
    if (!uploadReq.uploadCleanupPaths) uploadReq.uploadCleanupPaths = [];
    uploadReq.uploadCleanupPaths.push(targetPath);
    cb(null, finalName);
  },
});

const cleanupUploadedFiles = (req: UploadRequest) => {
  const files: any = (req as any).files || {};
  const candidates = [
    ...(files.video || []),
    ...(files.thumbnail || []),
  ];
  if ((req as any).file) {
    candidates.push((req as any).file);
  }
  const paths = [
    ...(req.uploadCleanupPaths || []),
    ...candidates
      .map((f: any) => f?.path)
      .filter((p: string | undefined): p is string => typeof p === 'string'),
  ];

  paths.forEach((p) => {
    try {
      if (p && fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    } catch (err) {
      console.warn('Failed to clean aborted upload temp file:', err);
    }
  });
};

// If the client aborts the request mid-upload, immediately delete any temp files created so far.
const registerAbortCleanup: RequestHandler = (req, res, next) => {
  const uploadReq = req as UploadRequest;
  const abortHandler = () => cleanupUploadedFiles(uploadReq);
  req.on('aborted', abortHandler);
  res.on('finish', () => {
    req.removeListener('aborted', abortHandler);
  });
  next();
};

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      if (/\.(png|jpg|jpeg|webp)$/i.test(file.originalname)) return cb(null, true);
      return cb(new Error('Only image files allowed for thumbnail'));
    }
    if (/\.(mp4|mov|avi|wmv|flv|webm)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files allowed'));
    }
  },
});

// Routes
router.post(
  '/upload',
  requireAuth,
  registerAbortCleanup,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  uploadVideoHandler
);
// Secure progress polling endpoint
router.get('/progress/:uploadId', requireAuth, getVideoUploadProgressHandler);
router.get('/me', requireAuth, getMyVideosHandler);
router.get('/search/title', cacheResponse(30, (req) => `videos:search:${req.query.q}`), searchVideosByTitleHandler);
router.get('/', cacheResponse(30, (req) => `videos:list:${JSON.stringify(req.query)}`), listVideosHandler);
router.get('/:id/stream', getVideoStreamUrlHandler);
router.get('/:id', getVideoHandler);
router.patch('/:id', requireAuth, updateVideoHandler);
router.delete('/:id', requireAuth, deleteVideoHandler);

export default router;
