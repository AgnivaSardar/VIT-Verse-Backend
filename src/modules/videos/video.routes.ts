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
} from './video.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

// Create uploads directory if needed
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (_req, file, cb) => {
    if (/\.(mp4|mov|avi|wmv|flv|webm)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files allowed'));
    }
  },
});

// Routes
router.post('/upload', requireAuth, upload.single('video'), uploadVideoHandler);
router.get('/:id', getVideoHandler);
router.get('/', listVideosHandler);
router.patch('/:id', requireAuth, updateVideoHandler);
router.get('/me', requireAuth, getMyVideosHandler);

export default router;
