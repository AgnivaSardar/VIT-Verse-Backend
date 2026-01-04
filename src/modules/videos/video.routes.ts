// src/modules/videos/video.routes.ts
import { Router } from 'express';
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

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      return cb(null, thumbDir);
    }
    return cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

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
